import { createBrowserRouter, Navigate } from "react-router";
import App from "..";
import { ROUTES } from "../../configs/routes";
import { AuthRedirect } from "../../components/gaurds/auth-redirect-route";
import { ProtectedRoute } from "../../components/gaurds/protected-route";
import AuthLayout from "../../features/auth";
import LoginForm from "../../features/auth/components/login-form";
import SignUpForm from "../../features/auth/components/signup-form";

export const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        path: ROUTES.HOME,
        element: <Navigate replace to={ROUTES.AUTH.SIGNIN} />,
      },
      {
        Component: AuthRedirect,
        children: [
          {
            Component: AuthLayout,
            children: [
              { path: ROUTES.AUTH.SIGNIN, element: <LoginForm /> },
              { path: ROUTES.AUTH.SIGNUP, element: <SignUpForm /> },
            ],
          },
        ],
      },
      {
        Component: ProtectedRoute,
        children: [
          //   {
          //     path: ROUTES.HOME,
          //     element: <RoleBasedRoutesSwitcher />,
          //   },
        ],
      },
    ],
  },
  //   { path: "*", element: <NotFound /> },
]);
