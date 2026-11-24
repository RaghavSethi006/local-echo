import { useState, useRef, useEffect } from 'react';
import { useP2P } from '@/contexts/P2PContext';
import { cn } from '@/lib/utils';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

export function MessageInput() {
  const { currentChannel, sendMessage } = useP2P();
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(trimmed);
      setContent('');
      inputRef.current?.focus();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + 'px';
    }
  }, [content]);

  const byteLen = new TextEncoder().encode(content).byteLength;

  return (
    <form onSubmit={handleSubmit} className="px-3 sm:px-4 pb-4 pt-2">
      <div className="relative flex items-end bg-secondary rounded-lg border border-border/60 focus-within:border-ring/60 transition-colors">
        {byteLen > 6144 && (
          <span className="text-xs text-warning tabular-nums absolute bottom-2 right-14">
            {byteLen}/8192
          </span>
        )}
        <textarea
          ref={inputRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message #${currentChannel?.name || 'channel'}`}
          aria-label={`Message #${currentChannel?.name || 'channel'}`}
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
          className="p-3 text-primary hover:text-primary/80 disabled:text-muted-foreground/40 disabled:cursor-not-allowed transition-colors"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
