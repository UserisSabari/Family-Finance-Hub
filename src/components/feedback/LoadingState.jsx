export function LoadingState({ label = 'Loading…' }) {
  return <p role="status" className="feedback">{label}</p>;
}
