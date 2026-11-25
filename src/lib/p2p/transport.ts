import Peer, { DataConnection, MediaConnection } from 'peerjs';
import type { ConnectionDiagnostics, P2PEvent, PeerId } from '@/types/p2p';
import { generateId } from '../crypto';
import { logger } from '../logger';
import {
  describeSignalingEndpoint,
  getEffectiveNetworkConfig,
  hasTurnIceServer,
} from '../network-config';
import type {
  ChunkFrame,
  P2PNetworkOptions,
  PeerEntry,
  PeerJsDataConnectionWithChannel,
} from './types';

export interface TransportCallbacks {
  getLocalPeer: () => PeerId;
  onEvent: (fromPeerId: string, event: P2PEvent) => Promise<void>;
  onIncomingPeerConnected: (conn: DataConnection, peerInfo: PeerId) => void;
  onPeerDisconnected: (remotePeerId: string, peerId: PeerId | undefined) => void;
  onIncomingCall: (call: MediaConnection) => void;
  onEmitEvent: (event: P2PEvent) => void;
  onWakeHostReconnect?: () => Promise<void>;
}

export class P2PTransport {
  peer: Peer | null = null;
  connections: Map<string, PeerEntry> = new Map();
  bulkConnections: Map<string, DataConnection> = new Map();
  hostConn: DataConnection | null = null;
  bulkHostConn: DataConnection | null = null;

  private readonly CHUNK_SIZE = 12_000;
  private chunkBuffers: Map<string, Map<string, Array<string | null>>> = new Map();
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 10;
  private signalingState: 'connected' | 'reconnecting' | 'disconnected' = 'disconnected';
  private lastReconnectAt: number | null = null;
  private lastWakeAttemptAt = 0;
  private destroyed = false;
  private tearingDown = false;
  private options: P2PNetworkOptions;
  private callbacks: TransportCallbacks;

  constructor(options: P2PNetworkOptions, callbacks: TransportCallbacks) {
    this.options = options;
    this.callbacks = callbacks;
  }

  getOptions(): P2PNetworkOptions {
    return this.options;
  }

  private buildPeerOptions(options: P2PNetworkOptions): Record<string, unknown> {
    const peerOptions: Record<string, unknown> = { debug: 1 };
    if (options.signalingHost) {
      peerOptions.host = options.signalingHost;
    }
    if (options.signalingPort !== undefined) {
      peerOptions.port = options.signalingPort;
    }
    if (options.signalingSecure !== undefined) {
      peerOptions.secure = options.signalingSecure;
    }
    if (options.signalingPath) {
      peerOptions.path = options.signalingPath;
    }
    if (options.iceServers) {
      peerOptions.config = { iceServers: options.iceServers };
    }
    return peerOptions;
  }

