"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { AttendanceManagement } from "@/components/attendance/attendance-management";
import {
  ModernDashboardLayout,
  PageContainer,
} from "@/components/layout/modern-dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { AuthLoadingScreen } from "@/components/ui/auth-loading";
import { handleLogout } from "@/lib/auth/logout";

export default function AttendancePage() {
  const { user, isLoading } = useAuth({ requiredRole: 'TEACHER' });
  const searchParams = useSearchParams();
  const classId = searchParams.get('classId') || 'demo-class-1';
  
  // Mock class data for demo
  const mockClassData = {
    id: classId,
    name: "Computer Science 101",
    session: "MORNING" as const,
    major: "Computer Science",
    semester: 3,
    studentCount: 25,
  };

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

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  const handleNavigation = (href: string) => {
    window.location.href = href;
  };

  const handleLogoutClick = async () => {
    await handleLogout();
  };

  const handleSearch = (query: string) => {
    console.log("Search:", query);
  };

  return (
    <ModernDashboardLayout
      user={displayUser}
      title="Attendance Management"
      subtitle="Mark and manage student attendance"
      currentPath="/teacher/dashboard/attendance"
      onNavigate={handleNavigation}
      onLogout={handleLogoutClick}
      onSearch={handleSearch}
    >
      <PageContainer>
        <AttendanceManagement
          classId={classId}
          classData={mockClassData}
          date={new Date()}
        />
      </PageContainer>
    </ModernDashboardLayout>
  );
}