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
