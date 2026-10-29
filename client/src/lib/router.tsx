import { useEffect, useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent } from 'react';

// A pushState router: ten-odd routes do not need a routing library.
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('popstate', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('popstate', listener);
  };
}

const snapshot = () => window.location.pathname + window.location.search + window.location.hash;

export function useLocation(): string {
  return useSyncExternalStore(subscribe, snapshot);
}

export function usePathname(): string {
  return useLocation().split(/[?#]/)[0];
}

export function navigate(to: string, { replace = false } = {}): void {
  if (to === snapshot()) return;
  window.history[replace ? 'replaceState' : 'pushState']({}, '', to);
  listeners.forEach((listener) => listener());
}

/** Scrolls to the top on a new page, or to the #section a link points at. */
export function useScrollOnNavigate(location: string): void {
  useEffect(() => {
    const id = location.split('#')[1];
    const target = id ? document.getElementById(id) : null;
    if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [location]);
}

/** Matches "/work/:slug" against a path and returns the params, or null. */
export function match(pattern: string, path: string): Record<string, string> | null {
  const want = pattern.split('/');
  const have = path.replace(/\/+$/, '').split('/');
  if (path === '/') have.splice(1, 1, '');
  if (want.length !== have.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < want.length; i++) {
    if (want[i].startsWith(':')) params[want[i].slice(1)] = decodeURIComponent(have[i]);
    else if (want[i] !== have[i]) return null;
  }
  return params;
}

/** Only same-site admin paths are followed after sign-in. */
export function safeNext(search: string): string {
  const next = new URLSearchParams(search).get('next') ?? '';
  return /^\/admin\/(?!login)[\w\-/]*$/.test(next) ? next : '/admin/inbox';
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export function Link({ href, onClick, ...props }: LinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!href.startsWith('/') || props.target) return;
    event.preventDefault();
    navigate(href);
  };
  return <a href={href} onClick={handleClick} {...props} />;
}
