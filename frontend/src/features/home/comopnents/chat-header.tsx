import { X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useAuth } from "../../../contexts/auth-contexts";
import { useChat } from "../../../contexts/chat-contexts";

function ChatHeader() {
  const { selectedUser, setSelectedUser } = useChat();
  const { onlineUsers } = useAuth();

  if (!selectedUser) return null;

  const isOnline = onlineUsers.includes(selectedUser._id); // 👈 check online status

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        {/* Left side: avatar + info */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              alt={selectedUser.fullName}
              className="size-10 rounded-full object-cover"
            />
            {isOnline && (
              <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full" />
            )}
          </div>

          {/* User Info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p
              className={`text-sm ${
                isOnline ? "text-green-500" : "text-zinc-400"
              }`}
            >
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Close Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSelectedUser(null)}
        >
          <X className="size-5" />
        </Button>
      </div>
    </div>
  );
}

export default ChatHeader;
