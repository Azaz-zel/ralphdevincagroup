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
