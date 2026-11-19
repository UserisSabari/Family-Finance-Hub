import { useState } from 'react';
import { formatInr } from '../../lib/format/currency';

const PALETTE = [
  '#059669', // Emerald
  '#2563eb', // Blue
  '#d97706', // Amber
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#0891b2', // Cyan
  '#ea580c', // Orange
  '#475569', // Slate
];

export function SpendDonutChart({ items = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!items.length) {
    return <p className="muted" style={{ textAlign: 'center', padding: '2rem 0' }}>No spending recorded for this period.</p>;
  }

  const total = items.reduce((sum, item) => sum + item.amount, 0);
  if (!total) {
    return <p className="muted" style={{ textAlign: 'center', padding: '2rem 0' }}>No outflow recorded for this period.</p>;
  }

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  const segments = items.map((item, idx) => {
    const percentage = item.amount / total;
    const strokeDash = `${percentage * circumference} ${circumference}`;
    const offset = -accumulatedOffset;
    accumulatedOffset += percentage * circumference;
    const color = PALETTE[idx % PALETTE.length];
    return {
      ...item,
      percentage: Math.round(percentage * 100),
      strokeDash,
      offset,
      color,
    };
  });

  const activeSegment = hoveredIdx !== null ? segments[hoveredIdx] : null;

  return (
    <div className="spend-donut-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
      <div style={{ position: 'relative', width: '220px', height: '220px' }}>
        <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--color-surface-subtle)"
            strokeWidth="12"
          />
          {segments.map((segment, idx) => (
            <circle
              key={segment.category}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={hoveredIdx === idx ? 15 : 12}
              strokeDasharray={segment.strokeDash}
              strokeDashoffset={segment.offset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                cursor: 'pointer',
                opacity: hoveredIdx === null || hoveredIdx === idx ? 1 : 0.45,
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          ))}
        </svg>

        {/* Center label */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            textAlign: 'center',
            padding: '0.5rem',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            {activeSegment ? activeSegment.category : 'Total Outflow'}
          </span>
          <strong style={{ fontSize: '1.15rem', color: 'var(--color-text)', marginTop: '0.1rem' }}>
            {activeSegment ? formatInr(activeSegment.amount) : formatInr(total)}
          </strong>
          {activeSegment && (
            <small style={{ fontSize: '0.75rem', color: activeSegment.color, fontWeight: 700 }}>
              {activeSegment.percentage}%
            </small>
          )}
        </div>
      </div>

      {/* Category Pills Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '0.5rem',
          width: '100%',
        }}
      >
        {segments.map((segment, idx) => (
          <div
            key={segment.category}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.6rem',
              borderRadius: 'var(--radius-md)',
              background: hoveredIdx === idx ? 'var(--color-surface-subtle)' : 'transparent',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: segment.color,
                flexShrink: 0,
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {segment.category}
              </span>
              <small style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>
                {formatInr(segment.amount)} ({segment.percentage}%)
              </small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
