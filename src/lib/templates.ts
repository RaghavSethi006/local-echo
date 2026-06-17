import type { CommunityConfig, CommunityRole, CreateCommunityInput } from '@/types/community';
import { ALL_PERMISSIONS } from '@/types/community';

export function createDefaultCommunityConfig(input: CreateCommunityInput, ownerId: string): CommunityConfig {
  const roles: CommunityRole[] = [
    {
      id: 'owner',
      name: 'Owner',
      description: 'Full community control',
      color: '#f59e0b',
      icon: 'crown',
      position: 100,
      permissions: ALL_PERMISSIONS,
      mentionable: false,
      hoisted: true,
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'Manage server settings, roles, and channels',
      color: '#ef4444',
      icon: 'shield',
      position: 80,
      permissions: ALL_PERMISSIONS.filter(p => p !== 'export_data' && p !== 'manage_monetization'),
      mentionable: false,
      hoisted: true,
    },
    {
      id: 'moderator',
      name: 'Moderator',
      description: 'Moderate conversations and keep the community safe',
      color: '#3b82f6',
      icon: 'gavel',
      position: 60,
      permissions: [
        'view_channels',
        'send_messages',
        'manage_messages',
        'kick_members',
        'ban_members',
        'timeout_members',
        'mute_members',
        'manage_moderation',
        'view_audit_log',
        'create_threads',
        'manage_threads',
      ],
      mentionable: true,
      hoisted: true,
    },
    {
      id: 'member',
      name: 'Member',
      description: 'Verified community member',
      color: '#22c55e',
      position: 20,
      permissions: [
        'view_channels',
        'send_messages',
        'stream',
        'create_threads',
        'create_polls',
        'create_invites',
        'use_ai',
      ],
      mentionable: true,
      hoisted: false,
    },
    {
      id: 'newcomer',
      name: 'Newcomer',
      description: 'Limited access until onboarding or trust checks complete',
      color: '#94a3b8',
      position: 10,
      permissions: ['view_channels', 'send_messages'],
      mentionable: false,
      hoisted: false,
      temporary: true,
    },
  ];

  return {
    version: 1,
    branding: {
      description: input.description || 'A community on Local Echo',
      icon: input.icon,
    },
    roles,
    permissionOverwrites: [],
  };
}
