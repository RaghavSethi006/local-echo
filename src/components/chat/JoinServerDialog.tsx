import { useState, useRef } from 'react';
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
import jsQR from 'jsqr';

interface JoinServerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinServerDialog({ open, onOpenChange }: JoinServerDialogProps) {
  const { joinServer, startDMByPeerId } = useP2P();
  const [inviteCode, setInviteCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [activeTab, setActiveTab] = useState('paste');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const stopCamera = () => {
    scanningRef.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const handleProfileQR = async (link: string) => {
    const rest = link.slice('local-echo-profile://'.length);
    const atIdx = rest.lastIndexOf('@');
    if (atIdx < 0) return false;
    const peerId = rest.slice(0, atIdx);
    const username = rest.slice(atIdx + 1);
    if (!peerId) return false;
    await startDMByPeerId(peerId, username);
    toast.success(`Started DM with ${username || peerId.slice(0, 8)}`);
    onOpenChange(false);
    return true;
  };

  const handleQrResult = async (result: string) => {
    if (result.startsWith('local-echo-profile://')) {
      await handleProfileQR(result);
    } else {
      setInviteCode(result);
      setActiveTab('paste');
      toast.success('QR code scanned successfully');
    }
  };

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
    } catch {
      toast.error('Failed to join server. Invalid invite code.');
    } finally {
      setIsJoining(false);
    }
  };

  const decodeFromCanvas = (imageData: ImageData): string | null => {
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    return code?.data || null;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const result = decodeFromCanvas(imageData);
        if (result) {
          handleQrResult(result);
        } else {
          toast.error('Could not decode QR code from image');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setScanning(true);
      scanningRef.current = true;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        scanFrame();
      }
    } catch {
      toast.error('Camera access denied or unavailable');
    }
  };

  const scanFrame = () => {
    if (!scanningRef.current || !videoRef.current || !streamRef.current) return;
    const video = videoRef.current;
    if (video.readyState < video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }
    ctx.drawImage(video, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const result = decodeFromCanvas(imageData);
    if (result) {
      stopCamera();
      handleQrResult(result);
    } else {
      rafRef.current = requestAnimationFrame(scanFrame);
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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                <Button onClick={startCamera} variant="outline" className="w-full gap-2">
                  <Camera className="w-4 h-4" />
                  Open Camera
                </Button>
                <div className="relative">
                  <Button variant="outline" className="w-full gap-2 relative">
                    <Upload className="w-4 h-4" />
                    Upload QR Image
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Peer-to-Peer Connection</strong> — 
            Joining will establish a direct connection with the server host. 
            All messages are encrypted end-to-end.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleJoin} disabled={isJoining || !inviteCode.trim()}>
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
