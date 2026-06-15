import { describe, it, expect } from 'vitest';
import {
  generateKeyPair,
  generateSigningKeyPair,
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
} from '../crypto';

describe('generateKeyPair', () => {
  it('should generate ECDH P-256 keys', async () => {
    const keyPair = await generateKeyPair();
    expect(keyPair).toBeDefined();
    expect(keyPair.publicKeyString).toBeDefined();
    expect(typeof keyPair.publicKeyString).toBe('string');
    expect(keyPair.publicKeyString.length).toBeGreaterThan(0);
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
