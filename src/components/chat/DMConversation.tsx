import { useRef, useEffect, useState } from 'react';
import { useP2P } from '@/contexts/P2PContext';
import { cn } from '@/lib/utils';
import { MessageCircle, Phone, Video, Pin, MoreVertical, Wifi, Radio, Lock, Send, Plus, Smile } from 'lucide-react';
import { DirectMessage } from '@/types/p2p';
import { formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function DMConversation() {
  const { currentDMPeer, dmMessages, localPeer, sendDM, sendDMTyping, markDMAsRead, dmConversations } = useP2P();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentConversation = dmConversations.find(c => c.peerId.id === currentDMPeer?.id);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [dmMessages]);

  // Mark as read when viewing
  useEffect(() => {
    if (currentDMPeer) {
      markDMAsRead();
    }
  }, [currentDMPeer, markDMAsRead]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    sendDM(content.trim());
    setContent('');
    sendDMTyping(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    
    // Send typing indicator
    sendDMTyping(true);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing indicator after 2 seconds of no input
    typingTimeoutRef.current = setTimeout(() => {
      sendDMTyping(false);
    }, 2000);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + 'px';
    }
  }, [content]);

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
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const getConnectionInfo = () => {
    const type = currentConversation?.connectionType || 'disconnected';
    switch (type) {
      case 'direct':
        return { icon: Wifi, label: 'Direct P2P', color: 'text-success' };
      case 'relay':
        return { icon: Radio, label: 'Relayed', color: 'text-warning' };
      default:
        return { icon: Lock, label: 'Encrypted', color: 'text-muted-foreground' };
    }
  };

  const connInfo = getConnectionInfo();

  if (!currentDMPeer) {
    return (
      <main className="flex-1 flex flex-col bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 animate-in">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-secondary flex items-center justify-center">
              <MessageCircle className="w-10 h-10 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Select a conversation</h2>
              <p className="text-muted-foreground mt-1">
                Choose a conversation or start a new one
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <header className="h-12 px-4 flex items-center justify-between border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              "text-xs font-semibold text-white",
              getAvatarColor(currentDMPeer.username)
            )}>
              {currentDMPeer.username.charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <span className="font-semibold text-foreground">{currentDMPeer.username}</span>
            {currentConversation?.isTyping && (
              <span className="ml-2 text-sm text-primary italic">typing...</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary/50", connInfo.color)}>
                <connInfo.icon className="w-3.5 h-3.5" />
                <span className="text-xs">{connInfo.label}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {connInfo.label === 'Direct P2P' 
                ? 'Connected directly - no relay' 
                : connInfo.label === 'Relayed'
                ? 'Routed through server host (still encrypted)'
                : 'End-to-end encrypted'}
            </TooltipContent>
          </Tooltip>
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Pin className="w-5 h-5" />
          </button>
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="py-4">
          {/* Start of conversation */}
          <div className="px-4 mb-6">
            <div className="flex flex-col items-center py-8">
              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center mb-4",
                "text-2xl font-bold text-white",
                getAvatarColor(currentDMPeer.username)
              )}>
                {currentDMPeer.username.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-xl font-bold text-foreground">{currentDMPeer.username}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                This is the beginning of your direct message history with <strong>{currentDMPeer.username}</strong>.
              </p>
              <div className="flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full bg-secondary/50">
                <Lock className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-muted-foreground">Messages are end-to-end encrypted</span>
              </div>
            </div>
          </div>

          {/* Message List */}
          <div className="space-y-0.5">
            {dmMessages.map((message, index) => {
              const isFromMe = message.from.id === localPeer?.id;
              const showAvatar = index === 0 || dmMessages[index - 1]?.from.id !== message.from.id;
              
              return (
                <div
                  key={message.id}
                  className={cn(
                    "group px-4 hover:bg-message-hover transition-colors",
                    showAvatar ? "py-2" : "py-0.5"
                  )}
                >
                  <div className="flex items-start gap-4">
                    {showAvatar ? (
                      <div className={cn(
                        "w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center",
                        "text-sm font-semibold text-white",
                        getAvatarColor(message.from.username)
                      )}>
                        {message.from.username.charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      <div className="w-10 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(message.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {showAvatar && (
                        <div className="flex items-baseline gap-2">
                          <span className={cn(
                            "font-medium hover:underline cursor-pointer",
                            isFromMe ? "text-primary" : "text-foreground"
                          )}>
                            {isFromMe ? 'You' : message.from.username}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                      )}
                      <p className="text-foreground text-sm leading-relaxed break-words mt-0.5">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="px-4 pb-6 pt-2">
        <div className="relative flex items-end bg-secondary rounded-lg">
          <button
            type="button"
            className="p-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>

          <textarea
            ref={inputRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message @${currentDMPeer.username}`}
            rows={1}
            className={cn(
              "flex-1 bg-transparent py-3 text-foreground placeholder:text-muted-foreground",
              "resize-none focus:outline-none text-sm leading-relaxed",
              "min-h-[44px] max-h-[200px]"
            )}
          />

          <div className="flex items-center pr-2 pb-2 gap-1">
            <button
              type="button"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Smile className="w-5 h-5" />
            </button>
            {content.trim() && (
              <button
                type="submit"
                className="p-2 text-primary hover:text-primary/80 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </form>
    </main>
  );
}
