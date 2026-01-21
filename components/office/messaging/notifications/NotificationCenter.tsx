/**
 * NotificationCenter Component
 * 
 * Slide-in panel for managing notifications with glassmorphism effect.
 * Features:
 * - Notification list with grouping
 * - Quick actions (mark as read, snooze, dismiss)
 * - Settings panel for notification preferences
 * - Unread count badge
 * - Quiet hours indicator
 * - Muted conversation indicator
 * - RTL/LTR slide direction support
 * 
 * Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 22.2, 25.10, 29.1-29.12
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, BellOff, Settings, Check, Clock, Trash2, Moon, Volume2, VolumeX, Eye, EyeOff } from 'lucide-react';
import { useNotifications } from '@/hooks/office/messaging/use-notifications';
import { useLanguage } from '@/hooks/office/messaging/use-language';
import type { Notification, NotificationSettings as NotificationSettingsType } from '@/types/office/messaging';
import { colors, glassmorphism, spacing, animations, borderRadius, zIndex } from '@/lib/design-system/office-messaging';
import { formatDistanceToNow } from 'date-fns';

// ============================================================================
// Component Props
// ============================================================================

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

// ============================================================================
// Snooze Duration Options
// ============================================================================

const SNOOZE_OPTIONS = [
  { label: '15 minutes', value: 15 * 60 * 1000 },
  { label: '1 hour', value: 60 * 60 * 1000 },
  { label: '4 hours', value: 4 * 60 * 60 * 1000 },
  { label: 'Until tomorrow', value: 24 * 60 * 60 * 1000 },
];

// ============================================================================
// NotificationCenter Component
// ============================================================================

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    settings,
    dismiss,
    snooze,
    updateSettings,
    markAsRead,
    markAllAsRead,
    clearAll,
    requestPermission,
    isQuietHoursActive,
  } = useNotifications();

  const { direction, t } = useLanguage();
  const [showSettings, setShowSettings] = useState(false);
  const [snoozeMenuOpen, setSnoozeMenuOpen] = useState<string | null>(null);

  // ============================================================================
  // Group notifications by date
  // ============================================================================

  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {
      today: [],
      yesterday: [],
      older: [],
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    notifications.forEach(notification => {
      const notifDate = new Date(notification.timestamp);
      const notifDay = new Date(notifDate.getFullYear(), notifDate.getMonth(), notifDate.getDate());

      if (notifDay.getTime() === today.getTime()) {
        groups.today.push(notification);
      } else if (notifDay.getTime() === yesterday.getTime()) {
        groups.yesterday.push(notification);
      } else {
        groups.older.push(notification);
      }
    });

    return groups;
  }, [notifications]);

  // ============================================================================
  // Animation Variants
  // ============================================================================

  const panelVariants = {
    hidden: {
      x: direction === 'ltr' ? 400 : -400,
      opacity: 0,
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
      },
    },
    exit: {
      x: direction === 'ltr' ? 400 : -400,
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleSnooze = (notificationId: string, duration: number) => {
    snooze(notificationId, duration);
    setSnoozeMenuOpen(null);
  };

  const handleToggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const handleUpdateSettings = async (newSettings: Partial<NotificationSettingsType>) => {
    await updateSettings({ ...settings, ...newSettings });
  };

  const handleRequestPermission = async () => {
    const permission = await requestPermission();
    if (permission === 'granted') {
      await handleUpdateSettings({ browserNotifications: true });
    }
  };

  // ============================================================================
  // Render Notification Item
  // ============================================================================

  const renderNotificationItem = (notification: Notification) => {
    const isUnread = !notification.isRead;
    const priorityColor = 
      notification.priority === 'urgent' ? colors.priority.urgent :
      notification.priority === 'important' ? colors.priority.important :
      colors.priority.normal;

    return (
      <motion.div
        key={notification.id}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: direction === 'ltr' ? 100 : -100 }}
        className={`
          relative p-4 rounded-lg mb-2 cursor-pointer
          transition-all duration-200
          ${isUnread ? 'bg-blue-50 border-l-4' : 'bg-white'}
          hover:shadow-md
        `}
        style={{
          borderLeftColor: isUnread ? priorityColor : 'transparent',
        }}
        onClick={() => !isUnread && markAsRead(notification.id)}
      >
        {/* Notification Content */}
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div 
            className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${priorityColor}20, ${priorityColor}10)`,
            }}
          >
            {notification.type === 'new_message' && <Bell className="w-5 h-5" style={{ color: priorityColor }} />}
            {notification.type === 'message_read' && <Check className="w-5 h-5" style={{ color: priorityColor }} />}
            {notification.type === 'broadcast_complete' && <Bell className="w-5 h-5" style={{ color: priorityColor }} />}
            {notification.type === 'delivery_failed' && <X className="w-5 h-5" style={{ color: priorityColor }} />}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900">
                  {notification.senderName || t('notification.system')}
                </p>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                </p>
              </div>

              {/* Unread indicator */}
              {isUnread && (
                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 mt-3">
          {isUnread && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                markAsRead(notification.id);
              }}
              className="text-xs px-3 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
            >
              {t('notification.markRead')}
            </button>
          )}
          
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSnoozeMenuOpen(snoozeMenuOpen === notification.id ? null : notification.id);
              }}
              className="text-xs px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-1"
            >
              <Clock className="w-3 h-3" />
              {t('notification.snooze')}
            </button>

            {/* Snooze Menu */}
            {snoozeMenuOpen === notification.id && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[150px]"
                style={{
                  [direction === 'ltr' ? 'left' : 'right']: 0,
                }}
              >
                {SNOOZE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSnooze(notification.id, option.value);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              dismiss(notification.id);
            }}
            className="text-xs px-3 py-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            {t('notification.dismiss')}
          </button>
        </div>
      </motion.div>
    );
  };

  // ============================================================================
  // Render Settings Panel
  // ============================================================================

  const renderSettings = () => (
    <div className="space-y-6">
      {/* Browser Notifications */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-900">
            {t('settings.browserNotifications')}
          </label>
          <button
            onClick={() => handleUpdateSettings({ browserNotifications: !settings.browserNotifications })}
            className={`
              relative w-12 h-6 rounded-full transition-colors
              ${settings.browserNotifications ? 'bg-blue-500' : 'bg-gray-300'}
            `}
          >
            <span
              className={`
                absolute top-1 w-4 h-4 bg-white rounded-full transition-transform
                ${settings.browserNotifications ? (direction === 'ltr' ? 'translate-x-7' : '-translate-x-7') : 'translate-x-1'}
              `}
            />
          </button>
        </div>
        {!settings.browserNotifications && (
          <button
            onClick={handleRequestPermission}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            {t('settings.requestPermission')}
          </button>
        )}
      </div>

      {/* Sound */}
      <div>
        <label className="text-sm font-medium text-gray-900 block mb-2">
          {t('settings.sound')}
        </label>
        <div className="flex gap-2">
          {(['default', 'subtle', 'silent'] as const).map((sound) => (
            <button
              key={sound}
              onClick={() => handleUpdateSettings({ sound })}
              className={`
                flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${settings.sound === sound 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {sound === 'default' && <Volume2 className="w-4 h-4 mx-auto" />}
              {sound === 'subtle' && <Volume2 className="w-4 h-4 mx-auto opacity-50" />}
              {sound === 'silent' && <VolumeX className="w-4 h-4 mx-auto" />}
            </button>
          ))}
        </div>
      </div>

      {/* Preview Level */}
      <div>
        <label className="text-sm font-medium text-gray-900 block mb-2">
          {t('settings.preview')}
        </label>
        <div className="space-y-2">
          {(['full', 'sender_only', 'count_only'] as const).map((preview) => (
            <button
              key={preview}
              onClick={() => handleUpdateSettings({ preview })}
              className={`
                w-full px-4 py-3 rounded-lg text-sm text-left transition-all
                ${settings.preview === preview 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <div className="flex items-center gap-2">
                {settings.preview === preview ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <div className="w-4 h-4" />
                )}
                <div>
                  <div className="font-medium">{t(`settings.preview.${preview}.title`)}</div>
                  <div className="text-xs opacity-75">{t(`settings.preview.${preview}.description`)}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quiet Hours */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Moon className="w-4 h-4" />
            {t('settings.quietHours')}
          </label>
          <button
            onClick={() => handleUpdateSettings({
              quietHours: {
                ...settings.quietHours,
                enabled: !settings.quietHours?.enabled,
                start: settings.quietHours?.start || '22:00',
                end: settings.quietHours?.end || '08:00',
              },
            })}
            className={`
              relative w-12 h-6 rounded-full transition-colors
              ${settings.quietHours?.enabled ? 'bg-blue-500' : 'bg-gray-300'}
            `}
          >
            <span
              className={`
                absolute top-1 w-4 h-4 bg-white rounded-full transition-transform
                ${settings.quietHours?.enabled ? (direction === 'ltr' ? 'translate-x-7' : '-translate-x-7') : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        {settings.quietHours?.enabled && (
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <label className="text-xs text-gray-600 block mb-1">{t('settings.quietHours.start')}</label>
              <input
                type="time"
                value={settings.quietHours.start}
                onChange={(e) => handleUpdateSettings({
                  quietHours: { ...settings.quietHours!, start: e.target.value },
                })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-600 block mb-1">{t('settings.quietHours.end')}</label>
              <input
                type="time"
                value={settings.quietHours.end}
                onChange={(e) => handleUpdateSettings({
                  quietHours: { ...settings.quietHours!, end: e.target.value },
                })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Grouping */}
      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-900">
            {t('settings.grouping')}
          </label>
          <button
            onClick={() => handleUpdateSettings({ grouping: !settings.grouping })}
            className={`
              relative w-12 h-6 rounded-full transition-colors
              ${settings.grouping ? 'bg-blue-500' : 'bg-gray-300'}
            `}
          >
            <span
              className={`
                absolute top-1 w-4 h-4 bg-white rounded-full transition-transform
                ${settings.grouping ? (direction === 'ltr' ? 'translate-x-7' : '-translate-x-7') : 'translate-x-1'}
              `}
            />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {t('settings.grouping.description')}
        </p>
      </div>
    </div>
  );

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            style={{ zIndex: zIndex.modal }}
          />

          {/* Panel */}
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 bottom-0 w-full max-w-md shadow-2xl"
            style={{
              [direction === 'ltr' ? 'right' : 'left']: 0,
              zIndex: zIndex.modal + 1,
              ...glassmorphism.panel,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {t('notification.title')}
                  </h2>
                  {unreadCount > 0 && (
                    <p className="text-sm text-gray-500">
                      {unreadCount} {t('notification.unread')}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Quiet Hours Indicator */}
                {isQuietHoursActive && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                    <Moon className="w-4 h-4" />
                    <span className="text-xs font-medium">{t('notification.quietHours')}</span>
                  </div>
                )}

                {/* Settings Button */}
                <button
                  onClick={handleToggleSettings}
                  className={`
                    p-2 rounded-lg transition-colors
                    ${showSettings ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}
                  `}
                >
                  <Settings className="w-5 h-5" />
                </button>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(100vh - 180px)' }}>
              {showSettings ? (
                // Settings View
                renderSettings()
              ) : (
                // Notifications View
                <>
                  {/* Action Buttons */}
                  {notifications.length > 0 && (
                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={markAllAsRead}
                        className="flex-1 px-4 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors text-sm font-medium"
                      >
                        {t('notification.markAllRead')}
                      </button>
                      <button
                        onClick={clearAll}
                        className="flex-1 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        {t('notification.clearAll')}
                      </button>
                    </div>
                  )}

                  {/* Notifications List */}
                  {notifications.length === 0 ? (
                    <div className="text-center py-12">
                      <BellOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">{t('notification.empty')}</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Today */}
                      {groupedNotifications.today.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                            {t('notification.today')}
                          </h3>
                          <AnimatePresence>
                            {groupedNotifications.today.map(renderNotificationItem)}
                          </AnimatePresence>
                        </div>
                      )}

                      {/* Yesterday */}
                      {groupedNotifications.yesterday.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                            {t('notification.yesterday')}
                          </h3>
                          <AnimatePresence>
                            {groupedNotifications.yesterday.map(renderNotificationItem)}
                          </AnimatePresence>
                        </div>
                      )}

                      {/* Older */}
                      {groupedNotifications.older.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                            {t('notification.older')}
                          </h3>
                          <AnimatePresence>
                            {groupedNotifications.older.map(renderNotificationItem)}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}