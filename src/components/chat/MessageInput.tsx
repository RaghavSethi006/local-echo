import { useState, useRef, useEffect } from 'react';
import { useP2P } from '@/contexts/P2PContext';
import { cn } from '@/lib/utils';
import { Send } from 'lucide-react';

export function MessageInput() {
  const { currentChannel, sendMessage } = useP2P();
  const [content, setContent] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    sendMessage(content.trim());
    setContent('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + 'px';
    }
  }, [content]);

  return (
    <form onSubmit={handleSubmit} className="px-3 sm:px-4 pb-4 pt-2">
      <div className="relative flex items-end bg-secondary rounded-lg">
        {/* Input */}
        <textarea
          ref={inputRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message #${currentChannel?.name || 'channel'}`}
          rows={1}
          className={cn(
            "flex-1 bg-transparent py-3 px-4 text-foreground placeholder:text-muted-foreground",
            "resize-none focus:outline-none text-sm leading-relaxed",
            "min-h-[44px] max-h-[200px]"
          )}
        />

        <button
          type="submit"
          disabled={!content.trim()}
          className="p-3 text-primary hover:text-primary/80 disabled:text-muted-foreground/40 disabled:cursor-not-allowed transition-colors"
          aria-label="Send"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
