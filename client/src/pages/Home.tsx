import { useState } from 'react';
import { Arrow, LoadError, Photo, ProjectCta, SectionLabel, Stage, Win } from '@/components/hud';
import { DivisionMark, PerfumeryMark, TechnologyMark } from '@/components/marks';
import { useApi } from '@/lib/api';
import { divisions, principles, site } from '@/lib/config';
import { pad, spell } from '@/lib/format';
import { useTitle } from '@/lib/hooks';
import { Link } from '@/lib/router';
import type { ProjectSummary } from '@/lib/types';

const FIGURES = [
  { key: 'perfumery', caption: 'Fig. 01 · Perfumery mark · five petals, 72° apart' },
  { key: 'technology', caption: 'Fig. 02 · Technology mark · the same petals, faceted' },
] as const;

export default function Home() {
  useTitle(`${site.name} | Fragrance and software, built in Bali`, site.description);
  const [shown, setShown] = useState(0);
  const figure = FIGURES[shown];
  const division = divisions[figure.key];

  return (
    <>
      <Stage
        title={
          <>
            <p className="m" style={{ margin: '0 0 10px' }}>
              Things that are <span className="mu">[ the thesis ]</span>
            </p>
            <h1 className="h1" style={{ fontSize: 'clamp(56px, 6.4vw, 96px)' }}>
              <span className="sr">Things that are </span>Not seen,
              <br />
              but <span className="ac">felt.</span>
            </h1>
          </>
        }
        controls={
          <div role="group" aria-label="Show a division" style={{ display: 'flex', gap: 6 }}>
            {FIGURES.map((item, index) => (
              <button key={item.key} type="button" className="chip t" aria-pressed={shown === index} onClick={() => setShown(index)}>
                {divisions[item.key].name}
              </button>
            ))}
          </div>
        }
        caption={figure.caption}
        objects={
          <>
            <div className={'obj ac' + (shown === 0 ? ' on' : '')} aria-hidden={shown !== 0}>
              <PerfumeryMark size={440} label="The Perfumery mark: a five-petal vinca flower" />
            </div>
            <div className={'obj' + (shown === 1 ? ' on' : '')} aria-hidden={shown !== 1}>
              <TechnologyMark size={440} label="The Technology mark: the same vinca drawn as a faceted structure" />
            </div>
          </>
        }
        enter={{ href: division.href, label: `Enter ${division.name}` }}
        callouts={principles.map((p) => ({ title: p.name, body: p.short }))}
        window={{
          title: 'Ralph de Vinca',
          tag: '/01',
          body: (
            <>
              Ralph (rād, counsel)
              <br />+ de (of)
              <br />+ Vinca (vincire, to bind)
              <br />
              <span className="ac">→ Wisdom that binds, and endures.</span>
            </>
          ),
        }}
        corner={
          <>
            <p className="m" style={{ margin: '0 0 10px' }}>[ Two divisions ]</p>
            <Link className="div-link" href="/perfumery">
              <span className="icon ac"><PerfumeryMark size={28} /></span>
              <span className="m">
                01. Perfumery
                <br />
                <span className="mu">{divisions.perfumery.line}</span>
              </span>
            </Link>
            <Link className="div-link" href="/technology">
              <span className="icon"><TechnologyMark size={28} /></span>
              <span className="m">
                02. Technology
                <br />
                <span className="mu">{divisions.technology.line}</span>
              </span>
            </Link>
            <div className="bars" aria-hidden="true" style={{ marginTop: 10, width: 180 }} />
          </>
        }
      />

      <section className="sec">
        <div className="wrap">
          <SectionLabel label="01 / Divisions" aside="One standard, two crafts" />
          <div className="cards two">
            <Win title="Fig. 01 · Perfumery" bodyClass="mark-card">
              <PerfumeryMark size={132} className="ac" />
              <div>
                <p className="m mu" style={{ margin: '0 0 6px' }}>Ralph de Vinca</p>
                <h2 className="h2" style={{ fontSize: 44, marginBottom: 16 }}>Perfumery</h2>
                <p className="p sm">{divisions.perfumery.summary}</p>
                <Link className="tl" href="/perfumery">Enter Perfumery <Arrow /></Link>
              </div>
            </Win>
            <Win title="Fig. 02 · Technology" bodyClass="mark-card">
              <TechnologyMark size={132} />
              <div>
                <p className="m mu" style={{ margin: '0 0 6px' }}>Ralph de Vinca</p>
                <h2 className="h2" style={{ fontSize: 44, marginBottom: 16 }}>Technology</h2>
                <p className="p sm">{divisions.technology.summary}</p>
                <Link className="tl" href="/technology">Enter Technology <Arrow /></Link>
              </div>
            </Win>
          </div>
        </div>
      </section>

      <WorkIndex />

      <ProjectCta
        label="03 / Start a project"
        heading={<>Have something that needs <span className="ac">building?</span></>}
        body="Tell me what the problem is. If it isn't a good fit, I'll say so."
      />
    </>
  );
}

function WorkIndex() {
  const { data: projects, error, loading, reload } = useApi<ProjectSummary[]>('/projects');
  if (!loading && !error && projects?.length === 0) return null;

  return (
    <section className="sec">
      <div className="wrap">
        <SectionLabel label="02 / Work" aside={projects ? `${pad(projects.length)} entries` : undefined} />
        <div className="g12 end" style={{ marginBottom: 48 }}>
          <h2 className="h2" style={{ gridColumn: '1 / 8' }}>
            {projects ? `${spell(projects.length)} ${projects.length === 1 ? 'thing' : 'things'} built so far.` : 'Everything built so far.'}
          </h2>
          <p className="lede" style={{ gridColumn: '9 / 13' }}>All of them are here; this is not a selection.</p>
        </div>
        {error && <LoadError message={error.message} retry={reload} />}
        {loading && <ProjectRowsLoading />}
        <div>
          {projects?.map((project, index) => (
            <Link key={project.id} className="row" href={`/work/${project.slug}`}>
              <span className="n" style={{ gridColumn: '1 / 3' }}>{pad(index + 1)}</span>
              <div style={{ gridColumn: '3 / 8' }}>
                <span className="m ac" style={{ display: 'block', marginBottom: 8 }}>{project.meta_label ?? project.division}</span>
                <h3 className="h3" style={{ fontSize: 32 }}>{project.name}</h3>
                <span className="p" style={{ display: 'block', margin: '10px 0 16px' }}>{project.index_summary ?? project.summary}</span>
                <span className="m" style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>View case study <Arrow /></span>
              </div>
              <Photo src={project.cover?.url} fallback={<DivisionMark division={project.division} size={72} />} style={{ gridColumn: '9 / 13' }} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProjectRowsLoading() {
  return (
    <div aria-busy="true" aria-label="Loading the work">
      {[0, 1, 2].map((i) => (
        <div key={i} className="row" style={{ minHeight: 180 }}>
          <span className="ph" style={{ gridColumn: '1 / 8', height: 24 }} />
          <span className="ph" style={{ gridColumn: '9 / 13', aspectRatio: '16 / 10' }} />
        </div>
      ))}
    </div>
  );
}
