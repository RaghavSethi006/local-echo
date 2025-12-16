import { useRef, useEffect } from 'react';
import { useP2P } from '@/contexts/P2PContext';
import { cn } from '@/lib/utils';
import { Hash, Bell, Pin, Users, Search, Inbox, HelpCircle } from 'lucide-react';
import { MessageInput } from './MessageInput';
import { MessageItem } from './MessageItem';

export function MessageArea() {
  const { currentServer, currentChannel, messages, onlinePeers } = useP2P();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!currentServer || !currentChannel) {
    return (
      <main className="flex-1 flex flex-col bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 animate-in">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-secondary flex items-center justify-center">
              <Hash className="w-10 h-10 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Welcome to P2P Chat</h2>
              <p className="text-muted-foreground mt-1">
                Create or join a server to start chatting
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col bg-background">
      {/* Channel Header */}
      <header className="h-12 px-4 flex items-center justify-between border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Hash className="w-5 h-5 text-muted-foreground" />
          <span className="font-semibold text-foreground">{currentChannel.name}</span>
          {currentChannel.description && (
            <>
              <div className="w-px h-5 bg-border mx-2" />
              <span className="text-sm text-muted-foreground truncate max-w-xs">
                {currentChannel.description}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Pin className="w-5 h-5" />
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Users className="w-5 h-5" />
          </button>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search"
              className="w-36 h-6 pl-8 pr-2 rounded bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Inbox className="w-5 h-5" />
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="py-4">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="px-4 mb-6">
              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <Hash className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Welcome to #{currentChannel.name}!
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      This is the start of the channel.
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Messages are transmitted peer-to-peer with end-to-end encryption. 
                  No servers involved — your data stays with you.
                </p>
              </div>
            </div>
          )}

          {/* Message List */}
          <div className="space-y-0.5">
            {messages.map((message, index) => (
              <MessageItem 
                key={message.id} 
                message={message}
                showAvatar={index === 0 || messages[index - 1]?.author.id !== message.author.id}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Message Input */}
      <MessageInput />
    </main>
  );
}
