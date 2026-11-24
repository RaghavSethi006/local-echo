import { useRef, useState } from 'react';
import { useP2P } from '@/contexts/P2PContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Camera, Link, Loader2, Upload } from 'lucide-react';
import { useQRScanner } from '@/hooks/use-qr-scanner';
import { parseProfileQR } from '@/lib/qr';

interface JoinServerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinServerDialog({ open, onOpenChange }: JoinServerDialogProps) {
  const { joinServer, startDMByPeerId } = useP2P();
  const [inviteCode, setInviteCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [activeTab, setActiveTab] = useState('paste');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleQrResult = async (result: string) => {
    const profile = parseProfileQR(result);
    if (profile) {
      try {
        await startDMByPeerId(profile.peerId, profile.username);
        toast.success(`Started DM with ${profile.username || profile.peerId.slice(0, 8)}`);
        onOpenChange(false);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Failed to start DM');
      }
      return;
    }

    setInviteCode(result);
    setActiveTab('paste');
    toast.success('QR code scanned successfully');
  };

  const { scanning, videoRef, startCamera, stopCamera, handleFileUpload } = useQRScanner({
    open: open && activeTab === 'scan',
    onDecoded: handleQrResult,
  });

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      toast.error('Please enter an invite code');
      return;
    }

    setIsJoining(true);
    try {
      await joinServer(inviteCode.trim());
      toast.success('Joined server successfully!');
      setInviteCode('');
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to join server. Invalid invite code.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) stopCamera(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            Join a Server
          </DialogTitle>
          <DialogDescription>
            Enter an invite code or scan a QR code to join.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(nextTab) => {
            setActiveTab(nextTab);
            if (nextTab !== 'scan') stopCamera();
          }}
        >
          <TabsList className="w-full">
            <TabsTrigger value="paste" className="flex-1">Paste Code</TabsTrigger>
            <TabsTrigger value="scan" className="flex-1">Scan QR</TabsTrigger>
          </TabsList>

          <TabsContent value="paste" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Invite Code</Label>
              <Input
                id="inviteCode"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Paste invite code here..."
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                className="font-mono text-sm"
              />
            </div>
          </TabsContent>

          <TabsContent value="scan" className="space-y-4 py-4">
            {scanning ? (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <video ref={videoRef} className="w-full h-64 object-cover" playsInline muted />
                <div className="absolute inset-0 border-2 border-primary/50 rounded-lg pointer-events-none" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={stopCamera}
                  className="absolute top-2 right-2"
                >
                  Stop
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button type="button" onClick={startCamera} variant="outline" className="w-full gap-2">
                  <Camera className="w-4 h-4" />
                  Open Camera
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4" />
                  Upload QR Image
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="sr-only"
                  aria-label="Upload QR code image"
                />
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Peer-to-Peer Connection</strong> —
            Joining will establish a direct connection with the server host.
            Direct messages are end-to-end encrypted.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleJoin} disabled={isJoining || !inviteCode.trim()}>
            {isJoining ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              'Join Server'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
