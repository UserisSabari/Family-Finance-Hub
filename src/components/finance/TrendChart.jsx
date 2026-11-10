import { formatInr } from '../../lib/format/currency';

export function TrendChart({ points = [] }) {
  if (!points.length) return <p className="muted">No trend data for this period.</p>;
  const max = Math.max(...points.map((point) => point.amount), 1);
  return <div className="trend-chart" aria-label="Spending trend">
    {points.map((point) => <div className="trend-point" key={point.period} title={`${point.period}: ${formatInr(point.amount)}`}>
      <span className="trend-bar" style={{ height: `${Math.max(4, (point.amount / max) * 100)}%` }} />
      <small>{point.period}</small>
    </div>)}
  </div>;
}
