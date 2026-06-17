// P2P Networking Types
import type { CommunityConfig } from './community';

export interface PeerId {
  id: string;
  username: string;
  publicKey?: string;
  verifyKey?: string;
}

export interface Message {
  id: string;
  serverId: string;
  channelId: string;
  author: PeerId;
  content: string;
  seq?: number;
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
  _relayTo?: string;
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

export interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
  description?: string;
}

export type ChannelOp =
  | { kind: 'add'; channel: Channel }
  | { kind: 'rename'; channelId: string; name: string; description?: string }
  | { kind: 'delete'; channelId: string };

export interface Server {
  id: string;
  name: string;
  icon?: string;
  config?: CommunityConfig;
  channels: Channel[];
  members: PeerId[];
  memberRoles: Record<string, string[]>;
  hostId: string;
  createdAt: number;
  inviteCode?: string;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'host';
export type ViewMode = 'servers' | 'dms';

export type ErrorLevel = 'info' | 'warn' | 'error';

export interface P2PEvent {
  type: 
    | 'message' 
    | 'peer-joined' 
    | 'peer-left' 
    | 'host-changed'
    | 'sync-request'
    | 'sync-response'
    | 'dm-message'
    | 'dm-typing'
    | 'dm-read'
    | 'server-updated'
    | 'server-deleted'
    | 'peer-list'
    | 'config-sync'
    | 'ping'
    | 'pong'
    | 'yjs-sync'
    | 'yjs-update'
    | 'error'
    | 'voice-state-changed';
  payload: unknown;
  seq?: number;
  timestamp: number;
}


