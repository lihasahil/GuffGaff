import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../contexts/auth-contexts";
import { ROUTES } from "../../configs/routes";

/**
 * AuthRedirect: Redirects authenticated users away from auth pages
 * (e.g., login/register) back to dashboard or another protected page.
 */
export function AuthRedirect() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If user is authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate replace to={ROUTES.Main.BASE} />;
  }

  // If not authenticated, render child routes (auth pages)
  return <Outlet />;
}
