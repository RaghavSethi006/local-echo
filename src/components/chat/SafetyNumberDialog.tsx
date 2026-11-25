import { useEffect, useState } from 'react';
import { useP2P } from '@/contexts/P2PContext';
import type { DMSafetyInfo, PeerId } from '@/types/p2p';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Copy, Lock, ShieldAlert, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { formatMessageTime } from '@/lib/date';

interface SafetyNumberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  peer: PeerId;
}

export function SafetyNumberDialog({ open, onOpenChange, peer }: SafetyNumberDialogProps) {
  const { getDMSafetyInfo, verifyDMPeer, unverifyDMPeer } = useP2P();
  const [info, setInfo] = useState<DMSafetyInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    void getDMSafetyInfo(peer.id).then((data) => {
      if (active) setInfo(data);
    });
    return () => {
      active = false;
    };
  }, [open, peer.id, peer.publicKey, getDMSafetyInfo]);

  const handleCopy = async () => {
    if (!info?.safetyNumber) return;
    try {
      await navigator.clipboard.writeText(info.safetyNumber);
      setCopied(true);
      toast.success('Safety number copied');
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('Could not copy safety number');
    }
  };

  const handleToggleVerify = async () => {
    if (!info) return;
    setBusy(true);
    try {
      if (info.isVerified) {
        await unverifyDMPeer(peer.id);
        toast.info(`Verification cleared for ${peer.username}`);
      } else {
        await verifyDMPeer(peer.id);
        toast.success(`${peer.username} marked as verified`);
      }
      const updated = await getDMSafetyInfo(peer.id);
      setInfo(updated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update verification status');
    } finally {
      setBusy(false);
    }
  };

  const groups = info?.safetyNumber ? info.safetyNumber.split(' ') : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {info?.keyChanged ? (
              <ShieldAlert className="w-5 h-5 text-warning" />
            ) : info?.isVerified ? (
              <ShieldCheck className="w-5 h-5 text-success" />
            ) : (
              <Lock className="w-5 h-5 text-primary" />
            )}
            Verify Safety Number
          </DialogTitle>
          <DialogDescription>
            Compare this 60-digit number with <span className="font-medium text-foreground">{peer.username}</span> over a voice call or in person to verify end-to-end encryption.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {info?.keyChanged && (
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/40 text-xs text-foreground space-y-1">
              <p className="font-semibold text-warning flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                Encryption Key Changed
              </p>
              <p className="text-muted-foreground">
                {peer.username}&apos;s public key differs from the key previously seen for this conversation. Confirm the new safety number out-of-band before marking verified.
              </p>
            </div>
          )}

          {info?.safetyNumber ? (
            <>
              <div className="p-4 rounded-lg bg-secondary/50 border border-border space-y-3">
                <div
                  data-testid="safety-number-grid"
                  className="grid grid-cols-4 gap-x-3 gap-y-2 text-center font-mono text-sm tracking-wider tabular-nums text-foreground select-all"
                >
                  {groups.map((group, idx) => (
                    <span key={idx} className="py-1 rounded bg-background/60 border border-border/60">
                      {group}
                    </span>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="w-full gap-2"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy Safety Number'}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-secondary/40 border border-border space-y-0.5">
                  <span className="text-muted-foreground block">Your Key ID</span>
                  <span className="font-mono tabular-nums text-foreground font-medium">
                    {info.localShortFingerprint || '—'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-secondary/40 border border-border space-y-0.5">
                  <span className="text-muted-foreground block truncate">{peer.username}&apos;s Key ID</span>
                  <span className="font-mono tabular-nums text-foreground font-medium">
                    {info.peerShortFingerprint || '—'}
                  </span>
                </div>
              </div>

              {info.isVerified && info.verifiedAt && (
                <p className="text-xs text-success flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  Verified on {formatMessageTime(info.verifiedAt)}
                </p>
              )}
            </>
          ) : (
            <div className="p-4 rounded-lg bg-secondary/50 border border-border text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Waiting for peer public key</p>
              <p>
                {peer.username}&apos;s ECDH public key will appear once they join a shared server or exchange a direct message with you.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            type="button"
            variant={info?.isVerified ? 'outline' : 'default'}
            disabled={!info?.safetyNumber || busy}
            onClick={handleToggleVerify}
            className="gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            {info?.isVerified ? 'Unverify Peer' : 'Mark as Verified'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
