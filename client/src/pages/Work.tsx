import { Arrow, LoadError, Photo, ProjectCta, SectionLabel, Win } from '@/components/hud';
import { DivisionMark } from '@/components/marks';
import { useApi } from '@/lib/api';
import { pad, plural, spell } from '@/lib/format';
import { pageTitle, useTitle } from '@/lib/hooks';
import { Link } from '@/lib/router';
import type { ProjectSummary } from '@/lib/types';
import { ProjectRowsLoading } from './Home';

export default function Work() {
  useTitle(pageTitle('Work'), 'Projects across fragrance and software, with the decisions behind each one.');
  const { data: projects, error, loading, reload } = useApi<ProjectSummary[]>('/projects');
  const perfumery = projects?.filter((p) => p.division === 'perfumery').length ?? 0;
  const technology = (projects?.length ?? 0) - perfumery;

  return (
    <>
      <section className="intro">
        <div className="wrap g12 end">
          <div className="span-8">
            <p className="m" style={{ margin: '0 0 16px' }}>[ Work ]</p>
            <h1 className="h1">
              Everything built so <span className="ac">far.</span>
            </h1>
          </div>
          {projects && projects.length > 0 && (
            <Win className="span-r4" title="Index" tag={`/${pad(projects.length)}`}>
              <p className="m" style={{ margin: '0 0 12px' }}>
                Perfumery · {pad(perfumery)}
                <br />
                Technology · {pad(technology)}
                <br />
                <span className="ac">→ All of them are here; this is not a selection.</span>
              </p>
              <div className="bars" aria-hidden="true" />
            </Win>
          )}
        </div>
      </section>

      <section className="sec" aria-label="Projects">
        <div className="wrap">
          <SectionLabel
            as="p"
            label={projects ? `${spell(projects.length)} ${plural(projects.length, 'project')}` : 'Projects'}
            aside="In the order they were built"
          />
          {error && <LoadError message={error.message} retry={reload} />}
          {loading && <ProjectRowsLoading />}
          {projects?.length === 0 && <p className="p">Nothing is listed yet. The first case study is being written.</p>}
          {projects?.map((project, index) => (
            <Link key={project.id} className="row" href={`/work/${project.slug}`}>
              <span className="n" style={{ gridColumn: '1 / 2', fontSize: 32 }}>{pad(index + 1)}</span>
              <Photo
                src={project.cover?.url}
                fallback={<DivisionMark division={project.division} size={88} />}
                style={{ gridColumn: '2 / 7' }}
              />
              <div style={{ gridColumn: '8 / 13', alignSelf: 'end' }}>
                <span className="m ac" style={{ display: 'block', marginBottom: 8 }}>{project.meta_label ?? project.division}</span>
                <h2 className="h2" style={{ fontSize: 44 }}>{project.name}</h2>
                <span className="p" style={{ display: 'block', margin: '14px 0 18px' }}>{project.index_summary ?? project.summary}</span>
                <span className="m" style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>View case study <Arrow /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <ProjectCta
        label="Start a project"
        heading={<>Have something that needs <span className="ac">building?</span></>}
        body="Tell me what the problem is. If it isn't a good fit, I'll say so."
      />
    </>
  );
}
