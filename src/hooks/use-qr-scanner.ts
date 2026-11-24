import { useCallback, useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { toast } from 'sonner';

interface UseQRScannerOptions {
  open: boolean;
  onDecoded: (data: string) => void | Promise<void>;
}

function decodeImageData(imageData: ImageData): string | null {
  const code = jsQR(imageData.data, imageData.width, imageData.height);
  return code?.data || null;
}

export function useQRScanner({ open, onDecoded }: UseQRScannerOptions) {
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const onDecodedRef = useRef(onDecoded);
  onDecodedRef.current = onDecoded;

  const stopCamera = useCallback(() => {
    scanningRef.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  }, []);

  useEffect(() => {
    if (!open) {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [open, stopCamera]);

  const scanFrame = useCallback(() => {
    if (!scanningRef.current || !videoRef.current || !streamRef.current) return;
    const video = videoRef.current;
    if (video.readyState < video.HAVE_ENOUGH_DATA || video.videoWidth === 0 || video.videoHeight === 0) {
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
    const result = decodeImageData(imageData);
    if (result) {
      stopCamera();
      void onDecodedRef.current(result);
    } else {
      rafRef.current = requestAnimationFrame(scanFrame);
    }
  }, [stopCamera]);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error('Camera access is not supported in this browser');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      scanningRef.current = true;
      setScanning(true);

      requestAnimationFrame(async () => {
        if (!videoRef.current || !scanningRef.current) return;
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch {
          // Autoplay promise may reject if closed mid-flight
        }
        scanFrame();
      });
    } catch {
      stopCamera();
      toast.error('Camera access denied or unavailable');
    }
  }, [scanFrame, stopCamera]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result;
      if (typeof src !== 'string') {
        toast.error('Failed to read image file');
        return;
      }

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          toast.error('Could not initialize image decoder');
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const result = decodeImageData(imageData);
        if (result) {
          void onDecodedRef.current(result);
        } else {
          toast.error('Could not decode QR code from image');
        }
      };
      img.onerror = () => {
        toast.error('Invalid image file');
      };
      img.src = src;
    };
    reader.onerror = () => {
      toast.error('Failed to read image file');
    };
    reader.readAsDataURL(file);
  }, []);

  return {
    scanning,
    videoRef,
    startCamera,
    stopCamera,
    handleFileUpload,
  };
}
