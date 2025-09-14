export const ROUTES = {
  HOME: "/",
  AUTH: {
    SIGNIN: "/signin",
    SIGNUP: "/signup",
  },
  Main: {
    BASE: "/home",
    PROFILE: "/profile",
    SETTINGS: "/settings",
  },
  ERROR: {
    INTERNAL_SERVER_ERROR: "/500",
  },
} as const;
