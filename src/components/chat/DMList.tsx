import { useState } from 'react';
import { useP2P } from '@/contexts/P2PContext';
import { cn } from '@/lib/utils';
import { Plus, Search, Settings, MessageCircle, Wifi, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NewDMDialog } from './NewDMDialog';
import { PeerId } from '@/types/p2p';

export function DMList() {
  const { dmConversations, currentDMPeer, openDM, localPeer, onlinePeers } = useP2P();
  const [showNewDMDialog, setShowNewDMDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = dmConversations.filter(conv =>
    conv.peerId.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isOnline = (peerId: string) => onlinePeers.some(p => p.id === peerId);

  const getConnectionIcon = (type: 'direct' | 'relay' | 'disconnected') => {
    switch (type) {
      case 'direct': return <Wifi className="w-3 h-3 text-success" />;
      case 'relay': return <Radio className="w-3 h-3 text-warning" />;
      default: return null;
    }
  };

  // Generate consistent color based on username
  const getAvatarColor = (username: string) => {
    const colors = [
      'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
      'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
      'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
      'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500',
    ];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <aside className="w-60 max-w-[75vw] bg-card flex flex-col border-r border-border">
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-border shadow-sm">
        <h2 className="font-semibold text-foreground">Direct Messages</h2>
      </div>

      {/* Search */}
      <div className="px-2 py-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find or start a conversation"
            className="w-full h-8 pl-8 pr-3 rounded-md bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* New DM Button */}
      <div className="px-2 pb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowNewDMDialog(true)}
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-channel-hover"
        >
          <Plus className="w-4 h-4" />
          <span>New Message</span>
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {filteredConversations.length === 0 ? (
          <div className="px-2 py-8 text-center">
            <MessageCircle className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'No conversations found' : 'No messages yet'}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Start a conversation with someone
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <button
              key={conv.peerId.id}
              onClick={() => openDM(conv.peerId)}
              className={cn(
                "w-full flex items-center gap-3 px-2 py-2 rounded-md",
                "transition-colors text-left",
                currentDMPeer?.id === conv.peerId.id
                  ? "bg-channel-hover"
                  : "hover:bg-channel-hover/50"
              )}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  "text-xs font-semibold text-white",
                  getAvatarColor(conv.peerId.username)
                )}>
                  {conv.peerId.username.charAt(0).toUpperCase()}
                </div>
                <div className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card",
                  isOnline(conv.peerId.id) ? "bg-status-online" : "bg-status-offline"
                )} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    "text-sm truncate",
                    conv.unreadCount > 0 ? "font-semibold text-foreground" : "text-secondary-foreground"
                  )}>
                    {conv.peerId.username}
                  </span>
                  {getConnectionIcon(conv.connectionType)}
                </div>
                {conv.lastMessage && (
                  <p className={cn(
                    "text-xs truncate",
                    conv.unreadCount > 0 ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {conv.lastMessage.from.id === localPeer?.id ? 'You: ' : ''}
                    {conv.lastMessage.content}
                  </p>
                )}
                {conv.isTyping && (
                  <p className="text-xs text-primary italic">typing...</p>
                )}
              </div>

              {/* Meta */}
              <div className="flex-shrink-0 flex flex-col items-end gap-1">
                {conv.lastMessage && (
                  <span className="text-[10px] text-muted-foreground">
                    {formatTime(conv.lastMessage.timestamp)}
                  </span>
                )}
                {conv.unreadCount > 0 && (
                  <div className="min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center px-1">
                    {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </div>

      {/* User Panel */}
      <div className="h-14 px-2 flex items-center gap-2 bg-sidebar border-t border-border">
        <div className="relative">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white",
            getAvatarColor(localPeer?.username || '')
          )}>
            {localPeer?.username?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-status-online border-2 border-sidebar" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {localPeer?.username || 'Anonymous'}
          </p>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>
        <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <NewDMDialog open={showNewDMDialog} onOpenChange={setShowNewDMDialog} />
    </aside>
  );
}
