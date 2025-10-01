import { X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useAuth } from "../../../contexts/auth-contexts";
import { useChat } from "../../../contexts/chat-contexts";

function ChatHeader() {
  const { selectedUser, setSelectedUser } = useChat();
  const { onlineUsers } = useAuth();

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={selectedUser?.profilePic}
                alt={selectedUser?.fullName}
              />
            </div>
          </div>
          {/* User Info */}
          <div>
            <h3 className="font-medium">{selectedUser?.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {/* {onlineUsers.includes(selectedUser?._id) ? "Onlline" : "Offlne"} */}
              Hello
            </p>
          </div>
        </div>
        {/* Close Button */}
        <Button onClick={() => setSelectedUser(null)}>
          <X />
        </Button>
      </div>
    </div>
  );
}

export default ChatHeader;
