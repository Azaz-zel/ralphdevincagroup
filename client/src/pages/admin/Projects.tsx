import { ArrowDown, ArrowUp, Plus } from '@phosphor-icons/react';
import { useToast } from '@/components/admin-shell';
import { DivisionMark } from '@/components/marks';
import { LoadError, Photo } from '@/components/ui';
import { api, useApi } from '@/lib/api';
import { divisionLabel, pad, plural } from '@/lib/format';
import { pageTitle, useTitle } from '@/lib/hooks';
import { Link } from '@/lib/router';
import type { Division, Photo as PhotoType } from '@/lib/types';

export interface Row {
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
  const toast = useToast();

  // The new order is shown at once and saved in the background; a failure puts the old order back.
  const move = async (from: number, to: number) => {
    if (!data) return;
    const before = data;
    const next = [...data];
    const [row] = next.splice(from, 1);
    next.splice(to, 0, row);
    setData(next);
    try {
      setData(await api<Row[]>('/admin/projects/order', { method: 'PATCH', json: { ids: next.map((item) => item.id) } }));
      toast.show(`Order saved. ${row.name} is now ${pad(to + 1)}.`);
    } catch (caught) {
      setData(before);
      toast.show((caught as Error).message);
    }
  };

  return (
    <>
      <div className="a-head">
        <div>
          <h1 className="disp">Projects</h1>
          <p>{data ? `${data.length} ${plural(data.length, 'case study', 'case studies')}. ` : ''}The order here is the order on the site and on the work wheel.</p>
        </div>
        <Link className="btn ink" href="/admin/projects/new"><Plus size={14} aria-hidden="true" /> Add project</Link>
      </div>

      {error && <LoadError message={error.message} retry={reload} />}
      {loading && !data && (
        <div className="stack" aria-busy="true" aria-label="Loading projects">
          {[0, 1, 2].map((i) => <span key={i} className="ghost" style={{ height: 112 }} />)}
        </div>
      )}
      {data?.length === 0 && (
        <div className="grp empty">
          <h2 style={{ margin: '0 0 6px', fontSize: 18 }}>No projects yet.</h2>
          <p>The work wheel on the site stays empty until the first project is added.</p>
          <Link className="btn ink" href="/admin/projects/new">Add the first project</Link>
        </div>
      )}

      {data && data.length > 0 && (
        <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {data.map((row, index) => {
            const cover = row.images[row.cover] ?? row.images[0];
            return (
              <li key={row.id} className="prow">
                <div className="order">
                  <button type="button" className="icon-btn" aria-label={`Move ${row.name} up`} disabled={index === 0} onClick={() => move(index, index - 1)}>
                    <ArrowUp size={14} aria-hidden="true" />
                  </button>
                  <span className="mono">{pad(index + 1)}</span>
                  <button type="button" className="icon-btn" aria-label={`Move ${row.name} down`} disabled={index === data.length - 1} onClick={() => move(index, index + 1)}>
                    <ArrowDown size={14} aria-hidden="true" />
                  </button>
                </div>
                <Photo src={cover?.url} alt="" fallback={<DivisionMark division={row.division} size={36} />} style={{ borderRadius: 10 }} />
                <div style={{ minWidth: 0 }}>
                  <span className="chip">{divisionLabel(row.division)}</span>
                  <h2>{row.name}</h2>
                  <p>/work/{row.slug} · {row.images.length} {plural(row.images.length, 'photo')}</p>
                </div>
                <div className="end">
                  <Link className="btn line" href={`/work/${row.slug}`}>View<span className="sr"> {row.name}</span> on the site</Link>
                  <Link className="btn ink" href={`/admin/projects/${row.id}`}>Edit<span className="sr"> {row.name}</span></Link>
                </div>
              </li>
            );
          })}
        </ol>
      )}
      {toast.node}
    </>
  );
}
