"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ModernDashboardLayout,
  PageContainer,
} from "@/components/layout/modern-dashboard-layout";
import { handleLogout } from "@/lib/auth/logout";
import { useAuth } from "@/hooks/use-auth";
import { AuthLoadingScreen } from "@/components/ui/auth-loading";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Users } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function TeacherAttendancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const classId = searchParams.get('classId');
  const { user, isLoading } = useAuth({ requiredRole: 'TEACHER' });
  const [currentPath] = React.useState("/teacher/attendance");

  // Use authenticated user data
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

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const handleLogoutClick = async () => {
    await handleLogout();
  };

  const handleSearch = (query: string) => {
    console.log("Search:", query);
  };

  const handleBackToDashboard = () => {
    router.push('/teacher/dashboard');
  };

  React.useEffect(() => {
    if (classId) {
      toast.info(`Loading attendance for class ${classId}`, {
        description: 'Attendance marking interface will be implemented in the next phase.'
      });
    }
  }, [classId]);

  // Show loading state while checking authentication
  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <ModernDashboardLayout
      user={displayUser}
      title="Mark Attendance"
      subtitle="Select students and mark their attendance status"
      currentPath={currentPath}
      onNavigate={handleNavigation}
      onLogout={handleLogoutClick}
      onSearch={handleSearch}
    >
      <PageContainer>
        {/* Back Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Button
            onClick={handleBackToDashboard}
            className="h-11 bg-white hover:bg-slate-50 text-slate-700 shadow-sm border-0 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </motion.div>

        {/* Attendance Interface Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-orange-50 to-orange-100/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-orange-500/10 border-0"
        >
          <div className="text-center">
            <motion.div
              className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl shadow-xl shadow-orange-500/25 inline-block mb-6"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Calendar className="h-12 w-12 text-white" />
            </motion.div>
            
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Attendance Marking Interface
            </h2>
            
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              This is where teachers will mark student attendance. The full attendance grid component 
              will be implemented in task 4.1 according to the implementation plan.
            </p>

            {classId && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-6 inline-block">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-orange-600" />
                  <span className="font-semibold text-slate-900">
                    Class ID: {classId}
                  </span>
                </div>
              </div>
            )}

            <div className="text-sm text-slate-500">
              <p>Coming in Task 4.1: Attendance Grid Component</p>
              <p>• Student list with photos and status toggles</p>
              <p>• Bulk actions and real-time updates</p>
              <p>• Risk indicators and warnings</p>
            </div>
          </div>
        </motion.div>
      </PageContainer>
    </ModernDashboardLayout>
  );
}