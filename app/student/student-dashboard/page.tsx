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
import { useSyncService, useAutoSync } from "@/hooks/use-sync-service";
import { StudentErrorBoundary, StudentSectionErrorBoundary } from "@/components/student/error-boundary";
import { ErrorDisplay } from "@/components/student/error-display";
import { OfflineStatus, OfflineModeOverlay } from "@/components/ui/offline-indicator";
import { useOfflineMode } from "@/hooks/use-offline-mode";

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
  const [notifications, setNotifications] = React.useState<Notification[]>([
    {
      id: "1",
      type: "info",
      title: "Welcome to Your Dashboard",
      message: "Check your attendance metrics and stay on track with your academic goals.",
      timestamp: new Date(Date.now() - 3600000),
      read: false,
    },
    {
      id: "2",
      type: "success",
      title: "Great Attendance!",
      message: "You've maintained excellent attendance this week. Keep it up!",
      timestamp: new Date(Date.now() - 7200000),
      read: false,
    },
  ]);

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
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
    setIsNotificationPanelOpen(false);
  };

  const handleViewAttendance = () => {
    // TODO: Navigate to attendance view in future tasks
    console.log("View attendance clicked");
  };

  const handleContactTeacher = () => {
    // TODO: Open messaging interface in future tasks
    console.log("Contact teacher clicked");
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
                ) : metrics ? (
                  <DashboardMetrics
                    totalClasses={metrics.totalClasses}
                    attendanceRate={metrics.attendanceRate}
                    presentDays={metrics.presentDays}
                    absentDays={metrics.absentDays}
                  />
                ) : null}
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
      />
    </StudentGuard>
  );
}