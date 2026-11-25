import type { DMConversation, DMSafetyInfo, DirectMessage, P2PEvent, PeerId } from '@/types/p2p';
import {
  computeSafetyNumber,
  decrypt,
  encrypt,
  formatShortKeyFingerprint,
  generateId,
  importPublicKey,
  deriveSharedKey,
  type KeyPair,
} from '../crypto';
import { logger } from '../logger';
import * as Storage from '../storage';
import type { YjsManager } from '../yjs-manager';
import type { P2PTransport } from './transport';

export interface DMDeps {
  getLocalPeer: () => PeerId;
  getKeyPair: () => KeyPair | null;
  isHost: () => boolean;
  getHostId: () => string | null;
  transport: P2PTransport;
  yjs: YjsManager;
  scheduleSave: (type: string) => void;
  emitEvent: (event: P2PEvent) => void;
  findPeerById: (peerId: string) => PeerId | null;
}

export class DMManager {
  dmConversations: Map<string, DMConversation> = new Map();
  pendingDMMessages: Map<string, DirectMessage[]> = new Map();
  sharedKeys: Map<string, CryptoKey> = new Map();
  private deps: DMDeps;

  constructor(deps: DMDeps) {
    this.deps = deps;
  }

  async getOrDeriveSharedKey(remotePeerId: string, remotePublicKeyString: string): Promise<CryptoKey | null> {
    if (this.sharedKeys.has(remotePeerId)) {
      return this.sharedKeys.get(remotePeerId)!;
    }
    const keyPair = this.deps.getKeyPair();
    if (!keyPair) return null;
    try {
      const remotePublicKey = await importPublicKey(remotePublicKeyString);
      const sharedKey = await deriveSharedKey(keyPair.privateKey, remotePublicKey);
      this.sharedKeys.set(remotePeerId, sharedKey);
      return sharedKey;
    } catch {
      return null;
    }
  }

  observePeerIdentity(peer: PeerId): void {
    const localPeer = this.deps.getLocalPeer();
    if (!peer?.id || peer.id === localPeer.id) return;

    const conv = this.dmConversations.get(peer.id);
    if (!conv) return;

    let changed = false;
    if (peer.username && peer.username !== 'Unknown' && !peer.username.startsWith('peer-')) {
      if (conv.peerId.username !== peer.username) {
        conv.peerId.username = peer.username;
        changed = true;
      }
    }

    if (peer.publicKey) {
      const existingKey = conv.peerId.publicKey;
      if (existingKey && existingKey !== peer.publicKey) {
        // Peer's public key changed since previously observed/verified!
        this.sharedKeys.delete(peer.id);
        conv.previousPublicKey = conv.verifiedPublicKey || existingKey;
        conv.peerId.publicKey = peer.publicKey;
        conv.keyChanged = true;
        changed = true;
        this.deps.emitEvent({
          type: 'dm-verified',
          payload: { peerId: peer.id, verified: false, keyChanged: true },
          timestamp: Date.now(),
        });
      } else if (!existingKey) {
        conv.peerId.publicKey = peer.publicKey;
        changed = true;
      }
    }

    if (changed) {
      this.dmConversations.set(peer.id, conv);
      this.deps.scheduleSave('dms');
    }
  }

  getOrCreateDMConversation(peer: PeerId): DMConversation {
    let conv = this.dmConversations.get(peer.id);
    if (!conv) {
      conv = {
        peerId: { ...peer },
        messages: [],
        unreadCount: 0,
        isTyping: false,
        connectionType: this.deps.transport.connections.has(peer.id) ? 'relay' : 'disconnected',
        lastSeen: Date.now(),
      };
      this.dmConversations.set(peer.id, conv);
    } else {
      this.observePeerIdentity(peer);
    }
    return conv;
  }

