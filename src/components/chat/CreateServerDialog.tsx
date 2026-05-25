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
  TEMPLATE_LABELS,
  type CreateCommunityInput,
  type ServerTemplateId,
  type ServerVisibility,
} from '@/types/community';

interface CreateServerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const templateIds = Object.keys(TEMPLATE_LABELS) as ServerTemplateId[];
const iconPresets = ['💬', '🚀', '🎮', '📚', '🤖', '🎨', '🏢', '✨'];

export function CreateServerDialog({ open, onOpenChange }: CreateServerDialogProps) {
  const { createServer } = useP2P();
  const [serverName, setServerName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [icon, setIcon] = useState(iconPresets[0]);
  const [bannerUrl, setBannerUrl] = useState('');
  const [template, setTemplate] = useState<ServerTemplateId>('gaming');
  const [visibility, setVisibility] = useState<ServerVisibility>('private');
  const [region, setRegion] = useState('auto');
  const [language, setLanguage] = useState('en');
  const [onboardingTemplate, setOnboardingTemplate] = useState<CreateCommunityInput['onboardingTemplate']>('rules');
  const [aiSetupEnabled, setAiSetupEnabled] = useState(true);
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
      bannerUrl: bannerUrl.trim() || undefined,
      description: description.trim() || undefined,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean).slice(0, 8),
      visibility,
      template,
      region,
      language,
      onboardingTemplate,
      aiSetupEnabled,
    };

    setIsCreating(true);
    try {
      await createServer(input);
      toast.success(`Server "${serverName}" created with ${TEMPLATE_LABELS[template]} systems`);
      setServerName('');
      setDescription('');
      setTags('');
      setBannerUrl('');
      onOpenChange(false);
    } catch (error) {
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
                    <option key={id} value={id}>{TEMPLATE_LABELS[id]}</option>
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
                  <option value="public">Public discovery-ready</option>
                </select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Region</Label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="auto">Auto</option>
                  <option value="na">North America</option>
                  <option value="eu">Europe</option>
                  <option value="me">Middle East</option>
                  <option value="apac">Asia Pacific</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="ar">Arabic</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags/categories</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="gaming, valorant, ranked"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bannerUrl">Banner image URL</Label>
              <Input
                id="bannerUrl"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="Optional banner or animated banner URL"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Onboarding</Label>
                <select
                  value={onboardingTemplate}
                  onChange={(e) => setOnboardingTemplate(e.target.value as CreateCommunityInput['onboardingTemplate'])}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="none">None</option>
                  <option value="rules">Rules acknowledgement</option>
                  <option value="questionnaire">Questionnaire</option>
                  <option value="verification">Verification</option>
                  <option value="guided-tour">Guided tour</option>
                </select>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <Label className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI setup
                  </Label>
                  <p className="text-xs text-muted-foreground">Suggest roles, rules, automod, and workflows.</p>
                </div>
                <Switch checked={aiSetupEnabled} onCheckedChange={setAiSetupEnabled} />
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-secondary/30 p-4">
            <div>
              <p className="text-sm font-medium">Template preview</p>
              <p className="text-xs text-muted-foreground">{TEMPLATE_LABELS[template]} starter structure</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {previewChannels.map(channel => (
                <Badge key={channel.id} variant="secondary">
                  {channel.type === 'voice' ? 'voice' : '#'} {channel.name}
                </Badge>
              ))}
            </div>
            <div className="rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Generated systems</p>
              <p>Owner, Admin, Moderator, Member, and Newcomer roles.</p>
              <p>Spam shield, mass mention guard, suspicious link review.</p>
              <p>Welcome automation, analytics settings, invite policy, and safety defaults.</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">P2P note</p>
              <p>This community still runs locally through the current host and syncs settings to connected peers.</p>
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
