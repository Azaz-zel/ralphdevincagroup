import { useEffect, useState } from 'react';
import { site } from './config';

export function useTitle(title: string | undefined, description?: string): void {
  useEffect(() => {
    if (title) document.title = title;
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [title, description]);
}

function baliTime(): string {
  try {
    return new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Makassar', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '--:--';
  }
}

/** The time in Bali (WITA), so a visitor can tell when a reply is likely. */
export function useBaliTime(): string {
  const [time, setTime] = useState(baliTime);
  useEffect(() => {
    const timer = setInterval(() => setTime(baliTime()), 30_000);
    return () => clearInterval(timer);
  }, []);
  return time;
}

export const pageTitle = (name: string) => `${name} | ${site.name}`;

/** True when the visitor asked for less motion. Follows the setting if it changes. */
export function useReducedMotion(): boolean {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(() => typeof matchMedia === 'function' && matchMedia(query).matches);
  useEffect(() => {
    const list = matchMedia(query);
    const update = () => setReduced(list.matches);
    list.addEventListener('change', update);
    return () => list.removeEventListener('change', update);
  }, []);
  return reduced;
}

/** True while the media query matches. */
export function useMedia(query: string): boolean {
  const [hit, setHit] = useState(() => typeof matchMedia === 'function' && matchMedia(query).matches);
  useEffect(() => {
    const list = matchMedia(query);
    const update = () => setHit(list.matches);
    update();
    list.addEventListener('change', update);
    return () => list.removeEventListener('change', update);
  }, [query]);
  return hit;
}
