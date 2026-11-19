import { ArrowLeft } from '@phosphor-icons/react';
import { DivisionMark } from '@/components/marks';
import { LoadError, Photo, ProjectCta } from '@/components/ui';
import { useApi } from '@/lib/api';
import { divisionLabel, pad, paragraphs } from '@/lib/format';
import { pageTitle, useTitle } from '@/lib/hooks';
import { Link } from '@/lib/router';
import type { CaseStudy, Neighbour } from '@/lib/types';

export default function WorkDetail({ slug }: { slug: string }) {
  const { data: project, error, loading, reload } = useApi<CaseStudy>(`/projects/${encodeURIComponent(slug)}`);
  useTitle(project ? project.seo_title || pageTitle(project.name) : undefined, project?.seo_description || project?.summary);

  if (error?.status === 404) return <NotFound />;
  if (error) {
    return (
      <section className="wrap page-hero">
        <LoadError message={error.message} retry={reload} />
      </section>
    );
  }
  if (loading || !project) {
    return (
      <section className="wrap page-hero" aria-busy="true" aria-label="Loading the case study">
        <span className="ghost" style={{ height: 96, maxWidth: 720 }} />
        <span className="ghost" style={{ aspectRatio: '16 / 8', marginTop: 40 }} />
      </section>
    );
  }

  const cover = project.images[project.cover] ?? project.images[0];
  const rest = project.images.filter((image) => image !== cover);
  const story = [
    { label: 'Situation', fallback: 'Where it started.', text: project.situation },
    { label: 'Constraint', fallback: 'What stood in the way.', text: project.constraint_text },
  ].filter((part) => paragraphs(part.text).length > 0);

  return (
    <>
      <div className="wrap">
        <Link className="tl" href="/work" style={{ marginTop: 24 }}><ArrowLeft size={14} aria-hidden="true" /> All work</Link>
        <section className="case-hero" style={{ paddingTop: 24 }}>
          <div>
            <h1 className="disp">{project.name}</h1>
            <p className="mono mu" style={{ margin: '16px 0 0' }}>
              Case study {pad(project.number)} · {divisionLabel(project.division)}
              {project.meta_label && project.meta_label !== divisionLabel(project.division) ? ` · ${project.meta_label.split(' · ').pop()}` : ''}
            </p>
          </div>
          <p className="lede" style={{ fontSize: 'clamp(19px, 1.8vw, 24px)', maxWidth: '30ch' }}>{project.summary}</p>
          {project.facts.length > 0 && (
              <dl className="facts">
                {project.facts.map((fact) => (
                  <div key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
          )}
        </section>
        <figure style={{ margin: 0 }}>
          <Photo src={cover?.url} alt={cover?.alt} eager ratio="16 / 8" style={{ maxHeight: '72vh', marginInline: 'auto' }} fallback={<DivisionMark division={project.division} size={88} />} />
          {cover?.alt && <figcaption className="mono mu" style={{ marginTop: 10, textAlign: 'center' }}>Fig. 01 · {cover.alt}</figcaption>}
        </figure>

        {story.map((part) => {
          const [first, ...others] = paragraphs(part.text);
          return (
            <section key={part.label} className="sec split">
              <div>
                <h2 className="disp">{others.length ? first : part.fallback}</h2>
                <p className="mono gold" style={{ margin: '14px 0 0' }}>{part.label}</p>
              </div>
              <div>
                {(others.length ? others : [first]).map((text) => (
                  <p key={text} className="p" style={{ fontSize: 20 }}>{text}</p>
                ))}
              </div>
            </section>
          );
        })}

        {project.decisions.length > 0 && (
          <section className="deck" aria-labelledby="decisions">
            <div className="head mono">
              <h2 id="decisions" className="mono" style={{ margin: 0, fontSize: 11 }}>Decisions</h2>
              <span>{project.decisions.length} made</span>
            </div>
            <ol>
              {project.decisions.map((decision, index) => (
                <li key={decision.title}>
                  <span className="n">{index + 1}</span>
                  <h3>{decision.title}</h3>
                  <p>{decision.body}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section className="sec split">
          <div>
            <h2 className="disp">The stack, as a formula.</h2>
            <p className="mono gold" style={{ margin: '14px 0 0' }}>Composition</p>
            <p className="p" style={{ marginTop: 16 }}>Top is what a person meets, heart is the logic, base is the foundation that outlasts everything above it.</p>
          </div>
          <dl className="formula">
            {[
              ['TOP', project.composition_top],
              ['HEART', project.composition_heart],
              ['BASE', project.composition_base],
            ].map(([layer, value]) => (
              <div key={layer}>
                <dt>{layer}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="sec split">
          <div>
            <h2 className="disp">What came of it.</h2>
            <p className="mono gold" style={{ margin: '14px 0 0' }}>Result</p>
          </div>
          <div>
            {paragraphs(project.result).map((text) => (
              <p key={text} className="p" style={{ fontSize: 20 }}>{text}</p>
            ))}
            {rest.length > 0 && (
              <div className="two" style={{ marginTop: 28 }}>
                {rest.map((image, index) => (
                  <figure key={image.path} style={{ margin: 0 }}>
                    <Photo src={image.url} alt={image.alt} ratio="4 / 3" />
                    {image.alt && <figcaption className="mono mu" style={{ marginTop: 8 }}>Fig. {pad(index + 2)} · {image.alt}</figcaption>}
                  </figure>
                ))}
              </div>
            )}
          </div>
        </section>

        {(project.prev || project.next) && (
          <nav className="pager" aria-label="Other case studies">
            {project.prev && <NeighbourSlide item={project.prev} label="Previous" theme="t-paper" />}
            {project.next && <NeighbourSlide item={project.next} label="Next" theme="t-gold" />}
          </nav>
        )}
      </div>
      <ProjectCta
        heading={<>Have something that needs <span className="gold">building?</span></>}
        body="Tell me what the problem is. If it isn't a good fit, I'll say so."
      />
    </>
  );
}

function NeighbourSlide({ item, label, theme }: { item: Neighbour; label: string; theme: string }) {
  return (
    <Link className={'slide ' + theme} href={`/work/${item.slug}`}>
      <span className="mono">{label} · {pad(item.number)} / {divisionLabel(item.division)}</span>
      <span className="name" style={{ maxWidth: '16ch' }}>{item.name}</span>
    </Link>
  );
}

export function NotFound() {
  useTitle(pageTitle('Not found'));
  return (
    <section className="wrap page-hero">
      <p className="mono mu" style={{ margin: 0 }}>404</p>
      <h1 className="disp">Nothing is here.</h1>
      <p className="lede" style={{ margin: '24px 0 32px' }}>The page may have moved, or the address has a typo.</p>
      <Link className="btn ink" href="/work">See all work</Link>
    </section>
  );
}
