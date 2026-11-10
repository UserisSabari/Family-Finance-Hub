export function ProgressBar({ label, value, max = 100 }) {
  const percentage = Math.min(100, Math.max(0, max ? (value / max) * 100 : 0));
  return <div className="progress-block">
    <div className="progress-heading"><span>{label}</span><strong>{Math.round(percentage)}%</strong></div>
    <div className="progress-track" role="progressbar" aria-label={label} aria-valuenow={Math.round(percentage)}
      aria-valuemin="0" aria-valuemax="100">
      <span style={{ width: `${percentage}%` }} />
    </div>
  </div>;
}
