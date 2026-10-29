import { useEffect, useState, type ReactNode } from 'react';
import { useApi } from '@/lib/api';
import { Link, navigate, usePathname } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import type { InboxResponse } from '@/lib/types';
import { current } from './layout';

/** Sends anyone without a session to the sign-in page. The API checks the account itself. */
export default function AdminShell({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      else navigate('/admin/login?next=' + encodeURIComponent(window.location.pathname), { replace: true });
    });
  }, []);
  return ready ? <AdminLayout>{children}</AdminLayout> : null;
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // Only the counts are needed; the list itself is small.
  const inbox = useApi<InboxResponse>('/admin/inquiries?status=new');
  const unread = inbox.data?.counts.new ?? 0;
  const { reload } = inbox;
  // Refresh the unread count on every admin page change, so reading a message clears it.
  useEffect(() => reload(), [pathname, reload]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login', { replace: true });
  };

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="top">
        <div className="wrap top-in admin">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link className="brand" href="/">Ralph de Vinca</Link>
            <span className="chip static">Admin</span>
          </div>
          <nav className="nav" aria-label="Admin">
            <Link href="/admin/inbox" aria-current={current(pathname, '/admin/inbox')}>
              Inbox
              {unread > 0 && <span className="count" aria-label={`${unread} new`}>{unread}</span>}
            </Link>
            <Link href="/admin/projects" aria-current={current(pathname, '/admin/projects')}>Projects</Link>
          </nav>
          <div className="top-r">
            <Link className="m hide-s" href="/" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44 }}>View site</Link>
            <button className="chip t" type="button" onClick={signOut}>Sign out</button>
          </div>
        </div>
      </header>
      <main id="main" className="wrap" style={{ paddingTop: 40, paddingBottom: 112 }}>
        {children}
      </main>
    </>
  );
}
