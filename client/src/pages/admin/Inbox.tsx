import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, MagnifyingGlass } from '@phosphor-icons/react';
import { useToast } from '@/components/admin-shell';
import { LoadError } from '@/components/ui';
import { api, useApi } from '@/lib/api';
import { ago, dateTime, divisionLabel, plural } from '@/lib/format';
import { pageTitle, useTitle } from '@/lib/hooks';
import { Link, navigate, useLocation } from '@/lib/router';
import type { InboxResponse, Inquiry, InquiryStatus } from '@/lib/types';

const FILTERS: { value: InquiryStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'replied', label: 'Replied' },
  { value: 'archived', label: 'Archived' },
];
const DONE: Record<InquiryStatus, string> = {
  new: 'Marked unread.',
  read: 'Moved back to the inbox.',
  replied: 'Marked as replied.',
  archived: 'Archived.',
};

/** The inbox and the open message side by side. On a phone the open message takes the whole screen. */
export default function Inbox({ id }: { id?: string }) {
  const location = useLocation();
  const search = location.split('?')[1]?.split('#')[0] ?? '';
  const params = new URLSearchParams(search);
  const status = params.get('status') ?? '';
  const q = params.get('q') ?? '';
  const query = new URLSearchParams({ ...(status && { status }), ...(q && { q }) }).toString();
  const list = useApi<InboxResponse>('/admin/inquiries' + (query ? '?' + query : ''));
  const open = useApi<Inquiry>(id ? `/admin/inquiries/${encodeURIComponent(id)}` : null);
  const [text, setText] = useState(q);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState('');
  const toast = useToast();
  useTitle(pageTitle(open.data ? `Message from ${open.data.name}` : 'Inbox'));
  useEffect(() => setText(q), [q]);

  const { data, setData } = list;
  // Opening a message marks it read on the server; show that in the list without reloading it.
  useEffect(() => {
    const opened = open.data;
    if (!opened) return;
    setData((current) => {
      const before = current?.items.find((row) => row.id === opened.id);
      if (!current || !before || before.status === opened.status) return current;
      return {
        ...current,
        counts: { ...current.counts, [before.status]: current.counts[before.status] - 1, [opened.status]: current.counts[opened.status] + 1 },
        items: current.items.map((row) => (row.id === opened.id ? { ...row, status: opened.status } : row)),
      };
    });
  }, [open.data, setData]);

  const keep = (next: { status?: string; q?: string }) => {
    const merged = new URLSearchParams({ ...(status && { status }), ...(q && { q }) });
    Object.entries(next).forEach(([key, value]) => (value ? merged.set(key, value) : merged.delete(key)));
    const str = merged.toString();
    return str ? '?' + str : '';
  };
  const href = (itemId?: string) => '/admin/inbox' + (itemId ? '/' + itemId : '') + keep({});

  const setStatus = async (item: Inquiry, next: InquiryStatus, undoable = true) => {
    setBusy(true);
    setFailure('');
    const before = item.status;
    try {
      const saved = await api<Inquiry>(`/admin/inquiries/${item.id}`, { method: 'PATCH', json: { status: next } });
      open.setData((current) => (current?.id === saved.id ? saved : current));
      setData((current) =>
        current && {
          ...current,
          counts: { ...current.counts, [before]: current.counts[before] - 1, [next]: current.counts[next] + 1 },
          items: current.items.map((row) => (row.id === saved.id ? { ...row, status: next } : row)),
        },
      );
      toast.show(DONE[next], undoable ? () => setStatus(saved, before, false) : undefined);
    } catch (caught) {
      setFailure((caught as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    navigate('/admin/inbox' + keep({ q: text.trim() }));
  };

  const item = open.data;
  const subject = encodeURIComponent('Re: your message to Ralph de Vinca Group');

  return (
    <>
      <div className="a-head">
        <div>
          <h1 className="disp">Inbox</h1>
          <p>{data ? `${data.counts.new} unread · ${data.total} in all` : 'Messages sent from the contact form.'}</p>
        </div>
      </div>
      <div className="tools">
        <form className="search" role="search" onSubmit={submitSearch}>
          <label htmlFor="q" className="sr">Search messages</label>
          <MagnifyingGlass size={16} aria-hidden="true" />
          <input id="q" type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder="Search name, email or message" />
        </form>
        <div className="seg" role="group" aria-label="Filter by status">
          {FILTERS.map((filter) => (
            <button key={filter.label} type="button" aria-pressed={status === filter.value} onClick={() => navigate('/admin/inbox' + keep({ status: filter.value }))}>
              {filter.label}
              {data && <span className="mu">{filter.value ? data.counts[filter.value] : data.total}</span>}
            </button>
          ))}
        </div>
      </div>
      {failure && <div style={{ marginBottom: 12 }}><LoadError message={failure} /></div>}

      <div className={'inbox' + (id ? ' reading' : '')}>
        <div className="msgs-col">
          {q && data && (
            <p className="mu" style={{ margin: '0 0 10px', fontSize: 14 }}>
              {data.items.length} {plural(data.items.length, 'result')} for “{q}”.{' '}
              <Link href={'/admin/inbox' + keep({ q: '' })}>Clear search</Link>
            </p>
          )}
          {list.error && <LoadError message={list.error.message} retry={list.reload} />}
          {list.loading && !data && (
            <div className="msgs" aria-busy="true" aria-label="Loading messages">
              {[0, 1, 2, 3].map((i) => <span key={i} className="ghost" style={{ height: 86 }} />)}
            </div>
          )}
          {data?.items.length === 0 && (
            <div className="empty">
              <h3>{q ? `No message matches “${q}”.` : status ? `No ${status} messages.` : 'No messages yet.'}</h3>
              <p>{q ? 'Search looks at the name, the email and the message.' : 'Anything sent through the contact form arrives here.'}</p>
              {q && <Link className="btn line" href={'/admin/inbox' + keep({ q: '' })}>Clear search</Link>}
            </div>
          )}
          {data && data.items.length > 0 && (
            <ul className="msgs" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {data.items.map((row) => (
                <li key={row.id}>
                  <Link className={'msg-item' + (row.status === 'new' ? ' new' : '')} href={href(row.id)} aria-current={row.id === id ? 'page' : undefined}>
                    {row.status === 'new' && <span className="dot" aria-hidden="true" />}
                    <span className="row">
                      <b>{row.status === 'new' && <span className="sr">Unread. </span>}{row.name}</b>
                      <time className="mono mu" dateTime={row.created_at} title={dateTime(row.created_at)}>{ago(row.created_at)}</time>
                    </span>
                    <span className="row">
                      <span className="chip">{divisionLabel(row.division)}</span>
                      <span className="mono mu">{row.status}</span>
                    </span>
                    <span className="pv">{row.message}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <section className="reader" aria-label="Message">
          {!id && (
            <div className="empty" style={{ minHeight: 280 }}>
              <h3>No message open.</h3>
              <p>Pick one from the list. Opening a new message marks it read.</p>
            </div>
          )}
          {id && (
            <Link className="tl back-link" href={href()}><ArrowLeft size={14} aria-hidden="true" /> Inbox</Link>
          )}
          {open.error && <LoadError message={open.error.message} retry={open.error.status === 404 ? undefined : open.reload} />}
          {id && open.loading && !item && (
            <div aria-busy="true" aria-label="Loading the message" className="stack">
              <span className="ghost" style={{ height: 32, maxWidth: 320 }} />
              <span className="ghost" style={{ height: 160 }} />
            </div>
          )}
          {item && item.id === id && (
            <>
              <p className="mono mu" style={{ margin: '0 0 8px' }}>{divisionLabel(item.division)} · {dateTime(item.created_at)}</p>
              <h2>{item.name}</h2>
              <p style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, margin: '6px 0 0' }}>
                <a href={`mailto:${item.email}`} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, overflowWrap: 'anywhere' }}>{item.email}</a>
                <span className="chip">{item.status}</span>
              </p>
              <div className="acts">
                <a className="btn ink" href={`mailto:${item.email}?subject=${subject}`}>Reply by email</a>
                {item.status !== 'replied' && item.status !== 'archived' && (
                  <button type="button" className="btn line" disabled={busy} onClick={() => setStatus(item, 'replied')}>Mark replied</button>
                )}
                {item.status === 'read' && <button type="button" className="btn line" disabled={busy} onClick={() => setStatus(item, 'new')}>Mark unread</button>}
                {item.status !== 'archived' ? (
                  <button type="button" className="btn line" disabled={busy} onClick={() => setStatus(item, 'archived')}>Archive</button>
                ) : (
                  <button type="button" className="btn line" disabled={busy} onClick={() => setStatus(item, 'read')}>Move back to inbox</button>
                )}
              </div>
              <p className="mono mu" style={{ margin: '22px 0 0' }}>Message, as sent</p>
              {/* Plain text from the public internet: rendered as text, never as HTML. */}
              <p className="body-text">{item.message}</p>
              <details className="more">
                <summary className="mono">Details</summary>
                <dl className="facts" style={{ marginTop: 10 }}>
                  <div><dt>Status</dt><dd>{item.status}</dd></div>
                  <div><dt>Arrived</dt><dd>{dateTime(item.created_at)}</dd></div>
                  <div><dt>First read</dt><dd>{dateTime(item.read_at)}</dd></div>
                  {item.replied_at && <div><dt>Replied</dt><dd>{dateTime(item.replied_at)}</dd></div>}
                  <div><dt>IP</dt><dd>{item.ip_address ?? 'Not recorded'}</dd></div>
                  <div><dt>Agent</dt><dd>{item.user_agent ?? 'Not recorded'}</dd></div>
                </dl>
              </details>
            </>
          )}
        </section>
      </div>
      {toast.node}
    </>
  );
}
