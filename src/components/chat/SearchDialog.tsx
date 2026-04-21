import { useEffect, useMemo, useState } from 'react';
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
import { Hash, MessageCircle, Search, Loader2 } from 'lucide-react';
import * as Storage from '@/lib/storage';

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
  const { servers, dmConversations, localPeer, selectServer, selectChannel, openDM } = useP2P();
  const [query, setQuery] = useState('');
  const [allChannelMsgs, setAllChannelMsgs] = useState<any[]>([]);
  const [allDMMsgs, setAllDMMsgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load all messages from local storage when dialog opens (covers offline channels too)
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([Storage.loadAllMessages(), Storage.loadAllDMMessages()])
      .then(([channelMsgs, dmMsgs]) => {
        if (cancelled) return;
        setAllChannelMsgs(channelMsgs);
        setAllDMMsgs(dmMsgs);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [open]);

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
          {loading && (
            <div className="flex items-center justify-center py-8 text-muted-foreground text-sm gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          )}

          {!loading && query && hits.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">No messages match "{query}"</p>
            </div>
          )}

          {!loading && !query && (
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