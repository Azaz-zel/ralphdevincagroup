import type { CSSProperties, ReactNode } from 'react';
import { Link } from '@/lib/router';

/** The long hairline arrow used on links and buttons. */
export function Arrow({ width = 40, back = false }: { width?: number; back?: boolean }) {
  const d = back ? `M${width} 6H2M8 1 2 6l6 5` : `M0 6h${width - 2}M${width - 8} 1l6 5-6 5`;
  return (
    <svg className="arr" width={width} height="12" viewBox={`0 0 ${width} 12`} aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function Win({ title, tag, children, className = '', bodyClass = 'win-c', danger = false }: {
  title: ReactNode;
  tag?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClass?: string;
  danger?: boolean;
}) {
  return (
    <div className={'win ' + className}>
      <div className={'win-b' + (danger ? ' danger' : '')}>
        <span>{title}</span>
        {tag ? <span>{tag}</span> : <i />}
      </div>
      <div className={bodyClass}>{children}</div>
    </div>
  );
}

export function SectionLabel({ label, aside, as: Tag = 'h2' }: { label: string; aside?: string; as?: 'h2' | 'p' }) {
  return (
    <div className="sl">
      <Tag className="m">[ {label} ]</Tag>
      {aside && <p className="m mu">{aside}</p>}
    </div>
  );
}

/** A photo slot. Until a photo exists it shows the fallback (a division mark) on hatching. */
export function Photo({ src, alt = '', fallback, ratio = '16 / 10', style }: {
  src?: string | null;
  alt?: string;
  fallback?: ReactNode;
  ratio?: string;
  style?: CSSProperties;
}) {
  return (
    <span className="ph" style={{ aspectRatio: ratio, ...style }}>
      {src ? <img src={src} alt={alt} loading="lazy" /> : fallback}
    </span>
  );
}

export interface Callout {
  title: string;
  body: string;
}

const SLOTS = ['a', 'b', 'c', 'd'] as const;

/**
 * The hero: a headline at top left, one object at the centre, and up to four
 * callouts joined to it by elbow leader lines. Below 960px it becomes a plain stack.
 */
export function Stage({ title, controls, caption, objects, callouts, window: win, corner, enter }: {
  title: ReactNode;
  controls?: ReactNode;
  caption: ReactNode;
  objects: ReactNode;
  callouts: Callout[];
  window: { title: string; tag: string; body: ReactNode };
  corner: ReactNode;
  enter?: { href: string; label: string };
}) {
  return (
    <section className="wrap" aria-label="Introduction">
      <div className="stage">
        <div className="hh" aria-hidden="true" />
        <div className="hv" aria-hidden="true" />
        <div className="ring" aria-hidden="true" />

        <div className="co-title">{title}</div>
        {controls && <div className="co-chips">{controls}</div>}
        <p className="m mu co-fig" aria-live="polite">{caption}</p>
        {objects}
        {enter && (
          <Link className="tl co-enter" href={enter.href}>
            {enter.label} <Arrow />
          </Link>
        )}

        {callouts.map((callout, index) => (
          <Slot key={callout.title} slot={SLOTS[index]} number={index + 1} callout={callout} />
        ))}

        <div className="ld ld-w" aria-hidden="true" />
        <div className="nd nd-w hollow" aria-hidden="true" />
        <Win className="co-w" title={win.title} tag={win.tag}>
          <p className="m" style={{ margin: '0 0 12px' }}>{win.body}</p>
          <div className="bars" aria-hidden="true" />
        </Win>

        <div className="co-bl">{corner}</div>
      </div>
    </section>
  );
}

function Slot({ slot, number, callout }: { slot: (typeof SLOTS)[number]; number: number; callout: Callout }) {
  return (
    <>
      <div className={`ld ld-${slot}`} aria-hidden="true" />
      <div className={`nd nd-${slot}`} aria-hidden="true" />
      <div className={`co co-${slot}`}>
        <p className="m">
          <span className="ac">0{number}</span> {callout.title}
        </p>
        <p className="m mu">{callout.body}</p>
      </div>
    </>
  );
}

/** The closing "start a project" band shared by several pages. */
export function ProjectCta({ label, heading, body }: { label: string; heading: ReactNode; body: string }) {
  return (
    <section className="sec">
      <div className="wrap g12 end">
        <div className="span-8" style={{ gridColumn: '1 / 8' }}>
          <p className="m" style={{ margin: '0 0 20px' }}>[ {label} ]</p>
          <h2 className="h1" style={{ fontSize: 'clamp(44px, 5.6vw, 84px)' }}>{heading}</h2>
        </div>
        <Win className="span-r4" title="Not a team · just me">
          <p className="p sm">{body}</p>
          <p className="m mu" style={{ margin: '0 0 20px' }}>
            → Reply within two working days
          </p>
          <Link className="btn full" href="/contact">
            Write to me <Arrow />
          </Link>
        </Win>
      </div>
    </section>
  );
}

export function LoadError({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="note bad" role="alert">
      <p>
        {message}{' '}
        {retry && (
          <button type="button" className="qb danger" onClick={retry}>
            Try again
          </button>
        )}
      </p>
    </div>
  );
}
