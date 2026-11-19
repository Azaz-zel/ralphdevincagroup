import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent } from 'react';
import { ArrowDown, ArrowUp } from '@phosphor-icons/react';
import { LoadError, SLIDE_KINDS, SlideBody } from '@/components/ui';
import { useApi } from '@/lib/api';
import { divisions } from '@/lib/config';
import { pad, plural, spell } from '@/lib/format';
import { pageTitle, useReducedMotion, useTitle } from '@/lib/hooks';
import { Link } from '@/lib/router';
import type { ProjectSummary } from '@/lib/types';

const STEP_VH = 32; // scroll distance per slide
const DEG = 16; // angle between slides on the wheel

/**
 * The wheel's geometry for a stage of the given size, as CSS variables. Each slide reads its
 * angle from `--i` (its index) minus `--rot` (how far the wheel has turned), which the scroll
 * handler writes straight to the wheel, so turning it never re-renders the slides.
 */
function geometry(width: number, height: number): CSSProperties {
  const narrow = width < 760;
  const scale = narrow ? (width * 0.8) / 600 : Math.min(1, width / 1460);
  const radius = 900 * scale;
  return {
    '--cx': `${((narrow ? width * 0.5 : width * 0.68) - radius - 300).toFixed(1)}px`,
    '--cy': `${(height * (narrow ? 0.49 : 0.52) - 187.5).toFixed(1)}px`,
    '--r': `${radius.toFixed(1)}px`,
    '--s': scale.toFixed(3),
    '--deg': `${DEG}deg`,
  } as CSSProperties;
}

