import { describe, it, expect } from 'vitest';
import { formatProfileURI, parseProfileQR, parseSafeHttpUrl } from '../qr';

describe('QR profile URI helpers', () => {
  it('formats and parses offgrid-profile:// URIs', () => {
    const uri = formatProfileURI('peer-1234', 'Alice');
    expect(uri).toBe('offgrid-profile://peer-1234@Alice');
    expect(parseProfileQR(uri)).toEqual({ peerId: 'peer-1234', username: 'Alice' });
  });

  it('parses legacy local-echo-profile:// URIs', () => {
    expect(parseProfileQR('local-echo-profile://peer-abc@Bob')).toEqual({
      peerId: 'peer-abc',
      username: 'Bob',
    });
  });

  it('splits on the last @ separator using lastIndexOf', () => {
    expect(parseProfileQR('offgrid-profile://peer-1@alice@home')).toEqual({
      peerId: 'peer-1@alice',
      username: 'home',
    });
  });

  it('rejects malformed or unsafe profile URIs', () => {
    expect(parseProfileQR('https://example.com')).toBeNull();
    expect(parseProfileQR('offgrid-profile://@Alice')).toBeNull();
    expect(parseProfileQR('offgrid-profile://no-at-sign')).toBeNull();
    expect(parseProfileQR('offgrid-profile://bad id@Alice')).toBeNull();
  });
});

describe('parseSafeHttpUrl', () => {
  it('allows http and https URLs', () => {
    expect(parseSafeHttpUrl('https://example.com/path?a=1')).toBe('https://example.com/path?a=1');
    expect(parseSafeHttpUrl('http://localhost:3000')).toBe('http://localhost:3000/');
  });

  it('rejects javascript, data, and invalid URLs', () => {
    expect(parseSafeHttpUrl('javascript:alert(1)')).toBeNull();
    expect(parseSafeHttpUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
    expect(parseSafeHttpUrl('not a url')).toBeNull();
  });
});