  async initiateDMConnection(peerId: string): Promise<void> {
    if (this.deps.transport.connections.has(peerId)) {
      this.setDMConnectionType(peerId, 'direct');
      return;
    }

    const peer = this.deps.transport.peer;
    if (peer) {
      try {
        const conn = peer.connect(peerId, {
          reliable: true,
          metadata: { type: 'dm', peerInfo: this.deps.getLocalPeer() },
        });

        conn.on('open', () => {
          logger.log('[P2P DM] Direct connection to:', peerId);
          const resolvedPeer = this.deps.findPeerById(peerId) || { id: peerId, username: 'Unknown' };
          this.deps.transport.connections.set(peerId, {
            peerId: resolvedPeer,
            conn,
            status: 'online',
            lastSeen: Date.now(),
          });
          this.deps.transport.setupConnectionHandlers(conn, peerId);
          this.setDMConnectionType(peerId, 'direct');
          this.flushPendingDMs(peerId);
        });

        conn.on('error', () => {
          logger.log('[P2P DM] Direct connection failed, using relay');
          this.setDMConnectionType(peerId, 'relay');
        });
      } catch {
        this.setDMConnectionType(peerId, 'relay');
      }
    }
  }

  private setDMConnectionType(peerId: string, type: 'direct' | 'relay' | 'disconnected'): void {
    const conv = this.dmConversations.get(peerId);
    if (conv) {
      conv.connectionType = type;
      this.dmConversations.set(peerId, conv);
      this.deps.emitEvent({ type: 'dm-message', payload: { peerId, connectionType: type }, timestamp: Date.now() });
    }
  }

  async sendDM(toPeerId: string, content: string): Promise<DirectMessage> {
    const localPeer = this.deps.getLocalPeer();
    const toPeer =
      this.deps.findPeerById(toPeerId) ||
      this.dmConversations.get(toPeerId)?.peerId ||
      ({ id: toPeerId, username: `peer-${toPeerId.slice(0, 6)}` } as PeerId);

    const localDm: DirectMessage = {
      id: generateId(),
      type: 'DM',
      from: localPeer,
      to: toPeer,
      content,
      timestamp: Date.now(),
      encrypted: false,
    };

    let wireDm: DirectMessage = { ...localDm };
    const toPeerPublicKey = toPeer.publicKey;
    if (toPeerPublicKey && this.deps.getKeyPair()) {
      const sharedKey = await this.getOrDeriveSharedKey(toPeerId, toPeerPublicKey);
      if (sharedKey) {
        wireDm = {
          ...localDm,
          content: await encrypt(localDm.content, sharedKey),
          encrypted: true,
        };
      }
    }

    const conv = this.getOrCreateDMConversation(toPeer);
    conv.messages.push(localDm);
    conv.lastMessage = localDm;
    this.dmConversations.set(toPeerId, conv);

    void this.deps.yjs.getOrCreateDMDoc(toPeerId).then((doc) => {
      if (doc) this.deps.yjs.addDMMessage(doc, wireDm);
    });

    this.deps.scheduleSave('dms');

    const entry = this.deps.transport.connections.get(toPeerId);
    const hostConn = this.deps.transport.hostConn;
    if (entry?.conn?.open) {
      this.deps.transport.sendToConnection(entry.conn, { type: 'dm-message', payload: wireDm, timestamp: Date.now() });
    } else if (hostConn?.open) {
      this.deps.transport.sendToConnection(hostConn, {
        type: 'dm-message',
        payload: { ...wireDm, _relayTo: toPeerId },
        timestamp: Date.now(),
      });
    }

    this.deps.emitEvent({ type: 'dm-message', payload: { dm: localDm, incoming: false }, timestamp: Date.now() });

    const canDeliverDirect = entry?.conn?.open;
    const canDeliverRelay = hostConn?.open;
    if (!canDeliverDirect && !canDeliverRelay) {
      this.queuePendingDM(toPeerId, wireDm);
    }

    return localDm;
  }

  queuePendingDM(peerId: string, dm: DirectMessage): void {
    const queue = this.pendingDMMessages.get(peerId) || [];
    queue.push(dm);
    this.pendingDMMessages.set(peerId, queue);
    logger.log('[P2P DM] Queued message for offline delivery to:', peerId.slice(0, 8));
  }

