// P2P Network Facade — coordinates focused transport, community, DM, voice, and persistence subsystems.

import type { CommunityConfig, CreateCommunityInput } from '@/types/community';
import type {
  ConnectionDiagnostics,
  ConnectionStatus,
  DMConversation,
  DMSafetyInfo,
  DirectMessage,
  Message,
  P2PEvent,
  PeerId,
  Server,
} from '@/types/p2p';
import {
  generateId,
  generateKeyPair,
  generateSigningKeyPair,
  generateStorageKey,
  importKeyPairJwk,
  importSigningKeyPairJwk,
  importStorageKey,
  type KeyPair,
  type SigningKeyPair,
} from './crypto';
import { logger } from './logger';
import { CommunityManager } from './p2p/community';
import { DMManager } from './p2p/dm';
import { PersistenceCoordinator } from './p2p/persistence';
import { P2PTransport } from './p2p/transport';
import type {
  EventCallback,
  P2PNetworkOptions,
  ServerUpdatePatch,
  SyncRequestPayload,
  SyncResponsePayload,
  WireServerPatch,
} from './p2p/types';
import { VoiceManager } from './p2p/voice';
import * as Storage from './storage';
import { YjsManager } from './yjs-manager';

export {
  base64ToUint8Array,
  compressInvite,
  decompressInvite,
  uint8ArrayToBase64,
} from './p2p/encoding';
export type { P2PNetworkOptions } from './p2p/types';

export class P2PNetwork {
  private localPeer: PeerId;
  private keyPair: KeyPair | null = null;
  private signingKeyPair: SigningKeyPair | null = null;
  private storageKey: CryptoKey | null = null;
  private yjs: YjsManager;
  private eventListeners: Set<EventCallback> = new Set();

  private readonly transport: P2PTransport;
  private readonly community: CommunityManager;
  private readonly dm: DMManager;
  private readonly voice: VoiceManager;
  private readonly persistence: PersistenceCoordinator;

  constructor(username: string, existingId?: string, options: P2PNetworkOptions = {}) {
    this.localPeer = {
      id: existingId || generateId(),
      username,
    };
    this.yjs = new YjsManager(this.localPeer.id);

    this.transport = new P2PTransport(options, {
      getLocalPeer: () => this.localPeer,
      onEvent: (fromPeerId, event) => this.handleEvent(fromPeerId, event),
      onIncomingPeerConnected: (conn, peerInfo) => {
        this.dm.flushPendingDMs(conn.peer);
        this.community.onIncomingPeerConnected(conn, peerInfo);
      },
      onPeerDisconnected: (remotePeerId) => {
        this.community.onPeerDisconnected(remotePeerId);
      },
      onIncomingCall: (call) => {
        this.voice.handleIncomingCall(call);
      },
      onEmitEvent: (event) => this.emitEvent(event),
      onWakeHostReconnect: async () => {
        if (!this.community.isHost && this.community.hostId && !this.transport.hostConn?.open) {
          await this.community.reconnectRemoteServers();
        }
      },
    });

    this.community = new CommunityManager({
      getLocalPeer: () => this.localPeer,
      getSigningKeyPair: () => this.signingKeyPair,
      transport: this.transport,
      yjs: this.yjs,
      scheduleSave: (type) => this.persistence.scheduleSave(type),
      emitEvent: (event) => this.emitEvent(event),
      onPeerObserved: (peer) => this.dm.observePeerIdentity(peer),
      onFlushPendingDMs: (peerId) => this.dm.flushPendingDMs(peerId),
      findPeerById: (peerId) => this.findPeerById(peerId),
    });

    this.dm = new DMManager({
      getLocalPeer: () => this.localPeer,
      getKeyPair: () => this.keyPair,
      isHost: () => this.community.isHost,
      getHostId: () => this.community.hostId,
      transport: this.transport,
      yjs: this.yjs,
      scheduleSave: (type) => this.persistence.scheduleSave(type),
      emitEvent: (event) => this.emitEvent(event),
      findPeerById: (peerId) => this.findPeerById(peerId),
    });

    this.voice = new VoiceManager({
      getLocalPeer: () => this.localPeer,
      getServer: (serverId) => this.community.getServer(serverId),
      transport: this.transport,
      emitEvent: (event) => this.emitEvent(event),
      findPeerById: (peerId) => this.findPeerById(peerId),
    });

    this.persistence = new PersistenceCoordinator({
      getLocalPeer: () => this.localPeer,
      getKeyPair: () => this.keyPair,
      getSigningKeyPair: () => this.signingKeyPair,
      getStorageKey: () => this.storageKey,
      setStorageKey: (key) => {
        this.storageKey = key;
      },
      yjs: this.yjs,
      transport: this.transport,
      community: this.community,
      dm: this.dm,
      emitEvent: (event) => this.emitEvent(event),
      findPeerById: (peerId) => this.findPeerById(peerId),
    });
  }

