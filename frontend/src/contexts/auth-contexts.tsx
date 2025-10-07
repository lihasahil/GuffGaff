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
import { ROUTES } from "../configs/routes";
import { useNavigate } from "react-router";
import { socket } from "../lib/socket";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch authenticated user
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

  // Run on initial load
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) {
      if (!socket.connected) {
        socket.connect();
        console.log("🔌 Socket connected:", socket.id);
      }

      socket.on("connect", () => {
        console.log("Socket reconnected:", socket.id);
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });
    } else {
      if (socket.connected) {
        socket.disconnect();
        console.log("🚪 Socket disconnected (no user)");
      }
    }
    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [user]);

  // Signup
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

  // Login 
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setIsLoading(true);
        await apiClient.post(
          "/auth/login",
          { email, password },
          { withCredentials: true }
        );
        await fetchUser(); // this triggers socket connect via effect
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

  // Logout
  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      if (err instanceof AxiosError) {
        console.warn("Logout failed:", err.response?.data || err.message);
      }
    } finally {
      setUser(null);
      navigate(ROUTES.AUTH.SIGNIN, { replace: true });
    }
  }, [navigate]);

  const updateProfile = async (data: Partial<User>) => {
    setIsLoading(true);
    try {
      const res = await apiClient.put<User>("/auth/update-profile", data, {
        withCredentials: true,
      });
      setUser(res.data);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(
          "Update profile failed:",
          error.response?.data || error.message
        );
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      signup,
      updateProfile,
    }),
    [user, isLoading, signup, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
