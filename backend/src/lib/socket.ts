import { Server, Socket } from "socket.io";
import http from "http";
import express, { Application } from "express";

const app: Application = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});

export function getReceiverSocketId(userId: string): string | undefined {
  return userSocketMap[userId];
}

// Store online users: userId -> socketId
const userSocketMap: Record<string, string> = {};

io.on("connection", (socket: Socket) => {
  // Get userId from auth
  const userId = socket.handshake.auth.userId as string | undefined;

  if (!userId) {
    console.warn("Socket connected without userId:", socket.id);
    socket.disconnect(true);
    return;
  }

  console.log("User connected:", userId, "Socket ID:", socket.id);

  userSocketMap[userId] = socket.id;

  // Emit currently online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User disconnected:", userId, "Socket ID:", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
