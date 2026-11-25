# OffGrid

OffGrid is a private, local-first community chat app built on peer-to-peer WebRTC connections. It gives small groups real-time channels, end-to-end encrypted direct messages, Safety Number key verification, ECDSA-signed invites, voice channels, local IndexedDB + Yjs CRDT persistence, and runtime signaling/ICE configuration without a central application server.

## Documentation

Focused technical guides live in [`/docs`](docs/):

- [**Architecture Guide**](docs/architecture.md) — `src/lib/p2p/` subsystems (`transport`, `community`, `dm`, `voice`, `persistence`), star vs. direct mesh topology, dual `rt`/`bulk` DataChannels, 12 KB chunking + backpressure, deterministic host migration, signaling/ICE override precedence, and wake-up recovery.
- [**Cryptography & Security Guide**](docs/cryptography.md) — Server channels (`WebRTC DTLS · Host-Relayed`) vs. Direct Messages (`ECDH P-256` + `HKDF-SHA-256` + `AES-256-GCM`), signed invites, key pinning & rotation alerts, and deterministic 60-digit Safety Numbers.
- [**Sync & Storage Guide**](docs/sync-and-storage.md) — `p2p-chat-store` IndexedDB v2 schema, `y-indexeddb` CRDT docs, two-phase bootstrap + state-vector catch-up sync, at-rest DM encryption, and message pagination.
- [**Voice Channels Guide**](docs/voice-channels.md) — WebRTC audio call lifecycle (`getUserMedia`, PeerJS `MediaConnection`, remote `<audio>` playback, mute toggle, teardown) and NAT/TURN considerations.
- [**Verification Checklist**](docs/verification-checklist.md) — Automated Playwright E2E test overview and manual `chrome://webrtc-internals` verification steps.

## Design Philosophy

- **No central database or app backend** — Communities, messages, roles, and keys live in your browser and sync peer-to-peer.
- **Honest security boundaries** — Channel chat is transport-encrypted (`WebRTC DTLS · Host-Relayed`); 1-to-1 Direct Messages are end-to-end encrypted (`ECDH + AES-256-GCM`) with out-of-band Safety Number verification.
- **Resilient networking** — Supports `VITE_ICE_SERVERS` / `VITE_PEERJS_*` env defaults, in-app **Settings → Network & Relays** overrides with validation, and automatic `visibilitychange` / `online` wake-up reconnection.
- **Privacy-first** — No analytics, no telemetry, and no key escrow.

## Networking & Sync Summary

```text
Community Channels:   Member ◄══(rt + bulk WebRTC DTLS)══► Host ◄══► Other Members
Direct Messages:      Peer A ◄══(Direct WebRTC, E2E)══════► Peer B  (or opaque _relayTo via Host)
```

- **Dual DataChannels (`rt` + `bulk`)**: Interactive messages, heartbeats, and DM events travel over `rt`; large bootstrap snapshots (`sync-response`, `config-sync`) travel over `bulk` with `12 KB` chunking and SCTP `bufferedAmount` backpressure (`1 MiB` high water / `64 KiB` low water).
- **Local-first CRDT Sync**: Channel and DM histories live in `Y.Doc` instances backed by `y-indexeddb` alongside structured metadata in IndexedDB (`p2p-chat-store`), catching up missed messages via Yjs state vectors on rejoin.
- **Host Migration**: If the server host disconnects, remaining peers elect the lowest peer ID deterministically and reconnect automatically.

## Features

- **Modular P2P Engine**: Clean `P2PNetwork` facade (`src/lib/p2p-network.ts`) coordinating `transport`, `community`, `dm`, `voice`, and `persistence` modules.
- **DM Safety Numbers & Key Pinning**: Deterministic 60-digit Safety Number grid (`12 x 5` digits), short key fingerprints, **Verified** toggle in the DM header, and automatic **Key Changed** warnings on unexpected peer key rotation.
- **Network & Relays Settings**: Live connection diagnostics, manual **Reconnect Now**, validated custom PeerJS signaling server overrides, and STUN/TURN ICE server configuration stored in `localStorage`.
- **Voice Channels**: Peer-to-peer WebRTC audio calls with microphone mute/unmute controls.
- **Offline DM Queue**: Encrypted outbound DMs queue locally when a peer is unreachable and flush automatically on connect.
- **Community RBAC & Customization**: Role-based permissions, channel overwrites, templates, and signed compressed invites.

## Getting Started

```bash
npm install
cp .env.example .env   # optional: configure VITE_ICE_SERVERS or custom PeerJS signaling
npm run dev            # starts Vite dev server on http://localhost:3000
```

## Verification & Test Scripts

- `npm run typecheck` — Full TypeScript check (`tsc -b --noEmit`)
- `npm run lint` — ESLint checks across app, tests, and config
- `npm test` — Vitest unit and component suite (`64` tests across crypto, network config, storage, QR, P2P subsystems, and UI components)
- `npm run test:e2e` — Multi-peer Playwright E2E suite spinning up a local PeerJS signaling + STUN server (`tests/e2e/signaling-server.mjs`) against real headless Chromium contexts
- `npm run build` — Production Vite bundle

## License

MIT — Use freely, contribute openly.
