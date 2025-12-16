import { useState } from 'react';
import { useP2P } from '@/contexts/P2PContext';
import { cn } from '@/lib/utils';
import { Hash, Volume2, ChevronDown, Copy, Users, Settings, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';

export function ChannelSidebar() {
  const { currentServer, currentChannel, selectChannel, generateInvite, onlinePeers } = useP2P();
  const [textChannelsOpen, setTextChannelsOpen] = useState(true);
  const [voiceChannelsOpen, setVoiceChannelsOpen] = useState(true);

  if (!currentServer) {
    return (
      <aside className="w-60 bg-card flex flex-col border-r border-border">
        <div className="p-4 flex items-center justify-center h-full">
          <p className="text-muted-foreground text-sm text-center">
            Select or create a server to get started
          </p>
        </div>
      </aside>
    );
  }

  const textChannels = currentServer.channels.filter(c => c.type === 'text');
  const voiceChannels = currentServer.channels.filter(c => c.type === 'voice');

  const handleCopyInvite = async () => {
    try {
      const invite = await generateInvite();
      await navigator.clipboard.writeText(invite);
      toast.success('Invite code copied to clipboard');
    } catch (error) {
      toast.error('Failed to generate invite');
    }
  };

  return (
    <aside className="w-60 bg-card flex flex-col border-r border-border">
      {/* Server Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-border shadow-sm">
        <h2 className="font-semibold text-foreground truncate">{currentServer.name}</h2>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Invite Button */}
      <div className="px-2 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyInvite}
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-channel-hover"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite People</span>
        </Button>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4">
        {/* Text Channels */}
        <Collapsible open={textChannelsOpen} onOpenChange={setTextChannelsOpen}>
          <CollapsibleTrigger className="flex items-center gap-1 w-full px-1 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors">
            <ChevronDown className={cn(
              "w-3 h-3 transition-transform",
              !textChannelsOpen && "-rotate-90"
            )} />
            Text Channels
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-0.5 mt-1">
            {textChannels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => selectChannel(channel.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-md",
                  "text-muted-foreground transition-colors",
                  currentChannel?.id === channel.id
                    ? "bg-channel-hover text-foreground"
                    : "hover:bg-channel-hover hover:text-secondary-foreground"
                )}
              >
                <Hash className="w-4 h-4 flex-shrink-0" />
                <span className="truncate text-sm">{channel.name}</span>
              </button>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Voice Channels */}
        {voiceChannels.length > 0 && (
          <Collapsible open={voiceChannelsOpen} onOpenChange={setVoiceChannelsOpen}>
            <CollapsibleTrigger className="flex items-center gap-1 w-full px-1 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors">
              <ChevronDown className={cn(
                "w-3 h-3 transition-transform",
                !voiceChannelsOpen && "-rotate-90"
              )} />
              Voice Channels
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-0.5 mt-1">
              {voiceChannels.map((channel) => (
                <button
                  key={channel.id}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-md",
                    "text-muted-foreground transition-colors",
                    "hover:bg-channel-hover hover:text-secondary-foreground"
                  )}
                >
                  <Volume2 className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate text-sm">{channel.name}</span>
                </button>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>

      {/* User Panel */}
      <div className="h-14 px-2 flex items-center gap-2 bg-sidebar border-t border-border">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">
            {onlinePeers[0]?.username?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-status-online border-2 border-sidebar" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {onlinePeers[0]?.username || 'Anonymous'}
          </p>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>
        <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
