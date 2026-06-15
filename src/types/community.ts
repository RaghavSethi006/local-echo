import type { Channel } from './p2p';

export type ServerTemplateId =
  | 'gaming'
  | 'developer'
  | 'study'
  | 'startup'
  | 'ai-community'
  | 'creator-community'
  | 'enterprise-workspace'
  | 'minimal'
  | 'custom';

export type ServerVisibility = 'private' | 'unlisted' | 'public';

export type PermissionFlag =
  | 'view_channels'
  | 'send_messages'
  | 'manage_messages'
  | 'manage_channels'
  | 'manage_roles'
  | 'manage_server'
  | 'kick_members'
  | 'ban_members'
  | 'timeout_members'
  | 'mute_members'
  | 'manage_moderation'
  | 'view_audit_log'
  | 'manage_automations'
  | 'manage_bots'
  | 'manage_plugins'
  | 'manage_webhooks'
  | 'use_ai'
  | 'manage_ai'
  | 'stream'
  | 'record_voice'
  | 'create_threads'
  | 'manage_threads'
  | 'create_polls'
  | 'mention_everyone'
  | 'create_invites'
  | 'manage_invites'
  | 'view_analytics'
  | 'manage_monetization'
  | 'export_data';

export interface CommunityRole {
  id: string;
  name: string;
  description: string;
  color: string;
  icon?: string;
  position: number;
  permissions: PermissionFlag[];
  mentionable: boolean;
  hoisted: boolean;
  temporary?: boolean;
  automationManaged?: boolean;
}

export interface PermissionOverwrite {
  id: string;
  targetType: 'role' | 'member';
  targetId: string;
  scopeType: 'server' | 'channel';
  scopeId: string;
  allow: PermissionFlag[];
  deny: PermissionFlag[];
}

export interface BrandingSettings {
  description: string;
  icon?: string;
  bannerUrl?: string;
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
  wallpaperUrl?: string;
  welcomeTitle: string;
  welcomeMessage: string;
  inviteSplash: string;
}

export interface DiscoverySettings {
  visibility: ServerVisibility;
  tags: string[];
  language: string;
  region: string;
  allowDiscovery: boolean;
  vanitySlug?: string;
}

export interface InviteSettings {
  defaultExpiryHours: number;
  maxUses: number;
  allowMemberInvites: boolean;
  requireApproval: boolean;
  trackAnalytics: boolean;
}

export interface OnboardingSettings {
  enabled: boolean;
  template: 'none' | 'rules' | 'questionnaire' | 'verification' | 'guided-tour';
  rules: string[];
  starterPrompt: string;
  assignRoleOnComplete?: string;
}

export interface ModerationSettings {
  verificationLevel: 'none' | 'low' | 'medium' | 'high' | 'strict';
  spamDetection: boolean;
  raidDetection: boolean;
  scamDetection: boolean;
  phishingDetection: boolean;
  nsfwDetection: boolean;
  hateSpeechFilter: boolean;
  toxicityScoring: boolean;
  duplicateMessageDetection: boolean;
  antiMassMention: boolean;
  quarantineNewMembers: boolean;
  trustScoreEnabled: boolean;
  emergencyLockdown: boolean;
  panicMode: boolean;
}

export interface AutoModRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: 'spam' | 'mass-mention' | 'keyword' | 'link' | 'toxicity' | 'raid';
  threshold: number;
  action: 'notify-mods' | 'delete-message' | 'timeout' | 'quarantine' | 'ban';
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  enabled: boolean;
  trigger: 'member-joins' | 'message-created' | 'reaction-added' | 'level-reached' | 'stream-starts';
  condition: string;
  action: 'assign-role' | 'send-message' | 'create-thread' | 'alert-mods' | 'call-webhook' | 'trigger-ai-agent';
  description: string;
}

export interface AnalyticsSettings {
  enabled: boolean;
  retentionDays: number;
  trackMessageActivity: boolean;
  trackVoiceActivity: boolean;
  trackModerationStats: boolean;
  aiInsights: boolean;
}

export interface IntegrationSettings {
  botsEnabled: boolean;
  pluginsEnabled: boolean;
  webhooksEnabled: boolean;
  githubEnabled: boolean;
  pluginSandboxRequired: boolean;
  marketplaceEnabled: boolean;
}

export interface MonetizationSettings {
  enabled: boolean;
  premiumMemberships: boolean;
  paidRoles: boolean;
  donations: boolean;
  ticketedChannels: boolean;
  supporterBadges: boolean;
}

export interface BackupSettings {
  enabled: boolean;
  encrypted: boolean;
  retentionDays: number;
  includeAuditLogs: boolean;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  action: string;
  target: string;
  reason?: string;
  timestamp: number;
}

export interface CommunityConfig {
  version: number;
  template: ServerTemplateId;
  branding: BrandingSettings;
  discovery: DiscoverySettings;
  invites: InviteSettings;
  onboarding: OnboardingSettings;
  roles: CommunityRole[];
  permissionOverwrites: PermissionOverwrite[];
  moderation: ModerationSettings;
  automodRules: AutoModRule[];
  automations: AutomationWorkflow[];
  analytics: AnalyticsSettings;
  integrations: IntegrationSettings;
  monetization: MonetizationSettings;
  backups: BackupSettings;
  auditLog: AuditLogEntry[];
}

export interface CreateCommunityInput {
  name: string;
  icon?: string;
  bannerUrl?: string;
  description?: string;
  tags: string[];
  visibility: ServerVisibility;
  template: ServerTemplateId;
  region: string;
  language: string;
  onboardingTemplate: OnboardingSettings['template'];
  aiSetupEnabled: boolean;
}

