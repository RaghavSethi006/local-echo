import { useP2P } from '@/contexts/P2PContext';
import { cn } from '@/lib/utils';
import { getAvatarColor } from '@/lib/avatar-color';
import { Crown, MessageCircle } from 'lucide-react';

export function MembersSidebar() {
  const { currentServer, onlinePeers, connectionStatus, localPeer, openDM } = useP2P();

  if (!currentServer) return null;

  const members = currentServer.members.map(member => ({
    ...member,
    isOnline: onlinePeers.some(p => p.id === member.id),
    isHost: member.id === currentServer.hostId,
    isLocal: member.id === localPeer?.id,
  }));

  const onlineMembers = members.filter(m => m.isOnline);
  const offlineMembers = members.filter(m => !m.isOnline);

  return (
    <aside className="w-60 max-w-[80vw] h-full bg-card border-l border-border overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Online Members */}
        {onlineMembers.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 tabular-nums">
              Online — {onlineMembers.length}
            </h3>
            <div className="space-y-1">
              {onlineMembers.map((member) => {
                const content = (
                  <>
                    <div className="relative flex-shrink-0">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center',
                        'text-xs font-semibold text-white',
                        getAvatarColor(member.username)
                      )}>
                        {member.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-status-online border-2 border-card" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-1">
                        <span className={cn(
                          'text-sm truncate',
                          member.isLocal ? 'text-primary font-medium' : 'text-foreground'
                        )}>
                          {member.username}
                          {member.isLocal && ' (you)'}
                        </span>
                        {member.isHost && (
                          <Crown className="w-3 h-3 text-warning flex-shrink-0" aria-label="Server host" />
                        )}
                      </div>
                    </div>
                    {!member.isLocal && (
                      <MessageCircle className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    )}
                  </>
                );

                if (member.isLocal) {
                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 px-2 py-1.5 rounded-md"
                    >
                      {content}
                    </div>
                  );
                }

                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => openDM({ id: member.id, username: member.username, publicKey: member.publicKey })}
                    aria-label={`Message ${member.username}`}
                    title={`Send direct message to ${member.username}`}
                    className="group w-full flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-channel-hover transition-colors"
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Offline Members */}
        {offlineMembers.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 tabular-nums">
              Offline — {offlineMembers.length}
            </h3>
            <div className="space-y-1 opacity-70">
              {offlineMembers.map((member) => {
                if (member.isLocal) {
                  return (
                    <div key={member.id} className="flex items-center gap-3 px-2 py-1.5 rounded-md">
                      <div className="relative flex-shrink-0">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center',
                          'text-xs font-semibold text-white grayscale',
                          getAvatarColor(member.username)
                        )}>
                          {member.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-status-offline border-2 border-card" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-muted-foreground truncate block">{member.username} (you)</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => openDM({ id: member.id, username: member.username, publicKey: member.publicKey })}
                    aria-label={`Message ${member.username}`}
                    title={`Open direct message with ${member.username}`}
                    className="group w-full flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-channel-hover transition-colors text-left"
                  >
                    <div className="relative flex-shrink-0">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center',
                        'text-xs font-semibold text-white grayscale',
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
                          <Crown className="w-3 h-3 text-warning/50 flex-shrink-0" aria-label="Server host" />
                        )}
                      </div>
                    </div>
                    <MessageCircle className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Connection Info */}
        <div className="pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center justify-between">
              <span>Status</span>
              <span className="capitalize text-foreground">{connectionStatus}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Transport</span>
              <span className="text-foreground">WebRTC P2P</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Direct Messages</span>
              <span className="text-success">E2E Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
