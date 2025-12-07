"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ModernDashboardLayout, PageContainer } from "@/components/layout/modern-dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { handleLogout } from "@/lib/auth/logout";
import { AuthLoadingScreen } from "@/components/ui/auth-loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  BookOpen,
  Building,
  Shield,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  Award,
  Sparkles,
  Edit3,
  Save
} from "lucide-react";
import { toast } from "sonner";


// Extended user type for teacher data
interface ExtendedTeacher {
  id?: string;
  firstName?: string;
  lastName?: string;
  fatherName?: string;
  grandfatherName?: string;
  teacherId?: string;
  phone?: string;
  secondaryPhone?: string;
  address?: string;
  dateOfBirth?: string;
  departments?: string[];
  qualification?: string;
  experience?: string;
  specialization?: string;
  subjects?: string[];
  classes?: string[];
  status?: string;
}

export default function TeacherProfilePage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useAuth({ requiredRole: 'TEACHER' });
  
  // Teacher data state
  const [teacherData, setTeacherData] = useState<ExtendedTeacher | null>(null);
  const [isLoadingTeacher, setIsLoadingTeacher] = useState(true);
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState({
    qualification: "",
    experience: "",
    specialization: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  
  // Password change modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const userId = user?.id;

  // Fetch teacher data from API
  const fetchTeacherData = useCallback(async () => {
    if (!userId) {
      setIsLoadingTeacher(false);
      return;
    }
    
    try {
      const response = await fetch(`/api/teachers/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setTeacherData(data);
        setEditData({
          qualification: data.qualification || "",
          experience: data.experience || "",
          specialization: data.specialization || "",
        });
      } else {
        console.error('Failed to fetch teacher data:', response.status);
      }
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    } finally {
      setIsLoadingTeacher(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userLoading && userId) {
      fetchTeacherData();
    }
  }, [userLoading, userId, fetchTeacherData]);

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const onLogout = async () => {
    await handleLogout();
    router.push("/login");
  };

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setPasswordSuccess("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/teachers/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setTeacherData(prev => prev ? { ...prev, ...updatedData } : prev);
        setIsEditMode(false);
        toast.success("Profile updated successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update profile");
      }
    } catch {
      toast.error("An error occurred while updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditData({
      qualification: teacherData?.qualification || "",
      experience: teacherData?.experience || "",
      specialization: teacherData?.specialization || "",
    });
    setIsEditMode(false);
  };


  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from current password");
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch("/api/teacher/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: userId,
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPasswordError(data.error || "Failed to change password");
        return;
      }

      setPasswordSuccess("Password changed successfully!");
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        resetPasswordForm();
      }, 2000);
    } catch {
      setPasswordError("An error occurred. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Display user for layout
  const displayUser = user ? {
    name: `${user.firstName} ${user.lastName}`,
    email: user.email || '',
    role: user.role,
    avatar: undefined,
  } : {
    name: "Teacher",
    email: "",
    role: "TEACHER" as const,
    avatar: undefined,
  };

  // Get teacher data from API or fallback to session
  const displayData = {
    id: teacherData?.id || user?.id || "",
    firstName: teacherData?.firstName || user?.firstName || "Teacher",
    lastName: teacherData?.lastName || user?.lastName || "",
    fatherName: teacherData?.fatherName || "N/A",
    grandfatherName: teacherData?.grandfatherName || "N/A",
    teacherId: teacherData?.teacherId || "N/A",
    phone: teacherData?.phone || "N/A",
    secondaryPhone: teacherData?.secondaryPhone || "N/A",
    address: teacherData?.address || "N/A",
    dateOfBirth: teacherData?.dateOfBirth || null,
    departments: teacherData?.departments || [],
    qualification: teacherData?.qualification || "N/A",
    experience: teacherData?.experience || "N/A",
    specialization: teacherData?.specialization || "N/A",
    subjects: teacherData?.subjects || [],
    classes: teacherData?.classes || [],
    status: teacherData?.status || "ACTIVE",
  };

  // Show loading state
  if (userLoading) {
    return <AuthLoadingScreen />;
  }


  if (isLoadingTeacher) {
    return (
      <ModernDashboardLayout
        user={displayUser}
        title="My Profile"
        subtitle="View and manage your personal information"
        currentPath="/teacher/profile"
        onNavigate={handleNavigation}
        onLogout={onLogout}
        hideSearch={true}
      >
        <PageContainer>
          <div className="space-y-6">
            {/* Profile Header Skeleton */}
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-emerald-600/10" />
              <div className="relative p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-2xl" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-5 w-32" />
                    <div className="flex gap-3">
                      <Skeleton className="h-7 w-40 rounded-full" />
                      <Skeleton className="h-7 w-20 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Cards Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <Card key={i} className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0 h-full">
                  <CardHeader>
                    <Skeleton className="h-6 w-40" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </PageContainer>
      </ModernDashboardLayout>
    );
  }

  return (
    <ModernDashboardLayout
      user={displayUser}
      title="My Profile"
      subtitle="View and manage your personal information"
      currentPath="/teacher/profile"
      onNavigate={handleNavigation}
      onLogout={onLogout}
      hideSearch={true}
    >
      <PageContainer>
        <div className="space-y-6">
          {/* Profile Header Card - Same style as dashboard welcome card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl"
          >
            {/* Beautiful Background Gradient - Blue Theme (same as dashboard) */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-emerald-600/10" />

            {/* Floating Animated Elements */}
            <div className="absolute top-4 right-8 w-20 h-20 bg-blue-400/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute bottom-4 left-8 w-16 h-16 bg-purple-500/20 rounded-full blur-lg animate-pulse delay-1000" />
            <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-emerald-300/15 rounded-full blur-md animate-pulse delay-500" />

            <div className="relative p-6 sm:p-8 lg:p-12">
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <motion.div
                    className="p-2.5 sm:p-3 lg:p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-xl shadow-blue-500/25 flex-shrink-0"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                      {displayData.firstName} {displayData.lastName}
                    </h1>
                    <p className="text-sm sm:text-base text-slate-600 font-medium mt-1">
                      Teacher ID: {displayData.teacherId}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3">
                      <span className="px-3 py-1.5 bg-white/60 backdrop-blur-sm rounded-full text-sm font-medium text-slate-700 shadow-sm">
                        {displayData.specialization}
                      </span>
                      <span className={`px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${
                        displayData.status === 'ACTIVE' 
                          ? 'bg-emerald-500/90 text-white' 
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {displayData.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="flex flex-wrap items-center gap-3"
                >
                  {!isEditMode ? (
                    <Button
                      onClick={() => setIsEditMode(true)}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-xl shadow-blue-500/25 rounded-xl px-5 py-2.5 text-sm font-semibold"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-xl shadow-emerald-500/25 rounded-xl px-5 py-2.5 text-sm font-semibold"
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className="border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 shadow-lg rounded-xl px-5 py-2.5 text-sm font-semibold"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
