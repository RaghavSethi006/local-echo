import { createDefaultCommunityConfig } from '@/lib/templates';
import type { DirectMessage, P2PEvent, PeerId, Server } from '@/types/p2p';
import {
  decrypt,
  exportKeyPairJwk,
  exportSigningKeyPairJwk,
  exportStorageKey,
  importStorageKey,
  type KeyPair,
  type SigningKeyPair,
} from '../crypto';
import { logger } from '../logger';
import * as Storage from '../storage';
import type { YjsManager, YjsSyncMessage } from '../yjs-manager';
import type { CommunityManager } from './community';
import type { DMManager } from './dm';
import type { P2PTransport } from './transport';

export interface PersistenceDeps {
  getLocalPeer: () => PeerId;
  getKeyPair: () => KeyPair | null;
  getSigningKeyPair: () => SigningKeyPair | null;
  getStorageKey: () => CryptoKey | null;
  setStorageKey: (key: CryptoKey) => void;
  yjs: YjsManager;
  transport: P2PTransport;
  community: CommunityManager;
  dm: DMManager;
  emitEvent: (event: P2PEvent) => void;
  findPeerById: (peerId: string) => PeerId | null;
}

export class PersistenceCoordinator {
  persistenceReady = false;
  private pendingSaves: Set<string> = new Set();
  private saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private deps: PersistenceDeps;

  constructor(deps: PersistenceDeps) {
    this.deps = deps;
  }

  wireYjsHandlers(): void {
    this.deps.yjs.setSyncOutgoingHandler((msg, targetPeerId) => this.handleYjsSyncOutgoing(msg, targetPeerId));
    this.deps.yjs.onChange((channelKey) => {
      if (channelKey.startsWith('channel:')) this.syncCacheFromYjs(channelKey);
      if (channelKey.startsWith('dm:')) this.syncCacheFromYjsDM(channelKey);
    });
  }

  handleYjsEvent(event: P2PEvent, fromPeerId: string): void {
    const payload = event.payload as { channelKey: string; step?: number; data: string };
    if (!payload?.channelKey || !payload?.data) return;
    const msg: YjsSyncMessage =
      event.type === 'yjs-sync'
        ? payload.step === 1
          ? { type: 'yjs-sync-step1', channelKey: payload.channelKey, sv: payload.data }
          : { type: 'yjs-sync-step2', channelKey: payload.channelKey, update: payload.data }
        : { type: 'yjs-update', channelKey: payload.channelKey, update: payload.data };
    this.deps.yjs.handleSyncMessage(msg, fromPeerId);
  }

  private handleYjsSyncOutgoing(msg: YjsSyncMessage, targetPeerId?: string): void {
    const localPeer = this.deps.getLocalPeer();
    const payload =
      msg.type === 'yjs-sync-step1'
        ? { channelKey: msg.channelKey, step: 1, data: msg.sv }
        : { channelKey: msg.channelKey, data: msg.update };
    const baseEvent: P2PEvent = {
      type: msg.type === 'yjs-update' ? 'yjs-update' : 'yjs-sync',
      payload,
      timestamp: Date.now(),
    };

    if (msg.channelKey.startsWith('dm:')) {
      const parts = msg.channelKey.split(':');
      const remotePeerId = parts[1] === localPeer.id ? parts[2] : parts[1];
      const entry = this.deps.transport.connections.get(remotePeerId);
      if (entry?.conn?.open) {
        this.deps.transport.sendToConnection(entry.conn, baseEvent);
      } else if (targetPeerId) {
        const target = this.deps.transport.connections.get(targetPeerId);
        if (target?.conn?.open) this.deps.transport.sendToConnection(target.conn, baseEvent);
      }
      return;
    }

    const resolvedTarget = targetPeerId || ('targetPeerId' in msg ? msg.targetPeerId : undefined);
    if (resolvedTarget) {
      const entry = this.deps.transport.connections.get(resolvedTarget);
      if (entry?.conn?.open) this.deps.transport.sendToConnection(entry.conn, baseEvent);
      return;
    }

    if (msg.type === 'yjs-update') {
      this.deps.transport.broadcast(baseEvent);
    }
  }

  private syncCacheFromYjs(channelKey: string): void {
    if (!channelKey.startsWith('channel:')) return;
    const parts = channelKey.split(':');
    if (parts.length < 3) return;
    const serverId = parts[1];
    const channelId = parts[2];
    void this.deps.yjs.getOrCreateChannelDoc(serverId, channelId).then((doc) => {
      if (!doc) return;
      const msgs = this.deps.yjs.getChannelMessages(doc);
      msgs.forEach((m) => {
        m.serverId = serverId;
        m.channelId = channelId;
      });
      this.deps.community.messages.set(`${serverId}:${channelId}`, msgs);
      const latest = msgs[msgs.length - 1];
      if (latest) {
        this.deps.emitEvent({ type: 'message', payload: latest, timestamp: Date.now() });
      }
    });
  }

