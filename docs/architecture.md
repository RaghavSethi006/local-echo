# Architecture Guide

OffGrid is a browser-native, local-first community chat application built on PeerJS/WebRTC without a centralized backend database or application server. After initial WebRTC signaling, all community chat, direct messages, voice audio, and CRDT state synchronization run directly between browsers.

## Subsystem Overview

`src/lib/p2p-network.ts` exposes the `P2PNetwork` facade used by React (`src/contexts/P2PContext.tsx`), delegating work to five focused modules under `src/lib/p2p/`:

| Module | Responsibility |
| --- | --- |
| `src/lib/p2p/transport.ts` (`P2PTransport`) | PeerJS lifecycle, `rt` / `bulk` DataChannel management, 12 KB chunking (`CHUNK_SIZE = 12_000`), SCTP buffer backpressure (`drainFrames`), 15s/45s heartbeats, signaling exponential backoff, runtime `reconfigure()`, and wake-up auto-reconnect |
| `src/lib/p2p/community.ts` (`CommunityManager`) | Community creation/updates/deletion, gzip+ECDSA signed invites, `rt` + `bulk` join handshake, RBAC & channel permission checks, spoofed-sender rejection, deterministic lowest-ID host migration, and cursor-based history pagination |
| `src/lib/p2p/dm.ts` (`DMManager`) | Direct WebRTC DM DataChannels with opaque host-relay fallback, ECDH + HKDF + AES-256-GCM encryption, offline outbound queuing & flush-on-connect, peer public key pinning, rotation alerts, and Safety Number verification |
| `src/lib/p2p/voice.ts` (`VoiceManager`) | Microphone capture (`getUserMedia`), PeerJS `MediaConnection` mesh calls, remote `<audio>` playback management, mute toggle, and track teardown |
| `src/lib/p2p/persistence.ts` (`PersistenceCoordinator`) | Yjs `yjs-sync` / `yjs-update` routing, debounced (300 ms) IndexedDB persistence, and session hydration (`loadPersistedData`) |
| `src/lib/p2p/encoding.ts` | Bounded-timeout `CompressionStream`/`DecompressionStream` (`gzip`) invite compression, Base64 conversion, and invite schema validation |

## Network Topologies

OffGrid uses two complementary topologies depending on communication scope:

### 1. Community Servers: Star Topology (Host-Relayed)

```text
          ┌────────────┐
          │    HOST    │ ◄── Authoritative server config & Yjs sync hub
          └─────┬──────┘
        ┌───────┼───────┐
        ▼       ▼       ▼
    ┌──────┐┌──────┐┌──────┐
    │Peer A││Peer B││Peer C│
    └──────┘└──────┘└──────┘
```

- Members open a dual WebRTC connection to the host when joining a server.
- Channel messages (`Y.Doc` updates) and `CommunityConfig` patches are exchanged through the host over WebRTC DTLS.
- Non-host peers cannot apply `server-updated`, `server-deleted`, or `config-sync` events unless `fromPeerId === server.hostId`.
- Channel messages verify sender identity (`message.author.id === fromPeerId` or `fromPeerId === server.hostId`).

### 2. Direct Messages: Direct Mesh with Opaque Host Relay Fallback

```text
Priority 1 (Direct):   Peer A ◄──── WebRTC DataChannel (AES-256-GCM) ────► Peer B

Priority 2 (Fallback): Peer A ──► HOST (opaque ciphertext, _relayTo) ──► Peer B
```

- When opening a DM (`initiateDMConnection`), OffGrid attempts a direct PeerJS connection (`metadata.type = 'dm'`).
- If NAT prevents a direct link while both peers share an online host, encrypted DM payloads are tagged with `_relayTo: targetPeerId` and forwarded through the host without revealing plaintext (`DMManager.handleDMMessage` checks `dm.from.id === fromPeerId` before relaying to prevent sender spoofing).
- If neither a direct channel nor host link is open, the ciphertext envelope is queued in `pendingDMMessages` and flushed once the peer connects.

## Dual DataChannels (`rt` vs `bulk`)

Every peer-to-host link establishes two reliable SCTP DataChannels so large catch-up sync payloads do not head-of-line block interactive chat:

