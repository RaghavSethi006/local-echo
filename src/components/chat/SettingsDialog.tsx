import { useEffect, useRef, useState } from 'react';
import { useP2P } from '@/contexts/P2PContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Bell,
  Copy,
  Download,
  Globe,
  LogOut,
  Plus,
  QrCode,
  RefreshCw,
  RotateCcw,
  Shield,
  Trash2,
  User,
  Wifi,
} from 'lucide-react';
import QRCode from 'qrcode';
import { formatProfileURI } from '@/lib/qr';
import { getNotificationPermission, requestNotificationPermission } from '@/hooks/use-notifications';
import {
  getEffectiveNetworkConfig,
  loadNetworkOverrides,
  validateIceServerUrl,
  validateNetworkOverrides,
  type NetworkOverrides,
} from '@/lib/network-config';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EditableIceServer {
  id: string;
  url: string;
  username: string;
  credential: string;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const {
    localPeer,
    connectionStatus,
    diagnostics,
    disconnect,
    reconfigureNetwork,
    resetNetworkOverrides,
    reconnectNow,
  } = useP2P();

  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>(() =>
    getNotificationPermission()
  );
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Network Settings form state
  const [signalingHost, setSignalingHost] = useState('');
  const [signalingPort, setSignalingPort] = useState('');
  const [signalingPath, setSignalingPath] = useState('');
  const [signalingSecure, setSignalingSecure] = useState<boolean>(true);
  const [iceServers, setIceServers] = useState<EditableIceServer[]>([]);
  const [newIceUrl, setNewIceUrl] = useState('');
  const [newIceUser, setNewIceUser] = useState('');
  const [newIceCred, setNewIceCred] = useState('');
  const [networkBusy, setNetworkBusy] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const profileLink = localPeer ? formatProfileURI(localPeer.id, localPeer.username) : '';

  useEffect(() => {
    if (!open) return;
    setNotifPermission(getNotificationPermission());
    setNetworkError(null);

    const overrides = loadNetworkOverrides();
    const effective = getEffectiveNetworkConfig();
    setSignalingHost(overrides?.signalingHost ?? effective.signalingHost ?? '');
    const portVal = overrides?.signalingPort ?? effective.signalingPort;
    setSignalingPort(portVal !== undefined ? String(portVal) : '');
    setSignalingPath(overrides?.signalingPath ?? effective.signalingPath ?? '');
    setSignalingSecure(overrides?.signalingSecure ?? effective.signalingSecure ?? true);

    const sourceIce = overrides?.iceServers ?? effective.iceServers ?? [];
    setIceServers(
      sourceIce.map((entry, idx) => ({
        id: `ice-${idx}-${Date.now()}`,
        url: Array.isArray(entry.urls) ? entry.urls[0] || '' : String(entry.urls),
        username: entry.username || '',
        credential: entry.credential || '',
      }))
    );
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

  const handleAddIceServer = () => {
    const trimmed = newIceUrl.trim();
    if (!trimmed) return;
    if (!validateIceServerUrl(trimmed)) {
      setNetworkError('ICE URL must start with stun:, stuns:, turn:, or turns: and include a host.');
      return;
    }
    setNetworkError(null);
    setIceServers((prev) => [
      ...prev,
      {
        id: `ice-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        url: trimmed,
        username: newIceUser.trim(),
        credential: newIceCred,
      },
    ]);
    setNewIceUrl('');
    setNewIceUser('');
    setNewIceCred('');
  };

  const handleRemoveIceServer = (id: string) => {
    setIceServers((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveNetwork = async (e: React.FormEvent) => {
    e.preventDefault();
    setNetworkError(null);

    const parsedPort = signalingPort.trim() !== '' ? Number(signalingPort.trim()) : undefined;
    const overrides: NetworkOverrides = {
      signalingHost: signalingHost.trim() || undefined,
      signalingPort: parsedPort,
      signalingPath: signalingPath.trim() || undefined,
      signalingSecure: signalingHost.trim() ? signalingSecure : undefined,
      iceServers: iceServers.map((entry) => ({
        urls: entry.url.trim(),
        ...(entry.username.trim() ? { username: entry.username.trim() } : {}),
        ...(entry.credential ? { credential: entry.credential } : {}),
      })),
    };

    const validation = validateNetworkOverrides(overrides);
    if (!validation.valid) {
      setNetworkError(validation.errors[0] || 'Invalid network configuration');
      return;
    }

    setNetworkBusy(true);
    try {
      await reconfigureNetwork(validation.sanitized);
      toast.success('Network configuration saved and reconnected');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not reconnect with new network settings';
      setNetworkError(msg);
      toast.error(msg);
    } finally {
      setNetworkBusy(false);
    }
  };

  const handleResetNetwork = async () => {
    setNetworkBusy(true);
    setNetworkError(null);
    try {
      await resetNetworkOverrides();
      const effective = getEffectiveNetworkConfig();
      setSignalingHost(effective.signalingHost ?? '');
      setSignalingPort(effective.signalingPort !== undefined ? String(effective.signalingPort) : '');
      setSignalingPath(effective.signalingPath ?? '');
      setSignalingSecure(effective.signalingSecure ?? true);
      setIceServers(
        (effective.iceServers ?? []).map((entry, idx) => ({
          id: `ice-reset-${idx}-${Date.now()}`,
          url: Array.isArray(entry.urls) ? entry.urls[0] || '' : String(entry.urls),
          username: entry.username || '',
          credential: entry.credential || '',
        }))
      );
      toast.success('Restored environment network defaults');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reset network settings');
    } finally {
      setNetworkBusy(false);
    }
  };

  const handleReconnect = async () => {
    setNetworkBusy(true);
    try {
      await reconnectNow();
      toast.success('Reconnection check completed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Reconnect failed');
    } finally {
      setNetworkBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) {
          setConfirmingLogout(false);
          setShowQR(false);
          setActiveTab('general');
        }
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Manage your cryptographic identity, network relays, and session preferences.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="network">Network &amp; Relays</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 pt-3">
            {/* User info */}
            <div className="p-3 rounded-lg bg-secondary/50 border border-border space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
                <User className="w-3.5 h-3.5" /> Identity
              </div>
              <p className="text-sm font-semibold text-foreground">{localPeer?.username || 'Anonymous'}</p>
              <button
                type="button"
                onClick={copyPeerId}
                aria-label="Copy Peer ID"
                className="w-full flex items-center justify-between gap-2 p-2 rounded-md bg-background border border-border hover:bg-channel-hover transition-colors"
              >
                <span className="text-xs font-mono text-muted-foreground truncate">{localPeer?.id}</span>
                <Copy className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              </button>
              <p className="text-xs text-muted-foreground">Share your Peer ID to receive direct messages.</p>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowQR(!showQR)}
                className="w-full gap-2"
              >
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
                <Wifi className="w-3.5 h-3.5" /> Security &amp; Transport
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="capitalize text-foreground">{connectionStatus}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Server Channels</span>
                <span className="text-foreground">WebRTC DTLS (Host-Relayed)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Direct Messages</span>
                <span className="text-success">E2E (ECDH + AES-256-GCM)</span>
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
          </TabsContent>

          <TabsContent value="network" className="space-y-4 pt-3">
            {/* Connection Diagnostics */}
            <div className="p-3 rounded-lg bg-secondary/50 border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
                  <Globe className="w-3.5 h-3.5" /> Connection Diagnostics
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={networkBusy}
                  onClick={handleReconnect}
                  className="h-7 px-2.5 text-xs gap-1.5"
                >
                  <RefreshCw className={`w-3 h-3 ${networkBusy ? 'animate-spin' : ''}`} />
                  Reconnect Now
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs pt-1">
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Signaling</span>
                  <span
                    className={`capitalize font-medium ${
                      diagnostics?.signalingState === 'connected'
                        ? 'text-success'
                        : diagnostics?.signalingState === 'reconnecting'
                          ? 'text-warning'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {diagnostics?.signalingState || 'disconnected'}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Peers / Bulk</span>
                  <span className="font-mono tabular-nums text-foreground">
                    {diagnostics?.activePeerCount ?? 0} / {diagnostics?.bulkChannelCount ?? 0}
                  </span>
                </div>
                <div className="col-span-2 flex justify-between gap-2">
                  <span className="text-muted-foreground">Endpoint</span>
                  <span className="font-mono text-foreground truncate max-w-[240px]">
                    {diagnostics?.signalingEndpoint || 'PeerJS Public Cloud'}
                  </span>
                </div>
                <div className="col-span-2 flex justify-between gap-2">
                  <span className="text-muted-foreground">NAT Traversal</span>
                  <span className="font-mono tabular-nums text-foreground">
                    {diagnostics?.iceServerCount
                      ? `${diagnostics.iceServerCount} ICE (${diagnostics.hasTurnRelay ? 'TURN relay ready' : 'STUN only'})`
                      : 'PeerJS Default STUN'}
                  </span>
                </div>
              </div>
            </div>

            {/* Overrides form */}
            <form onSubmit={handleSaveNetwork} className="space-y-4">
              <div className="p-3 rounded-lg bg-secondary/50 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    Signaling Server Override
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {diagnostics?.usingCustomSignaling ? 'Custom override active' : 'Env / default'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label htmlFor="sig-host" className="text-xs">
                      Host
                    </Label>
                    <Input
                      id="sig-host"
                      value={signalingHost}
                      onChange={(e) => setSignalingHost(e.target.value)}
                      placeholder="0.peerjs.com (default)"
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="sig-port" className="text-xs">
                      Port
                    </Label>
                    <Input
                      id="sig-port"
                      type="number"
                      min={1}
                      max={65535}
                      value={signalingPort}
                      onChange={(e) => setSignalingPort(e.target.value)}
                      placeholder="443"
                      className="h-8 text-xs font-mono tabular-nums"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="sig-path" className="text-xs">
                      Path
                    </Label>
                    <Input
                      id="sig-path"
                      value={signalingPath}
                      onChange={(e) => setSignalingPath(e.target.value)}
                      placeholder="/peerjs"
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-4 px-1">
                    <Label htmlFor="sig-secure" className="text-xs cursor-pointer">
                      Use TLS (wss://)
                    </Label>
                    <Switch
                      id="sig-secure"
                      checked={signalingSecure}
                      onCheckedChange={setSignalingSecure}
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-secondary/50 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    ICE / TURN Servers
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {diagnostics?.usingCustomIceServers ? 'Custom override active' : 'Env / default'}
                  </span>
                </div>

                {iceServers.length > 0 ? (
                  <div className="space-y-1.5">
                    {iceServers.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md bg-background border border-border text-xs"
                      >
                        <div className="min-w-0">
                          <span className="font-mono text-foreground block truncate">{item.url}</span>
                          {item.username && (
                            <span className="text-[11px] text-muted-foreground font-mono">
                              user: {item.username} {item.credential ? '· credential set' : ''}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveIceServer(item.id)}
                          aria-label={`Remove ${item.url}`}
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No custom ICE servers set. PeerJS default public STUN servers will be used.
                  </p>
                )}

                <div className="space-y-2 pt-1 border-t border-border/60">
                  <div className="flex gap-2">
                    <Input
                      aria-label="New ICE or TURN URL"
                      value={newIceUrl}
                      onChange={(e) => setNewIceUrl(e.target.value)}
                      placeholder="turn:relay.example.com:3478 or stun:..."
                      className="h-8 text-xs font-mono flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddIceServer}
                      className="h-8 px-2.5 text-xs gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      aria-label="TURN username"
                      value={newIceUser}
                      onChange={(e) => setNewIceUser(e.target.value)}
                      placeholder="TURN username (optional)"
                      className="h-8 text-xs"
                    />
                    <Input
                      aria-label="TURN credential"
                      type="password"
                      value={newIceCred}
                      onChange={(e) => setNewIceCred(e.target.value)}
                      placeholder="TURN credential (optional)"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>

              {networkError && (
                <p className="text-xs text-destructive" role="alert">
                  {networkError}
                </p>
              )}

              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={networkBusy}
                  onClick={handleResetNetwork}
                  className="gap-1.5 text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset to Defaults
                </Button>
                <Button type="submit" size="sm" disabled={networkBusy}>
                  {networkBusy ? 'Applying...' : 'Save & Reconnect'}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
