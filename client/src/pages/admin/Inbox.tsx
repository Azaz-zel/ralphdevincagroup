import { useEffect, useState, type FormEvent } from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { LoadError, Win } from '@/components/hud';
import { api, useApi } from '@/lib/api';
import { ago, dateTime, divisionLabel, pad, plural } from '@/lib/format';
import { pageTitle, useTitle } from '@/lib/hooks';
import { Link, navigate, useLocation } from '@/lib/router';
import type { InboxResponse, Inquiry, InquiryStatus } from '@/lib/types';

const STATUSES: InquiryStatus[] = ['new', 'read', 'replied', 'archived'];
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

export default function Inbox() {
  useTitle(pageTitle('Inbox'));
  const location = useLocation();
  const params = new URLSearchParams(location.split('?')[1]?.split('#')[0] ?? '');
  const status = params.get('status') ?? '';
  const q = params.get('q') ?? '';
  const query = new URLSearchParams({ ...(status && { status }), ...(q && { q }) }).toString();
  const { data, setData, error, loading, reload } = useApi<InboxResponse>('/admin/inquiries' + (query ? '?' + query : ''));
  const [search, setSearch] = useState(q);
  const [busy, setBusy] = useState<string | null>(null);
  const [failure, setFailure] = useState('');

  useEffect(() => setSearch(q), [q]);

  // Filters live in the address, so any view of the inbox survives a reload.
  const go = (next: { status?: string; q?: string }) => {
    const merged = new URLSearchParams({ ...(status && { status }), ...(q && { q }) });
    Object.entries(next).forEach(([key, value]) => (value ? merged.set(key, value) : merged.delete(key)));
    const str = merged.toString();
    navigate('/admin/inbox' + (str ? '?' + str : ''));
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    go({ q: search.trim() });
  };

  const setStatus = async (item: Inquiry, next: InquiryStatus) => {
    setBusy(item.id);
    setFailure('');
    try {
      await api(`/admin/inquiries/${item.id}`, { method: 'PATCH', json: { status: next } });
      if (data) {
        const counts = { ...data.counts, [item.status]: data.counts[item.status] - 1, [next]: data.counts[next] + 1 };
        const items = data.items.map((row) => (row.id === item.id ? { ...row, status: next } : row)).filter((row) => !status || row.status === status);
        setData({ ...data, counts, items });
      }
    } catch (caught) {
      setFailure((caught as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const newCount = data?.counts.new ?? 0;

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
        <div>
          <p className="m" style={{ margin: '0 0 12px' }}>[ Inbox ]</p>
          <h1 className="h1" style={{ fontSize: 'clamp(44px, 5.4vw, 80px)' }}>
            {data ? (newCount ? `${newCount} new ${plural(newCount, 'message')}` : 'No new messages') : 'Inbox'}
          </h1>
        </div>
        {data && (
          <Win title="Status" tag={`/${pad(data.total)}`} className="" bodyClass="win-c m">
            New · {data.counts.new} · Read · {data.counts.read}
            <br />
            Replied · {data.counts.replied} · Archived · {data.counts.archived}
          </Win>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px 32px', marginTop: 40, borderTop: '1px solid var(--ink)', paddingTop: 12 }}>
        <div role="group" aria-label="Filter by status" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <button type="button" className="chip t" aria-pressed={!status} onClick={() => go({ status: '' })}>
            All{data ? ` (${data.total})` : ''}
          </button>
          {STATUSES.map((s) => (
            <button key={s} type="button" className="chip t" aria-pressed={status === s} onClick={() => go({ status: s })}>
              {cap(s)}{data ? ` (${data.counts[s]})` : ''}
            </button>
          ))}
        </div>
        <form className="search" role="search" onSubmit={submitSearch}>
          <label htmlFor="q" className="sr">Search messages</label>
          <MagnifyingGlass size={18} aria-hidden="true" />
          <input id="q" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, or message" />
        </form>
      </div>

      {q && data && (
        <p className="p sm" style={{ marginTop: 16 }}>
          {data.items.length} {plural(data.items.length, 'result')} for “{q}”.{' '}
          <button type="button" className="qb" onClick={() => go({ q: '' })}>Clear search</button>
        </p>
      )}
      {failure && <div style={{ marginTop: 16 }}><LoadError message={failure} /></div>}
      {error && <div style={{ marginTop: 16 }}><LoadError message={error.message} retry={reload} /></div>}

      <div style={{ marginTop: 8, borderBottom: '1px solid var(--line)' }} aria-busy={loading}>
        {loading && !data && [0, 1, 2].map((i) => <div key={i} className="ph" style={{ height: 72, marginTop: 8 }} />)}
        {data?.items.length === 0 && (
          <p className="p" style={{ padding: '48px 0', margin: 0 }}>
            {q ? `Nothing matches “${q}”${status ? ` in ${status}` : ''}.` : status ? `No ${status} messages.` : 'No messages yet. Anything sent through the contact form arrives here.'}
          </p>
        )}
        {data?.items.map((item) => {
          const isNew = item.status === 'new';
          return (
            <div key={item.id} className="irow">
              <span className="status-dot" aria-hidden="true" style={{ alignSelf: 'center', background: isNew ? 'var(--accent)' : 'transparent' }} />
              <span style={{ minWidth: 0 }}>
                <Link href={`/admin/inbox/${item.id}`} className="clamp" style={{ display: 'block', fontWeight: isNew ? 700 : 400, textDecoration: 'none' }}>
                  {isNew && <span className="sr">Unread. </span>}
                  {item.name}
                </Link>
                <span className="m mu clamp" style={{ display: 'block', textTransform: 'none' }}>{item.email}</span>
              </span>
              <p className="mu clamp msg" style={{ margin: 0, fontSize: 15 }}>{item.message}</p>
              <span className="meta m mu" style={{ display: 'flex', gap: 16, whiteSpace: 'nowrap' }}>
                <span>{divisionLabel(item.division)}</span>
                <time dateTime={item.created_at} title={dateTime(item.created_at)}>{ago(item.created_at)}</time>
              </span>
              <div className="irow-a">
                <span className="m" style={{ color: isNew ? 'var(--accent)' : 'var(--muted)' }}>[ {item.status} ]</span>
                {item.status !== 'replied' && (
                  <button type="button" className="qb" disabled={busy === item.id} onClick={() => setStatus(item, 'replied')}>Mark replied</button>
                )}
                {!isNew && (
                  <button type="button" className="qb" disabled={busy === item.id} onClick={() => setStatus(item, 'new')}>Mark unread</button>
                )}
                {item.status !== 'archived' && (
                  <button type="button" className="qb" disabled={busy === item.id} onClick={() => setStatus(item, 'archived')}>Archive</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
