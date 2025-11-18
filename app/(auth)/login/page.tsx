"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { saveSession, getRedirectPath, clearRedirectPath } from "@/lib/auth/session";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Building2,
  Eye,
  EyeOff,
  User,
  Lock,
  AlertCircle,
  CheckCircle,
  GraduationCap,
  Users,
  BookOpen,
  Home,
  IdCard,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";

// Role types
type Role = "office" | "teacher" | "student";

// Dynamic validation schema based on role
const createLoginSchema = (role: Role) => {
  const baseSchema = {
    username: z
      .string()
      .min(3, "Please enter a valid username (minimum 3 characters)"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  };

  if (role === "student") {
    return z.object({
      ...baseSchema,
      studentId: z
        .string()
        .min(4, "Student ID must be at least 4 digits")
        .max(12, "Student ID must be at most 12 digits")
        .regex(/^\d+$/, "Student ID must contain only numbers"),
    });
  }

  return z.object(baseSchema);
};

type LoginFormData = {
  username: string;
  password: string;
  studentId?: string;
};

// Role configuration
const roleConfig = {
  office: {
    title: "Office Portal",
    description: "Administrative access for university staff and management",
    color: "purple",
    gradient: "from-purple-500 to-purple-600",
    showForgotPassword: true,
    icon: Building2,
  },
  teacher: {
    title: "Teacher Portal",
    description: "Access for faculty members to manage classes and attendance",
    color: "orange",
    gradient: "from-orange-500 to-orange-600",
    showForgotPassword: false,
    icon: Users,
  },
  student: {
    title: "Student Portal",
    description:
      "Student access to view attendance records and academic progress",
    color: "emerald",
    gradient: "from-emerald-500 to-emerald-600",
    showForgotPassword: false,
    icon: BookOpen,
  },
};

export default function OfficeLoginPage() {
  const [selectedRole, setSelectedRole] = useState<Role>("office");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(createLoginSchema(selectedRole)),
    mode: "onChange",
  });

  const username = watch("username");
  const password = watch("password");
  const studentId = watch("studentId");

  // Handle role change
  const handleRoleChange = (role: Role) => {
    setSelectedRole(role);
    reset(); // Clear form when role changes (this also clears errors)
    setLoginStatus("idle");
  };

  const currentConfig = roleConfig[selectedRole];

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setLoginStatus("idle");
    setErrorMessage("");

    try {
      // Determine the API endpoint based on selected role
      const apiEndpoints = {
        office: "/api/auth/login/office",
        teacher: "/api/auth/login/teacher",
        student: "/api/auth/login/student",
      };

      const endpoint = apiEndpoints[selectedRole];

      // Prepare request body based on role
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const requestBody: any = {
        username: data.username,
        password: data.password,
      };

      // Add studentId for student login
      if (selectedRole === "student" && data.studentId) {
        requestBody.studentId = data.studentId;
      }

      // Make API call
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setLoginStatus("error");
        setErrorMessage(result.message || "Login failed. Please try again.");
        return;
      }

      // Success
      setLoginStatus("success");

      // Save user session with role information
      if (result.data) {
        const roleMap = {
          office: 'OFFICE',
          teacher: 'TEACHER',
          student: 'STUDENT',
        } as const;

        saveSession({
          id: result.data.id,
          username: result.data.username,
          email: result.data.email,
          firstName: result.data.firstName,
          lastName: result.data.lastName,
          role: roleMap[selectedRole],
        });
      }

      // Redirect after success animation
      setTimeout(() => {
        // Get saved redirect path or default based on role
        const redirectPath = getRedirectPath();
        clearRedirectPath();
        
        const defaultPaths = {
          office: "/dashboard",
          teacher: "/teacher/dashboard",
          student: "/student/dashboard",
        };
        
        router.push(redirectPath !== '/dashboard' ? redirectPath : defaultPaths[selectedRole]);
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);
      setLoginStatus("error");
      setErrorMessage(
        "Unable to connect to the server. Please check your internet connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20 relative overflow-hidden">
      {/* Campus Hero Background */}
      <div className="absolute inset-0">
        {/* Subtle campus illustration background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-emerald-600/5"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-100/10 to-emerald-100/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden md:flex items-center space-x-3"
          >
            <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900">
                University
              </span>
              <span className="text-xl font-bold text-blue-600 ml-1">
                AttendanceHub
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="text-slate-600 hover:text-blue-600"
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Role Selection */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Role Selection Card */}
              <div className="bg-gradient-to-br from-blue-100 to-emerald-100 rounded-3xl p-12 shadow-2xl border border-white/50 backdrop-blur-sm">
                <div className="text-center space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                      Choose Your Role
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      Select your access level to continue to the system
                    </p>
                  </div>

                  {/* Role Icons */}
                  <div className="flex justify-center space-x-6">
                    {(Object.keys(roleConfig) as Role[]).map((role) => {
                      const config = roleConfig[role];
                      const IconComponent = config.icon;
                      const isActive = selectedRole === role;

                      return (
                        <motion.div
                          key={role}
                          className="flex flex-col items-center"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <button
                            onClick={() => handleRoleChange(role)}
                            className="relative group focus:outline-none focus:ring-4 focus:ring-blue-500/20 rounded-2xl"
                          >
                            {/* Icon Background - Only behind the icon */}
                            <div
                              className={`
                              h-20 w-20 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 relative
                              ${
                                isActive
                                  ? `bg-gradient-to-br ${config.gradient} scale-110 shadow-xl`
                                  : "bg-white/80 hover:bg-white group-hover:scale-105"
                              }
                            `}
                            >
                              <IconComponent
                                className={`
                                h-10 w-10 transition-colors duration-300 z-10
                                ${
                                  isActive
                                    ? "text-white"
                                    : `text-${config.color}-600`
                                }
                              `}
                              />

                              {/* Active Indicator */}
                              {isActive && (
                                <motion.div
                                  className={`absolute -top-1 -right-1 w-6 h-6 bg-${config.color}-500 rounded-full flex items-center justify-center z-20`}
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 30,
                                  }}
                                >
                                  <CheckCircle className="w-4 h-4 text-white" />
                                </motion.div>
                              )}
                            </div>
                            
                            {/* Light Blue Layer - Only on mobile/tablet, under icon only */}
                            {isActive && (
                              <div className="absolute inset-0 bg-blue-100/50 rounded-2xl -z-10 md:hidden sm:hidden"></div>
                            )}
                          </button>

                          {/* Role Label - Outside the button, no background */}
                          <div className="mt-3">
                            <h3
                              className={`
                              font-semibold text-lg capitalize transition-colors duration-300
                              ${
                                isActive
                                  ? `text-${config.color}-900`
                                  : "text-slate-700"
                              }
                            `}
                            >
                              {role}
                            </h3>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Role Description */}
                  <motion.div
                    key={selectedRole}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white/60 rounded-xl p-4 backdrop-blur-sm"
                  >
                    <p className="text-slate-700 leading-relaxed">
                      {currentConfig.description}
                    </p>
                  </motion.div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-white/60 rounded-xl backdrop-blur-sm">
                      <div className="text-2xl font-bold text-blue-600">
                        1,247
                      </div>
                      <div className="text-sm text-slate-600">Students</div>
                    </div>
                    <div className="p-4 bg-white/60 rounded-xl backdrop-blur-sm">
                      <div className="text-2xl font-bold text-emerald-600">
                        45
                      </div>
                      <div className="text-sm text-slate-600">Classes</div>
                    </div>
                    <div className="p-4 bg-white/60 rounded-xl backdrop-blur-sm">
                      <div className="text-2xl font-bold text-purple-600">
                        94.2%
                      </div>
                      <div className="text-sm text-slate-600">Attendance</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-md mx-auto"
          >
            {/* Mobile Role Selection */}
            <div className="lg:hidden mb-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Choose Your Role
                </h2>
                <p className="text-slate-600">Select your access level</p>
              </div>

              <div className="flex justify-center space-x-4">
                {(Object.keys(roleConfig) as Role[]).map((role) => {
                  const config = roleConfig[role];
                  const IconComponent = config.icon;
                  const isActive = selectedRole === role;

                  return (
                    <motion.button
                      key={role}
                      onClick={() => handleRoleChange(role)}
                      className="relative group focus:outline-none focus:ring-4 focus:ring-blue-500/20 rounded-xl"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div
                        className={`
                        h-16 w-16 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300
                        ${
                          isActive
                            ? `bg-gradient-to-br ${config.gradient} scale-110 shadow-xl`
                            : "bg-white/80 hover:bg-white group-hover:scale-105"
                        }
                      `}
                      >
                        <IconComponent
                          className={`
                          h-8 w-8 transition-colors duration-300
                          ${
                            isActive ? "text-white" : `text-${config.color}-600`
                          }
                        `}
                        />
                      </div>

                      <div className="mt-2">
                        <h3
                          className={`
                          font-medium text-sm capitalize transition-colors duration-300
                          ${
                            isActive
                              ? `text-${config.color}-900`
                              : "text-slate-700"
                          }
                        `}
                        >
                          {role}
                        </h3>
                      </div>

                      {isActive && (
                        <motion.div
                          className={`absolute -top-1 -right-1 w-5 h-5 bg-${config.color}-500 rounded-full flex items-center justify-center`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        >
                          <CheckCircle className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Mobile Role Description */}
              <motion.div
                key={selectedRole}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 bg-white/60 rounded-xl p-3 backdrop-blur-sm text-center"
              >
                <p className="text-sm text-slate-700">
                  {currentConfig.description}
                </p>
              </motion.div>
            </div>
            {/* Login Card */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="space-y-1 pb-6">
                <motion.div
                  key={selectedRole}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardTitle className="text-2xl font-semibold text-center">
                    {currentConfig.title}
                  </CardTitle>
                  <CardDescription className="text-center">
                    Enter your credentials to continue
                  </CardDescription>
                </motion.div>
              </CardHeader>

              <CardContent>
                <AnimatePresence mode="wait">
                  <motion.form
                    key={selectedRole}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    {/* Username Field */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      className="space-y-2"
                    >
                      <label
                        htmlFor="username"
                        className="text-sm font-medium text-gray-700"
                      >
                        Username
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          {...register("username")}
                          id="username"
                          name="username"
                          type="text"
                          autoComplete="username"
                          placeholder="Enter your username"
                          className={cn(
                            "pl-10 h-12 transition-all duration-200",
                            username &&
                              !errors.username &&
                              "border-green-500 bg-green-50/50",
                            errors.username && "border-red-500 bg-red-50/50"
                          )}
                        />
                        {username && !errors.username && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </motion.div>
                        )}
                      </div>
                      <AnimatePresence>
                        {errors.username && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-sm text-red-600 flex items-center gap-1"
                          >
                            <AlertCircle className="h-4 w-4" />
                            {errors.username.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Student ID Field (Student Role Only) */}
                    {selectedRole === "student" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-2"
                      >
                        <label
                          htmlFor="studentId"
                          className="text-sm font-medium text-gray-700"
                        >
                          Student ID
                        </label>
                        <div className="relative">
                          <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            {...register("studentId")}
                            id="studentId"
                            name="studentId"
                            autoComplete="off"
                            type="text"
                            placeholder="Enter your student ID"
                            className={cn(
                              "pl-10 h-12 transition-all duration-200",
                              studentId &&
                                !errors.studentId &&
                                "border-green-500 bg-green-50/50",
                              errors.studentId && "border-red-500 bg-red-50/50"
                            )}
                          />
                          {studentId && !errors.studentId && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            </motion.div>
                          )}
                        </div>
                        <AnimatePresence>
                          {errors.studentId && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="text-sm text-red-600 flex items-center gap-1"
                            >
                              <AlertCircle className="h-4 w-4" />
                              {errors.studentId.message}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}

                    {/* Password Field */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                      className="space-y-2"
                    >
                      <label
                        htmlFor="password"
                        className="text-sm font-medium text-gray-700"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          {...register("password")}
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="Enter your password"
                          className={cn(
                            "pl-10 pr-12 h-12 transition-all duration-200",
                            password &&
                              !errors.password &&
                              "border-green-500 bg-green-50/50",
                            errors.password && "border-red-500 bg-red-50/50"
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      <AnimatePresence>
                        {errors.password && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-sm text-red-600 flex items-center gap-1"
                          >
                            <AlertCircle className="h-4 w-4" />
                            {errors.password.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Remember Me and Forgot Password */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.3 }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="remember"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="remember"
                          className="text-sm text-gray-700"
                        >
                          Remember me
                        </label>
                      </div>
                      {currentConfig.showForgotPassword && (
                        <button
                          type="button"
                          onClick={() => router.push("/forgot-password")}
                          className="text-sm text-blue-600 hover:text-blue-800 transition-colors hover:underline"
                        >
                          Forgot password?
                        </button>
                      )}
                    </motion.div>

                    {/* Error Message */}
                    <AnimatePresence>
                      {loginStatus === "error" && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2"
                        >
                          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                          <p className="text-sm text-red-700">{errorMessage}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Success Message */}
                    <AnimatePresence>
                      {loginStatus === "success" && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2"
                        >
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <p className="text-sm text-green-700">
                            Login successful! Redirecting...
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                      className="space-y-4"
                    >
                      <Button
                        type="submit"
                        disabled={
                          !isValid || isLoading || loginStatus === "success"
                        }
                        className={cn(
                          "w-full h-12 text-base font-medium transition-all duration-200",
                          `bg-gradient-to-r ${currentConfig.gradient} hover:shadow-lg`,
                          "disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl",
                          loginStatus === "success" &&
                            "bg-green-600 hover:bg-green-600"
                        )}
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <LoadingSpinner size="sm" variant="spin" />
                            <span>Signing In...</span>
                          </div>
                        ) : loginStatus === "success" ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            <span>Success!</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            <span>Sign In to {currentConfig.title}</span>
                          </div>
                        )}
                      </Button>

                      {/* Divider */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">
                            Or continue with
                          </span>
                        </div>
                      </div>

                      {/* SSO Button */}
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 text-base font-medium border-2 hover:bg-gray-50 transition-all duration-200"
                        onClick={() => {
                          console.log(
                            `SSO login initiated for ${selectedRole}`
                          );
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-5 w-5 bg-gradient-to-r ${currentConfig.gradient} rounded-sm flex items-center justify-center`}
                          >
                            <span className="text-white text-xs font-bold">
                              U
                            </span>
                          </div>
                          <span>University SSO</span>
                        </div>
                      </Button>
                    </motion.div>
                  </motion.form>
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="text-center mt-8 text-sm text-gray-500"
            >
              <p>University Attendance System</p>
              <p> 2025 All rights reserved</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
