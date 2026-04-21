import { useState, useEffect } from 'react';
import { ServerSidebar } from './ServerSidebar';
import { ChannelSidebar } from './ChannelSidebar';
import { MessageArea } from './MessageArea';
import { MembersSidebar } from './MembersSidebar';
import { DMList } from './DMList';
import { DMConversation } from './DMConversation';
import { useP2P } from '@/contexts/P2PContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Menu, Users, X } from 'lucide-react';

export function ChatLayout() {
  const { currentServer, viewMode, currentChannel, currentDMPeer } = useP2P();
  const isMobile = useIsMobile();
  const [navOpen, setNavOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);

  // Auto-close drawers when a channel/DM is selected (mobile)
  useEffect(() => {
    if (isMobile) setNavOpen(false);
  }, [currentChannel?.id, currentDMPeer?.id, viewMode, isMobile]);

  // Close members panel when switching context
  useEffect(() => {
    setMembersOpen(false);
  }, [currentServer?.id, viewMode]);

  if (!isMobile) {
    return (
      <div className="h-screen flex overflow-hidden bg-background">
        <ServerSidebar />
        {viewMode === 'dms' ? (
          <>
            <DMList />
            <DMConversation />
          </>
        ) : (
          <>
            <ChannelSidebar />
            <MessageArea />
            {currentServer && <MembersSidebar />}
          </>
        )}
      </div>
    );
  }

  // Mobile layout: drawer pattern
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background relative">
      {/* Top bar */}
      <div className="h-12 flex items-center justify-between px-3 border-b border-border bg-card shrink-0 z-30">
        <button
          onClick={() => setNavOpen(true)}
          className="p-2 -ml-2 text-foreground hover:bg-channel-hover rounded-md"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="text-sm font-semibold text-foreground truncate">
          {viewMode === 'dms'
            ? currentDMPeer?.username || 'Direct Messages'
            : currentChannel
            ? `#${currentChannel.name}`
            : currentServer?.name || 'P2P Chat'}
        </div>
        {viewMode === 'servers' && currentServer ? (
          <button
            onClick={() => setMembersOpen(true)}
            className="p-2 -mr-2 text-foreground hover:bg-channel-hover rounded-md"
            aria-label="Show members"
          >
            <Users className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-9" />
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-0 flex">
        {viewMode === 'dms' ? (
          <DMConversation />
        ) : (
          <MessageArea />
        )}
      </div>

      {/* Backdrop */}
      {(navOpen || membersOpen) && (
        <div
          className="absolute inset-0 bg-background/70 backdrop-blur-sm z-40"
          onClick={() => {
            setNavOpen(false);
            setMembersOpen(false);
          }}
        />
      )}

      {/* Left drawer: server + channel/DM list */}
      <div
        className={cn(
          'absolute inset-y-0 left-0 z-50 flex transition-transform duration-200',
          navOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <ServerSidebar />
        {viewMode === 'dms' ? <DMList /> : <ChannelSidebar />}
        <button
          onClick={() => setNavOpen(false)}
          className="absolute top-2 -right-10 p-2 bg-card border border-border rounded-md text-foreground hover:bg-channel-hover"
          aria-label="Close navigation"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Right drawer: members */}
      {viewMode === 'servers' && currentServer && (
        <div
          className={cn(
            'absolute inset-y-0 right-0 z-50 transition-transform duration-200',
            membersOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <MembersSidebar />
        </div>
      )}
    </div>
  );
}
