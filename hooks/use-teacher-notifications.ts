"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type NotificationType = 
  | 'new_message' 
  | 'student_risk' 
  | 'broadcast_success' 
  | 'broadcast_partial'
  | 'system_update' 
  | 'schedule_change';

export interface TeacherNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Hook for fetching teacher notifications
 */
export function useTeacherNotifications() {
  return useQuery<{ notifications: TeacherNotification[]; unreadCount: number }, Error>({
    queryKey: ["teacher-notifications"],
    queryFn: async () => {
      const response = await fetch("/api/teacher/notifications", {
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized. Please login again.");
        }
        if (response.status === 403) {
          throw new Error("Access denied.");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch notifications");
      }

      const data = await response.json();
      return {
        notifications: data.notifications as TeacherNotification[],
        unreadCount: data.unreadCount as number
      };
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
    retry: 2,
  });
}

/**
 * Hook for marking notification as read
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch("/api/teacher/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-notifications"] });
    },
  });
}

/**
 * Hook for marking all notifications as read
 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/teacher/notifications/mark-all-read", {
        method: "POST",
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-notifications"] });
    },
  });
}
