import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import type { Message, DirectMessage, PeerId } from '@/types/p2p';

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
        seq: 0,
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
