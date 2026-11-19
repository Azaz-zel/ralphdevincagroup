import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useApi } from '@/lib/api';
import { Link, navigate, usePathname } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import type { InboxResponse } from '@/lib/types';
import { current } from './layout';
import { PerfumeryMark } from './marks';

/** Sends anyone without a session to the sign-in page. The API checks the account itself. */
export default function AdminShell({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    // Read the address now: by the time the session check answers, a second run may already be on /admin/login.
    const from = window.location.pathname;
    let live = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!live) return;
      if (data.session) setEmail(data.session.user.email ?? '');
      else navigate('/admin/login?next=' + encodeURIComponent(from), { replace: true });
    });
    return () => {
      live = false;
    };
  }, []);
  return email === null ? null : <AdminLayout email={email}>{children}</AdminLayout>;
}

export function AdminLayout({ email, children }: { email: string; children: ReactNode }) {
  const pathname = usePathname();
  const inbox = useApi<InboxResponse>('/admin/inquiries?status=new');
  const projects = useApi<unknown[]>('/admin/projects');
  const unread = inbox.data?.counts.new ?? 0;
  const { reload } = inbox;
  const reloadProjects = projects.reload;
  // Refresh both counts on every admin page change, so reading a message or adding a project shows at once.
  useEffect(() => {
    reload();
    reloadProjects();
  }, [pathname, reload, reloadProjects]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login', { replace: true });
  };

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <div className="admin">
        <aside className="side" aria-label="Admin">
          <Link className="brand" href="/">
            <PerfumeryMark size={28} className="gold" />
            <span>Ralph de Vinca<small>Admin</small></span>
          </Link>
          <Link className="side-link" href="/admin/inbox" aria-current={current(pathname, '/admin/inbox')}>
            <span>Inbox</span>
            {unread > 0 && <span className="badge" aria-label={`${unread} unread`}>{unread}</span>}
          </Link>
          <Link className="side-link" href="/admin/projects" aria-current={current(pathname, '/admin/projects')}>
            <span>Projects</span>
            {projects.data && <span className="badge soft" aria-label={`${projects.data.length} projects`}>{projects.data.length}</span>}
          </Link>
          <Link className="side-link" href="/">View the site</Link>
          <div className="spacer" />
          <div className="who">
            <span className="mono mu">{email}</span>
            <button type="button" className="btn line sm" onClick={signOut}>Sign out</button>
          </div>
        </aside>
        <main id="main" className="a-main">{children}</main>
      </div>
    </>
  );
}

/** A short confirmation at the foot of the screen, with an optional Undo. It clears itself after five seconds. */
export function useToast() {
  const [toast, setToast] = useState<{ text: string; undo?: () => void } | null>(null);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  const show = useCallback((text: string, undo?: () => void) => {
    clearTimeout(timer.current);
    setToast({ text, undo });
    timer.current = window.setTimeout(() => setToast(null), 5000);
  }, []);
  const node = (
    <div role="status" aria-live="polite">
      {toast && (
        <div className="toast">
          <span>{toast.text}</span>
          {toast.undo && (
            <button
              type="button"
              onClick={() => {
                toast.undo?.();
                setToast(null);
              }}
            >
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  );
  return { node, show };
}
