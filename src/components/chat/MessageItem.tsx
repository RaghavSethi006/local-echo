import { memo, useState } from 'react';
import { Message } from '@/types/p2p';
import { cn } from '@/lib/utils';
import { getAvatarColor } from '@/lib/avatar-color';
import { formatMessageTime, formatShortTime } from '@/lib/date';
import { MessageText } from './MessageText';
import { Check, Copy } from 'lucide-react';
import { useP2P } from '@/contexts/P2PContext';
import { toast } from 'sonner';

interface MessageItemProps {
  message: Message;
  showAvatar?: boolean;
}

export const MessageItem = memo(function MessageItem({ message, showAvatar = true }: MessageItemProps) {
  const { localPeer, openDM } = useP2P();
  const [copied, setCopied] = useState(false);

  const isLocalAuthor = message.author.id === localPeer?.id;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Could not copy message');
    }
  };

  if (!showAvatar) {
    return (
      <div className="group relative px-4 py-0.5 hover:bg-message-hover transition-colors">
        <div className="flex items-start gap-4">
          <div className="w-10 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {formatShortTime(message.timestamp)}
            </span>
          </div>
          <MessageText content={message.content} className="flex-1 min-w-0" />
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy message"
          className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity absolute right-4 top-0.5 p-1 rounded bg-card border border-border text-muted-foreground hover:text-foreground"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    );
  }

  return (
    <div className="group relative px-4 py-2 hover:bg-message-hover transition-colors">
      <div className="flex items-start gap-4">
        <div className={cn(
          'w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center',
          'text-sm font-semibold text-white',
          getAvatarColor(message.author.username)
        )}>
          {message.author.username.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            {isLocalAuthor ? (
              <span className="font-medium text-primary">
                {message.author.username}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => openDM(message.author)}
                className="font-medium text-foreground hover:underline text-left"
                title={`Message ${message.author.username}`}
              >
                {message.author.username}
              </button>
            )}
            <span className="text-xs text-muted-foreground tabular-nums">
              {formatMessageTime(message.timestamp)}
            </span>
          </div>
          <MessageText content={message.content} className="mt-0.5" />
        </div>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy message"
        className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity absolute right-4 top-2 p-1 rounded bg-card border border-border text-muted-foreground hover:text-foreground"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
});
