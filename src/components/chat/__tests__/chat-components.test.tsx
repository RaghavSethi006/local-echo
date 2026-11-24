import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UsernameSetup } from '../UsernameSetup';
import { MessageInput } from '../MessageInput';
import { MembersSidebar } from '../MembersSidebar';
import { VoiceChannelView } from '../VoiceChannelView';

const mockContext = vi.hoisted(() => ({
  initialize: vi.fn(),
  restoreSession: vi.fn(),
  hasStoredIdentity: false,
  currentServer: {
    id: 'srv-1',
    name: 'Test Server',
    hostId: 'peer-host',
    createdAt: 1000,
    channels: [
      { id: 'general', name: 'general', type: 'text' as const },
      { id: 'lounge', name: 'lounge', type: 'voice' as const },
    ],
    members: [
      { id: 'peer-host', username: 'Alice' },
      { id: 'peer-2', username: 'Bob' },
    ],
  },
  currentChannel: { id: 'general', name: 'general', type: 'text' as 'text' | 'voice' },
  localPeer: { id: 'peer-host', username: 'Alice' },
  onlinePeers: [
    { id: 'peer-host', username: 'Alice' },
    { id: 'peer-2', username: 'Bob' },
  ],
  connectionStatus: 'host' as const,
  sendMessage: vi.fn(() => Promise.resolve()),
  openDM: vi.fn(),
  isInVoiceChannel: false,
  muted: false,
  activeVoicePeers: [] as { id: string; username: string }[],
  joinVoiceChannel: vi.fn(() => Promise.resolve()),
  leaveVoiceChannel: vi.fn(() => Promise.resolve()),
  toggleMute: vi.fn(() => true),
}));

vi.mock('@/contexts/P2PContext', () => ({
  useP2P: () => mockContext,
}));

describe('Chat components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockContext.hasStoredIdentity = false;
    mockContext.isInVoiceChannel = false;
    mockContext.muted = false;
    mockContext.activeVoicePeers = [];
  });

  describe('UsernameSetup', () => {
    it('submits trimmed username to initialize', async () => {
      render(<UsernameSetup />);
      const input = screen.getByLabelText(/choose your username/i);
      fireEvent.change(input, { target: { value: '  Raghav  ' } });
      fireEvent.submit(input.closest('form')!);

      await waitFor(() => {
        expect(mockContext.initialize).toHaveBeenCalledWith('Raghav');
      });
    });

    it('renders Resume Previous Session button when stored identity exists', async () => {
      mockContext.hasStoredIdentity = true;
      render(<UsernameSetup />);
      const resumeBtn = screen.getByRole('button', { name: /resume previous session/i });
      fireEvent.click(resumeBtn);
      await waitFor(() => {
        expect(mockContext.restoreSession).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('MessageInput', () => {
    it('awaits sendMessage with trimmed text and clears input', async () => {
      render(<MessageInput />);
      const textarea = screen.getByPlaceholderText('Message #general');
      fireEvent.change(textarea, { target: { value: '  Hello peers!  ' } });
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

      await waitFor(() => {
        expect(mockContext.sendMessage).toHaveBeenCalledWith('Hello peers!');
      });
      expect(textarea).toHaveValue('');
    });
  });

  describe('MembersSidebar', () => {
    it('opens DM when clicking another member and does not render button for local peer', () => {
      render(<MembersSidebar />);
      expect(screen.getByText('Alice (you)')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /message alice/i })).not.toBeInTheDocument();

      const bobButton = screen.getByRole('button', { name: /message bob/i });
      fireEvent.click(bobButton);
      expect(mockContext.openDM).toHaveBeenCalledWith({
        id: 'peer-2',
        username: 'Bob',
        publicKey: undefined,
      });
    });
  });

  describe('VoiceChannelView', () => {
    it('renders active voice peers and accessible mute toggle', () => {
      mockContext.currentChannel = { id: 'lounge', name: 'lounge', type: 'voice' as const };
      mockContext.isInVoiceChannel = true;
      mockContext.activeVoicePeers = [
        { id: 'peer-host', username: 'Alice' },
        { id: 'peer-2', username: 'Bob' },
      ];

      render(<VoiceChannelView />);
      expect(screen.getByText('Alice (you)')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();

      const muteBtn = screen.getByRole('button', { name: /mute microphone/i });
      expect(muteBtn).toHaveAttribute('aria-pressed', 'false');
      fireEvent.click(muteBtn);
      expect(mockContext.toggleMute).toHaveBeenCalledTimes(1);
    });
  });
});
