import { Outlet } from 'react-router-dom';

import { BottomNav } from './BottomNav';
import { MobileHeader } from './MobileHeader';
import { Sidebar } from './Sidebar';

export function AppShell() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <MobileHeader />
        <Outlet />
        <BottomNav />
      </div>
    </div>
  );
}
