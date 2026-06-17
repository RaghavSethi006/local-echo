import { memo } from 'react';
import { Message } from '@/types/p2p';
import { cn } from '@/lib/utils';
import { getAvatarColor } from '@/lib/avatar-color';
import { formatDistanceToNow } from 'date-fns';

interface MessageItemProps {
  message: Message;
  showAvatar?: boolean;
}

export const MessageItem = memo(function MessageItem({ message, showAvatar = true }: MessageItemProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
  };

  if (!showAvatar) {
    return (
      <div className="group px-4 py-0.5 hover:bg-message-hover transition-colors">
        <div className="flex items-start gap-4">
          <div className="w-10 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] text-muted-foreground">
              {new Date(message.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
          <p className="text-foreground text-sm leading-relaxed break-words">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="group px-4 py-2 hover:bg-message-hover transition-colors">
      <div className="flex items-start gap-4">
        <div className={cn(
          "w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center",
          "text-sm font-semibold text-white",
          getAvatarColor(message.author.username)
        )}>
          {message.author.username.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-medium text-foreground hover:underline cursor-pointer">
              {message.author.username}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTime(message.timestamp)}
            </span>
          </div>
          <p className="text-foreground text-sm leading-relaxed break-words mt-0.5">
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
});
