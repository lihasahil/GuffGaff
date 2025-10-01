import { useEffect } from "react";
import { useChat } from "../../../contexts/chat-contexts";
import ChatHeader from "./chat-header";
import MessageInput from "./message-input";
import MessageSkeleton from "./skeletons/message-skeleton";

function ChatContainer() {
  const { messages, isLoading, fetchMessages, selectedUser } = useChat();

  useEffect(() => {
    if (selectedUser?._id) {
      fetchMessages(selectedUser._id);
    }
  }, [selectedUser?._id, fetchMessages]);

  if (isLoading)
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <p>Messages</p>
      <MessageInput />
    </div>
  );
}

export default ChatContainer;
