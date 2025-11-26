import { Camera, Mail, MoveLeft, User } from "lucide-react";
import { useAuth } from "../../contexts/auth-contexts";
import { Input } from "../../components/ui/input";
import { useState } from "react";
import profileSVG from "../../assets/profile.svg";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router";

function ProfilePage() {
  const { user, updateProfile, isLoading } = useAuth();
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result as string;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };
  const navigate = useNavigate();

  return (
    <div className="min-h-screen mt-10 grid lg:grid-cols-2">
      <div className="max-w-3xl p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-4">
          <div className="flex items-center lg:gap-50 flex-col sm:flex-row">
            <Button
              className="bg-primary-green hover:bg-primary-green/80 cursor-pointer"
              onClick={() => navigate(-1)}
            >
              <MoveLeft />
              Back
            </Button>
          </div>

          {/* avatar upload section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || user?.profilePic}
                alt={user?.fullName}
                className="size-32 rounded-full object-cover border-4"
              />
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 right-0 bg-base-content hover:scale-105 p-2 rounded-full cursor-pointer transition-all duration-200 ${
                  isLoading ? "animate-pulse pointer-events-none" : ""
                }`}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <Input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isLoading}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isLoading
                ? "Uploading..."
                : "Click the camera icon to update your photo"}
            </p>
          </div>
          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                {user?.fullName}
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="mt-2 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{user?.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-primary-green">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-muted hidden items-center justify-center p-8 lg:flex lg:w-full">
        <div className="text-foreground/80 max-w-2xl text-center">
          <img
            src={profileSVG}
            alt=""
            className="mx-auto mb-6 transition h-70 duration-700 hover:scale-105"
          />
          <h2 className="text-4xl font-semibold">Profile Details</h2>
          <p className="text-foreground/60 mt-4">
            Manage your personal info and update your profile photo from this
            page
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
