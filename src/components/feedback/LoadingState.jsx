import { SkeletonBentoCard, SkeletonTransactionRow } from './Skeleton';

export function LoadingState({ label = 'Setting up your financial workspace…', type = 'default' }) {
  return (
    <div role="status" className="pro-loading-wrapper" aria-live="polite">
      <div className="pro-loading-container">
        <div className="pro-spinner">
          <div className="pro-spinner-inner" />
        </div>
        <div className="pro-loading-text">
          <span className="pro-loading-label">{label}</span>
          <span className="pro-loading-sub">Securing session & syncing records…</span>
        </div>
      </div>

      {type === 'bento' && (
        <div className="skeleton-grid-preview" aria-hidden="true" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(13rem, 1fr))', gap: '1rem', marginTop: '1rem', width: '100%' }}>
          <SkeletonBentoCard height="140px" />
          <SkeletonBentoCard height="140px" />
          <SkeletonBentoCard height="140px" />
        </div>
      )}

      {type === 'table' && (
        <div className="skeleton-list-preview" aria-hidden="true" style={{ width: '100%', marginTop: '1rem' }}>
          <SkeletonTransactionRow />
          <SkeletonTransactionRow />
          <SkeletonTransactionRow />
        </div>
      )}
    </div>
  );
}
