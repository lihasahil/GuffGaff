import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../contexts/auth-contexts";
import { ROUTES } from "../../configs/routes";

/**
 * ProtectedRoute component restricts access to child routes
 * if the user is not authenticated.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Redirect to login page if not authenticated
  if (!isAuthenticated) {
    return <Navigate replace to={ROUTES.AUTH.SIGNIN} />;
  }

  // Render child routes if authenticated
  return <Outlet />;
}
