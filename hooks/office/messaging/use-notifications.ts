/**
 * useNotifications Hook
 * 
 * Custom hook for managing notifications with browser API integration.
 * Handles notification state, settings, dismiss/snooze actions, and browser notifications.
 * 
 * Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 29.1, 29.2, 29.3, 29.4, 29.5, 29.6, 29.7, 29.8, 29.9, 29.10, 29.11, 29.12
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useMessaging } from './use-messaging-context';
import type { Notification, NotificationSettings } from '@/types/office/messaging';

// ============================================================================
// Hook Interface
// ============================================================================

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
  dismiss: (id: string) => void;
  snooze: (id: string, duration: number) => void;
  updateSettings: (settings: NotificationSettings) => Promise<void>;
  showNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  requestPermission: () => Promise<NotificationPermission>;
  isQuietHoursActive: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const SNOOZE_DURATIONS = {
  '15min': 15 * 60 * 1000,
  '1hour': 60 * 60 * 1000,
  '4hours': 4 * 60 * 60 * 1000,
  'tomorrow': 24 * 60 * 60 * 1000,
};

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for managing notifications
 * 
 * @returns Notification state, settings, and actions
 */
export function useNotifications(): UseNotificationsReturn {
  const {
    notifications,
    unreadCount,
    notificationSettings,
    dismissNotification,
    snoozeNotification,
    updateNotificationSettings,
    markNotificationAsRead,
  } = useMessaging();

  // Local state for browser notification permission
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // ============================================================================
  // Check if quiet hours are active
  // ============================================================================

  const isQuietHoursActive = useCallback((): boolean => {
    if (!notificationSettings.quietHours?.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const { start, end } = notificationSettings.quietHours;

    // Handle quiet hours that span midnight
    if (start > end) {
      return currentTime >= start || currentTime < end;
    }

    return currentTime >= start && currentTime < end;
  }, [notificationSettings.quietHours]);

  // ============================================================================
  // Browser Notification Permission
  // ============================================================================

  /**
   * Request browser notification permission
   */
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      setPermission('granted');
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      setPermission('denied');
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return 'denied';
    }
  }, []);

  /**
   * Check current permission on mount
   */
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // ============================================================================
  // Show Browser Notification
  // ============================================================================

  /**
   * Show a browser notification
   */
  const showNotification = useCallback((notification: Notification) => {
    // Check if notifications are enabled
    if (!notificationSettings.enabled) {
      return;
    }

    // Check if browser notifications are enabled
    if (!notificationSettings.browserNotifications) {
      return;
    }

    // Check quiet hours (only show urgent notifications during quiet hours)
    if (isQuietHoursActive() && notification.priority !== 'urgent') {
      return;
    }

    // Check browser support and permission
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    // Determine notification content based on preview setting
    let title = 'New Message';
    let body = '';
    let icon = '/icon.svg';

    switch (notificationSettings.preview) {
      case 'full':
        title = notification.senderName || 'New Message';
        body = notification.message || '';
        break;
      case 'sender_only':
        title = notification.senderName || 'New Message';
        body = 'You have a new message';
        break;
      case 'count_only':
        title = 'New Message';
        body = `You have ${unreadCount} unread messages`;
        break;
    }

    // Create browser notification
    try {
      const browserNotification = new Notification(title, {
        body,
        icon,
        badge: icon,
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent',
        silent: notificationSettings.sound === 'silent',
      });

      // Handle notification click
      browserNotification.onclick = () => {
        window.focus();
        // Navigate to conversation if available
        if (notification.conversationId) {
          // This would trigger navigation in the app
          console.log('Navigate to conversation:', notification.conversationId);
        }
        browserNotification.close();
      };

      // Play notification sound
      if (notificationSettings.sound !== 'silent') {
        playNotificationSound(notificationSettings.sound);
      }
    } catch (error) {
      console.error('Failed to show browser notification:', error);
    }
  }, [notificationSettings, isQuietHoursActive, unreadCount]);

  // ============================================================================
  // Notification Sound
  // ============================================================================

  /**
   * Play notification sound
   */
  const playNotificationSound = useCallback((sound: 'default' | 'subtle' | 'silent') => {
    if (sound === 'silent') return;

    try {
      const audio = new Audio(sound === 'default' ? '/sounds/notification.mp3' : '/sounds/notification-subtle.mp3');
      audio.volume = sound === 'subtle' ? 0.3 : 0.7;
      audio.play().catch(err => console.error('Failed to play sound:', err));
    } catch (error) {
      console.error('Failed to create audio:', error);
    }
  }, []);

  // ============================================================================
  // Notification Actions
  // ============================================================================

  /**
   * Dismiss a notification
   */
  const dismiss = useCallback((id: string) => {
    dismissNotification(id);
  }, [dismissNotification]);

  /**
   * Snooze a notification
   */
  const snooze = useCallback((id: string, duration: number) => {
    snoozeNotification(id, duration);
  }, [snoozeNotification]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback((id: string) => {
    markNotificationAsRead(id);
  }, [markNotificationAsRead]);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(() => {
    notifications.forEach(notif => {
      if (!notif.isRead) {
        markNotificationAsRead(notif.id);
      }
    });
  }, [notifications, markNotificationAsRead]);

  /**
   * Clear all notifications
   */
  const clearAll = useCallback(() => {
    notifications.forEach(notif => {
      dismissNotification(notif.id);
    });
  }, [notifications, dismissNotification]);

  /**
   * Update notification settings
   */
  const updateSettings = useCallback(async (settings: NotificationSettings) => {
    await updateNotificationSettings(settings);
  }, [updateNotificationSettings]);

  // ============================================================================
  // Auto-show notifications for new messages
  // ============================================================================

  useEffect(() => {
    // Show browser notification for the most recent unread notification
    const unreadNotifications = notifications.filter(n => !n.isRead);
    if (unreadNotifications.length > 0) {
      const latest = unreadNotifications[0];
      // Only show if it's a new message notification
      if (latest.type === 'new_message') {
        showNotification(latest);
      }
    }
  }, [notifications, showNotification]);

  // ============================================================================
  // System Do Not Disturb Detection
  // ============================================================================

  useEffect(() => {
    // Check if system is in Do Not Disturb mode (if supported)
    if ('permissions' in navigator && 'query' in navigator.permissions) {
      navigator.permissions.query({ name: 'notifications' as PermissionName }).then(result => {
        if (result.state === 'denied') {
          console.log('System notifications are disabled');
        }
      }).catch(() => {
        // Permission query not supported
      });
    }
  }, []);

  // ============================================================================
  // Return hook interface
  // ============================================================================

  return {
    notifications,
    unreadCount,
    settings: notificationSettings,
    dismiss,
    snooze,
    updateSettings,
    showNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    requestPermission,
    isQuietHoursActive: isQuietHoursActive(),
  };
}
