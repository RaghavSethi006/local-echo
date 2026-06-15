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
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Field, ToggleRow, Metric, RoadmapBanner } from './SettingsHelper';
import {
  BarChart3,
  Bot,
  Check,
  Coins,
  Hash,
  Loader2,
  Lock,
  Pencil,
  Plus,
  ShieldAlert,
  SlidersHorizontal,
  Trash2,
  UserCog,
  Workflow,
  X,
  LogOut,
} from 'lucide-react';
import { ChannelOp, Channel } from '@/types/p2p';
import { createDefaultCommunityConfig } from '@/lib/templates';
import {
  TEMPLATE_LABELS,
  type AutoModRule,
  type AutomationWorkflow,
  type CommunityConfig,

  type ModerationSettings,
  type PermissionFlag,
  type ServerVisibility,
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

  const addAutomodRule = () => {
    const rule: AutoModRule = {
      id: `rule-${Date.now()}`,
      name: 'Keyword escalation',
      enabled: true,
      trigger: 'keyword',
      threshold: 1,
      action: 'notify-mods',
    };
    markConfig(draft => {
      draft.automodRules.unshift(rule);
    });
  };

  const addAutomation = () => {
    const workflow: AutomationWorkflow = {
      id: `workflow-${Date.now()}`,
      name: 'Notify moderators',
      enabled: true,
      trigger: 'message-created',
      condition: 'Message contains watched keyword',
      action: 'alert-mods',
      description: 'Alerts moderators when a watched keyword appears.',
    };
    markConfig(draft => {
      draft.automations.unshift(workflow);
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
          discovery: config.discovery,
          invites: config.invites,
          onboarding: config.onboarding,
          roles: config.roles,
          permissionOverwrites: config.permissionOverwrites,
          moderation: config.moderation,
          automodRules: config.automodRules,
          automations: config.automations,
          analytics: config.analytics,
          integrations: config.integrations,
          monetization: config.monetization,
          backups: config.backups,
          auditLogEntry: {
            id: `audit-${Date.now()}`,
            actorId: localPeer?.id || 'local',
            action: 'community.settings_updated',
            target: currentServer.name,
            reason: 'Saved from server management dashboard',
            timestamp: Date.now(),
          },
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
  const templateName = TEMPLATE_LABELS[config.template];

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
              ? `Manage ${templateName} community systems. Changes sync to connected peers.`
              : 'You are a member. You can inspect settings but cannot edit them.'}
          </DialogDescription>
        </DialogHeader>

        <fieldset disabled={!isCurrentServerHost} className="disabled:opacity-60">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="flex h-auto flex-wrap justify-start">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="branding">Branding</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="channels">Channels</TabsTrigger>
              <TabsTrigger value="moderation">Moderation 🗺️</TabsTrigger>
              <TabsTrigger value="automation">Automation 🗺️</TabsTrigger>
              <TabsTrigger value="analytics">Analytics 🗺️</TabsTrigger>
              <TabsTrigger value="integrations">Integrations 🗺️</TabsTrigger>
              <TabsTrigger value="audit">Audit</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className={sectionClass}>
              <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Community Overview</CardTitle>
                    <CardDescription>Identity, discoverability, region, language, and invite behavior.</CardDescription>
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
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Visibility</Label>
                        <select
                          value={config.discovery.visibility}
                          onChange={e => markConfig(d => { d.discovery.visibility = e.target.value as ServerVisibility; d.discovery.allowDiscovery = e.target.value === 'public'; })}
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="private">Private</option>
                          <option value="unlisted">Unlisted</option>
                          <option value="public">Public</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Region</Label>
                        <Input value={config.discovery.region} onChange={e => markConfig(d => { d.discovery.region = e.target.value; })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Language</Label>
                        <Input value={config.discovery.language} onChange={e => markConfig(d => { d.discovery.language = e.target.value; })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Tags</Label>
                      <Input
                        value={config.discovery.tags.join(', ')}
                        onChange={e => markConfig(d => { d.discovery.tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean); })}
                        placeholder="gaming, ai, study"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Snapshot</CardTitle>
                    <CardDescription>Live community infrastructure status.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <Metric label="Roles" value={config.roles.length} />
                    <Metric label="Channels" value={displayedChannels.length} />
                    <Metric label="Automod rules" value={config.automodRules.length} />
                    <Metric label="Automations" value={config.automations.length} />
                    <Metric label="Audit events" value={config.auditLog.length} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="branding" className={sectionClass}>
              <Card>
                <CardHeader>
                  <CardTitle>Branding And Customization</CardTitle>
                  <CardDescription>Welcome pages, invite splash, banners, gradients, and accent colors.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 lg:grid-cols-2">
                  <Field label="Banner URL" value={config.branding.bannerUrl || ''} onChange={value => markConfig(d => { d.branding.bannerUrl = value; })} />
                  <Field label="Wallpaper URL" value={config.branding.wallpaperUrl || ''} onChange={value => markConfig(d => { d.branding.wallpaperUrl = value; })} />
                  <Field label="Accent color" value={config.branding.accentColor} onChange={value => markConfig(d => { d.branding.accentColor = value; })} />
                  <Field label="Gradient from" value={config.branding.gradientFrom} onChange={value => markConfig(d => { d.branding.gradientFrom = value; })} />
                  <Field label="Gradient to" value={config.branding.gradientTo} onChange={value => markConfig(d => { d.branding.gradientTo = value; })} />
                  <Field label="Welcome title" value={config.branding.welcomeTitle} onChange={value => markConfig(d => { d.branding.welcomeTitle = value; })} />
                  <div className="space-y-2 lg:col-span-2">
                    <Label>Welcome message</Label>
                    <Textarea value={config.branding.welcomeMessage} onChange={e => markConfig(d => { d.branding.welcomeMessage = e.target.value; })} rows={3} />
                  </div>
                  <div className="space-y-2 lg:col-span-2">
                    <Label>Invite splash text</Label>
                    <Textarea value={config.branding.inviteSplash} onChange={e => markConfig(d => { d.branding.inviteSplash = e.target.value; })} rows={2} />
                  </div>
                </CardContent>
              </Card>
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

            <TabsContent value="moderation" className={sectionClass}>
              <RoadmapBanner feature="Moderation" />
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5" /> Safety Controls</CardTitle>
                    <CardDescription>Manual and automatic moderation switches.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label>Verification level</Label>
                      <select
                        value={config.moderation.verificationLevel}
                        onChange={e => markConfig(d => { d.moderation.verificationLevel = e.target.value as ModerationSettings['verificationLevel']; })}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="none">None</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="strict">Strict</option>
                      </select>
                    </div>
                    {Object.entries(config.moderation).filter(([key]) => key !== 'verificationLevel').map(([key, value]) => (
                      <ToggleRow
                        key={key}
                        label={key.replace(/([A-Z])/g, ' $1')}
                        checked={Boolean(value)}
                        onCheckedChange={checked => markConfig(d => { (d.moderation as Record<string, unknown>)[key] = checked; })}
                      />
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Auto Moderation Rules</CardTitle>
                    <CardDescription>Spam, raid, scam, mass mention, keyword, and AI risk actions.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button type="button" variant="outline" onClick={addAutomodRule}><Plus className="mr-2 h-4 w-4" /> Add rule</Button>
                    {config.automodRules.map(rule => (
                      <div key={rule.id} className="rounded-lg border border-border p-3">
                        <div className="flex items-center justify-between gap-3">
                          <Input value={rule.name} onChange={e => markConfig(d => { const r = d.automodRules.find(item => item.id === rule.id); if (r) r.name = e.target.value; })} />
                          <Switch checked={rule.enabled} onCheckedChange={checked => markConfig(d => { const r = d.automodRules.find(item => item.id === rule.id); if (r) r.enabled = checked; })} />
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary">{rule.trigger}</Badge>
                          <Badge variant="outline">threshold {rule.threshold}</Badge>
                          <Badge variant="outline">{rule.action}</Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="automation" className={sectionClass}>
              <RoadmapBanner feature="Automation" />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Workflow className="h-5 w-5" /> Automation Builder</CardTitle>
                  <CardDescription>No-code workflows with triggers, conditions, and actions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button type="button" variant="outline" onClick={addAutomation}><Plus className="mr-2 h-4 w-4" /> Add workflow</Button>
                  {config.automations.map(workflow => (
                    <div key={workflow.id} className="rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between gap-3">
                        <Input value={workflow.name} onChange={e => markConfig(d => { const w = d.automations.find(item => item.id === workflow.id); if (w) w.name = e.target.value; })} />
                        <Switch checked={workflow.enabled} onCheckedChange={checked => markConfig(d => { const w = d.automations.find(item => item.id === workflow.id); if (w) w.enabled = checked; })} />
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{workflow.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge>{workflow.trigger}</Badge>
                        <Badge variant="outline">{workflow.condition}</Badge>
                        <Badge variant="secondary">{workflow.action}</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className={sectionClass}>
              <RoadmapBanner feature="Analytics" />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Analytics And Insights</CardTitle>
                  <CardDescription>Engagement, moderation, retention, channel activity, and AI health signals.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(config.analytics).filter(([key]) => key !== 'retentionDays').map(([key, value]) => (
                    <ToggleRow key={key} label={key.replace(/([A-Z])/g, ' $1')} checked={Boolean(value)} onCheckedChange={checked => markConfig(d => { (d.analytics as Record<string, unknown>)[key] = checked; })} />
                  ))}
                  <Field label="Retention days" value={String(config.analytics.retentionDays)} onChange={value => markConfig(d => { d.analytics.retentionDays = Number(value) || 30; })} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations" className={sectionClass}>
              <RoadmapBanner feature="Integrations, Monetization and Backups" />
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5" /> Bots, Plugins, Webhooks</CardTitle>
                    <CardDescription>Extension ecosystem controls and sandbox requirements.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(config.integrations).map(([key, value]) => (
                      <ToggleRow key={key} label={key.replace(/([A-Z])/g, ' $1')} checked={Boolean(value)} onCheckedChange={checked => markConfig(d => { (d.integrations as Record<string, unknown>)[key] = checked; })} />
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Coins className="h-5 w-5" /> Monetization</CardTitle>
                    <CardDescription>Premium roles, donations, ticketed channels, and supporter tooling.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(config.monetization).map(([key, value]) => (
                      <ToggleRow key={key} label={key.replace(/([A-Z])/g, ' $1')} checked={Boolean(value)} onCheckedChange={checked => markConfig(d => { (d.monetization as Record<string, unknown>)[key] = checked; })} />
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Backups</CardTitle>
                    <CardDescription>Encrypted backup policy for future hybrid deployments.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ToggleRow label="Enabled" checked={config.backups.enabled} onCheckedChange={checked => markConfig(d => { d.backups.enabled = checked; })} />
                    <ToggleRow label="Encrypted" checked={config.backups.encrypted} onCheckedChange={checked => markConfig(d => { d.backups.encrypted = checked; })} />
                    <ToggleRow label="Include audit logs" checked={config.backups.includeAuditLogs} onCheckedChange={checked => markConfig(d => { d.backups.includeAuditLogs = checked; })} />
                    <Field label="Retention days" value={String(config.backups.retentionDays)} onChange={value => markConfig(d => { d.backups.retentionDays = Number(value) || 30; })} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="audit" className={sectionClass}>
              <Card>
                <CardHeader>
                  <CardTitle>Audit Logs</CardTitle>
                  <CardDescription>Signed-style local admin history for settings and management actions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {config.auditLog.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No audit events yet.</p>
                  ) : config.auditLog.map(entry => (
                    <div key={entry.id} className="rounded-lg border border-border p-3 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium">{entry.action}</span>
                        <span className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-muted-foreground">{entry.reason || 'No reason provided'}</p>
                      <p className="text-xs text-muted-foreground">Actor: {entry.actorId} / Target: {entry.target}</p>
                    </div>
                  ))}
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


