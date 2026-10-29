import { useEffect, useState, type ReactNode } from 'react';
import { List, X } from '@phosphor-icons/react';
import { nav, site } from '@/lib/config';
import { useBaliTime } from '@/lib/hooks';
import { Link, usePathname } from '@/lib/router';

export const current = (pathname: string, href: string) =>
  pathname === href || (href !== '/' && pathname.startsWith(href + '/')) ? ('page' as const) : undefined;

export function SiteLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const time = useBaliTime();
  const [open, setOpen] = useState(false);

  // The menu closes on navigation and on Escape.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="top">
        <div className="wrap top-in">
          <Link className="brand" href="/">
            Ralph de Vinca <span className="m mu">Group</span>
          </Link>
          <nav className="nav public" aria-label="Primary">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} aria-current={current(pathname, item.href)}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="top-r">
            <p className="m clock hide-s">
              <span className="mu">Local time</span>
              <br />
              Bali {time}
            </p>
            {pathname !== '/contact' && (
              <Link className="chip hide-s" href="/contact">Start a project</Link>
            )}
            <button className="burger" type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mm" aria-label={open ? 'Close menu' : 'Open menu'}>
              {open ? <X size={26} aria-hidden="true" /> : <List size={26} aria-hidden="true" />}
            </button>
          </div>
        </div>
        {open && (
          <nav id="mm" className="wrap mm" aria-label="Menu">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} aria-current={current(pathname, item.href)}>
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <main id="main">{children}</main>
      <footer className="foot">
        <div className="wrap">
          <div className="g12" style={{ rowGap: 8, marginBottom: 40, alignItems: 'start' }}>
            <p className="m" style={{ gridColumn: '1 / 5', margin: 0 }}>
              Wisdom that binds,
              <br />
              and endures.
            </p>
            <p className="m mu" style={{ gridColumn: '5 / 8', margin: 0 }}>
              {site.name}
              <br />
              {site.location}
            </p>
            <p className="m" style={{ gridColumn: '8 / 11', margin: 0, textTransform: 'none' }}>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </p>
            <p className="m" style={{ gridColumn: '11 / 13', margin: 0 }}>
              <Link href="/privacy" aria-current={current(pathname, '/privacy')}>Privacy</Link>
            </p>
          </div>
          <p className="foot-word" aria-hidden="true">Ralph de Vinca</p>
        </div>
      </footer>
    </>
  );
}