export type CommunityConfigPatch = Partial<{
  branding: Partial<BrandingSettings>;
  discovery: Partial<DiscoverySettings>;
  invites: Partial<InviteSettings>;
  onboarding: Partial<OnboardingSettings>;
  roles: CommunityRole[];
  permissionOverwrites: PermissionOverwrite[];
  moderation: Partial<ModerationSettings>;
  automodRules: AutoModRule[];
  automations: AutomationWorkflow[];
  analytics: Partial<AnalyticsSettings>;
  integrations: Partial<IntegrationSettings>;
  monetization: Partial<MonetizationSettings>;
  backups: Partial<BackupSettings>;
  auditLogEntry: AuditLogEntry;
}>;

export const ALL_PERMISSIONS: PermissionFlag[] = [
  'view_channels',
  'send_messages',
  'manage_messages',
  'manage_channels',
  'manage_roles',
  'manage_server',
  'kick_members',
  'ban_members',
  'timeout_members',
  'mute_members',
  'manage_moderation',
  'view_audit_log',
  'manage_automations',
  'manage_bots',
  'manage_plugins',
  'manage_webhooks',
  'use_ai',
  'manage_ai',
  'stream',
  'record_voice',
  'create_threads',
  'manage_threads',
  'create_polls',
  'mention_everyone',
  'create_invites',
  'manage_invites',
  'view_analytics',
  'manage_monetization',
  'export_data',
];

export const TEMPLATE_LABELS: Record<ServerTemplateId, string> = {
  gaming: 'Gaming',
  developer: 'Developer',
  study: 'Study',
  startup: 'Startup',
  'ai-community': 'AI Community',
  'creator-community': 'Creator Community',
  'enterprise-workspace': 'Enterprise Workspace',
  minimal: 'Minimal',
  custom: 'Custom',
};

const channelTemplates: Record<ServerTemplateId, Channel[]> = {
  gaming: [
    { id: 'announcements', name: 'announcements', type: 'text', description: 'News, drops, and events' },
    { id: 'general', name: 'general', type: 'text', description: 'Squad chat' },
    { id: 'lfg', name: 'lfg', type: 'text', description: 'Find teammates' },
    { id: 'clips', name: 'clips', type: 'text', description: 'Share highlights' },
  ],
  developer: [
    { id: 'announcements', name: 'announcements', type: 'text', description: 'Project updates' },
    { id: 'general', name: 'general', type: 'text', description: 'Team discussion' },
    { id: 'help', name: 'help', type: 'text', description: 'Ask for help' },
    { id: 'code-review', name: 'code-review', type: 'text', description: 'Review snippets and PRs' },
    { id: 'releases', name: 'releases', type: 'text', description: 'Release notes' },
  ],
  study: [
    { id: 'announcements', name: 'announcements', type: 'text', description: 'Class updates' },
    { id: 'general', name: 'general', type: 'text', description: 'Study group chat' },
    { id: 'resources', name: 'resources', type: 'text', description: 'Notes and links' },
    { id: 'homework-help', name: 'homework-help', type: 'text', description: 'Questions and support' },
  ],
  startup: [
    { id: 'general', name: 'general', type: 'text', description: 'Company-wide chat' },
    { id: 'product', name: 'product', type: 'text', description: 'Product decisions' },
    { id: 'engineering', name: 'engineering', type: 'text', description: 'Engineering work' },
    { id: 'design', name: 'design', type: 'text', description: 'Design reviews' },
    { id: 'standups', name: 'standups', type: 'text', description: 'Daily updates' },
  ],
  'ai-community': [
    { id: 'announcements', name: 'announcements', type: 'text', description: 'Community updates' },
    { id: 'prompts', name: 'prompts', type: 'text', description: 'Prompt sharing' },
    { id: 'research', name: 'research', type: 'text', description: 'Papers and experiments' },
    { id: 'agents', name: 'agents', type: 'text', description: 'Agent workflows' },
    { id: 'model-news', name: 'model-news', type: 'text', description: 'AI news' },
  ],
  'creator-community': [
    { id: 'announcements', name: 'announcements', type: 'text', description: 'Creator posts' },
    { id: 'community', name: 'community', type: 'text', description: 'Fan chat' },
    { id: 'behind-the-scenes', name: 'behind-the-scenes', type: 'text', description: 'Updates and previews' },
    { id: 'requests', name: 'requests', type: 'text', description: 'Requests and feedback' },
    { id: 'supporter-lounge', name: 'supporter-lounge', type: 'text', description: 'Premium supporters' },
  ],
  'enterprise-workspace': [
    { id: 'announcements', name: 'announcements', type: 'text', description: 'Company announcements' },
    { id: 'team-general', name: 'team-general', type: 'text', description: 'Workspace discussion' },
    { id: 'incidents', name: 'incidents', type: 'text', description: 'Incident coordination' },
    { id: 'exec', name: 'exec', type: 'text', description: 'Leadership space' },
  ],
  minimal: [
    { id: 'general', name: 'general', type: 'text', description: 'General chat' },
  ],
  custom: [
    { id: 'general', name: 'general', type: 'text', description: 'General chat' },
    { id: 'random', name: 'random', type: 'text', description: 'Off-topic discussions' },
  ],
};

export function getTemplateChannels(template: ServerTemplateId): Channel[] {
  return channelTemplates[template].map(channel => ({ ...channel }));
}

export { createDefaultCommunityConfig } from '@/lib/templates';
