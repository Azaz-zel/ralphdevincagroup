import { useState } from 'react';
import { Plus } from '@phosphor-icons/react';
import { LoadError, Photo, Win } from '@/components/hud';
import { DivisionMark } from '@/components/marks';
import { api, useApi } from '@/lib/api';
import { divisionLabel, pad, plural } from '@/lib/format';
import { pageTitle, useTitle } from '@/lib/hooks';
import { Link } from '@/lib/router';
import type { Division, Photo as PhotoType } from '@/lib/types';

interface Row {
  id: number;
  slug: string;
  name: string;
  division: Division;
  position: number;
  images: PhotoType[];
  cover: number;
}

export default function Projects() {
  useTitle(pageTitle('Projects'));
  const { data, setData, error, loading, reload } = useApi<Row[]>('/admin/projects');
  const [notice, setNotice] = useState('');
  const [failure, setFailure] = useState('');

  const remove = async (row: Row) => {
    setFailure('');
    try {
      await api(`/admin/projects/${row.id}`, { method: 'DELETE' });
      setData(data?.filter((item) => item.id !== row.id));
      setNotice(`${row.name} was deleted.`);
    } catch (caught) {
      setFailure((caught as Error).message);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
        <div>
          <p className="m" style={{ margin: '0 0 12px' }}>[ Case studies ]</p>
          <h1 className="h1" style={{ fontSize: 'clamp(48px, 6vw, 92px)' }}>Projects</h1>
          <p className="p" style={{ margin: '14px 0 0' }}>Shown on the site in this order. The count on the home page follows on its own.</p>
        </div>
        <Link className="btn" href="/admin/projects/new"><Plus size={16} aria-hidden="true" /> New project</Link>
      </div>

      {notice && <p className="note" role="status" style={{ marginTop: 24 }}>{notice}</p>}
      {failure && <div style={{ marginTop: 24 }}><LoadError message={failure} /></div>}
      {error && <div style={{ marginTop: 24 }}><LoadError message={error.message} retry={reload} /></div>}
      {loading && !data && <div className="ph" style={{ height: 240, marginTop: 40 }} aria-busy="true" />}

      {data?.length === 0 && (
        <Win title="Empty" className="" bodyClass="win-c lg">
          <h2 className="h3" style={{ marginBottom: 10 }}>No projects yet.</h2>
          <p className="p">The Work section on the site stays hidden until the first project is added. Add one with its story and its decisions.</p>
          <Link className="btn" href="/admin/projects/new">Add the first project</Link>
        </Win>
      )}

      {data && data.length > 0 && (
        <Win title={`Index · ${pad(data.length)} ${plural(data.length, 'project')}`} className="" bodyClass="tbox">
          <table className="table" style={{ marginTop: 0 }}>
            <thead>
              <tr>
                <th scope="col" style={{ width: 64 }}>No.</th>
                <th scope="col">Project</th>
                <th scope="col">Division</th>
                <th scope="col">Photos</th>
                <th scope="col"><span className="sr">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => {
                const cover = row.images[row.cover] ?? row.images[0];
                return (
                  <tr key={row.id}>
                    <td style={{ fontWeight: 700, fontSize: 24, letterSpacing: '-0.03em' }}>{pad(index + 1)}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Photo src={cover?.url} fallback={<DivisionMark division={row.division} size={28} />} style={{ width: 96, flex: 'none' }} />
                        <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                          <Link href={`/admin/projects/${row.id}`} className="h3" style={{ fontSize: 20, textDecoration: 'none' }}>{row.name}</Link>
                          <span className="m mu" style={{ textTransform: 'none' }}>/work/{row.slug}</span>
                        </span>
                      </span>
                    </td>
                    <td className="m">{divisionLabel(row.division)}</td>
                    <td className="m" style={{ fontVariantNumeric: 'tabular-nums' }}>{row.images.length}</td>
                    <td>
                      <span style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
                        <Link className="qb" href={`/admin/projects/${row.id}`}>Edit<span className="sr"> {row.name}</span></Link>
                        <Link className="qb" href={`/work/${row.slug}`}>View<span className="sr"> {row.name} on the site</span></Link>
                        <ConfirmDelete name={row.name} onConfirm={() => remove(row)} />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Win>
      )}
    </>
  );
}

export function ConfirmDelete({ name, onConfirm, label = 'Delete' }: { name: string; onConfirm: () => Promise<void> | void; label?: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <details className="confirm">
      <summary className="qb danger">{label}<span className="sr"> {name}</span></summary>
      <div className="cpanel">
        <Win title="Delete project" danger>
          <p style={{ margin: '0 0 14px', fontSize: 14 }}>
            Delete <strong>{name}</strong>? Its case study and the photos uploaded for it are removed. This cannot be undone.
          </p>
          <button
            type="button"
            className="btn danger full"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await onConfirm();
              setBusy(false);
            }}
          >
            {busy ? 'Deleting…' : 'Delete project'}
          </button>
        </Win>
      </div>
    </details>
  );
}