1. **`rt` (Real-Time)**: Created first on `joinServer`. Carries `message`, `dm-message`, `dm-typing`, `sync-request`, `peer-list`, `host-claim` / `host-conflict` / `host-confirmed`, and `ping` / `pong` heartbeats.
2. **`bulk` (Synchronization)**: Created immediately after `rt` opens with `metadata.channelType = 'bulk'`. Carries `sync-response` and `config-sync`. If establishing `bulk` fails or times out after 5 seconds, `joinServer` falls back to `rt`-only gracefully.

## Chunking, Backpressure & Heartbeats

- **Outbound chunking (`P2PTransport.sendChunked`)**: Serialized events larger than `12_000` UTF-8 bytes are split into `_chunkId`, `_index`, `_total`, `_data` JSON frames.
- **SCTP backpressure (`drainFrames`)**: Before sending each frame, `P2PTransport` inspects `RTCDataChannel.bufferedAmount`. When buffered bytes exceed `HIGH_WATER` (`1 MiB`), sending pauses until `bufferedamountlow` fires at `LOW_WATER` (`64 KiB`).
- **Inbound validation (`receiveChunk`)**: Rejects frames where `_total > 1024`, `_index` is out of bounds, `_data.length > 65_536`, and bounds per-peer concurrent incomplete buffers to `32` messages to prevent memory exhaustion.
- **Heartbeats**: Every `15_000 ms`, `sendHeartbeats()` sends `ping` to open `rt` connections; peers silent for more than `45_000 ms` are closed as stale.

## Deterministic Host Migration

When a connected non-host peer loses its `rt` link to `hostId` (`onPeerDisconnected`), `CommunityManager.initiateHostMigration()` runs a deterministic lowest-peer-ID election:

1. **Candidate view**: Collects `[localPeer.id, ...onlineConnectedPeerIds]` and sorts lexicographically; `candidates[0]` is `proposedHostId`.
2. **Winner path (`proposedHostId === localPeer.id`)**: Promotes itself (`isHost = true`), updates `server.hostId`, broadcasts `host-claim`, waits `2000 ms` for conflicts, then broadcasts `host-confirmed` and emits `host-changed`.
3. **Follower path**: Sets `hostId = proposedHostId` and waits up to `3000 ms` for `host-claim`. On matching claim, binds/reconnects (`reconnectToHost`) over `rt` + `bulk`, re-requests server state, and triggers Yjs `sendSyncStep1` for every channel.
4. **Conflict resolution (`handleHostClaim` / `handleHostConflict`)**: Peers with differing views broadcast `host-conflict`, merge candidate sets, and restart the round with the union view.
5. **Clean tab unload**: `pagehide` / `beforeunload` call `P2PNetwork.handlePageUnload()`, which marks `tearingDown = true` and destroys local transport before flushing IndexedDB so intentional local refreshes do not emit spurious `peer-left` or host-migration writes locally while notifying remote peers cleanly.

## Signaling & ICE Configuration Precedence

`src/lib/network-config.ts` resolves signaling and ICE settings in strict precedence order:

1. **In-app overrides (`localStorage` key `offgrid:network-overrides`)** edited via **Settings → Network & Relays**
2. **Build-time environment defaults**: `VITE_PEERJS_HOST`, `VITE_PEERJS_PORT`, `VITE_PEERJS_PATH`, `VITE_PEERJS_SECURE`, and `VITE_ICE_SERVERS`
3. **PeerJS defaults**: `0.peerjs.com` public signaling cloud and PeerJS default STUN servers

All overrides are validated by `validateNetworkOverrides()` before saving (`stun:`, `stuns:`, `turn:`, `turns:` ICE URLs only; sanitized hostname, integer port `1–65535`, `/` path prefix). Applying overrides calls `P2PNetwork.reconfigureNetwork()`, which tears down sockets, re-initializes PeerJS with the updated ICE/signaling config, and reconnects saved remote servers.

## Automatic Wake-Up Recovery

`P2PContext` attaches `document` `visibilitychange` and `window` `online` listeners wired to `P2PTransport.handleVisibilityWake()` and `handleOnlineRecovery()`. When a throttled mobile/desktop tab becomes visible or network connectivity returns (debounced to 2.5s / 1.5s), OffGrid checks if the PeerJS signaling socket or `hostConn` dropped and calls `reconnectNow()` automatically.
