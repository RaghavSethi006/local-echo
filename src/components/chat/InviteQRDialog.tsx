import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { useP2P } from '@/contexts/P2PContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface InviteQRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteQRDialog({ open, onOpenChange }: InviteQRDialogProps) {
  const { generateInvite, currentServer } = useP2P();
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setInviteCode('');
    generateInvite()
      .then(setInviteCode)
      .catch(() => toast.error('Failed to generate invite'))
      .finally(() => setLoading(false));
  }, [open, generateInvite]);

  useEffect(() => {
    if (!inviteCode || loading || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, inviteCode, {
      width: 280,
      margin: 2,
      color: { dark: '#000', light: '#fff' },
    }).catch(() => toast.error('Failed to render QR code'));
  }, [inviteCode, loading]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      toast.success('Invite code copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `invite-${currentServer?.name || 'server'}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Invite People to {currentServer?.name || 'Server'}</DialogTitle>
          <DialogDescription>
            Share the QR code or invite link with others to let them join.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-[280px]">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <canvas
                ref={canvasRef}
                className="rounded-lg border border-border"
              />

              <div className="flex gap-2 w-full">
                <Button onClick={handleCopy} variant="default" className="flex-1 gap-2">
                  <Copy className="w-4 h-4" />
                  Copy Code
                </Button>
                <Button onClick={handleDownload} variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Save QR
                </Button>
              </div>

              <div className="w-full p-2 rounded-md bg-secondary/50 border border-border">
                <p className="text-xs font-mono text-muted-foreground break-all select-all">
                  {inviteCode}
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
