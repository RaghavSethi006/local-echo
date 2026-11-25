# Verification Checklist

Use both the automated multi-peer Playwright E2E suite and the manual DevTools / `chrome://webrtc-internals` checklist below to verify WebRTC channels, sync, E2E DM verification, network overrides, and host migration.

## Automated Multi-Peer E2E Suite (`npm run test:e2e`)

Run the real two-browser-context Playwright suite (no PeerJS mocks):

```bash
npm run test:e2e
```

`playwright.config.ts` automatically starts:
1. `tests/e2e/signaling-server.mjs`: Local `PeerServer` (`127.0.0.1:9100/offgrid`) + local RFC 5389 UDP STUN responder (`127.0.0.1:3478`).
2. A dedicated Vite dev server on `http://127.0.0.1:3100` configured with `VITE_PEERJS_*` and `VITE_ICE_SERVERS`.

`tests/e2e/p2p-multi-peer.spec.ts` exercises:
- Real WebRTC `rt` + `bulk` DataChannel handshake via signed invite
- Bidirectional channel chat and `WebRTC DTLS · Host-Relayed` clarity
- Offline period + session resume (`Resume Previous Session`) + Yjs state-vector missed-history catch-up sync
- E2E DM delivery + identical 60-digit Safety Number comparison and verification toggle
- Clean host disconnect (`Alice`) -> automatic lowest-ID host election (`Bob` becomes `host`) -> continued messaging

---

## Manual Verification Checklist

Run through this checklist with two browser windows (different profiles) at `http://localhost:3000`:

## Setup

1. Open **Window A** (Profile A) at `http://localhost:3000`.
2. Open **Window B** (Profile B) at `http://localhost:3000`.
3. Open DevTools on both windows → **Application** → **Storage** → **IndexedDB** → clear `p2p-chat-store` if dirty.
4. Open `chrome://webrtc-internals` (or `edge://webrtc-internals`) on **both** windows.

## 1. Basic Connection & Security Clarity

- [ ] **Window A**: Enter username "Alice", click Get Started, create a server, copy invite code.
- [ ] **Window B**: Enter username "Bob", click Get Started, join server with invite code from A.
- [ ] Confirm channel header shows **WebRTC DTLS · Host-Relayed** and member sidebar clearly distinguishes **Channels: WebRTC DTLS** vs **Direct Messages: E2E Encrypted**.

## 2. Verify Two DataChannels per Peer

In `chrome://webrtc-internals` on either window:

- [ ] Locate the `RTCPeerConnection` between Alice and Bob.
- [ ] Confirm **two** `RTCDataChannel` instances exist (`rt` created first, `bulk` created second with `channelType: 'bulk'`).
- [ ] Both channels show `state: "open"`.

## 3. Real-Time Messages Over RT Channel

- [ ] **Window A**: Send `"hello world"`.
- [ ] **Window B**: Confirm message appears.
- [ ] In `webrtc-internals`, confirm `yjs-update` frames increment counters on the **rt** channel, not **bulk**.

## 4. Missed-History Sync Over Reconnection

- [ ] **Window B**: Close tab or refresh, wait for Window A to show `1 online`.
- [ ] **Window A**: Send 3 new messages.
- [ ] **Window B**: Reopen `http://localhost:3000` and click **Resume Previous Session**.
- [ ] In `webrtc-internals`, confirm `sync-response` / `config-sync` arrive on **bulk**, and all 3 missed messages appear in Window B via Yjs state-vector catch-up.

## 5. Heartbeat Isolation

- [ ] In `webrtc-internals`, observe periodic `ping` / `pong` events (~every 15 seconds) on **rt** only (`CHUNK_SIZE = 12_000` in `src/lib/p2p/transport.ts`).
- [ ] Keep both windows open for 60 seconds — neither disconnects (`45s` stale threshold).

## 6. Direct Messages & Safety Number Verification

- [ ] **Window B**: Open a DM to Alice and send `"hey Alice"`.
- [ ] **Window A**: Open Direct Messages → select Bob → confirm `"hey Alice"` arrives.
- [ ] Open **Verify safety number** in the DM header on both windows and verify both display the exact same 60-digit grid (`12 x 5` digits) and matching short Key IDs.
- [ ] Click **Mark as Verified** in Window B and confirm the DM header badge updates to **Verified**.

## 7. Network & Relays Override + Reconnect

- [ ] Open **Settings → Network & Relays** on either window.
- [ ] Inspect **Connection Diagnostics** (`Signaling`, `Peers / Bulk`, `Endpoint`, `NAT Traversal`).
- [ ] Click **Reconnect Now** and verify status remains `connected`.
- [ ] Add an invalid ICE URL (e.g., `http://invalid`) and confirm validation rejects it before saving; reset or save valid STUN/TURN entries (`stun:`/`turn:`).

## 8. Host Migration

- [ ] With both peers connected, **Window A** (host) closes its tab.
- [ ] **Window B** detects host disconnection, elects itself host, and shows `host` status in the sidebar.
- [ ] Send a message in **Window B** as the new host and verify it persists locally.
