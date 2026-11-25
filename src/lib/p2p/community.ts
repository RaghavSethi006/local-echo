import type { DataConnection } from 'peerjs';
import type { CommunityConfig, CommunityConfigPatch, CreateCommunityInput } from '@/types/community';
import { getTemplateChannels } from '@/types/community';
import type { Message, P2PEvent, PeerId, Server } from '@/types/p2p';
import { createDefaultCommunityConfig } from '@/lib/templates';
import { generateId, signData, verifySignature, type SigningKeyPair } from '../crypto';
import { logger } from '../logger';
import * as Storage from '../storage';
import type { YjsManager } from '../yjs-manager';
import { compressInvite, decompressInvite, isValidInvitePayload, withTimeout } from './encoding';
import type { P2PTransport } from './transport';
import type {
  InvitePayload,
  ServerUpdatePatch,
  SignedInviteEnvelope,
  SyncRequestPayload,
  SyncResponsePayload,
  WireServerPatch,
} from './types';

export interface CommunityDeps {
  getLocalPeer: () => PeerId;
  getSigningKeyPair: () => SigningKeyPair | null;
  transport: P2PTransport;
  yjs: YjsManager;
  scheduleSave: (type: string) => void;
  emitEvent: (event: P2PEvent) => void;
  onPeerObserved: (peer: PeerId) => void;
  onFlushPendingDMs: (peerId: string) => void;
  findPeerById: (peerId: string) => PeerId | null;
}

export class CommunityManager {
  servers: Map<string, Server> = new Map();
  messages: Map<string, Message[]> = new Map();
  isHost = false;
  hostId: string | null = null;

  private messageSeq = 0;
  private migrationInProgress = false;
  private migrationTimeout: ReturnType<typeof setTimeout> | null = null;
  private _migrationCandidates: string[] | undefined = undefined;
  private deps: CommunityDeps;

  constructor(deps: CommunityDeps) {
    this.deps = deps;
  }

  isServerHost(serverId: string): boolean {
    const s = this.servers.get(serverId);
    return !!s && s.hostId === this.deps.getLocalPeer().id;
  }

  async createServer(input: string | CreateCommunityInput): Promise<Server> {
    const localPeer = this.deps.getLocalPeer();
    const createInput: CreateCommunityInput =
      typeof input === 'string'
        ? { name: input, visibility: 'private', template: 'custom' }
        : input;
    const channels = getTemplateChannels(createInput.template);
    const server: Server = {
      id: generateId(),
      name: createInput.name,
      icon: createInput.icon,
      config: createDefaultCommunityConfig(createInput, localPeer.id),
      channels,
      members: [localPeer],
      memberRoles: { [localPeer.id]: ['owner'] },
      hostId: localPeer.id,
      createdAt: Date.now(),
    };

    this.servers.set(server.id, server);
    this.isHost = true;
    this.hostId = localPeer.id;

    await Promise.all(
      server.channels.map((ch) => {
        const key = `${server.id}:${ch.id}`;
        this.messages.set(key, []);
        return this.deps.yjs.getOrCreateChannelDoc(server.id, ch.id);
      })
    );

    logger.log('[P2P] Created server:', server.name, '| Host peer ID:', localPeer.id);
    this.deps.scheduleSave('servers');
    return server;
  }

  private applyServerPatch(server: Server, patch: WireServerPatch): void {
    if (typeof patch.name === 'string') server.name = patch.name;
    if (typeof patch.icon === 'string') server.icon = patch.icon;
    if (patch._configPatch) {
      server.config = this.applyCommunityConfigPatch(server.config, patch._configPatch, server);
      server.icon = server.config.branding.icon || server.icon;
    }
    const ops = patch._channelOps || [];
    for (const op of ops) {
      if (op.kind === 'add') {
        if (!server.channels.find((c) => c.id === op.channel.id)) {
          server.channels.push(op.channel);
          const key = `${server.id}:${op.channel.id}`;
          this.messages.set(key, []);
          void this.deps.yjs.getOrCreateChannelDoc(server.id, op.channel.id);
        }
      } else if (op.kind === 'rename') {
        const ch = server.channels.find((c) => c.id === op.channelId);
        if (ch) {
          ch.name = op.name;
          if (typeof op.description === 'string') ch.description = op.description;
        }
      } else if (op.kind === 'delete') {
        server.channels = server.channels.filter((c) => c.id !== op.channelId);
        this.messages.delete(`${server.id}:${op.channelId}`);
      }
    }
  }

