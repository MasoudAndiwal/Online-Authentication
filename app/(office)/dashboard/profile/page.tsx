"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ModernDashboardLayout,
  PageContainer,
} from "@/components/layout/modern-dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Save,
  Camera,
  Building2,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { handleLogout as performLogout } from "@/lib/auth/logout";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { AuthLoadingScreen } from "@/components/ui/auth-loading";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth({ requiredRole: "OFFICE" });
  const [currentPath] = React.useState("/dashboard/profile");
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Form state
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "Administration",
  });

  // Initialize form data when user loads
  React.useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: "",
        department: "Administration",
      });
    }
  }, [user]);

  const handleNavigation = (href: string) => {
    try {
      router.push(href);
    } catch (error) {
      console.error("Navigation failed:", error);
      window.location.href = href;
    }
  };

  const handleLogout = async () => {
    await performLogout();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Create display user
  const displayUser = user
    ? {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email || "",
        role: user.role,
      }
    : { name: "User", email: "", role: "OFFICE" as const };

  // Format login time
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Show loading screen while checking authentication
  if (authLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <ModernDashboardLayout
      user={displayUser}
      title="My Profile"
      subtitle="Manage your account settings"
      currentPath={currentPath}
      onNavigate={handleNavigation}
      onLogout={handleLogout}
      hideSearch={true}
    >
      <PageContainer>
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl shadow-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="h-28 w-28 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl font-bold shadow-2xl"
              >
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-lg text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Camera className="h-4 w-4" />
              </motion.button>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">
                {user?.firstName} {user?.lastName}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-blue-100">
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user?.email}
                </span>
                <span className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                  <Shield className="h-4 w-4" />
                  {user?.role}
                </span>
              </div>
            </div>

            {/* Edit Button */}
            <Button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="rounded-2xl shadow-lg bg-white/80 backdrop-blur-sm p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <User className="h-5 w-5 text-blue-600" />
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="text-sm font-medium text-slate-700"
                  >
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="h-12 rounded-xl bg-slate-50 focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="text-sm font-medium text-slate-700"
                  >
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="h-12 rounded-xl bg-slate-50 focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-slate-700"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="h-12 rounded-xl bg-slate-50 focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-sm font-medium text-slate-700"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter phone number"
                    className="h-12 rounded-xl bg-slate-50 focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label
                    htmlFor="department"
                    className="text-sm font-medium text-slate-700"
                  >
                    Department
                  </Label>
                  <Input
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="h-12 rounded-xl bg-slate-50 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 pt-6 border-t border-slate-100"
                >
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isSaving ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Sidebar Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="space-y-6"
          >
            {/* Account Info Card */}
            <div className="rounded-2xl shadow-lg bg-white/80 backdrop-blur-sm p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Account Info
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">User ID</p>
                    <p className="text-sm font-medium text-slate-900">
                      {user?.id?.slice(0, 8)}...
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-50">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Building2 className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Role</p>
                    <p className="text-sm font-medium text-slate-900">
                      {user?.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Info Card */}
            <div className="rounded-2xl shadow-lg bg-white/80 backdrop-blur-sm p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-600" />
                Session Info
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Login Time</p>
                    <p className="text-sm font-medium text-slate-900">
                      {user?.loginTime ? formatDate(user.loginTime) : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Last Activity</p>
                    <p className="text-sm font-medium text-slate-900">
                      {user?.lastActivity
                        ? formatDate(user.lastActivity)
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="rounded-2xl shadow-lg bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Phone className="h-5 w-5 text-blue-400" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button
                  onClick={() => handleNavigation("/dashboard")}
                  className="w-full bg-white/10 hover:bg-white/20 text-white rounded-xl py-3 font-medium transition-all duration-300"
                >
                  Go to Dashboard
                </Button>
                <Button
                  onClick={() => handleNavigation("/dashboard/teachers")}
                  className="w-full bg-white/10 hover:bg-white/20 text-white rounded-xl py-3 font-medium transition-all duration-300"
                >
                  Manage Teachers
                </Button>
                <Button
                  onClick={() => handleNavigation("/dashboard/students")}
                  className="w-full bg-white/10 hover:bg-white/20 text-white rounded-xl py-3 font-medium transition-all duration-300"
                >
                  Manage Students
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </PageContainer>
    </ModernDashboardLayout>
  );
}
