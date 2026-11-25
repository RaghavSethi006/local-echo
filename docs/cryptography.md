# Cryptography & Security Model Guide

OffGrid enforces different security guarantees for **Server Channels** versus **Direct Messages**. All key generation, key exchange, signing, and encryption run inside the browser's Web Crypto API (`window.crypto.subtle` in `src/lib/crypto.ts`).

## Security Boundary: Server Channels vs. Direct Messages

| Surface | Transport Protection | End-to-End Encryption | Who Can Read Plaintext |
| --- | --- | --- | --- |
| **Server Channels** | WebRTC DTLS (peer-to-host DataChannels) | No (synced via host `Y.Doc` & relayed by host) | Any active member of the server, including the host |
| **Direct Messages (DMs)** | WebRTC DTLS (direct or host-relayed) | **Yes** (`ECDH P-256` + `HKDF-SHA-256` + `AES-256-GCM`) | Only the two DM participants |
| **Voice Channels** | WebRTC DTLS-SRTP | Peer-to-peer media streams (`MediaConnection`) | Connected peers in the active voice call |
| **Local DM Storage (`dmMessages`)** | N/A (on-device IndexedDB) | Encrypted at rest via per-identity `AES-256-GCM` `_storageKey` | Local browser profile holding `identity.storageKeyJwk` |

This boundary is explicitly surfaced in the UI: `MessageArea` and `MembersSidebar` label server channels `WebRTC DTLS · Host-Relayed`, whereas `DMConversation`, `MembersSidebar`, and `SettingsDialog` label direct messages `E2E (ECDH + AES-256-GCM)`.

## Peer Cryptographic Identity (`src/lib/p2p-network.ts`, `src/lib/crypto.ts`)

When initializing a new profile, each peer generates three Web Crypto key artifacts:

1. **ECDH P-256 Identity Keypair (`keyPair`)**: Used for DM key agreement. Public key is exported as base64 raw bytes (`localPeer.publicKey`) and stored alongside its JWK (`publicKeyJwk`, `privateKeyJwk`).
2. **ECDSA P-256 Signing Keypair (`signingKeyPair`)**: Used to sign server invites (`localPeer.verifyKey`, persisted as `verifyKeyJwk` / `signingKeyJwk`).
3. **AES-256-GCM Storage Key (`storageKey`)**: Used to encrypt DM rows stored in IndexedDB (`p2p-chat-store`), persisted as `storageKeyJwk`.

Keys are exported/imported via JWK in `Storage.saveIdentity` / `Storage.loadIdentity` and remain strictly in the local browser profile.

## Signed Community Invites (`src/lib/p2p/community.ts`)

1. `generateInvite(serverId)` checks `hasPermission(serverId, localPeer.id, 'create_invites')`.
2. Builds `InvitePayload` (`serverId`, `serverName`, `hostPeerId`, `hostUsername`, `hostVerifyKey`, `timestamp`).
3. Signs `JSON.stringify(payload)` using ECDSA P-256 with SHA-256 (`signData`), wraps `{ payload, signature }`, and gzip-compresses the JSON (`compressInvite`).
4. On `joinServer(inviteCode)`, `CommunityManager` validates the payload schema (`isValidInvitePayload`) and verifies the ECDSA signature against `invite.hostVerifyKey` (`verifySignature`). Unsigned payloads when `hostVerifyKey` is present, missing keys when a signature is present, or invalid signatures are rejected before any WebRTC connection is opened.

## Direct Message End-to-End Encryption (`src/lib/p2p/dm.ts`)

### Key Derivation (NIST SP 800-56C Pattern)

For any pair `(Alice, Bob)` where both `publicKey` strings are known:

1. Import the remote peer's raw P-256 public key (`importPublicKey`).
2. Compute 256 shared bits via ECDH (`crypto.subtle.deriveBits({ name: 'ECDH', public }, localPrivateKey, 256)`).
3. Import shared bits as HKDF key material.
4. Derive a 256-bit `AES-GCM` key via `HKDF-SHA-256` with a 32-byte zero salt (`HKDF_SALT`) and info label `local-echo-key-v1` (`HKDF_INFO`), cached per peer in `DMManager.sharedKeys`.

