import { useAuth } from "../../contexts/auth-contexts";

function ProfilePage() {
  const { user, updateProfile } = useAuth();
  return <div>Profile</div>;
}

export default ProfilePage;
