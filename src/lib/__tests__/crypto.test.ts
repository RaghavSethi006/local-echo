import { describe, it, expect } from 'vitest';
import {
  generateKeyPair,
  generateSigningKeyPair,
  exportKeyPairJwk,
  importKeyPairJwk,
  exportSigningKeyPairJwk,
  importSigningKeyPairJwk,
  importPublicKey,
  deriveSharedKey,
  encrypt,
  decrypt,
  signData,
  verifySignature,
  generateStorageKey,
  exportStorageKey,
  importStorageKey,
  generateId,
  computeSafetyNumber,
  formatShortKeyFingerprint,
} from '../crypto';

describe('generateKeyPair', () => {
  it('should generate ECDH P-256 keys', async () => {
    const keyPair = await generateKeyPair();
    expect(keyPair).toBeDefined();
    expect(keyPair.publicKeyString).toBeDefined();
    expect(typeof keyPair.publicKeyString).toBe('string');
    expect(keyPair.publicKeyString.length).toBeGreaterThan(0);
  });

  it('should export and re-import ECDH keypair via JWK', async () => {
    const original = await generateKeyPair();
    const jwk = await exportKeyPairJwk(original);
    const restored = await importKeyPairJwk(jwk.publicKeyJwk, jwk.privateKeyJwk, jwk.publicKeyString);
    expect(restored.publicKeyString).toBe(original.publicKeyString);

    const peer = await generateKeyPair();
    const peerPub = await importPublicKey(peer.publicKeyString);
    const keyOriginal = await deriveSharedKey(original.privateKey, peerPub);
    const keyRestored = await deriveSharedKey(restored.privateKey, peerPub);

    const encrypted = await encrypt('jwk-persistence-check', keyOriginal);
    expect(await decrypt(encrypted, keyRestored)).toBe('jwk-persistence-check');
  });
});

describe('generateSigningKeyPair', () => {
  it('should generate ECDSA P-256 signing keys', async () => {
    const signingPair = await generateSigningKeyPair();
    expect(signingPair).toBeDefined();
    expect(signingPair.verifyKeyString).toBeDefined();
    expect(typeof signingPair.verifyKeyString).toBe('string');
    expect(signingPair.verifyKeyString.length).toBeGreaterThan(0);
  });

  it('should export and re-import ECDSA signing keypair via JWK', async () => {
    const original = await generateSigningKeyPair();
    const jwk = await exportSigningKeyPairJwk(original);
    const restored = await importSigningKeyPairJwk(jwk.verifyKeyJwk, jwk.signingKeyJwk, jwk.verifyKeyString);
    expect(restored.verifyKeyString).toBe(original.verifyKeyString);

    const sig = await signData('persisted-invite', restored.signingKey);
    expect(await verifySignature('persisted-invite', sig, original.verifyKeyString)).toBe(true);
  });
});

describe('encrypt/decrypt round trip', () => {
  it('should encrypt and decrypt text', async () => {
    const alice = await generateKeyPair();
    const bob = await generateKeyPair();
    const bobPub = await importPublicKey(bob.publicKeyString);
    const sharedKey = await deriveSharedKey(alice.privateKey, bobPub);

    const plaintext = 'Hello, P2P World!';
    const encrypted = await encrypt(plaintext, sharedKey);
    expect(encrypted).toBeDefined();
    expect(encrypted).not.toBe(plaintext);

    const alicePub = await importPublicKey(alice.publicKeyString);
    const bobSharedKey = await deriveSharedKey(bob.privateKey, alicePub);
    const decrypted = await decrypt(encrypted, bobSharedKey);
    expect(decrypted).toBe(plaintext);
  });

  it('should encrypt and decrypt large (>100KB) payloads without call-stack overflow', async () => {
    const alice = await generateKeyPair();
    const bob = await generateKeyPair();
    const bobPub = await importPublicKey(bob.publicKeyString);
    const sharedKey = await deriveSharedKey(alice.privateKey, bobPub);

    const largeText = 'OffGrid-Payload-'.repeat(8192);
    const encrypted = await encrypt(largeText, sharedKey);
    const decrypted = await decrypt(encrypted, sharedKey);
    expect(decrypted).toBe(largeText);
  });

  it('should produce different ciphertexts for same plaintext', async () => {
    const alice = await generateKeyPair();
    const bob = await generateKeyPair();
    const bobPub = await importPublicKey(bob.publicKeyString);
    const sharedKey = await deriveSharedKey(alice.privateKey, bobPub);

    const plaintext = 'Same text';
    const encrypted1 = await encrypt(plaintext, sharedKey);
    const encrypted2 = await encrypt(plaintext, sharedKey);
    expect(encrypted1).not.toBe(encrypted2);
  });
});

