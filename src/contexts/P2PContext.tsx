import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo, ReactNode } from 'react';
import { P2PNetwork } from '@/lib/p2p-network';
import { Server, Channel, Message, PeerId, P2PEvent, ConnectionStatus, ViewMode, DMConversation, DirectMessage, ChannelOp } from '@/types/p2p';
import type { CommunityConfigPatch, CreateCommunityInput } from '@/types/community';
import * as Storage from '@/lib/storage';
import { sendBrowserNotification } from '@/hooks/use-notifications';

interface P2PContextType {
  network: P2PNetwork | null;
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
  selectServer: (serverId: string) => void;
  selectChannel: (channelId: string) => void;
  sendMessage: (content: string) => void;
  loadOlderMessages: () => Promise<void>;
  generateInvite: () => Promise<string>;
  disconnect: () => void;

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

  // Persistence
  hasStoredIdentity: boolean;
  restoreSession: () => Promise<void>;
}

const P2PContext = createContext<P2PContextType | null>(null);

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

  const currentServer = useMemo(
    () => servers.find(s => s.id === currentServerId) || null,
    [servers, currentServerId]
  );
  const currentChannel = useMemo(
    () => currentServer?.channels.find(c => c.id === currentChannelId) || null,
    [currentServer, currentChannelId]
  );
  const currentDMPeer = dmConversations.find(c => c.peerId.id === currentDMPeerId)?.peerId || null;

  const setNetworkState = useCallback((net: P2PNetwork | null) => {
    setNetwork(net);
    networkRef.current = net;
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
    Storage.loadIdentity().then(identity => {
      if (identity) {
        setHasStoredIdentity(true);
      }
    }).catch(() => {});
  }, []);

  // Handle P2P events
  const handleEvent = useCallback((event: P2PEvent) => {
    const net = networkRef.current;
    const serverId = currentServerIdRef.current;
    const channelId = currentChannelIdRef.current;
    const dmPeerId = currentDMPeerIdRef.current;

    console.log('[P2P Context] Event:', event.type);

    switch (event.type) {
      case 'message':
        if (net && serverId && channelId) {
          const msg = event.payload as Message;
          if (msg.serverId === serverId && msg.channelId === channelId) {
            setMessages(net.getMessages(serverId, channelId));
          }
        }
        break;
      case 'peer-joined':
        if (net) {
          setOnlinePeers(net.getOnlinePeers());
          setServers(net.getServers());
          setAvailablePeersForDM(net.getAvailablePeersForDM());
        }
        break;
      case 'peer-left':
        if (net) {
          setOnlinePeers(net.getOnlinePeers());
          setServers(net.getServers());
        }
        break;
      case 'host-changed':
        if (net) {
          setConnectionStatus(net.getConnectionStatus());
          setServers(net.getServers());
        }
        break;
      case 'dm-message':
        if (net) {
          const payload = event.payload as { dm?: DirectMessage; incoming?: boolean } | { peerId?: string; connectionType?: string } | { merged?: number } | DirectMessage;
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
        if (net) {
          setDmConversations(net.getDMConversations());
        }
        break;
      case 'server-updated':
        if (net) {
          setServers(net.getServers());
        }
        break;
      case 'server-deleted':
        if (net) {
          const remaining = net.getServers();
          setServers(remaining);
          const deletedId = (event.payload as any)?.serverId;
          if (deletedId === serverId) {
            const next = remaining[0];
            if (next) {
              setCurrentServerIdState(next.id);
              setCurrentChannelIdState(next.channels[0]?.id || null);
              setMessages(net.getMessages(next.id, next.channels[0]?.id || ''));
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
          setServers(updatedServers);
          setOnlinePeers(net.getOnlinePeers());
          setAvailablePeersForDM(net.getAvailablePeersForDM());

          if (serverId) {
            const updatedServer = updatedServers.find(s => s.id === serverId);
            const channelStillValid = updatedServer?.channels.find(c => c.id === channelId);
            const resolvedChannelId = channelStillValid?.id
              ?? updatedServer?.channels.filter(c => c.type === 'text')[0]?.id
              ?? null;

            if (resolvedChannelId && resolvedChannelId !== channelId) {
              setCurrentChannelIdState(resolvedChannelId);
            }
            const finalChannelId = resolvedChannelId || channelId;
            if (finalChannelId) {
              setMessages(net.getMessages(serverId, finalChannelId));
            }
          }
        }
        break;
      case 'history-offer':
      case 'history-merge':
      case 'peer-list':
      case 'config-sync':
        break;
    }
  }, []);

  // Subscribe to events when network changes
  useEffect(() => {
    if (!network) return;
    networkRef.current = network;
    const unsubscribe = network.addEventListener(handleEvent);
    return () => unsubscribe();
  }, [network, handleEvent]);

  const initializeNetwork = useCallback(async (username: string, existingId?: string) => {
    const net = new P2PNetwork(username, existingId);
    await net.initialize();
    
    // Load persisted data
    await net.loadPersistedData();
    
    // Save identity
    await net.persistIdentity();
    
    setNetworkState(net);
    setLocalPeer(net.getLocalPeer());
    setIsInitialized(true);
    setConnectionStatus('disconnected');
    setHasStoredIdentity(true);

    // Restore servers and messages from persisted data
    const restoredServers = net.getServers();
    setServers(restoredServers);
    
    if (restoredServers.length > 0) {
      const firstServer = restoredServers[0];
      setCurrentServerIdState(firstServer.id);
      const firstChannel = firstServer.channels[0]?.id || 'general';
      setCurrentChannelIdState(firstChannel);
      setMessages(net.getMessages(firstServer.id, firstChannel));
    }

    // Restore DM conversations
    setDmConversations(net.getDMConversations());
    setOnlinePeers(net.getOnlinePeers());
    setAvailablePeersForDM(net.getAvailablePeersForDM());
    
    return net;
  }, []);

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
    setServers(network.getServers());
    setCurrentServerIdState(server.id);
    setCurrentChannelIdState(server.channels[0]?.id || null);
    setConnectionStatus(network.getConnectionStatus());
    setOnlinePeers(network.getOnlinePeers());
    setMessages([]);
    setViewMode('servers');
    setAvailablePeersForDM(network.getAvailablePeersForDM());
    
    return server;
  }, [network]);

  const joinServer = useCallback(async (inviteCode: string) => {
    if (!network) throw new Error('Network not initialized');
    
    console.log('[P2P] Joining server with invite code');
    setConnectionStatus('connecting');
    
    try {
      const server = await network.joinServer(inviteCode);
      
      setServers(network.getServers());
      setCurrentServerIdState(server.id);
      setCurrentChannelIdState(null);
      setConnectionStatus(network.getConnectionStatus());
      setOnlinePeers(network.getOnlinePeers());
      setMessages([]);
      setViewMode('servers');
      setAvailablePeersForDM(network.getAvailablePeersForDM());
    } catch (error) {
      setConnectionStatus('disconnected');
      console.error('Failed to join server:', error);
      throw error;
    }
  }, [network]);

  const selectServer = useCallback((serverId: string) => {
    setCurrentServerIdState(serverId);
    setCurrentDMPeerIdState(null);
    setViewMode('servers');
    const server = servers.find(s => s.id === serverId);
    if (server) {
      setCurrentChannelIdState(server.channels[0]?.id || null);
      if (network) {
        setMessages(network.getMessages(serverId, server.channels[0]?.id || ''));
      }
    }
  }, [servers, network]);

  const selectChannel = useCallback((channelId: string) => {
    setCurrentChannelIdState(channelId);
    if (network && currentServerId) {
      setMessages(network.getMessages(currentServerId, channelId));
    }
  }, [network, currentServerId]);

  const sendMessage = useCallback((content: string) => {
    if (!network || !currentServerId || !currentChannelId) return;
    
    network.sendMessage(currentServerId, currentChannelId, content);
    setMessages(network.getMessages(currentServerId, currentChannelId));
  }, [network, currentServerId, currentChannelId]);

  const loadOlderMessages = useCallback(async () => {
    if (!network || !currentServerId || !currentChannelId) return;
    const updated = await network.loadOlderMessages(currentServerId, currentChannelId);
    setMessages([...updated]);
  }, [network, currentServerId, currentChannelId]);

  const generateInvite = useCallback(async () => {
    if (!network || !currentServerId) throw new Error('No server selected');
    return network.generateInvite(currentServerId);
  }, [network, currentServerId]);

  // ===== Server customization =====
  const isCurrentServerHost =
    !!network && !!currentServerId && network.isServerHost(currentServerId);

  const updateCurrentServer = useCallback(
    async (patch: { name?: string; icon?: string; channelOps?: ChannelOp[]; configPatch?: CommunityConfigPatch }) => {
      if (!network || !currentServerId) throw new Error('No server selected');
      await network.updateServer(currentServerId, patch);
      setServers(network.getServers());
      // If the current channel was deleted, fall back to first remaining
      const refreshed = network.getServer(currentServerId);
      if (refreshed && currentChannelId && !refreshed.channels.find(c => c.id === currentChannelId)) {
      const fallback = refreshed.channels[0]?.id || null;
      setCurrentChannelIdState(fallback);
        if (fallback) setMessages(network.getMessages(currentServerId, fallback));
        else setMessages([]);
      }
    },
    [network, currentServerId, currentChannelId]
  );

  const leaveCurrentServer = useCallback(async () => {
    if (!network || !currentServerId) return;
    await network.leaveServer(currentServerId);
    // server-deleted event handler will reset selection
    setServers(network.getServers());
  }, [network, currentServerId]);

  const deleteCurrentServer = useCallback(async () => {
    if (!network || !currentServerId) return;
    await network.deleteServerAsHost(currentServerId);
    setServers(network.getServers());
  }, [network, currentServerId]);

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
  }, [network]);

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

  const disconnect = useCallback(async () => {
    if (network) {
      await network.clearPersistedData();
      network.disconnect();
    }
    setNetworkState(null);
    setIsInitialized(false);
    setConnectionStatus('disconnected');
    setLocalPeer(null);
    setServers([]);
    setCurrentServerIdState(null);
    setCurrentChannelIdState(null);
    setMessages([]);
    setOnlinePeers([]);
    setDmConversations([]);
    setCurrentDMPeerIdState(null);
    setDmMessages([]);
    setViewMode('servers');
    setHasStoredIdentity(false);
  }, [network]);

  return (
    <P2PContext.Provider
      value={{
        network,
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
        hasStoredIdentity,
        restoreSession,
        isCurrentServerHost,
        updateCurrentServer,
        leaveCurrentServer,
        deleteCurrentServer,
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
