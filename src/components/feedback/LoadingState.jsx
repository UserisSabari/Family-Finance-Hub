export function LoadingState({ label = 'Setting up your financial workspace…' }) {
  return (
    <div role="status" className="pro-loading-container" aria-live="polite">
      <div className="pro-spinner">
        <div className="pro-spinner-inner" />
      </div>
      <div className="pro-loading-text">
        <span className="pro-loading-label">{label}</span>
        <span className="pro-loading-sub">Securing session & syncing records…</span>
      </div>
    </div>
  );
}
