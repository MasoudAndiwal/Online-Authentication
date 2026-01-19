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
import { TeacherNotificationsWrapper } from "@/components/teacher";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

function AttendanceHistoryContent() {
  const { user, isLoading } = useAuth({ requiredRole: 'TEACHER' });
  const searchParams = useSearchParams();
  const { isMobile } = useResponsive();

  // Get classId from URL params (optional)
  const classIdParam = searchParams.get('classId');
  
  // State for selected class
  const [selectedClassId, setSelectedClassId] = React.useState<string | null>(classIdParam);
  const [classes, setClasses] = React.useState<unknown[]>([]);
  const [loadingClasses, setLoadingClasses] = React.useState(true);

  // Fetch teacher's classes
  React.useEffect(() => {
    const fetchClasses = async () => {
      if (!user?.id) return;
      
      try {
        // Fetch only classes that this teacher teaches
        const response = await fetch(`/api/teachers/${user.id}/classes`);
        if (response.ok) {
          const data = await response.json();
          setClasses(data);
          
          // If no class is selected but we have classes, select the first one
          if (!selectedClassId && data.length > 0) {
            setSelectedClassId(data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch teacher classes:', error);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, [user?.id, selectedClassId]);

  // If no classes available, show message
  if (!loadingClasses && classes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          No Classes Found
        </h2>
        <p className="text-slate-600 mb-6 max-w-md">
          You don&apos;t have any classes assigned yet. Please contact the office.
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

  // Get selected class data
  const selectedClass = classes.find(c => c.id === selectedClassId) || classes[0];
  
  // Use selected class or mock data
  const mockClassData = selectedClass || {
    id: selectedClassId || 'default',
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

  const handleSearch = (_query: string) => {
    // Search functionality
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
      notificationTrigger={<TeacherNotificationsWrapper />}
    >
      <PageContainer>
        <PageHeader
          title={isMobile ? "Attendance History" : "Attendance History"}
          subtitle={loadingClasses ? "" : `${mockClassData.name} - Historical attendance records`}
          breadcrumbs={[
            { label: "Dashboard", href: "/teacher/dashboard" },
            { label: "Attendance History" },
          ]}
        />
        
        {/* Class Selector */}
        {classes.length > 1 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Class
            </label>
            <Select value={selectedClassId || ''} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-full sm:w-auto bg-white/80 backdrop-blur-sm border-slate-200 rounded-xl shadow-sm hover:bg-white transition-all focus:ring-2 focus:ring-orange-500">
                <SelectValue placeholder="Choose a class..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id} className="rounded-lg">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{cls.name}</span>
                      <span className="text-xs text-slate-500 ml-4">{cls.session}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {loadingClasses ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <AttendanceHistoryView
            classId={mockClassData.id}
            classData={mockClassData}
          />
        )}
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