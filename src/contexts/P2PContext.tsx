import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { P2PNetwork } from '@/lib/p2p-network';
import { Server, Channel, Message, PeerId, P2PEvent, ConnectionStatus, ViewMode, DMConversation, DirectMessage } from '@/types/p2p';

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
  createServer: (name: string) => Promise<Server>;
  joinServer: (inviteCode: string) => Promise<void>;
  selectServer: (serverId: string) => void;
  selectChannel: (channelId: string) => void;
  sendMessage: (content: string) => void;
  generateInvite: () => Promise<string>;
  disconnect: () => void;
  
  // DM Actions
  openDM: (peer: PeerId) => void;
  sendDM: (content: string) => void;
  sendDMTyping: (isTyping: boolean) => void;
  markDMAsRead: () => void;
  startNewDM: (peer: PeerId) => void;
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
  
  // View mode (servers or DMs)
  const [viewMode, setViewMode] = useState<ViewMode>('servers');
  
  // DM State
  const [dmConversations, setDmConversations] = useState<DMConversation[]>([]);
  const [currentDMPeerId, setCurrentDMPeerId] = useState<string | null>(null);
  const [dmMessages, setDmMessages] = useState<DirectMessage[]>([]);
  const [availablePeersForDM, setAvailablePeersForDM] = useState<PeerId[]>([]);

  const currentServer = servers.find(s => s.id === currentServerId) || null;
  const currentChannel = currentServer?.channels.find(c => c.id === currentChannelId) || null;
  const currentDMPeer = dmConversations.find(c => c.peerId.id === currentDMPeerId)?.peerId || null;

  // Handle P2P events
  const handleEvent = useCallback((event: P2PEvent) => {
    console.log('[P2P Context] Event:', event.type);
    
    switch (event.type) {
      case 'message':
        if (currentServerId && currentChannelId) {
          const msg = event.payload as Message;
          if (msg.serverId === currentServerId && msg.channelId === currentChannelId) {
            setMessages(prev => {
              if (prev.find(m => m.id === msg.id)) return prev;
              return [...prev, msg].sort((a, b) => a.seq - b.seq);
            });
          }
        }
        break;
      case 'peer-joined':
        setOnlinePeers(prev => {
          const peer = event.payload as PeerId;
          if (prev.find(p => p.id === peer.id)) return prev;
          return [...prev, peer];
        });
        // Update available peers for DM
        if (network) {
          setAvailablePeersForDM(network.getAvailablePeersForDM());
        }
        break;
      case 'peer-left':
        setOnlinePeers(prev => prev.filter(p => p.id !== (event.payload as PeerId).id));
        break;
      case 'host-changed':
        if (network) {
          setConnectionStatus(network.getConnectionStatus());
        }
        break;
      case 'dm-message':
        // Refresh DM conversations and messages
        if (network) {
          setDmConversations(network.getDMConversations());
          if (currentDMPeerId) {
            setDmMessages(network.getDMMessages(currentDMPeerId));
          }
        }
        break;
      case 'dm-typing':
        // Refresh to get typing state
        if (network) {
          setDmConversations(network.getDMConversations());
        }
        break;
    }
  }, [currentServerId, currentChannelId, network, currentDMPeerId]);

  // Subscribe to events when network changes
  useEffect(() => {
    if (!network) return;
    
    const unsubscribe = network.addEventListener(handleEvent);
    return () => unsubscribe();
  }, [network, handleEvent]);

  const initialize = useCallback(async (username: string) => {
    const net = new P2PNetwork(username);
    await net.initialize();
    setNetwork(net);
    setLocalPeer(net.getLocalPeer());
    setIsInitialized(true);
    setConnectionStatus('disconnected');
  }, []);

  const createServer = useCallback(async (name: string) => {
    if (!network) throw new Error('Network not initialized');
    
    const server = await network.createServer(name);
    setServers(network.getServers());
    setCurrentServerId(server.id);
    setCurrentChannelId(server.channels[0]?.id || null);
    setConnectionStatus(network.getConnectionStatus());
    setOnlinePeers(network.getOnlinePeers());
    setMessages([]);
    setViewMode('servers');
    setAvailablePeersForDM(network.getAvailablePeersForDM());
    
    return server;
  }, [network]);

  const joinServer = useCallback(async (inviteCode: string) => {
    if (!network) throw new Error('Network not initialized');
    
    console.log('[P2P] Joining server with invite:', inviteCode);
    
    try {
      const invite = JSON.parse(atob(inviteCode));
      const server: Server = {
        id: invite.serverId,
        name: invite.serverName,
        channels: [
          { id: 'general', name: 'general', type: 'text' },
          { id: 'random', name: 'random', type: 'text' },
        ],
        members: [network.getLocalPeer()],
        hostId: invite.hostId?.id || 'host',
        createdAt: Date.now(),
      };
      
      setServers(prev => [...prev, server]);
      setCurrentServerId(server.id);
      setCurrentChannelId('general');
      setConnectionStatus('connecting');
      setOnlinePeers([network.getLocalPeer()]);
      setMessages([]);
      setViewMode('servers');
      
      setTimeout(() => {
        setConnectionStatus('connected');
        setAvailablePeersForDM(network.getAvailablePeersForDM());
      }, 1000);
    } catch (error) {
      console.error('Invalid invite code');
      throw new Error('Invalid invite code');
    }
  }, [network]);

  const selectServer = useCallback((serverId: string) => {
    setCurrentServerId(serverId);
    setCurrentDMPeerId(null);
    setViewMode('servers');
    const server = servers.find(s => s.id === serverId);
    if (server) {
      setCurrentChannelId(server.channels[0]?.id || null);
      if (network) {
        setMessages(network.getMessages(serverId, server.channels[0]?.id || ''));
      }
    }
  }, [servers, network]);

  const selectChannel = useCallback((channelId: string) => {
    setCurrentChannelId(channelId);
    if (network && currentServerId) {
      setMessages(network.getMessages(currentServerId, channelId));
    }
  }, [network, currentServerId]);

  const sendMessage = useCallback((content: string) => {
    if (!network || !currentServerId || !currentChannelId) return;
    
    network.sendMessage(currentServerId, currentChannelId, content);
    setMessages(network.getMessages(currentServerId, currentChannelId));
  }, [network, currentServerId, currentChannelId]);

  const generateInvite = useCallback(async () => {
    if (!network || !currentServerId) throw new Error('No server selected');
    return network.generateInvite(currentServerId);
  }, [network, currentServerId]);

  // DM Actions
  const openDM = useCallback((peer: PeerId) => {
    if (!network) return;
    
    network.getOrCreateDMConversation(peer);
    network.initiateDMConnection(peer.id);
    
    setCurrentDMPeerId(peer.id);
    setCurrentServerId(null);
    setCurrentChannelId(null);
    setViewMode('dms');
    setDmConversations(network.getDMConversations());
    setDmMessages(network.getDMMessages(peer.id));
    network.markDMAsRead(peer.id);
  }, [network]);

  const startNewDM = useCallback((peer: PeerId) => {
    openDM(peer);
  }, [openDM]);

  const sendDM = useCallback((content: string) => {
    if (!network || !currentDMPeerId) return;
    
    network.sendDM(currentDMPeerId, content);
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

  const disconnect = useCallback(() => {
    if (network) {
      network.disconnect();
    }
    setNetwork(null);
    setIsInitialized(false);
    setConnectionStatus('disconnected');
    setLocalPeer(null);
    setServers([]);
    setCurrentServerId(null);
    setCurrentChannelId(null);
    setMessages([]);
    setOnlinePeers([]);
    setDmConversations([]);
    setCurrentDMPeerId(null);
    setDmMessages([]);
    setViewMode('servers');
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
        generateInvite,
        disconnect,
        openDM,
        sendDM,
        sendDMTyping,
        markDMAsRead,
        startNewDM,
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
