// IndexedDB persistence layer for cloudless P2P chat
// All data stays local — no cloud, no telemetry

const DB_NAME = 'p2p-chat-store';
const DB_VERSION = 1;

interface StoredIdentity {
  peerId: string;
  username: string;
  publicKey?: string;
  privateKey?: string; // Stored as JWK
}

interface StoredServer {
  id: string;
  name: string;
  channels: any[];
  hostId: string;
  createdAt: number;
  inviteCode?: string; // Store invite code for auto-rejoin
  lastHostPeerId?: string; // Last known host PeerJS ID
}

interface StoredMessage {
  id: string;
  serverId: string;
  channelId: string;
  author: any;
  content: string;
  seq: number;
  timestamp: number;
}

interface StoredDMConversation {
  peerId: string;
  peerUsername: string;
  peerPublicKey?: string;
  messages: any[];
  lastSeen: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

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
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
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
      msgs.sort((a, b) => a.seq - b.seq);
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

export async function saveDMMessages(messages: any[]): Promise<void> {
  if (messages.length === 0) return;
  const db = await openDB();
  const tx = db.transaction('dmMessages', 'readwrite');
  const store = tx.objectStore('dmMessages');
  messages.forEach(msg => {
    // Store with conversationPeerId — the OTHER person's ID
    const localId = msg._localPeerId; // set by caller
    const otherPeerId = msg.from?.id === localId ? msg.to?.id : msg.from?.id;
    const stored = { ...msg, peerId: otherPeerId || msg.from?.id || msg.to?.id };
    store.put(stored);
  });
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadDMMessages(peerId: string): Promise<any[]> {
  const db = await openDB();
  const tx = db.transaction('dmMessages', 'readonly');
  const index = tx.objectStore('dmMessages').index('peerId');
  const request = index.getAll(peerId);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const msgs = request.result;
      msgs.sort((a: any, b: any) => a.timestamp - b.timestamp);
      resolve(msgs);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function loadAllDMMessages(): Promise<any[]> {
  const db = await openDB();
  const tx = db.transaction('dmMessages', 'readonly');
  const request = tx.objectStore('dmMessages').getAll();
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ==================== CLEAR ALL ====================

export async function clearAllData(): Promise<void> {
  const db = await openDB();
  const stores = ['identity', 'servers', 'messages', 'dmConversations', 'dmMessages'];
  const tx = db.transaction(stores, 'readwrite');
  stores.forEach(name => tx.objectStore(name).clear());
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
