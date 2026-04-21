import { useState } from 'react';
import { useP2P } from '@/contexts/P2PContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Copy, LogOut, Shield, Wifi, User } from 'lucide-react';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { localPeer, connectionStatus, clearSession } = useP2P();
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const copyPeerId = async () => {
    if (!localPeer?.id) return;
    await navigator.clipboard.writeText(localPeer.id);
    toast.success('Peer ID copied to clipboard');
  };

  const handleLogout = async () => {
    if (!confirmingLogout) {
      setConfirmingLogout(true);
      return;
    }
    await clearSession();
    onOpenChange(false);
    toast.success('Signed out. Local data cleared.');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setConfirmingLogout(false); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Manage your identity and session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* User info */}
          <div className="p-3 rounded-lg bg-secondary/50 border border-border space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
              <User className="w-3.5 h-3.5" /> Identity
            </div>
            <p className="text-sm font-semibold text-foreground">
              {localPeer?.username || 'Anonymous'}
            </p>
            <button
              type="button"
              onClick={copyPeerId}
              className="w-full flex items-center justify-between gap-2 p-2 rounded-md bg-background border border-border hover:bg-channel-hover transition-colors"
            >
              <span className="text-xs font-mono text-muted-foreground truncate">
                {localPeer?.id}
              </span>
              <Copy className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            </button>
            <p className="text-xs text-muted-foreground">
              Share your Peer ID to receive direct messages.
            </p>
          </div>

          {/* Connection */}
          <div className="p-3 rounded-lg bg-secondary/50 border border-border space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
              <Wifi className="w-3.5 h-3.5" /> Connection
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="capitalize text-foreground">{connectionStatus}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Protocol</span>
              <span className="text-foreground">WebRTC P2P</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Encryption</span>
              <span className="text-success">E2E Enabled</span>
            </div>
          </div>

          {/* Logout */}
          <Button
            variant={confirmingLogout ? 'destructive' : 'outline'}
            onClick={handleLogout}
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {confirmingLogout ? 'Tap again to confirm — clears all local data' : 'Sign Out & Clear Data'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}