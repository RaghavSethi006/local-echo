import type { DataConnection } from 'peerjs';
import type { CommunityConfigPatch } from '@/types/community';
import type { ChannelOp, P2PEvent, PeerId, Server } from '@/types/p2p';

export type EventCallback = (event: P2PEvent) => void;

export type ServerUpdatePatch = {
  name?: string;
  icon?: string;
  channelOps?: ChannelOp[];
  configPatch?: CommunityConfigPatch;
};

export type WireServerPatch = Partial<Server> & {
  _channelOps?: ChannelOp[];
  _configPatch?: CommunityConfigPatch;
};

export type CoreServer = Omit<Server, 'config'>;

export interface InvitePayload {
  serverId: string;
  serverName: string;
  hostPeerId: string;
  hostUsername?: string;
  hostVerifyKey?: string;
  timestamp: number;
}

export interface SignedInviteEnvelope {
  payload?: InvitePayload;
  signature?: string;
}

export interface SyncRequestPayload {
  peerInfo?: PeerId;
}

export interface SyncResponsePayload {
  servers: CoreServer[];
  messages: Record<string, unknown[]>;
  sequenceNumber: number;
  onlinePeers: PeerId[];
}

export interface ChunkFrame {
  _chunkId: string;
  _index: number;
  _total: number;
  _data: string;
}

export type PeerJsDataConnectionWithChannel = DataConnection & {
  _dc?: RTCDataChannel;
  dataChannel?: RTCDataChannel;
};

export interface PeerEntry {
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
