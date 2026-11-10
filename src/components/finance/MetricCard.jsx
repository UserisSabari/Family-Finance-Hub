import { formatInr } from '../../lib/format/currency';

export function MetricCard({ label, value, tone = '' }) {
  return <article className={`metric-card ${tone}`} aria-label={label}>
    <p>{label}</p>
    <strong>{formatInr(value)}</strong>
  </article>;
}
