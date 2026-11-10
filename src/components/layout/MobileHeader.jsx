import { useTheme } from '../../app/AppProviders';
import { useWorkspace } from '../../hooks/useWorkspace';
import { IconMoon, IconSun } from '../icons/Icons';

export function MobileHeader() {
  const { theme, toggleTheme } = useTheme();
  const { workspace } = useWorkspace();

  return (
    <header className="mobile-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div className="brand-icon" style={{ width: '1.75rem', height: '1.75rem', fontSize: '0.9rem' }}>₹</div>
        <div>
          <span className="brand" style={{ fontSize: '1rem', display: 'block' }}>Family Finance Hub</span>
          <small style={{ color: 'var(--color-muted)', fontSize: '0.75rem' }}>
            {workspace?.name || (workspace?.kind === 'family' ? 'Family workspace' : 'Personal')}
          </small>
        </div>
      </div>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={toggleTheme}
        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
      >
        {theme === 'light' ? <IconMoon size={14} /> : <IconSun size={14} />}
        <span>Use {theme === 'light' ? 'dark' : 'light'} theme</span>
      </button>
    </header>
  );
}
