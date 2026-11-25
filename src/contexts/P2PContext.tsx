import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo, ReactNode } from 'react';
import { P2PNetwork } from '@/lib/p2p-network';
import {
  Server,
  Channel,
  Message,
  PeerId,
  P2PEvent,
  ConnectionStatus,
  ConnectionDiagnostics,
  ViewMode,
  DMConversation,
  DMSafetyInfo,
  DirectMessage,
  ChannelOp,
} from '@/types/p2p';
import type { CommunityConfigPatch, CreateCommunityInput } from '@/types/community';
import * as Storage from '@/lib/storage';
import {
  clearNetworkOverrides,
  getEffectiveNetworkConfig,
  saveNetworkOverrides,
  type NetworkOverrides,
} from '@/lib/network-config';
import { logger } from '@/lib/logger';
import { sendBrowserNotification } from '@/hooks/use-notifications';
import { toast } from 'sonner';

interface P2PContextType {
  network: P2PNetwork | null;
  getAllMessages: () => Message[];
  isInitialized: boolean;
  connectionStatus: ConnectionStatus;
  localPeer: PeerId | null;
  servers: Server[];
  currentServer: Server | null;
  currentChannel: Channel | null;
  messages: Message[];
  onlinePeers: PeerId[];

  // View mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // DM State
  dmConversations: DMConversation[];
  currentDMPeer: PeerId | null;
  dmMessages: DirectMessage[];
  availablePeersForDM: PeerId[];

  // Actions
  initialize: (username: string) => Promise<void>;
  createServer: (input: string | CreateCommunityInput) => Promise<Server>;
  joinServer: (inviteCode: string) => Promise<void>;
  selectServer: (serverId: string, preferredChannelId?: string) => void;
  selectChannel: (channelId: string) => void;
  sendMessage: (content: string) => Promise<void>;
  loadOlderMessages: () => Promise<void>;
  generateInvite: () => Promise<string>;
  disconnect: () => Promise<void>;

  // Server customization (host only)
  isCurrentServerHost: boolean;
  updateCurrentServer: (patch: { name?: string; icon?: string; channelOps?: ChannelOp[]; configPatch?: CommunityConfigPatch }) => Promise<void>;
  leaveCurrentServer: () => Promise<void>;
  deleteCurrentServer: () => Promise<void>;

  // DM Actions
  openDM: (peer: PeerId) => void;
  sendDM: (content: string) => Promise<void>;
  sendDMTyping: (isTyping: boolean) => void;
  markDMAsRead: () => void;
  startNewDM: (peer: PeerId) => void;
  startDMByPeerId: (peerId: string, username?: string) => Promise<void>;

  // Voice
  isInVoiceChannel: boolean;
  muted: boolean;
  activeVoicePeers: PeerId[];
  joinVoiceChannel: (serverId: string, channelId: string) => Promise<void>;
  leaveVoiceChannel: () => Promise<void>;
  toggleMute: () => boolean;

  // DM Key Verification
  verifyDMPeer: (peerId: string) => Promise<void>;
  unverifyDMPeer: (peerId: string) => Promise<void>;
  getDMSafetyInfo: (peerId: string) => Promise<DMSafetyInfo | null>;

  // Network Settings & Diagnostics
  diagnostics: ConnectionDiagnostics | null;
  reconfigureNetwork: (overrides: NetworkOverrides) => Promise<void>;
  resetNetworkOverrides: () => Promise<void>;
  reconnectNow: () => Promise<void>;

  // Persistence
  hasStoredIdentity: boolean;
  restoreSession: () => Promise<void>;
}

const P2PContext = createContext<P2PContextType | null>(null);

function pickDefaultChannelId(server: Server | undefined, preferredChannelId?: string): string | null {
  if (!server) return null;
  if (preferredChannelId && server.channels.some(c => c.id === preferredChannelId)) {
    return preferredChannelId;
  }
  return (
    server.channels.find(c => c.type === 'text')?.id ??
    server.channels[0]?.id ??
    null
  );
}

