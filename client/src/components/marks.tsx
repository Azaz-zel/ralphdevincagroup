// The division marks: one five-petal vinca, the flower the group is named after.
// Perfumery grows it solid; Technology draws the same petals as a faceted structure.

const PETAL = 'M100 96C93 82 85 62 88 47C91 34 103 27 115 30C126 33 130 46 126 58C121 74 109 86 100 96Z';
const FACET = 'M100 94L88 58L91 40L103 30L119 33L126 50L117 72Z';
const TURNS = [0, 72, 144, 216, 288];

type MarkProps = { size?: number; className?: string; label?: string };

const a11y = (label?: string) => (label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true as const });

export function PerfumeryMark({ size = 48, className, label }: MarkProps) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className} {...a11y(label)}>
      <g fill="currentColor">
        {TURNS.map((turn) => (
          <path key={turn} d={PETAL} transform={`rotate(${turn} 100 100)`} />
        ))}
        {size >= 64 && <circle cx="100" cy="100" r="3.5" />}
      </g>
    </svg>
  );
}

/** Strokes get heavier as the mark gets smaller, so the facets survive at icon size. */
export function TechnologyMark({ size = 48, className, label }: MarkProps) {
  const stroke = size >= 200 ? 3 : size >= 100 ? 6 : size >= 40 ? 10 : 16;
  const node = size >= 200 ? 8 : 12;
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className} {...a11y(label)}>
      {size >= 200 && <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 6" />}
      <g fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinejoin="miter">
        {TURNS.map((turn) => (
          <path key={turn} d={FACET} transform={`rotate(${turn} 100 100)`} />
        ))}
      </g>
      {size >= 64 && (
        <g fill="currentColor">
          {TURNS.map((turn) => (
            <rect key={turn} x={119 - node / 2} y={33 - node / 2} width={node} height={node} transform={`rotate(${turn} 100 100)`} />
          ))}
          {size >= 200 && <rect x="95.5" y="95.5" width="9" height="9" transform="rotate(45 100 100)" />}
        </g>
      )}
    </svg>
  );
}

export function DivisionMark({ division, ...props }: MarkProps & { division: string }) {
  return division === 'perfumery' ? <PerfumeryMark {...props} className={'ac ' + (props.className ?? '')} /> : <TechnologyMark {...props} />;
}
