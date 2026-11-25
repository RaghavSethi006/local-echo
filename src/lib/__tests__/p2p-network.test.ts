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
    on: vi.fn((event: string, cb: (arg?: unknown) => void) => {
      if (event === 'open') {
        queueMicrotask(() => cb('local-peer-id'));
      }
    }),
    destroy: vi.fn(),
    reconnect: vi.fn(),
  };
  return {
    default: vi.fn(function () {
      return mockPeer;
    }),
  };
});

const mockStorage = vi.hoisted(() => ({
  setStorageKey: vi.fn(),
  saveIdentity: vi.fn(),
  loadIdentity: vi.fn(() => Promise.resolve(null)),
  saveServer: vi.fn(),
  loadServers: vi.fn(() => Promise.resolve([] as Array<Record<string, unknown>>)),
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

vi.mock('@/lib/storage', () => mockStorage);

const mockDoc = {
  getText: vi.fn(() => ({ insert: vi.fn(), toJSON: vi.fn(() => '[]') })),
  on: vi.fn(),
};
const mockAddChannelMessage = vi.fn();
const mockGetOrCreateChannelDoc = vi.fn(() => Promise.resolve(mockDoc));

vi.mock('@/lib/yjs-manager', () => {
  const MockYjsManager = vi.fn(function () {
    return {
      getOrCreateChannelDoc: mockGetOrCreateChannelDoc,
      getOrCreateDMDoc: vi.fn(() => Promise.resolve(mockDoc)),
      getChannelMessages: vi.fn(() => []),
      getDMMessages: vi.fn(() => []),
      addChannelMessage: mockAddChannelMessage,
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

import { P2PNetwork, compressInvite } from '../p2p-network';
import { generateSigningKeyPair, signData } from '../crypto';
import type { Server } from '@/types/p2p';

interface P2PNetworkInternals {
  servers: Map<string, Server>;
  handleEvent: (event: unknown, fromPeerId: string) => void;
  receiveChunk: (fromPeerId: string, raw: string) => string | null;
}

describe('P2PNetwork', () => {
  let network: P2PNetwork;

  beforeEach(() => {
    vi.clearAllMocks();
    network = new P2PNetwork('testUser', 'local-peer-id');
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
      const { decompressInvite } = await import('../p2p-network');
      const original = JSON.stringify({ serverId: 'abc', name: 'Test Server' });
      const compressed = await compressInvite(original);
      expect(compressed).toBeDefined();
      expect(typeof compressed).toBe('string');
      const decompressed = await decompressInvite(compressed);
      expect(decompressed).toBe(original);
    });

    it('should produce shorter output for repetitive data', async () => {
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

  describe('createServer and sendMessage', () => {
    it('awaits getOrCreateChannelDoc before calling yjs.addChannelMessage', async () => {
      const server = await network.createServer('Engineering');
      const channelId = server.channels[0].id;

      await network.sendMessage(server.id, channelId, 'Hello team');

      expect(mockGetOrCreateChannelDoc).toHaveBeenCalledWith(server.id, channelId);
      expect(mockAddChannelMessage).toHaveBeenCalledTimes(1);
      const [passedDoc, passedMsg] = mockAddChannelMessage.mock.calls[0];
      expect(passedDoc).toBe(mockDoc);
      expect(passedMsg.content).toBe('Hello team');
      expect(passedMsg.author.id).toBe('local-peer-id');
    });
  });

  describe('security & authorization checks', () => {
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

    it('rejects invite missing signature when hostVerifyKey is present', async () => {
      const signing = await generateSigningKeyPair();
      const unsignedInvite = await compressInvite(JSON.stringify({
        payload: {
          serverId: 'srv-1',
          serverName: 'Test',
          hostPeerId: 'remote-host',
          hostUsername: 'Alice',
          hostVerifyKey: signing.verifyKeyString,
          timestamp: Date.now(),
        },
        signature: '',
      }));

      await expect(network.joinServer(unsignedInvite)).rejects.toThrow(/missing a signature/i);
    });

    it('rejects invite with tampered payload', async () => {
      const signing = await generateSigningKeyPair();
      const payload = {
        serverId: 'srv-1',
        serverName: 'Legit',
        hostPeerId: 'remote-host',
        hostUsername: 'Alice',
        hostVerifyKey: signing.verifyKeyString,
        timestamp: Date.now(),
      };
      const signature = await signData(JSON.stringify(payload), signing.signingKey);
      const tampered = await compressInvite(JSON.stringify({
        payload: { ...payload, serverName: 'Tampered' },
        signature,
      }));

      await expect(network.joinServer(tampered)).rejects.toThrow(/invalid signature/i);
    });

    it('rejects joining own peer ID', async () => {
      const invite = await compressInvite(JSON.stringify({
        payload: {
          serverId: 'srv-self',
          serverName: 'Self',
          hostPeerId: 'local-peer-id',
          hostUsername: 'testUser',
          timestamp: Date.now(),
        },
      }));
      await expect(network.joinServer(invite)).rejects.toThrow(/own peer ID/i);
    });

    it('ignores server-updated and server-deleted from non-host peer', () => {
      const internals = network as unknown as P2PNetworkInternals;
      const server: Server = {
        id: 'srv-auth',
        name: 'Original Name',
        channels: [{ id: 'general', name: 'general', type: 'text' }],
        members: [{ id: 'real-host', username: 'Host' }, { id: 'attacker', username: 'Eve' }],
        memberRoles: { 'real-host': ['owner'], attacker: ['member'] },
        hostId: 'real-host',
        createdAt: Date.now(),
      };
      internals.servers.set(server.id, server);

      internals.handleEvent(
        { type: 'server-updated', payload: { serverId: 'srv-auth', patch: { name: 'Hacked' } }, timestamp: Date.now() },
        'attacker'
      );
      expect(network.getServer('srv-auth')?.name).toBe('Original Name');

      internals.handleEvent(
        { type: 'server-deleted', payload: { serverId: 'srv-auth' }, timestamp: Date.now() },
        'attacker'
      );
      expect(network.getServer('srv-auth')).toBeDefined();
    });

    it('ignores spoofed chat messages where author.id does not match fromPeerId', () => {
      const internals = network as unknown as P2PNetworkInternals;
      const server: Server = {
        id: 'srv-chat',
        name: 'Room',
        channels: [{ id: 'general', name: 'general', type: 'text' }],
        members: [
          { id: 'real-host', username: 'Host' },
          { id: 'peer-a', username: 'Alice' },
          { id: 'peer-b', username: 'Bob' },
        ],
        memberRoles: { 'real-host': ['owner'] },
        hostId: 'real-host',
        createdAt: Date.now(),
      };
      internals.servers.set(server.id, server);

      internals.handleEvent(
        {
          type: 'message',
          payload: {
            id: 'msg-spoof',
            serverId: 'srv-chat',
            channelId: 'general',
            author: { id: 'peer-a', username: 'Alice' },
            content: 'Spoofed',
            seq: 1,
            timestamp: Date.now(),
          },
          timestamp: Date.now(),
        },
        'peer-b'
      );

      expect(network.getMessages('srv-chat', 'general')).toHaveLength(0);
    });

    it('rejects oversized or malformed chunked frames in receiveChunk', () => {
      const internals = network as unknown as P2PNetworkInternals;

      // _total > 1024 should be rejected
      const hugeTotal = JSON.stringify({ _chunkId: 'c1', _index: 0, _total: 50000, _data: 'abc' });
      expect(internals.receiveChunk('peer-x', hugeTotal)).toBeNull();

      // Out-of-bounds _index should be rejected
      const badIndex = JSON.stringify({ _chunkId: 'c2', _index: 5, _total: 2, _data: 'abc' });
      expect(internals.receiveChunk('peer-x', badIndex)).toBeNull();

      // Valid chunk assembly should work
      const part0 = JSON.stringify({ _chunkId: 'c3', _index: 0, _total: 2, _data: '{"ok":' });
      const part1 = JSON.stringify({ _chunkId: 'c3', _index: 1, _total: 2, _data: 'true}' });
      expect(internals.receiveChunk('peer-x', part0)).toBeNull();
      expect(internals.receiveChunk('peer-x', part1)).toBe('{"ok":true}');
    });

    it('restores host status and memberRoles from persisted data', async () => {
      mockStorage.loadServers.mockResolvedValueOnce([
        {
          id: 'srv-restored',
          name: 'Restored Guild',
          channels: [{ id: 'general', name: 'general', type: 'text' }],
          members: [{ id: 'local-peer-id', username: 'testUser' }],
          memberRoles: { 'local-peer-id': ['owner'] },
          hostId: 'local-peer-id',
          createdAt: 1000,
        },
      ]);

      await network.loadPersistedData();

      expect(network.getConnectionStatus()).toBe('host');
      expect(network.isServerHost('srv-restored')).toBe(true);
      expect(network.getServer('srv-restored')?.memberRoles?.['local-peer-id']).toEqual(['owner']);
    });
  });

  describe('pending DM queue & getters', () => {
    it('should start with zero pending messages', () => {
      expect(network.getPendingDMCount()).toBe(0);
      expect(network.getPendingDMCount('some-peer')).toBe(0);
    });

    it('should return empty array when no servers', () => {
      expect(network.getAvailablePeersForDM()).toEqual([]);
    });

    it('should return empty array for nonexistent channel', async () => {
      const msgs = await network.loadOlderMessages('s1', 'c1');
      expect(msgs).toEqual([]);
    });
  });

  describe('DM key verification & diagnostics', () => {
    it('computes Safety Number, verifies peer, and flags unexpected key rotation', async () => {
      const { generateKeyPair } = await import('../crypto');
      await network.initialize();
      const bobKeys1 = await generateKeyPair();
      const bobKeys2 = await generateKeyPair();

      network.getOrCreateDMConversation({
        id: 'bob-peer-id',
        username: 'Bob',
        publicKey: bobKeys1.publicKeyString,
      });

      const initialInfo = await network.getDMSafetyInfo('bob-peer-id');
      expect(initialInfo?.safetyNumber).toMatch(/^(\d{5} ){11}\d{5}$/);
      expect(initialInfo?.isVerified).toBe(false);
      expect(initialInfo?.keyChanged).toBe(false);

      await network.verifyDMPeer('bob-peer-id');
      const verifiedInfo = await network.getDMSafetyInfo('bob-peer-id');
      expect(verifiedInfo?.isVerified).toBe(true);

      // Simulate Bob advertising a different ECDH key later
      network.getOrCreateDMConversation({
        id: 'bob-peer-id',
        username: 'Bob',
        publicKey: bobKeys2.publicKeyString,
      });

      const rotatedInfo = await network.getDMSafetyInfo('bob-peer-id');
      expect(rotatedInfo?.keyChanged).toBe(true);
      expect(rotatedInfo?.isVerified).toBe(false);
      expect(rotatedInfo?.safetyNumber).not.toBe(verifiedInfo?.safetyNumber);

      await network.unverifyDMPeer('bob-peer-id');
      const unverifiedInfo = await network.getDMSafetyInfo('bob-peer-id');
      expect(unverifiedInfo?.isVerified).toBe(false);
    });

    it('reports connection diagnostics snapshot', () => {
      const diag = network.getConnectionDiagnostics();
      expect(diag).toMatchObject({
        activePeerCount: 0,
        bulkChannelCount: 0,
      });
      expect(typeof diag.signalingEndpoint).toBe('string');
    });
  });

  describe('disconnect', () => {
    it('should clean up state', async () => {
      await network.disconnect();
      expect(network.getServers()).toHaveLength(0);
      expect(network.getOnlinePeers()).toHaveLength(1);
    });
  });
});
