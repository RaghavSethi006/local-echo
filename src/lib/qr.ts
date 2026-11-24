export const PROFILE_SCHEME = 'offgrid-profile://';
export const LEGACY_PROFILE_SCHEME = 'local-echo-profile://';

export interface ParsedProfileQR {
  peerId: string;
  username?: string;
}

export function formatProfileURI(peerId: string, username: string): string {
  return `${PROFILE_SCHEME}${peerId}@${username}`;
}

export function parseProfileQR(raw: string): ParsedProfileQR | null {
  const trimmed = raw.trim();
  let rest: string | null = null;
  if (trimmed.startsWith(PROFILE_SCHEME)) {
    rest = trimmed.slice(PROFILE_SCHEME.length);
  } else if (trimmed.startsWith(LEGACY_PROFILE_SCHEME)) {
    rest = trimmed.slice(LEGACY_PROFILE_SCHEME.length);
  }
  if (rest === null) return null;

  const atIdx = rest.lastIndexOf('@');
  if (atIdx <= 0) return null;

  const peerId = rest.slice(0, atIdx).trim();
  const username = rest.slice(atIdx + 1).trim();
  const hasWhitespaceOrControl = [...peerId].some(ch => ch.charCodeAt(0) < 32 || /\s/.test(ch));
  if (!peerId || peerId.length > 128 || hasWhitespaceOrControl) {
    return null;
  }

  return {
    peerId,
    username: username ? username.slice(0, 64) : undefined,
  };
}

export function parseSafeHttpUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.href;
    }
    return null;
  } catch {
    return null;
  }
}