export function P2PProvider({ children }: { children: ReactNode }) {
  const [network, setNetwork] = useState<P2PNetwork | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [localPeer, setLocalPeer] = useState<PeerId | null>(null);
  const [servers, setServers] = useState<Server[]>([]);
  const [currentServerId, setCurrentServerId] = useState<string | null>(null);
  const [currentChannelId, setCurrentChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlinePeers, setOnlinePeers] = useState<PeerId[]>([]);
  const [hasStoredIdentity, setHasStoredIdentity] = useState(false);

  // View mode (servers or DMs)
  const [viewMode, setViewMode] = useState<ViewMode>('servers');

  // DM State
  const [dmConversations, setDmConversations] = useState<DMConversation[]>([]);
  const [currentDMPeerId, setCurrentDMPeerId] = useState<string | null>(null);
  const [dmMessages, setDmMessages] = useState<DirectMessage[]>([]);
  const [availablePeersForDM, setAvailablePeersForDM] = useState<PeerId[]>([]);
  const currentServerIdRef = useRef<string | null>(null);
  const currentChannelIdRef = useRef<string | null>(null);
  const currentDMPeerIdRef = useRef<string | null>(null);
  const networkRef = useRef<P2PNetwork | null>(null);
  const serversRef = useRef<Server[]>([]);

  const currentServer = useMemo(
    () => servers.find(s => s.id === currentServerId) || null,
    [servers, currentServerId]
  );
  const currentChannel = useMemo(
    () => currentServer?.channels.find(c => c.id === currentChannelId) || null,
    [currentServer, currentChannelId]
  );
  const currentDMPeer = useMemo(
    () => dmConversations.find(c => c.peerId.id === currentDMPeerId)?.peerId || null,
    [dmConversations, currentDMPeerId]
  );

  // Voice state
  const [isInVoiceChannel, setIsInVoiceChannel] = useState(false);
  const [muted, setMuted] = useState(false);
  const [activeVoicePeers, setActiveVoicePeers] = useState<PeerId[]>([]);
  const [diagnostics, setDiagnostics] = useState<ConnectionDiagnostics | null>(null);

  const setNetworkState = useCallback((net: P2PNetwork | null) => {
    setNetwork(net);
    networkRef.current = net;
  }, []);

  const setServersState = useCallback((nextServers: Server[]) => {
    setServers(nextServers);
    serversRef.current = nextServers;
  }, []);

  const setCurrentServerIdState = useCallback((id: string | null) => {
    setCurrentServerId(id);
    currentServerIdRef.current = id;
  }, []);

  const setCurrentChannelIdState = useCallback((id: string | null) => {
    setCurrentChannelId(id);
    currentChannelIdRef.current = id;
  }, []);

  const setCurrentDMPeerIdState = useCallback((id: string | null) => {
    setCurrentDMPeerId(id);
    currentDMPeerIdRef.current = id;
  }, []);

  // Check for stored identity on mount
  useEffect(() => {
    Storage.loadIdentity()
      .then(identity => {
        if (identity) {
          setHasStoredIdentity(true);
        }
      })
      .catch(() => {});
  }, []);

  // Handle P2P events
  const handleEvent = useCallback((event: P2PEvent) => {
    const net = networkRef.current;
    const serverId = currentServerIdRef.current;
    const channelId = currentChannelIdRef.current;
    const dmPeerId = currentDMPeerIdRef.current;

    logger.log('[P2P Context] Event:', event.type);

    switch (event.type) {
      case 'message':
        if (net && serverId && channelId) {
          const msg = event.payload as Message;
          if (msg.serverId === serverId && msg.channelId === channelId) {
            setMessages([...net.getMessages(serverId, channelId)]);
          }
        }
        break;
      case 'peer-joined':
        if (net) {
          setConnectionStatus(net.getConnectionStatus());
          setOnlinePeers(net.getOnlinePeers());
          setServersState(net.getServers());
          setAvailablePeersForDM(net.getAvailablePeersForDM());
          setDmConversations(net.getDMConversations());
          setDiagnostics(net.getConnectionDiagnostics());
        }
        break;
      case 'peer-left':
        if (net) {
          setConnectionStatus(net.getConnectionStatus());
          setOnlinePeers(net.getOnlinePeers());
          setServersState(net.getServers());
          setActiveVoicePeers(net.getActiveVoicePeers());
          setDiagnostics(net.getConnectionDiagnostics());
        }
        break;
      case 'host-changed':
        if (net) {
          setConnectionStatus(net.getConnectionStatus());
          setServersState(net.getServers());
          setDiagnostics(net.getConnectionDiagnostics());
        }
        break;
      case 'dm-message':
        if (net) {
          const payload = event.payload as { dm?: DirectMessage; incoming?: boolean } | DirectMessage;
          const dm = (payload as { dm?: DirectMessage }).dm || (payload as DirectMessage);
          const incoming = Boolean((payload as { incoming?: boolean }).incoming);

          setDmConversations(net.getDMConversations());
          if (dmPeerId) {
            setDmMessages(net.getDMMessages(dmPeerId));
          }
          if (incoming && dm?.from && dm.content && dm.from.id !== net.getLocalPeer().id) {
            sendBrowserNotification(
              `New message from ${dm.from.username}`,
              dm.content.length > 60 ? `${dm.content.slice(0, 60)}…` : dm.content
            );
          }
        }
        break;
      case 'dm-typing':
      case 'dm-verified':
        if (net) {
          setDmConversations(net.getDMConversations());
        }
        break;
      case 'connection-state-changed':
        if (net) {
          setConnectionStatus(net.getConnectionStatus());
          setDiagnostics(net.getConnectionDiagnostics());
        }
        break;
      case 'server-updated':
        if (net) {
          setServersState(net.getServers());
        }
        break;
      case 'server-deleted':
        if (net) {
          const remaining = net.getServers();
          setServersState(remaining);
          const deletedId = (event.payload as { serverId?: string })?.serverId;
          if (deletedId === serverId) {
            const next = remaining[0];
            if (next) {
              const nextChannelId = pickDefaultChannelId(next);
              setCurrentServerIdState(next.id);
              setCurrentChannelIdState(nextChannelId);
              setMessages(nextChannelId ? net.getMessages(next.id, nextChannelId) : []);
            } else {
              setCurrentServerIdState(null);
              setCurrentChannelIdState(null);
              setMessages([]);
              setViewMode('dms');
            }
          }
        }
        break;
      case 'sync-response':
        if (net) {
          const updatedServers = net.getServers();
          setConnectionStatus(net.getConnectionStatus());
          setServersState(updatedServers);
          setOnlinePeers(net.getOnlinePeers());
          setAvailablePeersForDM(net.getAvailablePeersForDM());

          if (serverId) {
            const updatedServer = updatedServers.find(s => s.id === serverId);
            const channelStillValid = updatedServer?.channels.find(c => c.id === channelId);
            const resolvedChannelId = channelStillValid?.id ?? pickDefaultChannelId(updatedServer);

            if (resolvedChannelId !== channelId) {
              setCurrentChannelIdState(resolvedChannelId);
            }
            const finalChannelId = resolvedChannelId || channelId;
            if (finalChannelId) {
              setMessages(net.getMessages(serverId, finalChannelId));
            }
          }
        }
        break;
      case 'peer-list':
      case 'config-sync':
        break;
      case 'error': {
        const errPayload = event.payload as { message: string; level?: string };
        if (errPayload?.message) {
          const msg = errPayload.message;
          const level = errPayload.level || 'error';
          if (level === 'error') toast.error(msg);
          else if (level === 'warn') toast.warning(msg);
          else toast.info(msg);
        }
        break;
      }
      case 'voice-state-changed': {
        if (net) {
          setIsInVoiceChannel(net.isInVoiceChannel());
          setMuted(net.isMuted());
          setActiveVoicePeers(net.getActiveVoicePeers());
        }
        break;
      }
    }
  }, [setCurrentChannelIdState, setCurrentServerIdState, setServersState]);

  // Subscribe to events and visibility/online wake recovery when network changes
  useEffect(() => {
    if (!network) return;
    networkRef.current = network;
    const unsubscribe = network.addEventListener(handleEvent);

    const onVisibilityChange = () => {
      network.handleVisibilityWake();
    };
    const onOnline = () => {
      network.handleOnlineRecovery();
    };
    const onUnload = () => {
      network.handlePageUnload();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('online', onOnline);
    window.addEventListener('pagehide', onUnload);
    window.addEventListener('beforeunload', onUnload);

    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('pagehide', onUnload);
      window.removeEventListener('beforeunload', onUnload);
    };
  }, [network, handleEvent]);

  const initializeNetwork = useCallback(async (username: string, existingId?: string) => {
    const effective = getEffectiveNetworkConfig();
    const net = new P2PNetwork(username, existingId, {
      signalingHost: effective.signalingHost,
      signalingPort: effective.signalingPort,
      signalingSecure: effective.signalingSecure,
      signalingPath: effective.signalingPath,
      iceServers: effective.iceServers,
    });
    await net.initialize();
    await net.loadPersistedData();
    await net.persistIdentity();

    setNetworkState(net);
    setLocalPeer(net.getLocalPeer());
    setIsInitialized(true);
    setConnectionStatus(net.getConnectionStatus());
    setDiagnostics(net.getConnectionDiagnostics());
    setHasStoredIdentity(true);

    const restoredServers = net.getServers();
    setServersState(restoredServers);

    if (restoredServers.length > 0) {
      const firstServer = restoredServers[0];
      const firstChannel = pickDefaultChannelId(firstServer);
      setCurrentServerIdState(firstServer.id);
      setCurrentChannelIdState(firstChannel);
      setMessages(firstChannel ? net.getMessages(firstServer.id, firstChannel) : []);
    }

    setDmConversations(net.getDMConversations());
    setOnlinePeers(net.getOnlinePeers());
    setAvailablePeersForDM(net.getAvailablePeersForDM());

    return net;
  }, [setCurrentChannelIdState, setCurrentServerIdState, setNetworkState, setServersState]);

  const initialize = useCallback(async (username: string) => {
    await initializeNetwork(username);
  }, [initializeNetwork]);

  const restoreSession = useCallback(async () => {
    const identity = await Storage.loadIdentity();
    if (!identity) throw new Error('No stored identity');
    await initializeNetwork(identity.username, identity.peerId);
  }, [initializeNetwork]);

  const createServer = useCallback(async (input: string | CreateCommunityInput) => {
    if (!network) throw new Error('Network not initialized');

    const server = await network.createServer(input);
    const defaultChannelId = pickDefaultChannelId(server);
    setServersState(network.getServers());
    setCurrentServerIdState(server.id);
    setCurrentChannelIdState(defaultChannelId);
    setConnectionStatus(network.getConnectionStatus());
    setOnlinePeers(network.getOnlinePeers());
    setMessages([]);
    setViewMode('servers');
    setAvailablePeersForDM(network.getAvailablePeersForDM());

    return server;
  }, [network, setCurrentChannelIdState, setCurrentServerIdState, setServersState]);

  const joinServer = useCallback(async (inviteCode: string) => {
    if (!network) throw new Error('Network not initialized');

    logger.log('[P2P] Joining server with invite code');
    setConnectionStatus('connecting');

    try {
      const server = await network.joinServer(inviteCode);
      const defaultChannelId = pickDefaultChannelId(server);

      setServersState(network.getServers());
      setCurrentServerIdState(server.id);
      setCurrentChannelIdState(defaultChannelId);
      setConnectionStatus(network.getConnectionStatus());
      setOnlinePeers(network.getOnlinePeers());
      setMessages(defaultChannelId ? network.getMessages(server.id, defaultChannelId) : []);
      setViewMode('servers');
      setAvailablePeersForDM(network.getAvailablePeersForDM());
    } catch (error) {
      setConnectionStatus(network.getConnectionStatus());
      logger.error('Failed to join server:', error);
      throw error;
    }
  }, [network, setCurrentChannelIdState, setCurrentServerIdState, setServersState]);

  const selectServer = useCallback((serverId: string, preferredChannelId?: string) => {
    setCurrentServerIdState(serverId);
    setCurrentDMPeerIdState(null);
    setViewMode('servers');
    const server = serversRef.current.find(s => s.id === serverId);
    const resolvedChannelId = pickDefaultChannelId(server, preferredChannelId);
    setCurrentChannelIdState(resolvedChannelId);
    if (network && resolvedChannelId) {
      setMessages(network.getMessages(serverId, resolvedChannelId));
    } else {
      setMessages([]);
    }
  }, [network, setCurrentChannelIdState, setCurrentDMPeerIdState, setCurrentServerIdState]);

  const selectChannel = useCallback((channelId: string) => {
    setCurrentChannelIdState(channelId);
    if (network && currentServerIdRef.current) {
      setMessages(network.getMessages(currentServerIdRef.current, channelId));
    }
  }, [network, setCurrentChannelIdState]);

  const getAllMessages = useCallback((): Message[] => {
    return network?.getAllMessages() || [];
  }, [network]);

  const sendMessage = useCallback(async (content: string) => {
    if (!network || !currentServerId || !currentChannelId) return;

    await network.sendMessage(currentServerId, currentChannelId, content);
    setMessages(network.getMessages(currentServerId, currentChannelId));
  }, [network, currentServerId, currentChannelId]);

  const loadOlderMessages = useCallback(async () => {
    if (!network || !currentServerId || !currentChannelId) return;
    const older = await network.loadOlderMessages(currentServerId, currentChannelId);
    if (older.length > 0) {
      setMessages([...network.getMessages(currentServerId, currentChannelId)]);
    }
  }, [network, currentServerId, currentChannelId]);

  const generateInvite = useCallback(async () => {
    if (!network || !currentServerId) throw new Error('No server selected');
    return network.generateInvite(currentServerId);
  }, [network, currentServerId]);

  // ===== Server customization =====
  const isCurrentServerHost = useMemo(
    () => !!network && !!currentServerId && network.isServerHost(currentServerId),
    [network, currentServerId]
  );

  const updateCurrentServer = useCallback(
    async (patch: { name?: string; icon?: string; channelOps?: ChannelOp[]; configPatch?: CommunityConfigPatch }) => {
      if (!network || !currentServerId) throw new Error('No server selected');
      await network.updateServer(currentServerId, patch);
      setServersState(network.getServers());
      const refreshed = network.getServer(currentServerId);
      if (refreshed && currentChannelId && !refreshed.channels.find(c => c.id === currentChannelId)) {
        const fallback = pickDefaultChannelId(refreshed);
        setCurrentChannelIdState(fallback);
        if (fallback) setMessages(network.getMessages(currentServerId, fallback));
        else setMessages([]);
      }
    },
    [network, currentServerId, currentChannelId, setCurrentChannelIdState, setServersState]
  );

  const leaveCurrentServer = useCallback(async () => {
    if (!network || !currentServerId) return;
    await network.leaveServer(currentServerId);
    setServersState(network.getServers());
  }, [network, currentServerId, setServersState]);

  const deleteCurrentServer = useCallback(async () => {
    if (!network || !currentServerId) return;
    await network.deleteServerAsHost(currentServerId);
    setServersState(network.getServers());
  }, [network, currentServerId, setServersState]);

  // DM Actions
  const openDM = useCallback((peer: PeerId) => {
    if (!network) return;

    network.getOrCreateDMConversation(peer);
    network.initiateDMConnection(peer.id);

    setCurrentDMPeerIdState(peer.id);
    setCurrentServerIdState(null);
    setCurrentChannelIdState(null);
    setViewMode('dms');
    setDmConversations(network.getDMConversations());
    setDmMessages(network.getDMMessages(peer.id));
    network.markDMAsRead(peer.id);
  }, [network, setCurrentChannelIdState, setCurrentDMPeerIdState, setCurrentServerIdState]);

  const startNewDM = useCallback((peer: PeerId) => {
    openDM(peer);
  }, [openDM]);

  const startDMByPeerId = useCallback(async (peerId: string, username?: string) => {
    if (!network) throw new Error('Network not initialized');
    if (peerId === network.getLocalPeer().id) throw new Error("That's your own peer ID");
    const peer: PeerId = { id: peerId, username: username?.trim() || `peer-${peerId.slice(0, 6)}` };
    openDM(peer);
  }, [network, openDM]);

  const sendDM = useCallback(async (content: string) => {
    if (!network || !currentDMPeerId) return;

    await network.sendDM(currentDMPeerId, content);
    setDmMessages(network.getDMMessages(currentDMPeerId));
    setDmConversations(network.getDMConversations());
  }, [network, currentDMPeerId]);

  const sendDMTyping = useCallback((isTyping: boolean) => {
    if (!network || !currentDMPeerId) return;
    network.sendDMTyping(currentDMPeerId, isTyping);
  }, [network, currentDMPeerId]);

  const markDMAsRead = useCallback(() => {
    if (!network || !currentDMPeerId) return;
    network.markDMAsRead(currentDMPeerId);
    setDmConversations(network.getDMConversations());
  }, [network, currentDMPeerId]);

  // Voice actions
  const joinVoiceChannel = useCallback(async (serverId: string, channelId: string) => {
    if (!network) return;
    await network.joinVoiceChannel(serverId, channelId);
    setIsInVoiceChannel(network.isInVoiceChannel());
    setMuted(network.isMuted());
    setActiveVoicePeers(network.getActiveVoicePeers());
  }, [network]);

  const leaveVoiceChannel = useCallback(async () => {
    await network?.leaveVoiceChannel();
    setIsInVoiceChannel(false);
    setMuted(false);
    setActiveVoicePeers([]);
  }, [network]);

  const toggleMuteCb = useCallback(() => {
    if (!network) return false;
    const m = network.toggleMute();
    setMuted(m);
    return m;
  }, [network]);

  const verifyDMPeer = useCallback(async (peerId: string) => {
    if (!network) throw new Error('Network not initialized');
    await network.verifyDMPeer(peerId);
    setDmConversations(network.getDMConversations());
  }, [network]);

  const unverifyDMPeer = useCallback(async (peerId: string) => {
    if (!network) throw new Error('Network not initialized');
    await network.unverifyDMPeer(peerId);
    setDmConversations(network.getDMConversations());
  }, [network]);

  const getDMSafetyInfo = useCallback(async (peerId: string) => {
    if (!network) return null;
    return network.getDMSafetyInfo(peerId);
  }, [network]);

  const reconfigureNetwork = useCallback(async (overrides: NetworkOverrides) => {
    if (!network) throw new Error('Network not initialized');
    saveNetworkOverrides(overrides);
    const effective = getEffectiveNetworkConfig();
    await network.reconfigureNetwork({
      signalingHost: effective.signalingHost,
      signalingPort: effective.signalingPort,
      signalingSecure: effective.signalingSecure,
      signalingPath: effective.signalingPath,
      iceServers: effective.iceServers,
    });
    setConnectionStatus(network.getConnectionStatus());
    setOnlinePeers(network.getOnlinePeers());
    setServersState(network.getServers());
    setDiagnostics(network.getConnectionDiagnostics());
  }, [network, setServersState]);

  const resetNetworkOverrides = useCallback(async () => {
    if (!network) throw new Error('Network not initialized');
    clearNetworkOverrides();
    const effective = getEffectiveNetworkConfig();
    await network.reconfigureNetwork({
      signalingHost: effective.signalingHost,
      signalingPort: effective.signalingPort,
      signalingSecure: effective.signalingSecure,
      signalingPath: effective.signalingPath,
      iceServers: effective.iceServers,
    });
    setConnectionStatus(network.getConnectionStatus());
    setOnlinePeers(network.getOnlinePeers());
    setServersState(network.getServers());
    setDiagnostics(network.getConnectionDiagnostics());
  }, [network, setServersState]);

  const reconnectNow = useCallback(async () => {
    if (!network) return;
    await network.reconnectNow();
    setConnectionStatus(network.getConnectionStatus());
    setOnlinePeers(network.getOnlinePeers());
    setDiagnostics(network.getConnectionDiagnostics());
  }, [network]);

  const disconnect = useCallback(async () => {
    if (network) {
      await network.clearPersistedData();
      await network.disconnect();
    }
    setNetworkState(null);
    setIsInitialized(false);
    setConnectionStatus('disconnected');
    setDiagnostics(null);
    setLocalPeer(null);
    setServersState([]);
    setCurrentServerIdState(null);
    setCurrentChannelIdState(null);
    setMessages([]);
    setOnlinePeers([]);
    setDmConversations([]);
    setCurrentDMPeerIdState(null);
    setDmMessages([]);
    setActiveVoicePeers([]);
    setIsInVoiceChannel(false);
    setMuted(false);
    setViewMode('servers');
    setHasStoredIdentity(false);
  }, [network, setCurrentChannelIdState, setCurrentDMPeerIdState, setCurrentServerIdState, setNetworkState, setServersState]);

  return (
    <P2PContext.Provider
      value={{
        network,
        getAllMessages,
        isInitialized,
        connectionStatus,
        localPeer,
        servers,
        currentServer,
        currentChannel,
        messages,
        onlinePeers,
        viewMode,
        setViewMode,
        dmConversations,
        currentDMPeer,
        dmMessages,
        availablePeersForDM,
        initialize,
        createServer,
        joinServer,
        selectServer,
        selectChannel,
        sendMessage,
        loadOlderMessages,
        generateInvite,
        disconnect,
        openDM,
        sendDM,
        sendDMTyping,
        markDMAsRead,
        startNewDM,
        startDMByPeerId,
        verifyDMPeer,
        unverifyDMPeer,
        getDMSafetyInfo,
        diagnostics,
        reconfigureNetwork,
        resetNetworkOverrides,
        reconnectNow,
        hasStoredIdentity,
        restoreSession,
        isCurrentServerHost,
        updateCurrentServer,
        leaveCurrentServer,
        deleteCurrentServer,
        isInVoiceChannel,
        muted,
        activeVoicePeers,
        joinVoiceChannel,
        leaveVoiceChannel,
        toggleMute: toggleMuteCb,
      }}
    >
      {children}
    </P2PContext.Provider>
  );
}

export function useP2P() {
  const context = useContext(P2PContext);
  if (!context) {
    throw new Error('useP2P must be used within a P2PProvider');
  }
  return context;
}
