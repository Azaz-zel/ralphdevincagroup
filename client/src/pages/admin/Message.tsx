import { useState } from 'react';
import { Arrow, LoadError, Win } from '@/components/hud';
import { api, useApi } from '@/lib/api';
import { dateTime, divisionLabel } from '@/lib/format';
import { pageTitle, useTitle } from '@/lib/hooks';
import { Link } from '@/lib/router';
import type { Inquiry, InquiryStatus } from '@/lib/types';

const NOTICES: Record<InquiryStatus, string> = {
  replied: 'Marked as replied.',
  new: 'Marked unread. It is back at the top of the inbox.',
  archived: 'Archived.',
  read: 'Marked read.',
};

export default function Message({ id }: { id: string }) {
  // Opening the message is what marks it read; the server records the first reading.
  const { data: item, setData, error, loading, reload } = useApi<Inquiry>(`/admin/inquiries/${encodeURIComponent(id)}`);
  useTitle(pageTitle(item ? `Message from ${item.name}` : 'Message'));
  const [notice, setNotice] = useState('');
  const [failure, setFailure] = useState('');
  const [busy, setBusy] = useState(false);

  const setStatus = async (status: InquiryStatus) => {
    setBusy(true);
    setFailure('');
    try {
      setData(await api<Inquiry>(`/admin/inquiries/${id}`, { method: 'PATCH', json: { status } }));
      setNotice(NOTICES[status]);
    } catch (caught) {
      setFailure((caught as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const subject = encodeURIComponent('Re: your message to Ralph de Vinca Group');

  return (
    <>
      <Link className="tl plain" href="/admin/inbox"><Arrow back /> Inbox</Link>
      {notice && <p className="note" role="status" style={{ marginTop: 20, maxWidth: 760 }}>{notice}</p>}
      {failure && <div style={{ marginTop: 20 }}><LoadError message={failure} /></div>}
      {error && <div style={{ marginTop: 20 }}><LoadError message={error.message} retry={error.status === 404 ? undefined : reload} /></div>}
      {loading && !item && <div className="ph" style={{ height: 320, marginTop: 32 }} aria-busy="true" />}

      {item && (
        <div className="g12" style={{ marginTop: 32, rowGap: 32, alignItems: 'start' }}>
          <div style={{ gridColumn: '1 / 9' }}>
            <p className="m" style={{ margin: '0 0 12px' }}>[ Message ]</p>
            <h1 className="h1" style={{ fontSize: 'clamp(40px, 4.8vw, 72px)', overflowWrap: 'anywhere' }}>{item.name}</h1>
            <p style={{ margin: '6px 0 0' }}>
              <a className="m" href={`mailto:${item.email}`} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, textTransform: 'none', fontSize: 14 }}>{item.email}</a>
            </p>
            <Win title="Body · as sent" className="" bodyClass="win-c lg pre">
              {/* Plain text from the public internet: rendered as text, never as HTML. */}
              <div style={{ fontSize: 18, lineHeight: 1.7, overflowWrap: 'anywhere' }}>{item.message}</div>
            </Win>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginTop: 24 }}>
              <a className="btn" href={`mailto:${item.email}?subject=${subject}`}>Reply by email <Arrow /></a>
              {item.status !== 'replied' && <button type="button" className="btn q" disabled={busy} onClick={() => setStatus('replied')}>Mark as replied</button>}
              <button type="button" className="btn q" disabled={busy} onClick={() => setStatus('new')}>Mark unread</button>
              {item.status !== 'archived' && <button type="button" className="btn q" disabled={busy} onClick={() => setStatus('archived')}>Archive</button>}
            </div>
          </div>
          <aside style={{ gridColumn: '9 / 13' }} aria-label="Details">
            <Win title="Details" tag={`/${item.status}`}>
              <dl className="facts m" style={{ marginBottom: 16 }}>
                <dt className="mu">Division</dt><dd>{divisionLabel(item.division)}</dd>
                <dt className="mu">Status</dt><dd>{item.status}</dd>
                <dt className="mu">Arrived</dt><dd>{dateTime(item.created_at)}</dd>
                <dt className="mu">First read</dt><dd>{dateTime(item.read_at)}</dd>
                {item.replied_at && (<><dt className="mu">Replied</dt><dd>{dateTime(item.replied_at)}</dd></>)}
                <dt className="mu">IP</dt><dd>{item.ip_address ?? 'Not recorded'}</dd>
                <dt className="mu">Agent</dt><dd style={{ textTransform: 'none', overflowWrap: 'anywhere' }}>{item.user_agent ?? 'Not recorded'}</dd>
              </dl>
              <div className="bars" aria-hidden="true" />
            </Win>
          </aside>
        </div>
      )}
    </>
  );
}
