"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { StudentGuard } from "@/components/auth/role-guard";
import { ModernDashboardLayout, PageContainer } from "@/components/layout/modern-dashboard-layout";
import { useCurrentUser } from "@/hooks/use-current-user";
import { handleLogout } from "@/lib/auth/logout";
import { NotificationBell } from "@/components/student/notification-bell";

/**
 * Student Dashboard Page
 * Main interface for students to view attendance records and academic standing
 * Protected by STUDENT role authentication guard
 */
export default function StudentDashboardPage() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  const [unreadNotifications, setUnreadNotifications] = React.useState(0);

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

  if (loading) {
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
          <div className="rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl border-0 p-8">
            <h1 className="text-3xl font-bold text-emerald-700 mb-4">
              Student Dashboard
            </h1>
            <p className="text-slate-600">
              Welcome to your student portal. Your attendance dashboard is being set up.
            </p>
          </div>
        </PageContainer>
      </ModernDashboardLayout>
    </StudentGuard>
  );
}