  flushPendingDMs(peerId: string): void {
    const queue = this.pendingDMMessages.get(peerId);
    if (!queue || queue.length === 0) return;
    logger.log('[P2P DM] Flushing', queue.length, 'pending messages to:', peerId.slice(0, 8));
    const entry = this.deps.transport.connections.get(peerId);
    if (entry?.conn?.open) {
      for (const dm of queue) {
        this.deps.transport.sendToConnection(entry.conn, { type: 'dm-message', payload: dm, timestamp: Date.now() });
      }
      this.pendingDMMessages.delete(peerId);
      this.deps.emitEvent({
        type: 'error',
        payload: { message: `Delivered ${queue.length} pending message(s) to peer.`, level: 'info' },
        timestamp: Date.now(),
      });
    }
  }

  getPendingDMCount(peerId?: string): number {
    if (peerId) return this.pendingDMMessages.get(peerId)?.length || 0;
    let count = 0;
    for (const q of this.pendingDMMessages.values()) count += q.length;
    return count;
  }

  async handleDMMessage(dm: DirectMessage, fromPeerId: string): Promise<void> {
    const localPeer = this.deps.getLocalPeer();
    if (!dm || !dm.id || !dm.from?.id || typeof dm.content !== 'string') {
      return;
    }

    // Host relay logic — verify sender matches connection peerId before forwarding
    if (this.deps.isHost() && dm._relayTo && dm._relayTo !== localPeer.id) {
      if (dm.from.id !== fromPeerId) {
        logger.warn('[P2P DM] Rejected spoofed relay from', fromPeerId, 'claiming', dm.from.id);
        return;
      }
      const target = this.deps.transport.connections.get(dm._relayTo);
      if (target?.conn?.open) {
        const { _relayTo, ...cleanDm } = dm;
        void _relayTo;
        this.deps.transport.sendToConnection(target.conn, { type: 'dm-message', payload: cleanDm, timestamp: Date.now() });
      }
      return;
    }

    if (dm.from.id === localPeer.id) return;
    if (dm.from.id !== fromPeerId && fromPeerId !== this.deps.getHostId()) {
      logger.warn('[P2P DM] Rejected spoofed DM from', fromPeerId, 'claiming', dm.from.id);
      return;
    }

    // Observe peer key (detects unexpected identity key rotation while allowing decrypt of incoming payload)
    this.observePeerIdentity(dm.from);

    const knownPeer = this.deps.findPeerById(dm.from.id);
    const conv = this.getOrCreateDMConversation(knownPeer || dm.from);
    const senderPublicKey = conv.peerId.publicKey || knownPeer?.publicKey || dm.from.publicKey;
    if (dm.encrypted && senderPublicKey && this.deps.getKeyPair()) {
      const sharedKey = await this.getOrDeriveSharedKey(dm.from.id, senderPublicKey);
      if (sharedKey) {
        try {
          dm.content = await decrypt(dm.content, sharedKey);
          dm.encrypted = false;
        } catch {
          dm.content = '[Failed to decrypt message]';
        }
      }
    }

    if (!conv.messages.find((m) => m.id === dm.id)) {
      conv.messages.push(dm);
      conv.lastMessage = dm;
      conv.unreadCount++;
      conv.lastSeen = Date.now();
      this.dmConversations.set(dm.from.id, conv);

      void this.deps.yjs.getOrCreateDMDoc(dm.from.id).then((doc) => {
        if (doc) this.deps.yjs.addDMMessage(doc, dm);
      });

      this.deps.scheduleSave('dms');
      this.deps.emitEvent({ type: 'dm-message', payload: { dm, incoming: true }, timestamp: Date.now() });
    }
  }

  sendDMTyping(toPeerId: string, isTyping: boolean): void {
    const entry = this.deps.transport.connections.get(toPeerId);
    if (entry?.conn?.open) {
      this.deps.transport.sendToConnection(entry.conn, {
        type: 'dm-typing',
        payload: { peerId: this.deps.getLocalPeer().id, isTyping },
        timestamp: Date.now(),
      });
    }
  }

  handleDMTyping(peerId: string, isTyping: boolean): void {
    const conv = this.dmConversations.get(peerId);
    if (conv) {
      conv.isTyping = isTyping;
      this.dmConversations.set(peerId, conv);
      this.deps.emitEvent({ type: 'dm-typing', payload: { peerId, isTyping }, timestamp: Date.now() });
    }
  }

