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
  User, Phone, MapPin, Calendar, GraduationCap, BookOpen, Building, Shield,
  Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Briefcase, Award,
  Sparkles, Edit3, Save
} from "lucide-react";
import { toast } from "sonner";

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
  
  const [teacherData, setTeacherData] = useState<ExtendedTeacher | null>(null);
  const [isLoadingTeacher, setIsLoadingTeacher] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState({
    phone: "", secondaryPhone: "", address: "", dateOfBirth: "",
    qualification: "", experience: "", specialization: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  
  // Password modal state
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

  const fetchTeacherData = useCallback(async () => {
    if (!userId) { setIsLoadingTeacher(false); return; }
    try {
      const response = await fetch(`/api/teachers/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setTeacherData(data);
        setEditData({
          phone: data.phone || "", secondaryPhone: data.secondaryPhone || "",
          address: data.address || "", dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : "",
          qualification: data.qualification || "", experience: data.experience || "", specialization: data.specialization || "",
        });
      }
    } catch (error) { console.error('Error fetching teacher data:', error); }
    finally { setIsLoadingTeacher(false); }
  }, [userId]);

  useEffect(() => {
    if (!userLoading && userId) fetchTeacherData();
  }, [userLoading, userId, fetchTeacherData]);

  const handleNavigation = (href: string) => router.push(href);
  const onLogout = async () => { await handleLogout(); router.push("/login"); };

  const resetPasswordForm = () => {
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    setPasswordError(""); setPasswordSuccess("");
    setShowCurrentPassword(false); setShowNewPassword(false); setShowConfirmPassword(false);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/teachers/${userId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
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
    } catch { toast.error("An error occurred while updating profile"); }
    finally { setIsSaving(false); }
  };

  const handleCancelEdit = () => {
    setEditData({
      phone: teacherData?.phone || "", secondaryPhone: teacherData?.secondaryPhone || "",
      address: teacherData?.address || "", dateOfBirth: teacherData?.dateOfBirth ? teacherData.dateOfBirth.split('T')[0] : "",
      qualification: teacherData?.qualification || "", experience: teacherData?.experience || "", specialization: teacherData?.specialization || "",
    });
    setIsEditMode(false);
  };

  const handleChangePassword = async () => {
    setPasswordError(""); setPasswordSuccess("");
    if (!currentPassword || !newPassword || !confirmPassword) { setPasswordError("All fields are required"); return; }
    if (newPassword.length < 6) { setPasswordError("New password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { setPasswordError("New passwords do not match"); return; }
    if (currentPassword === newPassword) { setPasswordError("New password must be different"); return; }
    setIsChangingPassword(true);
    try {
      const response = await fetch("/api/teacher/change-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId: userId, currentPassword, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) { setPasswordError(data.error || "Failed to change password"); return; }
      setPasswordSuccess("Password changed successfully!");
      setTimeout(() => { setIsPasswordModalOpen(false); resetPasswordForm(); }, 2000);
    } catch { setPasswordError("An error occurred. Please try again."); }
    finally { setIsChangingPassword(false); }
  };

  const displayUser = user ? { name: `${user.firstName} ${user.lastName}`, email: user.email || '', role: user.role, avatar: undefined } 
    : { name: "Teacher", email: "", role: "TEACHER" as const, avatar: undefined };

  const displayData = {
    firstName: teacherData?.firstName || user?.firstName || "Teacher",
    lastName: teacherData?.lastName || user?.lastName || "",
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

  if (userLoading) return <AuthLoadingScreen />;


  if (isLoadingTeacher) {
    return (
      <ModernDashboardLayout user={displayUser} title="My Profile" subtitle="View and manage your personal information"
        currentPath="/teacher/profile" onNavigate={handleNavigation} onLogout={onLogout} hideSearch={true}>
        <PageContainer>
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-emerald-600/10" />
              <div className="relative p-4 sm:p-6">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 sm:h-8 w-32 sm:w-48" />
                      <Skeleton className="h-4 w-24 sm:w-32" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <Card key={i} className="rounded-2xl shadow-xl bg-white/80 border-0">
                  <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
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
    <ModernDashboardLayout user={displayUser} title="My Profile" subtitle="View and manage your personal information"
      currentPath="/teacher/profile" onNavigate={handleNavigation} onLogout={onLogout} hideSearch={true}>
      <PageContainer>
        <div className="space-y-6">
          {/* Profile Header - Fixed Mobile Layout */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-emerald-600/10" />
            <div className="hidden sm:block">
              <div className="absolute top-4 right-8 w-20 h-20 bg-blue-400/20 rounded-full blur-xl animate-pulse" />
              <div className="absolute bottom-4 left-8 w-16 h-16 bg-purple-500/20 rounded-full blur-lg animate-pulse" />
            </div>

            <div className="relative p-4 sm:p-6 lg:p-10">
              <div className="flex flex-col gap-4">
                {/* Name, ID and Status Row */}
                <div className="flex items-start gap-3">
                  <motion.div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl shadow-lg shadow-blue-500/25 flex-shrink-0"
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-slate-900">
                        {displayData.firstName} {displayData.lastName}
                      </h1>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        displayData.status === 'ACTIVE' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {displayData.status}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                      Teacher ID: {displayData.teacherId}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {!isEditMode ? (
                    <Button onClick={() => setIsEditMode(true)} size="sm"
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg rounded-xl text-xs sm:text-sm">
                      <Edit3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button onClick={handleSaveProfile} disabled={isSaving} size="sm"
                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg rounded-xl text-xs sm:text-sm">
                        {isSaving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
                        Save
                      </Button>
                      <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving} size="sm"
                        className="border-0 bg-white/60 hover:bg-white/80 shadow rounded-xl text-xs sm:text-sm">
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>


          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <Card className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0 h-full">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditMode ? (
                    <>
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Phone</Label>
                        <Input value={editData.phone} onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter phone number" className="bg-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Secondary Phone</Label>
                        <Input value={editData.secondaryPhone} onChange={(e) => setEditData(prev => ({ ...prev, secondaryPhone: e.target.value }))}
                          placeholder="Enter secondary phone" className="bg-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Address</Label>
                        <Input value={editData.address} onChange={(e) => setEditData(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Enter address" className="bg-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Date of Birth</Label>
                        <Input type="date" value={editData.dateOfBirth} onChange={(e) => setEditData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                          className="bg-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={displayData.phone} />
                      <InfoRow icon={<Phone className="h-4 w-4" />} label="Secondary Phone" value={displayData.secondaryPhone || "N/A"} />
                      <InfoRow icon={<MapPin className="h-4 w-4" />} label="Address" value={displayData.address} />
                      <InfoRow icon={<Calendar className="h-4 w-4" />} label="Date of Birth"
                        value={displayData.dateOfBirth ? new Date(displayData.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "N/A"} />
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Professional Information */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <Card className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0 h-full">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-orange-600" />
                    Professional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InfoRow icon={<Building className="h-4 w-4" />} label="Departments"
                    value={displayData.departments.length > 0 ? displayData.departments.join(", ") : "N/A"} />
                  {isEditMode ? (
                    <>
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Qualification</Label>
                        <Input value={editData.qualification} onChange={(e) => setEditData(prev => ({ ...prev, qualification: e.target.value }))}
                          placeholder="Enter qualification" className="bg-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Experience</Label>
                        <Input value={editData.experience} onChange={(e) => setEditData(prev => ({ ...prev, experience: e.target.value }))}
                          placeholder="Enter experience" className="bg-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Specialization</Label>
                        <Input value={editData.specialization} onChange={(e) => setEditData(prev => ({ ...prev, specialization: e.target.value }))}
                          placeholder="Enter specialization" className="bg-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <InfoRow icon={<GraduationCap className="h-4 w-4" />} label="Qualification" value={displayData.qualification} />
                      <InfoRow icon={<Award className="h-4 w-4" />} label="Experience" value={displayData.experience} />
                      <InfoRow icon={<BookOpen className="h-4 w-4" />} label="Specialization" value={displayData.specialization} />
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Subjects & Classes */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
            <Card className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Subjects & Classes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-50/80 rounded-xl">
                  <p className="text-xs text-slate-500 mb-3">Subjects</p>
                  <div className="flex flex-wrap gap-2">
                    {displayData.subjects.length > 0 ? displayData.subjects.map((subject, index) => (
                      <span key={index} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">{subject}</span>
                    )) : <span className="text-sm text-slate-500">No subjects assigned</span>}
                  </div>
                </div>
                <div className="p-4 bg-slate-50/80 rounded-xl">
                  <p className="text-xs text-slate-500 mb-3">Assigned Classes</p>
                  <div className="flex flex-wrap gap-2">
                    {displayData.classes.length > 0 ? displayData.classes.map((cls, index) => (
                      <span key={index} className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">{cls}</span>
                    )) : <span className="text-sm text-slate-500">No classes assigned</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>


          {/* Account Security */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <Card className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Account Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-50/80 rounded-xl">
                  <div>
                    <h4 className="font-medium text-slate-800">Password</h4>
                    <p className="text-sm text-slate-500">Keep your account secure</p>
                  </div>
                  <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    onClick={() => { resetPasswordForm(); setIsPasswordModalOpen(true); }}>
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Change Password Modal */}
        <Dialog open={isPasswordModalOpen} onOpenChange={(open) => { setIsPasswordModalOpen(open); if (!open) resetPasswordForm(); }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Change Password
              </DialogTitle>
              <DialogDescription>Enter your current password and choose a new password.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input id="currentPassword" type={showCurrentPassword ? "text" : "password"} value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" className="pr-10" />
                  <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input id="newPassword" type={showNewPassword ? "text" : "password"} value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className="pr-10" />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="pr-10" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {passwordError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />{passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />{passwordSuccess}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsPasswordModalOpen(false); resetPasswordForm(); }} disabled={isChangingPassword}>Cancel</Button>
              <Button onClick={handleChangePassword} disabled={isChangingPassword} className="bg-blue-600 hover:bg-blue-700">
                {isChangingPassword ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Changing...</> : "Change Password"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageContainer>
    </ModernDashboardLayout>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50/80 rounded-lg">
      <div className="p-2 bg-blue-100 rounded-lg text-blue-600">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-800 truncate">{value}</p>
      </div>
    </div>
  );
}
