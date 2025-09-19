import { Outlet } from "react-router";
import { AuthProvider } from "../contexts/auth-contexts";
import { Toaster } from "react-hot-toast";
function App() {
  return (
    <div>
      <AuthProvider>
        <Toaster />
        <Outlet />
      </AuthProvider>
    </div>
  );
}

export default App;
