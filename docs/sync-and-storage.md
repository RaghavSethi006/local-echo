# Sync & Local Storage Guide

OffGrid combines structured IndexedDB object stores (`src/lib/storage.ts`) with Yjs CRDT documents (`src/lib/yjs-manager.ts`) to support instant local startup, offline browsing of cached history, and automatic missed-message catch-up when peers reconnect.

## Storage Architecture: Two Complementary Layers

### 1. IndexedDB Store (`p2p-chat-store`, `DB_VERSION = 2`)

Managed directly in `src/lib/storage.ts`:

| Object Store | Key Path | Indexes | Contents & Notes |
| --- | --- | --- | --- |
| `identity` | `peerId` | — | Local username, `peerId`, JWK-exported ECDH & ECDSA keypairs, and `storageKeyJwk` |
| `servers` | `id` | — | Server metadata, `CommunityConfig`, `channels`, `memberRoles`, `hostId`, `inviteCode`, `lastHostPeerId` |
| `messages` | `id` | `channel` (`[serverId, channelId]`), `channel-time` (`[serverId, channelId, timestamp]`) | Legacy/paginated message index used by `loadMessagesBefore()` |
| `dmConversations` | `peerId` | — | Peer username/publicKey, `lastSeen`, `verifiedPublicKey`, `verifiedAt`, `keyChanged`, `previousPublicKey` |
| `dmMessages` | `id` | `peerId` | Fallback DM records encrypted at rest with `_storageKey` (`AES-256-GCM`) |

`PersistenceCoordinator.scheduleSave(type)` batches `'identity'`, `'servers'`, and `'dms'` writes behind a `300 ms` debounce timer and flushes them in `flushSaves()` on disconnect or `pagehide`/`beforeunload`.

### 2. Yjs CRDT Documents (`y-indexeddb`)

Managed by `YjsManager` in `src/lib/yjs-manager.ts`:

- **Channel documents**: Keyed as `channel:${serverId}:${channelId}` (`channelDocKey`).
- **DM documents**: Keyed symmetrically as `dm:${sortedPeerA}:${sortedPeerB}` (`dmDocKey`) so both peers address the identical logical document.
- Each `Y.Doc` holds a `Y.Array('messages')` of `Y.Map` entries backed automatically by `IndexeddbPersistence(key, doc)`.
- `getOrCreateChannelDoc()` and `getOrCreateDMDoc()` always await `provider.whenSynced` before returning, ensuring local IndexedDB state is loaded into the `Y.Doc` prior to sending or diffing state vectors.

## Two-Phase Join & Reconnection Sync Flow

When a member joins a server (`joinServer`) or restores an existing session (`loadPersistedData` → `reconnectRemoteServers`), OffGrid executes two coordinated sync phases:

### Phase 1: Community Metadata Bootstrap (`sync-request` → `sync-response` / `config-sync`)

1. Member connects `rt` and `bulk` DataChannels to `hostId`.
2. Member sends `{ type: 'sync-request', payload: { peerInfo } }` over `rt`.
3. Host (`CommunityManager.handleSyncRequest`) updates member identity/presence, then sends `sync-response` (core `servers`, `onlinePeers`) and `config-sync` (`CommunityConfig` with roles/overwrites/branding) over the **`bulk`** channel (falling back to `rt` if `bulk` is unavailable).
4. Host also initializes each channel's `Y.Doc` (`await getOrCreateChannelDoc(...)`) and pushes `yjs-sync` step 1 toward the joining peer.

### Phase 2: Yjs CRDT State-Vector Catch-Up (`yjs-sync-step1` / `yjs-sync-step2` / `yjs-update`)

1. Upon `handleSyncResponse`, the joining peer awaits `getOrCreateChannelDoc(server.id, ch.id)` for each channel and emits `sendSyncStep1(channelKey, server.hostId)` containing its compact encoded state vector (`Y.encodeStateVector(doc)`).
2. The receiving peer (`YjsManager.handleSyncMessage` case `'yjs-sync-step1'`) computes the exact missing delta via `Y.encodeStateAsUpdate(doc, remoteSV)`.
   - Empty diffs in Yjs encode as 2 zero bytes (`[0, 0]`); `YjsManager` only replies with `yjs-sync-step2` when `update.byteLength > 2` and throttles reverse `yjs-sync-step1` replies per `(channelKey, peerId)` with a 5-second cooldown (`_lastStep1SentAt`) so two synced peers never enter a step1/step2 loop.
3. Missing updates are routed back directly to `fromPeerId` (`PersistenceCoordinator.handleYjsSyncOutgoing`), applied with origin `'remote'`, and broadcast to `syncCacheFromYjs` / `syncCacheFromYjsDM`.
4. While connected, new messages are added inside `doc.transact(..., 'local')`, triggering `doc.on('update')` (`origin === 'local'`) to emit `yjs-update` frames immediately over `rt` without resending full history.

## DM Yjs Sync & Decryption Path

- Outbound DMs write the **ciphertext** `wireDm` (`encrypted: true`) into the `dm:${a}:${b}` `Y.Doc` while appending plaintext `localDm` to the in-memory conversation for instant rendering.
- When `syncCacheFromYjsDM` or `loadPersistedData` reads `Y.Doc` DM entries with `dm.encrypted === true`, `PersistenceCoordinator` derives or looks up the peer's ECDH shared key (`getOrDeriveSharedKey`) and decrypts entries for display in `DMConversation`.

## Hydration Order & Pagination

- During session resume (`PersistenceCoordinator.loadPersistedData`), local `Y.Doc` channel histories are hydrated into `community.messages` **before** calling `reconnectRemoteServers()`. This ensures the Yjs state vector reflects already-cached messages before contacting the host, avoiding redundant re-downloads and preventing reconnect failures from delaying offline history display.
- In `MessageArea`, scrolling near the top of the virtualized list invokes `loadOlderMessages()`, which queries `Storage.loadMessagesBefore(serverId, channelId, oldestTs, 50)` using the `channel-time` compound index and prepends deduplicated older messages (`P2PContext` preserves existing in-memory messages when pagination returns `[]`).

## Sign Out & Cleanup

Calling `disconnect()` via **Settings → Sign Out & Clear Data** invokes `Storage.clearAllData()`, clearing all five object stores in `p2p-chat-store` and deleting `yjs-*` IndexedDB databases via `indexedDB.databases()`.
