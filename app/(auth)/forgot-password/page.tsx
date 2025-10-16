/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
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
  ArrowLeft,
  Mail,
  AlertCircle,
  CheckCircle,
  Send,
  GraduationCap,
  Shield,
  Clock,
  KeyRound,
  Eye,
  EyeOff,
  Lock,
  Sparkles,
  RotateCw,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";

// Step types
type Step = "email" | "code" | "password" | "success";

// Validation schemas
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const codeSchema = z.object({
  code: z
    .string()
    .length(6, "Code must be 6 digits")
    .regex(/^\d+$/, "Code must contain only numbers"),
});

const passwordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type EmailFormData = z.infer<typeof emailSchema>;
type CodeFormData = z.infer<typeof codeSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ForgotPasswordPage() {
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(900); // 15 minutes
  const [codeError, setCodeError] = useState(false); // For red border animation
  const router = useRouter();

  // Countdown timer
  useEffect(() => {
    if (currentStep === "code" && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentStep, countdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Email form
  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    mode: "onChange",
  });

  // Code form
  const codeForm = useForm<CodeFormData>({
    resolver: zodResolver(codeSchema),
    mode: "onChange",
  });

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    mode: "onChange",
  });

  // Step 1: Request reset code
  const onSubmitEmail = async (data: EmailFormData) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/forgot-password/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrorMessage(result.message || "Failed to send reset code");
        return;
      }

      setUserEmail(data.email);
      setCountdown(900);
      setCurrentStep("code");
    } catch (error) {
      setErrorMessage("Unable to connect to server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify code
  const onSubmitCode = async (data: CodeFormData) => {
    setIsLoading(true);
    setErrorMessage("");
    setCodeError(false);

    try {
      const response = await fetch("/api/auth/forgot-password/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, code: data.code }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrorMessage(result.message || "Invalid verification code");
        // Trigger red border animation
        setCodeError(true);
        setTimeout(() => setCodeError(false), 2000); // Reset after 2 seconds
        return;
      }

      setVerificationToken(result.data.verificationToken);
      setResetCode(data.code);
      setCurrentStep("password");
    } catch (error) {
      setErrorMessage("Unable to verify code. Please try again.");
      setCodeError(true);
      setTimeout(() => setCodeError(false), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset password
  const onSubmitPassword = async (data: PasswordFormData) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/forgot-password/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          code: resetCode,
          verificationToken: verificationToken,
          newPassword: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrorMessage(result.message || "Failed to reset password");
        return;
      }

      setCurrentStep("success");
    } catch (error) {
      setErrorMessage("Unable to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend code
  const handleResendCode = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/forgot-password/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });

      const result = await response.json();

      if (result.success) {
        setCountdown(900);
        codeForm.reset();
      }
    } catch (error) {
      setErrorMessage("Failed to resend code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-emerald-600/5"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900">University</span>
              <span className="text-xl font-bold text-blue-600 ml-1">AttendanceHub</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Button
              variant="ghost"
              onClick={() => router.push("/login")}
              className="text-slate-600 hover:text-blue-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block"
          >
            <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-3xl p-12 shadow-2xl border border-white/50 backdrop-blur-sm">
              <div className="text-center space-y-8">
                <div className="flex justify-center space-x-6">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-20 w-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <KeyRound className="h-10 w-10 text-white" />
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, delay: 0.3, repeat: Infinity }}
                    className="h-20 w-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <Shield className="h-10 w-10 text-white" />
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, delay: 0.6, repeat: Infinity }}
                    className="h-20 w-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <Mail className="h-10 w-10 text-white" />
                  </motion.div>
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">
                    Secure Password
                    <span className="text-orange-600 block">Recovery System</span>
                  </h2>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    Reset your password securely with our email verification system.
                    Your account security is our top priority.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-white/60 rounded-xl backdrop-blur-sm">
                    <Shield className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-slate-700">Secure</div>
                    <div className="text-xs text-slate-500">Encrypted</div>
                  </div>
                  <div className="p-4 bg-white/60 rounded-xl backdrop-blur-sm">
                    <Clock className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-slate-700">Fast</div>
                    <div className="text-xs text-slate-500">Instant</div>
                  </div>
                  <div className="p-4 bg-white/60 rounded-xl backdrop-blur-sm">
                    <Mail className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-slate-700">Email</div>
                    <div className="text-xs text-slate-500">Verified</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Forms */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md mx-auto"
          >
            <AnimatePresence mode="wait">
              {/* Step 1: Email Input */}
              {currentStep === "email" && (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                >
                  <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center pb-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4"
                      >
                        <KeyRound className="h-8 w-8 text-orange-600" />
                      </motion.div>
                      <CardTitle className="text-2xl font-semibold">Reset Your Password</CardTitle>
                      <CardDescription>
                        Enter your email address to receive a verification code
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              {...emailForm.register("email")}
                              type="email"
                              placeholder="staff.id@university.edu"
                              className={cn(
                                "pl-10 h-12",
                                emailForm.watch("email") && !emailForm.formState.errors.email && "border-green-500 bg-green-50/50",
                                emailForm.formState.errors.email && "border-red-500 bg-red-50/50"
                              )}
                            />
                          </div>
                          {emailForm.formState.errors.email && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              {emailForm.formState.errors.email.message}
                            </p>
                          )}
                        </div>

                        {errorMessage && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            <p className="text-sm text-red-700">{errorMessage}</p>
                          </div>
                        )}

                        <Button
                          type="submit"
                          disabled={!emailForm.formState.isValid || isLoading}
                          className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                        >
                          {isLoading ? (
                            <>
                              <LoadingSpinner size="sm" variant="spin" />
                              <span className="ml-2">Sending Code...</span>
                            </>
                          ) : (
                            <>
                              <Send className="h-5 w-5 mr-2" />
                              Send Verification Code
                            </>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 2: Code Verification */}
              {currentStep === "code" && (
                <motion.div
                  key="code"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                >
                  <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center pb-6">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 relative"
                      >
                        <Shield className="h-8 w-8 text-blue-600" />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 rounded-full border-2 border-blue-400"
                        />
                      </motion.div>
                      <CardTitle className="text-2xl font-semibold">Verify Your Email</CardTitle>
                      <CardDescription>
                        Enter the 6-digit code sent to <strong>{userEmail}</strong>
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <form onSubmit={codeForm.handleSubmit(onSubmitCode)} className="space-y-6">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">Verification Code</label>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-orange-500" />
                              <span className={cn(
                                "font-mono font-semibold",
                                countdown < 60 ? "text-red-600" : "text-slate-600"
                              )}>
                                {formatTime(countdown)}
                              </span>
                            </div>
                          </div>
                          
                          {/* Individual digit inputs */}
                          <div className="flex justify-center gap-3">
                            {[0, 1, 2, 3, 4, 5].map((index) => {
                              const currentCode = codeForm.watch("code") || "";
                              const isCodeComplete = currentCode.length === 6 && !codeForm.formState.errors.code;
                              const hasValue = currentCode.length > index;
                              
                              return (
                                <input
                                  key={index}
                                  type="text"
                                  maxLength={1}
                                  className={cn(
                                    "w-12 h-16 text-center text-2xl font-bold border-2 rounded-lg",
                                    "focus:outline-none focus:ring-2 transition-all duration-200",
                                    "text-black", // Always black text
                                    // Error animation - red border when incorrect code
                                    codeError && "border-red-500 bg-red-50/50 animate-pulse",
                                    // Default state - empty box
                                    !codeError && !hasValue && !codeForm.formState.errors.code && "border-gray-300 bg-white",
                                    // Filled state - orange theme
                                    !codeError && hasValue && !isCodeComplete && !codeForm.formState.errors.code && "border-orange-500 bg-orange-50/50 focus:ring-orange-500 focus:border-orange-500",
                                    // Complete code - green theme
                                    !codeError && isCodeComplete && "border-green-500 bg-green-50/50",
                                    // Form validation error state
                                    !codeError && codeForm.formState.errors.code && "border-red-500 bg-red-50/50",
                                    // Focus states
                                    !hasValue && "focus:ring-orange-500 focus:border-orange-500"
                                  )}
                                  value={currentCode[index] || ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (!/^\d*$/.test(value)) return; // Only allow digits
                                    
                                    const newCode = currentCode.split("");
                                    newCode[index] = value;
                                    
                                    // Fill array to current index if needed
                                    while (newCode.length <= index) {
                                      newCode.push("");
                                    }
                                    
                                    const finalCode = newCode.join("").slice(0, 6);
                                    codeForm.setValue("code", finalCode);
                                    
                                    // Auto-focus next input
                                    if (value && index < 5) {
                                      const nextInput = e.target.parentElement?.children[index + 1] as HTMLInputElement;
                                      nextInput?.focus();
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    // Handle backspace to go to previous input
                                    if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
                                      const prevInput = e.currentTarget.parentElement?.children[index - 1] as HTMLInputElement;
                                      prevInput?.focus();
                                    }
                                  }}
                                  onPaste={(e) => {
                                    e.preventDefault();
                                    // Get pasted text from clipboard event (no permission needed)
                                    const pastedText = e.clipboardData.getData('text');
                                    const digits = pastedText.replace(/\D/g, "").slice(0, 6);
                                    if (digits) {
                                      codeForm.setValue("code", digits);
                                      // Focus the last filled input or the 6th one if all filled
                                      const lastIndex = Math.min(digits.length - 1, 5);
                                      const lastInput = e.currentTarget.parentElement?.children[lastIndex] as HTMLInputElement;
                                      lastInput?.focus();
                                    }
                                  }}
                                  onFocus={(e) => e.target.select()}
                                />
                              );
                            })}
                          </div>
                          
                          {/* Hidden input for form validation */}
                          <input
                            {...codeForm.register("code")}
                            type="hidden"
                          />
                          
                          {codeForm.formState.errors.code && (
                            <p className="text-sm text-red-600 flex items-center gap-1 justify-center">
                              <AlertCircle className="h-4 w-4" />
                              {codeForm.formState.errors.code.message}
                            </p>
                          )}
                        </div>

                        {errorMessage && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2"
                          >
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            <p className="text-sm text-red-700">{errorMessage}</p>
                          </motion.div>
                        )}

                        <Button
                          type="submit"
                          disabled={codeForm.watch("code")?.length !== 6 || isLoading}
                          className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700"
                        >
                          {isLoading ? (
                            <>
                              <LoadingSpinner size="sm" variant="spin" />
                              <span className="ml-2">Verifying...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-5 w-5 mr-2" />
                              Verify Code
                            </>
                          )}
                        </Button>

                        <div className="text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={handleResendCode}
                            disabled={isLoading || countdown > 0}
                            className="text-sm"
                          >
                            <RotateCw className="h-4 w-4 mr-2" />
                            Resend Code
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 3: New Password */}
              {currentStep === "password" && (
                <motion.div
                  key="password"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                >
                  <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center pb-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"
                      >
                        <Lock className="h-8 w-8 text-purple-600" />
                      </motion.div>
                      <CardTitle className="text-2xl font-semibold">Create New Password</CardTitle>
                      <CardDescription>
                        Enter a strong password for your account
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">New Password</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              {...passwordForm.register("password")}
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter new password"
                              className="pl-10 pr-12 h-12"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                              {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                            </button>
                          </div>
                          {passwordForm.formState.errors.password && (
                            <p className="text-sm text-red-600">{passwordForm.formState.errors.password.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              {...passwordForm.register("confirmPassword")}
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm new password"
                              className="pl-10 pr-12 h-12"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                              {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                            </button>
                          </div>
                          {passwordForm.formState.errors.confirmPassword && (
                            <p className="text-sm text-red-600">{passwordForm.formState.errors.confirmPassword.message}</p>
                          )}
                        </div>

                        {errorMessage && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            <p className="text-sm text-red-700">{errorMessage}</p>
                          </div>
                        )}

                        <Button
                          type="submit"
                          disabled={!passwordForm.formState.isValid || isLoading}
                          className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-700"
                        >
                          {isLoading ? (
                            <>
                              <LoadingSpinner size="sm" variant="spin" />
                              <span className="ml-2">Updating Password...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-5 w-5 mr-2" />
                              Reset Password
                            </>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 4: Success */}
              {currentStep === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center pb-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                      >
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                        >
                          <CheckCircle className="h-10 w-10 text-green-600" />
                        </motion.div>
                      </motion.div>
                      <CardTitle className="text-2xl font-semibold text-green-600">
                        Password Reset Successful!
                      </CardTitle>
                      <CardDescription>
                        Your password has been updated successfully
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <p className="text-sm text-green-800">
                          You can now login with your new password
                        </p>
                      </div>

                      <Button
                        onClick={() => router.push("/login")}
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700"
                      >
                        Go to Login
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
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
