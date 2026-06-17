import { useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useP2P } from '@/contexts/P2PContext';
import { Hash, Users } from 'lucide-react';
import { MessageInput } from './MessageInput';
import { MessageItem } from './MessageItem';
import { VoiceChannelView } from './VoiceChannelView';

export function MessageArea() {
  const { currentServer, currentChannel, messages, onlinePeers, loadOlderMessages } = useP2P();
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const loadingOlderRef = useRef(false);
  const lastTopLoadKeyRef = useRef<string | null>(null);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 76,
    overscan: 10,
    getItemKey: (index) => messages[index]?.id || index,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length === 0 || !stickToBottomRef.current) return;
    virtualizer.scrollToIndex(messages.length - 1, { align: 'end' });
  }, [messages.length, virtualizer]);

  useEffect(() => {
    const firstItem = virtualItems[0];
    const oldestMessageId = messages[0]?.id;
    if (
      !firstItem ||
      firstItem.index > 2 ||
      loadingOlderRef.current ||
      messages.length === 0 ||
      !oldestMessageId ||
      lastTopLoadKeyRef.current === oldestMessageId
    ) {
      return;
    }

    lastTopLoadKeyRef.current = oldestMessageId;
    loadingOlderRef.current = true;
    loadOlderMessages().finally(() => {
      loadingOlderRef.current = false;
    });
  }, [loadOlderMessages, messages.length, virtualItems]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  };

  if (!currentServer || !currentChannel) {
    return (
      <main className="flex-1 flex flex-col bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 animate-in px-6">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-secondary flex items-center justify-center">
              <Hash className="w-10 h-10 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Welcome to OffGrid</h2>
              <p className="text-muted-foreground mt-1">
                Create or join a server to start chatting
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (currentChannel.type === 'voice') {
    return <VoiceChannelView />;
  }

  return (
    <main className="flex-1 flex flex-col bg-background min-w-0">
      {/* Channel Header — only on desktop, mobile uses ChatLayout top bar */}
      <header className="hidden md:flex h-12 px-4 items-center justify-between border-b border-border shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Hash className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <span className="font-semibold text-foreground truncate">{currentChannel.name}</span>
          {currentChannel.description && (
            <>
              <div className="w-px h-5 bg-border mx-2 flex-shrink-0" />
              <span className="text-sm text-muted-foreground truncate">
                {currentChannel.description}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <Users className="w-4 h-4" />
          <span>{onlinePeers.length} online</span>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
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
                  No central message server involved. Your data stays with your peers.
                </p>
              </div>
            </div>
          )}

          {/* Message List */}
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              position: 'relative',
            }}
          >
            {virtualItems.map((virtualItem) => {
              const message = messages[virtualItem.index];
              if (!message) return null;
              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <MessageItem
                    message={message}
                    showAvatar={virtualItem.index === 0 || messages[virtualItem.index - 1]?.author.id !== message.author.id}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Message Input */}
      <MessageInput />
    </main>
  );
}
