// Network & ICE/TURN Configuration Management
// Precedence: local user overrides (localStorage) > Vite environment defaults > PeerJS defaults

import { logger } from './logger';

export interface NetworkOverrides {
  signalingHost?: string;
  signalingPort?: number;
  signalingPath?: string;
  signalingSecure?: boolean;
  iceServers?: RTCIceServer[];
}

export interface EffectiveNetworkConfig {
  signalingHost?: string;
  signalingPort?: number;
  signalingPath?: string;
  signalingSecure?: boolean;
  iceServers?: RTCIceServer[];
  usingCustomSignaling: boolean;
  usingCustomIceServers: boolean;
}

const STORAGE_KEY = 'offgrid:network-overrides';
const ALLOWED_ICE_SCHEMES = ['stun:', 'stuns:', 'turn:', 'turns:'];

export function validateIceServerUrl(rawUrl: string): boolean {
  const trimmed = rawUrl.trim();
  if (!trimmed || /\s/.test(trimmed)) return false;
  const lower = trimmed.toLowerCase();
  const matchedScheme = ALLOWED_ICE_SCHEMES.find((scheme) => lower.startsWith(scheme));
  if (!matchedScheme) return false;
  const rest = trimmed.slice(matchedScheme.length);
  // Must contain a host after scheme (excluding query/empty)
  const hostPart = rest.split('?')[0];
  return hostPart.length > 0 && !/[<>'"`]/.test(trimmed);
}

export function validateSignalingHost(rawHost: string): boolean {
  const trimmed = rawHost.trim();
  if (!trimmed || trimmed.length > 253) return false;
  if (/[\s/?#<>'"`]/.test(trimmed) || trimmed.includes('://')) return false;
  return true;
}

export function validateSignalingPath(rawPath: string): boolean {
  const trimmed = rawPath.trim();
  if (!trimmed || trimmed.length > 128) return false;
  if (!trimmed.startsWith('/')) return false;
  if (/[\s?#<>'"`]/.test(trimmed) || trimmed.includes('..')) return false;
  return true;
}

export function sanitizeIceServers(servers: RTCIceServer[]): {
  valid: boolean;
  errors: string[];
  sanitized: RTCIceServer[];
} {
  const errors: string[] = [];
  const sanitized: RTCIceServer[] = [];

  for (let i = 0; i < servers.length; i++) {
    const entry = servers[i];
    if (!entry || !entry.urls) {
      errors.push(`ICE server #${i + 1} is missing a URL.`);
      continue;
    }
    const rawUrls = Array.isArray(entry.urls) ? entry.urls : [entry.urls];
    const cleanUrls = rawUrls.map((u) => String(u).trim()).filter(Boolean);
    if (cleanUrls.length === 0) {
      errors.push(`ICE server #${i + 1} has an empty URL.`);
      continue;
    }
    const invalidUrl = cleanUrls.find((u) => !validateIceServerUrl(u));
    if (invalidUrl) {
      errors.push(
        `Invalid ICE URL "${invalidUrl}". Only stun:, stuns:, turn:, and turns: are permitted.`
      );
      continue;
    }

    const cleanEntry: RTCIceServer = {
      urls: cleanUrls.length === 1 ? cleanUrls[0] : cleanUrls,
    };
    if (typeof entry.username === 'string' && entry.username.trim()) {
      cleanEntry.username = entry.username.trim();
    }
    if (typeof entry.credential === 'string' && entry.credential.trim()) {
      cleanEntry.credential = entry.credential;
    }
    sanitized.push(cleanEntry);
  }

  return { valid: errors.length === 0, errors, sanitized };
}

export function validateNetworkOverrides(input: NetworkOverrides): {
  valid: boolean;
  errors: string[];
  sanitized: NetworkOverrides;
} {
  const errors: string[] = [];
  const sanitized: NetworkOverrides = {};

  if (input.signalingHost !== undefined && input.signalingHost.trim() !== '') {
    const host = input.signalingHost.trim();
    if (!validateSignalingHost(host)) {
      errors.push('Signaling host must be a valid hostname or IP without protocol or spaces.');
    } else {
      sanitized.signalingHost = host;
    }
  }

  if (input.signalingPort !== undefined && !Number.isNaN(input.signalingPort)) {
    const port = Number(input.signalingPort);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      errors.push('Signaling port must be an integer between 1 and 65535.');
    } else {
      sanitized.signalingPort = port;
    }
  }

  if (input.signalingPath !== undefined && input.signalingPath.trim() !== '') {
    const path = input.signalingPath.trim();
    if (!validateSignalingPath(path)) {
      errors.push('Signaling path must start with "/" and contain no spaces or "..".');
    } else {
      sanitized.signalingPath = path;
    }
  }

  if (typeof input.signalingSecure === 'boolean') {
    sanitized.signalingSecure = input.signalingSecure;
  }

  if (input.iceServers !== undefined) {
    const iceResult = sanitizeIceServers(input.iceServers);
    if (!iceResult.valid) {
      errors.push(...iceResult.errors);
    } else {
      sanitized.iceServers = iceResult.sanitized;
    }
  }

  return { valid: errors.length === 0, errors, sanitized };
}

export function getEnvNetworkDefaults(): NetworkOverrides {
  let iceServers: RTCIceServer[] | undefined;
  try {
    const raw = import.meta.env.VITE_ICE_SERVERS as string | undefined;
    if (raw && raw.trim() !== '') {
      const parsed = JSON.parse(raw) as RTCIceServer[];
      if (Array.isArray(parsed)) {
        const res = sanitizeIceServers(parsed);
        if (res.valid) {
          iceServers = res.sanitized;
        } else {
          logger.warn('[Network] Ignored invalid VITE_ICE_SERVERS entries:', res.errors.join('; '));
        }
      }
    }
  } catch {
    logger.warn('[Network] Failed to parse VITE_ICE_SERVERS env var');
  }

  const rawHost = import.meta.env.VITE_PEERJS_HOST as string | undefined;
  const rawPort = import.meta.env.VITE_PEERJS_PORT as string | undefined;
  const rawSecure = import.meta.env.VITE_PEERJS_SECURE as string | undefined;
  const rawPath = import.meta.env.VITE_PEERJS_PATH as string | undefined;

  const parsedPort = rawPort && rawPort.trim() !== '' ? Number(rawPort) : undefined;
  const parsedSecure =
    rawSecure === 'true' ? true : rawSecure === 'false' ? false : undefined;

  const rawConfig: NetworkOverrides = {
    signalingHost: rawHost?.trim() || undefined,
    signalingPort: parsedPort,
    signalingPath: rawPath?.trim() || undefined,
    signalingSecure: parsedSecure,
    iceServers,
  };

  const validated = validateNetworkOverrides(rawConfig);
  if (!validated.valid) {
    logger.warn('[Network] Invalid env signaling defaults ignored:', validated.errors.join('; '));
    return { iceServers };
  }
  return validated.sanitized;
}

export function loadNetworkOverrides(): NetworkOverrides | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as NetworkOverrides;
    const result = validateNetworkOverrides(parsed);
    return result.valid ? result.sanitized : null;
  } catch {
    return null;
  }
}

export function saveNetworkOverrides(overrides: NetworkOverrides): NetworkOverrides {
  const result = validateNetworkOverrides(overrides);
  if (!result.valid) {
    throw new Error(result.errors[0] || 'Invalid network configuration.');
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(result.sanitized));
  return result.sanitized;
}

export function clearNetworkOverrides(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage unavailability
  }
}

export function getEffectiveNetworkConfig(): EffectiveNetworkConfig {
  const env = getEnvNetworkDefaults();
  const overrides = loadNetworkOverrides();

  const signalingHost = overrides?.signalingHost ?? env.signalingHost;
  const signalingPort = overrides?.signalingPort ?? env.signalingPort;
  const signalingPath = overrides?.signalingPath ?? env.signalingPath;
  const signalingSecure = overrides?.signalingSecure ?? env.signalingSecure;
  const iceServers = overrides?.iceServers ?? env.iceServers;

  const usingCustomSignaling = Boolean(
    overrides &&
      (overrides.signalingHost !== undefined ||
        overrides.signalingPort !== undefined ||
        overrides.signalingPath !== undefined ||
        overrides.signalingSecure !== undefined)
  );
  const usingCustomIceServers = Boolean(overrides && overrides.iceServers !== undefined);

  return {
    signalingHost,
    signalingPort,
    signalingPath,
    signalingSecure,
    iceServers,
    usingCustomSignaling,
    usingCustomIceServers,
  };
}

export function describeSignalingEndpoint(config: {
  signalingHost?: string;
  signalingPort?: number;
  signalingPath?: string;
  signalingSecure?: boolean;
}): string {
  if (!config.signalingHost) {
    return 'PeerJS Public Cloud (0.peerjs.com)';
  }
  const scheme = config.signalingSecure === true ? 'wss' : config.signalingSecure === false ? 'ws' : 'auto';
  const port = config.signalingPort !== undefined ? `:${config.signalingPort}` : '';
  const path = config.signalingPath || '/';
  return `${scheme}://${config.signalingHost}${port}${path}`;
}

export function hasTurnIceServer(iceServers?: RTCIceServer[]): boolean {
  if (!iceServers) return false;
  return iceServers.some((server) => {
    const urls = Array.isArray(server.urls) ? server.urls : [server.urls];
    return urls.some((url) => {
      const lower = String(url).trim().toLowerCase();
      return lower.startsWith('turn:') || lower.startsWith('turns:');
    });
  });
}

export function redactIceServers(iceServers?: RTCIceServer[]): Array<{ urls: string | string[]; hasCredentials: boolean }> {
  if (!iceServers) return [];
  return iceServers.map((s) => ({
    urls: s.urls,
    hasCredentials: Boolean(s.username || s.credential),
  }));
}
