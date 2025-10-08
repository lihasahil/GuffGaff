/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, Fragment } from "react";
import { useChat } from "../../../contexts/chat-contexts";
import ChatHeader from "./chat-header";
import MessageInput from "./message-input";
import MessageSkeleton from "./skeletons/message-skeleton";
import { useAuth } from "../../../contexts/auth-contexts";

const ChatContainer = () => {
  const { user: currentUser } = useAuth(); // logged-in user
  const { messages, isLoading, fetchMessages, selectedUser } = useChat();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Fetch messages whenever a user is selected
  useEffect(() => {
    if (selectedUser?._id) {
      fetchMessages(selectedUser._id);
    }
  }, [selectedUser?._id, fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Helper to format date groups
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: date.getFullYear() === today.getFullYear() ? undefined : "numeric",
    });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups: any, msg) => {
    const dateKey = new Date(msg.createdAt).toDateString();
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(msg);
    return groups;
  }, {});

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      {/* Messages Section */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length > 0 ? (
          Object.keys(groupedMessages).map((dateKey) => (
            <Fragment key={dateKey}>
              {/* 🔹 Date divider */}
              <div className="flex justify-center">
                <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                  {formatDate(dateKey)}
                </span>
              </div>

              {/* Messages for this date */}
              <div className="space-y-4">
                {groupedMessages[dateKey].map((msg: any) => {
                  const isSender = msg.senderId === currentUser?._id;
                  return (
                    <div
                      key={msg._id}
                      className={`flex items-start gap-3 ${
                        isSender ? "justify-end" : "justify-start"
                      }`}
                    >
                      {/* Receiver avatar */}
                      {!isSender && (
                        <img
                          src={selectedUser?.profilePic || "/avatar.png"}
                          alt={selectedUser?.fullName || "User"}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}

                      <div className="flex flex-col max-w-xs">
                        {/* Text bubble */}
                        {msg.text && (
                          <div
                            className={`px-3 py-2 rounded-lg text-sm ${
                              isSender
                                ? "bg-emerald-500 text-white self-end"
                                : "bg-zinc-200 text-zinc-800"
                            }`}
                          >
                            {msg.text}
                          </div>
                        )}

                        {/* Image bubble */}
                        {msg.image && (
                          <img
                            src={msg.image}
                            alt="sent"
                            className={`mt-2 w-48 rounded-lg border ${
                              isSender ? "self-end" : "self-start"
                            }`}
                          />
                        )}

                        {/* 🎙️ Voice message bubble */}
                        {/* Voice message bubble */}
                        {msg.voice && (
                          <div
                            className={`mt-2 flex items-center gap-3 px-3 py-2 rounded-lg ${
                              isSender
                                ? "bg-emerald-500 text-white self-end"
                                : "bg-zinc-200 text-zinc-800"
                            }`}
                          >
                            <audio
                              controls
                              src={msg.voice}
                              className="w-40 h-8 accent-emerald-600 dark:accent-emerald-400"
                              onLoadedMetadata={(e) => {
                                const audio = e.currentTarget;
                                audio.setAttribute(
                                  "data-duration",
                                  audio.duration.toFixed(0)
                                );
                              }}
                            />
                          </div>
                        )}

                        {/* Timestamp */}
                        <span className="mt-1 text-[10px] text-zinc-400 self-end">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Sender avatar */}
                      {isSender && currentUser?.profilePic && (
                        <img
                          src={currentUser.profilePic}
                          alt={currentUser.fullName || "You"}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </Fragment>
          ))
        ) : (
          <p className="text-center text-sm text-zinc-500">
            No messages yet. Start the conversation!
          </p>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