  markDMAsRead(peerId: string): void {
    const conv = this.dmConversations.get(peerId);
    if (conv) {
      conv.unreadCount = 0;
      this.dmConversations.set(peerId, conv);
    }
  }

  async verifyPeerKey(peerId: string): Promise<void> {
    const peer = this.deps.findPeerById(peerId);
    const conv = this.dmConversations.get(peerId) || (peer ? this.getOrCreateDMConversation(peer) : null);
    if (!conv || !conv.peerId.publicKey) {
      throw new Error('Peer encryption key is not available yet. Wait until the peer connects.');
    }

    conv.verifiedPublicKey = conv.peerId.publicKey;
    conv.verifiedAt = Date.now();
    conv.keyChanged = false;
    conv.previousPublicKey = undefined;
    this.dmConversations.set(peerId, conv);

    try {
      await Storage.saveDMConversation({
        peerId: conv.peerId.id,
        peerUsername: conv.peerId.username,
        peerPublicKey: conv.peerId.publicKey,
        lastSeen: conv.lastSeen,
        verifiedPublicKey: conv.verifiedPublicKey,
        verifiedAt: conv.verifiedAt,
        keyChanged: false,
        previousPublicKey: undefined,
      });
    } catch {
      this.deps.scheduleSave('dms');
    }

    this.deps.emitEvent({
      type: 'dm-verified',
      payload: { peerId, verified: true, verifiedAt: conv.verifiedAt },
      timestamp: Date.now(),
    });
  }

  async unverifyPeerKey(peerId: string): Promise<void> {
    const conv = this.dmConversations.get(peerId);
    if (!conv) return;

    conv.verifiedPublicKey = undefined;
    conv.verifiedAt = undefined;
    this.dmConversations.set(peerId, conv);

    try {
      await Storage.saveDMConversation({
        peerId: conv.peerId.id,
        peerUsername: conv.peerId.username,
        peerPublicKey: conv.peerId.publicKey,
        lastSeen: conv.lastSeen,
        verifiedPublicKey: undefined,
        verifiedAt: undefined,
        keyChanged: conv.keyChanged,
        previousPublicKey: conv.previousPublicKey,
      });
    } catch {
      this.deps.scheduleSave('dms');
    }

    this.deps.emitEvent({
      type: 'dm-verified',
      payload: { peerId, verified: false },
      timestamp: Date.now(),
    });
  }

  async getSafetyInfo(peerId: string): Promise<DMSafetyInfo | null> {
    const localPublicKey = this.deps.getLocalPeer().publicKey;
    const conv = this.dmConversations.get(peerId);
    const peer = conv?.peerId || this.deps.findPeerById(peerId);
    if (!peer) return null;

    const peerPublicKey = peer.publicKey;
    const [safetyNumber, localShortFingerprint, peerShortFingerprint] = await Promise.all([
      localPublicKey && peerPublicKey ? computeSafetyNumber(localPublicKey, peerPublicKey) : Promise.resolve(undefined),
      localPublicKey ? formatShortKeyFingerprint(localPublicKey) : Promise.resolve(undefined),
      peerPublicKey ? formatShortKeyFingerprint(peerPublicKey) : Promise.resolve(undefined),
    ]);

    const isVerified = Boolean(
      peerPublicKey && conv?.verifiedPublicKey && conv.verifiedPublicKey === peerPublicKey && !conv.keyChanged
    );

    return {
      peerId: peer.id,
      peerUsername: peer.username,
      localPublicKey,
      peerPublicKey,
      localShortFingerprint,
      peerShortFingerprint,
      safetyNumber,
      isVerified,
      verifiedAt: conv?.verifiedAt,
      keyChanged: Boolean(conv?.keyChanged),
      previousPublicKey: conv?.previousPublicKey,
    };
  }

  getDMConversations(): DMConversation[] {
    return Array.from(this.dmConversations.values()).sort(
      (a, b) => (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0)
    );
  }

  getDMMessages(peerId: string): DirectMessage[] {
    return this.dmConversations.get(peerId)?.messages || [];
  }

  clearRuntimeState(): void {
    this.dmConversations.clear();
    this.pendingDMMessages.clear();
    this.sharedKeys.clear();
  }
}
