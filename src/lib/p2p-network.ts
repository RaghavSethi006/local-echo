// P2P Network Manager - PeerJS-based WebRTC implementation
// PeerJS handles signaling automatically via its open-source signaling server.
// All actual data flows peer-to-peer through WebRTC DataChannels.

import Peer, { DataConnection } from 'peerjs';
import { 
  PeerId, 
  Message, 
  Server, 
  Channel, 
  PeerConnection, 
  P2PEvent, 
  ConnectionStatus,
  DirectMessage,
  DMConversation,
} from '@/types/p2p';
import { generateId, generateKeyPair, KeyPair } from './crypto';
import * as Storage from './storage';

type EventCallback = (event: P2PEvent) => void;

interface PeerEntry {
  peerId: PeerId;
  conn: DataConnection;
  status: 'online' | 'offline';
  lastSeen: number;
}

export class P2PNetwork {
  private localPeer: PeerId;
  private keyPair: KeyPair | null = null;
  private peer: Peer | null = null;
  private connections: Map<string, PeerEntry> = new Map();
  private servers: Map<string, Server> = new Map();
  private messages: Map<string, Message[]> = new Map();
  private eventListeners: Set<EventCallback> = new Set();
  private isHost: boolean = false;
  private hostId: string | null = null;
  private hostConn: DataConnection | null = null;
  private sequenceNumber: number = 0;

  // DM state
  private dmConversations: Map<string, DMConversation> = new Map();
  
  // Persistence flags
  private persistenceReady: boolean = false;
  private pendingSaves: Set<string> = new Set();
  private saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(username: string, existingId?: string) {
    this.localPeer = {
      id: existingId || generateId(),
      username,
    };
  }

