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
import { io, type Socket } from "socket.io-client";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  onlineUsers: string[];
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  socket: Socket | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

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
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Manage socket connection based on user auth state
  useEffect(() => {
    if (user && !socketRef.current) {
      const socket = io(SOCKET_URL, {
        withCredentials: true,
        autoConnect: false,
        auth: { userId: user._id },
      });

      socket.connect();

      socket.on("connect", () => {
        console.log("🔌 Socket connected:", socket.id);
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      socket.on("getOnlineUsers", (users: string[]) => {
        console.log(" Online users:", users);
        setOnlineUsers(users);
      });

      socketRef.current = socket;
    }

    // Disconnect when user logs out
    if (!user && socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setOnlineUsers([]);
    }

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.off("connect");
        socketRef.current.off("disconnect");
        socketRef.current.off("getOnlineUsers");
      }
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

  // Login → fetch user (socket connects via effect)
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

  // Logout - disconnect socket automatically via effect
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
      onlineUsers,
      login,
      logout,
      signup,
      updateProfile,
      socket: socketRef.current,
    }),
    [user, isLoading, onlineUsers, signup, login, logout]
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
