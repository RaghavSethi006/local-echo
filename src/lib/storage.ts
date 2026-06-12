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
  const req = idx.openCursor(IDBKeyRange.only([serverId, channelId]));
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
  const db = await openDB();
  const tx = db.transaction('dmMessages', 'readwrite');
  const store = tx.objectStore('dmMessages');
  for (const msg of messages) {
    const otherPeerId = msg.from.id === localPeerId ? msg.to.id : msg.from.id;
    let stored: Record<string, unknown> = { ...msg, peerId: otherPeerId };
    if (_storageKey && msg.content && !msg.encrypted) {
      stored.content = await encrypt(msg.content, _storageKey);
      stored.encrypted = true;
    }
    store.put(stored);
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
  const dbs = await indexedDB.databases();
  for (const dbMeta of dbs) {
    if (dbMeta.name && dbMeta.name.startsWith('yjs-')) {
      await indexedDB.deleteDatabase(dbMeta.name);
    }
  }
}
