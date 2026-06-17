// P2P Network Manager - PeerJS-based WebRTC implementation
// PeerJS handles signaling automatically via its open-source signaling server.
// All actual data flows peer-to-peer through WebRTC DataChannels.

import Peer, { DataConnection } from 'peerjs';
import { 
  PeerId, 
  Message, 
  Server, 

  P2PEvent, 
  ConnectionStatus,
  DirectMessage,
  DMConversation,
  ChannelOp,
} from '@/types/p2p';
import { generateId, generateKeyPair, generateSigningKeyPair, deriveSharedKey, encrypt, decrypt, importPublicKey, signData, verifySignature, KeyPair, generateStorageKey, exportStorageKey, importStorageKey } from './crypto';
import * as Storage from './storage';
import { createDefaultCommunityConfig } from '@/lib/templates';
import { getTemplateChannels } from '@/types/community';
import type { CommunityConfig, CommunityConfigPatch, CreateCommunityInput } from '@/types/community';
import { logger } from './logger';
import { YjsManager } from './yjs-manager';
import type { YjsSyncMessage } from './yjs-manager';

type EventCallback = (event: P2PEvent) => void;
type ServerUpdatePatch = { name?: string; icon?: string; channelOps?: ChannelOp[]; configPatch?: CommunityConfigPatch };
type CoreServer = Omit<Server, 'config'>;

interface SyncRequestPayload {
  peerInfo?: PeerId;
}

interface SyncResponsePayload {
  servers: CoreServer[];
  messages: Record<string, Message[]>;
  sequenceNumber: number;
  onlinePeers: PeerId[];
}

interface ChunkFrame {
  _chunkId: string;
  _index: number;
  _total: number;
  _data: string;
}

type PeerJsDataConnectionWithChannel = DataConnection & {
  _dc?: RTCDataChannel;
  dataChannel?: RTCDataChannel;
};

interface PeerEntry {
  peerId: PeerId;
  conn: DataConnection;
  status: 'online' | 'offline';
  lastSeen: number;
}

