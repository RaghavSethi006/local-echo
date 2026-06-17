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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Metric } from './SettingsHelper';
import {
  Check,
  Hash,
  Loader2,
  Pencil,
  Plus,
  ShieldAlert,
  SlidersHorizontal,
  Trash2,
  UserCog,
  X,
  LogOut,
} from 'lucide-react';
import { ChannelOp, Channel } from '@/types/p2p';
import { createDefaultCommunityConfig } from '@/lib/templates';
import {
  type CommunityConfig,
  type PermissionFlag,
} from '@/types/community';

const PRESET_ICONS = ['💬', '🚀', '🌌', '🎮', '🎨', '🔥', '⚡', '🌿', '🪐', '🛰️', '🦊', '🐙', '🍕', '☕', '🎧'];
const primaryPermissions: PermissionFlag[] = [
  'manage_server',
  'manage_roles',
  'manage_channels',
  'manage_moderation',
  'manage_automations',
  'manage_bots',
  'manage_plugins',
  'view_analytics',
  'use_ai',
  'manage_ai',
  'manage_monetization',
];

interface ServerSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function cloneConfig(config: CommunityConfig): CommunityConfig {
  return JSON.parse(JSON.stringify(config)) as CommunityConfig;
}

export function ServerSettingsDialog({ open, onOpenChange }: ServerSettingsDialogProps) {
  const {
    currentServer,
    localPeer,
    isCurrentServerHost,
    updateCurrentServer,
    leaveCurrentServer,
    deleteCurrentServer,
  } = useP2P();

  const fallbackConfig = useMemo(() => {
    if (!currentServer || !localPeer) return null;
    return createDefaultCommunityConfig({
      name: currentServer.name,
      icon: currentServer.icon,
      tags: [],
      visibility: 'private',
      template: 'custom',
      region: 'auto',
      language: 'en',
      onboardingTemplate: 'none',
      aiSetupEnabled: false,
    }, localPeer.id);
  }, [currentServer, localPeer]);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [config, setConfig] = useState<CommunityConfig | null>(null);
  const [pendingOps, setPendingOps] = useState<ChannelOp[]>([]);
  const [editing, setEditing] = useState<Record<string, { name: string; description: string }>>({});
  const [newChannel, setNewChannel] = useState('');
  const [newRoleName, setNewRoleName] = useState('');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [confirmingDestructive, setConfirmingDestructive] = useState(false);

  useEffect(() => {
    if (open && currentServer && fallbackConfig) {
      const nextConfig = cloneConfig(currentServer.config || fallbackConfig);
      setName(currentServer.name);
      setIcon(currentServer.icon || nextConfig.branding.icon || '');
      setConfig(nextConfig);
      setPendingOps([]);
      setEditing({});
      setNewChannel('');
      setNewRoleName('');
      setDirty(false);
      setConfirmingDestructive(false);
    }
  }, [open, currentServer?.id, fallbackConfig]); // eslint-disable-line react-hooks/exhaustive-deps

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

  if (!currentServer || !config) return null;

  const markConfig = (updater: (draft: CommunityConfig) => void) => {
    setConfig(prev => {
      if (!prev) return prev;
      const next = cloneConfig(prev);
      updater(next);
      return next;
    });
    setDirty(true);
  };

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
    if (displayedChannels.some(c => c.name === cleanName)) {
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

  const removeChannel = (channelId: string) => {
    if (displayedChannels.length <= 1) {
      toast.error('Server must have at least one channel');
      return;
    }
    const wasJustAdded = pendingOps.some(op => op.kind === 'add' && op.channel.id === channelId);
    if (wasJustAdded) {
      setPendingOps(ops => ops.filter(op => !(op.kind === 'add' && op.channel.id === channelId)));
      return;
    }
    setPendingOps(ops => [...ops, { kind: 'delete', channelId }]);
  };

  const addRole = () => {
    const roleName = newRoleName.trim();
    if (!roleName) return;
    markConfig(draft => {
      draft.roles.push({
        id: `role-${Date.now()}`,
        name: roleName,
        description: 'Custom community role',
        color: '#38bdf8',
        position: Math.max(...draft.roles.map(role => role.position), 0) - 1,
        permissions: ['view_channels', 'send_messages'],
        mentionable: true,
        hoisted: false,
      });
    });
    setNewRoleName('');
  };

  const toggleRolePermission = (roleId: string, permission: PermissionFlag) => {
    markConfig(draft => {
      const role = draft.roles.find(r => r.id === roleId);
      if (!role) return;
      role.permissions = role.permissions.includes(permission)
        ? role.permissions.filter(p => p !== permission)
        : [...role.permissions, permission];
    });
  };

  const removeRole = (roleId: string) => {
    if (['owner', 'admin', 'moderator', 'member', 'newcomer'].includes(roleId)) {
      toast.error('Default system roles cannot be deleted');
      return;
    }
    markConfig(draft => {
      draft.roles = draft.roles.filter(role => role.id !== roleId);
    });
  };

  const hasChanges =
    name.trim() !== currentServer.name ||
    icon !== (currentServer.icon || '') ||
    pendingOps.length > 0 ||
    dirty;

  const handleSave = async () => {
    if (!hasChanges) return;
    setSaving(true);
    try {
      await updateCurrentServer({
        name: name.trim() !== currentServer.name ? name.trim() : undefined,
        icon: icon !== (currentServer.icon || '') ? icon : undefined,
        channelOps: pendingOps,
        configPatch: {
          branding: { ...config.branding, icon },
          roles: config.roles,
          permissionOverwrites: config.permissionOverwrites,
        },
      });
      toast.success('Server management settings saved');
      onOpenChange(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update server');
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
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    }
  };

  const sectionClass = 'space-y-4';

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setConfirmingDestructive(false); }}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" />
            Server Management
          </DialogTitle>
          <DialogDescription>
            {isCurrentServerHost
              ? 'Manage server settings. Changes sync to connected peers.'
              : 'You are a member. You can inspect settings but cannot edit them.'}
          </DialogDescription>
        </DialogHeader>

        <fieldset disabled={!isCurrentServerHost} className="disabled:opacity-60">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="flex h-auto flex-wrap justify-start">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="channels">Channels</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className={sectionClass}>
              <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Server Overview</CardTitle>
                    <CardDescription>Identity and description.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-[100px_1fr]">
                      <div className="space-y-2">
                        <Label>Icon</Label>
                        <div className="grid grid-cols-3 gap-1">
                          {PRESET_ICONS.slice(0, 9).map(emoji => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => { setIcon(emoji); markConfig(d => { d.branding.icon = emoji; }); }}
                              className={cn('h-9 rounded-lg border text-lg', icon === emoji ? 'border-primary bg-primary/10' : 'border-border bg-secondary')}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label>Server name</Label>
                          <Input value={name} onChange={e => setName(e.target.value)} maxLength={48} />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={config.branding.description}
                            onChange={e => markConfig(d => { d.branding.description = e.target.value; })}
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Snapshot</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <Metric label="Roles" value={config.roles.length} />
                    <Metric label="Channels" value={displayedChannels.length} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="roles" className={sectionClass}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><UserCog className="h-5 w-5" /> Role Hierarchy</CardTitle>
                  <CardDescription>Unlimited roles, hierarchy, colors, mentionability, and core permissions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Input value={newRoleName} onChange={e => setNewRoleName(e.target.value)} placeholder="New role name" />
                    <Button type="button" onClick={addRole}><Plus className="mr-2 h-4 w-4" /> Add role</Button>
                  </div>
                  {config.roles.slice().sort((a, b) => b.position - a.position).map(role => (
                    <div key={role.id} className="rounded-lg border border-border p-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 h-4 w-4 rounded-full" style={{ backgroundColor: role.color }} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Input
                              value={role.name}
                              onChange={e => markConfig(d => { const r = d.roles.find(item => item.id === role.id); if (r) r.name = e.target.value; })}
                              className="h-8 max-w-64"
                            />
                            <Badge variant="secondary">position {role.position}</Badge>
                            {role.temporary && <Badge variant="outline">temporary</Badge>}
                            {role.hoisted && <Badge variant="outline">visible</Badge>}
                          </div>
                          <Input
                            value={role.description}
                            onChange={e => markConfig(d => { const r = d.roles.find(item => item.id === role.id); if (r) r.description = e.target.value; })}
                            className="mt-2 h-8"
                          />
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {primaryPermissions.map(permission => (
                              <button
                                key={permission}
                                type="button"
                                onClick={() => toggleRolePermission(role.id, permission)}
                                className={cn(
                                  'rounded-full border px-2 py-1 text-xs',
                                  role.permissions.includes(permission)
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-border text-muted-foreground'
                                )}
                              >
                                {permission.replace(/_/g, ' ')}
                              </button>
                            ))}
                          </div>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeRole(role.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="channels" className={sectionClass}>
              <Card>
                <CardHeader>
                  <CardTitle>Channel Management</CardTitle>
                  <CardDescription>Text and voice spaces with editable descriptions. Voice channels are still marked coming soon in chat.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {displayedChannels.map(ch => {
                    const draft = editing[ch.id];
                    if (draft) {
                      return (
                        <div key={ch.id} className="rounded-md border border-border bg-background p-2">
                          <Input value={draft.name} onChange={e => setEditing({ ...editing, [ch.id]: { ...draft, name: e.target.value } })} />
                          <Textarea className="mt-2" value={draft.description} onChange={e => setEditing({ ...editing, [ch.id]: { ...draft, description: e.target.value } })} rows={2} />
                          <div className="mt-2 flex justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => { const next = { ...editing }; delete next[ch.id]; setEditing(next); }}><X className="h-4 w-4" /></Button>
                            <Button size="sm" onClick={() => commitEdit(ch.id)}><Check className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={ch.id} className="group flex items-center gap-2 rounded-md border border-border p-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{ch.name}</p>
                          {ch.description && <p className="truncate text-xs text-muted-foreground">{ch.description}</p>}
                        </div>
                        <Badge variant="outline">{ch.type}</Badge>
                        <Button size="sm" variant="ghost" onClick={() => setEditing({ ...editing, [ch.id]: { name: ch.name, description: ch.description || '' } })}><Pencil className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => removeChannel(ch.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    );
                  })}
                  <div className="flex gap-2 pt-2">
                    <Input value={newChannel} onChange={e => setNewChannel(e.target.value)} onKeyDown={e => e.key === 'Enter' && addChannel()} placeholder="new-channel" />
                    <Button type="button" onClick={addChannel}><Plus className="mr-2 h-4 w-4" /> Add</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>


          </Tabs>
        </fieldset>

        <div className="flex flex-col gap-2 border-t border-border pt-3">
          {isCurrentServerHost && (
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={!hasChanges || saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save server systems
              </Button>
            </div>
          )}

          <Button
            variant={confirmingDestructive ? 'destructive' : 'outline'}
            onClick={handleDestructive}
            className="w-full"
          >
            {isCurrentServerHost ? <ShieldAlert className="mr-2 h-4 w-4" /> : <LogOut className="mr-2 h-4 w-4" />}
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


