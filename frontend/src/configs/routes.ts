export const ROUTES = {
  HOME: "/",
  AUTH: {
    SIGNIN: "/signin",
    SIGNUP: "/signup",
  },
  Main: {
    BASE: "/home",
  },
  ERROR: {
    INTERNAL_SERVER_ERROR: "/500",
  },
} as const;
