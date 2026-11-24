import { useState, lazy, Suspense, useCallback } from 'react';
import { useP2P } from '@/contexts/P2PContext';
import { cn } from '@/lib/utils';
import { Plus, Hash, Settings, Wifi, WifiOff, MessageCircle, ScanLine } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { parseProfileQR } from '@/lib/qr';

const CreateServerDialog = lazy(() => import('./CreateServerDialog').then(m => ({ default: m.CreateServerDialog })));
const JoinServerDialog = lazy(() => import('./JoinServerDialog').then(m => ({ default: m.JoinServerDialog })));
const SettingsDialog = lazy(() => import('./SettingsDialog').then(m => ({ default: m.SettingsDialog })));
const ScanQRDialog = lazy(() => import('./ScanQRDialog').then(m => ({ default: m.ScanQRDialog })));

export function ServerSidebar() {
  const { servers, currentServer, selectServer, connectionStatus, viewMode, setViewMode, dmConversations, joinServer, startDMByPeerId } = useP2P();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showScanDialog, setShowScanDialog] = useState(false);

  const handleScanResult = useCallback(async (result: string) => {
    const profile = parseProfileQR(result);
    if (profile) {
      try {
        await startDMByPeerId(profile.peerId, profile.username);
        toast.success(`Started DM with ${profile.username || profile.peerId.slice(0, 8)}`);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Failed to start DM');
      }
      return;
    }

    try {
      await joinServer(result);
      toast.success('Joined server successfully!');
    } catch {
      toast.error('Failed to join server from QR code');
    }
  }, [joinServer, startDMByPeerId]);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'host':
      case 'connected':
        return 'bg-status-online';
      case 'connecting':
        return 'bg-status-idle';
      default:
        return 'bg-status-offline';
    }
  };

  const StatusIcon = connectionStatus === 'disconnected' ? WifiOff : Wifi;
  const totalUnreadDMs = dmConversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  return (
    <aside className="w-[72px] bg-sidebar flex flex-col items-center py-3 gap-2 border-r border-sidebar-border">
      {/* Connection Status Indicator */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative mb-2" aria-label={`Network status: ${connectionStatus}`}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-secondary/80 border border-border/60">
              <StatusIcon className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div className={cn(
              'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-sidebar',
              getStatusColor()
            )} />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p className="capitalize">Status: {connectionStatus}</p>
        </TooltipContent>
      </Tooltip>

      {/* DM Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => setViewMode('dms')}
            aria-label="Direct Messages"
            className={cn(
              'relative w-12 h-12 rounded-2xl flex items-center justify-center',
              'font-semibold transition-all duration-200',
              'hover:rounded-xl',
              viewMode === 'dms'
                ? 'bg-primary text-primary-foreground rounded-xl'
                : 'bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground'
            )}
          >
            <MessageCircle className="w-5 h-5" />
            {totalUnreadDMs > 0 && (
              <div className="absolute -bottom-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-xs font-bold tabular-nums flex items-center justify-center px-1">
                {totalUnreadDMs > 99 ? '99+' : totalUnreadDMs}
              </div>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Direct Messages</p>
        </TooltipContent>
      </Tooltip>

      <div className="w-8 h-[2px] bg-sidebar-border rounded-full my-1" />

      {/* Server List */}
      {servers.map((server) => (
        <Tooltip key={server.id}>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => selectServer(server.id)}
              aria-label={server.name}
              aria-current={currentServer?.id === server.id && viewMode === 'servers' ? 'page' : undefined}
              className={cn(
                'w-12 h-12 rounded-2xl flex items-center justify-center',
                'font-semibold text-lg transition-all duration-200',
                'hover:rounded-xl',
                currentServer?.id === server.id && viewMode === 'servers'
                  ? 'bg-primary text-primary-foreground rounded-xl'
                  : 'bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground'
              )}
            >
              {server.icon || server.name.charAt(0).toUpperCase()}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{server.name}</p>
          </TooltipContent>
        </Tooltip>
      ))}

      {/* Add Server Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => setShowCreateDialog(true)}
            aria-label="Add a Server"
            className={cn(
              'w-12 h-12 rounded-2xl flex items-center justify-center',
              'bg-secondary text-success transition-all duration-200',
              'hover:rounded-xl hover:bg-success hover:text-success-foreground'
            )}
          >
            <Plus className="w-6 h-6" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Add a Server</p>
        </TooltipContent>
      </Tooltip>

      {/* Join Server Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => setShowJoinDialog(true)}
            aria-label="Join a Server"
            className={cn(
              'w-12 h-12 rounded-2xl flex items-center justify-center',
              'bg-secondary text-muted-foreground transition-all duration-200',
              'hover:rounded-xl hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Hash className="w-5 h-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Join a Server</p>
        </TooltipContent>
      </Tooltip>

      {/* Scan QR Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => setShowScanDialog(true)}
            aria-label="Scan QR Code"
            className={cn(
              'w-12 h-12 rounded-2xl flex items-center justify-center',
              'bg-secondary text-muted-foreground transition-all duration-200',
              'hover:rounded-xl hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <ScanLine className="w-5 h-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Scan QR Code</p>
        </TooltipContent>
      </Tooltip>

      <div className="flex-1" />

      {/* Settings */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => setShowSettingsDialog(true)}
            aria-label="Settings"
            className={cn(
              'w-12 h-12 rounded-2xl flex items-center justify-center',
              'bg-secondary text-muted-foreground transition-all duration-200',
              'hover:rounded-xl hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Settings className="w-5 h-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Settings</p>
        </TooltipContent>
      </Tooltip>

      <Suspense fallback={null}>
        <CreateServerDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
        <JoinServerDialog open={showJoinDialog} onOpenChange={setShowJoinDialog} />
        <SettingsDialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog} />
        <ScanQRDialog open={showScanDialog} onOpenChange={setShowScanDialog} onResult={handleScanResult} />
      </Suspense>
    </aside>
  );
}
