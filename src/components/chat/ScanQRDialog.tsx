import { useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, Upload, ScanLine } from 'lucide-react';
import { useQRScanner } from '@/hooks/use-qr-scanner';

interface ScanQRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResult: (data: string) => void;
  title?: string;
  description?: string;
}

export function ScanQRDialog({ open, onOpenChange, onResult, title, description }: ScanQRDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { scanning, videoRef, startCamera, stopCamera, handleFileUpload } = useQRScanner({
    open,
    onDecoded: (result) => {
      onOpenChange(false);
      onResult(result);
    },
  });

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
        </div>
      </DialogContent>
    </Dialog>
  );
}
