import { Outlet } from 'react-router-dom';

import { BottomNav } from './BottomNav';
import { MobileHeader } from './MobileHeader';
import { Sidebar } from './Sidebar';
import { ErrorBoundary } from '../feedback/ErrorBoundary';

export function AppShell() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <MobileHeader />
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
        <BottomNav />
      </div>
    </div>
  );
}
