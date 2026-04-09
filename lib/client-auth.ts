export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number | null;
  tokenType?: string | null;
  user?: {
    id: string;
    email?: string | null;
    emailConfirmedAt?: string | null;
  };
  roleCodes?: string[];
  primaryRole?: string | null;
}

const SESSION_KEY = 'mexgo_session';

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === 'undefined') {
    return;
  }

  const isHttps = window.location.protocol === 'https:';
  const securePart = isHttps ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${securePart}`;
}

function clearCookie(name: string) {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function saveSession(session: StoredSession) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.localStorage.setItem('mexgo_access_token', session.accessToken);

  setCookie('mexgo_access_token', session.accessToken, 60 * 60 * 24 * 7);
  setCookie('mexgo_primary_role', session.primaryRole || '', 60 * 60 * 24 * 7);
}

export function getStoredSession(): StoredSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(SESSION_KEY);
    window.localStorage.removeItem('mexgo_access_token');
    window.localStorage.removeItem('accessToken');

    for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
      const key = window.localStorage.key(index);
      if (key && /^sb-.*-auth-token$/.test(key)) {
        window.localStorage.removeItem(key);
      }
    }
  }

  clearCookie('mexgo_access_token');
  clearCookie('mexgo_primary_role');
}

export function getStoredAccessToken(): string | null {
  const storedSession = getStoredSession();
  if (storedSession?.accessToken) {
    return storedSession.accessToken;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  const directKeys = ['mexgo_access_token', 'accessToken'];
  for (const key of directKeys) {
    const value = window.localStorage.getItem(key);
    if (value && value.trim()) {
      return value.trim();
    }
  }

  // Supabase client stores auth data in keys like sb-<project-ref>-auth-token.
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key || !/^sb-.*-auth-token$/.test(key)) {
      continue;
    }

    const raw = window.localStorage.getItem(key);
    if (!raw) {
      continue;
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && typeof parsed[0] === 'string' && parsed[0].trim()) {
        return parsed[0].trim();
      }

      if (typeof parsed === 'object' && parsed !== null) {
        const maybeObject = parsed as { access_token?: unknown };
        if (typeof maybeObject.access_token === 'string' && maybeObject.access_token.trim()) {
          return maybeObject.access_token.trim();
        }
      }
    } catch {
      // Ignore malformed storage payload.
    }
  }

  return null;
}

