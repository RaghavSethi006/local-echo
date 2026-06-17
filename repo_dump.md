# Repository Dump

**Root Directory:** `C:\Users\ragha\OneDrive\Documents\Raghav Personal\myProjects\local-echo`

---

## Directory Structure

```text
local-echo/
├── docs/
│   └── verification-checklist.md
├── public/
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChannelSidebar.tsx
│   │   │   ├── ChatLayout.tsx
│   │   │   ├── CreateServerDialog.tsx
│   │   │   ├── DMConversation.tsx
│   │   │   ├── DMList.tsx
│   │   │   ├── InviteQRDialog.tsx
│   │   │   ├── JoinServerDialog.tsx
│   │   │   ├── MembersSidebar.tsx
│   │   │   ├── MessageArea.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   ├── MessageItem.tsx
│   │   │   ├── NewDMDialog.tsx
│   │   │   ├── ScanQRDialog.tsx
│   │   │   ├── SearchDialog.tsx
│   │   │   ├── ServerSettingsDialog.tsx
│   │   │   ├── ServerSidebar.tsx
│   │   │   ├── SettingsDialog.tsx
│   │   │   ├── SettingsHelper.tsx
│   │   │   ├── UsernameSetup.tsx
│   │   │   └── VoiceChannelView.tsx
│   │   ├── ui/
│   │   │   ├── accordion.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── aspect-ratio.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── carousel.tsx
│   │   │   ├── chart.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── command.tsx
│   │   │   ├── context-menu.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── hover-card.tsx
│   │   │   ├── input-otp.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── menubar.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── resizable.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toggle-group.tsx
│   │   │   ├── toggle.tsx
│   │   │   └── tooltip.tsx
│   │   └── NavLink.tsx
│   ├── contexts/
│   │   └── P2PContext.tsx
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-notifications.ts
│   ├── lib/
│   │   ├── __tests__/
│   │   │   ├── crypto.test.ts
│   │   │   ├── p2p-network.test.ts
│   │   │   └── storage.test.ts
│   │   ├── crypto.ts
│   │   ├── logger.ts
│   │   ├── p2p-network.ts
│   │   ├── storage.ts
│   │   ├── templates.ts
│   │   ├── utils.ts
│   │   └── yjs-manager.ts
│   ├── pages/
│   │   ├── Index.tsx
│   │   └── NotFound.tsx
│   ├── test/
│   │   └── setup.ts
│   ├── types/
│   │   ├── community.ts
│   │   └── p2p.ts
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── .gitignore
├── bun.lock
├── components.json
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── README.md
├── repo_dump.md
├── repo_scanner.py
├── tailwind.config.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── vitest.config.ts
```

## File Contents (106 files)

---

### File: `docs\verification-checklist.md`

```md
# Manual Verification Checklist

Run through this checklist with two browser windows (different usernames) to confirm the rt/bulk DataChannel separation works correctly.

## Setup

1. Open **Window A** (incognito/guest profile A) at `http://localhost:5173`
2. Open **Window B** (incognito/guest profile B) at `http://localhost:5173`
3. Open DevTools on both windows → **Application** → **Storage** → **IndexedDB** → clear `p2p-chat-store` if dirty
4. Open `chrome://webrtc-internals` (or Edge equivalent `edge://webrtc-internals`) on **both** windows — this shows all RTCPeerConnections and DataChannels

## 1. Basic connection

- [ ] **Window A**: Enter username "Alice", click Start
- [ ] **Window A**: Create a server → copy invite code
- [ ] **Window B**: Enter username "Bob", click Start
- [ ] **Window B**: Join server with invite code from A

## 2. Verify two DataChannels per peer

In `chrome://webrtc-internals` on either window:

- [ ] Locate the `RTCPeerConnection` between the two peers
- [ ] Confirm **two** `RTCDataChannel` instances exist (look under "Data Channels" section)
- [ ] One channel is the `rt` channel (created first — no special metadata label)
- [ ] One channel is the `bulk` channel (created second — sent with `channelType: 'bulk'` in metadata)
- [ ] Both channels show `state: "open"`

## 3. Real-time messages over RT channel

- [ ] **Window A**: Send a chat message "hello world"
- [ ] **Window B**: Confirm message appears
- [ ] In `webrtc-internals`, find the **rt** DataChannel and verify `messagesReceived` / `messagesSent` counters incremented for `message` type events
- [ ] Verify the **bulk** DataChannel counters did **not** increment for this message

## 4. Sync traffic over bulk channel

- [ ] **Window B**: Disconnect from network (refresh the page)
- [ ] **Window A**: Send 3 more messages
- [ ] **Window B**: Rejoin using the invite code
- [ ] In `webrtc-internals`, during reconnection:
  - [ ] `sync-response`, `config-sync`, and/or `history-merge` events appear in the **bulk** channel's `messagesReceived`
  - [ ] The **rt** channel shows only `sync-request`, `history-offer`, `peer-list`, and new chat messages
- [ ] Verify all 3 missed messages appear in Window B's chat

## 5. Heartbeat isolation

- [ ] In `webrtc-internals`, observe the **rt** channel receives periodic `ping`/`pong` events (~every 15 seconds)
- [ ] Verify the **bulk** channel does **not** show ping/pong activity
- [ ] Keep both windows open for 60 seconds — neither should disconnect (no stale peer timeouts)

## 6. Chunked payloads on bulk channel

- [ ] **Window A**: Generate enough messages to exceed 12KB — either:
  - Send many small messages, or
  - Temporarily lower `CHUNK_SIZE` in `p2p-network.ts` to `1000` to trigger chunking more easily
- [ ] **Window B**: Reconnect (refresh + rejoin)
- [ ] In `webrtc-internals`, observe chunk frames (`_chunkId`, `_index`, `_total`) arriving on the **bulk** channel
- [ ] Verify no chunk frames appear on the **rt** channel
- [ ] Verify all messages arrive and reassemble correctly in Window B

## 7. DM over RT

- [ ] **Window B**: Open a DM to Alice
- [ ] **Window B**: Send "hey Alice" in the DM
- [ ] **Window A**: Confirm DM message appears
- [ ] In `webrtc-internals`, verify `dm-message` events flow over the **rt** channel only

## 8. Bulk channel failure tolerance

> This test validates the fallback to RT-only when bulk fails.

- [ ] Modify `joinServer` in `p2p-network.ts` to **not** create the bulk connection (comment out the bulkConn block)
- [ ] Restart both windows, reconnect
- [ ] Verify the app still works correctly — messages, sync, history all function over the single RT channel
- [ ] Restore the bulk connection code after this test

## 9. Host migration

- [ ] With both peers connected, **Window A** (host) closes their browser
- [ ] **Window B** should detect host disconnection and initiate host migration
- [ ] Verify the `bulkConnections` map is empty on the new host (Window B)
- [ ] **Window A** reopens, rejoins the server
- [ ] Verify dual DataChannels are re-established

## 10. Cleanup

- [ ] Close both windows
- [ ] Verify no console errors related to channel cleanup in either session
```

---

### File: `public\robots.txt`

```txt
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: *
Allow: /
```

---

### File: `src\components\chat\ChannelSidebar.tsx`

```tsx
import { useState, lazy, Suspense, useCallback } from 'react';
import { useP2P } from '@/contexts/P2PContext';
import { cn } from '@/lib/utils';
import { Hash, Volume2, ChevronDown, Settings, UserPlus, Search, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';

const ServerSettingsDialog = lazy(() => import('./ServerSettingsDialog').then(m => ({ default: m.ServerSettingsDialog })));
const SearchDialog = lazy(() => import('./SearchDialog').then(m => ({ default: m.SearchDialog })));
const InviteQRDialog = lazy(() => import('./InviteQRDialog').then(m => ({ default: m.InviteQRDialog })));
const SettingsDialog = lazy(() => import('./SettingsDialog').then(m => ({ default: m.SettingsDialog })));
const ScanQRDialog = lazy(() => import('./ScanQRDialog').then(m => ({ default: m.ScanQRDialog })));

export function ChannelSidebar() {
  const { currentServer, currentChannel, selectChannel, isCurrentServerHost, localPeer, joinServer, startDMByPeerId } = useP2P();
  const [textChannelsOpen, setTextChannelsOpen] = useState(true);
  const [voiceChannelsOpen, setVoiceChannelsOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);

  const handleScanResult = useCallback(async (result: string) => {
    if (result.startsWith('local-echo-profile://')) {
      const rest = result.slice('local-echo-profile://'.length);
      const atIdx = rest.lastIndexOf('@');
      if (atIdx >= 0) {
        const peerId = rest.slice(0, atIdx);
        const username = rest.slice(atIdx + 1);
        if (peerId) {
          await startDMByPeerId(peerId, username);
          toast.success(`Started DM with ${username || peerId.slice(0, 8)}`);
        }
      }
    } else {
      try {
        await joinServer(result);
        toast.success('Joined server successfully!');
      } catch {
        toast.error('Failed to join server from QR code');
      }
    }
  }, [joinServer, startDMByPeerId]);

  if (!currentServer) {
    return (
      <aside className="w-60 max-w-[75vw] bg-card flex flex-col border-r border-border">
        <div className="p-4 flex items-center justify-center h-full">
          <p className="text-muted-foreground text-sm text-center">
            Select or create a server to get started
          </p>
        </div>
      </aside>
    );
  }

  const textChannels = currentServer.channels.filter(c => c.type === 'text');
  const voiceChannels = currentServer.channels.filter(c => c.type === 'voice');

  const handleInvite = () => {
    setInviteOpen(true);
  };

  return (
    <aside className="w-60 max-w-[75vw] bg-card flex flex-col border-r border-border">
      {/* Server Header */}
      <div className="h-12 px-3 flex items-center justify-between gap-2 border-b border-border shadow-sm">
        <div className="flex items-center gap-2 min-w-0">
          {currentServer.icon && (
            <span className="text-base leading-none">{currentServer.icon}</span>
          )}
          <h2 className="font-semibold text-foreground truncate text-sm">{currentServer.name}</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSearchOpen(true)}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Search messages"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Server settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Invite Button */}
      <div className="px-2 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleInvite}
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-channel-hover"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite People</span>
        </Button>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4">
        {/* Text Channels */}
        <Collapsible open={textChannelsOpen} onOpenChange={setTextChannelsOpen}>
          <CollapsibleTrigger className="flex items-center gap-1 w-full px-1 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors">
            <ChevronDown className={cn(
              "w-3 h-3 transition-transform",
              !textChannelsOpen && "-rotate-90"
            )} />
            Text Channels
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-0.5 mt-1">
            {textChannels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => selectChannel(channel.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-md",
                  "text-muted-foreground transition-colors",
                  currentChannel?.id === channel.id
                    ? "bg-channel-hover text-foreground"
                    : "hover:bg-channel-hover hover:text-secondary-foreground"
                )}
              >
                <Hash className="w-4 h-4 flex-shrink-0" />
                <span className="truncate text-sm">{channel.name}</span>
              </button>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Voice Channels */}
        {voiceChannels.length > 0 && (
          <Collapsible open={voiceChannelsOpen} onOpenChange={setVoiceChannelsOpen}>
            <CollapsibleTrigger className="flex items-center gap-1 w-full px-1 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors">
              <ChevronDown className={cn(
                "w-3 h-3 transition-transform",
                !voiceChannelsOpen && "-rotate-90"
              )} />
              Voice Channels
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-0.5 mt-1">
              {voiceChannels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={(e) => { e.stopPropagation(); selectChannel(channel.id); }}
                  className={cn(
                    "group flex items-center gap-2 px-2 py-1.5 rounded-md w-full text-left",
                    "hover:bg-sidebar-accent/50 transition-colors",
                    currentChannel?.id === channel.id && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                  title={`Join ${channel.name}`}
                >
                  <Volume2 className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate text-sm">{channel.name}</span>
                </button>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>

      {/* User Panel */}
      <div className="h-14 px-2 flex items-center gap-2 bg-sidebar border-t border-border">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">
            {localPeer?.username?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-status-online border-2 border-sidebar" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {localPeer?.username || 'Anonymous'}
          </p>
          <p className="text-xs text-muted-foreground">
            {isCurrentServerHost ? 'Hosting' : 'Online'}
          </p>
        </div>
        <button onClick={() => setScanOpen(true)} className="p-1 text-muted-foreground hover:text-foreground transition-colors" aria-label="Scan QR code">
          <ScanLine className="w-4 h-4" />
        </button>
        <button onClick={() => setProfileOpen(true)} className="p-1 text-muted-foreground hover:text-foreground transition-colors" aria-label="Profile settings">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <Suspense fallback={null}>
        <ServerSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
        <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
        <InviteQRDialog open={inviteOpen} onOpenChange={setInviteOpen} />
        <SettingsDialog open={profileOpen} onOpenChange={setProfileOpen} />
        <ScanQRDialog open={scanOpen} onOpenChange={setScanOpen} onResult={handleScanResult} />
      </Suspense>
    </aside>
  );
}
```

---

### File: `src\components\chat\ChatLayout.tsx`

```tsx
import { useState, useEffect } from 'react';
import { ServerSidebar } from './ServerSidebar';
import { ChannelSidebar } from './ChannelSidebar';
import { MessageArea } from './MessageArea';
import { MembersSidebar } from './MembersSidebar';
import { DMList } from './DMList';
import { DMConversation } from './DMConversation';
import { useP2P } from '@/contexts/P2PContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNotificationPermission } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils';
import { Menu, Users, X } from 'lucide-react';

export function ChatLayout() {
  const { currentServer, viewMode, currentChannel, currentDMPeer } = useP2P();
  const isMobile = useIsMobile();
  const [navOpen, setNavOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  useNotificationPermission();

  // Auto-close drawers when a channel/DM is selected (mobile)
  useEffect(() => {
    if (isMobile) setNavOpen(false);
  }, [currentChannel?.id, currentDMPeer?.id, viewMode, isMobile]);

  // Close members panel when switching context
  useEffect(() => {
    setMembersOpen(false);
  }, [currentServer?.id, viewMode]);

  if (!isMobile) {
    return (
      <div className="h-screen flex overflow-hidden bg-background">
        <ServerSidebar />
        {viewMode === 'dms' ? (
          <>
            <DMList />
            <DMConversation />
          </>
        ) : (
          <>
            <ChannelSidebar />
            <MessageArea />
            {currentServer && <MembersSidebar />}
          </>
        )}
      </div>
    );
  }

  // Mobile layout: drawer pattern
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background relative">
      {/* Top bar */}
      <div className="h-12 flex items-center justify-between px-3 border-b border-border bg-card shrink-0 z-30">
        <button
          onClick={() => setNavOpen(true)}
          className="p-2 -ml-2 text-foreground hover:bg-channel-hover rounded-md"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="text-sm font-semibold text-foreground truncate">
          {viewMode === 'dms'
            ? currentDMPeer?.username || 'Direct Messages'
            : currentChannel
            ? `#${currentChannel.name}`
            : currentServer?.name || 'Local Echo'}
        </div>
        {viewMode === 'servers' && currentServer ? (
          <button
            onClick={() => setMembersOpen(true)}
            className="p-2 -mr-2 text-foreground hover:bg-channel-hover rounded-md"
            aria-label="Show members"
          >
            <Users className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-9" />
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-0 flex">
        {viewMode === 'dms' ? (
          <DMConversation />
        ) : (
          <MessageArea />
        )}
      </div>

      {/* Backdrop */}
      {(navOpen || membersOpen) && (
        <div
          className="absolute inset-0 bg-background/70 backdrop-blur-sm z-40"
          onClick={() => {
            setNavOpen(false);
            setMembersOpen(false);
          }}
        />
      )}

      {/* Left drawer: server + channel/DM list */}
      <div
        className={cn(
          'absolute inset-y-0 left-0 z-50 flex transition-transform duration-200',
          navOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <ServerSidebar />
        {viewMode === 'dms' ? <DMList /> : <ChannelSidebar />}
        <button
          onClick={() => setNavOpen(false)}
          className="absolute top-2 -right-10 p-2 bg-card border border-border rounded-md text-foreground hover:bg-channel-hover"
          aria-label="Close navigation"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Right drawer: members */}
      {viewMode === 'servers' && currentServer && (
        <div
          className={cn(
            'absolute inset-y-0 right-0 z-50 transition-transform duration-200',
            membersOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <MembersSidebar />
        </div>
      )}
    </div>
  );
}
```

---

### File: `src\components\chat\CreateServerDialog.tsx`

```tsx
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
```

---

### File: `src\components\chat\DMConversation.tsx`

```tsx
import { useRef, useEffect, useState } from 'react';
import { useP2P } from '@/contexts/P2PContext';
import { cn } from '@/lib/utils';
import { MessageCircle, Wifi, Radio, Lock, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

export function DMConversation() {
  const { currentDMPeer, dmMessages, localPeer, sendDM, sendDMTyping, markDMAsRead, dmConversations } = useP2P();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentConversation = dmConversations.find(c => c.peerId.id === currentDMPeer?.id);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [dmMessages]);

  // Mark as read when viewing
  useEffect(() => {
    if (currentDMPeer) {
      markDMAsRead();
    }
  }, [currentDMPeer, markDMAsRead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await sendDM(content.trim());
      setContent('');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to send DM');
    } finally {
      sendDMTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    
    // Send typing indicator
    sendDMTyping(true);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing indicator after 2 seconds of no input
    typingTimeoutRef.current = setTimeout(() => {
      sendDMTyping(false);
    }, 2000);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + 'px';
    }
  }, [content]);

  // Generate consistent color based on username
  const getAvatarColor = (username: string) => {
    const colors = [
      'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
      'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
      'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
      'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500',
    ];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const getConnectionInfo = () => {
    const type = currentConversation?.connectionType || 'disconnected';
    switch (type) {
      case 'direct':
        return { icon: Wifi, label: 'Direct P2P', color: 'text-success' };
      case 'relay':
        return { icon: Radio, label: 'Relayed', color: 'text-warning' };
      default:
        return { icon: Lock, label: 'Encrypted', color: 'text-muted-foreground' };
    }
  };

  const connInfo = getConnectionInfo();

  if (!currentDMPeer) {
    return (
      <main className="flex-1 flex flex-col bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 animate-in">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-secondary flex items-center justify-center">
              <MessageCircle className="w-10 h-10 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Select a conversation</h2>
              <p className="text-muted-foreground mt-1">
                Choose a conversation or start a new one
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col bg-background min-w-0">
      {/* Header — desktop only */}
      <header className="hidden md:flex h-12 px-4 items-center justify-between border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              "text-xs font-semibold text-white",
              getAvatarColor(currentDMPeer.username)
            )}>
              {currentDMPeer.username.charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <span className="font-semibold text-foreground">{currentDMPeer.username}</span>
            {currentConversation?.isTyping && (
              <span className="ml-2 text-sm text-primary italic">typing...</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary/50", connInfo.color)}>
                <connInfo.icon className="w-3.5 h-3.5" />
                <span className="text-xs">{connInfo.label}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {connInfo.label === 'Direct P2P' 
                ? 'Connected directly - no relay' 
                : connInfo.label === 'Relayed'
                ? 'Routed through server host (still encrypted)'
                : 'End-to-end encrypted'}
            </TooltipContent>
          </Tooltip>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="py-4">
          {/* Start of conversation */}
          <div className="px-4 mb-6">
            <div className="flex flex-col items-center py-8">
              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center mb-4",
                "text-2xl font-bold text-white",
                getAvatarColor(currentDMPeer.username)
              )}>
                {currentDMPeer.username.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-xl font-bold text-foreground">{currentDMPeer.username}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                This is the beginning of your direct message history with <strong>{currentDMPeer.username}</strong>.
              </p>
              <div className="flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full bg-secondary/50">
                <Lock className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-muted-foreground">Messages are end-to-end encrypted</span>
              </div>
            </div>
          </div>

          {/* Message List */}
          <div className="space-y-0.5">
            {dmMessages.map((message, index) => {
              const isFromMe = message.from.id === localPeer?.id;
              const showAvatar = index === 0 || dmMessages[index - 1]?.from.id !== message.from.id;
              
              return (
                <div
                  key={message.id}
                  className={cn(
                    "group px-4 hover:bg-message-hover transition-colors",
                    showAvatar ? "py-2" : "py-0.5"
                  )}
                >
                  <div className="flex items-start gap-4">
                    {showAvatar ? (
                      <div className={cn(
                        "w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center",
                        "text-sm font-semibold text-white",
                        getAvatarColor(message.from.username)
                      )}>
                        {message.from.username.charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      <div className="w-10 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(message.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {showAvatar && (
                        <div className="flex items-baseline gap-2">
                          <span className={cn(
                            "font-medium hover:underline cursor-pointer",
                            isFromMe ? "text-primary" : "text-foreground"
                          )}>
                            {isFromMe ? 'You' : message.from.username}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                      )}
                      <p className="text-foreground text-sm leading-relaxed break-words mt-0.5">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="px-3 sm:px-4 pb-4 pt-2">
        <div className="relative flex items-end bg-secondary rounded-lg">
          <textarea
            ref={inputRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message @${currentDMPeer.username}`}
            rows={1}
            className={cn(
              "flex-1 bg-transparent py-3 px-4 text-foreground placeholder:text-muted-foreground",
              "resize-none focus:outline-none text-sm leading-relaxed",
              "min-h-[44px] max-h-[200px]"
            )}
          />

          <button
            type="submit"
            disabled={!content.trim()}
            className="p-3 text-primary hover:text-primary/80 disabled:text-muted-foreground/40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        {/* Connection badge on mobile */}
        <div className="md:hidden flex items-center justify-center mt-2">
          <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary/50", connInfo.color)}>
            <connInfo.icon className="w-3 h-3" />
            <span className="text-[10px]">{connInfo.label}</span>
          </div>
        </div>
      </form>
    </main>
  );
}
```

---

### File: `src\components\chat\DMList.tsx`

```tsx
import { useState, lazy, Suspense } from 'react';
import { useP2P } from '@/contexts/P2PContext';
import { cn } from '@/lib/utils';
import { Plus, Search, Settings, MessageCircle, Wifi, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NewDMDialog = lazy(() => import('./NewDMDialog').then(m => ({ default: m.NewDMDialog })));
const SettingsDialog = lazy(() => import('./SettingsDialog').then(m => ({ default: m.SettingsDialog })));

export function DMList() {
  const { dmConversations, currentDMPeer, openDM, localPeer, onlinePeers } = useP2P();
  const [showNewDMDialog, setShowNewDMDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = dmConversations.filter(conv =>
    conv.peerId.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isOnline = (peerId: string) => onlinePeers.some(p => p.id === peerId);

  const getConnectionIcon = (type: 'direct' | 'relay' | 'disconnected') => {
    switch (type) {
      case 'direct': return <Wifi className="w-3 h-3 text-success" />;
      case 'relay': return <Radio className="w-3 h-3 text-warning" />;
      default: return null;
    }
  };

  // Generate consistent color based on username
  const getAvatarColor = (username: string) => {
    const colors = [
      'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
      'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
      'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
      'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500',
    ];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <aside className="w-60 max-w-[75vw] bg-card flex flex-col border-r border-border">
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-border shadow-sm">
        <h2 className="font-semibold text-foreground">Direct Messages</h2>
      </div>

      {/* Search */}
      <div className="px-2 py-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find or start a conversation"
            className="w-full h-8 pl-8 pr-3 rounded-md bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* New DM Button */}
      <div className="px-2 pb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowNewDMDialog(true)}
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-channel-hover"
        >
          <Plus className="w-4 h-4" />
          <span>New Message</span>
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {filteredConversations.length === 0 ? (
          <div className="px-2 py-8 text-center">
            <MessageCircle className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'No conversations found' : 'No messages yet'}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Start a conversation with someone
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <button
              key={conv.peerId.id}
              onClick={() => openDM(conv.peerId)}
              className={cn(
                "w-full flex items-center gap-3 px-2 py-2 rounded-md",
                "transition-colors text-left",
                currentDMPeer?.id === conv.peerId.id
                  ? "bg-channel-hover"
                  : "hover:bg-channel-hover/50"
              )}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  "text-xs font-semibold text-white",
                  getAvatarColor(conv.peerId.username)
                )}>
                  {conv.peerId.username.charAt(0).toUpperCase()}
                </div>
                <div className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card",
                  isOnline(conv.peerId.id) ? "bg-status-online" : "bg-status-offline"
                )} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    "text-sm truncate",
                    conv.unreadCount > 0 ? "font-semibold text-foreground" : "text-secondary-foreground"
                  )}>
                    {conv.peerId.username}
                  </span>
                  {getConnectionIcon(conv.connectionType)}
                </div>
                {conv.lastMessage && (
                  <p className={cn(
                    "text-xs truncate",
                    conv.unreadCount > 0 ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {conv.lastMessage.from.id === localPeer?.id ? 'You: ' : ''}
                    {conv.lastMessage.content}
                  </p>
                )}
                {conv.isTyping && (
                  <p className="text-xs text-primary italic">typing...</p>
                )}
              </div>

              {/* Meta */}
              <div className="flex-shrink-0 flex flex-col items-end gap-1">
                {conv.lastMessage && (
                  <span className="text-[10px] text-muted-foreground">
                    {formatTime(conv.lastMessage.timestamp)}
                  </span>
                )}
                {conv.unreadCount > 0 && (
                  <div className="min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center px-1">
                    {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </div>

      {/* User Panel */}
      <div className="h-14 px-2 flex items-center gap-2 bg-sidebar border-t border-border">
        <div className="relative">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white",
            getAvatarColor(localPeer?.username || '')
          )}>
            {localPeer?.username?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-status-online border-2 border-sidebar" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {localPeer?.username || 'Anonymous'}
          </p>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>
        <button onClick={() => setShowSettings(true)} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <Suspense fallback={null}>
        <NewDMDialog open={showNewDMDialog} onOpenChange={setShowNewDMDialog} />
        <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
      </Suspense>
    </aside>
  );
}
```

---

### File: `src\components\chat\InviteQRDialog.tsx`

```tsx
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { useP2P } from '@/contexts/P2PContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface InviteQRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteQRDialog({ open, onOpenChange }: InviteQRDialogProps) {
  const { generateInvite, currentServer } = useP2P();
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setInviteCode('');
    generateInvite()
      .then(setInviteCode)
      .catch(() => toast.error('Failed to generate invite'))
      .finally(() => setLoading(false));
  }, [open, generateInvite]);

  useEffect(() => {
    if (!inviteCode || loading || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, inviteCode, {
      width: 280,
      margin: 2,
      color: { dark: '#000', light: '#fff' },
    }).catch(() => toast.error('Failed to render QR code'));
  }, [inviteCode, loading]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      toast.success('Invite code copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `invite-${currentServer?.name || 'server'}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Invite People to {currentServer?.name || 'Server'}</DialogTitle>
          <DialogDescription>
            Share the QR code or invite link with others to let them join.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-[280px]">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <canvas
                ref={canvasRef}
                className="rounded-lg border border-border"
              />

              <div className="flex gap-2 w-full">
                <Button onClick={handleCopy} variant="default" className="flex-1 gap-2">
                  <Copy className="w-4 h-4" />
                  Copy Code
                </Button>
                <Button onClick={handleDownload} variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Save QR
                </Button>
              </div>

              <div className="w-full p-2 rounded-md bg-secondary/50 border border-border">
                <p className="text-xs font-mono text-muted-foreground break-all select-all">
                  {inviteCode}
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

### File: `src\components\chat\JoinServerDialog.tsx`

```tsx
import { useState, useRef } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Camera, Link, Loader2, Upload } from 'lucide-react';
import jsQR from 'jsqr';

interface JoinServerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinServerDialog({ open, onOpenChange }: JoinServerDialogProps) {
  const { joinServer, startDMByPeerId } = useP2P();
  const [inviteCode, setInviteCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [activeTab, setActiveTab] = useState('paste');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const handleProfileQR = async (link: string) => {
    const rest = link.slice('local-echo-profile://'.length);
    const atIdx = rest.lastIndexOf('@');
    if (atIdx < 0) return false;
    const peerId = rest.slice(0, atIdx);
    const username = rest.slice(atIdx + 1);
    if (!peerId) return false;
    await startDMByPeerId(peerId, username);
    toast.success(`Started DM with ${username || peerId.slice(0, 8)}`);
    onOpenChange(false);
    return true;
  };

  const handleQrResult = async (result: string) => {
    if (result.startsWith('local-echo-profile://')) {
      await handleProfileQR(result);
    } else {
      setInviteCode(result);
      setActiveTab('paste');
      toast.success('QR code scanned successfully');
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      toast.error('Please enter an invite code');
      return;
    }

    setIsJoining(true);
    try {
      await joinServer(inviteCode.trim());
      toast.success('Joined server successfully!');
      setInviteCode('');
      onOpenChange(false);
    } catch {
      toast.error('Failed to join server. Invalid invite code.');
    } finally {
      setIsJoining(false);
    }
  };

  const decodeFromCanvas = (imageData: ImageData): string | null => {
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    return code?.data || null;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const result = decodeFromCanvas(imageData);
        if (result) {
          handleQrResult(result);
        } else {
          toast.error('Could not decode QR code from image');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setScanning(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        scanFrame();
      }
    } catch {
      toast.error('Camera access denied or unavailable');
    }
  };

  const scanFrame = () => {
    if (!videoRef.current || !streamRef.current) return;
    const video = videoRef.current;
    if (video.readyState < video.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(scanFrame);
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      requestAnimationFrame(scanFrame);
      return;
    }
    ctx.drawImage(video, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const result = decodeFromCanvas(imageData);
    if (result) {
      stopCamera();
      handleQrResult(result);
    } else {
      requestAnimationFrame(scanFrame);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) stopCamera(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            Join a Server
          </DialogTitle>
          <DialogDescription>
            Enter an invite code or scan a QR code to join.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="paste" className="flex-1">Paste Code</TabsTrigger>
            <TabsTrigger value="scan" className="flex-1">Scan QR</TabsTrigger>
          </TabsList>

          <TabsContent value="paste" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Invite Code</Label>
              <Input
                id="inviteCode"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Paste invite code here..."
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                className="font-mono text-sm"
              />
            </div>
          </TabsContent>

          <TabsContent value="scan" className="space-y-4 py-4">
            {scanning ? (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <video ref={videoRef} className="w-full h-64 object-cover" playsInline muted />
                <div className="absolute inset-0 border-2 border-primary/50 rounded-lg pointer-events-none" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={stopCamera}
                  className="absolute top-2 right-2"
                >
                  Stop
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button onClick={startCamera} variant="outline" className="w-full gap-2">
                  <Camera className="w-4 h-4" />
                  Open Camera
                </Button>
                <div className="relative">
                  <Button variant="outline" className="w-full gap-2 relative">
                    <Upload className="w-4 h-4" />
                    Upload QR Image
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Peer-to-Peer Connection</strong> — 
            Joining will establish a direct connection with the server host. 
            All messages are encrypted end-to-end.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleJoin} disabled={isJoining || !inviteCode.trim()}>
            {isJoining ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              'Join Server'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

### File: `src\components\chat\MembersSidebar.tsx`

```tsx
import { useP2P } from '@/contexts/P2PContext';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';

export function MembersSidebar() {
  const { currentServer, onlinePeers, connectionStatus, localPeer } = useP2P();

  if (!currentServer) return null;

  // Get all members with their online status
  const members = currentServer.members.map(member => ({
    ...member,
    isOnline: onlinePeers.some(p => p.id === member.id),
    isHost: member.id === currentServer.hostId,
    isLocal: member.id === localPeer?.id,
  }));

  const onlineMembers = members.filter(m => m.isOnline);
  const offlineMembers = members.filter(m => !m.isOnline);

  // Generate consistent color based on username
  const getAvatarColor = (username: string) => {
    const colors = [
      'bg-red-500',
      'bg-orange-500',
      'bg-amber-500',
      'bg-yellow-500',
      'bg-lime-500',
      'bg-green-500',
      'bg-emerald-500',
      'bg-teal-500',
      'bg-cyan-500',
      'bg-sky-500',
      'bg-blue-500',
      'bg-indigo-500',
      'bg-violet-500',
      'bg-purple-500',
      'bg-fuchsia-500',
      'bg-pink-500',
      'bg-rose-500',
    ];
    
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <aside className="w-60 max-w-[80vw] h-full bg-card border-l border-border overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Online Members */}
        {onlineMembers.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Online — {onlineMembers.length}
            </h3>
            <div className="space-y-1">
              {onlineMembers.map((member) => (
                <div
                  key={member.id}
                  className={cn(
                    "flex items-center gap-3 px-2 py-1.5 rounded-md",
                    "hover:bg-channel-hover transition-colors cursor-pointer"
                  )}
                >
                  <div className="relative">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      "text-xs font-semibold text-white",
                      getAvatarColor(member.username)
                    )}>
                      {member.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-status-online border-2 border-card" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className={cn(
                        "text-sm truncate",
                        member.isLocal ? "text-primary font-medium" : "text-foreground"
                      )}>
                        {member.username}
                        {member.isLocal && " (you)"}
                      </span>
                      {member.isHost && (
                        <Crown className="w-3 h-3 text-warning flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Offline Members */}
        {offlineMembers.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Offline — {offlineMembers.length}
            </h3>
            <div className="space-y-1 opacity-60">
              {offlineMembers.map((member) => (
                <div
                  key={member.id}
                  className={cn(
                    "flex items-center gap-3 px-2 py-1.5 rounded-md",
                    "hover:bg-channel-hover transition-colors cursor-pointer"
                  )}
                >
                  <div className="relative">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      "text-xs font-semibold text-white grayscale",
                      getAvatarColor(member.username)
                    )}>
                      {member.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-status-offline border-2 border-card" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground truncate">
                        {member.username}
                      </span>
                      {member.isHost && (
                        <Crown className="w-3 h-3 text-warning/50 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connection Info */}
        <div className="pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center justify-between">
              <span>Status:</span>
              <span className="capitalize text-foreground">{connectionStatus}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Protocol:</span>
              <span className="text-foreground">WebRTC P2P</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Encryption:</span>
              <span className="text-success">E2E Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
```

---

### File: `src\components\chat\MessageArea.tsx`

```tsx
import { useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useP2P } from '@/contexts/P2PContext';
import { Hash, Users } from 'lucide-react';
import { MessageInput } from './MessageInput';
import { MessageItem } from './MessageItem';
import { VoiceChannelView } from './VoiceChannelView';

export function MessageArea() {
  const { currentServer, currentChannel, messages, onlinePeers, loadOlderMessages } = useP2P();
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const loadingOlderRef = useRef(false);
  const lastTopLoadKeyRef = useRef<string | null>(null);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 76,
    overscan: 10,
    getItemKey: (index) => messages[index]?.id || index,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length === 0 || !stickToBottomRef.current) return;
    virtualizer.scrollToIndex(messages.length - 1, { align: 'end' });
  }, [messages.length, virtualizer]);

  useEffect(() => {
    const firstItem = virtualItems[0];
    const oldestMessageId = messages[0]?.id;
    if (
      !firstItem ||
      firstItem.index > 2 ||
      loadingOlderRef.current ||
      messages.length === 0 ||
      !oldestMessageId ||
      lastTopLoadKeyRef.current === oldestMessageId
    ) {
      return;
    }

    lastTopLoadKeyRef.current = oldestMessageId;
    loadingOlderRef.current = true;
    loadOlderMessages().finally(() => {
      loadingOlderRef.current = false;
    });
  }, [loadOlderMessages, messages.length, virtualItems]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  };

  if (!currentServer || !currentChannel) {
    return (
      <main className="flex-1 flex flex-col bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 animate-in px-6">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-secondary flex items-center justify-center">
              <Hash className="w-10 h-10 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Welcome to Local Echo</h2>
              <p className="text-muted-foreground mt-1">
                Create or join a server to start chatting
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (currentChannel.type === 'voice') {
    return <VoiceChannelView />;
  }

  return (
    <main className="flex-1 flex flex-col bg-background min-w-0">
      {/* Channel Header — only on desktop, mobile uses ChatLayout top bar */}
      <header className="hidden md:flex h-12 px-4 items-center justify-between border-b border-border shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Hash className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <span className="font-semibold text-foreground truncate">{currentChannel.name}</span>
          {currentChannel.description && (
            <>
              <div className="w-px h-5 bg-border mx-2 flex-shrink-0" />
              <span className="text-sm text-muted-foreground truncate">
                {currentChannel.description}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <Users className="w-4 h-4" />
          <span>{onlinePeers.length} online</span>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
        <div className="py-4">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="px-4 mb-6">
              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <Hash className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Welcome to #{currentChannel.name}!
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      This is the start of the channel.
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Messages are transmitted peer-to-peer with end-to-end encryption. 
                  No central message server involved. Your data stays with your peers.
                </p>
              </div>
            </div>
          )}

          {/* Message List */}
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              position: 'relative',
            }}
          >
            {virtualItems.map((virtualItem) => {
              const message = messages[virtualItem.index];
              if (!message) return null;
              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <MessageItem
                    message={message}
                    showAvatar={virtualItem.index === 0 || messages[virtualItem.index - 1]?.author.id !== message.author.id}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Message Input */}
      <MessageInput />
    </main>
  );
}
```

---

### File: `src\components\chat\MessageInput.tsx`

```tsx
import { useState, useRef, useEffect } from 'react';
import { useP2P } from '@/contexts/P2PContext';
import { cn } from '@/lib/utils';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

export function MessageInput() {
  const { currentChannel, sendMessage } = useP2P();
  const [content, setContent] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      sendMessage(content.trim());
      setContent('');
      inputRef.current?.focus();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + 'px';
    }
  }, [content]);

  return (
    <form onSubmit={handleSubmit} className="px-3 sm:px-4 pb-4 pt-2">
      <div className="relative flex items-end bg-secondary rounded-lg">
        {content.length > 1500 && (() => {
          const byteLen = new TextEncoder().encode(content).byteLength;
          return (
            <span className="text-xs text-warning absolute bottom-2 right-16">
              {byteLen}/8192
            </span>
          );
        })()}
        {/* Input */}
        <textarea
          ref={inputRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message #${currentChannel?.name || 'channel'}`}
          rows={1}
          className={cn(
            "flex-1 bg-transparent py-3 px-4 text-foreground placeholder:text-muted-foreground",
            "resize-none focus:outline-none text-sm leading-relaxed",
            "min-h-[44px] max-h-[200px]"
          )}
        />

        <button
          type="submit"
          disabled={!content.trim()}
          className="p-3 text-primary hover:text-primary/80 disabled:text-muted-foreground/40 disabled:cursor-not-allowed transition-colors"
          aria-label="Send"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
```

---

### File: `src\components\chat\MessageItem.tsx`

```tsx
import { memo } from 'react';
import { Message } from '@/types/p2p';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface MessageItemProps {
  message: Message;
  showAvatar?: boolean;
}

export const MessageItem = memo(function MessageItem({ message, showAvatar = true }: MessageItemProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Generate consistent color based on username
  const getAvatarColor = (username: string) => {
    const colors = [
      'bg-red-500',
      'bg-orange-500',
      'bg-amber-500',
      'bg-yellow-500',
      'bg-lime-500',
      'bg-green-500',
      'bg-emerald-500',
      'bg-teal-500',
      'bg-cyan-500',
      'bg-sky-500',
      'bg-blue-500',
      'bg-indigo-500',
      'bg-violet-500',
      'bg-purple-500',
      'bg-fuchsia-500',
      'bg-pink-500',
      'bg-rose-500',
    ];
    
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  if (!showAvatar) {
    return (
      <div className="group px-4 py-0.5 hover:bg-message-hover transition-colors">
        <div className="flex items-start gap-4">
          <div className="w-10 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] text-muted-foreground">
              {new Date(message.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
          <p className="text-foreground text-sm leading-relaxed break-words">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="group px-4 py-2 hover:bg-message-hover transition-colors">
      <div className="flex items-start gap-4">
        <div className={cn(
          "w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center",
          "text-sm font-semibold text-white",
          getAvatarColor(message.author.username)
        )}>
          {message.author.username.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-medium text-foreground hover:underline cursor-pointer">
              {message.author.username}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTime(message.timestamp)}
            </span>
          </div>
          <p className="text-foreground text-sm leading-relaxed break-words mt-0.5">
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
});
```

---

### File: `src\components\chat\NewDMDialog.tsx`

```tsx
import { useState, lazy, Suspense } from 'react';
import { useP2P } from '@/contexts/P2PContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Search, MessageCircle, Users, KeyRound, Send, ScanLine } from 'lucide-react';
import { PeerId } from '@/types/p2p';
import { toast } from 'sonner';

const ScanQRDialog = lazy(() => import('./ScanQRDialog').then(m => ({ default: m.ScanQRDialog })));

interface NewDMDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewDMDialog({ open, onOpenChange }: NewDMDialogProps) {
  const { availablePeersForDM, startNewDM, startDMByPeerId, onlinePeers } = useP2P();
  const [searchQuery, setSearchQuery] = useState('');
  const [peerIdInput, setPeerIdInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [mode, setMode] = useState<'list' | 'peerId'>('list');
  const [scanOpen, setScanOpen] = useState(false);

  const handleScanResult = async (result: string) => {
    if (!result.startsWith('local-echo-profile://')) return;
    const rest = result.slice('local-echo-profile://'.length);
    const atIdx = rest.lastIndexOf('@');
    if (atIdx < 0) return;
    const peerId = rest.slice(0, atIdx);
    const username = rest.slice(atIdx + 1);
    if (!peerId) return;
    try {
      await startDMByPeerId(peerId, username);
      toast.success(`Started DM with ${username || peerId.slice(0, 8)}`);
      onOpenChange(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to start DM');
    }
  };

  const filteredPeers = availablePeersForDM.filter(peer =>
    peer.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isOnline = (peerId: string) => onlinePeers.some(p => p.id === peerId);

  const handleSelectPeer = (peer: PeerId) => {
    startNewDM(peer);
    setSearchQuery('');
    onOpenChange(false);
  };

  const handleStartByPeerId = async () => {
    const id = peerIdInput.trim();
    if (!id) {
      toast.error('Please enter a peer ID');
      return;
    }
    try {
      await startDMByPeerId(id, usernameInput.trim() || undefined);
      setPeerIdInput('');
      setUsernameInput('');
      setMode('list');
      onOpenChange(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to start DM');
    }
  };

  // Generate consistent color based on username
  const getAvatarColor = (username: string) => {
    const colors = [
      'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
      'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
      'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
      'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500',
    ];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            New Direct Message
          </DialogTitle>
          <DialogDescription>
            Pick a peer from your network or DM by Peer ID.
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-secondary/50 rounded-md">
          <button
            onClick={() => setMode('list')}
            className={cn(
              'flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors',
              mode === 'list'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Users className="w-3.5 h-3.5 inline mr-1" /> Known peers
          </button>
          <button
            onClick={() => setMode('peerId')}
            className={cn(
              'flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors',
              mode === 'peerId'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <KeyRound className="w-3.5 h-3.5 inline mr-1" /> By Peer ID
          </button>
          <button
            onClick={() => setScanOpen(true)}
            className={cn(
              'flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors',
              'text-muted-foreground hover:text-foreground'
            )}
          >
            <ScanLine className="w-3.5 h-3.5 inline mr-1" /> Scan QR
          </button>
        </div>

        {mode === 'peerId' ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Peer ID</label>
              <Input
                value={peerIdInput}
                onChange={(e) => setPeerIdInput(e.target.value)}
                placeholder="Paste peer ID..."
                className="font-mono text-xs"
                onKeyDown={(e) => e.key === 'Enter' && handleStartByPeerId()}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Display name (optional)</label>
              <Input
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="What to call them"
                onKeyDown={(e) => e.key === 'Enter' && handleStartByPeerId()}
              />
            </div>
            <Button onClick={handleStartByPeerId} className="w-full">
              <Send className="w-4 h-4 mr-2" /> Start Conversation
            </Button>
            <p className="text-xs text-muted-foreground">
              Your contact can find their Peer ID under Settings. The DM will connect directly when they come online.
            </p>
          </div>
        ) : (
        <>
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username..."
            className="pl-9"
          />
        </div>

        {/* Peers List */}
        <div className="max-h-64 overflow-y-auto space-y-1">
          {filteredPeers.length === 0 ? (
            <div className="py-8 text-center">
              <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No peers found' : 'No peers available'}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Join a server to discover peers, or switch to "By Peer ID"
              </p>
            </div>
          ) : (
            filteredPeers.map((peer) => (
              <button
                key={peer.id}
                onClick={() => handleSelectPeer(peer)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md",
                  "transition-colors text-left",
                  "hover:bg-channel-hover"
                )}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    "text-sm font-semibold text-white",
                    getAvatarColor(peer.username)
                  )}>
                    {peer.username.charAt(0).toUpperCase()}
                  </div>
                  <div className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-popover",
                    isOnline(peer.id) ? "bg-status-online" : "bg-status-offline"
                  )} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {peer.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isOnline(peer.id) ? 'Online' : 'Offline'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
        </>
        )}

        <Suspense fallback={null}>
          <ScanQRDialog open={scanOpen} onOpenChange={setScanOpen} onResult={handleScanResult} title="Scan Profile QR" description="Scan a profile QR code to start a direct message." />
        </Suspense>

        {/* Info */}
        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Direct & Private</strong> — 
            Messages are sent directly peer-to-peer when possible, with end-to-end encryption.
            The server host cannot read your DMs.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

### File: `src\components\chat\ScanQRDialog.tsx`

```tsx
import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Camera, Loader2, Upload, ScanLine } from 'lucide-react';
import jsQR from 'jsqr';

interface ScanQRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResult: (data: string) => void;
  title?: string;
  description?: string;
}

export function ScanQRDialog({ open, onOpenChange, onResult, title, description }: ScanQRDialogProps) {
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef(false);

  const stopCamera = () => {
    scanningRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    if (!open) stopCamera();
  }, [open]);

  const decodeFromCanvas = (imageData: ImageData): string | null => {
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    return code?.data || null;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const result = decodeFromCanvas(imageData);
        if (result) {
          onOpenChange(false);
          onResult(result);
        } else {
          toast.error('Could not decode QR code from image');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setScanning(true);
      scanningRef.current = true;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        scanFrame();
      }
    } catch {
      toast.error('Camera access denied or unavailable');
    }
  };

  const scanFrame = () => {
    if (!scanningRef.current || !videoRef.current || !streamRef.current) return;
    const video = videoRef.current;
    if (video.readyState < video.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(scanFrame);
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      requestAnimationFrame(scanFrame);
      return;
    }
    ctx.drawImage(video, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const result = decodeFromCanvas(imageData);
    if (result) {
      stopCamera();
      onOpenChange(false);
      onResult(result);
    } else {
      requestAnimationFrame(scanFrame);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) stopCamera(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="w-5 h-5" />
            {title || 'Scan QR Code'}
          </DialogTitle>
          <DialogDescription>
            {description || 'Point your camera at a QR code or upload an image.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {scanning ? (
            <div className="relative rounded-lg overflow-hidden border border-border">
              <video ref={videoRef} className="w-full h-64 object-cover" playsInline muted />
              <div className="absolute inset-0 border-2 border-primary/50 rounded-lg pointer-events-none" />
              <Button
                variant="outline"
                size="sm"
                onClick={stopCamera}
                className="absolute top-2 right-2"
              >
                Stop
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Button onClick={startCamera} variant="outline" className="w-full gap-2">
                <Camera className="w-4 h-4" />
                Open Camera
              </Button>
              <div className="relative">
                <Button variant="outline" className="w-full gap-2" disabled>
                  <Upload className="w-4 h-4" />
                  Upload QR Image
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

### File: `src\components\chat\SearchDialog.tsx`

```tsx
import { useMemo, useState } from 'react';
import { useP2P } from '@/contexts/P2PContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Hash, MessageCircle, Search } from 'lucide-react';
import type { Message, DirectMessage } from '@/types/p2p';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SearchHit = {
  id: string;
  kind: 'channel' | 'dm';
  serverId?: string;
  serverName?: string;
  channelId?: string;
  channelName?: string;
  peerId?: string;
  peerName?: string;
  authorName: string;
  content: string;
  timestamp: number;
};

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const { servers, dmConversations, localPeer, selectServer, selectChannel, openDM, getAllMessages } = useP2P();
  const [query, setQuery] = useState('');

  // Channel messages come from P2PNetwork's Yjs-managed cache; DM messages still via P2PEvent
  const allChannelMsgs: Message[] = useMemo(() => getAllMessages(), [getAllMessages, open]);
  const allDMMsgs: DirectMessage[] = useMemo(() => {
    const all: DirectMessage[] = [];
    for (const conv of dmConversations) {
      all.push(...conv.messages);
    }
    return all;
  }, [dmConversations, open]);

  const serverById = useMemo(() => {
    const m = new Map(servers.map(s => [s.id, s]));
    return m;
  }, [servers]);

  const dmByPeer = useMemo(() => {
    const m = new Map(dmConversations.map(c => [c.peerId.id, c]));
    return m;
  }, [dmConversations]);

  const hits = useMemo<SearchHit[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const results: SearchHit[] = [];

    // Channel messages
    for (const m of allChannelMsgs) {
      if (typeof m.content !== 'string') continue;
      if (!m.content.toLowerCase().includes(q)) continue;
      const server = serverById.get(m.serverId);
      const channel = server?.channels.find(c => c.id === m.channelId);
      results.push({
        id: `c-${m.id}`,
        kind: 'channel',
        serverId: m.serverId,
        serverName: server?.name,
        channelId: m.channelId,
        channelName: channel?.name || m.channelId,
        authorName: m.author?.username || 'unknown',
        content: m.content,
        timestamp: m.timestamp,
      });
    }

    // DM messages
    for (const m of allDMMsgs) {
      if (typeof m.content !== 'string') continue;
      if (!m.content.toLowerCase().includes(q)) continue;
      const otherId = m.from?.id === localPeer?.id ? m.to?.id : m.from?.id;
      if (!otherId) continue;
      const conv = dmByPeer.get(otherId);
      results.push({
        id: `d-${m.id}`,
        kind: 'dm',
        peerId: otherId,
        peerName: conv?.peerId.username || (m.from?.id === localPeer?.id ? m.to?.username : m.from?.username) || 'peer',
        authorName: m.from?.username || 'unknown',
        content: m.content,
        timestamp: m.timestamp,
      });
    }

    results.sort((a, b) => b.timestamp - a.timestamp);
    return results.slice(0, 50);
  }, [query, allChannelMsgs, allDMMsgs, serverById, dmByPeer, localPeer]);

  const highlight = (text: string, q: string) => {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx < 0) return text;
    const start = Math.max(0, idx - 30);
    const end = Math.min(text.length, idx + q.length + 60);
    const prefix = start > 0 ? '…' : '';
    const suffix = end < text.length ? '…' : '';
    const slice = text.slice(start, end);
    const matchStart = idx - start;
    return (
      <>
        {prefix}
        {slice.slice(0, matchStart)}
        <mark className="bg-primary/30 text-foreground rounded px-0.5">
          {slice.slice(matchStart, matchStart + q.length)}
        </mark>
        {slice.slice(matchStart + q.length)}
        {suffix}
      </>
    );
  };

  const handleHit = (hit: SearchHit) => {
    if (hit.kind === 'channel' && hit.serverId && hit.channelId) {
      selectServer(hit.serverId);
      // selectServer auto-picks first channel; explicitly select the one we want
      setTimeout(() => selectChannel(hit.channelId!), 0);
    } else if (hit.kind === 'dm' && hit.peerId) {
      const conv = dmByPeer.get(hit.peerId);
      const peer = conv?.peerId || { id: hit.peerId, username: hit.peerName || 'peer' };
      openDM(peer);
    }
    onOpenChange(false);
    setQuery('');
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    return isToday
      ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search messages
          </DialogTitle>
          <DialogDescription>
            Search across all your local channels and direct messages.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages..."
            className="pl-9"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto -mx-6 px-6 mt-2">
          {query && hits.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">No messages match "{query}"</p>
            </div>
          )}

          {!query && (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">
                Start typing to search.
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                {allChannelMsgs.length + allDMMsgs.length} messages indexed locally.
              </p>
            </div>
          )}

          <ul className="space-y-1 pb-2">
            {hits.map((hit) => (
              <li key={hit.id}>
                <button
                  onClick={() => handleHit(hit)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-md',
                    'hover:bg-channel-hover transition-colors'
                  )}
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-0.5">
                    {hit.kind === 'channel' ? (
                      <>
                        <Hash className="w-3 h-3" />
                        <span className="truncate">
                          {hit.serverName || 'Server'} <span className="opacity-60">/</span> {hit.channelName}
                        </span>
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-3 h-3" />
                        <span className="truncate">@{hit.peerName}</span>
                      </>
                    )}
                    <span className="ml-auto whitespace-nowrap">{formatDate(hit.timestamp)}</span>
                  </div>
                  <p className="text-sm text-foreground line-clamp-2">
                    <span className="text-muted-foreground mr-1">{hit.authorName}:</span>
                    {highlight(hit.content, query)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

### File: `src\components\chat\ServerSettingsDialog.tsx`

```tsx
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


```

---

### File: `src\components\chat\ServerSidebar.tsx`

```tsx
import { useState, lazy, Suspense, useCallback } from 'react';
import { useP2P } from '@/contexts/P2PContext';
import { cn } from '@/lib/utils';
import { Plus, Hash, Settings, Wifi, WifiOff, MessageCircle, ScanLine } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

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
    if (result.startsWith('local-echo-profile://')) {
      const rest = result.slice('local-echo-profile://'.length);
      const atIdx = rest.lastIndexOf('@');
      if (atIdx >= 0) {
        const peerId = rest.slice(0, atIdx);
        const username = rest.slice(atIdx + 1);
        if (peerId) {
          await startDMByPeerId(peerId, username);
          toast.success(`Started DM with ${username || peerId.slice(0, 8)}`);
        }
      }
    } else {
      try {
        await joinServer(result);
        toast.success('Joined server successfully!');
      } catch {
        toast.error('Failed to join server from QR code');
      }
    }
  }, [joinServer, startDMByPeerId]);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'host': return 'bg-status-online';
      case 'connected': return 'bg-status-online';
      case 'connecting': return 'bg-status-idle';
      default: return 'bg-status-offline';
    }
  };

  const getStatusIcon = () => {
    return connectionStatus === 'disconnected' ? WifiOff : Wifi;
  };

  const StatusIcon = getStatusIcon();
  
  // Count total unread DMs
  const totalUnreadDMs = dmConversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  return (
    <aside className="w-[72px] bg-sidebar flex flex-col items-center py-3 gap-2 border-r border-sidebar-border">
      {/* Connection Status */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative mb-2">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center",
              "bg-secondary transition-all duration-200",
              "hover:rounded-xl hover:bg-primary"
            )}>
              <StatusIcon className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div className={cn(
              "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-sidebar",
              getStatusColor()
            )} />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p className="capitalize">{connectionStatus}</p>
        </TooltipContent>
      </Tooltip>

      {/* DM Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setViewMode('dms')}
            className={cn(
              "relative w-12 h-12 rounded-2xl flex items-center justify-center",
              "font-semibold transition-all duration-200",
              "hover:rounded-xl",
              viewMode === 'dms'
                ? "bg-primary text-primary-foreground rounded-xl"
                : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
            )}
          >
            <MessageCircle className="w-5 h-5" />
            {totalUnreadDMs > 0 && (
              <div className="absolute -bottom-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center px-1">
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
              onClick={() => selectServer(server.id)}
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center",
                "font-semibold text-lg transition-all duration-200",
                "hover:rounded-xl",
                currentServer?.id === server.id && viewMode === 'servers'
                  ? "bg-primary text-primary-foreground rounded-xl"
                  : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
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
            onClick={() => setShowCreateDialog(true)}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center",
              "bg-secondary text-success transition-all duration-200",
              "hover:rounded-xl hover:bg-success hover:text-success-foreground"
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
            onClick={() => setShowJoinDialog(true)}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center",
              "bg-secondary text-muted-foreground transition-all duration-200",
              "hover:rounded-xl hover:bg-accent hover:text-accent-foreground"
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
            onClick={() => setShowScanDialog(true)}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center",
              "bg-secondary text-muted-foreground transition-all duration-200",
              "hover:rounded-xl hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <ScanLine className="w-5 h-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Scan QR Code</p>
        </TooltipContent>
      </Tooltip>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Settings */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setShowSettingsDialog(true)}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center",
              "bg-secondary text-muted-foreground transition-all duration-200",
              "hover:rounded-xl hover:bg-accent hover:text-accent-foreground"
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
```

---

### File: `src\components\chat\SettingsDialog.tsx`

```tsx
import { useEffect, useRef, useState } from 'react';
import { useP2P } from '@/contexts/P2PContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Copy, Download, LogOut, QrCode, Shield, Wifi, User } from 'lucide-react';
import QRCode from 'qrcode';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { localPeer, connectionStatus, disconnect } = useP2P();
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const profileLink = localPeer
    ? `local-echo-profile://${localPeer.id}@${localPeer.username}`
    : '';

  useEffect(() => {
    if (!showQR || !qrCanvasRef.current || !profileLink) return;
    QRCode.toCanvas(qrCanvasRef.current, profileLink, {
      width: 200,
      margin: 2,
      color: { dark: '#000', light: '#fff' },
    });
  }, [showQR, profileLink]);

  const copyPeerId = async () => {
    if (!localPeer?.id) return;
    await navigator.clipboard.writeText(localPeer.id);
    toast.success('Peer ID copied to clipboard');
  };

  const downloadQR = () => {
    if (!qrCanvasRef.current || !localPeer) return;
    const link = document.createElement('a');
    link.download = `${localPeer.username}-profile-qr.png`;
    link.href = qrCanvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handleLogout = async () => {
    if (!confirmingLogout) {
      setConfirmingLogout(true);
      return;
    }
    await disconnect();
    onOpenChange(false);
    toast.success('Signed out. Local data cleared.');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) { setConfirmingLogout(false); setShowQR(false); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Manage your identity and session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* User info */}
          <div className="p-3 rounded-lg bg-secondary/50 border border-border space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
              <User className="w-3.5 h-3.5" /> Identity
            </div>
            <p className="text-sm font-semibold text-foreground">
              {localPeer?.username || 'Anonymous'}
            </p>
            <button
              type="button"
              onClick={copyPeerId}
              className="w-full flex items-center justify-between gap-2 p-2 rounded-md bg-background border border-border hover:bg-channel-hover transition-colors"
            >
              <span className="text-xs font-mono text-muted-foreground truncate">
                {localPeer?.id}
              </span>
              <Copy className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            </button>
            <p className="text-xs text-muted-foreground">
              Share your Peer ID to receive direct messages.
            </p>

            <Button variant="outline" size="sm" onClick={() => setShowQR(!showQR)} className="w-full gap-2">
              <QrCode className="w-4 h-4" />
              {showQR ? 'Hide QR Code' : 'Show Profile QR'}
            </Button>

            {showQR && (
              <div className="flex flex-col items-center gap-3 pt-2">
                <canvas ref={qrCanvasRef} className="rounded-lg border border-border" />
                <p className="text-xs text-muted-foreground text-center">
                  Scan this code to start a direct message
                </p>
                <Button variant="ghost" size="sm" onClick={downloadQR} className="gap-2">
                  <Download className="w-3.5 h-3.5" />
                  Save QR
                </Button>
              </div>
            )}
          </div>

          {/* Connection */}
          <div className="p-3 rounded-lg bg-secondary/50 border border-border space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
              <Wifi className="w-3.5 h-3.5" /> Connection
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="capitalize text-foreground">{connectionStatus}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Protocol</span>
              <span className="text-foreground">WebRTC P2P</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Encryption</span>
              <span className="text-success">E2E Enabled</span>
            </div>
          </div>

          {/* Logout */}
          <Button
            variant={confirmingLogout ? 'destructive' : 'outline'}
            onClick={handleLogout}
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {confirmingLogout ? 'Tap again to confirm — clears all local data' : 'Sign Out & Clear Data'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

### File: `src\components\chat\SettingsHelper.tsx`

```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

export function ToggleRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
      <Label className="capitalize">{label}</Label>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

export function RoadmapBanner({ feature }: { feature: string }) {
  return (
    <div className="mb-4 flex items-start gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
      <span className="mt-0.5 shrink-0 text-base">🗺️</span>
      <span>
        <span className="font-medium text-foreground">{feature} — Roadmap feature.</span>{' '}
        These settings are saved and synced to peers but are not enforced in the current version.
        Enforcement will be added in a future update.
      </span>
    </div>
  );
}
```

---

### File: `src\components\chat\UsernameSetup.tsx`

```tsx
import { useState } from 'react';
import { useP2P } from '@/contexts/P2PContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Shield, Wifi, Lock, Users } from 'lucide-react';

export function UsernameSetup() {
  const { initialize, hasStoredIdentity, restoreSession } = useP2P();
  const [username, setUsername] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    setIsInitializing(true);
    try {
      await initialize(username.trim());
      toast.success('Welcome to Local Echo!');
    } catch {
      toast.error('Failed to initialize. Please try again.');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      await restoreSession();
      toast.success('Session restored! Your chats are back.');
    } catch {
      toast.error('Failed to restore session. Please create a new one.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-in">
        {/* Logo & Title */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-3xl gradient-primary flex items-center justify-center shadow-glow animate-float">
            <Wifi className="w-10 h-10 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gradient">Local Echo</h1>
            <p className="text-muted-foreground mt-2">
              Private rooms that live close to the people in them
            </p>
          </div>
        </div>

        {/* Setup Form */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-foreground">
                Choose your username
              </label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username..."
                className="h-12 text-lg"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                This name will be visible to other peers in servers you join.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base gradient-primary hover:opacity-90 transition-opacity"
              disabled={isInitializing}
            >
              {isInitializing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Initializing...
                </>
              ) : (
                'Get Started'
              )}
            </Button>
          </form>

          {hasStoredIdentity && (
            <div className="mt-4 pt-4 border-t border-border">
              <Button
                onClick={handleRestore}
                variant="outline"
                className="w-full h-12 text-base"
                disabled={isRestoring}
              >
                {isRestoring ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Restoring...
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5 mr-2" />
                    Resume Previous Session
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Your previous chats and servers are still saved locally.
              </p>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <Shield className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-xs text-muted-foreground">E2E Encrypted</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <Wifi className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-xs text-muted-foreground">Peer-to-Peer</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <Lock className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-xs text-muted-foreground">Local-first</p>
          </div>
        </div>

        {/* Info */}
        <p className="text-xs text-center text-muted-foreground">
          All data stays on your device. Messages persist locally between sessions.
        </p>
      </div>
    </div>
  );
}
```

---

### File: `src\components\chat\VoiceChannelView.tsx`

```tsx
import { useState, useEffect } from 'react';
import { Mic, MicOff, PhoneOff, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useP2P } from '@/contexts/P2PContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function VoiceChannelView() {
  const { network, currentServer, currentChannel, isInVoiceChannel, muted, toggleMute, leaveVoiceChannel, joinVoiceChannel } = useP2P();
  const [participants, setParticipants] = useState(0);

  useEffect(() => {
    if (!network || !currentServer || !currentChannel) return;
    const unsub = network.addEventListener((event) => {
      if (event.type === 'voice-state-changed') {
        setParticipants(prev => prev + 1);
      }
    });
    return unsub;
  }, [network, currentServer, currentChannel]);

  const handleJoin = () => {
    if (!currentServer || !currentChannel) return;
    joinVoiceChannel(currentServer.id, currentChannel.id);
  };

  const handleLeave = () => {
    leaveVoiceChannel();
  };

  if (isInVoiceChannel) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              {currentChannel?.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center gap-4 py-8">
              <Button
                variant={muted ? 'secondary' : 'default'}
                size="lg"
                className="rounded-full w-16 h-16"
                onClick={toggleMute}
              >
                {muted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </Button>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              {muted ? 'Microphone is muted' : 'Microphone is active'}
            </div>
            <Button variant="destructive" className="w-full" onClick={handleLeave}>
              <PhoneOff className="w-4 h-4 mr-2" /> Leave Voice Channel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            {currentChannel?.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You are not connected to this voice channel. Press the button below to join.
          </p>
          <Button className="w-full" onClick={handleJoin}>
            <Volume2 className="w-4 h-4 mr-2" /> Join Voice Channel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### File: `src\components\ui\accordion.tsx`

```tsx
import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn("border-b", className)} {...props} />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
));

AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
```

---

### File: `src\components\ui\alert-dialog.tsx`

```tsx
import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const AlertDialog = AlertDialogPrimitive.Root;

const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
    ref={ref}
  />
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className,
      )}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const AlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action ref={ref} className={cn(buttonVariants(), className)} {...props} />
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className)}
    {...props}
  />
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
```

---

### File: `src\components\ui\alert.tsx`

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props} />
  ),
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />
  ),
);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
```

---

### File: `src\components\ui\aspect-ratio.tsx`

```tsx
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";

const AspectRatio = AspectRatioPrimitive.Root;

export { AspectRatio };
```

---

### File: `src\components\ui\avatar.tsx`

```tsx
import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image ref={ref} className={cn("aspect-square h-full w-full", className)} {...props} />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
```

---

### File: `src\components\ui\badge.tsx`

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
```

---

### File: `src\components\ui\breadcrumb.tsx`

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav"> & {
    separator?: React.ReactNode;
  }
>(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />);
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbList = React.forwardRef<HTMLOListElement, React.ComponentPropsWithoutRef<"ol">>(
  ({ className, ...props }, ref) => (
    <ol
      ref={ref}
      className={cn(
        "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
        className,
      )}
      {...props}
    />
  ),
);
BreadcrumbList.displayName = "BreadcrumbList";

const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<"li">>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("inline-flex items-center gap-1.5", className)} {...props} />
  ),
);
BreadcrumbItem.displayName = "BreadcrumbItem";

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & {
    asChild?: boolean;
  }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";

  return <Comp ref={ref} className={cn("transition-colors hover:text-foreground", className)} {...props} />;
});
BreadcrumbLink.displayName = "BreadcrumbLink";

const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<"span">>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("font-normal text-foreground", className)}
      {...props}
    />
  ),
);
BreadcrumbPage.displayName = "BreadcrumbPage";

const BreadcrumbSeparator = ({ children, className, ...props }: React.ComponentProps<"li">) => (
  <li role="presentation" aria-hidden="true" className={cn("[&>svg]:size-3.5", className)} {...props}>
    {children ?? <ChevronRight />}
  </li>
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

const BreadcrumbEllipsis = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More</span>
  </span>
);
BreadcrumbEllipsis.displayName = "BreadcrumbElipssis";

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
```

---

### File: `src\components\ui\button.tsx`

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

---

### File: `src\components\ui\calendar.tsx`

```tsx
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal aria-selected:opacity-100"),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
```

---

### File: `src\components\ui\card.tsx`

```tsx
import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props} />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
```

---

### File: `src\components\ui\carousel.tsx`

```tsx
import * as React from "react";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

const Carousel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & CarouselProps>(
  ({ orientation = "horizontal", opts, setApi, plugins, className, children, ...props }, ref) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
      },
      plugins,
    );
    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);

    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) {
        return;
      }

      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    }, []);

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev();
    }, [api]);

    const scrollNext = React.useCallback(() => {
      api?.scrollNext();
    }, [api]);

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          scrollPrev();
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          scrollNext();
        }
      },
      [scrollPrev, scrollNext],
    );

    React.useEffect(() => {
      if (!api || !setApi) {
        return;
      }

      setApi(api);
    }, [api, setApi]);

    React.useEffect(() => {
      if (!api) {
        return;
      }

      onSelect(api);
      api.on("reInit", onSelect);
      api.on("select", onSelect);

      return () => {
        api?.off("select", onSelect);
      };
    }, [api, onSelect]);

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation: orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  },
);
Carousel.displayName = "Carousel";

const CarouselContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { carouselRef, orientation } = useCarousel();

    return (
      <div ref={carouselRef} className="overflow-hidden">
        <div
          ref={ref}
          className={cn("flex", orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col", className)}
          {...props}
        />
      </div>
    );
  },
);
CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { orientation } = useCarousel();

    return (
      <div
        ref={ref}
        role="group"
        aria-roledescription="slide"
        className={cn("min-w-0 shrink-0 grow-0 basis-full", orientation === "horizontal" ? "pl-4" : "pt-4", className)}
        {...props}
      />
    );
  },
);
CarouselItem.displayName = "CarouselItem";

const CarouselPrevious = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, variant = "outline", size = "icon", ...props }, ref) => {
    const { orientation, scrollPrev, canScrollPrev } = useCarousel();

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "absolute h-8 w-8 rounded-full",
          orientation === "horizontal"
            ? "-left-12 top-1/2 -translate-y-1/2"
            : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
          className,
        )}
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        {...props}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="sr-only">Previous slide</span>
      </Button>
    );
  },
);
CarouselPrevious.displayName = "CarouselPrevious";

const CarouselNext = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, variant = "outline", size = "icon", ...props }, ref) => {
    const { orientation, scrollNext, canScrollNext } = useCarousel();

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "absolute h-8 w-8 rounded-full",
          orientation === "horizontal"
            ? "-right-12 top-1/2 -translate-y-1/2"
            : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
          className,
        )}
        disabled={!canScrollNext}
        onClick={scrollNext}
        {...props}
      >
        <ArrowRight className="h-4 w-4" />
        <span className="sr-only">Next slide</span>
      </Button>
    );
  },
);
CarouselNext.displayName = "CarouselNext";

export { type CarouselApi, Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext };
```

---

### File: `src\components\ui\chart.tsx`

```tsx
import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & ({ color?: string; theme?: never } | { color?: never; theme: Record<keyof typeof THEMES, string> });
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "Chart";

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([_, config]) => config.theme || config.color);

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] || itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean;
      hideIndicator?: boolean;
      indicator?: "line" | "dot" | "dashed";
      nameKey?: string;
      labelKey?: string;
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref,
  ) => {
    const { config } = useChart();

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null;
      }

      const [item] = payload;
      const key = `${labelKey || item.dataKey || item.name || "value"}`;
      const itemConfig = getPayloadConfigFromPayload(config, item, key);
      const value =
        !labelKey && typeof label === "string"
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label;

      if (labelFormatter) {
        return <div className={cn("font-medium", labelClassName)}>{labelFormatter(value, payload)}</div>;
      }

      if (!value) {
        return null;
      }

      return <div className={cn("font-medium", labelClassName)}>{value}</div>;
    }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);

    if (!active || !payload?.length) {
      return null;
    }

    const nestLabel = payload.length === 1 && indicator !== "dot";

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className,
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);
            const indicatorColor = color || item.payload.fill || item.color;

            return (
              <div
                key={item.dataKey}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center",
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn("shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]", {
                            "h-2.5 w-2.5": indicator === "dot",
                            "w-1": indicator === "line",
                            "w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
                            "my-0.5": nestLabel && indicator === "dashed",
                          })}
                          style={
                            {
                              "--color-bg": indicatorColor,
                              "--color-border": indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center",
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">{itemConfig?.label || item.name}</span>
                      </div>
                      {item.value && (
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {item.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);
ChartTooltipContent.displayName = "ChartTooltip";

const ChartLegend = RechartsPrimitive.Legend;

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean;
      nameKey?: string;
    }
>(({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn("flex items-center justify-center gap-4", verticalAlign === "top" ? "pb-3" : "pt-3", className)}
    >
      {payload.map((item) => {
        const key = `${nameKey || item.dataKey || "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);

        return (
          <div
            key={item.value}
            className={cn("flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground")}
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color,
                }}
              />
            )}
            {itemConfig?.label}
          </div>
        );
      })}
    </div>
  );
});
ChartLegendContent.displayName = "ChartLegend";

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadPayload =
    "payload" in payload && typeof payload.payload === "object" && payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;

  if (key in payload && typeof payload[key as keyof typeof payload] === "string") {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string;
  }

  return configLabelKey in config ? config[configLabelKey] : config[key as keyof typeof config];
}

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle };
```

---

### File: `src\components\ui\checkbox.tsx`

```tsx
import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
```

---

### File: `src\components\ui\collapsible.tsx`

```tsx
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
```

---

### File: `src\components\ui\command.tsx`

```tsx
import * as React from "react";
import { type DialogProps } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
      className,
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CommandDialogProps extends DialogProps {}

const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  </div>
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
));

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => <CommandPrimitive.Empty ref={ref} className="py-6 text-center text-sm" {...props} />);

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className,
    )}
    {...props}
  />
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator ref={ref} className={cn("-mx-1 h-px bg-border", className)} {...props} />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50",
      className,
    )}
    {...props}
  />
));

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />;
};
CommandShortcut.displayName = "CommandShortcut";

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
```

---

### File: `src\components\ui\context-menu.tsx`

```tsx
import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const ContextMenu = ContextMenuPrimitive.Root;

const ContextMenuTrigger = ContextMenuPrimitive.Trigger;

const ContextMenuGroup = ContextMenuPrimitive.Group;

const ContextMenuPortal = ContextMenuPrimitive.Portal;

const ContextMenuSub = ContextMenuPrimitive.Sub;

const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

const ContextMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <ContextMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[state=open]:bg-accent data-[state=open]:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
      inset && "pl-8",
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </ContextMenuPrimitive.SubTrigger>
));
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName;

const ContextMenuSubContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    {...props}
  />
));
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName;

const ContextMenuContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content
      ref={ref}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      {...props}
    />
  </ContextMenuPrimitive.Portal>
));
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName;

const ContextMenuItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName;

const ContextMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <ContextMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.CheckboxItem>
));
ContextMenuCheckboxItem.displayName = ContextMenuPrimitive.CheckboxItem.displayName;

const ContextMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.RadioItem>
));
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName;

const ContextMenuLabel = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold text-foreground", inset && "pl-8", className)}
    {...props}
  />
));
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName;

const ContextMenuSeparator = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
));
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName;

const ContextMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />;
};
ContextMenuShortcut.displayName = "ContextMenuShortcut";

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};
```

---

### File: `src\components\ui\dialog.tsx`

```tsx
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
```

---

### File: `src\components\ui\drawer.tsx`

```tsx
import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { cn } from "@/lib/utils";

const Drawer = ({ shouldScaleBackground = true, ...props }: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />
);
Drawer.displayName = "Drawer";

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay ref={ref} className={cn("fixed inset-0 z-50 bg-black/80", className)} {...props} />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
        className,
      )}
      {...props}
    >
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)} {...props} />
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />
);
DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
```

---

### File: `src\components\ui\dropdown-menu.tsx`

```tsx
import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[state=open]:bg-accent focus:bg-accent",
      inset && "pl-8",
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    {...props}
  />
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
    {...props}
  />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn("ml-auto text-xs tracking-widest opacity-60", className)} {...props} />;
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
```

---

### File: `src\components\ui\form.tsx`

```tsx
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import { Controller, ControllerProps, FieldPath, FieldValues, FormProvider, useFormContext } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = React.useId();

    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn("space-y-2", className)} {...props} />
      </FormItemContext.Provider>
    );
  },
);
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return <Label ref={ref} className={cn(error && "text-destructive", className)} htmlFor={formItemId} {...props} />;
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<React.ElementRef<typeof Slot>, React.ComponentPropsWithoutRef<typeof Slot>>(
  ({ ...props }, ref) => {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

    return (
      <Slot
        ref={ref}
        id={formItemId}
        aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
        aria-invalid={!!error}
        {...props}
      />
    );
  },
);
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { formDescriptionId } = useFormField();

    return <p ref={ref} id={formDescriptionId} className={cn("text-sm text-muted-foreground", className)} {...props} />;
  },
);
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    const { error, formMessageId } = useFormField();
    const body = error ? String(error?.message) : children;

    if (!body) {
      return null;
    }

    return (
      <p ref={ref} id={formMessageId} className={cn("text-sm font-medium text-destructive", className)} {...props}>
        {body}
      </p>
    );
  },
);
FormMessage.displayName = "FormMessage";

export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField };
```

---

### File: `src\components\ui\hover-card.tsx`

```tsx
import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";

import { cn } from "@/lib/utils";

const HoverCard = HoverCardPrimitive.Root;

const HoverCardTrigger = HoverCardPrimitive.Trigger;

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    {...props}
  />
));
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

export { HoverCard, HoverCardTrigger, HoverCardContent };
```

---

### File: `src\components\ui\input-otp.tsx`

```tsx
import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { Dot } from "lucide-react";

import { cn } from "@/lib/utils";

const InputOTP = React.forwardRef<React.ElementRef<typeof OTPInput>, React.ComponentPropsWithoutRef<typeof OTPInput>>(
  ({ className, containerClassName, ...props }, ref) => (
    <OTPInput
      ref={ref}
      containerClassName={cn("flex items-center gap-2 has-[:disabled]:opacity-50", containerClassName)}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  ),
);
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex items-center", className)} {...props} />,
);
InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
        isActive && "z-10 ring-2 ring-ring ring-offset-background",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink h-4 w-px bg-foreground duration-1000" />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = "InputOTPSlot";

const InputOTPSeparator = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ ...props }, ref) => (
    <div ref={ref} role="separator" {...props}>
      <Dot />
    </div>
  ),
);
InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
```

---

### File: `src\components\ui\input.tsx`

```tsx
import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
```

---

### File: `src\components\ui\label.tsx`

```tsx
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
```

---

### File: `src\components\ui\menubar.tsx`

```tsx
import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const MenubarMenu = MenubarPrimitive.Menu;

const MenubarGroup = MenubarPrimitive.Group;

const MenubarPortal = MenubarPrimitive.Portal;

const MenubarSub = MenubarPrimitive.Sub;

const MenubarRadioGroup = MenubarPrimitive.RadioGroup;

const Menubar = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn("flex h-10 items-center space-x-1 rounded-md border bg-background p-1", className)}
    {...props}
  />
));
Menubar.displayName = MenubarPrimitive.Root.displayName;

const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none data-[state=open]:bg-accent data-[state=open]:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
      className,
    )}
    {...props}
  />
));
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName;

const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[state=open]:bg-accent data-[state=open]:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
      inset && "pl-8",
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </MenubarPrimitive.SubTrigger>
));
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName;

const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    {...props}
  />
));
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName;

const MenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(({ className, align = "start", alignOffset = -4, sideOffset = 8, ...props }, ref) => (
  <MenubarPrimitive.Portal>
    <MenubarPrimitive.Content
      ref={ref}
      align={align}
      alignOffset={alignOffset}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      {...props}
    />
  </MenubarPrimitive.Portal>
));
MenubarContent.displayName = MenubarPrimitive.Content.displayName;

const MenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
MenubarItem.displayName = MenubarPrimitive.Item.displayName;

const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
));
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName;

const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
));
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName;

const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
    {...props}
  />
));
MenubarLabel.displayName = MenubarPrimitive.Label.displayName;

const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
));
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName;

const MenubarShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />;
};
MenubarShortcut.displayname = "MenubarShortcut";

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
};
```

---

### File: `src\components\ui\navigation-menu.tsx`

```tsx
import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn("relative z-10 flex max-w-max flex-1 items-center justify-center", className)}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
));
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn("group flex flex-1 list-none items-center justify-center space-x-1", className)}
    {...props}
  />
));
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;

const NavigationMenuItem = NavigationMenuPrimitive.Item;

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
);

const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(navigationMenuTriggerStyle(), "group", className)}
    {...props}
  >
    {children}{" "}
    <ChevronDown
      className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
));
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(
      "left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto",
      className,
    )}
    {...props}
  />
));
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;

const NavigationMenuLink = NavigationMenuPrimitive.Link;

const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <div className={cn("absolute left-0 top-full flex justify-center")}>
    <NavigationMenuPrimitive.Viewport
      className={cn(
        "origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]",
        className,
      )}
      ref={ref}
      {...props}
    />
  </div>
));
NavigationMenuViewport.displayName = NavigationMenuPrimitive.Viewport.displayName;

const NavigationMenuIndicator = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    className={cn(
      "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in",
      className,
    )}
    {...props}
  >
    <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
  </NavigationMenuPrimitive.Indicator>
));
NavigationMenuIndicator.displayName = NavigationMenuPrimitive.Indicator.displayName;

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
};
```

---

### File: `src\components\ui\pagination.tsx`

```tsx
import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { ButtonProps, buttonVariants } from "@/components/ui/button";

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("flex flex-row items-center gap-1", className)} {...props} />
  ),
);
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">;

const PaginationLink = ({ className, isActive, size = "icon", ...props }: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      className,
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink aria-label="Go to previous page" size="default" className={cn("gap-1 pl-2.5", className)} {...props}>
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink aria-label="Go to next page" size="default" className={cn("gap-1 pr-2.5", className)} {...props}>
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span aria-hidden className={cn("flex h-9 w-9 items-center justify-center", className)} {...props}>
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
```

---

### File: `src\components\ui\popover.tsx`

```tsx
import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent };
```

---

### File: `src\components\ui\progress.tsx`

```tsx
import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
```

---

### File: `src\components\ui\radio-group.tsx`

```tsx
import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return <RadioGroupPrimitive.Root className={cn("grid gap-2", className)} {...props} ref={ref} />;
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };
```

---

### File: `src\components\ui\resizable.tsx`

```tsx
import { GripVertical } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "@/lib/utils";

const ResizablePanelGroup = ({ className, ...props }: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className)}
    {...props}
  />
);

const ResizablePanel = ResizablePrimitive.Panel;

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean;
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 [&[data-panel-group-direction=vertical]>div]:rotate-90",
      className,
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
```

---

### File: `src\components\ui\scroll-area.tsx`

```tsx
import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "@/lib/utils";

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root ref={ref} className={cn("relative overflow-hidden", className)} {...props}>
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">{children}</ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className,
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
```

---

### File: `src\components\ui\select.tsx`

```tsx
import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className,
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label ref={ref} className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)} {...props} />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
```

---

### File: `src\components\ui\separator.tsx`

```tsx
import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "@/lib/utils";

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn("shrink-0 bg-border", orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]", className)}
    {...props}
  />
));
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
```

---

### File: `src\components\ui\sheet.tsx`

```tsx
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
);

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Content>, SheetContentProps>(
  ({ side = "right", className, children, ...props }, ref) => (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content ref={ref} className={cn(sheetVariants({ side }), className)} {...props}>
        {children}
        <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-secondary hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  ),
);
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title ref={ref} className={cn("text-lg font-semibold text-foreground", className)} {...props} />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};
```

---

### File: `src\components\ui\sidebar.tsx`

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { VariantProps, cva } from "class-variance-authority";
import { PanelLeft } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const SIDEBAR_COOKIE_NAME = "sidebar:state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContext = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContext | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(({ defaultOpen = true, open: openProp, onOpenChange: setOpenProp, className, style, children, ...props }, ref) => {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open],
  );

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
  }, [isMobile, setOpen, setOpenMobile]);

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo<SidebarContext>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn("group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar", className)}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
});
SidebarProvider.displayName = "SidebarProvider";

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right";
    variant?: "sidebar" | "floating" | "inset";
    collapsible?: "offcanvas" | "icon" | "none";
  }
>(({ side = "left", variant = "sidebar", collapsible = "offcanvas", className, children, ...props }, ref) => {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === "none") {
    return (
      <div
        className={cn("flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground", className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-mobile="true"
          className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      ref={ref}
      className="group peer hidden text-sidebar-foreground md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        className={cn(
          "relative h-svh w-[--sidebar-width] bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"
            : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]",
        )}
      />
      <div
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] duration-200 ease-linear md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          // Adjust the padding for floating and inset variants.
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]"
            : "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className,
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
        >
          {children}
        </div>
      </div>
    </div>
  );
});
Sidebar.displayName = "Sidebar";

const SidebarTrigger = React.forwardRef<React.ElementRef<typeof Button>, React.ComponentProps<typeof Button>>(
  ({ className, onClick, ...props }, ref) => {
    const { toggleSidebar } = useSidebar();

    return (
      <Button
        ref={ref}
        data-sidebar="trigger"
        variant="ghost"
        size="icon"
        className={cn("h-7 w-7", className)}
        onClick={(event) => {
          onClick?.(event);
          toggleSidebar();
        }}
        {...props}
      >
        <PanelLeft />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
    );
  },
);
SidebarTrigger.displayName = "SidebarTrigger";

const SidebarRail = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(
  ({ className, ...props }, ref) => {
    const { toggleSidebar } = useSidebar();

    return (
      <button
        ref={ref}
        data-sidebar="rail"
        aria-label="Toggle Sidebar"
        tabIndex={-1}
        onClick={toggleSidebar}
        title="Toggle Sidebar"
        className={cn(
          "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] group-data-[side=left]:-right-4 group-data-[side=right]:left-0 hover:after:bg-sidebar-border sm:flex",
          "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
          "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
          "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
          "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
          "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
          className,
        )}
        {...props}
      />
    );
  },
);
SidebarRail.displayName = "SidebarRail";

const SidebarInset = React.forwardRef<HTMLDivElement, React.ComponentProps<"main">>(({ className, ...props }, ref) => {
  return (
    <main
      ref={ref}
      className={cn(
        "relative flex min-h-svh flex-1 flex-col bg-background",
        "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
        className,
      )}
      {...props}
    />
  );
});
SidebarInset.displayName = "SidebarInset";

const SidebarInput = React.forwardRef<React.ElementRef<typeof Input>, React.ComponentProps<typeof Input>>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        data-sidebar="input"
        className={cn(
          "h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
          className,
        )}
        {...props}
      />
    );
  },
);
SidebarInput.displayName = "SidebarInput";

const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => {
  return <div ref={ref} data-sidebar="header" className={cn("flex flex-col gap-2 p-2", className)} {...props} />;
});
SidebarHeader.displayName = "SidebarHeader";

const SidebarFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => {
  return <div ref={ref} data-sidebar="footer" className={cn("flex flex-col gap-2 p-2", className)} {...props} />;
});
SidebarFooter.displayName = "SidebarFooter";

const SidebarSeparator = React.forwardRef<React.ElementRef<typeof Separator>, React.ComponentProps<typeof Separator>>(
  ({ className, ...props }, ref) => {
    return (
      <Separator
        ref={ref}
        data-sidebar="separator"
        className={cn("mx-2 w-auto bg-sidebar-border", className)}
        {...props}
      />
    );
  },
);
SidebarSeparator.displayName = "SidebarSeparator";

const SidebarContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className,
      )}
      {...props}
    />
  );
});
SidebarContent.displayName = "SidebarContent";

const SidebarGroup = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  );
});
SidebarGroup.displayName = "SidebarGroup";

const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & { asChild?: boolean }>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";

    return (
      <Comp
        ref={ref}
        data-sidebar="group-label"
        className={cn(
          "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
          "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
          className,
        )}
        {...props}
      />
    );
  },
);
SidebarGroupLabel.displayName = "SidebarGroupLabel";

const SidebarGroupAction = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button"> & { asChild?: boolean }>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        data-sidebar="group-action"
        className={cn(
          "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
          // Increases the hit area of the button on mobile.
          "after:absolute after:-inset-2 after:md:hidden",
          "group-data-[collapsible=icon]:hidden",
          className,
        )}
        {...props}
      />
    );
  },
);
SidebarGroupAction.displayName = "SidebarGroupAction";

const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} data-sidebar="group-content" className={cn("w-full text-sm", className)} {...props} />
  ),
);
SidebarGroupContent.displayName = "SidebarGroupContent";

const SidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(({ className, ...props }, ref) => (
  <ul ref={ref} data-sidebar="menu" className={cn("flex w-full min-w-0 flex-col gap-1", className)} {...props} />
));
SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(({ className, ...props }, ref) => (
  <li ref={ref} data-sidebar="menu-item" className={cn("group/menu-item relative", className)} {...props} />
));
SidebarMenuItem.displayName = "SidebarMenuItem";

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean;
    isActive?: boolean;
    tooltip?: string | React.ComponentProps<typeof TooltipContent>;
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(({ asChild = false, isActive = false, variant = "default", size = "default", tooltip, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  const { isMobile, state } = useSidebar();

  const button = (
    <Comp
      ref={ref}
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  );

  if (!tooltip) {
    return button;
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    };
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right" align="center" hidden={state !== "collapsed" || isMobile} {...tooltip} />
    </Tooltip>
  );
});
SidebarMenuButton.displayName = "SidebarMenuButton";

const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean;
    showOnHover?: boolean;
  }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform peer-hover/menu-button:text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
        className,
      )}
      {...props}
    />
  );
});
SidebarMenuAction.displayName = "SidebarMenuAction";

const SidebarMenuBadge = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-sidebar="menu-badge"
      className={cn(
        "pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  ),
);
SidebarMenuBadge.displayName = "SidebarMenuBadge";

const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    showIcon?: boolean;
  }
>(({ className, showIcon = false, ...props }, ref) => {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);

  return (
    <div
      ref={ref}
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
      {...props}
    >
      {showIcon && <Skeleton className="size-4 rounded-md" data-sidebar="menu-skeleton-icon" />}
      <Skeleton
        className="h-4 max-w-[--skeleton-width] flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  );
});
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton";

const SidebarMenuSub = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      data-sidebar="menu-sub"
      className={cn(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  ),
);
SidebarMenuSub.displayName = "SidebarMenuSub";

const SidebarMenuSubItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(({ ...props }, ref) => (
  <li ref={ref} {...props} />
));
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";

const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<"a"> & {
    asChild?: boolean;
    size?: "sm" | "md";
    isActive?: boolean;
  }
>(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring aria-disabled:pointer-events-none aria-disabled:opacity-50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
});
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};
```

---

### File: `src\components\ui\skeleton.tsx`

```tsx
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

export { Skeleton };
```

---

### File: `src\components\ui\slider.tsx`

```tsx
import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
```

---

### File: `src\components\ui\sonner.tsx`

```tsx
import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        duration: 5000,
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
```

---

### File: `src\components\ui\switch.tsx`

```tsx
import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
```

---

### File: `src\components\ui\table.tsx`

```tsx
import * as React from "react";

import { cn } from "@/lib/utils";

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  ),
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />,
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
  ),
);
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot ref={ref} className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)} {...props} />
  ),
);
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn("border-b transition-colors data-[state=selected]:bg-muted hover:bg-muted/50", className)}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  ),
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)} {...props} />
  ),
);
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
  ),
);
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
```

---

### File: `src\components\ui\tabs.tsx`

```tsx
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
```

---

### File: `src\components\ui\textarea.tsx`

```tsx
import * as React from "react";

import { cn } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
```

---

### File: `src\components\ui\toggle-group.tsx`

```tsx
import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { toggleVariants } from "@/components/ui/toggle";

const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({
  size: "default",
  variant: "default",
});

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> & VariantProps<typeof toggleVariants>
>(({ className, variant, size, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root ref={ref} className={cn("flex items-center justify-center gap-1", className)} {...props}>
    <ToggleGroupContext.Provider value={{ variant, size }}>{children}</ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
));

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleVariants>
>(({ className, children, variant, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
});

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };
```

---

### File: `src\components\ui\toggle.tsx`

```tsx
import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root ref={ref} className={cn(toggleVariants({ variant, size, className }))} {...props} />
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };
```

---

### File: `src\components\ui\tooltip.tsx`

```tsx
import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
```

---

### File: `src\components\NavLink.tsx`

```tsx
import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
```

---

### File: `src\contexts\P2PContext.tsx`

```tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo, ReactNode } from 'react';
import { P2PNetwork } from '@/lib/p2p-network';
import { Server, Channel, Message, PeerId, P2PEvent, ConnectionStatus, ViewMode, DMConversation, DirectMessage, ChannelOp } from '@/types/p2p';
import type { CommunityConfigPatch, CreateCommunityInput } from '@/types/community';
import * as Storage from '@/lib/storage';
import { logger } from '@/lib/logger';
import { sendBrowserNotification } from '@/hooks/use-notifications';
import { toast } from 'sonner';

interface P2PContextType {
  network: P2PNetwork | null;
  getAllMessages: () => Message[];
  isInitialized: boolean;
  connectionStatus: ConnectionStatus;
  localPeer: PeerId | null;
  servers: Server[];
  currentServer: Server | null;
  currentChannel: Channel | null;
  messages: Message[];
  onlinePeers: PeerId[];
  
  // View mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  
  // DM State
  dmConversations: DMConversation[];
  currentDMPeer: PeerId | null;
  dmMessages: DirectMessage[];
  availablePeersForDM: PeerId[];
  
  // Actions
  initialize: (username: string) => Promise<void>;
  createServer: (input: string | CreateCommunityInput) => Promise<Server>;
  joinServer: (inviteCode: string) => Promise<void>;
  selectServer: (serverId: string) => void;
  selectChannel: (channelId: string) => void;
  sendMessage: (content: string) => Promise<void>;
  loadOlderMessages: () => Promise<void>;
  generateInvite: () => Promise<string>;
  disconnect: () => void;

  // Server customization (host only)
  isCurrentServerHost: boolean;
  updateCurrentServer: (patch: { name?: string; icon?: string; channelOps?: ChannelOp[]; configPatch?: CommunityConfigPatch }) => Promise<void>;
  leaveCurrentServer: () => Promise<void>;
  deleteCurrentServer: () => Promise<void>;
  
  // DM Actions
  openDM: (peer: PeerId) => void;
  sendDM: (content: string) => Promise<void>;
  sendDMTyping: (isTyping: boolean) => void;
  markDMAsRead: () => void;
  startNewDM: (peer: PeerId) => void;
  startDMByPeerId: (peerId: string, username?: string) => Promise<void>;

  // Voice
  isInVoiceChannel: boolean;
  muted: boolean;
  joinVoiceChannel: (serverId: string, channelId: string) => Promise<void>;
  leaveVoiceChannel: () => Promise<void>;
  toggleMute: () => boolean;

  // Persistence
  hasStoredIdentity: boolean;
  restoreSession: () => Promise<void>;
}

const P2PContext = createContext<P2PContextType | null>(null);

export function P2PProvider({ children }: { children: ReactNode }) {
  const [network, setNetwork] = useState<P2PNetwork | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [localPeer, setLocalPeer] = useState<PeerId | null>(null);
  const [servers, setServers] = useState<Server[]>([]);
  const [currentServerId, setCurrentServerId] = useState<string | null>(null);
  const [currentChannelId, setCurrentChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlinePeers, setOnlinePeers] = useState<PeerId[]>([]);
  const [hasStoredIdentity, setHasStoredIdentity] = useState(false);
  
  // View mode (servers or DMs)
  const [viewMode, setViewMode] = useState<ViewMode>('servers');
  
  // DM State
  const [dmConversations, setDmConversations] = useState<DMConversation[]>([]);
  const [currentDMPeerId, setCurrentDMPeerId] = useState<string | null>(null);
  const [dmMessages, setDmMessages] = useState<DirectMessage[]>([]);
  const [availablePeersForDM, setAvailablePeersForDM] = useState<PeerId[]>([]);
  const currentServerIdRef = useRef<string | null>(null);
  const currentChannelIdRef = useRef<string | null>(null);
  const currentDMPeerIdRef = useRef<string | null>(null);
  const networkRef = useRef<P2PNetwork | null>(null);

  const currentServer = useMemo(
    () => servers.find(s => s.id === currentServerId) || null,
    [servers, currentServerId]
  );
  const currentChannel = useMemo(
    () => currentServer?.channels.find(c => c.id === currentChannelId) || null,
    [currentServer, currentChannelId]
  );
  const currentDMPeer = dmConversations.find(c => c.peerId.id === currentDMPeerId)?.peerId || null;

  // Voice state
  const [isInVoiceChannel, setIsInVoiceChannel] = useState(false);
  const [muted, setMuted] = useState(false);

  const setNetworkState = useCallback((net: P2PNetwork | null) => {
    setNetwork(net);
    networkRef.current = net;
  }, []);

  const setCurrentServerIdState = useCallback((id: string | null) => {
    setCurrentServerId(id);
    currentServerIdRef.current = id;
  }, []);

  const setCurrentChannelIdState = useCallback((id: string | null) => {
    setCurrentChannelId(id);
    currentChannelIdRef.current = id;
  }, []);

  const setCurrentDMPeerIdState = useCallback((id: string | null) => {
    setCurrentDMPeerId(id);
    currentDMPeerIdRef.current = id;
  }, []);

  // Check for stored identity on mount
  useEffect(() => {
    Storage.loadIdentity().then(identity => {
      if (identity) {
        setHasStoredIdentity(true);
      }
    }).catch(() => {});
  }, []);

  // Handle P2P events
  const handleEvent = useCallback((event: P2PEvent) => {
    const net = networkRef.current;
    const serverId = currentServerIdRef.current;
    const channelId = currentChannelIdRef.current;
    const dmPeerId = currentDMPeerIdRef.current;

    logger.log('[P2P Context] Event:', event.type);

    switch (event.type) {
      case 'message':
        if (net && serverId && channelId) {
          const msg = event.payload as Message;
          if (msg.serverId === serverId && msg.channelId === channelId) {
            setMessages(net.getMessages(serverId, channelId));
          }
        }
        break;
      case 'peer-joined':
        if (net) {
          setOnlinePeers(net.getOnlinePeers());
          setServers(net.getServers());
          setAvailablePeersForDM(net.getAvailablePeersForDM());
        }
        break;
      case 'peer-left':
        if (net) {
          setOnlinePeers(net.getOnlinePeers());
          setServers(net.getServers());
        }
        break;
      case 'host-changed':
        if (net) {
          setConnectionStatus(net.getConnectionStatus());
          setServers(net.getServers());
        }
        break;
      case 'dm-message':
        if (net) {
          const payload = event.payload as { dm?: DirectMessage; incoming?: boolean } | { peerId?: string; connectionType?: string } | { merged?: number } | DirectMessage;
          const dm = (payload as { dm?: DirectMessage }).dm || (payload as DirectMessage);
          const incoming = Boolean((payload as { incoming?: boolean }).incoming);

          setDmConversations(net.getDMConversations());
          if (dmPeerId) {
            setDmMessages(net.getDMMessages(dmPeerId));
          }
          if (incoming && dm?.from && dm.content && dm.from.id !== net.getLocalPeer().id) {
            sendBrowserNotification(
              `New message from ${dm.from.username}`,
              dm.content.length > 60 ? `${dm.content.slice(0, 60)}…` : dm.content
            );
          }
        }
        break;
      case 'dm-typing':
        if (net) {
          setDmConversations(net.getDMConversations());
        }
        break;
      case 'server-updated':
        if (net) {
          setServers(net.getServers());
        }
        break;
      case 'server-deleted':
        if (net) {
          const remaining = net.getServers();
          setServers(remaining);
          const deletedId = (event.payload as { serverId?: string })?.serverId;
          if (deletedId === serverId) {
            const next = remaining[0];
            if (next) {
              setCurrentServerIdState(next.id);
              setCurrentChannelIdState(next.channels[0]?.id || null);
              setMessages(net.getMessages(next.id, next.channels[0]?.id || ''));
            } else {
              setCurrentServerIdState(null);
              setCurrentChannelIdState(null);
              setMessages([]);
              setViewMode('dms');
            }
          }
        }
        break;
      case 'sync-response':
        if (net) {
          const updatedServers = net.getServers();
          setServers(updatedServers);
          setOnlinePeers(net.getOnlinePeers());
          setAvailablePeersForDM(net.getAvailablePeersForDM());

          if (serverId) {
            const updatedServer = updatedServers.find(s => s.id === serverId);
            const channelStillValid = updatedServer?.channels.find(c => c.id === channelId);
            const resolvedChannelId = channelStillValid?.id
              ?? updatedServer?.channels.filter(c => c.type === 'text')[0]?.id
              ?? null;

            if (resolvedChannelId && resolvedChannelId !== channelId) {
              setCurrentChannelIdState(resolvedChannelId);
            }
            const finalChannelId = resolvedChannelId || channelId;
            if (finalChannelId) {
              setMessages(net.getMessages(serverId, finalChannelId));
            }
          }
        }
        break;
      case 'peer-list':
      case 'config-sync':
        break;
      case 'error': {
        const errPayload = event.payload as { message: string; level?: string };
        if (errPayload?.message) {
          const msg = errPayload.message;
          const level = errPayload.level || 'error';
          if (level === 'error') toast.error(msg);
          else if (level === 'warn') toast.warning(msg);
          else toast.info(msg);
        }
        break;
      }
      case 'voice-state-changed': {
        if (net) {
          setIsInVoiceChannel(net.isInVoiceChannel());
          setMuted(net.isMuted());
        }
        break;
      }
    }
  }, []);

  // Subscribe to events when network changes
  useEffect(() => {
    if (!network) return;
    networkRef.current = network;
    const unsubscribe = network.addEventListener(handleEvent);
    return () => unsubscribe();
  }, [network, handleEvent]);

  const initializeNetwork = useCallback(async (username: string, existingId?: string) => {
    let iceServers: RTCIceServer[] | undefined;
    try {
      const raw = import.meta.env.VITE_ICE_SERVERS as string | undefined;
      if (raw) iceServers = JSON.parse(raw) as RTCIceServer[];
    } catch {
      logger.warn('[P2P] Failed to parse VITE_ICE_SERVERS env var');
    }
    const net = new P2PNetwork(username, existingId, {
      signalingHost: import.meta.env.VITE_PEERJS_HOST as string | undefined,
      signalingPort: import.meta.env.VITE_PEERJS_PORT ? Number(import.meta.env.VITE_PEERJS_PORT) : undefined,
      signalingSecure: import.meta.env.VITE_PEERJS_SECURE === 'true' ? true : undefined,
      signalingPath: import.meta.env.VITE_PEERJS_PATH as string | undefined,
      iceServers,
    });
    await net.initialize();
    
    // Load persisted data
    await net.loadPersistedData();
    
    // Save identity
    await net.persistIdentity();
    
    setNetworkState(net);
    setLocalPeer(net.getLocalPeer());
    setIsInitialized(true);
    setConnectionStatus('disconnected');
    setHasStoredIdentity(true);

    // Restore servers and messages from persisted data
    const restoredServers = net.getServers();
    setServers(restoredServers);
    
    if (restoredServers.length > 0) {
      const firstServer = restoredServers[0];
      setCurrentServerIdState(firstServer.id);
      const firstChannel = firstServer.channels[0]?.id || 'general';
      setCurrentChannelIdState(firstChannel);
      setMessages(net.getMessages(firstServer.id, firstChannel));
    }

    // Restore DM conversations
    setDmConversations(net.getDMConversations());
    setOnlinePeers(net.getOnlinePeers());
    setAvailablePeersForDM(net.getAvailablePeersForDM());
    
    return net;
  }, []);

  const initialize = useCallback(async (username: string) => {
    await initializeNetwork(username);
  }, [initializeNetwork]);

  const restoreSession = useCallback(async () => {
    const identity = await Storage.loadIdentity();
    if (!identity) throw new Error('No stored identity');
    await initializeNetwork(identity.username, identity.peerId);
  }, [initializeNetwork]);

  const createServer = useCallback(async (input: string | CreateCommunityInput) => {
    if (!network) throw new Error('Network not initialized');
    
    const server = await network.createServer(input);
    setServers(network.getServers());
    setCurrentServerIdState(server.id);
    setCurrentChannelIdState(server.channels[0]?.id || null);
    setConnectionStatus(network.getConnectionStatus());
    setOnlinePeers(network.getOnlinePeers());
    setMessages([]);
    setViewMode('servers');
    setAvailablePeersForDM(network.getAvailablePeersForDM());
    
    return server;
  }, [network]);

  const joinServer = useCallback(async (inviteCode: string) => {
    if (!network) throw new Error('Network not initialized');
    
    logger.log('[P2P] Joining server with invite code');
    setConnectionStatus('connecting');
    
    try {
      const server = await network.joinServer(inviteCode);
      
      setServers(network.getServers());
      setCurrentServerIdState(server.id);
      setCurrentChannelIdState(null);
      setConnectionStatus(network.getConnectionStatus());
      setOnlinePeers(network.getOnlinePeers());
      setMessages([]);
      setViewMode('servers');
      setAvailablePeersForDM(network.getAvailablePeersForDM());
    } catch (error) {
      setConnectionStatus('disconnected');
      logger.error('Failed to join server:', error);
      throw error;
    }
  }, [network]);

  const selectServer = useCallback((serverId: string) => {
    setCurrentServerIdState(serverId);
    setCurrentDMPeerIdState(null);
    setViewMode('servers');
    const server = servers.find(s => s.id === serverId);
    if (server) {
      setCurrentChannelIdState(server.channels[0]?.id || null);
      if (network) {
        setMessages(network.getMessages(serverId, server.channels[0]?.id || ''));
      }
    }
  }, [servers, network]);

  const selectChannel = useCallback((channelId: string) => {
    setCurrentChannelIdState(channelId);
    if (network && currentServerId) {
      setMessages(network.getMessages(currentServerId, channelId));
    }
  }, [network, currentServerId]);

  const getAllMessages = useCallback((): Message[] => {
    return network?.getAllMessages() || [];
  }, [network]);

  const sendMessage = useCallback(async (content: string) => {
    if (!network || !currentServerId || !currentChannelId) return;
    
    await network.sendMessage(currentServerId, currentChannelId, content);
    setMessages(network.getMessages(currentServerId, currentChannelId));
  }, [network, currentServerId, currentChannelId]);

  const loadOlderMessages = useCallback(async () => {
    if (!network || !currentServerId || !currentChannelId) return;
    const updated = await network.loadOlderMessages(currentServerId, currentChannelId);
    setMessages([...updated]);
  }, [network, currentServerId, currentChannelId]);

  const generateInvite = useCallback(async () => {
    if (!network || !currentServerId) throw new Error('No server selected');
    return network.generateInvite(currentServerId);
  }, [network, currentServerId]);

  // ===== Server customization =====
  const isCurrentServerHost =
    !!network && !!currentServerId && network.isServerHost(currentServerId);

  const updateCurrentServer = useCallback(
    async (patch: { name?: string; icon?: string; channelOps?: ChannelOp[]; configPatch?: CommunityConfigPatch }) => {
      if (!network || !currentServerId) throw new Error('No server selected');
      await network.updateServer(currentServerId, patch);
      setServers(network.getServers());
      // If the current channel was deleted, fall back to first remaining
      const refreshed = network.getServer(currentServerId);
      if (refreshed && currentChannelId && !refreshed.channels.find(c => c.id === currentChannelId)) {
      const fallback = refreshed.channels[0]?.id || null;
      setCurrentChannelIdState(fallback);
        if (fallback) setMessages(network.getMessages(currentServerId, fallback));
        else setMessages([]);
      }
    },
    [network, currentServerId, currentChannelId]
  );

  const leaveCurrentServer = useCallback(async () => {
    if (!network || !currentServerId) return;
    await network.leaveServer(currentServerId);
    // server-deleted event handler will reset selection
    setServers(network.getServers());
  }, [network, currentServerId]);

  const deleteCurrentServer = useCallback(async () => {
    if (!network || !currentServerId) return;
    await network.deleteServerAsHost(currentServerId);
    setServers(network.getServers());
  }, [network, currentServerId]);

  // DM Actions
  const openDM = useCallback((peer: PeerId) => {
    if (!network) return;
    
    network.getOrCreateDMConversation(peer);
    network.initiateDMConnection(peer.id);
    
    setCurrentDMPeerIdState(peer.id);
    setCurrentServerIdState(null);
    setCurrentChannelIdState(null);
    setViewMode('dms');
    setDmConversations(network.getDMConversations());
    setDmMessages(network.getDMMessages(peer.id));
    network.markDMAsRead(peer.id);
  }, [network]);

  const startNewDM = useCallback((peer: PeerId) => {
    openDM(peer);
  }, [openDM]);

  const startDMByPeerId = useCallback(async (peerId: string, username?: string) => {
    if (!network) throw new Error('Network not initialized');
    if (peerId === network.getLocalPeer().id) throw new Error("That's your own peer ID");
    const peer: PeerId = { id: peerId, username: username?.trim() || `peer-${peerId.slice(0, 6)}` };
    openDM(peer);
  }, [network, openDM]);

  const sendDM = useCallback(async (content: string) => {
    if (!network || !currentDMPeerId) return;
    
    await network.sendDM(currentDMPeerId, content);
    setDmMessages(network.getDMMessages(currentDMPeerId));
    setDmConversations(network.getDMConversations());
  }, [network, currentDMPeerId]);

  const sendDMTyping = useCallback((isTyping: boolean) => {
    if (!network || !currentDMPeerId) return;
    network.sendDMTyping(currentDMPeerId, isTyping);
  }, [network, currentDMPeerId]);

  const markDMAsRead = useCallback(() => {
    if (!network || !currentDMPeerId) return;
    network.markDMAsRead(currentDMPeerId);
    setDmConversations(network.getDMConversations());
  }, [network, currentDMPeerId]);

  // Voice actions
  const joinVoiceChannel = useCallback(async (serverId: string, channelId: string) => {
    await network?.joinVoiceChannel(serverId, channelId);
    setIsInVoiceChannel(network?.isInVoiceChannel() ?? false);
    setMuted(network?.isMuted() ?? false);
  }, [network]);

  const leaveVoiceChannel = useCallback(async () => {
    await network?.leaveVoiceChannel();
    setIsInVoiceChannel(false);
    setMuted(false);
  }, [network]);

  const toggleMuteCb = useCallback(() => {
    if (!network) return false;
    const m = network.toggleMute();
    setMuted(m);
    return m;
  }, [network]);

  const disconnect = useCallback(async () => {
    if (network) {
      await network.clearPersistedData();
      await network.disconnect();
    }
    setNetworkState(null);
    setIsInitialized(false);
    setConnectionStatus('disconnected');
    setLocalPeer(null);
    setServers([]);
    setCurrentServerIdState(null);
    setCurrentChannelIdState(null);
    setMessages([]);
    setOnlinePeers([]);
    setDmConversations([]);
    setCurrentDMPeerIdState(null);
    setDmMessages([]);
    setViewMode('servers');
    setHasStoredIdentity(false);
  }, [network]);

  return (
    <P2PContext.Provider
      value={{
        network,
        getAllMessages,
        isInitialized,
        connectionStatus,
        localPeer,
        servers,
        currentServer,
        currentChannel,
        messages,
        onlinePeers,
        viewMode,
        setViewMode,
        dmConversations,
        currentDMPeer,
        dmMessages,
        availablePeersForDM,
        initialize,
        createServer,
        joinServer,
        selectServer,
        selectChannel,
        sendMessage,
        loadOlderMessages,
        generateInvite,
        disconnect,
        openDM,
        sendDM,
        sendDMTyping,
        markDMAsRead,
        startNewDM,
        startDMByPeerId,
        hasStoredIdentity,
        restoreSession,
        isCurrentServerHost,
        updateCurrentServer,
        leaveCurrentServer,
        deleteCurrentServer,
        isInVoiceChannel,
        muted,
        joinVoiceChannel,
        leaveVoiceChannel,
        toggleMute: toggleMuteCb,
      }}
    >
      {children}
    </P2PContext.Provider>
  );
}

export function useP2P() {
  const context = useContext(P2PContext);
  if (!context) {
    throw new Error('useP2P must be used within a P2PProvider');
  }
  return context;
}
```

---

### File: `src\hooks\use-mobile.tsx`

```tsx
import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
```

---

### File: `src\hooks\use-notifications.ts`

```ts
import { useEffect } from 'react';

export function useNotificationPermission() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
}

export function sendBrowserNotification(title: string, body: string, icon?: string) {
  if (typeof window === 'undefined') return;
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  if (document.visibilityState === 'visible') return;
  new Notification(title, { body, icon: icon || '/favicon.ico' });
}
```

---

### File: `src\lib\__tests__\crypto.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import {
  generateKeyPair,
  generateSigningKeyPair,
  importPublicKey,
  deriveSharedKey,
  encrypt,
  decrypt,
  signData,
  verifySignature,
  generateStorageKey,
  exportStorageKey,
  importStorageKey,
  generateId,
} from '../crypto';

describe('generateKeyPair', () => {
  it('should generate ECDH P-256 keys', async () => {
    const keyPair = await generateKeyPair();
    expect(keyPair).toBeDefined();
    expect(keyPair.publicKeyString).toBeDefined();
    expect(typeof keyPair.publicKeyString).toBe('string');
    expect(keyPair.publicKeyString.length).toBeGreaterThan(0);
  });
});

describe('generateSigningKeyPair', () => {
  it('should generate ECDSA P-256 signing keys', async () => {
    const signingPair = await generateSigningKeyPair();
    expect(signingPair).toBeDefined();
    expect(signingPair.verifyKeyString).toBeDefined();
    expect(typeof signingPair.verifyKeyString).toBe('string');
    expect(signingPair.verifyKeyString.length).toBeGreaterThan(0);
  });
});

describe('encrypt/decrypt round trip', () => {
  it('should encrypt and decrypt text', async () => {
    const alice = await generateKeyPair();
    const bob = await generateKeyPair();
    const bobPub = await importPublicKey(bob.publicKeyString);
    const sharedKey = await deriveSharedKey(alice.privateKey, bobPub);

    const plaintext = 'Hello, P2P World!';
    const encrypted = await encrypt(plaintext, sharedKey);
    expect(encrypted).toBeDefined();
    expect(encrypted).not.toBe(plaintext);

    const alicePub = await importPublicKey(alice.publicKeyString);
    const bobSharedKey = await deriveSharedKey(bob.privateKey, alicePub);
    const decrypted = await decrypt(encrypted, bobSharedKey);
    expect(decrypted).toBe(plaintext);
  });

  it('should produce different ciphertexts for same plaintext', async () => {
    const alice = await generateKeyPair();
    const bob = await generateKeyPair();
    const bobPub = await importPublicKey(bob.publicKeyString);
    const sharedKey = await deriveSharedKey(alice.privateKey, bobPub);

    const plaintext = 'Same text';
    const encrypted1 = await encrypt(plaintext, sharedKey);
    const encrypted2 = await encrypt(plaintext, sharedKey);
    expect(encrypted1).not.toBe(encrypted2);
  });
});

describe('sign/verify', () => {
  it('should sign and verify data', async () => {
    const signingPair = await generateSigningKeyPair();
    const data = 'message-to-sign';
    const signature = await signData(data, signingPair.signingKey);
    expect(signature).toBeDefined();
    expect(typeof signature).toBe('string');

    const isValid = await verifySignature(data, signature, signingPair.verifyKeyString);
    expect(isValid).toBe(true);
  });

  it('should reject tampered data', async () => {
    const signingPair = await generateSigningKeyPair();
    const data = 'original-message';
    const signature = await signData(data, signingPair.signingKey);

    const isValid = await verifySignature('tampered-message', signature, signingPair.verifyKeyString);
    expect(isValid).toBe(false);
  });

  it('should reject signature from different key', async () => {
    const alice = await generateSigningKeyPair();
    const bob = await generateSigningKeyPair();
    const data = 'test-message';
    const signature = await signData(data, alice.signingKey);

    const isValid = await verifySignature(data, signature, bob.verifyKeyString);
    expect(isValid).toBe(false);
  });
});

describe('generateId', () => {
  it('should generate a 32-character hex string', () => {
    const id = generateId();
    expect(id).toMatch(/^[0-9a-f]{32}$/);
  });

  it('should generate unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe('storage key', () => {
  it('should generate and export/import storage keys', async () => {
    const key = await generateStorageKey();
    expect(key).toBeDefined();

    const exported = await exportStorageKey(key);
    expect(exported).toBeDefined();
    expect(exported.kty).toBe('oct');

    const imported = await importStorageKey(exported);
    expect(imported).toBeDefined();
  });
});

describe('shared key derivation', () => {
  it('should derive same key from both sides', async () => {
    const alice = await generateKeyPair();
    const bob = await generateKeyPair();

    const bobPub = await importPublicKey(bob.publicKeyString);
    const alicePub = await importPublicKey(alice.publicKeyString);

    const aliceShared = await deriveSharedKey(alice.privateKey, bobPub);
    const bobShared = await deriveSharedKey(bob.privateKey, alicePub);

    const aliceExported = await exportStorageKey(aliceShared);
    const bobExported = await exportStorageKey(bobShared);

    expect(aliceExported.k).toBe(bobExported.k);
  });
});
```

---

### File: `src\lib\__tests__\p2p-network.test.ts`

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('peerjs', () => {
  const mockConn = {
    peer: 'test-peer',
    open: true,
    send: vi.fn(),
    close: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    metadata: {},
  };
  const mockPeer = {
    id: 'test-peer',
    connect: vi.fn(() => mockConn),
    on: vi.fn(),
    destroy: vi.fn(),
    reconnect: vi.fn(),
  };
  return { default: vi.fn(() => mockPeer) };
});

vi.mock('@/lib/storage', () => ({
  setStorageKey: vi.fn(),
  saveIdentity: vi.fn(),
  loadIdentity: vi.fn(() => Promise.resolve(null)),
  saveServer: vi.fn(),
  loadServers: vi.fn(() => Promise.resolve([])),
  deleteServer: vi.fn(),
  saveMessages: vi.fn(),
  loadMessages: vi.fn(() => Promise.resolve([])),
  loadMessagesBefore: vi.fn(() => Promise.resolve([])),
  loadAllMessages: vi.fn(() => Promise.resolve([])),
  loadRecentMessages: vi.fn(() => Promise.resolve([])),
  saveDMConversation: vi.fn(),
  loadDMConversations: vi.fn(() => Promise.resolve([])),
  saveDMMessages: vi.fn(),
  loadDMMessages: vi.fn(() => Promise.resolve([])),
  loadAllDMMessages: vi.fn(() => Promise.resolve([])),
  clearAllData: vi.fn(),
  deleteChannelMessages: vi.fn(),
}));

vi.mock('@/lib/yjs-manager', () => {
  const mockDoc = {
    getText: vi.fn(() => ({ insert: vi.fn(), toJSON: vi.fn(() => '[]') })),
    on: vi.fn(),
  };
  const MockYjsManager = vi.fn(function () {
    return {
      getOrCreateChannelDoc: vi.fn(() => Promise.resolve(mockDoc)),
      getOrCreateDMDoc: vi.fn(() => Promise.resolve(mockDoc)),
      getChannelMessages: vi.fn(() => []),
      getDMMessages: vi.fn(() => []),
      addChannelMessage: vi.fn(),
      addDMMessage: vi.fn(),
      setSyncOutgoingHandler: vi.fn(),
      onChange: vi.fn(),
      sendSyncStep1: vi.fn(),
      handleSyncMessage: vi.fn(),
      channelKey: vi.fn((sId: string, chId: string) => `channel:${sId}:${chId}`),
      destroy: vi.fn(),
    };
  });
  return { YjsManager: MockYjsManager as unknown };
});

import { P2PNetwork } from '../p2p-network';

describe('P2PNetwork', () => {
  let network: P2PNetwork;

  beforeEach(() => {
    vi.clearAllMocks();
    network = new P2PNetwork('testUser');
  });

  describe('constructor', () => {
    it('should create instance with username', () => {
      expect(network).toBeDefined();
      expect(network.getLocalPeer().username).toBe('testUser');
    });

    it('should accept existing peer ID', () => {
      const n = new P2PNetwork('user2', 'existing-id');
      expect(n.getLocalPeer().id).toBe('existing-id');
    });
  });

  describe('compressInvite / decompressInvite', () => {
    it('should compress and decompress invite JSON', async () => {
      const { compressInvite, decompressInvite } = await import('../p2p-network');
      const original = JSON.stringify({ serverId: 'abc', name: 'Test Server' });
      const compressed = await compressInvite(original);
      expect(compressed).toBeDefined();
      expect(typeof compressed).toBe('string');
      const decompressed = await decompressInvite(compressed);
      expect(decompressed).toBe(original);
    });

    it('should produce shorter output for repetitive data', async () => {
      const { compressInvite } = await import('../p2p-network');
      const longJson = JSON.stringify({ data: 'A'.repeat(500) });
      const compressed = await compressInvite(longJson);
      expect(compressed.length).toBeLessThan(longJson.length);
    });
  });

  describe('uint8ArrayToBase64 / base64ToUint8Array', () => {
    it('should convert bytes to base64 and back', async () => {
      const { uint8ArrayToBase64, base64ToUint8Array } = await import('../p2p-network');
      const original = new Uint8Array([72, 101, 108, 108, 111]);
      const base64 = uint8ArrayToBase64(original);
      expect(base64).toBe('SGVsbG8=');
      const result = base64ToUint8Array(base64);
      expect(Array.from(result)).toEqual([72, 101, 108, 108, 111]);
    });
  });

  describe('getConnectionStatus', () => {
    it('should return disconnected when not initialized', () => {
      expect(network.getConnectionStatus()).toBe('disconnected');
    });
  });

  describe('getServers', () => {
    it('should return empty array initially', () => {
      expect(network.getServers()).toEqual([]);
    });
  });

  describe('getOnlinePeers', () => {
    it('should include local peer even when no connections', () => {
      expect(network.getOnlinePeers()).toHaveLength(1);
      expect(network.getOnlinePeers()[0].id).toBe(network.getLocalPeer().id);
    });
  });

  describe('permission checks', () => {
    it('should reject sendMessage when not server member', async () => {
      await expect(
        network.sendMessage('nonexistent-server', 'general', 'hello')
      ).rejects.toThrow('not a member');
    });

    it('should reject generateInvite when not server member', async () => {
      await expect(
        network.generateInvite('nonexistent-server')
      ).rejects.toThrow('not found');
    });
  });

  describe('pending DM queue', () => {
    it('should start with zero pending messages', () => {
      expect(network.getPendingDMCount()).toBe(0);
      expect(network.getPendingDMCount('some-peer')).toBe(0);
    });
  });

  describe('getAvailablePeersForDM', () => {
    it('should return empty array when no servers', () => {
      expect(network.getAvailablePeersForDM()).toEqual([]);
    });
  });

  describe('loadOlderMessages', () => {
    it('should return empty array for nonexistent channel', async () => {
      const msgs = await network.loadOlderMessages('s1', 'c1');
      expect(msgs).toEqual([]);
    });
  });

  describe('disconnect', () => {
    it('should clean up state', async () => {
      await network.disconnect();
      const servers = network.getServers();
      expect(servers).toHaveLength(0);
      expect(network.getOnlinePeers()).toHaveLength(1);
    });
  });
});
```

---

### File: `src\lib\__tests__\storage.test.ts`

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import * as Storage from '../storage';
import { generateStorageKey } from '../crypto';

let storageKey: CryptoKey;

beforeEach(async () => {
  storageKey = await generateStorageKey();
  Storage.setStorageKey(storageKey);
});

afterEach(async () => {
  await Storage.clearAllData();
});

describe('identity', () => {
  it('should save and load identity', async () => {
    const identity = {
      peerId: 'test-peer-123',
      username: 'TestUser',
      publicKey: 'test-public-key',
    };
    await Storage.saveIdentity(identity);
    const loaded = await Storage.loadIdentity();
    expect(loaded).toBeDefined();
    expect(loaded!.peerId).toBe('test-peer-123');
    expect(loaded!.username).toBe('TestUser');
  });

  it('should load the latest identity when multiple exist', async () => {
    await Storage.saveIdentity({ peerId: 'p1', username: 'User1' });
    await Storage.saveIdentity({ peerId: 'p2', username: 'User2' });
    const loaded = await Storage.loadIdentity();
    expect(loaded).toBeDefined();
    expect(loaded!.peerId).toBe('p1');
  });
});

describe('servers', () => {
  const testServer = {
    id: 'server-1',
    name: 'Test Server',
    channels: [{ id: 'general', name: 'general', type: 'text' as const }],
    hostId: 'host-1',
    createdAt: Date.now(),
    inviteCode: 'invite-123',
  };

  it('should save and load servers', async () => {
    await Storage.saveServer(testServer);
    const servers = await Storage.loadServers();
    expect(servers).toHaveLength(1);
    expect(servers[0].name).toBe('Test Server');
  });

  it('should delete a server', async () => {
    await Storage.saveServer(testServer);
    await Storage.deleteServer('server-1');
    const servers = await Storage.loadServers();
    expect(servers).toHaveLength(0);
  });
});

describe('messages', () => {
  it('should save and load messages for a channel', async () => {
    const messages = [
      {
        id: 'msg-1',
        serverId: 'server-1',
        channelId: 'general',
        author: { id: 'user-1', username: 'Alice' },
        content: 'Hello',
        seq: 1 as const,
        timestamp: 1000,
      },
    ];
    await Storage.saveMessages(messages);
    const loaded = await Storage.loadMessages('server-1', 'general');
    expect(loaded).toHaveLength(1);
    expect(loaded[0].content).toBe('Hello');
  });

  it('should load messages sorted by timestamp', async () => {
    const messages = [
      {
        id: 'msg-2', serverId: 's1', channelId: 'c1',
        author: { id: 'u1', username: 'Bob' }, content: 'Second', seq: 2, timestamp: 2000,
      },
      {
        id: 'msg-1', serverId: 's1', channelId: 'c1',
        author: { id: 'u1', username: 'Bob' }, content: 'First', seq: 1, timestamp: 1000,
      },
    ];
    await Storage.saveMessages(messages);
    const loaded = await Storage.loadMessages('s1', 'c1');
    expect(loaded[0].content).toBe('First');
    expect(loaded[1].content).toBe('Second');
  });

  it('should load recent messages', async () => {
    const messages = Array.from({ length: 10 }, (_, i) => ({
      id: `msg-${i}`, serverId: 's1', channelId: 'c1',
      author: { id: 'u1', username: 'U' }, content: `Msg ${i}`, seq: i as const, timestamp: i * 1000,
    }));
    await Storage.saveMessages(messages);
    const recent = await Storage.loadRecentMessages('s1', 'c1', 3);
    expect(recent).toHaveLength(3);
    expect(recent[0].content).toBe('Msg 7');
    expect(recent[2].content).toBe('Msg 9');
  });

  it('should delete channel messages', async () => {
    await Storage.saveMessages([{
      id: 'm1', serverId: 's1', channelId: 'c1',
      author: { id: 'u1', username: 'U' }, content: 'x', seq: 1, timestamp: 1,
    }]);
    await Storage.deleteChannelMessages('s1', 'c1');
    const loaded = await Storage.loadMessages('s1', 'c1');
    expect(loaded).toHaveLength(0);
  });
});

describe('DM conversations', () => {
  it('should save and load DM conversations', async () => {
    await Storage.saveDMConversation({
      peerId: 'peer-1',
      peerUsername: 'Charlie',
      lastSeen: Date.now(),
    });
    const convs = await Storage.loadDMConversations();
    expect(convs).toHaveLength(1);
    expect(convs[0].peerUsername).toBe('Charlie');
  });
});

describe('DM messages', () => {
  it('should save and load encrypted DM messages', async () => {
    const dms = [
      {
        id: 'dm-1', type: 'DM' as const,
        from: { id: 'alice', username: 'Alice' },
        to: { id: 'bob', username: 'Bob' },
        content: 'Secret message',
        timestamp: Date.now(),
        encrypted: false,
      },
    ];
    await Storage.saveDMMessages(dms, 'alice');
    const loaded = await Storage.loadDMMessages('bob');
    expect(loaded).toHaveLength(1);
    expect(loaded[0].from.id).toBe('alice');
    // Content decrypts transparently on load
    expect(loaded[0].content).toBe('Secret message');
  });
});

describe('clearAllData', () => {
  it('should clear all stored data', async () => {
    await Storage.saveIdentity({ peerId: 'p1', username: 'U' });
    await Storage.saveServer({
      id: 's1', name: 'S', channels: [], hostId: 'h1', createdAt: 1,
    });
    await Storage.clearAllData();
    const identity = await Storage.loadIdentity();
    const servers = await Storage.loadServers();
    expect(identity).toBeNull();
    expect(servers).toHaveLength(0);
  });
});
```

---

### File: `src\lib\crypto.ts`

```ts
// End-to-end encryption utilities using Web Crypto API

export interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  publicKeyString: string;
}

export async function generateKeyPair(): Promise<KeyPair> {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    ['deriveKey', 'deriveBits']
  );

  const publicKeyBuffer = await window.crypto.subtle.exportKey('raw', keyPair.publicKey);
  const publicKeyString = btoa(String.fromCharCode(...new Uint8Array(publicKeyBuffer)));

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
    publicKeyString,
  };
}

export async function generateSigningKeyPair(): Promise<{
  signingKey: CryptoKey;
  verifyKey: CryptoKey;
  verifyKeyString: string;
}> {
  const keyPair = await window.crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  );
  const verifyKeyBuffer = await window.crypto.subtle.exportKey('raw', keyPair.publicKey);
  const verifyKeyString = btoa(String.fromCharCode(...new Uint8Array(verifyKeyBuffer)));
  return { signingKey: keyPair.privateKey, verifyKey: keyPair.publicKey, verifyKeyString };
}

export async function importPublicKey(publicKeyString: string): Promise<CryptoKey> {
  const binaryString = atob(publicKeyString);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return window.crypto.subtle.importKey(
    'raw',
    bytes,
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    []
  );
}

const HKDF_SALT = new Uint8Array(32);
const HKDF_INFO = new TextEncoder().encode('local-echo-key-v1');

export async function deriveSharedKey(
  privateKey: CryptoKey,
  publicKey: CryptoKey
): Promise<CryptoKey> {
  // Step 1: Compute raw ECDH shared secret
  const sharedBits = await window.crypto.subtle.deriveBits(
    { name: 'ECDH', public: publicKey },
    privateKey,
    256
  );

  // Step 2: Import as HKDF key material
  const hkdfKey = await window.crypto.subtle.importKey(
    'raw',
    sharedBits,
    { name: 'HKDF' },
    false,
    ['deriveKey']
  );

  // Step 3: Derive AES-256-GCM key via HKDF-SHA256 (NIST SP 800-56C)
  return window.crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: HKDF_SALT,
      info: HKDF_INFO,
    },
    hkdfKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function signData(data: string, signingKey: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const sig = await window.crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    signingKey,
    encoder.encode(data)
  );
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

export async function verifySignature(
  data: string,
  signature: string,
  verifyKeyString: string
): Promise<boolean> {
  try {
    const keyBytes = Uint8Array.from(atob(verifyKeyString), c => c.charCodeAt(0));
    const verifyKey = await window.crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['verify']
    );
    const sigBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
    const encoder = new TextEncoder();
    return await window.crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      verifyKey,
      sigBytes,
      encoder.encode(data)
    );
  } catch {
    return false;
  }
}

export async function encrypt(data: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encoder.encode(data)
  );

  const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encryptedBuffer), iv.length);

  return btoa(String.fromCharCode(...combined));
}

export async function decrypt(encryptedData: string, key: CryptoKey): Promise<string> {
  const binaryString = atob(encryptedData);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const iv = bytes.slice(0, 12);
  const data = bytes.slice(12);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    data
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

export async function generateStorageKey(): Promise<CryptoKey> {
  return window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function exportStorageKey(key: CryptoKey): Promise<JsonWebKey> {
  return window.crypto.subtle.exportKey('jwk', key);
}

export async function importStorageKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return window.crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export function generateId(): string {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
```

---

### File: `src\lib\logger.ts`

```ts
const DEBUG = typeof window !== 'undefined' && (
  localStorage.getItem('local-echo-debug') !== null ||
  new URLSearchParams(window.location.search).has('debug')
);

export const logger = {
  log: (...args: unknown[]) => {
    if (DEBUG) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (DEBUG) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    console.error(...args);
  },
};
```

---

### File: `src\lib\p2p-network.ts`

```ts
// P2P Network Manager - PeerJS-based WebRTC implementation
// PeerJS handles signaling automatically via its open-source signaling server.
// All actual data flows peer-to-peer through WebRTC DataChannels.

import Peer, { DataConnection } from 'peerjs';
import { 
  PeerId, 
  Message, 
  Server, 

  P2PEvent, 
  ConnectionStatus,
  DirectMessage,
  DMConversation,
  ChannelOp,
} from '@/types/p2p';
import { generateId, generateKeyPair, generateSigningKeyPair, deriveSharedKey, encrypt, decrypt, importPublicKey, signData, verifySignature, KeyPair, generateStorageKey, exportStorageKey, importStorageKey } from './crypto';
import * as Storage from './storage';
import { createDefaultCommunityConfig } from '@/lib/templates';
import { getTemplateChannels } from '@/types/community';
import type { CommunityConfig, CommunityConfigPatch, CreateCommunityInput } from '@/types/community';
import { logger } from './logger';
import { YjsManager } from './yjs-manager';
import type { YjsSyncMessage } from './yjs-manager';

type EventCallback = (event: P2PEvent) => void;
type ServerUpdatePatch = { name?: string; icon?: string; channelOps?: ChannelOp[]; configPatch?: CommunityConfigPatch };
type CoreServer = Omit<Server, 'config'>;

interface SyncRequestPayload {
  peerInfo?: PeerId;
}

interface SyncResponsePayload {
  servers: CoreServer[];
  messages: Record<string, Message[]>;
  sequenceNumber: number;
  onlinePeers: PeerId[];
}

interface ChunkFrame {
  _chunkId: string;
  _index: number;
  _total: number;
  _data: string;
}

type PeerJsDataConnectionWithChannel = DataConnection & {
  _dc?: RTCDataChannel;
  dataChannel?: RTCDataChannel;
};

interface PeerEntry {
  peerId: PeerId;
  conn: DataConnection;
  status: 'online' | 'offline';
  lastSeen: number;
}

export interface P2PNetworkOptions {
  signalingHost?: string;
  signalingPort?: number;
  signalingSecure?: boolean;
  signalingPath?: string;
  iceServers?: RTCIceServer[];
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out (${ms}ms)`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer!));
}

export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function compressInvite(json: string): Promise<string> {
  const encoder = new TextEncoder();
  const inputBytes = encoder.encode(json);
  const cs = new CompressionStream('gzip');
  const writer = cs.writable.getWriter();
  await writer.write(inputBytes);
  await writer.close();
  const reader = cs.readable.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const total = chunks.reduce((s, c) => s + c.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return uint8ArrayToBase64(result);
}

export async function decompressInvite(base64: string): Promise<string> {
  const compressed = base64ToUint8Array(base64);
  const ds = new DecompressionStream('gzip');
  const writer = ds.writable.getWriter();
  await writer.write(compressed);
  await writer.close();
  const reader = ds.readable.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const total = chunks.reduce((s, c) => s + c.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return new TextDecoder().decode(result);
}

export class P2PNetwork {
  private localPeer: PeerId;
  private keyPair: KeyPair | null = null;
  private signingKeyPair: { signingKey: CryptoKey; verifyKey: CryptoKey; verifyKeyString: string } | null = null;
  private storageKey: CryptoKey | null = null;
  private sharedKeys: Map<string, CryptoKey> = new Map();
  private peer: Peer | null = null;
  private connections: Map<string, PeerEntry> = new Map();
  private servers: Map<string, Server> = new Map();
  private messages: Map<string, Message[]> = new Map();
  private yjs: YjsManager;
  private eventListeners: Set<EventCallback> = new Set();
  private isHost: boolean = false;
  private hostId: string | null = null;
  private hostConn: DataConnection | null = null;
  private bulkConnections: Map<string, DataConnection> = new Map();
  private bulkHostConn: DataConnection | null = null;
  private messageSeq = 0;
  private readonly CHUNK_SIZE = 12_000;
  private chunkBuffers: Map<string, Map<string, Array<string | null>>> = new Map();
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  // DM state
  private dmConversations: Map<string, DMConversation> = new Map();
  private pendingDMMessages: Map<string, DirectMessage[]> = new Map();
  
  // Persistence flags
  private persistenceReady: boolean = false;
  private pendingSaves: Set<string> = new Set();
  private saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  // Options
  private options: P2PNetworkOptions;

  // Reconnection state
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 10;

  constructor(username: string, existingId?: string, options: P2PNetworkOptions = {}) {
    this.localPeer = {
      id: existingId || generateId(),
      username,
    };
    this.options = options;
    this.yjs = new YjsManager(this.localPeer.id);
  }

  async initialize(): Promise<void> {
    this.keyPair = await generateKeyPair();
    this.localPeer.publicKey = this.keyPair.publicKeyString;
    this.signingKeyPair = await generateSigningKeyPair();
    this.localPeer.verifyKey = this.signingKeyPair.verifyKeyString;

    // Generate an AES-GCM storage key for at-rest DM encryption
    this.storageKey = await generateStorageKey();
    Storage.setStorageKey(this.storageKey);

    return new Promise((resolve, reject) => {
      // Use the local peer id as PeerJS id for addressability
      const peerOptions: Record<string, unknown> = { debug: 1 };
      if (this.options.signalingHost) {
        peerOptions.host = this.options.signalingHost;
      }
      if (this.options.signalingPort !== undefined) {
        peerOptions.port = this.options.signalingPort;
      }
      if (this.options.signalingSecure !== undefined) {
        peerOptions.secure = this.options.signalingSecure;
      }
      if (this.options.signalingPath) {
        peerOptions.path = this.options.signalingPath;
      }
      if (this.options.iceServers) {
        peerOptions.config = { iceServers: this.options.iceServers };
      }
      this.peer = new Peer(this.localPeer.id, peerOptions);

      const timeout = setTimeout(() => reject(new Error('PeerJS initialization timeout')), 15000);

      this.peer.on('open', (id) => {
        clearTimeout(timeout);
        this.reconnectAttempts = 0;
        logger.log('[P2P] PeerJS ready with ID:', id);
        resolve();
      });

      this.peer.on('connection', (conn) => {
        logger.log('[P2P] Incoming connection from:', conn.peer);
        this.handleIncomingConnection(conn);
      });

      this.peer.on('call', (call) => {
        logger.log('[P2P] Incoming voice call from:', call.peer);
        if (this.localStream) {
          call.answer(this.localStream);
          this.voiceConnections.set(call.peer, call);
          call.on('stream', () => {});
          call.on('close', () => this.voiceConnections.delete(call.peer));
          call.on('error', (err) => logger.error('[P2P Voice] Incoming call error:', err));
        } else {
          call.close();
        }
      });

      this.peer.on('error', (err) => {
        logger.error('[P2P] PeerJS error:', err);
        this.emitEvent({
          type: 'error',
          payload: { message: 'Signaling server error: ' + (err.message || 'Unknown error'), level: 'error' },
          timestamp: Date.now(),
        });
      });

      this.peer.on('disconnected', () => {
        const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);
        if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
          logger.log(`[P2P] Disconnected, reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.MAX_RECONNECT_ATTEMPTS})...`);
          setTimeout(() => {
            this.reconnectAttempts++;
            this.peer?.reconnect();
          }, delay);
        } else {
          logger.error('[P2P] Max reconnection attempts reached');
          this.emitEvent({
            type: 'error',
            payload: { message: 'Could not reconnect to signaling server after multiple attempts.', level: 'error' },
            timestamp: Date.now(),
          });
        }
      });

      this.heartbeatInterval = setInterval(() => this.sendHeartbeats(), 15_000);

      // Wire Yjs sync to network layer
      this.yjs.setSyncOutgoingHandler((msg) => this.handleYjsSyncOutgoing(msg));
      this.yjs.onChange((channelKey) => {
        if (channelKey.startsWith('channel:')) this.syncCacheFromYjs(channelKey);
        if (channelKey.startsWith('dm:')) this.syncCacheFromYjsDM(channelKey);
      });
    });
  }

  getLocalPeer(): PeerId { return this.localPeer; }
  isHostPeer(): boolean { return this.isHost; }

  getConnectionStatus(): ConnectionStatus {
    if (this.isHost) return 'host';
    if (this.connections.size > 0) return 'connected';
    return 'disconnected';
  }

  // ==================== SERVER MANAGEMENT ====================

  async createServer(input: string | CreateCommunityInput): Promise<Server> {
    const createInput: CreateCommunityInput = typeof input === 'string'
      ? {
          name: input,
          tags: [],
          visibility: 'private',
          template: 'custom',
          region: 'auto',
          language: 'en',
          onboardingTemplate: 'none',
          aiSetupEnabled: false,
        }
      : input;
    const channels = getTemplateChannels(createInput.template);
    const server: Server = {
      id: generateId(),
      name: createInput.name,
      icon: createInput.icon,
      config: createDefaultCommunityConfig(createInput, this.localPeer.id),
      channels,
      members: [this.localPeer],
      hostId: this.localPeer.id,
      createdAt: Date.now(),
    };

    this.servers.set(server.id, server);
    this.isHost = true;
    this.hostId = this.localPeer.id;

    server.channels.forEach(ch => {
      const key = `${server.id}:${ch.id}`;
      this.messages.set(key, []);
      this.yjs.getOrCreateChannelDoc(server.id, ch.id);
    });

    logger.log('[P2P] Created server:', server.name, '| Host peer ID:', this.localPeer.id);
    this.scheduleSave('servers');
    return server;
  }

  // ==================== SERVER CUSTOMIZATION (host only) ====================
  // Updates flow: host edits locally → broadcasts `server-updated` → peers
  // apply the same patch to their local server object → emit event for UI.

  isServerHost(serverId: string): boolean {
    const s = this.servers.get(serverId);
    return !!s && s.hostId === this.localPeer.id;
  }

  private applyServerPatch(server: Server, patch: Partial<Server> & { _channelOps?: ChannelOp[]; _configPatch?: CommunityConfigPatch }): void {
    if (typeof patch.name === 'string') server.name = patch.name;
    if (typeof patch.icon === 'string') server.icon = patch.icon;
    if (patch._configPatch) {
      server.config = this.applyCommunityConfigPatch(server.config, patch._configPatch, server);
      server.icon = server.config.branding.icon || server.icon;
    }
    const ops = patch._channelOps || [];
    for (const op of ops) {
      if (op.kind === 'add') {
        if (!server.channels.find(c => c.id === op.channel.id)) {
          server.channels.push(op.channel);
          const key = `${server.id}:${op.channel.id}`;
          this.messages.set(key, []);
          this.yjs.getOrCreateChannelDoc(server.id, op.channel.id);
        }
      } else if (op.kind === 'rename') {
        const ch = server.channels.find(c => c.id === op.channelId);
        if (ch) {
          ch.name = op.name;
          if (typeof op.description === 'string') ch.description = op.description;
        }
      } else if (op.kind === 'delete') {
        server.channels = server.channels.filter(c => c.id !== op.channelId);
        this.messages.delete(`${server.id}:${op.channelId}`);
      }
    }
  }

  private applyCommunityConfigPatch(
    current: Server['config'],
    patch: CommunityConfigPatch,
    server?: Server
  ): NonNullable<Server['config']> {
    const fallbackInput: CreateCommunityInput = {
      name: server?.name || 'Community',
      tags: [],
      visibility: 'private',
      template: 'custom',
      region: 'auto',
      language: 'en',
      onboardingTemplate: 'none',
      aiSetupEnabled: false,
    };
    const base = current || createDefaultCommunityConfig(fallbackInput, this.localPeer.id);
    const next = {
      ...base,
      branding: { ...base.branding, ...patch.branding },
      discovery: { ...base.discovery, ...patch.discovery },
      invites: { ...base.invites, ...patch.invites },
      onboarding: { ...base.onboarding, ...patch.onboarding },
      moderation: { ...base.moderation, ...patch.moderation },
      analytics: { ...base.analytics, ...patch.analytics },
      integrations: { ...base.integrations, ...patch.integrations },
      monetization: { ...base.monetization, ...patch.monetization },
      backups: { ...base.backups, ...patch.backups },
      roles: patch.roles || base.roles,
      permissionOverwrites: patch.permissionOverwrites || base.permissionOverwrites,
      automodRules: patch.automodRules || base.automodRules,
      automations: patch.automations || base.automations,
      auditLog: patch.auditLogEntry ? [patch.auditLogEntry, ...base.auditLog].slice(0, 250) : base.auditLog,
      version: base.version + 1,
    };
    return next;
  }

  async updateServer(
    serverId: string,
    patch: ServerUpdatePatch
  ): Promise<Server> {
    const server = this.servers.get(serverId);
    if (!server) throw new Error('Server not found');
    if (server.hostId !== this.localPeer.id) {
      throw new Error('Only the server host can edit this server');
    }

    const fullPatch = {
      name: patch.name,
      icon: patch.icon,
      _channelOps: patch.channelOps || [],
      _configPatch: patch.configPatch,
    };
    this.applyServerPatch(server, fullPatch);
    this.servers.set(server.id, server);
    this.scheduleSave('servers');

    this.broadcast({
      type: 'server-updated',
      payload: { serverId: server.id, patch: fullPatch },
      timestamp: Date.now(),
    });
    this.emitEvent({
      type: 'server-updated',
      payload: { serverId: server.id },
      timestamp: Date.now(),
    });
    return server;
  }

  async deleteServerAsHost(serverId: string): Promise<void> {
    const server = this.servers.get(serverId);
    if (!server) return;
    if (server.hostId !== this.localPeer.id) {
      throw new Error('Only the host can delete this server');
    }
    this.broadcast({
      type: 'server-deleted',
      payload: { serverId },
      timestamp: Date.now(),
    });
    await this.removeServerLocal(serverId);
  }

  async leaveServer(serverId: string): Promise<void> {
    // Local-only removal; if we're the host, treat as delete (broadcast tear-down).
    const server = this.servers.get(serverId);
    if (!server) return;
    if (server.hostId === this.localPeer.id) {
      await this.deleteServerAsHost(serverId);
      return;
    }
    await this.removeServerLocal(serverId);
  }

  private async removeServerLocal(serverId: string): Promise<void> {
    const server = this.servers.get(serverId);
    if (!server) return;
    // Drop messages for all channels
    for (const ch of server.channels) {
      this.messages.delete(`${serverId}:${ch.id}`);
      try { await Storage.deleteChannelMessages(serverId, ch.id); } catch { /* storage may already be cleared */ }
    }
    this.servers.delete(serverId);
    try { await Storage.deleteServer(serverId); } catch { /* storage may already be cleared */ }
    // Optionally close the host conn if we joined this server
    this.emitEvent({
      type: 'server-deleted',
      payload: { serverId },
      timestamp: Date.now(),
    });
  }

  // Invite code encodes the host's PeerJS ID + server info
  async generateInvite(serverId: string): Promise<string> {
    const server = this.servers.get(serverId);
    if (!server) throw new Error('Server not found');
    if (!this.hasPermission(serverId, this.localPeer.id, 'create_invites')) {
      throw new Error('You do not have permission to create invites for this server.');
    }

    const payload = {
      serverId: server.id,
      serverName: server.name,
      hostPeerId: this.localPeer.id,
      hostUsername: this.localPeer.username,
      hostVerifyKey: this.signingKeyPair?.verifyKeyString,
      timestamp: Date.now(),
    };
    const payloadStr = JSON.stringify(payload);
    const signature = this.signingKeyPair
      ? await signData(payloadStr, this.signingKeyPair.signingKey)
      : '';
    const json = JSON.stringify({ payload, signature });
    try {
      return await withTimeout(compressInvite(json), 3000, 'compressInvite');
    } catch (err) {
      console.error('[P2P] compressInvite failed, falling back to base64:', err);
      return btoa(json);
    }
  }

  // Join server by connecting to the host's PeerJS ID
  async joinServer(inviteCode: string): Promise<Server> {
    let parsedInvite: Record<string, unknown>;
    try {
      const decompressed = await withTimeout(decompressInvite(inviteCode), 3000, 'decompressInvite');
      parsedInvite = JSON.parse(decompressed);
    } catch (err) {
      console.error('[P2P] decompressInvite failed, falling back to atob:', err);
      parsedInvite = JSON.parse(atob(inviteCode));
    }
    const invite = parsedInvite.payload ?? parsedInvite;
    const signature = parsedInvite.signature;
    if (invite.hostVerifyKey && signature) {
      const valid = await verifySignature(JSON.stringify(invite), signature, invite.hostVerifyKey);
      if (!valid) {
        throw new Error('Invite code has an invalid signature — it may have been tampered with.');
      }
    }
    logger.log('[P2P] Joining server:', invite.serverName, 'via host:', invite.hostPeerId);

    if (!this.peer) throw new Error('Not initialized');

    const hostPeer: PeerId = {
      id: invite.hostPeerId,
      username: invite.hostUsername || 'Host',
    };

    // Connect to host
    const conn = this.peer.connect(invite.hostPeerId, {
      reliable: true,
      metadata: {
        type: 'server-join',
        serverId: invite.serverId,
        peerInfo: this.localPeer,
      },
    });

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Connection timeout')), 20000);

      conn.on('open', () => {
        clearTimeout(timeout);
        logger.log('[P2P] Connected to host (RT):', invite.hostPeerId);

        this.hostConn = conn;
        this.hostId = invite.hostPeerId;
        this.isHost = false;

        this.connections.set(invite.hostPeerId, {
          peerId: hostPeer,
          conn,
          status: 'online',
          lastSeen: Date.now(),
        });

        // Set up data handling on RT channel
        this.setupConnectionHandlers(conn, invite.hostPeerId, false);

        // Create local server representation
        const server: Server = {
          id: invite.serverId,
          name: invite.serverName,
          channels: [],
          members: [hostPeer, this.localPeer],
          hostId: invite.hostPeerId,
          createdAt: invite.timestamp,
        };

        this.servers.set(server.id, server);

        // Establish a second DataChannel for bulk traffic (sync, history, config)
        const bulkConn = this.peer!.connect(invite.hostPeerId, {
          reliable: true,
          metadata: {
            type: 'server-join',
            channelType: 'bulk',
            serverId: invite.serverId,
            peerInfo: this.localPeer,
          },
        });

        let bulkReady = false;
        let syncSent = false;

        const proceed = () => {
          if (!bulkReady || syncSent) return;
          syncSent = true;

          // Request sync from host (over RT — small, needs to go immediately)
          this.sendToConnection(conn, {
            type: 'sync-request',
            payload: { peerInfo: this.localPeer },
            timestamp: Date.now(),
          });

          // Initiate Yjs sync for each channel
          server.channels.forEach(ch => {
            const channelKey = this.yjs.channelKey(server.id, ch.id);
            this.yjs.getOrCreateChannelDoc(server.id, ch.id);
            this.yjs.sendSyncStep1(channelKey);
          });

          this.emitEvent({ type: 'peer-joined', payload: hostPeer, timestamp: Date.now() });
          server.inviteCode = inviteCode;
          this.servers.set(server.id, server);
          this.scheduleSave('servers');
          resolve(server);
        };

        bulkConn.on('open', () => {
          logger.log('[P2P] Connected to host (Bulk):', invite.hostPeerId);
          this.bulkHostConn = bulkConn;
          this.bulkConnections.set(invite.hostPeerId, bulkConn);
          this.setupConnectionHandlers(bulkConn, invite.hostPeerId, true);
          bulkReady = true;
          proceed();
        });

        bulkConn.on('error', (err) => {
          logger.warn('[P2P] Bulk connection failed, proceeding with RT only:', err);
          bulkReady = true;
          proceed();
        });

        // Fallback: if bulk never opens within 5s, proceed with RT only
        setTimeout(() => {
          if (!bulkReady) {
            logger.warn('[P2P] Bulk connection timeout, proceeding with RT only');
            bulkReady = true;
            proceed();
          }
        }, 5000);
      });

      conn.on('error', (err) => {
        clearTimeout(timeout);
        logger.error('[P2P] Connection error:', err);
        reject(err);
      });
    });
  }

  // ==================== CONNECTION HANDLING ====================

  private handleIncomingConnection(conn: DataConnection): void {
    conn.on('open', () => {
      const metadata = conn.metadata;
      const channelType = metadata?.channelType;

      if (channelType === 'bulk') {
        logger.log('[P2P] Bulk connection opened from:', conn.peer);
        this.bulkConnections.set(conn.peer, conn);
        this.setupConnectionHandlers(conn, conn.peer, true);
        return;
      }

      const peerInfo: PeerId = metadata?.peerInfo || { id: conn.peer, username: 'Unknown' };
      
      logger.log('[P2P] Connection opened from:', peerInfo.username, '(', conn.peer, ')');

      this.connections.set(conn.peer, {
        peerId: peerInfo,
        conn,
        status: 'online',
        lastSeen: Date.now(),
      });

      this.setupConnectionHandlers(conn, conn.peer, false);
      this.flushPendingDMs(conn.peer);

      // Add to all servers as member
      if (this.isHost) {
        this.servers.forEach(server => {
          if (!server.members.find(m => m.id === peerInfo.id)) {
            server.members.push(peerInfo);
          }
        });

        // Notify all other peers about the new member
        this.broadcast({
          type: 'peer-joined',
          payload: peerInfo,
          timestamp: Date.now(),
        }, conn.peer);

        // Send peer list to new member
        const peerList = Array.from(this.connections.entries())
          .filter(([id]) => id !== conn.peer)
          .map(([_, entry]) => entry.peerId);
        
        this.sendToConnection(conn, {
          type: 'peer-list',
          payload: { peers: [this.localPeer, ...peerList] },
          timestamp: Date.now(),
        });
      }

      this.emitEvent({ type: 'peer-joined', payload: peerInfo, timestamp: Date.now() });

      // Initiate Yjs sync for each shared channel
      if (this.isHost) {
        this.servers.forEach(server => {
          if (!server.members.find(m => m.id === peerInfo.id)) return;
          server.channels.forEach(ch => {
            const channelKey = this.yjs.channelKey(server.id, ch.id);
            this.yjs.getOrCreateChannelDoc(server.id, ch.id);
            const target = this.bulkConnections.get(conn.peer)?.open
              ? this.bulkConnections.get(conn.peer)!
              : conn;
            this.sendToConnection(target, {
              type: 'yjs-sync',
              payload: { channelKey, step: 1, data: '' },
              timestamp: Date.now(),
            });
          });
        });
      }
    });
  }

  private setupConnectionHandlers(conn: DataConnection, remotePeerId: string, isBulk: boolean = false): void {
    conn.on('data', async (data: unknown) => {
      try {
        const raw = typeof data === 'string' ? data : JSON.stringify(data);
        const assembled = this.receiveChunk(remotePeerId, raw);
        if (!assembled) return;

        if (!isBulk) {
          const entry = this.connections.get(remotePeerId);
          if (entry) entry.lastSeen = Date.now();
        }

        const event = JSON.parse(assembled) as P2PEvent;
        await this.handleEvent(remotePeerId, event);
      } catch (err) {
        logger.error('[P2P] Error handling data:', err);
      }
    });

    conn.on('close', () => {
      this.chunkBuffers.delete(remotePeerId);
      if (isBulk) {
        logger.log('[P2P] Bulk connection closed:', remotePeerId);
        this.bulkConnections.delete(remotePeerId);
        return;
      }
      logger.log('[P2P] Connection closed:', remotePeerId);
      const entry = this.connections.get(remotePeerId);
      if (entry) {
        entry.status = 'offline';
        this.emitEvent({ type: 'peer-left', payload: entry.peerId, timestamp: Date.now() });
      }
      this.connections.delete(remotePeerId);

      // Host migration if the host left
      if (remotePeerId === this.hostId && !this.isHost) {
        this.emitEvent({
          type: 'error',
          payload: { message: 'Host disconnected. Migrating to new host...', level: 'warn' },
          timestamp: Date.now(),
        });
        this.initiateHostMigration();
      }
    });

    conn.on('error', (err) => {
      logger.error('[P2P] Connection error with', remotePeerId, ':', err);
      this.emitEvent({
        type: 'error',
        payload: { message: `Connection lost with ${remotePeerId.slice(0, 8)}...`, level: 'warn' },
        timestamp: Date.now(),
      });
    });
  }

  // ==================== EVENT HANDLING ====================

  private async handleEvent(fromPeerId: string, event: P2PEvent): Promise<void> {
    logger.log('[P2P] Event from', fromPeerId, ':', event.type);

    switch (event.type) {
      case 'message':
        this.handleChatMessage(event.payload as Message, fromPeerId);
        break;
      case 'sync-request':
        this.handleSyncRequest(fromPeerId, event.payload as SyncRequestPayload);
        break;
      case 'sync-response':
        await this.handleSyncResponse(event.payload as SyncResponsePayload);
        break;
      case 'peer-joined':
      case 'peer-left':
      case 'host-changed':
        this.emitEvent(event);
        break;
      case 'dm-message':
        await this.handleDMMessage(event.payload as DirectMessage, fromPeerId);
        break;
      case 'dm-typing':
        this.handleDMTyping(event.payload.peerId || fromPeerId, event.payload.isTyping);
        break;
      case 'dm-read':
        this.emitEvent(event);
        break;
      case 'server-updated': {
        const { serverId, patch } = event.payload || {};
        const server = this.servers.get(serverId);
        if (server && patch) {
          this.applyServerPatch(server, patch);
          this.servers.set(serverId, server);
          this.scheduleSave('servers');
          this.emitEvent({ type: 'server-updated', payload: { serverId }, timestamp: Date.now() });
        }
        break;
      }
      case 'server-deleted': {
        const { serverId } = event.payload || {};
        if (serverId) {
          // Fire and forget — local cleanup
          this.removeServerLocal(serverId);
        }
        break;
      }
      case 'config-sync': {
        const { serverId, config } = event.payload as { serverId: string; config: CommunityConfig };
        const server = this.servers.get(serverId);
        if (server && config) {
          const incomingVersion = config.version ?? 0;
          const existingVersion = server.config?.version ?? 0;
          if (incomingVersion >= existingVersion) {
            server.config = config;
            this.servers.set(serverId, server);
            this.scheduleSave('servers');
            this.emitEvent({
              type: 'server-updated',
              payload: { serverId },
              timestamp: Date.now(),
            });
          }
        }
        break;
      }
      case 'peer-list': {
        const peers = (event.payload as { peers?: PeerId[] }).peers;
        peers?.forEach(p => {
          if (p.id !== this.localPeer.id) {
            this.servers.forEach(server => {
              if (!server.members.find(m => m.id === p.id)) {
                server.members.push(p);
              }
            });
          }
        });
        this.emitEvent({ type: 'peer-joined', payload: peers, timestamp: Date.now() });
        break;
      }
      case 'ping': {
        const entry = this.connections.get(fromPeerId);
        if (entry) entry.lastSeen = Date.now();
        const conn = this.connections.get(fromPeerId)?.conn;
        if (conn) this.sendToConnection(conn, { type: 'pong', payload: null, timestamp: Date.now() });
        break;
      }
      case 'pong': {
        const entry = this.connections.get(fromPeerId);
        if (entry) entry.lastSeen = Date.now();
        break;
      }
      case 'yjs-sync':
      case 'yjs-update': {
        this.handleYjsEvent(event, fromPeerId);
        break;
      }
    }
  }

  private handleYjsEvent(event: P2PEvent, fromPeerId: string): void {
    const payload = event.payload as { channelKey: string; step?: number; data: string };
    if (!payload?.channelKey || !payload?.data) return;
    const msg: YjsSyncMessage =
      event.type === 'yjs-sync'
        ? (payload.step === 1
            ? { type: 'yjs-sync-step1', channelKey: payload.channelKey, sv: payload.data }
            : { type: 'yjs-sync-step2', channelKey: payload.channelKey, update: payload.data })
        : { type: 'yjs-update', channelKey: payload.channelKey, update: payload.data };
    this.yjs.handleSyncMessage(msg, fromPeerId);
  }

  private handleYjsSyncOutgoing(msg: YjsSyncMessage, targetPeerId?: string): void {
    const payload = msg.type === 'yjs-sync-step1'
      ? { channelKey: msg.channelKey, step: 1, data: msg.sv }
      : { channelKey: msg.channelKey, data: msg.update };
    const baseEvent: P2PEvent = {
      type: msg.type === 'yjs-update' ? 'yjs-update' : 'yjs-sync',
      payload,
      timestamp: Date.now(),
    };

    // DM channel keys are "dm:{peerA}:{peerB}" — route updates
    // to the DM peer (not broadcast to all connections)
    if (msg.channelKey.startsWith('dm:')) {
      const parts = msg.channelKey.split(':');
      const remotePeerId = parts[1] === this.localPeer.id ? parts[2] : parts[1];
      // Try direct connection, then fall back to host relay
      const entry = this.connections.get(remotePeerId);
      if (entry?.conn?.open) {
        this.sendToConnection(entry.conn, baseEvent);
      } else if (targetPeerId) {
        const target = this.connections.get(targetPeerId);
        if (target?.conn?.open) this.sendToConnection(target.conn, baseEvent);
      }
      return;
    }

    if (targetPeerId) {
      const entry = this.connections.get(targetPeerId);
      if (entry?.conn?.open) this.sendToConnection(entry.conn, baseEvent);
      return;
    }

    // Channel yjs-update broadcasts to all
    if (msg.type === 'yjs-update') {
      this.broadcast(baseEvent);
    }
  }

  private syncCacheFromYjs(channelKey: string): void {
    if (!channelKey.startsWith('channel:')) return;
    const parts = channelKey.split(':');
    if (parts.length < 3) return;
    const serverId = parts[1];
    const channelId = parts[2];
    // Re-read messages from Yjs doc into the display cache
    this.yjs.getOrCreateChannelDoc(serverId, channelId).then(doc => {
      if (!doc) return;
      const msgs = this.yjs.getChannelMessages(doc);
      msgs.forEach(m => {
        m.serverId = serverId;
        m.channelId = channelId;
      });
      this.messages.set(`${serverId}:${channelId}`, msgs);
      // Emit the latest message for UI update
      const latest = msgs[msgs.length - 1];
      if (latest) {
        this.emitEvent({ type: 'message', payload: latest, timestamp: Date.now() });
      }
    });
  }

  private syncCacheFromYjsDM(channelKey: string): void {
    if (!channelKey.startsWith('dm:')) return;
    const parts = channelKey.split(':');
    if (parts.length < 3) return;
    const remoteId = parts[1] === this.localPeer.id ? parts[2] : parts[1];
    this.yjs.getOrCreateDMDoc(remoteId).then(doc => {
      if (!doc) return;
      const msgs = this.yjs.getDMMessages(doc);
      const conv = this.getOrCreateDMConversation({
        id: remoteId,
        username: this.dmConversations.get(remoteId)?.peerId.username || `peer-${remoteId.slice(0, 6)}`,
      });
      // Merge without duplicates
      const existingIds = new Set(conv.messages.map(m => m.id));
      for (const dm of msgs) {
        if (!existingIds.has(dm.id)) {
          conv.messages.push(dm);
          conv.lastMessage = dm;
          existingIds.add(dm.id);
        }
      }
      this.dmConversations.set(remoteId, conv);
      this.scheduleSave('dms');
      this.emitEvent({ type: 'dm-message', payload: { dm: msgs[msgs.length - 1], incoming: true }, timestamp: Date.now() });
    });
  }

  private handleChatMessage(message: Message, _fromPeerId: string): void {
    const key = `${message.serverId}:${message.channelId}`;
    const channelMessages = this.messages.get(key) || [];

    if (!channelMessages.find(m => m.id === message.id)) {
      channelMessages.push(message);
      this.messages.set(key, channelMessages);
      this.emitEvent({ type: 'message', payload: message, timestamp: Date.now() });
    }
  }

  private handleSyncRequest(fromPeerId: string, payload: SyncRequestPayload): void {
    if (!this.isHost) return;

    // Update peer info
    if (payload.peerInfo) {
      const entry = this.connections.get(fromPeerId);
      if (entry) {
        entry.peerId = payload.peerInfo;
        this.connections.set(fromPeerId, entry);
      }
    }

    const bulkConn = this.bulkConnections.get(fromPeerId);
    const targetConn = bulkConn?.open ? bulkConn : this.connections.get(fromPeerId)?.conn;
    if (targetConn) {
      this.sendToConnection(targetConn, {
        type: 'sync-response',
        payload: {
          servers: Array.from(this.servers.values()).map(s => {
            const { config: _config, ...coreServer } = s;
            void _config;
            return coreServer;
          }),
          messages: {},
          sequenceNumber: 0,
          onlinePeers: this.getOnlinePeers(),
        },
        timestamp: Date.now(),
      });
      // Send config separately to keep sync-response under DataChannel size limits
      Array.from(this.servers.values()).forEach(server => {
        if (!server.config) return;
        this.sendToConnection(targetConn, {
          type: 'config-sync',
          payload: { serverId: server.id, config: server.config },
          timestamp: Date.now(),
        });
      });
    }
  }

  private async handleSyncResponse(payload: SyncResponsePayload): Promise<void> {
    // Merge servers
    payload.servers?.forEach((server: Server) => {
      const existing = this.servers.get(server.id);
      if (existing) {
        existing.name = server.name;
        existing.icon = server.icon;
        const incomingVersion = server.config?.version ?? 0;
        const existingVersion = existing.config?.version ?? 0;
        if (incomingVersion >= existingVersion) {
          existing.config = server.config;
        }
        existing.channels = server.channels;
        existing.hostId = server.hostId;
        existing.createdAt = server.createdAt;
        // Merge members
        server.members.forEach(m => {
          if (!existing.members.find(em => em.id === m.id)) {
            existing.members.push(m);
          }
        });
        // Ensure we're in the list
        if (!existing.members.find(m => m.id === this.localPeer.id)) {
          existing.members.push(this.localPeer);
        }
        this.servers.set(server.id, existing);
      } else {
        if (!server.members.find(m => m.id === this.localPeer.id)) {
          server.members.push(this.localPeer);
        }
        this.servers.set(server.id, server);
      }
      const storedServer = this.servers.get(server.id);
      storedServer?.channels.forEach(ch => {
        const key = `${server.id}:${ch.id}`;
        if (!this.messages.has(key)) {
          this.messages.set(key, []);
        }
      });
    });

    logger.log('[P2P] Synced with host');
    this.scheduleSave('servers');
    this.emitEvent({ type: 'sync-response', payload: null, timestamp: Date.now() });
  }

  // ==================== MESSAGING ====================

  async sendMessage(serverId: string, channelId: string, content: string): Promise<Message> {
    if (!this.isServerMember(serverId, this.localPeer.id)) {
      throw new Error('You are not a member of this server.');
    }
    if (!this.hasPermission(serverId, this.localPeer.id, 'send_messages')) {
      throw new Error('You do not have permission to send messages in this server.');
    }
    const MAX_MESSAGE_BYTES = 8192;
    if (new TextEncoder().encode(content).byteLength > MAX_MESSAGE_BYTES) {
      throw new Error('Message is too long (max 8KB). Please split it into smaller messages.');
    }

    const message: Message = {
      id: generateId(),
      serverId,
      channelId,
      author: this.localPeer,
      content,
      seq: ++this.messageSeq,
      timestamp: Date.now(),
    };

    // Add to Yjs doc (triggers Yjs update broadcast to peers)
    const doc = this.yjs.getOrCreateChannelDoc(serverId, channelId);
    this.yjs.addChannelMessage(doc, message);

    // Update local cache and emit for UI
    const key = `${serverId}:${channelId}`;
    const channelMessages = this.messages.get(key) || [];
    channelMessages.push(message);
    this.messages.set(key, channelMessages);

    this.emitEvent({ type: 'message', payload: message, timestamp: Date.now() });
    return message;
  }

  // ==================== HOST MIGRATION ====================

  private initiateHostMigration(): void {
    const candidates = [this.localPeer.id, ...Array.from(this.connections.keys())
      .filter(id => this.connections.get(id)?.status === 'online')];

    candidates.sort();
    const newHostId = candidates[0];

    logger.log('[P2P] Host migration → new host:', newHostId);

    if (newHostId === this.localPeer.id) {
      this.isHost = true;
      this.hostId = this.localPeer.id;
      this.hostConn = null;
      this.bulkHostConn = null;

      this.servers.forEach(server => {
        server.hostId = this.localPeer.id;
      });

      this.broadcast({
        type: 'host-changed',
        payload: this.localPeer,
        timestamp: Date.now(),
      });
    } else {
      this.hostId = newHostId;
      const entry = this.connections.get(newHostId);
      if (entry) {
        this.hostConn = entry.conn;
        this.bulkHostConn = this.bulkConnections.get(newHostId) || null;
      } else {
        // No connection to the new host — re-establish
        this.reconnectToHost(newHostId);
      }
    }

    this.emitEvent({
      type: 'host-changed',
      payload: { newHostId },
      timestamp: Date.now(),
    });
  }

  private reconnectToHost(newHostId: string): void {
    if (!this.peer) return;
    logger.log('[P2P] Reconnecting to new host:', newHostId);
    const conn = this.peer.connect(newHostId, {
      reliable: true,
      metadata: {
        type: 'host-rejoin',
        peerInfo: this.localPeer,
        channelType: 'rt',
      },
    });

    conn.on('open', () => {
      logger.log('[P2P] Reconnected to new host:', newHostId);
      this.hostConn = conn;
      this.hostId = newHostId;
      this.connections.set(newHostId, {
        peerId: { id: newHostId, username: 'New Host' },
        conn,
        status: 'online',
        lastSeen: Date.now(),
      });

      this.setupConnectionHandlers(conn, newHostId, false);
      this.flushPendingDMs(newHostId);

      // Establish bulk connection
      const bulkConn = this.peer!.connect(newHostId, {
        reliable: true,
        metadata: {
          type: 'host-rejoin',
          peerInfo: this.localPeer,
          channelType: 'bulk',
        },
      });

      bulkConn.on('open', () => {
        this.bulkHostConn = bulkConn;
        this.bulkConnections.set(newHostId, bulkConn);
        this.setupConnectionHandlers(bulkConn, newHostId, true);

        // Send sync request to get server state
        this.sendToConnection(conn, {
          type: 'sync-request',
          payload: { peerInfo: this.localPeer },
          timestamp: Date.now(),
        });

        // Initiate Yjs sync for all channel docs
        this.servers.forEach(server => {
          server.channels.forEach(ch => {
            const channelKey = this.yjs.channelKey(server.id, ch.id);
            this.yjs.getOrCreateChannelDoc(server.id, ch.id);
            this.yjs.sendSyncStep1(channelKey);
          });
        });
      });
    });

    conn.on('error', (err) => {
      logger.error('[P2P] Reconnection to new host failed:', err);
    });
  }

  // ==================== DM METHODS ====================

  // ==================== PERMISSION CHECKS ====================

  private isServerMember(serverId: string, peerId: string): boolean {
    const server = this.servers.get(serverId);
    if (!server) return false;
    return server.members.some(m => m.id === peerId);
  }

  private hasPermission(serverId: string, peerId: string, permission: string): boolean {
    const server = this.servers.get(serverId);
    if (!server) return false;
    // Host/creator has all permissions
    if (server.hostId === peerId) return true;
    // TODO: check against CommunityRole permissions and PermissionOverwrites
    // For now, allow all members basic permissions
    return this.isServerMember(serverId, peerId);
  }

  private async getOrDeriveSharedKey(remotePeerId: string, remotePublicKeyString: string): Promise<CryptoKey | null> {
    if (this.sharedKeys.has(remotePeerId)) {
      return this.sharedKeys.get(remotePeerId)!;
    }
    if (!this.keyPair) return null;
    try {
      const remotePublicKey = await importPublicKey(remotePublicKeyString);
      const sharedKey = await deriveSharedKey(this.keyPair.privateKey, remotePublicKey);
      this.sharedKeys.set(remotePeerId, sharedKey);
      return sharedKey;
    } catch {
      return null;
    }
  }

  getOrCreateDMConversation(peer: PeerId): DMConversation {
    let conv = this.dmConversations.get(peer.id);
    if (!conv) {
      conv = {
        peerId: peer,
        messages: [],
        unreadCount: 0,
        isTyping: false,
        connectionType: this.connections.has(peer.id) ? 'relay' : 'disconnected',
        lastSeen: Date.now(),
      };
      this.dmConversations.set(peer.id, conv);
    }
    return conv;
  }

  async initiateDMConnection(peerId: string): Promise<void> {
    // For DMs, we reuse the existing server connection or connect directly
    if (this.connections.has(peerId)) {
      this.setDMConnectionType(peerId, 'direct');
      return;
    }

    // Try direct PeerJS connection
    if (this.peer) {
      try {
        const conn = this.peer.connect(peerId, {
          reliable: true,
          metadata: { type: 'dm', peerInfo: this.localPeer },
        });

        conn.on('open', () => {
          logger.log('[P2P DM] Direct connection to:', peerId);
          this.connections.set(peerId, {
            peerId: this.findPeerById(peerId) || { id: peerId, username: 'Unknown' },
            conn,
            status: 'online',
            lastSeen: Date.now(),
          });
          this.setupConnectionHandlers(conn, peerId);
          this.setDMConnectionType(peerId, 'direct');
          this.flushPendingDMs(peerId);
        });

        conn.on('error', () => {
          logger.log('[P2P DM] Direct connection failed, using relay');
          this.setDMConnectionType(peerId, 'relay');
        });
      } catch {
        this.setDMConnectionType(peerId, 'relay');
      }
    }
  }

  private setDMConnectionType(peerId: string, type: 'direct' | 'relay' | 'disconnected'): void {
    const conv = this.dmConversations.get(peerId);
    if (conv) {
      conv.connectionType = type;
      this.dmConversations.set(peerId, conv);
      this.emitEvent({ type: 'dm-message', payload: { peerId, connectionType: type }, timestamp: Date.now() });
    }
  }

  async sendDM(toPeerId: string, content: string): Promise<DirectMessage> {
    // Fall back to the DM conversation peer (covers peers added via Peer ID
    // who aren't yet in any server / connected list).
    const toPeer =
      this.findPeerById(toPeerId) ||
      this.dmConversations.get(toPeerId)?.peerId ||
      ({ id: toPeerId, username: `peer-${toPeerId.slice(0, 6)}` } as PeerId);

    const localDm: DirectMessage = {
      id: generateId(),
      type: 'DM',
      from: this.localPeer,
      to: toPeer,
      content,
      timestamp: Date.now(),
      encrypted: false,
    };

    let wireDm: DirectMessage = { ...localDm };
    const toPeerPublicKey = toPeer.publicKey;
    if (toPeerPublicKey && this.keyPair) {
      const sharedKey = await this.getOrDeriveSharedKey(toPeerId, toPeerPublicKey);
      if (sharedKey) {
        wireDm = {
          ...localDm,
          content: await encrypt(localDm.content, sharedKey),
          encrypted: true,
        };
      }
    }

    // Store locally
    const conv = this.getOrCreateDMConversation(toPeer);
    conv.messages.push(localDm);
    conv.lastMessage = localDm;
    this.dmConversations.set(toPeerId, conv);

    // Persist to Yjs for history sync when peer reconnects
    this.yjs.getOrCreateDMDoc(toPeerId).then(doc => {
      if (doc) this.yjs.addDMMessage(doc, wireDm);
    });

    this.scheduleSave('dms');

    // Send - try direct connection first, then relay through host
    const entry = this.connections.get(toPeerId);
    if (entry?.conn?.open) {
      this.sendToConnection(entry.conn, { type: 'dm-message', payload: wireDm, timestamp: Date.now() });
    } else if (this.hostConn?.open) {
      // Relay through host (host treats as opaque)
      this.sendToConnection(this.hostConn, {
        type: 'dm-message',
        payload: { ...wireDm, _relayTo: toPeerId },
        timestamp: Date.now(),
      });
    }

    this.emitEvent({ type: 'dm-message', payload: { dm: localDm, incoming: false }, timestamp: Date.now() });

    // Queue for offline delivery if peer is unreachable
    const canDeliverDirect = entry?.conn?.open;
    const canDeliverRelay = this.hostConn?.open;
    if (!canDeliverDirect && !canDeliverRelay) {
      this.queuePendingDM(toPeerId, wireDm);
    }

    return localDm;
  }

  private queuePendingDM(peerId: string, dm: DirectMessage): void {
    const queue = this.pendingDMMessages.get(peerId) || [];
    queue.push(dm);
    this.pendingDMMessages.set(peerId, queue);
    logger.log('[P2P DM] Queued message for offline delivery to:', peerId.slice(0, 8));
  }

  private flushPendingDMs(peerId: string): void {
    const queue = this.pendingDMMessages.get(peerId);
    if (!queue || queue.length === 0) return;
    logger.log('[P2P DM] Flushing', queue.length, 'pending messages to:', peerId.slice(0, 8));
    const entry = this.connections.get(peerId);
    if (entry?.conn?.open) {
      for (const dm of queue) {
        this.sendToConnection(entry.conn, { type: 'dm-message', payload: dm, timestamp: Date.now() });
      }
      this.pendingDMMessages.delete(peerId);
      this.emitEvent({
        type: 'error',
        payload: { message: `Delivered ${queue.length} pending message(s) to peer.`, level: 'info' },
        timestamp: Date.now(),
      });
    }
  }

  getPendingDMCount(peerId?: string): number {
    if (peerId) return this.pendingDMMessages.get(peerId)?.length || 0;
    let count = 0;
    for (const q of this.pendingDMMessages.values()) count += q.length;
    return count;
  }

  private async handleDMMessage(dm: DirectMessage, _fromPeerId: string): Promise<void> {
    // Host relay logic - forward without inspecting content
    if (this.isHost && dm._relayTo && dm._relayTo !== this.localPeer.id) {
      const target = this.connections.get(dm._relayTo);
      if (target?.conn?.open) {
        const { _relayTo, ...cleanDm } = dm;
        this.sendToConnection(target.conn, { type: 'dm-message', payload: cleanDm, timestamp: Date.now() });
      }
      return;
    }

    if (dm.encrypted && dm.from.publicKey && this.keyPair) {
      const sharedKey = await this.getOrDeriveSharedKey(dm.from.id, dm.from.publicKey);
      if (sharedKey) {
        try {
          dm.content = await decrypt(dm.content, sharedKey);
        } catch {
          dm.content = '[Failed to decrypt message]';
        }
      }
    }

    // Store the message
    const conv = this.getOrCreateDMConversation(dm.from);
    if (!conv.messages.find(m => m.id === dm.id)) {
      conv.messages.push(dm);
      conv.lastMessage = dm;
      conv.unreadCount++;
      this.dmConversations.set(dm.from.id, conv);

      // Persist to Yjs for history sync
      this.yjs.getOrCreateDMDoc(dm.from.id).then(doc => {
        if (doc) this.yjs.addDMMessage(doc, dm);
      });

      this.scheduleSave('dms');
      this.emitEvent({ type: 'dm-message', payload: { dm, incoming: true }, timestamp: Date.now() });
    }
  }

  sendDMTyping(toPeerId: string, isTyping: boolean): void {
    const entry = this.connections.get(toPeerId);
    if (entry?.conn?.open) {
      this.sendToConnection(entry.conn, {
        type: 'dm-typing',
        payload: { peerId: this.localPeer.id, isTyping },
        timestamp: Date.now(),
      });
    }
  }

  private handleDMTyping(peerId: string, isTyping: boolean): void {
    const conv = this.dmConversations.get(peerId);
    if (conv) {
      conv.isTyping = isTyping;
      this.dmConversations.set(peerId, conv);
      this.emitEvent({ type: 'dm-typing', payload: { peerId, isTyping }, timestamp: Date.now() });
    }
  }

  markDMAsRead(peerId: string): void {
    const conv = this.dmConversations.get(peerId);
    if (conv) {
      conv.unreadCount = 0;
      this.dmConversations.set(peerId, conv);
    }
  }

  // ==================== VOICE CHANNELS ====================

  private localStream: MediaStream | null = null;
  private voiceConnections: Map<string, MediaConnection> = new Map();
  private muted = false;
  private activeVoiceChannel: { serverId: string; channelId: string } | null = null;

  async joinVoiceChannel(serverId: string, channelId: string): Promise<void> {
    if (this.activeVoiceChannel) {
      await this.leaveVoiceChannel();
    }

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      this.emitEvent({
        type: 'error',
        payload: { message: 'Could not access microphone. Please check permissions.', level: 'error' },
        timestamp: Date.now(),
      });
      return;
    }

    this.activeVoiceChannel = { serverId, channelId };
    this.muted = false;

    const membersToCall: string[] = [];
    this.servers.get(serverId)?.members.forEach(m => {
      if (m.id !== this.localPeer.id && this.connections.has(m.id)) {
        membersToCall.push(m.id);
      }
    });

    for (const peerId of membersToCall) {
      this.callPeerVoice(peerId);
    }

    this.emitEvent({
      type: 'voice-state-changed',
      payload: { joined: true, serverId, channelId },
      timestamp: Date.now(),
    });
  }

  async leaveVoiceChannel(): Promise<void> {
    this.voiceConnections.forEach(conn => conn.close());
    this.voiceConnections.clear();

    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
      this.localStream = null;
    }

    this.muted = false;
    this.activeVoiceChannel = null;

    this.emitEvent({
      type: 'voice-state-changed',
      payload: { joined: false },
      timestamp: Date.now(),
    });
  }

  private callPeerVoice(peerId: string): void {
    if (!this.peer || !this.localStream) return;
    try {
      const call = this.peer.call(peerId, this.localStream);
      if (!call) return;
      this.voiceConnections.set(peerId, call);
      call.on('stream', () => {});
      call.on('close', () => this.voiceConnections.delete(peerId));
      call.on('error', (err) => logger.error('[P2P Voice] Call error:', err));
    } catch (err) {
      logger.warn('[P2P Voice] Failed to call peer:', peerId, err);
    }
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(t => {
        t.enabled = !this.muted;
      });
    }
    this.emitEvent({
      type: 'voice-state-changed',
      payload: { muted: this.muted },
      timestamp: Date.now(),
    });
    return this.muted;
  }

  isMuted(): boolean { return this.muted; }
  isInVoiceChannel(): boolean { return this.activeVoiceChannel !== null; }
  getActiveVoiceChannel(): { serverId: string; channelId: string } | null { return this.activeVoiceChannel; }

  // ==================== UTILITIES ====================

  private findPeerById(peerId: string): PeerId | null {
    const entry = this.connections.get(peerId);
    if (entry) return entry.peerId;

    for (const server of this.servers.values()) {
      const member = server.members.find(m => m.id === peerId);
      if (member) return member;
    }

    const conv = this.dmConversations.get(peerId);
    if (conv) return conv.peerId;

    return null;
  }

  private sendToConnection(conn: DataConnection, event: P2PEvent): void {
    if (conn.open) {
      this.sendChunked(conn, JSON.stringify(event));
    }
  }

  private sendChunked(conn: DataConnection, payload: string): void {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(payload);

    if (bytes.length <= this.CHUNK_SIZE) {
      if (conn.open) conn.send(payload);
      return;
    }

    const chunkId = generateId();
    const decoder = new TextDecoder();
    const totalChunks = Math.ceil(bytes.length / this.CHUNK_SIZE);
    const frames: string[] = [];

    for (let i = 0; i < totalChunks; i++) {
      const slice = bytes.slice(i * this.CHUNK_SIZE, (i + 1) * this.CHUNK_SIZE);
      frames.push(JSON.stringify({
        _chunkId: chunkId,
        _index: i,
        _total: totalChunks,
        _data: decoder.decode(slice),
      }));
    }

    this.drainFrames(conn, frames);
  }

  private receiveChunk(peerId: string, raw: string): string | null {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }

    if (!this.isChunkFrame(parsed)) return raw;

    if (!this.chunkBuffers.has(peerId)) {
      this.chunkBuffers.set(peerId, new Map());
    }
    const peerMap = this.chunkBuffers.get(peerId)!;

    if (!peerMap.has(parsed._chunkId)) {
      peerMap.set(parsed._chunkId, new Array(parsed._total).fill(null));
    }
    const chunks = peerMap.get(parsed._chunkId)!;
    chunks[parsed._index] = parsed._data;

    if (chunks.every(chunk => chunk !== null)) {
      peerMap.delete(parsed._chunkId);
      return chunks.join('');
    }
    return null;
  }

  private isChunkFrame(value: unknown): value is ChunkFrame {
    if (!value || typeof value !== 'object') return false;
    const candidate = value as Partial<ChunkFrame>;
    return (
      typeof candidate._chunkId === 'string' &&
      typeof candidate._index === 'number' &&
      typeof candidate._total === 'number' &&
      typeof candidate._data === 'string'
    );
  }

  private drainFrames(conn: DataConnection, frames: string[]): void {
    const HIGH_WATER = 1_048_576;
    const LOW_WATER = 65_536;
    const dc = (conn as PeerJsDataConnectionWithChannel)._dc
      ?? (conn as PeerJsDataConnectionWithChannel).dataChannel;

    const sendNext = () => {
      while (frames.length > 0) {
        if (!conn.open) return;

        if (dc && dc.bufferedAmount > HIGH_WATER) {
          dc.bufferedAmountLowThreshold = LOW_WATER;
          dc.addEventListener('bufferedamountlow', () => sendNext(), { once: true });
          return;
        }

        conn.send(frames.shift()!);
      }
    };

    sendNext();
  }

  private sendHeartbeats(): void {
    const now = Date.now();
    this.connections.forEach((entry, peerId) => {
      if (!entry.conn.open) return;
      if (now - entry.lastSeen > 45_000) {
        logger.warn('[P2P] Peer', peerId, 'is stale - reconnecting');
        entry.conn.close();
        return;
      }
      this.sendToConnection(entry.conn, {
        type: 'ping',
        payload: null,
        timestamp: now,
      });
    });
  }

  private broadcast(event: P2PEvent, excludePeerId?: string): void {
    this.connections.forEach((entry, id) => {
      if (id !== excludePeerId && entry.conn?.open) {
        this.sendToConnection(entry.conn, event);
      }
    });
  }

  // Event system
  addEventListener(callback: EventCallback): () => void {
    this.eventListeners.add(callback);
    return () => this.eventListeners.delete(callback);
  }

  private emitEvent(event: P2PEvent): void {
    this.eventListeners.forEach(cb => cb(event));
  }

  // Getters
  getServers(): Server[] { return Array.from(this.servers.values()); }
  getServer(id: string): Server | undefined { return this.servers.get(id); }

  getMessages(serverId: string, channelId: string): Message[] {
    return this.messages.get(`${serverId}:${channelId}`) || [];
  }

  getAllMessages(): Message[] {
    const all: Message[] = [];
    this.messages.forEach(msgs => all.push(...msgs));
    return all;
  }

  async loadOlderMessages(serverId: string, channelId: string): Promise<Message[]> {
    const key = `${serverId}:${channelId}`;
    const msgs = this.messages.get(key) || [];

    if (msgs.length === 0) {
      const stored = await Storage.loadMessages(serverId, channelId);
      this.messages.set(key, stored);
      return stored;
    }

    const oldestTs = msgs.reduce((min, m) => m.timestamp < min ? m.timestamp : min, msgs[0].timestamp);
    const older = await Storage.loadMessagesBefore(serverId, channelId, oldestTs, 50);
    if (older.length === 0) return [];

    const existingIds = new Set(msgs.map(m => m.id));
    const newMsgs = older.filter(m => !existingIds.has(m.id));
    if (newMsgs.length === 0) return [];

    msgs.unshift(...newMsgs);
    this.messages.set(key, msgs);
    return newMsgs;
  }

  getOnlinePeers(): PeerId[] {
    const online = Array.from(this.connections.values())
      .filter(p => p.status === 'online')
      .map(p => p.peerId);
    return [this.localPeer, ...online];
  }

  getAvailablePeersForDM(): PeerId[] {
    const peersMap = new Map<string, PeerId>();
    this.servers.forEach(server => {
      server.members.forEach(m => {
        if (m.id !== this.localPeer.id) peersMap.set(m.id, m);
      });
    });
    return Array.from(peersMap.values());
  }

  getDMConversations(): DMConversation[] {
    return Array.from(this.dmConversations.values())
      .sort((a, b) => (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0));
  }

  getDMMessages(peerId: string): DirectMessage[] {
    return this.dmConversations.get(peerId)?.messages || [];
  }

  async disconnect(): Promise<void> {
    await this.flushSaves();
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    this.connections.forEach(entry => {
      entry.conn?.close();
    });
    this.connections.clear();
    this.bulkConnections.forEach(conn => {
      conn?.close();
    });
    this.bulkConnections.clear();
    this.chunkBuffers.clear();
    this.peer?.destroy();
    this.peer = null;
    this.servers.clear();
    this.messages.clear();
    this.dmConversations.clear();
    await this.yjs.destroy();
    this.isHost = false;
    this.hostId = null;
    this.hostConn = null;
    this.bulkHostConn = null;
  }

  // ==================== PERSISTENCE ====================

  private scheduleSave(type: string): void {
    this.pendingSaves.add(type);
    if (this.saveDebounceTimer) clearTimeout(this.saveDebounceTimer);
    this.saveDebounceTimer = setTimeout(() => this.flushSaves(), 300);
  }

  private async flushSaves(): Promise<void> {
    const saves = new Set(this.pendingSaves);
    this.pendingSaves.clear();

    try {
      const promises: Promise<void>[] = [];

      if (saves.has('identity')) {
        const identity: Parameters<typeof Storage.saveIdentity>[0] = {
          peerId: this.localPeer.id,
          username: this.localPeer.username,
          publicKey: this.localPeer.publicKey,
        };
        if (this.storageKey) {
          identity.storageKeyJwk = await exportStorageKey(this.storageKey);
        }
        promises.push(Storage.saveIdentity(identity));
      }

      if (saves.has('servers')) {
        for (const server of this.servers.values()) {
          promises.push(Storage.saveServer({
            id: server.id,
            name: server.name,
            icon: server.icon,
            config: server.config,
            channels: server.channels,
            hostId: server.hostId,
            createdAt: server.createdAt,
            inviteCode: server.inviteCode,
            lastHostPeerId: server.hostId,
          }));
        }
      }

      if (saves.has('dms')) {
        for (const [_peerId, conv] of this.dmConversations.entries()) {
          promises.push(Storage.saveDMConversation({
            peerId: conv.peerId.id,
            peerUsername: conv.peerId.username,
            peerPublicKey: conv.peerId.publicKey,
            lastSeen: conv.lastSeen,
          }));
        }
      }

      await Promise.all(promises);
    } catch (err) {
      logger.error('[P2P] Persistence error:', err);
    }
  }

  // Load persisted data into memory
  async loadPersistedData(): Promise<void> {
    try {
      // Restore storage key for at-rest DM decryption
      const identity = await Storage.loadIdentity();
      if (identity?.storageKeyJwk) {
        this.storageKey = await importStorageKey(identity.storageKeyJwk);
        Storage.setStorageKey(this.storageKey);
      }

      // Load servers
      const storedServers = await Storage.loadServers();
      for (const s of storedServers) {
        if (!this.servers.has(s.id)) {
          const restoredServer: Server = {
            id: s.id,
            name: s.name,
            channels: s.channels,
            members: [this.localPeer],
            hostId: s.hostId,
            createdAt: s.createdAt,
            inviteCode: s.inviteCode,
            icon: s.icon,
            config: s.config,
          };

          // Back-fill config for servers created before the community system
          if (!restoredServer.config) {
            restoredServer.config = createDefaultCommunityConfig(
              {
                name: s.name,
                tags: [],
                visibility: 'private',
                template: 'custom',
                region: 'auto',
                language: 'en',
                onboardingTemplate: 'none',
                aiSetupEnabled: false,
              },
              s.hostId
            );
          }

          this.servers.set(s.id, restoredServer);
        }
      }

      for (const server of storedServers) {
        if (server.hostId !== this.localPeer.id && server.inviteCode) {
          try {
            await this.joinServer(server.inviteCode);
          } catch {
            logger.log('[P2P] Could not reconnect to server', server.name, '— host is offline');
          }
        }
      }

      // Init Yjs docs for each channel (loads from y-indexeddb)
      for (const server of Array.from(this.servers.values())) {
        for (const channel of server.channels) {
          const key = `${server.id}:${channel.id}`;
          const doc = await this.yjs.getOrCreateChannelDoc(server.id, channel.id);
          const msgs = this.yjs.getChannelMessages(doc);
          msgs.forEach(m => { m.serverId = server.id; m.channelId = channel.id; });
          this.messages.set(key, msgs);
        }
      }

      // Load DM conversations from Storage
      const storedConvs = await Storage.loadDMConversations();
      for (const c of storedConvs) {
        if (this.dmConversations.has(c.peerId)) continue;
        // Try loading from Yjs doc first for complete history
        let dmMsgs: DirectMessage[];
        try {
          const dmDoc = await this.yjs.getOrCreateDMDoc(c.peerId);
          dmMsgs = this.yjs.getDMMessages(dmDoc);
        } catch {
          dmMsgs = [];
        }
        if (dmMsgs.length === 0) {
          dmMsgs = await Storage.loadDMMessages(c.peerId);
        }
        this.dmConversations.set(c.peerId, {
          peerId: { id: c.peerId, username: c.peerUsername, publicKey: c.peerPublicKey },
          messages: dmMsgs,
          lastMessage: dmMsgs[dmMsgs.length - 1],
          unreadCount: 0,
          isTyping: false,
          connectionType: 'disconnected',
          lastSeen: c.lastSeen,
        });
      }

      const loadedMessageCount = Array.from(this.messages.values()).reduce((sum, msgs) => sum + msgs.length, 0)
        + Array.from(this.dmConversations.values()).reduce((sum, conv) => sum + conv.messages.length, 0);
      this.persistenceReady = true;
      logger.log('[P2P] Loaded persisted data:', storedServers.length, 'servers,', loadedMessageCount, 'recent messages,', storedConvs.length, 'DM conversations');
    } catch (err) {
      logger.error('[P2P] Error loading persisted data:', err);
      this.persistenceReady = true;
    }
  }

  // Save identity to storage
  async persistIdentity(): Promise<void> {
    this.scheduleSave('identity');
  }

  // Clear all persisted data (on logout)
  async clearPersistedData(): Promise<void> {
    await Storage.clearAllData();
  }
}
```

---

### File: `src\lib\storage.ts`

```ts
// IndexedDB persistence layer for Local Echo
// All data stays local — no cloud, no telemetry

import type { Channel, DirectMessage, PeerId } from '@/types/p2p';
import type { CommunityConfig } from '@/types/community';
import { encrypt, decrypt } from './crypto';

const DB_NAME = 'p2p-chat-store';
const DB_VERSION = 2;

let _storageKey: CryptoKey | null = null;

export function setStorageKey(key: CryptoKey | null): void {
  _storageKey = key;
}

export interface StoredIdentity {
  peerId: string;
  username: string;
  publicKey?: string;
  privateKey?: string; // Stored as JWK
  storageKeyJwk?: JsonWebKey; // AES-GCM key persisted as JWK
}

export interface StoredServer {
  id: string;
  name: string;
  icon?: string;
  config?: CommunityConfig;
  channels: Channel[];
  hostId: string;
  createdAt: number;
  inviteCode?: string; // Store invite code for auto-rejoin
  lastHostPeerId?: string; // Last known host PeerJS ID
}

export interface StoredMessage {
  id: string;
  serverId: string;
  channelId: string;
  author: PeerId;
  content: string;
  seq: number;
  timestamp: number;
  encrypted?: boolean;
}

export interface StoredDMConversation {
  peerId: string;
  peerUsername: string;
  peerPublicKey?: string;
  lastSeen: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const oldVersion = event.oldVersion;

      if (oldVersion < 1) {
        // Identity store (single record)
        if (!db.objectStoreNames.contains('identity')) {
          db.createObjectStore('identity', { keyPath: 'peerId' });
        }

        // Servers
        if (!db.objectStoreNames.contains('servers')) {
          db.createObjectStore('servers', { keyPath: 'id' });
        }

        // Messages (keyed by "serverId:channelId:messageId")
        if (!db.objectStoreNames.contains('messages')) {
          const msgStore = db.createObjectStore('messages', { keyPath: 'id' });
          msgStore.createIndex('channel', ['serverId', 'channelId'], { unique: false });
        }

        // DM Conversations
        if (!db.objectStoreNames.contains('dmConversations')) {
          db.createObjectStore('dmConversations', { keyPath: 'peerId' });
        }

        // DM Messages
        if (!db.objectStoreNames.contains('dmMessages')) {
          const dmStore = db.createObjectStore('dmMessages', { keyPath: 'id' });
          dmStore.createIndex('peerId', 'peerId', { unique: false });
        }
      }

      if (oldVersion < 2) {
        const tx = (event.target as IDBOpenDBRequest).transaction!;
        const msgStore = tx.objectStore('messages');
        if (!msgStore.indexNames.contains('channel-time')) {
          msgStore.createIndex(
            'channel-time',
            ['serverId', 'channelId', 'timestamp'],
            { unique: false }
          );
        }
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
  });
  return dbPromise;
}

// ==================== IDENTITY ====================

export async function saveIdentity(identity: StoredIdentity): Promise<void> {
  const db = await openDB();
  const tx = db.transaction('identity', 'readwrite');
  tx.objectStore('identity').put(identity);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadIdentity(): Promise<StoredIdentity | null> {
  const db = await openDB();
  const tx = db.transaction('identity', 'readonly');
  const store = tx.objectStore('identity');
  const request = store.getAll();
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result[0] || null);
    request.onerror = () => reject(request.error);
  });
}

// ==================== SERVERS ====================

export async function saveServer(server: StoredServer): Promise<void> {
  const db = await openDB();
  const tx = db.transaction('servers', 'readwrite');
  tx.objectStore('servers').put(server);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadServers(): Promise<StoredServer[]> {
  const db = await openDB();
  const tx = db.transaction('servers', 'readonly');
  const request = tx.objectStore('servers').getAll();
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteServer(serverId: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction('servers', 'readwrite');
  tx.objectStore('servers').delete(serverId);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Delete every persisted message for a single channel
export async function deleteChannelMessages(serverId: string, channelId: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction('messages', 'readwrite');
  const store = tx.objectStore('messages');
  const idx = store.index('channel');
  const req = idx.openCursor([serverId, channelId]);
  return new Promise((resolve, reject) => {
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        resolve();
      }
    };
    req.onerror = () => reject(req.error);
    tx.onerror = () => reject(tx.error);
  });
}

// ==================== MESSAGES ====================

export async function saveMessages(messages: StoredMessage[]): Promise<void> {
  if (messages.length === 0) return;
  const db = await openDB();
  const tx = db.transaction('messages', 'readwrite');
  const store = tx.objectStore('messages');
  messages.forEach(msg => store.put(msg));
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadMessages(serverId: string, channelId: string): Promise<StoredMessage[]> {
  const db = await openDB();
  const tx = db.transaction('messages', 'readonly');
  const store = tx.objectStore('messages');
  const index = store.index('channel');
  const request = index.getAll([serverId, channelId]);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const msgs = request.result as StoredMessage[];
      msgs.sort((a, b) => {
        if (a.seq && b.seq) return a.seq - b.seq;
        return a.timestamp - b.timestamp;
      });
      resolve(msgs);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function loadAllMessages(): Promise<StoredMessage[]> {
  const db = await openDB();
  const tx = db.transaction('messages', 'readonly');
  const request = tx.objectStore('messages').getAll();
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadRecentMessages(
  serverId: string,
  channelId: string,
  limit = 100
): Promise<StoredMessage[]> {
  const db = await openDB();
  const tx = db.transaction('messages', 'readonly');
  const index = tx.objectStore('messages').index('channel-time');
  const range = IDBKeyRange.bound(
    [serverId, channelId, 0],
    [serverId, channelId, Number.MAX_SAFE_INTEGER]
  );
  const results: StoredMessage[] = [];

  return new Promise((resolve, reject) => {
    const request = index.openCursor(range, 'prev');
    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor && results.length < limit) {
        results.push(cursor.value as StoredMessage);
        cursor.continue();
      } else {
        resolve(results.reverse());
      }
    };
    request.onerror = () => reject(request.error);
  });
}

export async function loadMessagesBefore(
  serverId: string,
  channelId: string,
  beforeTimestamp: number,
  limit = 50
): Promise<StoredMessage[]> {
  const db = await openDB();
  const tx = db.transaction('messages', 'readonly');
  const index = tx.objectStore('messages').index('channel-time');
  const range = IDBKeyRange.bound(
    [serverId, channelId, 0],
    [serverId, channelId, beforeTimestamp - 1]
  );
  const results: StoredMessage[] = [];

  return new Promise((resolve, reject) => {
    const request = index.openCursor(range, 'prev');
    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor && results.length < limit) {
        results.push(cursor.value as StoredMessage);
        cursor.continue();
      } else {
        resolve(results.reverse());
      }
    };
    request.onerror = () => reject(request.error);
  });
}

// ==================== DM CONVERSATIONS ====================

export async function saveDMConversation(conv: StoredDMConversation): Promise<void> {
  const db = await openDB();
  const tx = db.transaction('dmConversations', 'readwrite');
  tx.objectStore('dmConversations').put(conv);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadDMConversations(): Promise<StoredDMConversation[]> {
  const db = await openDB();
  const tx = db.transaction('dmConversations', 'readonly');
  const request = tx.objectStore('dmConversations').getAll();
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ==================== DM MESSAGES ====================

export async function saveDMMessages(messages: DirectMessage[], localPeerId: string): Promise<void> {
  if (messages.length === 0) return;
  const records: Record<string, unknown>[] = [];
  for (const msg of messages) {
    const otherPeerId = msg.from.id === localPeerId ? msg.to.id : msg.from.id;
    const stored: Record<string, unknown> = { ...msg, peerId: otherPeerId };
    if (_storageKey && msg.content && !msg.encrypted) {
      stored.content = await encrypt(msg.content, _storageKey);
      stored.encrypted = true;
    }
    records.push(stored);
  }
  const db = await openDB();
  const tx = db.transaction('dmMessages', 'readwrite');
  const store = tx.objectStore('dmMessages');
  for (const record of records) {
    store.put(record);
  }
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadDMMessages(peerId: string): Promise<DirectMessage[]> {
  const db = await openDB();
  const tx = db.transaction('dmMessages', 'readonly');
  const index = tx.objectStore('dmMessages').index('peerId');
  const request = index.getAll(peerId);
  return new Promise((resolve, reject) => {
    request.onsuccess = async () => {
      const msgs = request.result as DirectMessage[];
      if (_storageKey) {
        for (const msg of msgs) {
          if (msg.encrypted && msg.content) {
            try {
              msg.content = await decrypt(msg.content, _storageKey);
            } catch {
              msg.content = '[Failed to decrypt message]';
            }
          }
        }
      }
      msgs.sort((a, b) => a.timestamp - b.timestamp);
      resolve(msgs);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function loadAllDMMessages(): Promise<DirectMessage[]> {
  const db = await openDB();
  const tx = db.transaction('dmMessages', 'readonly');
  const request = tx.objectStore('dmMessages').getAll();
  return new Promise((resolve, reject) => {
    request.onsuccess = async () => {
      const msgs = request.result as DirectMessage[];
      if (_storageKey) {
        for (const msg of msgs) {
          if (msg.encrypted && msg.content) {
            try {
              msg.content = await decrypt(msg.content, _storageKey);
            } catch {
              msg.content = '[Failed to decrypt message]';
            }
          }
        }
      }
      resolve(msgs);
    };
    request.onerror = () => reject(request.error);
  });
}

// ==================== CLEAR ALL ====================

export async function clearAllData(): Promise<void> {
  const db = await openDB();
  const stores = ['identity', 'servers', 'messages', 'dmConversations', 'dmMessages'];
  const tx = db.transaction(stores, 'readwrite');
  stores.forEach(name => {
    try { tx.objectStore(name).clear(); } catch { /* store may not exist */ }
  });
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  // Clear y-indexeddb databases (each channel doc gets its own db)
  // Note: indexedDB.databases() is not supported in all browsers (e.g. Safari)
  try {
    const dbs = await indexedDB.databases();
    for (const dbMeta of dbs) {
      if (dbMeta.name && dbMeta.name.startsWith('yjs-')) {
        await indexedDB.deleteDatabase(dbMeta.name);
      }
    }
  } catch {
    // Fallback: can't enumerate databases, skip cleanup
  }
}
```

---

### File: `src\lib\templates.ts`

```ts
import type { CommunityConfig, CommunityRole, CreateCommunityInput } from '@/types/community';
import { TEMPLATE_LABELS, ALL_PERMISSIONS } from '@/types/community';

export function createDefaultCommunityConfig(input: CreateCommunityInput, ownerId: string): CommunityConfig {
  const createdAt = Date.now();
  const templateLabel = TEMPLATE_LABELS[input.template];
  const publicServer = input.visibility === 'public';

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
      description: 'Manage server settings, roles, channels, bots, and automations',
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
    template: input.template,
    branding: {
      description: input.description || `${templateLabel} community on Local Echo`,
      icon: input.icon,
      bannerUrl: input.bannerUrl,
      accentColor: '#22c55e',
      gradientFrom: '#0f172a',
      gradientTo: '#14532d',
      welcomeTitle: `Welcome to ${input.name}`,
      welcomeMessage: input.aiSetupEnabled
        ? `This ${templateLabel.toLowerCase()} space was set up with recommended channels, roles, safety defaults, and onboarding.`
        : 'Read the rules, introduce yourself, and make yourself at home.',
      inviteSplash: `Join ${input.name} on Local Echo.`,
    },
    discovery: {
      visibility: input.visibility,
      tags: input.tags,
      language: input.language,
      region: input.region,
      allowDiscovery: input.visibility === 'public',
    },
    invites: {
      defaultExpiryHours: publicServer ? 24 : 168,
      maxUses: publicServer ? 100 : 25,
      allowMemberInvites: !publicServer,
      requireApproval: publicServer,
      trackAnalytics: true,
    },
    onboarding: {
      enabled: input.onboardingTemplate !== 'none',
      template: input.onboardingTemplate,
      rules: [
        'Be respectful and constructive.',
        'No spam, scams, harassment, or hate speech.',
        'Keep discussions in the right channels.',
      ],
      starterPrompt: 'Introduce yourself and tell everyone what brought you here.',
      assignRoleOnComplete: 'member',
    },
    roles,
    permissionOverwrites: [],
    moderation: {
      verificationLevel: publicServer ? 'medium' : 'low',
      spamDetection: true,
      raidDetection: publicServer,
      scamDetection: true,
      phishingDetection: true,
      nsfwDetection: publicServer,
      hateSpeechFilter: true,
      toxicityScoring: publicServer,
      duplicateMessageDetection: true,
      antiMassMention: true,
      quarantineNewMembers: publicServer,
      trustScoreEnabled: true,
      emergencyLockdown: false,
      panicMode: false,
    },
    automodRules: [
      { id: 'spam-rule', name: 'Spam shield', enabled: true, trigger: 'spam', threshold: 5, action: 'timeout' },
      { id: 'mentions-rule', name: 'Mass mention guard', enabled: true, trigger: 'mass-mention', threshold: 6, action: 'delete-message' },
      { id: 'scam-rule', name: 'Suspicious link review', enabled: true, trigger: 'link', threshold: 1, action: 'notify-mods' },
    ],
    automations: [
      {
        id: 'welcome-flow',
        name: 'Welcome new members',
        enabled: true,
        trigger: 'member-joins',
        condition: 'Always',
        action: 'send-message',
        description: 'Posts a welcome message and points newcomers to onboarding.',
      },
      {
        id: 'trusted-role-flow',
        name: 'Unlock trusted member role',
        enabled: input.aiSetupEnabled,
        trigger: 'level-reached',
        condition: 'Level >= 10 and no active strikes',
        action: 'assign-role',
        description: 'Promotes healthy long-term members into a trusted role.',
      },
    ],
    analytics: {
      enabled: true,
      retentionDays: publicServer ? 90 : 30,
      trackMessageActivity: true,
      trackVoiceActivity: true,
      trackModerationStats: true,
      aiInsights: input.aiSetupEnabled,
    },
    integrations: {
      botsEnabled: true,
      pluginsEnabled: true,
      webhooksEnabled: true,
      githubEnabled: input.template === 'developer' || input.template === 'startup',
      pluginSandboxRequired: true,
      marketplaceEnabled: input.visibility === 'public',
    },
    monetization: {
      enabled: false,
      premiumMemberships: false,
      paidRoles: false,
      donations: input.template === 'creator-community',
      ticketedChannels: false,
      supporterBadges: input.template === 'creator-community',
    },
    backups: {
      enabled: false,
      encrypted: true,
      retentionDays: 30,
      includeAuditLogs: true,
    },
    auditLog: [
      {
        id: `audit-${createdAt}`,
        actorId: ownerId,
        action: 'community.created',
        target: input.name,
        reason: `Created from ${templateLabel} template`,
        timestamp: createdAt,
      },
    ],
  };
}
```

---

### File: `src\lib\utils.ts`

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

### File: `src\lib\yjs-manager.ts`

```ts
import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import type { Message, DirectMessage } from '@/types/p2p';

export type YjsSyncMessage =
  | { type: 'yjs-sync-step1'; channelKey: string; sv: string; targetPeerId?: string }
  | { type: 'yjs-sync-step2'; channelKey: string; update: string; targetPeerId?: string }
  | { type: 'yjs-update'; channelKey: string; update: string }; // always broadcast

export type YjsChangeCallback = (channelKey: string, kind: 'message' | 'dm') => void;

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(s: string): Uint8Array {
  return Uint8Array.from(atob(s), c => c.charCodeAt(0));
}

function dmDocKey(localId: string, remoteId: string): string {
  const sorted = [localId, remoteId].sort();
  return `dm:${sorted[0]}:${sorted[1]}`;
}

function channelDocKey(serverId: string, channelId: string): string {
  return `channel:${serverId}:${channelId}`;
}

export class YjsManager {
  private docs = new Map<string, { doc: Y.Doc; provider: IndexeddbPersistence }>();
  private localPeerId: string;
  private onSyncOutgoing: ((msg: YjsSyncMessage, targetPeerId?: string) => void) | null = null;
  private changeListeners = new Set<YjsChangeCallback>();

  constructor(localPeerId: string) {
    this.localPeerId = localPeerId;
  }

  setSyncOutgoingHandler(handler: (msg: YjsSyncMessage, targetPeerId?: string) => void): void {
    this.onSyncOutgoing = handler;
  }

  onChange(cb: YjsChangeCallback): () => void {
    this.changeListeners.add(cb);
    return () => this.changeListeners.delete(cb);
  }

  private notifyChange(channelKey: string, kind: 'message' | 'dm'): void {
    this.changeListeners.forEach(cb => cb(channelKey, kind));
  }

  channelKey(serverId: string, channelId: string): string {
    return channelDocKey(serverId, channelId);
  }

  dmKey(remotePeerId: string): string {
    return dmDocKey(this.localPeerId, remotePeerId);
  }

  async getOrCreateChannelDoc(serverId: string, channelId: string): Promise<Y.Doc> {
    const key = channelDocKey(serverId, channelId);
    return this.getOrCreateDoc(key, 'message');
  }

  async getOrCreateDMDoc(remotePeerId: string): Promise<Y.Doc> {
    const key = dmDocKey(this.localPeerId, remotePeerId);
    return this.getOrCreateDoc(key, 'dm');
  }

  private async getOrCreateDoc(key: string, kind: 'message' | 'dm'): Promise<Y.Doc> {
    const existing = this.docs.get(key);
    if (existing) return existing.doc;

    const doc = new Y.Doc();
    const provider = new IndexeddbPersistence(key, doc);

    // Wait for initial load from IndexedDB
    await provider.whenSynced;

    // Listen for local changes (not originating from remote sync)
    doc.on('update', (update: Uint8Array, origin: unknown) => {
      if (origin === 'remote') return;
      if (this.onSyncOutgoing) {
        this.onSyncOutgoing({ type: 'yjs-update', channelKey: key, update: toBase64(update) });
      }
      this.notifyChange(key, kind);
    });

    this.docs.set(key, { doc, provider });
    return doc;
  }

  addChannelMessage(doc: Y.Doc, msg: Message): void {
    const messages = doc.getArray('messages');
    doc.transact(() => {
      const entry = new Y.Map([
        ['id', msg.id],
        ['authorId', msg.author.id],
        ['authorUsername', msg.author.username],
        ['content', msg.content],
        ['seq', msg.seq ?? 0],
        ['timestamp', msg.timestamp],
      ]);
      messages.push([entry]);
    }, 'local');
  }

  addDMMessage(doc: Y.Doc, dm: DirectMessage): void {
    const messages = doc.getArray('messages');
    doc.transact(() => {
      const entry = new Y.Map([
        ['id', dm.id],
        ['fromId', dm.from.id],
        ['fromUsername', dm.from.username],
        ['toId', dm.to.id],
        ['toUsername', dm.to.username],
        ['content', dm.content],
        ['timestamp', dm.timestamp],
        ['encrypted', dm.encrypted ? 'true' : 'false'],
      ]);
      messages.push([entry]);
    }, 'local');
  }

  getChannelMessages(doc: Y.Doc): Message[] {
    const messages = doc.getArray('messages');
    const result: Message[] = [];
    for (let i = 0; i < messages.length; i++) {
      const map = messages.get(i) as Y.Map<unknown>;
      result.push({
        id: map.get('id') as string,
        serverId: '',
        channelId: '',
        author: {
          id: map.get('authorId') as string,
          username: map.get('authorUsername') as string,
        },
        content: map.get('content') as string,
        seq: (map.get('seq') as number) ?? 0,
        timestamp: map.get('timestamp') as number,
      });
    }
    return result;
  }

  getDMMessages(doc: Y.Doc): DirectMessage[] {
    const messages = doc.getArray('messages');
    const result: DirectMessage[] = [];
    for (let i = 0; i < messages.length; i++) {
      const map = messages.get(i) as Y.Map<unknown>;
      result.push({
        id: map.get('id') as string,
        type: 'DM',
        from: {
          id: map.get('fromId') as string,
          username: map.get('fromUsername') as string,
        },
        to: {
          id: map.get('toId') as string,
          username: map.get('toUsername') as string,
        },
        content: map.get('content') as string,
        timestamp: map.get('timestamp') as number,
        encrypted: map.get('encrypted') === 'true',
      });
    }
    return result;
  }

  // ── Yjs sync protocol ──

  /** Accept a remote sync message along with the sending peerId for routing the reply. */
  handleSyncMessage(msg: YjsSyncMessage, fromPeerId?: string): void {
    switch (msg.type) {
      case 'yjs-sync-step1': {
        const doc = this.docs.get(msg.channelKey)?.doc;
        if (!doc) return;
        const remoteSV = fromBase64(msg.sv);
        const update = Y.encodeStateAsUpdate(doc, remoteSV);
        if (update.byteLength > 0 && this.onSyncOutgoing) {
          this.onSyncOutgoing({ type: 'yjs-sync-step2', channelKey: msg.channelKey, update: toBase64(update), targetPeerId: fromPeerId });
        }
        // Also initiate reverse sync if we haven't yet
        if (fromPeerId && !this._syncingPeers.has(`${msg.channelKey}:${fromPeerId}`)) {
          this._syncingPeers.add(`${msg.channelKey}:${fromPeerId}`);
          this.sendSyncStep1(msg.channelKey, fromPeerId);
        }
        break;
      }
      case 'yjs-sync-step2':
      case 'yjs-update': {
        const entry = this.docs.get(msg.channelKey);
        if (!entry) return;
        const update = fromBase64(msg.update);
        Y.applyUpdate(entry.doc, update, 'remote');
        const kind = msg.channelKey.startsWith('dm:') ? 'dm' : 'message';
        this.notifyChange(msg.channelKey, kind);
        if (fromPeerId) {
          this._syncingPeers.delete(`${msg.channelKey}:${fromPeerId}`);
        }
        break;
      }
    }
  }

  private _syncingPeers = new Set<string>();

  /** Send sync step1 to a specific peer, or broadcast if no target given. */
  sendSyncStep1(channelKey: string, targetPeerId?: string): void {
    const entry = this.docs.get(channelKey);
    if (!entry || !this.onSyncOutgoing) return;
    const sv = Y.encodeStateVector(entry.doc);
    this.onSyncOutgoing({ type: 'yjs-sync-step1', channelKey, sv: toBase64(sv), targetPeerId }, targetPeerId);
    if (targetPeerId) {
      this._syncingPeers.add(`${channelKey}:${targetPeerId}`);
    }
  }

  async destroy(): Promise<void> {
    for (const { doc, provider } of this.docs.values()) {
      doc.destroy();
      await provider.destroy();
    }
    this.docs.clear();
    this.changeListeners.clear();
  }

  async destroyDoc(key: string): Promise<void> {
    const entry = this.docs.get(key);
    if (!entry) return;
    entry.doc.destroy();
    await entry.provider.destroy();
    this.docs.delete(key);
  }
}
```

---

### File: `src\pages\Index.tsx`

```tsx
import { P2PProvider, useP2P } from '@/contexts/P2PContext';
import { UsernameSetup } from '@/components/chat/UsernameSetup';
import { ChatLayout } from '@/components/chat/ChatLayout';
import { Helmet } from 'react-helmet-async';

function ChatApp() {
  const { isInitialized } = useP2P();

  if (!isInitialized) {
    return <UsernameSetup />;
  }

  return <ChatLayout />;
}

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Local Echo | Private peer-to-peer communities</title>
        <meta name="description" content="Private peer-to-peer communities with encrypted chat, local-first storage, and no central message server." />
      </Helmet>
      <P2PProvider>
        <ChatApp />
      </P2PProvider>
    </>
  );
};

export default Index;
```

---

### File: `src\pages\NotFound.tsx`

```tsx
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
```

---

### File: `src\test\setup.ts`

```ts
import '@testing-library/jest-dom/vitest';
```

---

### File: `src\types\community.ts`

```ts
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
```

---

### File: `src\types\p2p.ts`

```ts
// P2P Networking Types
import type { CommunityConfig } from './community';

export interface PeerId {
  id: string;
  username: string;
  publicKey?: string;
  verifyKey?: string;
}

export interface Message {
  id: string;
  serverId: string;
  channelId: string;
  author: PeerId;
  content: string;
  seq?: number;
  timestamp: number;
  encrypted?: boolean;
}

// Direct Message Types
export interface DirectMessage {
  id: string;
  type: 'DM';
  from: PeerId;
  to: PeerId;
  content: string;
  timestamp: number;
  encrypted?: boolean;
  read?: boolean;
  _relayTo?: string;
}

export interface DMConversation {
  peerId: PeerId;
  messages: DirectMessage[];
  lastMessage?: DirectMessage;
  unreadCount: number;
  isTyping: boolean;
  connectionType: 'direct' | 'relay' | 'disconnected';
  lastSeen: number;
}

export interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
  description?: string;
}

export type ChannelOp =
  | { kind: 'add'; channel: Channel }
  | { kind: 'rename'; channelId: string; name: string; description?: string }
  | { kind: 'delete'; channelId: string };

export interface Server {
  id: string;
  name: string;
  icon?: string;
  config?: CommunityConfig;
  channels: Channel[];
  members: PeerId[];
  hostId: string;
  createdAt: number;
  inviteCode?: string;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'host';
export type ViewMode = 'servers' | 'dms';

export type ErrorLevel = 'info' | 'warn' | 'error';

export interface P2PEvent {
  type: 
    | 'message' 
    | 'peer-joined' 
    | 'peer-left' 
    | 'host-changed'
    | 'sync-request'
    | 'sync-response'
    | 'dm-message'
    | 'dm-typing'
    | 'dm-read'
    | 'server-updated'
    | 'server-deleted'
    | 'peer-list'
    | 'config-sync'
    | 'ping'
    | 'pong'
    | 'yjs-sync'
    | 'yjs-update'
    | 'error'
    | 'voice-state-changed';
  payload: unknown;
  seq?: number;
  timestamp: number;
}


```

---

### File: `src\App.tsx`

```tsx
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
```

---

### File: `src\index.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Deep slate dark theme - Discord-inspired but unique */
    --background: 220 20% 7%;
    --foreground: 210 20% 92%;

    --card: 220 18% 10%;
    --card-foreground: 210 20% 92%;

    --popover: 220 18% 12%;
    --popover-foreground: 210 20% 92%;

    /* Vibrant teal accent */
    --primary: 187 94% 43%;
    --primary-foreground: 220 20% 7%;

    --secondary: 220 16% 14%;
    --secondary-foreground: 210 20% 85%;

    --muted: 220 14% 18%;
    --muted-foreground: 215 15% 55%;

    --accent: 187 80% 35%;
    --accent-foreground: 210 20% 95%;

    --destructive: 0 72% 51%;
    --destructive-foreground: 210 20% 98%;

    --success: 142 76% 36%;
    --success-foreground: 210 20% 98%;

    --warning: 38 92% 50%;
    --warning-foreground: 220 20% 7%;

    --border: 220 14% 16%;
    --input: 220 14% 16%;
    --ring: 187 94% 43%;

    --radius: 0.75rem;

    /* Sidebar specific */
    --sidebar-background: 220 20% 5%;
    --sidebar-foreground: 210 15% 70%;
    --sidebar-primary: 187 94% 43%;
    --sidebar-primary-foreground: 220 20% 7%;
    --sidebar-accent: 220 16% 12%;
    --sidebar-accent-foreground: 210 20% 90%;
    --sidebar-border: 220 14% 12%;
    --sidebar-ring: 187 94% 43%;

    /* Custom tokens for Discord clone */
    --channel-hover: 220 16% 12%;
    --message-hover: 220 14% 9%;
    --online: 142 76% 42%;
    --idle: 38 92% 50%;
    --offline: 220 10% 40%;
    --typing: 187 94% 43%;

    /* Glassmorphism */
    --glass: 220 18% 10% / 0.8;
    --glass-border: 220 14% 20% / 0.5;

    /* Gradients */
    --gradient-primary: linear-gradient(135deg, hsl(187 94% 43%), hsl(199 89% 48%));
    --gradient-surface: linear-gradient(180deg, hsl(220 18% 11%), hsl(220 20% 8%));
    --gradient-glow: radial-gradient(ellipse at center, hsl(187 94% 43% / 0.15), transparent 70%);

    /* Shadows */
    --shadow-sm: 0 1px 2px hsl(220 20% 3% / 0.5);
    --shadow-md: 0 4px 12px hsl(220 20% 3% / 0.6);
    --shadow-lg: 0 8px 24px hsl(220 20% 3% / 0.7);
    --shadow-glow: 0 0 20px hsl(187 94% 43% / 0.3);

    /* Animations */
    --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground font-sans antialiased;
    font-family: 'Inter', system-ui, sans-serif;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    @apply bg-transparent;
  }

  ::-webkit-scrollbar-thumb {
    @apply bg-muted rounded-full;
    transition: background var(--transition-fast);
  }

  ::-webkit-scrollbar-thumb:hover {
    @apply bg-muted-foreground/30;
  }
}

@layer utilities {
  .glass {
    background: var(--glass);
    backdrop-filter: blur(12px);
    border: 1px solid var(--glass-border);
  }

  .gradient-primary {
    background: var(--gradient-primary);
  }

  .gradient-surface {
    background: var(--gradient-surface);
  }

  .gradient-glow {
    background: var(--gradient-glow);
  }

  .shadow-glow {
    box-shadow: var(--shadow-glow);
  }

  .text-gradient {
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Animation utilities */
  .animate-in {
    animation: fade-in var(--transition-base) ease-out;
  }

  .animate-slide-up {
    animation: slide-up var(--transition-base) ease-out;
  }

  .animate-pulse-soft {
    animation: pulse-soft 2s ease-in-out infinite;
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slide-up {
    from { 
      opacity: 0;
      transform: translateY(10px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse-soft {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  /* Status indicators */
  .status-online {
    @apply bg-[hsl(var(--online))];
  }

  .status-idle {
    @apply bg-[hsl(var(--warning))];
  }

  .status-offline {
    @apply bg-[hsl(var(--offline))];
  }
}
```

---

### File: `src\main.tsx`

```tsx
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
```

---

### File: `src\vite-env.d.ts`

```ts
/// <reference types="vite/client" />
```

---

### File: `components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

---

### File: `eslint.config.js`

```js
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
    },
  },
);
```

---

### File: `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Local Echo | Private peer-to-peer communities</title>
    <meta name="description" content="Local Echo is a private peer-to-peer community app for encrypted rooms, direct messages, and local-first collaboration without a central message server." />
    <meta name="author" content="Local Echo" />
    <meta name="keywords" content="Local Echo, peer-to-peer chat, WebRTC, encrypted messaging, local-first communities, private collaboration" />
    
    <link rel="canonical" href="/" />

    <meta property="og:title" content="Local Echo" />
    <meta property="og:description" content="Private peer-to-peer communities with encrypted chat, local-first storage, and no central message server." />
    <meta property="og:type" content="website" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Local Echo" />
    <meta name="twitter:description" content="Private peer-to-peer communities with encrypted chat and local-first storage." />
    
    <meta name="theme-color" content="#0f1419" />
    <meta name="color-scheme" content="dark" />
  </head>

  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

### File: `package-lock.json`

```json
{
  "name": "local-echo",
  "version": "0.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "local-echo",
      "version": "0.0.0",
      "dependencies": {
        "@hookform/resolvers": "^3.10.0",
        "@radix-ui/react-accordion": "^1.2.11",
        "@radix-ui/react-alert-dialog": "^1.1.14",
        "@radix-ui/react-aspect-ratio": "^1.1.7",
        "@radix-ui/react-avatar": "^1.1.10",
        "@radix-ui/react-checkbox": "^1.3.2",
        "@radix-ui/react-collapsible": "^1.1.11",
        "@radix-ui/react-context-menu": "^2.2.15",
        "@radix-ui/react-dialog": "^1.1.14",
        "@radix-ui/react-dropdown-menu": "^2.1.15",
        "@radix-ui/react-hover-card": "^1.1.14",
        "@radix-ui/react-label": "^2.1.7",
        "@radix-ui/react-menubar": "^1.1.15",
        "@radix-ui/react-navigation-menu": "^1.2.13",
        "@radix-ui/react-popover": "^1.1.14",
        "@radix-ui/react-progress": "^1.1.7",
        "@radix-ui/react-radio-group": "^1.3.7",
        "@radix-ui/react-scroll-area": "^1.2.9",
        "@radix-ui/react-select": "^2.2.5",
        "@radix-ui/react-separator": "^1.1.7",
        "@radix-ui/react-slider": "^1.3.5",
        "@radix-ui/react-slot": "^1.2.3",
        "@radix-ui/react-switch": "^1.2.5",
        "@radix-ui/react-tabs": "^1.1.12",
        "@radix-ui/react-toast": "^1.2.14",
        "@radix-ui/react-toggle": "^1.1.9",
        "@radix-ui/react-toggle-group": "^1.1.10",
        "@radix-ui/react-tooltip": "^1.2.7",
        "@tanstack/react-query": "^5.83.0",
        "@tanstack/react-virtual": "^3.13.25",
        "class-variance-authority": "^0.7.1",
        "clsx": "^2.1.1",
        "cmdk": "^1.1.1",
        "date-fns": "^3.6.0",
        "embla-carousel-react": "^8.6.0",
        "input-otp": "^1.4.2",
        "jsqr": "^1.4.0",
        "lucide-react": "^0.462.0",
        "next-themes": "^0.3.0",
        "peerjs": "^1.5.5",
        "qrcode": "^1.5.4",
        "react": "^18.3.1",
        "react-day-picker": "^8.10.1",
        "react-dom": "^18.3.1",
        "react-helmet-async": "^2.0.5",
        "react-hook-form": "^7.61.1",
        "react-resizable-panels": "^2.1.9",
        "react-router-dom": "^6.30.1",
        "recharts": "^2.15.4",
        "sonner": "^1.7.4",
        "tailwind-merge": "^2.6.0",
        "tailwindcss-animate": "^1.0.7",
        "vaul": "^0.9.9",
        "y-indexeddb": "^9.0.12",
        "yjs": "^13.6.31",
        "zod": "^3.25.76"
      },
      "devDependencies": {
        "@eslint/js": "^9.32.0",
        "@playwright/test": "^1.61.0",
        "@tailwindcss/typography": "^0.5.16",
        "@testing-library/jest-dom": "^6.9.1",
        "@testing-library/react": "^16.3.2",
        "@testing-library/user-event": "^14.6.1",
        "@types/node": "^22.16.5",
        "@types/qrcode": "^1.5.6",
        "@types/react": "^18.3.23",
        "@types/react-dom": "^18.3.7",
        "@vitejs/plugin-react-swc": "^3.11.0",
        "@vitest/ui": "^4.1.9",
        "autoprefixer": "^10.4.21",
        "eslint": "^9.32.0",
        "eslint-plugin-react-hooks": "^5.2.0",
        "eslint-plugin-react-refresh": "^0.4.20",
        "fake-indexeddb": "^6.2.5",
        "globals": "^15.15.0",
        "happy-dom": "^20.10.3",
        "jsdom": "^29.1.1",
        "postcss": "^8.5.6",
        "tailwindcss": "^3.4.17",
        "typescript": "^5.8.3",
        "typescript-eslint": "^8.38.0",
        "vite": "^5.4.19",
        "vitest": "^4.1.9"
      }
    },
    "node_modules/@adobe/css-tools": {
      "version": "4.5.0",
      "resolved": "https://registry.npmjs.org/@adobe/css-tools/-/css-tools-4.5.0.tgz",
      "integrity": "sha512-6OzddxPio9UiWTCemp4N8cYLV2ZN1ncRnV1cVGtve7dhPOtRkleRyx32GQCYSwDYgaHU3USMm84tNsvKzRCa1Q==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@alloc/quick-lru": {
      "version": "5.2.0",
      "resolved": "https://registry.npmjs.org/@alloc/quick-lru/-/quick-lru-5.2.0.tgz",
      "integrity": "sha512-UrcABB+4bUrFABwbluTIBErXwvbsU/V7TZWfmbgJfbkwiBuziS9gxdODUyuiecfdGQ85jglMW6juS3+z5TsKLw==",
      "license": "MIT",
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/@asamuzakjp/css-color": {
      "version": "5.1.11",
      "resolved": "https://registry.npmjs.org/@asamuzakjp/css-color/-/css-color-5.1.11.tgz",
      "integrity": "sha512-KVw6qIiCTUQhByfTd78h2yD1/00waTmm9uy/R7Ck/ctUyAPj+AEDLkQIdJW0T8+qGgj3j5bpNKK7Q3G+LedJWg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@asamuzakjp/generational-cache": "^1.0.1",
        "@csstools/css-calc": "^3.2.0",
        "@csstools/css-color-parser": "^4.1.0",
        "@csstools/css-parser-algorithms": "^4.0.0",
        "@csstools/css-tokenizer": "^4.0.0"
      },
      "engines": {
        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
      }
    },
    "node_modules/@asamuzakjp/dom-selector": {
      "version": "7.1.1",
      "resolved": "https://registry.npmjs.org/@asamuzakjp/dom-selector/-/dom-selector-7.1.1.tgz",
      "integrity": "sha512-67RZDnYRc8H/8MLDgQCDE//zoqVFwajkepHZgmXrbwybzXOEwOWGPYGmALYl9J2DOLfFPPs6kKCqmbzV895hTQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@asamuzakjp/generational-cache": "^1.0.1",
        "@asamuzakjp/nwsapi": "^2.3.9",
        "bidi-js": "^1.0.3",
        "css-tree": "^3.2.1",
        "is-potential-custom-element-name": "^1.0.1"
      },
      "engines": {
        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
      }
    },
    "node_modules/@asamuzakjp/generational-cache": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/@asamuzakjp/generational-cache/-/generational-cache-1.0.1.tgz",
      "integrity": "sha512-wajfB8KqzMCN2KGNFdLkReeHncd0AslUSrvHVvvYWuU8ghncRJoA50kT3zP9MVL0+9g4/67H+cdvBskj9THPzg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
      }
    },
    "node_modules/@asamuzakjp/nwsapi": {
      "version": "2.3.9",
      "resolved": "https://registry.npmjs.org/@asamuzakjp/nwsapi/-/nwsapi-2.3.9.tgz",
      "integrity": "sha512-n8GuYSrI9bF7FFZ/SjhwevlHc8xaVlb/7HmHelnc/PZXBD2ZR49NnN9sMMuDdEGPeeRQ5d0hqlSlEpgCX3Wl0Q==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@babel/code-frame": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/code-frame/-/code-frame-7.29.7.tgz",
      "integrity": "sha512-Aup7aUOfpbAUg2ROOJN6Iw5f9DMBlzu0mIkm/malLQFN/YQgO48wCj0Kxa3sEHJvPVFg7siR+qRInwXd2qhQKw==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/helper-validator-identifier": "^7.29.7",
        "js-tokens": "^4.0.0",
        "picocolors": "^1.1.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-validator-identifier": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-validator-identifier/-/helper-validator-identifier-7.29.7.tgz",
      "integrity": "sha512-qehxGkRj55h/ff8EMaJ+cYhyaKlHIxqYDn682wQD7RNp9UujOQsHog2uS0r2vzr4pW+sXf90NeeayjcNaX3fFg==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/runtime": {
      "version": "7.28.2",
      "resolved": "https://registry.npmjs.org/@babel/runtime/-/runtime-7.28.2.tgz",
      "integrity": "sha512-KHp2IflsnGywDjBWDkR9iEqiWSpc8GIi0lgTT3mOElT0PP1tG26P4tmFI2YvAdzgq9RGyoHZQEIEdZy6Ec5xCA==",
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@bramus/specificity": {
      "version": "2.4.2",
      "resolved": "https://registry.npmjs.org/@bramus/specificity/-/specificity-2.4.2.tgz",
      "integrity": "sha512-ctxtJ/eA+t+6q2++vj5j7FYX3nRu311q1wfYH3xjlLOsczhlhxAg2FWNUXhpGvAw3BWo1xBcvOV6/YLc2r5FJw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "css-tree": "^3.0.0"
      },
      "bin": {
        "specificity": "bin/cli.js"
      }
    },
    "node_modules/@csstools/color-helpers": {
      "version": "6.0.2",
      "resolved": "https://registry.npmjs.org/@csstools/color-helpers/-/color-helpers-6.0.2.tgz",
      "integrity": "sha512-LMGQLS9EuADloEFkcTBR3BwV/CGHV7zyDxVRtVDTwdI2Ca4it0CCVTT9wCkxSgokjE5Ho41hEPgb8OEUwoXr6Q==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/csstools"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/csstools"
        }
      ],
      "license": "MIT-0",
      "engines": {
        "node": ">=20.19.0"
      }
    },
    "node_modules/@csstools/css-calc": {
      "version": "3.2.1",
      "resolved": "https://registry.npmjs.org/@csstools/css-calc/-/css-calc-3.2.1.tgz",
      "integrity": "sha512-DtdHlgXh5ZkA43cwBcAm+huzgJiwx3ZTWVjBs94kwz2xKqSimDA3lBgCjphYgwgVUMWatSM0pDd8TILB1yrVVg==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/csstools"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/csstools"
        }
      ],
      "license": "MIT",
      "engines": {
        "node": ">=20.19.0"
      },
      "peerDependencies": {
        "@csstools/css-parser-algorithms": "^4.0.0",
        "@csstools/css-tokenizer": "^4.0.0"
      }
    },
    "node_modules/@csstools/css-color-parser": {
      "version": "4.1.7",
      "resolved": "https://registry.npmjs.org/@csstools/css-color-parser/-/css-color-parser-4.1.7.tgz",
      "integrity": "sha512-CmjJFQTFQx/U/xNJhSjCQ0ilpesPmNQ8+eOUeM/+kDOVW33qsIjeOXc27vrQDdWVkf83ZSWwtg7kXSUvKDJ8cQ==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/csstools"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/csstools"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "@csstools/color-helpers": "^6.0.2",
        "@csstools/css-calc": "^3.2.1"
      },
      "engines": {
        "node": ">=20.19.0"
      },
      "peerDependencies": {
        "@csstools/css-parser-algorithms": "^4.0.0",
        "@csstools/css-tokenizer": "^4.0.0"
      }
    },
    "node_modules/@csstools/css-parser-algorithms": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/@csstools/css-parser-algorithms/-/css-parser-algorithms-4.0.0.tgz",
      "integrity": "sha512-+B87qS7fIG3L5h3qwJ/IFbjoVoOe/bpOdh9hAjXbvx0o8ImEmUsGXN0inFOnk2ChCFgqkkGFQ+TpM5rbhkKe4w==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/csstools"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/csstools"
        }
      ],
      "license": "MIT",
      "engines": {
        "node": ">=20.19.0"
      },
      "peerDependencies": {
        "@csstools/css-tokenizer": "^4.0.0"
      }
    },
    "node_modules/@csstools/css-syntax-patches-for-csstree": {
      "version": "1.1.5",
      "resolved": "https://registry.npmjs.org/@csstools/css-syntax-patches-for-csstree/-/css-syntax-patches-for-csstree-1.1.5.tgz",
      "integrity": "sha512-oNjBvzLq2GPZtJphCjLqXow/cHySHSgtxvKZb7OqSZ/xHgw6NWNhfad+6AB9cLeVm6eA9d/qMll3JdEHjy6M+A==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/csstools"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/csstools"
        }
      ],
      "license": "MIT-0",
      "peerDependencies": {
        "css-tree": "^3.2.1"
      },
      "peerDependenciesMeta": {
        "css-tree": {
          "optional": true
        }
      }
    },
    "node_modules/@csstools/css-tokenizer": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/@csstools/css-tokenizer/-/css-tokenizer-4.0.0.tgz",
      "integrity": "sha512-QxULHAm7cNu72w97JUNCBFODFaXpbDg+dP8b/oWFAZ2MTRppA3U00Y2L1HqaS4J6yBqxwa/Y3nMBaxVKbB/NsA==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/csstools"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/csstools"
        }
      ],
      "license": "MIT",
      "engines": {
        "node": ">=20.19.0"
      }
    },
    "node_modules/@emnapi/core": {
      "version": "1.10.0",
      "resolved": "https://registry.npmjs.org/@emnapi/core/-/core-1.10.0.tgz",
      "integrity": "sha512-yq6OkJ4p82CAfPl0u9mQebQHKPJkY7WrIuk205cTYnYe+k2Z8YBh11FrbRG/H6ihirqcacOgl2BIO8oyMQLeXw==",
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "@emnapi/wasi-threads": "1.2.1",
        "tslib": "^2.4.0"
      }
    },
    "node_modules/@emnapi/runtime": {
      "version": "1.10.0",
      "resolved": "https://registry.npmjs.org/@emnapi/runtime/-/runtime-1.10.0.tgz",
      "integrity": "sha512-ewvYlk86xUoGI0zQRNq/mC+16R1QeDlKQy21Ki3oSYXNgLb45GV1P6A0M+/s6nyCuNDqe5VpaY84BzXGwVbwFA==",
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "tslib": "^2.4.0"
      }
    },
    "node_modules/@emnapi/wasi-threads": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/@emnapi/wasi-threads/-/wasi-threads-1.2.1.tgz",
      "integrity": "sha512-uTII7OYF+/Mes/MrcIOYp5yOtSMLBWSIoLPpcgwipoiKbli6k322tcoFsxoIIxPDqW01SQGAgko4EzZi2BNv2w==",
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "tslib": "^2.4.0"
      }
    },
    "node_modules/@esbuild/aix-ppc64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.21.5.tgz",
      "integrity": "sha512-1SDgH6ZSPTlggy1yI6+Dbkiz8xzpHJEVAlF/AM1tHPLsf5STom9rwtjE4hKAF20FfXXNTFqEYXyJNWh1GiZedQ==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "aix"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/android-arm": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.21.5.tgz",
      "integrity": "sha512-vCPvzSjpPHEi1siZdlvAlsPxXl7WbOVUBBAowWug4rJHb68Ox8KualB+1ocNvT5fjv6wpkX6o/iEpbDrf68zcg==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/android-arm64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.21.5.tgz",
      "integrity": "sha512-c0uX9VAUBQ7dTDCjq+wdyGLowMdtR/GoC2U5IYk/7D1H1JYC0qseD7+11iMP2mRLN9RcCMRcjC4YMclCzGwS/A==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/android-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.21.5.tgz",
      "integrity": "sha512-D7aPRUUNHRBwHxzxRvp856rjUHRFW1SdQATKXH2hqA0kAZb1hKmi02OpYRacl0TxIGz/ZmXWlbZgjwWYaCakTA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/darwin-arm64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.21.5.tgz",
      "integrity": "sha512-DwqXqZyuk5AiWWf3UfLiRDJ5EDd49zg6O9wclZ7kUMv2WRFr4HKjXp/5t8JZ11QbQfUS6/cRCKGwYhtNAY88kQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/darwin-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.21.5.tgz",
      "integrity": "sha512-se/JjF8NlmKVG4kNIuyWMV/22ZaerB+qaSi5MdrXtd6R08kvs2qCN4C09miupktDitvh8jRFflwGFBQcxZRjbw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/freebsd-arm64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.21.5.tgz",
      "integrity": "sha512-5JcRxxRDUJLX8JXp/wcBCy3pENnCgBR9bN6JsY4OmhfUtIHe3ZW0mawA7+RDAcMLrMIZaf03NlQiX9DGyB8h4g==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/freebsd-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.21.5.tgz",
      "integrity": "sha512-J95kNBj1zkbMXtHVH29bBriQygMXqoVQOQYA+ISs0/2l3T9/kj42ow2mpqerRBxDJnmkUDCaQT/dfNXWX/ZZCQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-arm": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.21.5.tgz",
      "integrity": "sha512-bPb5AHZtbeNGjCKVZ9UGqGwo8EUu4cLq68E95A53KlxAPRmUyYv2D6F0uUI65XisGOL1hBP5mTronbgo+0bFcA==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-arm64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.21.5.tgz",
      "integrity": "sha512-ibKvmyYzKsBeX8d8I7MH/TMfWDXBF3db4qM6sy+7re0YXya+K1cem3on9XgdT2EQGMu4hQyZhan7TeQ8XkGp4Q==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-ia32": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.21.5.tgz",
      "integrity": "sha512-YvjXDqLRqPDl2dvRODYmmhz4rPeVKYvppfGYKSNGdyZkA01046pLWyRKKI3ax8fbJoK5QbxblURkwK/MWY18Tg==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-loong64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.21.5.tgz",
      "integrity": "sha512-uHf1BmMG8qEvzdrzAqg2SIG/02+4/DHB6a9Kbya0XDvwDEKCoC8ZRWI5JJvNdUjtciBGFQ5PuBlpEOXQj+JQSg==",
      "cpu": [
        "loong64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-mips64el": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.21.5.tgz",
      "integrity": "sha512-IajOmO+KJK23bj52dFSNCMsz1QP1DqM6cwLUv3W1QwyxkyIWecfafnI555fvSGqEKwjMXVLokcV5ygHW5b3Jbg==",
      "cpu": [
        "mips64el"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-ppc64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.21.5.tgz",
      "integrity": "sha512-1hHV/Z4OEfMwpLO8rp7CvlhBDnjsC3CttJXIhBi+5Aj5r+MBvy4egg7wCbe//hSsT+RvDAG7s81tAvpL2XAE4w==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-riscv64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.21.5.tgz",
      "integrity": "sha512-2HdXDMd9GMgTGrPWnJzP2ALSokE/0O5HhTUvWIbD3YdjME8JwvSCnNGBnTThKGEB91OZhzrJ4qIIxk/SBmyDDA==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-s390x": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.21.5.tgz",
      "integrity": "sha512-zus5sxzqBJD3eXxwvjN1yQkRepANgxE9lgOW2qLnmr8ikMTphkjgXu1HR01K4FJg8h1kEEDAqDcZQtbrRnB41A==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.21.5.tgz",
      "integrity": "sha512-1rYdTpyv03iycF1+BhzrzQJCdOuAOtaqHTWJZCWvijKD2N5Xu0TtVC8/+1faWqcP9iBCWOmjmhoH94dH82BxPQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/netbsd-arm64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-arm64/-/netbsd-arm64-0.28.1.tgz",
      "integrity": "sha512-oks0DYbLwWMmaakTsCb+zL4E+aHRVLom9IJZOAthMQEPiQmydXHkziYEsGYRx0uNV/IjEKGAV941JzH02pflqw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "peer": true,
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/netbsd-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.21.5.tgz",
      "integrity": "sha512-Woi2MXzXjMULccIwMnLciyZH4nCIMpWQAs049KEeMvOcNADVxo0UBIQPfSmxB3CWKedngg7sWZdLvLczpe0tLg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/openbsd-arm64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-arm64/-/openbsd-arm64-0.28.1.tgz",
      "integrity": "sha512-MEFJe5C3R8pwXdZ5Y21oo6m7ePiS0d9pWucn99O/wvyJZChoIQKrQDxKrGeW8F5+T0okTHesAmDeiHDTIq0V/Q==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "peer": true,
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/openbsd-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.21.5.tgz",
      "integrity": "sha512-HLNNw99xsvx12lFBUwoT8EVCsSvRNDVxNpjZ7bPn947b8gJPzeHWyNVhFsaerc0n3TsbOINvRP2byTZ5LKezow==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/openharmony-arm64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/openharmony-arm64/-/openharmony-arm64-0.28.1.tgz",
      "integrity": "sha512-ge+Z7EXFNt2BO1oAMsVpiQ8EwndV9i1xXerAeTIK7AtPs3bKFXQM7nlRxDSIUIMeueR1CNXxqztLzdNeReKBJg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ],
      "peer": true,
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/sunos-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.21.5.tgz",
      "integrity": "sha512-6+gjmFpfy0BHU5Tpptkuh8+uw3mnrvgs+dSPQXQOv3ekbordwnzTVEb4qnIvQcYXq6gzkyTnoZ9dZG+D4garKg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "sunos"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/win32-arm64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.21.5.tgz",
      "integrity": "sha512-Z0gOTd75VvXqyq7nsl93zwahcTROgqvuAcYDUr+vOv8uHhNSKROyU961kgtCD1e95IqPKSQKH7tBTslnS3tA8A==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/win32-ia32": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.21.5.tgz",
      "integrity": "sha512-SWXFF1CL2RVNMaVs+BBClwtfZSvDgtL//G/smwAc5oVK/UPu2Gu9tIaRgFmYFFKrmg3SyAjSrElf0TiJ1v8fYA==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/win32-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.21.5.tgz",
      "integrity": "sha512-tQd/1efJuzPC6rCFwEvLtci/xNFcTZknmXs98FYDfGE4wP9ClFV98nyKrzJKVPMhdDnjzLhdUyMX4PsQAPjwIw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@eslint-community/eslint-utils": {
      "version": "4.7.0",
      "resolved": "https://registry.npmjs.org/@eslint-community/eslint-utils/-/eslint-utils-4.7.0.tgz",
      "integrity": "sha512-dyybb3AcajC7uha6CvhdVRJqaKyn7w2YKqKyAN37NKYgZT36w+iRb0Dymmc5qEJ549c/S31cMMSFd75bteCpCw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "eslint-visitor-keys": "^3.4.3"
      },
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      },
      "peerDependencies": {
        "eslint": "^6.0.0 || ^7.0.0 || >=8.0.0"
      }
    },
    "node_modules/@eslint-community/eslint-utils/node_modules/eslint-visitor-keys": {
      "version": "3.4.3",
      "resolved": "https://registry.npmjs.org/eslint-visitor-keys/-/eslint-visitor-keys-3.4.3.tgz",
      "integrity": "sha512-wpc+LXeiyiisxPlEkUzU6svyS1frIO3Mgxj1fdy7Pm8Ygzguax2N3Fa/D/ag1WqbOprdI+uY6wMUl8/a2G+iag==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/@eslint-community/regexpp": {
      "version": "4.12.1",
      "resolved": "https://registry.npmjs.org/@eslint-community/regexpp/-/regexpp-4.12.1.tgz",
      "integrity": "sha512-CCZCDJuduB9OUkFkY2IgppNZMi2lBQgD2qzwXkEia16cge2pijY/aXi96CJMquDMn3nJdlPV1A5KrJEXwfLNzQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^12.0.0 || ^14.0.0 || >=16.0.0"
      }
    },
    "node_modules/@eslint/config-array": {
      "version": "0.21.0",
      "resolved": "https://registry.npmjs.org/@eslint/config-array/-/config-array-0.21.0.tgz",
      "integrity": "sha512-ENIdc4iLu0d93HeYirvKmrzshzofPw6VkZRKQGe9Nv46ZnWUzcF1xV01dcvEg/1wXUR61OmmlSfyeyO7EvjLxQ==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@eslint/object-schema": "^2.1.6",
        "debug": "^4.3.1",
        "minimatch": "^3.1.2"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      }
    },
    "node_modules/@eslint/config-helpers": {
      "version": "0.3.0",
      "resolved": "https://registry.npmjs.org/@eslint/config-helpers/-/config-helpers-0.3.0.tgz",
      "integrity": "sha512-ViuymvFmcJi04qdZeDc2whTHryouGcDlaxPqarTD0ZE10ISpxGUVZGZDx4w01upyIynL3iu6IXH2bS1NhclQMw==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      }
    },
    "node_modules/@eslint/core": {
      "version": "0.15.1",
      "resolved": "https://registry.npmjs.org/@eslint/core/-/core-0.15.1.tgz",
      "integrity": "sha512-bkOp+iumZCCbt1K1CmWf0R9pM5yKpDv+ZXtvSyQpudrI9kuFLp+bM2WOPXImuD/ceQuaa8f5pj93Y7zyECIGNA==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@types/json-schema": "^7.0.15"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      }
    },
    "node_modules/@eslint/eslintrc": {
      "version": "3.3.1",
      "resolved": "https://registry.npmjs.org/@eslint/eslintrc/-/eslintrc-3.3.1.tgz",
      "integrity": "sha512-gtF186CXhIl1p4pJNGZw8Yc6RlshoePRvE0X91oPGb3vZ8pM3qOS9W9NGPat9LziaBV7XrJWGylNQXkGcnM3IQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ajv": "^6.12.4",
        "debug": "^4.3.2",
        "espree": "^10.0.1",
        "globals": "^14.0.0",
        "ignore": "^5.2.0",
        "import-fresh": "^3.2.1",
        "js-yaml": "^4.1.0",
        "minimatch": "^3.1.2",
        "strip-json-comments": "^3.1.1"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/@eslint/eslintrc/node_modules/globals": {
      "version": "14.0.0",
      "resolved": "https://registry.npmjs.org/globals/-/globals-14.0.0.tgz",
      "integrity": "sha512-oahGvuMGQlPw/ivIYBjVSrWAfWLBeku5tpPE2fOPLi+WHffIWbuh2tCjhyQhTBPMf5E9jDEH4FOmTYgYwbKwtQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/@eslint/js": {
      "version": "9.32.0",
      "resolved": "https://registry.npmjs.org/@eslint/js/-/js-9.32.0.tgz",
      "integrity": "sha512-BBpRFZK3eX6uMLKz8WxFOBIFFcGFJ/g8XuwjTHCqHROSIsopI+ddn/d5Cfh36+7+e5edVS8dbSHnBNhrLEX0zg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://eslint.org/donate"
      }
    },
    "node_modules/@eslint/object-schema": {
      "version": "2.1.6",
      "resolved": "https://registry.npmjs.org/@eslint/object-schema/-/object-schema-2.1.6.tgz",
      "integrity": "sha512-RBMg5FRL0I0gs51M/guSAj5/e14VQ4tpZnQNWwuDT66P14I43ItmPfIZRhO9fUVIPOAQXU47atlywZ/czoqFPA==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      }
    },
    "node_modules/@eslint/plugin-kit": {
      "version": "0.3.4",
      "resolved": "https://registry.npmjs.org/@eslint/plugin-kit/-/plugin-kit-0.3.4.tgz",
      "integrity": "sha512-Ul5l+lHEcw3L5+k8POx6r74mxEYKG5kOb6Xpy2gCRW6zweT6TEhAf8vhxGgjhqrd/VO/Dirhsb+1hNpD1ue9hw==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@eslint/core": "^0.15.1",
        "levn": "^0.4.1"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      }
    },
    "node_modules/@exodus/bytes": {
      "version": "1.15.1",
      "resolved": "https://registry.npmjs.org/@exodus/bytes/-/bytes-1.15.1.tgz",
      "integrity": "sha512-S6mL0yNB/Abt9Ei4tq8gDhcczc4S3+vQ4ra7vxnAf+YHC02srtqxKKZghx2Dq6p0e66THKwR6r8N6P95wEty7Q==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
      },
      "peerDependencies": {
        "@noble/hashes": "^1.8.0 || ^2.0.0"
      },
      "peerDependenciesMeta": {
        "@noble/hashes": {
          "optional": true
        }
      }
    },
    "node_modules/@floating-ui/core": {
      "version": "1.7.2",
      "resolved": "https://registry.npmjs.org/@floating-ui/core/-/core-1.7.2.tgz",
      "integrity": "sha512-wNB5ooIKHQc+Kui96jE/n69rHFWAVoxn5CAzL1Xdd8FG03cgY3MLO+GF9U3W737fYDSgPWA6MReKhBQBop6Pcw==",
      "license": "MIT",
      "dependencies": {
        "@floating-ui/utils": "^0.2.10"
      }
    },
    "node_modules/@floating-ui/dom": {
      "version": "1.7.2",
      "resolved": "https://registry.npmjs.org/@floating-ui/dom/-/dom-1.7.2.tgz",
      "integrity": "sha512-7cfaOQuCS27HD7DX+6ib2OrnW+b4ZBwDNnCcT0uTyidcmyWb03FnQqJybDBoCnpdxwBSfA94UAYlRCt7mV+TbA==",
      "license": "MIT",
      "dependencies": {
        "@floating-ui/core": "^1.7.2",
        "@floating-ui/utils": "^0.2.10"
      }
    },
    "node_modules/@floating-ui/react-dom": {
      "version": "2.1.4",
      "resolved": "https://registry.npmjs.org/@floating-ui/react-dom/-/react-dom-2.1.4.tgz",
      "integrity": "sha512-JbbpPhp38UmXDDAu60RJmbeme37Jbgsm7NrHGgzYYFKmblzRUh6Pa641dII6LsjwF4XlScDrde2UAzDo/b9KPw==",
      "license": "MIT",
      "dependencies": {
        "@floating-ui/dom": "^1.7.2"
      },
      "peerDependencies": {
        "react": ">=16.8.0",
        "react-dom": ">=16.8.0"
      }
    },
    "node_modules/@floating-ui/utils": {
      "version": "0.2.10",
      "resolved": "https://registry.npmjs.org/@floating-ui/utils/-/utils-0.2.10.tgz",
      "integrity": "sha512-aGTxbpbg8/b5JfU1HXSrbH3wXZuLPJcNEcZQFMxLs3oSzgtVu6nFPkbbGGUvBcUjKV2YyB9Wxxabo+HEH9tcRQ==",
      "license": "MIT"
    },
    "node_modules/@hookform/resolvers": {
      "version": "3.10.0",
      "resolved": "https://registry.npmjs.org/@hookform/resolvers/-/resolvers-3.10.0.tgz",
      "integrity": "sha512-79Dv+3mDF7i+2ajj7SkypSKHhl1cbln1OGavqrsF7p6mbUv11xpqpacPsGDCTRvCSjEEIez2ef1NveSVL3b0Ag==",
      "license": "MIT",
      "peerDependencies": {
        "react-hook-form": "^7.0.0"
      }
    },
    "node_modules/@humanfs/core": {
      "version": "0.19.1",
      "resolved": "https://registry.npmjs.org/@humanfs/core/-/core-0.19.1.tgz",
      "integrity": "sha512-5DyQ4+1JEUzejeK1JGICcideyfUbGixgS9jNgex5nqkW+cY7WZhxBigmieN5Qnw9ZosSNVC9KQKyb+GUaGyKUA==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=18.18.0"
      }
    },
    "node_modules/@humanfs/node": {
      "version": "0.16.6",
      "resolved": "https://registry.npmjs.org/@humanfs/node/-/node-0.16.6.tgz",
      "integrity": "sha512-YuI2ZHQL78Q5HbhDiBA1X4LmYdXCKCMQIfw0pw7piHJwyREFebJUvrQN4cMssyES6x+vfUbx1CIpaQUKYdQZOw==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@humanfs/core": "^0.19.1",
        "@humanwhocodes/retry": "^0.3.0"
      },
      "engines": {
        "node": ">=18.18.0"
      }
    },
    "node_modules/@humanfs/node/node_modules/@humanwhocodes/retry": {
      "version": "0.3.1",
      "resolved": "https://registry.npmjs.org/@humanwhocodes/retry/-/retry-0.3.1.tgz",
      "integrity": "sha512-JBxkERygn7Bv/GbN5Rv8Ul6LVknS+5Bp6RgDC/O8gEBU/yeH5Ui5C/OlWrTb6qct7LjjfT6Re2NxB0ln0yYybA==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=18.18"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/nzakas"
      }
    },
    "node_modules/@humanwhocodes/module-importer": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/@humanwhocodes/module-importer/-/module-importer-1.0.1.tgz",
      "integrity": "sha512-bxveV4V8v5Yb4ncFTT3rPSgZBOpCkjfK0y4oVVVJwIuDVBRMDXrPyXRL988i5ap9m9bnyEEjWfm5WkBmtffLfA==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=12.22"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/nzakas"
      }
    },
    "node_modules/@humanwhocodes/retry": {
      "version": "0.4.3",
      "resolved": "https://registry.npmjs.org/@humanwhocodes/retry/-/retry-0.4.3.tgz",
      "integrity": "sha512-bV0Tgo9K4hfPCek+aMAn81RppFKv2ySDQeMoSZuvTASywNTnVJCArCZE2FWqpvIatKu7VMRLWlR1EazvVhDyhQ==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=18.18"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/nzakas"
      }
    },
    "node_modules/@isaacs/cliui": {
      "version": "8.0.2",
      "resolved": "https://registry.npmjs.org/@isaacs/cliui/-/cliui-8.0.2.tgz",
      "integrity": "sha512-O8jcjabXaleOG9DQ0+ARXWZBTfnP4WNAqzuiJK7ll44AmxGKv/J2M4TPjxjY3znBCfvBXFzucm1twdyFybFqEA==",
      "license": "ISC",
      "dependencies": {
        "string-width": "^5.1.2",
        "string-width-cjs": "npm:string-width@^4.2.0",
        "strip-ansi": "^7.0.1",
        "strip-ansi-cjs": "npm:strip-ansi@^6.0.1",
        "wrap-ansi": "^8.1.0",
        "wrap-ansi-cjs": "npm:wrap-ansi@^7.0.0"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@jridgewell/gen-mapping": {
      "version": "0.3.5",
      "resolved": "https://registry.npmjs.org/@jridgewell/gen-mapping/-/gen-mapping-0.3.5.tgz",
      "integrity": "sha512-IzL8ZoEDIBRWEzlCcRhOaCupYyN5gdIK+Q6fbFdPDg6HqX6jpkItn7DFIpW9LQzXG6Df9sA7+OKnq0qlz/GaQg==",
      "license": "MIT",
      "dependencies": {
        "@jridgewell/set-array": "^1.2.1",
        "@jridgewell/sourcemap-codec": "^1.4.10",
        "@jridgewell/trace-mapping": "^0.3.24"
      },
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@jridgewell/resolve-uri": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/@jridgewell/resolve-uri/-/resolve-uri-3.1.2.tgz",
      "integrity": "sha512-bRISgCIjP20/tbWSPWMEi54QVPRZExkuD9lJL+UIxUKtwVJA8wW1Trb1jMs1RFXo1CBTNZ/5hpC9QvmKWdopKw==",
      "license": "MIT",
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@jridgewell/set-array": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/@jridgewell/set-array/-/set-array-1.2.1.tgz",
      "integrity": "sha512-R8gLRTZeyp03ymzP/6Lil/28tGeGEzhx1q2k703KGWRAI1VdvPIXdG70VJc2pAMw3NA6JKL5hhFu1sJX0Mnn/A==",
      "license": "MIT",
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@jridgewell/sourcemap-codec": {
      "version": "1.5.5",
      "resolved": "https://registry.npmjs.org/@jridgewell/sourcemap-codec/-/sourcemap-codec-1.5.5.tgz",
      "integrity": "sha512-cYQ9310grqxueWbl+WuIUIaiUaDcj7WOq5fVhEljNVgRfOUhY9fy2zTvfoqWsnebh8Sl70VScFbICvJnLKB0Og==",
      "license": "MIT"
    },
    "node_modules/@jridgewell/trace-mapping": {
      "version": "0.3.25",
      "resolved": "https://registry.npmjs.org/@jridgewell/trace-mapping/-/trace-mapping-0.3.25.tgz",
      "integrity": "sha512-vNk6aEwybGtawWmy/PzwnGDOjCkLWSD2wqvjGGAgOAwCGWySYXfYoxt00IJkTF+8Lb57DwOb3Aa0o9CApepiYQ==",
      "license": "MIT",
      "dependencies": {
        "@jridgewell/resolve-uri": "^3.1.0",
        "@jridgewell/sourcemap-codec": "^1.4.14"
      }
    },
    "node_modules/@msgpack/msgpack": {
      "version": "2.8.0",
      "resolved": "https://registry.npmjs.org/@msgpack/msgpack/-/msgpack-2.8.0.tgz",
      "integrity": "sha512-h9u4u/jiIRKbq25PM+zymTyW6bhTzELvOoUd+AvYriWOAKpLGnIamaET3pnHYoI5iYphAHBI4ayx0MehR+VVPQ==",
      "license": "ISC",
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@napi-rs/wasm-runtime": {
      "version": "1.1.5",
      "resolved": "https://registry.npmjs.org/@napi-rs/wasm-runtime/-/wasm-runtime-1.1.5.tgz",
      "integrity": "sha512-AWPoBRJ9tsnVhor4sjO7rkni+7p+2IAEFj6cx06UgP10jkQHqay/36uRV/bFkgrh18D9vb4cr8Q0Pthskgzy+Q==",
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "@tybys/wasm-util": "^0.10.2"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/Brooooooklyn"
      },
      "peerDependencies": {
        "@emnapi/core": "^1.7.1",
        "@emnapi/runtime": "^1.7.1"
      }
    },
    "node_modules/@nodelib/fs.scandir": {
      "version": "2.1.5",
      "resolved": "https://registry.npmjs.org/@nodelib/fs.scandir/-/fs.scandir-2.1.5.tgz",
      "integrity": "sha512-vq24Bq3ym5HEQm2NKCr3yXDwjc7vTsEThRDnkp2DK9p1uqLR+DHurm/NOTo0KG7HYHU7eppKZj3MyqYuMBf62g==",
      "license": "MIT",
      "dependencies": {
        "@nodelib/fs.stat": "2.0.5",
        "run-parallel": "^1.1.9"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/@nodelib/fs.stat": {
      "version": "2.0.5",
      "resolved": "https://registry.npmjs.org/@nodelib/fs.stat/-/fs.stat-2.0.5.tgz",
      "integrity": "sha512-RkhPPp2zrqDAQA/2jNhnztcPAlv64XdhIp7a7454A5ovI7Bukxgt7MX7udwAu3zg1DcpPU0rz3VV1SeaqvY4+A==",
      "license": "MIT",
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/@nodelib/fs.walk": {
      "version": "1.2.8",
      "resolved": "https://registry.npmjs.org/@nodelib/fs.walk/-/fs.walk-1.2.8.tgz",
      "integrity": "sha512-oGB+UxlgWcgQkgwo8GcEGwemoTFt3FIO9ababBmaGwXIoBKZ+GTy0pP185beGg7Llih/NSHSV2XAs1lnznocSg==",
      "license": "MIT",
      "dependencies": {
        "@nodelib/fs.scandir": "2.1.5",
        "fastq": "^1.6.0"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/@oxc-project/types": {
      "version": "0.133.0",
      "resolved": "https://registry.npmjs.org/@oxc-project/types/-/types-0.133.0.tgz",
      "integrity": "sha512-KzkdCd6Uxqnf6l3HOw1xfatAlUURA0g14cvBYFyJ5SaNOQbOUvBr9PKArcPcrNIeRsBdgcUzOGrhKveVpvOIGA==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/Boshen"
      }
    },
    "node_modules/@pkgjs/parseargs": {
      "version": "0.11.0",
      "resolved": "https://registry.npmjs.org/@pkgjs/parseargs/-/parseargs-0.11.0.tgz",
      "integrity": "sha512-+1VkjdD0QBLPodGrJUeqarH8VAIvQODIbwh9XpP5Syisf7YoQgsJKPNFoqqLQlu+VQ/tVSshMR6loPMn8U+dPg==",
      "license": "MIT",
      "optional": true,
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@playwright/test": {
      "version": "1.61.0",
      "resolved": "https://registry.npmjs.org/@playwright/test/-/test-1.61.0.tgz",
      "integrity": "sha512-cKA5B6lpFEMyMGjxF54QihfYpB4FkEGH+qZhtArDEG+wezQAJY8Pq6C7T1SjWz+FFzt3TbyoXBQYk/0292TdJA==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "playwright": "1.61.0"
      },
      "bin": {
        "playwright": "cli.js"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@polka/url": {
      "version": "1.0.0-next.29",
      "resolved": "https://registry.npmjs.org/@polka/url/-/url-1.0.0-next.29.tgz",
      "integrity": "sha512-wwQAWhWSuHaag8c4q/KN/vCoeOJYshAIvMQwD4GpSb3OiZklFfvAgmj0VCBBImRpuF/aFgIRzllXlVX93Jevww==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@radix-ui/number": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/@radix-ui/number/-/number-1.1.1.tgz",
      "integrity": "sha512-MkKCwxlXTgz6CFoJx3pCwn07GKp36+aZyu/u2Ln2VrA5DcdyCZkASEDBTd8x5whTQQL5CiYf4prXKLcgQdv29g==",
      "license": "MIT"
    },
    "node_modules/@radix-ui/primitive": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/@radix-ui/primitive/-/primitive-1.1.2.tgz",
      "integrity": "sha512-XnbHrrprsNqZKQhStrSwgRUQzoCI1glLzdw79xiZPoofhGICeZRSQ3dIxAKH1gb3OHfNf4d6f+vAv3kil2eggA==",
      "license": "MIT"
    },
    "node_modules/@radix-ui/react-accordion": {
      "version": "1.2.11",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-accordion/-/react-accordion-1.2.11.tgz",
      "integrity": "sha512-l3W5D54emV2ues7jjeG1xcyN7S3jnK3zE2zHqgn0CmMsy9lNJwmgcrmaxS+7ipw15FAivzKNzH3d5EcGoFKw0A==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.2",
        "@radix-ui/react-collapsible": "1.1.11",
        "@radix-ui/react-collection": "1.1.7",
        "@radix-ui/react-compose-refs": "1.1.2",
        "@radix-ui/react-context": "1.1.2",
        "@radix-ui/react-direction": "1.1.1",
        "@radix-ui/react-id": "1.1.1",
        "@radix-ui/react-primitive": "2.1.3",
        "@radix-ui/react-use-controllable-state": "1.2.2"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-alert-dialog": {
      "version": "1.1.14",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-alert-dialog/-/react-alert-dialog-1.1.14.tgz",
      "integrity": "sha512-IOZfZ3nPvN6lXpJTBCunFQPRSvK8MDgSc1FB85xnIpUKOw9en0dJj8JmCAxV7BiZdtYlUpmrQjoTFkVYtdoWzQ==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.2",
        "@radix-ui/react-compose-refs": "1.1.2",
        "@radix-ui/react-context": "1.1.2",
        "@radix-ui/react-dialog": "1.1.14",
        "@radix-ui/react-primitive": "2.1.3",
        "@radix-ui/react-slot": "1.2.3"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-arrow": {
      "version": "1.1.7",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-arrow/-/react-arrow-1.1.7.tgz",
      "integrity": "sha512-F+M1tLhO+mlQaOWspE8Wstg+z6PwxwRd8oQ8IXceWz92kfAmalTRf0EjrouQeo7QssEPfCn05B4Ihs1K9WQ/7w==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-primitive": "2.1.3"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-aspect-ratio": {
      "version": "1.1.7",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-aspect-ratio/-/react-aspect-ratio-1.1.7.tgz",
      "integrity": "sha512-Yq6lvO9HQyPwev1onK1daHCHqXVLzPhSVjmsNjCa2Zcxy2f7uJD2itDtxknv6FzAKCwD1qQkeVDmX/cev13n/g==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-primitive": "2.1.3"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-avatar": {
      "version": "1.1.10",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-avatar/-/react-avatar-1.1.10.tgz",
      "integrity": "sha512-V8piFfWapM5OmNCXTzVQY+E1rDa53zY+MQ4Y7356v4fFz6vqCyUtIz2rUD44ZEdwg78/jKmMJHj07+C/Z/rcog==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-context": "1.1.2",
        "@radix-ui/react-primitive": "2.1.3",
        "@radix-ui/react-use-callback-ref": "1.1.1",
        "@radix-ui/react-use-is-hydrated": "0.1.0",
        "@radix-ui/react-use-layout-effect": "1.1.1"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-checkbox": {
      "version": "1.3.2",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-checkbox/-/react-checkbox-1.3.2.tgz",
      "integrity": "sha512-yd+dI56KZqawxKZrJ31eENUwqc1QSqg4OZ15rybGjF2ZNwMO+wCyHzAVLRp9qoYJf7kYy0YpZ2b0JCzJ42HZpA==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.2",
        "@radix-ui/react-compose-refs": "1.1.2",
        "@radix-ui/react-context": "1.1.2",
        "@radix-ui/react-presence": "1.1.4",
        "@radix-ui/react-primitive": "2.1.3",
        "@radix-ui/react-use-controllable-state": "1.2.2",
        "@radix-ui/react-use-previous": "1.1.1",
        "@radix-ui/react-use-size": "1.1.1"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-collapsible": {
      "version": "1.1.11",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-collapsible/-/react-collapsible-1.1.11.tgz",
      "integrity": "sha512-2qrRsVGSCYasSz1RFOorXwl0H7g7J1frQtgpQgYrt+MOidtPAINHn9CPovQXb83r8ahapdx3Tu0fa/pdFFSdPg==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.2",
        "@radix-ui/react-compose-refs": "1.1.2",
        "@radix-ui/react-context": "1.1.2",
        "@radix-ui/react-id": "1.1.1",
        "@radix-ui/react-presence": "1.1.4",
        "@radix-ui/react-primitive": "2.1.3",
        "@radix-ui/react-use-controllable-state": "1.2.2",
        "@radix-ui/react-use-layout-effect": "1.1.1"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-collection": {
      "version": "1.1.7",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-collection/-/react-collection-1.1.7.tgz",
      "integrity": "sha512-Fh9rGN0MoI4ZFUNyfFVNU4y9LUz93u9/0K+yLgA2bwRojxM8JU1DyvvMBabnZPBgMWREAJvU2jjVzq+LrFUglw==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-compose-refs": "1.1.2",
        "@radix-ui/react-context": "1.1.2",
        "@radix-ui/react-primitive": "2.1.3",
        "@radix-ui/react-slot": "1.2.3"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-compose-refs": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-compose-refs/-/react-compose-refs-1.1.2.tgz",
      "integrity": "sha512-z4eqJvfiNnFMHIIvXP3CY57y2WJs5g2v3X0zm9mEJkrkNv4rDxu+sg9Jh8EkXyeqBkB7SOcboo9dMVqhyrACIg==",
      "license": "MIT",
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-context": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-context/-/react-context-1.1.2.tgz",
      "integrity": "sha512-jCi/QKUM2r1Ju5a3J64TH2A5SpKAgh0LpknyqdQ4m6DCV0xJ2HG1xARRwNGPQfi1SLdLWZ1OJz6F4OMBBNiGJA==",
      "license": "MIT",
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-context-menu": {
      "version": "2.2.15",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-context-menu/-/react-context-menu-2.2.15.tgz",
      "integrity": "sha512-UsQUMjcYTsBjTSXw0P3GO0werEQvUY2plgRQuKoCTtkNr45q1DiL51j4m7gxhABzZ0BadoXNsIbg7F3KwiUBbw==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.2",
        "@radix-ui/react-context": "1.1.2",
        "@radix-ui/react-menu": "2.1.15",
        "@radix-ui/react-primitive": "2.1.3",
        "@radix-ui/react-use-callback-ref": "1.1.1",
        "@radix-ui/react-use-controllable-state": "1.2.2"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-dialog": {
      "version": "1.1.14",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-dialog/-/react-dialog-1.1.14.tgz",
      "integrity": "sha512-+CpweKjqpzTmwRwcYECQcNYbI8V9VSQt0SNFKeEBLgfucbsLssU6Ppq7wUdNXEGb573bMjFhVjKVll8rmV6zMw==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.2",
        "@radix-ui/react-compose-refs": "1.1.2",
        "@radix-ui/react-context": "1.1.2",
        "@radix-ui/react-dismissable-layer": "1.1.10",
        "@radix-ui/react-focus-guards": "1.1.2",
        "@radix-ui/react-focus-scope": "1.1.7",
        "@radix-ui/react-id": "1.1.1",
        "@radix-ui/react-portal": "1.1.9",
        "@radix-ui/react-presence": "1.1.4",
        "@radix-ui/react-primitive": "2.1.3",
        "@radix-ui/react-slot": "1.2.3",
        "@radix-ui/react-use-controllable-state": "1.2.2",
        "aria-hidden": "^1.2.4",
        "react-remove-scroll": "^2.6.3"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-direction": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-direction/-/react-direction-1.1.1.tgz",
      "integrity": "sha512-1UEWRX6jnOA2y4H5WczZ44gOOjTEmlqv1uNW4GAJEO5+bauCBhv8snY65Iw5/VOS/ghKN9gr2KjnLKxrsvoMVw==",
      "license": "MIT",
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-dismissable-layer": {
      "version": "1.1.10",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-dismissable-layer/-/react-dismissable-layer-1.1.10.tgz",
      "integrity": "sha512-IM1zzRV4W3HtVgftdQiiOmA0AdJlCtMLe00FXaHwgt3rAnNsIyDqshvkIW3hj/iu5hu8ERP7KIYki6NkqDxAwQ==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.2",
        "@radix-ui/react-compose-refs": "1.1.2",
        "@radix-ui/react-primitive": "2.1.3",
        "@radix-ui/react-use-callback-ref": "1.1.1",
        "@radix-ui/react-use-escape-keydown": "1.1.1"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-dropdown-menu": {
      "version": "2.1.15",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-dropdown-menu/-/react-dropdown-menu-2.1.15.tgz",
      "integrity": "sha512-mIBnOjgwo9AH3FyKaSWoSu/dYj6VdhJ7frEPiGTeXCdUFHjl9h3mFh2wwhEtINOmYXWhdpf1rY2minFsmaNgVQ==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.2",
        "@radix-ui/react-compose-refs": "1.1.2",
        "@radix-ui/react-context": "1.1.2",
        "@radix-ui/react-id": "1.1.1",
        "@radix-ui/react-menu": "2.1.15",
        "@radix-ui/react-primitive": "2.1.3",
        "@radix-ui/react-use-controllable-state": "1.2.2"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-focus-guards": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-focus-guards/-/react-focus-guards-1.1.2.tgz",
      "integrity": "sha512-fyjAACV62oPV925xFCrH8DR5xWhg9KYtJT4s3u54jxp+L/hbpTY2kIeEFFbFe+a/HCE94zGQMZLIpVTPVZDhaA==",
      "license": "MIT",
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-focus-scope": {
      "version": "1.1.7",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-focus-scope/-/react-focus-scope-1.1.7.tgz",
      "integrity": "sha512-t2ODlkXBQyn7jkl6TNaw/MtVEVvIGelJDCG41Okq/KwUsJBwQ4XVZsHAVUkK4mBv3ewiAS3PGuUWuY2BoK4ZUw==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-compose-refs": "1.1.2",
        "@radix-ui/react-primitive": "2.1.3",
        "@radix-ui/react-use-callback-ref": "1.1.1"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-hover-card": {
      "version": "1.1.14",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-hover-card/-/react-hover-card-1.1.14.tgz",
      "integrity": "sha512-CPYZ24Mhirm+g6D8jArmLzjYu4Eyg3TTUHswR26QgzXBHBe64BO/RHOJKzmF/Dxb4y4f9PKyJdwm/O/AhNkb+Q==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.2",
        "@radix-ui/react-compose-refs": "1.1.2",
        "@radix-ui/react-context": "1.1.2",
        "@radix-ui/react-dismissable-layer": "1.1.10",
        "@radix-ui/react-popper": "1.2.7",
        "@radix-ui/react-portal": "1.1.9",
        "@radix-ui/react-presence": "1.1.4",
        "@radix-ui/react-primitive": "2.1.3",
        "@radix-ui/react-use-controllable-state": "1.2.2"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-id": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-id/-/react-id-1.1.1.tgz",
      "integrity": "sha512-kGkGegYIdQsOb4XjsfM97rXsiHaBwco+hFI66oO4s9LU+PLAC5oJ7khdOVFxkhsmlbpUqDAvXw11CluXP+jkHg==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-use-layout-effect": "1.1.1"
      },
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-label": {
      "version": "2.1.7",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-label/-/react-label-2.1.7.tgz",
      "integrity": "sha512-YT1GqPSL8kJn20djelMX7/cTRp/Y9w5IZHvfxQTVHrOqa2yMl7i/UfMqKRU5V7mEyKTrUVgJXhNQPVCG8PBLoQ==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-primitive": "2.1.3"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-menu": {
      "version": "2.1.15",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-menu/-/react-menu-2.1.15.tgz",
      "integrity": "sha512-tVlmA3Vb9n8SZSd+YSbuFR66l87Wiy4du+YE+0hzKQEANA+7cWKH1WgqcEX4pXqxUFQKrWQGHdvEfw00TjFiew==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.2",
        "@radix-ui/react-collection": "1.1.7",
        "@radix-ui/react-compose-refs": "1.1.2",
        "@radix-ui/react-context": "1.1.2",
        "@radix-ui/react-direction": "1.1.1",
        "@radix-ui/react-dismissable-layer": "1.1.10",
        "@radix-ui/react-focus-guards": "1.1.2",
        "@radix-ui/react-focus-scope": "1.1.7",
        "@radix-ui/react-id": "1.1.1",
        "@radix-ui/react-popper": "1.2.7",
        "@radix-ui/react-portal": "1.1.9",
        "@radix-ui/react-presence": "1.1.4",
        "@radix-ui/react-primitive": "2.1.3",
        "@radix-ui/react-roving-focus": "1.1.10",
        "@radix-ui/react-slot": "1.2.3",
        "@radix-ui/react-use-callback-ref": "1.1.1",
        "aria-hidden": "^1.2.4",
        "react-remove-scroll": "^2.6.3"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-menubar": {
      "version": "1.1.15",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-menubar/-/react-menubar-1.1.15.tgz",
      "integrity": "sha512-Z71C7LGD+YDYo3TV81paUs8f3Zbmkvg6VLRQpKYfzioOE6n7fOhA3ApK/V/2Odolxjoc4ENk8AYCjohCNayd5A==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.2",
        "@radix-ui/react-collection": "1.1.7",
        "@radix-ui/react-compose-refs": "1.1.2",
        "@radix-ui/react-context": "1.1.2",
        "@radix-ui/react-direction": "1.1.1",
        "@radix-ui/react-id": "1.1.1",
        "@radix-ui/react-menu": "2.1.15",
        "@radix-ui/react-primitive": "2.1.3",
        "@radix-ui/react-roving-focus": "1.1.10",
        "@radix-ui/react-use-controllable-state": "1.2.2"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-navigation-menu": {
      "version": "1.2.13",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-navigation-menu/-/react-navigation-menu-1.2.13.tgz",
      "integrity": "sha512-WG8wWfDiJlSF5hELjwfjSGOXcBR/ZMhBFCGYe8vERpC39CQYZeq1PQ2kaYHdye3V95d06H89KGMsVCIE4LWo3g==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.2",
        "@radix-ui/react-collection": "1.1.7",
        "@radix-ui/react-compose-refs": "1.1.2",
        "@radix-ui/react-context": "1.1.2",
        "@radix-ui/react-direction": "1.1.1",
        "@radix-ui/react-dismissable-layer": "1.1.10",
        "@radix-ui/react-id": "1.1.1",
        "@radix-ui/react-presence": "1.1.4",
        "@radix-ui/react-primitive": "2.1.3",
        "@radix-ui/react-use-callback-ref": "1.1.1",
        "@radix-ui/react-use-controllable-state": "1.2.2",
        "@radix-ui/react-use-layout-effect": "1.1.1",
        "@radix-ui/react-use-previous": "1.1.1",
        "@radix-ui/react-visually-hidden": "1.2.3"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-popover": {
      "version": "1.1.14",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-popover/-/react-popover-1.1.14.tgz",
      "integrity": "sha512-ODz16+1iIbGUfFEfKx2HTPKizg2MN39uIOV8MXeHnmdd3i/N9Wt7vU46wbHsqA0xoaQyXVcs0KIlBdOA2Y95bw==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.2",
        "@radix-ui/react-compose-refs": "1.1.2",
        "@radix-ui/react-context": "1.1.2",
        "@radix-ui/react-dismissable-layer": "1.1.10",
        "@radix-ui/react-focus-guards": "1.1.2",
        "@radix-ui/react-focus-scope": "1.1.7",
        "@radix-ui/react-id": "1.1.1",
        "@radix-ui/react-popper": "1.2.7",
        "@radix-ui/react-portal": "1.1.9",
        "@radix-ui/react-presence": "1.1.4",
        "@radix-ui/react-primitive": "2.1.3",
        "@radix-ui/react-slot": "1.2.3",
        "@radix-ui/react-use-controllable-state": "1.2.2",
        "aria-hidden": "^1.2.4",
        "react-remove-scroll": "^2.6.3"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-popper": {
      "version": "1.2.7",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-popper/-/react-popper-1.2.7.tgz",
      "integrity": "sha512-IUFAccz1JyKcf/RjB552PlWwxjeCJB8/4KxT7EhBHOJM+mN7LdW+B3kacJXILm32xawcMMjb2i0cIZpo+f9kiQ==",
      "license": "MIT",
      "dependencies": {
        "@floating-ui/react-dom": "^2.0.0",
        "@radix-ui/react-arrow": "1.1.7",
        "@radix-ui/react-compose-refs": "1.1.2",
        "@radix-ui/react-context": "1.1.2",
        "@radix-ui/react-primitive": "2.1.3",
        "@radix-ui/react-use-callback-ref": "1.1.1",
        "@radix-ui/react-use-layout-effect": "1.1.1",
        "@radix-ui/react-use-rect": "1.1.1",
        "@radix-ui/react-use-size": "1.1.1",
        "@radix-ui/rect": "1.1.1"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-portal": {
      "version": "1.1.9",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-portal/-/react-portal-1.1.9.tgz",
      "integrity": "sha512-bpIxvq03if6UNwXZ+HTK71JLh4APvnXntDc6XOX8UVq4XQOVl7lwok0AvIl+b8zgCw3fSaVTZMpAPPagXbKmHQ==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-primitive": "2.1.3",
        "@radix-ui/react-use-layout-effect": "1.1.1"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-presence": {
      "version": "1.1.4",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-presence/-/react-presence-1.1.4.tgz",
      "integrity": "sha512-ueDqRbdc4/bkaQT3GIpLQssRlFgWaL/U2z/S31qRwwLWoxHLgry3SIfCwhxeQNbirEUXFa+lq3RL3oBYXtcmIA==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-compose-refs": "1.1.2",
        "@radix-ui/react-use-layout-effect": "1.1.1"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-primitive": {
      "version": "2.1.3",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-primitive/-/react-primitive-2.1.3.tgz",
      "integrity": "sha512-m9gTwRkhy2lvCPe6QJp4d3G1TYEUHn/FzJUtq9MjH46an1wJU+GdoGC5VLof8RX8Ft/DlpshApkhswDLZzHIcQ==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-slot": "1.2.3"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-progress": {
      "version": "1.1.7",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-progress/-/react-progress-1.1.7.tgz",
      "integrity": "sha512-vPdg/tF6YC/ynuBIJlk1mm7Le0VgW6ub6J2UWnTQ7/D23KXcPI1qy+0vBkgKgd38RCMJavBXpB83HPNFMTb0Fg==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-context": "1.1.2",
        "@radix-ui/react-primitive": "2.1.3"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-radio-group": {
      "version": "1.3.7",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-radio-group/-/react-radio-group-1.3.7.tgz",
      "integrity": "sha512-9w5XhD0KPOrm92OTTE0SysH3sYzHsSTHNvZgUBo/VZ80VdYyB5RneDbc0dKpURS24IxkoFRu/hI0i4XyfFwY6g==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.2",
        "@radix-ui/react-compose-refs": "1.1.2",
        "@radix-ui/react-context": "1.1.2",
        "@radix-ui/react-direction": "1.1.1",
        "@radix-ui/react-presence": "1.1.4",
        "@radix-ui/react-primitive": "2.1.3",
        "@radix-ui/react-roving-focus": "1.1.10",
        "@radix-ui/react-use-controllable-state": "1.2.2",
        "@radix-ui/react-use-previous": "1.1.1",
        "@radix-ui/react-use-size": "1.1.1"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-roving-focus": {
      "version": "1.1.10",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-roving-focus/-/react-roving-focus-1.1.10.tgz",
      "integrity": "sha512-dT9aOXUen9JSsxnMPv/0VqySQf5eDQ6LCk5Sw28kamz8wSOW2bJdlX2Bg5VUIIcV+6XlHpWTIuTPCf/UNIyq8Q==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.2",
        "@radix-ui/react-collection": "1.1.7",
        "@radix-ui/react-compose-refs": "1.1.2",
        "@radix-ui/react-context": "1.1.2",
        "@radix-ui/react-direction": "1.1.1",
        "@radix-ui/react-id": "1.1.1",
        "@radix-ui/react-primitive": "2.1.3",
        "@radix-ui/react-use-callback-ref": "1.1.1",
        "@radix-ui/react-use-controllable-state": "1.2.2"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-scroll-area": {
      "version": "1.2.9",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-scroll-area/-/react-scroll-area-1.2.9.tgz",
      "integrity": "sha512-YSjEfBXnhUELsO2VzjdtYYD4CfQjvao+lhhrX5XsHD7/cyUNzljF1FHEbgTPN7LH2MClfwRMIsYlqTYpKTTe2A==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/number": "1.1.1",
        "@radix-ui/primitive": "1.1.2",
        "@radix-ui/react-compose-refs": "1.1.2",
        "@radix-ui/react-context": "1.1.2",
        "@radix-ui/react-direction": "1.1.1",
        "@radix-ui/react-presence": "1.1.4",
        "@radix-ui/react-primitive": "2.1.3",
        "@radix-ui/react-use-callback-ref": "1.1.1",
        "@radix-ui/react-use-layout-effect": "1.1.1"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-select": {
      "version": "2.2.5",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-select/-/react-select-2.2.5.tgz",
      "integrity": "sha512-HnMTdXEVuuyzx63ME0ut4+sEMYW6oouHWNGUZc7ddvUWIcfCva/AMoqEW/3wnEllriMWBa0RHspCYnfCWJQYmA==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/number": "1.1.1",
        "@radix-ui/primitive": "1.1.2",
        "@radix-ui/react-collection": "1.1.7",
        "@radix-ui/react-compose-refs": "1.1.2",
        "@radix-ui/react-context": "1.1.2",
        "@radix-ui/react-direction": "1.1.1",
        "@radix-ui/react-dismissable-layer": "1.1.10",
        "@radix-ui/react-focus-guards": "1.1.2",
        "@radix-ui/react-focus-scope": "1.1.7",
        "@radix-ui/react-id": "1.1.1",
        "@radix-ui/react-popper": "1.2.7",
        "@radix-ui/react-portal": "1.1.9",
        "@radix-ui/react-primitive": "2.1.3",
        "@radix-ui/react-slot": "1.2.3",
        "@radix-ui/react-use-callback-ref": "1.1.1",
        "@radix-ui/react-use-controllable-state": "1.2.2",
        "@radix-ui/react-use-layout-effect": "1.1.1",
        "@radix-ui/react-use-previous": "1.1.1",
        "@radix-ui/react-visually-hidden": "1.2.3",
        "aria-hidden": "^1.2.4",
        "react-remove-scroll": "^2.6.3"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-separator": {
      "version": "1.1.7",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-separator/-/react-separator-1.1.7.tgz",
      "integrity": "sha512-0HEb8R9E8A+jZjvmFCy/J4xhbXy3TV+9XSnGJ3KvTtjlIUy/YQ/p6UYZvi7YbeoeXdyU9+Y3scizK6hkY37baA==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-primitive": "2.1.3"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-slider": {
      "version": "1.3.5",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-slider/-/react-slider-1.3.5.tgz",
      "integrity": "sha512-rkfe2pU2NBAYfGaxa3Mqosi7VZEWX5CxKaanRv0vZd4Zhl9fvQrg0VM93dv3xGLGfrHuoTRF3JXH8nb9g+B3fw==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/number": "1.1.1",
        "@radix-ui/primitive": "1.1.2",
        "@radix-ui/react-collection": "1.1.7",
        "@radix-ui/react-compose-refs": "1.1.2",
        "@radix-ui/react-context": "1.1.2",
        "@radix-ui/react-direction": "1.1.1",
        "@radix-ui/react-primitive": "2.1.3",
        "@radix-ui/react-use-controllable-state": "1.2.2",
        "@radix-ui/react-use-layout-effect": "1.1.1",
        "@radix-ui/react-use-previous": "1.1.1",
        "@radix-ui/react-use-size": "1.1.1"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-slot": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-slot/-/react-slot-1.2.3.tgz",
      "integrity": "sha512-aeNmHnBxbi2St0au6VBVC7JXFlhLlOnvIIlePNniyUNAClzmtAUEY8/pBiK3iHjufOlwA+c20/8jngo7xcrg8A==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-compose-refs": "1.1.2"
      },
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-switch": {
      "version": "1.2.5",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-switch/-/react-switch-1.2.5.tgz",
      "integrity": "sha512-5ijLkak6ZMylXsaImpZ8u4Rlf5grRmoc0p0QeX9VJtlrM4f5m3nCTX8tWga/zOA8PZYIR/t0p2Mnvd7InrJ6yQ==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.2",
        "@radix-ui/react-compose-refs": "1.1.2",
        "@radix-ui/react-context": "1.1.2",
        "@radix-ui/react-primitive": "2.1.3",
        "@radix-ui/react-use-controllable-state": "1.2.2",
        "@radix-ui/react-use-previous": "1.1.1",
        "@radix-ui/react-use-size": "1.1.1"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-tabs": {
      "version": "1.1.12",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-tabs/-/react-tabs-1.1.12.tgz",
      "integrity": "sha512-GTVAlRVrQrSw3cEARM0nAx73ixrWDPNZAruETn3oHCNP6SbZ/hNxdxp+u7VkIEv3/sFoLq1PfcHrl7Pnp0CDpw==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.2",
        "@radix-ui/react-context": "1.1.2",
        "@radix-ui/react-direction": "1.1.1",
        "@radix-ui/react-id": "1.1.1",
        "@radix-ui/react-presence": "1.1.4",
        "@radix-ui/react-primitive": "2.1.3",
        "@radix-ui/react-roving-focus": "1.1.10",
        "@radix-ui/react-use-controllable-state": "1.2.2"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-toast": {
      "version": "1.2.14",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-toast/-/react-toast-1.2.14.tgz",
      "integrity": "sha512-nAP5FBxBJGQ/YfUB+r+O6USFVkWq3gAInkxyEnmvEV5jtSbfDhfa4hwX8CraCnbjMLsE7XSf/K75l9xXY7joWg==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.2",
        "@radix-ui/react-collection": "1.1.7",
        "@radix-ui/react-compose-refs": "1.1.2",
        "@radix-ui/react-context": "1.1.2",
        "@radix-ui/react-dismissable-layer": "1.1.10",
        "@radix-ui/react-portal": "1.1.9",
        "@radix-ui/react-presence": "1.1.4",
        "@radix-ui/react-primitive": "2.1.3",
        "@radix-ui/react-use-callback-ref": "1.1.1",
        "@radix-ui/react-use-controllable-state": "1.2.2",
        "@radix-ui/react-use-layout-effect": "1.1.1",
        "@radix-ui/react-visually-hidden": "1.2.3"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-toggle": {
      "version": "1.1.9",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-toggle/-/react-toggle-1.1.9.tgz",
      "integrity": "sha512-ZoFkBBz9zv9GWer7wIjvdRxmh2wyc2oKWw6C6CseWd6/yq1DK/l5lJ+wnsmFwJZbBYqr02mrf8A2q/CVCuM3ZA==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.2",
        "@radix-ui/react-primitive": "2.1.3",
        "@radix-ui/react-use-controllable-state": "1.2.2"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-toggle-group": {
      "version": "1.1.10",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-toggle-group/-/react-toggle-group-1.1.10.tgz",
      "integrity": "sha512-kiU694Km3WFLTC75DdqgM/3Jauf3rD9wxeS9XtyWFKsBUeZA337lC+6uUazT7I1DhanZ5gyD5Stf8uf2dbQxOQ==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.2",
        "@radix-ui/react-context": "1.1.2",
        "@radix-ui/react-direction": "1.1.1",
        "@radix-ui/react-primitive": "2.1.3",
        "@radix-ui/react-roving-focus": "1.1.10",
        "@radix-ui/react-toggle": "1.1.9",
        "@radix-ui/react-use-controllable-state": "1.2.2"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-tooltip": {
      "version": "1.2.7",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-tooltip/-/react-tooltip-1.2.7.tgz",
      "integrity": "sha512-Ap+fNYwKTYJ9pzqW+Xe2HtMRbQ/EeWkj2qykZ6SuEV4iS/o1bZI5ssJbk4D2r8XuDuOBVz/tIx2JObtuqU+5Zw==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.2",
        "@radix-ui/react-compose-refs": "1.1.2",
        "@radix-ui/react-context": "1.1.2",
        "@radix-ui/react-dismissable-layer": "1.1.10",
        "@radix-ui/react-id": "1.1.1",
        "@radix-ui/react-popper": "1.2.7",
        "@radix-ui/react-portal": "1.1.9",
        "@radix-ui/react-presence": "1.1.4",
        "@radix-ui/react-primitive": "2.1.3",
        "@radix-ui/react-slot": "1.2.3",
        "@radix-ui/react-use-controllable-state": "1.2.2",
        "@radix-ui/react-visually-hidden": "1.2.3"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-use-callback-ref": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-use-callback-ref/-/react-use-callback-ref-1.1.1.tgz",
      "integrity": "sha512-FkBMwD+qbGQeMu1cOHnuGB6x4yzPjho8ap5WtbEJ26umhgqVXbhekKUQO+hZEL1vU92a3wHwdp0HAcqAUF5iDg==",
      "license": "MIT",
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-use-controllable-state": {
      "version": "1.2.2",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-use-controllable-state/-/react-use-controllable-state-1.2.2.tgz",
      "integrity": "sha512-BjasUjixPFdS+NKkypcyyN5Pmg83Olst0+c6vGov0diwTEo6mgdqVR6hxcEgFuh4QrAs7Rc+9KuGJ9TVCj0Zzg==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-use-effect-event": "0.0.2",
        "@radix-ui/react-use-layout-effect": "1.1.1"
      },
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-use-effect-event": {
      "version": "0.0.2",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-use-effect-event/-/react-use-effect-event-0.0.2.tgz",
      "integrity": "sha512-Qp8WbZOBe+blgpuUT+lw2xheLP8q0oatc9UpmiemEICxGvFLYmHm9QowVZGHtJlGbS6A6yJ3iViad/2cVjnOiA==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-use-layout-effect": "1.1.1"
      },
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-use-escape-keydown": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-use-escape-keydown/-/react-use-escape-keydown-1.1.1.tgz",
      "integrity": "sha512-Il0+boE7w/XebUHyBjroE+DbByORGR9KKmITzbR7MyQ4akpORYP/ZmbhAr0DG7RmmBqoOnZdy2QlvajJ2QA59g==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-use-callback-ref": "1.1.1"
      },
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-use-is-hydrated": {
      "version": "0.1.0",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-use-is-hydrated/-/react-use-is-hydrated-0.1.0.tgz",
      "integrity": "sha512-U+UORVEq+cTnRIaostJv9AGdV3G6Y+zbVd+12e18jQ5A3c0xL03IhnHuiU4UV69wolOQp5GfR58NW/EgdQhwOA==",
      "license": "MIT",
      "dependencies": {
        "use-sync-external-store": "^1.5.0"
      },
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-use-layout-effect": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-use-layout-effect/-/react-use-layout-effect-1.1.1.tgz",
      "integrity": "sha512-RbJRS4UWQFkzHTTwVymMTUv8EqYhOp8dOOviLj2ugtTiXRaRQS7GLGxZTLL1jWhMeoSCf5zmcZkqTl9IiYfXcQ==",
      "license": "MIT",
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-use-previous": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-use-previous/-/react-use-previous-1.1.1.tgz",
      "integrity": "sha512-2dHfToCj/pzca2Ck724OZ5L0EVrr3eHRNsG/b3xQJLA2hZpVCS99bLAX+hm1IHXDEnzU6by5z/5MIY794/a8NQ==",
      "license": "MIT",
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-use-rect": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-use-rect/-/react-use-rect-1.1.1.tgz",
      "integrity": "sha512-QTYuDesS0VtuHNNvMh+CjlKJ4LJickCMUAqjlE3+j8w+RlRpwyX3apEQKGFzbZGdo7XNG1tXa+bQqIE7HIXT2w==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/rect": "1.1.1"
      },
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-use-size": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-use-size/-/react-use-size-1.1.1.tgz",
      "integrity": "sha512-ewrXRDTAqAXlkl6t/fkXWNAhFX9I+CkKlw6zjEwk86RSPKwZr3xpBRso655aqYafwtnbpHLj6toFzmd6xdVptQ==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-use-layout-effect": "1.1.1"
      },
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-visually-hidden": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-visually-hidden/-/react-visually-hidden-1.2.3.tgz",
      "integrity": "sha512-pzJq12tEaaIhqjbzpCuv/OypJY/BPavOofm+dbab+MHLajy277+1lLm6JFcGgF5eskJ6mquGirhXY2GD/8u8Ug==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-primitive": "2.1.3"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/rect": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/@radix-ui/rect/-/rect-1.1.1.tgz",
      "integrity": "sha512-HPwpGIzkl28mWyZqG52jiqDJ12waP11Pa1lGoiyUkIEuMLBP0oeK/C89esbXrxsky5we7dfd8U58nm0SgAWpVw==",
      "license": "MIT"
    },
    "node_modules/@remix-run/router": {
      "version": "1.23.0",
      "resolved": "https://registry.npmjs.org/@remix-run/router/-/router-1.23.0.tgz",
      "integrity": "sha512-O3rHJzAQKamUz1fvE0Qaw0xSFqsA/yafi2iqeE0pvdFtCO1viYx8QL6f3Ln/aCCTLxs68SLf0KPM9eSeM8yBnA==",
      "license": "MIT",
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/@rolldown/binding-android-arm64": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-android-arm64/-/binding-android-arm64-1.0.3.tgz",
      "integrity": "sha512-454rs7jHngixp/NMxd5srYD57OnzSlZ/eFTETjORQHLwJG1lRtmNOJcBerZlfu4GjKqeq8aCCIQrMdHyhI51Hw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-darwin-arm64": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-darwin-arm64/-/binding-darwin-arm64-1.0.3.tgz",
      "integrity": "sha512-PcAhP+ynjURNyy8SKGl5DQP94aGuB/7JrXJb/t7P+hanXvQVMWzUvRRhBAcg/lNRadBhoUPqSoP4xw5tR/KBEA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-darwin-x64": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-darwin-x64/-/binding-darwin-x64-1.0.3.tgz",
      "integrity": "sha512-9YpfeUvSE2RS7wysJ81uOZkXJz7f7Q55H2Gvp3VEw/EsahqDtrphrZ0EwDLK5vvKOzaCrBsjF8JmnMLcUt78Gg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-freebsd-x64": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-freebsd-x64/-/binding-freebsd-x64-1.0.3.tgz",
      "integrity": "sha512-yB1IlAsSNHncV6SCTL27/MVGR5htvQsoGxIv5KMGXALp+Ll1wYsn+x98M9MW7qa+NdSbvrrY7ANI4wLJ0n1e6g==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm-gnueabihf": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm-gnueabihf/-/binding-linux-arm-gnueabihf-1.0.3.tgz",
      "integrity": "sha512-Yi30IVAAfLUCy2MseFjbB1jAMDl1VMCAas5StnYp8da9+CKvMd2H2cbEjWcw5NPaPqzvYkVIaF1nNUG+b7u/sw==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm64-gnu": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm64-gnu/-/binding-linux-arm64-gnu-1.0.3.tgz",
      "integrity": "sha512-jsO7R8To+AdlYgUmN5sHSCZbfhtMBkO0WUx8iORQnPcMMdgr7qM2DQmMwgabs3GhNztdmoKkMKQFHD6DTMCIQw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm64-musl": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm64-musl/-/binding-linux-arm64-musl-1.0.3.tgz",
      "integrity": "sha512-VWkUHwWriDciit80wleYwKILoR/KMvxh/IdwS/paX+ZgpuRpCrKLUdadJbc0NpBEiyhpYawsJ73j9aCvOH+f7Q==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-ppc64-gnu": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-ppc64-gnu/-/binding-linux-ppc64-gnu-1.0.3.tgz",
      "integrity": "sha512-5f1laC0SlIR0yDbFCd8acUhvJIag6N3zC5P7oUPN6wX0aOma+uKJ0wBDH5aq7I1PVI2ttTlhJwzwRIBnLiSGEg==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-s390x-gnu": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-s390x-gnu/-/binding-linux-s390x-gnu-1.0.3.tgz",
      "integrity": "sha512-Iq4ko0r4XsgbrF/LunNgHtAGLRRVE2kXonAXQ/MV0mC6jQpMOhW1SvtZja2EhC/kd05++bP78dsqBeIQyYJ6Yg==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-x64-gnu": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-x64-gnu/-/binding-linux-x64-gnu-1.0.3.tgz",
      "integrity": "sha512-B8m6tD5+/N5FeNQFbKlLA/2yVq9ycQP1SeedyEYYKWBNR3ZQbkvIUcNnDNM03lO1l5F2roiiFJGgvoLLyZXtSg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-x64-musl": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-x64-musl/-/binding-linux-x64-musl-1.0.3.tgz",
      "integrity": "sha512-pSdpdUJHkuCxun9LE7jvgUB9qsRgaiyNNCX7m/AvHTcq67AiT/Yhoxvw5zPfhrM8k/BfP8ce/hMOpthKDpEUow==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-openharmony-arm64": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-openharmony-arm64/-/binding-openharmony-arm64-1.0.3.tgz",
      "integrity": "sha512-OXXS3RKJgX2uLwM+gYyuH5omcH8fL1LJs96pZGgtetVCahON57+d4SJHzTgZiOjxgGkSnpXpOsWuPDGAKAigEg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-wasm32-wasi": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-wasm32-wasi/-/binding-wasm32-wasi-1.0.3.tgz",
      "integrity": "sha512-JTtb8BWFynicNSoPrehsCzBtOKjZ6jhMiPFEmOiuXg1Fl8dn2KHQob+GuPSGR0dryQa1PQJbzjF3dqO/whhjLg==",
      "cpu": [
        "wasm32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "@emnapi/core": "1.10.0",
        "@emnapi/runtime": "1.10.0",
        "@napi-rs/wasm-runtime": "^1.1.4"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-win32-arm64-msvc": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-win32-arm64-msvc/-/binding-win32-arm64-msvc-1.0.3.tgz",
      "integrity": "sha512-gEdFFEN70A/jxb2svrWsN3aDL7OUtmvlOy+6fa2jxG8K0wQ1ZbdeLGnidov6Yu5/733dI5ySfzFlQ/cb0bSz1g==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-win32-x64-msvc": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-win32-x64-msvc/-/binding-win32-x64-msvc-1.0.3.tgz",
      "integrity": "sha512-eXB7CHuaQdqmJcc3koCNtNPmT/bj2gc999kUFgBxG8Ac0NdgXc4rkCHhqrgrhN3zddvvvrgzj1e90SuSfmyIXA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/pluginutils": {
      "version": "1.0.0-beta.27",
      "resolved": "https://registry.npmjs.org/@rolldown/pluginutils/-/pluginutils-1.0.0-beta.27.tgz",
      "integrity": "sha512-+d0F4MKMCbeVUJwG96uQ4SgAznZNSq93I3V+9NHA4OpvqG8mRCpGdKmK8l/dl02h2CCDHwW2FqilnTyDcAnqjA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@rollup/rollup-android-arm-eabi": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm-eabi/-/rollup-android-arm-eabi-4.24.0.tgz",
      "integrity": "sha512-Q6HJd7Y6xdB48x8ZNVDOqsbh2uByBhgK8PiQgPhwkIw/HC/YX5Ghq2mQY5sRMZWHb3VsFkWooUVOZHKr7DmDIA==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ]
    },
    "node_modules/@rollup/rollup-android-arm64": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm64/-/rollup-android-arm64-4.24.0.tgz",
      "integrity": "sha512-ijLnS1qFId8xhKjT81uBHuuJp2lU4x2yxa4ctFPtG+MqEE6+C5f/+X/bStmxapgmwLwiL3ih122xv8kVARNAZA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ]
    },
    "node_modules/@rollup/rollup-darwin-arm64": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-arm64/-/rollup-darwin-arm64-4.24.0.tgz",
      "integrity": "sha512-bIv+X9xeSs1XCk6DVvkO+S/z8/2AMt/2lMqdQbMrmVpgFvXlmde9mLcbQpztXm1tajC3raFDqegsH18HQPMYtA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ]
    },
    "node_modules/@rollup/rollup-darwin-x64": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-x64/-/rollup-darwin-x64-4.24.0.tgz",
      "integrity": "sha512-X6/nOwoFN7RT2svEQWUsW/5C/fYMBe4fnLK9DQk4SX4mgVBiTA9h64kjUYPvGQ0F/9xwJ5U5UfTbl6BEjaQdBQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm-gnueabihf": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-gnueabihf/-/rollup-linux-arm-gnueabihf-4.24.0.tgz",
      "integrity": "sha512-0KXvIJQMOImLCVCz9uvvdPgfyWo93aHHp8ui3FrtOP57svqrF/roSSR5pjqL2hcMp0ljeGlU4q9o/rQaAQ3AYA==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm-musleabihf": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-musleabihf/-/rollup-linux-arm-musleabihf-4.24.0.tgz",
      "integrity": "sha512-it2BW6kKFVh8xk/BnHfakEeoLPv8STIISekpoF+nBgWM4d55CZKc7T4Dx1pEbTnYm/xEKMgy1MNtYuoA8RFIWw==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm64-gnu": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-gnu/-/rollup-linux-arm64-gnu-4.24.0.tgz",
      "integrity": "sha512-i0xTLXjqap2eRfulFVlSnM5dEbTVque/3Pi4g2y7cxrs7+a9De42z4XxKLYJ7+OhE3IgxvfQM7vQc43bwTgPwA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm64-musl": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-musl/-/rollup-linux-arm64-musl-4.24.0.tgz",
      "integrity": "sha512-9E6MKUJhDuDh604Qco5yP/3qn3y7SLXYuiC0Rpr89aMScS2UAmK1wHP2b7KAa1nSjWJc/f/Lc0Wl1L47qjiyQw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-powerpc64le-gnu": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-powerpc64le-gnu/-/rollup-linux-powerpc64le-gnu-4.24.0.tgz",
      "integrity": "sha512-2XFFPJ2XMEiF5Zi2EBf4h73oR1V/lycirxZxHZNc93SqDN/IWhYYSYj8I9381ikUFXZrz2v7r2tOVk2NBwxrWw==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-riscv64-gnu": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-gnu/-/rollup-linux-riscv64-gnu-4.24.0.tgz",
      "integrity": "sha512-M3Dg4hlwuntUCdzU7KjYqbbd+BLq3JMAOhCKdBE3TcMGMZbKkDdJ5ivNdehOssMCIokNHFOsv7DO4rlEOfyKpg==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-s390x-gnu": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-s390x-gnu/-/rollup-linux-s390x-gnu-4.24.0.tgz",
      "integrity": "sha512-mjBaoo4ocxJppTorZVKWFpy1bfFj9FeCMJqzlMQGjpNPY9JwQi7OuS1axzNIk0nMX6jSgy6ZURDZ2w0QW6D56g==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-x64-gnu": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-gnu/-/rollup-linux-x64-gnu-4.24.0.tgz",
      "integrity": "sha512-ZXFk7M72R0YYFN5q13niV0B7G8/5dcQ9JDp8keJSfr3GoZeXEoMHP/HlvqROA3OMbMdfr19IjCeNAnPUG93b6A==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-x64-musl": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-musl/-/rollup-linux-x64-musl-4.24.0.tgz",
      "integrity": "sha512-w1i+L7kAXZNdYl+vFvzSZy8Y1arS7vMgIy8wusXJzRrPyof5LAb02KGr1PD2EkRcl73kHulIID0M501lN+vobQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-win32-arm64-msvc": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-arm64-msvc/-/rollup-win32-arm64-msvc-4.24.0.tgz",
      "integrity": "sha512-VXBrnPWgBpVDCVY6XF3LEW0pOU51KbaHhccHw6AS6vBWIC60eqsH19DAeeObl+g8nKAz04QFdl/Cefta0xQtUQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@rollup/rollup-win32-ia32-msvc": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-ia32-msvc/-/rollup-win32-ia32-msvc-4.24.0.tgz",
      "integrity": "sha512-xrNcGDU0OxVcPTH/8n/ShH4UevZxKIO6HJFK0e15XItZP2UcaiLFd5kiX7hJnqCbSztUF8Qot+JWBC/QXRPYWQ==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@rollup/rollup-win32-x64-msvc": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-msvc/-/rollup-win32-x64-msvc-4.24.0.tgz",
      "integrity": "sha512-fbMkAF7fufku0N2dE5TBXcNlg0pt0cJue4xBRE2Qc5Vqikxr4VCgKj/ht6SMdFcOacVA9rqF70APJ8RN/4vMJw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@standard-schema/spec": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/@standard-schema/spec/-/spec-1.1.0.tgz",
      "integrity": "sha512-l2aFy5jALhniG5HgqrD6jXLi/rUWrKvqN/qJx6yoJsgKhblVd+iqqU4RCXavm/jPityDo5TCvKMnpjKnOriy0w==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@swc/core": {
      "version": "1.13.2",
      "resolved": "https://registry.npmjs.org/@swc/core/-/core-1.13.2.tgz",
      "integrity": "sha512-YWqn+0IKXDhqVLKoac4v2tV6hJqB/wOh8/Br8zjqeqBkKa77Qb0Kw2i7LOFzjFNZbZaPH6AlMGlBwNrxaauaAg==",
      "dev": true,
      "hasInstallScript": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@swc/counter": "^0.1.3",
        "@swc/types": "^0.1.23"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/swc"
      },
      "optionalDependencies": {
        "@swc/core-darwin-arm64": "1.13.2",
        "@swc/core-darwin-x64": "1.13.2",
        "@swc/core-linux-arm-gnueabihf": "1.13.2",
        "@swc/core-linux-arm64-gnu": "1.13.2",
        "@swc/core-linux-arm64-musl": "1.13.2",
        "@swc/core-linux-x64-gnu": "1.13.2",
        "@swc/core-linux-x64-musl": "1.13.2",
        "@swc/core-win32-arm64-msvc": "1.13.2",
        "@swc/core-win32-ia32-msvc": "1.13.2",
        "@swc/core-win32-x64-msvc": "1.13.2"
      },
      "peerDependencies": {
        "@swc/helpers": ">=0.5.17"
      },
      "peerDependenciesMeta": {
        "@swc/helpers": {
          "optional": true
        }
      }
    },
    "node_modules/@swc/core-darwin-arm64": {
      "version": "1.13.2",
      "resolved": "https://registry.npmjs.org/@swc/core-darwin-arm64/-/core-darwin-arm64-1.13.2.tgz",
      "integrity": "sha512-44p7ivuLSGFJ15Vly4ivLJjg3ARo4879LtEBAabcHhSZygpmkP8eyjyWxrH3OxkY1eRZSIJe8yRZPFw4kPXFPw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "Apache-2.0 AND MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/@swc/core-darwin-x64": {
      "version": "1.13.2",
      "resolved": "https://registry.npmjs.org/@swc/core-darwin-x64/-/core-darwin-x64-1.13.2.tgz",
      "integrity": "sha512-Lb9EZi7X2XDAVmuUlBm2UvVAgSCbD3qKqDCxSI4jEOddzVOpNCnyZ/xEampdngUIyDDhhJLYU9duC+Mcsv5Y+A==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "Apache-2.0 AND MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/@swc/core-linux-arm-gnueabihf": {
      "version": "1.13.2",
      "resolved": "https://registry.npmjs.org/@swc/core-linux-arm-gnueabihf/-/core-linux-arm-gnueabihf-1.13.2.tgz",
      "integrity": "sha512-9TDe/92ee1x57x+0OqL1huG4BeljVx0nWW4QOOxp8CCK67Rpc/HHl2wciJ0Kl9Dxf2NvpNtkPvqj9+BUmM9WVA==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/@swc/core-linux-arm64-gnu": {
      "version": "1.13.2",
      "resolved": "https://registry.npmjs.org/@swc/core-linux-arm64-gnu/-/core-linux-arm64-gnu-1.13.2.tgz",
      "integrity": "sha512-KJUSl56DBk7AWMAIEcU83zl5mg3vlQYhLELhjwRFkGFMvghQvdqQ3zFOYa4TexKA7noBZa3C8fb24rI5sw9Exg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "Apache-2.0 AND MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/@swc/core-linux-arm64-musl": {
      "version": "1.13.2",
      "resolved": "https://registry.npmjs.org/@swc/core-linux-arm64-musl/-/core-linux-arm64-musl-1.13.2.tgz",
      "integrity": "sha512-teU27iG1oyWpNh9CzcGQ48ClDRt/RCem7mYO7ehd2FY102UeTws2+OzLESS1TS1tEZipq/5xwx3FzbVgiolCiQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "Apache-2.0 AND MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/@swc/core-linux-x64-gnu": {
      "version": "1.13.2",
      "resolved": "https://registry.npmjs.org/@swc/core-linux-x64-gnu/-/core-linux-x64-gnu-1.13.2.tgz",
      "integrity": "sha512-dRPsyPyqpLD0HMRCRpYALIh4kdOir8pPg4AhNQZLehKowigRd30RcLXGNVZcc31Ua8CiPI4QSgjOIxK+EQe4LQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "Apache-2.0 AND MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/@swc/core-linux-x64-musl": {
      "version": "1.13.2",
      "resolved": "https://registry.npmjs.org/@swc/core-linux-x64-musl/-/core-linux-x64-musl-1.13.2.tgz",
      "integrity": "sha512-CCxETW+KkYEQDqz1SYC15YIWYheqFC+PJVOW76Maa/8yu8Biw+HTAcblKf2isrlUtK8RvrQN94v3UXkC2NzCEw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "Apache-2.0 AND MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/@swc/core-win32-arm64-msvc": {
      "version": "1.13.2",
      "resolved": "https://registry.npmjs.org/@swc/core-win32-arm64-msvc/-/core-win32-arm64-msvc-1.13.2.tgz",
      "integrity": "sha512-Wv/QTA6PjyRLlmKcN6AmSI4jwSMRl0VTLGs57PHTqYRwwfwd7y4s2fIPJVBNbAlXd795dOEP6d/bGSQSyhOX3A==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "Apache-2.0 AND MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/@swc/core-win32-ia32-msvc": {
      "version": "1.13.2",
      "resolved": "https://registry.npmjs.org/@swc/core-win32-ia32-msvc/-/core-win32-ia32-msvc-1.13.2.tgz",
      "integrity": "sha512-PuCdtNynEkUNbUXX/wsyUC+t4mamIU5y00lT5vJcAvco3/r16Iaxl5UCzhXYaWZSNVZMzPp9qN8NlSL8M5pPxw==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "Apache-2.0 AND MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/@swc/core-win32-x64-msvc": {
      "version": "1.13.2",
      "resolved": "https://registry.npmjs.org/@swc/core-win32-x64-msvc/-/core-win32-x64-msvc-1.13.2.tgz",
      "integrity": "sha512-qlmMkFZJus8cYuBURx1a3YAG2G7IW44i+FEYV5/32ylKkzGNAr9tDJSA53XNnNXkAB5EXSPsOz7bn5C3JlEtdQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "Apache-2.0 AND MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/@swc/counter": {
      "version": "0.1.3",
      "resolved": "https://registry.npmjs.org/@swc/counter/-/counter-0.1.3.tgz",
      "integrity": "sha512-e2BR4lsJkkRlKZ/qCHPw9ZaSxc0MVUd7gtbtaB7aMvHeJVYe8sOB8DBZkP2DtISHGSku9sCK6T6cnY0CtXrOCQ==",
      "dev": true,
      "license": "Apache-2.0"
    },
    "node_modules/@swc/types": {
      "version": "0.1.23",
      "resolved": "https://registry.npmjs.org/@swc/types/-/types-0.1.23.tgz",
      "integrity": "sha512-u1iIVZV9Q0jxY+yM2vw/hZGDNudsN85bBpTqzAQ9rzkxW9D+e3aEM4Han+ow518gSewkXgjmEK0BD79ZcNVgPw==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@swc/counter": "^0.1.3"
      }
    },
    "node_modules/@tailwindcss/typography": {
      "version": "0.5.16",
      "resolved": "https://registry.npmjs.org/@tailwindcss/typography/-/typography-0.5.16.tgz",
      "integrity": "sha512-0wDLwCVF5V3x3b1SGXPCDcdsbDHMBe+lkFzBRaHeLvNi+nrrnZ1lA18u+OTWO8iSWU2GxUOCvlXtDuqftc1oiA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "lodash.castarray": "^4.4.0",
        "lodash.isplainobject": "^4.0.6",
        "lodash.merge": "^4.6.2",
        "postcss-selector-parser": "6.0.10"
      },
      "peerDependencies": {
        "tailwindcss": ">=3.0.0 || insiders || >=4.0.0-alpha.20 || >=4.0.0-beta.1"
      }
    },
    "node_modules/@tailwindcss/typography/node_modules/postcss-selector-parser": {
      "version": "6.0.10",
      "resolved": "https://registry.npmjs.org/postcss-selector-parser/-/postcss-selector-parser-6.0.10.tgz",
      "integrity": "sha512-IQ7TZdoaqbT+LCpShg46jnZVlhWD2w6iQYAcYXfHARZ7X1t/UGhhceQDs5X0cGqKvYlHNOuv7Oa1xmb0oQuA3w==",
      "dev": true,
      "dependencies": {
        "cssesc": "^3.0.0",
        "util-deprecate": "^1.0.2"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/@tanstack/query-core": {
      "version": "5.83.0",
      "resolved": "https://registry.npmjs.org/@tanstack/query-core/-/query-core-5.83.0.tgz",
      "integrity": "sha512-0M8dA+amXUkyz5cVUm/B+zSk3xkQAcuXuz5/Q/LveT4ots2rBpPTZOzd7yJa2Utsf8D2Upl5KyjhHRY+9lB/XA==",
      "license": "MIT",
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/tannerlinsley"
      }
    },
    "node_modules/@tanstack/react-query": {
      "version": "5.83.0",
      "resolved": "https://registry.npmjs.org/@tanstack/react-query/-/react-query-5.83.0.tgz",
      "integrity": "sha512-/XGYhZ3foc5H0VM2jLSD/NyBRIOK4q9kfeml4+0x2DlL6xVuAcVEW+hTlTapAmejObg0i3eNqhkr2dT+eciwoQ==",
      "license": "MIT",
      "dependencies": {
        "@tanstack/query-core": "5.83.0"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/tannerlinsley"
      },
      "peerDependencies": {
        "react": "^18 || ^19"
      }
    },
    "node_modules/@tanstack/react-virtual": {
      "version": "3.13.25",
      "resolved": "https://registry.npmjs.org/@tanstack/react-virtual/-/react-virtual-3.13.25.tgz",
      "integrity": "sha512-bmNoqMu6gcAW9JGrKVB0Q1tN1i5RONZF8r1fW0bbE4Oyf3DwEGnzzQJ2OW+Ozg1P4s8PyugkHg2ULZoFQN+cqw==",
      "license": "MIT",
      "dependencies": {
        "@tanstack/virtual-core": "3.15.0"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/tannerlinsley"
      },
      "peerDependencies": {
        "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0",
        "react-dom": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"
      }
    },
    "node_modules/@tanstack/virtual-core": {
      "version": "3.15.0",
      "resolved": "https://registry.npmjs.org/@tanstack/virtual-core/-/virtual-core-3.15.0.tgz",
      "integrity": "sha512-0AwPGx0I8QxPYjAxShT/+z+ZOe9u8mW5rsXvivCTjRfRmz9a43+3mRyi4wwlyoUqOC56q/jatKa0Bh9M99BEHQ==",
      "license": "MIT",
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/tannerlinsley"
      }
    },
    "node_modules/@testing-library/dom": {
      "version": "10.4.1",
      "resolved": "https://registry.npmjs.org/@testing-library/dom/-/dom-10.4.1.tgz",
      "integrity": "sha512-o4PXJQidqJl82ckFaXUeoAW+XysPLauYI43Abki5hABd853iMhitooc6znOnczgbTYmEP6U6/y1ZyKAIsvMKGg==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/code-frame": "^7.10.4",
        "@babel/runtime": "^7.12.5",
        "@types/aria-query": "^5.0.1",
        "aria-query": "5.3.0",
        "dom-accessibility-api": "^0.5.9",
        "lz-string": "^1.5.0",
        "picocolors": "1.1.1",
        "pretty-format": "^27.0.2"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@testing-library/jest-dom": {
      "version": "6.9.1",
      "resolved": "https://registry.npmjs.org/@testing-library/jest-dom/-/jest-dom-6.9.1.tgz",
      "integrity": "sha512-zIcONa+hVtVSSep9UT3jZ5rizo2BsxgyDYU7WFD5eICBE7no3881HGeb/QkGfsJs6JTkY1aQhT7rIPC7e+0nnA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@adobe/css-tools": "^4.4.0",
        "aria-query": "^5.0.0",
        "css.escape": "^1.5.1",
        "dom-accessibility-api": "^0.6.3",
        "picocolors": "^1.1.1",
        "redent": "^3.0.0"
      },
      "engines": {
        "node": ">=14",
        "npm": ">=6",
        "yarn": ">=1"
      }
    },
    "node_modules/@testing-library/jest-dom/node_modules/dom-accessibility-api": {
      "version": "0.6.3",
      "resolved": "https://registry.npmjs.org/dom-accessibility-api/-/dom-accessibility-api-0.6.3.tgz",
      "integrity": "sha512-7ZgogeTnjuHbo+ct10G9Ffp0mif17idi0IyWNVA/wcwcm7NPOD/WEHVP3n7n3MhXqxoIYm8d6MuZohYWIZ4T3w==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@testing-library/react": {
      "version": "16.3.2",
      "resolved": "https://registry.npmjs.org/@testing-library/react/-/react-16.3.2.tgz",
      "integrity": "sha512-XU5/SytQM+ykqMnAnvB2umaJNIOsLF3PVv//1Ew4CTcpz0/BRyy/af40qqrt7SjKpDdT1saBMc42CUok5gaw+g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.12.5"
      },
      "engines": {
        "node": ">=18"
      },
      "peerDependencies": {
        "@testing-library/dom": "^10.0.0",
        "@types/react": "^18.0.0 || ^19.0.0",
        "@types/react-dom": "^18.0.0 || ^19.0.0",
        "react": "^18.0.0 || ^19.0.0",
        "react-dom": "^18.0.0 || ^19.0.0"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@testing-library/user-event": {
      "version": "14.6.1",
      "resolved": "https://registry.npmjs.org/@testing-library/user-event/-/user-event-14.6.1.tgz",
      "integrity": "sha512-vq7fv0rnt+QTXgPxr5Hjc210p6YKq2kmdziLgnsZGgLJ9e6VAShx1pACLuRjd/AS/sr7phAR58OIIpf0LlmQNw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12",
        "npm": ">=6"
      },
      "peerDependencies": {
        "@testing-library/dom": ">=7.21.4"
      }
    },
    "node_modules/@tybys/wasm-util": {
      "version": "0.10.2",
      "resolved": "https://registry.npmjs.org/@tybys/wasm-util/-/wasm-util-0.10.2.tgz",
      "integrity": "sha512-RoBvJ2X0wuKlWFIjrwffGw1IqZHKQqzIchKaadZZfnNpsAYp2mM0h36JtPCjNDAHGgYez/15uMBpfGwchhiMgg==",
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "tslib": "^2.4.0"
      }
    },
    "node_modules/@types/aria-query": {
      "version": "5.0.4",
      "resolved": "https://registry.npmjs.org/@types/aria-query/-/aria-query-5.0.4.tgz",
      "integrity": "sha512-rfT93uj5s0PRL7EzccGMs3brplhcrghnDoV26NqKhCAS1hVo+WdNsPvE/yb6ilfr5hi2MEk6d5EWJTKdxg8jVw==",
      "dev": true,
      "license": "MIT",
      "peer": true
    },
    "node_modules/@types/chai": {
      "version": "5.2.3",
      "resolved": "https://registry.npmjs.org/@types/chai/-/chai-5.2.3.tgz",
      "integrity": "sha512-Mw558oeA9fFbv65/y4mHtXDs9bPnFMZAL/jxdPFUpOHHIXX91mcgEHbS5Lahr+pwZFR8A7GQleRWeI6cGFC2UA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/deep-eql": "*",
        "assertion-error": "^2.0.1"
      }
    },
    "node_modules/@types/d3-array": {
      "version": "3.2.1",
      "resolved": "https://registry.npmjs.org/@types/d3-array/-/d3-array-3.2.1.tgz",
      "integrity": "sha512-Y2Jn2idRrLzUfAKV2LyRImR+y4oa2AntrgID95SHJxuMUrkNXmanDSed71sRNZysveJVt1hLLemQZIady0FpEg==",
      "license": "MIT"
    },
    "node_modules/@types/d3-color": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/@types/d3-color/-/d3-color-3.1.3.tgz",
      "integrity": "sha512-iO90scth9WAbmgv7ogoq57O9YpKmFBbmoEoCHDB2xMBY0+/KVrqAaCDyCE16dUspeOvIxFFRI+0sEtqDqy2b4A==",
      "license": "MIT"
    },
    "node_modules/@types/d3-ease": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/@types/d3-ease/-/d3-ease-3.0.2.tgz",
      "integrity": "sha512-NcV1JjO5oDzoK26oMzbILE6HW7uVXOHLQvHshBUW4UMdZGfiY6v5BeQwh9a9tCzv+CeefZQHJt5SRgK154RtiA==",
      "license": "MIT"
    },
    "node_modules/@types/d3-interpolate": {
      "version": "3.0.4",
      "resolved": "https://registry.npmjs.org/@types/d3-interpolate/-/d3-interpolate-3.0.4.tgz",
      "integrity": "sha512-mgLPETlrpVV1YRJIglr4Ez47g7Yxjl1lj7YKsiMCb27VJH9W8NVM6Bb9d8kkpG/uAQS5AmbA48q2IAolKKo1MA==",
      "license": "MIT",
      "dependencies": {
        "@types/d3-color": "*"
      }
    },
    "node_modules/@types/d3-path": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/@types/d3-path/-/d3-path-3.1.0.tgz",
      "integrity": "sha512-P2dlU/q51fkOc/Gfl3Ul9kicV7l+ra934qBFXCFhrZMOL6du1TM0pm1ThYvENukyOn5h9v+yMJ9Fn5JK4QozrQ==",
      "license": "MIT"
    },
    "node_modules/@types/d3-scale": {
      "version": "4.0.8",
      "resolved": "https://registry.npmjs.org/@types/d3-scale/-/d3-scale-4.0.8.tgz",
      "integrity": "sha512-gkK1VVTr5iNiYJ7vWDI+yUFFlszhNMtVeneJ6lUTKPjprsvLLI9/tgEGiXJOnlINJA8FyA88gfnQsHbybVZrYQ==",
      "license": "MIT",
      "dependencies": {
        "@types/d3-time": "*"
      }
    },
    "node_modules/@types/d3-shape": {
      "version": "3.1.6",
      "resolved": "https://registry.npmjs.org/@types/d3-shape/-/d3-shape-3.1.6.tgz",
      "integrity": "sha512-5KKk5aKGu2I+O6SONMYSNflgiP0WfZIQvVUMan50wHsLG1G94JlxEVnCpQARfTtzytuY0p/9PXXZb3I7giofIA==",
      "license": "MIT",
      "dependencies": {
        "@types/d3-path": "*"
      }
    },
    "node_modules/@types/d3-time": {
      "version": "3.0.3",
      "resolved": "https://registry.npmjs.org/@types/d3-time/-/d3-time-3.0.3.tgz",
      "integrity": "sha512-2p6olUZ4w3s+07q3Tm2dbiMZy5pCDfYwtLXXHUnVzXgQlZ/OyPtUz6OL382BkOuGlLXqfT+wqv8Fw2v8/0geBw==",
      "license": "MIT"
    },
    "node_modules/@types/d3-timer": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/@types/d3-timer/-/d3-timer-3.0.2.tgz",
      "integrity": "sha512-Ps3T8E8dZDam6fUyNiMkekK3XUsaUEik+idO9/YjPtfj2qruF8tFBXS7XhtE4iIXBLxhmLjP3SXpLhVf21I9Lw==",
      "license": "MIT"
    },
    "node_modules/@types/deep-eql": {
      "version": "4.0.2",
      "resolved": "https://registry.npmjs.org/@types/deep-eql/-/deep-eql-4.0.2.tgz",
      "integrity": "sha512-c9h9dVVMigMPc4bwTvC5dxqtqJZwQPePsWjPlpSOnojbor6pGqdk541lfA7AqFQr5pB1BRdq0juY9db81BwyFw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/estree": {
      "version": "1.0.6",
      "resolved": "https://registry.npmjs.org/@types/estree/-/estree-1.0.6.tgz",
      "integrity": "sha512-AYnb1nQyY49te+VRAVgmzfcgjYS91mY5P0TKUDCLEM+gNnA+3T6rWITXRLYCpahpqSQbN5cE+gHpnPyXjHWxcw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/json-schema": {
      "version": "7.0.15",
      "resolved": "https://registry.npmjs.org/@types/json-schema/-/json-schema-7.0.15.tgz",
      "integrity": "sha512-5+fP8P8MFNC+AyZCDxrB2pkZFPGzqQWUzpSeuuVLvm8VMcorNYavBqoFcxK8bQz4Qsbn4oUEEem4wDLfcysGHA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/node": {
      "version": "22.16.5",
      "resolved": "https://registry.npmjs.org/@types/node/-/node-22.16.5.tgz",
      "integrity": "sha512-bJFoMATwIGaxxx8VJPeM8TonI8t579oRvgAuT8zFugJsJZgzqv0Fu8Mhp68iecjzG7cnN3mO2dJQ5uUM2EFrgQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "undici-types": "~6.21.0"
      }
    },
    "node_modules/@types/prop-types": {
      "version": "15.7.13",
      "resolved": "https://registry.npmjs.org/@types/prop-types/-/prop-types-15.7.13.tgz",
      "integrity": "sha512-hCZTSvwbzWGvhqxp/RqVqwU999pBf2vp7hzIjiYOsl8wqOmUxkQ6ddw1cV3l8811+kdUFus/q4d1Y3E3SyEifA==",
      "devOptional": true,
      "license": "MIT"
    },
    "node_modules/@types/qrcode": {
      "version": "1.5.6",
      "resolved": "https://registry.npmjs.org/@types/qrcode/-/qrcode-1.5.6.tgz",
      "integrity": "sha512-te7NQcV2BOvdj2b1hCAHzAoMNuj65kNBMz0KBaxM6c3VGBOhU0dURQKOtH8CFNI/dsKkwlv32p26qYQTWoB5bw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/node": "*"
      }
    },
    "node_modules/@types/react": {
      "version": "18.3.23",
      "resolved": "https://registry.npmjs.org/@types/react/-/react-18.3.23.tgz",
      "integrity": "sha512-/LDXMQh55EzZQ0uVAZmKKhfENivEvWz6E+EYzh+/MCjMhNsotd+ZHhBGIjFDTi6+fz0OhQQQLbTgdQIxxCsC0w==",
      "devOptional": true,
      "license": "MIT",
      "dependencies": {
        "@types/prop-types": "*",
        "csstype": "^3.0.2"
      }
    },
    "node_modules/@types/react-dom": {
      "version": "18.3.7",
      "resolved": "https://registry.npmjs.org/@types/react-dom/-/react-dom-18.3.7.tgz",
      "integrity": "sha512-MEe3UeoENYVFXzoXEWsvcpg6ZvlrFNlOQ7EOsvhI3CfAXwzPfO8Qwuxd40nepsYKqyyVQnTdEfv68q91yLcKrQ==",
      "devOptional": true,
      "license": "MIT",
      "peerDependencies": {
        "@types/react": "^18.0.0"
      }
    },
    "node_modules/@types/whatwg-mimetype": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/@types/whatwg-mimetype/-/whatwg-mimetype-3.0.2.tgz",
      "integrity": "sha512-c2AKvDT8ToxLIOUlN51gTiHXflsfIFisS4pO7pDPoKouJCESkhZnEy623gwP9laCy5lnLDAw1vAzu2vM2YLOrA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/ws": {
      "version": "8.18.1",
      "resolved": "https://registry.npmjs.org/@types/ws/-/ws-8.18.1.tgz",
      "integrity": "sha512-ThVF6DCVhA8kUGy+aazFQ4kXQ7E1Ty7A3ypFOe0IcJV8O/M511G99AW24irKrW56Wt44yG9+ij8FaqoBGkuBXg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/node": "*"
      }
    },
    "node_modules/@typescript-eslint/eslint-plugin": {
      "version": "8.38.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/eslint-plugin/-/eslint-plugin-8.38.0.tgz",
      "integrity": "sha512-CPoznzpuAnIOl4nhj4tRr4gIPj5AfKgkiJmGQDaq+fQnRJTYlcBjbX3wbciGmpoPf8DREufuPRe1tNMZnGdanA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@eslint-community/regexpp": "^4.10.0",
        "@typescript-eslint/scope-manager": "8.38.0",
        "@typescript-eslint/type-utils": "8.38.0",
        "@typescript-eslint/utils": "8.38.0",
        "@typescript-eslint/visitor-keys": "8.38.0",
        "graphemer": "^1.4.0",
        "ignore": "^7.0.0",
        "natural-compare": "^1.4.0",
        "ts-api-utils": "^2.1.0"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependencies": {
        "@typescript-eslint/parser": "^8.38.0",
        "eslint": "^8.57.0 || ^9.0.0",
        "typescript": ">=4.8.4 <5.9.0"
      }
    },
    "node_modules/@typescript-eslint/eslint-plugin/node_modules/ignore": {
      "version": "7.0.5",
      "resolved": "https://registry.npmjs.org/ignore/-/ignore-7.0.5.tgz",
      "integrity": "sha512-Hs59xBNfUIunMFgWAbGX5cq6893IbWg4KnrjbYwX3tx0ztorVgTDA6B2sxf8ejHJ4wz8BqGUMYlnzNBer5NvGg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 4"
      }
    },
    "node_modules/@typescript-eslint/parser": {
      "version": "8.38.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/parser/-/parser-8.38.0.tgz",
      "integrity": "sha512-Zhy8HCvBUEfBECzIl1PKqF4p11+d0aUJS1GeUiuqK9WmOug8YCmC4h4bjyBvMyAMI9sbRczmrYL5lKg/YMbrcQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@typescript-eslint/scope-manager": "8.38.0",
        "@typescript-eslint/types": "8.38.0",
        "@typescript-eslint/typescript-estree": "8.38.0",
        "@typescript-eslint/visitor-keys": "8.38.0",
        "debug": "^4.3.4"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependencies": {
        "eslint": "^8.57.0 || ^9.0.0",
        "typescript": ">=4.8.4 <5.9.0"
      }
    },
    "node_modules/@typescript-eslint/project-service": {
      "version": "8.38.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/project-service/-/project-service-8.38.0.tgz",
      "integrity": "sha512-dbK7Jvqcb8c9QfH01YB6pORpqX1mn5gDZc9n63Ak/+jD67oWXn3Gs0M6vddAN+eDXBCS5EmNWzbSxsn9SzFWWg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@typescript-eslint/tsconfig-utils": "^8.38.0",
        "@typescript-eslint/types": "^8.38.0",
        "debug": "^4.3.4"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependencies": {
        "typescript": ">=4.8.4 <5.9.0"
      }
    },
    "node_modules/@typescript-eslint/scope-manager": {
      "version": "8.38.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/scope-manager/-/scope-manager-8.38.0.tgz",
      "integrity": "sha512-WJw3AVlFFcdT9Ri1xs/lg8LwDqgekWXWhH3iAF+1ZM+QPd7oxQ6jvtW/JPwzAScxitILUIFs0/AnQ/UWHzbATQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@typescript-eslint/types": "8.38.0",
        "@typescript-eslint/visitor-keys": "8.38.0"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      }
    },
    "node_modules/@typescript-eslint/tsconfig-utils": {
      "version": "8.38.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/tsconfig-utils/-/tsconfig-utils-8.38.0.tgz",
      "integrity": "sha512-Lum9RtSE3EroKk/bYns+sPOodqb2Fv50XOl/gMviMKNvanETUuUcC9ObRbzrJ4VSd2JalPqgSAavwrPiPvnAiQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependencies": {
        "typescript": ">=4.8.4 <5.9.0"
      }
    },
    "node_modules/@typescript-eslint/type-utils": {
      "version": "8.38.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/type-utils/-/type-utils-8.38.0.tgz",
      "integrity": "sha512-c7jAvGEZVf0ao2z+nnz8BUaHZD09Agbh+DY7qvBQqLiz8uJzRgVPj5YvOh8I8uEiH8oIUGIfHzMwUcGVco/SJg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@typescript-eslint/types": "8.38.0",
        "@typescript-eslint/typescript-estree": "8.38.0",
        "@typescript-eslint/utils": "8.38.0",
        "debug": "^4.3.4",
        "ts-api-utils": "^2.1.0"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependencies": {
        "eslint": "^8.57.0 || ^9.0.0",
        "typescript": ">=4.8.4 <5.9.0"
      }
    },
    "node_modules/@typescript-eslint/types": {
      "version": "8.38.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/types/-/types-8.38.0.tgz",
      "integrity": "sha512-wzkUfX3plUqij4YwWaJyqhiPE5UCRVlFpKn1oCRn2O1bJ592XxWJj8ROQ3JD5MYXLORW84063z3tZTb/cs4Tyw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      }
    },
    "node_modules/@typescript-eslint/typescript-estree": {
      "version": "8.38.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/typescript-estree/-/typescript-estree-8.38.0.tgz",
      "integrity": "sha512-fooELKcAKzxux6fA6pxOflpNS0jc+nOQEEOipXFNjSlBS6fqrJOVY/whSn70SScHrcJ2LDsxWrneFoWYSVfqhQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@typescript-eslint/project-service": "8.38.0",
        "@typescript-eslint/tsconfig-utils": "8.38.0",
        "@typescript-eslint/types": "8.38.0",
        "@typescript-eslint/visitor-keys": "8.38.0",
        "debug": "^4.3.4",
        "fast-glob": "^3.3.2",
        "is-glob": "^4.0.3",
        "minimatch": "^9.0.4",
        "semver": "^7.6.0",
        "ts-api-utils": "^2.1.0"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependencies": {
        "typescript": ">=4.8.4 <5.9.0"
      }
    },
    "node_modules/@typescript-eslint/typescript-estree/node_modules/brace-expansion": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/brace-expansion/-/brace-expansion-2.0.2.tgz",
      "integrity": "sha512-Jt0vHyM+jmUBqojB7E1NIYadt0vI0Qxjxd2TErW94wDz+E2LAm5vKMXXwg6ZZBTHPuUlDgQHKXvjGBdfcF1ZDQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "balanced-match": "^1.0.0"
      }
    },
    "node_modules/@typescript-eslint/typescript-estree/node_modules/minimatch": {
      "version": "9.0.5",
      "resolved": "https://registry.npmjs.org/minimatch/-/minimatch-9.0.5.tgz",
      "integrity": "sha512-G6T0ZX48xgozx7587koeX9Ys2NYy6Gmv//P89sEte9V9whIapMNF4idKxnW2QtCcLiTWlb/wfCabAtAFWhhBow==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "brace-expansion": "^2.0.1"
      },
      "engines": {
        "node": ">=16 || 14 >=14.17"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/@typescript-eslint/utils": {
      "version": "8.38.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/utils/-/utils-8.38.0.tgz",
      "integrity": "sha512-hHcMA86Hgt+ijJlrD8fX0j1j8w4C92zue/8LOPAFioIno+W0+L7KqE8QZKCcPGc/92Vs9x36w/4MPTJhqXdyvg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@eslint-community/eslint-utils": "^4.7.0",
        "@typescript-eslint/scope-manager": "8.38.0",
        "@typescript-eslint/types": "8.38.0",
        "@typescript-eslint/typescript-estree": "8.38.0"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependencies": {
        "eslint": "^8.57.0 || ^9.0.0",
        "typescript": ">=4.8.4 <5.9.0"
      }
    },
    "node_modules/@typescript-eslint/visitor-keys": {
      "version": "8.38.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/visitor-keys/-/visitor-keys-8.38.0.tgz",
      "integrity": "sha512-pWrTcoFNWuwHlA9CvlfSsGWs14JxfN1TH25zM5L7o0pRLhsoZkDnTsXfQRJBEWJoV5DL0jf+Z+sxiud+K0mq1g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@typescript-eslint/types": "8.38.0",
        "eslint-visitor-keys": "^4.2.1"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      }
    },
    "node_modules/@vitejs/plugin-react-swc": {
      "version": "3.11.0",
      "resolved": "https://registry.npmjs.org/@vitejs/plugin-react-swc/-/plugin-react-swc-3.11.0.tgz",
      "integrity": "sha512-YTJCGFdNMHCMfjODYtxRNVAYmTWQ1Lb8PulP/2/f/oEEtglw8oKxKIZmmRkyXrVrHfsKOaVkAc3NT9/dMutO5w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@rolldown/pluginutils": "1.0.0-beta.27",
        "@swc/core": "^1.12.11"
      },
      "peerDependencies": {
        "vite": "^4 || ^5 || ^6 || ^7"
      }
    },
    "node_modules/@vitest/expect": {
      "version": "4.1.9",
      "resolved": "https://registry.npmjs.org/@vitest/expect/-/expect-4.1.9.tgz",
      "integrity": "sha512-vl/rYsUKcBr3SnQn166+XR5ZQcgMx3DQhFWdfli/cWpLnLUmbxZvyrJZotLFUryib+LtArYMSTJ5RbQ57ZqrlA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@standard-schema/spec": "^1.1.0",
        "@types/chai": "^5.2.2",
        "@vitest/spy": "4.1.9",
        "@vitest/utils": "4.1.9",
        "chai": "^6.2.2",
        "tinyrainbow": "^3.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@vitest/pretty-format": {
      "version": "4.1.9",
      "resolved": "https://registry.npmjs.org/@vitest/pretty-format/-/pretty-format-4.1.9.tgz",
      "integrity": "sha512-s0iufns3iIFitdgm+YR7g1whCAaGtXz459VS9/PqyKDEEFgYIhsHOQmXgIgDuYCt7DeQmiZT0Qe2OA2p4ZPu5A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "tinyrainbow": "^3.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@vitest/runner": {
      "version": "4.1.9",
      "resolved": "https://registry.npmjs.org/@vitest/runner/-/runner-4.1.9.tgz",
      "integrity": "sha512-KXLMDtc7oe70+3mJfGrPUWPesswH+3sTxAMAMl8DG7I8IUQT4XW718dY5ID3vPUcmlu27CcKfY4P3h3I29SLJg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@vitest/utils": "4.1.9",
        "pathe": "^2.0.3"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@vitest/snapshot": {
      "version": "4.1.9",
      "resolved": "https://registry.npmjs.org/@vitest/snapshot/-/snapshot-4.1.9.tgz",
      "integrity": "sha512-Jc7RKGNBo8Z28WYIm0Niej4xdSPByRf6mU58VpHQkd6Zh05rlnA+twjbK5HyeIGHxrzsc3mJgS43uM0CZKzaIA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@vitest/pretty-format": "4.1.9",
        "@vitest/utils": "4.1.9",
        "magic-string": "^0.30.21",
        "pathe": "^2.0.3"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@vitest/spy": {
      "version": "4.1.9",
      "resolved": "https://registry.npmjs.org/@vitest/spy/-/spy-4.1.9.tgz",
      "integrity": "sha512-fHpsS6mIi+PiEW+vcRVOMkX1oSaPKne3VOclSFICPcGOmfKgXPU5iAah+wcNcj2xPrCCmfq99IDGf+EojhhvhA==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@vitest/ui": {
      "version": "4.1.9",
      "resolved": "https://registry.npmjs.org/@vitest/ui/-/ui-4.1.9.tgz",
      "integrity": "sha512-U/cRvtqfEPj27FI1n9cyUvi4vXXdcLhjJiI+InYKdk8hP4VrS6RXOjGL7rfFaeBc37iRKANsR6eEzIoC7lmgBQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@vitest/utils": "4.1.9",
        "fflate": "^0.8.2",
        "flatted": "^3.4.2",
        "pathe": "^2.0.3",
        "sirv": "^3.0.2",
        "tinyglobby": "^0.2.15",
        "tinyrainbow": "^3.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      },
      "peerDependencies": {
        "vitest": "4.1.9"
      }
    },
    "node_modules/@vitest/utils": {
      "version": "4.1.9",
      "resolved": "https://registry.npmjs.org/@vitest/utils/-/utils-4.1.9.tgz",
      "integrity": "sha512-A51o8ymO5PpqlWNnBP9ZHPXDIpuMtTLlGSjN7la4US+LJzoUMyhwjA5QXlm39JexgwHKW4Xjs8Z2d3dLCXOeuA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@vitest/pretty-format": "4.1.9",
        "convert-source-map": "^2.0.0",
        "tinyrainbow": "^3.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/acorn": {
      "version": "8.15.0",
      "resolved": "https://registry.npmjs.org/acorn/-/acorn-8.15.0.tgz",
      "integrity": "sha512-NZyJarBfL7nWwIq+FDL6Zp/yHEhePMNnnJ0y3qfieCrmNvYct8uvtiV41UvlSe6apAfk0fY1FbWx+NwfmpvtTg==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "acorn": "bin/acorn"
      },
      "engines": {
        "node": ">=0.4.0"
      }
    },
    "node_modules/acorn-jsx": {
      "version": "5.3.2",
      "resolved": "https://registry.npmjs.org/acorn-jsx/-/acorn-jsx-5.3.2.tgz",
      "integrity": "sha512-rq9s+JNhf0IChjtDXxllJ7g41oZk5SlXtp0LHwyA5cejwn7vKmKp4pPri6YEePv2PU65sAsegbXtIinmDFDXgQ==",
      "dev": true,
      "license": "MIT",
      "peerDependencies": {
        "acorn": "^6.0.0 || ^7.0.0 || ^8.0.0"
      }
    },
    "node_modules/ajv": {
      "version": "6.12.6",
      "resolved": "https://registry.npmjs.org/ajv/-/ajv-6.12.6.tgz",
      "integrity": "sha512-j3fVLgvTo527anyYyJOGTYJbG+vnnQYvE0m5mmkc1TK+nxAppkCLMIL0aZ4dblVCNoGShhm+kzE4ZUykBoMg4g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fast-deep-equal": "^3.1.1",
        "fast-json-stable-stringify": "^2.0.0",
        "json-schema-traverse": "^0.4.1",
        "uri-js": "^4.2.2"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/epoberezkin"
      }
    },
    "node_modules/ansi-regex": {
      "version": "6.1.0",
      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-6.1.0.tgz",
      "integrity": "sha512-7HSX4QQb4CspciLpVFwyRe79O3xsIZDDLER21kERQ71oaPodF8jL725AgJMFAYbooIqolJoRLuM81SpeUkpkvA==",
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/chalk/ansi-regex?sponsor=1"
      }
    },
    "node_modules/ansi-styles": {
      "version": "4.3.0",
      "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-4.3.0.tgz",
      "integrity": "sha512-zbB9rCJAT1rbjiVDb2hqKFHNYLxgtk8NURxZ3IZwD3F6NtxbXZQCnnSi1Lkx+IDohdPlFp222wVALIheZJQSEg==",
      "license": "MIT",
      "dependencies": {
        "color-convert": "^2.0.1"
      },
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/chalk/ansi-styles?sponsor=1"
      }
    },
    "node_modules/any-promise": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/any-promise/-/any-promise-1.3.0.tgz",
      "integrity": "sha512-7UvmKalWRt1wgjL1RrGxoSJW/0QZFIegpeGvZG9kjp8vrRu55XTHbwnqq2GpXm9uLbcuhxm3IqX9OB4MZR1b2A==",
      "license": "MIT"
    },
    "node_modules/anymatch": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/anymatch/-/anymatch-3.1.3.tgz",
      "integrity": "sha512-KMReFUr0B4t+D+OBkjR3KYqvocp2XaSzO55UcB6mgQMd3KbcE+mWTyvVV7D/zsdEbNnV6acZUutkiHQXvTr1Rw==",
      "license": "ISC",
      "dependencies": {
        "normalize-path": "^3.0.0",
        "picomatch": "^2.0.4"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/arg": {
      "version": "5.0.2",
      "resolved": "https://registry.npmjs.org/arg/-/arg-5.0.2.tgz",
      "integrity": "sha512-PYjyFOLKQ9y57JvQ6QLo8dAgNqswh8M1RMJYdQduT6xbWSgK36P/Z/v+p888pM69jMMfS8Xd8F6I1kQ/I9HUGg==",
      "license": "MIT"
    },
    "node_modules/argparse": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/argparse/-/argparse-2.0.1.tgz",
      "integrity": "sha512-8+9WqebbFzpX9OR+Wa6O29asIogeRMzcGtAINdpMHHyAg10f05aSFVBbcEqGf/PXw1EjAZ+q2/bEBg3DvurK3Q==",
      "dev": true,
      "license": "Python-2.0"
    },
    "node_modules/aria-hidden": {
      "version": "1.2.4",
      "resolved": "https://registry.npmjs.org/aria-hidden/-/aria-hidden-1.2.4.tgz",
      "integrity": "sha512-y+CcFFwelSXpLZk/7fMB2mUbGtX9lKycf1MWJ7CaTIERyitVlyQx6C+sxcROU2BAJ24OiZyK+8wj2i8AlBoS3A==",
      "license": "MIT",
      "dependencies": {
        "tslib": "^2.0.0"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/aria-query": {
      "version": "5.3.0",
      "resolved": "https://registry.npmjs.org/aria-query/-/aria-query-5.3.0.tgz",
      "integrity": "sha512-b0P0sZPKtyu8HkeRAfCq0IfURZK+SuwMjY1UXGBU27wpAiTwQAIlq56IbIO+ytk/JjS1fMR14ee5WBBfKi5J6A==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "dequal": "^2.0.3"
      }
    },
    "node_modules/assertion-error": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/assertion-error/-/assertion-error-2.0.1.tgz",
      "integrity": "sha512-Izi8RQcffqCeNVgFigKli1ssklIbpHnCYc6AknXGYoB6grJqyeby7jv12JUQgmTAnIDnbck1uxksT4dzN3PWBA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/autoprefixer": {
      "version": "10.4.21",
      "resolved": "https://registry.npmjs.org/autoprefixer/-/autoprefixer-10.4.21.tgz",
      "integrity": "sha512-O+A6LWV5LDHSJD3LjHYoNi4VLsj/Whi7k6zG12xTYaU4cQ8oxQGckXNX8cRHK5yOZ/ppVHe0ZBXGzSV9jXdVbQ==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/autoprefixer"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "browserslist": "^4.24.4",
        "caniuse-lite": "^1.0.30001702",
        "fraction.js": "^4.3.7",
        "normalize-range": "^0.1.2",
        "picocolors": "^1.1.1",
        "postcss-value-parser": "^4.2.0"
      },
      "bin": {
        "autoprefixer": "bin/autoprefixer"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      },
      "peerDependencies": {
        "postcss": "^8.1.0"
      }
    },
    "node_modules/balanced-match": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/balanced-match/-/balanced-match-1.0.2.tgz",
      "integrity": "sha512-3oSeUO0TMV67hN1AmbXsK4yaqU7tjiHlbxRDZOpH0KW9+CeX4bRAaX0Anxt0tx2MrpRpWwQaPwIlISEJhYU5Pw==",
      "license": "MIT"
    },
    "node_modules/bidi-js": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/bidi-js/-/bidi-js-1.0.3.tgz",
      "integrity": "sha512-RKshQI1R3YQ+n9YJz2QQ147P66ELpa1FQEg20Dk8oW9t2KgLbpDLLp9aGZ7y8WHSshDknG0bknqGw5/tyCs5tw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "require-from-string": "^2.0.2"
      }
    },
    "node_modules/binary-extensions": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/binary-extensions/-/binary-extensions-2.3.0.tgz",
      "integrity": "sha512-Ceh+7ox5qe7LJuLHoY0feh3pHuUDHAcRUeyL2VYghZwfpkNIy/+8Ocg0a3UuSoYzavmylwuLWQOf3hl0jjMMIw==",
      "license": "MIT",
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/brace-expansion": {
      "version": "1.1.12",
      "resolved": "https://registry.npmjs.org/brace-expansion/-/brace-expansion-1.1.12.tgz",
      "integrity": "sha512-9T9UjW3r0UW5c1Q7GTwllptXwhvYmEzFhzMfZ9H7FQWt+uZePjZPjBP/W1ZEyZ1twGWom5/56TF4lPcqjnDHcg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "balanced-match": "^1.0.0",
        "concat-map": "0.0.1"
      }
    },
    "node_modules/braces": {
      "version": "3.0.3",
      "resolved": "https://registry.npmjs.org/braces/-/braces-3.0.3.tgz",
      "integrity": "sha512-yQbXgO/OSZVD2IsiLlro+7Hf6Q18EJrKSEsdoMzKePKXct3gvD8oLcOQdIzGupr5Fj+EDe8gO/lxc1BzfMpxvA==",
      "license": "MIT",
      "dependencies": {
        "fill-range": "^7.1.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/browserslist": {
      "version": "4.25.1",
      "resolved": "https://registry.npmjs.org/browserslist/-/browserslist-4.25.1.tgz",
      "integrity": "sha512-KGj0KoOMXLpSNkkEI6Z6mShmQy0bc1I+T7K9N81k4WWMrfz+6fQ6es80B/YLAeRoKvjYE1YSHHOW1qe9xIVzHw==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/browserslist"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "caniuse-lite": "^1.0.30001726",
        "electron-to-chromium": "^1.5.173",
        "node-releases": "^2.0.19",
        "update-browserslist-db": "^1.1.3"
      },
      "bin": {
        "browserslist": "cli.js"
      },
      "engines": {
        "node": "^6 || ^7 || ^8 || ^9 || ^10 || ^11 || ^12 || >=13.7"
      }
    },
    "node_modules/buffer-image-size": {
      "version": "0.6.4",
      "resolved": "https://registry.npmjs.org/buffer-image-size/-/buffer-image-size-0.6.4.tgz",
      "integrity": "sha512-nEh+kZOPY1w+gcCMobZ6ETUp9WfibndnosbpwB1iJk/8Gt5ZF2bhS6+B6bPYz424KtwsR6Rflc3tCz1/ghX2dQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/node": "*"
      },
      "engines": {
        "node": ">=4.0"
      }
    },
    "node_modules/callsites": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/callsites/-/callsites-3.1.0.tgz",
      "integrity": "sha512-P8BjAsXvZS+VIDUI11hHCQEv74YT67YUi5JJFNWIqL235sBmjX4+qx9Muvls5ivyNENctx46xQLQ3aTuE7ssaQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/camelcase": {
      "version": "5.3.1",
      "resolved": "https://registry.npmjs.org/camelcase/-/camelcase-5.3.1.tgz",
      "integrity": "sha512-L28STB170nwWS63UjtlEOE3dldQApaJXZkOI1uMFfzf3rRuPegHaHesyee+YxQ+W6SvRDQV6UrdOdRiR153wJg==",
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/camelcase-css": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/camelcase-css/-/camelcase-css-2.0.1.tgz",
      "integrity": "sha512-QOSvevhslijgYwRx6Rv7zKdMF8lbRmx+uQGx2+vDc+KI/eBnsy9kit5aj23AgGu3pa4t9AgwbnXWqS+iOY+2aA==",
      "license": "MIT",
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/caniuse-lite": {
      "version": "1.0.30001727",
      "resolved": "https://registry.npmjs.org/caniuse-lite/-/caniuse-lite-1.0.30001727.tgz",
      "integrity": "sha512-pB68nIHmbN6L/4C6MH1DokyR3bYqFwjaSs/sWDHGj4CTcFtQUQMuJftVwWkXq7mNWOybD3KhUv3oWHoGxgP14Q==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/caniuse-lite"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "CC-BY-4.0"
    },
    "node_modules/chai": {
      "version": "6.2.2",
      "resolved": "https://registry.npmjs.org/chai/-/chai-6.2.2.tgz",
      "integrity": "sha512-NUPRluOfOiTKBKvWPtSD4PhFvWCqOi0BGStNWs57X9js7XGTprSmFoz5F0tWhR4WPjNeR9jXqdC7/UpSJTnlRg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/chalk": {
      "version": "4.1.2",
      "resolved": "https://registry.npmjs.org/chalk/-/chalk-4.1.2.tgz",
      "integrity": "sha512-oKnbhFyRIXpUuez8iBMmyEa4nbj4IOQyuhc/wy9kY7/WVPcwIO9VA668Pu8RkO7+0G76SLROeyw9CpQ061i4mA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ansi-styles": "^4.1.0",
        "supports-color": "^7.1.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/chalk/chalk?sponsor=1"
      }
    },
    "node_modules/chokidar": {
      "version": "3.6.0",
      "resolved": "https://registry.npmjs.org/chokidar/-/chokidar-3.6.0.tgz",
      "integrity": "sha512-7VT13fmjotKpGipCW9JEQAusEPE+Ei8nl6/g4FBAmIm0GOOLMua9NDDo/DWp0ZAxCr3cPq5ZpBqmPAQgDda2Pw==",
      "license": "MIT",
      "dependencies": {
        "anymatch": "~3.1.2",
        "braces": "~3.0.2",
        "glob-parent": "~5.1.2",
        "is-binary-path": "~2.1.0",
        "is-glob": "~4.0.1",
        "normalize-path": "~3.0.0",
        "readdirp": "~3.6.0"
      },
      "engines": {
        "node": ">= 8.10.0"
      },
      "funding": {
        "url": "https://paulmillr.com/funding/"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.2"
      }
    },
    "node_modules/chokidar/node_modules/glob-parent": {
      "version": "5.1.2",
      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-5.1.2.tgz",
      "integrity": "sha512-AOIgSQCepiJYwP3ARnGx+5VnTu2HBYdzbGP45eLw1vr3zB3vZLeyed1sC9hnbcOc9/SrMyM5RPQrkGz4aS9Zow==",
      "license": "ISC",
      "dependencies": {
        "is-glob": "^4.0.1"
      },
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/class-variance-authority": {
      "version": "0.7.1",
      "resolved": "https://registry.npmjs.org/class-variance-authority/-/class-variance-authority-0.7.1.tgz",
      "integrity": "sha512-Ka+9Trutv7G8M6WT6SeiRWz792K5qEqIGEGzXKhAE6xOWAY6pPH8U+9IY3oCMv6kqTmLsv7Xh/2w2RigkePMsg==",
      "dependencies": {
        "clsx": "^2.1.1"
      },
      "funding": {
        "url": "https://polar.sh/cva"
      }
    },
    "node_modules/cliui": {
      "version": "6.0.0",
      "resolved": "https://registry.npmjs.org/cliui/-/cliui-6.0.0.tgz",
      "integrity": "sha512-t6wbgtoCXvAzst7QgXxJYqPt0usEfbgQdftEPbLL/cvv6HPE5VgvqCuAIDR0NgU52ds6rFwqrgakNLrHEjCbrQ==",
      "license": "ISC",
      "dependencies": {
        "string-width": "^4.2.0",
        "strip-ansi": "^6.0.0",
        "wrap-ansi": "^6.2.0"
      }
    },
    "node_modules/cliui/node_modules/ansi-regex": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-5.0.1.tgz",
      "integrity": "sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==",
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/cliui/node_modules/emoji-regex": {
      "version": "8.0.0",
      "resolved": "https://registry.npmjs.org/emoji-regex/-/emoji-regex-8.0.0.tgz",
      "integrity": "sha512-MSjYzcWNOA0ewAHpz0MxpYFvwg6yjy1NG3xteoqz644VCo/RPgnr1/GGt+ic3iJTzQ8Eu3TdM14SawnVUmGE6A==",
      "license": "MIT"
    },
    "node_modules/cliui/node_modules/string-width": {
      "version": "4.2.3",
      "resolved": "https://registry.npmjs.org/string-width/-/string-width-4.2.3.tgz",
      "integrity": "sha512-wKyQRQpjJ0sIp62ErSZdGsjMJWsap5oRNihHhu6G7JVO/9jIB6UyevL+tXuOqrng8j/cxKTWyWUwvSTriiZz/g==",
      "license": "MIT",
      "dependencies": {
        "emoji-regex": "^8.0.0",
        "is-fullwidth-code-point": "^3.0.0",
        "strip-ansi": "^6.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/cliui/node_modules/strip-ansi": {
      "version": "6.0.1",
      "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-6.0.1.tgz",
      "integrity": "sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==",
      "license": "MIT",
      "dependencies": {
        "ansi-regex": "^5.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/cliui/node_modules/wrap-ansi": {
      "version": "6.2.0",
      "resolved": "https://registry.npmjs.org/wrap-ansi/-/wrap-ansi-6.2.0.tgz",
      "integrity": "sha512-r6lPcBGxZXlIcymEu7InxDMhdW0KDxpLgoFLcguasxCaJ/SOIZwINatK9KY/tf+ZrlywOKU0UDj3ATXUBfxJXA==",
      "license": "MIT",
      "dependencies": {
        "ansi-styles": "^4.0.0",
        "string-width": "^4.1.0",
        "strip-ansi": "^6.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/clsx": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/clsx/-/clsx-2.1.1.tgz",
      "integrity": "sha512-eYm0QWBtUrBWZWG0d386OGAw16Z995PiOVo2B7bjWSbHedGl5e0ZWaq65kOGgUSNesEIDkB9ISbTg/JK9dhCZA==",
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/cmdk": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/cmdk/-/cmdk-1.1.1.tgz",
      "integrity": "sha512-Vsv7kFaXm+ptHDMZ7izaRsP70GgrW9NBNGswt9OZaVBLlE0SNpDq8eu/VGXyF9r7M0azK3Wy7OlYXsuyYLFzHg==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-compose-refs": "^1.1.1",
        "@radix-ui/react-dialog": "^1.1.6",
        "@radix-ui/react-id": "^1.1.0",
        "@radix-ui/react-primitive": "^2.0.2"
      },
      "peerDependencies": {
        "react": "^18 || ^19 || ^19.0.0-rc",
        "react-dom": "^18 || ^19 || ^19.0.0-rc"
      }
    },
    "node_modules/color-convert": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/color-convert/-/color-convert-2.0.1.tgz",
      "integrity": "sha512-RRECPsj7iu/xb5oKYcsFHSppFNnsj/52OVTRKb4zP5onXwVF3zVmmToNcOfGC+CRDpfK/U584fMg38ZHCaElKQ==",
      "license": "MIT",
      "dependencies": {
        "color-name": "~1.1.4"
      },
      "engines": {
        "node": ">=7.0.0"
      }
    },
    "node_modules/color-name": {
      "version": "1.1.4",
      "resolved": "https://registry.npmjs.org/color-name/-/color-name-1.1.4.tgz",
      "integrity": "sha512-dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA==",
      "license": "MIT"
    },
    "node_modules/commander": {
      "version": "4.1.1",
      "resolved": "https://registry.npmjs.org/commander/-/commander-4.1.1.tgz",
      "integrity": "sha512-NOKm8xhkzAjzFx8B2v5OAHT+u5pRQc2UCa2Vq9jYL/31o2wi9mxBA7LIFs3sV5VSC49z6pEhfbMULvShKj26WA==",
      "license": "MIT",
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/concat-map": {
      "version": "0.0.1",
      "resolved": "https://registry.npmjs.org/concat-map/-/concat-map-0.0.1.tgz",
      "integrity": "sha512-/Srv4dswyQNBfohGpz9o6Yb3Gz3SrUDqBH5rTuhGR7ahtlbYKnVxw2bCFMRljaA7EXHaXZ8wsHdodFvbkhKmqg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/convert-source-map": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/convert-source-map/-/convert-source-map-2.0.0.tgz",
      "integrity": "sha512-Kvp459HrV2FEJ1CAsi1Ku+MY3kasH19TFykTz2xWmMeq6bk2NU3XXvfJ+Q61m0xktWwt+1HSYf3JZsTms3aRJg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/cross-spawn": {
      "version": "7.0.6",
      "resolved": "https://registry.npmjs.org/cross-spawn/-/cross-spawn-7.0.6.tgz",
      "integrity": "sha512-uV2QOWP2nWzsy2aMp8aRibhi9dlzF5Hgh5SHaB9OiTGEyDTiJJyx0uy51QXdyWbtAHNua4XJzUKca3OzKUd3vA==",
      "dependencies": {
        "path-key": "^3.1.0",
        "shebang-command": "^2.0.0",
        "which": "^2.0.1"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/css-tree": {
      "version": "3.2.1",
      "resolved": "https://registry.npmjs.org/css-tree/-/css-tree-3.2.1.tgz",
      "integrity": "sha512-X7sjQzceUhu1u7Y/ylrRZFU2FS6LRiFVp6rKLPg23y3x3c3DOKAwuXGDp+PAGjh6CSnCjYeAul8pcT8bAl+lSA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "mdn-data": "2.27.1",
        "source-map-js": "^1.2.1"
      },
      "engines": {
        "node": "^10 || ^12.20.0 || ^14.13.0 || >=15.0.0"
      }
    },
    "node_modules/css.escape": {
      "version": "1.5.1",
      "resolved": "https://registry.npmjs.org/css.escape/-/css.escape-1.5.1.tgz",
      "integrity": "sha512-YUifsXXuknHlUsmlgyY0PKzgPOr7/FjCePfHNt0jxm83wHZi44VDMQ7/fGNkjY3/jV1MC+1CmZbaHzugyeRtpg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/cssesc": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/cssesc/-/cssesc-3.0.0.tgz",
      "integrity": "sha512-/Tb/JcjK111nNScGob5MNtsntNM1aCNUDipB/TkwZFhyDrrE47SOx/18wF2bbjgc3ZzCSKW1T5nt5EbFoAz/Vg==",
      "license": "MIT",
      "bin": {
        "cssesc": "bin/cssesc"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/csstype": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/csstype/-/csstype-3.1.3.tgz",
      "integrity": "sha512-M1uQkMl8rQK/szD0LNhtqxIPLpimGm8sOBwU7lLnCpSbTyY3yeU1Vc7l4KT5zT4s/yOxHH5O7tIuuLOCnLADRw==",
      "license": "MIT"
    },
    "node_modules/d3-array": {
      "version": "3.2.4",
      "resolved": "https://registry.npmjs.org/d3-array/-/d3-array-3.2.4.tgz",
      "integrity": "sha512-tdQAmyA18i4J7wprpYq8ClcxZy3SC31QMeByyCFyRt7BVHdREQZ5lpzoe5mFEYZUWe+oq8HBvk9JjpibyEV4Jg==",
      "license": "ISC",
      "dependencies": {
        "internmap": "1 - 2"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-color": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/d3-color/-/d3-color-3.1.0.tgz",
      "integrity": "sha512-zg/chbXyeBtMQ1LbD/WSoW2DpC3I0mpmPdW+ynRTj/x2DAWYrIY7qeZIHidozwV24m4iavr15lNwIwLxRmOxhA==",
      "license": "ISC",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-ease": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/d3-ease/-/d3-ease-3.0.1.tgz",
      "integrity": "sha512-wR/XK3D3XcLIZwpbvQwQ5fK+8Ykds1ip7A2Txe0yxncXSdq1L9skcG7blcedkOX+ZcgxGAmLX1FrRGbADwzi0w==",
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-format": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/d3-format/-/d3-format-3.1.0.tgz",
      "integrity": "sha512-YyUI6AEuY/Wpt8KWLgZHsIU86atmikuoOmCfommt0LYHiQSPjvX2AcFc38PX0CBpr2RCyZhjex+NS/LPOv6YqA==",
      "license": "ISC",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-interpolate": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/d3-interpolate/-/d3-interpolate-3.0.1.tgz",
      "integrity": "sha512-3bYs1rOD33uo8aqJfKP3JWPAibgw8Zm2+L9vBKEHJ2Rg+viTR7o5Mmv5mZcieN+FRYaAOWX5SJATX6k1PWz72g==",
      "license": "ISC",
      "dependencies": {
        "d3-color": "1 - 3"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-path": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/d3-path/-/d3-path-3.1.0.tgz",
      "integrity": "sha512-p3KP5HCf/bvjBSSKuXid6Zqijx7wIfNW+J/maPs+iwR35at5JCbLUT0LzF1cnjbCHWhqzQTIN2Jpe8pRebIEFQ==",
      "license": "ISC",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-scale": {
      "version": "4.0.2",
      "resolved": "https://registry.npmjs.org/d3-scale/-/d3-scale-4.0.2.tgz",
      "integrity": "sha512-GZW464g1SH7ag3Y7hXjf8RoUuAFIqklOAq3MRl4OaWabTFJY9PN/E1YklhXLh+OQ3fM9yS2nOkCoS+WLZ6kvxQ==",
      "license": "ISC",
      "dependencies": {
        "d3-array": "2.10.0 - 3",
        "d3-format": "1 - 3",
        "d3-interpolate": "1.2.0 - 3",
        "d3-time": "2.1.1 - 3",
        "d3-time-format": "2 - 4"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-shape": {
      "version": "3.2.0",
      "resolved": "https://registry.npmjs.org/d3-shape/-/d3-shape-3.2.0.tgz",
      "integrity": "sha512-SaLBuwGm3MOViRq2ABk3eLoxwZELpH6zhl3FbAoJ7Vm1gofKx6El1Ib5z23NUEhF9AsGl7y+dzLe5Cw2AArGTA==",
      "license": "ISC",
      "dependencies": {
        "d3-path": "^3.1.0"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-time": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/d3-time/-/d3-time-3.1.0.tgz",
      "integrity": "sha512-VqKjzBLejbSMT4IgbmVgDjpkYrNWUYJnbCGo874u7MMKIWsILRX+OpX/gTk8MqjpT1A/c6HY2dCA77ZN0lkQ2Q==",
      "license": "ISC",
      "dependencies": {
        "d3-array": "2 - 3"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-time-format": {
      "version": "4.1.0",
      "resolved": "https://registry.npmjs.org/d3-time-format/-/d3-time-format-4.1.0.tgz",
      "integrity": "sha512-dJxPBlzC7NugB2PDLwo9Q8JiTR3M3e4/XANkreKSUxF8vvXKqm1Yfq4Q5dl8budlunRVlUUaDUgFt7eA8D6NLg==",
      "license": "ISC",
      "dependencies": {
        "d3-time": "1 - 3"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-timer": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/d3-timer/-/d3-timer-3.0.1.tgz",
      "integrity": "sha512-ndfJ/JxxMd3nw31uyKoY2naivF+r29V+Lc0svZxe1JvvIRmi8hUsrMvdOwgS1o6uBHmiz91geQ0ylPP0aj1VUA==",
      "license": "ISC",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/data-urls": {
      "version": "7.0.0",
      "resolved": "https://registry.npmjs.org/data-urls/-/data-urls-7.0.0.tgz",
      "integrity": "sha512-23XHcCF+coGYevirZceTVD7NdJOqVn+49IHyxgszm+JIiHLoB2TkmPtsYkNWT1pvRSGkc35L6NHs0yHkN2SumA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "whatwg-mimetype": "^5.0.0",
        "whatwg-url": "^16.0.0"
      },
      "engines": {
        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
      }
    },
    "node_modules/data-urls/node_modules/whatwg-mimetype": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/whatwg-mimetype/-/whatwg-mimetype-5.0.0.tgz",
      "integrity": "sha512-sXcNcHOC51uPGF0P/D4NVtrkjSU2fNsm9iog4ZvZJsL3rjoDAzXZhkm2MWt1y+PUdggKAYVoMAIYcs78wJ51Cw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=20"
      }
    },
    "node_modules/date-fns": {
      "version": "3.6.0",
      "resolved": "https://registry.npmjs.org/date-fns/-/date-fns-3.6.0.tgz",
      "integrity": "sha512-fRHTG8g/Gif+kSh50gaGEdToemgfj74aRX3swtiouboip5JDLAyDE9F11nHMIcvOaXeOC6D7SpNhi7uFyB7Uww==",
      "license": "MIT",
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/kossnocorp"
      }
    },
    "node_modules/debug": {
      "version": "4.3.7",
      "resolved": "https://registry.npmjs.org/debug/-/debug-4.3.7.tgz",
      "integrity": "sha512-Er2nc/H7RrMXZBFCEim6TCmMk02Z8vLC2Rbi1KEBggpo0fS6l0S1nnapwmIi3yW/+GOJap1Krg4w0Hg80oCqgQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ms": "^2.1.3"
      },
      "engines": {
        "node": ">=6.0"
      },
      "peerDependenciesMeta": {
        "supports-color": {
          "optional": true
        }
      }
    },
    "node_modules/decamelize": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/decamelize/-/decamelize-1.2.0.tgz",
      "integrity": "sha512-z2S+W9X73hAUUki+N+9Za2lBlun89zigOyGrsax+KUQ6wKW4ZoWpEYBkGhQjwAjjDCkWxhY0VKEhk8wzY7F5cA==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/decimal.js": {
      "version": "10.6.0",
      "resolved": "https://registry.npmjs.org/decimal.js/-/decimal.js-10.6.0.tgz",
      "integrity": "sha512-YpgQiITW3JXGntzdUmyUR1V812Hn8T1YVXhCu+wO3OpS4eU9l4YdD3qjyiKdV6mvV29zapkMeD390UVEf2lkUg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/decimal.js-light": {
      "version": "2.5.1",
      "resolved": "https://registry.npmjs.org/decimal.js-light/-/decimal.js-light-2.5.1.tgz",
      "integrity": "sha512-qIMFpTMZmny+MMIitAB6D7iVPEorVw6YQRWkvarTkT4tBeSLLiHzcwj6q0MmYSFCiVpiqPJTJEYIrpcPzVEIvg==",
      "license": "MIT"
    },
    "node_modules/deep-is": {
      "version": "0.1.4",
      "resolved": "https://registry.npmjs.org/deep-is/-/deep-is-0.1.4.tgz",
      "integrity": "sha512-oIPzksmTg4/MriiaYGO+okXDT7ztn/w3Eptv/+gSIdMdKsJo0u4CfYNFJPy+4SKMuCqGw2wxnA+URMg3t8a/bQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/dequal": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/dequal/-/dequal-2.0.3.tgz",
      "integrity": "sha512-0je+qPKHEMohvfRTCEo3CrPG6cAzAYgmzKyxRiYSSDkS6eGJdyVJm7WaYA5ECaAD9wLB2T4EEeymA5aFVcYXCA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/detect-libc": {
      "version": "2.1.2",
      "resolved": "https://registry.npmjs.org/detect-libc/-/detect-libc-2.1.2.tgz",
      "integrity": "sha512-Btj2BOOO83o3WyH59e8MgXsxEQVcarkUOpEYrubB0urwnN10yQ364rsiByU11nZlqWYZm05i/of7io4mzihBtQ==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/detect-node-es": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/detect-node-es/-/detect-node-es-1.1.0.tgz",
      "integrity": "sha512-ypdmJU/TbBby2Dxibuv7ZLW3Bs1QEmM7nHjEANfohJLvE0XVujisn1qPJcZxg+qDucsr+bP6fLD1rPS3AhJ7EQ==",
      "license": "MIT"
    },
    "node_modules/didyoumean": {
      "version": "1.2.2",
      "resolved": "https://registry.npmjs.org/didyoumean/-/didyoumean-1.2.2.tgz",
      "integrity": "sha512-gxtyfqMg7GKyhQmb056K7M3xszy/myH8w+B4RT+QXBQsvAOdc3XymqDDPHx1BgPgsdAA5SIifona89YtRATDzw==",
      "license": "Apache-2.0"
    },
    "node_modules/dijkstrajs": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/dijkstrajs/-/dijkstrajs-1.0.3.tgz",
      "integrity": "sha512-qiSlmBq9+BCdCA/L46dw8Uy93mloxsPSbwnm5yrKn2vMPiy8KyAskTF6zuV/j5BMsmOGZDPs7KjU+mjb670kfA==",
      "license": "MIT"
    },
    "node_modules/dlv": {
      "version": "1.1.3",
      "resolved": "https://registry.npmjs.org/dlv/-/dlv-1.1.3.tgz",
      "integrity": "sha512-+HlytyjlPKnIG8XuRG8WvmBP8xs8P71y+SKKS6ZXWoEgLuePxtDoUEiH7WkdePWrQ5JBpE6aoVqfZfJUQkjXwA==",
      "license": "MIT"
    },
    "node_modules/dom-accessibility-api": {
      "version": "0.5.16",
      "resolved": "https://registry.npmjs.org/dom-accessibility-api/-/dom-accessibility-api-0.5.16.tgz",
      "integrity": "sha512-X7BJ2yElsnOJ30pZF4uIIDfBEVgF4XEBxL9Bxhy6dnrm5hkzqmsWHGTiHqRiITNhMyFLyAiWndIJP7Z1NTteDg==",
      "dev": true,
      "license": "MIT",
      "peer": true
    },
    "node_modules/dom-helpers": {
      "version": "5.2.1",
      "resolved": "https://registry.npmjs.org/dom-helpers/-/dom-helpers-5.2.1.tgz",
      "integrity": "sha512-nRCa7CK3VTrM2NmGkIy4cbK7IZlgBE/PYMn55rrXefr5xXDP0LdtfPnblFDoVdcAfslJ7or6iqAUnx0CCGIWQA==",
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.8.7",
        "csstype": "^3.0.2"
      }
    },
    "node_modules/eastasianwidth": {
      "version": "0.2.0",
      "resolved": "https://registry.npmjs.org/eastasianwidth/-/eastasianwidth-0.2.0.tgz",
      "integrity": "sha512-I88TYZWc9XiYHRQ4/3c5rjjfgkjhLyW2luGIheGERbNQ6OY7yTybanSpDXZa8y7VUP9YmDcYa+eyq4ca7iLqWA==",
      "license": "MIT"
    },
    "node_modules/electron-to-chromium": {
      "version": "1.5.192",
      "resolved": "https://registry.npmjs.org/electron-to-chromium/-/electron-to-chromium-1.5.192.tgz",
      "integrity": "sha512-rP8Ez0w7UNw/9j5eSXCe10o1g/8B1P5SM90PCCMVkIRQn2R0LEHWz4Eh9RnxkniuDe1W0cTSOB3MLlkTGDcuCg==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/embla-carousel": {
      "version": "8.6.0",
      "resolved": "https://registry.npmjs.org/embla-carousel/-/embla-carousel-8.6.0.tgz",
      "integrity": "sha512-SjWyZBHJPbqxHOzckOfo8lHisEaJWmwd23XppYFYVh10bU66/Pn5tkVkbkCMZVdbUE5eTCI2nD8OyIP4Z+uwkA==",
      "license": "MIT"
    },
    "node_modules/embla-carousel-react": {
      "version": "8.6.0",
      "resolved": "https://registry.npmjs.org/embla-carousel-react/-/embla-carousel-react-8.6.0.tgz",
      "integrity": "sha512-0/PjqU7geVmo6F734pmPqpyHqiM99olvyecY7zdweCw+6tKEXnrE90pBiBbMMU8s5tICemzpQ3hi5EpxzGW+JA==",
      "license": "MIT",
      "dependencies": {
        "embla-carousel": "8.6.0",
        "embla-carousel-reactive-utils": "8.6.0"
      },
      "peerDependencies": {
        "react": "^16.8.0 || ^17.0.1 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc"
      }
    },
    "node_modules/embla-carousel-reactive-utils": {
      "version": "8.6.0",
      "resolved": "https://registry.npmjs.org/embla-carousel-reactive-utils/-/embla-carousel-reactive-utils-8.6.0.tgz",
      "integrity": "sha512-fMVUDUEx0/uIEDM0Mz3dHznDhfX+znCCDCeIophYb1QGVM7YThSWX+wz11zlYwWFOr74b4QLGg0hrGPJeG2s4A==",
      "license": "MIT",
      "peerDependencies": {
        "embla-carousel": "8.6.0"
      }
    },
    "node_modules/emoji-regex": {
      "version": "9.2.2",
      "resolved": "https://registry.npmjs.org/emoji-regex/-/emoji-regex-9.2.2.tgz",
      "integrity": "sha512-L18DaJsXSUk2+42pv8mLs5jJT2hqFkFE4j21wOmgbUqsZ2hL72NsUU785g9RXgo3s0ZNgVl42TiHp3ZtOv/Vyg==",
      "license": "MIT"
    },
    "node_modules/entities": {
      "version": "7.0.1",
      "resolved": "https://registry.npmjs.org/entities/-/entities-7.0.1.tgz",
      "integrity": "sha512-TWrgLOFUQTH994YUyl1yT4uyavY5nNB5muff+RtWaqNVCAK408b5ZnnbNAUEWLTCpum9w6arT70i1XdQ4UeOPA==",
      "dev": true,
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=0.12"
      },
      "funding": {
        "url": "https://github.com/fb55/entities?sponsor=1"
      }
    },
    "node_modules/es-module-lexer": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/es-module-lexer/-/es-module-lexer-2.1.0.tgz",
      "integrity": "sha512-n27zTYMjYu1aj4MjCWzSP7G9r75utsaoc8m61weK+W8JMBGGQybd43GstCXZ3WNmSFtGT9wi59qQTW6mhTR5LQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/esbuild": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.21.5.tgz",
      "integrity": "sha512-mg3OPMV4hXywwpoDxu3Qda5xCKQi+vCTZq8S9J/EpkhB2HzKXq4SNFZE3+NK93JYxc8VMSep+lOUSC/RVKaBqw==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "bin": {
        "esbuild": "bin/esbuild"
      },
      "engines": {
        "node": ">=12"
      },
      "optionalDependencies": {
        "@esbuild/aix-ppc64": "0.21.5",
        "@esbuild/android-arm": "0.21.5",
        "@esbuild/android-arm64": "0.21.5",
        "@esbuild/android-x64": "0.21.5",
        "@esbuild/darwin-arm64": "0.21.5",
        "@esbuild/darwin-x64": "0.21.5",
        "@esbuild/freebsd-arm64": "0.21.5",
        "@esbuild/freebsd-x64": "0.21.5",
        "@esbuild/linux-arm": "0.21.5",
        "@esbuild/linux-arm64": "0.21.5",
        "@esbuild/linux-ia32": "0.21.5",
        "@esbuild/linux-loong64": "0.21.5",
        "@esbuild/linux-mips64el": "0.21.5",
        "@esbuild/linux-ppc64": "0.21.5",
        "@esbuild/linux-riscv64": "0.21.5",
        "@esbuild/linux-s390x": "0.21.5",
        "@esbuild/linux-x64": "0.21.5",
        "@esbuild/netbsd-x64": "0.21.5",
        "@esbuild/openbsd-x64": "0.21.5",
        "@esbuild/sunos-x64": "0.21.5",
        "@esbuild/win32-arm64": "0.21.5",
        "@esbuild/win32-ia32": "0.21.5",
        "@esbuild/win32-x64": "0.21.5"
      }
    },
    "node_modules/escalade": {
      "version": "3.2.0",
      "resolved": "https://registry.npmjs.org/escalade/-/escalade-3.2.0.tgz",
      "integrity": "sha512-WUj2qlxaQtO4g6Pq5c29GTcWGDyd8itL8zTlipgECz3JesAiiOKotd8JU6otB3PACgG6xkJUyVhboMS+bje/jA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/escape-string-regexp": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/escape-string-regexp/-/escape-string-regexp-4.0.0.tgz",
      "integrity": "sha512-TtpcNJ3XAzx3Gq8sWRzJaVajRs0uVxA2YAkdb1jm2YkPz4G6egUFAyA3n5vtEIZefPk5Wa4UXbKuS5fKkJWdgA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/eslint": {
      "version": "9.32.0",
      "resolved": "https://registry.npmjs.org/eslint/-/eslint-9.32.0.tgz",
      "integrity": "sha512-LSehfdpgMeWcTZkWZVIJl+tkZ2nuSkyyB9C27MZqFWXuph7DvaowgcTvKqxvpLW1JZIk8PN7hFY3Rj9LQ7m7lg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@eslint-community/eslint-utils": "^4.2.0",
        "@eslint-community/regexpp": "^4.12.1",
        "@eslint/config-array": "^0.21.0",
        "@eslint/config-helpers": "^0.3.0",
        "@eslint/core": "^0.15.0",
        "@eslint/eslintrc": "^3.3.1",
        "@eslint/js": "9.32.0",
        "@eslint/plugin-kit": "^0.3.4",
        "@humanfs/node": "^0.16.6",
        "@humanwhocodes/module-importer": "^1.0.1",
        "@humanwhocodes/retry": "^0.4.2",
        "@types/estree": "^1.0.6",
        "@types/json-schema": "^7.0.15",
        "ajv": "^6.12.4",
        "chalk": "^4.0.0",
        "cross-spawn": "^7.0.6",
        "debug": "^4.3.2",
        "escape-string-regexp": "^4.0.0",
        "eslint-scope": "^8.4.0",
        "eslint-visitor-keys": "^4.2.1",
        "espree": "^10.4.0",
        "esquery": "^1.5.0",
        "esutils": "^2.0.2",
        "fast-deep-equal": "^3.1.3",
        "file-entry-cache": "^8.0.0",
        "find-up": "^5.0.0",
        "glob-parent": "^6.0.2",
        "ignore": "^5.2.0",
        "imurmurhash": "^0.1.4",
        "is-glob": "^4.0.0",
        "json-stable-stringify-without-jsonify": "^1.0.1",
        "lodash.merge": "^4.6.2",
        "minimatch": "^3.1.2",
        "natural-compare": "^1.4.0",
        "optionator": "^0.9.3"
      },
      "bin": {
        "eslint": "bin/eslint.js"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://eslint.org/donate"
      },
      "peerDependencies": {
        "jiti": "*"
      },
      "peerDependenciesMeta": {
        "jiti": {
          "optional": true
        }
      }
    },
    "node_modules/eslint-plugin-react-hooks": {
      "version": "5.2.0",
      "resolved": "https://registry.npmjs.org/eslint-plugin-react-hooks/-/eslint-plugin-react-hooks-5.2.0.tgz",
      "integrity": "sha512-+f15FfK64YQwZdJNELETdn5ibXEUQmW1DZL6KXhNnc2heoy/sg9VJJeT7n8TlMWouzWqSWavFkIhHyIbIAEapg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=10"
      },
      "peerDependencies": {
        "eslint": "^3.0.0 || ^4.0.0 || ^5.0.0 || ^6.0.0 || ^7.0.0 || ^8.0.0-0 || ^9.0.0"
      }
    },
    "node_modules/eslint-plugin-react-refresh": {
      "version": "0.4.20",
      "resolved": "https://registry.npmjs.org/eslint-plugin-react-refresh/-/eslint-plugin-react-refresh-0.4.20.tgz",
      "integrity": "sha512-XpbHQ2q5gUF8BGOX4dHe+71qoirYMhApEPZ7sfhF/dNnOF1UXnCMGZf79SFTBO7Bz5YEIT4TMieSlJBWhP9WBA==",
      "dev": true,
      "license": "MIT",
      "peerDependencies": {
        "eslint": ">=8.40"
      }
    },
    "node_modules/eslint-scope": {
      "version": "8.4.0",
      "resolved": "https://registry.npmjs.org/eslint-scope/-/eslint-scope-8.4.0.tgz",
      "integrity": "sha512-sNXOfKCn74rt8RICKMvJS7XKV/Xk9kA7DyJr8mJik3S7Cwgy3qlkkmyS2uQB3jiJg6VNdZd/pDBJu0nvG2NlTg==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "esrecurse": "^4.3.0",
        "estraverse": "^5.2.0"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/eslint-visitor-keys": {
      "version": "4.2.1",
      "resolved": "https://registry.npmjs.org/eslint-visitor-keys/-/eslint-visitor-keys-4.2.1.tgz",
      "integrity": "sha512-Uhdk5sfqcee/9H/rCOJikYz67o0a2Tw2hGRPOG2Y1R2dg7brRe1uG0yaNQDHu+TO/uQPF/5eCapvYSmHUjt7JQ==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/espree": {
      "version": "10.4.0",
      "resolved": "https://registry.npmjs.org/espree/-/espree-10.4.0.tgz",
      "integrity": "sha512-j6PAQ2uUr79PZhBjP5C5fhl8e39FmRnOjsD5lGnWrFU8i2G776tBK7+nP8KuQUTTyAZUwfQqXAgrVH5MbH9CYQ==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "acorn": "^8.15.0",
        "acorn-jsx": "^5.3.2",
        "eslint-visitor-keys": "^4.2.1"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/esquery": {
      "version": "1.6.0",
      "resolved": "https://registry.npmjs.org/esquery/-/esquery-1.6.0.tgz",
      "integrity": "sha512-ca9pw9fomFcKPvFLXhBKUK90ZvGibiGOvRJNbjljY7s7uq/5YO4BOzcYtJqExdx99rF6aAcnRxHmcUHcz6sQsg==",
      "dev": true,
      "license": "BSD-3-Clause",
      "dependencies": {
        "estraverse": "^5.1.0"
      },
      "engines": {
        "node": ">=0.10"
      }
    },
    "node_modules/esrecurse": {
      "version": "4.3.0",
      "resolved": "https://registry.npmjs.org/esrecurse/-/esrecurse-4.3.0.tgz",
      "integrity": "sha512-KmfKL3b6G+RXvP8N1vr3Tq1kL/oCFgn2NYXEtqP8/L3pKapUA4G8cFVaoF3SU323CD4XypR/ffioHmkti6/Tag==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "estraverse": "^5.2.0"
      },
      "engines": {
        "node": ">=4.0"
      }
    },
    "node_modules/estraverse": {
      "version": "5.3.0",
      "resolved": "https://registry.npmjs.org/estraverse/-/estraverse-5.3.0.tgz",
      "integrity": "sha512-MMdARuVEQziNTeJD8DgMqmhwR11BRQ/cBP+pLtYdSTnf3MIO8fFeiINEbX36ZdNlfU/7A9f3gUw49B3oQsvwBA==",
      "dev": true,
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=4.0"
      }
    },
    "node_modules/estree-walker": {
      "version": "3.0.3",
      "resolved": "https://registry.npmjs.org/estree-walker/-/estree-walker-3.0.3.tgz",
      "integrity": "sha512-7RUKfXgSMMkzt6ZuXmqapOurLGPPfgj6l9uRZ7lRGolvk0y2yocc35LdcxKC5PQZdn2DMqioAQ2NoWcrTKmm6g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/estree": "^1.0.0"
      }
    },
    "node_modules/esutils": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/esutils/-/esutils-2.0.3.tgz",
      "integrity": "sha512-kVscqXk4OCp68SZ0dkgEKVi6/8ij300KBWTJq32P/dYeWTSwK41WyTxalN1eRmA5Z9UU/LX9D7FWSmV9SAYx6g==",
      "dev": true,
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/eventemitter3": {
      "version": "4.0.7",
      "resolved": "https://registry.npmjs.org/eventemitter3/-/eventemitter3-4.0.7.tgz",
      "integrity": "sha512-8guHBZCwKnFhYdHr2ysuRWErTwhoN2X8XELRlrRwpmfeY2jjuUN4taQMsULKUVo1K4DvZl+0pgfyoysHxvmvEw==",
      "license": "MIT"
    },
    "node_modules/expect-type": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/expect-type/-/expect-type-1.3.0.tgz",
      "integrity": "sha512-knvyeauYhqjOYvQ66MznSMs83wmHrCycNEN6Ao+2AeYEfxUIkuiVxdEa1qlGEPK+We3n0THiDciYSsCcgW/DoA==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=12.0.0"
      }
    },
    "node_modules/fake-indexeddb": {
      "version": "6.2.5",
      "resolved": "https://registry.npmjs.org/fake-indexeddb/-/fake-indexeddb-6.2.5.tgz",
      "integrity": "sha512-CGnyrvbhPlWYMngksqrSSUT1BAVP49dZocrHuK0SvtR0D5TMs5wP0o3j7jexDJW01KSadjBp1M/71o/KR3nD1w==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/fast-deep-equal": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/fast-deep-equal/-/fast-deep-equal-3.1.3.tgz",
      "integrity": "sha512-f3qQ9oQy9j2AhBe/H9VC91wLmKBCCU/gDOnKNAYG5hswO7BLKj09Hc5HYNz9cGI++xlpDCIgDaitVs03ATR84Q==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/fast-equals": {
      "version": "5.2.2",
      "resolved": "https://registry.npmjs.org/fast-equals/-/fast-equals-5.2.2.tgz",
      "integrity": "sha512-V7/RktU11J3I36Nwq2JnZEM7tNm17eBJz+u25qdxBZeCKiX6BkVSZQjwWIr+IobgnZy+ag73tTZgZi7tr0LrBw==",
      "license": "MIT",
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/fast-glob": {
      "version": "3.3.2",
      "resolved": "https://registry.npmjs.org/fast-glob/-/fast-glob-3.3.2.tgz",
      "integrity": "sha512-oX2ruAFQwf/Orj8m737Y5adxDQO0LAB7/S5MnxCdTNDd4p6BsyIVsv9JQsATbTSq8KHRpLwIHbVlUNatxd+1Ow==",
      "license": "MIT",
      "dependencies": {
        "@nodelib/fs.stat": "^2.0.2",
        "@nodelib/fs.walk": "^1.2.3",
        "glob-parent": "^5.1.2",
        "merge2": "^1.3.0",
        "micromatch": "^4.0.4"
      },
      "engines": {
        "node": ">=8.6.0"
      }
    },
    "node_modules/fast-glob/node_modules/glob-parent": {
      "version": "5.1.2",
      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-5.1.2.tgz",
      "integrity": "sha512-AOIgSQCepiJYwP3ARnGx+5VnTu2HBYdzbGP45eLw1vr3zB3vZLeyed1sC9hnbcOc9/SrMyM5RPQrkGz4aS9Zow==",
      "license": "ISC",
      "dependencies": {
        "is-glob": "^4.0.1"
      },
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/fast-json-stable-stringify": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/fast-json-stable-stringify/-/fast-json-stable-stringify-2.1.0.tgz",
      "integrity": "sha512-lhd/wF+Lk98HZoTCtlVraHtfh5XYijIjalXck7saUtuanSDyLMxnHhSXEDJqHxD7msR8D0uCmqlkwjCV8xvwHw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/fast-levenshtein": {
      "version": "2.0.6",
      "resolved": "https://registry.npmjs.org/fast-levenshtein/-/fast-levenshtein-2.0.6.tgz",
      "integrity": "sha512-DCXu6Ifhqcks7TZKY3Hxp3y6qphY5SJZmrWMDrKcERSOXWQdMhU9Ig/PYrzyw/ul9jOIyh0N4M0tbC5hodg8dw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/fastq": {
      "version": "1.17.1",
      "resolved": "https://registry.npmjs.org/fastq/-/fastq-1.17.1.tgz",
      "integrity": "sha512-sRVD3lWVIXWg6By68ZN7vho9a1pQcN/WBFaAAsDDFzlJjvoGx0P8z7V1t72grFJfJhu3YPZBuu25f7Kaw2jN1w==",
      "license": "ISC",
      "dependencies": {
        "reusify": "^1.0.4"
      }
    },
    "node_modules/fflate": {
      "version": "0.8.3",
      "resolved": "https://registry.npmjs.org/fflate/-/fflate-0.8.3.tgz",
      "integrity": "sha512-tbZNuJrLwGUp3zshBtdy4W+ORxZuIh8a5ilyIEQDC5rY1f3U20JMry0Ll3WBzU58EZKsEuJFXhb5gwv8CsPvgA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/file-entry-cache": {
      "version": "8.0.0",
      "resolved": "https://registry.npmjs.org/file-entry-cache/-/file-entry-cache-8.0.0.tgz",
      "integrity": "sha512-XXTUwCvisa5oacNGRP9SfNtYBNAMi+RPwBFmblZEF7N7swHYQS6/Zfk7SRwx4D5j3CH211YNRco1DEMNVfZCnQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "flat-cache": "^4.0.0"
      },
      "engines": {
        "node": ">=16.0.0"
      }
    },
    "node_modules/fill-range": {
      "version": "7.1.1",
      "resolved": "https://registry.npmjs.org/fill-range/-/fill-range-7.1.1.tgz",
      "integrity": "sha512-YsGpe3WHLK8ZYi4tWDg2Jy3ebRz2rXowDxnld4bkQB00cc/1Zw9AWnC0i9ztDJitivtQvaI9KaLyKrc+hBW0yg==",
      "license": "MIT",
      "dependencies": {
        "to-regex-range": "^5.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/find-up": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/find-up/-/find-up-5.0.0.tgz",
      "integrity": "sha512-78/PXT1wlLLDgTzDs7sjq9hzz0vXD+zn+7wypEe4fXQxCmdmqfGsEPQxmiCSQI3ajFV91bVSsvNtrJRiW6nGng==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "locate-path": "^6.0.0",
        "path-exists": "^4.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/flat-cache": {
      "version": "4.0.1",
      "resolved": "https://registry.npmjs.org/flat-cache/-/flat-cache-4.0.1.tgz",
      "integrity": "sha512-f7ccFPK3SXFHpx15UIGyRJ/FJQctuKZ0zVuN3frBo4HnK3cay9VEW0R6yPYFHC0AgqhukPzKjq22t5DmAyqGyw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "flatted": "^3.2.9",
        "keyv": "^4.5.4"
      },
      "engines": {
        "node": ">=16"
      }
    },
    "node_modules/flatted": {
      "version": "3.4.2",
      "resolved": "https://registry.npmjs.org/flatted/-/flatted-3.4.2.tgz",
      "integrity": "sha512-PjDse7RzhcPkIJwy5t7KPWQSZ9cAbzQXcafsetQoD7sOJRQlGikNbx7yZp2OotDnJyrDcbyRq3Ttb18iYOqkxA==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/foreground-child": {
      "version": "3.3.0",
      "resolved": "https://registry.npmjs.org/foreground-child/-/foreground-child-3.3.0.tgz",
      "integrity": "sha512-Ld2g8rrAyMYFXBhEqMz8ZAHBi4J4uS1i/CxGMDnjyFWddMXLVcDp051DZfu+t7+ab7Wv6SMqpWmyFIj5UbfFvg==",
      "license": "ISC",
      "dependencies": {
        "cross-spawn": "^7.0.0",
        "signal-exit": "^4.0.1"
      },
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/fraction.js": {
      "version": "4.3.7",
      "resolved": "https://registry.npmjs.org/fraction.js/-/fraction.js-4.3.7.tgz",
      "integrity": "sha512-ZsDfxO51wGAXREY55a7la9LScWpwv9RxIrYABrlvOFBlH/ShPnrtsXeuUIfXKKOVicNxQ+o8JTbJvjS4M89yew==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "*"
      },
      "funding": {
        "type": "patreon",
        "url": "https://github.com/sponsors/rawify"
      }
    },
    "node_modules/fsevents": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/function-bind": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/function-bind/-/function-bind-1.1.2.tgz",
      "integrity": "sha512-7XHNxH7qX9xG5mIwxkhumTox/MIRNcOgDrxWsMt2pAr23WHp6MrRlN7FBSFpCpr+oVO0F744iUgR82nJMfG2SA==",
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/get-caller-file": {
      "version": "2.0.5",
      "resolved": "https://registry.npmjs.org/get-caller-file/-/get-caller-file-2.0.5.tgz",
      "integrity": "sha512-DyFP3BM/3YHTQOCUL/w0OZHR0lpKeGrxotcHWcqNEdnltqFwXVfhEBQ94eIo34AfQpo0rGki4cyIiftY06h2Fg==",
      "license": "ISC",
      "engines": {
        "node": "6.* || 8.* || >= 10.*"
      }
    },
    "node_modules/get-nonce": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/get-nonce/-/get-nonce-1.0.1.tgz",
      "integrity": "sha512-FJhYRoDaiatfEkUK8HKlicmu/3SGFD51q3itKDGoSTysQJBnfOcxU5GxnhE1E6soB76MbT0MBtnKJuXyAx+96Q==",
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/glob": {
      "version": "10.4.5",
      "resolved": "https://registry.npmjs.org/glob/-/glob-10.4.5.tgz",
      "integrity": "sha512-7Bv8RF0k6xjo7d4A/PxYLbUCfb6c+Vpd2/mB2yRDlew7Jb5hEXiCD9ibfO7wpk8i4sevK6DFny9h7EYbM3/sHg==",
      "license": "ISC",
      "dependencies": {
        "foreground-child": "^3.1.0",
        "jackspeak": "^3.1.2",
        "minimatch": "^9.0.4",
        "minipass": "^7.1.2",
        "package-json-from-dist": "^1.0.0",
        "path-scurry": "^1.11.1"
      },
      "bin": {
        "glob": "dist/esm/bin.mjs"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/glob-parent": {
      "version": "6.0.2",
      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-6.0.2.tgz",
      "integrity": "sha512-XxwI8EOhVQgWp6iDL+3b0r86f4d6AX6zSU55HfB4ydCEuXLXc5FcYeOu+nnGftS4TEju/11rt4KJPTMgbfmv4A==",
      "license": "ISC",
      "dependencies": {
        "is-glob": "^4.0.3"
      },
      "engines": {
        "node": ">=10.13.0"
      }
    },
    "node_modules/glob/node_modules/brace-expansion": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/brace-expansion/-/brace-expansion-2.0.2.tgz",
      "integrity": "sha512-Jt0vHyM+jmUBqojB7E1NIYadt0vI0Qxjxd2TErW94wDz+E2LAm5vKMXXwg6ZZBTHPuUlDgQHKXvjGBdfcF1ZDQ==",
      "license": "MIT",
      "dependencies": {
        "balanced-match": "^1.0.0"
      }
    },
    "node_modules/glob/node_modules/minimatch": {
      "version": "9.0.5",
      "resolved": "https://registry.npmjs.org/minimatch/-/minimatch-9.0.5.tgz",
      "integrity": "sha512-G6T0ZX48xgozx7587koeX9Ys2NYy6Gmv//P89sEte9V9whIapMNF4idKxnW2QtCcLiTWlb/wfCabAtAFWhhBow==",
      "license": "ISC",
      "dependencies": {
        "brace-expansion": "^2.0.1"
      },
      "engines": {
        "node": ">=16 || 14 >=14.17"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/globals": {
      "version": "15.15.0",
      "resolved": "https://registry.npmjs.org/globals/-/globals-15.15.0.tgz",
      "integrity": "sha512-7ACyT3wmyp3I61S4fG682L0VA2RGD9otkqGJIwNUMF1SWUombIIk+af1unuDYgMm082aHYwD+mzJvv9Iu8dsgg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/graphemer": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/graphemer/-/graphemer-1.4.0.tgz",
      "integrity": "sha512-EtKwoO6kxCL9WO5xipiHTZlSzBm7WLT627TqC/uVRd0HKmq8NXyebnNYxDoBi7wt8eTWrUrKXCOVaFq9x1kgag==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/happy-dom": {
      "version": "20.10.3",
      "resolved": "https://registry.npmjs.org/happy-dom/-/happy-dom-20.10.3.tgz",
      "integrity": "sha512-Hjdiy8RziuCcn5z04QI/rlsNuQoG8P0xxjgvsSMpi89cvIXIOcucQtiHS1yHSShxoBcSCeYqAskINmTiy/mlfw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/node": ">=20.0.0",
        "@types/whatwg-mimetype": "^3.0.2",
        "@types/ws": "^8.18.1",
        "buffer-image-size": "^0.6.4",
        "entities": "^7.0.1",
        "whatwg-mimetype": "^3.0.0",
        "ws": "^8.21.0"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/has-flag": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/has-flag/-/has-flag-4.0.0.tgz",
      "integrity": "sha512-EykJT/Q1KjTWctppgIAgfSO0tKVuZUjhgMr17kqTumMl6Afv3EISleU7qZUzoXDFTAHTDC4NOoG/ZxU3EvlMPQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/hasown": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/hasown/-/hasown-2.0.2.tgz",
      "integrity": "sha512-0hJU9SCPvmMzIBdZFqNPXWa6dqh7WdH0cII9y+CyS8rG3nL48Bclra9HmKhVVUHyPWNH5Y7xDwAB7bfgSjkUMQ==",
      "license": "MIT",
      "dependencies": {
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/html-encoding-sniffer": {
      "version": "6.0.0",
      "resolved": "https://registry.npmjs.org/html-encoding-sniffer/-/html-encoding-sniffer-6.0.0.tgz",
      "integrity": "sha512-CV9TW3Y3f8/wT0BRFc1/KAVQ3TUHiXmaAb6VW9vtiMFf7SLoMd1PdAc4W3KFOFETBJUb90KatHqlsZMWV+R9Gg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@exodus/bytes": "^1.6.0"
      },
      "engines": {
        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
      }
    },
    "node_modules/ignore": {
      "version": "5.3.2",
      "resolved": "https://registry.npmjs.org/ignore/-/ignore-5.3.2.tgz",
      "integrity": "sha512-hsBTNUqQTDwkWtcdYI2i06Y/nUBEsNEDJKjWdigLvegy8kDuJAS8uRlpkkcQpyEXL0Z/pjDy5HBmMjRCJ2gq+g==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 4"
      }
    },
    "node_modules/import-fresh": {
      "version": "3.3.1",
      "resolved": "https://registry.npmjs.org/import-fresh/-/import-fresh-3.3.1.tgz",
      "integrity": "sha512-TR3KfrTZTYLPB6jUjfx6MF9WcWrHL9su5TObK4ZkYgBdWKPOFoSoQIdEuTuR82pmtxH2spWG9h6etwfr1pLBqQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "parent-module": "^1.0.0",
        "resolve-from": "^4.0.0"
      },
      "engines": {
        "node": ">=6"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/imurmurhash": {
      "version": "0.1.4",
      "resolved": "https://registry.npmjs.org/imurmurhash/-/imurmurhash-0.1.4.tgz",
      "integrity": "sha512-JmXMZ6wuvDmLiHEml9ykzqO6lwFbof0GG4IkcGaENdCRDDmMVnny7s5HsIgHCbaq0w2MyPhDqkhTUgS2LU2PHA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.8.19"
      }
    },
    "node_modules/indent-string": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/indent-string/-/indent-string-4.0.0.tgz",
      "integrity": "sha512-EdDDZu4A2OyIK7Lr/2zG+w5jmbuk1DVBnEwREQvBzspBJkCEbRa8GxU1lghYcaGJCnRWibjDXlq779X1/y5xwg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/input-otp": {
      "version": "1.4.2",
      "resolved": "https://registry.npmjs.org/input-otp/-/input-otp-1.4.2.tgz",
      "integrity": "sha512-l3jWwYNvrEa6NTCt7BECfCm48GvwuZzkoeG3gBL2w4CHeOXW3eKFmf9UNYkNfYc3mxMrthMnxjIE07MT0zLBQA==",
      "license": "MIT",
      "peerDependencies": {
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0.0 || ^19.0.0-rc"
      }
    },
    "node_modules/internmap": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/internmap/-/internmap-2.0.3.tgz",
      "integrity": "sha512-5Hh7Y1wQbvY5ooGgPbDaL5iYLAPzMTUrjMulskHLH6wnv/A+1q5rgEaiuqEjB+oxGXIVZs1FF+R/KPN3ZSQYYg==",
      "license": "ISC",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/invariant": {
      "version": "2.2.4",
      "resolved": "https://registry.npmjs.org/invariant/-/invariant-2.2.4.tgz",
      "integrity": "sha512-phJfQVBuaJM5raOpJjSfkiD6BpbCE4Ns//LaXl6wGYtUBY83nWS6Rf9tXm2e8VaK60JEjYldbPif/A2B1C2gNA==",
      "license": "MIT",
      "dependencies": {
        "loose-envify": "^1.0.0"
      }
    },
    "node_modules/is-binary-path": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/is-binary-path/-/is-binary-path-2.1.0.tgz",
      "integrity": "sha512-ZMERYes6pDydyuGidse7OsHxtbI7WVeUEozgR/g7rd0xUimYNlvZRE/K2MgZTjWy725IfelLeVcEM97mmtRGXw==",
      "license": "MIT",
      "dependencies": {
        "binary-extensions": "^2.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/is-core-module": {
      "version": "2.15.1",
      "resolved": "https://registry.npmjs.org/is-core-module/-/is-core-module-2.15.1.tgz",
      "integrity": "sha512-z0vtXSwucUJtANQWldhbtbt7BnL0vxiFjIdDLAatwhDYty2bad6s+rijD6Ri4YuYJubLzIJLUidCh09e1djEVQ==",
      "license": "MIT",
      "dependencies": {
        "hasown": "^2.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-extglob": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/is-extglob/-/is-extglob-2.1.1.tgz",
      "integrity": "sha512-SbKbANkN603Vi4jEZv49LeVJMn4yGwsbzZworEoyEiutsN3nJYdbO36zfhGJ6QEDpOZIFkDtnq5JRxmvl3jsoQ==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/is-fullwidth-code-point": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/is-fullwidth-code-point/-/is-fullwidth-code-point-3.0.0.tgz",
      "integrity": "sha512-zymm5+u+sCsSWyD9qNaejV3DFvhCKclKdizYaJUuHA83RLjb7nSuGnddCHGv0hk+KY7BMAlsWeK4Ueg6EV6XQg==",
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/is-glob": {
      "version": "4.0.3",
      "resolved": "https://registry.npmjs.org/is-glob/-/is-glob-4.0.3.tgz",
      "integrity": "sha512-xelSayHH36ZgE7ZWhli7pW34hNbNl8Ojv5KVmkJD4hBdD3th8Tfk9vYasLM+mXWOZhFkgZfxhLSnrwRr4elSSg==",
      "license": "MIT",
      "dependencies": {
        "is-extglob": "^2.1.1"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/is-number": {
      "version": "7.0.0",
      "resolved": "https://registry.npmjs.org/is-number/-/is-number-7.0.0.tgz",
      "integrity": "sha512-41Cifkg6e8TylSpdtTpeLVMqvSBEVzTttHvERD741+pnZ8ANv0004MRL43QKPDlK9cGvNp6NZWZUBlbGXYxxng==",
      "license": "MIT",
      "engines": {
        "node": ">=0.12.0"
      }
    },
    "node_modules/is-potential-custom-element-name": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/is-potential-custom-element-name/-/is-potential-custom-element-name-1.0.1.tgz",
      "integrity": "sha512-bCYeRA2rVibKZd+s2625gGnGF/t7DSqDs4dP7CrLA1m7jKWz6pps0LpYLJN8Q64HtmPKJ1hrN3nzPNKFEKOUiQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/isexe": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/isexe/-/isexe-2.0.0.tgz",
      "integrity": "sha512-RHxMLp9lnKHGHRng9QFhRCMbYAcVpn69smSGcq3f36xjgVVWThj4qqLbTLlq7Ssj8B+fIQ1EuCEGI2lKsyQeIw==",
      "license": "ISC"
    },
    "node_modules/isomorphic.js": {
      "version": "0.2.5",
      "resolved": "https://registry.npmjs.org/isomorphic.js/-/isomorphic.js-0.2.5.tgz",
      "integrity": "sha512-PIeMbHqMt4DnUP3MA/Flc0HElYjMXArsw1qwJZcm9sqR8mq3l8NYizFMty0pWwE/tzIGH3EKK5+jes5mAr85yw==",
      "license": "MIT",
      "funding": {
        "type": "GitHub Sponsors ❤",
        "url": "https://github.com/sponsors/dmonad"
      }
    },
    "node_modules/jackspeak": {
      "version": "3.4.3",
      "resolved": "https://registry.npmjs.org/jackspeak/-/jackspeak-3.4.3.tgz",
      "integrity": "sha512-OGlZQpz2yfahA/Rd1Y8Cd9SIEsqvXkLVoSw/cgwhnhFMDbsQFeZYoJJ7bIZBS9BcamUW96asq/npPWugM+RQBw==",
      "license": "BlueOak-1.0.0",
      "dependencies": {
        "@isaacs/cliui": "^8.0.2"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      },
      "optionalDependencies": {
        "@pkgjs/parseargs": "^0.11.0"
      }
    },
    "node_modules/jiti": {
      "version": "1.21.6",
      "resolved": "https://registry.npmjs.org/jiti/-/jiti-1.21.6.tgz",
      "integrity": "sha512-2yTgeWTWzMWkHu6Jp9NKgePDaYHbntiwvYuuJLbbN9vl7DC9DvXKOB2BC3ZZ92D3cvV/aflH0osDfwpHepQ53w==",
      "license": "MIT",
      "bin": {
        "jiti": "bin/jiti.js"
      }
    },
    "node_modules/js-tokens": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/js-tokens/-/js-tokens-4.0.0.tgz",
      "integrity": "sha512-RdJUflcE3cUzKiMqQgsCu06FPu9UdIJO0beYbPhHN4k6apgJtifcoCtT9bcxOpYBtpD2kCM6Sbzg4CausW/PKQ==",
      "license": "MIT"
    },
    "node_modules/js-yaml": {
      "version": "4.1.0",
      "resolved": "https://registry.npmjs.org/js-yaml/-/js-yaml-4.1.0.tgz",
      "integrity": "sha512-wpxZs9NoxZaJESJGIZTyDEaYpl0FKSA+FB9aJiyemKhMwkxQg63h4T1KJgUGHpTqPDNRcmmYLugrRjJlBtWvRA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "argparse": "^2.0.1"
      },
      "bin": {
        "js-yaml": "bin/js-yaml.js"
      }
    },
    "node_modules/jsdom": {
      "version": "29.1.1",
      "resolved": "https://registry.npmjs.org/jsdom/-/jsdom-29.1.1.tgz",
      "integrity": "sha512-ECi4Fi2f7BdJtUKTflYRTiaMxIB0O6zfR1fX0GXpUrf6flp8QIYn1UT20YQqdSOfk2dfkCwS8LAFoJDEppNK5Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@asamuzakjp/css-color": "^5.1.11",
        "@asamuzakjp/dom-selector": "^7.1.1",
        "@bramus/specificity": "^2.4.2",
        "@csstools/css-syntax-patches-for-csstree": "^1.1.3",
        "@exodus/bytes": "^1.15.0",
        "css-tree": "^3.2.1",
        "data-urls": "^7.0.0",
        "decimal.js": "^10.6.0",
        "html-encoding-sniffer": "^6.0.0",
        "is-potential-custom-element-name": "^1.0.1",
        "lru-cache": "^11.3.5",
        "parse5": "^8.0.1",
        "saxes": "^6.0.0",
        "symbol-tree": "^3.2.4",
        "tough-cookie": "^6.0.1",
        "undici": "^7.25.0",
        "w3c-xmlserializer": "^5.0.0",
        "webidl-conversions": "^8.0.1",
        "whatwg-mimetype": "^5.0.0",
        "whatwg-url": "^16.0.1",
        "xml-name-validator": "^5.0.0"
      },
      "engines": {
        "node": "^20.19.0 || ^22.13.0 || >=24.0.0"
      },
      "peerDependencies": {
        "canvas": "^3.0.0"
      },
      "peerDependenciesMeta": {
        "canvas": {
          "optional": true
        }
      }
    },
    "node_modules/jsdom/node_modules/lru-cache": {
      "version": "11.5.1",
      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-11.5.1.tgz",
      "integrity": "sha512-RPimw/7aMdv2oqRrxKwvZXcPfwBrn/JZ2xYcY9Hus/6LaS3VOAKVWKWgNLCFSiOm1ESXinjsDlidVU7JlnCN2A==",
      "dev": true,
      "license": "BlueOak-1.0.0",
      "engines": {
        "node": "20 || >=22"
      }
    },
    "node_modules/jsdom/node_modules/whatwg-mimetype": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/whatwg-mimetype/-/whatwg-mimetype-5.0.0.tgz",
      "integrity": "sha512-sXcNcHOC51uPGF0P/D4NVtrkjSU2fNsm9iog4ZvZJsL3rjoDAzXZhkm2MWt1y+PUdggKAYVoMAIYcs78wJ51Cw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=20"
      }
    },
    "node_modules/json-buffer": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/json-buffer/-/json-buffer-3.0.1.tgz",
      "integrity": "sha512-4bV5BfR2mqfQTJm+V5tPPdf+ZpuhiIvTuAB5g8kcrXOZpTT/QwwVRWBywX1ozr6lEuPdbHxwaJlm9G6mI2sfSQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/json-schema-traverse": {
      "version": "0.4.1",
      "resolved": "https://registry.npmjs.org/json-schema-traverse/-/json-schema-traverse-0.4.1.tgz",
      "integrity": "sha512-xbbCH5dCYU5T8LcEhhuh7HJ88HXuW3qsI3Y0zOZFKfZEHcpWiHU/Jxzk629Brsab/mMiHQti9wMP+845RPe3Vg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/json-stable-stringify-without-jsonify": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/json-stable-stringify-without-jsonify/-/json-stable-stringify-without-jsonify-1.0.1.tgz",
      "integrity": "sha512-Bdboy+l7tA3OGW6FjyFHWkP5LuByj1Tk33Ljyq0axyzdk9//JSi2u3fP1QSmd1KNwq6VOKYGlAu87CisVir6Pw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/jsqr": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/jsqr/-/jsqr-1.4.0.tgz",
      "integrity": "sha512-dxLob7q65Xg2DvstYkRpkYtmKm2sPJ9oFhrhmudT1dZvNFFTlroai3AWSpLey/w5vMcLBXRgOJsbXpdN9HzU/A==",
      "license": "Apache-2.0"
    },
    "node_modules/keyv": {
      "version": "4.5.4",
      "resolved": "https://registry.npmjs.org/keyv/-/keyv-4.5.4.tgz",
      "integrity": "sha512-oxVHkHR/EJf2CNXnWxRLW6mg7JyCCUcG0DtEGmL2ctUo1PNTin1PUil+r/+4r5MpVgC/fn1kjsx7mjSujKqIpw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "json-buffer": "3.0.1"
      }
    },
    "node_modules/levn": {
      "version": "0.4.1",
      "resolved": "https://registry.npmjs.org/levn/-/levn-0.4.1.tgz",
      "integrity": "sha512-+bT2uH4E5LGE7h/n3evcS/sQlJXCpIp6ym8OWJ5eV6+67Dsql/LaaT7qJBAt2rzfoa/5QBGBhxDix1dMt2kQKQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "prelude-ls": "^1.2.1",
        "type-check": "~0.4.0"
      },
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/lib0": {
      "version": "0.2.117",
      "resolved": "https://registry.npmjs.org/lib0/-/lib0-0.2.117.tgz",
      "integrity": "sha512-DeXj9X5xDCjgKLU/7RR+/HQEVzuuEUiwldwOGsHK/sfAfELGWEyTcf0x+uOvCvK3O2zPmZePXWL85vtia6GyZw==",
      "license": "MIT",
      "dependencies": {
        "isomorphic.js": "^0.2.4"
      },
      "bin": {
        "0ecdsa-generate-keypair": "bin/0ecdsa-generate-keypair.js",
        "0gentesthtml": "bin/gentesthtml.js",
        "0serve": "bin/0serve.js"
      },
      "engines": {
        "node": ">=16"
      },
      "funding": {
        "type": "GitHub Sponsors ❤",
        "url": "https://github.com/sponsors/dmonad"
      }
    },
    "node_modules/lightningcss": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss/-/lightningcss-1.32.0.tgz",
      "integrity": "sha512-NXYBzinNrblfraPGyrbPoD19C1h9lfI/1mzgWYvXUTe414Gz/X1FD2XBZSZM7rRTrMA8JL3OtAaGifrIKhQ5yQ==",
      "dev": true,
      "license": "MPL-2.0",
      "dependencies": {
        "detect-libc": "^2.0.3"
      },
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      },
      "optionalDependencies": {
        "lightningcss-android-arm64": "1.32.0",
        "lightningcss-darwin-arm64": "1.32.0",
        "lightningcss-darwin-x64": "1.32.0",
        "lightningcss-freebsd-x64": "1.32.0",
        "lightningcss-linux-arm-gnueabihf": "1.32.0",
        "lightningcss-linux-arm64-gnu": "1.32.0",
        "lightningcss-linux-arm64-musl": "1.32.0",
        "lightningcss-linux-x64-gnu": "1.32.0",
        "lightningcss-linux-x64-musl": "1.32.0",
        "lightningcss-win32-arm64-msvc": "1.32.0",
        "lightningcss-win32-x64-msvc": "1.32.0"
      }
    },
    "node_modules/lightningcss-android-arm64": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-android-arm64/-/lightningcss-android-arm64-1.32.0.tgz",
      "integrity": "sha512-YK7/ClTt4kAK0vo6w3X+Pnm0D2cf2vPHbhOXdoNti1Ga0al1P4TBZhwjATvjNwLEBCnKvjJc2jQgHXH0NEwlAg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-darwin-arm64": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-darwin-arm64/-/lightningcss-darwin-arm64-1.32.0.tgz",
      "integrity": "sha512-RzeG9Ju5bag2Bv1/lwlVJvBE3q6TtXskdZLLCyfg5pt+HLz9BqlICO7LZM7VHNTTn/5PRhHFBSjk5lc4cmscPQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-darwin-x64": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-darwin-x64/-/lightningcss-darwin-x64-1.32.0.tgz",
      "integrity": "sha512-U+QsBp2m/s2wqpUYT/6wnlagdZbtZdndSmut/NJqlCcMLTWp5muCrID+K5UJ6jqD2BFshejCYXniPDbNh73V8w==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-freebsd-x64": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-freebsd-x64/-/lightningcss-freebsd-x64-1.32.0.tgz",
      "integrity": "sha512-JCTigedEksZk3tHTTthnMdVfGf61Fky8Ji2E4YjUTEQX14xiy/lTzXnu1vwiZe3bYe0q+SpsSH/CTeDXK6WHig==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm-gnueabihf": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm-gnueabihf/-/lightningcss-linux-arm-gnueabihf-1.32.0.tgz",
      "integrity": "sha512-x6rnnpRa2GL0zQOkt6rts3YDPzduLpWvwAF6EMhXFVZXD4tPrBkEFqzGowzCsIWsPjqSK+tyNEODUBXeeVHSkw==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm64-gnu": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-gnu/-/lightningcss-linux-arm64-gnu-1.32.0.tgz",
      "integrity": "sha512-0nnMyoyOLRJXfbMOilaSRcLH3Jw5z9HDNGfT/gwCPgaDjnx0i8w7vBzFLFR1f6CMLKF8gVbebmkUN3fa/kQJpQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm64-musl": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-musl/-/lightningcss-linux-arm64-musl-1.32.0.tgz",
      "integrity": "sha512-UpQkoenr4UJEzgVIYpI80lDFvRmPVg6oqboNHfoH4CQIfNA+HOrZ7Mo7KZP02dC6LjghPQJeBsvXhJod/wnIBg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-x64-gnu": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-gnu/-/lightningcss-linux-x64-gnu-1.32.0.tgz",
      "integrity": "sha512-V7Qr52IhZmdKPVr+Vtw8o+WLsQJYCTd8loIfpDaMRWGUZfBOYEJeyJIkqGIDMZPwPx24pUMfwSxxI8phr/MbOA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-x64-musl": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-musl/-/lightningcss-linux-x64-musl-1.32.0.tgz",
      "integrity": "sha512-bYcLp+Vb0awsiXg/80uCRezCYHNg1/l3mt0gzHnWV9XP1W5sKa5/TCdGWaR/zBM2PeF/HbsQv/j2URNOiVuxWg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-win32-arm64-msvc": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-arm64-msvc/-/lightningcss-win32-arm64-msvc-1.32.0.tgz",
      "integrity": "sha512-8SbC8BR40pS6baCM8sbtYDSwEVQd4JlFTOlaD3gWGHfThTcABnNDBda6eTZeqbofalIJhFx0qKzgHJmcPTnGdw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-win32-x64-msvc": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-x64-msvc/-/lightningcss-win32-x64-msvc-1.32.0.tgz",
      "integrity": "sha512-Amq9B/SoZYdDi1kFrojnoqPLxYhQ4Wo5XiL8EVJrVsB8ARoC1PWW6VGtT0WKCemjy8aC+louJnjS7U18x3b06Q==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lilconfig": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/lilconfig/-/lilconfig-3.1.3.tgz",
      "integrity": "sha512-/vlFKAoH5Cgt3Ie+JLhRbwOsCQePABiU3tJ1egGvyQ+33R/vcwM2Zl2QR/LzjsBeItPt3oSVXapn+m4nQDvpzw==",
      "license": "MIT",
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "url": "https://github.com/sponsors/antonk52"
      }
    },
    "node_modules/lines-and-columns": {
      "version": "1.2.4",
      "resolved": "https://registry.npmjs.org/lines-and-columns/-/lines-and-columns-1.2.4.tgz",
      "integrity": "sha512-7ylylesZQ/PV29jhEDl3Ufjo6ZX7gCqJr5F7PKrqc93v7fzSymt1BpwEU8nAUXs8qzzvqhbjhK5QZg6Mt/HkBg==",
      "license": "MIT"
    },
    "node_modules/locate-path": {
      "version": "6.0.0",
      "resolved": "https://registry.npmjs.org/locate-path/-/locate-path-6.0.0.tgz",
      "integrity": "sha512-iPZK6eYjbxRu3uB4/WZ3EsEIMJFMqAoopl3R+zuq0UjcAm/MO6KCweDgPfP3elTztoKP3KtnVHxTn2NHBSDVUw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "p-locate": "^5.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/lodash": {
      "version": "4.17.21",
      "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz",
      "integrity": "sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZVGedAJv8XZ1tvj5FvSg==",
      "license": "MIT"
    },
    "node_modules/lodash.castarray": {
      "version": "4.4.0",
      "resolved": "https://registry.npmjs.org/lodash.castarray/-/lodash.castarray-4.4.0.tgz",
      "integrity": "sha512-aVx8ztPv7/2ULbArGJ2Y42bG1mEQ5mGjpdvrbJcJFU3TbYybe+QlLS4pst9zV52ymy2in1KpFPiZnAOATxD4+Q==",
      "dev": true
    },
    "node_modules/lodash.isplainobject": {
      "version": "4.0.6",
      "resolved": "https://registry.npmjs.org/lodash.isplainobject/-/lodash.isplainobject-4.0.6.tgz",
      "integrity": "sha512-oSXzaWypCMHkPC3NvBEaPHf0KsA5mvPrOPgQWDsbg8n7orZ290M0BmC/jgRZ4vcJ6DTAhjrsSYgdsW/F+MFOBA==",
      "dev": true
    },
    "node_modules/lodash.merge": {
      "version": "4.6.2",
      "resolved": "https://registry.npmjs.org/lodash.merge/-/lodash.merge-4.6.2.tgz",
      "integrity": "sha512-0KpjqXRVvrYyCsX1swR/XTK0va6VQkQM6MNo7PqW77ByjAhoARA8EfrP1N4+KlKj8YS0ZUCtRT/YUuhyYDujIQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/loose-envify": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/loose-envify/-/loose-envify-1.4.0.tgz",
      "integrity": "sha512-lyuxPGr/Wfhrlem2CL/UcnUc1zcqKAImBDzukY7Y5F/yQiNdko6+fRLevlw1HgMySw7f611UIY408EtxRSoK3Q==",
      "license": "MIT",
      "dependencies": {
        "js-tokens": "^3.0.0 || ^4.0.0"
      },
      "bin": {
        "loose-envify": "cli.js"
      }
    },
    "node_modules/lru-cache": {
      "version": "10.4.3",
      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-10.4.3.tgz",
      "integrity": "sha512-JNAzZcXrCt42VGLuYz0zfAzDfAvJWW6AfYlDBQyDV5DClI2m5sAmK+OIO7s59XfsRsWHp02jAJrRadPRGTt6SQ==",
      "license": "ISC"
    },
    "node_modules/lucide-react": {
      "version": "0.462.0",
      "resolved": "https://registry.npmjs.org/lucide-react/-/lucide-react-0.462.0.tgz",
      "integrity": "sha512-NTL7EbAao9IFtuSivSZgrAh4fZd09Lr+6MTkqIxuHaH2nnYiYIzXPo06cOxHg9wKLdj6LL8TByG4qpePqwgx/g==",
      "peerDependencies": {
        "react": "^16.5.1 || ^17.0.0 || ^18.0.0 || ^19.0.0-rc"
      }
    },
    "node_modules/lz-string": {
      "version": "1.5.0",
      "resolved": "https://registry.npmjs.org/lz-string/-/lz-string-1.5.0.tgz",
      "integrity": "sha512-h5bgJWpxJNswbU7qCrV0tIKQCaS3blPDrqKWx+QxzuzL1zGUzij9XCWLrSLsJPu5t+eWA/ycetzYAO5IOMcWAQ==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "bin": {
        "lz-string": "bin/bin.js"
      }
    },
    "node_modules/magic-string": {
      "version": "0.30.21",
      "resolved": "https://registry.npmjs.org/magic-string/-/magic-string-0.30.21.tgz",
      "integrity": "sha512-vd2F4YUyEXKGcLHoq+TEyCjxueSeHnFxyyjNp80yg0XV4vUhnDer/lvvlqM/arB5bXQN5K2/3oinyCRyx8T2CQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.5.5"
      }
    },
    "node_modules/mdn-data": {
      "version": "2.27.1",
      "resolved": "https://registry.npmjs.org/mdn-data/-/mdn-data-2.27.1.tgz",
      "integrity": "sha512-9Yubnt3e8A0OKwxYSXyhLymGW4sCufcLG6VdiDdUGVkPhpqLxlvP5vl1983gQjJl3tqbrM731mjaZaP68AgosQ==",
      "dev": true,
      "license": "CC0-1.0"
    },
    "node_modules/merge2": {
      "version": "1.4.1",
      "resolved": "https://registry.npmjs.org/merge2/-/merge2-1.4.1.tgz",
      "integrity": "sha512-8q7VEgMJW4J8tcfVPy8g09NcQwZdbwFEqhe/WZkoIzjn/3TGDwtOCYtXGxA3O8tPzpczCCDgv+P2P5y00ZJOOg==",
      "license": "MIT",
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/micromatch": {
      "version": "4.0.8",
      "resolved": "https://registry.npmjs.org/micromatch/-/micromatch-4.0.8.tgz",
      "integrity": "sha512-PXwfBhYu0hBCPw8Dn0E+WDYb7af3dSLVWKi3HGv84IdF4TyFoC0ysxFd0Goxw7nSv4T/PzEJQxsYsEiFCKo2BA==",
      "license": "MIT",
      "dependencies": {
        "braces": "^3.0.3",
        "picomatch": "^2.3.1"
      },
      "engines": {
        "node": ">=8.6"
      }
    },
    "node_modules/min-indent": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/min-indent/-/min-indent-1.0.1.tgz",
      "integrity": "sha512-I9jwMn07Sy/IwOj3zVkVik2JTvgpaykDZEigL6Rx6N9LbMywwUSMtxET+7lVoDLLd3O3IXwJwvuuns8UB/HeAg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/minimatch": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/minimatch/-/minimatch-3.1.2.tgz",
      "integrity": "sha512-J7p63hRiAjw1NDEww1W7i37+ByIrOWO5XQQAzZ3VOcL0PNybwpfmV/N05zFAzwQ9USyEcX6t3UO+K5aqBQOIHw==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "brace-expansion": "^1.1.7"
      },
      "engines": {
        "node": "*"
      }
    },
    "node_modules/minipass": {
      "version": "7.1.2",
      "resolved": "https://registry.npmjs.org/minipass/-/minipass-7.1.2.tgz",
      "integrity": "sha512-qOOzS1cBTWYF4BH8fVePDBOO9iptMnGUEZwNc/cMWnTV2nVLZ7VoNWEPHkYczZA0pdoA7dl6e7FL659nX9S2aw==",
      "license": "ISC",
      "engines": {
        "node": ">=16 || 14 >=14.17"
      }
    },
    "node_modules/mrmime": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/mrmime/-/mrmime-2.0.1.tgz",
      "integrity": "sha512-Y3wQdFg2Va6etvQ5I82yUhGdsKrcYox6p7FfL1LbK2J4V01F9TGlepTIhnK24t7koZibmg82KGglhA1XK5IsLQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/ms": {
      "version": "2.1.3",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",
      "integrity": "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/mz": {
      "version": "2.7.0",
      "resolved": "https://registry.npmjs.org/mz/-/mz-2.7.0.tgz",
      "integrity": "sha512-z81GNO7nnYMEhrGh9LeymoE4+Yr0Wn5McHIZMK5cfQCl+NDX08sCZgUc9/6MHni9IWuFLm1Z3HTCXu2z9fN62Q==",
      "license": "MIT",
      "dependencies": {
        "any-promise": "^1.0.0",
        "object-assign": "^4.0.1",
        "thenify-all": "^1.0.0"
      }
    },
    "node_modules/nanoid": {
      "version": "3.3.12",
      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.12.tgz",
      "integrity": "sha512-ZB9RH/39qpq5Vu6Y+NmUaFhQR6pp+M2Xt76XBnEwDaGcVAqhlvxrl3B2bKS5D3NH3QR76v3aSrKaF/Kiy7lEtQ==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "bin": {
        "nanoid": "bin/nanoid.cjs"
      },
      "engines": {
        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
      }
    },
    "node_modules/natural-compare": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/natural-compare/-/natural-compare-1.4.0.tgz",
      "integrity": "sha512-OWND8ei3VtNC9h7V60qff3SVobHr996CTwgxubgyQYEpg290h9J0buyECNNJexkFm5sOajh5G116RYA1c8ZMSw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/next-themes": {
      "version": "0.3.0",
      "resolved": "https://registry.npmjs.org/next-themes/-/next-themes-0.3.0.tgz",
      "integrity": "sha512-/QHIrsYpd6Kfk7xakK4svpDI5mmXP0gfvCoJdGpZQ2TOrQZmsW0QxjaiLn8wbIKjtm4BTSqLoix4lxYYOnLJ/w==",
      "license": "MIT",
      "peerDependencies": {
        "react": "^16.8 || ^17 || ^18",
        "react-dom": "^16.8 || ^17 || ^18"
      }
    },
    "node_modules/node-releases": {
      "version": "2.0.19",
      "resolved": "https://registry.npmjs.org/node-releases/-/node-releases-2.0.19.tgz",
      "integrity": "sha512-xxOWJsBKtzAq7DY0J+DTzuz58K8e7sJbdgwkbMWQe8UYB6ekmsQ45q0M/tJDsGaZmbC+l7n57UV8Hl5tHxO9uw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/normalize-path": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/normalize-path/-/normalize-path-3.0.0.tgz",
      "integrity": "sha512-6eZs5Ls3WtCisHWp9S2GUy8dqkpGi4BVSz3GaqiE6ezub0512ESztXUwUB6C6IKbQkY2Pnb/mD4WYojCRwcwLA==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/normalize-range": {
      "version": "0.1.2",
      "resolved": "https://registry.npmjs.org/normalize-range/-/normalize-range-0.1.2.tgz",
      "integrity": "sha512-bdok/XvKII3nUpklnV6P2hxtMNrCboOjAcyBuQnWEhO665FwrSNRxU+AqpsyvO6LgGYPspN+lu5CLtw4jPRKNA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/object-assign": {
      "version": "4.1.1",
      "resolved": "https://registry.npmjs.org/object-assign/-/object-assign-4.1.1.tgz",
      "integrity": "sha512-rJgTQnkUnH1sFw8yT6VSU3zD3sWmu6sZhIseY8VX+GRu3P6F7Fu+JNDoXfklElbLJSnc3FUQHVe4cU5hj+BcUg==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/object-hash": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/object-hash/-/object-hash-3.0.0.tgz",
      "integrity": "sha512-RSn9F68PjH9HqtltsSnqYC1XXoWe9Bju5+213R98cNGttag9q9yAOTzdbsqvIa7aNm5WffBZFpWYr2aWrklWAw==",
      "license": "MIT",
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/obug": {
      "version": "2.1.3",
      "resolved": "https://registry.npmjs.org/obug/-/obug-2.1.3.tgz",
      "integrity": "sha512-9miFgM2OFba7hB+pRgvtV84pYTBaoTHohvmIgiRt6dRIzbwEOIaNaP+dIlGs2fNFoB0SeISs0Jz5WFVRid6Xyg==",
      "dev": true,
      "funding": [
        "https://github.com/sponsors/sxzz",
        "https://opencollective.com/debug"
      ],
      "license": "MIT",
      "engines": {
        "node": ">=12.20.0"
      }
    },
    "node_modules/optionator": {
      "version": "0.9.4",
      "resolved": "https://registry.npmjs.org/optionator/-/optionator-0.9.4.tgz",
      "integrity": "sha512-6IpQ7mKUxRcZNLIObR0hz7lxsapSSIYNZJwXPGeF0mTVqGKFIXj1DQcMoT22S3ROcLyY/rz0PWaWZ9ayWmad9g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "deep-is": "^0.1.3",
        "fast-levenshtein": "^2.0.6",
        "levn": "^0.4.1",
        "prelude-ls": "^1.2.1",
        "type-check": "^0.4.0",
        "word-wrap": "^1.2.5"
      },
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/p-limit": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/p-limit/-/p-limit-3.1.0.tgz",
      "integrity": "sha512-TYOanM3wGwNGsZN2cVTYPArw454xnXj5qmWF1bEoAc4+cU/ol7GVh7odevjp1FNHduHc3KZMcFduxU5Xc6uJRQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "yocto-queue": "^0.1.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/p-locate": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/p-locate/-/p-locate-5.0.0.tgz",
      "integrity": "sha512-LaNjtRWUBY++zB5nE/NwcaoMylSPk+S+ZHNB1TzdbMJMny6dynpAGt7X/tl/QYq3TIeE6nxHppbo2LGymrG5Pw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "p-limit": "^3.0.2"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/p-try": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/p-try/-/p-try-2.2.0.tgz",
      "integrity": "sha512-R4nPAVTAU0B9D35/Gk3uJf/7XYbQcyohSKdvAxIRSNghFl4e71hVoGnBNQz9cWaXxO2I10KTC+3jMdvvoKw6dQ==",
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/package-json-from-dist": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/package-json-from-dist/-/package-json-from-dist-1.0.1.tgz",
      "integrity": "sha512-UEZIS3/by4OC8vL3P2dTXRETpebLI2NiI5vIrjaD/5UtrkFX/tNbwjTSRAGC/+7CAo2pIcBaRgWmcBBHcsaCIw==",
      "license": "BlueOak-1.0.0"
    },
    "node_modules/parent-module": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/parent-module/-/parent-module-1.0.1.tgz",
      "integrity": "sha512-GQ2EWRpQV8/o+Aw8YqtfZZPfNRWZYkbidE9k5rpl/hC3vtHHBfGm2Ifi6qWV+coDGkrUKZAxE3Lot5kcsRlh+g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "callsites": "^3.0.0"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/parse5": {
      "version": "8.0.1",
      "resolved": "https://registry.npmjs.org/parse5/-/parse5-8.0.1.tgz",
      "integrity": "sha512-z1e/HMG90obSGeidlli3hj7cbocou0/wa5HacvI3ASx34PecNjNQeaHNo5WIZpWofN9kgkqV1q5YvXe3F0FoPw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "entities": "^8.0.0"
      },
      "funding": {
        "url": "https://github.com/inikulin/parse5?sponsor=1"
      }
    },
    "node_modules/parse5/node_modules/entities": {
      "version": "8.0.0",
      "resolved": "https://registry.npmjs.org/entities/-/entities-8.0.0.tgz",
      "integrity": "sha512-zwfzJecQ/Uej6tusMqwAqU/6KL2XaB2VZ2Jg54Je6ahNBGNH6Ek6g3jjNCF0fG9EWQKGZNddNjU5F1ZQn/sBnA==",
      "dev": true,
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=20.19.0"
      },
      "funding": {
        "url": "https://github.com/fb55/entities?sponsor=1"
      }
    },
    "node_modules/path-exists": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/path-exists/-/path-exists-4.0.0.tgz",
      "integrity": "sha512-ak9Qy5Q7jYb2Wwcey5Fpvg2KoAc/ZIhLSLOSBmRmygPsGwkVVt0fZa0qrtMz+m6tJTAHfZQ8FnmB4MG4LWy7/w==",
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/path-key": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/path-key/-/path-key-3.1.1.tgz",
      "integrity": "sha512-ojmeN0qd+y0jszEtoY48r0Peq5dwMEkIlCOu6Q5f41lfkswXuKtYrhgoTpLnyIcHm24Uhqx+5Tqm2InSwLhE6Q==",
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/path-parse": {
      "version": "1.0.7",
      "resolved": "https://registry.npmjs.org/path-parse/-/path-parse-1.0.7.tgz",
      "integrity": "sha512-LDJzPVEEEPR+y48z93A0Ed0yXb8pAByGWo/k5YYdYgpY2/2EsOsksJrq7lOHxryrVOn1ejG6oAp8ahvOIQD8sw==",
      "license": "MIT"
    },
    "node_modules/path-scurry": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/path-scurry/-/path-scurry-1.11.1.tgz",
      "integrity": "sha512-Xa4Nw17FS9ApQFJ9umLiJS4orGjm7ZzwUrwamcGQuHSzDyth9boKDaycYdDcZDuqYATXw4HFXgaqWTctW/v1HA==",
      "license": "BlueOak-1.0.0",
      "dependencies": {
        "lru-cache": "^10.2.0",
        "minipass": "^5.0.0 || ^6.0.2 || ^7.0.0"
      },
      "engines": {
        "node": ">=16 || 14 >=14.18"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/pathe": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/pathe/-/pathe-2.0.3.tgz",
      "integrity": "sha512-WUjGcAqP1gQacoQe+OBJsFA7Ld4DyXuUIjZ5cc75cLHvJ7dtNsTugphxIADwspS+AraAUePCKrSVtPLFj/F88w==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/peerjs": {
      "version": "1.5.5",
      "resolved": "https://registry.npmjs.org/peerjs/-/peerjs-1.5.5.tgz",
      "integrity": "sha512-viMUCPDL6CSfOu0ZqVcFqbWRXNHIbv2lPqNbrBIjbFYrflebOjItJ4hPfhjnuUCstqciHVu9vVJ7jFqqKi/EuQ==",
      "license": "MIT",
      "dependencies": {
        "@msgpack/msgpack": "^2.8.0",
        "eventemitter3": "^4.0.7",
        "peerjs-js-binarypack": "^2.1.0",
        "webrtc-adapter": "^9.0.0"
      },
      "engines": {
        "node": ">= 14"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/peer"
      }
    },
    "node_modules/peerjs-js-binarypack": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/peerjs-js-binarypack/-/peerjs-js-binarypack-2.1.0.tgz",
      "integrity": "sha512-YIwCC+pTzp3Bi8jPI9UFKO0t0SLo6xALnHkiNt/iUFmUUZG0fEEmEyFKvjsDKweiFitzHRyhuh6NvyJZ4nNxMg==",
      "license": "MIT",
      "engines": {
        "node": ">= 14.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/peer"
      }
    },
    "node_modules/picocolors": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
      "license": "ISC"
    },
    "node_modules/picomatch": {
      "version": "2.3.1",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-2.3.1.tgz",
      "integrity": "sha512-JU3teHTNjmE2VCGFzuY8EXzCDVwEqB2a8fsIvwaStHhAWJEeVd1o1QD80CU6+ZdEXXSLbSsuLwJjkCBWqRQUVA==",
      "license": "MIT",
      "engines": {
        "node": ">=8.6"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/pify": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/pify/-/pify-2.3.0.tgz",
      "integrity": "sha512-udgsAY+fTnvv7kI7aaxbqwWNb0AHiB0qBO89PZKPkoTmGOgdbrHDKD+0B2X4uTfJ/FT1R09r9gTsjUjNJotuog==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/pirates": {
      "version": "4.0.6",
      "resolved": "https://registry.npmjs.org/pirates/-/pirates-4.0.6.tgz",
      "integrity": "sha512-saLsH7WeYYPiD25LDuLRRY/i+6HaPYr6G1OUlN39otzkSTxKnubR9RTxS3/Kk50s1g2JTgFwWQDQyplC5/SHZg==",
      "license": "MIT",
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/playwright": {
      "version": "1.61.0",
      "resolved": "https://registry.npmjs.org/playwright/-/playwright-1.61.0.tgz",
      "integrity": "sha512-Z+7BeeqQPRRzklHsVFP4KTGIyMxKUmfeRA4WisM6G3/XW6nwGeX6fX9qYaDa+CiUqpOkb2f6X3nar05R3kSuJQ==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "playwright-core": "1.61.0"
      },
      "bin": {
        "playwright": "cli.js"
      },
      "engines": {
        "node": ">=18"
      },
      "optionalDependencies": {
        "fsevents": "2.3.2"
      }
    },
    "node_modules/playwright-core": {
      "version": "1.61.0",
      "resolved": "https://registry.npmjs.org/playwright-core/-/playwright-core-1.61.0.tgz",
      "integrity": "sha512-caX7TrY3Ml6egyDX0WUcTHDxodl/b51y5wJOdCEA36QviK/s2g081hvmGs8eaE3DWb6NYZQ6BjO/QkNRPenoPA==",
      "dev": true,
      "license": "Apache-2.0",
      "bin": {
        "playwright-core": "cli.js"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/playwright/node_modules/fsevents": {
      "version": "2.3.2",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.2.tgz",
      "integrity": "sha512-xiqMQR4xAeHTuB9uWm+fFRcIOgKBMiOBP+eXiyT7jsgVCq1bkVygt00oASowB7EdtpOHaaPgKt812P9ab+DDKA==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/pngjs": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/pngjs/-/pngjs-5.0.0.tgz",
      "integrity": "sha512-40QW5YalBNfQo5yRYmiw7Yz6TKKVr3h6970B2YE+3fQpsWcrbj1PzJgxeJ19DRQjhMbKPIuMY8rFaXc8moolVw==",
      "license": "MIT",
      "engines": {
        "node": ">=10.13.0"
      }
    },
    "node_modules/postcss": {
      "version": "8.5.15",
      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.15.tgz",
      "integrity": "sha512-FfR8sjd4em2T6fb3I2MwAJU7HWVMr9zba+enmQeeWFfCbm+UOC/0X4DS8XtpUTMwWMGbjKYP7xjfNekzyGmB3A==",
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/postcss"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "nanoid": "^3.3.12",
        "picocolors": "^1.1.1",
        "source-map-js": "^1.2.1"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      }
    },
    "node_modules/postcss-import": {
      "version": "15.1.0",
      "resolved": "https://registry.npmjs.org/postcss-import/-/postcss-import-15.1.0.tgz",
      "integrity": "sha512-hpr+J05B2FVYUAXHeK1YyI267J/dDDhMU6B6civm8hSY1jYJnBXxzKDKDswzJmtLHryrjhnDjqqp/49t8FALew==",
      "license": "MIT",
      "dependencies": {
        "postcss-value-parser": "^4.0.0",
        "read-cache": "^1.0.0",
        "resolve": "^1.1.7"
      },
      "engines": {
        "node": ">=14.0.0"
      },
      "peerDependencies": {
        "postcss": "^8.0.0"
      }
    },
    "node_modules/postcss-js": {
      "version": "4.0.1",
      "resolved": "https://registry.npmjs.org/postcss-js/-/postcss-js-4.0.1.tgz",
      "integrity": "sha512-dDLF8pEO191hJMtlHFPRa8xsizHaM82MLfNkUHdUtVEV3tgTp5oj+8qbEqYM57SLfc74KSbw//4SeJma2LRVIw==",
      "license": "MIT",
      "dependencies": {
        "camelcase-css": "^2.0.1"
      },
      "engines": {
        "node": "^12 || ^14 || >= 16"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/postcss/"
      },
      "peerDependencies": {
        "postcss": "^8.4.21"
      }
    },
    "node_modules/postcss-load-config": {
      "version": "4.0.2",
      "resolved": "https://registry.npmjs.org/postcss-load-config/-/postcss-load-config-4.0.2.tgz",
      "integrity": "sha512-bSVhyJGL00wMVoPUzAVAnbEoWyqRxkjv64tUl427SKnPrENtq6hJwUojroMz2VB+Q1edmi4IfrAPpami5VVgMQ==",
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "lilconfig": "^3.0.0",
        "yaml": "^2.3.4"
      },
      "engines": {
        "node": ">= 14"
      },
      "peerDependencies": {
        "postcss": ">=8.0.9",
        "ts-node": ">=9.0.0"
      },
      "peerDependenciesMeta": {
        "postcss": {
          "optional": true
        },
        "ts-node": {
          "optional": true
        }
      }
    },
    "node_modules/postcss-nested": {
      "version": "6.2.0",
      "resolved": "https://registry.npmjs.org/postcss-nested/-/postcss-nested-6.2.0.tgz",
      "integrity": "sha512-HQbt28KulC5AJzG+cZtj9kvKB93CFCdLvog1WFLf1D+xmMvPGlBstkpTEZfK5+AN9hfJocyBFCNiqyS48bpgzQ==",
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "postcss-selector-parser": "^6.1.1"
      },
      "engines": {
        "node": ">=12.0"
      },
      "peerDependencies": {
        "postcss": "^8.2.14"
      }
    },
    "node_modules/postcss-selector-parser": {
      "version": "6.1.2",
      "resolved": "https://registry.npmjs.org/postcss-selector-parser/-/postcss-selector-parser-6.1.2.tgz",
      "integrity": "sha512-Q8qQfPiZ+THO/3ZrOrO0cJJKfpYCagtMUkXbnEfmgUjwXg6z/WBeOyS9APBBPCTSiDV+s4SwQGu8yFsiMRIudg==",
      "license": "MIT",
      "dependencies": {
        "cssesc": "^3.0.0",
        "util-deprecate": "^1.0.2"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/postcss-value-parser": {
      "version": "4.2.0",
      "resolved": "https://registry.npmjs.org/postcss-value-parser/-/postcss-value-parser-4.2.0.tgz",
      "integrity": "sha512-1NNCs6uurfkVbeXG4S8JFT9t19m45ICnif8zWLd5oPSZ50QnwMfK+H3jv408d4jw/7Bttv5axS5IiHoLaVNHeQ==",
      "license": "MIT"
    },
    "node_modules/prelude-ls": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/prelude-ls/-/prelude-ls-1.2.1.tgz",
      "integrity": "sha512-vkcDPrRZo1QZLbn5RLGPpg/WmIQ65qoWWhcGKf/b5eplkkarX0m9z8ppCat4mlOqUsWpyNuYgO3VRyrYHSzX5g==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/pretty-format": {
      "version": "27.5.1",
      "resolved": "https://registry.npmjs.org/pretty-format/-/pretty-format-27.5.1.tgz",
      "integrity": "sha512-Qb1gy5OrP5+zDf2Bvnzdl3jsTf1qXVMazbvCoKhtKqVs4/YK4ozX4gKQJJVyNe+cajNPn0KoC0MC3FUmaHWEmQ==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "ansi-regex": "^5.0.1",
        "ansi-styles": "^5.0.0",
        "react-is": "^17.0.1"
      },
      "engines": {
        "node": "^10.13.0 || ^12.13.0 || ^14.15.0 || >=15.0.0"
      }
    },
    "node_modules/pretty-format/node_modules/ansi-regex": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-5.0.1.tgz",
      "integrity": "sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/pretty-format/node_modules/ansi-styles": {
      "version": "5.2.0",
      "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-5.2.0.tgz",
      "integrity": "sha512-Cxwpt2SfTzTtXcfOlzGEee8O+c+MmUgGrNiBcXnuWxuFJHe6a5Hz7qwhwe5OgaSYI0IJvkLqWX1ASG+cJOkEiA==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/chalk/ansi-styles?sponsor=1"
      }
    },
    "node_modules/pretty-format/node_modules/react-is": {
      "version": "17.0.2",
      "resolved": "https://registry.npmjs.org/react-is/-/react-is-17.0.2.tgz",
      "integrity": "sha512-w2GsyukL62IJnlaff/nRegPQR94C/XXamvMWmSHRJ4y7Ts/4ocGRmTHvOs8PSE6pB3dWOrD/nueuU5sduBsQ4w==",
      "dev": true,
      "license": "MIT",
      "peer": true
    },
    "node_modules/prop-types": {
      "version": "15.8.1",
      "resolved": "https://registry.npmjs.org/prop-types/-/prop-types-15.8.1.tgz",
      "integrity": "sha512-oj87CgZICdulUohogVAR7AjlC0327U4el4L6eAvOqCeudMDVU0NThNaV+b9Df4dXgSP1gXMTnPdhfe/2qDH5cg==",
      "license": "MIT",
      "dependencies": {
        "loose-envify": "^1.4.0",
        "object-assign": "^4.1.1",
        "react-is": "^16.13.1"
      }
    },
    "node_modules/prop-types/node_modules/react-is": {
      "version": "16.13.1",
      "resolved": "https://registry.npmjs.org/react-is/-/react-is-16.13.1.tgz",
      "integrity": "sha512-24e6ynE2H+OKt4kqsOvNd8kBpV65zoxbA4BVsEOB3ARVWQki/DHzaUoC5KuON/BiccDaCCTZBuOcfZs70kR8bQ==",
      "license": "MIT"
    },
    "node_modules/punycode": {
      "version": "2.3.1",
      "resolved": "https://registry.npmjs.org/punycode/-/punycode-2.3.1.tgz",
      "integrity": "sha512-vYt7UD1U9Wg6138shLtLOvdAu+8DsC/ilFtEVHcH+wydcSpNE20AfSOduf6MkRFahL5FY7X1oU7nKVZFtfq8Fg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/qrcode": {
      "version": "1.5.4",
      "resolved": "https://registry.npmjs.org/qrcode/-/qrcode-1.5.4.tgz",
      "integrity": "sha512-1ca71Zgiu6ORjHqFBDpnSMTR2ReToX4l1Au1VFLyVeBTFavzQnv5JxMFr3ukHVKpSrSA2MCk0lNJSykjUfz7Zg==",
      "license": "MIT",
      "dependencies": {
        "dijkstrajs": "^1.0.1",
        "pngjs": "^5.0.0",
        "yargs": "^15.3.1"
      },
      "bin": {
        "qrcode": "bin/qrcode"
      },
      "engines": {
        "node": ">=10.13.0"
      }
    },
    "node_modules/queue-microtask": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/queue-microtask/-/queue-microtask-1.2.3.tgz",
      "integrity": "sha512-NuaNSa6flKT5JaSYQzJok04JzTL1CA6aGhv5rfLW3PgqA+M2ChpZQnAC8h8i4ZFkBS8X5RqkDBHA7r4hej3K9A==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "MIT"
    },
    "node_modules/react": {
      "version": "18.3.1",
      "resolved": "https://registry.npmjs.org/react/-/react-18.3.1.tgz",
      "integrity": "sha512-wS+hAgJShR0KhEvPJArfuPVN1+Hz1t0Y6n5jLrGQbkb4urgPE/0Rve+1kMB1v/oWgHgm4WIcV+i7F2pTVj+2iQ==",
      "license": "MIT",
      "dependencies": {
        "loose-envify": "^1.1.0"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/react-day-picker": {
      "version": "8.10.1",
      "resolved": "https://registry.npmjs.org/react-day-picker/-/react-day-picker-8.10.1.tgz",
      "integrity": "sha512-TMx7fNbhLk15eqcMt+7Z7S2KF7mfTId/XJDjKE8f+IUcFn0l08/kI4FiYTL/0yuOLmEcbR4Fwe3GJf/NiiMnPA==",
      "license": "MIT",
      "funding": {
        "type": "individual",
        "url": "https://github.com/sponsors/gpbl"
      },
      "peerDependencies": {
        "date-fns": "^2.28.0 || ^3.0.0",
        "react": "^16.8.0 || ^17.0.0 || ^18.0.0"
      }
    },
    "node_modules/react-dom": {
      "version": "18.3.1",
      "resolved": "https://registry.npmjs.org/react-dom/-/react-dom-18.3.1.tgz",
      "integrity": "sha512-5m4nQKp+rZRb09LNH59GM4BxTh9251/ylbKIbpe7TpGxfJ+9kv6BLkLBXIjjspbgbnIBNqlI23tRnTWT0snUIw==",
      "license": "MIT",
      "dependencies": {
        "loose-envify": "^1.1.0",
        "scheduler": "^0.23.2"
      },
      "peerDependencies": {
        "react": "^18.3.1"
      }
    },
    "node_modules/react-fast-compare": {
      "version": "3.2.2",
      "resolved": "https://registry.npmjs.org/react-fast-compare/-/react-fast-compare-3.2.2.tgz",
      "integrity": "sha512-nsO+KSNgo1SbJqJEYRE9ERzo7YtYbou/OqjSQKxV7jcKox7+usiUVZOAC+XnDOABXggQTno0Y1CpVnuWEc1boQ==",
      "license": "MIT"
    },
    "node_modules/react-helmet-async": {
      "version": "2.0.5",
      "resolved": "https://registry.npmjs.org/react-helmet-async/-/react-helmet-async-2.0.5.tgz",
      "integrity": "sha512-rYUYHeus+i27MvFE+Jaa4WsyBKGkL6qVgbJvSBoX8mbsWoABJXdEO0bZyi0F6i+4f0NuIb8AvqPMj3iXFHkMwg==",
      "license": "Apache-2.0",
      "dependencies": {
        "invariant": "^2.2.4",
        "react-fast-compare": "^3.2.2",
        "shallowequal": "^1.1.0"
      },
      "peerDependencies": {
        "react": "^16.6.0 || ^17.0.0 || ^18.0.0"
      }
    },
    "node_modules/react-hook-form": {
      "version": "7.61.1",
      "resolved": "https://registry.npmjs.org/react-hook-form/-/react-hook-form-7.61.1.tgz",
      "integrity": "sha512-2vbXUFDYgqEgM2RcXcAT2PwDW/80QARi+PKmHy5q2KhuKvOlG8iIYgf7eIlIANR5trW9fJbP4r5aub3a4egsew==",
      "license": "MIT",
      "engines": {
        "node": ">=18.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/react-hook-form"
      },
      "peerDependencies": {
        "react": "^16.8.0 || ^17 || ^18 || ^19"
      }
    },
    "node_modules/react-is": {
      "version": "18.3.1",
      "resolved": "https://registry.npmjs.org/react-is/-/react-is-18.3.1.tgz",
      "integrity": "sha512-/LLMVyas0ljjAtoYiPqYiL8VWXzUUdThrmU5+n20DZv+a+ClRoevUzw5JxU+Ieh5/c87ytoTBV9G1FiKfNJdmg==",
      "license": "MIT"
    },
    "node_modules/react-remove-scroll": {
      "version": "2.7.1",
      "resolved": "https://registry.npmjs.org/react-remove-scroll/-/react-remove-scroll-2.7.1.tgz",
      "integrity": "sha512-HpMh8+oahmIdOuS5aFKKY6Pyog+FNaZV/XyJOq7b4YFwsFHe5yYfdbIalI4k3vU2nSDql7YskmUseHsRrJqIPA==",
      "license": "MIT",
      "dependencies": {
        "react-remove-scroll-bar": "^2.3.7",
        "react-style-singleton": "^2.2.3",
        "tslib": "^2.1.0",
        "use-callback-ref": "^1.3.3",
        "use-sidecar": "^1.1.3"
      },
      "engines": {
        "node": ">=10"
      },
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/react-remove-scroll-bar": {
      "version": "2.3.8",
      "resolved": "https://registry.npmjs.org/react-remove-scroll-bar/-/react-remove-scroll-bar-2.3.8.tgz",
      "integrity": "sha512-9r+yi9+mgU33AKcj6IbT9oRCO78WriSj6t/cF8DWBZJ9aOGPOTEDvdUDz1FwKim7QXWwmHqtdHnRJfhAxEG46Q==",
      "license": "MIT",
      "dependencies": {
        "react-style-singleton": "^2.2.2",
        "tslib": "^2.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/react-resizable-panels": {
      "version": "2.1.9",
      "resolved": "https://registry.npmjs.org/react-resizable-panels/-/react-resizable-panels-2.1.9.tgz",
      "integrity": "sha512-z77+X08YDIrgAes4jl8xhnUu1LNIRp4+E7cv4xHmLOxxUPO/ML7PSrE813b90vj7xvQ1lcf7g2uA9GeMZonjhQ==",
      "license": "MIT",
      "peerDependencies": {
        "react": "^16.14.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc",
        "react-dom": "^16.14.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc"
      }
    },
    "node_modules/react-router": {
      "version": "6.30.1",
      "resolved": "https://registry.npmjs.org/react-router/-/react-router-6.30.1.tgz",
      "integrity": "sha512-X1m21aEmxGXqENEPG3T6u0Th7g0aS4ZmoNynhbs+Cn+q+QGTLt+d5IQ2bHAXKzKcxGJjxACpVbnYQSCRcfxHlQ==",
      "license": "MIT",
      "dependencies": {
        "@remix-run/router": "1.23.0"
      },
      "engines": {
        "node": ">=14.0.0"
      },
      "peerDependencies": {
        "react": ">=16.8"
      }
    },
    "node_modules/react-router-dom": {
      "version": "6.30.1",
      "resolved": "https://registry.npmjs.org/react-router-dom/-/react-router-dom-6.30.1.tgz",
      "integrity": "sha512-llKsgOkZdbPU1Eg3zK8lCn+sjD9wMRZZPuzmdWWX5SUs8OFkN5HnFVC0u5KMeMaC9aoancFI/KoLuKPqN+hxHw==",
      "license": "MIT",
      "dependencies": {
        "@remix-run/router": "1.23.0",
        "react-router": "6.30.1"
      },
      "engines": {
        "node": ">=14.0.0"
      },
      "peerDependencies": {
        "react": ">=16.8",
        "react-dom": ">=16.8"
      }
    },
    "node_modules/react-smooth": {
      "version": "4.0.4",
      "resolved": "https://registry.npmjs.org/react-smooth/-/react-smooth-4.0.4.tgz",
      "integrity": "sha512-gnGKTpYwqL0Iii09gHobNolvX4Kiq4PKx6eWBCYYix+8cdw+cGo3do906l1NBPKkSWx1DghC1dlWG9L2uGd61Q==",
      "license": "MIT",
      "dependencies": {
        "fast-equals": "^5.0.1",
        "prop-types": "^15.8.1",
        "react-transition-group": "^4.4.5"
      },
      "peerDependencies": {
        "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0",
        "react-dom": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"
      }
    },
    "node_modules/react-style-singleton": {
      "version": "2.2.3",
      "resolved": "https://registry.npmjs.org/react-style-singleton/-/react-style-singleton-2.2.3.tgz",
      "integrity": "sha512-b6jSvxvVnyptAiLjbkWLE/lOnR4lfTtDAl+eUC7RZy+QQWc6wRzIV2CE6xBuMmDxc2qIihtDCZD5NPOFl7fRBQ==",
      "license": "MIT",
      "dependencies": {
        "get-nonce": "^1.0.0",
        "tslib": "^2.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/react-transition-group": {
      "version": "4.4.5",
      "resolved": "https://registry.npmjs.org/react-transition-group/-/react-transition-group-4.4.5.tgz",
      "integrity": "sha512-pZcd1MCJoiKiBR2NRxeCRg13uCXbydPnmB4EOeRrY7480qNWO8IIgQG6zlDkm6uRMsURXPuKq0GWtiM59a5Q6g==",
      "license": "BSD-3-Clause",
      "dependencies": {
        "@babel/runtime": "^7.5.5",
        "dom-helpers": "^5.0.1",
        "loose-envify": "^1.4.0",
        "prop-types": "^15.6.2"
      },
      "peerDependencies": {
        "react": ">=16.6.0",
        "react-dom": ">=16.6.0"
      }
    },
    "node_modules/read-cache": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/read-cache/-/read-cache-1.0.0.tgz",
      "integrity": "sha512-Owdv/Ft7IjOgm/i0xvNDZ1LrRANRfew4b2prF3OWMQLxLfu3bS8FVhCsrSCMK4lR56Y9ya+AThoTpDCTxCmpRA==",
      "license": "MIT",
      "dependencies": {
        "pify": "^2.3.0"
      }
    },
    "node_modules/readdirp": {
      "version": "3.6.0",
      "resolved": "https://registry.npmjs.org/readdirp/-/readdirp-3.6.0.tgz",
      "integrity": "sha512-hOS089on8RduqdbhvQ5Z37A0ESjsqz6qnRcffsMU3495FuTdqSm+7bhJ29JvIOsBDEEnan5DPu9t3To9VRlMzA==",
      "license": "MIT",
      "dependencies": {
        "picomatch": "^2.2.1"
      },
      "engines": {
        "node": ">=8.10.0"
      }
    },
    "node_modules/recharts": {
      "version": "2.15.4",
      "resolved": "https://registry.npmjs.org/recharts/-/recharts-2.15.4.tgz",
      "integrity": "sha512-UT/q6fwS3c1dHbXv2uFgYJ9BMFHu3fwnd7AYZaEQhXuYQ4hgsxLvsUXzGdKeZrW5xopzDCvuA2N41WJ88I7zIw==",
      "license": "MIT",
      "dependencies": {
        "clsx": "^2.0.0",
        "eventemitter3": "^4.0.1",
        "lodash": "^4.17.21",
        "react-is": "^18.3.1",
        "react-smooth": "^4.0.4",
        "recharts-scale": "^0.4.4",
        "tiny-invariant": "^1.3.1",
        "victory-vendor": "^36.6.8"
      },
      "engines": {
        "node": ">=14"
      },
      "peerDependencies": {
        "react": "^16.0.0 || ^17.0.0 || ^18.0.0 || ^19.0.0",
        "react-dom": "^16.0.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"
      }
    },
    "node_modules/recharts-scale": {
      "version": "0.4.5",
      "resolved": "https://registry.npmjs.org/recharts-scale/-/recharts-scale-0.4.5.tgz",
      "integrity": "sha512-kivNFO+0OcUNu7jQquLXAxz1FIwZj8nrj+YkOKc5694NbjCvcT6aSZiIzNzd2Kul4o4rTto8QVR9lMNtxD4G1w==",
      "license": "MIT",
      "dependencies": {
        "decimal.js-light": "^2.4.1"
      }
    },
    "node_modules/redent": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/redent/-/redent-3.0.0.tgz",
      "integrity": "sha512-6tDA8g98We0zd0GvVeMT9arEOnTw9qM03L9cJXaCjrip1OO764RDBLBfrB4cwzNGDj5OA5ioymC9GkizgWJDUg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "indent-string": "^4.0.0",
        "strip-indent": "^3.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/require-directory": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/require-directory/-/require-directory-2.1.1.tgz",
      "integrity": "sha512-fGxEI7+wsG9xrvdjsrlmL22OMTTiHRwAMroiEeMgq8gzoLC/PQr7RsRDSTLUg/bZAZtF+TVIkHc6/4RIKrui+Q==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/require-from-string": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/require-from-string/-/require-from-string-2.0.2.tgz",
      "integrity": "sha512-Xf0nWe6RseziFMu+Ap9biiUbmplq6S9/p+7w7YXP/JBHhrUDDUhwa+vANyubuqfZWTveU//DYVGsDG7RKL/vEw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/require-main-filename": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/require-main-filename/-/require-main-filename-2.0.0.tgz",
      "integrity": "sha512-NKN5kMDylKuldxYLSUfrbo5Tuzh4hd+2E8NPPX02mZtn1VuREQToYe/ZdlJy+J3uCpfaiGF05e7B8W0iXbQHmg==",
      "license": "ISC"
    },
    "node_modules/resolve": {
      "version": "1.22.8",
      "resolved": "https://registry.npmjs.org/resolve/-/resolve-1.22.8.tgz",
      "integrity": "sha512-oKWePCxqpd6FlLvGV1VU0x7bkPmmCNolxzjMf4NczoDnQcIWrAF+cPtZn5i6n+RfD2d9i0tzpKnG6Yk168yIyw==",
      "license": "MIT",
      "dependencies": {
        "is-core-module": "^2.13.0",
        "path-parse": "^1.0.7",
        "supports-preserve-symlinks-flag": "^1.0.0"
      },
      "bin": {
        "resolve": "bin/resolve"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/resolve-from": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/resolve-from/-/resolve-from-4.0.0.tgz",
      "integrity": "sha512-pb/MYmXstAkysRFx8piNI1tGFNQIFA3vkE3Gq4EuA1dF6gHp/+vgZqsCGJapvy8N3Q+4o7FwvquPJcnZ7RYy4g==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/reusify": {
      "version": "1.0.4",
      "resolved": "https://registry.npmjs.org/reusify/-/reusify-1.0.4.tgz",
      "integrity": "sha512-U9nH88a3fc/ekCF1l0/UP1IosiuIjyTh7hBvXVMHYgVcfGvt897Xguj2UOLDeI5BG2m7/uwyaLVT6fbtCwTyzw==",
      "license": "MIT",
      "engines": {
        "iojs": ">=1.0.0",
        "node": ">=0.10.0"
      }
    },
    "node_modules/rolldown": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/rolldown/-/rolldown-1.0.3.tgz",
      "integrity": "sha512-i00lAJ2ks1BYr7rjNjKC7BcqAS7nVfiT3QX1SI5aY+AFHblCmaUf9OE9dbdzDvW6dJxbi2ZCZiy9v3CcwOiX3g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@oxc-project/types": "=0.133.0",
        "@rolldown/pluginutils": "^1.0.0"
      },
      "bin": {
        "rolldown": "bin/cli.mjs"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "optionalDependencies": {
        "@rolldown/binding-android-arm64": "1.0.3",
        "@rolldown/binding-darwin-arm64": "1.0.3",
        "@rolldown/binding-darwin-x64": "1.0.3",
        "@rolldown/binding-freebsd-x64": "1.0.3",
        "@rolldown/binding-linux-arm-gnueabihf": "1.0.3",
        "@rolldown/binding-linux-arm64-gnu": "1.0.3",
        "@rolldown/binding-linux-arm64-musl": "1.0.3",
        "@rolldown/binding-linux-ppc64-gnu": "1.0.3",
        "@rolldown/binding-linux-s390x-gnu": "1.0.3",
        "@rolldown/binding-linux-x64-gnu": "1.0.3",
        "@rolldown/binding-linux-x64-musl": "1.0.3",
        "@rolldown/binding-openharmony-arm64": "1.0.3",
        "@rolldown/binding-wasm32-wasi": "1.0.3",
        "@rolldown/binding-win32-arm64-msvc": "1.0.3",
        "@rolldown/binding-win32-x64-msvc": "1.0.3"
      }
    },
    "node_modules/rolldown/node_modules/@rolldown/pluginutils": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/@rolldown/pluginutils/-/pluginutils-1.0.1.tgz",
      "integrity": "sha512-2j9bGt5Jh8hj+vPtgzPtl72j0yRxHAyumoo6TNfAjsLB04UtpSvPbPcDcBMxz7n+9CYB0c1GxQFxYRg2jimqGw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/rollup": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/rollup/-/rollup-4.24.0.tgz",
      "integrity": "sha512-DOmrlGSXNk1DM0ljiQA+i+o0rSLhtii1je5wgk60j49d1jHT5YYttBv1iWOnYSTG+fZZESUOSNiAl89SIet+Cg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/estree": "1.0.6"
      },
      "bin": {
        "rollup": "dist/bin/rollup"
      },
      "engines": {
        "node": ">=18.0.0",
        "npm": ">=8.0.0"
      },
      "optionalDependencies": {
        "@rollup/rollup-android-arm-eabi": "4.24.0",
        "@rollup/rollup-android-arm64": "4.24.0",
        "@rollup/rollup-darwin-arm64": "4.24.0",
        "@rollup/rollup-darwin-x64": "4.24.0",
        "@rollup/rollup-linux-arm-gnueabihf": "4.24.0",
        "@rollup/rollup-linux-arm-musleabihf": "4.24.0",
        "@rollup/rollup-linux-arm64-gnu": "4.24.0",
        "@rollup/rollup-linux-arm64-musl": "4.24.0",
        "@rollup/rollup-linux-powerpc64le-gnu": "4.24.0",
        "@rollup/rollup-linux-riscv64-gnu": "4.24.0",
        "@rollup/rollup-linux-s390x-gnu": "4.24.0",
        "@rollup/rollup-linux-x64-gnu": "4.24.0",
        "@rollup/rollup-linux-x64-musl": "4.24.0",
        "@rollup/rollup-win32-arm64-msvc": "4.24.0",
        "@rollup/rollup-win32-ia32-msvc": "4.24.0",
        "@rollup/rollup-win32-x64-msvc": "4.24.0",
        "fsevents": "~2.3.2"
      }
    },
    "node_modules/run-parallel": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/run-parallel/-/run-parallel-1.2.0.tgz",
      "integrity": "sha512-5l4VyZR86LZ/lDxZTR6jqL8AFE2S0IFLMP26AbjsLVADxHdhB/c0GUsH+y39UfCi3dzz8OlQuPmnaJOMoDHQBA==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "queue-microtask": "^1.2.2"
      }
    },
    "node_modules/saxes": {
      "version": "6.0.0",
      "resolved": "https://registry.npmjs.org/saxes/-/saxes-6.0.0.tgz",
      "integrity": "sha512-xAg7SOnEhrm5zI3puOOKyy1OMcMlIJZYNJY7xLBwSze0UjhPLnWfj2GF2EpT0jmzaJKIWKHLsaSSajf35bcYnA==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "xmlchars": "^2.2.0"
      },
      "engines": {
        "node": ">=v12.22.7"
      }
    },
    "node_modules/scheduler": {
      "version": "0.23.2",
      "resolved": "https://registry.npmjs.org/scheduler/-/scheduler-0.23.2.tgz",
      "integrity": "sha512-UOShsPwz7NrMUqhR6t0hWjFduvOzbtv7toDH1/hIrfRNIDBnnBWd0CwJTGvTpngVlmwGCdP9/Zl/tVrDqcuYzQ==",
      "license": "MIT",
      "dependencies": {
        "loose-envify": "^1.1.0"
      }
    },
    "node_modules/sdp": {
      "version": "3.2.2",
      "resolved": "https://registry.npmjs.org/sdp/-/sdp-3.2.2.tgz",
      "integrity": "sha512-xZocWwfyp4hkbN4hLWxMjmv2Q8aNa9MhmOZ7L9aCZPT+dZsgRr6wZRrSYE3HTdyk/2pZKPSgqI7ns7Een1xMSA==",
      "license": "MIT"
    },
    "node_modules/semver": {
      "version": "7.7.2",
      "resolved": "https://registry.npmjs.org/semver/-/semver-7.7.2.tgz",
      "integrity": "sha512-RF0Fw+rO5AMf9MAyaRXI4AV0Ulj5lMHqVxxdSgiVbixSCXoEmmX/jk0CuJw4+3SqroYO9VoUh+HcuJivvtJemA==",
      "dev": true,
      "license": "ISC",
      "bin": {
        "semver": "bin/semver.js"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/set-blocking": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/set-blocking/-/set-blocking-2.0.0.tgz",
      "integrity": "sha512-KiKBS8AnWGEyLzofFfmvKwpdPzqiy16LvQfK3yv/fVH7Bj13/wl3JSR1J+rfgRE9q7xUJK4qvgS8raSOeLUehw==",
      "license": "ISC"
    },
    "node_modules/shallowequal": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/shallowequal/-/shallowequal-1.1.0.tgz",
      "integrity": "sha512-y0m1JoUZSlPAjXVtPPW70aZWfIL/dSP7AFkRnniLCrK/8MDKog3TySTBmckD+RObVxH0v4Tox67+F14PdED2oQ==",
      "license": "MIT"
    },
    "node_modules/shebang-command": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/shebang-command/-/shebang-command-2.0.0.tgz",
      "integrity": "sha512-kHxr2zZpYtdmrN1qDjrrX/Z1rR1kG8Dx+gkpK1G4eXmvXswmcE1hTWBWYUzlraYw1/yZp6YuDY77YtvbN0dmDA==",
      "license": "MIT",
      "dependencies": {
        "shebang-regex": "^3.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/shebang-regex": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/shebang-regex/-/shebang-regex-3.0.0.tgz",
      "integrity": "sha512-7++dFhtcx3353uBaq8DDR4NuxBetBzC7ZQOhmTQInHEd6bSrXdiEyzCvG07Z44UYdLShWUyXt5M/yhz8ekcb1A==",
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/siginfo": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/siginfo/-/siginfo-2.0.0.tgz",
      "integrity": "sha512-ybx0WO1/8bSBLEWXZvEd7gMW3Sn3JFlW3TvX1nREbDLRNQNaeNN8WK0meBwPdAaOI7TtRRRJn/Es1zhrrCHu7g==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/signal-exit": {
      "version": "4.1.0",
      "resolved": "https://registry.npmjs.org/signal-exit/-/signal-exit-4.1.0.tgz",
      "integrity": "sha512-bzyZ1e88w9O1iNJbKnOlvYTrWPDl46O1bG0D3XInv+9tkPrxrN8jUUTiFlDkkmKWgn1M6CfIA13SuGqOa9Korw==",
      "license": "ISC",
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/sirv": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/sirv/-/sirv-3.0.2.tgz",
      "integrity": "sha512-2wcC/oGxHis/BoHkkPwldgiPSYcpZK3JU28WoMVv55yHJgcZ8rlXvuG9iZggz+sU1d4bRgIGASwyWqjxu3FM0g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@polka/url": "^1.0.0-next.24",
        "mrmime": "^2.0.0",
        "totalist": "^3.0.0"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/sonner": {
      "version": "1.7.4",
      "resolved": "https://registry.npmjs.org/sonner/-/sonner-1.7.4.tgz",
      "integrity": "sha512-DIS8z4PfJRbIyfVFDVnK9rO3eYDtse4Omcm6bt0oEr5/jtLgysmjuBl1frJ9E/EQZrFmKx2A8m/s5s9CRXIzhw==",
      "license": "MIT",
      "peerDependencies": {
        "react": "^18.0.0 || ^19.0.0 || ^19.0.0-rc",
        "react-dom": "^18.0.0 || ^19.0.0 || ^19.0.0-rc"
      }
    },
    "node_modules/source-map-js": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz",
      "integrity": "sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==",
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/stackback": {
      "version": "0.0.2",
      "resolved": "https://registry.npmjs.org/stackback/-/stackback-0.0.2.tgz",
      "integrity": "sha512-1XMJE5fQo1jGH6Y/7ebnwPOBEkIEnT4QF32d5R1+VXdXveM0IBMJt8zfaxX1P3QhVwrYe+576+jkANtSS2mBbw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/std-env": {
      "version": "4.1.0",
      "resolved": "https://registry.npmjs.org/std-env/-/std-env-4.1.0.tgz",
      "integrity": "sha512-Rq7ybcX2RuC55r9oaPVEW7/xu3tj8u4GeBYHBWCychFtzMIr86A7e3PPEBPT37sHStKX3+TiX/Fr/ACmJLVlLQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/string-width": {
      "version": "5.1.2",
      "resolved": "https://registry.npmjs.org/string-width/-/string-width-5.1.2.tgz",
      "integrity": "sha512-HnLOCR3vjcY8beoNLtcjZ5/nxn2afmME6lhrDrebokqMap+XbeW8n9TXpPDOqdGK5qcI3oT0GKTW6wC7EMiVqA==",
      "license": "MIT",
      "dependencies": {
        "eastasianwidth": "^0.2.0",
        "emoji-regex": "^9.2.2",
        "strip-ansi": "^7.0.1"
      },
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/string-width-cjs": {
      "name": "string-width",
      "version": "4.2.3",
      "resolved": "https://registry.npmjs.org/string-width/-/string-width-4.2.3.tgz",
      "integrity": "sha512-wKyQRQpjJ0sIp62ErSZdGsjMJWsap5oRNihHhu6G7JVO/9jIB6UyevL+tXuOqrng8j/cxKTWyWUwvSTriiZz/g==",
      "license": "MIT",
      "dependencies": {
        "emoji-regex": "^8.0.0",
        "is-fullwidth-code-point": "^3.0.0",
        "strip-ansi": "^6.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/string-width-cjs/node_modules/ansi-regex": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-5.0.1.tgz",
      "integrity": "sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==",
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/string-width-cjs/node_modules/emoji-regex": {
      "version": "8.0.0",
      "resolved": "https://registry.npmjs.org/emoji-regex/-/emoji-regex-8.0.0.tgz",
      "integrity": "sha512-MSjYzcWNOA0ewAHpz0MxpYFvwg6yjy1NG3xteoqz644VCo/RPgnr1/GGt+ic3iJTzQ8Eu3TdM14SawnVUmGE6A==",
      "license": "MIT"
    },
    "node_modules/string-width-cjs/node_modules/strip-ansi": {
      "version": "6.0.1",
      "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-6.0.1.tgz",
      "integrity": "sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==",
      "license": "MIT",
      "dependencies": {
        "ansi-regex": "^5.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/strip-ansi": {
      "version": "7.1.0",
      "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-7.1.0.tgz",
      "integrity": "sha512-iq6eVVI64nQQTRYq2KtEg2d2uU7LElhTJwsH4YzIHZshxlgZms/wIc4VoDQTlG/IvVIrBKG06CrZnp0qv7hkcQ==",
      "license": "MIT",
      "dependencies": {
        "ansi-regex": "^6.0.1"
      },
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/chalk/strip-ansi?sponsor=1"
      }
    },
    "node_modules/strip-ansi-cjs": {
      "name": "strip-ansi",
      "version": "6.0.1",
      "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-6.0.1.tgz",
      "integrity": "sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==",
      "license": "MIT",
      "dependencies": {
        "ansi-regex": "^5.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/strip-ansi-cjs/node_modules/ansi-regex": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-5.0.1.tgz",
      "integrity": "sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==",
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/strip-indent": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/strip-indent/-/strip-indent-3.0.0.tgz",
      "integrity": "sha512-laJTa3Jb+VQpaC6DseHhF7dXVqHTfJPCRDaEbid/drOhgitgYku/letMUqOXFoWV0zIIUbjpdH2t+tYj4bQMRQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "min-indent": "^1.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/strip-json-comments": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/strip-json-comments/-/strip-json-comments-3.1.1.tgz",
      "integrity": "sha512-6fPc+R4ihwqP6N/aIv2f1gMH8lOVtWQHoqC4yK6oSDVVocumAsfCqjkXnqiYMhmMwS/mEHLp7Vehlt3ql6lEig==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/sucrase": {
      "version": "3.35.0",
      "resolved": "https://registry.npmjs.org/sucrase/-/sucrase-3.35.0.tgz",
      "integrity": "sha512-8EbVDiu9iN/nESwxeSxDKe0dunta1GOlHufmSSXxMD2z2/tMZpDMpvXQGsc+ajGo8y2uYUmixaSRUc/QPoQ0GA==",
      "license": "MIT",
      "dependencies": {
        "@jridgewell/gen-mapping": "^0.3.2",
        "commander": "^4.0.0",
        "glob": "^10.3.10",
        "lines-and-columns": "^1.1.6",
        "mz": "^2.7.0",
        "pirates": "^4.0.1",
        "ts-interface-checker": "^0.1.9"
      },
      "bin": {
        "sucrase": "bin/sucrase",
        "sucrase-node": "bin/sucrase-node"
      },
      "engines": {
        "node": ">=16 || 14 >=14.17"
      }
    },
    "node_modules/supports-color": {
      "version": "7.2.0",
      "resolved": "https://registry.npmjs.org/supports-color/-/supports-color-7.2.0.tgz",
      "integrity": "sha512-qpCAvRl9stuOHveKsn7HncJRvv501qIacKzQlO/+Lwxc9+0q2wLyv4Dfvt80/DPn2pqOBsJdDiogXGR9+OvwRw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "has-flag": "^4.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/supports-preserve-symlinks-flag": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/supports-preserve-symlinks-flag/-/supports-preserve-symlinks-flag-1.0.0.tgz",
      "integrity": "sha512-ot0WnXS9fgdkgIcePe6RHNk1WA8+muPa6cSjeR3V8K27q9BB1rTE3R1p7Hv0z1ZyAc8s6Vvv8DIyWf681MAt0w==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/symbol-tree": {
      "version": "3.2.4",
      "resolved": "https://registry.npmjs.org/symbol-tree/-/symbol-tree-3.2.4.tgz",
      "integrity": "sha512-9QNk5KwDF+Bvz+PyObkmSYjI5ksVUYtjW7AU22r2NKcfLJcXp96hkDWU3+XndOsUb+AQ9QhfzfCT2O+CNWT5Tw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/tailwind-merge": {
      "version": "2.6.0",
      "resolved": "https://registry.npmjs.org/tailwind-merge/-/tailwind-merge-2.6.0.tgz",
      "integrity": "sha512-P+Vu1qXfzediirmHOC3xKGAYeZtPcV9g76X+xg2FD4tYgR71ewMA35Y3sCz3zhiN/dwefRpJX0yBcgwi1fXNQA==",
      "license": "MIT",
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/dcastil"
      }
    },
    "node_modules/tailwindcss": {
      "version": "3.4.17",
      "resolved": "https://registry.npmjs.org/tailwindcss/-/tailwindcss-3.4.17.tgz",
      "integrity": "sha512-w33E2aCvSDP0tW9RZuNXadXlkHXqFzSkQew/aIa2i/Sj8fThxwovwlXHSPXTbAHwEIhBFXAedUhP2tueAKP8Og==",
      "license": "MIT",
      "dependencies": {
        "@alloc/quick-lru": "^5.2.0",
        "arg": "^5.0.2",
        "chokidar": "^3.6.0",
        "didyoumean": "^1.2.2",
        "dlv": "^1.1.3",
        "fast-glob": "^3.3.2",
        "glob-parent": "^6.0.2",
        "is-glob": "^4.0.3",
        "jiti": "^1.21.6",
        "lilconfig": "^3.1.3",
        "micromatch": "^4.0.8",
        "normalize-path": "^3.0.0",
        "object-hash": "^3.0.0",
        "picocolors": "^1.1.1",
        "postcss": "^8.4.47",
        "postcss-import": "^15.1.0",
        "postcss-js": "^4.0.1",
        "postcss-load-config": "^4.0.2",
        "postcss-nested": "^6.2.0",
        "postcss-selector-parser": "^6.1.2",
        "resolve": "^1.22.8",
        "sucrase": "^3.35.0"
      },
      "bin": {
        "tailwind": "lib/cli.js",
        "tailwindcss": "lib/cli.js"
      },
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/tailwindcss-animate": {
      "version": "1.0.7",
      "resolved": "https://registry.npmjs.org/tailwindcss-animate/-/tailwindcss-animate-1.0.7.tgz",
      "integrity": "sha512-bl6mpH3T7I3UFxuvDEXLxy/VuFxBk5bbzplh7tXI68mwMokNYd1t9qPBHlnyTwfa4JGC4zP516I1hYYtQ/vspA==",
      "license": "MIT",
      "peerDependencies": {
        "tailwindcss": ">=3.0.0 || insiders"
      }
    },
    "node_modules/thenify": {
      "version": "3.3.1",
      "resolved": "https://registry.npmjs.org/thenify/-/thenify-3.3.1.tgz",
      "integrity": "sha512-RVZSIV5IG10Hk3enotrhvz0T9em6cyHBLkH/YAZuKqd8hRkKhSfCGIcP2KUY0EPxndzANBmNllzWPwak+bheSw==",
      "license": "MIT",
      "dependencies": {
        "any-promise": "^1.0.0"
      }
    },
    "node_modules/thenify-all": {
      "version": "1.6.0",
      "resolved": "https://registry.npmjs.org/thenify-all/-/thenify-all-1.6.0.tgz",
      "integrity": "sha512-RNxQH/qI8/t3thXJDwcstUO4zeqo64+Uy/+sNVRBx4Xn2OX+OZ9oP+iJnNFqplFra2ZUVeKCSa2oVWi3T4uVmA==",
      "license": "MIT",
      "dependencies": {
        "thenify": ">= 3.1.0 < 4"
      },
      "engines": {
        "node": ">=0.8"
      }
    },
    "node_modules/tiny-invariant": {
      "version": "1.3.3",
      "resolved": "https://registry.npmjs.org/tiny-invariant/-/tiny-invariant-1.3.3.tgz",
      "integrity": "sha512-+FbBPE1o9QAYvviau/qC5SE3caw21q3xkvWKBtja5vgqOWIHHJ3ioaq1VPfn/Szqctz2bU/oYeKd9/z5BL+PVg==",
      "license": "MIT"
    },
    "node_modules/tinybench": {
      "version": "2.9.0",
      "resolved": "https://registry.npmjs.org/tinybench/-/tinybench-2.9.0.tgz",
      "integrity": "sha512-0+DUvqWMValLmha6lr4kD8iAMK1HzV0/aKnCtWb9v9641TnP/MFb7Pc2bxoxQjTXAErryXVgUOfv2YqNllqGeg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/tinyexec": {
      "version": "1.2.4",
      "resolved": "https://registry.npmjs.org/tinyexec/-/tinyexec-1.2.4.tgz",
      "integrity": "sha512-SHf/r48b7vOrjve9PxJo3MN5v5yuyjHvdUcrQffT3WXMUfnGmHDVbC4k3sHJaJTgZCwpUplIaAo5ANtMyp3YHg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tinyglobby": {
      "version": "0.2.17",
      "resolved": "https://registry.npmjs.org/tinyglobby/-/tinyglobby-0.2.17.tgz",
      "integrity": "sha512-wXR/dYpcqKmfWpEdZjiKJOwCNFndD0DMnrW/cYjVGttEkBfVgcLFHoNrlj47mjOVic9yyNu65alsgF4NQyTa2g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fdir": "^6.5.0",
        "picomatch": "^4.0.4"
      },
      "engines": {
        "node": ">=12.0.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/SuperchupuDev"
      }
    },
    "node_modules/tinyglobby/node_modules/fdir": {
      "version": "6.5.0",
      "resolved": "https://registry.npmjs.org/fdir/-/fdir-6.5.0.tgz",
      "integrity": "sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12.0.0"
      },
      "peerDependencies": {
        "picomatch": "^3 || ^4"
      },
      "peerDependenciesMeta": {
        "picomatch": {
          "optional": true
        }
      }
    },
    "node_modules/tinyglobby/node_modules/picomatch": {
      "version": "4.0.4",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.4.tgz",
      "integrity": "sha512-QP88BAKvMam/3NxH6vj2o21R6MjxZUAd6nlwAS/pnGvN9IVLocLHxGYIzFhg6fUQ+5th6P4dv4eW9jX3DSIj7A==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/tinyrainbow": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/tinyrainbow/-/tinyrainbow-3.1.0.tgz",
      "integrity": "sha512-Bf+ILmBgretUrdJxzXM0SgXLZ3XfiaUuOj/IKQHuTXip+05Xn+uyEYdVg0kYDipTBcLrCVyUzAPz7QmArb0mmw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/tldts": {
      "version": "7.4.3",
      "resolved": "https://registry.npmjs.org/tldts/-/tldts-7.4.3.tgz",
      "integrity": "sha512-A3BDQBeeukYPzB4QdQ1DtdlUmp4x2OCH8n5UVhEWbyANxNep8GavottKzd1xYKFJKjUgMyPT7EzOfnBO55s8Sg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "tldts-core": "^7.4.3"
      },
      "bin": {
        "tldts": "bin/cli.js"
      }
    },
    "node_modules/tldts-core": {
      "version": "7.4.3",
      "resolved": "https://registry.npmjs.org/tldts-core/-/tldts-core-7.4.3.tgz",
      "integrity": "sha512-27ep5H9PzdBrNd5OFM/j3WCU8F3kPwM9D0BOaOf7uYfxMJfyr0K5Tjj69Gri+sZlh2WXd5buIm47NuPF29CDiw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/to-regex-range": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/to-regex-range/-/to-regex-range-5.0.1.tgz",
      "integrity": "sha512-65P7iz6X5yEr1cwcgvQxbbIw7Uk3gOy5dIdtZ4rDveLqhrdJP+Li/Hx6tyK0NEb+2GCyneCMJiGqrADCSNk8sQ==",
      "license": "MIT",
      "dependencies": {
        "is-number": "^7.0.0"
      },
      "engines": {
        "node": ">=8.0"
      }
    },
    "node_modules/totalist": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/totalist/-/totalist-3.0.1.tgz",
      "integrity": "sha512-sf4i37nQ2LBx4m3wB74y+ubopq6W/dIzXg0FDGjsYnZHVa1Da8FH853wlL2gtUhg+xJXjfk3kUZS3BRoQeoQBQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/tough-cookie": {
      "version": "6.0.1",
      "resolved": "https://registry.npmjs.org/tough-cookie/-/tough-cookie-6.0.1.tgz",
      "integrity": "sha512-LktZQb3IeoUWB9lqR5EWTHgW/VTITCXg4D21M+lvybRVdylLrRMnqaIONLVb5mav8vM19m44HIcGq4qASeu2Qw==",
      "dev": true,
      "license": "BSD-3-Clause",
      "dependencies": {
        "tldts": "^7.0.5"
      },
      "engines": {
        "node": ">=16"
      }
    },
    "node_modules/tr46": {
      "version": "6.0.0",
      "resolved": "https://registry.npmjs.org/tr46/-/tr46-6.0.0.tgz",
      "integrity": "sha512-bLVMLPtstlZ4iMQHpFHTR7GAGj2jxi8Dg0s2h2MafAE4uSWF98FC/3MomU51iQAMf8/qDUbKWf5GxuvvVcXEhw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "punycode": "^2.3.1"
      },
      "engines": {
        "node": ">=20"
      }
    },
    "node_modules/ts-api-utils": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/ts-api-utils/-/ts-api-utils-2.1.0.tgz",
      "integrity": "sha512-CUgTZL1irw8u29bzrOD/nH85jqyc74D6SshFgujOIA7osm2Rz7dYH77agkx7H4FBNxDq7Cjf+IjaX/8zwFW+ZQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18.12"
      },
      "peerDependencies": {
        "typescript": ">=4.8.4"
      }
    },
    "node_modules/ts-interface-checker": {
      "version": "0.1.13",
      "resolved": "https://registry.npmjs.org/ts-interface-checker/-/ts-interface-checker-0.1.13.tgz",
      "integrity": "sha512-Y/arvbn+rrz3JCKl9C4kVNfTfSm2/mEp5FSz5EsZSANGPSlQrpRI5M4PKF+mJnE52jOO90PnPSc3Ur3bTQw0gA==",
      "license": "Apache-2.0"
    },
    "node_modules/tslib": {
      "version": "2.8.0",
      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.0.tgz",
      "integrity": "sha512-jWVzBLplnCmoaTr13V9dYbiQ99wvZRd0vNWaDRg+aVYRcjDF3nDksxFDE/+fkXnKhpnUUkmx5pK/v8mCtLVqZA==",
      "license": "0BSD"
    },
    "node_modules/type-check": {
      "version": "0.4.0",
      "resolved": "https://registry.npmjs.org/type-check/-/type-check-0.4.0.tgz",
      "integrity": "sha512-XleUoc9uwGXqjWwXaUTZAmzMcFZ5858QA2vvx1Ur5xIcixXIP+8LnFDgRplU30us6teqdlskFfu+ae4K79Ooew==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "prelude-ls": "^1.2.1"
      },
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/typescript": {
      "version": "5.8.3",
      "resolved": "https://registry.npmjs.org/typescript/-/typescript-5.8.3.tgz",
      "integrity": "sha512-p1diW6TqL9L07nNxvRMM7hMMw4c5XOo/1ibL4aAIGmSAt9slTE1Xgw5KWuof2uTOvCg9BY7ZRi+GaF+7sfgPeQ==",
      "dev": true,
      "license": "Apache-2.0",
      "bin": {
        "tsc": "bin/tsc",
        "tsserver": "bin/tsserver"
      },
      "engines": {
        "node": ">=14.17"
      }
    },
    "node_modules/typescript-eslint": {
      "version": "8.38.0",
      "resolved": "https://registry.npmjs.org/typescript-eslint/-/typescript-eslint-8.38.0.tgz",
      "integrity": "sha512-FsZlrYK6bPDGoLeZRuvx2v6qrM03I0U0SnfCLPs/XCCPCFD80xU9Pg09H/K+XFa68uJuZo7l/Xhs+eDRg2l3hg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@typescript-eslint/eslint-plugin": "8.38.0",
        "@typescript-eslint/parser": "8.38.0",
        "@typescript-eslint/typescript-estree": "8.38.0",
        "@typescript-eslint/utils": "8.38.0"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependencies": {
        "eslint": "^8.57.0 || ^9.0.0",
        "typescript": ">=4.8.4 <5.9.0"
      }
    },
    "node_modules/undici": {
      "version": "7.28.0",
      "resolved": "https://registry.npmjs.org/undici/-/undici-7.28.0.tgz",
      "integrity": "sha512-cRZYrTDwWznlnRiPjggAGxZXanty6M8RV1ff8Wm4LWXBp7/IG8v5DnOm74DtUBp9OONpK75YlPnIjQqX0dBDtA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=20.18.1"
      }
    },
    "node_modules/undici-types": {
      "version": "6.21.0",
      "resolved": "https://registry.npmjs.org/undici-types/-/undici-types-6.21.0.tgz",
      "integrity": "sha512-iwDZqg0QAGrg9Rav5H4n0M64c3mkR59cJ6wQp+7C4nI0gsmExaedaYLNO44eT4AtBBwjbTiGPMlt2Md0T9H9JQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/update-browserslist-db": {
      "version": "1.1.3",
      "resolved": "https://registry.npmjs.org/update-browserslist-db/-/update-browserslist-db-1.1.3.tgz",
      "integrity": "sha512-UxhIZQ+QInVdunkDAaiazvvT/+fXL5Osr0JZlJulepYu6Jd7qJtDZjlur0emRlT71EN3ScPoE7gvsuIKKNavKw==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/browserslist"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "escalade": "^3.2.0",
        "picocolors": "^1.1.1"
      },
      "bin": {
        "update-browserslist-db": "cli.js"
      },
      "peerDependencies": {
        "browserslist": ">= 4.21.0"
      }
    },
    "node_modules/uri-js": {
      "version": "4.4.1",
      "resolved": "https://registry.npmjs.org/uri-js/-/uri-js-4.4.1.tgz",
      "integrity": "sha512-7rKUyy33Q1yc98pQ1DAmLtwX109F7TIfWlW1Ydo8Wl1ii1SeHieeh0HHfPeL2fMXK6z0s8ecKs9frCuLJvndBg==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "punycode": "^2.1.0"
      }
    },
    "node_modules/use-callback-ref": {
      "version": "1.3.3",
      "resolved": "https://registry.npmjs.org/use-callback-ref/-/use-callback-ref-1.3.3.tgz",
      "integrity": "sha512-jQL3lRnocaFtu3V00JToYz/4QkNWswxijDaCVNZRiRTO3HQDLsdu1ZtmIUvV4yPp+rvWm5j0y0TG/S61cuijTg==",
      "license": "MIT",
      "dependencies": {
        "tslib": "^2.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/use-sidecar": {
      "version": "1.1.3",
      "resolved": "https://registry.npmjs.org/use-sidecar/-/use-sidecar-1.1.3.tgz",
      "integrity": "sha512-Fedw0aZvkhynoPYlA5WXrMCAMm+nSWdZt6lzJQ7Ok8S6Q+VsHmHpRWndVRJ8Be0ZbkfPc5LRYH+5XrzXcEeLRQ==",
      "license": "MIT",
      "dependencies": {
        "detect-node-es": "^1.1.0",
        "tslib": "^2.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/use-sync-external-store": {
      "version": "1.5.0",
      "resolved": "https://registry.npmjs.org/use-sync-external-store/-/use-sync-external-store-1.5.0.tgz",
      "integrity": "sha512-Rb46I4cGGVBmjamjphe8L/UnvJD+uPPtTkNvX5mZgqdbavhI4EbgIWJiIHXJ8bc/i9EQGPRh4DwEURJ552Do0A==",
      "license": "MIT",
      "peerDependencies": {
        "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"
      }
    },
    "node_modules/util-deprecate": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/util-deprecate/-/util-deprecate-1.0.2.tgz",
      "integrity": "sha512-EPD5q1uXyFxJpCrLnCc1nHnq3gOa6DZBocAIiI2TaSCA7VCJ1UJDMagCzIkXNsUYfD1daK//LTEQ8xiIbrHtcw==",
      "license": "MIT"
    },
    "node_modules/vaul": {
      "version": "0.9.9",
      "resolved": "https://registry.npmjs.org/vaul/-/vaul-0.9.9.tgz",
      "integrity": "sha512-7afKg48srluhZwIkaU+lgGtFCUsYBSGOl8vcc8N/M3YQlZFlynHD15AE+pwrYdc826o7nrIND4lL9Y6b9WWZZQ==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-dialog": "^1.1.1"
      },
      "peerDependencies": {
        "react": "^16.8 || ^17.0 || ^18.0",
        "react-dom": "^16.8 || ^17.0 || ^18.0"
      }
    },
    "node_modules/victory-vendor": {
      "version": "36.9.2",
      "resolved": "https://registry.npmjs.org/victory-vendor/-/victory-vendor-36.9.2.tgz",
      "integrity": "sha512-PnpQQMuxlwYdocC8fIJqVXvkeViHYzotI+NJrCuav0ZYFoq912ZHBk3mCeuj+5/VpodOjPe1z0Fk2ihgzlXqjQ==",
      "license": "MIT AND ISC",
      "dependencies": {
        "@types/d3-array": "^3.0.3",
        "@types/d3-ease": "^3.0.0",
        "@types/d3-interpolate": "^3.0.1",
        "@types/d3-scale": "^4.0.2",
        "@types/d3-shape": "^3.1.0",
        "@types/d3-time": "^3.0.0",
        "@types/d3-timer": "^3.0.0",
        "d3-array": "^3.1.6",
        "d3-ease": "^3.0.1",
        "d3-interpolate": "^3.0.1",
        "d3-scale": "^4.0.2",
        "d3-shape": "^3.1.0",
        "d3-time": "^3.0.0",
        "d3-timer": "^3.0.1"
      }
    },
    "node_modules/vite": {
      "version": "5.4.19",
      "resolved": "https://registry.npmjs.org/vite/-/vite-5.4.19.tgz",
      "integrity": "sha512-qO3aKv3HoQC8QKiNSTuUM1l9o/XX3+c+VTgLHbJWHZGeTPVAg2XwazI9UWzoxjIJCGCV2zU60uqMzjeLZuULqA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "esbuild": "^0.21.3",
        "postcss": "^8.4.43",
        "rollup": "^4.20.0"
      },
      "bin": {
        "vite": "bin/vite.js"
      },
      "engines": {
        "node": "^18.0.0 || >=20.0.0"
      },
      "funding": {
        "url": "https://github.com/vitejs/vite?sponsor=1"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.3"
      },
      "peerDependencies": {
        "@types/node": "^18.0.0 || >=20.0.0",
        "less": "*",
        "lightningcss": "^1.21.0",
        "sass": "*",
        "sass-embedded": "*",
        "stylus": "*",
        "sugarss": "*",
        "terser": "^5.4.0"
      },
      "peerDependenciesMeta": {
        "@types/node": {
          "optional": true
        },
        "less": {
          "optional": true
        },
        "lightningcss": {
          "optional": true
        },
        "sass": {
          "optional": true
        },
        "sass-embedded": {
          "optional": true
        },
        "stylus": {
          "optional": true
        },
        "sugarss": {
          "optional": true
        },
        "terser": {
          "optional": true
        }
      }
    },
    "node_modules/vitest": {
      "version": "4.1.9",
      "resolved": "https://registry.npmjs.org/vitest/-/vitest-4.1.9.tgz",
      "integrity": "sha512-nE3/LEyc0z87uHYLZebqCUOaJr2hdtuPp7BQ4BosVFnfltxgAvMG08NyrSGlPpOUWvR27c5flSmYFTNr78L9GQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@vitest/expect": "4.1.9",
        "@vitest/mocker": "4.1.9",
        "@vitest/pretty-format": "4.1.9",
        "@vitest/runner": "4.1.9",
        "@vitest/snapshot": "4.1.9",
        "@vitest/spy": "4.1.9",
        "@vitest/utils": "4.1.9",
        "es-module-lexer": "^2.0.0",
        "expect-type": "^1.3.0",
        "magic-string": "^0.30.21",
        "obug": "^2.1.1",
        "pathe": "^2.0.3",
        "picomatch": "^4.0.3",
        "std-env": "^4.0.0-rc.1",
        "tinybench": "^2.9.0",
        "tinyexec": "^1.0.2",
        "tinyglobby": "^0.2.15",
        "tinyrainbow": "^3.1.0",
        "vite": "^6.0.0 || ^7.0.0 || ^8.0.0",
        "why-is-node-running": "^2.3.0"
      },
      "bin": {
        "vitest": "vitest.mjs"
      },
      "engines": {
        "node": "^20.0.0 || ^22.0.0 || >=24.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      },
      "peerDependencies": {
        "@edge-runtime/vm": "*",
        "@opentelemetry/api": "^1.9.0",
        "@types/node": "^20.0.0 || ^22.0.0 || >=24.0.0",
        "@vitest/browser-playwright": "4.1.9",
        "@vitest/browser-preview": "4.1.9",
        "@vitest/browser-webdriverio": "4.1.9",
        "@vitest/coverage-istanbul": "4.1.9",
        "@vitest/coverage-v8": "4.1.9",
        "@vitest/ui": "4.1.9",
        "happy-dom": "*",
        "jsdom": "*",
        "vite": "^6.0.0 || ^7.0.0 || ^8.0.0"
      },
      "peerDependenciesMeta": {
        "@edge-runtime/vm": {
          "optional": true
        },
        "@opentelemetry/api": {
          "optional": true
        },
        "@types/node": {
          "optional": true
        },
        "@vitest/browser-playwright": {
          "optional": true
        },
        "@vitest/browser-preview": {
          "optional": true
        },
        "@vitest/browser-webdriverio": {
          "optional": true
        },
        "@vitest/coverage-istanbul": {
          "optional": true
        },
        "@vitest/coverage-v8": {
          "optional": true
        },
        "@vitest/ui": {
          "optional": true
        },
        "happy-dom": {
          "optional": true
        },
        "jsdom": {
          "optional": true
        },
        "vite": {
          "optional": false
        }
      }
    },
    "node_modules/vitest/node_modules/@esbuild/aix-ppc64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.28.1.tgz",
      "integrity": "sha512-Svl7tq8k/08+p6CXPpRjQ1fKX+1odH/BQbb48fV6fj3CWHhsoIOoY87w1oHXm0qEpkIK3ZfVgp0hed3XBXzXMQ==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "aix"
      ],
      "peer": true,
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/vitest/node_modules/@esbuild/android-arm": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.28.1.tgz",
      "integrity": "sha512-0k2F129Xdio1TdJfzJ8sy1Q47vUD2NnwdhiAf7drUN1EBTfPf4hsFCtmMgu/6m8JSzsBrlmVjudMBQqOfG8usQ==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "peer": true,
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/vitest/node_modules/@esbuild/android-arm64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.28.1.tgz",
      "integrity": "sha512-34EGEbCIAgosYz6goLcopX6Mo7NyGv9tfwEM2/7Ce2VcVRk568iSvniGWcUXIy7wEDR1wzolcxcriFVrWYcwBg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "peer": true,
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/vitest/node_modules/@esbuild/android-x64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.28.1.tgz",
      "integrity": "sha512-dbwY7ltSMDWsRatcRpCnES4F+im88OCUgGZjy52shC7GqHRE/cYlxNbB4Z4UpJswpcc4Qxd2oE/ufM0p61IKng==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "peer": true,
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/vitest/node_modules/@esbuild/darwin-arm64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.28.1.tgz",
      "integrity": "sha512-TZbWkQY7kvTAXbXUT7uVACR5cMHsDiSz9z7ZKAX/RTq/WJEk3QyRr0wZpNhBDX+/0CtdqUIJlOiodQcta6tY3Q==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "peer": true,
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/vitest/node_modules/@esbuild/darwin-x64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.28.1.tgz",
      "integrity": "sha512-zfdzgK9ACBNZLI/CyHTOx81SyNbM6YXn7rxSgX97VjyiPl9W1i4Ka4fgKECEoFCKGpvBj5qArWIGgQjOwkgskQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "peer": true,
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/vitest/node_modules/@esbuild/freebsd-arm64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.28.1.tgz",
      "integrity": "sha512-wG2EA8ENdEI0qhkSZMjfqrdY+ziCYCPMmtZjjIwOmXFjmyzEHn+UUxk5of+SYsjtfs3VpnlC7QLzSI5hY/rOAw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "peer": true,
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/vitest/node_modules/@esbuild/freebsd-x64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.28.1.tgz",
      "integrity": "sha512-i7dZ9vQgnvSCzi/rYCXNgtF/U+eKZNJBzu3eTQbRgHnM7tNSizLOkRFAl3qzVc/Op/u5YkHHa4pf/3DOYHthLQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "peer": true,
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/vitest/node_modules/@esbuild/linux-arm": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.28.1.tgz",
      "integrity": "sha512-qVXBOHQS+d5Y722GwJzJUtOLlX7km3CraOaGormF1pDtPd2C/l1SHRPgjLunLGe51Sh5YYWKMFDyV4SxgMQYTQ==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "peer": true,
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/vitest/node_modules/@esbuild/linux-arm64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.28.1.tgz",
      "integrity": "sha512-yHs+0uc8+nvEAfAfxrWQKK5peSNzBc4PegcMO0EJ2hT71uA7vB8Ihg2e77R2P7SG5uYjPbHlLLmve4LLLRCf0g==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "peer": true,
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/vitest/node_modules/@esbuild/linux-ia32": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.28.1.tgz",
      "integrity": "sha512-d1z4ZuP0ajrfz/FhGT4vv278rX8KnPPJx8i5+AtK7TYbx9Le9F1hyzurZpkEyjkGa9dUGhQow4C1NmeGvqxN2w==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "peer": true,
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/vitest/node_modules/@esbuild/linux-loong64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.28.1.tgz",
      "integrity": "sha512-M5sRjUVZrkm1OAPR3dlOYzNmN+loZKGVi1VUQGrwuqLcbR6qeAz+famMhjASeH3YVKvZz+zT1jlh/keC3Rj/lg==",
      "cpu": [
        "loong64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "peer": true,
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/vitest/node_modules/@esbuild/linux-mips64el": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.28.1.tgz",
      "integrity": "sha512-mRObBZeHh2OxcBFPWE/FjylkRgZdYuiTR3vaTozquCGOH14iP9oN4x4Ge81CoIDYQrXmIxpFumJBu5MtZpnQJQ==",
      "cpu": [
        "mips64el"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "peer": true,
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/vitest/node_modules/@esbuild/linux-ppc64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.28.1.tgz",
      "integrity": "sha512-slScBsMAb3GFDcdrCgLwZtPYRoH2H/youv10QiZyRjmsP48fznoveWytSgCI/R0ZcUgpc0ZhIUEx6LHts8yrfQ==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "peer": true,
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/vitest/node_modules/@esbuild/linux-riscv64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.28.1.tgz",
      "integrity": "sha512-kw0owk1o0GFETUJyW0jc0G4Yzs0BHZn0JDZ8JRT088vjJYX777BAs1fDGxAC+q831qOs2DTC96mNsG2opdfyyQ==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "peer": true,
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/vitest/node_modules/@esbuild/linux-s390x": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.28.1.tgz",
      "integrity": "sha512-/lAIjX8aYFRByhh6L5rYtPEDRqa9de/4V/juOXcta5frjvzXO4/sqEtyytse0g3zZFuWu5cDN0MkLz2qRDD2Ag==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "peer": true,
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/vitest/node_modules/@esbuild/linux-x64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.28.1.tgz",
      "integrity": "sha512-u/anNYF2mmVOEDwLtnQ1wOr3EZ9sTNGLWrsYGYwHWzGA3Si84IOkHXlbWTD1NB+9/1lcnweYKO54uhxZydNzfA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "peer": true,
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/vitest/node_modules/@esbuild/netbsd-x64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.28.1.tgz",
      "integrity": "sha512-aeL6lAnN89Hz43Mlh1G8ARasbuoYvSITDEx0tHh5b7jJnHcssqgjy9Yx430GDpmCa6OyrKoS0aNRjKundRizGg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "peer": true,
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/vitest/node_modules/@esbuild/openbsd-x64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.28.1.tgz",
      "integrity": "sha512-i/ZLIOafE0Z8cI/XANJAixoJL/uRAoS2xOA3rb0xN+KK0K177cMAsQYkzHtBrtMXAKuAc7HGgcWiZ/sRC1Nxgw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "peer": true,
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/vitest/node_modules/@esbuild/sunos-x64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.28.1.tgz",
      "integrity": "sha512-BEjgtECkL3vY+SaSQ6nzVfiALUeFxpawyp8Jmf5PtYhf1Ug40N1h/hxlhts+f1FvSvarEigdxS3BlSMI2PJLcQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "sunos"
      ],
      "peer": true,
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/vitest/node_modules/@esbuild/win32-arm64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.28.1.tgz",
      "integrity": "sha512-lCv9eK/H6ZJWbE7bh2nw54CZ9M2nupBxJcTsdk/QQnWkdSjKGuxmmH8/GWrlT1eMmZfn4dGcCjRte397WqfQXA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "peer": true,
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/vitest/node_modules/@esbuild/win32-ia32": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.28.1.tgz",
      "integrity": "sha512-zvb/mB2bSCoJOpoCBgYKKpX6YM6mJBlBUVUtVj41DlZJVEB6/0CKlRYxP5wWl1C1ILiCoAU5wZZ4q1P3qeS6Eg==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "peer": true,
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/vitest/node_modules/@esbuild/win32-x64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.28.1.tgz",
      "integrity": "sha512-bm4Mowrv+GXMlpWX++EcXw/iLyd1o3+bJkC2DkWXYVvgZCqD/bSj9ctZeAMC3cIxgjRVR2Dufaiu4YPxr5gW1A==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "peer": true,
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/vitest/node_modules/@vitest/mocker": {
      "version": "4.1.9",
      "resolved": "https://registry.npmjs.org/@vitest/mocker/-/mocker-4.1.9.tgz",
      "integrity": "sha512-EVkXzBjrPGM+cK8/ANWgBrkUCfJfb38/EfTSO8h7pWvKkyPkpWxvR7BkD2MyItMF62C97zAEoqdpUixwR/e+Rw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@vitest/spy": "4.1.9",
        "estree-walker": "^3.0.3",
        "magic-string": "^0.30.21"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      },
      "peerDependencies": {
        "msw": "^2.4.9",
        "vite": "^6.0.0 || ^7.0.0 || ^8.0.0"
      },
      "peerDependenciesMeta": {
        "msw": {
          "optional": true
        },
        "vite": {
          "optional": true
        }
      }
    },
    "node_modules/vitest/node_modules/esbuild": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.28.1.tgz",
      "integrity": "sha512-HrJrvZv5ayxBzPfwphOoNzkzOIIlifzk0KJrGK2c8R4+LKpMtpYLQeUdjnwjWv/LZlkH2laZk+4w78pi99D4Vw==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "peer": true,
      "bin": {
        "esbuild": "bin/esbuild"
      },
      "engines": {
        "node": ">=18"
      },
      "optionalDependencies": {
        "@esbuild/aix-ppc64": "0.28.1",
        "@esbuild/android-arm": "0.28.1",
        "@esbuild/android-arm64": "0.28.1",
        "@esbuild/android-x64": "0.28.1",
        "@esbuild/darwin-arm64": "0.28.1",
        "@esbuild/darwin-x64": "0.28.1",
        "@esbuild/freebsd-arm64": "0.28.1",
        "@esbuild/freebsd-x64": "0.28.1",
        "@esbuild/linux-arm": "0.28.1",
        "@esbuild/linux-arm64": "0.28.1",
        "@esbuild/linux-ia32": "0.28.1",
        "@esbuild/linux-loong64": "0.28.1",
        "@esbuild/linux-mips64el": "0.28.1",
        "@esbuild/linux-ppc64": "0.28.1",
        "@esbuild/linux-riscv64": "0.28.1",
        "@esbuild/linux-s390x": "0.28.1",
        "@esbuild/linux-x64": "0.28.1",
        "@esbuild/netbsd-arm64": "0.28.1",
        "@esbuild/netbsd-x64": "0.28.1",
        "@esbuild/openbsd-arm64": "0.28.1",
        "@esbuild/openbsd-x64": "0.28.1",
        "@esbuild/openharmony-arm64": "0.28.1",
        "@esbuild/sunos-x64": "0.28.1",
        "@esbuild/win32-arm64": "0.28.1",
        "@esbuild/win32-ia32": "0.28.1",
        "@esbuild/win32-x64": "0.28.1"
      }
    },
    "node_modules/vitest/node_modules/picomatch": {
      "version": "4.0.4",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.4.tgz",
      "integrity": "sha512-QP88BAKvMam/3NxH6vj2o21R6MjxZUAd6nlwAS/pnGvN9IVLocLHxGYIzFhg6fUQ+5th6P4dv4eW9jX3DSIj7A==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/vitest/node_modules/vite": {
      "version": "8.0.16",
      "resolved": "https://registry.npmjs.org/vite/-/vite-8.0.16.tgz",
      "integrity": "sha512-h9bXPmJichP5fLmVQo3PyaGSDE2n3aPuomeAlVRm0JLmt4rY6zmPKd59HYI4LNW8oTK7tlTsuC7l/m7awx9Jcw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "lightningcss": "^1.32.0",
        "picomatch": "^4.0.4",
        "postcss": "^8.5.15",
        "rolldown": "1.0.3",
        "tinyglobby": "^0.2.17"
      },
      "bin": {
        "vite": "bin/vite.js"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "funding": {
        "url": "https://github.com/vitejs/vite?sponsor=1"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.3"
      },
      "peerDependencies": {
        "@types/node": "^20.19.0 || >=22.12.0",
        "@vitejs/devtools": "^0.1.18",
        "esbuild": "^0.27.0 || ^0.28.0",
        "jiti": ">=1.21.0",
        "less": "^4.0.0",
        "sass": "^1.70.0",
        "sass-embedded": "^1.70.0",
        "stylus": ">=0.54.8",
        "sugarss": "^5.0.0",
        "terser": "^5.16.0",
        "tsx": "^4.8.1",
        "yaml": "^2.4.2"
      },
      "peerDependenciesMeta": {
        "@types/node": {
          "optional": true
        },
        "@vitejs/devtools": {
          "optional": true
        },
        "esbuild": {
          "optional": true
        },
        "jiti": {
          "optional": true
        },
        "less": {
          "optional": true
        },
        "sass": {
          "optional": true
        },
        "sass-embedded": {
          "optional": true
        },
        "stylus": {
          "optional": true
        },
        "sugarss": {
          "optional": true
        },
        "terser": {
          "optional": true
        },
        "tsx": {
          "optional": true
        },
        "yaml": {
          "optional": true
        }
      }
    },
    "node_modules/w3c-xmlserializer": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/w3c-xmlserializer/-/w3c-xmlserializer-5.0.0.tgz",
      "integrity": "sha512-o8qghlI8NZHU1lLPrpi2+Uq7abh4GGPpYANlalzWxyWteJOCsr/P+oPBA49TOLu5FTZO4d3F9MnWJfiMo4BkmA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "xml-name-validator": "^5.0.0"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/webidl-conversions": {
      "version": "8.0.1",
      "resolved": "https://registry.npmjs.org/webidl-conversions/-/webidl-conversions-8.0.1.tgz",
      "integrity": "sha512-BMhLD/Sw+GbJC21C/UgyaZX41nPt8bUTg+jWyDeg7e7YN4xOM05YPSIXceACnXVtqyEw/LMClUQMtMZ+PGGpqQ==",
      "dev": true,
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=20"
      }
    },
    "node_modules/webrtc-adapter": {
      "version": "9.0.5",
      "resolved": "https://registry.npmjs.org/webrtc-adapter/-/webrtc-adapter-9.0.5.tgz",
      "integrity": "sha512-U9vjByy/sK2OMXu5mmfuZFKTMIUQe34c0JXRO+oDrxJTsntdYT2iIFwYMOV7HhMTuktcZLGf2W1N/OcSf9ssWg==",
      "license": "BSD-3-Clause",
      "dependencies": {
        "sdp": "^3.2.0"
      },
      "engines": {
        "node": ">=6.0.0",
        "npm": ">=3.10.0"
      }
    },
    "node_modules/whatwg-mimetype": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/whatwg-mimetype/-/whatwg-mimetype-3.0.0.tgz",
      "integrity": "sha512-nt+N2dzIutVRxARx1nghPKGv1xHikU7HKdfafKkLNLindmPU/ch3U31NOCGGA/dmPcmb1VlofO0vnKAcsm0o/Q==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/whatwg-url": {
      "version": "16.0.1",
      "resolved": "https://registry.npmjs.org/whatwg-url/-/whatwg-url-16.0.1.tgz",
      "integrity": "sha512-1to4zXBxmXHV3IiSSEInrreIlu02vUOvrhxJJH5vcxYTBDAx51cqZiKdyTxlecdKNSjj8EcxGBxNf6Vg+945gw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@exodus/bytes": "^1.11.0",
        "tr46": "^6.0.0",
        "webidl-conversions": "^8.0.1"
      },
      "engines": {
        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
      }
    },
    "node_modules/which": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/which/-/which-2.0.2.tgz",
      "integrity": "sha512-BLI3Tl1TW3Pvl70l3yq3Y64i+awpwXqsGBYWkkqMtnbXgrMD+yj7rhW0kuEDxzJaYXGjEW5ogapKNMEKNMjibA==",
      "license": "ISC",
      "dependencies": {
        "isexe": "^2.0.0"
      },
      "bin": {
        "node-which": "bin/node-which"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/which-module": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/which-module/-/which-module-2.0.1.tgz",
      "integrity": "sha512-iBdZ57RDvnOR9AGBhML2vFZf7h8vmBjhoaZqODJBFWHVtKkDmKuHai3cx5PgVMrX5YDNp27AofYbAwctSS+vhQ==",
      "license": "ISC"
    },
    "node_modules/why-is-node-running": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/why-is-node-running/-/why-is-node-running-2.3.0.tgz",
      "integrity": "sha512-hUrmaWBdVDcxvYqnyh09zunKzROWjbZTiNy8dBEjkS7ehEDQibXJ7XvlmtbwuTclUiIyN+CyXQD4Vmko8fNm8w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "siginfo": "^2.0.0",
        "stackback": "0.0.2"
      },
      "bin": {
        "why-is-node-running": "cli.js"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/word-wrap": {
      "version": "1.2.5",
      "resolved": "https://registry.npmjs.org/word-wrap/-/word-wrap-1.2.5.tgz",
      "integrity": "sha512-BN22B5eaMMI9UMtjrGd5g5eCYPpCPDUy0FJXbYsaT5zYxjFOckS53SQDE3pWkVoWpHXVb3BrYcEN4Twa55B5cA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/wrap-ansi": {
      "version": "8.1.0",
      "resolved": "https://registry.npmjs.org/wrap-ansi/-/wrap-ansi-8.1.0.tgz",
      "integrity": "sha512-si7QWI6zUMq56bESFvagtmzMdGOtoxfR+Sez11Mobfc7tm+VkUckk9bW2UeffTGVUbOksxmSw0AA2gs8g71NCQ==",
      "license": "MIT",
      "dependencies": {
        "ansi-styles": "^6.1.0",
        "string-width": "^5.0.1",
        "strip-ansi": "^7.0.1"
      },
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/chalk/wrap-ansi?sponsor=1"
      }
    },
    "node_modules/wrap-ansi-cjs": {
      "name": "wrap-ansi",
      "version": "7.0.0",
      "resolved": "https://registry.npmjs.org/wrap-ansi/-/wrap-ansi-7.0.0.tgz",
      "integrity": "sha512-YVGIj2kamLSTxw6NsZjoBxfSwsn0ycdesmc4p+Q21c5zPuZ1pl+NfxVdxPtdHvmNVOQ6XSYG4AUtyt/Fi7D16Q==",
      "license": "MIT",
      "dependencies": {
        "ansi-styles": "^4.0.0",
        "string-width": "^4.1.0",
        "strip-ansi": "^6.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/chalk/wrap-ansi?sponsor=1"
      }
    },
    "node_modules/wrap-ansi-cjs/node_modules/ansi-regex": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-5.0.1.tgz",
      "integrity": "sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==",
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/wrap-ansi-cjs/node_modules/emoji-regex": {
      "version": "8.0.0",
      "resolved": "https://registry.npmjs.org/emoji-regex/-/emoji-regex-8.0.0.tgz",
      "integrity": "sha512-MSjYzcWNOA0ewAHpz0MxpYFvwg6yjy1NG3xteoqz644VCo/RPgnr1/GGt+ic3iJTzQ8Eu3TdM14SawnVUmGE6A==",
      "license": "MIT"
    },
    "node_modules/wrap-ansi-cjs/node_modules/string-width": {
      "version": "4.2.3",
      "resolved": "https://registry.npmjs.org/string-width/-/string-width-4.2.3.tgz",
      "integrity": "sha512-wKyQRQpjJ0sIp62ErSZdGsjMJWsap5oRNihHhu6G7JVO/9jIB6UyevL+tXuOqrng8j/cxKTWyWUwvSTriiZz/g==",
      "license": "MIT",
      "dependencies": {
        "emoji-regex": "^8.0.0",
        "is-fullwidth-code-point": "^3.0.0",
        "strip-ansi": "^6.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/wrap-ansi-cjs/node_modules/strip-ansi": {
      "version": "6.0.1",
      "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-6.0.1.tgz",
      "integrity": "sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==",
      "license": "MIT",
      "dependencies": {
        "ansi-regex": "^5.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/wrap-ansi/node_modules/ansi-styles": {
      "version": "6.2.1",
      "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-6.2.1.tgz",
      "integrity": "sha512-bN798gFfQX+viw3R7yrGWRqnrN2oRkEkUjjl4JNn4E8GxxbjtG3FbrEIIY3l8/hrwUwIeCZvi4QuOTP4MErVug==",
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/chalk/ansi-styles?sponsor=1"
      }
    },
    "node_modules/ws": {
      "version": "8.21.0",
      "resolved": "https://registry.npmjs.org/ws/-/ws-8.21.0.tgz",
      "integrity": "sha512-Vsp28b7DRcimFQvrqu2Wek3z1iYxDCWqHYB8Qsnk/S4RfaCQzPGPyBNuVjJV3cd6UiKtUtp6sNM77gWvzcCH+g==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=10.0.0"
      },
      "peerDependencies": {
        "bufferutil": "^4.0.1",
        "utf-8-validate": ">=5.0.2"
      },
      "peerDependenciesMeta": {
        "bufferutil": {
          "optional": true
        },
        "utf-8-validate": {
          "optional": true
        }
      }
    },
    "node_modules/xml-name-validator": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/xml-name-validator/-/xml-name-validator-5.0.0.tgz",
      "integrity": "sha512-EvGK8EJ3DhaHfbRlETOWAS5pO9MZITeauHKJyb8wyajUfQUenkIg2MvLDTZ4T/TgIcm3HU0TFBgWWboAZ30UHg==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/xmlchars": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/xmlchars/-/xmlchars-2.2.0.tgz",
      "integrity": "sha512-JZnDKK8B0RCDw84FNdDAIpZK+JuJw+s7Lz8nksI7SIuU3UXJJslUthsi+uWBUYOwPFwW7W7PRLRfUKpxjtjFCw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/y-indexeddb": {
      "version": "9.0.12",
      "resolved": "https://registry.npmjs.org/y-indexeddb/-/y-indexeddb-9.0.12.tgz",
      "integrity": "sha512-9oCFRSPPzBK7/w5vOkJBaVCQZKHXB/v6SIT+WYhnJxlEC61juqG0hBrAf+y3gmSMLFLwICNH9nQ53uscuse6Hg==",
      "license": "MIT",
      "dependencies": {
        "lib0": "^0.2.74"
      },
      "engines": {
        "node": ">=16.0.0",
        "npm": ">=8.0.0"
      },
      "funding": {
        "type": "GitHub Sponsors ❤",
        "url": "https://github.com/sponsors/dmonad"
      },
      "peerDependencies": {
        "yjs": "^13.0.0"
      }
    },
    "node_modules/y18n": {
      "version": "4.0.3",
      "resolved": "https://registry.npmjs.org/y18n/-/y18n-4.0.3.tgz",
      "integrity": "sha512-JKhqTOwSrqNA1NY5lSztJ1GrBiUodLMmIZuLiDaMRJ+itFd+ABVE8XBjOvIWL+rSqNDC74LCSFmlb/U4UZ4hJQ==",
      "license": "ISC"
    },
    "node_modules/yaml": {
      "version": "2.6.0",
      "resolved": "https://registry.npmjs.org/yaml/-/yaml-2.6.0.tgz",
      "integrity": "sha512-a6ae//JvKDEra2kdi1qzCyrJW/WZCgFi8ydDV+eXExl95t+5R+ijnqHJbz9tmMh8FUjx3iv2fCQ4dclAQlO2UQ==",
      "license": "ISC",
      "bin": {
        "yaml": "bin.mjs"
      },
      "engines": {
        "node": ">= 14"
      }
    },
    "node_modules/yargs": {
      "version": "15.4.1",
      "resolved": "https://registry.npmjs.org/yargs/-/yargs-15.4.1.tgz",
      "integrity": "sha512-aePbxDmcYW++PaqBsJ+HYUFwCdv4LVvdnhBy78E57PIor8/OVvhMrADFFEDh8DHDFRv/O9i3lPhsENjO7QX0+A==",
      "license": "MIT",
      "dependencies": {
        "cliui": "^6.0.0",
        "decamelize": "^1.2.0",
        "find-up": "^4.1.0",
        "get-caller-file": "^2.0.1",
        "require-directory": "^2.1.1",
        "require-main-filename": "^2.0.0",
        "set-blocking": "^2.0.0",
        "string-width": "^4.2.0",
        "which-module": "^2.0.0",
        "y18n": "^4.0.0",
        "yargs-parser": "^18.1.2"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/yargs-parser": {
      "version": "18.1.3",
      "resolved": "https://registry.npmjs.org/yargs-parser/-/yargs-parser-18.1.3.tgz",
      "integrity": "sha512-o50j0JeToy/4K6OZcaQmW6lyXXKhq7csREXcDwk2omFPJEwUNOVtJKvmDr9EI1fAJZUyZcRF7kxGBWmRXudrCQ==",
      "license": "ISC",
      "dependencies": {
        "camelcase": "^5.0.0",
        "decamelize": "^1.2.0"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/yargs/node_modules/ansi-regex": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-5.0.1.tgz",
      "integrity": "sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==",
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/yargs/node_modules/emoji-regex": {
      "version": "8.0.0",
      "resolved": "https://registry.npmjs.org/emoji-regex/-/emoji-regex-8.0.0.tgz",
      "integrity": "sha512-MSjYzcWNOA0ewAHpz0MxpYFvwg6yjy1NG3xteoqz644VCo/RPgnr1/GGt+ic3iJTzQ8Eu3TdM14SawnVUmGE6A==",
      "license": "MIT"
    },
    "node_modules/yargs/node_modules/find-up": {
      "version": "4.1.0",
      "resolved": "https://registry.npmjs.org/find-up/-/find-up-4.1.0.tgz",
      "integrity": "sha512-PpOwAdQ/YlXQ2vj8a3h8IipDuYRi3wceVQQGYWxNINccq40Anw7BlsEXCMbt1Zt+OLA6Fq9suIpIWD0OsnISlw==",
      "license": "MIT",
      "dependencies": {
        "locate-path": "^5.0.0",
        "path-exists": "^4.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/yargs/node_modules/locate-path": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/locate-path/-/locate-path-5.0.0.tgz",
      "integrity": "sha512-t7hw9pI+WvuwNJXwk5zVHpyhIqzg2qTlklJOf0mVxGSbe3Fp2VieZcduNYjaLDoy6p9uGpQEGWG87WpMKlNq8g==",
      "license": "MIT",
      "dependencies": {
        "p-locate": "^4.1.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/yargs/node_modules/p-limit": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/p-limit/-/p-limit-2.3.0.tgz",
      "integrity": "sha512-//88mFWSJx8lxCzwdAABTJL2MyWB12+eIY7MDL2SqLmAkeKU9qxRvWuSyTjm3FUmpBEMuFfckAIqEaVGUDxb6w==",
      "license": "MIT",
      "dependencies": {
        "p-try": "^2.0.0"
      },
      "engines": {
        "node": ">=6"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/yargs/node_modules/p-locate": {
      "version": "4.1.0",
      "resolved": "https://registry.npmjs.org/p-locate/-/p-locate-4.1.0.tgz",
      "integrity": "sha512-R79ZZ/0wAxKGu3oYMlz8jy/kbhsNrS7SKZ7PxEHBgJ5+F2mtFW2fK2cOtBh1cHYkQsbzFV7I+EoRKe6Yt0oK7A==",
      "license": "MIT",
      "dependencies": {
        "p-limit": "^2.2.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/yargs/node_modules/string-width": {
      "version": "4.2.3",
      "resolved": "https://registry.npmjs.org/string-width/-/string-width-4.2.3.tgz",
      "integrity": "sha512-wKyQRQpjJ0sIp62ErSZdGsjMJWsap5oRNihHhu6G7JVO/9jIB6UyevL+tXuOqrng8j/cxKTWyWUwvSTriiZz/g==",
      "license": "MIT",
      "dependencies": {
        "emoji-regex": "^8.0.0",
        "is-fullwidth-code-point": "^3.0.0",
        "strip-ansi": "^6.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/yargs/node_modules/strip-ansi": {
      "version": "6.0.1",
      "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-6.0.1.tgz",
      "integrity": "sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==",
      "license": "MIT",
      "dependencies": {
        "ansi-regex": "^5.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/yjs": {
      "version": "13.6.31",
      "resolved": "https://registry.npmjs.org/yjs/-/yjs-13.6.31.tgz",
      "integrity": "sha512-Eq+5BRfbeGyqGVrTJL3bEcr8gKkxPuyuoHmAwpk52fDb8kOVMrfVSTRPd6yiGgX5Fskb96qCRjzjbRjrL4YEnw==",
      "license": "MIT",
      "dependencies": {
        "lib0": "^0.2.99"
      },
      "engines": {
        "node": ">=16.0.0",
        "npm": ">=8.0.0"
      },
      "funding": {
        "type": "GitHub Sponsors ❤",
        "url": "https://github.com/sponsors/dmonad"
      }
    },
    "node_modules/yocto-queue": {
      "version": "0.1.0",
      "resolved": "https://registry.npmjs.org/yocto-queue/-/yocto-queue-0.1.0.tgz",
      "integrity": "sha512-rVksvsnNCdJ/ohGc6xgPwyN8eheCxsiLM8mxuE/t/mOVqJewPuO1miLpTHQiRgTKCLexL4MeAFVagts7HmNZ2Q==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/zod": {
      "version": "3.25.76",
      "resolved": "https://registry.npmjs.org/zod/-/zod-3.25.76.tgz",
      "integrity": "sha512-gzUt/qt81nXsFGKIFcC3YnfEAx5NkunCfnDlvuBSSFS02bcXu4Lmea0AFIUwbLWxWPx3d9p8S5QoaujKcNQxcQ==",
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/colinhacks"
      }
    }
  }
}
```

---

### File: `package.json`

```json
{
  "name": "local-echo",
  "private": true,
  "version": "0.2.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@radix-ui/react-accordion": "^1.2.11",
    "@radix-ui/react-alert-dialog": "^1.1.14",
    "@radix-ui/react-aspect-ratio": "^1.1.7",
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-checkbox": "^1.3.2",
    "@radix-ui/react-collapsible": "^1.1.11",
    "@radix-ui/react-context-menu": "^2.2.15",
    "@radix-ui/react-dialog": "^1.1.14",
    "@radix-ui/react-dropdown-menu": "^2.1.15",
    "@radix-ui/react-hover-card": "^1.1.14",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-menubar": "^1.1.15",
    "@radix-ui/react-navigation-menu": "^1.2.13",
    "@radix-ui/react-popover": "^1.1.14",
    "@radix-ui/react-progress": "^1.1.7",
    "@radix-ui/react-radio-group": "^1.3.7",
    "@radix-ui/react-scroll-area": "^1.2.9",
    "@radix-ui/react-select": "^2.2.5",
    "@radix-ui/react-separator": "^1.1.7",
    "@radix-ui/react-slider": "^1.3.5",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-switch": "^1.2.5",
    "@radix-ui/react-tabs": "^1.1.12",
    "@radix-ui/react-toast": "^1.2.14",
    "@radix-ui/react-toggle": "^1.1.9",
    "@radix-ui/react-toggle-group": "^1.1.10",
    "@radix-ui/react-tooltip": "^1.2.7",
    "@tanstack/react-query": "^5.83.0",
    "@tanstack/react-virtual": "^3.13.25",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^3.6.0",
    "embla-carousel-react": "^8.6.0",
    "input-otp": "^1.4.2",
    "jsqr": "^1.4.0",
    "lucide-react": "^0.462.0",
    "next-themes": "^0.3.0",
    "peerjs": "^1.5.5",
    "qrcode": "^1.5.4",
    "react": "^18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-helmet-async": "^2.0.5",
    "react-hook-form": "^7.61.1",
    "react-resizable-panels": "^2.1.9",
    "react-router-dom": "^6.30.1",
    "recharts": "^2.15.4",
    "sonner": "^1.7.4",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^0.9.9",
    "y-indexeddb": "^9.0.12",
    "yjs": "^13.6.31",
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "@eslint/js": "^9.32.0",
    "@playwright/test": "^1.61.0",
    "@tailwindcss/typography": "^0.5.16",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@testing-library/user-event": "^14.6.1",
    "@types/node": "^22.16.5",
    "@types/qrcode": "^1.5.6",
    "@types/react": "^18.3.23",
    "@types/react-dom": "^18.3.7",
    "@vitejs/plugin-react-swc": "^3.11.0",
    "@vitest/ui": "^4.1.9",
    "autoprefixer": "^10.4.21",
    "eslint": "^9.32.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "fake-indexeddb": "^6.2.5",
    "globals": "^15.15.0",
    "happy-dom": "^20.10.3",
    "jsdom": "^29.1.1",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.8.3",
    "typescript-eslint": "^8.38.0",
    "vite": "^5.4.19",
    "vitest": "^4.1.9"
  }
}
```

---

### File: `postcss.config.js`

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

---

### File: `README.md`

````md
# Local Echo

Local Echo is a private, local-first community chat app built on peer-to-peer WebRTC connections. It gives small groups encrypted rooms, direct messages, signed invites, local persistence, and server management without a central message server.

## 🧠 Design Philosophy

This application operates without any centralized cloud infrastructure:

- **No permanent backend servers** — No Firebase, AWS, Supabase, or hosted infrastructure
- **No external running costs** — The networking lives inside the app
- **Ephemeral by design** — When all users leave, the network disappears
- **Privacy-first** — No analytics, no telemetry, no cloud persistence

## 🔍 Why True Cloudless Systems Have Limits

Building a truly cloudless communication system involves fundamental trade-offs:

### The Bootstrap Problem
Without a central server, peers need a way to discover each other. Solutions include:
- **Manual invite codes** — Users share connection information out-of-band
- **QR codes** — Visual exchange of connection data
- **Local network discovery** — mDNS/Bonjour for LAN peers

### NAT Traversal Challenges
Most home networks use NAT, making direct connections difficult:
- **STUN servers** — Help peers discover their public IP (we use Google's public STUN)
- **TURN servers** — Relay traffic when direct connection fails (configurable via `VITE_ICE_SERVERS` env var)
- **Hole punching** — WebRTC handles this automatically when possible

### Consistency vs Availability
In a P2P system, you can't have both perfect consistency and high availability:
- We chose **eventual consistency** with host-authoritative ordering
- Messages may arrive out of order but are sorted by sequence number
- Host migration ensures continuity when the original host disconnects

## 🧬 Networking Architecture

### Transport Selection Logic

The system attempts transports in priority order:

| Priority | Transport | Use Case | Browser Support |
|----------|-----------|----------|-----------------|
| 1 | Wi-Fi Direct | Offline, fastest | ❌ Requires native |
| 2 | LAN TCP + mDNS | Same network | ❌ Requires native |
| 3 | WebRTC DataChannels | Internet fallback | ✅ Full support |
| 4 | BLE | Discovery only | ⚠️ Limited |

**Current Implementation:** WebRTC DataChannels (browser-compatible)

### Why WebRTC?

WebRTC is the only browser-native API that supports:
- Direct peer-to-peer connections
- NAT traversal (via ICE/STUN)
- Encrypted data channels
- No server required after signaling

### Trade-offs of Each Method

#### WebRTC DataChannels (Implemented)
- ✅ Works in browsers
- ✅ E2E encrypted by default
- ✅ Handles NAT traversal
- ⚠️ Requires initial signaling (solved via invite codes)
- ⚠️ May fail without TURN relay for complex NAT

#### Wi-Fi Direct (Future/Native)
- ✅ Zero internet required
- ✅ Fastest local speeds
- ❌ Requires native app (Tauri/Electron)
- ❌ Platform-specific APIs

#### LAN TCP + mDNS (Future/Native)
- ✅ Fast local communication
- ✅ Works without internet
- ❌ Same network only
- ❌ Requires native socket access

## 🏗️ Architecture

### Star Topology with Host Migration

```
     ┌──────────┐
     │   HOST   │ ◄── Authoritative source of truth
     └────┬─────┘
          │
    ┌─────┼─────┐
    │     │     │
    ▼     ▼     ▼
 ┌────┐┌────┐┌────┐
 │Peer││Peer││Peer│
 └────┘└────┘└────┘
```

**Host Responsibilities:**
- Message ordering (assigns sequence numbers)
- Presence management
- Broadcasting to all peers
- State synchronization for new joiners

**Host Migration:**
When the host disconnects:
1. Remaining peers detect disconnection
2. Deterministic election (lowest peer ID wins)
3. New host assumes responsibilities
4. Peers reconnect automatically
5. No message loss (messages buffered locally)

### Message Flow

```
1. Peer sends message to Host
2. Host assigns global sequence number
3. Host broadcasts to all peers
4. Peers render messages in order
```

### Message Schema

```typescript
{
  id: string;          // Unique message ID
  serverId: string;    // Server context
  channelId: string;   // Channel context  
  author: PeerId;      // Sender info
  content: string;     // Message content
  seq: number;         // Global sequence for ordering
  timestamp: number;   // Unix timestamp
  encrypted?: boolean; // E2E encryption flag
}
```

## 💬 Direct Messages (DMs)

### DM Routing Logic

DMs are private 1-to-1 conversations that exist outside of servers. The routing prioritizes direct connections:

```
Priority 1: Direct P2P Connection
┌────────┐                      ┌────────┐
│ User A │ ◄──── WebRTC ────► │ User B │
└────────┘    DataChannel       └────────┘

Priority 2: Host-Assisted Relay (Fallback)
┌────────┐        ┌──────┐        ┌────────┐
│ User A │ ──► │ HOST │ ──► │ User B │
└────────┘   encrypted   └──────┘   encrypted   └────────┘
              blob                    blob
```

### Why Direct Channels Are Preferred

1. **Lower Latency** — No intermediate hop through the host
2. **Reduced Host Load** — Host doesn't process DM traffic
3. **Better Privacy** — Host never sees encrypted payload
4. **Resilience** — DMs work even if host goes offline

### DM Connection Flow

1. User A opens DM with User B
2. System checks for existing direct channel
3. If none exists:
   - Create new WebRTC peer connection
   - Exchange SDP via existing server connection (signaling)
   - Establish dedicated DM data channel
4. Messages flow directly between peers

### Security Guarantees

- **End-to-End Encryption** — Using ECDH key exchange + AES-256-GCM
- **Per-DM Session Keys** — Each conversation has unique keys
- **Host Cannot Decrypt** — Relay payloads are encrypted blobs
- **No Persistence** — DMs only exist in memory

### Fallback Relay Behavior

When direct connection fails (complex NAT, firewall):
1. System detects connection failure
2. Falls back to relay through server host
3. Messages are encrypted before relay
4. Host treats payload as opaque bytes
5. UI shows "Relayed" indicator

### DM Message Schema

```typescript
{
  id: string;          // Unique message ID
  type: 'DM';          // Message type
  from: PeerId;        // Sender info
  to: PeerId;          // Recipient info
  content: string;     // Message content
  timestamp: number;   // Unix timestamp
  encrypted?: boolean; // Always true for DMs
  read?: boolean;      // Read receipt
}
```

## 🔐 Security Model

- **Key Generation:** ECDH P-256 curve for key exchange
- **Encryption:** AES-256-GCM for message encryption
- **No Key Escrow:** Keys never leave the device
- **Forward Secrecy:** New keys for each session
- **Transport Security:** WebRTC DTLS encryption

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** React Context + Custom hooks
- **Networking:** WebRTC DataChannels + MediaStream (voice)
- **Crypto:** Web Crypto API (ECDH, AES-256-GCM)
- **Collaboration:** Yjs + y-indexeddb for CRDT-based state sync
- **Build:** Vite

## ✨ Features (v0.2.0)

### Recent Additions

- **Voice Channels** — WebRTC audio chat via `getUserMedia` and PeerJS calls. Mute/unmute toggle. Active state shown in UI.
- **Configurable ICE Servers** — Set `VITE_ICE_SERVERS` environment variable as a JSON array of `RTCIceServer` objects to configure TURN/STUN.
- **Offline DM Queue** — Outbound direct messages are queued when the peer is unreachable and automatically delivered when they reconnect.
- **User-Facing Errors** — Error events emit sonner toast notifications for connection failures, reconnection limits, and host migration.
- **Permission Enforcement** — Membership and permission checks before sending messages or generating invites. Extensible permission model via `CommunityConfig.roles` and `permissionOverwrites`.
- **Unit Tests** — 14 tests for network utility functions, permission checks, DM queue, and state management.

## 🎯 Best Possible Compromise

This design represents the optimal balance for a browser-based cloudless chat:

1. **Fully functional in browsers** — No native app required for basic use
2. **True P2P** — Messages flow directly between peers after connection
3. **E2E Encrypted** — Using standard Web Crypto APIs
4. **Zero infrastructure cost** — STUN servers are free and stateless
5. **Graceful degradation** — Works on LAN even if internet fails mid-session
6. **Host migration** — No single point of failure after initial connection
7. **Private DMs** — Direct peer connections bypass the host when possible

### What We Sacrificed

- **Offline messaging** — Peers must be online simultaneously (DMs queue for delivery when peer reconnects)
- **Persistence** — Messages persist locally via IndexedDB and Yjs
- **Large scale** — Star topology limits to ~50 peers practically
- **Group DMs** — Currently limited to 1-to-1

## 🚀 Future Enhancements

- [ ] Wi-Fi Direct for true offline (requires native app)
- [ ] mDNS discovery for automatic LAN detection
- [ ] BLE beacons for peer presence
- [ ] Group DMs with multi-party encryption
- [ ] End-to-end encrypted voice channels
- [ ] File sharing through data channels

## 📝 License

MIT — Use freely, contribute openly.
````

---

### File: `repo_dump.md`

```md

```

---

### File: `repo_scanner.py`

````py
#!/usr/bin/env python3
"""
Repository Dump Generator - Word, PDF & Markdown Export
----------------------------------------------
Recursively scans a repository and creates a formatted document containing:
- Complete folder structure (tree format)
- Full content of all text-based files
- Excludes binary and media files
- Outputs to Word (.docx), PDF (.pdf), or Markdown (.md) format

Requirements:
    pip install python-docx reportlab

Author: Python Repository Scanner
Compatible with: Windows, macOS, Linux
Python Version: 3.6+
"""

import os
import re
from pathlib import Path
from typing import List, Set
from docx import Document
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    PageBreak,
    Preformatted,
)
from reportlab.lib.enums import TA_LEFT

# Configuration: Text file extensions to include
TEXT_EXTENSIONS = {
    ".py",
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".html",
    ".css",
    ".scss",
    ".sass",
    ".json",
    ".xml",
    ".txt",
    ".md",
    ".markdown",
    ".rst",
    ".c",
    ".cpp",
    ".h",
    ".hpp",
    ".java",
    ".go",
    ".rs",
    ".php",
    ".rb",
    ".sh",
    ".bash",
    ".sql",
    ".r",
    ".m",
    ".swift",
    ".kt",
    ".scala",
    ".vue",
    ".svelte",
    ".conf",
    ".config",
    ".ini",
    ".toml",
    ".env",
    ".log",
    ".csv",
    ".tsv",
    ".gitignore",
    ".dockerignore",
    "Dockerfile",
    "Makefile",
    ".editorconfig",
    "requirements.txt",
    "package.json",
}

# Configuration: Binary/media extensions to exclude
BINARY_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".bmp",
    ".ico",
    ".svg",
    ".webp",
    ".mp4",
    ".avi",
    ".mov",
    ".mkv",
    ".mp3",
    ".wav",
    ".flac",
    ".zip",
    ".tar",
    ".gz",
    ".rar",
    ".7z",
    ".bz2",
    ".exe",
    ".dll",
    ".so",
    ".dylib",
    ".bin",
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".pyc",
    ".pyo",
    ".class",
    ".o",
    ".obj",
    ".db",
    ".sqlite",
    ".sqlite3",
}

# Configuration: Directories to skip
SKIP_DIRECTORIES = {
    ".git",
    ".svn",
    ".hg",
    "__pycache__",
    "node_modules",
    ".venv",
    "venv",
    "env",
    ".env",
    "virtualenv",
    ".idea",
    ".vscode",
    ".vs",
    ".pytest_cache",
    ".mypy_cache",
    "dist",
    "build",
    ".eggs",
    "*.egg-info",
    "target",
}

# Tree structure characters
TREE_BRANCH = "├── "
TREE_LAST = "└── "
TREE_VERTICAL = "│   "
TREE_SPACE = "    "


def sanitize_text_for_xml(text: str) -> str:
    """
    Remove NULL bytes and control characters that aren't XML-compatible.
    Keeps only valid XML characters: tab, newline, carriage return, and printable characters.
    """
    text = text.replace("\x00", "")

    def is_valid_xml_char(char):
        codepoint = ord(char)
        return (
            codepoint == 0x9  # tab
            or codepoint == 0xA  # newline
            or codepoint == 0xD  # carriage return
            or (0x20 <= codepoint <= 0xD7FF)
            or (0xE000 <= codepoint <= 0xFFFD)
            or (0x10000 <= codepoint <= 0x10FFFF)
        )

    return "".join(char for char in text if is_valid_xml_char(char))


def should_include_file(file_path: Path) -> bool:
    """Determine if a file should be included in the dump."""
    ext = file_path.suffix.lower()
    name = file_path.name.lower()

    if ext in BINARY_EXTENSIONS:
        return False

    if ext in TEXT_EXTENSIONS:
        return True

    if not ext and name in {"makefile", "dockerfile", "readme", "license", "changelog"}:
        return True

    try:
        if file_path.stat().st_size > 10 * 1024 * 1024:
            return False
    except OSError:
        return False

    return False


def should_skip_directory(dir_name: str) -> bool:
    """Check if a directory should be skipped."""
    return dir_name in SKIP_DIRECTORIES or dir_name.startswith(".")


def generate_tree_structure(
    root_path: Path,
    prefix: str = "",
    is_last: bool = True,
    output_lines: List[str] = None,
) -> List[str]:
    """Generate a tree structure of the directory."""
    if output_lines is None:
        output_lines = []

    try:
        items = sorted(
            root_path.iterdir(), key=lambda x: (not x.is_dir(), x.name.lower())
        )
        items = [
            item
            for item in items
            if not (item.is_dir() and should_skip_directory(item.name))
        ]

        for index, item in enumerate(items):
            is_last_item = index == len(items) - 1
            connector = TREE_LAST if is_last_item else TREE_BRANCH

            if item.is_dir():
                output_lines.append(f"{prefix}{connector}{item.name}/")
            else:
                output_lines.append(f"{prefix}{connector}{item.name}")

            if item.is_dir():
                extension = TREE_SPACE if is_last_item else TREE_VERTICAL
                generate_tree_structure(
                    item, prefix + extension, is_last_item, output_lines
                )

    except PermissionError:
        output_lines.append(f"{prefix}[Permission Denied]")
    except Exception as e:
        output_lines.append(f"{prefix}[Error: {str(e)}]")

    return output_lines


def read_file_content(file_path: Path) -> str:
    """Read file content with proper encoding handling."""
    encodings = ["utf-8", "utf-8-sig", "latin-1", "cp1252", "iso-8859-1"]

    for encoding in encodings:
        try:
            with open(file_path, "r", encoding=encoding, errors="strict") as f:
                content = f.read()
                return sanitize_text_for_xml(content)
        except UnicodeDecodeError:
            continue
        except Exception as e:
            return f"[Error reading file: {str(e)}]"

    return "[Error: Unable to decode file with supported encodings]"


def collect_file_contents(root_path: Path, base_path: Path = None) -> List[tuple]:
    """Recursively collect all file contents from the repository."""
    if base_path is None:
        base_path = root_path

    file_contents = []

    try:
        for item in sorted(
            root_path.iterdir(), key=lambda x: (not x.is_dir(), x.name.lower())
        ):
            if item.is_dir() and should_skip_directory(item.name):
                continue

            if item.is_file():
                if should_include_file(item):
                    relative_path = item.relative_to(base_path)
                    content = read_file_content(item)
                    file_contents.append((str(relative_path), content))

            elif item.is_dir():
                file_contents.extend(collect_file_contents(item, base_path))

    except PermissionError:
        pass
    except Exception:
        pass

    return file_contents


def generate_word_document(output_file: str = "repo_dump.docx"):
    """Generate repository dump as a Word document."""
    print("🔍 Starting repository scan for Word document...")

    current_dir = Path.cwd()
    doc = Document()

    style = doc.styles["Normal"]
    style.font.name = "Courier New"
    style.font.size = Pt(9)

    title = doc.add_heading("Repository Dump", 0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.add_paragraph(f"Root Directory: {current_dir}")
    doc.add_paragraph("=" * 60)
    doc.add_paragraph()

    print("📁 Generating directory tree...")
    doc.add_heading("Directory Structure", 1)
    doc.add_paragraph(f"{current_dir.name}/")

    tree_lines = generate_tree_structure(current_dir)
    tree_text = "\n".join(tree_lines)
    tree_text = sanitize_text_for_xml(tree_text)
    p = doc.add_paragraph(tree_text)
    p.style.font.name = "Courier New"
    p.style.font.size = Pt(8)

    doc.add_page_break()

    print("📄 Collecting file contents...")
    file_contents = collect_file_contents(current_dir)

    doc.add_heading(f"File Contents ({len(file_contents)} files)", 1)

    for index, (relative_path, content) in enumerate(file_contents, 1):
        print(f"   Processing: {relative_path}")

        doc.add_paragraph("─" * 60)
        file_heading = doc.add_paragraph(f"File: {relative_path}")
        file_heading.runs[0].bold = True
        file_heading.runs[0].font.color.rgb = RGBColor(0, 0, 128)
        doc.add_paragraph("─" * 60)

        content_para = doc.add_paragraph(content)
        content_para.style.font.name = "Courier New"
        content_para.style.font.size = Pt(8)
        doc.add_paragraph()

        if index % 3 == 0:
            doc.add_page_break()

    doc.add_paragraph("=" * 60)
    doc.add_paragraph(f"Total files processed: {len(file_contents)}")
    doc.save(output_file)

    print(f"\n✅ Word document completed!")
    print(f"📦 Output saved to: {output_file}")
    print(f"📊 Total files processed: {len(file_contents)}")


def generate_pdf_document(output_file: str = "repo_dump.pdf"):
    """Generate repository dump as a PDF document."""
    print("🔍 Starting repository scan for PDF document...")

    current_dir = Path.cwd()
    doc = SimpleDocTemplate(
        output_file,
        pagesize=letter,
        rightMargin=0.5 * inch,
        leftMargin=0.5 * inch,
        topMargin=0.5 * inch,
        bottomMargin=0.5 * inch,
    )

    elements = []
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="Code", fontName="Courier", fontSize=7, leading=9))
    styles.add(
        ParagraphStyle(
            name="FileHeader",
            fontName="Courier-Bold",
            fontSize=9,
            textColor="navy",
            leading=11,
        )
    )

    title_style = styles["Heading1"]
    title_style.alignment = TA_LEFT
    elements.append(Paragraph("Repository Dump", title_style))
    elements.append(Spacer(1, 12))

    elements.append(Paragraph(f"Root Directory: {current_dir}", styles["Normal"]))
    elements.append(Paragraph("=" * 100, styles["Code"]))
    elements.append(Spacer(1, 12))

    print("📁 Generating directory tree...")
    elements.append(Paragraph("Directory Structure", styles["Heading2"]))
    elements.append(Spacer(1, 6))

    tree_lines = generate_tree_structure(current_dir)
    tree_text = f"{current_dir.name}/\n" + "\n".join(tree_lines)

    elements.append(Preformatted(tree_text, styles["Code"]))
    elements.append(PageBreak())

    print("📄 Collecting file contents...")
    file_contents = collect_file_contents(current_dir)

    elements.append(
        Paragraph(f"File Contents ({len(file_contents)} files)", styles["Heading2"])
    )
    elements.append(Spacer(1, 12))

    for index, (relative_path, content) in enumerate(file_contents, 1):
        print(f"   Processing: {relative_path}")

        elements.append(Paragraph("─" * 100, styles["Code"]))
        elements.append(Paragraph(f"File: {relative_path}", styles["FileHeader"]))
        elements.append(Paragraph("─" * 100, styles["Code"]))
        elements.append(Spacer(1, 6))

        content_escaped = (
            content.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        )
        elements.append(Preformatted(content_escaped, styles["Code"]))
        elements.append(Spacer(1, 12))

        if index % 2 == 0:
            elements.append(PageBreak())

    elements.append(Paragraph("=" * 100, styles["Code"]))
    elements.append(
        Paragraph(f"Total files processed: {len(file_contents)}", styles["Normal"])
    )
    doc.build(elements)

    print(f"\n✅ PDF document completed!")
    print(f"📦 Output saved to: {output_file}")
    print(f"📊 Total files processed: {len(file_contents)}")


def generate_markdown_document(output_file: str = "repo_dump.md"):
    """Generate repository dump as a Markdown document."""
    print("🔍 Starting repository scan for Markdown document...")

    current_dir = Path.cwd()

    # Helper function to prevent backtick collisions
    def get_fence(text: str) -> str:
        """Finds the longest sequence of backticks in the text and returns a fence that is 1 backtick longer (minimum 3)."""
        max_backticks = 0
        current_backticks = 0
        for char in text:
            if char == "`":
                current_backticks += 1
                max_backticks = max(max_backticks, current_backticks)
            else:
                current_backticks = 0

        fence_length = max(3, max_backticks + 1)
        return "`" * fence_length

    with open(output_file, "w", encoding="utf-8") as md_file:
        # Title & Metadata
        md_file.write("# Repository Dump\n\n")
        md_file.write(f"**Root Directory:** `{current_dir}`\n\n")
        md_file.write("---\n\n")

        # Directory structure
        print("📁 Generating directory tree...")
        md_file.write("## Directory Structure\n\n")
        md_file.write("```text\n")
        md_file.write(f"{current_dir.name}/\n")

        tree_lines = generate_tree_structure(current_dir)
        md_file.write("\n".join(tree_lines))
        md_file.write("\n```\n\n")

        # File contents
        print("📄 Collecting file contents...")
        file_contents = collect_file_contents(current_dir)

        md_file.write(f"## File Contents ({len(file_contents)} files)\n\n")

        for index, (relative_path, content) in enumerate(file_contents, 1):
            print(f"   Processing: {relative_path}")

            md_file.write("---\n\n")
            md_file.write(f"### File: `{relative_path}`\n\n")

            # Determine syntax highlighting based on file extension
            ext = Path(relative_path).suffix.lower().lstrip(".")
            if not ext:
                ext = "text"

            # Get a safe fence for this specific file's content
            fence = get_fence(content)

            md_file.write(f"{fence}{ext}\n")
            md_file.write(content)

            # Ensure the code block closes cleanly on a new line
            if not content.endswith("\n"):
                md_file.write("\n")

            md_file.write(f"{fence}\n\n")

        # Footer
        md_file.write("---\n\n")
        md_file.write(f"**Total files processed:** {len(file_contents)}\n")

    print(f"\n✅ Markdown document completed!")
    print(f"📦 Output saved to: {output_file}")
    print(f"📊 Total files processed: {len(file_contents)}")


if __name__ == "__main__":
    try:
        print("Select output format:")
        print("1. Word Document (.docx)")
        print("2. PDF Document (.pdf)")
        print("3. Markdown Document (.md)")
        print("4. All Formats")

        choice = input("\nEnter your choice (1/2/3/4): ").strip()

        if choice == "1":
            generate_word_document()
        elif choice == "2":
            generate_pdf_document()
        elif choice == "3":
            generate_markdown_document()
        elif choice == "4":
            generate_word_document()
            print("\n" + "─" * 60 + "\n")
            generate_pdf_document()
            print("\n" + "─" * 60 + "\n")
            generate_markdown_document()
        else:
            print("Invalid choice. Please run again and select 1, 2, 3, or 4.")

    except KeyboardInterrupt:
        print("\n\n⚠️  Operation cancelled by user.")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        raise
````

---

### File: `tailwind.config.ts`

```ts
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        channel: {
          hover: "hsl(var(--channel-hover))",
        },
        message: {
          hover: "hsl(var(--message-hover))",
        },
        status: {
          online: "hsl(var(--online))",
          idle: "hsl(var(--idle))",
          offline: "hsl(var(--offline))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "shimmer": "shimmer 2s linear infinite",
        "float": "float 3s ease-in-out infinite",
      },
      boxShadow: {
        'glow': '0 0 20px hsl(var(--primary) / 0.3)',
        'glow-lg': '0 0 40px hsl(var(--primary) / 0.4)',
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
```

---

### File: `tsconfig.app.json`

```json
{
  "compilerOptions": {
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "lib": [
      "ES2020",
      "DOM",
      "DOM.Iterable"
    ],
    "module": "ESNext",
    "moduleDetection": "force",
    "moduleResolution": "bundler",
    "noEmit": true,
    "noFallthroughCasesInSwitch": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "paths": {
      "@/*": [
        "./src/*"
      ]
    },
    "skipLibCheck": true,
    "strict": true,
    "target": "ES2020",
    "useDefineForClassFields": true
  },
  "include": [
    "src"
  ]
}
```

---

### File: `tsconfig.json`

```json
{
  "compilerOptions": {
    "allowJs": true,
    "noImplicitAny": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "paths": {
      "@/*": [
        "./src/*"
      ]
    },
    "skipLibCheck": true,
    "strictNullChecks": false
  },
  "files": [],
  "references": [
    {
      "path": "./tsconfig.app.json"
    },
    {
      "path": "./tsconfig.node.json"
    }
  ]
}
```

---

### File: `tsconfig.node.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
```

---

### File: `vite.config.ts`

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
```

---

### File: `vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/components/ui/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
    },
  },
});
```

---

**Total files processed:** 106
