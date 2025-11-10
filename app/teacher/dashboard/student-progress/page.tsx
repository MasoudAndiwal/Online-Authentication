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
import { StudentProgressSection } from "@/components/teacher/student-progress-section";
import { useResponsive } from "@/lib/hooks/use-responsive";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

function StudentProgressContent() {
  const { user, isLoading } = useAuth({ requiredRole: 'TEACHER' });
  const searchParams = useSearchParams();
  const classId = searchParams.get('classId');
  const { isMobile } = useResponsive();

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
      title="Student Progress"
      subtitle="Track and analyze student performance"
      currentPath="/teacher/dashboard/student-progress"
      onNavigate={handleNavigation}
      onLogout={handleLogoutClick}
      onSearch={handleSearch}
    >
      <PageContainer>
        <PageHeader
          title={isMobile ? "Student Progress" : "Student Progress & Analytics"}
          subtitle="Monitor student performance and attendance patterns"
          breadcrumbs={[
            { label: "Dashboard", href: "/teacher/dashboard" },
            { label: "Student Progress" },
          ]}
        />
        
        <StudentProgressSection
          classId={classId || 'all'}
        />
      </PageContainer>
    </ModernDashboardLayout>
  );
}

export default function StudentProgressPage() {
  return (
    <Suspense fallback={<AuthLoadingScreen />}>
      <StudentProgressContent />
    </Suspense>
  );
}