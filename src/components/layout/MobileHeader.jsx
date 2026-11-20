import { useTheme } from '../../app/AppProviders';
import { useWorkspace } from '../../hooks/useWorkspace';
import { IconMoon, IconSun, IconBriefcase } from '../icons/Icons';

export function MobileHeader() {
  const { theme, toggleTheme } = useTheme();
  const { workspace } = useWorkspace();

  const workspaceName = workspace?.name || (workspace?.kind === 'family' ? 'Family Workspace' : 'Personal Workspace');

  return (
    <header className="mobile-header">
      <div className="mobile-header-brand-wrap">
        <h1 className="mobile-header-title">Family Finance Hub</h1>
        <div className="mobile-workspace-pill">
          <IconBriefcase size={12} className="mobile-pill-icon" />
          <span>{workspaceName}</span>
        </div>
      </div>

      <div className="mobile-header-actions">
        <button
          type="button"
          className="mobile-theme-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? <IconMoon size={16} /> : <IconSun size={16} />}
        </button>

        <div className="mobile-user-avatar" title={workspaceName}>
          <span>{workspaceName.charAt(0).toUpperCase()}</span>
        </div>
      </div>
    </header>
  );
}
