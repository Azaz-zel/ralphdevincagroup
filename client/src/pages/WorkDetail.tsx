import { Arrow, LoadError, Photo, SectionLabel, Win } from '@/components/hud';
import { DivisionMark } from '@/components/marks';
import { useApi } from '@/lib/api';
import { divisionLabel, pad, paragraphs } from '@/lib/format';
import { pageTitle, useTitle } from '@/lib/hooks';
import { Link } from '@/lib/router';
import type { CaseStudy } from '@/lib/types';

export default function WorkDetail({ slug }: { slug: string }) {
  const { data: project, error, loading, reload } = useApi<CaseStudy>(`/projects/${encodeURIComponent(slug)}`);
  useTitle(project ? project.seo_title || pageTitle(project.name) : undefined, project?.seo_description || project?.summary);

  if (error?.status === 404) return <NotFound />;
  if (error) {
    return (
      <section className="intro">
        <div className="wrap">
          <LoadError message={error.message} retry={reload} />
        </div>
      </section>
    );
  }
  if (loading || !project) {
    return (
      <section className="intro" aria-busy="true" aria-label="Loading the case study">
        <div className="wrap">
          <span className="ph" style={{ display: 'block', height: 96, maxWidth: 720 }} />
          <span className="ph" style={{ display: 'block', aspectRatio: '21 / 9', marginTop: 56 }} />
        </div>
      </section>
    );
  }

  const [cover, ...rest] = project.images.length ? [project.images[project.cover] ?? project.images[0], ...project.images.filter((_, i) => i !== project.cover)] : [];
  const sections = [
    { label: 'Situation', aside: 'Before', text: project.situation },
    { label: 'Constraint', aside: 'What made it hard', text: project.constraint_text },
  ].filter((section) => paragraphs(section.text).length > 0);
  let n = 0;
  const next = () => pad(++n);

  return (
    <>
      <section style={{ padding: '40px 0 72px' }}>
        <div className="wrap">
          <Link className="tl plain" href="/work" style={{ marginBottom: 32 }}>
            <Arrow back /> All work
          </Link>
          <div className="g12 end">
            <div className="span-8">
              <p className="m" style={{ margin: '0 0 16px' }}>
                [ Case study {pad(project.number)} ] <span className="ac">{divisionLabel(project.division)}</span>
              </p>
              <h1 className="h1" style={{ fontSize: 'clamp(44px, 6.2vw, 96px)' }}>{project.name}</h1>
              <p className="h3" style={{ marginTop: 20, maxWidth: '30ch' }}>{project.summary}</p>
            </div>
            {project.facts.length > 0 && (
              <Win className="span-r4" title="Facts" tag={`/${pad(project.number)}`}>
                <dl className="facts m">
                  {project.facts.map((fact) => (
                    <div key={fact.label} style={{ display: 'contents' }}>
                      <dt className="mu">{fact.label}</dt>
                      <dd>{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </Win>
            )}
          </div>
          <figure style={{ marginTop: 56 }}>
            <Photo src={cover?.url} alt={cover?.alt} ratio="21 / 9" fallback={<DivisionMark division={project.division} size={120} />} />
            {cover?.alt && (
              <figcaption className="m mu">
                <span>Fig. 01 · {cover.alt}</span>
              </figcaption>
            )}
          </figure>
        </div>
      </section>

      {sections.map((section) => {
        const [first, ...others] = paragraphs(section.text);
        return (
          <section key={section.label} className="sec">
            <div className="wrap">
              <SectionLabel label={`${next()} / ${section.label}`} aside={section.aside} />
              <div className="g12">
                <p className="h3 lg c-l">{others.length ? first : section.label === 'Situation' ? 'Where it started.' : 'What stood in the way.'}</p>
                <div className="c-r">
                  {(others.length ? others : [first]).map((text) => (
                    <p key={text} className="p">{text}</p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {project.decisions.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <SectionLabel label={`${next()} / Decisions`} aside={`${project.decisions.length} made`} />
            <ol className="list">
              {project.decisions.map((decision, index) => (
                <li key={decision.title} className="row base">
                  <span className="n" style={{ gridColumn: '1 / 3' }}>{pad(index + 1)}</span>
                  <h3 className="h3" style={{ gridColumn: '3 / 7' }}>{decision.title}</h3>
                  <p className="p" style={{ gridColumn: '7 / 13', margin: 0 }}>{decision.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <section className="sec">
        <div className="wrap">
          <SectionLabel label={`${next()} / Composition`} aside="The stack as a formula" />
          <div className="g12" style={{ rowGap: 32, alignItems: 'start' }}>
            <div className="c-l">
              <p className="h3 lg" style={{ marginBottom: 16 }}>The stack, written as a perfume formula.</p>
              <p className="p sm">Top is what a person meets, heart is the logic, base is the foundation that outlasts everything above it.</p>
            </div>
            <Win className="c-r" title={`Formula · ${project.name}`} bodyClass="">
              <dl style={{ margin: 0 }}>
                {[
                  ['Top', project.composition_top],
                  ['Heart', project.composition_heart],
                  ['Base', project.composition_base],
                ].map(([layer, value], index) => (
                  <div key={layer} className="row base" style={{ padding: '22px 16px', borderTop: index ? undefined : 0, borderBottom: 0 }}>
                    <dt className="m" style={{ gridColumn: '1 / 4' }}>{layer}</dt>
                    <dd className="h3" style={{ gridColumn: '4 / 13', margin: 0, fontSize: 30 }}>{value}</dd>
                  </div>
                ))}
              </dl>
            </Win>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <SectionLabel label={`${next()} / Result`} aside="After" />
          <div className="g12" style={{ marginBottom: rest.length ? 56 : 0 }}>
            <p className="h3 lg c-l">What came of it.</p>
            <div className="c-r">
              {paragraphs(project.result).map((text) => (
                <p key={text} className="p">{text}</p>
              ))}
            </div>
          </div>
          {rest.map((image, index) => (
            <figure key={image.path} style={{ marginTop: index ? 32 : 0 }}>
              <Photo src={image.url} alt={image.alt} ratio="16 / 9" />
              {image.alt && (
                <figcaption className="m mu">
                  <span>Fig. {pad(index + 2)} · {image.alt}</span>
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </section>

      {project.next && (
        <section className="sec">
          <div className="wrap">
            <Link className="row" href={`/work/${project.next.slug}`} style={{ alignItems: 'center', borderTop: '1px solid var(--ink)', borderBottom: '1px solid var(--ink)' }}>
              <span className="m mu" style={{ gridColumn: '1 / 4' }}>[ Next case study ]</span>
              <span className="h2" style={{ gridColumn: '4 / 11', fontSize: 'clamp(32px, 3.6vw, 52px)' }}>
                {pad(project.next.number)} · {project.next.name}
              </span>
              <span style={{ gridColumn: '11 / 13', justifySelf: 'end' }}><Arrow width={88} /></span>
            </Link>
          </div>
        </section>
      )}
    </>
  );
}

export function NotFound() {
  useTitle(pageTitle('Not found'));
  return (
    <section className="intro">
      <div className="wrap">
        <p className="m" style={{ margin: '0 0 16px' }}>[ 404 ]</p>
        <h1 className="h1">Nothing is here.</h1>
        <p className="lede" style={{ margin: '24px 0 32px' }}>The page may have moved, or the address has a typo.</p>
        <Link className="btn" href="/work">See all work <Arrow /></Link>
      </div>
    </section>
  );
}
