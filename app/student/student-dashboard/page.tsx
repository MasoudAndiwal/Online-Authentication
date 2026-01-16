"use client";

import React, { Suspense, lazy } from "react";
import { useRouter } from "next/navigation";
import { StudentGuard } from "@/components/auth/role-guard";
import { ModernDashboardLayout, PageContainer } from "@/components/layout/modern-dashboard-layout";
import { useCurrentUser } from "@/hooks/use-current-user";
import { handleLogout } from "@/lib/auth/logout";
import { NotificationBell } from "@/components/student/notification-bell";
import { NotificationPanel, type Notification } from "@/components/student/notification-panel";
import { WelcomeBanner } from "@/components/student/welcome-banner";
import { DashboardMetrics } from "@/components/student/dashboard-metrics";
import { DashboardMetricsSkeleton } from "@/components/student/dashboard-metrics-skeleton";
import { useStudentDashboard } from "@/hooks/use-student-dashboard";
import { WeeklyAttendanceCalendar } from "@/components/student/weekly-attendance-calendar";
import { useWeeklyAttendance } from "@/hooks/use-weekly-attendance";
import { useSystemMessages, useMarkSystemMessageRead, useDismissSystemMessage } from "@/hooks/use-student-messages";
import { useSyncService, useAutoSync } from "@/hooks/use-sync-service";
import { StudentErrorBoundary, StudentSectionErrorBoundary } from "@/components/student/error-boundary";
import { ErrorDisplay } from "@/components/student/error-display";
import { OfflineStatus } from "@/components/ui/offline-indicator";
import { useOfflineMode } from "@/hooks/use-offline-mode";
import { useToast } from "@/hooks/use-toast";

// Lazy load heavy components for better initial load performance
const ProgressTracker = lazy(() => import("@/components/student/progress-tracker").then(mod => ({ default: mod.ProgressTracker })));
const ThresholdWarnings = lazy(() => import("@/components/student/threshold-warnings").then(mod => ({ default: mod.ThresholdWarnings })));
const ClassAverageComparison = lazy(() => import("@/components/student/class-average-comparison").then(mod => ({ default: mod.ClassAverageComparison })));
const TrendAnalysisCharts = lazy(() => import("@/components/student/trend-analysis-charts").then(mod => ({ default: mod.TrendAnalysisCharts })));

/**
 * Student Dashboard Page
 * Main interface for students to view attendance records and academic standing
 * Protected by STUDENT role authentication guard
 * Features: Welcome banner, metrics cards with count-up animations, real-time data
 */