  // Expose servers map directly for internal/test inspection compatibility
  get servers(): Map<string, Server> {
    return this.community.servers;
  }

  async initialize(): Promise<void> {
    try {
      const stored = await Storage.loadIdentity();
      if (stored && stored.peerId === this.localPeer.id) {
        if (stored.publicKeyJwk && stored.privateKeyJwk) {
          this.keyPair = await importKeyPairJwk(
            stored.publicKeyJwk,
            stored.privateKeyJwk,
            stored.publicKey
          );
        }
        if (stored.verifyKeyJwk && stored.signingKeyJwk) {
          this.signingKeyPair = await importSigningKeyPairJwk(
            stored.verifyKeyJwk,
            stored.signingKeyJwk,
            stored.verifyKey
          );
        }
        if (stored.storageKeyJwk) {
          this.storageKey = await importStorageKey(stored.storageKeyJwk);
        }
      }
    } catch {
      logger.warn('[P2P] Could not restore stored cryptographic keys; generating new keys');
    }

    if (!this.keyPair) {
      this.keyPair = await generateKeyPair();
    }
    this.localPeer.publicKey = this.keyPair.publicKeyString;

    if (!this.signingKeyPair) {
      this.signingKeyPair = await generateSigningKeyPair();
    }
    this.localPeer.verifyKey = this.signingKeyPair.verifyKeyString;

    if (!this.storageKey) {
      this.storageKey = await generateStorageKey();
    }
    Storage.setStorageKey(this.storageKey);

    this.persistence.wireYjsHandlers();
    await this.transport.initialize(this.localPeer.id);
  }

  async reconfigureNetwork(newOptions: P2PNetworkOptions): Promise<void> {
    await this.transport.reconfigure(this.localPeer.id, newOptions);
    await this.community.reconnectRemoteServers();
    this.emitEvent({
      type: 'connection-state-changed',
      payload: this.getConnectionDiagnostics(),
      timestamp: Date.now(),
    });
  }

  async reconnectNow(): Promise<void> {
    await this.transport.reconnectNow(this.localPeer.id);
  }

  handleVisibilityWake(): void {
    this.transport.handleVisibilityWake(this.localPeer.id);
  }

  handleOnlineRecovery(): void {
    this.transport.handleOnlineRecovery(this.localPeer.id);
  }

  getConnectionDiagnostics(): ConnectionDiagnostics {
    return this.transport.getDiagnostics();
  }

  getLocalPeer(): PeerId {
    return this.localPeer;
  }

  isHostPeer(): boolean {
    return this.community.isHost;
  }

  getConnectionStatus(): ConnectionStatus {
    if (this.community.isHost) return 'host';
    if (this.transport.connections.size > 0) return 'connected';
    return 'disconnected';
  }

  // ==================== SERVER MANAGEMENT ====================

  createServer(input: string | CreateCommunityInput): Promise<Server> {
    return this.community.createServer(input);
  }

  isServerHost(serverId: string): boolean {
    return this.community.isServerHost(serverId);
  }

  updateServer(serverId: string, patch: ServerUpdatePatch): Promise<Server> {
    return this.community.updateServer(serverId, patch);
  }

