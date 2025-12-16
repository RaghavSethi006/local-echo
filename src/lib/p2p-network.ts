// P2P Network Manager - WebRTC DataChannels implementation

import { 
  PeerId, 
  Message, 
  Server, 
  Channel, 
  PeerConnection, 
  P2PEvent, 
  SignalingMessage,
  InviteCode,
  ConnectionStatus,
  DirectMessage,
  DMConversation,
  DMConnectionInfo
} from '@/types/p2p';
import { generateId, generateKeyPair, KeyPair, deriveSharedKey, encrypt, decrypt, importPublicKey } from './crypto';

type EventCallback = (event: P2PEvent) => void;

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export class P2PNetwork {
  private localPeer: PeerId;
  private keyPair: KeyPair | null = null;
  private peers: Map<string, PeerConnection> = new Map();
  private servers: Map<string, Server> = new Map();
  private messages: Map<string, Message[]> = new Map();
  private eventListeners: Set<EventCallback> = new Set();
  private isHost: boolean = false;
  private hostId: string | null = null;
  private sequenceNumber: number = 0;
  private pendingIceCandidates: Map<string, RTCIceCandidate[]> = new Map();
  
  // DM specific state
  private dmConversations: Map<string, DMConversation> = new Map();
  private dmConnections: Map<string, DMConnectionInfo> = new Map();
  private dmSessionKeys: Map<string, CryptoKey> = new Map();

  constructor(username: string) {
    this.localPeer = {
      id: generateId(),
      username,
    };
  }

  async initialize(): Promise<void> {
    this.keyPair = await generateKeyPair();
    this.localPeer.publicKey = this.keyPair.publicKeyString;
    console.log('[P2P] Initialized with peer ID:', this.localPeer.id);
  }

  getLocalPeer(): PeerId {
    return this.localPeer;
  }

  isHostPeer(): boolean {
    return this.isHost;
  }

  getConnectionStatus(): ConnectionStatus {
    if (this.isHost) return 'host';
    if (this.peers.size > 0) return 'connected';
    return 'disconnected';
  }

  // Create a new server (becomes host)
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
    
    server.channels.forEach(channel => {
      this.messages.set(`${server.id}:${channel.id}`, []);
    });

    console.log('[P2P] Created server:', server.name);
    return server;
  }

  // Generate invite code for others to join
  async generateInvite(serverId: string): Promise<string> {
    const server = this.servers.get(serverId);
    if (!server) throw new Error('Server not found');

    const invite: InviteCode = {
      serverId: server.id,
      serverName: server.name,
      hostOffer: { type: 'offer', sdp: '' },
      hostId: this.localPeer,
      timestamp: Date.now(),
    };

    const inviteString = btoa(JSON.stringify(invite));
    return inviteString;
  }

  // Create offer for a new peer connection
  async createOffer(): Promise<{ offer: RTCSessionDescriptionInit; peerId: string }> {
    const peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    const tempPeerId = generateId();
    
    const dataChannel = peerConnection.createDataChannel('p2p-chat', {
      ordered: true,
    });
    
    this.setupDataChannel(dataChannel, tempPeerId);
    
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        const pending = this.pendingIceCandidates.get(tempPeerId) || [];
        pending.push(event.candidate);
        this.pendingIceCandidates.set(tempPeerId, pending);
      }
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    await new Promise<void>((resolve) => {
      if (peerConnection.iceGatheringState === 'complete') {
        resolve();
      } else {
        peerConnection.onicegatheringstatechange = () => {
          if (peerConnection.iceGatheringState === 'complete') {
            resolve();
          }
        };
      }
    });

    this.peers.set(tempPeerId, {
      peerId: { id: tempPeerId, username: 'pending' },
      connection: peerConnection,
      dataChannel,
      status: 'offline',
      lastSeen: Date.now(),
    });

    return { 
      offer: peerConnection.localDescription!, 
      peerId: tempPeerId 
    };
  }

  // Handle answer from joining peer
  async handleAnswer(
    peerId: string, 
    answer: RTCSessionDescriptionInit,
    remotePeerInfo: PeerId
  ): Promise<void> {
    const peer = this.peers.get(peerId);
    if (!peer) throw new Error('Peer connection not found');

    await peer.connection.setRemoteDescription(answer);
    
    peer.peerId = remotePeerInfo;
    peer.status = 'online';
    this.peers.set(peerId, peer);

    this.servers.forEach(server => {
      if (!server.members.find(m => m.id === remotePeerInfo.id)) {
        server.members.push(remotePeerInfo);
      }
    });

    this.emitEvent({
      type: 'peer-joined',
      payload: remotePeerInfo,
      timestamp: Date.now(),
    });

    console.log('[P2P] Peer connected:', remotePeerInfo.username);
  }

  // Join a server using invite code
  async joinServer(inviteCode: string): Promise<{ answer: RTCSessionDescriptionInit; localPeer: PeerId }> {
    const invite: InviteCode = JSON.parse(atob(inviteCode));
    
    const peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    
    peerConnection.ondatachannel = (event) => {
      this.setupDataChannel(event.channel, invite.hostId.id);
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        const pending = this.pendingIceCandidates.get(invite.hostId.id) || [];
        pending.push(event.candidate);
        this.pendingIceCandidates.set(invite.hostId.id, pending);
      }
    };

    await peerConnection.setRemoteDescription(invite.hostOffer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    await new Promise<void>((resolve) => {
      if (peerConnection.iceGatheringState === 'complete') {
        resolve();
      } else {
        peerConnection.onicegatheringstatechange = () => {
          if (peerConnection.iceGatheringState === 'complete') {
            resolve();
          }
        };
      }
    });

    this.peers.set(invite.hostId.id, {
      peerId: invite.hostId,
      connection: peerConnection,
      dataChannel: null,
      status: 'online',
      lastSeen: Date.now(),
    });

    const server: Server = {
      id: invite.serverId,
      name: invite.serverName,
      channels: [
        { id: 'general', name: 'general', type: 'text' },
        { id: 'random', name: 'random', type: 'text' },
      ],
      members: [invite.hostId, this.localPeer],
      hostId: invite.hostId.id,
      createdAt: invite.timestamp,
    };

    this.servers.set(server.id, server);
    this.hostId = invite.hostId.id;
    this.isHost = false;

    server.channels.forEach(channel => {
      this.messages.set(`${server.id}:${channel.id}`, []);
    });

    return { 
      answer: peerConnection.localDescription!, 
      localPeer: this.localPeer 
    };
  }

  private setupDataChannel(channel: RTCDataChannel, peerId: string): void {
    channel.onopen = () => {
      console.log('[P2P] Data channel opened with peer:', peerId);
      const peer = this.peers.get(peerId);
      if (peer) {
        peer.dataChannel = channel;
        peer.status = 'online';
        this.peers.set(peerId, peer);
      }

      if (!this.isHost) {
        this.sendToPeer(peerId, {
          type: 'sync-request',
          payload: { peerId: this.localPeer.id },
          timestamp: Date.now(),
        });
      }
    };

    channel.onmessage = (event) => {
      this.handleMessage(peerId, event.data);
    };

    channel.onclose = () => {
      console.log('[P2P] Data channel closed with peer:', peerId);
      const peer = this.peers.get(peerId);
      if (peer) {
        peer.status = 'offline';
        this.emitEvent({
          type: 'peer-left',
          payload: peer.peerId,
          timestamp: Date.now(),
        });

        if (peerId === this.hostId) {
          this.initiateHostMigration();
        }
      }
    };

    channel.onerror = (error) => {
      console.error('[P2P] Data channel error:', error);
    };
  }

  private handleMessage(fromPeerId: string, data: string): void {
    try {
      const event: P2PEvent = JSON.parse(data);
      console.log('[P2P] Received event:', event.type);

      switch (event.type) {
        case 'message':
          this.handleChatMessage(event.payload as Message);
          break;
        case 'sync-request':
          this.handleSyncRequest(fromPeerId);
          break;
        case 'sync-response':
          this.handleSyncResponse(event.payload);
          break;
        case 'peer-joined':
        case 'peer-left':
        case 'host-changed':
          this.emitEvent(event);
          break;
        // DM Events
        case 'dm-message':
          this.handleDMMessage(event.payload as DirectMessage, fromPeerId);
          break;
        case 'dm-typing':
          this.handleDMTyping(event.payload.peerId, event.payload.isTyping);
          break;
        case 'dm-read':
          this.handleDMRead(event.payload.peerId);
          break;
        case 'dm-connection-request':
          this.handleDMConnectionRequest(fromPeerId, event.payload);
          break;
        case 'dm-connection-response':
          this.handleDMConnectionResponse(fromPeerId, event.payload);
          break;
      }
    } catch (error) {
      console.error('[P2P] Error handling message:', error);
    }
  }

  private handleChatMessage(message: Message): void {
    const key = `${message.serverId}:${message.channelId}`;
    const channelMessages = this.messages.get(key) || [];
    
    if (!channelMessages.find(m => m.id === message.id)) {
      channelMessages.push(message);
      channelMessages.sort((a, b) => a.seq - b.seq);
      this.messages.set(key, channelMessages);

      this.emitEvent({
        type: 'message',
        payload: message,
        timestamp: Date.now(),
      });

      if (this.isHost) {
        this.broadcast({
          type: 'message',
          payload: message,
          timestamp: Date.now(),
        }, message.author.id);
      }
    }
  }

  private handleSyncRequest(fromPeerId: string): void {
    if (!this.isHost) return;

    const syncData = {
      servers: Array.from(this.servers.values()),
      messages: Object.fromEntries(this.messages),
      sequenceNumber: this.sequenceNumber,
    };

    this.sendToPeer(fromPeerId, {
      type: 'sync-response',
      payload: syncData,
      timestamp: Date.now(),
    });
  }

  private handleSyncResponse(payload: any): void {
    payload.servers?.forEach((server: Server) => {
      this.servers.set(server.id, server);
    });

    Object.entries(payload.messages || {}).forEach(([key, messages]) => {
      this.messages.set(key, messages as Message[]);
    });

    this.sequenceNumber = payload.sequenceNumber || 0;
    
    console.log('[P2P] Synced with host');
  }

  private initiateHostMigration(): void {
    const allPeerIds = [this.localPeer.id, ...Array.from(this.peers.keys())];
    const newHostId = allPeerIds.sort()[0];

    if (newHostId === this.localPeer.id) {
      this.isHost = true;
      this.hostId = this.localPeer.id;
      console.log('[P2P] This peer is now the host');

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
    }

    this.emitEvent({
      type: 'host-changed',
      payload: { newHostId },
      timestamp: Date.now(),
    });
  }

  // Send a chat message
  sendMessage(serverId: string, channelId: string, content: string): Message {
    const message: Message = {
      id: generateId(),
      serverId,
      channelId,
      author: this.localPeer,
      content,
      seq: ++this.sequenceNumber,
      timestamp: Date.now(),
    };

    const key = `${serverId}:${channelId}`;
    const channelMessages = this.messages.get(key) || [];
    channelMessages.push(message);
    this.messages.set(key, channelMessages);

    if (this.isHost) {
      this.broadcast({
        type: 'message',
        payload: message,
        timestamp: Date.now(),
      });
    } else if (this.hostId) {
      this.sendToPeer(this.hostId, {
        type: 'message',
        payload: message,
        timestamp: Date.now(),
      });
    }

    this.emitEvent({
      type: 'message',
      payload: message,
      timestamp: Date.now(),
    });

    return message;
  }

  // ==================== DM METHODS ====================

  // Initialize or get a DM conversation with a peer
  getOrCreateDMConversation(peer: PeerId): DMConversation {
    let conversation = this.dmConversations.get(peer.id);
    
    if (!conversation) {
      conversation = {
        peerId: peer,
        messages: [],
        unreadCount: 0,
        isTyping: false,
        connectionType: 'disconnected',
        lastSeen: Date.now(),
      };
      this.dmConversations.set(peer.id, conversation);
    }
    
    return conversation;
  }

  // Attempt to establish a direct DM connection
  async initiateDMConnection(peerId: string): Promise<void> {
    console.log('[P2P DM] Initiating DM connection to:', peerId);
    
    // Check if we already have a direct connection
    const existingConnection = this.dmConnections.get(peerId);
    if (existingConnection?.dataChannel?.readyState === 'open') {
      console.log('[P2P DM] Already have direct connection');
      return;
    }

    // Check if peer is reachable via server connection
    const peer = this.peers.get(peerId);
    if (!peer) {
      // Try to find peer through any server
      let foundPeer: PeerId | null = null;
      this.servers.forEach(server => {
        const member = server.members.find(m => m.id === peerId);
        if (member) foundPeer = member;
      });
      
      if (!foundPeer) {
        console.log('[P2P DM] Peer not found in any server');
        return;
      }
    }

    // Try to establish direct WebRTC connection for DMs
    try {
      const peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      const dataChannel = peerConnection.createDataChannel(`dm-${peerId}`, {
        ordered: true,
      });

      this.setupDMDataChannel(dataChannel, peerId);

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // Send ICE candidate through relay
          this.relayDMSignaling(peerId, {
            type: 'ice-candidate',
            candidate: event.candidate,
          });
        }
      };

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      // Wait for ICE gathering
      await new Promise<void>((resolve) => {
        if (peerConnection.iceGatheringState === 'complete') {
          resolve();
        } else {
          peerConnection.onicegatheringstatechange = () => {
            if (peerConnection.iceGatheringState === 'complete') {
              resolve();
            }
          };
        }
      });

      // Store pending connection
      this.dmConnections.set(peerId, {
        peerId,
        connection: peerConnection,
        dataChannel,
        connectionType: 'direct',
      });

      // Send offer through relay (via host or direct peer connection)
      this.relayDMSignaling(peerId, {
        type: 'dm-offer',
        offer: peerConnection.localDescription,
        from: this.localPeer,
      });

      console.log('[P2P DM] Sent DM connection offer');
    } catch (error) {
      console.error('[P2P DM] Failed to create direct connection:', error);
      // Fall back to relay mode
      this.setDMConnectionType(peerId, 'relay');
    }
  }

  private setupDMDataChannel(channel: RTCDataChannel, peerId: string): void {
    channel.onopen = () => {
      console.log('[P2P DM] Direct DM channel opened with:', peerId);
      this.setDMConnectionType(peerId, 'direct');
      
      const conn = this.dmConnections.get(peerId);
      if (conn) {
        conn.dataChannel = channel;
        this.dmConnections.set(peerId, conn);
      }
    };

    channel.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'dm-message') {
          this.handleDMMessage(data.payload, peerId);
        } else if (data.type === 'dm-typing') {
          this.handleDMTyping(peerId, data.payload.isTyping);
        }
      } catch (error) {
        console.error('[P2P DM] Error handling DM:', error);
      }
    };

    channel.onclose = () => {
      console.log('[P2P DM] DM channel closed with:', peerId);
      this.setDMConnectionType(peerId, 'relay');
    };
  }

  private setDMConnectionType(peerId: string, type: 'direct' | 'relay' | 'disconnected'): void {
    const conversation = this.dmConversations.get(peerId);
    if (conversation) {
      conversation.connectionType = type;
      this.dmConversations.set(peerId, conversation);
      
      this.emitEvent({
        type: 'dm-message',
        payload: { peerId, connectionType: type },
        timestamp: Date.now(),
      });
    }
  }

  private relayDMSignaling(toPeerId: string, payload: any): void {
    // First try direct peer connection
    const peer = this.peers.get(toPeerId);
    if (peer?.dataChannel?.readyState === 'open') {
      peer.dataChannel.send(JSON.stringify({
        type: 'dm-connection-request',
        payload,
        timestamp: Date.now(),
      }));
      return;
    }

    // Otherwise relay through host
    if (this.hostId && this.hostId !== this.localPeer.id) {
      this.sendToPeer(this.hostId, {
        type: 'dm-connection-request',
        payload: { ...payload, targetPeerId: toPeerId },
        timestamp: Date.now(),
      });
    }
  }

  private handleDMConnectionRequest(fromPeerId: string, payload: any): void {
    // If this is a relay request and we're host, forward it
    if (this.isHost && payload.targetPeerId && payload.targetPeerId !== this.localPeer.id) {
      const targetPeer = this.peers.get(payload.targetPeerId);
      if (targetPeer?.dataChannel?.readyState === 'open') {
        targetPeer.dataChannel.send(JSON.stringify({
          type: 'dm-connection-request',
          payload: { ...payload, from: fromPeerId },
          timestamp: Date.now(),
        }));
      }
      return;
    }

    // Handle the DM connection request
    if (payload.type === 'dm-offer') {
      this.handleDMOffer(payload.from || fromPeerId, payload.offer);
    }
  }

  private async handleDMOffer(fromPeerId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    console.log('[P2P DM] Received DM offer from:', fromPeerId);
    
    try {
      const peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      
      peerConnection.ondatachannel = (event) => {
        this.setupDMDataChannel(event.channel, fromPeerId);
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.relayDMSignaling(fromPeerId, {
            type: 'ice-candidate',
            candidate: event.candidate,
          });
        }
      };

      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      this.dmConnections.set(fromPeerId, {
        peerId: fromPeerId,
        connection: peerConnection,
        dataChannel: null,
        connectionType: 'direct',
      });

      this.relayDMSignaling(fromPeerId, {
        type: 'dm-answer',
        answer: peerConnection.localDescription,
        from: this.localPeer,
      });
    } catch (error) {
      console.error('[P2P DM] Failed to handle DM offer:', error);
    }
  }

  private handleDMConnectionResponse(fromPeerId: string, payload: any): void {
    if (payload.type === 'dm-answer') {
      this.handleDMAnswer(payload.from || fromPeerId, payload.answer);
    }
  }

  private async handleDMAnswer(fromPeerId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const conn = this.dmConnections.get(fromPeerId);
    if (conn?.connection) {
      await conn.connection.setRemoteDescription(answer);
      console.log('[P2P DM] DM connection established with:', fromPeerId);
    }
  }

  // Send a direct message
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
    const conversation = this.getOrCreateDMConversation(toPeer);
    conversation.messages.push(dm);
    conversation.lastMessage = dm;
    this.dmConversations.set(toPeerId, conversation);

    // Try direct channel first
    const dmConn = this.dmConnections.get(toPeerId);
    if (dmConn?.dataChannel?.readyState === 'open') {
      dmConn.dataChannel.send(JSON.stringify({
        type: 'dm-message',
        payload: dm,
      }));
      console.log('[P2P DM] Sent via direct channel');
    } else {
      // Fall back to relay through server connection
      const peer = this.peers.get(toPeerId);
      if (peer?.dataChannel?.readyState === 'open') {
        peer.dataChannel.send(JSON.stringify({
          type: 'dm-message',
          payload: dm,
          timestamp: Date.now(),
        }));
        console.log('[P2P DM] Sent via relay');
      } else if (this.hostId) {
        // Relay through host
        this.sendToPeer(this.hostId, {
          type: 'dm-message',
          payload: { ...dm, targetPeerId: toPeerId },
          timestamp: Date.now(),
        });
        console.log('[P2P DM] Sent via host relay');
      }
    }

    this.emitEvent({
      type: 'dm-message',
      payload: dm,
      timestamp: Date.now(),
    });

    return dm;
  }

  // Handle incoming DM
  private handleDMMessage(dm: DirectMessage, fromPeerId: string): void {
    // If we're host and this is a relay request
    if (this.isHost && (dm as any).targetPeerId && (dm as any).targetPeerId !== this.localPeer.id) {
      const targetPeer = this.peers.get((dm as any).targetPeerId);
      if (targetPeer?.dataChannel?.readyState === 'open') {
        targetPeer.dataChannel.send(JSON.stringify({
          type: 'dm-message',
          payload: dm,
          timestamp: Date.now(),
        }));
      }
      return;
    }

    // Store the message
    const conversation = this.getOrCreateDMConversation(dm.from);
    
    if (!conversation.messages.find(m => m.id === dm.id)) {
      conversation.messages.push(dm);
      conversation.lastMessage = dm;
      conversation.unreadCount++;
      this.dmConversations.set(dm.from.id, conversation);

      this.emitEvent({
        type: 'dm-message',
        payload: dm,
        timestamp: Date.now(),
      });
    }
  }

  // Send typing indicator
  sendDMTyping(toPeerId: string, isTyping: boolean): void {
    const dmConn = this.dmConnections.get(toPeerId);
    if (dmConn?.dataChannel?.readyState === 'open') {
      dmConn.dataChannel.send(JSON.stringify({
        type: 'dm-typing',
        payload: { isTyping },
      }));
    } else {
      // Relay
      const peer = this.peers.get(toPeerId);
      if (peer?.dataChannel?.readyState === 'open') {
        peer.dataChannel.send(JSON.stringify({
          type: 'dm-typing',
          payload: { peerId: this.localPeer.id, isTyping },
          timestamp: Date.now(),
        }));
      }
    }
  }

  private handleDMTyping(peerId: string, isTyping: boolean): void {
    const conversation = this.dmConversations.get(peerId);
    if (conversation) {
      conversation.isTyping = isTyping;
      this.dmConversations.set(peerId, conversation);
      
      this.emitEvent({
        type: 'dm-typing',
        payload: { peerId, isTyping },
        timestamp: Date.now(),
      });
    }
  }

  // Mark DM as read
  markDMAsRead(peerId: string): void {
    const conversation = this.dmConversations.get(peerId);
    if (conversation) {
      conversation.unreadCount = 0;
      this.dmConversations.set(peerId, conversation);

      // Notify the other peer
      const dmConn = this.dmConnections.get(peerId);
      if (dmConn?.dataChannel?.readyState === 'open') {
        dmConn.dataChannel.send(JSON.stringify({
          type: 'dm-read',
          payload: { peerId: this.localPeer.id },
        }));
      }
    }
  }

  private handleDMRead(peerId: string): void {
    this.emitEvent({
      type: 'dm-read',
      payload: { peerId },
      timestamp: Date.now(),
    });
  }

  // Find peer by ID across all sources
  private findPeerById(peerId: string): PeerId | null {
    // Check connected peers
    const peer = this.peers.get(peerId);
    if (peer) return peer.peerId;

    // Check server members
    for (const server of this.servers.values()) {
      const member = server.members.find(m => m.id === peerId);
      if (member) return member;
    }

    // Check DM conversations
    const conv = this.dmConversations.get(peerId);
    if (conv) return conv.peerId;

    return null;
  }

  // Get all available peers for DM (from all servers)
  getAvailablePeersForDM(): PeerId[] {
    const peersMap = new Map<string, PeerId>();
    
    // Add all server members except self
    this.servers.forEach(server => {
      server.members.forEach(member => {
        if (member.id !== this.localPeer.id) {
          peersMap.set(member.id, member);
        }
      });
    });

    return Array.from(peersMap.values());
  }

  // Get DM conversations list
  getDMConversations(): DMConversation[] {
    return Array.from(this.dmConversations.values())
      .sort((a, b) => (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0));
  }

  // Get messages for a specific DM
  getDMMessages(peerId: string): DirectMessage[] {
    return this.dmConversations.get(peerId)?.messages || [];
  }

  // ==================== END DM METHODS ====================

  private sendToPeer(peerId: string, event: P2PEvent): void {
    const peer = this.peers.get(peerId);
    if (peer?.dataChannel?.readyState === 'open') {
      peer.dataChannel.send(JSON.stringify(event));
    }
  }

  private broadcast(event: P2PEvent, excludePeerId?: string): void {
    this.peers.forEach((peer, peerId) => {
      if (peerId !== excludePeerId && peer.dataChannel?.readyState === 'open') {
        peer.dataChannel.send(JSON.stringify(event));
      }
    });
  }

  // Event system
  addEventListener(callback: EventCallback): () => void {
    this.eventListeners.add(callback);
    return () => this.eventListeners.delete(callback);
  }

  private emitEvent(event: P2PEvent): void {
    this.eventListeners.forEach(callback => callback(event));
  }

  // Getters
  getServers(): Server[] {
    return Array.from(this.servers.values());
  }

  getServer(id: string): Server | undefined {
    return this.servers.get(id);
  }

  getMessages(serverId: string, channelId: string): Message[] {
    return this.messages.get(`${serverId}:${channelId}`) || [];
  }

  getPeers(): PeerConnection[] {
    return Array.from(this.peers.values());
  }

  getOnlinePeers(): PeerId[] {
    const online = Array.from(this.peers.values())
      .filter(p => p.status === 'online')
      .map(p => p.peerId);
    return [this.localPeer, ...online];
  }

  // Cleanup
  disconnect(): void {
    // Close DM connections
    this.dmConnections.forEach(conn => {
      conn.dataChannel?.close();
      conn.connection?.close();
    });
    this.dmConnections.clear();
    this.dmConversations.clear();

    // Close server connections
    this.peers.forEach(peer => {
      peer.dataChannel?.close();
      peer.connection.close();
    });
    this.peers.clear();
    this.servers.clear();
    this.messages.clear();
    this.isHost = false;
    this.hostId = null;
  }
}
