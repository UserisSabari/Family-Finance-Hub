export function Skeleton({ className = '', style = {}, width, height, radius }) {
  const customStyle = {
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    ...(radius ? { borderRadius: radius } : {}),
    ...style,
  };
  return <div className={`skeleton ${className}`} style={customStyle} aria-hidden="true" />;
}

export function SkeletonText({ lines = 1, width = '100%', height = '0.9rem', className = '' }) {
  return (
    <div className={`skeleton-text-group ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="skeleton-text"
          height={height}
          width={i === lines - 1 && lines > 1 ? '70%' : width}
        />
      ))}
    </div>
  );
}

export function SkeletonCircle({ size = '2.5rem', className = '' }) {
  return <Skeleton className={`skeleton-circle ${className}`} width={size} height={size} radius="50%" />;
}

export function SkeletonBentoCard({ height = '140px', className = '' }) {
  return (
    <div className={`skeleton-card ${className}`} style={{ height, display: 'flex', flexDirection: 'column', gap: '0.75rem' }} aria-hidden="true">
      <Skeleton width="40%" height="0.85rem" />
      <Skeleton width="65%" height="1.75rem" />
      <Skeleton width="30%" height="0.75rem" style={{ marginTop: 'auto' }} />
    </div>
  );
}

export function SkeletonTransactionRow() {
  return (
    <div
      className="skeleton-card"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-md)',
        marginBottom: '0.5rem',
      }}
      aria-hidden="true"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
        <SkeletonCircle size="2.25rem" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
          <Skeleton width="45%" height="0.9rem" />
          <Skeleton width="25%" height="0.75rem" />
        </div>
      </div>
      <Skeleton width="4rem" height="1.1rem" />
    </div>
  );
}