  private syncCacheFromYjsDM(channelKey: string): void {
    const localPeer = this.deps.getLocalPeer();
    if (!channelKey.startsWith('dm:')) return;
    const parts = channelKey.split(':');
    if (parts.length < 3) return;
    const remoteId = parts[1] === localPeer.id ? parts[2] : parts[1];
    void this.deps.yjs.getOrCreateDMDoc(remoteId).then(async (doc) => {
      if (!doc) return;
      const msgs = this.deps.yjs.getDMMessages(doc);
      const knownPeer = this.deps.findPeerById(remoteId);
      const conv = this.deps.dm.getOrCreateDMConversation(
        knownPeer || {
          id: remoteId,
          username: this.deps.dm.dmConversations.get(remoteId)?.peerId.username || `peer-${remoteId.slice(0, 6)}`,
        }
      );
      const existingIds = new Set(conv.messages.map((m) => m.id));
      let lastAdded: DirectMessage | null = null;
      const sharedKey =
        conv.peerId.publicKey && this.deps.getKeyPair()
          ? await this.deps.dm.getOrDeriveSharedKey(remoteId, conv.peerId.publicKey)
          : null;

      for (const dm of msgs) {
        if (!existingIds.has(dm.id)) {
          if (dm.encrypted && sharedKey) {
            try {
              dm.content = await decrypt(dm.content, sharedKey);
              dm.encrypted = false;
            } catch {
              // Keep existing content if decryption fails
            }
          }
          conv.messages.push(dm);
          conv.lastMessage = dm;
          if (dm.from.id !== localPeer.id) {
            conv.unreadCount++;
          }
          existingIds.add(dm.id);
          lastAdded = dm;
        }
      }
      this.deps.dm.dmConversations.set(remoteId, conv);
      this.scheduleSave('dms');
      if (lastAdded) {
        this.deps.emitEvent({
          type: 'dm-message',
          payload: { dm: lastAdded, incoming: lastAdded.from.id !== localPeer.id },
          timestamp: Date.now(),
        });
      }
    });
  }

  scheduleSave(type: string): void {
    this.pendingSaves.add(type);
    if (this.saveDebounceTimer) clearTimeout(this.saveDebounceTimer);
    this.saveDebounceTimer = setTimeout(() => void this.flushSaves(), 300);
  }

  async flushSaves(): Promise<void> {
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
      this.saveDebounceTimer = null;
    }

    const saves = new Set(this.pendingSaves);
    this.pendingSaves.clear();
    if (saves.size === 0) return;

    const localPeer = this.deps.getLocalPeer();
    const keyPair = this.deps.getKeyPair();
    const signingKeyPair = this.deps.getSigningKeyPair();
    const storageKey = this.deps.getStorageKey();

