import { Outlet } from "react-router";
import { AuthProvider } from "../contexts/auth-contexts";
import { Toaster } from "react-hot-toast";
import { ChatProvider } from "../contexts/chat-contexts";
function App() {
  return (
    <div>
      <AuthProvider>
        <ChatProvider>
          <Toaster />
          <Outlet />
        </ChatProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
