// P2P Networking Types

export interface PeerId {
  id: string;
  username: string;
  publicKey?: string;
}

export interface Message {
  id: string;
  serverId: string;
  channelId: string;
  author: PeerId;
  content: string;
  seq: number;
  timestamp: number;
  encrypted?: boolean;
}

// Direct Message Types
export interface DirectMessage {
  id: string;
  type: 'DM';
  from: PeerId;
  to: PeerId;
  content: string;
  timestamp: number;
  encrypted?: boolean;
  read?: boolean;
}

export interface DMConversation {
  peerId: PeerId;
  messages: DirectMessage[];
  lastMessage?: DirectMessage;
  unreadCount: number;
  isTyping: boolean;
  connectionType: 'direct' | 'relay' | 'disconnected';
  lastSeen: number;
}

export interface DMConnectionInfo {
  peerId: string;
  connection: RTCPeerConnection | null;
  dataChannel: RTCDataChannel | null;
  connectionType: 'direct' | 'relay';
  sessionKey?: CryptoKey;
}

export interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
  description?: string;
}

export interface Server {
  id: string;
  name: string;
  icon?: string;
  channels: Channel[];
  members: PeerId[];
  hostId: string;
  createdAt: number;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'host';
export type PeerStatus = 'online' | 'idle' | 'offline';
export type ViewMode = 'servers' | 'dms';

export interface PeerConnection {
  peerId: PeerId;
  connection: RTCPeerConnection;
  dataChannel: RTCDataChannel | null;
  status: PeerStatus;
  lastSeen: number;
}

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'peer-info' | 'host-migration' | 'dm-offer' | 'dm-answer';
  from: PeerId;
  to?: string;
  payload: any;
}

export interface P2PEvent {
  type: 
    | 'message' 
    | 'peer-joined' 
    | 'peer-left' 
    | 'host-changed'
    | 'channel-created'
    | 'sync-request'
    | 'sync-response'
    | 'dm-message'
    | 'dm-typing'
    | 'dm-read'
    | 'dm-connection-request'
    | 'dm-connection-response'
    | 'server-updated'
    | 'server-deleted';
  payload: any;
  seq?: number;
  timestamp: number;
}

export interface NetworkState {
  isHost: boolean;
  hostId: string | null;
  peers: Map<string, PeerConnection>;
  localPeer: PeerId;
  servers: Server[];
  currentServerId: string | null;
  currentChannelId: string | null;
  messages: Map<string, Message[]>;
  connectionStatus: ConnectionStatus;
  sequenceNumber: number;
  dmConversations: Map<string, DMConversation>;
  dmConnections: Map<string, DMConnectionInfo>;
}

export interface InviteCode {
  serverId: string;
  serverName: string;
  hostOffer: RTCSessionDescriptionInit;
  hostId: PeerId;
  timestamp: number;
}
