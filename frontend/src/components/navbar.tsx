import { Link } from "react-router";
import { useAuth } from "../contexts/auth-contexts";
import { LogOut, MessageSquare, User } from "lucide-react";
import { Button } from "./ui/button";

function Navbar() {
  const { logout, user } = useAuth();
  return (
    <header className="bg-base-100 border-b border-base-300 fixed p-4 w-full top-0 z-40 backdrop-blur-lg bg-base-100/80">
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center gap-8">
          <Link
            to="/home"
            className="flex items-center gap-2.5 hover:opacity-80 transition-all"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-lg font-bold">GuffGaff</h1>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <>
              <Link to={"/profile"} className="flex items-center gap-2">
                <User className="size-5" />
                <span className="hidden sm:inline hover:underline">Profile</span>
              </Link>

              <Button variant='outline' onClick={logout}>
                <LogOut className="size-5" />
                <span className="hidden sm:inline">LogOut</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
