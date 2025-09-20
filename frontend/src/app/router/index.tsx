import { createBrowserRouter, Navigate } from "react-router";
import App from "..";
import { ROUTES } from "../../configs/routes";
import { AuthRedirect } from "../../components/gaurds/auth-redirect-route";
import { ProtectedRoute } from "../../components/gaurds/protected-route";
import AuthLayout from "../../features/auth";
import LoginForm from "../../features/auth/components/login-form";
import SignUpForm from "../../features/auth/components/signup-form";
import Profile from "../../features/profile";
import MainPageLayout from "../../components/layouts/main-page-layout";
import Home from "../../features/home";

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
          {
            Component: MainPageLayout,
            children: [
              { path: ROUTES.Main.BASE, element: <Home /> },
              {
                path: ROUTES.Main.PROFILE,
                element: <Profile />,
              },
            ],
          },
        ],
      },
    ],
  },
  //   { path: "*", element: <NotFound /> },
]);