  deleteServerAsHost(serverId: string): Promise<void> {
    return this.community.deleteServerAsHost(serverId);
  }

  leaveServer(serverId: string): Promise<void> {
    return this.community.leaveServer(serverId);
  }

  generateInvite(serverId: string): Promise<string> {
    return this.community.generateInvite(serverId);
  }

  joinServer(inviteCode: string): Promise<Server> {
    return this.community.joinServer(inviteCode);
  }

  // ==================== EVENT ROUTING ====================

  private async handleEvent(
    fromPeerIdOrEvent: string | P2PEvent,
    eventOrFromPeerId: P2PEvent | string
  ): Promise<void> {
    const fromPeerId = typeof fromPeerIdOrEvent === 'string' ? fromPeerIdOrEvent : (eventOrFromPeerId as string);
    const event = (typeof fromPeerIdOrEvent === 'string' ? eventOrFromPeerId : fromPeerIdOrEvent) as P2PEvent;

    logger.log('[P2P] Event from', fromPeerId, ':', event.type);

    switch (event.type) {
      case 'message':
        this.community.handleChatMessage(event.payload as Message, fromPeerId);
        break;
      case 'sync-request':
        this.community.handleSyncRequest(fromPeerId, event.payload as SyncRequestPayload);
        break;
      case 'sync-response':
        await this.community.handleSyncResponse(event.payload as SyncResponsePayload);
        break;
      case 'peer-joined':
      case 'peer-left':
      case 'host-changed':
        this.emitEvent(event);
        break;
      case 'host-claim':
        this.community.handleHostClaim(
          event.payload as { claimantId: string; proposedHostId: string; view: string[] }
        );
        break;
      case 'host-conflict':
        this.community.handleHostConflict(event.payload as { myCandidate: string; myView: string[] });
        break;
      case 'host-confirmed':
        this.community.handleHostConfirmed(event.payload as { newHostId: string });
        break;
      case 'dm-message':
        await this.dm.handleDMMessage(event.payload as DirectMessage, fromPeerId);
        break;
      case 'dm-typing': {
        this.dm.handleDMTyping(fromPeerId, Boolean((event.payload as { isTyping?: boolean } | undefined)?.isTyping));
        break;
      }
      case 'dm-read':
        this.emitEvent(event);
        break;
      case 'server-updated':
        this.community.handleServerUpdated(
          fromPeerId,
          (event.payload ?? {}) as { serverId?: string; patch?: WireServerPatch }
        );
        break;
      case 'server-deleted':
        this.community.handleServerDeleted(fromPeerId, (event.payload ?? {}) as { serverId?: string });
        break;
      case 'config-sync':
        this.community.handleConfigSync(
          fromPeerId,
          (event.payload ?? {}) as { serverId?: string; config?: CommunityConfig }
        );
        break;
      case 'peer-list':
        this.community.handlePeerList((event.payload as { peers?: PeerId[] } | undefined)?.peers);
        break;
      case 'ping': {
        const entry = this.transport.connections.get(fromPeerId);
        if (entry) entry.lastSeen = Date.now();
        if (entry?.conn) {
          this.transport.sendToConnection(entry.conn, { type: 'pong', payload: null, timestamp: Date.now() });
        }
        break;
      }
      case 'pong': {
        const entry = this.transport.connections.get(fromPeerId);
        if (entry) entry.lastSeen = Date.now();
        break;
      }
      case 'yjs-sync':
      case 'yjs-update':
        this.persistence.handleYjsEvent(event, fromPeerId);
        break;
    }
  }

  private receiveChunk(peerId: string, raw: string): string | null {
    return this.transport.receiveChunk(peerId, raw);
  }

  // ==================== MESSAGING ====================

  sendMessage(serverId: string, channelId: string, content: string): Promise<Message> {
    return this.community.sendMessage(serverId, channelId, content);
  }

  loadOlderMessages(serverId: string, channelId: string): Promise<Message[]> {
    return this.community.loadOlderMessages(serverId, channelId);
  }

  // ==================== DIRECT MESSAGES & KEY VERIFICATION ====================

