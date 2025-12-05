import { io, type Socket } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

console.log("🔌 Initializing socket with URL:", BACKEND_URL);

export const createSocket = (): Socket => {
  const socket = io(BACKEND_URL, {
    withCredentials: true,
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ["websocket", "polling"],
    secure: true,
    path: "/socket.io/",
  });

  socket.on("connect", () => {
    console.log(" Socket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  socket.on("connect_error", (error: any) => {
    console.error("❌ Connection error:", error);
  });

  return socket;
};
