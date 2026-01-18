"use client";

import React, { Suspense, lazy, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StudentGuard } from "@/components/auth/role-guard";
import { ModernDashboardLayout, PageContainer } from "@/components/layout/modern-dashboard-layout";
import { useCurrentUser } from "@/hooks/use-current-user";
import { handleLogout } from "@/lib/auth/logout";
import { NotificationBell } from "@/components/student/notification-bell";
import { NotificationPanel, type Notification } from "@/components/student/notification-panel";
import { useSystemMessages, useMarkSystemMessageRead, useDismissSystemMessage } from "@/hooks/use-student-messages";
import type { AttendanceRecord } from "@/types/types";
import { Loader2 } from "lucide-react";

// Lazy load the attendance history view for better performance
const AttendanceHistoryView = lazy(() => import("@/components/student/attendance-history-view").then(mod => ({ default: mod.AttendanceHistoryView })));

/**
 * Attendance History Page
 * Displays the complete attendance history for a student
 * Features filtering, export, statistics, and infinite scroll
 * Protected by STUDENT role authentication guard
 */
export default function AttendanceHistoryPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = React.useState(false);
  
  // State for attendance records
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [recordsError, setRecordsError] = useState<string | null>(null);
  
  // Fetch system messages for notifications
  const { data: systemMessages = [] } = useSystemMessages(true);
  const markSystemReadMutation = useMarkSystemMessageRead();
  const dismissSystemMutation = useDismissSystemMessage();
  
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

  // Fetch attendance records from API
  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      if (!user?.id) return;

      try {
        setIsLoadingRecords(true);
        setRecordsError(null);

        console.log('[Attendance History Page] Fetching records for student:', user.id);

        const response = await fetch(`/api/students/${user.id}/attendance/history?days=60`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch attendance records');
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          console.log('[Attendance History Page] Loaded records:', result.data.length);
          setAttendanceRecords(result.data);
        } else {
          throw new Error(result.error || 'Failed to load attendance records');
        }
      } catch (error) {
        console.error('[Attendance History Page] Error fetching records:', error);
        setRecordsError(error instanceof Error ? error.message : 'Failed to load attendance records');
        setAttendanceRecords([]);
      } finally {
        setIsLoadingRecords(false);
      }
    };

    fetchAttendanceRecords();
  }, [user?.id]);

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

  if (userLoading) {
    return (
      <StudentGuard>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
        </div>
      </StudentGuard>
    );
  }

  // Show error state if records failed to load
  if (recordsError && !isLoadingRecords) {
    return (
      <StudentGuard>
        <ModernDashboardLayout
          user={user || undefined}
          title="Attendance History"
          subtitle="View your complete attendance records"
          currentPath="/student/student-dashboard/attendance-history"
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
            <div className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0 p-8 text-center">
              <div className="text-red-600 mb-4">
                <svg className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Failed to Load Attendance History</h3>
              <p className="text-slate-600 mb-4">{recordsError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </PageContainer>
        </ModernDashboardLayout>
      </StudentGuard>
    );
  }

  return (
    <StudentGuard>
      <ModernDashboardLayout
        user={user || undefined}
        title="Attendance History"
        subtitle="View your complete attendance records"
        currentPath="/student/student-dashboard/attendance-history"
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
          <Suspense fallback={
            <div className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0 p-8 flex items-center justify-center min-h-[600px]">
              <div className="text-center">
                <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mx-auto mb-4" />
                <p className="text-slate-500">Loading attendance history...</p>
              </div>
            </div>
          }>
            <AttendanceHistoryView
              records={attendanceRecords}
              studentName={user?.firstName ? `${user.firstName} ${user.lastName}` : "Student"}
              isLoading={isLoadingRecords}
            />
          </Suspense>
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
