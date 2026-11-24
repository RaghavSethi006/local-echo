import { useRef, useEffect, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useP2P } from '@/contexts/P2PContext';
import { ArrowDown, Hash, Loader2, Users } from 'lucide-react';
import { MessageInput } from './MessageInput';
import { MessageItem } from './MessageItem';
import { VoiceChannelView } from './VoiceChannelView';

export function MessageArea() {
  const { currentServer, currentChannel, messages, onlinePeers, loadOlderMessages } = useP2P();
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const loadingOlderRef = useRef(false);
  const lastTopLoadKeyRef = useRef<string | null>(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 76,
    overscan: 10,
    getItemKey: (index) => messages[index]?.id || index,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const oldestMessageId = messages[0]?.id;
  const firstVisibleIndex = virtualItems[0]?.index;

  useEffect(() => {
    stickToBottomRef.current = true;
    lastTopLoadKeyRef.current = null;
    setShowJumpToLatest(false);
  }, [currentServer?.id, currentChannel?.id]);

  // Auto-scroll to bottom on new messages when anchored
  useEffect(() => {
    if (messages.length === 0 || !stickToBottomRef.current) return;
    virtualizer.scrollToIndex(messages.length - 1, { align: 'end' });
  }, [messages.length, virtualizer]);

  useEffect(() => {
    if (
      firstVisibleIndex === undefined ||
      firstVisibleIndex > 2 ||
      loadingOlderRef.current ||
      messages.length === 0 ||
      !oldestMessageId ||
      lastTopLoadKeyRef.current === oldestMessageId
    ) {
      return;
    }

    lastTopLoadKeyRef.current = oldestMessageId;
    loadingOlderRef.current = true;
    setLoadingOlder(true);
    loadOlderMessages().finally(() => {
      loadingOlderRef.current = false;
      setLoadingOlder(false);
    });
  }, [firstVisibleIndex, loadOlderMessages, messages.length, oldestMessageId]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    stickToBottomRef.current = nearBottom;
    setShowJumpToLatest(!nearBottom && messages.length > 0);
  };

  const jumpToLatest = () => {
    if (messages.length === 0) return;
    stickToBottomRef.current = true;
    setShowJumpToLatest(false);
    virtualizer.scrollToIndex(messages.length - 1, { align: 'end' });
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
    <main className="flex-1 flex flex-col bg-background min-w-0 relative">
      {/* Channel Header — desktop only, mobile uses ChatLayout top bar */}
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
        <div className="flex items-center gap-2 text-muted-foreground text-xs tabular-nums">
          <Users className="w-4 h-4" />
          <span>{onlinePeers.length} online</span>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
        <div className="py-4">
          {loadingOlder && (
            <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Loading earlier messages...</span>
            </div>
          )}

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
                  Messages sync peer-to-peer across your community via WebRTC without a central server. Your history persists locally on your device.
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

      {showJumpToLatest && (
        <button
          type="button"
          onClick={jumpToLatest}
          className="absolute bottom-20 right-6 z-10 inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-3 py-1.5 text-xs font-medium text-foreground shadow-md hover:bg-secondary transition-colors"
        >
          <ArrowDown className="w-3.5 h-3.5 text-primary" />
          Jump to latest
        </button>
      )}

      {/* Message Input */}
      <MessageInput />
    </main>
  );
}
