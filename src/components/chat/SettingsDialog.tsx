import { useEffect, useRef, useState } from 'react';
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
import { Bell, Copy, Download, LogOut, QrCode, Shield, Wifi, User } from 'lucide-react';
import QRCode from 'qrcode';
import { formatProfileURI } from '@/lib/qr';
import { getNotificationPermission, requestNotificationPermission } from '@/hooks/use-notifications';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { localPeer, connectionStatus, disconnect } = useP2P();
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>(() =>
    getNotificationPermission()
  );
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const profileLink = localPeer
    ? formatProfileURI(localPeer.id, localPeer.username)
    : '';

  useEffect(() => {
    if (open) {
      setNotifPermission(getNotificationPermission());
    }
  }, [open]);

  useEffect(() => {
    if (!showQR || !qrCanvasRef.current || !profileLink) return;
    QRCode.toCanvas(qrCanvasRef.current, profileLink, {
      width: 200,
      margin: 2,
      color: { dark: '#000', light: '#fff' },
    }).catch(() => toast.error('Failed to render QR code'));
  }, [showQR, profileLink]);

  const copyPeerId = async () => {
    if (!localPeer?.id) return;
    try {
      await navigator.clipboard.writeText(localPeer.id);
      toast.success('Peer ID copied to clipboard');
    } catch {
      toast.error('Could not copy Peer ID');
    }
  };

  const downloadQR = () => {
    if (!qrCanvasRef.current || !localPeer) return;
    const link = document.createElement('a');
    link.download = `${localPeer.username}-profile-qr.png`;
    link.href = qrCanvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handleEnableNotifications = async () => {
    const result = await requestNotificationPermission();
    setNotifPermission(result);
    if (result === 'granted') {
      toast.success('Desktop notifications enabled');
    } else if (result === 'denied') {
      toast.error('Notifications are blocked in browser settings');
    }
  };

  const handleLogout = async () => {
    if (!confirmingLogout) {
      setConfirmingLogout(true);
      return;
    }
    await disconnect();
    onOpenChange(false);
    toast.success('Signed out. Local data cleared.');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) { setConfirmingLogout(false); setShowQR(false); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Manage your identity, notifications, and session.
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
              aria-label="Copy Peer ID"
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

            <Button type="button" variant="outline" size="sm" onClick={() => setShowQR(!showQR)} className="w-full gap-2">
              <QrCode className="w-4 h-4" />
              {showQR ? 'Hide QR Code' : 'Show Profile QR'}
            </Button>

            {showQR && (
              <div className="flex flex-col items-center gap-3 pt-2">
                <canvas ref={qrCanvasRef} className="rounded-lg border border-border" />
                <p className="text-xs text-muted-foreground text-center">
                  Scan this code to start a direct message
                </p>
                <Button type="button" variant="ghost" size="sm" onClick={downloadQR} className="gap-2">
                  <Download className="w-3.5 h-3.5" />
                  Save QR
                </Button>
              </div>
            )}
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
              <span className="text-muted-foreground">Transport</span>
              <span className="text-foreground">WebRTC P2P</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Direct Messages</span>
              <span className="text-success">E2E Encrypted</span>
            </div>
          </div>

          {/* Notifications */}
          {notifPermission !== 'unsupported' && (
            <div className="p-3 rounded-lg bg-secondary/50 border border-border flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Desktop notifications</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {notifPermission === 'granted'
                      ? 'Enabled for incoming DMs'
                      : notifPermission === 'denied'
                        ? 'Blocked in browser settings'
                        : 'Not enabled'}
                  </p>
                </div>
              </div>
              {notifPermission === 'default' && (
                <Button type="button" variant="outline" size="sm" onClick={handleEnableNotifications}>
                  Enable
                </Button>
              )}
            </div>
          )}

          {/* Logout */}
          <Button
            type="button"
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
