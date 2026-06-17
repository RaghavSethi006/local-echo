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
}

export interface CommunityConfig {
  version: number;
  branding: BrandingSettings;
  roles: CommunityRole[];
  permissionOverwrites: PermissionOverwrite[];
}

export interface CreateCommunityInput {
  name: string;
  icon?: string;
  description?: string;
  visibility: ServerVisibility;
  template: ServerTemplateId;
}

export type CommunityConfigPatch = Partial<{
  branding: Partial<BrandingSettings>;
  roles: CommunityRole[];
  permissionOverwrites: PermissionOverwrite[];
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
