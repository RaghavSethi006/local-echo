import { useRef, useEffect, useState } from 'react';
import { useP2P } from '@/contexts/P2PContext';
import { cn } from '@/lib/utils';
import { getAvatarColor } from '@/lib/avatar-color';
import { formatMessageTime, formatShortTime } from '@/lib/date';
import { MessageText } from './MessageText';
import { SafetyNumberDialog } from './SafetyNumberDialog';
import { Check, Copy, Lock, MessageCircle, Radio, Send, ShieldAlert, ShieldCheck, Wifi } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

export function DMConversation() {
  const { currentDMPeer, dmMessages, localPeer, sendDM, sendDMTyping, markDMAsRead, dmConversations } = useP2P();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentConversation = dmConversations.find(c => c.peerId.id === currentDMPeer?.id);
  const keyChanged = Boolean(currentConversation?.keyChanged);
  const isVerified = Boolean(
    currentDMPeer?.publicKey &&
      currentConversation?.verifiedPublicKey &&
      currentConversation.verifiedPublicKey === currentDMPeer.publicKey &&
      !keyChanged
  );

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

  // Clear typing timer on peer change or unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, [currentDMPeer?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    try {
      await sendDM(trimmed);
      setContent('');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to send DM');
    } finally {
      setIsSending(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      sendDMTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e);
    }
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    sendDMTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendDMTyping(false);
    }, 2000);
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(prev => (prev === id ? null : prev)), 1500);
    } catch {
      toast.error('Could not copy message');
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + 'px';
    }
  }, [content]);

  const getConnectionInfo = () => {
    const type = currentConversation?.connectionType || 'disconnected';
    switch (type) {
      case 'direct':
        return { icon: Wifi, label: 'Direct P2P', color: 'text-success' };
      case 'relay':
        return { icon: Radio, label: 'Relayed', color: 'text-warning' };
      default:
        return { icon: Lock, label: 'E2E Encrypted', color: 'text-muted-foreground' };
    }
  };

  const connInfo = getConnectionInfo();

  if (!currentDMPeer) {
    return (
      <main className="flex-1 flex flex-col bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 animate-in px-6">
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
    <main className="flex-1 flex flex-col bg-background min-w-0">
      {/* Header — desktop only */}
      <header className="hidden md:flex h-12 px-4 items-center justify-between border-b border-border shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center',
              'text-xs font-semibold text-white',
              getAvatarColor(currentDMPeer.username)
            )}>
              {currentDMPeer.username.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="min-w-0 truncate">
            <span className="font-semibold text-foreground">{currentDMPeer.username}</span>
            {currentConversation?.isTyping && (
              <span className="ml-2 text-sm text-primary italic">typing...</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={cn('flex items-center gap-1.5 text-xs', connInfo.color)}>
                <connInfo.icon className="w-3.5 h-3.5" />
                <span>{connInfo.label}</span>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {connInfo.label === 'Direct P2P'
                ? 'Direct WebRTC DataChannel · End-to-end encrypted (ECDH + AES-256-GCM)'
                : connInfo.label === 'Relayed'
                  ? 'Routed through server host as opaque E2E ciphertext'
                  : 'End-to-end encrypted with ECDH + AES-256-GCM'}
            </TooltipContent>
          </Tooltip>

          <span className="text-border">·</span>

          <button
            type="button"
            onClick={() => setSafetyOpen(true)}
            aria-label="Verify safety number"
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
              keyChanged
                ? 'border-warning/50 bg-warning/10 text-warning hover:bg-warning/20'
                : isVerified
                  ? 'border-success/40 bg-success/10 text-success hover:bg-success/20'
                  : 'border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary'
            )}
          >
            {keyChanged ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Key Changed</span>
              </>
            ) : isVerified ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Verify Key</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Key-changed warning bar */}
      {keyChanged && (
        <div className="px-4 py-2 bg-warning/10 border-b border-warning/30 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-foreground min-w-0">
            <ShieldAlert className="w-4 h-4 text-warning shrink-0" />
            <span className="truncate">
              <strong>{currentDMPeer.username}</strong>&apos;s encryption key changed. Verify their safety number before trusting new messages.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSafetyOpen(true)}
            className="text-warning font-medium hover:underline shrink-0"
          >
            Review Safety Number
          </button>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="py-4">
          {/* Start of conversation */}
          <div className="px-4 mb-6">
            <div className="flex flex-col items-center py-8">
              <div className={cn(
                'w-20 h-20 rounded-full flex items-center justify-center mb-4',
                'text-2xl font-bold text-white',
                getAvatarColor(currentDMPeer.username)
              )}>
                {currentDMPeer.username.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-xl font-bold text-foreground">{currentDMPeer.username}</h3>
              <p className="text-sm text-muted-foreground mt-1 text-center">
                This is the beginning of your direct message history with <strong>{currentDMPeer.username}</strong>.
              </p>
              <p className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground text-center">
                <Lock className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>End-to-end encrypted (ECDH + AES-256-GCM)</span>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setSafetyOpen(true)}
                  className="text-primary hover:underline font-medium"
                >
                  {isVerified ? 'Verified safety number' : 'Verify safety number'}
                </button>
              </p>
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
                    'group relative px-4 hover:bg-message-hover transition-colors',
                    showAvatar ? 'py-2' : 'py-0.5'
                  )}
                >
                  <div className="flex items-start gap-4">
                    {showAvatar ? (
                      <div className={cn(
                        'w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center',
                        'text-sm font-semibold text-white',
                        getAvatarColor(message.from.username)
                      )}>
                        {message.from.username.charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      <div className="w-10 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-muted-foreground tabular-nums">
                          {formatShortTime(message.timestamp)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {showAvatar && (
                        <div className="flex items-baseline gap-2">
                          <span className={cn(
                            'font-medium',
                            isFromMe ? 'text-primary' : 'text-foreground'
                          )}>
                            {isFromMe ? 'You' : message.from.username}
                          </span>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {formatMessageTime(message.timestamp)}
                          </span>
                        </div>
                      )}
                      <MessageText content={message.content} className="mt-0.5" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(message.id, message.content)}
                    aria-label="Copy message"
                    className={cn(
                      'opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity absolute right-4 p-1 rounded bg-card border border-border text-muted-foreground hover:text-foreground',
                      showAvatar ? 'top-2' : 'top-0.5'
                    )}
                  >
                    {copiedId === message.id ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="px-3 sm:px-4 pb-4 pt-2">
        <div className="relative flex items-end bg-secondary rounded-lg border border-border/60 focus-within:border-ring/60 transition-colors">
          <textarea
            ref={inputRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message @${currentDMPeer.username}`}
            aria-label={`Message @${currentDMPeer.username}`}
            rows={1}
            className={cn(
              'flex-1 bg-transparent py-3 px-4 text-foreground placeholder:text-muted-foreground',
              'resize-none focus:outline-none text-sm leading-relaxed',
              'min-h-[44px] max-h-[200px]'
            )}
          />

          <button
            type="submit"
            disabled={!content.trim() || isSending}
            aria-label="Send direct message"
            className="p-3 text-primary hover:text-primary/80 disabled:text-muted-foreground/40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        {/* Connection + Safety status on mobile */}
        <div className="md:hidden flex items-center justify-center gap-2 mt-2 text-[10px]">
          <span className={cn('inline-flex items-center gap-1', connInfo.color)}>
            <connInfo.icon className="w-3 h-3" />
            <span>{connInfo.label}</span>
          </span>
          <span className="text-border">·</span>
          <button
            type="button"
            onClick={() => setSafetyOpen(true)}
            className={cn(
              'inline-flex items-center gap-1 font-medium',
              keyChanged ? 'text-warning' : isVerified ? 'text-success' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {keyChanged ? 'Key Changed' : isVerified ? 'Verified' : 'Verify Key'}
          </button>
        </div>
      </form>

      <SafetyNumberDialog
        open={safetyOpen}
        onOpenChange={setSafetyOpen}
        peer={currentDMPeer}
      />
    </main>
  );
}
