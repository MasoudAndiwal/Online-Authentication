'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Bell, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  StudentNotificationCenter,
  StudentNotificationTrigger,
  StudentNotificationSettings
} from '@/components/student'
import { useStudentNotifications, useCreateStudentNotification } from '@/hooks/use-student-notifications'

export default function StudentNotificationsDemoPage() {
  const {
    notifications,
    preferences,
    isLoading,
    unreadCount,
    isNotificationCenterOpen,
    isSettingsOpen,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    openNotificationCenter,
    closeNotificationCenter,
    openSettings,
    closeSettings,
  } = useStudentNotifications()

  const {
    createAttendanceNotification,
    createWarningNotification,
    createMahroomAlert,
    createTasdiqAlert,
    createScheduleChangeNotification,
    createMessageNotification,
  } = useCreateStudentNotification()

  const handleCreateAttendance = async () => {
    await createAttendanceNotification(
      Math.floor(Math.random() * 5) + 1,
      ['present', 'absent', 'sick', 'leave'][Math.floor(Math.random() * 4)] as any,
      'Dr. Ahmed Hassan'
    )
  }

  const handleCreateWarning = async () => {
    await createWarningNotification(3, 12)
  }

  const handleCreateMahroom = async () => {
    await createMahroomAlert()
  }

  const handleCreateTasdiq = async () => {
    await createTasdiqAlert()
  }

  const handleCreateSchedule = async () => {
    await createScheduleChangeNotification(
      'CS-101',
      'Class moved from Monday 10:00 AM to Tuesday 2:00 PM'
    )
  }

  const handleCreateMessage = async () => {
    await createMessageNotification(
      'Dr. Ahmed Hassan',
      'Please see me during office hours regarding your recent absence.'
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                Student Notification System Demo
              </h1>
              <p className="text-sm sm:text-base text-slate-600">
                Test and preview the notification system with green theme
              </p>
            </div>

            <StudentNotificationTrigger
              unreadCount={unreadCount}
              onClick={openNotificationCenter}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Notifications Card */}
          <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/25">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900">
                    Create Test Notifications
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600">
                    Generate different types of notifications
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleCreateAttendance}
                className="w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-0 shadow-sm min-h-[44px] justify-start"
              >
                <Bell className="h-4 w-4 mr-2" />
                Attendance Marked
              </Button>

              <Button
                onClick={handleCreateWarning}
                className="w-full bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-0 shadow-sm min-h-[44px] justify-start"
              >
                <Bell className="h-4 w-4 mr-2" />
                Warning Threshold
              </Button>

              <Button
                onClick={handleCreateMahroom}
                className="w-full bg-red-50 text-red-700 hover:bg-red-100 border-0 shadow-sm min-h-[44px] justify-start"
              >
                <Bell className="h-4 w-4 mr-2" />
                محروم Alert
              </Button>

              <Button
                onClick={handleCreateTasdiq}
                className="w-full bg-orange-50 text-orange-700 hover:bg-orange-100 border-0 shadow-sm min-h-[44px] justify-start"
              >
                <Bell className="h-4 w-4 mr-2" />
                تصدیق طلب Alert
              </Button>

              <Button
                onClick={handleCreateSchedule}
                className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 border-0 shadow-sm min-h-[44px] justify-start"
              >
                <Bell className="h-4 w-4 mr-2" />
                Schedule Change
              </Button>

              <Button
                onClick={handleCreateMessage}
                className="w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-0 shadow-sm min-h-[44px] justify-start"
              >
                <Bell className="h-4 w-4 mr-2" />
                Message Received
              </Button>
            </CardContent>
          </Card>

          {/* Statistics Card */}
          <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/25">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900">
                    Notification Statistics
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600">
                    Current notification status
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl">
                  <p className="text-sm text-slate-600 mb-1">Total</p>
                  <p className="text-2xl font-bold text-emerald-700">{notifications.length}</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl">
                  <p className="text-sm text-slate-600 mb-1">Unread</p>
                  <p className="text-2xl font-bold text-emerald-700">{unreadCount}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={openNotificationCenter}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white border-0 shadow-lg shadow-emerald-500/25 min-h-[44px]"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Open Notification Center
                </Button>

                <Button
                  onClick={openSettings}
                  variant="outline"
                  className="w-full border-0 shadow-sm min-h-[44px]"
                >
                  Settings
                </Button>

                {unreadCount > 0 && (
                  <Button
                    onClick={markAllAsRead}
                    variant="outline"
                    className="w-full border-0 shadow-sm min-h-[44px]"
                  >
                    Mark All as Read
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preferences Card */}
          {preferences && (
            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-2xl lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900">
                  Current Preferences
                </CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  Your notification settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <PreferenceItem
                    label="Attendance Marked"
                    enabled={preferences.attendanceMarked}
                  />
                  <PreferenceItem
                    label="Warning Thresholds"
                    enabled={preferences.warningThresholds}
                  />
                  <PreferenceItem
                    label="Critical Alerts"
                    enabled={preferences.criticalAlerts}
                  />
                  <PreferenceItem
                    label="Schedule Changes"
                    enabled={preferences.scheduleChanges}
                  />
                  <PreferenceItem
                    label="Message Received"
                    enabled={preferences.messageReceived}
                  />
                  <PreferenceItem
                    label="Email Notifications"
                    enabled={preferences.emailNotifications}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Notification Center */}
        <StudentNotificationCenter
          isOpen={isNotificationCenterOpen}
          onClose={closeNotificationCenter}
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDelete={deleteNotification}
          onOpenSettings={openSettings}
        />

        {/* Settings Dialog */}
        {preferences && (
          <StudentNotificationSettings
            isOpen={isSettingsOpen}
            onClose={closeSettings}
            preferences={preferences}
            onSave={updatePreferences}
          />
        )}
      </div>
    </div>
  )
}

// Helper component for preference display
function PreferenceItem({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
      <span className="text-sm text-slate-700">{label}</span>
      <span
        className={`text-xs font-semibold px-2 py-1 rounded-full ${
          enabled
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-slate-200 text-slate-600'
        }`}
      >
        {enabled ? 'ON' : 'OFF'}
      </span>
    </div>
  )
}