  private applyCommunityConfigPatch(
    current: Server['config'],
    patch: CommunityConfigPatch,
    server?: Server
  ): NonNullable<Server['config']> {
    const localPeer = this.deps.getLocalPeer();
    const fallbackInput: CreateCommunityInput = {
      name: server?.name || 'Community',
      visibility: 'private',
      template: 'custom',
    };
    const base = current || createDefaultCommunityConfig(fallbackInput, localPeer.id);
    return {
      ...base,
      branding: { ...base.branding, ...patch.branding },
      roles: patch.roles || base.roles,
      permissionOverwrites: patch.permissionOverwrites || base.permissionOverwrites,
      version: base.version + 1,
    };
  }

  async updateServer(serverId: string, patch: ServerUpdatePatch): Promise<Server> {
    const localPeer = this.deps.getLocalPeer();
    const server = this.servers.get(serverId);
    if (!server) throw new Error('Server not found');
    if (server.hostId !== localPeer.id) {
      throw new Error('Only the server host can edit this server');
    }

    const fullPatch: WireServerPatch = {
      name: patch.name,
      icon: patch.icon,
      _channelOps: patch.channelOps || [],
      _configPatch: patch.configPatch,
    };
    this.applyServerPatch(server, fullPatch);
    this.servers.set(server.id, server);
    this.deps.scheduleSave('servers');

    this.deps.transport.broadcast({
      type: 'server-updated',
      payload: { serverId: server.id, patch: fullPatch },
      timestamp: Date.now(),
    });
    this.deps.emitEvent({
      type: 'server-updated',
      payload: { serverId: server.id },
      timestamp: Date.now(),
    });
    return server;
  }

  async deleteServerAsHost(serverId: string): Promise<void> {
    const localPeer = this.deps.getLocalPeer();
    const server = this.servers.get(serverId);
    if (!server) return;
    if (server.hostId !== localPeer.id) {
      throw new Error('Only the host can delete this server');
    }
    this.deps.transport.broadcast({
      type: 'server-deleted',
      payload: { serverId },
      timestamp: Date.now(),
    });
    await this.removeServerLocal(serverId);
  }

  async leaveServer(serverId: string): Promise<void> {
    const server = this.servers.get(serverId);
    if (!server) return;
    if (server.hostId === this.deps.getLocalPeer().id) {
      await this.deleteServerAsHost(serverId);
      return;
    }
    await this.removeServerLocal(serverId);
  }

  async removeServerLocal(serverId: string): Promise<void> {
    const server = this.servers.get(serverId);
    if (!server) return;
    for (const ch of server.channels) {
      this.messages.delete(`${serverId}:${ch.id}`);
      try {
        await Storage.deleteChannelMessages(serverId, ch.id);
      } catch {
        // storage may already be cleared
      }
    }
    this.servers.delete(serverId);
    try {
      await Storage.deleteServer(serverId);
    } catch {
      // storage may already be cleared
    }
    this.deps.emitEvent({
      type: 'server-deleted',
      payload: { serverId },
      timestamp: Date.now(),
    });
  }

  async generateInvite(serverId: string): Promise<string> {
    const localPeer = this.deps.getLocalPeer();
    const signingKeyPair = this.deps.getSigningKeyPair();
    const server = this.servers.get(serverId);
    if (!server) throw new Error('Server not found');
    if (!this.hasPermission(serverId, localPeer.id, 'create_invites')) {
      throw new Error('You do not have permission to create invites for this server.');
    }

    const payload: InvitePayload = {
      serverId: server.id,
      serverName: server.name,
      hostPeerId: localPeer.id,
      hostUsername: localPeer.username,
      hostVerifyKey: signingKeyPair?.verifyKeyString,
      timestamp: Date.now(),
    };
    const payloadStr = JSON.stringify(payload);
    const signature = signingKeyPair ? await signData(payloadStr, signingKeyPair.signingKey) : '';
    const json = JSON.stringify({ payload, signature });
    try {
      return await withTimeout(compressInvite(json), 3000, 'compressInvite');
    } catch (err) {
      logger.error('[P2P] compressInvite failed, falling back to base64:', err);
      return btoa(json);
    }
  }