export interface P2PNetworkOptions {
  signalingHost?: string;
  signalingPort?: number;
  signalingSecure?: boolean;
  signalingPath?: string;
  iceServers?: RTCIceServer[];
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out (${ms}ms)`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer!));
}

export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function compressInvite(json: string): Promise<string> {
  const encoder = new TextEncoder();
  const inputBytes = encoder.encode(json);
  const cs = new CompressionStream('gzip');
  const writer = cs.writable.getWriter();
  await writer.write(inputBytes);
  await writer.close();
  const reader = cs.readable.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const total = chunks.reduce((s, c) => s + c.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return uint8ArrayToBase64(result);
}

export async function decompressInvite(base64: string): Promise<string> {
  const compressed = base64ToUint8Array(base64);
  const ds = new DecompressionStream('gzip');
  const writer = ds.writable.getWriter();
  await writer.write(compressed);
  await writer.close();
  const reader = ds.readable.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const total = chunks.reduce((s, c) => s + c.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return new TextDecoder().decode(result);
}

export class P2PNetwork {
  private localPeer: PeerId;
  private keyPair: KeyPair | null = null;
  private signingKeyPair: { signingKey: CryptoKey; verifyKey: CryptoKey; verifyKeyString: string } | null = null;
  private storageKey: CryptoKey | null = null;
  private sharedKeys: Map<string, CryptoKey> = new Map();
  private peer: Peer | null = null;
  private connections: Map<string, PeerEntry> = new Map();
  private servers: Map<string, Server> = new Map();
  private messages: Map<string, Message[]> = new Map();
  private yjs: YjsManager;
  private eventListeners: Set<EventCallback> = new Set();
  private isHost: boolean = false;
  private hostId: string | null = null;
  private hostConn: DataConnection | null = null;
  private bulkConnections: Map<string, DataConnection> = new Map();
  private bulkHostConn: DataConnection | null = null;
  private messageSeq = 0;
  private readonly CHUNK_SIZE = 12_000;
  private chunkBuffers: Map<string, Map<string, Array<string | null>>> = new Map();
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private migrationInProgress = false;
  private migrationTimeout: ReturnType<typeof setTimeout> | null = null;

  // DM state
  private dmConversations: Map<string, DMConversation> = new Map();
  private pendingDMMessages: Map<string, DirectMessage[]> = new Map();
  
  // Persistence flags
  private persistenceReady: boolean = false;
  private pendingSaves: Set<string> = new Set();
  private saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  // Options
  private options: P2PNetworkOptions;

  // Reconnection state
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 10;

  constructor(username: string, existingId?: string, options: P2PNetworkOptions = {}) {
    this.localPeer = {
      id: existingId || generateId(),
      username,
    };
    this.options = options;
    this.yjs = new YjsManager(this.localPeer.id);
  }

  async initialize(): Promise<void> {
    this.keyPair = await generateKeyPair();
    this.localPeer.publicKey = this.keyPair.publicKeyString;
    this.signingKeyPair = await generateSigningKeyPair();
    this.localPeer.verifyKey = this.signingKeyPair.verifyKeyString;

    // Generate an AES-GCM storage key for at-rest DM encryption
    this.storageKey = await generateStorageKey();
    Storage.setStorageKey(this.storageKey);

    return new Promise((resolve, reject) => {
      // Use the local peer id as PeerJS id for addressability
      const peerOptions: Record<string, unknown> = { debug: 1 };
      if (this.options.signalingHost) {
        peerOptions.host = this.options.signalingHost;
      }
      if (this.options.signalingPort !== undefined) {
        peerOptions.port = this.options.signalingPort;
      }
      if (this.options.signalingSecure !== undefined) {
        peerOptions.secure = this.options.signalingSecure;
      }
      if (this.options.signalingPath) {
        peerOptions.path = this.options.signalingPath;
      }
      if (this.options.iceServers) {
        peerOptions.config = { iceServers: this.options.iceServers };
      }
      this.peer = new Peer(this.localPeer.id, peerOptions);

      const timeout = setTimeout(() => reject(new Error('PeerJS initialization timeout')), 15000);

      this.peer.on('open', (id) => {
        clearTimeout(timeout);
        this.reconnectAttempts = 0;
        logger.log('[P2P] PeerJS ready with ID:', id);
        resolve();
      });

      this.peer.on('connection', (conn) => {
        logger.log('[P2P] Incoming connection from:', conn.peer);
        this.handleIncomingConnection(conn);
      });

      this.peer.on('call', (call) => {
        logger.log('[P2P] Incoming voice call from:', call.peer);
        if (this.localStream) {
          call.answer(this.localStream);
          this.voiceConnections.set(call.peer, call);
          call.on('stream', (remoteStream) => {
            const audio = new Audio();
            audio.srcObject = remoteStream;
            audio.play().catch(() => {});
            this.voiceAudioElements.set(call.peer, audio);
          });
          call.on('close', () => {
            this.voiceConnections.delete(call.peer);
            const el = this.voiceAudioElements.get(call.peer);
            if (el) { el.pause(); el.srcObject = null; }
            this.voiceAudioElements.delete(call.peer);
          });
          call.on('error', (err) => logger.error('[P2P Voice] Incoming call error:', err));
        } else {
          call.close();
        }
      });

      this.peer.on('error', (err) => {
        logger.error('[P2P] PeerJS error:', err);
        this.emitEvent({
          type: 'error',
          payload: { message: 'Signaling server error: ' + (err.message || 'Unknown error'), level: 'error' },
          timestamp: Date.now(),
        });
      });

      this.peer.on('disconnected', () => {
        const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);
        if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
          logger.log(`[P2P] Disconnected, reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.MAX_RECONNECT_ATTEMPTS})...`);
          setTimeout(() => {
            this.reconnectAttempts++;
            this.peer?.reconnect();
          }, delay);
        } else {
          logger.error('[P2P] Max reconnection attempts reached');
          this.emitEvent({
            type: 'error',
            payload: { message: 'Could not reconnect to signaling server after multiple attempts.', level: 'error' },
            timestamp: Date.now(),
          });
        }
      });

      this.heartbeatInterval = setInterval(() => this.sendHeartbeats(), 15_000);

      // Wire Yjs sync to network layer
      this.yjs.setSyncOutgoingHandler((msg) => this.handleYjsSyncOutgoing(msg));
      this.yjs.onChange((channelKey) => {
        if (channelKey.startsWith('channel:')) this.syncCacheFromYjs(channelKey);
        if (channelKey.startsWith('dm:')) this.syncCacheFromYjsDM(channelKey);
      });
    });
  }

  getLocalPeer(): PeerId { return this.localPeer; }
  isHostPeer(): boolean { return this.isHost; }

  getConnectionStatus(): ConnectionStatus {
    if (this.isHost) return 'host';
    if (this.connections.size > 0) return 'connected';
    return 'disconnected';
  }

  // ==================== SERVER MANAGEMENT ====================

  async createServer(input: string | CreateCommunityInput): Promise<Server> {
    const createInput: CreateCommunityInput = typeof input === 'string'
      ? { name: input, visibility: 'private', template: 'custom' }
      : input;
    const channels = getTemplateChannels(createInput.template);
    const server: Server = {
      id: generateId(),
      name: createInput.name,
      icon: createInput.icon,
      config: createDefaultCommunityConfig(createInput, this.localPeer.id),
      channels,
      members: [this.localPeer],
      memberRoles: { [this.localPeer.id]: ['owner'] },
      hostId: this.localPeer.id,
      createdAt: Date.now(),
    };

    this.servers.set(server.id, server);
    this.isHost = true;
    this.hostId = this.localPeer.id;

    server.channels.forEach(ch => {
      const key = `${server.id}:${ch.id}`;
      this.messages.set(key, []);
      this.yjs.getOrCreateChannelDoc(server.id, ch.id);
    });

    logger.log('[P2P] Created server:', server.name, '| Host peer ID:', this.localPeer.id);
    this.scheduleSave('servers');
    return server;
  }

  // ==================== SERVER CUSTOMIZATION (host only) ====================
  // Updates flow: host edits locally → broadcasts `server-updated` → peers
  // apply the same patch to their local server object → emit event for UI.

  isServerHost(serverId: string): boolean {
    const s = this.servers.get(serverId);
    return !!s && s.hostId === this.localPeer.id;
  }

  private applyServerPatch(server: Server, patch: Partial<Server> & { _channelOps?: ChannelOp[]; _configPatch?: CommunityConfigPatch }): void {
    if (typeof patch.name === 'string') server.name = patch.name;
    if (typeof patch.icon === 'string') server.icon = patch.icon;
    if (patch._configPatch) {
      server.config = this.applyCommunityConfigPatch(server.config, patch._configPatch, server);
      server.icon = server.config.branding.icon || server.icon;
    }
    const ops = patch._channelOps || [];
    for (const op of ops) {
      if (op.kind === 'add') {
        if (!server.channels.find(c => c.id === op.channel.id)) {
          server.channels.push(op.channel);
          const key = `${server.id}:${op.channel.id}`;
          this.messages.set(key, []);
          this.yjs.getOrCreateChannelDoc(server.id, op.channel.id);
        }
      } else if (op.kind === 'rename') {
        const ch = server.channels.find(c => c.id === op.channelId);
        if (ch) {
          ch.name = op.name;
          if (typeof op.description === 'string') ch.description = op.description;
        }
      } else if (op.kind === 'delete') {
        server.channels = server.channels.filter(c => c.id !== op.channelId);
        this.messages.delete(`${server.id}:${op.channelId}`);
      }
    }
  }

  private applyCommunityConfigPatch(
    current: Server['config'],
    patch: CommunityConfigPatch,
    server?: Server
  ): NonNullable<Server['config']> {
    const fallbackInput: CreateCommunityInput = {
      name: server?.name || 'Community',
      visibility: 'private',
      template: 'custom',
    };
    const base = current || createDefaultCommunityConfig(fallbackInput, this.localPeer.id);
    const next = {
      ...base,
      branding: { ...base.branding, ...patch.branding },
      roles: patch.roles || base.roles,
      permissionOverwrites: patch.permissionOverwrites || base.permissionOverwrites,
      version: base.version + 1,
    };
    return next;
  }

  async updateServer(
    serverId: string,
    patch: ServerUpdatePatch
  ): Promise<Server> {
    const server = this.servers.get(serverId);
    if (!server) throw new Error('Server not found');
    if (server.hostId !== this.localPeer.id) {
      throw new Error('Only the server host can edit this server');
    }

    const fullPatch = {
      name: patch.name,
      icon: patch.icon,
      _channelOps: patch.channelOps || [],
      _configPatch: patch.configPatch,
    };
    this.applyServerPatch(server, fullPatch);
    this.servers.set(server.id, server);
    this.scheduleSave('servers');

    this.broadcast({
      type: 'server-updated',
      payload: { serverId: server.id, patch: fullPatch },
      timestamp: Date.now(),
    });
    this.emitEvent({
      type: 'server-updated',
      payload: { serverId: server.id },
      timestamp: Date.now(),
    });
    return server;
  }

  async deleteServerAsHost(serverId: string): Promise<void> {
    const server = this.servers.get(serverId);
    if (!server) return;
    if (server.hostId !== this.localPeer.id) {
      throw new Error('Only the host can delete this server');
    }
    this.broadcast({
      type: 'server-deleted',
      payload: { serverId },
      timestamp: Date.now(),
    });
    await this.removeServerLocal(serverId);
  }

  async leaveServer(serverId: string): Promise<void> {
    // Local-only removal; if we're the host, treat as delete (broadcast tear-down).
    const server = this.servers.get(serverId);
    if (!server) return;
    if (server.hostId === this.localPeer.id) {
      await this.deleteServerAsHost(serverId);
      return;
    }
    await this.removeServerLocal(serverId);
  }

  private async removeServerLocal(serverId: string): Promise<void> {
    const server = this.servers.get(serverId);
    if (!server) return;
    // Drop messages for all channels
    for (const ch of server.channels) {
      this.messages.delete(`${serverId}:${ch.id}`);
      try { await Storage.deleteChannelMessages(serverId, ch.id); } catch { /* storage may already be cleared */ }
    }
    this.servers.delete(serverId);
    try { await Storage.deleteServer(serverId); } catch { /* storage may already be cleared */ }
    // Optionally close the host conn if we joined this server
    this.emitEvent({
      type: 'server-deleted',
      payload: { serverId },
      timestamp: Date.now(),
    });
  }

  // Invite code encodes the host's PeerJS ID + server info
  async generateInvite(serverId: string): Promise<string> {
    const server = this.servers.get(serverId);
    if (!server) throw new Error('Server not found');
    if (!this.hasPermission(serverId, this.localPeer.id, 'create_invites')) {
      throw new Error('You do not have permission to create invites for this server.');
    }

    const payload = {
      serverId: server.id,
      serverName: server.name,
      hostPeerId: this.localPeer.id,
      hostUsername: this.localPeer.username,
      hostVerifyKey: this.signingKeyPair?.verifyKeyString,
      timestamp: Date.now(),
    };
    const payloadStr = JSON.stringify(payload);
    const signature = this.signingKeyPair
      ? await signData(payloadStr, this.signingKeyPair.signingKey)
      : '';
    const json = JSON.stringify({ payload, signature });
    try {
      return await withTimeout(compressInvite(json), 3000, 'compressInvite');
    } catch (err) {
      console.error('[P2P] compressInvite failed, falling back to base64:', err);
      return btoa(json);
    }
  }

  // Join server by connecting to the host's PeerJS ID
  async joinServer(inviteCode: string): Promise<Server> {
    let parsedInvite: Record<string, unknown>;
    try {
      const decompressed = await withTimeout(decompressInvite(inviteCode), 3000, 'decompressInvite');
      parsedInvite = JSON.parse(decompressed);
    } catch (err) {
      console.error('[P2P] decompressInvite failed, falling back to atob:', err);
      parsedInvite = JSON.parse(atob(inviteCode));
    }
    const invite = parsedInvite.payload ?? parsedInvite;
    const signature = parsedInvite.signature;
    if (invite.hostVerifyKey && signature) {
      const valid = await verifySignature(JSON.stringify(invite), signature, invite.hostVerifyKey);
      if (!valid) {
        throw new Error('Invite code has an invalid signature — it may have been tampered with.');
      }
    }
    logger.log('[P2P] Joining server:', invite.serverName, 'via host:', invite.hostPeerId);

    if (!this.peer) throw new Error('Not initialized');

    const hostPeer: PeerId = {
      id: invite.hostPeerId,
      username: invite.hostUsername || 'Host',
    };

    // Connect to host
    const conn = this.peer.connect(invite.hostPeerId, {
      reliable: true,
      metadata: {
        type: 'server-join',
        serverId: invite.serverId,
        peerInfo: this.localPeer,
      },
    });

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Connection timeout')), 20000);

      conn.on('open', () => {
        clearTimeout(timeout);
        logger.log('[P2P] Connected to host (RT):', invite.hostPeerId);

        this.hostConn = conn;
        this.hostId = invite.hostPeerId;
        this.isHost = false;

        this.connections.set(invite.hostPeerId, {
          peerId: hostPeer,
          conn,
          status: 'online',
          lastSeen: Date.now(),
        });

        // Set up data handling on RT channel
        this.setupConnectionHandlers(conn, invite.hostPeerId, false);

        // Create local server representation
        const server: Server = {
          id: invite.serverId,
          name: invite.serverName,
          channels: [],
          members: [hostPeer, this.localPeer],
          memberRoles: { [this.localPeer.id]: ['newcomer'], [hostPeer.id]: ['owner'] },
          hostId: invite.hostPeerId,
          createdAt: invite.timestamp,
        };

        this.servers.set(server.id, server);

        // Establish a second DataChannel for bulk traffic (sync, history, config)
        const bulkConn = this.peer!.connect(invite.hostPeerId, {
          reliable: true,
          metadata: {
            type: 'server-join',
            channelType: 'bulk',
            serverId: invite.serverId,
            peerInfo: this.localPeer,
          },
        });

        let bulkReady = false;
        let syncSent = false;

        const proceed = () => {
          if (!bulkReady || syncSent) return;
          syncSent = true;

          // Request sync from host (over RT — small, needs to go immediately)
          this.sendToConnection(conn, {
            type: 'sync-request',
            payload: { peerInfo: this.localPeer },
            timestamp: Date.now(),
          });

          this.emitEvent({ type: 'peer-joined', payload: hostPeer, timestamp: Date.now() });
          server.inviteCode = inviteCode;
          this.servers.set(server.id, server);
          this.scheduleSave('servers');
          resolve(server);
        };

        bulkConn.on('open', () => {
          logger.log('[P2P] Connected to host (Bulk):', invite.hostPeerId);
          this.bulkHostConn = bulkConn;
          this.bulkConnections.set(invite.hostPeerId, bulkConn);
          this.setupConnectionHandlers(bulkConn, invite.hostPeerId, true);
          bulkReady = true;
          proceed();
        });

        bulkConn.on('error', (err) => {
          logger.warn('[P2P] Bulk connection failed, proceeding with RT only:', err);
          bulkReady = true;
          proceed();
        });

        // Fallback: if bulk never opens within 5s, proceed with RT only
        setTimeout(() => {
          if (!bulkReady) {
            logger.warn('[P2P] Bulk connection timeout, proceeding with RT only');
            bulkReady = true;
            proceed();
          }
        }, 5000);
      });

      conn.on('error', (err) => {
        clearTimeout(timeout);
        logger.error('[P2P] Connection error:', err);
        reject(err);
      });
    });
  }

  // ==================== CONNECTION HANDLING ====================

  private handleIncomingConnection(conn: DataConnection): void {
    conn.on('open', () => {
      const metadata = conn.metadata;
      const channelType = metadata?.channelType;

      if (channelType === 'bulk') {
        logger.log('[P2P] Bulk connection opened from:', conn.peer);
        this.bulkConnections.set(conn.peer, conn);
        this.setupConnectionHandlers(conn, conn.peer, true);
        return;
      }

      const peerInfo: PeerId = metadata?.peerInfo || { id: conn.peer, username: 'Unknown' };
      
      logger.log('[P2P] Connection opened from:', peerInfo.username, '(', conn.peer, ')');

      this.connections.set(conn.peer, {
        peerId: peerInfo,
        conn,
        status: 'online',
        lastSeen: Date.now(),
      });

      this.setupConnectionHandlers(conn, conn.peer, false);
      this.flushPendingDMs(conn.peer);

      // Add to all servers as member
      if (this.isHost) {
        this.servers.forEach(server => {
          if (!server.members.find(m => m.id === peerInfo.id)) {
            server.members.push(peerInfo);
            server.memberRoles = server.memberRoles || {};
            if (!server.memberRoles[peerInfo.id]) {
              server.memberRoles[peerInfo.id] = ['newcomer'];
            }
          }
        });

        // Notify all other peers about the new member
        this.broadcast({
          type: 'peer-joined',
          payload: peerInfo,
          timestamp: Date.now(),
        }, conn.peer);

        // Send peer list to new member
        const peerList = Array.from(this.connections.entries())
          .filter(([id]) => id !== conn.peer)
          .map(([_, entry]) => entry.peerId);
        
        this.sendToConnection(conn, {
          type: 'peer-list',
          payload: { peers: [this.localPeer, ...peerList] },
          timestamp: Date.now(),
        });
      }

      this.emitEvent({ type: 'peer-joined', payload: peerInfo, timestamp: Date.now() });

      // Initiate Yjs sync for each shared channel
      if (this.isHost) {
        this.servers.forEach(server => {
          if (!server.members.find(m => m.id === peerInfo.id)) return;
          server.channels.forEach(ch => {
            const channelKey = this.yjs.channelKey(server.id, ch.id);
            this.yjs.getOrCreateChannelDoc(server.id, ch.id);
            const target = this.bulkConnections.get(conn.peer)?.open
              ? this.bulkConnections.get(conn.peer)!
              : conn;
            this.sendToConnection(target, {
              type: 'yjs-sync',
              payload: { channelKey, step: 1, data: '' },
              timestamp: Date.now(),
            });
          });
        });
      }
    });
  }

  private setupConnectionHandlers(conn: DataConnection, remotePeerId: string, isBulk: boolean = false): void {
    const channelSuffix = isBulk ? ':bulk' : ':rt';

    conn.on('data', async (data: unknown) => {
      try {
        const raw = typeof data === 'string' ? data : JSON.stringify(data);
        const assembled = this.receiveChunk(remotePeerId + channelSuffix, raw);
        if (!assembled) return;

        if (!isBulk) {
          const entry = this.connections.get(remotePeerId);
          if (entry) entry.lastSeen = Date.now();
        }

        const event = JSON.parse(assembled) as P2PEvent;
        await this.handleEvent(remotePeerId, event);
      } catch (err) {
        logger.error('[P2P] Error handling data:', err);
      }
    });

    conn.on('close', () => {
      this.chunkBuffers.delete(remotePeerId + channelSuffix);
      if (isBulk) {
        logger.log('[P2P] Bulk connection closed:', remotePeerId);
        this.bulkConnections.delete(remotePeerId);
        return;
      }
      logger.log('[P2P] Connection closed:', remotePeerId);
      const entry = this.connections.get(remotePeerId);
      if (entry) {
        entry.status = 'offline';
        this.emitEvent({ type: 'peer-left', payload: entry.peerId, timestamp: Date.now() });
      }
      this.connections.delete(remotePeerId);

      // Host migration if the host left
      if (remotePeerId === this.hostId && !this.isHost) {
        this.emitEvent({
          type: 'error',
          payload: { message: 'Host disconnected. Migrating to new host...', level: 'warn' },
          timestamp: Date.now(),
        });
        this.initiateHostMigration();
      }
    });

    conn.on('error', (err) => {
      logger.error('[P2P] Connection error with', remotePeerId, ':', err);
      this.emitEvent({
        type: 'error',
        payload: { message: `Connection lost with ${remotePeerId.slice(0, 8)}...`, level: 'warn' },
        timestamp: Date.now(),
      });
    });
  }

  // ==================== EVENT HANDLING ====================

  private async handleEvent(fromPeerId: string, event: P2PEvent): Promise<void> {
    logger.log('[P2P] Event from', fromPeerId, ':', event.type);

    switch (event.type) {
      case 'message':
        this.handleChatMessage(event.payload as Message, fromPeerId);
        break;
      case 'sync-request':
        this.handleSyncRequest(fromPeerId, event.payload as SyncRequestPayload);
        break;
      case 'sync-response':
        await this.handleSyncResponse(event.payload as SyncResponsePayload);
        break;
      case 'peer-joined':
      case 'peer-left':
      case 'host-changed':
        this.emitEvent(event);
        break;
      case 'host-claim':
        this.handleHostClaim(event.payload as { claimantId: string; proposedHostId: string; view: string[] });
        break;
      case 'host-conflict':
        this.handleHostConflict(event.payload as { myCandidate: string; myView: string[] });
        break;
      case 'host-confirmed':
        this.handleHostConfirmed(event.payload as { newHostId: string });
        break;
      case 'dm-message':
        await this.handleDMMessage(event.payload as DirectMessage, fromPeerId);
        break;
      case 'dm-typing':
        this.handleDMTyping(event.payload.peerId || fromPeerId, event.payload.isTyping);
        break;
      case 'dm-read':
        this.emitEvent(event);
        break;
      case 'server-updated': {
        const { serverId, patch } = event.payload || {};
        const server = this.servers.get(serverId);
        if (server && patch) {
          this.applyServerPatch(server, patch);
          this.servers.set(serverId, server);
          this.scheduleSave('servers');
          this.emitEvent({ type: 'server-updated', payload: { serverId }, timestamp: Date.now() });
        }
        break;
      }
      case 'server-deleted': {
        const { serverId } = event.payload || {};
        if (serverId) {
          // Fire and forget — local cleanup
          this.removeServerLocal(serverId);
        }
        break;
      }
      case 'config-sync': {
        const { serverId, config } = event.payload as { serverId: string; config: CommunityConfig };
        const server = this.servers.get(serverId);
        if (server && config) {
          const incomingVersion = config.version ?? 0;
          const existingVersion = server.config?.version ?? 0;
          if (incomingVersion >= existingVersion) {
            server.config = config;
            this.servers.set(serverId, server);
            this.scheduleSave('servers');
            this.emitEvent({
              type: 'server-updated',
              payload: { serverId },
              timestamp: Date.now(),
            });
          }
        }
        break;
      }
      case 'peer-list': {
        const peers = (event.payload as { peers?: PeerId[] }).peers;
        peers?.forEach(p => {
          if (p.id !== this.localPeer.id) {
            this.servers.forEach(server => {
              if (!server.members.find(m => m.id === p.id)) {
                server.members.push(p);
              }
            });
          }
        });
        this.emitEvent({ type: 'peer-joined', payload: peers, timestamp: Date.now() });
        break;
      }
      case 'ping': {
        const entry = this.connections.get(fromPeerId);
        if (entry) entry.lastSeen = Date.now();
        const conn = this.connections.get(fromPeerId)?.conn;
        if (conn) this.sendToConnection(conn, { type: 'pong', payload: null, timestamp: Date.now() });
        break;
      }
      case 'pong': {
        const entry = this.connections.get(fromPeerId);
        if (entry) entry.lastSeen = Date.now();
        break;
      }
      case 'yjs-sync':
      case 'yjs-update': {
        this.handleYjsEvent(event, fromPeerId);
        break;
      }
    }
  }

  private handleYjsEvent(event: P2PEvent, fromPeerId: string): void {
    const payload = event.payload as { channelKey: string; step?: number; data: string };
    if (!payload?.channelKey || !payload?.data) return;
    const msg: YjsSyncMessage =
      event.type === 'yjs-sync'
        ? (payload.step === 1
            ? { type: 'yjs-sync-step1', channelKey: payload.channelKey, sv: payload.data }
            : { type: 'yjs-sync-step2', channelKey: payload.channelKey, update: payload.data })
        : { type: 'yjs-update', channelKey: payload.channelKey, update: payload.data };
    this.yjs.handleSyncMessage(msg, fromPeerId);
  }

  private handleYjsSyncOutgoing(msg: YjsSyncMessage, targetPeerId?: string): void {
    const payload = msg.type === 'yjs-sync-step1'
      ? { channelKey: msg.channelKey, step: 1, data: msg.sv }
      : { channelKey: msg.channelKey, data: msg.update };
    const baseEvent: P2PEvent = {
      type: msg.type === 'yjs-update' ? 'yjs-update' : 'yjs-sync',
      payload,
      timestamp: Date.now(),
    };

    // DM channel keys are "dm:{peerA}:{peerB}" — route updates
    // to the DM peer (not broadcast to all connections)
    if (msg.channelKey.startsWith('dm:')) {
      const parts = msg.channelKey.split(':');
      const remotePeerId = parts[1] === this.localPeer.id ? parts[2] : parts[1];
      // Try direct connection, then fall back to host relay
      const entry = this.connections.get(remotePeerId);
      if (entry?.conn?.open) {
        this.sendToConnection(entry.conn, baseEvent);
      } else if (targetPeerId) {
        const target = this.connections.get(targetPeerId);
        if (target?.conn?.open) this.sendToConnection(target.conn, baseEvent);
      }
      return;
    }

    if (targetPeerId) {
      const entry = this.connections.get(targetPeerId);
      if (entry?.conn?.open) this.sendToConnection(entry.conn, baseEvent);
      return;
    }

    // Channel yjs-update broadcasts to all
    if (msg.type === 'yjs-update') {
      this.broadcast(baseEvent);
    }
  }

  private syncCacheFromYjs(channelKey: string): void {
    if (!channelKey.startsWith('channel:')) return;
    const parts = channelKey.split(':');
    if (parts.length < 3) return;
    const serverId = parts[1];
    const channelId = parts[2];
    // Re-read messages from Yjs doc into the display cache
    this.yjs.getOrCreateChannelDoc(serverId, channelId).then(doc => {
      if (!doc) return;
      const msgs = this.yjs.getChannelMessages(doc);
      msgs.forEach(m => {
        m.serverId = serverId;
        m.channelId = channelId;
      });
      this.messages.set(`${serverId}:${channelId}`, msgs);
      // Emit the latest message for UI update
      const latest = msgs[msgs.length - 1];
      if (latest) {
        this.emitEvent({ type: 'message', payload: latest, timestamp: Date.now() });
      }
    });
  }

  private syncCacheFromYjsDM(channelKey: string): void {
    if (!channelKey.startsWith('dm:')) return;
    const parts = channelKey.split(':');
    if (parts.length < 3) return;
    const remoteId = parts[1] === this.localPeer.id ? parts[2] : parts[1];
    this.yjs.getOrCreateDMDoc(remoteId).then(doc => {
      if (!doc) return;
      const msgs = this.yjs.getDMMessages(doc);
      const conv = this.getOrCreateDMConversation({
        id: remoteId,
        username: this.dmConversations.get(remoteId)?.peerId.username || `peer-${remoteId.slice(0, 6)}`,
      });
      // Merge without duplicates
      const existingIds = new Set(conv.messages.map(m => m.id));
      for (const dm of msgs) {
        if (!existingIds.has(dm.id)) {
          conv.messages.push(dm);
          conv.lastMessage = dm;
          existingIds.add(dm.id);
        }
      }
      this.dmConversations.set(remoteId, conv);
      this.scheduleSave('dms');
      this.emitEvent({ type: 'dm-message', payload: { dm: msgs[msgs.length - 1], incoming: true }, timestamp: Date.now() });
    });
  }

  private handleChatMessage(message: Message, _fromPeerId: string): void {
    const key = `${message.serverId}:${message.channelId}`;
    const channelMessages = this.messages.get(key) || [];

    if (!channelMessages.find(m => m.id === message.id)) {
      channelMessages.push(message);
      this.messages.set(key, channelMessages);
      this.emitEvent({ type: 'message', payload: message, timestamp: Date.now() });
    }
  }

  private handleSyncRequest(fromPeerId: string, payload: SyncRequestPayload): void {
    if (!this.isHost) return;

    // Update peer info
    if (payload.peerInfo) {
      const entry = this.connections.get(fromPeerId);
      if (entry) {
        entry.peerId = payload.peerInfo;
        this.connections.set(fromPeerId, entry);
      }
    }

    const bulkConn = this.bulkConnections.get(fromPeerId);
    const targetConn = bulkConn?.open ? bulkConn : this.connections.get(fromPeerId)?.conn;
    if (targetConn) {
      this.sendToConnection(targetConn, {
        type: 'sync-response',
        payload: {
          servers: Array.from(this.servers.values()).map(s => {
            const { config: _config, ...coreServer } = s;
            void _config;
            return coreServer;
          }),
          messages: {},
          sequenceNumber: 0,
          onlinePeers: this.getOnlinePeers(),
        },
        timestamp: Date.now(),
      });
      // Send config separately to keep sync-response under DataChannel size limits
      Array.from(this.servers.values()).forEach(server => {
        if (!server.config) return;
        this.sendToConnection(targetConn, {
          type: 'config-sync',
          payload: { serverId: server.id, config: server.config },
          timestamp: Date.now(),
        });
      });
    }
  }

  private async handleSyncResponse(payload: SyncResponsePayload): Promise<void> {
    // Merge servers
    payload.servers?.forEach((server: Server) => {
      const existing = this.servers.get(server.id);
      if (existing) {
        existing.name = server.name;
        existing.icon = server.icon;
        const incomingVersion = server.config?.version ?? 0;
        const existingVersion = existing.config?.version ?? 0;
        if (incomingVersion >= existingVersion) {
          existing.config = server.config;
        }
        existing.channels = server.channels;
        existing.hostId = server.hostId;
        existing.createdAt = server.createdAt;
        existing.memberRoles = server.memberRoles;
        // Merge members
        server.members.forEach(m => {
          if (!existing.members.find(em => em.id === m.id)) {
            existing.members.push(m);
            // Assign default 'newcomer' role for new members
            if (!existing.memberRoles[m.id]) {
              existing.memberRoles[m.id] = ['newcomer'];
            }
          }
        });
        // Ensure we're in the list
        if (!existing.members.find(m => m.id === this.localPeer.id)) {
          existing.members.push(this.localPeer);
        }
        this.servers.set(server.id, existing);
      } else {
        if (!server.members.find(m => m.id === this.localPeer.id)) {
          server.members.push(this.localPeer);
        }
        if (!server.memberRoles) {
          server.memberRoles = {};
        }
        this.servers.set(server.id, server);
      }
      const storedServer = this.servers.get(server.id);
      storedServer?.channels.forEach(ch => {
        const key = `${server.id}:${ch.id}`;
        if (!this.messages.has(key)) {
          this.messages.set(key, []);
        }
      });
    });

    logger.log('[P2P] Synced with host');
    this.scheduleSave('servers');

    // Initiate Yjs sync for each channel (channels are only available now
    // after the sync-response merges them into the local server objects)
    this.servers.forEach(server => {
      server.channels.forEach(ch => {
        const channelKey = this.yjs.channelKey(server.id, ch.id);
        this.yjs.getOrCreateChannelDoc(server.id, ch.id);
        this.yjs.sendSyncStep1(channelKey);
      });
    });

    this.emitEvent({ type: 'sync-response', payload: null, timestamp: Date.now() });
  }

  // ==================== MESSAGING ====================

  async sendMessage(serverId: string, channelId: string, content: string): Promise<Message> {
    if (!this.isServerMember(serverId, this.localPeer.id)) {
      throw new Error('You are not a member of this server.');
    }
    if (!this.hasPermission(serverId, this.localPeer.id, 'send_messages')) {
      throw new Error('You do not have permission to send messages in this server.');
    }
    const MAX_MESSAGE_BYTES = 8192;
    if (new TextEncoder().encode(content).byteLength > MAX_MESSAGE_BYTES) {
      throw new Error('Message is too long (max 8KB). Please split it into smaller messages.');
    }

    const message: Message = {
      id: generateId(),
      serverId,
      channelId,
      author: this.localPeer,
      content,
      seq: ++this.messageSeq,
      timestamp: Date.now(),
    };

    // Add to Yjs doc (triggers Yjs update broadcast to peers)
    const doc = this.yjs.getOrCreateChannelDoc(serverId, channelId);
    this.yjs.addChannelMessage(doc, message);

    // Update local cache and emit for UI
    const key = `${serverId}:${channelId}`;
    const channelMessages = this.messages.get(key) || [];
    channelMessages.push(message);
    this.messages.set(key, channelMessages);

    this.emitEvent({ type: 'message', payload: message, timestamp: Date.now() });
    return message;
  }

  // ==================== HOST MIGRATION ====================

  private initiateHostMigration(view?: string[]): void {
    if (this.migrationInProgress) return;
    this.migrationInProgress = true;

    const candidates = view ?? [this.localPeer.id, ...Array.from(this.connections.keys())
      .filter(id => this.connections.get(id)?.status === 'online')];
    candidates.sort();
    const proposedHostId = candidates[0];

    logger.log('[P2P] Host migration → proposed host:', proposedHostId);

    if (proposedHostId === this.localPeer.id) {
      // Phase 1: Claim — inform all peers of our election
      this.isHost = true;
      this.hostId = this.localPeer.id;
      this.hostConn = null;
      this.bulkHostConn = null;

      this.servers.forEach(server => {
        server.hostId = this.localPeer.id;
      });

      this.broadcast({
        type: 'host-claim',
        payload: { claimantId: this.localPeer.id, proposedHostId, view: candidates },
        timestamp: Date.now(),
      });

      // Phase 2: Wait for conflicts (2s). If none, confirm.
      this.migrationTimeout = setTimeout(() => {
        this.migrationTimeout = null;
        if (!this.migrationInProgress) return;
        this.broadcast({
          type: 'host-confirmed',
          payload: { newHostId: this.localPeer.id },
          timestamp: Date.now(),
        });
        this.emitEvent({
          type: 'host-changed',
          payload: { newHostId: this.localPeer.id },
          timestamp: Date.now(),
        });
        this.migrationInProgress = false;
      }, 2000);

      // Store migration context for host-conflict handler
      this._migrationCandidates = candidates;
    } else {
      // Wait for the elected host to claim leadership (3s timeout)
      this.hostId = proposedHostId;
      this._migrationCandidates = candidates;

      this.migrationTimeout = setTimeout(() => {
        this.migrationTimeout = null;
        if (!this.migrationInProgress) return;
        // No claim from expected host — re-elect with potentially different view
        this.migrationInProgress = false;
        this._migrationCandidates = undefined;
        this.initiateHostMigration();
      }, 3000);
    }
  }

  // Scratchpad for migration state (used by event handlers)
  private _migrationCandidates: string[] | undefined = undefined;

  private handleHostClaim(payload: { claimantId: string; proposedHostId: string; view: string[] }): void {
    if (!this.migrationInProgress) return;
    if (payload.proposedHostId === this.hostId) {
      // Claim matches our elected host — confirm
      if (this.migrationTimeout) clearTimeout(this.migrationTimeout);
      this.migrationTimeout = null;
      this.migrationInProgress = false;
      this._migrationCandidates = undefined;

      // Reconnect to the claiming host if needed
      const entry = this.connections.get(payload.claimantId);
      if (entry) {
        this.hostConn = entry.conn;
        this.bulkHostConn = this.bulkConnections.get(payload.claimantId) || null;
      } else {
        this.reconnectToHost(payload.claimantId);
      }

      this.emitEvent({
        type: 'host-changed',
        payload: { newHostId: payload.claimantId },
        timestamp: Date.now(),
      });
    } else {
      // Conflict — we elected a different host
      if (this.migrationTimeout) clearTimeout(this.migrationTimeout);
      this.migrationTimeout = null;
      this.migrationInProgress = false;

      this.broadcast({
        type: 'host-conflict',
        payload: {
          myCandidate: this.hostId,
          myView: this._migrationCandidates ?? [this.localPeer.id],
        },
        timestamp: Date.now(),
      });
      this._migrationCandidates = undefined;

      // Re-elect with union of views
      const mergedView = Array.from(new Set([
        ...(this._migrationCandidates ?? [this.localPeer.id]),
        ...(payload.view ?? []),
      ]));
      this.initiateHostMigration(mergedView);
    }
  }

  private handleHostConflict(payload: { myCandidate: string; myView: string[] }): void {
    if (!this.migrationInProgress) return;
    if (this.migrationTimeout) clearTimeout(this.migrationTimeout);
    this.migrationTimeout = null;
    this.migrationInProgress = false;

    // Re-elect with union of views
    const mergedView = Array.from(new Set([
      ...(this._migrationCandidates ?? [this.localPeer.id]),
      ...(payload.myView ?? []),
    ]));
    this._migrationCandidates = undefined;
    this.initiateHostMigration(mergedView);
  }

  private handleHostConfirmed(payload: { newHostId: string }): void {
    if (this.migrationInProgress) {
      if (this.migrationTimeout) clearTimeout(this.migrationTimeout);
      this.migrationTimeout = null;
      this.migrationInProgress = false;
      this._migrationCandidates = undefined;
    }

    this.broadcast({
      type: 'host-changed',
      payload,
      timestamp: Date.now(),
    });
    this.emitEvent({
      type: 'host-changed',
      payload,
      timestamp: Date.now(),
    });
  }

  private reconnectToHost(newHostId: string): void {
    if (!this.peer) return;
    logger.log('[P2P] Reconnecting to new host:', newHostId);
    const conn = this.peer.connect(newHostId, {
      reliable: true,
      metadata: {
        type: 'host-rejoin',
        peerInfo: this.localPeer,
        channelType: 'rt',
      },
    });

    conn.on('open', () => {
      logger.log('[P2P] Reconnected to new host:', newHostId);
      this.hostConn = conn;
      this.hostId = newHostId;
      this.connections.set(newHostId, {
        peerId: { id: newHostId, username: 'New Host' },
        conn,
        status: 'online',
        lastSeen: Date.now(),
      });

      this.setupConnectionHandlers(conn, newHostId, false);
      this.flushPendingDMs(newHostId);

      // Establish bulk connection
      const bulkConn = this.peer!.connect(newHostId, {
        reliable: true,
        metadata: {
          type: 'host-rejoin',
          peerInfo: this.localPeer,
          channelType: 'bulk',
        },
      });

      bulkConn.on('open', () => {
        this.bulkHostConn = bulkConn;
        this.bulkConnections.set(newHostId, bulkConn);
        this.setupConnectionHandlers(bulkConn, newHostId, true);

        // Send sync request to get server state
        this.sendToConnection(conn, {
          type: 'sync-request',
          payload: { peerInfo: this.localPeer },
          timestamp: Date.now(),
        });

        // Initiate Yjs sync for all channel docs
        this.servers.forEach(server => {
          server.channels.forEach(ch => {
            const channelKey = this.yjs.channelKey(server.id, ch.id);
            this.yjs.getOrCreateChannelDoc(server.id, ch.id);
            this.yjs.sendSyncStep1(channelKey);
          });
        });
      });
    });

    conn.on('error', (err) => {
      logger.error('[P2P] Reconnection to new host failed:', err);
    });
  }

  // ==================== DM METHODS ====================

  // ==================== PERMISSION CHECKS ====================

  private isServerMember(serverId: string, peerId: string): boolean {
    const server = this.servers.get(serverId);
    if (!server) return false;
    return server.members.some(m => m.id === peerId);
  }

  private hasPermission(serverId: string, peerId: string, permission: string, channelId?: string): boolean {
    const server = this.servers.get(serverId);
    if (!server) return false;
    if (server.hostId === peerId) return true;

    const memberRoleIds = server.memberRoles?.[peerId];
    if (!memberRoleIds || memberRoleIds.length === 0) return false;

    // Collect all permissions from the peer's roles
    const granted = new Set<string>();
    server.config?.roles?.forEach(role => {
      if (memberRoleIds.includes(role.id)) {
        role.permissions.forEach(p => granted.add(p));
      }
    });

    // Apply server-scoped overwrites
    server.config?.permissionOverwrites?.forEach(ow => {
      if (ow.scopeType !== 'server') return;
      const matches = ow.targetType === 'role'
        ? memberRoleIds.includes(ow.targetId)
        : ow.targetId === peerId;
      if (matches) {
        ow.allow.forEach(p => granted.add(p));
        ow.deny.forEach(p => granted.delete(p));
      }
    });

    // Apply channel-scoped overwrites
    if (channelId) {
      server.config?.permissionOverwrites?.forEach(ow => {
        if (ow.scopeType !== 'channel' || ow.scopeId !== channelId) return;
        const matches = ow.targetType === 'role'
          ? memberRoleIds.includes(ow.targetId)
          : ow.targetId === peerId;
        if (matches) {
          ow.allow.forEach(p => granted.add(p));
          ow.deny.forEach(p => granted.delete(p));
        }
      });
    }

    return granted.has(permission);
  }

  private async getOrDeriveSharedKey(remotePeerId: string, remotePublicKeyString: string): Promise<CryptoKey | null> {
    if (this.sharedKeys.has(remotePeerId)) {
      return this.sharedKeys.get(remotePeerId)!;
    }
    if (!this.keyPair) return null;
    try {
      const remotePublicKey = await importPublicKey(remotePublicKeyString);
      const sharedKey = await deriveSharedKey(this.keyPair.privateKey, remotePublicKey);
      this.sharedKeys.set(remotePeerId, sharedKey);
      return sharedKey;
    } catch {
      return null;
    }
  }

  getOrCreateDMConversation(peer: PeerId): DMConversation {
    let conv = this.dmConversations.get(peer.id);
    if (!conv) {
      conv = {
        peerId: peer,
        messages: [],
        unreadCount: 0,
        isTyping: false,
        connectionType: this.connections.has(peer.id) ? 'relay' : 'disconnected',
        lastSeen: Date.now(),
      };
      this.dmConversations.set(peer.id, conv);
    }
    return conv;
  }

  async initiateDMConnection(peerId: string): Promise<void> {
    // For DMs, we reuse the existing server connection or connect directly
    if (this.connections.has(peerId)) {
      this.setDMConnectionType(peerId, 'direct');
      return;
    }

    // Try direct PeerJS connection
    if (this.peer) {
      try {
        const conn = this.peer.connect(peerId, {
          reliable: true,
          metadata: { type: 'dm', peerInfo: this.localPeer },
        });

        conn.on('open', () => {
          logger.log('[P2P DM] Direct connection to:', peerId);
          this.connections.set(peerId, {
            peerId: this.findPeerById(peerId) || { id: peerId, username: 'Unknown' },
            conn,
            status: 'online',
            lastSeen: Date.now(),
          });
          this.setupConnectionHandlers(conn, peerId);
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
      this.emitEvent({ type: 'dm-message', payload: { peerId, connectionType: type }, timestamp: Date.now() });
    }
  }

  async sendDM(toPeerId: string, content: string): Promise<DirectMessage> {
    // Fall back to the DM conversation peer (covers peers added via Peer ID
    // who aren't yet in any server / connected list).
    const toPeer =
      this.findPeerById(toPeerId) ||
      this.dmConversations.get(toPeerId)?.peerId ||
      ({ id: toPeerId, username: `peer-${toPeerId.slice(0, 6)}` } as PeerId);

    const localDm: DirectMessage = {
      id: generateId(),
      type: 'DM',
      from: this.localPeer,
      to: toPeer,
      content,
      timestamp: Date.now(),
      encrypted: false,
    };

    let wireDm: DirectMessage = { ...localDm };
    const toPeerPublicKey = toPeer.publicKey;
    if (toPeerPublicKey && this.keyPair) {
      const sharedKey = await this.getOrDeriveSharedKey(toPeerId, toPeerPublicKey);
      if (sharedKey) {
        wireDm = {
          ...localDm,
          content: await encrypt(localDm.content, sharedKey),
          encrypted: true,
        };
      }
    }

    // Store locally
    const conv = this.getOrCreateDMConversation(toPeer);
    conv.messages.push(localDm);
    conv.lastMessage = localDm;
    this.dmConversations.set(toPeerId, conv);

    // Persist to Yjs for history sync when peer reconnects
    this.yjs.getOrCreateDMDoc(toPeerId).then(doc => {
      if (doc) this.yjs.addDMMessage(doc, wireDm);
    });

    this.scheduleSave('dms');

    // Send - try direct connection first, then relay through host
    const entry = this.connections.get(toPeerId);
    if (entry?.conn?.open) {
      this.sendToConnection(entry.conn, { type: 'dm-message', payload: wireDm, timestamp: Date.now() });
    } else if (this.hostConn?.open) {
      // Relay through host (host treats as opaque)
      this.sendToConnection(this.hostConn, {
        type: 'dm-message',
        payload: { ...wireDm, _relayTo: toPeerId },
        timestamp: Date.now(),
      });
    }

    this.emitEvent({ type: 'dm-message', payload: { dm: localDm, incoming: false }, timestamp: Date.now() });

    // Queue for offline delivery if peer is unreachable
    const canDeliverDirect = entry?.conn?.open;
    const canDeliverRelay = this.hostConn?.open;
    if (!canDeliverDirect && !canDeliverRelay) {
      this.queuePendingDM(toPeerId, wireDm);
    }

    return localDm;
  }

  private queuePendingDM(peerId: string, dm: DirectMessage): void {
    const queue = this.pendingDMMessages.get(peerId) || [];
    queue.push(dm);
    this.pendingDMMessages.set(peerId, queue);
    logger.log('[P2P DM] Queued message for offline delivery to:', peerId.slice(0, 8));
  }

  private flushPendingDMs(peerId: string): void {
    const queue = this.pendingDMMessages.get(peerId);
    if (!queue || queue.length === 0) return;
    logger.log('[P2P DM] Flushing', queue.length, 'pending messages to:', peerId.slice(0, 8));
    const entry = this.connections.get(peerId);
    if (entry?.conn?.open) {
      for (const dm of queue) {
        this.sendToConnection(entry.conn, { type: 'dm-message', payload: dm, timestamp: Date.now() });
      }
      this.pendingDMMessages.delete(peerId);
      this.emitEvent({
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

  private async handleDMMessage(dm: DirectMessage, _fromPeerId: string): Promise<void> {
    // Host relay logic - forward without inspecting content
    if (this.isHost && dm._relayTo && dm._relayTo !== this.localPeer.id) {
      const target = this.connections.get(dm._relayTo);
      if (target?.conn?.open) {
        const { _relayTo, ...cleanDm } = dm;
        this.sendToConnection(target.conn, { type: 'dm-message', payload: cleanDm, timestamp: Date.now() });
      }
      return;
    }

    if (dm.encrypted && dm.from.publicKey && this.keyPair) {
      const sharedKey = await this.getOrDeriveSharedKey(dm.from.id, dm.from.publicKey);
      if (sharedKey) {
        try {
          dm.content = await decrypt(dm.content, sharedKey);
        } catch {
          dm.content = '[Failed to decrypt message]';
        }
      }
    }

    // Store the message
    const conv = this.getOrCreateDMConversation(dm.from);
    if (!conv.messages.find(m => m.id === dm.id)) {
      conv.messages.push(dm);
      conv.lastMessage = dm;
      conv.unreadCount++;
      this.dmConversations.set(dm.from.id, conv);

      // Persist to Yjs for history sync
      this.yjs.getOrCreateDMDoc(dm.from.id).then(doc => {
        if (doc) this.yjs.addDMMessage(doc, dm);
      });

      this.scheduleSave('dms');
      this.emitEvent({ type: 'dm-message', payload: { dm, incoming: true }, timestamp: Date.now() });
    }
  }

  sendDMTyping(toPeerId: string, isTyping: boolean): void {
    const entry = this.connections.get(toPeerId);
    if (entry?.conn?.open) {
      this.sendToConnection(entry.conn, {
        type: 'dm-typing',
        payload: { peerId: this.localPeer.id, isTyping },
        timestamp: Date.now(),
      });
    }
  }

  private handleDMTyping(peerId: string, isTyping: boolean): void {
    const conv = this.dmConversations.get(peerId);
    if (conv) {
      conv.isTyping = isTyping;
      this.dmConversations.set(peerId, conv);
      this.emitEvent({ type: 'dm-typing', payload: { peerId, isTyping }, timestamp: Date.now() });
    }
  }

  markDMAsRead(peerId: string): void {
    const conv = this.dmConversations.get(peerId);
    if (conv) {
      conv.unreadCount = 0;
      this.dmConversations.set(peerId, conv);
    }
  }

  // ==================== VOICE CHANNELS ====================

  private localStream: MediaStream | null = null;
  private voiceConnections: Map<string, MediaConnection> = new Map();
  private voiceAudioElements: Map<string, HTMLAudioElement> = new Map();
  private muted = false;
  private activeVoiceChannel: { serverId: string; channelId: string } | null = null;

  async joinVoiceChannel(serverId: string, channelId: string): Promise<void> {
    if (this.activeVoiceChannel) {
      await this.leaveVoiceChannel();
    }

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      this.emitEvent({
        type: 'error',
        payload: { message: 'Could not access microphone. Please check permissions.', level: 'error' },
        timestamp: Date.now(),
      });
      return;
    }

    this.activeVoiceChannel = { serverId, channelId };
    this.muted = false;

    const membersToCall: string[] = [];
    this.servers.get(serverId)?.members.forEach(m => {
      if (m.id !== this.localPeer.id && this.connections.has(m.id)) {
        membersToCall.push(m.id);
      }
    });

    for (const peerId of membersToCall) {
      this.callPeerVoice(peerId);
    }

    this.emitEvent({
      type: 'voice-state-changed',
      payload: { joined: true, serverId, channelId },
      timestamp: Date.now(),
    });
  }

  async leaveVoiceChannel(): Promise<void> {
    this.voiceAudioElements.forEach((el) => { el.pause(); el.srcObject = null; });
    this.voiceAudioElements.clear();
    this.voiceConnections.forEach(conn => conn.close());
    this.voiceConnections.clear();

    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
      this.localStream = null;
    }

    this.muted = false;
    this.activeVoiceChannel = null;

    this.emitEvent({
      type: 'voice-state-changed',
      payload: { joined: false },
      timestamp: Date.now(),
    });
  }

  private callPeerVoice(peerId: string): void {
    if (!this.peer || !this.localStream) return;
    try {
      const call = this.peer.call(peerId, this.localStream);
      if (!call) return;
      this.voiceConnections.set(peerId, call);
      call.on('stream', (remoteStream) => {
        const audio = new Audio();
        audio.srcObject = remoteStream;
        audio.play().catch(() => {});
        this.voiceAudioElements.set(peerId, audio);
      });
      call.on('close', () => {
        this.voiceConnections.delete(peerId);
        const el = this.voiceAudioElements.get(peerId);
        if (el) { el.pause(); el.srcObject = null; }
        this.voiceAudioElements.delete(peerId);
      });
      call.on('error', (err) => logger.error('[P2P Voice] Call error:', err));
    } catch (err) {
      logger.warn('[P2P Voice] Failed to call peer:', peerId, err);
    }
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(t => {
        t.enabled = !this.muted;
      });
    }
    this.emitEvent({
      type: 'voice-state-changed',
      payload: { muted: this.muted },
      timestamp: Date.now(),
    });
    return this.muted;
  }

  isMuted(): boolean { return this.muted; }
  isInVoiceChannel(): boolean { return this.activeVoiceChannel !== null; }
  getActiveVoiceChannel(): { serverId: string; channelId: string } | null { return this.activeVoiceChannel; }

  // ==================== UTILITIES ====================

  private findPeerById(peerId: string): PeerId | null {
    const entry = this.connections.get(peerId);
    if (entry) return entry.peerId;

    for (const server of this.servers.values()) {
      const member = server.members.find(m => m.id === peerId);
      if (member) return member;
    }

    const conv = this.dmConversations.get(peerId);
    if (conv) return conv.peerId;

    return null;
  }

  private sendToConnection(conn: DataConnection, event: P2PEvent): void {
    if (conn.open) {
      this.sendChunked(conn, JSON.stringify(event));
    }
  }

  private sendChunked(conn: DataConnection, payload: string): void {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(payload);

    if (bytes.length <= this.CHUNK_SIZE) {
      if (conn.open) conn.send(payload);
      return;
    }

    const chunkId = generateId();
    const decoder = new TextDecoder();
    const totalChunks = Math.ceil(bytes.length / this.CHUNK_SIZE);
    const frames: string[] = [];

    for (let i = 0; i < totalChunks; i++) {
      const slice = bytes.slice(i * this.CHUNK_SIZE, (i + 1) * this.CHUNK_SIZE);
      frames.push(JSON.stringify({
        _chunkId: chunkId,
        _index: i,
        _total: totalChunks,
        _data: decoder.decode(slice),
      }));
    }

    this.drainFrames(conn, frames);
  }

  private receiveChunk(peerId: string, raw: string): string | null {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }

    if (!this.isChunkFrame(parsed)) return raw;

    if (!this.chunkBuffers.has(peerId)) {
      this.chunkBuffers.set(peerId, new Map());
    }
    const peerMap = this.chunkBuffers.get(peerId)!;

    if (!peerMap.has(parsed._chunkId)) {
      peerMap.set(parsed._chunkId, new Array(parsed._total).fill(null));
    }
    const chunks = peerMap.get(parsed._chunkId)!;
    chunks[parsed._index] = parsed._data;

    if (chunks.every(chunk => chunk !== null)) {
      peerMap.delete(parsed._chunkId);
      return chunks.join('');
    }
    return null;
  }

  private isChunkFrame(value: unknown): value is ChunkFrame {
    if (!value || typeof value !== 'object') return false;
    const candidate = value as Partial<ChunkFrame>;
    return (
      typeof candidate._chunkId === 'string' &&
      typeof candidate._index === 'number' &&
      typeof candidate._total === 'number' &&
      typeof candidate._data === 'string'
    );
  }

  private drainFrames(conn: DataConnection, frames: string[]): void {
    const HIGH_WATER = 1_048_576;
    const LOW_WATER = 65_536;
    const dc = (conn as PeerJsDataConnectionWithChannel)._dc
      ?? (conn as PeerJsDataConnectionWithChannel).dataChannel;

    const sendNext = () => {
      while (frames.length > 0) {
        if (!conn.open) return;

        if (dc && dc.bufferedAmount > HIGH_WATER) {
          dc.bufferedAmountLowThreshold = LOW_WATER;
          dc.addEventListener('bufferedamountlow', () => sendNext(), { once: true });
          return;
        }

        conn.send(frames.shift()!);
      }
    };

    sendNext();
  }

  private sendHeartbeats(): void {
    const now = Date.now();
    this.connections.forEach((entry, peerId) => {
      if (!entry.conn.open) return;
      if (now - entry.lastSeen > 45_000) {
        logger.warn('[P2P] Peer', peerId, 'is stale - reconnecting');
        entry.conn.close();
        return;
      }
      this.sendToConnection(entry.conn, {
        type: 'ping',
        payload: null,
        timestamp: now,
      });
    });
  }

  private broadcast(event: P2PEvent, excludePeerId?: string): void {
    this.connections.forEach((entry, id) => {
      if (id !== excludePeerId && entry.conn?.open) {
        this.sendToConnection(entry.conn, event);
      }
    });
  }

  // Event system
  addEventListener(callback: EventCallback): () => void {
    this.eventListeners.add(callback);
    return () => this.eventListeners.delete(callback);
  }

  private emitEvent(event: P2PEvent): void {
    this.eventListeners.forEach(cb => cb(event));
  }

  // Getters
  getServers(): Server[] { return Array.from(this.servers.values()); }
  getServer(id: string): Server | undefined { return this.servers.get(id); }

  getMessages(serverId: string, channelId: string): Message[] {
    return this.messages.get(`${serverId}:${channelId}`) || [];
  }

  getAllMessages(): Message[] {
    const all: Message[] = [];
    this.messages.forEach(msgs => all.push(...msgs));
    return all;
  }

  async loadOlderMessages(serverId: string, channelId: string): Promise<Message[]> {
    const key = `${serverId}:${channelId}`;
    const msgs = this.messages.get(key) || [];

    if (msgs.length === 0) {
      const stored = await Storage.loadMessages(serverId, channelId);
      this.messages.set(key, stored);
      return stored;
    }

    const oldestTs = msgs.reduce((min, m) => m.timestamp < min ? m.timestamp : min, msgs[0].timestamp);
    const older = await Storage.loadMessagesBefore(serverId, channelId, oldestTs, 50);
    if (older.length === 0) return [];

    const existingIds = new Set(msgs.map(m => m.id));
    const newMsgs = older.filter(m => !existingIds.has(m.id));
    if (newMsgs.length === 0) return [];

    msgs.unshift(...newMsgs);
    this.messages.set(key, msgs);
    return newMsgs;
  }

  getOnlinePeers(): PeerId[] {
    const online = Array.from(this.connections.values())
      .filter(p => p.status === 'online')
      .map(p => p.peerId);
    return [this.localPeer, ...online];
  }

  getAvailablePeersForDM(): PeerId[] {
    const peersMap = new Map<string, PeerId>();
    this.servers.forEach(server => {
      server.members.forEach(m => {
        if (m.id !== this.localPeer.id) peersMap.set(m.id, m);
      });
    });
    return Array.from(peersMap.values());
  }

  getDMConversations(): DMConversation[] {
    return Array.from(this.dmConversations.values())
      .sort((a, b) => (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0));
  }

  getDMMessages(peerId: string): DirectMessage[] {
    return this.dmConversations.get(peerId)?.messages || [];
  }

  async disconnect(): Promise<void> {
    await this.flushSaves();
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    this.connections.forEach(entry => {
      entry.conn?.close();
    });
    this.connections.clear();
    this.bulkConnections.forEach(conn => {
      conn?.close();
    });
    this.bulkConnections.clear();
    this.chunkBuffers.clear();
    this.peer?.destroy();
    this.peer = null;
    this.servers.clear();
    this.messages.clear();
    this.dmConversations.clear();
    await this.yjs.destroy();
    this.isHost = false;
    this.hostId = null;
    this.hostConn = null;
    this.bulkHostConn = null;
  }

  // ==================== PERSISTENCE ====================

  private scheduleSave(type: string): void {
    this.pendingSaves.add(type);
    if (this.saveDebounceTimer) clearTimeout(this.saveDebounceTimer);
    this.saveDebounceTimer = setTimeout(() => this.flushSaves(), 300);
  }

  private async flushSaves(): Promise<void> {
    const saves = new Set(this.pendingSaves);
    this.pendingSaves.clear();

    try {
      const promises: Promise<void>[] = [];

      if (saves.has('identity')) {
        const identity: Parameters<typeof Storage.saveIdentity>[0] = {
          peerId: this.localPeer.id,
          username: this.localPeer.username,
          publicKey: this.localPeer.publicKey,
        };
        if (this.storageKey) {
          identity.storageKeyJwk = await exportStorageKey(this.storageKey);
        }
        promises.push(Storage.saveIdentity(identity));
      }

      if (saves.has('servers')) {
        for (const server of this.servers.values()) {
          promises.push(Storage.saveServer({
            id: server.id,
            name: server.name,
            icon: server.icon,
            config: server.config,
            channels: server.channels,
            hostId: server.hostId,
            createdAt: server.createdAt,
            inviteCode: server.inviteCode,
            lastHostPeerId: server.hostId,
          }));
        }
      }

      if (saves.has('dms')) {
        for (const [_peerId, conv] of this.dmConversations.entries()) {
          promises.push(Storage.saveDMConversation({
            peerId: conv.peerId.id,
            peerUsername: conv.peerId.username,
            peerPublicKey: conv.peerId.publicKey,
            lastSeen: conv.lastSeen,
          }));
        }
      }

      await Promise.all(promises);
    } catch (err) {
      logger.error('[P2P] Persistence error:', err);
    }
  }

  // Load persisted data into memory
  async loadPersistedData(): Promise<void> {
    try {
      // Restore storage key for at-rest DM decryption
      const identity = await Storage.loadIdentity();
      if (identity?.storageKeyJwk) {
        this.storageKey = await importStorageKey(identity.storageKeyJwk);
        Storage.setStorageKey(this.storageKey);
      }

      // Load servers
      const storedServers = await Storage.loadServers();
      for (const s of storedServers) {
        if (!this.servers.has(s.id)) {
          const restoredServer: Server = {
            id: s.id,
            name: s.name,
            channels: s.channels,
            members: [this.localPeer],
            hostId: s.hostId,
            createdAt: s.createdAt,
            inviteCode: s.inviteCode,
            icon: s.icon,
            config: s.config,
          };

          // Back-fill config for servers created before the community system
          if (!restoredServer.config) {
            restoredServer.config = createDefaultCommunityConfig(
              { name: s.name, visibility: 'private', template: 'custom' },
              s.hostId
            );
          }

          this.servers.set(s.id, restoredServer);
        }
      }

      for (const server of storedServers) {
        if (server.hostId !== this.localPeer.id && server.inviteCode) {
          try {
            await this.joinServer(server.inviteCode);
          } catch {
            logger.log('[P2P] Could not reconnect to server', server.name, '— host is offline');
          }
        }
      }

      // Init Yjs docs for each channel (loads from y-indexeddb)
      for (const server of Array.from(this.servers.values())) {
        for (const channel of server.channels) {
          const key = `${server.id}:${channel.id}`;
          const doc = await this.yjs.getOrCreateChannelDoc(server.id, channel.id);
          const msgs = this.yjs.getChannelMessages(doc);
          msgs.forEach(m => { m.serverId = server.id; m.channelId = channel.id; });
          this.messages.set(key, msgs);
        }
      }

      // Load DM conversations from Storage
      const storedConvs = await Storage.loadDMConversations();
      for (const c of storedConvs) {
        if (this.dmConversations.has(c.peerId)) continue;
        // Try loading from Yjs doc first for complete history
        let dmMsgs: DirectMessage[];
        try {
          const dmDoc = await this.yjs.getOrCreateDMDoc(c.peerId);
          dmMsgs = this.yjs.getDMMessages(dmDoc);
        } catch {
          dmMsgs = [];
        }
        if (dmMsgs.length === 0) {
          dmMsgs = await Storage.loadDMMessages(c.peerId);
        }
        this.dmConversations.set(c.peerId, {
          peerId: { id: c.peerId, username: c.peerUsername, publicKey: c.peerPublicKey },
          messages: dmMsgs,
          lastMessage: dmMsgs[dmMsgs.length - 1],
          unreadCount: 0,
          isTyping: false,
          connectionType: 'disconnected',
          lastSeen: c.lastSeen,
        });
      }

      const loadedMessageCount = Array.from(this.messages.values()).reduce((sum, msgs) => sum + msgs.length, 0)
        + Array.from(this.dmConversations.values()).reduce((sum, conv) => sum + conv.messages.length, 0);
      this.persistenceReady = true;
      logger.log('[P2P] Loaded persisted data:', storedServers.length, 'servers,', loadedMessageCount, 'recent messages,', storedConvs.length, 'DM conversations');
    } catch (err) {
      logger.error('[P2P] Error loading persisted data:', err);
      this.persistenceReady = true;
    }
  }

  // Save identity to storage
  async persistIdentity(): Promise<void> {
    this.scheduleSave('identity');
  }

  // Clear all persisted data (on logout)
  async clearPersistedData(): Promise<void> {
    await Storage.clearAllData();
  }
}
