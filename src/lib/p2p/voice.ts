import type { MediaConnection } from 'peerjs';
import type { P2PEvent, PeerId, Server } from '@/types/p2p';
import { logger } from '../logger';
import type { P2PTransport } from './transport';

export interface VoiceDeps {
  getLocalPeer: () => PeerId;
  getServer: (serverId: string) => Server | undefined;
  transport: P2PTransport;
  emitEvent: (event: P2PEvent) => void;
  findPeerById: (peerId: string) => PeerId | null;
}

export class VoiceManager {
  private localStream: MediaStream | null = null;
  private voiceConnections: Map<string, MediaConnection> = new Map();
  private voiceAudioElements: Map<string, HTMLAudioElement> = new Map();
  private muted = false;
  private activeVoiceChannel: { serverId: string; channelId: string } | null = null;
  private deps: VoiceDeps;

  constructor(deps: VoiceDeps) {
    this.deps = deps;
  }

  handleIncomingCall(call: MediaConnection): void {
    logger.log('[P2P] Incoming voice call from:', call.peer);
    if (this.localStream) {
      call.answer(this.localStream);
      this.voiceConnections.set(call.peer, call);
      this.deps.emitEvent({
        type: 'voice-state-changed',
        payload: { joined: true, peerId: call.peer },
        timestamp: Date.now(),
      });
      call.on('stream', (remoteStream) => {
        const audio = new Audio();
        audio.srcObject = remoteStream;
        audio.play().catch(() => {});
        this.voiceAudioElements.set(call.peer, audio);
      });
      call.on('close', () => {
        this.voiceConnections.delete(call.peer);
        const el = this.voiceAudioElements.get(call.peer);
        if (el) {
          el.pause();
          el.srcObject = null;
        }
        this.voiceAudioElements.delete(call.peer);
        this.deps.emitEvent({
          type: 'voice-state-changed',
          payload: { peerLeft: call.peer },
          timestamp: Date.now(),
        });
      });
      call.on('error', (err) => logger.error('[P2P Voice] Incoming call error:', err));
    } else {
      call.close();
    }
  }

  async joinVoiceChannel(serverId: string, channelId: string): Promise<void> {
    if (this.activeVoiceChannel) {
      await this.leaveVoiceChannel();
    }

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      this.deps.emitEvent({
        type: 'error',
        payload: { message: 'Could not access microphone. Please check permissions.', level: 'error' },
        timestamp: Date.now(),
      });
      return;
    }

    this.activeVoiceChannel = { serverId, channelId };
    this.muted = false;

    const localPeer = this.deps.getLocalPeer();
    const membersToCall: string[] = [];
    this.deps.getServer(serverId)?.members.forEach((m) => {
      if (m.id !== localPeer.id && this.deps.transport.connections.has(m.id)) {
        membersToCall.push(m.id);
      }
    });

    for (const peerId of membersToCall) {
      this.callPeerVoice(peerId);
    }

    this.deps.emitEvent({
      type: 'voice-state-changed',
      payload: { joined: true, serverId, channelId },
      timestamp: Date.now(),
    });
  }

  async leaveVoiceChannel(): Promise<void> {
    this.voiceAudioElements.forEach((el) => {
      el.pause();
      el.srcObject = null;
    });
    this.voiceAudioElements.clear();
    this.voiceConnections.forEach((conn) => conn.close());
    this.voiceConnections.clear();

    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }

    this.muted = false;
    this.activeVoiceChannel = null;

    this.deps.emitEvent({
      type: 'voice-state-changed',
      payload: { joined: false },
      timestamp: Date.now(),
    });
  }

  private callPeerVoice(peerId: string): void {
    const peer = this.deps.transport.peer;
    if (!peer || !this.localStream) return;
    try {
      const call = peer.call(peerId, this.localStream);
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
        if (el) {
          el.pause();
          el.srcObject = null;
        }
        this.voiceAudioElements.delete(peerId);
        this.deps.emitEvent({
          type: 'voice-state-changed',
          payload: { peerId, closed: true },
          timestamp: Date.now(),
        });
      });
      call.on('error', (err) => logger.error('[P2P Voice] Call error:', err));
    } catch (err) {
      logger.warn('[P2P Voice] Failed to call peer:', peerId, err);
    }
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((t) => {
        t.enabled = !this.muted;
      });
    }
    this.deps.emitEvent({
      type: 'voice-state-changed',
      payload: { muted: this.muted },
      timestamp: Date.now(),
    });
    return this.muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  isInVoiceChannel(): boolean {
    return this.activeVoiceChannel !== null;
  }

  getActiveVoiceChannel(): { serverId: string; channelId: string } | null {
    return this.activeVoiceChannel;
  }

  getActiveVoicePeers(): PeerId[] {
    if (!this.activeVoiceChannel) return [];
    const peers: PeerId[] = [this.deps.getLocalPeer()];
    for (const peerId of this.voiceConnections.keys()) {
      peers.push(this.deps.findPeerById(peerId) || { id: peerId, username: `peer-${peerId.slice(0, 6)}` });
    }
    return peers;
  }
}
