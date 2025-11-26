import { useState } from "react";
import { MessageSquare, User, Mail, Lock, EyeOff, Eye } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { z } from "zod";
import authSvg from "../assets/auth.svg";
import { Link } from "react-router";
import { Button } from "../../../components/ui/button";
import { useAuth } from "../../../contexts/auth-contexts";
import toast from "react-hot-toast";

// Define Zod schema
const signUpSchema = z.object({
  fullName: z.string().min(10, "Full name must be at least 10 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

function SignUpForm() {
  const { signup, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<SignUpFormData>({
    fullName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof SignUpFormData, string>>
  >({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = signUpSchema.safeParse(formData);

    if (!result.success) {
      const newErrors: Partial<Record<keyof SignUpFormData, string>> = {};
      result.error.issues.forEach((err) => {
        const fieldName = err.path[0] as keyof SignUpFormData;
        newErrors[fieldName] = err.message;
      });
      setErrors(newErrors);
      return;
    }
    setErrors({});
    try {
      await signup(
        result.data.fullName,
        result.data.email,
        result.data.password
      );
    } catch (error) {
      console.log(error);
      toast.error("Failed to Sign up");
    }
    console.log("Form submitted:", result.data);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side */}
      <div className="flex flex-col  justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Create Account</h1>
              <p className="text-base-content/60">
                Get started with a free Account
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label>
                <span className="label-text font-medium">Full Name</span>
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="size-5 text-base-content/40" />
                </div>
                <Input
                  type="text"
                  className="w-full py-6 pl-10"
                  placeholder="Enter Full Name"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </div>
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label>
                <span className="label-text font-medium">Email</span>
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-base-content/40" />
                </div>
                <Input
                  type="email"
                  className="w-full py-6 pl-10"
                  placeholder="Enter Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label>
                <span className="label-text font-medium">Password</span>
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40" />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  className="w-full py-6 pl-10 pr-10"
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <Button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 py-6 flex items-center bg-transparent hover:bg-transparent cursor-pointer text-sm text-base-content/60"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="bg-primary-green hover:bg-primary-green/80 cursor-pointer w-full"
            >
              {isLoading ? "Processing..." : "Sign Up"}
            </Button>
          </form>
          <div className="text-center">
            <p className="text-base-content/60">
              Already have an account?{" "}
              <Link to="/signin" className="link link-primary">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className="bg-muted hidden items-center justify-center p-8 lg:flex lg:w-full">
        <div className="text-foreground/80 max-w-2xl text-center">
          <img
            src={authSvg}
            alt=""
            className="mx-auto mb-6 transition duration-700 hover:scale-105"
          />
          <h2 className="text-4xl font-semibold">Welcome Back</h2>
          <p className="text-foreground/60 mt-4">
            Reconnect with your community and continue your journey
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUpForm;
