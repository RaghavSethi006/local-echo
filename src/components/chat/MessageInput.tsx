import { useState, useRef, useEffect } from 'react';
import { useP2P } from '@/contexts/P2PContext';
import { cn } from '@/lib/utils';
import { Plus, Gift, Sticker, Smile, Send } from 'lucide-react';

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
    <form onSubmit={handleSubmit} className="px-4 pb-6 pt-2">
      <div className="relative flex items-end bg-secondary rounded-lg">
        {/* Left Actions */}
        <button
          type="button"
          className="p-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* Input */}
        <textarea
          ref={inputRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message #${currentChannel?.name || 'channel'}`}
          rows={1}
          className={cn(
            "flex-1 bg-transparent py-3 text-foreground placeholder:text-muted-foreground",
            "resize-none focus:outline-none text-sm leading-relaxed",
            "min-h-[44px] max-h-[200px]"
          )}
        />

        {/* Right Actions */}
        <div className="flex items-center pr-2 pb-2 gap-1">
          <button
            type="button"
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Gift className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Sticker className="w-5 h-5" />
          </button>
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
  );
}
