import { useP2P } from '@/contexts/P2PContext';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';

export function MembersSidebar() {
  const { currentServer, onlinePeers, connectionStatus, localPeer } = useP2P();

  if (!currentServer) return null;

  // Get all members with their online status
  const members = currentServer.members.map(member => ({
    ...member,
    isOnline: onlinePeers.some(p => p.id === member.id),
    isHost: member.id === currentServer.hostId,
    isLocal: member.id === localPeer?.id,
  }));

  const onlineMembers = members.filter(m => m.isOnline);
  const offlineMembers = members.filter(m => !m.isOnline);

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

  return (
    <aside className="w-60 max-w-[80vw] h-full bg-card border-l border-border overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Online Members */}
        {onlineMembers.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Online — {onlineMembers.length}
            </h3>
            <div className="space-y-1">
              {onlineMembers.map((member) => (
                <div
                  key={member.id}
                  className={cn(
                    "flex items-center gap-3 px-2 py-1.5 rounded-md",
                    "hover:bg-channel-hover transition-colors cursor-pointer"
                  )}
                >
                  <div className="relative">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      "text-xs font-semibold text-white",
                      getAvatarColor(member.username)
                    )}>
                      {member.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-status-online border-2 border-card" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className={cn(
                        "text-sm truncate",
                        member.isLocal ? "text-primary font-medium" : "text-foreground"
                      )}>
                        {member.username}
                        {member.isLocal && " (you)"}
                      </span>
                      {member.isHost && (
                        <Crown className="w-3 h-3 text-warning flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Offline Members */}
        {offlineMembers.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Offline — {offlineMembers.length}
            </h3>
            <div className="space-y-1 opacity-60">
              {offlineMembers.map((member) => (
                <div
                  key={member.id}
                  className={cn(
                    "flex items-center gap-3 px-2 py-1.5 rounded-md",
                    "hover:bg-channel-hover transition-colors cursor-pointer"
                  )}
                >
                  <div className="relative">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      "text-xs font-semibold text-white grayscale",
                      getAvatarColor(member.username)
                    )}>
                      {member.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-status-offline border-2 border-card" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground truncate">
                        {member.username}
                      </span>
                      {member.isHost && (
                        <Crown className="w-3 h-3 text-warning/50 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connection Info */}
        <div className="pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center justify-between">
              <span>Status:</span>
              <span className="capitalize text-foreground">{connectionStatus}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Protocol:</span>
              <span className="text-foreground">WebRTC P2P</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Encryption:</span>
              <span className="text-success">E2E Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
