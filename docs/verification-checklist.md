# Manual Verification Checklist

Run through this checklist with two browser windows (different usernames) to confirm the rt/bulk DataChannel separation works correctly.

## Setup

1. Open **Window A** (incognito/guest profile A) at `http://localhost:5173`
2. Open **Window B** (incognito/guest profile B) at `http://localhost:5173`
3. Open DevTools on both windows → **Application** → **Storage** → **IndexedDB** → clear `p2p-chat-store` if dirty
4. Open `chrome://webrtc-internals` (or Edge equivalent `edge://webrtc-internals`) on **both** windows — this shows all RTCPeerConnections and DataChannels

## 1. Basic connection

- [ ] **Window A**: Enter username "Alice", click Start
- [ ] **Window A**: Create a server → copy invite code
- [ ] **Window B**: Enter username "Bob", click Start
- [ ] **Window B**: Join server with invite code from A

## 2. Verify two DataChannels per peer

In `chrome://webrtc-internals` on either window:

- [ ] Locate the `RTCPeerConnection` between the two peers
- [ ] Confirm **two** `RTCDataChannel` instances exist (look under "Data Channels" section)
- [ ] One channel is the `rt` channel (created first — no special metadata label)
- [ ] One channel is the `bulk` channel (created second — sent with `channelType: 'bulk'` in metadata)
- [ ] Both channels show `state: "open"`

## 3. Real-time messages over RT channel

- [ ] **Window A**: Send a chat message "hello world"
- [ ] **Window B**: Confirm message appears
- [ ] In `webrtc-internals`, find the **rt** DataChannel and verify `messagesReceived` / `messagesSent` counters incremented for `message` type events
- [ ] Verify the **bulk** DataChannel counters did **not** increment for this message

## 4. Sync traffic over bulk channel

- [ ] **Window B**: Disconnect from network (refresh the page)
- [ ] **Window A**: Send 3 more messages
- [ ] **Window B**: Rejoin using the invite code
- [ ] In `webrtc-internals`, during reconnection:
  - [ ] `sync-response`, `config-sync`, and/or `history-merge` events appear in the **bulk** channel's `messagesReceived`
  - [ ] The **rt** channel shows only `sync-request`, `history-offer`, `peer-list`, and new chat messages
- [ ] Verify all 3 missed messages appear in Window B's chat

## 5. Heartbeat isolation

- [ ] In `webrtc-internals`, observe the **rt** channel receives periodic `ping`/`pong` events (~every 15 seconds)
- [ ] Verify the **bulk** channel does **not** show ping/pong activity
- [ ] Keep both windows open for 60 seconds — neither should disconnect (no stale peer timeouts)

## 6. Chunked payloads on bulk channel

- [ ] **Window A**: Generate enough messages to exceed 12KB — either:
  - Send many small messages, or
  - Temporarily lower `CHUNK_SIZE` in `p2p-network.ts` to `1000` to trigger chunking more easily
- [ ] **Window B**: Reconnect (refresh + rejoin)
- [ ] In `webrtc-internals`, observe chunk frames (`_chunkId`, `_index`, `_total`) arriving on the **bulk** channel
- [ ] Verify no chunk frames appear on the **rt** channel
- [ ] Verify all messages arrive and reassemble correctly in Window B

## 7. DM over RT

- [ ] **Window B**: Open a DM to Alice
- [ ] **Window B**: Send "hey Alice" in the DM
- [ ] **Window A**: Confirm DM message appears
- [ ] In `webrtc-internals`, verify `dm-message` events flow over the **rt** channel only

## 8. Bulk channel failure tolerance

> This test validates the fallback to RT-only when bulk fails.

- [ ] Modify `joinServer` in `p2p-network.ts` to **not** create the bulk connection (comment out the bulkConn block)
- [ ] Restart both windows, reconnect
- [ ] Verify the app still works correctly — messages, sync, history all function over the single RT channel
- [ ] Restore the bulk connection code after this test

## 9. Host migration

- [ ] With both peers connected, **Window A** (host) closes their browser
- [ ] **Window B** should detect host disconnection and initiate host migration
- [ ] Verify the `bulkConnections` map is empty on the new host (Window B)
- [ ] **Window A** reopens, rejoins the server
- [ ] Verify dual DataChannels are re-established

## 10. Cleanup

- [ ] Close both windows
- [ ] Verify no console errors related to channel cleanup in either session