export default function StudentDashboardPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();
  // Week offset: 0 = current week, -1 = last week, 1 = next week
  const [currentWeek, setCurrentWeek] = React.useState(0);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = React.useState(false);
  const { toast } = useToast();
  
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

  // Fetch student dashboard metrics
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useStudentDashboard(user?.id);
  
  // Fetch weekly attendance data
  const { data: weeklyData, isLoading: weeklyLoading, error: weeklyError } = useWeeklyAttendance(user?.id, currentWeek);

  // Offline mode management
  const offlineMode = useOfflineMode({
    disableUploads: true,
    disableExports: true,
    disablePreferenceChanges: true,
    disableMessaging: true,
    showOfflineIndicators: true,
    enableOfflineToasts: true
  });

  // Sync service for automatic data synchronization
  const syncService = useSyncService({
    studentId: user?.id,
    autoSync: true,
    syncOnReconnect: true,
    syncOnMount: true,
    syncInterval: 5 * 60 * 1000 // 5 minutes
  });

  // Auto sync on various events
  useAutoSync({
    studentId: user?.id,
    enabled: true,
    syncOnReconnect: true,
    syncOnFocus: true,
    syncOnVisibilityChange: true,
    minSyncInterval: 30000 // 30 seconds
  });

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
    // Mark all unread messages as read
    notifications.filter(n => !n.read).forEach(n => {
      markSystemReadMutation.mutate(n.id);
    });
  };

  const handleClearAll = () => {
    // Dismiss all messages
    notifications.forEach(n => {
      dismissSystemMutation.mutate(n.id);
    });
    setIsNotificationPanelOpen(false);
  };

  const handleViewAttendance = () => {
    router.push("/student/student-dashboard/attendance-history");
  };

  const handleContactTeacher = () => {
    router.push("/student/student-dashboard/messages");
  };

  const handleWeekChange = (week: number) => {
    setCurrentWeek(week);
  };

  if (userLoading) {
    return (
      <StudentGuard>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 flex items-center justify-center">
          <div className="text-emerald-600">Loading...</div>
        </div>
      </StudentGuard>
    );
  }

  return (
    <StudentGuard>
      <StudentErrorBoundary>
        <ModernDashboardLayout
          user={user || undefined}
          title="Student Dashboard"
          subtitle="Welcome to your attendance portal"
          currentPath="/student/student-dashboard"
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
              {/* Offline Status Indicators */}
              <OfflineStatus
                lastUpdated={syncService.lastSync?.getTime()}
                onRefresh={syncService.syncAll}
                isRefreshing={syncService.isSyncing || metricsLoading}
                showStalenessWarning={true}
                staleThreshold={24 * 60 * 60 * 1000} // 24 hours
              />

              {/* Welcome Banner */}
              <StudentSectionErrorBoundary sectionName="Welcome Banner">
                <WelcomeBanner
                  studentName={user?.firstName || "Student"}
                  attendanceRate={metrics?.attendanceRate || 0}
                  onViewAttendance={handleViewAttendance}
                  onContactTeacher={handleContactTeacher}
                />
              </StudentSectionErrorBoundary>

              {/* Metrics Cards with Error Handling */}
              <StudentSectionErrorBoundary sectionName="Dashboard Metrics">
                {metricsError ? (
                  <ErrorDisplay
                    error={metricsError}
                    onRetry={() => window.location.reload()}
                    variant="compact"
                  />
                ) : metricsLoading ? (
                  <DashboardMetricsSkeleton />
                ) : (
                  <DashboardMetrics
                    totalClasses={metrics?.totalClasses ?? 0}
                    attendanceRate={metrics?.attendanceRate ?? 0}
                    presentDays={metrics?.presentDays ?? 0}
                    absentDays={metrics?.absentDays ?? 0}
                  />
                )}
              </StudentSectionErrorBoundary>

              {/* Weekly Attendance Calendar with Error Handling */}
              <StudentSectionErrorBoundary sectionName="Weekly Attendance">
                {weeklyError ? (
                  <ErrorDisplay
                    error={weeklyError}
                    onRetry={() => setCurrentWeek(currentWeek)}
                    variant="compact"
                  />
                ) : null}

                {weeklyLoading ? (
                  <div className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0 p-6 animate-pulse">
                    <div className="h-8 w-48 bg-gradient-to-r from-slate-200 to-slate-300 rounded mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl" />
                      ))}
                    </div>
                  </div>
                ) : weeklyData ? (
                  <WeeklyAttendanceCalendar
                    weekData={weeklyData.days}
                    currentWeek={currentWeek}
                    onWeekChange={handleWeekChange}
                  />
                ) : null}
              </StudentSectionErrorBoundary>

              {/* Progress Tracker and Statistics - Lazy loaded for performance */}
              {metrics && (
                <>
                  {/* Progress Tracker */}
                  <StudentSectionErrorBoundary sectionName="Progress Tracker">
                    <Suspense fallback={
                      <div className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0 p-6 animate-pulse">
                        <div className="h-8 w-48 bg-gradient-to-r from-slate-200 to-slate-300 rounded mb-4" />
                        <div className="h-64 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl" />
                      </div>
                    }>
                      <ProgressTracker
                        attendanceRate={metrics.attendanceRate}
                        presentHours={metrics.presentDays}
                        absentHours={metrics.absentDays}
                        sickHours={metrics.sickDays}
                        leaveHours={metrics.leaveDays}
                        totalHours={metrics.totalClasses}
                      />
                    </Suspense>
                  </StudentSectionErrorBoundary>

                  {/* Threshold Warnings */}
                  <StudentSectionErrorBoundary sectionName="Threshold Warnings">
                    <Suspense fallback={
                      <div className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0 p-6 animate-pulse">
                        <div className="h-8 w-48 bg-gradient-to-r from-slate-200 to-slate-300 rounded mb-4" />
                        <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl" />
                      </div>
                    }>
                      <ThresholdWarnings
                        attendanceRate={metrics.attendanceRate}
                        absentHours={metrics.absentDays}
                        totalHours={metrics.totalClasses}
                        mahroomThreshold={75}
                        tasdiqThreshold={85}
                      />
                    </Suspense>
                  </StudentSectionErrorBoundary>

                  {/* Class Average Comparison */}
                  {metrics.classAverage > 0 && (
                    <StudentSectionErrorBoundary sectionName="Class Average Comparison">
                      <Suspense fallback={
                        <div className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0 p-6 animate-pulse">
                          <div className="h-8 w-48 bg-gradient-to-r from-slate-200 to-slate-300 rounded mb-4" />
                          <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl" />
                        </div>
                      }>
                        <ClassAverageComparison
                          studentRate={metrics.attendanceRate}
                          classAverage={metrics.classAverage}
                          ranking={metrics.ranking}
                        />
                      </Suspense>
                    </StudentSectionErrorBoundary>
                  )}

                  {/* Trend Analysis Charts */}
                  <StudentSectionErrorBoundary sectionName="Trend Analysis">
                    <Suspense fallback={
                      <div className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0 p-6 animate-pulse">
                        <div className="h-8 w-48 bg-gradient-to-r from-slate-200 to-slate-300 rounded mb-4" />
                        <div className="h-80 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl" />
                      </div>
                    }>
                      <TrendAnalysisCharts />
                    </Suspense>
                  </StudentSectionErrorBoundary>
                </>
              )}
            </div>
          </PageContainer>
        </ModernDashboardLayout>
      </StudentErrorBoundary>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClearAll={handleClearAll}
        onReply={(notification) => {
          // Navigate to messages with the sender info
          if (notification.senderId && notification.senderType) {
            router.push(`/student/student-dashboard/messages?recipientId=${notification.senderId}&recipientType=${notification.senderType}`);
          } else {
            router.push("/student/student-dashboard/messages");
          }
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