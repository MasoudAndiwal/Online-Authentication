"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ModernDashboardLayout,
  PageContainer,
} from "@/components/layout/modern-dashboard-layout";
import { handleLogout } from "@/lib/auth/logout";
import { useAuth } from "@/hooks/use-auth";
import { AuthLoadingScreen } from "@/components/ui/auth-loading";
import { BookOpen } from "lucide-react";
import {
  ModernCard,
  ModernCardHeader,
  ModernCardTitle,
  ModernCardContent,
} from "@/components/ui/modern-card";
import { TeacherClassGrid } from "@/components/classes/teacher-class-grid";
import { useTeacherDashboardSelectors } from "@/lib/stores/teacher-dashboard-store";
import { useInitializeTeacherDashboard } from "@/lib/hooks/use-teacher-dashboard";
import { TeacherNotificationsWrapper } from "@/components/teacher";

export default function TeacherClassesPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth({ requiredRole: 'TEACHER' });
  const [currentPath] = React.useState("/teacher/dashboard/classes");

  // Initialize dashboard data
  const { isLoading: loadingDashboard, error: dashboardError } = useInitializeTeacherDashboard();
  const { classes, isLoading: storeLoading, error: storeError } = useTeacherDashboardSelectors();

  const loadingClasses = loadingDashboard || storeLoading;
  const classesError = dashboardError || storeError;

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

  const handleSearch = (_query: string) => {
    // Search functionality
  };

  // Class action handlers
  const handleMarkAttendance = (classId?: string) => {
    if (classId) {
      router.push(`/teacher/dashboard/attendance?classId=${classId}`);
    } else {
      router.push('/teacher/dashboard/attendance');
    }
  };

  const handleViewClassDetails = (classId: string) => {
    router.push(`/teacher/dashboard/${classId}`);
  };

  const handleViewStudents = (classId: string) => {
    router.push(`/teacher/dashboard/${classId}?tab=students`);
  };

  const handleViewReports = (classId: string) => {
    router.push(`/teacher/dashboard/${classId}?tab=reports`);
  };

  const handleViewSchedule = (classId: string) => {
    router.push(`/teacher/dashboard/${classId}?tab=schedule`);
  };

  const handleManageClass = (classId: string) => {
    router.push(`/teacher/dashboard/${classId}?tab=manage`);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <ModernDashboardLayout
      user={displayUser}
      title="My Classes"
      subtitle="Manage and view all your assigned classes"
      currentPath={currentPath}
      onNavigate={handleNavigation}
      onLogout={handleLogoutClick}
      onSearch={handleSearch}
      notificationTrigger={<TeacherNotificationsWrapper />}
    >
      <PageContainer>
        {/* Header Section */}
        <div
          className="bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-emerald-600/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-blue-500/10 border-0 mb-8"
        >
          <div className="flex items-center gap-6">
            <div
              className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-xl shadow-blue-500/25"
            >
              <BookOpen className="h-12 w-12 text-white" />
            </div>
            
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                My Classes
              </h1>
              <p className="text-lg text-slate-600">
                View and manage all your assigned classes in one place
              </p>
            </div>
          </div>
        </div>

        {/* Classes Grid */}
        <ModernCard
          variant="glass"
          className="border-0 shadow-2xl shadow-blue-200/20 bg-white backdrop-blur-xl"
        >
          <ModernCardHeader>
            <ModernCardTitle
              icon={<BookOpen className="h-7 w-7 text-blue-500" />}
              className="text-3xl font-bold"
            >
              All Classes
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <TeacherClassGrid
              classes={classes}
              isLoading={loadingClasses}
              error={classesError instanceof Error ? classesError.message : classesError}
              onMarkAttendance={handleMarkAttendance}
              onViewDetails={handleViewClassDetails}
              onViewStudents={handleViewStudents}
              onViewReports={handleViewReports}
              onViewSchedule={handleViewSchedule}
              onManageClass={handleManageClass}
            />
          </ModernCardContent>
        </ModernCard>
      </PageContainer>
    </ModernDashboardLayout>
  );
}