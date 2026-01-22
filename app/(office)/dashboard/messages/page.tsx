"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ModernDashboardLayout, PageContainer } from "@/components/layout/modern-dashboard-layout";
import { handleLogout } from "@/lib/auth/logout";
import { useAuth } from "@/hooks/use-auth";
import { AuthLoadingScreen } from "@/components/ui/auth-loading";
import { MessagingProvider } from "@/hooks/office/messaging/use-messaging-context";
import { OfficeMessagingInterface } from "@/components/office/messaging/OfficeMessagingInterface";
import { NotificationCenter } from "@/components/office/messaging/notifications/NotificationCenter";
import { NotificationBellTrigger } from "@/components/office/messaging/notifications/NotificationBellTrigger";
import { useNotifications } from "@/hooks/office/messaging/use-notifications";

interface UserProfile {
  name: string;
  email: string;
  role: "OFFICE" | "TEACHER" | "STUDENT";
  avatar?: string;
}

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: 'office';
  avatar?: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth({ requiredRole: 'OFFICE' });
  const [currentPath, setCurrentPath] = React.useState("/dashboard/messages");

  // Use authenticated user data
  const displayUser: UserProfile = user ? {
    name: `${user.firstName} ${user.lastName}`,
    email: user.email || '',
    role: user.role,
    avatar: undefined,
  } : {
    name: "Office Staff",
    email: "",
    role: "OFFICE" as const,
    avatar: undefined,
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  // Ensure user is loaded before rendering messaging
  if (!user) {
    return <AuthLoadingScreen />;
  }

  const handleNavigation = (href: string) => {
    setCurrentPath(href);
    router.push(href);
  };

  const handleLogoutClick = async () => {
    await handleLogout();
  };

  const handleSearch = () => {
    // Search functionality
  };

  // Create current user object for messaging context
  const currentUser: CurrentUser = {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email || '',
    role: 'office' as const,
    avatar: undefined,
  };

  return (
    <MessagingProvider currentUser={currentUser}>
      <NotificationBellWrapper
        displayUser={displayUser}
        currentPath={currentPath}
        handleNavigation={handleNavigation}
        handleLogoutClick={handleLogoutClick}
        handleSearch={handleSearch}
      />
    </MessagingProvider>
  );
}

// Separate component that uses the notification hook (must be inside MessagingProvider)
function NotificationBellWrapper({
  displayUser,
  currentPath,
  handleNavigation,
  handleLogoutClick,
  handleSearch,
}: {
  displayUser: UserProfile;
  currentPath: string;
  handleNavigation: (href: string) => void;
  handleLogoutClick: () => void;
  handleSearch: () => void;
}) {
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = React.useState(false);
  
  // This hook is now safe to use because we're inside MessagingProvider
  const { unreadCount } = useNotifications();

  const notificationTrigger = (
    <NotificationBellTrigger
      unreadCount={unreadCount}
      onClick={() => setIsNotificationPanelOpen(true)}
    />
  );

  return (
    <>
      <ModernDashboardLayout
        user={displayUser}
        title="Messages"
        subtitle="Office Communication Center"
        currentPath={currentPath}
        onNavigate={handleNavigation}
        onLogout={handleLogoutClick}
        onSearch={handleSearch}
        hideSearch={true}
        notificationTrigger={notificationTrigger}
      >
        <PageContainer>
          <div className="h-[calc(100vh-12rem)]">
            <OfficeMessagingInterface />
          </div>
        </PageContainer>
      </ModernDashboardLayout>

      <NotificationCenter
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
      />
    </>
  );
}
