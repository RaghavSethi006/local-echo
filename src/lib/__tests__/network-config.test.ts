import { describe, it, expect, beforeEach } from 'vitest';
import {
  clearNetworkOverrides,
  describeSignalingEndpoint,
  hasTurnIceServer,
  loadNetworkOverrides,
  redactIceServers,
  saveNetworkOverrides,
  validateIceServerUrl,
  validateNetworkOverrides,
} from '../network-config';

describe('network-config', () => {
  beforeEach(() => {
    clearNetworkOverrides();
  });

  it('permits valid STUN/TURN URLs and blocks unsafe schemes', () => {
    expect(validateIceServerUrl('stun:stun.l.google.com:19302')).toBe(true);
    expect(validateIceServerUrl('turn:relay.example.com:3478?transport=udp')).toBe(true);
    expect(validateIceServerUrl('turns:relay.example.com:5349')).toBe(true);
    expect(validateIceServerUrl('javascript:alert(1)')).toBe(false);
    expect(validateIceServerUrl('http://example.com')).toBe(false);
    expect(validateIceServerUrl('data:text/plain,hello')).toBe(false);
    expect(validateIceServerUrl('stun:')).toBe(false);
  });

  it('validates signaling host, port, path, and ICE entries', () => {
    const valid = validateNetworkOverrides({
      signalingHost: 'signal.example.com',
      signalingPort: 9000,
      signalingPath: '/offgrid',
      signalingSecure: true,
      iceServers: [{ urls: 'turn:turn.example.com:3478', username: 'u', credential: 'p' }],
    });
    expect(valid.valid).toBe(true);
    expect(valid.sanitized.signalingHost).toBe('signal.example.com');

    const badHost = validateNetworkOverrides({ signalingHost: 'https://signal.example.com' });
    expect(badHost.valid).toBe(false);

    const badPort = validateNetworkOverrides({ signalingPort: 99999 });
    expect(badPort.valid).toBe(false);

    const badPath = validateNetworkOverrides({ signalingPath: 'no-leading-slash' });
    expect(badPath.valid).toBe(false);
  });

  it('persists, loads, and clears local overrides', () => {
    saveNetworkOverrides({
      signalingHost: '127.0.0.1',
      signalingPort: 9100,
      signalingPath: '/offgrid',
      signalingSecure: false,
      iceServers: [{ urls: 'stun:stun.example.com:3478' }],
    });

    const loaded = loadNetworkOverrides();
    expect(loaded?.signalingHost).toBe('127.0.0.1');
    expect(loaded?.signalingPort).toBe(9100);
    expect(loaded?.signalingSecure).toBe(false);

    clearNetworkOverrides();
    expect(loadNetworkOverrides()).toBeNull();
  });

  it('formats signaling endpoint summary and redacts TURN credentials', () => {
    expect(describeSignalingEndpoint({})).toContain('PeerJS Public Cloud');
    expect(
      describeSignalingEndpoint({
        signalingHost: 'signal.offgrid.local',
        signalingPort: 9000,
        signalingPath: '/mesh',
        signalingSecure: true,
      })
    ).toBe('wss://signal.offgrid.local:9000/mesh');

    const ice: RTCIceServer[] = [
      { urls: 'stun:stun.example.com:3478' },
      { urls: 'turn:turn.example.com:3478', username: 'alice', credential: 'secret-password' },
    ];
    expect(hasTurnIceServer(ice)).toBe(true);
    expect(hasTurnIceServer([{ urls: 'stun:stun.example.com:3478' }])).toBe(false);

    const redacted = redactIceServers(ice);
    expect(JSON.stringify(redacted)).not.toContain('secret-password');
    expect(redacted[1].hasCredentials).toBe(true);
  });
});