  async joinServer(inviteCode: string): Promise<Server> {
    const localPeer = this.deps.getLocalPeer();
    let parsedInvite: SignedInviteEnvelope & Partial<InvitePayload>;
    try {
      const decompressed = await withTimeout(decompressInvite(inviteCode), 3000, 'decompressInvite');
      parsedInvite = JSON.parse(decompressed) as SignedInviteEnvelope & Partial<InvitePayload>;
    } catch {
      try {
        parsedInvite = JSON.parse(atob(inviteCode)) as SignedInviteEnvelope & Partial<InvitePayload>;
      } catch {
        throw new Error('Invalid invite code format.');
      }
    }

    const rawInvite = parsedInvite.payload ?? parsedInvite;
    if (!isValidInvitePayload(rawInvite)) {
      throw new Error('Invite code is missing required server details.');
    }
    const invite: InvitePayload = rawInvite;
    const signature = typeof parsedInvite.signature === 'string' ? parsedInvite.signature : undefined;

    if (invite.hostVerifyKey && !signature) {
      throw new Error('Invite code is missing a signature.');
    }
    if (signature && !invite.hostVerifyKey) {
      throw new Error('Invite code signature cannot be verified without host key.');
    }
    if (invite.hostVerifyKey && signature) {
      const valid = await verifySignature(JSON.stringify(invite), signature, invite.hostVerifyKey);
      if (!valid) {
        throw new Error('Invite code has an invalid signature — it may have been tampered with.');
      }
    }
    if (invite.hostPeerId === localPeer.id) {
      throw new Error('You cannot join your own peer ID as a remote server.');
    }
    logger.log('[P2P] Joining server:', invite.serverName, 'via host:', invite.hostPeerId);

    const peer = this.deps.transport.peer;
    if (!peer) throw new Error('Not initialized');

    const hostPeer: PeerId = {
      id: invite.hostPeerId,
      username: invite.hostUsername || 'Host',
      verifyKey: invite.hostVerifyKey,
    };

    const conn = peer.connect(invite.hostPeerId, {
      reliable: true,
      metadata: {
        type: 'server-join',
        serverId: invite.serverId,
        peerInfo: localPeer,
      },
    });

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Connection timeout')), 20_000);

      conn.on('open', () => {
        clearTimeout(timeout);
        logger.log('[P2P] Connected to host (RT):', invite.hostPeerId);

        this.deps.transport.hostConn = conn;
        this.hostId = invite.hostPeerId;
        this.isHost = false;

        this.deps.transport.connections.set(invite.hostPeerId, {
          peerId: hostPeer,
          conn,
          status: 'online',
          lastSeen: Date.now(),
        });

        this.deps.transport.setupConnectionHandlers(conn, invite.hostPeerId, false);

        const existingServer = this.servers.get(invite.serverId);
        const server: Server = existingServer || {
          id: invite.serverId,
          name: invite.serverName,
          channels: [],
          members: [hostPeer, localPeer],
          memberRoles: { [localPeer.id]: ['newcomer'], [hostPeer.id]: ['owner'] },
          hostId: invite.hostPeerId,
          createdAt: invite.timestamp,
        };
        server.hostId = invite.hostPeerId;

        this.servers.set(server.id, server);

        const bulkConn = peer.connect(invite.hostPeerId, {
          reliable: true,
          metadata: {
            type: 'server-join',
            channelType: 'bulk',
            serverId: invite.serverId,
            peerInfo: localPeer,
          },
        });

        let bulkReady = false;
        let syncSent = false;

        const proceed = () => {
          if (!bulkReady || syncSent) return;
          syncSent = true;

          this.deps.transport.sendToConnection(conn, {
            type: 'sync-request',
            payload: { peerInfo: localPeer },
            timestamp: Date.now(),
          });

          this.deps.emitEvent({ type: 'peer-joined', payload: hostPeer, timestamp: Date.now() });
          server.inviteCode = inviteCode;
          this.servers.set(server.id, server);
          this.deps.scheduleSave('servers');
          resolve(server);
        };

        bulkConn.on('open', () => {
          logger.log('[P2P] Connected to host (Bulk):', invite.hostPeerId);
          this.deps.transport.bulkHostConn = bulkConn;
          this.deps.transport.bulkConnections.set(invite.hostPeerId, bulkConn);
          this.deps.transport.setupConnectionHandlers(bulkConn, invite.hostPeerId, true);
          bulkReady = true;
          proceed();
        });

        bulkConn.on('error', (err) => {
          logger.warn('[P2P] Bulk connection failed, proceeding with RT only:', err);
          bulkReady = true;
          proceed();
        });

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

  onIncomingPeerConnected(conn: DataConnection, peerInfo: PeerId): void {
    const localPeer = this.deps.getLocalPeer();
    this.deps.onPeerObserved(peerInfo);

    if (this.isHost) {
      this.servers.forEach((server) => {
        const existingIdx = server.members.findIndex((m) => m.id === peerInfo.id);
        if (existingIdx === -1) {
          server.members.push(peerInfo);
          server.memberRoles = server.memberRoles || {};
          if (!server.memberRoles[peerInfo.id]) {
            server.memberRoles[peerInfo.id] = ['newcomer'];
          }
        } else {
          server.members[existingIdx] = { ...server.members[existingIdx], ...peerInfo };
        }
      });

      this.deps.transport.broadcast(
        {
          type: 'peer-joined',
          payload: peerInfo,
          timestamp: Date.now(),
        },
        conn.peer
      );

      const peerList = Array.from(this.deps.transport.connections.entries())
        .filter(([id]) => id !== conn.peer)
        .map(([, entry]) => entry.peerId);

      this.deps.transport.sendToConnection(conn, {
        type: 'peer-list',
        payload: { peers: [localPeer, ...peerList] },
        timestamp: Date.now(),
      });

      for (const server of this.servers.values()) {
        if (!server.members.find((m) => m.id === peerInfo.id)) continue;
        for (const ch of server.channels) {
          const channelKey = this.deps.yjs.channelKey(server.id, ch.id);
          void this.deps.yjs.getOrCreateChannelDoc(server.id, ch.id).then(() => {
            this.deps.yjs.sendSyncStep1(channelKey, conn.peer);
          });
        }
      }
    }

    this.deps.emitEvent({ type: 'peer-joined', payload: peerInfo, timestamp: Date.now() });
  }

  onPeerDisconnected(remotePeerId: string): void {
    if (remotePeerId === this.hostId && !this.isHost) {
      this.deps.emitEvent({
        type: 'error',
        payload: { message: 'Host disconnected. Migrating to new host...', level: 'warn' },
        timestamp: Date.now(),
      });
      this.initiateHostMigration();
    }
  }

  handleChatMessage(message: Message, fromPeerId: string): void {
    const localPeer = this.deps.getLocalPeer();
    if (!message || typeof message.content !== 'string' || !message.serverId || !message.channelId || !message.author?.id) {
      return;
    }
    const server = this.servers.get(message.serverId);
    if (!server) return;
    if (message.author.id === localPeer.id) return;
    if (!this.isServerMember(message.serverId, fromPeerId)) return;
    if (message.author.id !== fromPeerId && fromPeerId !== server.hostId) {
      logger.warn('[P2P] Rejected spoofed channel message author', message.author.id, 'from', fromPeerId);
      return;
    }

    const key = `${message.serverId}:${message.channelId}`;
    const channelMessages = this.messages.get(key) || [];

    if (!channelMessages.find((m) => m.id === message.id)) {
      channelMessages.push(message);
      this.messages.set(key, channelMessages);
      this.deps.emitEvent({ type: 'message', payload: message, timestamp: Date.now() });
    }
  }

  handleSyncRequest(fromPeerId: string, payload: SyncRequestPayload): void {
    if (!this.isHost) return;

    if (payload.peerInfo) {
      const entry = this.deps.transport.connections.get(fromPeerId);
      if (entry) {
        entry.peerId = payload.peerInfo;
        this.deps.transport.connections.set(fromPeerId, entry);
      }
      this.deps.onPeerObserved(payload.peerInfo);
      this.servers.forEach((server) => {
        const idx = server.members.findIndex((m) => m.id === payload.peerInfo!.id);
        if (idx >= 0) {
          server.members[idx] = { ...server.members[idx], ...payload.peerInfo };
        }
      });
    }

    const bulkConn = this.deps.transport.bulkConnections.get(fromPeerId);
    const targetConn = bulkConn?.open ? bulkConn : this.deps.transport.connections.get(fromPeerId)?.conn;
    if (targetConn) {
      this.deps.transport.sendToConnection(targetConn, {
        type: 'sync-response',
        payload: {
          servers: Array.from(this.servers.values()).map((s) => {
            const { config: _config, ...coreServer } = s;
            void _config;
            return coreServer;
          }),
          messages: {},
          sequenceNumber: 0,
          onlinePeers: this.deps.transport.getOnlinePeers(),
        },
        timestamp: Date.now(),
      });
      Array.from(this.servers.values()).forEach((server) => {
        if (!server.config) return;
        this.deps.transport.sendToConnection(targetConn, {
          type: 'config-sync',
          payload: { serverId: server.id, config: server.config },
          timestamp: Date.now(),
        });
      });
    }
  }

  async handleSyncResponse(payload: SyncResponsePayload): Promise<void> {
    const localPeer = this.deps.getLocalPeer();
    payload.servers?.forEach((server: Server) => {
      server.members?.forEach((m) => this.deps.onPeerObserved(m));

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
        server.members.forEach((m) => {
          const idx = existing.members.findIndex((em) => em.id === m.id);
          if (idx === -1) {
            existing.members.push(m);
            if (!existing.memberRoles[m.id]) {
              existing.memberRoles[m.id] = ['newcomer'];
            }
          } else {
            existing.members[idx] = { ...existing.members[idx], ...m };
          }
        });
        if (!existing.members.find((m) => m.id === localPeer.id)) {
          existing.members.push(localPeer);
        }
        this.servers.set(server.id, existing);
      } else {
        if (!server.members.find((m) => m.id === localPeer.id)) {
          server.members.push(localPeer);
        }
        if (!server.memberRoles) {
          server.memberRoles = {};
        }
        this.servers.set(server.id, server);
      }
      const storedServer = this.servers.get(server.id);
      storedServer?.channels.forEach((ch) => {
        const key = `${server.id}:${ch.id}`;
        if (!this.messages.has(key)) {
          this.messages.set(key, []);
        }
      });
    });

    logger.log('[P2P] Synced with host');
    this.deps.scheduleSave('servers');

    for (const server of this.servers.values()) {
      for (const ch of server.channels) {
        const channelKey = this.deps.yjs.channelKey(server.id, ch.id);
        await this.deps.yjs.getOrCreateChannelDoc(server.id, ch.id);
        this.deps.yjs.sendSyncStep1(channelKey, server.hostId);
      }
    }

    this.deps.emitEvent({ type: 'sync-response', payload: null, timestamp: Date.now() });
  }

  handleServerUpdated(fromPeerId: string, payload: { serverId?: string; patch?: WireServerPatch }): void {
    const { serverId, patch } = payload;
    if (!serverId || !patch) return;
    const server = this.servers.get(serverId);
    if (server && fromPeerId === server.hostId) {
      this.applyServerPatch(server, patch);
      this.servers.set(serverId, server);
      this.deps.scheduleSave('servers');
      this.deps.emitEvent({ type: 'server-updated', payload: { serverId }, timestamp: Date.now() });
    } else if (server) {
      logger.warn('[P2P] Ignored unauthorized server-updated from', fromPeerId);
    }
  }

  handleServerDeleted(fromPeerId: string, payload: { serverId?: string }): void {
    const { serverId } = payload;
    if (!serverId) return;
    const server = this.servers.get(serverId);
    if (server && fromPeerId === server.hostId) {
      void this.removeServerLocal(serverId);
    } else if (server) {
      logger.warn('[P2P] Ignored unauthorized server-deleted from', fromPeerId);
    }
  }

  handleConfigSync(fromPeerId: string, payload: { serverId?: string; config?: CommunityConfig }): void {
    const { serverId, config } = payload;
    if (!serverId || !config) return;
    const server = this.servers.get(serverId);
    if (server && fromPeerId === server.hostId) {
      const incomingVersion = config.version ?? 0;
      const existingVersion = server.config?.version ?? 0;
      if (incomingVersion >= existingVersion) {
        server.config = config;
        this.servers.set(serverId, server);
        this.deps.scheduleSave('servers');
        this.deps.emitEvent({
          type: 'server-updated',
          payload: { serverId },
          timestamp: Date.now(),
        });
      }
    } else if (server) {
      logger.warn('[P2P] Ignored unauthorized config-sync from', fromPeerId);
    }
  }

  handlePeerList(peers?: PeerId[]): void {
    const localPeer = this.deps.getLocalPeer();
    peers?.forEach((p) => {
      this.deps.onPeerObserved(p);
      if (p.id !== localPeer.id) {
        this.servers.forEach((server) => {
          const idx = server.members.findIndex((m) => m.id === p.id);
          if (idx === -1) {
            server.members.push(p);
          } else {
            server.members[idx] = { ...server.members[idx], ...p };
          }
        });
      }
    });
    this.deps.emitEvent({ type: 'peer-joined', payload: peers, timestamp: Date.now() });
  }

  async sendMessage(serverId: string, channelId: string, content: string): Promise<Message> {
    const localPeer = this.deps.getLocalPeer();
    if (!this.isServerMember(serverId, localPeer.id)) {
      throw new Error('You are not a member of this server.');
    }
    if (!this.hasPermission(serverId, localPeer.id, 'send_messages', channelId)) {
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
      author: localPeer,
      content,
      seq: ++this.messageSeq,
      timestamp: Date.now(),
    };

    const doc = await this.deps.yjs.getOrCreateChannelDoc(serverId, channelId);
    this.deps.yjs.addChannelMessage(doc, message);

    const key = `${serverId}:${channelId}`;
    const channelMessages = this.messages.get(key) || [];
    channelMessages.push(message);
    this.messages.set(key, channelMessages);

    this.deps.emitEvent({ type: 'message', payload: message, timestamp: Date.now() });
    return message;
  }

  // ==================== HOST MIGRATION ====================

  initiateHostMigration(view?: string[]): void {
    const localPeer = this.deps.getLocalPeer();
    if (this.migrationInProgress) return;
    this.migrationInProgress = true;

    const candidates =
      view ?? [
        localPeer.id,
        ...Array.from(this.deps.transport.connections.keys()).filter(
          (id) => this.deps.transport.connections.get(id)?.status === 'online'
        ),
      ];
    candidates.sort();
    const proposedHostId = candidates[0];

    logger.log('[P2P] Host migration → proposed host:', proposedHostId);

    if (proposedHostId === localPeer.id) {
      this.isHost = true;
      this.hostId = localPeer.id;
      this.deps.transport.hostConn = null;
      this.deps.transport.bulkHostConn = null;

      this.servers.forEach((server) => {
        server.hostId = localPeer.id;
      });
      this.deps.scheduleSave('servers');

      this.deps.transport.broadcast({
        type: 'host-claim',
        payload: { claimantId: localPeer.id, proposedHostId, view: candidates },
        timestamp: Date.now(),
      });

      this.migrationTimeout = setTimeout(() => {
        this.migrationTimeout = null;
        if (!this.migrationInProgress) return;
        this.deps.transport.broadcast({
          type: 'host-confirmed',
          payload: { newHostId: localPeer.id },
          timestamp: Date.now(),
        });
        this.deps.emitEvent({
          type: 'host-changed',
          payload: { newHostId: localPeer.id },
          timestamp: Date.now(),
        });
        this.migrationInProgress = false;
      }, 2000);

      this._migrationCandidates = candidates;
    } else {
      this.hostId = proposedHostId;
      this._migrationCandidates = candidates;

      this.migrationTimeout = setTimeout(() => {
        this.migrationTimeout = null;
        if (!this.migrationInProgress) return;
        this.migrationInProgress = false;
        this._migrationCandidates = undefined;
        this.initiateHostMigration();
      }, 3000);
    }
  }

  handleHostClaim(payload: { claimantId: string; proposedHostId: string; view: string[] }): void {
    const localPeer = this.deps.getLocalPeer();
    if (!this.migrationInProgress) return;
    if (payload.proposedHostId === this.hostId) {
      if (this.migrationTimeout) clearTimeout(this.migrationTimeout);
      this.migrationTimeout = null;
      this.migrationInProgress = false;
      this._migrationCandidates = undefined;

      this.servers.forEach((server) => {
        server.hostId = payload.claimantId;
      });

      const entry = this.deps.transport.connections.get(payload.claimantId);
      if (entry) {
        this.deps.transport.hostConn = entry.conn;
        this.deps.transport.bulkHostConn = this.deps.transport.bulkConnections.get(payload.claimantId) || null;
      } else {
        this.reconnectToHost(payload.claimantId);
      }

      this.deps.emitEvent({
        type: 'host-changed',
        payload: { newHostId: payload.claimantId },
        timestamp: Date.now(),
      });
    } else {
      if (this.migrationTimeout) clearTimeout(this.migrationTimeout);
      this.migrationTimeout = null;
      this.migrationInProgress = false;

      const prevCandidates = this._migrationCandidates ?? [localPeer.id];
      this.deps.transport.broadcast({
        type: 'host-conflict',
        payload: {
          myCandidate: this.hostId,
          myView: prevCandidates,
        },
        timestamp: Date.now(),
      });
      this._migrationCandidates = undefined;

      const mergedView = Array.from(new Set([...prevCandidates, ...(payload.view ?? [])]));
      this.initiateHostMigration(mergedView);
    }
  }

  handleHostConflict(payload: { myCandidate: string; myView: string[] }): void {
    const localPeer = this.deps.getLocalPeer();
    if (!this.migrationInProgress) return;
    if (this.migrationTimeout) clearTimeout(this.migrationTimeout);
    this.migrationTimeout = null;
    this.migrationInProgress = false;

    const mergedView = Array.from(
      new Set([...(this._migrationCandidates ?? [localPeer.id]), ...(payload.myView ?? [])])
    );
    this._migrationCandidates = undefined;
    this.initiateHostMigration(mergedView);
  }

  handleHostConfirmed(payload: { newHostId: string }): void {
    if (this.migrationInProgress) {
      if (this.migrationTimeout) clearTimeout(this.migrationTimeout);
      this.migrationTimeout = null;
      this.migrationInProgress = false;
      this._migrationCandidates = undefined;
    }

    this.servers.forEach((server) => {
      server.hostId = payload.newHostId;
    });
    this.hostId = payload.newHostId;

    this.deps.transport.broadcast({
      type: 'host-changed',
      payload,
      timestamp: Date.now(),
    });
    this.deps.emitEvent({
      type: 'host-changed',
      payload,
      timestamp: Date.now(),
    });
  }

  reconnectToHost(newHostId: string): void {
    const localPeer = this.deps.getLocalPeer();
    const peer = this.deps.transport.peer;
    if (!peer) return;
    logger.log('[P2P] Reconnecting to new host:', newHostId);
    const conn = peer.connect(newHostId, {
      reliable: true,
      metadata: {
        type: 'host-rejoin',
        peerInfo: localPeer,
        channelType: 'rt',
      },
    });

    conn.on('open', () => {
      logger.log('[P2P] Reconnected to new host:', newHostId);
      this.deps.transport.hostConn = conn;
      this.hostId = newHostId;
      this.deps.transport.connections.set(newHostId, {
        peerId: this.deps.findPeerById(newHostId) || { id: newHostId, username: 'New Host' },
        conn,
        status: 'online',
        lastSeen: Date.now(),
      });

      this.deps.transport.setupConnectionHandlers(conn, newHostId, false);
      this.deps.onFlushPendingDMs(newHostId);

      const bulkConn = peer.connect(newHostId, {
        reliable: true,
        metadata: {
          type: 'host-rejoin',
          peerInfo: localPeer,
          channelType: 'bulk',
        },
      });

      bulkConn.on('open', () => {
        this.deps.transport.bulkHostConn = bulkConn;
        this.deps.transport.bulkConnections.set(newHostId, bulkConn);
        this.deps.transport.setupConnectionHandlers(bulkConn, newHostId, true);

        this.deps.transport.sendToConnection(conn, {
          type: 'sync-request',
          payload: { peerInfo: localPeer },
          timestamp: Date.now(),
        });

        void Promise.all(
          Array.from(this.servers.values()).flatMap((server) =>
            server.channels.map(async (ch) => {
              const channelKey = this.deps.yjs.channelKey(server.id, ch.id);
              await this.deps.yjs.getOrCreateChannelDoc(server.id, ch.id);
              this.deps.yjs.sendSyncStep1(channelKey, newHostId);
            })
          )
        );
      });
    });

    conn.on('error', (err) => {
      logger.error('[P2P] Reconnection to new host failed:', err);
    });
  }

  async reconnectRemoteServers(): Promise<void> {
    const localPeer = this.deps.getLocalPeer();
    for (const server of this.servers.values()) {
      if (server.hostId !== localPeer.id && server.inviteCode) {
        try {
          await this.joinServer(server.inviteCode);
        } catch {
          logger.log('[P2P] Could not reconnect to server', server.name, '— host is offline');
        }
      }
    }
  }

  // ==================== PERMISSIONS & GETTERS ====================

  isServerMember(serverId: string, peerId: string): boolean {
    const server = this.servers.get(serverId);
    if (!server) return false;
    return server.members.some((m) => m.id === peerId);
  }

  hasPermission(serverId: string, peerId: string, permission: string, channelId?: string): boolean {
    const server = this.servers.get(serverId);
    if (!server) return false;
    if (server.hostId === peerId) return true;

    const memberRoleIds = server.memberRoles?.[peerId];
    if (!memberRoleIds || memberRoleIds.length === 0) return false;

    const granted = new Set<string>();
    server.config?.roles?.forEach((role) => {
      if (memberRoleIds.includes(role.id)) {
        role.permissions.forEach((p) => granted.add(p));
      }
    });

    server.config?.permissionOverwrites?.forEach((ow) => {
      if (ow.scopeType !== 'server') return;
      const matches = ow.targetType === 'role' ? memberRoleIds.includes(ow.targetId) : ow.targetId === peerId;
      if (matches) {
        ow.allow.forEach((p) => granted.add(p));
        ow.deny.forEach((p) => granted.delete(p));
      }
    });

    if (channelId) {
      server.config?.permissionOverwrites?.forEach((ow) => {
        if (ow.scopeType !== 'channel' || ow.scopeId !== channelId) return;
        const matches = ow.targetType === 'role' ? memberRoleIds.includes(ow.targetId) : ow.targetId === peerId;
        if (matches) {
          ow.allow.forEach((p) => granted.add(p));
          ow.deny.forEach((p) => granted.delete(p));
        }
      });
    }

    return granted.has(permission);
  }

  getServers(): Server[] {
    return Array.from(this.servers.values());
  }

  getServer(id: string): Server | undefined {
    return this.servers.get(id);
  }

  getMessages(serverId: string, channelId: string): Message[] {
    return this.messages.get(`${serverId}:${channelId}`) || [];
  }

  getAllMessages(): Message[] {
    const all: Message[] = [];
    this.messages.forEach((msgs) => all.push(...msgs));
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

    const oldestTs = msgs.reduce((min, m) => (m.timestamp < min ? m.timestamp : min), msgs[0].timestamp);
    const older = await Storage.loadMessagesBefore(serverId, channelId, oldestTs, 50);
    if (older.length === 0) return [];

    const existingIds = new Set(msgs.map((m) => m.id));
    const newMsgs = older.filter((m) => !existingIds.has(m.id));
    if (newMsgs.length === 0) return [];

    msgs.unshift(...newMsgs);
    this.messages.set(key, msgs);
    return newMsgs;
  }

  getAvailablePeersForDM(): PeerId[] {
    const localPeer = this.deps.getLocalPeer();
    const peersMap = new Map<string, PeerId>();
    this.servers.forEach((server) => {
      server.members.forEach((m) => {
        if (m.id !== localPeer.id) peersMap.set(m.id, m);
      });
    });
    return Array.from(peersMap.values());
  }

  clearRuntimeState(): void {
    if (this.migrationTimeout) {
      clearTimeout(this.migrationTimeout);
      this.migrationTimeout = null;
    }
    this.migrationInProgress = false;
    this._migrationCandidates = undefined;
    this.servers.clear();
    this.messages.clear();
    this.isHost = false;
    this.hostId = null;
  }
}
