import { NavLink } from 'react-router-dom';

import {
  IconBudgets,
  IconGoals,
  IconHome,
  IconSettings,
  IconTransactions,
} from '../icons/Icons';

const mobileLinks = [
  { label: 'Overview', to: '/app', icon: IconHome },
  { label: 'Activity', to: '/app/transactions', icon: IconTransactions },
  { label: 'Budgets', to: '/app/budgets', icon: IconBudgets },
  { label: 'Goals', to: '/app/goals', icon: IconGoals },
  { label: 'Settings', to: '/app/settings', icon: IconSettings },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      <div className="bottom-nav-inner">
        {mobileLinks.map(({ label, to, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/app'}>
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

