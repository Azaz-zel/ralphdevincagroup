import { useCallback, useEffect, useState } from 'react';
import { navigate } from './router';

export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type Options = Omit<RequestInit, 'body'> & { json?: unknown; body?: BodyInit };

export async function api<T>(path: string, { json, headers, ...init }: Options = {}): Promise<T> {
  const finalHeaders = new Headers(headers);
  if (json !== undefined) finalHeaders.set('Content-Type', 'application/json');
  if (path.startsWith('/admin')) {
    // Loaded only for admin calls, so public visitors never download the Supabase client.
    const { supabase } = await import('./supabase');
    const { data } = await supabase.auth.getSession();
    if (data.session) finalHeaders.set('Authorization', `Bearer ${data.session.access_token}`);
  }

  let response: Response;
  try {
    response = await fetch(API_BASE + path, {
      ...init,
      headers: finalHeaders,
      body: json !== undefined ? JSON.stringify(json) : init.body,
    });
  } catch {
    throw new ApiError('The server could not be reached. Check your connection and try again.', 0);
  }

  if (response.status === 401 && path.startsWith('/admin')) {
    navigate('/admin/login?next=' + encodeURIComponent(window.location.pathname), { replace: true });
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
    throw new ApiError(typeof message === 'string' ? message : 'Something went wrong. Try again in a moment.', response.status);
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<ApiError>();
  const [loading, setLoading] = useState(path !== null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (path === null) return;
    let live = true;
    setLoading(true);
    setError(undefined);
    api<T>(path)
      .then((result) => live && setData(result))
      .catch((caught: ApiError) => live && setError(caught))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [path, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { data, setData, error, loading, reload };
}
