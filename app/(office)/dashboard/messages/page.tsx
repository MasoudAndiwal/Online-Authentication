"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ModernDashboardLayout, PageContainer } from "@/components/layout/modern-dashboard-layout";
import { handleLogout } from "@/lib/auth/logout";
import { useAuth } from "@/hooks/use-auth";
import { AuthLoadingScreen } from "@/components/ui/auth-loading";
import { MessagingProvider } from "@/hooks/office/messaging/use-messaging-context";
import { OfficeMessagingInterface } from "@/components/office/messaging/OfficeMessagingInterface";
import { MessageNotificationBell } from "@/components/layout/message-notification-bell";

export default function MessagesPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth({ requiredRole: 'OFFICE' });
  const [currentPath, setCurrentPath] = React.useState("/dashboard/messages");
  const [unreadMessagesCount] = React.useState(3);

  // Use authenticated user data
  const displayUser = user ? {
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

  const handleSearch = (_query: string) => {
    // Search functionality
  };

  // Create current user object for messaging context
  const currentUser = {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email || '',
    role: 'office' as const,
    avatar: undefined,
  };

  return (
    <ModernDashboardLayout
      user={displayUser}
      title="Messages"
      subtitle="Office Communication Center"
      currentPath={currentPath}
      onNavigate={handleNavigation}
      onLogout={handleLogoutClick}
      onSearch={handleSearch}
      hideSearchBar={true}
    >
      <PageContainer>
        <MessagingProvider currentUser={currentUser}>
          <div className="h-[calc(100vh-12rem)]">
            <OfficeMessagingInterface />
          </div>
        </MessagingProvider>
      </PageContainer>
    </ModernDashboardLayout>
  );
}
