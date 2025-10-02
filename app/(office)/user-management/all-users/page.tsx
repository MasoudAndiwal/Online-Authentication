"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ModernDashboardLayout,
  PageContainer,
  PageHeader,
} from "@/components/layout/modern-dashboard-layout";
import {
  ModernCard,
  ModernCardHeader,
  ModernCardTitle,
  ModernCardContent,
} from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Users, GraduationCap, User, Plus, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

// Sample user data
const sampleUser = {
  name: "Dr. Sarah Ahmed",
  email: "sarah.ahmed@university.edu",
  role: "OFFICE" as const,
  avatar: undefined,
};

export default function AllUsersPage() {
  const router = useRouter();
  const [currentPath, setCurrentPath] = React.useState("/user-management/all-users");

  const handleNavigation = (href: string) => {
    setCurrentPath(href);
    router.push(href);
  };

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  const handleSearch = (query: string) => {
    console.log("Search:", query);
  };

  return (
    <ModernDashboardLayout
      user={sampleUser}
      title="All Users"
      subtitle="Manage all system users"
      currentPath={currentPath}
      onNavigate={handleNavigation}
      onLogout={handleLogout}
      onSearch={handleSearch}
    >
      <PageContainer>
        <PageHeader
          title="All Users"
          subtitle="View and manage all users in the system"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "User Management", href: "/user-management" },
            { label: "All Users" },
          ]}
        />

        {/* User Type Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Teachers Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ModernCard className="hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <ModernCardHeader>
                <ModernCardTitle
                  icon={<GraduationCap className="h-8 w-8 text-blue-600" />}
                  className="text-2xl"
                >
                  Teachers
                </ModernCardTitle>
              </ModernCardHeader>
              <ModernCardContent>
                <div className="space-y-4">
                  <p className="text-slate-600 text-lg">
                    Manage all teacher accounts, view their profiles, and assign classes.
                  </p>
                  
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <div className="text-3xl font-bold text-blue-600">4</div>
                      <div className="text-sm text-blue-700">Active Teachers</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-slate-900">15</div>
                      <div className="text-sm text-slate-600">Total Classes</div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleNavigation("/user-management/teachers")}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white group-hover:shadow-lg transition-all duration-300"
                    >
                      View All Teachers
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button
                      onClick={() => handleNavigation("/user-management/add-teacher")}
                      variant="outline"
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </ModernCardContent>
            </ModernCard>
          </motion.div>

          {/* Students Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <ModernCard className="hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <ModernCardHeader>
                <ModernCardTitle
                  icon={<User className="h-8 w-8 text-purple-600" />}
                  className="text-2xl"
                >
                  Students
                </ModernCardTitle>
              </ModernCardHeader>
              <ModernCardContent>
                <div className="space-y-4">
                  <p className="text-slate-600 text-lg">
                    Manage all student accounts, track their progress, and monitor attendance.
                  </p>
                  
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div>
                      <div className="text-3xl font-bold text-purple-600">5</div>
                      <div className="text-sm text-purple-700">Active Students</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-slate-900">89%</div>
                      <div className="text-sm text-slate-600">Avg Attendance</div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleNavigation("/user-management/students")}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white group-hover:shadow-lg transition-all duration-300"
                    >
                      View All Students
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button
                      onClick={() => handleNavigation("/user-management/add-student")}
                      variant="outline"
                      className="border-purple-200 text-purple-700 hover:bg-purple-50"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </ModernCardContent>
            </ModernCard>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-8"
        >
          <ModernCard>
            <ModernCardHeader>
              <ModernCardTitle
                icon={<Users className="h-6 w-6 text-slate-600" />}
                className="text-xl"
              >
                Quick Actions
              </ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => handleNavigation("/user-management/add-teacher")}
                  variant="outline"
                  className="h-16 flex-col gap-2 border-blue-200 hover:bg-blue-50"
                >
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                  <span className="text-blue-700 font-medium">Add Teacher</span>
                </Button>
                
                <Button
                  onClick={() => handleNavigation("/user-management/add-student")}
                  variant="outline"
                  className="h-16 flex-col gap-2 border-purple-200 hover:bg-purple-50"
                >
                  <User className="h-6 w-6 text-purple-600" />
                  <span className="text-purple-700 font-medium">Add Student</span>
                </Button>
                
                <Button
                  onClick={() => handleNavigation("/user-management/roles")}
                  variant="outline"
                  className="h-16 flex-col gap-2 border-slate-200 hover:bg-slate-50"
                >
                  <Users className="h-6 w-6 text-slate-600" />
                  <span className="text-slate-700 font-medium">Manage Roles</span>
                </Button>
              </div>
            </ModernCardContent>
          </ModernCard>
        </motion.div>
      </PageContainer>
    </ModernDashboardLayout>
  );
}