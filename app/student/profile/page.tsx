"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { StudentGuard } from "@/components/auth/role-guard";
import { ModernDashboardLayout, PageContainer } from "@/components/layout/modern-dashboard-layout";
import { useCurrentUser } from "@/hooks/use-current-user";
import { handleLogout } from "@/lib/auth/logout";
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
  CheckCircle2
} from "lucide-react";

/**
 * Student Profile Page
 * Displays student personal information, academic details, and account settings
 */
// Extended user type for student data
interface ExtendedUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  studentId?: string;
  email?: string;
  phone?: string;
  fatherPhone?: string;
  address?: string;
  dateOfBirth?: string;
  programs?: string;
  semester?: string;
  classSection?: string;
  enrollmentYear?: string;
  timeSlot?: string;
}

export default function StudentProfilePage() {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();
  
  // Student data state
  const [studentData, setStudentData] = useState<ExtendedUser | null>(null);
  const [isLoadingStudent, setIsLoadingStudent] = useState(true);
  
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

  // Memoize user ID to prevent dependency array issues
  const userId = user?.id;

  // Fetch student data from API
  const fetchStudentData = useCallback(async () => {
    if (!userId) {
      setIsLoadingStudent(false);
      return;
    }
    
    try {
      const response = await fetch(`/api/students/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setStudentData({
          id: data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          studentId: data.studentId,
          phone: data.phone,
          fatherPhone: data.fatherPhone,
          address: data.address,
          dateOfBirth: data.dateOfBirth,
          programs: data.programs,
          semester: data.semester,
          classSection: data.classSection,
          enrollmentYear: data.enrollmentYear,
          timeSlot: data.timeSlot,
        });
      } else {
        // Try to get error details
        try {
          const errorData = await response.json();
          console.error('Failed to fetch student data:', response.status, errorData);
        } catch {
          console.error('Failed to fetch student data:', response.status, response.statusText);
        }
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setIsLoadingStudent(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userLoading) {
      fetchStudentData();
    }
  }, [userLoading, fetchStudentData]);

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

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    // Validation
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
      const response = await fetch("/api/student/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: displayData.id,
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

  if (userLoading || isLoadingStudent) {
    return (
      <StudentGuard>
        <ModernDashboardLayout
          user={user || undefined}
          title="My Profile"
          subtitle="View and manage your personal information"
          currentPath="/student/profile"
          onNavigate={handleNavigation}
          onLogout={onLogout}
          hideSearch={true}
        >
          <PageContainer>
            <div className="space-y-6">
              {/* Profile Header Skeleton */}
              <Card className="rounded-2xl shadow-xl bg-gradient-to-r from-emerald-500 to-emerald-600 border-0 overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="text-center sm:text-left flex-1 space-y-3">
                      <Skeleton className="h-8 w-48 bg-white/20" />
                      <Skeleton className="h-5 w-32 bg-white/20" />
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
                        <Skeleton className="h-7 w-24 rounded-full bg-white/20" />
                        <Skeleton className="h-7 w-28 rounded-full bg-white/20" />
                        <Skeleton className="h-7 w-20 rounded-full bg-white/20" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Info Cards Grid Skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information Skeleton */}
                <Card className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0 h-full">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 rounded" />
                      <Skeleton className="h-6 w-40" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Academic Information Skeleton */}
                <Card className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0 h-full">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 rounded" />
                      <Skeleton className="h-6 w-44" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Account Security Skeleton */}
              <Card className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-6 w-36" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                    <Skeleton className="h-10 w-36 rounded-md" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </PageContainer>
        </ModernDashboardLayout>
      </StudentGuard>
    );
  }

  // Get student data from API or fallback to session
  const displayData = {
    id: studentData?.id || user?.id || "",
    firstName: studentData?.firstName || user?.firstName || "Student",
    lastName: studentData?.lastName || user?.lastName || "",
    studentId: studentData?.studentId || "N/A",
    phone: studentData?.phone || "N/A",
    fatherPhone: studentData?.fatherPhone || "N/A",
    address: studentData?.address || "N/A",
    dateOfBirth: studentData?.dateOfBirth || null,
    programs: studentData?.programs || "N/A",
    semester: studentData?.semester || "N/A",
    classSection: studentData?.classSection || "N/A",
    enrollmentYear: studentData?.enrollmentYear || "N/A",
    timeSlot: studentData?.timeSlot || "N/A",
  };

  return (
    <StudentGuard>
      <ModernDashboardLayout
        user={user || undefined}
        title="My Profile"
        subtitle="View and manage your personal information"
        currentPath="/student/profile"
        onNavigate={handleNavigation}
        onLogout={onLogout}
        hideSearch={true}
      >
        <PageContainer>
          <div className="space-y-6">
            {/* Profile Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="rounded-2xl shadow-xl bg-gradient-to-r from-emerald-500 to-emerald-600 border-0 text-white overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Basic Info */}
                    <div className="text-center sm:text-left flex-1">
                      <h1 className="text-2xl sm:text-3xl font-bold">
                        {displayData.firstName} {displayData.lastName}
                      </h1>
                      <p className="text-emerald-100 mt-1">
                        Student ID: {displayData.studentId}
                      </p>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                          {displayData.programs}
                        </span>
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                          Semester {displayData.semester}
                        </span>
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                          {displayData.classSection}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0 h-full">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <User className="h-5 w-5 text-emerald-600" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <InfoRow 
                      icon={<Phone className="h-4 w-4" />} 
                      label="Phone" 
                      value={displayData.phone} 
                    />
                    <InfoRow 
                      icon={<Phone className="h-4 w-4" />} 
                      label="Father's Phone" 
                      value={displayData.fatherPhone} 
                    />
                    <InfoRow 
                      icon={<MapPin className="h-4 w-4" />} 
                      label="Address" 
                      value={displayData.address} 
                    />
                    <InfoRow 
                      icon={<Calendar className="h-4 w-4" />} 
                      label="Date of Birth" 
                      value={displayData.dateOfBirth 
                        ? new Date(displayData.dateOfBirth).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : "N/A"
                      } 
                    />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Academic Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0 h-full">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-emerald-600" />
                      Academic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <InfoRow 
                      icon={<Building className="h-4 w-4" />} 
                      label="Program" 
                      value={displayData.programs} 
                    />
                    <InfoRow 
                      icon={<BookOpen className="h-4 w-4" />} 
                      label="Class Section" 
                      value={displayData.classSection} 
                    />
                    <InfoRow 
                      icon={<Calendar className="h-4 w-4" />} 
                      label="Enrollment Year" 
                      value={displayData.enrollmentYear} 
                    />
                    <InfoRow 
                      icon={<User className="h-4 w-4" />} 
                      label="Time Slot" 
                      value={displayData.timeSlot} 
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Account Security */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-emerald-600" />
                    Account Security
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-slate-800">Password</h4>
                      <p className="text-sm text-slate-500">Keep your account secure</p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                      onClick={() => {
                        resetPasswordForm();
                        setIsPasswordModalOpen(true);
                      }}
                    >
                      Change Password
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Change Password Modal */}
          <Dialog open={isPasswordModalOpen} onOpenChange={(open) => {
            setIsPasswordModalOpen(open);
            if (!open) resetPasswordForm();
          }}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-600" />
                  Change Password
                </DialogTitle>
                <DialogDescription>
                  Enter your current password and choose a new password.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* Current Password */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {passwordError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {passwordError}
                  </div>
                )}

                {/* Success Message */}
                {passwordSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    {passwordSuccess}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    resetPasswordForm();
                  }}
                  disabled={isChangingPassword}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </PageContainer>
      </ModernDashboardLayout>
    </StudentGuard>
  );
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
      <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-800 truncate">{value}</p>
      </div>
    </div>
  );
}
