import { useEffect, useMemo, useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Hash, Plus, Trash2, Pencil, Check, X, LogOut, ShieldAlert, Loader2 } from 'lucide-react';
import { ChannelOp, Channel } from '@/types/p2p';

const PRESET_ICONS = ['💬', '🚀', '🌌', '🎮', '🎨', '🔥', '⚡️', '🌿', '🪐', '🛰️', '🦊', '🐙', '🍕', '☕️', '🎧'];

interface ServerSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServerSettingsDialog({ open, onOpenChange }: ServerSettingsDialogProps) {
  const {
    currentServer,
    isCurrentServerHost,
    updateCurrentServer,
    leaveCurrentServer,
    deleteCurrentServer,
  } = useP2P();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [pendingOps, setPendingOps] = useState<ChannelOp[]>([]);
  const [editing, setEditing] = useState<Record<string, { name: string; description: string }>>({});
  const [newChannel, setNewChannel] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmingDestructive, setConfirmingDestructive] = useState(false);

  // Reset state every time we open
  useEffect(() => {
    if (open && currentServer) {
      setName(currentServer.name);
      setIcon(currentServer.icon || '');
      setPendingOps([]);
      setEditing({});
      setNewChannel('');
      setConfirmingDestructive(false);
    }
  }, [open, currentServer?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Compute displayed channel list = current channels with pending edits applied.
  const displayedChannels = useMemo<Channel[]>(() => {
    if (!currentServer) return [];
    const list: Channel[] = currentServer.channels
      .filter(c => !pendingOps.some(op => op.kind === 'delete' && op.channelId === c.id))
      .map(c => {
        const renameOp = [...pendingOps]
          .reverse()
          .find(op => op.kind === 'rename' && op.channelId === c.id) as Extract<ChannelOp, { kind: 'rename' }> | undefined;
        return renameOp
          ? { ...c, name: renameOp.name, description: renameOp.description ?? c.description }
          : c;
      });
    pendingOps.forEach(op => {
      if (op.kind === 'add') list.push(op.channel);
    });
    return list;
  }, [currentServer, pendingOps]);

  if (!currentServer) return null;

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 32) || `channel-${Math.random().toString(36).slice(2, 6)}`;

  const addChannel = () => {
    const cleanName = slugify(newChannel);
    if (!cleanName) return;
    const exists = displayedChannels.some(c => c.name === cleanName);
    if (exists) {
      toast.error('A channel with that name already exists');
      return;
    }
    const channel: Channel = {
      id: `ch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: cleanName,
      type: 'text',
    };
    setPendingOps(ops => [...ops, { kind: 'add', channel }]);
    setNewChannel('');
  };

  const startEdit = (channel: Channel) => {
    setEditing({ ...editing, [channel.id]: { name: channel.name, description: channel.description || '' } });
  };

  const commitEdit = (channelId: string) => {
    const draft = editing[channelId];
    if (!draft) return;
    const cleanName = slugify(draft.name);
    if (!cleanName) {
      toast.error('Channel name cannot be empty');
      return;
    }
    setPendingOps(ops => [
      ...ops,
      { kind: 'rename', channelId, name: cleanName, description: draft.description.trim() || undefined },
    ]);
    const next = { ...editing };
    delete next[channelId];
    setEditing(next);
  };

  const cancelEdit = (channelId: string) => {
    const next = { ...editing };
    delete next[channelId];
    setEditing(next);
  };

  const removeChannel = (channelId: string) => {
    if (displayedChannels.length <= 1) {
      toast.error('Server must have at least one channel');
      return;
    }
    // If it's a freshly-added channel, just drop the pending add
    const wasJustAdded = pendingOps.some(op => op.kind === 'add' && op.channel.id === channelId);
    if (wasJustAdded) {
      setPendingOps(ops => ops.filter(op => !(op.kind === 'add' && op.channel.id === channelId)));
      return;
    }
    setPendingOps(ops => [...ops, { kind: 'delete', channelId }]);
  };

  const hasChanges =
    name.trim() !== currentServer.name ||
    icon !== (currentServer.icon || '') ||
    pendingOps.length > 0;

  const handleSave = async () => {
    if (!hasChanges) return;
    setSaving(true);
    try {
      await updateCurrentServer({
        name: name.trim() !== currentServer.name ? name.trim() : undefined,
        icon: icon !== (currentServer.icon || '') ? icon : undefined,
        channelOps: pendingOps,
      });
      toast.success('Server updated');
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update server');
    } finally {
      setSaving(false);
    }
  };

  const handleDestructive = async () => {
    if (!confirmingDestructive) {
      setConfirmingDestructive(true);
      return;
    }
    try {
      if (isCurrentServerHost) {
        await deleteCurrentServer();
        toast.success('Server deleted');
      } else {
        await leaveCurrentServer();
        toast.success('Left server');
      }
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message || 'Failed');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setConfirmingDestructive(false); }}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Server Settings</DialogTitle>
          <DialogDescription>
            {isCurrentServerHost
              ? 'You are the host. Changes broadcast to all connected peers.'
              : 'You are a member. You can leave the server but cannot edit it.'}
          </DialogDescription>
        </DialogHeader>

        <fieldset disabled={!isCurrentServerHost} className="space-y-5 py-2 disabled:opacity-60">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="srv-name">Server name</Label>
            <Input
              id="srv-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My server"
              maxLength={48}
            />
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setIcon('')}
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center text-xs font-semibold border transition-colors',
                  icon === ''
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-secondary text-muted-foreground hover:bg-channel-hover'
                )}
                aria-label="No icon (use first letter)"
              >
                {name.charAt(0).toUpperCase() || '?'}
              </button>
              {PRESET_ICONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center text-lg border transition-colors',
                    icon === emoji
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-secondary hover:bg-channel-hover'
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Channels */}
          <div className="space-y-2">
            <Label>Channels</Label>
            <div className="space-y-1 rounded-lg border border-border bg-secondary/30 p-2">
              {displayedChannels.map((ch) => {
                const draft = editing[ch.id];
                if (draft) {
                  return (
                    <div key={ch.id} className="flex flex-col gap-2 p-2 rounded-md bg-background border border-border">
                      <Input
                        value={draft.name}
                        onChange={(e) =>
                          setEditing({ ...editing, [ch.id]: { ...draft, name: e.target.value } })
                        }
                        placeholder="channel-name"
                        className="h-8 text-sm"
                      />
                      <Textarea
                        value={draft.description}
                        onChange={(e) =>
                          setEditing({ ...editing, [ch.id]: { ...draft, description: e.target.value } })
                        }
                        placeholder="Topic (optional)"
                        rows={2}
                        className="text-xs"
                      />
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => cancelEdit(ch.id)}>
                          <X className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" onClick={() => commitEdit(ch.id)}>
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                }
                return (
                  <div
                    key={ch.id}
                    className="group flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-channel-hover"
                  >
                    <Hash className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{ch.name}</p>
                      {ch.description && (
                        <p className="text-xs text-muted-foreground truncate">{ch.description}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => startEdit(ch)}
                      className="p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Edit channel"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeChannel(ch.id)}
                      className="p-1 text-destructive/80 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Delete channel"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

              {/* New channel input */}
              <div className="flex items-center gap-2 pt-1 border-t border-border mt-1">
                <Hash className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
                <Input
                  value={newChannel}
                  onChange={(e) => setNewChannel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addChannel())}
                  placeholder="new-channel"
                  className="h-8 text-sm border-0 bg-transparent focus-visible:ring-0 px-1"
                />
                <Button size="sm" variant="ghost" onClick={addChannel} disabled={!newChannel.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {pendingOps.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {pendingOps.length} unsaved change{pendingOps.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </fieldset>

        {/* Footer actions */}
        <div className="flex flex-col gap-2 pt-3 border-t border-border">
          {isCurrentServerHost && (
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={!hasChanges || saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save changes
              </Button>
            </div>
          )}

          <Button
            variant={confirmingDestructive ? 'destructive' : 'outline'}
            onClick={handleDestructive}
            className="w-full"
          >
            {isCurrentServerHost ? <ShieldAlert className="w-4 h-4 mr-2" /> : <LogOut className="w-4 h-4 mr-2" />}
            {confirmingDestructive
              ? 'Tap again to confirm'
              : isCurrentServerHost
                ? 'Delete server (broadcasts to all peers)'
                : 'Leave server'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}