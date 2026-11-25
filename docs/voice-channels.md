# Voice Channels Guide

OffGrid supports peer-to-peer browser audio inside server voice channels (`channel.type === 'voice'`) using WebRTC `MediaStream` tracks and PeerJS `MediaConnection` calls.

## Core Implementation

- **Voice subsystem**: `src/lib/p2p/voice.ts` (`VoiceManager`)
- **UI**: `src/components/chat/VoiceChannelView.tsx`
- **Facade & Context**: `P2PNetwork` (`src/lib/p2p-network.ts`) and `P2PContext` (`src/contexts/P2PContext.tsx`)

## Audio Call Lifecycle

### 1. Joining a Voice Channel (`VoiceManager.joinVoiceChannel`)

1. If the user is already in another voice channel, `leaveVoiceChannel()` runs first to release the prior microphone stream and calls.
2. Requests audio input via `navigator.mediaDevices.getUserMedia({ audio: true })`.
   - If permission is denied or no microphone is available, emits an `'error'` `P2PEvent` (`Could not access microphone. Please check permissions.`) and aborts without marking the user connected.
3. Marks `activeVoiceChannel = { serverId, channelId }` and `muted = false`.
4. Iterates `server.members` and initiates a PeerJS media call (`peer.call(peerId, localStream)`) to each remote member currently present in `transport.connections`.
5. Emits `voice-state-changed` so `VoiceChannelView` displays active participants and mute controls.

### 2. Answering Incoming Calls (`VoiceManager.handleIncomingCall`)

- `P2PTransport` forwards PeerJS `peer.on('call', call)` events to `VoiceManager.handleIncomingCall(call)`.
- If the local user is currently active in a voice channel (`this.localStream !== null`), OffGrid answers with `call.answer(this.localStream)`, registers the `MediaConnection` in `voiceConnections`, and attaches stream/close/error handlers.
- If the local user has not joined a voice channel (`this.localStream === null`), `call.close()` immediately rejects unsolicited audio calls so microphone access is never leaked passively.

### 3. Remote Audio Playback & Teardown

- Each active `stream` event creates a dedicated `HTMLAudioElement`, assigns `audio.srcObject = remoteStream`, calls `audio.play()`, and tracks the element in `voiceAudioElements`.
- On `call.on('close')` or `leaveVoiceChannel()`:
  - Pauses audio elements and clears `srcObject = null`.
  - Closes every `MediaConnection`.
  - Stops all local `MediaStreamTrack`s (`track.stop()`) so browser recording indicators turn off immediately.
  - Resets `muted = false`, `activeVoiceChannel = null`, and emits `voice-state-changed`.

### 4. Mute / Unmute (`toggleMute`)

- Toggles `this.muted` and sets `track.enabled = !this.muted` across all tracks in `localStream.getAudioTracks()` without tearing down the WebRTC `RTCPeerConnection`.

## Media Security & Topology Notes

- **Transport security**: Audio packets are encrypted in transit via WebRTC **DTLS-SRTP** between peers.
- **Mesh topology**: Unlike text channel chat (which relays through the host), voice calls establish direct peer-to-peer `MediaConnection` streams between participating callers using the configured STUN/TURN `iceServers`.
- **ICE/NAT traversal**: Symmetric NATs or strict corporate firewalls require configuring a TURN relay (`VITE_ICE_SERVERS` or **Settings → Network & Relays**) for audio media to connect reliably.
