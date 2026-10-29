const KEY = 'rdv-admin-token';

// The admin session token from /auth/login. Storage can throw in a locked-down browser; that just means signed out.
export function getToken(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(KEY, token);
    else localStorage.removeItem(KEY);
  } catch {
    // Nothing to keep or clear.
  }
}
