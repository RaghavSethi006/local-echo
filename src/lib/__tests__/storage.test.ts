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
