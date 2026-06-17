import { useMemo, useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2, Server, Sparkles } from 'lucide-react';
import {
  getTemplateChannels,
  type CreateCommunityInput,
  type ServerTemplateId,
  type ServerVisibility,
} from '@/types/community';

interface CreateServerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const templateIds: ServerTemplateId[] = ['gaming', 'developer', 'study', 'startup', 'ai-community', 'creator-community', 'enterprise-workspace', 'minimal', 'custom'];
const iconPresets = ['💬', '🚀', '🎮', '📚', '🤖', '🎨', '🏢', '✨'];

export function CreateServerDialog({ open, onOpenChange }: CreateServerDialogProps) {
  const { createServer } = useP2P();
  const [serverName, setServerName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState(iconPresets[0]);
  const [template, setTemplate] = useState<ServerTemplateId>('gaming');
  const [visibility, setVisibility] = useState<ServerVisibility>('private');
  const [isCreating, setIsCreating] = useState(false);

  const previewChannels = useMemo(() => getTemplateChannels(template), [template]);

  const handleCreate = async () => {
    if (!serverName.trim()) {
      toast.error('Please enter a server name');
      return;
    }

    const input: CreateCommunityInput = {
      name: serverName.trim(),
      icon,
      description: description.trim() || undefined,
      visibility,
      template,
    };

    setIsCreating(true);
    try {
      await createServer(input);
      toast.success(`Server "${serverName}" created`);
      setServerName('');
      setDescription('');
      onOpenChange(false);
    } catch {
      toast.error('Failed to create server');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Create a Community
          </DialogTitle>
          <DialogDescription>
            Build a P2P community with templates, branding, onboarding, safety defaults, roles, and automation scaffolding.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-[80px_1fr]">
              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="grid grid-cols-4 gap-1">
                  {iconPresets.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setIcon(preset)}
                      className={`h-9 rounded-lg border text-lg ${icon === preset ? 'border-primary bg-primary/10' : 'border-border bg-secondary'}`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="serverName">Server name</Label>
                <Input
                  id="serverName"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  placeholder="My Awesome Server"
                  maxLength={48}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this community for?"
                rows={3}
                maxLength={280}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Template</Label>
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value as ServerTemplateId)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {templateIds.map(id => (
                    <option key={id} value={id}>{id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Visibility</Label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as ServerVisibility)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="private">Private</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="public">Public</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-secondary/30 p-4">
            <div>
              <p className="text-sm font-medium">Template channels</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {previewChannels.map(channel => (
                <Badge key={channel.id} variant="secondary">
                  {channel.type === 'voice' ? 'voice' : '#'} {channel.name}
                </Badge>
              ))}
            </div>
            <div className="rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Default roles</p>
              <p>Owner, Admin, Moderator, Member, and Newcomer roles are created automatically.</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">P2P note</p>
              <p>This community runs locally through the current host and syncs settings to connected peers.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Community'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
