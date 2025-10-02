import { useEffect } from "react";
import { useChat } from "../../../contexts/chat-contexts";
import { Users } from "lucide-react";
import { Button } from "../../../components/ui/button";

function Sidebar() {
  const { fetchUsers, users, selectedUser, setSelectedUser } = useChat();

  const onlineUsers: string[] = [];

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
      </div>
      <div className="overflow-y-auto w-full p-3">
        {users.map((user) => (
          <Button
            variant="outline"
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`w-full px-3 flex items-center gap-3 mb-2 py-6 hover:bg-base-300 transition-colors ${
              selectedUser?._id === user._id ? " ring-1 ring-green-500" : ""
            }`}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.fullName}
                className="size-12 object-contain sm:object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900"></span>
              )}
            </div>

            {/* User info -only visible in large screens */}
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.fullName}</div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;
