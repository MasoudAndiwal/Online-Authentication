"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

// Disable static generation for this page
export const dynamic = 'force-dynamic';
import { AttendanceManagement } from "@/components/attendance/attendance-management";
import {
  ModernDashboardLayout,
  PageContainer,
} from "@/components/layout/modern-dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { AuthLoadingScreen } from "@/components/ui/auth-loading";
import { handleLogout } from "@/lib/auth/logout";

function AttendanceContent() {
  const { user, isLoading } = useAuth({ requiredRole: 'TEACHER' });
  const searchParams = useSearchParams();
  const classId = searchParams.get('classId');
  
  // If no classId is provided, show class selection
  if (!classId) {
    return (
      <ModernDashboardLayout
        user={{
          name: user ? `${user.firstName} ${user.lastName}` : "Teacher",
          email: user?.email || '',
          role: "TEACHER" as const,
          avatar: undefined,
        }}
        title="Select Class"
        subtitle="Choose a class to mark attendance"
        currentPath="/teacher/dashboard/attendance"
        onNavigate={(href) => window.location.href = href}
        onLogout={async () => await handleLogout()}
        onSearch={(query) => console.log("Search:", query)}
      >
        <PageContainer>
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              No Class Selected
            </h2>
            <p className="text-slate-600 mb-6 max-w-md">
              Please select a class from your dashboard to mark attendance.
            </p>
            <button
              onClick={() => window.location.href = '/teacher/dashboard'}
              className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </PageContainer>
      </ModernDashboardLayout>
    );
  }
  
  // Mock class data for demo - this should be fetched from API in real implementation
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

export default function AttendancePage() {
  return (
    <Suspense fallback={<AuthLoadingScreen />}>
      <AttendanceContent />
    </Suspense>
  );
}