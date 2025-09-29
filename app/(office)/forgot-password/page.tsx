"use client";

import { useState } from "react";
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
  Building2,
  Mail,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Send,
  GraduationCap,
  Users,
  BookOpen,
  Shield,
  Clock,
  KeyRound,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
  });

  const email = watch("email");

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // For demo purposes, always succeed
      setSubmitStatus("success");
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage("Failed to send reset email. Please try again.");
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
            className="flex items-center space-x-3"
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
          {/* Left Side - Campus Hero */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Campus Illustration Placeholder */}
              <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-3xl p-12 shadow-2xl border border-white/50 backdrop-blur-sm">
                <div className="text-center space-y-8">
                  <div className="flex justify-center space-x-6">
                    <div className="h-20 w-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <KeyRound className="h-10 w-10 text-white" />
                    </div>
                    <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Shield className="h-10 w-10 text-white" />
                    </div>
                    <div className="h-20 w-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Mail className="h-10 w-10 text-white" />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                      Secure Password
                      <span className="text-orange-600 block">
                        Recovery System
                      </span>
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      Don't worry! Password recovery is quick and secure. We'll
                      send you a reset link to get you back into your account
                      safely.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-white/60 rounded-xl backdrop-blur-sm">
                      <div className="flex items-center justify-center mb-2">
                        <Shield className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="text-sm font-medium text-slate-700">
                        Secure
                      </div>
                      <div className="text-xs text-slate-500">Encrypted</div>
                    </div>
                    <div className="p-4 bg-white/60 rounded-xl backdrop-blur-sm">
                      <div className="flex items-center justify-center mb-2">
                        <Clock className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div className="text-sm font-medium text-slate-700">
                        Fast
                      </div>
                      <div className="text-xs text-slate-500">Instant</div>
                    </div>
                    <div className="p-4 bg-white/60 rounded-xl backdrop-blur-sm">
                      <div className="flex items-center justify-center mb-2"></div>
                      <div className="text-sm font-medium text-slate-700">
                        Email
                      </div>
                      <div className="text-xs text-slate-500">Verified</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Forgot Password Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-md mx-auto"
          >
            {submitStatus === "success" ? (
              /* Success State */
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </motion.div>
                  <CardTitle className="text-2xl font-semibold text-slate-900">
                    Check Your Email
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    We've sent a password reset link to your email address
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Email sent successfully!
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          Please check your inbox and click the reset link.
                          Don't forget to check your spam folder.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center space-y-4">
                    <p className="text-sm text-slate-600">
                      Didn't receive the email?
                    </p>
                    <Button
                      onClick={() => setSubmitStatus("idle")}
                      variant="outline"
                      className="w-full"
                    >
                      Try Again
                    </Button>
                  </div>

                  <div className="text-center">
                    <Button
                      variant="ghost"
                      onClick={() => router.push("/login")}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Login
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Form State */
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <KeyRound className="h-8 w-8 text-orange-600" />
                  </motion.div>
                  <CardTitle className="text-2xl font-semibold text-slate-900">
                    Reset Your Password
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Enter your email address and we'll send you a link to reset
                    your password
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Email Field */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="space-y-2"
                    >
                      <label
                        htmlFor="email"
                        className="text-sm font-medium text-gray-700"
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          {...register("email")}
                          id="email"
                          type="email"
                          placeholder="staff.id@university.edu"
                          className={cn(
                            "pl-10 h-12 transition-all duration-200",
                            email &&
                              !errors.email &&
                              "border-green-500 bg-green-50/50",
                            errors.email && "border-red-500 bg-red-50/50"
                          )}
                        />
                      </div>
                      <AnimatePresence>
                        {errors.email && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-red-500 text-sm"
                          >
                            {errors.email.message}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Error Message */}
                    <AnimatePresence>
                      {submitStatus === "error" && (
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

                    {/* Submit Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
                      <Button
                        type="submit"
                        disabled={!isValid || isLoading}
                        className={cn(
                          "w-full h-12 text-base font-medium transition-all duration-200",
                          "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700",
                          "disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        )}
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <LoadingSpinner size="sm" variant="spin" />
                            <span>Sending Reset Link...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Send className="h-5 w-5" />
                            <span>Send Reset Link</span>
                          </div>
                        )}
                      </Button>
                    </motion.div>

                    {/* Back to Login */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className="text-center"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.push("/login")}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Login
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="text-center mt-8 text-sm text-gray-500"
            >
              <p>University Attendance System</p>
              <p>© 2024 All rights reserved</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
