import { Outlet } from "react-router";
import { AuthProvider } from "../contexts/auth-contexts";

import { ChatProvider } from "../contexts/chat-contexts";
import { Toaster } from "sonner";
function App() {
  return (
    <div>
      <AuthProvider>
        <ChatProvider>
          <Toaster position="top-right" richColors />
          <Outlet />
        </ChatProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
