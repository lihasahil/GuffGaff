import { useEffect, useState } from "react";
import { useChat } from "../../../contexts/chat-contexts";

import { Users } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useAuth } from "../../../contexts/auth-contexts";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";

function Sidebar() {
  const { fetchUsers, users, selectedUser, setSelectedUser } = useChat();
  const { onlineUsers, user: currentUser } = useAuth();
  const [showOnline, setShowOnline] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = showOnline
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      {/* Header */}
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>

        <div className="mt-3 hidden lg:flex items-center gap-2">
          <Label className="cursor-pointer flex items-center gap-2">
            <Input
              type="checkbox"
              checked={showOnline}
              onChange={(e) => setShowOnline(e.target.checked)}
              className="size-4"
            />
            <span className="text-sm">Show online Only</span>
          </Label>
          <span className="text-xs text-zinc-500">
            ({onlineUsers.length - 1} online)
          </span>
        </div>
      </div>

      {/* User list */}
      <div className="overflow-y-auto w-full p-3">
        {filteredUsers.map((u) => {
          const isOnline = onlineUsers.includes(u._id);
          const isSelf = u._id === currentUser?._id;

          return (
            <Button
              variant="outline"
              key={u._id}
              onClick={() => setSelectedUser(u)}
              className={`w-full px-3 flex items-center gap-3 mb-2 py-6 hover:bg-base-300 transition-colors ${
                selectedUser?._id === u._id ? "ring ring-green-500" : ""
              }`}
            >
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={u.profilePic || "/avatar.png"}
                  alt={u.fullName}
                  className="size-12 object-contain rounded-full"
                />

                {/* Online dot */}
                {isOnline && (
                  <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full"></span>
                )}
              </div>

              {/* User info - visible only on large screens */}
              <div className="hidden lg:block text-left min-w-0">
                <div className="font-medium truncate">
                  {isSelf ? `${u.fullName} (You)` : u.fullName}
                </div>
                <div
                  className={`text-sm ${
                    isOnline ? "text-green-500" : "text-zinc-400"
                  }`}
                >
                  {isOnline ? "Online" : "Offline"}
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </aside>
  );
}

export default Sidebar;
