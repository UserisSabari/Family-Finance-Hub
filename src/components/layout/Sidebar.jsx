import { NavLink } from 'react-router-dom';

import { useTheme } from '../../app/AppProviders';
import { useWorkspace } from '../../hooks/useWorkspace';
import {
  IconBudgets,
  IconFamily,
  IconGoals,
  IconHome,
  IconMoon,
  IconReports,
  IconSettings,
  IconSun,
  IconTransactions,
  IconWallet,
} from '../icons/Icons';

const links = [
  { label: 'Overview', to: '/app', icon: IconHome },
  { label: 'Transactions', to: '/app/transactions', icon: IconTransactions },
  { label: 'Budgets', to: '/app/budgets', icon: IconBudgets },
  { label: 'Goals', to: '/app/goals', icon: IconGoals },
  { label: 'Reports', to: '/app/reports', icon: IconReports },
  { label: 'Family workspace', to: '/app/family', icon: IconFamily },
  { label: 'Settings', to: '/app/settings', icon: IconSettings },
];

export function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const { workspace } = useWorkspace();

  return (
    <aside className="sidebar">
      <div className="brand-wrapper">
        <div className="brand-icon">₹</div>
        <p className="brand">Family Finance Hub</p>
      </div>

      <div className="workspace-badge" title={workspace?.id ? `Current workspace: ${workspace.name || workspace.id}` : 'Personal workspace'}>
        <span className="workspace-badge-dot" />
        <span>{workspace?.name || (workspace?.kind === 'family' ? 'Family workspace' : 'Personal workspace')}</span>
      </div>

      <nav aria-label="Main navigation">
        {links.map(({ label, to, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/app'}>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button type="button" className="theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? <IconMoon size={16} /> : <IconSun size={16} />}
          <span>Use {theme === 'light' ? 'dark' : 'light'} theme</span>
        </button>
      </div>
    </aside>
  );
}