### Message Encryption & Wire Format

- `encrypt(plaintext, key)` generates a fresh 12-byte cryptographic random IV (`crypto.getRandomValues(new Uint8Array(12))`) per message, encrypts UTF-8 bytes with `AES-256-GCM`, prepends the 12-byte IV, and encodes `[iv || ciphertext+tag]` as base64.
- `sendDM` writes the encrypted payload (`encrypted: true`) into the shared Yjs DM document and transmits `wireDm` over the direct WebRTC channel—or wrapped with `_relayTo` through the server host if direct connectivity is unavailable.
- The local UI retains decrypted `localDm` in memory for immediate rendering while IndexedDB (`dmMessages`) encrypts stored rows using `_storageKey`.

### Anti-Spoofing Guards

- **Opaque host relay**: When `isHost()` forwards a DM carrying `_relayTo`, `DMManager.handleDMMessage` requires `dm.from.id === fromPeerId` (the authenticated PeerJS connection ID). Forged `from.id` relay requests are dropped.
- **Direct/relayed delivery**: Recipients require `dm.from.id === fromPeerId` or `fromPeerId === hostId`.

## Safety Numbers, Key Pinning & Rotation Detection

To protect DMs against a compromised signaling server or host impersonating a peer's ECDH public key, OffGrid implements out-of-band Safety Number verification:

### Deterministic 60-Digit Safety Number (`computeSafetyNumber`)

1. Trim both peers' base64 raw ECDH public keys and sort lexicographically: `sorted = [publicKeyA, publicKeyB].sort()`.
2. Hash UTF-8 bytes of `` `offgrid-safety-v1:${sorted[0]}:${sorted[1]}` `` with `SHA-256`.
3. Extract 12 overlapping 24-bit windows (`offset = i * 2`, modulo 32) and compute `(word % 100_000)` zero-padded to 5 digits.
4. Join into 12 five-digit groups (60 digits total), displayed in a 4×3 grid in `SafetyNumberDialog` alongside 8-hex-character short fingerprints (`formatShortKeyFingerprint`, first 4 bytes of `SHA-256(publicKey)`).

Because the input keys are sorted lexicographically before hashing, Alice and Bob compute the **exact same 60-digit Safety Number** independently without exchanging an extra protocol message.

### Key Pinning & Change Warnings (`DMManager.observePeerIdentity`)

- Whenever a peer is observed in a server (`onIncomingPeerConnected`, `handlePeerList`, `handleSyncResponse`, or incoming DM), `DMManager.observePeerIdentity()` compares the newly advertised `peer.publicKey` against the pinned `conv.peerId.publicKey` for that peer ID.
- If a known peer advertises a **different** `publicKey`:
  - `sharedKeys.delete(peer.id)` invalidates the cached AES-GCM key so subsequent DMs derive from the new key.
  - `conv.previousPublicKey` captures the prior pinned/verified key, and `conv.keyChanged` becomes `true`.
  - A `dm-verified` event updates the UI, showing an amber **Key Changed** badge in the `DMConversation` header, an inline warning banner, and an alert box inside `SafetyNumberDialog`.
- Clicking **Mark as Verified** (`verifyDMPeer`) pins `verifiedPublicKey = conv.peerId.publicKey`, clears `keyChanged`, records `verifiedAt`, and persists the trust state in IndexedDB `dmConversations`. Clicking **Unverify Peer** clears the pinned verification.

## Input & Configuration Security Boundaries

- **Signaling & ICE Validation (`src/lib/network-config.ts`)**: Rejects any ICE scheme other than `stun:`, `stuns:`, `turn:`, or `turns:`, validates hostnames/ports/paths, and omits raw TURN credentials from `ConnectionDiagnostics` (`hasTurnRelay` boolean / `redactIceServers()`).
- **DoS Guards (`src/lib/p2p/transport.ts`, `src/lib/p2p/community.ts`)**: Messages are capped at 8 KB UTF-8 (`sendMessage`); chunked frame reassembly caps `_total <= 1024`, `_data.length <= 65_536`, and 32 concurrent chunk assemblies per peer.
