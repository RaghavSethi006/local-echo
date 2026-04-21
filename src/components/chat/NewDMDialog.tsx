import { useState } from 'react';
import { useP2P } from '@/contexts/P2PContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Search, MessageCircle, Users, KeyRound, Send } from 'lucide-react';
import { PeerId } from '@/types/p2p';
import { toast } from 'sonner';

interface NewDMDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewDMDialog({ open, onOpenChange }: NewDMDialogProps) {
  const { availablePeersForDM, startNewDM, startDMByPeerId, onlinePeers } = useP2P();
  const [searchQuery, setSearchQuery] = useState('');
  const [peerIdInput, setPeerIdInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [mode, setMode] = useState<'list' | 'peerId'>('list');

  const filteredPeers = availablePeersForDM.filter(peer =>
    peer.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isOnline = (peerId: string) => onlinePeers.some(p => p.id === peerId);

  const handleSelectPeer = (peer: PeerId) => {
    startNewDM(peer);
    setSearchQuery('');
    onOpenChange(false);
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            New Direct Message
          </DialogTitle>
          <DialogDescription>
            Select a peer to start a private conversation.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username..."
            className="pl-9"
          />
        </div>

        {/* Peers List */}
        <div className="max-h-64 overflow-y-auto space-y-1">
          {filteredPeers.length === 0 ? (
            <div className="py-8 text-center">
              <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No peers found' : 'No peers available'}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Join a server to discover peers
              </p>
            </div>
          ) : (
            filteredPeers.map((peer) => (
              <button
                key={peer.id}
                onClick={() => handleSelectPeer(peer)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md",
                  "transition-colors text-left",
                  "hover:bg-channel-hover"
                )}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    "text-sm font-semibold text-white",
                    getAvatarColor(peer.username)
                  )}>
                    {peer.username.charAt(0).toUpperCase()}
                  </div>
                  <div className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-popover",
                    isOnline(peer.id) ? "bg-status-online" : "bg-status-offline"
                  )} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {peer.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isOnline(peer.id) ? 'Online' : 'Offline'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Info */}
        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Direct & Private</strong> — 
            Messages are sent directly peer-to-peer when possible, with end-to-end encryption.
            The server host cannot read your DMs.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
