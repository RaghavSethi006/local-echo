import { Message } from '@/types/p2p';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface MessageItemProps {
  message: Message;
  showAvatar?: boolean;
}

export function MessageItem({ message, showAvatar = true }: MessageItemProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Generate consistent color based on username
  const getAvatarColor = (username: string) => {
    const colors = [
      'bg-red-500',
      'bg-orange-500',
      'bg-amber-500',
      'bg-yellow-500',
      'bg-lime-500',
      'bg-green-500',
      'bg-emerald-500',
      'bg-teal-500',
      'bg-cyan-500',
      'bg-sky-500',
      'bg-blue-500',
      'bg-indigo-500',
      'bg-violet-500',
      'bg-purple-500',
      'bg-fuchsia-500',
      'bg-pink-500',
      'bg-rose-500',
    ];
    
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
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
}
