import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { ROUTES } from "../configs/routes";

/**
 * Interceptors type definition for request and response interceptors.
 * It allows customization of request and response handling in the Axios instance.
 */
type Interceptors = {
  onRequest?: (
    config: InternalAxiosRequestConfig
  ) => InternalAxiosRequestConfig;
  onRequestError?: (error: AxiosError) => Promise<never>;
  onResponse?: (response: AxiosResponse) => AxiosResponse;
  onResponseError?: (error: AxiosError) => Promise<never>;
};

interface CreateApiInstanceParams {
  baseUrl: string;
  apiKey?: string;
  interceptors?: Interceptors;
}

/**
 * Creates an Axios instance with the provided base URL and interceptors.
 * Sets default headers, timeout, and request/response interceptors.
 */
const createApiInstance = ({
  apiKey,
  baseUrl,
  interceptors,
}: CreateApiInstanceParams): AxiosInstance => {
  const apiInstance: AxiosInstance = axios.create({
    baseURL: baseUrl,
    timeout: 10000, // 10 seconds
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    withCredentials: true, // include cookies
  });

  // Request interceptor
  apiInstance.interceptors.request.use(
    interceptors?.onRequest ??
      ((config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem("access_token");
        if (token) config.headers.set("Authorization", `Bearer ${token}`);
        if (apiKey) config.headers.set("x-api-key", apiKey);
        return config;
      }),
    interceptors?.onRequestError ??
      ((error: AxiosError) => Promise.reject(error))
  );

  // Response interceptor
  apiInstance.interceptors.response.use(
    interceptors?.onResponse ?? ((response: AxiosResponse) => response),
    interceptors?.onResponseError ??
      (async (error: AxiosError) => {
        const currentPath = window.location.pathname; // where user currently is

        console.error("[API Response Error]:", error);

        if (error.response?.status === 401) {
          // Check if current path is NOT inside AUTH routes
          const authRoutes = Object.values(ROUTES.AUTH);
          const isAuthRoute = authRoutes.some((route) => {
            return route === currentPath;
          });

          if (!isAuthRoute) {
            console.warn("Unauthorized outside auth route! Logging out...");
            try {
              await apiClient.post("/auth/logout");
            } catch (logoutErr) {
              console.error("Logout request failed:", logoutErr);
            }
            localStorage.removeItem("access_token");
            localStorage.removeItem("user");
            window.location.href = ROUTES.AUTH.SIGNIN;
          }
        }

        return Promise.reject(error);
      })
  );

  return apiInstance;
};

// Example usage without ENV
export const apiClient = createApiInstance({
  baseUrl: import.meta.env.VITE_BASE_URL,
  apiKey: import.meta.env.VITE_X_API_KEY,
});
