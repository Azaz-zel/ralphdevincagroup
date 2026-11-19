import { useEffect, useId, useRef, type CSSProperties, type ReactNode } from 'react';
import { WarningCircle } from '@phosphor-icons/react';
import { pad } from '@/lib/format';
import { useReducedMotion } from '@/lib/hooks';
import { Link } from '@/lib/router';
import type { Division, ProjectSummary } from '@/lib/types';
import { DivisionMark, FACET, PETAL, TURNS } from './marks';

/** A photo slot. Until a photo exists it shows the fallback (a division mark) on hatching. */
export function Photo({ src, alt = '', fallback, ratio = '16 / 10', style, eager = false }: {
  src?: string | null;
  alt?: string;
  eager?: boolean;
  fallback?: ReactNode;
  ratio?: string;
  style?: CSSProperties;
}) {
  return (
    <span className="photo" style={{ aspectRatio: ratio, ...style }}>
      {src ? <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} decoding="async" /> : fallback}
    </span>
  );
}

export function LoadError({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="note bad" role="alert" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
      <WarningCircle size={20} aria-hidden="true" />
      <p style={{ flex: '1 1 220px' }}>{message}</p>
      {retry && (
        <button type="button" className="btn line sm" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}

export type EmbossKind = Division | 'work';

const SHAPES: Record<EmbossKind, { label: string; draw: ReactNode }> = {
  perfumery: {
    label: 'Perfumery mark: five petals, 72 degrees apart',
    draw: TURNS.map((turn) => <path key={turn} d={PETAL} transform={`rotate(${turn} 100 100)`} />),
  },
  technology: {
    label: 'Technology mark: the same petals, faceted',
    draw: (
      <>
        {TURNS.map((turn) => (
          <path key={turn} d={FACET} transform={`rotate(${turn} 100 100)`} />
        ))}
        {TURNS.map((turn) => (
          <rect key={'n' + turn} x="113" y="27" width="12" height="12" transform={`rotate(${turn} 100 100)`} />
        ))}
      </>
    ),
  },
  work: {
    label: 'Three slides on an arc',
    draw: [-16, 0, 16].map((deg) => <rect key={deg} x="38" y="60" width="124" height="78" rx="8" transform={`rotate(${deg} -200 100)`} />),
  },
};

/**
 * A mark pressed into the card, with a gold edge. A band of light crosses the edge once,
 * when `run` turns true (on mount by default), after `delay` seconds.
 */
export function EmbossMark({ kind, run = true, delay = 0, decorative = false }: { kind: EmbossKind; run?: boolean; delay?: number; decorative?: boolean }) {
  const id = useId().replace(/:/g, '');
  const reduced = useReducedMotion();
  const sweep = useRef<SVGAnimateElement>(null);
  const shape = SHAPES[kind];
  const animate = !reduced;
  // The light rests past the shape; until it has run, it waits before it.
  const x1 = animate && !run ? -220 : 200;
  useEffect(() => {
    if (!animate || !run) return;
    // SMIL `begin` counts from page load, so a late start is triggered by hand.
    const el = sweep.current;
    const timer = window.setTimeout(() => {
      el?.beginElement();
      (el?.nextElementSibling as SVGAnimateElement | null)?.beginElement();
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [animate, run, delay]);
  return (
    <svg className="emboss" viewBox="0 0 200 200" {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': shape.label })}>
      <defs>
        <filter id={`f${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="-2" dy="-2" stdDeviation="1.4" floodColor="#FFFFFF" floodOpacity="0.95" />
          <feDropShadow dx="5" dy="8" stdDeviation="6" floodColor="#5A4020" floodOpacity="0.32" />
        </filter>
        <linearGradient id={`g${id}`} gradientUnits="userSpaceOnUse" x1={x1} y1="0" x2={x1 + 200} y2="200">
          {animate && (
            <>
              <animate ref={sweep} attributeName="x1" from="-220" to="200" dur="1.8s" begin="indefinite" fill="freeze" />
              <animate attributeName="x2" from="-20" to="400" dur="1.8s" begin="indefinite" fill="freeze" />
            </>
          )}
          <stop offset="0" stopColor="#8A6424" />
          <stop offset="0.5" stopColor="#FFE7AE" />
          <stop offset="1" stopColor="#9C7330" />
        </linearGradient>
      </defs>
      <g filter={`url(#f${id})`} fill={kind === 'perfumery' ? '#EFE5D3' : 'none'} stroke={`url(#g${id})`} strokeWidth="3" strokeLinejoin="round">
        {shape.draw}
      </g>
    </svg>
  );
}

export type SlideKind = 'cover' | 'decisions' | 'result';
export const SLIDE_KINDS: { kind: SlideKind; label: string; theme: string }[] = [
  { kind: 'cover', label: 'Case study', theme: 't-gold' },
  { kind: 'decisions', label: 'Decisions', theme: 't-ink' },
  { kind: 'result', label: 'Result', theme: 't-paper' },
];
const DIVISION_NAME: Record<Division, string> = { perfumery: 'Perfumery', technology: 'Technology' };

/** One slide of a case study deck: the cover, the decisions, or the result. */
export function SlideBody({ project, number, kind }: { project: ProjectSummary; number: number; kind: SlideKind }) {
  const meta = SLIDE_KINDS.find((item) => item.kind === kind)!;
  const cover = project.cover;
  return (
    <>
      <div className="bar mono">
        <span>{pad(number)} / {DIVISION_NAME[project.division]}</span>
        <span>{meta.label}</span>
      </div>
      {kind === 'cover' && (
        <>
          <p className="name" style={{ marginTop: 16 }}>{project.name}</p>
          <div className="low">
            <p>{project.summary}</p>
            <span className="numeral" aria-hidden="true">{number}</span>
          </div>
        </>
      )}
      {kind === 'decisions' && (
        <ol className="dec">
          {project.decisions.slice(0, 4).map((decision, index) => (
            <li key={decision.title} style={{ opacity: [1, 0.8, 0.6, 0.42][index] }}>
              <span>{index + 1}</span>
              <span>{decision.title}</span>
            </li>
          ))}
        </ol>
      )}
      {kind === 'result' && (
        <div className="res">
          <div>
            <dl className="facts">
              {project.facts.slice(0, 3).map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
            <p>{project.result}</p>
          </div>
          <Photo src={cover?.url} alt={cover?.alt} ratio="auto" fallback={<DivisionMark division={project.division} size={44} />} />
        </div>
      )}
    </>
  );
}

/** The closing "start a project" band shared by several pages. */
export function ProjectCta({ heading, body }: { heading: ReactNode; body: string }) {
  return (
    <section className="sec">
      <div className="wrap split" style={{ alignItems: 'end' }}>
        <h2 className="disp" style={{ fontSize: 'clamp(32px, 4.4vw, 68px)' }}>{heading}</h2>
        <div className="card paper" style={{ maxWidth: 460, justifySelf: 'end' }}>
          <p className="mono mu" style={{ margin: 0 }}>Not a team · just me</p>
          <p className="p" style={{ margin: 0 }}>{body}</p>
          <p className="mono gold" style={{ margin: 0 }}>Reply within two working days</p>
          <Link className="btn ink" href="/contact" style={{ marginTop: 8 }}>Write to me</Link>
        </div>
      </div>
    </section>
  );
}
