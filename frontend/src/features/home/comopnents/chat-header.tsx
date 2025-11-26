import { X, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { useAuth } from "../../../contexts/auth-contexts";
import { useChat } from "../../../contexts/chat-contexts";
import { useState } from "react";

function ChatHeader() {
  const { selectedUser, setSelectedUser, deleteConversation } = useChat();
  const { onlineUsers } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!selectedUser) return null;

  const isOnline = onlineUsers.includes(selectedUser._id);

  const handleDeleteConversation = async () => {
    try {
      setIsDeleting(true);
      await deleteConversation(selectedUser._id);
      setIsDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to delete conversation", error);
    } finally {
      setIsDeleting(false);
    }
  };

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
              <span className="absolute bottom-0 right-0 size-3 bg-primary-green rounded-full" />
            )}
          </div>

          {/* User Info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p
              className={`text-sm ${
                isOnline ? "text-primary-green" : "text-zinc-400"
              }`}
            >
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Right side: action buttons */}
        <div className="flex items-center gap-2">
          {/* Delete Conversation Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsDialogOpen(true)}
            disabled={isDeleting}
            title="Clear conversation"
            className="hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="size-5" />
          </Button>

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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this conversation with{" "}
              <span className="font-semibold">{selectedUser.fullName}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConversation}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ChatHeader;