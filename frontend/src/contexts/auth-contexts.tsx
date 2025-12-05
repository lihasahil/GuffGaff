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
  useRef,
} from "react";
import { apiClient } from "../lib/api-client";
import type { User } from "../types/auth-types";
import { ROUTES } from "../configs/routes";
import { useNavigate } from "react-router";
import { type Socket } from "socket.io-client";
import { createSocket } from "../lib/socket";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  onlineUsers: string[];
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<User>;
  socket: Socket | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const navigate = useNavigate();
  const socketRef = useRef<Socket | null>(null);

  // Fetch current user
  const fetchUser = useCallback(async () => {
    try {
      const response = await apiClient.get<User>("/auth/check", {
        withCredentials: true,
      });
      setUser(response.data);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial user fetch on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Manage socket connection based on user auth state
  useEffect(() => {
    if (user && !socketRef.current) {
      console.log("🔌 Creating socket for user:", user._id);

      const socket = createSocket();

      // IMPORTANT: Set auth BEFORE connecting
      socket.auth = { userId: user._id };

      // Connection event handlers
      socket.on("connect", () => {
        console.log("✅ Socket connected successfully:", socket.id);
      });

      socket.on("disconnect", (reason) => {
        console.log("❌ Socket disconnected:", reason);
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socket.on("connect_error", (error: any) => {
        console.error("❌ Socket connection error:", error);
      });

      socket.on("getOnlineUsers", (users: string[]) => {
        console.log("👥 Online users count:", users.length);
        setOnlineUsers(users);
      });

      // NOW connect after setting auth
      socket.connect();
      socketRef.current = socket;
    }

    // Disconnect when user logs out
    if (!user && socketRef.current) {
      console.log("🔌 Disconnecting socket");
      socketRef.current.disconnect();
      socketRef.current = null;
      setOnlineUsers([]);
    }
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
        await fetchUser();
      } catch (err) {
        if (err instanceof AxiosError) {
          console.error("Signup failed:", err.response?.data || err.message);
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchUser]
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

  // Update Profile
  const updateProfile = useCallback(async (data: Partial<User>) => {
    setIsLoading(true);
    try {
      const res = await apiClient.put<User>("/auth/update-profile", data, {
        withCredentials: true,
      });
      setUser(res.data);
      return res.data;
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
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      onlineUsers,
      login,
      logout,
      signup,
      updateProfile,
      socket: socketRef.current,
    }),
    [user, isLoading, onlineUsers, login, logout, signup, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to consume AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