  getOrCreateDMConversation(peer: PeerId): DMConversation {
    return this.dm.getOrCreateDMConversation(peer);
  }

  initiateDMConnection(peerId: string): Promise<void> {
    return this.dm.initiateDMConnection(peerId);
  }

  sendDM(toPeerId: string, content: string): Promise<DirectMessage> {
    return this.dm.sendDM(toPeerId, content);
  }

  getPendingDMCount(peerId?: string): number {
    return this.dm.getPendingDMCount(peerId);
  }

  sendDMTyping(toPeerId: string, isTyping: boolean): void {
    this.dm.sendDMTyping(toPeerId, isTyping);
  }

  markDMAsRead(peerId: string): void {
    this.dm.markDMAsRead(peerId);
  }

  verifyDMPeer(peerId: string): Promise<void> {
    return this.dm.verifyPeerKey(peerId);
  }

  unverifyDMPeer(peerId: string): Promise<void> {
    return this.dm.unverifyPeerKey(peerId);
  }

  getDMSafetyInfo(peerId: string): Promise<DMSafetyInfo | null> {
    return this.dm.getSafetyInfo(peerId);
  }

  // ==================== VOICE CHANNELS ====================

  joinVoiceChannel(serverId: string, channelId: string): Promise<void> {
    return this.voice.joinVoiceChannel(serverId, channelId);
  }

  leaveVoiceChannel(): Promise<void> {
    return this.voice.leaveVoiceChannel();
  }

  toggleMute(): boolean {
    return this.voice.toggleMute();
  }

  isMuted(): boolean {
    return this.voice.isMuted();
  }

  isInVoiceChannel(): boolean {
    return this.voice.isInVoiceChannel();
  }

  getActiveVoiceChannel(): { serverId: string; channelId: string } | null {
    return this.voice.getActiveVoiceChannel();
  }

  getActiveVoicePeers(): PeerId[] {
    return this.voice.getActiveVoicePeers();
  }

  // ==================== UTILITIES & GETTERS ====================

  private findPeerById(peerId: string): PeerId | null {
    const entry = this.transport.connections.get(peerId);
    if (entry) return entry.peerId;

    for (const server of this.community.servers.values()) {
      const member = server.members.find((m) => m.id === peerId);
      if (member) return member;
    }

    const conv = this.dm.dmConversations.get(peerId);
    if (conv) return conv.peerId;

    return null;
  }

  addEventListener(callback: EventCallback): () => void {
    this.eventListeners.add(callback);
    return () => this.eventListeners.delete(callback);
  }

  private emitEvent(event: P2PEvent): void {
    this.eventListeners.forEach((cb) => cb(event));
  }

  getServers(): Server[] {
    return this.community.getServers();
  }

  getServer(id: string): Server | undefined {
    return this.community.getServer(id);
  }

  getMessages(serverId: string, channelId: string): Message[] {
    return this.community.getMessages(serverId, channelId);
  }

  getAllMessages(): Message[] {
    return this.community.getAllMessages();
  }

  getOnlinePeers(): PeerId[] {
    return this.transport.getOnlinePeers();
  }

  getAvailablePeersForDM(): PeerId[] {
    return this.community.getAvailablePeersForDM();
  }

  getDMConversations(): DMConversation[] {
    return this.dm.getDMConversations();
  }

  getDMMessages(peerId: string): DirectMessage[] {
    return this.dm.getDMMessages(peerId);
  }

  handlePageUnload(): void {
    this.transport.destroy();
    void this.persistence.flushSaves();
  }

  async disconnect(): Promise<void> {
    await this.voice.leaveVoiceChannel();
    await this.persistence.flushSaves();
    this.transport.destroy();
    this.community.clearRuntimeState();
    this.dm.clearRuntimeState();
    await this.yjs.destroy();
  }

  loadPersistedData(): Promise<void> {
    return this.persistence.loadPersistedData();
  }

  async persistIdentity(): Promise<void> {
    this.persistence.scheduleSave('identity');
  }

  clearPersistedData(): Promise<void> {
    return this.persistence.clearPersistedData();
  }
}
