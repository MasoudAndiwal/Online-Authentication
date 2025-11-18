"use client";

import React, { Suspense, lazy } from "react";
import { useRouter } from "next/navigation";
import { StudentGuard } from "@/components/auth/role-guard";
import { ModernDashboardLayout, PageContainer } from "@/components/layout/modern-dashboard-layout";
import { useCurrentUser } from "@/hooks/use-current-user";
import { handleLogout } from "@/lib/auth/logout";
import { NotificationBell } from "@/components/student/notification-bell";
import { WelcomeBanner } from "@/components/student/welcome-banner";
import { DashboardMetrics } from "@/components/student/dashboard-metrics";
import { DashboardMetricsSkeleton } from "@/components/student/dashboard-metrics-skeleton";
import { useStudentDashboard } from "@/hooks/use-student-dashboard";
import { WeeklyAttendanceCalendar } from "@/components/student/weekly-attendance-calendar";
import { useWeeklyAttendance } from "@/hooks/use-weekly-attendance";
import { AlertCircle } from "lucide-react";

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
  const [unreadNotifications] = React.useState(0);
  const [currentWeek, setCurrentWeek] = React.useState(1);

  // Fetch student dashboard metrics
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useStudentDashboard(user?.id);
  
  // Fetch weekly attendance data
  const { data: weeklyData, isLoading: weeklyLoading, error: weeklyError } = useWeeklyAttendance(user?.id, currentWeek);

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const onLogout = async () => {
    await handleLogout();
    router.push("/login");
  };

  const handleNotificationClick = () => {
    // TODO: Open notification panel in future tasks
    console.log("Notification bell clicked");
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
            unreadCount={unreadNotifications}
            onClick={handleNotificationClick}
          />
        }
      >
        <PageContainer>
          <div className="space-y-6 sm:space-y-8">
            {/* Welcome Banner */}
            <WelcomeBanner
              studentName={user?.firstName || "Student"}
              attendanceRate={metrics?.attendanceRate || 0}
              onViewAttendance={handleViewAttendance}
              onContactTeacher={handleContactTeacher}
            />

            {/* Error State */}
            {metricsError && (
              <div className="rounded-2xl shadow-xl bg-red-50 border-2 border-red-200 p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <div className="font-semibold text-red-800">Error</div>
                    <div className="text-sm text-red-700">
                      Failed to load dashboard metrics. Please try refreshing the page.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Metrics Cards */}
            {metricsLoading ? (
              <DashboardMetricsSkeleton />
            ) : metrics ? (
              <DashboardMetrics
                totalClasses={metrics.totalClasses}
                attendanceRate={metrics.attendanceRate}
                presentDays={metrics.presentDays}
                absentDays={metrics.absentDays}
              />
            ) : null}

            {/* Weekly Attendance Calendar */}
            {weeklyError && (
              <div className="rounded-2xl shadow-xl bg-red-50 border-2 border-red-200 p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <div className="font-semibold text-red-800">Error</div>
                    <div className="text-sm text-red-700">
                      Failed to load weekly attendance. Please try refreshing the page.
                    </div>
                  </div>
                </div>
              </div>
            )}

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

            {/* Progress Tracker and Statistics - Lazy loaded for performance */}
            {metrics && (
              <>
                {/* Progress Tracker */}
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

                {/* Threshold Warnings */}
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

                {/* Class Average Comparison */}
                {metrics.classAverage > 0 && (
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
                )}

                {/* Trend Analysis Charts */}
                <Suspense fallback={
                  <div className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0 p-6 animate-pulse">
                    <div className="h-8 w-48 bg-gradient-to-r from-slate-200 to-slate-300 rounded mb-4" />
                    <div className="h-80 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl" />
                  </div>
                }>
                  <TrendAnalysisCharts />
                </Suspense>
              </>
            )}
          </div>
        </PageContainer>
      </ModernDashboardLayout>
    </StudentGuard>
  );
}