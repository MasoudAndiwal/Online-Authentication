'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Bell, Plus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { NotificationCenter, NotificationTrigger } from './notification-center'
import { NotificationSettings } from './notification-settings'
import { NotificationHistory } from './notification-history'
import { NotificationDigest } from './notification-digest'
import { WebSocketStatus, useWebSocketStatus } from './websocket-status'
import { 
  useNotifications
} from '@/lib/hooks/use-notifications'
import { notificationService } from '@/lib/services/notification-service'
import { cn } from '@/lib/utils'

/**
 * Demo component for the Notification Center
 * 
 * This component demonstrates:
 * - Notification panel with slide-out design
 * - Notification trigger button with unread count
 * - Notification settings panel
 * - Real-time notification updates
 * - Mark as read functionality
 * - Delete functionality
 */
export function NotificationCenterDemo() {
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false)
  const [isDigestOpen, setIsDigestOpen] = React.useState(false)
  const [digestFrequency, setDigestFrequency] = React.useState<'daily' | 'weekly'>('daily')

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification
  } = useNotifications()
  
  // Stub implementations for demo
  const preferences = {
    studentRiskAlerts: true,
    systemUpdates: true,
    scheduleChanges: true,
    inAppNotifications: true,
    emailNotifications: false,
    enableDigest: true,
    digestFrequency: 'daily' as const,
    digestTime: '08:00',
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '07:00'
    },
    notifyOnMahroom: true,
    notifyOnTasdiq: true,
    notifyOnAbsenceCount: true,
    absenceCountThreshold: 3
  }
  const updatePreferences = () => {}
  const refresh = () => {}

  // Stub implementations for demo purposes
  const history: never[] = []
  const historyLoading = false
  const refreshHistory = () => {}
  const clearHistory = () => {}

  const digest = null
  const digestLoading = false
  const refreshDigest = () => {}

  const { status: wsStatus } = useWebSocketStatus()

  // Demo: Add test notification
  const handleAddTestNotification = async () => {
    const types = ['student_risk', 'system_update', 'schedule_change'] as const
    const randomType = types[Math.floor(Math.random() * types.length)]
    
    const messages = {
      student_risk: {
        title: 'Student at Risk',
        message: 'A student in your class is approaching the absence threshold.',
        metadata: {
          studentName: 'Test Student',
          className: 'CS-101',
          riskType: 'محروم' as const
        }
      },
      system_update: {
        title: 'System Update',
        message: 'A new feature has been added to the attendance system.',
        metadata: undefined
      },
      schedule_change: {
        title: 'Schedule Change',
        message: 'Your class schedule has been updated for next week.',
        metadata: {
          className: 'CS-201'
        }
      }
    }

    const messageData = messages[randomType]
    await notificationService.createNotification(
      randomType,
      messageData.title,
      messageData.message,
      messageData.metadata
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 via-orange-500/5 to-orange-400/10" />
          <div className="absolute top-4 right-8 w-20 h-20 bg-orange-400/20 rounded-full blur-xl animate-pulse" />
          
          <div className="relative p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl shadow-xl shadow-orange-500/25">
                  <Bell className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                    Notification Center Demo
                  </h1>
                  <p className="text-lg text-slate-600 font-medium mt-2">
                    Interactive demonstration of the notification system
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* WebSocket Status */}
                <WebSocketStatus status={wsStatus} />
                
                {/* Notification Trigger */}
                <NotificationTrigger
                  unreadCount={unreadCount}
                  onClick={() => setIsNotificationOpen(true)}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Demo Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="rounded-2xl shadow-lg border-0 bg-white backdrop-blur-xl">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Demo Controls
              </h2>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleAddTestNotification}
                  className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-lg shadow-orange-500/25 rounded-xl border-0"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Test Notification
                </Button>
                <Button
                  onClick={refresh}
                  disabled={isLoading}
                  variant="outline"
                  className="bg-white hover:bg-slate-50 border-0 shadow-sm rounded-xl"
                >
                  <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                  Refresh
                </Button>
                <Button
                  onClick={() => setIsNotificationOpen(true)}
                  variant="outline"
                  className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-0 shadow-sm rounded-xl"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Open Notifications ({unreadCount})
                </Button>
                <Button
                  onClick={() => setIsHistoryOpen(true)}
                  variant="outline"
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-0 shadow-sm rounded-xl"
                >
                  View History
                </Button>
                <Button
                  onClick={() => setIsDigestOpen(true)}
                  variant="outline"
                  className="bg-green-50 text-green-700 hover:bg-green-100 border-0 shadow-sm rounded-xl"
                >
                  View Digest
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Feature Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100/50">
            <CardContent className="p-6">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg shadow-orange-500/25 w-fit mb-4">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Slide-out Panel
              </h3>
              <p className="text-sm text-slate-600">
                Glass morphism design with backdrop blur and smooth animations
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardContent className="p-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/25 w-fit mb-4">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Type-specific Colors
              </h3>
              <p className="text-sm text-slate-600">
                Different notification types with appropriate colors and icons
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100/50">
            <CardContent className="p-6">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg shadow-green-500/25 w-fit mb-4">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Mark as Read
              </h3>
              <p className="text-sm text-slate-600">
                Fade animations and visual feedback for read/unread status
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="rounded-2xl shadow-lg border-0 bg-white backdrop-blur-xl">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Notification Statistics
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl">
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-1">
                    Total
                  </p>
                  <p className="text-3xl font-bold text-slate-900">
                    {notifications.length}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl">
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-1">
                    Unread
                  </p>
                  <p className="text-3xl font-bold text-slate-900">
                    {unreadCount}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl">
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-1">
                    Read
                  </p>
                  <p className="text-3xl font-bold text-slate-900">
                    {notifications.length - unreadCount}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl">
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-1">
                    Today
                  </p>
                  <p className="text-3xl font-bold text-slate-900">
                    {notifications.filter(n => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      return n.timestamp >= today
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDelete={deleteNotification}
        onOpenSettings={() => {
          setIsNotificationOpen(false)
          setIsSettingsOpen(true)
        }}
      />

      {/* Notification Settings */}
      {preferences && (
        <NotificationSettings
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          preferences={preferences}
          onSave={updatePreferences}
        />
      )}

      {/* Notification History */}
      <NotificationHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onRefresh={refreshHistory}
        onClear={clearHistory}
        isLoading={historyLoading}
      />

      {/* Notification Digest */}
      <NotificationDigest
        isOpen={isDigestOpen}
        onClose={() => setIsDigestOpen(false)}
        digest={digest}
        frequency={digestFrequency}
        onFrequencyChange={setDigestFrequency}
        onRefresh={refreshDigest}
        onExport={() => {
          // Export functionality
          console.log('Exporting digest...')
        }}
        isLoading={digestLoading}
      />
    </div>
  )
}
