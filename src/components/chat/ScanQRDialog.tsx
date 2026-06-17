import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Camera, Loader2, Upload, ScanLine } from 'lucide-react';
import jsQR from 'jsqr';

interface ScanQRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResult: (data: string) => void;
  title?: string;
  description?: string;
}

export function ScanQRDialog({ open, onOpenChange, onResult, title, description }: ScanQRDialogProps) {
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef(false);

  const stopCamera = () => {
    scanningRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    if (!open) stopCamera();
  }, [open]);

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
          onOpenChange(false);
          onResult(result);
        } else {
          toast.error('Could not decode QR code from image');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setScanning(true);
      scanningRef.current = true;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
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
      requestAnimationFrame(scanFrame);
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      requestAnimationFrame(scanFrame);
      return;
    }
    ctx.drawImage(video, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const result = decodeFromCanvas(imageData);
    if (result) {
      stopCamera();
      onOpenChange(false);
      onResult(result);
    } else {
      requestAnimationFrame(scanFrame);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) stopCamera(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="w-5 h-5" />
            {title || 'Scan QR Code'}
          </DialogTitle>
          <DialogDescription>
            {description || 'Point your camera at a QR code or upload an image.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
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
                <Button variant="outline" className="w-full gap-2" disabled>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
