"use client";

import * as React from "react";
import { NotificationCenter, NotificationTrigger } from "@/components/teacher";
import { useNotifications } from "@/lib/hooks/use-notifications";

/**
 * Reusable notification wrapper for teacher pages
 * Provides notification bell and notification center
 */
export function TeacherNotificationsWrapper() {
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  return (
    <>
      {/* Notification Trigger (Bell Icon) */}
      <NotificationTrigger
        unreadCount={unreadCount}
        onClick={() => setIsNotificationOpen(true)}
      />

      {/* Notification Center (Slide-out Panel) */}
      <NotificationCenter
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDelete={deleteNotification}
      />
    </>
  );
}
