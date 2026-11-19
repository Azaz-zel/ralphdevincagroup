import { useEffect, useRef, useState, type CSSProperties, type FocusEvent } from 'react';
import { ContactForm } from '@/components/contact-form';
import { Ember } from '@/components/ember';
import { EmbossMark, LoadError, SlideBody } from '@/components/ui';
import { useApi } from '@/lib/api';
import { divisions, site } from '@/lib/config';
import { pad, spell } from '@/lib/format';
import { useMedia, useReducedMotion, useTitle } from '@/lib/hooks';
import { Link } from '@/lib/router';
import type { ProjectSummary } from '@/lib/types';

const SCENES = [
  { label: 'Intro', at: 0 },
  { label: 'Divisions', at: 2 },
  { label: 'Work', at: 3 },
  { label: 'Contact', at: 4 },
];
const HEADER = 64;

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);

/** Every animated value for scroll position t (0 = intro, 4 = contact), written as CSS variables. */
function sceneVars(t: number): Record<string, string> {
  const seg = (a: number, b: number) => clamp((t - a) / (b - a));
  const v: Record<string, number | string> = {
    '--hero': ease(seg(0.05, 0.85)),
    '--obj': ease(seg(0, 0.95)),
    '--etym': 1 - seg(0.1, 0.45),
    '--stin': seg(0.55, 0.95),
    '--st': seg(0.55, 0.95) * (1 - seg(1.55, 1.9)),
    '--div': ease(seg(1.45, 2)),
    '--work': ease(seg(2.45, 3)),
    '--contact': ease(seg(3.45, 4)),
  };
  for (let i = 0; i < 3; i++) {
    v[`--c${i}`] = ease(seg(1.72 + i * 0.09, 2.12 + i * 0.09));
    const k = ease(seg(2.62 + (2 - i) * 0.06, 3.05 + (2 - i) * 0.06));
    v[`--fk${i}`] = k;
    v[`--f${i}`] = `${((i - 1) * 15 - (1 - k) * 40).toFixed(2)}deg`;
  }
  return Object.fromEntries(Object.entries(v).map(([key, value]) => [key, typeof value === 'number' ? value.toFixed(4) : value]));
}

/**
 * What React needs to know about the scroll position: the current scene and whether the
 * division marks have caught the light. It changes a few times per pass, so the page
 * re-renders a few times, while the per-frame motion is written straight to CSS variables.
 */
function sceneState(t: number) {
  return { scene: Math.min(4, Math.round(t)), lit: t > 1.9 };
}
type SceneState = ReturnType<typeof sceneState>;

function usePinnedScroll(active: boolean) {
  const track = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [state, setState] = useState<SceneState>(() => sceneState(0));

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const read = () => {
      raf = 0;
      const el = track.current;
      if (!el) return;
      const span = el.offsetHeight - (window.innerHeight - HEADER);
      const t = span > 0 ? clamp((HEADER - el.getBoundingClientRect().top) / span) * 4 : 0;
      progress.current = t;
      const style = frame.current?.style;
      if (style) for (const [key, value] of Object.entries(sceneVars(t))) style.setProperty(key, value);
      const next = sceneState(t);
      setState((prev) => (Object.keys(next).every((key) => prev[key as keyof SceneState] === next[key as keyof SceneState]) ? prev : next));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [active]);

  const goTo = (at: number) => {
    const el = track.current;
    if (!el) return;
    const span = el.offsetHeight - (window.innerHeight - HEADER);
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - HEADER + (at / 4) * span, behavior: 'smooth' });
  };
  /**
   * Every panel stays in the page for screen readers and the keyboard. When focus lands in a
   * panel that is off screen or covered, the sequence scrolls to it, so focus is never hidden.
   */
  const followFocus = (event: FocusEvent) => {
    const at = Number((event.target as HTMLElement).closest('[data-at]')?.getAttribute('data-at'));
    if (!Number.isNaN(at) && Math.abs(progress.current - at) > 0.25) goTo(at);
  };
  return { track, frame, progress, state, goTo, followFocus };
}

