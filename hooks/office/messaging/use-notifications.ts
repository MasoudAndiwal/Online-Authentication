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
  
  // Track recent notifications for grouping
  // Requirement 29.3, 29.4
  const [recentNotifications, setRecentNotifications] = useState<Map<string, { count: number; lastTimestamp: number }>>(new Map());

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
   * Requirement 16.2
   */
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications');
      return 'denied';
    }

    // Check current permission
    if (Notification.permission === 'granted') {
      setPermission('granted');
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      setPermission('denied');
      console.warn('Notification permission was previously denied');
      return 'denied';
    }

    // Request permission
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        console.log('Notification permission granted');
        // Show a test notification
        try {
          const testNotification = new Notification('Notifications Enabled', {
            body: 'You will now receive message notifications',
            icon: '/icon.svg',
            tag: 'permission-granted',
          });
          
          setTimeout(() => {
            testNotification.close();
          }, 3000);
        } catch (error) {
          console.error('Failed to show test notification:', error);
        }
      } else if (result === 'denied') {
        console.warn('Notification permission denied by user');
      }
      
      return result;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      setPermission('denied');
      return 'denied';
    }
  }, []);

  /**
   * Check current permission on mount
   */
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      
      // Log current permission status
      console.log('Current notification permission:', Notification.permission);
    } else {
      console.warn('Browser does not support notifications');
    }
  }, []);

  // ============================================================================
  // Show Browser Notification
  // ============================================================================

  /**
   * Show a browser notification
   * Requirements: 16.2, 16.5
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
    // Requirement 29.1, 29.2
    if (isQuietHoursActive() && notification.priority !== 'urgent') {
      return;
    }

    // Check browser support and permission
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    // Handle notification grouping
    // Requirement 29.3, 29.4
    let title = 'New Message';
    let body = '';
    let icon = '/icon.svg';
    let shouldGroup = false;

    if (notificationSettings.grouping && notification.senderId) {
      const now = Date.now();
      const senderId = notification.senderId;
      const recentNotif = recentNotifications.get(senderId);

      // Group if within 30 seconds
      if (recentNotif && (now - recentNotif.lastTimestamp) < 30000) {
        shouldGroup = true;
        const newCount = recentNotif.count + 1;
        
        // Update tracking
        setRecentNotifications(prev => {
          const updated = new Map(prev);
          updated.set(senderId, { count: newCount, lastTimestamp: now });
          return updated;
        });

        // Show grouped notification
        title = notification.senderName || 'New Messages';
        body = `${newCount} new messages`;
      } else {
        // Start new group
        setRecentNotifications(prev => {
          const updated = new Map(prev);
          updated.set(senderId, { count: 1, lastTimestamp: now });
          return updated;
        });
      }
    }

    // Determine notification content based on preview setting if not grouped
    // Requirement 16.5
    if (!shouldGroup) {
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
    }

    // Create browser notification
    // Requirement 16.2
    try {
      const browserNotification = new Notification(title, {
        body,
        icon,
        badge: icon,
        tag: shouldGroup ? `grouped-${notification.senderId}` : notification.id,
        requireInteraction: notification.priority === 'urgent',
        silent: notificationSettings.sound === 'silent',
        data: {
          conversationId: notification.conversationId,
          notificationId: notification.id,
          timestamp: notification.timestamp,
          isGrouped: shouldGroup,
        },
        renotify: shouldGroup, // Re-alert for grouped notifications
      });

      // Handle notification click to open conversation
      // Requirement 16.2
      browserNotification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        
        // Navigate to conversation if available
        if (notification.conversationId) {
          // Dispatch custom event to trigger navigation in the app
          const navigationEvent = new CustomEvent('navigate-to-conversation', {
            detail: { conversationId: notification.conversationId },
          });
          window.dispatchEvent(navigationEvent);
          
          // Mark notification as read when clicked
          markNotificationAsRead(notification.id);
        }
        
        browserNotification.close();
      };

      // Handle notification close
      browserNotification.onclose = () => {
        // Cleanup if needed
      };

      // Handle notification error
      browserNotification.onerror = (error) => {
        console.error('Browser notification error:', error);
      };

      // Play notification sound (only for first notification in group)
      // Requirement 16.5
      if (notificationSettings.sound !== 'silent' && !shouldGroup) {
        playNotificationSound(notificationSettings.sound);
      }

      // Auto-close non-urgent notifications after 5 seconds
      if (notification.priority !== 'urgent') {
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      }
    } catch (error) {
      console.error('Failed to show browser notification:', error);
    }
  }, [notificationSettings, isQuietHoursActive, unreadCount, markNotificationAsRead, recentNotifications]);

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
  // Cleanup old notification grouping data
  // ============================================================================

  useEffect(() => {
    // Clean up notification grouping data older than 1 minute
    const interval = setInterval(() => {
      const now = Date.now();
      setRecentNotifications(prev => {
        const updated = new Map(prev);
        for (const [senderId, data] of updated.entries()) {
          if (now - data.lastTimestamp > 60000) {
            updated.delete(senderId);
          }
        }
        return updated;
      });
    }, 60000); // Run every minute

    return () => clearInterval(interval);
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
