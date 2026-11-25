import dgram from 'node:dgram';
import { PeerServer } from 'peer';

const port = Number(process.env.PEERJS_PORT || 9100);
const path = process.env.PEERJS_PATH || '/offgrid';
const stunPort = Number(process.env.STUN_PORT || 3478);

// Local PeerJS WebSocket signaling server
const server = PeerServer({
  port,
  path,
  allow_discovery: false,
});

// Minimal local RFC 5389 STUN Binding responder so headless Chromium in
// loopback/link-local containers gathers srflx 127.0.0.1 candidates offline.
const stunSocket = dgram.createSocket('udp4');
stunSocket.on('message', (msg, rinfo) => {
  if (msg.length < 20) return;
  const msgType = msg.readUInt16BE(0);
  const magicCookie = msg.readUInt32BE(4);
  if (msgType !== 0x0001 || magicCookie !== 0x2112a442) return;

  const ipParts = rinfo.address.split('.').map(Number);
  if (ipParts.length !== 4 || ipParts.some((n) => Number.isNaN(n))) return;
  const ipUint32 =
    ((ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3]) >>> 0;

  const response = Buffer.alloc(32);
  response.writeUInt16BE(0x0101, 0); // Binding Success Response
  response.writeUInt16BE(12, 2); // Message Length (1 attribute = 12 bytes)
  response.writeUInt32BE(0x2112a442, 4); // Magic Cookie
  msg.subarray(8, 20).copy(response, 8); // Transaction ID

  // XOR-MAPPED-ADDRESS (0x0020)
  response.writeUInt16BE(0x0020, 20);
  response.writeUInt16BE(8, 22);
  response.writeUInt8(0x00, 24);
  response.writeUInt8(0x01, 25); // IPv4
  response.writeUInt16BE(rinfo.port ^ 0x2112, 26);
  response.writeUInt32BE((ipUint32 ^ 0x2112a442) >>> 0, 28);

  stunSocket.send(response, rinfo.port, rinfo.address);
});

stunSocket.bind(stunPort, '127.0.0.1', () => {
  console.log(`[E2E STUN] UDP STUN responder listening on 127.0.0.1:${stunPort}`);
});

console.log(`[E2E Signaling] PeerServer listening on http://127.0.0.1:${port}${path}`);

const shutdown = () => {
  try {
    stunSocket.close();
  } catch {
    // Ignore close errors
  }
  try {
    server.close?.();
  } catch {
    // Ignore close errors
  }
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
