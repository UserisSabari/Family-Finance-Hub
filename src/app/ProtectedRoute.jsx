import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../features/auth/AuthProvider';
import { LoadingState } from '../components/feedback/LoadingState';
import { ErrorState } from '../components/feedback/ErrorState';

export function ProtectedRoute() {
  const { user, loading, error } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingState label="Loading your workspace…" />;
  if (error) return <ErrorState message={error.message ?? 'Unable to load your account.'} />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  return <Outlet />;
}
