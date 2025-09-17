import { useState } from "react";
import { MessageSquare, Mail, Lock, EyeOff, Eye } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { z } from "zod";
import AuthImagePattern from "../../../components/reusable-components/auth-image-pattern";
import { Link } from "react-router";
import { Button } from "../../../components/ui/button";

// Define Zod schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginFormData, string>>
  >({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      // Collect field errors
      const newErrors: Partial<Record<keyof LoginFormData, string>> = {};
      result.error.issues.forEach((err) => {
        const fieldName = err.path[0] as keyof LoginFormData;
        newErrors[fieldName] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    setErrors({});
    console.log("Login submitted:", result.data);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Welcome Back</h1>
              <p className="text-base-content/60">
                Login to continue to your account
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
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
            <div>
              <Label>
                <span className="label-text font-medium">Password</span>
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40" />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-10 py-6 pr-10"
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
            <Button type="submit" className="btn btn-primary w-full">
              Login
            </Button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              Don’t have an account?{" "}
              <Link to="/signup" className="link link-primary">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
      <AuthImagePattern
        title="Welcome Back"
        subtitle="Reconnect with your community and continue your journey"
      />
    </div>
  );
}

export default LoginForm;
