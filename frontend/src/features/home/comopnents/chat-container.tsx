import { useEffect, useRef } from "react";
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length > 0 ? (
          messages.map((msg) => {
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
          })
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
