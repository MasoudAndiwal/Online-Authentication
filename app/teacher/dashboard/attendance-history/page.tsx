"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  ModernDashboardLayout,
  PageContainer,
  PageHeader,
} from "@/components/layout/modern-dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { AuthLoadingScreen } from "@/components/ui/auth-loading";
import { handleLogout } from "@/lib/auth/logout";
import { AttendanceHistoryView } from "@/components/attendance/attendance-history-view";
import { useResponsive } from "@/lib/hooks/use-responsive";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

function AttendanceHistoryContent() {
  const { user, isLoading } = useAuth({ requiredRole: 'TEACHER' });
  const searchParams = useSearchParams();
  const { isMobile } = useResponsive();

  // Get classId from URL params
  const classId = searchParams.get('classId');
  
  // If no classId is provided, show class selection
  if (!classId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          No Class Selected
        </h2>
        <p className="text-slate-600 mb-6 max-w-md">
          Please select a class from your dashboard to view attendance history.
        </p>
        <button
          onClick={() => window.location.href = '/teacher/dashboard'}
          className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }
  
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

  // Show loading state while checking authentication
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
      title="Attendance History"
      subtitle="View and analyze attendance records"
      currentPath="/teacher/dashboard/attendance-history"
      onNavigate={handleNavigation}
      onLogout={handleLogoutClick}
      onSearch={handleSearch}
    >
      <PageContainer>
        <PageHeader
          title={isMobile ? "Attendance History" : "Attendance History"}
          subtitle={`${mockClassData.name} - Historical attendance records`}
          breadcrumbs={[
            { label: "Dashboard", href: "/teacher/dashboard" },
            { label: "Attendance History" },
          ]}
        />
        
        <AttendanceHistoryView
          classId={mockClassData.id}
          classData={mockClassData}
        />
      </PageContainer>
    </ModernDashboardLayout>
  );
}

export default function AttendanceHistoryPage() {
  return (
    <Suspense fallback={<AuthLoadingScreen />}>
      <AttendanceHistoryContent />
    </Suspense>
  );
}