/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { StudentGuard } from "@/components/auth/role-guard";
import { ModernDashboardLayout, PageContainer } from "@/components/layout/modern-dashboard-layout";
import { useCurrentUser } from "@/hooks/use-current-user";
import { handleLogout } from "@/lib/auth/logout";
import { NotificationBell } from "@/components/student/notification-bell";
import { NotificationPanel, type Notification } from "@/components/student/notification-panel";
import { ClassInformationSection } from "@/components/student/class-information-section";
import { ClassInformationSkeleton } from "@/components/student/class-information-skeleton";
import { AlertCircle } from "lucide-react";
import { useSystemMessages, useMarkSystemMessageRead, useDismissSystemMessage } from "@/hooks/use-student-messages";

/**
 * Class Information Page
 * Displays comprehensive class information including:
 * - Class overview with schedule
 * - Teacher information
 * - Attendance policy and thresholds
 * Protected by STUDENT role authentication guard
 */
export default function ClassInfoPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = React.useState(false);
  const [classData, setClassData] = React.useState<any>(null);
  const [loadingClassData, setLoadingClassData] = React.useState(true);
  
  // Fetch system messages for notifications
  const { data: systemMessages = [] } = useSystemMessages(true);
  const markSystemReadMutation = useMarkSystemMessageRead();
  const dismissSystemMutation = useDismissSystemMessage();
  
  // Fetch class data from API
  React.useEffect(() => {
    const fetchClassData = async () => {
      try {
        const response = await fetch('/api/student/class-info');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setClassData(result.data);
          }
        } else {
          console.error('Failed to fetch class data:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching class data:', error);
      } finally {
        setLoadingClassData(false);
      }
    };

    if (user) {
      fetchClassData();
    }
  }, [user]);
  
  // Convert system messages to notification format
  const notifications: Notification[] = systemMessages.map(msg => ({
    id: msg.id,
    type: msg.severity === 'warning' ? 'warning' : msg.severity === 'error' ? 'warning' : msg.severity === 'success' ? 'success' : 'info',
    title: msg.title,
    message: msg.content,
    timestamp: new Date(msg.createdAt),
    read: msg.isRead,
  }));

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const onLogout = async () => {
    await handleLogout();
    router.push("/login");
  };

  const handleNotificationClick = () => {
    setIsNotificationPanelOpen(!isNotificationPanelOpen);
  };

  const handleMarkAsRead = (id: string) => {
    markSystemReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    notifications.filter(n => !n.read).forEach(n => {
      markSystemReadMutation.mutate(n.id);
    });
  };

  const handleClearAll = () => {
    notifications.forEach(n => {
      dismissSystemMutation.mutate(n.id);
    });
    setIsNotificationPanelOpen(false);
  };

  const handleContactTeacher = (teacherId: string) => {
    router.push(`/student/student-dashboard/messages?teacherId=${teacherId}`);
  };

  // Show skeleton loading while data is being fetched
  if (userLoading || loadingClassData) {
    return (
      <StudentGuard>
        <ModernDashboardLayout
          user={user || undefined}
          title="Class Information"
          subtitle="View your class details, schedule, and policies"
          currentPath="/student/class-info"
          onNavigate={handleNavigation}
          onLogout={onLogout}
          hideSearch={true}
          notificationTrigger={
            <NotificationBell
              unreadCount={unreadCount}
              onClick={handleNotificationClick}
              isActive={isNotificationPanelOpen}
            />
          }
        >
          <PageContainer>
            <ClassInformationSkeleton />
          </PageContainer>
        </ModernDashboardLayout>
      </StudentGuard>
    );
  }

  if (!classData) {
    return (
      <StudentGuard>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">No Class Information</h2>
            <p className="text-slate-600 mb-6">You don&apos;t have a class assigned yet.</p>
            <button
              onClick={() => router.push('/student/student-dashboard')}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </StudentGuard>
    );
  }

  return (
    <StudentGuard>
      <ModernDashboardLayout
        user={user || undefined}
        title="Class Information"
        subtitle="View your class details, schedule, and policies"
        currentPath="/student/class-info"
        onNavigate={handleNavigation}
        onLogout={onLogout}
        hideSearch={true}
        notificationTrigger={
          <NotificationBell
            unreadCount={unreadCount}
            onClick={handleNotificationClick}
            isActive={isNotificationPanelOpen}
          />
        }
      >
        <PageContainer>
          <div className="space-y-6 sm:space-y-8">
            {/* Page Header */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-6 sm:p-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-700 mb-2">
                {classData.className}
              </h1>
              <p className="text-sm sm:text-base text-slate-600">
                Complete information about your enrolled class, including schedule, teacher details, and attendance policies.
              </p>
            </div>

            {/* Class Information Section */}
            <ClassInformationSection
              className={classData.className}
              classCode={classData.classCode}
              semester={classData.semester}
              academicYear={classData.academicYear}
              credits={classData.credits}
              room={classData.room}
              building={classData.building}
              schedule={classData.schedule}
              major={classData.major}
              studentCount={classData.studentCount}
              session={classData.session}
              teachers={classData.teachers}
              maxAbsences={classData.maxAbsences}
              mahroomThreshold={classData.mahroomThreshold}
              tasdiqThreshold={classData.tasdiqThreshold}
              onContactTeacher={handleContactTeacher}
            />

            {/* Help Note */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-sm rounded-xl p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25">
                  <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm sm:text-base font-bold text-blue-800 mb-2">
                    Need Help?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    If you have questions about your class, schedule, or attendance policy, 
                    use the &quot;Contact Teacher&quot; button above to send a message directly to your instructor.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </ModernDashboardLayout>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClearAll={handleClearAll}
        onReply={() => {
          router.push("/student/student-dashboard/messages");
          setIsNotificationPanelOpen(false);
        }}
        onViewAllMessages={() => {
          router.push("/student/student-dashboard/messages");
          setIsNotificationPanelOpen(false);
        }}
      />
    </StudentGuard>
  );
}
