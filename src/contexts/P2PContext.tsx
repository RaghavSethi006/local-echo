import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { P2PNetwork } from '@/lib/p2p-network';
import { Server, Channel, Message, PeerId, P2PEvent, ConnectionStatus } from '@/types/p2p';

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
  
  // Actions
  initialize: (username: string) => Promise<void>;
  createServer: (name: string) => Promise<Server>;
  joinServer: (inviteCode: string) => Promise<void>;
  selectServer: (serverId: string) => void;
  selectChannel: (channelId: string) => void;
  sendMessage: (content: string) => void;
  generateInvite: () => Promise<string>;
  disconnect: () => void;
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

  const currentServer = servers.find(s => s.id === currentServerId) || null;
  const currentChannel = currentServer?.channels.find(c => c.id === currentChannelId) || null;

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
        break;
      case 'peer-left':
        setOnlinePeers(prev => prev.filter(p => p.id !== (event.payload as PeerId).id));
        break;
      case 'host-changed':
        // Refresh connection status
        if (network) {
          setConnectionStatus(network.getConnectionStatus());
        }
        break;
    }
  }, [currentServerId, currentChannelId, network]);

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
    
    return server;
  }, [network]);

  const joinServer = useCallback(async (inviteCode: string) => {
    if (!network) throw new Error('Network not initialized');
    
    // In a real implementation, this would involve WebRTC signaling
    // For demo purposes, we'll simulate joining
    console.log('[P2P] Joining server with invite:', inviteCode);
    
    // Decode invite to get server info
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
      
      // For demo, add server locally
      setServers(prev => [...prev, server]);
      setCurrentServerId(server.id);
      setCurrentChannelId('general');
      setConnectionStatus('connecting');
      setOnlinePeers([network.getLocalPeer()]);
      setMessages([]);
      
      // Simulate connection delay
      setTimeout(() => {
        setConnectionStatus('connected');
      }, 1000);
    } catch (error) {
      console.error('Invalid invite code');
      throw new Error('Invalid invite code');
    }
  }, [network]);

  const selectServer = useCallback((serverId: string) => {
    setCurrentServerId(serverId);
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
        initialize,
        createServer,
        joinServer,
        selectServer,
        selectChannel,
        sendMessage,
        generateInvite,
        disconnect,
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
