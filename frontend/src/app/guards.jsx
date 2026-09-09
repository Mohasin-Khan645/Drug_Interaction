import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui/Feedback';

function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <Spinner label="Restoring your session…" />
    </div>
  );
}

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

/**
 * Hides routes a role should not see. The API enforces authorization; this only
 * keeps the interface coherent.
 */
export function RoleRoute({ allow }) {
  const { currentUser, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (!currentUser || !allow.includes(currentUser.role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
