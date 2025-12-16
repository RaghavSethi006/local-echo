# P2P Chat — Cloudless Discord Clone

A decentralized, peer-to-peer chat application inspired by Discord, built with an adaptive hybrid networking strategy.

## 🧠 Design Philosophy

This application operates without any centralized cloud infrastructure:

- **No permanent backend servers** — No Firebase, AWS, Supabase, or hosted infrastructure
- **No external running costs** — The networking lives inside the app
- **Ephemeral by design** — When all users leave, the network disappears
- **Privacy-first** — No analytics, no telemetry, no cloud persistence

## 🔍 Why True Cloudless Systems Have Limits

Building a truly cloudless communication system involves fundamental trade-offs:

### The Bootstrap Problem
Without a central server, peers need a way to discover each other. Solutions include:
- **Manual invite codes** — Users share connection information out-of-band
- **QR codes** — Visual exchange of connection data
- **Local network discovery** — mDNS/Bonjour for LAN peers

### NAT Traversal Challenges
Most home networks use NAT, making direct connections difficult:
- **STUN servers** — Help peers discover their public IP (we use Google's public STUN)
- **TURN servers** — Relay traffic when direct connection fails (not included to stay cloudless)
- **Hole punching** — WebRTC handles this automatically when possible

### Consistency vs Availability
In a P2P system, you can't have both perfect consistency and high availability:
- We chose **eventual consistency** with host-authoritative ordering
- Messages may arrive out of order but are sorted by sequence number
- Host migration ensures continuity when the original host disconnects

## 🧬 Networking Architecture

### Transport Selection Logic

The system attempts transports in priority order:

| Priority | Transport | Use Case | Browser Support |
|----------|-----------|----------|-----------------|
| 1 | Wi-Fi Direct | Offline, fastest | ❌ Requires native |
| 2 | LAN TCP + mDNS | Same network | ❌ Requires native |
| 3 | WebRTC DataChannels | Internet fallback | ✅ Full support |
| 4 | BLE | Discovery only | ⚠️ Limited |

**Current Implementation:** WebRTC DataChannels (browser-compatible)

### Why WebRTC?

WebRTC is the only browser-native API that supports:
- Direct peer-to-peer connections
- NAT traversal (via ICE/STUN)
- Encrypted data channels
- No server required after signaling

### Trade-offs of Each Method

#### WebRTC DataChannels (Implemented)
- ✅ Works in browsers
- ✅ E2E encrypted by default
- ✅ Handles NAT traversal
- ⚠️ Requires initial signaling (solved via invite codes)
- ⚠️ May fail without TURN relay for complex NAT

#### Wi-Fi Direct (Future/Native)
- ✅ Zero internet required
- ✅ Fastest local speeds
- ❌ Requires native app (Tauri/Electron)
- ❌ Platform-specific APIs

#### LAN TCP + mDNS (Future/Native)
- ✅ Fast local communication
- ✅ Works without internet
- ❌ Same network only
- ❌ Requires native socket access

## 🏗️ Architecture

### Star Topology with Host Migration

```
     ┌──────────┐
     │   HOST   │ ◄── Authoritative source of truth
     └────┬─────┘
          │
    ┌─────┼─────┐
    │     │     │
    ▼     ▼     ▼
 ┌────┐┌────┐┌────┐
 │Peer││Peer││Peer│
 └────┘└────┘└────┘
```

**Host Responsibilities:**
- Message ordering (assigns sequence numbers)
- Presence management
- Broadcasting to all peers
- State synchronization for new joiners

**Host Migration:**
When the host disconnects:
1. Remaining peers detect disconnection
2. Deterministic election (lowest peer ID wins)
3. New host assumes responsibilities
4. Peers reconnect automatically
5. No message loss (messages buffered locally)

### Message Flow

```
1. Peer sends message to Host
2. Host assigns global sequence number
3. Host broadcasts to all peers
4. Peers render messages in order
```

### Message Schema

```typescript
{
  id: string;          // Unique message ID
  serverId: string;    // Server context
  channelId: string;   // Channel context  
  author: PeerId;      // Sender info
  content: string;     // Message content
  seq: number;         // Global sequence for ordering
  timestamp: number;   // Unix timestamp
  encrypted?: boolean; // E2E encryption flag
}
```

## 🔐 Security Model

- **Key Generation:** ECDH P-256 curve for key exchange
- **Encryption:** AES-256-GCM for message encryption
- **No Key Escrow:** Keys never leave the device
- **Forward Secrecy:** New keys for each session
- **Transport Security:** WebRTC DTLS encryption

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** React Context + Custom hooks
- **Networking:** WebRTC DataChannels
- **Crypto:** Web Crypto API
- **Build:** Vite

## 🎯 Best Possible Compromise

This design represents the optimal balance for a browser-based cloudless chat:

1. **Fully functional in browsers** — No native app required for basic use
2. **True P2P** — Messages flow directly between peers after connection
3. **E2E Encrypted** — Using standard Web Crypto APIs
4. **Zero infrastructure cost** — STUN servers are free and stateless
5. **Graceful degradation** — Works on LAN even if internet fails mid-session
6. **Host migration** — No single point of failure after initial connection

### What We Sacrificed

- **Offline messaging** — Peers must be online simultaneously
- **Persistence** — Messages exist only in memory
- **Large scale** — Star topology limits to ~50 peers practically
- **Voice/Video** — Would require TURN servers for reliability

## 🚀 Future Enhancements (Native App)

With Tauri or Electron, we could add:
- [ ] Wi-Fi Direct for true offline
- [ ] mDNS discovery for automatic LAN detection
- [ ] BLE beacons for peer presence
- [ ] Local database for message persistence
- [ ] Store-and-forward for offline delivery
- [ ] QR code scanning for easy joins

## 📝 License

MIT — Use freely, contribute openly.
