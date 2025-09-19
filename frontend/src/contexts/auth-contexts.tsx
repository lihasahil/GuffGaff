/* eslint-disable react-refresh/only-export-components */

import { AxiosError } from "axios";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiClient } from "../lib/api-client";
import type { User } from "../types/auth-types";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current user from backend
  const fetchUser = useCallback(async () => {
    try {
      const response = await apiClient.get<User>("/auth/check", {
        withCredentials: true,
      });
      setUser(response.data);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const signup = useCallback(
    async (fullName: string, email: string, password: string) => {
      try {
        setIsLoading(true);
        await apiClient.post(
          "/auth/signup",
          { fullName, email, password },
          { withCredentials: true }
        );
      } catch (err) {
        if (err instanceof AxiosError) {
          console.error("Signup failed:", err.response?.data || err.message);
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setIsLoading(true);
        await apiClient.post(
          "/auth/login",
          { email, password },
          { withCredentials: true }
        );
        await fetchUser();
      } catch (err) {
        if (err instanceof AxiosError) {
          console.error("Login failed:", err.response?.data || err.message);
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchUser]
  );

  // Logout: clear cookie + reset state
  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      if (err instanceof AxiosError) {
        console.warn("Logout failed:", err.response?.data || err.message);
      }
    } finally {
      setUser(null);
      window.location.href = "/signin";
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      signup,
    }),
    [user, isLoading, signup, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to consume AuthContext
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
