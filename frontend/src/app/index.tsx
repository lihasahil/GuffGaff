import { Outlet } from "react-router";
import { AuthProvider } from "../contexts/auth-contexts";

function App() {
  return (
    <div>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </div>
  );
}

export default App;
