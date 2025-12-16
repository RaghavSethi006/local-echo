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
  ConnectionStatus 
} from '@/types/p2p';
import { generateId, generateKeyPair, KeyPair } from './crypto';

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
    
    // Initialize message arrays for channels
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
      hostOffer: { type: 'offer', sdp: '' }, // Will be filled on connection
      hostId: this.localPeer,
      timestamp: Date.now(),
    };

    // Encode invite as base64 string
    const inviteString = btoa(JSON.stringify(invite));
    return inviteString;
  }

  // Create offer for a new peer connection
  async createOffer(): Promise<{ offer: RTCSessionDescriptionInit; peerId: string }> {
    const peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    const tempPeerId = generateId();
    
    // Create data channel
    const dataChannel = peerConnection.createDataChannel('p2p-chat', {
      ordered: true,
    });
    
    this.setupDataChannel(dataChannel, tempPeerId);
    
    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        const pending = this.pendingIceCandidates.get(tempPeerId) || [];
        pending.push(event.candidate);
        this.pendingIceCandidates.set(tempPeerId, pending);
      }
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    // Wait for ICE gathering to complete
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

    // Store connection temporarily
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
    
    // Update peer info
    peer.peerId = remotePeerInfo;
    peer.status = 'online';
    this.peers.set(peerId, peer);

    // Add peer to server members
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
    
    // Handle incoming data channel
    peerConnection.ondatachannel = (event) => {
      this.setupDataChannel(event.channel, invite.hostId.id);
    };

    // Handle ICE candidates
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

    // Store connection
    this.peers.set(invite.hostId.id, {
      peerId: invite.hostId,
      connection: peerConnection,
      dataChannel: null, // Will be set when datachannel event fires
      status: 'online',
      lastSeen: Date.now(),
    });

    // Create local server reference
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

      // Request sync if not host
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

        // Check for host migration
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
      }
    } catch (error) {
      console.error('[P2P] Error handling message:', error);
    }
  }

  private handleChatMessage(message: Message): void {
    const key = `${message.serverId}:${message.channelId}`;
    const channelMessages = this.messages.get(key) || [];
    
    // Check for duplicates
    if (!channelMessages.find(m => m.id === message.id)) {
      channelMessages.push(message);
      channelMessages.sort((a, b) => a.seq - b.seq);
      this.messages.set(key, channelMessages);

      this.emitEvent({
        type: 'message',
        payload: message,
        timestamp: Date.now(),
      });

      // If host, broadcast to other peers
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
    // Update local state with synced data
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
    // Deterministic host election: peer with lowest ID becomes host
    const allPeerIds = [this.localPeer.id, ...Array.from(this.peers.keys())];
    const newHostId = allPeerIds.sort()[0];

    if (newHostId === this.localPeer.id) {
      this.isHost = true;
      this.hostId = this.localPeer.id;
      console.log('[P2P] This peer is now the host');

      // Update server host
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

    // Store locally
    const key = `${serverId}:${channelId}`;
    const channelMessages = this.messages.get(key) || [];
    channelMessages.push(message);
    this.messages.set(key, channelMessages);

    // If host, broadcast. Otherwise send to host
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
