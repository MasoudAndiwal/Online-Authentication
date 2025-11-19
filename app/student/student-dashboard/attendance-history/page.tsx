"use client";

import React, { Suspense, lazy } from "react";
import { useRouter } from "next/navigation";
import { StudentGuard } from "@/components/auth/role-guard";
import { ModernDashboardLayout, PageContainer } from "@/components/layout/modern-dashboard-layout";
import { useCurrentUser } from "@/hooks/use-current-user";
import { handleLogout } from "@/lib/auth/logout";
import { NotificationBell } from "@/components/student/notification-bell";
import { NotificationPanel, type Notification } from "@/components/student/notification-panel";
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
  const [notifications, setNotifications] = React.useState<Notification[]>([
    {
      id: "1",
      type: "info",
      title: "Attendance Record Updated",
      message: "Your attendance for today's class has been marked.",
      timestamp: new Date(Date.now() - 1800000),
      read: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Mock data for demonstration
  const mockRecords: AttendanceRecord[] = generateMockRecords();

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

  if (userLoading) {
    return (
      <StudentGuard>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
        </div>
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
              records={mockRecords}
              studentName={user?.firstName ? `${user.firstName} ${user.lastName}` : "Student"}
              isLoading={false}
            />
          </Suspense>
        </PageContainer>
      </ModernDashboardLayout>
    </StudentGuard>
  );
}

/**
 * Generate mock attendance records for demonstration
 */
function generateMockRecords(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const statuses: Array<"present" | "absent" | "sick" | "leave"> = [
    "present",
    "absent",
    "sick",
    "leave",
  ];
  const courses = [
    "Computer Science 101",
    "Mathematics 201",
    "Physics 150",
    "English Literature",
    "Database Systems",
    "Web Development",
  ];
  const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
  const teachers = ["Dr. Smith", "Prof. Johnson", "Dr. Williams", "Prof. Brown"];

  // Generate records for the past 60 days
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Skip Fridays (no classes)
    if (date.getDay() === 5) continue;

    const dayOfWeek = days[date.getDay()];
    const numSessions = Math.floor(Math.random() * 3) + 2; // 2-4 sessions per day

    for (let session = 1; session <= numSessions; session++) {
      // 85% chance of being present
      const statusIndex = Math.random() < 0.85 ? 0 : Math.floor(Math.random() * 4);
      const status = statuses[statusIndex];
      const course = courses[Math.floor(Math.random() * courses.length)];
      const teacher = teachers[Math.floor(Math.random() * teachers.length)];
      const time = `${8 + session}:00 AM`;

      records.push({
        id: `record-${i}-${session}`,
        date: date.toISOString(),
        dayOfWeek,
        status,
        courseName: course,
        period: session,
        notes: `Marked by: ${teacher} at ${time}`,
      });
    }
  }

  return records;
}
