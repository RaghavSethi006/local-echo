// End-to-end encryption utilities using Web Crypto API

export interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  publicKeyString: string;
}

export interface SigningKeyPair {
  signingKey: CryptoKey;
  verifyKey: CryptoKey;
  verifyKeyString: string;
}

function bytesToBase64(bytes: Uint8Array): string {
  const CHUNK = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function generateKeyPair(): Promise<KeyPair> {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    ['deriveKey', 'deriveBits']
  );

  const publicKeyBuffer = await window.crypto.subtle.exportKey('raw', keyPair.publicKey);
  const publicKeyString = bytesToBase64(new Uint8Array(publicKeyBuffer));

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
    publicKeyString,
  };
}

export async function exportKeyPairJwk(keyPair: KeyPair): Promise<{
  publicKeyJwk: JsonWebKey;
  privateKeyJwk: JsonWebKey;
  publicKeyString: string;
}> {
  const [publicKeyJwk, privateKeyJwk] = await Promise.all([
    window.crypto.subtle.exportKey('jwk', keyPair.publicKey),
    window.crypto.subtle.exportKey('jwk', keyPair.privateKey),
  ]);
  return { publicKeyJwk, privateKeyJwk, publicKeyString: keyPair.publicKeyString };
}

export async function importKeyPairJwk(
  publicKeyJwk: JsonWebKey,
  privateKeyJwk: JsonWebKey,
  publicKeyString?: string
): Promise<KeyPair> {
  const [publicKey, privateKey] = await Promise.all([
    window.crypto.subtle.importKey(
      'jwk',
      publicKeyJwk,
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      []
    ),
    window.crypto.subtle.importKey(
      'jwk',
      privateKeyJwk,
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      ['deriveKey', 'deriveBits']
    ),
  ]);
  const derivedPubStr =
    publicKeyString ||
    bytesToBase64(new Uint8Array(await window.crypto.subtle.exportKey('raw', publicKey)));
  return { publicKey, privateKey, publicKeyString: derivedPubStr };
}

export async function generateSigningKeyPair(): Promise<SigningKeyPair> {
  const keyPair = await window.crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  );
  const verifyKeyBuffer = await window.crypto.subtle.exportKey('raw', keyPair.publicKey);
  const verifyKeyString = bytesToBase64(new Uint8Array(verifyKeyBuffer));
  return { signingKey: keyPair.privateKey, verifyKey: keyPair.publicKey, verifyKeyString };
}

export async function exportSigningKeyPairJwk(keyPair: SigningKeyPair): Promise<{
  verifyKeyJwk: JsonWebKey;
  signingKeyJwk: JsonWebKey;
  verifyKeyString: string;
}> {
  const [verifyKeyJwk, signingKeyJwk] = await Promise.all([
    window.crypto.subtle.exportKey('jwk', keyPair.verifyKey),
    window.crypto.subtle.exportKey('jwk', keyPair.signingKey),
  ]);
  return { verifyKeyJwk, signingKeyJwk, verifyKeyString: keyPair.verifyKeyString };
}

export async function importSigningKeyPairJwk(
  verifyKeyJwk: JsonWebKey,
  signingKeyJwk: JsonWebKey,
  verifyKeyString?: string
): Promise<SigningKeyPair> {
  const [verifyKey, signingKey] = await Promise.all([
    window.crypto.subtle.importKey(
      'jwk',
      verifyKeyJwk,
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['verify']
    ),
    window.crypto.subtle.importKey(
      'jwk',
      signingKeyJwk,
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['sign']
    ),
  ]);
  const derivedVerifyStr =
    verifyKeyString ||
    bytesToBase64(new Uint8Array(await window.crypto.subtle.exportKey('raw', verifyKey)));
  return { signingKey, verifyKey, verifyKeyString: derivedVerifyStr };
}

export async function importPublicKey(publicKeyString: string): Promise<CryptoKey> {
  const bytes = base64ToBytes(publicKeyString);

  return window.crypto.subtle.importKey(
    'raw',
    bytes,
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    []
  );
}

const HKDF_SALT = new Uint8Array(32);
const HKDF_INFO = new TextEncoder().encode('local-echo-key-v1');

export async function deriveSharedKey(
  privateKey: CryptoKey,
  publicKey: CryptoKey
): Promise<CryptoKey> {
  // Step 1: Compute raw ECDH shared secret
  const sharedBits = await window.crypto.subtle.deriveBits(
    { name: 'ECDH', public: publicKey },
    privateKey,
    256
  );

  // Step 2: Import as HKDF key material
  const hkdfKey = await window.crypto.subtle.importKey(
    'raw',
    sharedBits,
    { name: 'HKDF' },
    false,
    ['deriveKey']
  );

  // Step 3: Derive AES-256-GCM key via HKDF-SHA256 (NIST SP 800-56C)
  return window.crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: HKDF_SALT,
      info: HKDF_INFO,
    },
    hkdfKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function signData(data: string, signingKey: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const sig = await window.crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    signingKey,
    encoder.encode(data)
  );
  return bytesToBase64(new Uint8Array(sig));
}

export async function verifySignature(
  data: string,
  signature: string,
  verifyKeyString: string
): Promise<boolean> {
  try {
    const keyBytes = base64ToBytes(verifyKeyString);
    const verifyKey = await window.crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['verify']
    );
    const sigBytes = base64ToBytes(signature);
    const encoder = new TextEncoder();
    return await window.crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      verifyKey,
      sigBytes,
      encoder.encode(data)
    );
  } catch {
    return false;
  }
}

export async function encrypt(data: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encoder.encode(data)
  );

  const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encryptedBuffer), iv.length);

  return bytesToBase64(combined);
}

export async function decrypt(encryptedData: string, key: CryptoKey): Promise<string> {
  const bytes = base64ToBytes(encryptedData);

  const iv = bytes.slice(0, 12);
  const data = bytes.slice(12);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    data
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

export async function generateStorageKey(): Promise<CryptoKey> {
  return window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function exportStorageKey(key: CryptoKey): Promise<JsonWebKey> {
  return window.crypto.subtle.exportKey('jwk', key);
}

export async function importStorageKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return window.crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

export function generateId(): string {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Compute a deterministic 60-digit Safety Number from two ECDH public keys.
 * Sorting keys lexicographically guarantees both peers compute the exact same number.
 */
export async function computeSafetyNumber(publicKeyA: string, publicKeyB: string): Promise<string> {
  const sorted = [publicKeyA.trim(), publicKeyB.trim()].sort();
  const payload = new TextEncoder().encode(`offgrid-safety-v1:${sorted[0]}:${sorted[1]}`);
  const digest = await window.crypto.subtle.digest('SHA-256', payload);
  const bytes = new Uint8Array(digest);

  const groups: string[] = [];
  for (let i = 0; i < 12; i++) {
    const offset = i * 2;
    const b0 = bytes[offset];
    const b1 = bytes[offset + 1];
    const b2 = bytes[(offset + 2) % bytes.length];
    const num = ((b0 << 16) | (b1 << 8) | b2) % 100_000;
    groups.push(num.toString().padStart(5, '0'));
  }

  return groups.join(' ');
}

/**
 * Derive an 8-character uppercase hex fingerprint for a single public key.
 */
export async function formatShortKeyFingerprint(publicKey: string): Promise<string> {
  const payload = new TextEncoder().encode(publicKey.trim());
  const digest = await window.crypto.subtle.digest('SHA-256', payload);
  const bytes = new Uint8Array(digest).slice(0, 4);
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0').toUpperCase()).join('');
  return `${hex.slice(0, 4)} ${hex.slice(4, 8)}`;
}