export default function Home() {
  useTitle(`${site.name} | Fragrance and software, built in Bali`, site.description);
  const reduced = useReducedMotion();
  const roomy = useMedia('(min-width: 900px) and (min-height: 640px)');
  // The pinned sequence needs room and motion; otherwise the same scenes stack as a normal page.
  const pinned = roomy && !reduced;
  const { track, frame, progress, state, goTo, followFocus } = usePinnedScroll(pinned);
  const { data: projects, error, loading, reload } = useApi<ProjectSummary[]>('/projects');

  const navIndex = [0, 0, 1, 2, 3][state.scene];
  const card = (i: number) => ({ '--k': `var(--c${i}, 1)`, '--from': `${160 + i * 40}px` }) as CSSProperties;
  const fan = (i: number) => ({ '--deg': `var(--f${i}, ${(i - 1) * 15}deg)`, '--k': `var(--fk${i}, 1)` }) as CSSProperties;
  const shown = projects?.slice(0, 3) ?? [];
  const startProject = () => (pinned ? goTo(4) : document.getElementById('home-contact')?.scrollIntoView());

  const body = (
    <div className={pinned ? 'frame' : 'home-flat'} ref={frame} onFocus={pinned ? followFocus : undefined}>
      {pinned && (
        <nav className="scenes" aria-label="Home sections">
          <span className="mono mu">{pad(state.scene + 1)} / 05</span>
          <ol>
            {SCENES.map((item, index) => (
              <li key={item.label}>
                <button type="button" className="glowbar" aria-current={index === navIndex ? 'step' : undefined} onClick={() => goTo(item.at)}>
                  {item.label}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="ember">
        <span className="ring" style={{ width: '78%' }} aria-hidden="true" />
        <span className="ring" style={{ width: '104%', borderColor: 'rgba(168, 122, 46, 0.13)' }} aria-hidden="true" />
        <Ember progress={progress} reduced={!pinned} />
      </div>

      <section className="hero" aria-label="Introduction" data-at="0">
        <h1 className="disp">
          <span className="sr">Things that are </span>Not seen,
          <br />
          but <span className="gold">felt.</span>
        </h1>
        <div>
          <p>{site.description}</p>
          <div className="btns">
            <button type="button" className="btn ink" onClick={startProject}>Start a project</button>
            <Link className="btn line" href="/work">See the work</Link>
          </div>
        </div>
        <p className="mono mu" style={{ margin: 0, justifySelf: 'end' }}>{site.location}</p>
      </section>

      <p className="etym">
        Ralph (counsel) + de (of) + Vinca (to bind). <span className="gold">{site.tagline}</span>
      </p>

      <section className="statement" aria-label="What the group is">
        <h2 className="disp">
          Two crafts,
          <br />
          held to one standard.
        </h2>
        <p>Fragrance, explained rather than sold. Systems that hold. Each one built by the same hands, with the same care.</p>
      </section>

      <section className="panel" data-p="div" data-at="2" aria-label="Divisions">
        <div className="panel-head">
          <h2 className="disp">
            Two divisions,
            <br />
            one standard.
          </h2>
          <p>Neither division is a side project. Each case study shows the constraint and the decisions, not only the result.</p>
        </div>
        <div className="cards">
          <Link className="card rise" href="/perfumery" style={card(0)}>
            <span className="mark"><EmbossMark kind="perfumery" run={!pinned || state.lit} /></span>
            <h3>Perfumery</h3>
            <p className="card-line">{divisions.perfumery.line}</p>
            <p>{divisions.perfumery.summary}</p>
          </Link>
          <Link className="card rise" href="/technology" style={card(1)}>
            <span className="mark"><EmbossMark kind="technology" run={!pinned || state.lit} delay={0.12} /></span>
            <h3>Technology</h3>
            <p className="card-line">{divisions.technology.line}</p>
            <p>{divisions.technology.summary}</p>
          </Link>
          <Link className="card rise" href="/work" style={card(2)}>
            <span className="mark"><EmbossMark kind="work" run={!pinned || state.lit} delay={0.24} /></span>
            <h3>Work</h3>
            <p className="card-line">{projects ? `${spell(projects.length)} case ${projects.length === 1 ? 'study' : 'studies'}, every one shown` : 'Every case study, shown'}</p>
            <p>All of them are here; this is not a selection.</p>
          </Link>
        </div>
      </section>

      <section className="panel" data-p="work" data-at="3" aria-label="Work">
        <div className="work-copy">
          <h2 className="disp">
            {projects ? `${spell(projects.length)} ${projects.length === 1 ? 'thing' : 'things'}` : 'Everything'}
            <br />
            built so far.
          </h2>
          <p>All of them are here; this is not a selection. Each one opens as a deck: the situation, the decisions, the result.</p>
          {error && <LoadError message={error.message} retry={reload} />}
          {loading && (
            <div aria-busy="true" aria-label="Loading the work" style={{ display: 'grid', gap: 8, marginBottom: 26 }}>
              {[0, 1, 2].map((i) => <span key={i} className="ghost" style={{ height: 44 }} />)}
            </div>
          )}
          {projects?.length === 0 && <p>The first case study is being written.</p>}
          {projects && projects.length > 0 && (
            <ul className="mini">
              {projects.map((project, index) => (
                <li key={project.id}>
                  <Link href={`/work/${project.slug}`}>
                    <span className="mono">{pad(index + 1)}</span>
                    <span>{project.name}</span>
                    <span className="mono mu">{project.meta_label?.split(' · ').pop() ?? divisions[project.division].name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link className="btn ink" href="/work">Open the work</Link>
        </div>
        {shown.length > 0 && (
          <div className="fan" aria-hidden="true">
            {[...shown].reverse().map((project) => {
              const index = shown.indexOf(project);
              return (
                <div key={project.id} className={'slide ' + ['t-gold', 't-ink', 't-paper'][index]} style={fan(2 - index)}>
                  <SlideBody project={project} number={index + 1} kind="cover" />
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="panel" data-p="contact" data-at="4" id="home-contact" aria-label="Contact">
        <div className="contact-grid">
          <div>
            <h2 className="disp">
              Have something
              <br />
              that needs <span className="gold">building?</span>
            </h2>
            <p className="lede" style={{ marginTop: 18 }}>Tell me what the problem is. If it isn't a good fit, I'll say so.</p>
          </div>
          <ContactForm idPrefix="home-" />
        </div>
      </section>
    </div>
  );

  if (!pinned) return <div className="wrap" style={{ paddingTop: 16, paddingBottom: 16 }}>{body}</div>;
  return (
    <div className="home-track" ref={track}>
      <div className="home-stage">
        <div className="home-glow" aria-hidden="true" />
        {body}
      </div>
    </div>
  );
}
