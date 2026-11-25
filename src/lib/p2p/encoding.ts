import type { InvitePayload } from './types';

export async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out (${ms}ms)`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer!));
}

export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function readStreamAll(readable: ReadableStream<Uint8Array>): Promise<Uint8Array> {
  const reader = readable.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const total = chunks.reduce((s, c) => s + c.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

export async function compressInvite(json: string): Promise<string> {
  const encoder = new TextEncoder();
  const inputBytes = encoder.encode(json);
  const cs = new CompressionStream('gzip');
  const writer = cs.writable.getWriter();
  const [, result] = await Promise.all([
    (async () => {
      await writer.write(inputBytes as BufferSource);
      await writer.close();
    })(),
    readStreamAll(cs.readable),
  ]);
  return uint8ArrayToBase64(result);
}

export async function decompressInvite(base64: string): Promise<string> {
  const compressed = base64ToUint8Array(base64);
  const ds = new DecompressionStream('gzip');
  const writer = ds.writable.getWriter();
  const [, result] = await Promise.all([
    (async () => {
      await writer.write(compressed as BufferSource);
      await writer.close();
    })(),
    readStreamAll(ds.readable),
  ]);
  return new TextDecoder().decode(result);
}

export function isValidInvitePayload(candidate: unknown): candidate is InvitePayload {
  if (!candidate || typeof candidate !== 'object') return false;
  const inv = candidate as Partial<InvitePayload>;
  return (
    typeof inv.serverId === 'string' && inv.serverId.length > 0 && inv.serverId.length <= 128 &&
    typeof inv.serverName === 'string' && inv.serverName.length > 0 && inv.serverName.length <= 128 &&
    typeof inv.hostPeerId === 'string' && inv.hostPeerId.length > 0 && inv.hostPeerId.length <= 128 &&
    typeof inv.timestamp === 'number' && Number.isFinite(inv.timestamp)
  );
}