    try {
      const promises: Promise<void>[] = [];

      if (saves.has('identity')) {
        const identity: Parameters<typeof Storage.saveIdentity>[0] = {
          peerId: localPeer.id,
          username: localPeer.username,
          publicKey: localPeer.publicKey,
          verifyKey: localPeer.verifyKey,
        };
        if (keyPair) {
          const exported = await exportKeyPairJwk(keyPair);
          identity.publicKeyJwk = exported.publicKeyJwk;
          identity.privateKeyJwk = exported.privateKeyJwk;
        }
        if (signingKeyPair) {
          const exportedSigning = await exportSigningKeyPairJwk(signingKeyPair);
          identity.verifyKeyJwk = exportedSigning.verifyKeyJwk;
          identity.signingKeyJwk = exportedSigning.signingKeyJwk;
        }
        if (storageKey?.extractable) {
          identity.storageKeyJwk = await exportStorageKey(storageKey);
        }
        promises.push(Storage.saveIdentity(identity));
      }

      if (saves.has('servers')) {
        for (const server of this.deps.community.servers.values()) {
          promises.push(
            Storage.saveServer({
              id: server.id,
              name: server.name,
              icon: server.icon,
              config: server.config,
              channels: server.channels,
              memberRoles: server.memberRoles,
              hostId: server.hostId,
              createdAt: server.createdAt,
              inviteCode: server.inviteCode,
              lastHostPeerId: server.hostId,
            })
          );
        }
      }

      if (saves.has('dms')) {
        for (const [, conv] of this.deps.dm.dmConversations.entries()) {
          promises.push(
            Storage.saveDMConversation({
              peerId: conv.peerId.id,
              peerUsername: conv.peerId.username,
              peerPublicKey: conv.peerId.publicKey,
              lastSeen: conv.lastSeen,
              verifiedPublicKey: conv.verifiedPublicKey,
              verifiedAt: conv.verifiedAt,
              keyChanged: conv.keyChanged,
              previousPublicKey: conv.previousPublicKey,
            })
          );
        }
      }

      await Promise.all(promises);
    } catch (err) {
      logger.error('[P2P] Persistence error:', err);
    }
  }

  async loadPersistedData(): Promise<void> {
    const localPeer = this.deps.getLocalPeer();

    try {
      const identity = await Storage.loadIdentity();
      if (identity?.storageKeyJwk) {
        const key = await importStorageKey(identity.storageKeyJwk);
        this.deps.setStorageKey(key);
        Storage.setStorageKey(key);
      }

      const storedServers = await Storage.loadServers();
      for (const s of storedServers) {
        if (!this.deps.community.servers.has(s.id)) {
          const isLocalHost = s.hostId === localPeer.id;
          if (isLocalHost) {
            this.deps.community.isHost = true;
            this.deps.community.hostId = localPeer.id;
          }
          const restoredServer: Server = {
            id: s.id,
            name: s.name,
            channels: s.channels,
            members: [localPeer],
            memberRoles: s.memberRoles || {
              [localPeer.id]: [isLocalHost ? 'owner' : 'newcomer'],
            },
            hostId: s.hostId,
            createdAt: s.createdAt,
            inviteCode: s.inviteCode,
            icon: s.icon,
            config: s.config,
          };

          if (!restoredServer.config) {
            restoredServer.config = createDefaultCommunityConfig(
              { name: s.name, visibility: 'private', template: 'custom' },
              s.hostId
            );
          }

          this.deps.community.servers.set(s.id, restoredServer);
        }
      }

      for (const server of Array.from(this.deps.community.servers.values())) {
        for (const channel of server.channels) {
          const key = `${server.id}:${channel.id}`;
          const doc = await this.deps.yjs.getOrCreateChannelDoc(server.id, channel.id);
          const msgs = this.deps.yjs.getChannelMessages(doc);
          msgs.forEach((m) => {
            m.serverId = server.id;
            m.channelId = channel.id;
          });
          this.deps.community.messages.set(key, msgs);
        }
      }

      await this.deps.community.reconnectRemoteServers();

      const storedConvs = await Storage.loadDMConversations();
      for (const c of storedConvs) {
        if (this.deps.dm.dmConversations.has(c.peerId)) continue;
        let dmMsgs: DirectMessage[];
        try {
          const dmDoc = await this.deps.yjs.getOrCreateDMDoc(c.peerId);
          dmMsgs = this.deps.yjs.getDMMessages(dmDoc);
          if (c.peerPublicKey && this.deps.getKeyPair()) {
            const sharedKey = await this.deps.dm.getOrDeriveSharedKey(c.peerId, c.peerPublicKey);
            if (sharedKey) {
              for (const dm of dmMsgs) {
                if (dm.encrypted) {
                  try {
                    dm.content = await decrypt(dm.content, sharedKey);
                    dm.encrypted = false;
                  } catch {
                    dm.content = '[Failed to decrypt message]';
                  }
                }
              }
            }
          }
        } catch {
          dmMsgs = [];
        }
        if (dmMsgs.length === 0) {
          dmMsgs = await Storage.loadDMMessages(c.peerId);
        }
        this.deps.dm.dmConversations.set(c.peerId, {
          peerId: { id: c.peerId, username: c.peerUsername, publicKey: c.peerPublicKey },
          messages: dmMsgs,
          lastMessage: dmMsgs[dmMsgs.length - 1],
          unreadCount: 0,
          isTyping: false,
          connectionType: 'disconnected',
          lastSeen: c.lastSeen,
          verifiedPublicKey: c.verifiedPublicKey,
          verifiedAt: c.verifiedAt,
          keyChanged: c.keyChanged,
          previousPublicKey: c.previousPublicKey,
        });
      }

      const loadedMessageCount =
        Array.from(this.deps.community.messages.values()).reduce((sum, msgs) => sum + msgs.length, 0) +
        Array.from(this.deps.dm.dmConversations.values()).reduce((sum, conv) => sum + conv.messages.length, 0);
      this.persistenceReady = true;
      logger.log(
        '[P2P] Loaded persisted data:',
        storedServers.length,
        'servers,',
        loadedMessageCount,
        'recent messages,',
        storedConvs.length,
        'DM conversations'
      );
    } catch (err) {
      logger.error('[P2P] Error loading persisted data:', err);
      this.persistenceReady = true;
    }
  }

  async clearPersistedData(): Promise<void> {
    await Storage.clearAllData();
  }
}
