/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { User } from "../types/auth-types";
import type { Message } from "../types/message-types";
import { apiClient } from "../lib/api-client";
import { useAuth } from "./auth-contexts";

interface ChatContextType {
  users: User[];
  messages: Message[];
  fetchUsers: () => Promise<void>;
  fetchMessages: (userId: string) => Promise<void>;
  sendMessage: (
    userId: string,
    text?: string,
    image?: string | null,
    voice?: string | null
  ) => Promise<void>;
  deleteConversation: (userId: string) => Promise<void>;
  selectedUser: User | null;
  setSelectedUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { socket, user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get<User[]>("/messages/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch all messages for a selected user
  const fetchMessages = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      const res = await apiClient.get<Message[]>(`/messages/${userId}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send message (text, image, voice)
  const sendMessage = useCallback(
    async (
      userId: string,
      text?: string,
      image?: string | null,
      voice?: string | null
    ) => {
      try {
        const payload: Record<string, unknown> = {};
        if (text) payload.text = text;
        if (image) payload.image = image;
        if (voice) payload.voice = voice;

        console.log("📤 Sending message to:", userId);
        const res = await apiClient.post<Message>(
          `/messages/send/${userId}`,
          payload
        );

        console.log("✅ Message sent:", res.data);

        // Update local state immediately
        setMessages((prev) => [...prev, res.data]);

        // Emit via socket
        if (socket?.connected) {
          console.log("📡 Emitting via socket");
          socket.emit("sendMessage", res.data);
        } else {
          console.warn("⚠️ Socket not connected");
        }
      } catch (err) {
        console.error("Failed to send message:", err);
      }
    },
    [socket]
  );

  // Delete conversation
  const deleteConversation = useCallback(
    async (userId: string) => {
      try {
        await apiClient.delete(`/messages/conversation/${userId}`);
        setMessages([]);
        if (socket?.connected) {
          socket.emit("conversationDeleted", { userId });
        }
      } catch (err) {
        console.error("Failed to delete conversation:", err);
      }
    },
    [socket]
  );

  // Listen for real-time incoming messages
  useEffect(() => {
    if (!socket) {
      console.warn("⚠️ Socket not available");
      return;
    }

    if (!socket.connected) {
      console.warn("⚠️ Socket not connected");
      return;
    }

    if (!selectedUser) {
      console.warn("⚠️ No user selected");
      return;
    }

    console.log(
      "📡 Listening for messages from:",
      selectedUser._id,
      "Current user:",
      user?._id
    );

    const handleReceiveMessage = (message: Message) => {
      console.log("📨 New message received:", message);

      // Check if message is relevant to current chat
      const isRelevant =
        (message.senderId === selectedUser._id &&
          message.receiverId === user?._id) ||
        (message.senderId === user?._id &&
          message.receiverId === selectedUser._id);

      if (isRelevant) {
        setMessages((prev) => [...prev, message]);
      } else {
        console.log("⚠️ Message not relevant to current chat, ignoring...");
      }
    };

    socket.on("newMessage", handleReceiveMessage);

    return () => {
      socket.off("newMessage", handleReceiveMessage);
    };
  }, [socket, selectedUser, user]);

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <ChatContext.Provider
      value={{
        users,
        messages,
        fetchUsers,
        fetchMessages,
        sendMessage,
        deleteConversation,
        selectedUser,
        setSelectedUser,
        isLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
};