describe('sign/verify', () => {
  it('should sign and verify data', async () => {
    const signingPair = await generateSigningKeyPair();
    const data = 'message-to-sign';
    const signature = await signData(data, signingPair.signingKey);
    expect(signature).toBeDefined();
    expect(typeof signature).toBe('string');

    const isValid = await verifySignature(data, signature, signingPair.verifyKeyString);
    expect(isValid).toBe(true);
  });

  it('should reject tampered data', async () => {
    const signingPair = await generateSigningKeyPair();
    const data = 'original-message';
    const signature = await signData(data, signingPair.signingKey);

    const isValid = await verifySignature('tampered-message', signature, signingPair.verifyKeyString);
    expect(isValid).toBe(false);
  });

  it('should reject signature from different key', async () => {
    const alice = await generateSigningKeyPair();
    const bob = await generateSigningKeyPair();
    const data = 'test-message';
    const signature = await signData(data, alice.signingKey);

    const isValid = await verifySignature(data, signature, bob.verifyKeyString);
    expect(isValid).toBe(false);
  });
});

describe('generateId', () => {
  it('should generate a 32-character hex string', () => {
    const id = generateId();
    expect(id).toMatch(/^[0-9a-f]{32}$/);
  });

  it('should generate unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe('storage key', () => {
  it('should generate and export/import storage keys', async () => {
    const key = await generateStorageKey();
    expect(key).toBeDefined();

    const exported = await exportStorageKey(key);
    expect(exported).toBeDefined();
    expect(exported.kty).toBe('oct');

    const imported = await importStorageKey(exported);
    expect(imported).toBeDefined();
  });
});

describe('shared key derivation', () => {
  it('should derive same key from both sides', async () => {
    const alice = await generateKeyPair();
    const bob = await generateKeyPair();

    const bobPub = await importPublicKey(bob.publicKeyString);
    const alicePub = await importPublicKey(alice.publicKeyString);

    const aliceShared = await deriveSharedKey(alice.privateKey, bobPub);
    const bobShared = await deriveSharedKey(bob.privateKey, alicePub);

    const aliceExported = await exportStorageKey(aliceShared);
    const bobExported = await exportStorageKey(bobShared);

    expect(aliceExported.k).toBe(bobExported.k);
  });
});

describe('Safety Numbers & Fingerprints', () => {
  it('computes identical 12x5-digit Safety Numbers regardless of key order', async () => {
    const alice = await generateKeyPair();
    const bob = await generateKeyPair();

    const numAB = await computeSafetyNumber(alice.publicKeyString, bob.publicKeyString);
    const numBA = await computeSafetyNumber(bob.publicKeyString, alice.publicKeyString);

    expect(numAB).toBe(numBA);
    expect(numAB).toMatch(/^(\d{5} ){11}\d{5}$/);
  });

  it('produces a different Safety Number when a peer key changes', async () => {
    const alice = await generateKeyPair();
    const bob = await generateKeyPair();
    const mallory = await generateKeyPair();

    const numLegit = await computeSafetyNumber(alice.publicKeyString, bob.publicKeyString);
    const numChanged = await computeSafetyNumber(alice.publicKeyString, mallory.publicKeyString);

    expect(numLegit).not.toBe(numChanged);
  });

  it('formats 8-character uppercase hex short fingerprints', async () => {
    const alice = await generateKeyPair();
    const fp = await formatShortKeyFingerprint(alice.publicKeyString);
    expect(fp).toMatch(/^[0-9A-F]{4} [0-9A-F]{4}$/);
  });
});
