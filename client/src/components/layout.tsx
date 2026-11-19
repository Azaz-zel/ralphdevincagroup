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
          <Link className="brand" href="/">Ralph de Vinca Group</Link>
          <nav className="nav public" aria-label="Primary">
            {nav.map((item) => (
              <Link key={item.href} className="glowbar" href={item.href} aria-current={current(pathname, item.href)}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="top-r">
            <p className="mono mu hide-s" style={{ margin: 0 }}>Bali {time}</p>
            {pathname !== '/contact' && <Link className="btn ink sm hide-s" href="/contact">Start a project</Link>}
            <button className="burger icon-btn" type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mm" aria-label={open ? 'Close menu' : 'Open menu'}>
              {open ? <X size={22} aria-hidden="true" /> : <List size={22} aria-hidden="true" />}
            </button>
          </div>
        </div>
        {open && (
          <nav id="mm" className="mm" aria-label="Menu">
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
          <div className="foot-in">
            <p className="mono" style={{ margin: 0 }}>{site.tagline}</p>
            <p className="mono mu" style={{ margin: 0 }}>{site.name} · {site.location}</p>
            <a className="mono" href={`mailto:${site.email}`} style={{ textTransform: 'none' }}>{site.email}</a>
            <Link className="mono" href="/privacy" aria-current={current(pathname, '/privacy')}>Privacy</Link>
          </div>
          <p className="foot-word" aria-hidden="true">Ralph de Vinca</p>
        </div>
      </footer>
    </>
  );
}
