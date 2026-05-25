# Local Echo

Local Echo is a private, local-first community chat app built on peer-to-peer WebRTC connections. It gives small groups encrypted rooms, direct messages, signed invites, local persistence, and server management without a central message server.

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

## 💬 Direct Messages (DMs)

### DM Routing Logic

DMs are private 1-to-1 conversations that exist outside of servers. The routing prioritizes direct connections:

```
Priority 1: Direct P2P Connection
┌────────┐                      ┌────────┐
│ User A │ ◄──── WebRTC ────► │ User B │
└────────┘    DataChannel       └────────┘

Priority 2: Host-Assisted Relay (Fallback)
┌────────┐        ┌──────┐        ┌────────┐
│ User A │ ──► │ HOST │ ──► │ User B │
└────────┘   encrypted   └──────┘   encrypted   └────────┘
              blob                    blob
```

### Why Direct Channels Are Preferred

1. **Lower Latency** — No intermediate hop through the host
2. **Reduced Host Load** — Host doesn't process DM traffic
3. **Better Privacy** — Host never sees encrypted payload
4. **Resilience** — DMs work even if host goes offline

### DM Connection Flow

1. User A opens DM with User B
2. System checks for existing direct channel
3. If none exists:
   - Create new WebRTC peer connection
   - Exchange SDP via existing server connection (signaling)
   - Establish dedicated DM data channel
4. Messages flow directly between peers

### Security Guarantees

- **End-to-End Encryption** — Using ECDH key exchange + AES-256-GCM
- **Per-DM Session Keys** — Each conversation has unique keys
- **Host Cannot Decrypt** — Relay payloads are encrypted blobs
- **No Persistence** — DMs only exist in memory

### Fallback Relay Behavior

When direct connection fails (complex NAT, firewall):
1. System detects connection failure
2. Falls back to relay through server host
3. Messages are encrypted before relay
4. Host treats payload as opaque bytes
5. UI shows "Relayed" indicator

### DM Message Schema

```typescript
{
  id: string;          // Unique message ID
  type: 'DM';          // Message type
  from: PeerId;        // Sender info
  to: PeerId;          // Recipient info
  content: string;     // Message content
  timestamp: number;   // Unix timestamp
  encrypted?: boolean; // Always true for DMs
  read?: boolean;      // Read receipt
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
7. **Private DMs** — Direct peer connections bypass the host when possible

### What We Sacrificed

- **Offline messaging** — Peers must be online simultaneously
- **Persistence** — Messages exist only in memory
- **Large scale** — Star topology limits to ~50 peers practically
- **Voice/Video** — Would require TURN servers for reliability
- **Group DMs** — Currently limited to 1-to-1

## 🚀 Future Enhancements (Native App)

With Tauri or Electron, we could add:
- [ ] Wi-Fi Direct for true offline
- [ ] mDNS discovery for automatic LAN detection
- [ ] BLE beacons for peer presence
- [ ] Local database for message persistence
- [ ] Store-and-forward for offline delivery
- [ ] QR code scanning for easy joins
- [ ] Group DMs with multi-party encryption

## 📝 License

MIT — Use freely, contribute openly.
