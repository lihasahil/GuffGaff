/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "../types/auth-types";
import type { Message } from "../types/message-types";
import { apiClient } from "../lib/api-client";

interface ChatContextType {
  users: User[];
  messages: Message[];
  fetchUsers: () => Promise<void>;
  fetchMessages: (userId: string) => Promise<void>;
  sendMessage: (userId: string, text?: string, image?: string) => Promise<void>;
  selectedUser: User | null;
  setSelectedUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch sidebar users
  const fetchUsers = async () => {
    try {
      const res = await apiClient.get<User[]>("/messages/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  // Fetch messages with selected user
  const fetchMessages = async (userId: string) => {
    try {
      const res = await apiClient.get<Message[]>(`/messages/${userId}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  // Send message
  const sendMessage = async (userId: string, text?: string, image?: string) => {
    try {
      const res = await apiClient.post<Message>(`/messages/send/${userId}`, {
        text,
        image,
      });
      setMessages((prev) => [...prev, res.data]); // append new message
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <ChatContext.Provider
      value={{
        users,
        messages,
        fetchUsers,
        fetchMessages,
        sendMessage,
        selectedUser,
        setSelectedUser,
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
