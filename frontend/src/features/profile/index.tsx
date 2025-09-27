import { useAuth } from "../../contexts/auth-contexts";

function ProfilePage() {
  const { user, updateProfile } = useAuth();
  return (
    <div className="flex items-center justify-center mt-10">
      <div>{user?.fullName}</div>
      <div>{user?.profilePic}</div>
      <div>{user?.email}</div>
    </div>
  );
}

export default ProfilePage;
