import { Button } from "../../components/ui/button";
import { useAuth } from "../../contexts/auth-contexts";

function Home() {
  const { logout } = useAuth();
  return <Button onClick={logout}>Logout</Button>;
}

export default Home;