export default function Work() {
  useTitle(pageTitle('Work'), 'Projects across fragrance and software, with the decisions behind each one.');
  const { data: projects, error, loading, reload } = useApi<ProjectSummary[]>('/projects');
  const reduced = useReducedMotion();
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const wheel = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [size, setSize] = useState({ width: 1440, height: 800 });
  const drag = useRef<{ y: number; scroll: number; moved: boolean } | null>(null);

  const slides = (projects ?? []).flatMap((project, p) => SLIDE_KINDS.map((kind) => ({ project, number: p + 1, ...kind })));
  const count = slides.length;

  const stepPx = () => (window.innerHeight * STEP_VH) / 100;
  const trackTop = () => (track.current ? track.current.getBoundingClientRect().top + window.scrollY : 0);
  const goTo = (index: number) => {
    const target = Math.max(0, Math.min(count - 1, index));
    window.scrollTo({ top: trackTop() - 64 + target * stepPx(), behavior: reduced ? 'auto' : 'smooth' });
  };

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const measure = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (count === 0) return;
    let raf = 0;
    const read = () => {
      raf = 0;
      const top = track.current?.getBoundingClientRect().top ?? 0;
      const rot = Math.max(0, Math.min(count - 1, (64 - top) / stepPx()));
      wheel.current?.style.setProperty('--rot', rot.toFixed(4));
      setActive(Math.round(rot));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    // Each slide is a snap point, so a flick settles on a slide instead of between two.
    const root = document.documentElement;
    root.style.scrollSnapType = 'y proximity';
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      root.style.scrollSnapType = '';
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [count]);

  // A mouse can drag the wheel; touch already scrolls the page natively.
  const down = (event: PointerEvent) => {
    if (event.pointerType === 'mouse' && event.button === 0) drag.current = { y: event.clientY, scroll: window.scrollY, moved: false };
  };
  const move = (event: PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dy = event.clientY - d.y;
    if (Math.abs(dy) > 6) d.moved = true;
    if (d.moved) window.scrollTo({ top: d.scroll - dy * 1.6, behavior: 'auto' });
  };
  const up = () => {
    if (drag.current && !drag.current.moved) drag.current = null;
    else if (drag.current) setTimeout(() => (drag.current = null));
  };
  const swallowDragClick = (event: MouseEvent) => {
    if (drag.current?.moved) event.preventDefault();
  };

  const current = slides[Math.min(active, count - 1)];
  const height = count > 0 ? `calc(${(count - 1) * STEP_VH}vh + 100vh - 64px)` : 'calc(100vh - 64px)';

  return (
    <div className="wheel-track" ref={track} style={{ height }}>
      {slides.map((slide, index) => (
        <span key={index} className="wheel-snap" style={{ top: `calc(${index * STEP_VH}vh - 16px)` }} aria-hidden="true" />
      ))}
      <div className="wheel-stage" ref={stage} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onClickCapture={swallowDragClick}>
        <h1 className="sr">Work</h1>

        {current && (
          <section className="wheel-info" aria-label="Current case study">
            <h2 className="disp">{current.project.name}</h2>
            <p className="mono mu wheel-meta">
              {pad(current.number)} / {pad(projects!.length)} · {current.label}
            </p>
            <p>{current.project.index_summary ?? current.project.summary}</p>
            <div className="wheel-ctl">
              <Link className="btn ink" href={`/work/${current.project.slug}`}>Open case study</Link>
                <div className="mid">
                  <button type="button" className="icon-btn round" aria-label="Previous slide" disabled={active === 0} onClick={() => goTo(active - 1)}>
                    <ArrowUp size={16} aria-hidden="true" />
                  </button>
                  <span className="mono" style={{ minWidth: 64, textAlign: 'center' }} aria-live="polite">{pad(active + 1)} / {pad(count)}</span>
                  <button type="button" className="icon-btn round" aria-label="Next slide" disabled={active === count - 1} onClick={() => goTo(active + 1)}>
                    <ArrowDown size={16} aria-hidden="true" />
                  </button>
                </div>
            </div>
          </section>
        )}

        <div className="wheel" ref={wheel} style={geometry(size.width, size.height)}>
          {slides.map((slide, index) => {
            const far = Math.abs(index - active) > 4;
            return (
              <Link
                key={index}
                className={'slide ' + slide.theme}
                href={`/work/${slide.project.slug}`}
                draggable={false}
                tabIndex={far ? -1 : undefined}
                aria-label={`${slide.project.name}, ${slide.label.toLowerCase()} slide`}
                style={{ '--i': index, zIndex: 100 - Math.abs(index - active), visibility: far ? 'hidden' : undefined } as CSSProperties}
                // Keyboard focus turns the wheel to the slide; a mouse press does not, or the wheel would jump before the click.
                onFocus={(event) => index !== active && event.currentTarget.matches(':focus-visible') && goTo(index)}
              >
                <SlideBody project={slide.project} number={slide.number} kind={slide.kind} />
              </Link>
            );
          })}
          {loading &&
            [-2, -1, 0, 1, 2].map((pos) => <span key={pos} className="ghost slide" style={{ '--i': pos } as CSSProperties} aria-hidden="true" />)}
        </div>
        {loading && <p className="sr" role="status">Loading the work</p>}

        {error && (
          <div className="state-box">
            <h2 className="disp" style={{ fontSize: 28 }}>The work did not load.</h2>
            <div style={{ marginTop: 16 }}><LoadError message={error.message} retry={reload} /></div>
          </div>
        )}
        {projects?.length === 0 && (
          <div className="state-box">
            <h2 className="disp" style={{ fontSize: 28 }}>Nothing here yet.</h2>
            <p>The first case study is being written. Until then, the home page explains both divisions.</p>
            <Link className="btn ink" href="/">Back to home</Link>
          </div>
        )}

        {count > 0 && (
          <div className="wheel-foot">
            <span className="mono mu tag">
              {spell(projects!.length)} {plural(projects!.length, 'project')} · {[...new Set(projects!.map((p) => divisions[p.division].name))].join(' and ')}
            </span>
            <span className="mono mu tag">Scroll or drag to turn</span>
          </div>
        )}
      </div>
    </div>
  );
}