  async initialize(): Promise<void> {
    this.keyPair = await generateKeyPair();
    this.localPeer.publicKey = this.keyPair.publicKeyString;

    return new Promise((resolve, reject) => {
      // Use the local peer id as PeerJS id for addressability
      this.peer = new Peer(this.localPeer.id, {
        debug: 1,
      });

      this.peer.on('open', (id) => {
        console.log('[P2P] PeerJS ready with ID:', id);
        resolve();
      });

      this.peer.on('connection', (conn) => {
        console.log('[P2P] Incoming connection from:', conn.peer);
        this.handleIncomingConnection(conn);
      });

      this.peer.on('error', (err) => {
        console.error('[P2P] PeerJS error:', err);
        // Don't reject after initial open
      });

      this.peer.on('disconnected', () => {
        console.log('[P2P] Disconnected from signaling server, attempting reconnect...');
        this.peer?.reconnect();
      });

      // Timeout
      setTimeout(() => reject(new Error('PeerJS initialization timeout')), 15000);
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

  async createServer(name: string): Promise<Server> {
    const server: Server = {
      id: generateId(),
      name,
      channels: [
        { id: 'general', name: 'general', type: 'text', description: 'General chat' },
        { id: 'random', name: 'random', type: 'text', description: 'Off-topic discussions' },
      ],
      members: [this.localPeer],
      hostId: this.localPeer.id,
      createdAt: Date.now(),
    };

    this.servers.set(server.id, server);
    this.isHost = true;
    this.hostId = this.localPeer.id;

    server.channels.forEach(ch => {
      this.messages.set(`${server.id}:${ch.id}`, []);
    });

    console.log('[P2P] Created server:', server.name, '| Host peer ID:', this.localPeer.id);
    this.scheduleSave('servers');
    return server;
  }

  // Invite code encodes the host's PeerJS ID + server info
  async generateInvite(serverId: string): Promise<string> {
    const server = this.servers.get(serverId);
    if (!server) throw new Error('Server not found');

    const invite = {
      serverId: server.id,
      serverName: server.name,
      hostPeerId: this.localPeer.id,
      hostUsername: this.localPeer.username,
      timestamp: Date.now(),
    };
    return btoa(JSON.stringify(invite));
  }

  // Join server by connecting to the host's PeerJS ID
  async joinServer(inviteCode: string): Promise<Server> {
    const invite = JSON.parse(atob(inviteCode));
    console.log('[P2P] Joining server:', invite.serverName, 'via host:', invite.hostPeerId);

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
        console.log('[P2P] Connected to host:', invite.hostPeerId);

        this.hostConn = conn;
        this.hostId = invite.hostPeerId;
        this.isHost = false;

        this.connections.set(invite.hostPeerId, {
          peerId: hostPeer,
          conn,
          status: 'online',
          lastSeen: Date.now(),
        });

        // Set up data handling
        this.setupConnectionHandlers(conn, invite.hostPeerId);

        // Create local server representation
        const server: Server = {
          id: invite.serverId,
          name: invite.serverName,
          channels: [
            { id: 'general', name: 'general', type: 'text', description: 'General chat' },
            { id: 'random', name: 'random', type: 'text', description: 'Off-topic discussions' },
          ],
          members: [hostPeer, this.localPeer],
          hostId: invite.hostPeerId,
          createdAt: invite.timestamp,
        };

        this.servers.set(server.id, server);
        this.scheduleSave('servers');
        server.channels.forEach(ch => {
          this.messages.set(`${server.id}:${ch.id}`, []);
        });

        // Request sync from host
        this.sendToConnection(conn, {
          type: 'sync-request',
          payload: { peerInfo: this.localPeer },
          timestamp: Date.now(),
        });

        // Also offer our local history (cloudless async sync)
        this.sendHistoryOffer(conn);

        this.emitEvent({ type: 'peer-joined', payload: hostPeer, timestamp: Date.now() });
        resolve(server);
      });

      conn.on('error', (err) => {
        clearTimeout(timeout);
        console.error('[P2P] Connection error:', err);
        reject(err);
      });
    });
  }

  // ==================== CONNECTION HANDLING ====================

  private handleIncomingConnection(conn: DataConnection): void {
    conn.on('open', () => {
      const metadata = conn.metadata;
      const peerInfo: PeerId = metadata?.peerInfo || { id: conn.peer, username: 'Unknown' };
      
      console.log('[P2P] Connection opened from:', peerInfo.username, '(', conn.peer, ')');

      this.connections.set(conn.peer, {
        peerId: peerInfo,
        conn,
        status: 'online',
        lastSeen: Date.now(),
      });

      this.setupConnectionHandlers(conn, conn.peer);

      // Add to all servers as member
      if (this.isHost) {
        this.servers.forEach(server => {
          if (!server.members.find(m => m.id === peerInfo.id)) {
            server.members.push(peerInfo);
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
        } as any);
      }

      this.emitEvent({ type: 'peer-joined', payload: peerInfo, timestamp: Date.now() });

      // Always send a history offer for cloudless async sync
      this.sendHistoryOffer(conn);
    });
  }

  private setupConnectionHandlers(conn: DataConnection, remotePeerId: string): void {
    conn.on('data', (data: unknown) => {
      try {
        const event = (typeof data === 'string' ? JSON.parse(data) : data) as P2PEvent;
        this.handleEvent(remotePeerId, event);
      } catch (err) {
        console.error('[P2P] Error handling data:', err);
      }
    });

    conn.on('close', () => {
      console.log('[P2P] Connection closed:', remotePeerId);
      const entry = this.connections.get(remotePeerId);
      if (entry) {
        entry.status = 'offline';
        this.emitEvent({ type: 'peer-left', payload: entry.peerId, timestamp: Date.now() });
      }
      this.connections.delete(remotePeerId);

      // Host migration if the host left
      if (remotePeerId === this.hostId && !this.isHost) {
        this.initiateHostMigration();
      }
    });

    conn.on('error', (err) => {
      console.error('[P2P] Connection error with', remotePeerId, ':', err);
    });
  }

  // ==================== EVENT HANDLING ====================

  private handleEvent(fromPeerId: string, event: P2PEvent): void {
    console.log('[P2P] Event from', fromPeerId, ':', event.type);

    switch (event.type) {
      case 'message':
        this.handleChatMessage(event.payload as Message, fromPeerId);
        break;
      case 'sync-request':
        this.handleSyncRequest(fromPeerId, event.payload);
        break;
      case 'sync-response':
        this.handleSyncResponse(event.payload);
        break;
      case 'peer-joined':
      case 'peer-left':
      case 'host-changed':
        this.emitEvent(event);
        break;
      case 'dm-message':
        this.handleDMMessage(event.payload as DirectMessage, fromPeerId);
        break;
      case 'dm-typing':
        this.handleDMTyping(event.payload.peerId || fromPeerId, event.payload.isTyping);
        break;
      case 'dm-read':
        this.emitEvent(event);
        break;
      default:
        // Handle history merge messages (cloudless async sync)
        if ((event as any).type === 'history-offer') {
          this.handleHistoryOffer(fromPeerId, event.payload);
          return;
        }
        if ((event as any).type === 'history-merge') {
          this.handleHistoryMerge(event.payload);
          return;
        }
        // Handle peer-list for new joiners
        if ((event as any).type === 'peer-list') {
          const peers = (event.payload as any).peers as PeerId[];
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
        }
        break;
    }
  }

  private handleChatMessage(message: Message, fromPeerId: string): void {
    const key = `${message.serverId}:${message.channelId}`;
    const channelMessages = this.messages.get(key) || [];

    if (!channelMessages.find(m => m.id === message.id)) {
      // If host, assign sequence number
      if (this.isHost && !message.seq) {
        message.seq = ++this.sequenceNumber;
      }

      channelMessages.push(message);
      channelMessages.sort((a, b) => a.seq - b.seq);
      this.messages.set(key, channelMessages);
      this.scheduleSave('messages');

      this.emitEvent({ type: 'message', payload: message, timestamp: Date.now() });

      // Host broadcasts to all other peers
      if (this.isHost) {
        this.broadcast({
          type: 'message',
          payload: message,
          timestamp: Date.now(),
        }, fromPeerId);
      }
    }
  }

  private handleSyncRequest(fromPeerId: string, payload: any): void {
    if (!this.isHost) return;

    // Update peer info
    if (payload.peerInfo) {
      const entry = this.connections.get(fromPeerId);
      if (entry) {
        entry.peerId = payload.peerInfo;
        this.connections.set(fromPeerId, entry);
      }
    }

    // Send full state
    const allMessages: Record<string, Message[]> = {};
    this.messages.forEach((msgs, key) => {
      allMessages[key] = msgs;
    });

    const entry = this.connections.get(fromPeerId);
    if (entry) {
      this.sendToConnection(entry.conn, {
        type: 'sync-response',
        payload: {
          servers: Array.from(this.servers.values()),
          messages: allMessages,
          sequenceNumber: this.sequenceNumber,
          onlinePeers: this.getOnlinePeers(),
        },
        timestamp: Date.now(),
      });
    }
  }

  private handleSyncResponse(payload: any): void {
    // Merge servers
    payload.servers?.forEach((server: Server) => {
      const existing = this.servers.get(server.id);
      if (existing) {
        // Merge members
        server.members.forEach(m => {
          if (!existing.members.find(em => em.id === m.id)) {
            existing.members.push(m);
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
        this.servers.set(server.id, server);
      }
    });

    // Merge messages
    if (payload.messages) {
      Object.entries(payload.messages).forEach(([key, msgs]) => {
        const existing = this.messages.get(key) || [];
        const newMsgs = msgs as Message[];
        newMsgs.forEach(m => {
          if (!existing.find(e => e.id === m.id)) {
            existing.push(m);
          }
        });
        existing.sort((a, b) => a.seq - b.seq);
        this.messages.set(key, existing);
      });
    }

    this.sequenceNumber = Math.max(this.sequenceNumber, payload.sequenceNumber || 0);
    console.log('[P2P] Synced with host, seq:', this.sequenceNumber);
    this.scheduleSave('servers');
    this.scheduleSave('messages');
    
    // Emit to refresh UI
    this.emitEvent({ type: 'sync-response' as any, payload: null, timestamp: Date.now() });
  }

  // ==================== MESSAGING ====================

  sendMessage(serverId: string, channelId: string, content: string): Message {
    const message: Message = {
      id: generateId(),
      serverId,
      channelId,
      author: this.localPeer,
      content,
      seq: this.isHost ? ++this.sequenceNumber : Date.now(), // Host assigns proper seq
      timestamp: Date.now(),
    };

    // Store locally
    const key = `${serverId}:${channelId}`;
    const channelMessages = this.messages.get(key) || [];
    channelMessages.push(message);
    this.messages.set(key, channelMessages);
    this.scheduleSave('messages');

    // Send
    if (this.isHost) {
      this.broadcast({ type: 'message', payload: message, timestamp: Date.now() });
    } else if (this.hostConn?.open) {
      this.sendToConnection(this.hostConn, {
        type: 'message',
        payload: message,
        timestamp: Date.now(),
      });
    }

    this.emitEvent({ type: 'message', payload: message, timestamp: Date.now() });
    return message;
  }

  // ==================== HOST MIGRATION ====================

  private initiateHostMigration(): void {
    const candidates = [this.localPeer.id, ...Array.from(this.connections.keys())
      .filter(id => this.connections.get(id)?.status === 'online')];
    
    candidates.sort();
    const newHostId = candidates[0];

    console.log('[P2P] Host migration → new host:', newHostId);

    if (newHostId === this.localPeer.id) {
      this.isHost = true;
      this.hostId = this.localPeer.id;
      this.hostConn = null;

      this.servers.forEach(server => {
        server.hostId = this.localPeer.id;
      });

      this.broadcast({
        type: 'host-changed',
        payload: this.localPeer,
        timestamp: Date.now(),
      });
    } else {
      this.hostId = newHostId;
      const entry = this.connections.get(newHostId);
      if (entry) {
        this.hostConn = entry.conn;
      }
    }

    this.emitEvent({
      type: 'host-changed',
      payload: { newHostId },
      timestamp: Date.now(),
    });
  }

  // ==================== DM METHODS ====================

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
          console.log('[P2P DM] Direct connection to:', peerId);
          this.connections.set(peerId, {
            peerId: this.findPeerById(peerId) || { id: peerId, username: 'Unknown' },
            conn,
            status: 'online',
            lastSeen: Date.now(),
          });
          this.setupConnectionHandlers(conn, peerId);
          this.setDMConnectionType(peerId, 'direct');
          this.sendHistoryOffer(conn);
        });

        conn.on('error', () => {
          console.log('[P2P DM] Direct connection failed, using relay');
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
    const toPeer = this.findPeerById(toPeerId);
    if (!toPeer) throw new Error('Peer not found');

    const dm: DirectMessage = {
      id: generateId(),
      type: 'DM',
      from: this.localPeer,
      to: toPeer,
      content,
      timestamp: Date.now(),
      encrypted: true,
    };

    // Store locally
    const conv = this.getOrCreateDMConversation(toPeer);
    conv.messages.push(dm);
    conv.lastMessage = dm;
    this.dmConversations.set(toPeerId, conv);
    this.scheduleSave('dms');

    // Send - try direct connection first, then relay through host
    const entry = this.connections.get(toPeerId);
    if (entry?.conn?.open) {
      this.sendToConnection(entry.conn, { type: 'dm-message', payload: dm, timestamp: Date.now() });
    } else if (this.hostConn?.open) {
      // Relay through host (host treats as opaque)
      this.sendToConnection(this.hostConn, {
        type: 'dm-message',
        payload: { ...dm, _relayTo: toPeerId },
        timestamp: Date.now(),
      });
    }

    this.emitEvent({ type: 'dm-message', payload: dm, timestamp: Date.now() });
    return dm;
  }

  private handleDMMessage(dm: DirectMessage, fromPeerId: string): void {
    // Host relay logic - forward without inspecting content
    if (this.isHost && (dm as any)._relayTo && (dm as any)._relayTo !== this.localPeer.id) {
      const target = this.connections.get((dm as any)._relayTo);
      if (target?.conn?.open) {
        const { _relayTo, ...cleanDm } = dm as any;
        this.sendToConnection(target.conn, { type: 'dm-message', payload: cleanDm, timestamp: Date.now() });
      }
      return;
    }

    // Store the message
    const conv = this.getOrCreateDMConversation(dm.from);
    if (!conv.messages.find(m => m.id === dm.id)) {
      conv.messages.push(dm);
      conv.lastMessage = dm;
      conv.unreadCount++;
      this.dmConversations.set(dm.from.id, conv);
      this.scheduleSave('dms');
      this.emitEvent({ type: 'dm-message', payload: dm, timestamp: Date.now() });
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

  // ==================== HISTORY MERGE (Cloudless Async Sync) ====================
  // When two peers reconnect after being offline, they exchange message history
  // for any channels/DMs they share, dedupe by message id, and rebuild a unified
  // timeline. This lets messages propagate even when peers were never online together.

  private sendHistoryOffer(conn: DataConnection): void {
    const channelSummaries: Record<string, string[]> = {};
    this.messages.forEach((msgs, key) => {
      if (msgs.length > 0) channelSummaries[key] = msgs.map(m => m.id);
    });

    const dmSummaries: Record<string, string[]> = {};
    this.dmConversations.forEach((conv, peerId) => {
      if (conv.messages.length > 0) dmSummaries[peerId] = conv.messages.map(m => m.id);
    });

    this.sendToConnection(conn, {
      type: 'history-offer' as any,
      payload: { channels: channelSummaries, dms: dmSummaries, from: this.localPeer },
      timestamp: Date.now(),
    });
  }

  private handleHistoryOffer(fromPeerId: string, payload: any): void {
    const toSend: { channels: Record<string, Message[]>; dms: Record<string, DirectMessage[]> } = {
      channels: {},
      dms: {},
    };
    const toRequest: { channels: Record<string, string[]>; dms: Record<string, string[]> } = {
      channels: {},
      dms: {},
    };

    const theirChannels: Record<string, string[]> = payload.channels || {};
    Object.keys(theirChannels).forEach(key => {
      const ours = this.messages.get(key) || [];
      const theirIds = new Set(theirChannels[key]);
      const ourIds = new Set(ours.map(m => m.id));
      const missingForThem = ours.filter(m => !theirIds.has(m.id));
      if (missingForThem.length > 0) toSend.channels[key] = missingForThem;
      const missingForUs = theirChannels[key].filter(id => !ourIds.has(id));
      if (missingForUs.length > 0) toRequest.channels[key] = missingForUs;
    });

    // Offer channels we have that they didn't list
    this.messages.forEach((msgs, key) => {
      if (!(key in theirChannels) && msgs.length > 0) {
        toSend.channels[key] = msgs;
      }
    });

    // DMs - the conversation between us is keyed by the *other* peer's id on each side
    const theirDms: Record<string, string[]> = payload.dms || {};
    const ourDmKey = fromPeerId;
    const theirDmKey = this.localPeer.id;
    const ourDm = this.dmConversations.get(ourDmKey);
    const theirIds = new Set(theirDms[theirDmKey] || []);
    if (ourDm && ourDm.messages.length > 0) {
      const missingForThem = ourDm.messages.filter(m => !theirIds.has(m.id));
      if (missingForThem.length > 0) toSend.dms[theirDmKey] = missingForThem;
    }
    const ourIds = new Set((ourDm?.messages || []).map(m => m.id));
    const missingForUs = (theirDms[theirDmKey] || []).filter(id => !ourIds.has(id));
    if (missingForUs.length > 0) toRequest.dms[ourDmKey] = missingForUs;

    const conn = this.connections.get(fromPeerId)?.conn;
    if (!conn) return;

    if (
      Object.keys(toSend.channels).length > 0 ||
      Object.keys(toSend.dms).length > 0 ||
      Object.keys(toRequest.channels).length > 0 ||
      Object.keys(toRequest.dms).length > 0
    ) {
      console.log('[P2P History] Merge with', fromPeerId, '— sending channels:',
        Object.keys(toSend.channels).length, 'dms:', Object.keys(toSend.dms).length);
      this.sendToConnection(conn, {
        type: 'history-merge' as any,
        payload: { send: toSend, request: toRequest, from: this.localPeer },
        timestamp: Date.now(),
      });
    }
  }

  private handleHistoryMerge(payload: any): void {
    const incoming = payload.send || { channels: {}, dms: {} };
    let added = 0;

    Object.entries(incoming.channels || {}).forEach(([key, msgs]) => {
      const existing = this.messages.get(key) || [];
      const existingIds = new Set(existing.map(m => m.id));
      (msgs as Message[]).forEach(m => {
        if (!existingIds.has(m.id)) {
          existing.push(m);
          existingIds.add(m.id);
          added++;
          if (m.seq && m.seq > this.sequenceNumber) this.sequenceNumber = m.seq;
        }
      });
      existing.sort((a, b) => (a.seq || a.timestamp) - (b.seq || b.timestamp));
      this.messages.set(key, existing);
    });

    Object.entries(incoming.dms || {}).forEach(([_peerKey, msgs]) => {
      const otherPeer: PeerId = payload.from || { id: _peerKey, username: 'Unknown' };
      const otherPeerId = otherPeer.id;
      const conv = this.getOrCreateDMConversation(otherPeer);
      const existingIds = new Set(conv.messages.map(m => m.id));
      (msgs as DirectMessage[]).forEach(m => {
        if (!existingIds.has(m.id)) {
          conv.messages.push(m);
          existingIds.add(m.id);
          added++;
        }
      });
      conv.messages.sort((a, b) => a.timestamp - b.timestamp);
      conv.lastMessage = conv.messages[conv.messages.length - 1];
      this.dmConversations.set(otherPeerId, conv);
    });

    if (added > 0) {
      console.log('[P2P History] Merged', added, 'new messages from peer history');
      this.scheduleSave('messages');
      this.scheduleSave('dms');
      this.emitEvent({ type: 'sync-response' as any, payload: { merged: added }, timestamp: Date.now() });
      this.emitEvent({ type: 'dm-message', payload: { merged: added }, timestamp: Date.now() });
    }

    // Honor the request portion: send back messages they asked for
    const request = payload.request || { channels: {}, dms: {} };
    const fromPeerId = payload.from?.id;
    if (!fromPeerId) return;
    const conn = this.connections.get(fromPeerId)?.conn;
    if (!conn) return;

    const replySend: { channels: Record<string, Message[]>; dms: Record<string, DirectMessage[]> } = {
      channels: {},
      dms: {},
    };
    Object.entries(request.channels || {}).forEach(([key, ids]) => {
      const ours = this.messages.get(key) || [];
      const wanted = new Set(ids as string[]);
      const matches = ours.filter(m => wanted.has(m.id));
      if (matches.length > 0) replySend.channels[key] = matches;
    });
    Object.entries(request.dms || {}).forEach(([_key, ids]) => {
      const conv = this.dmConversations.get(fromPeerId);
      if (!conv) return;
      const wanted = new Set(ids as string[]);
      const matches = conv.messages.filter(m => wanted.has(m.id));
      if (matches.length > 0) replySend.dms[this.localPeer.id] = matches;
    });

    if (Object.keys(replySend.channels).length > 0 || Object.keys(replySend.dms).length > 0) {
      this.sendToConnection(conn, {
        type: 'history-merge' as any,
        payload: { send: replySend, request: { channels: {}, dms: {} }, from: this.localPeer },
        timestamp: Date.now(),
      });
    }
  }

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
      conn.send(JSON.stringify(event));
    }
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

  disconnect(): void {
    this.connections.forEach(entry => {
      entry.conn?.close();
    });
    this.connections.clear();
    this.peer?.destroy();
    this.peer = null;
    this.servers.clear();
    this.messages.clear();
    this.dmConversations.clear();
    this.isHost = false;
    this.hostId = null;
    this.hostConn = null;
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
        promises.push(Storage.saveIdentity({
          peerId: this.localPeer.id,
          username: this.localPeer.username,
          publicKey: this.localPeer.publicKey,
        }));
      }

      if (saves.has('servers')) {
        for (const server of this.servers.values()) {
          promises.push(Storage.saveServer({
            id: server.id,
            name: server.name,
            channels: server.channels,
            hostId: server.hostId,
            createdAt: server.createdAt,
            lastHostPeerId: server.hostId,
          }));
        }
      }

      if (saves.has('messages')) {
        for (const [key, msgs] of this.messages.entries()) {
          if (msgs.length > 0) {
            promises.push(Storage.saveMessages(msgs));
          }
        }
      }

      if (saves.has('dms')) {
        for (const [peerId, conv] of this.dmConversations.entries()) {
          promises.push(Storage.saveDMConversation({
            peerId: conv.peerId.id,
            peerUsername: conv.peerId.username,
            peerPublicKey: conv.peerId.publicKey,
            messages: [],
            lastSeen: conv.lastSeen,
          }));
          if (conv.messages.length > 0) {
            const msgsWithLocal = conv.messages.map(m => ({ ...m, _localPeerId: this.localPeer.id }));
            promises.push(Storage.saveDMMessages(msgsWithLocal));
          }
        }
      }

      await Promise.all(promises);
    } catch (err) {
      console.error('[P2P] Persistence error:', err);
    }
  }

  // Load persisted data into memory
  async loadPersistedData(): Promise<void> {
    try {
      // Load servers
      const storedServers = await Storage.loadServers();
      for (const s of storedServers) {
        if (!this.servers.has(s.id)) {
          this.servers.set(s.id, {
            id: s.id,
            name: s.name,
            channels: s.channels.length > 0 ? s.channels : [
              { id: 'general', name: 'general', type: 'text', description: 'General chat' },
              { id: 'random', name: 'random', type: 'text', description: 'Off-topic discussions' },
            ],
            members: [this.localPeer],
            hostId: s.hostId,
            createdAt: s.createdAt,
          });
        }
      }

      // Load all messages
      const storedMsgs = await Storage.loadAllMessages();
      for (const msg of storedMsgs) {
        const key = `${msg.serverId}:${msg.channelId}`;
        const existing = this.messages.get(key) || [];
        if (!existing.find(m => m.id === msg.id)) {
          existing.push(msg);
        }
        existing.sort((a, b) => a.seq - b.seq);
        this.messages.set(key, existing);
        
        // Track max sequence number
        if (msg.seq > this.sequenceNumber) {
          this.sequenceNumber = msg.seq;
        }
      }

      // Load DM conversations
      const storedConvs = await Storage.loadDMConversations();
      for (const c of storedConvs) {
        if (!this.dmConversations.has(c.peerId)) {
          const dmMsgs = await Storage.loadDMMessages(c.peerId);
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
      }

      this.persistenceReady = true;
      console.log('[P2P] Loaded persisted data:', storedServers.length, 'servers,', storedMsgs.length, 'messages,', storedConvs.length, 'DM conversations');
    } catch (err) {
      console.error('[P2P] Error loading persisted data:', err);
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