  async initialize(localPeerId: string): Promise<void> {
    this.destroyed = false;
    this.tearingDown = false;
    this.signalingState = 'reconnecting';

    return new Promise((resolve, reject) => {
      const peerOptions = this.buildPeerOptions(this.options);
      this.peer = new Peer(localPeerId, peerOptions);

      const timeout = setTimeout(() => {
        this.signalingState = 'disconnected';
        reject(new Error('PeerJS initialization timeout'));
      }, 15_000);

      this.peer.on('open', (id) => {
        clearTimeout(timeout);
        this.reconnectAttempts = 0;
        this.signalingState = 'connected';
        logger.log('[P2P] PeerJS ready with ID:', id);
        this.callbacks.onEmitEvent({
          type: 'connection-state-changed',
          payload: { signalingState: 'connected' },
          timestamp: Date.now(),
        });
        resolve();
      });

      this.peer.on('connection', (conn) => {
        logger.log('[P2P] Incoming connection from:', conn.peer);
        this.handleIncomingConnection(conn);
      });

      this.peer.on('call', (call) => {
        this.callbacks.onIncomingCall(call);
      });

      this.peer.on('error', (err) => {
        logger.error('[P2P] PeerJS error:', err);
        this.callbacks.onEmitEvent({
          type: 'error',
          payload: {
            message: 'Signaling server error: ' + (err.message || 'Unknown error'),
            level: 'error',
          },
          timestamp: Date.now(),
        });
      });

      this.peer.on('disconnected', () => {
        if (this.destroyed) return;
        this.signalingState = 'reconnecting';
        this.callbacks.onEmitEvent({
          type: 'connection-state-changed',
          payload: { signalingState: 'reconnecting' },
          timestamp: Date.now(),
        });
        const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30_000);
        if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
          logger.log(
            `[P2P] Disconnected, reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.MAX_RECONNECT_ATTEMPTS})...`
          );
          if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = setTimeout(() => {
            if (this.destroyed) return;
            this.reconnectAttempts++;
            this.lastReconnectAt = Date.now();
            this.peer?.reconnect();
          }, delay);
        } else {
          this.signalingState = 'disconnected';
          logger.error('[P2P] Max reconnection attempts reached');
          this.callbacks.onEmitEvent({
            type: 'connection-state-changed',
            payload: { signalingState: 'disconnected' },
            timestamp: Date.now(),
          });
          this.callbacks.onEmitEvent({
            type: 'error',
            payload: {
              message: 'Could not reconnect to signaling server after multiple attempts.',
              level: 'error',
            },
            timestamp: Date.now(),
          });
        }
      });

      if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = setInterval(() => this.sendHeartbeats(), 15_000);
    });
  }

  async reconfigure(localPeerId: string, newOptions: P2PNetworkOptions): Promise<void> {
    this.options = newOptions;
    this.lastReconnectAt = Date.now();
    this.reconnectAttempts = 0;
    this.teardownSocketOnly();
    await this.initialize(localPeerId);
  }

  async reconnectNow(localPeerId: string): Promise<void> {
    if (this.destroyed) return;
    const now = Date.now();
    this.lastReconnectAt = now;
    this.reconnectAttempts = 0;

    if (!this.peer || this.peer.destroyed) {
      await this.initialize(localPeerId);
    } else if (this.peer.disconnected) {
      this.signalingState = 'reconnecting';
      this.peer.reconnect();
    }

    if (this.callbacks.onWakeHostReconnect) {
      await this.callbacks.onWakeHostReconnect();
    }

    this.callbacks.onEmitEvent({
      type: 'connection-state-changed',
      payload: { signalingState: this.signalingState, lastReconnectAt: this.lastReconnectAt },
      timestamp: Date.now(),
    });
  }

  handleVisibilityWake(localPeerId: string): void {
    if (this.destroyed) return;
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
    const now = Date.now();
    if (now - this.lastWakeAttemptAt < 2500) return;
    this.lastWakeAttemptAt = now;

    const peerDown = !this.peer || this.peer.destroyed || this.peer.disconnected;
    const hostDisconnected = Boolean(this.hostConn && !this.hostConn.open);
    if (peerDown || hostDisconnected) {
      logger.log('[P2P] Tab woke up — verifying peer signaling & host link');
      void this.reconnectNow(localPeerId).catch((err) => {
        logger.warn('[P2P] Wake-up reconnect failed:', err);
      });
    }
  }

  handleOnlineRecovery(localPeerId: string): void {
    if (this.destroyed) return;
    const now = Date.now();
    if (now - this.lastWakeAttemptAt < 1500) return;
    this.lastWakeAttemptAt = now;
    logger.log('[P2P] Network connectivity restored — reconnecting');
    void this.reconnectNow(localPeerId).catch((err) => {
      logger.warn('[P2P] Online recovery failed:', err);
    });
  }

  private handleIncomingConnection(conn: DataConnection): void {
    conn.on('open', () => {
      const metadata = conn.metadata as { channelType?: string; peerInfo?: PeerId } | undefined;
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
      this.callbacks.onIncomingPeerConnected(conn, peerInfo);
    });
  }

  setupConnectionHandlers(conn: DataConnection, remotePeerId: string, isBulk: boolean = false): void {
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
        await this.callbacks.onEvent(remotePeerId, event);
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
      if (this.destroyed || this.tearingDown) {
        this.connections.delete(remotePeerId);
        return;
      }
      logger.log('[P2P] Connection closed:', remotePeerId);
      const entry = this.connections.get(remotePeerId);
      const disconnectedPeer = entry?.peerId;
      if (entry) {
        entry.status = 'offline';
        this.callbacks.onEmitEvent({ type: 'peer-left', payload: entry.peerId, timestamp: Date.now() });
      }
      this.connections.delete(remotePeerId);
      this.callbacks.onPeerDisconnected(remotePeerId, disconnectedPeer);
    });

    conn.on('error', (err) => {
      logger.error('[P2P] Connection error with', remotePeerId, ':', err);
      this.callbacks.onEmitEvent({
        type: 'error',
        payload: { message: `Connection lost with ${remotePeerId.slice(0, 8)}...`, level: 'warn' },
        timestamp: Date.now(),
      });
    });
  }

  sendToConnection(conn: DataConnection, event: P2PEvent): void {
    if (conn.open) {
      this.sendChunked(conn, JSON.stringify(event));
    }
  }

  sendChunked(conn: DataConnection, payload: string): void {
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
      frames.push(
        JSON.stringify({
          _chunkId: chunkId,
          _index: i,
          _total: totalChunks,
          _data: decoder.decode(slice),
        })
      );
    }

    this.drainFrames(conn, frames);
  }

  receiveChunk(peerId: string, raw: string): string | null {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }

    if (!this.isChunkFrame(parsed)) return raw;

    const MAX_CHUNKS_TOTAL = 1024;
    const MAX_CHUNK_DATA_CHARS = 65_536;
    const MAX_CONCURRENT_MESSAGES_PER_PEER = 32;

    if (
      !Number.isInteger(parsed._total) ||
      parsed._total < 1 ||
      parsed._total > MAX_CHUNKS_TOTAL ||
      !Number.isInteger(parsed._index) ||
      parsed._index < 0 ||
      parsed._index >= parsed._total ||
      parsed._chunkId.length === 0 ||
      parsed._chunkId.length > 128 ||
      parsed._data.length > MAX_CHUNK_DATA_CHARS
    ) {
      logger.warn('[P2P] Dropped malformed chunk frame from', peerId);
      return null;
    }

    if (!this.chunkBuffers.has(peerId)) {
      this.chunkBuffers.set(peerId, new Map());
    }
    const peerMap = this.chunkBuffers.get(peerId)!;

    if (!peerMap.has(parsed._chunkId)) {
      if (peerMap.size >= MAX_CONCURRENT_MESSAGES_PER_PEER) {
        const oldestKey = peerMap.keys().next().value;
        if (oldestKey !== undefined) peerMap.delete(oldestKey);
      }
      peerMap.set(parsed._chunkId, new Array(parsed._total).fill(null));
    }
    const chunks = peerMap.get(parsed._chunkId)!;
    if (chunks.length !== parsed._total) {
      peerMap.delete(parsed._chunkId);
      return null;
    }
    chunks[parsed._index] = parsed._data;

    if (chunks.every((chunk) => chunk !== null)) {
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
    const dc =
      (conn as PeerJsDataConnectionWithChannel)._dc ??
      (conn as PeerJsDataConnectionWithChannel).dataChannel;

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

  sendHeartbeats(): void {
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

  broadcast(event: P2PEvent, excludePeerId?: string): void {
    this.connections.forEach((entry, id) => {
      if (id !== excludePeerId && entry.conn?.open) {
        this.sendToConnection(entry.conn, event);
      }
    });
  }

  getOnlinePeers(): PeerId[] {
    const online = Array.from(this.connections.values())
      .filter((p) => p.status === 'online')
      .map((p) => p.peerId);
    return [this.callbacks.getLocalPeer(), ...online];
  }

  getDiagnostics(): ConnectionDiagnostics {
    const effective = getEffectiveNetworkConfig();
    const activeIce = this.options.iceServers ?? effective.iceServers ?? [];
    return {
      signalingState: this.signalingState,
      signalingEndpoint: describeSignalingEndpoint({
        signalingHost: this.options.signalingHost ?? effective.signalingHost,
        signalingPort: this.options.signalingPort ?? effective.signalingPort,
        signalingPath: this.options.signalingPath ?? effective.signalingPath,
        signalingSecure: this.options.signalingSecure ?? effective.signalingSecure,
      }),
      iceServerCount: activeIce.length,
      hasTurnRelay: hasTurnIceServer(activeIce),
      activePeerCount: this.connections.size,
      bulkChannelCount: this.bulkConnections.size,
      lastReconnectAt: this.lastReconnectAt,
      reconnectAttempts: this.reconnectAttempts,
      usingCustomSignaling: effective.usingCustomSignaling,
      usingCustomIceServers: effective.usingCustomIceServers,
    };
  }

  private teardownSocketOnly(): void {
    this.tearingDown = true;
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.connections.forEach((entry) => entry.conn?.close());
    this.connections.clear();
    this.bulkConnections.forEach((conn) => conn?.close());
    this.bulkConnections.clear();
    this.chunkBuffers.clear();
    this.hostConn = null;
    this.bulkHostConn = null;
    this.peer?.destroy();
    this.peer = null;
    this.tearingDown = false;
  }

  destroy(): void {
    this.destroyed = true;
    this.signalingState = 'disconnected';
    this.teardownSocketOnly();
  }
}
