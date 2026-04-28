import { Navigate, Outlet, Link } from 'react-router-dom';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../../lib/database.types';

// ── Route helper ─────────────────────────────────────────────────────
/**
 * Returns the dashboard route for a given user role.
 * Each role lands on the same base `/gestion` path for now;
 * role-specific dashboards will be added in later tasks.
 */
export function getDashboardRoute(role: UserRole): string {
  switch (role) {
    case 'gerencia':
      return '/gestion';
    case 'supervisor':
      return '/gestion';
    case 'ejecucion':
      return '/gestion';
    default:
      return '/gestion';
  }
}

// ── Component ────────────────────────────────────────────────────────
interface ProtectedRouteProps {
  /** Optional list of roles allowed to access this route. If omitted, any authenticated user can access. */
  allowedRoles?: UserRole[];
}

/**
 * Route guard that checks authentication and (optionally) role-based access.
 *
 * - Shows a loading spinner while the auth state is being restored.
 * - Redirects to `/login` if the user is not authenticated.
 * - Shows an "insufficient permissions" message if the user's role is not in `allowedRoles`.
 * - Renders child routes via `<Outlet />` when the user is authenticated and authorized.
 */
function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  // ── Loading state ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      </div>
    );
  }

  // ── Not authenticated → redirect to login ────────────────────────
  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  // ── Role check (only when allowedRoles is provided) ──────────────
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
    const dashboardRoute = getDashboardRoute(profile.role);

    return (
      <div className="min-h-screen bg-dark flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-red-500/10 p-4">
              <ShieldAlert className="h-12 w-12 text-red-400" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">
              Permisos insuficientes
            </h1>
            <p className="text-gray-400 text-sm">
              No tienes acceso a esta sección. Contacta al administrador si
              crees que esto es un error.
            </p>
          </div>

          <Link
            to={dashboardRoute}
            className="inline-flex items-center justify-center rounded-lg bg-brand-500 hover:bg-brand-400 text-white font-medium px-6 py-2.5 transition-colors duration-200 cursor-pointer"
          >
            Volver al Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ── Authorized → render child routes ─────────────────────────────
  return <Outlet />;
}

export default ProtectedRoute;
