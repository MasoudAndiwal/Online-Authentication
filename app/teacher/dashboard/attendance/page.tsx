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
  
  // State for real class data
  const [classData, setClassData] = React.useState<any>(null);
  const [loadingClass, setLoadingClass] = React.useState(true);
  const [classError, setClassError] = React.useState<string | null>(null);

  // Fetch real class data from API
  const loadClassData = React.useCallback(async () => {
    if (!classId) return;
    
    try {
      setLoadingClass(true);
      setClassError(null);
      const response = await fetch("/api/classes");
      if (!response.ok) throw new Error("Failed to fetch classes");
      const data = await response.json();
      const foundClass = data.find((c: unknown) => c.id === classId);
      if (!foundClass) throw new Error("Class not found");
      setClassData(foundClass);
    } catch (error) {
      console.error("Error fetching class:", error);
      setClassError("Failed to load class details");
    } finally {
      setLoadingClass(false);
    }
  }, [classId]);

  // Load class data when component mounts
  React.useEffect(() => {
    if (classId) {
      loadClassData();
    }
  }, [classId, loadClassData]);
  
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

  // Show loading state while fetching class data
  if (loadingClass) {
    return (
      <ModernDashboardLayout
        user={{
          name: user ? `${user.firstName} ${user.lastName}` : "Teacher",
          email: user?.email || '',
          role: "TEACHER" as const,
          avatar: undefined,
        }}
        title="Loading Class..."
        subtitle="Fetching class details"
        currentPath="/teacher/dashboard/attendance"
        onNavigate={(href) => window.location.href = href}
        onLogout={async () => await handleLogout()}
        onSearch={(query) => console.log("Search:", query)}
      >
        <PageContainer>
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Loading Class Details...</h2>
            <p className="text-slate-600">Please wait while we fetch the class information.</p>
          </div>
        </PageContainer>
      </ModernDashboardLayout>
    );
  }

  // Show error state if class loading failed
  if (classError || !classData) {
    return (
      <ModernDashboardLayout
        user={{
          name: user ? `${user.firstName} ${user.lastName}` : "Teacher",
          email: user?.email || '',
          role: "TEACHER" as const,
          avatar: undefined,
        }}
        title="Class Not Found"
        subtitle="Unable to load class details"
        currentPath="/teacher/dashboard/attendance"
        onNavigate={(href) => window.location.href = href}
        onLogout={async () => await handleLogout()}
        onSearch={(query) => console.log("Search:", query)}
      >
        <PageContainer>
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="p-4 bg-red-100 rounded-full mb-4">
              <svg className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Class Not Found</h2>
            <p className="text-slate-600 mb-6">{classError || "The requested class could not be found."}</p>
            <button
              onClick={() => window.location.href = '/teacher/dashboard'}
              className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </PageContainer>
      </ModernDashboardLayout>
    );
  }

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
      title={`Attendance - ${classData.name}`}
      subtitle={`${classData.major} • Semester ${classData.semester} • ${classData.session}`}
      currentPath="/teacher/dashboard/attendance"
      onNavigate={handleNavigation}
      onLogout={handleLogoutClick}
      onSearch={handleSearch}
    >
      <PageContainer>
        <AttendanceManagement
          classId={classId}
          classData={classData}
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