'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Bell,
  Mail,
  Moon,
  Clock,
  UserCheck,
  AlertTriangle,
  Calendar,
  MessageSquare,
  Save,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { StudentNotificationPreferences } from '@/lib/services/student-notification-service'

// ============================================================================
// Types
// ============================================================================

interface StudentNotificationSettingsProps {
  isOpen: boolean
  onClose: () => void
  preferences?: StudentNotificationPreferences
  onSave?: (preferences: StudentNotificationPreferences) => void
}

// ============================================================================
// Default Preferences
// ============================================================================

const defaultPreferences: StudentNotificationPreferences = {
  attendanceMarked: true,
  warningThresholds: true,
  criticalAlerts: true,
  scheduleChanges: true,
  messageReceived: true,
  inAppNotifications: true,
  emailNotifications: false,
  quietHours: {
    enabled: false,
    startTime: '22:00',
    endTime: '07:00'
  }
}

// ============================================================================
// Time Options
// ============================================================================

const timeOptions = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
]

// ============================================================================
// Main Student Notification Settings Component
// ============================================================================

export function StudentNotificationSettings({
  isOpen,
  onClose,
  preferences: initialPreferences = defaultPreferences,
  onSave = () => {}
}: StudentNotificationSettingsProps) {
  const [preferences, setPreferences] = React.useState<StudentNotificationPreferences>(initialPreferences)
  const [isSaving, setIsSaving] = React.useState(false)
  const [hasChanges, setHasChanges] = React.useState(false)

  // Update preferences when initial preferences change
  React.useEffect(() => {
    setPreferences(initialPreferences)
    setHasChanges(false)
  }, [initialPreferences])

  const handleToggle = (key: keyof StudentNotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
    setHasChanges(true)
  }

  const handleQuietHoursToggle = () => {
    setPreferences(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        enabled: !prev.quietHours.enabled
      }
    }))
    setHasChanges(true)
  }

  const handleQuietHoursTimeChange = (type: 'startTime' | 'endTime', value: string) => {
    setPreferences(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [type]: value
      }
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      await onSave(preferences)
      setHasChanges(false)
      
      // Close dialog after a short delay
      setTimeout(() => {
        onClose()
      }, 500)
    } catch (error) {
      console.error('Failed to save notification preferences:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (hasChanges) {
      // Reset to initial preferences
      setPreferences(initialPreferences)
      setHasChanges(false)
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-white border-0 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/25">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                Notification Settings
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600">
                Customize how and when you receive notifications
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Notification Types Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
              Notification Types
            </h3>

            {/* Attendance Marked */}
            <SettingItem
              icon={<UserCheck className="h-5 w-5" />}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              title="Attendance Marked"
              description="Get notified when your attendance is marked"
              checked={preferences.attendanceMarked}
              onToggle={() => handleToggle('attendanceMarked')}
            />

            {/* Warning Thresholds */}
            <SettingItem
              icon={<AlertTriangle className="h-5 w-5" />}
              iconBg="bg-yellow-50"
              iconColor="text-yellow-600"
              title="Warning Thresholds"
              description="Receive alerts when approaching absence limits (75% of max)"
              checked={preferences.warningThresholds}
              onToggle={() => handleToggle('warningThresholds')}
            />

            {/* Critical Alerts */}
            <SettingItem
              icon={<AlertTriangle className="h-5 w-5" />}
              iconBg="bg-red-50"
              iconColor="text-red-600"
              title="Critical Alerts"
              description="Important alerts for محروم or تصدیق طلب status"
              checked={preferences.criticalAlerts}
              onToggle={() => handleToggle('criticalAlerts')}
              disabled={true}
              disabledMessage="Critical alerts cannot be disabled"
            />

            {/* Schedule Changes */}
            <SettingItem
              icon={<Calendar className="h-5 w-5" />}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              title="Schedule Changes"
              description="Get notified about class schedule updates"
              checked={preferences.scheduleChanges}
              onToggle={() => handleToggle('scheduleChanges')}
            />

            {/* Message Received */}
            <SettingItem
              icon={<MessageSquare className="h-5 w-5" />}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              title="Message Received"
              description="Notifications when you receive new messages"
              checked={preferences.messageReceived}
              onToggle={() => handleToggle('messageReceived')}
            />
          </div>

          {/* Delivery Methods Section */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
              Delivery Methods
            </h3>

            {/* In-App Notifications */}
            <SettingItem
              icon={<Bell className="h-5 w-5" />}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              title="In-App Notifications"
              description="Show notifications within the application"
              checked={preferences.inAppNotifications}
              onToggle={() => handleToggle('inAppNotifications')}
            />

            {/* Email Notifications */}
            <SettingItem
              icon={<Mail className="h-5 w-5" />}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              title="Email Notifications"
              description="Receive notifications via email"
              checked={preferences.emailNotifications}
              onToggle={() => handleToggle('emailNotifications')}
            />
          </div>

          {/* Quiet Hours Section */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
              Quiet Hours
            </h3>

            <SettingItem
              icon={<Moon className="h-5 w-5" />}
              iconBg="bg-indigo-50"
              iconColor="text-indigo-600"
              title="Enable Quiet Hours"
              description="Pause non-critical notifications during specified hours"
              checked={preferences.quietHours.enabled}
              onToggle={handleQuietHoursToggle}
            />

            {/* Quiet Hours Time Selection */}
            {preferences.quietHours.enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="ml-14 space-y-3 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="start-time" className="text-sm font-medium text-slate-700 mb-2 block">
                      Start Time
                    </Label>
                    <Select
                      value={preferences.quietHours.startTime}
                      onValueChange={(value) => handleQuietHoursTimeChange('startTime', value)}
                    >
                      <SelectTrigger id="start-time" className="bg-white border-0 shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1">
                    <Label htmlFor="end-time" className="text-sm font-medium text-slate-700 mb-2 block">
                      End Time
                    </Label>
                    <Select
                      value={preferences.quietHours.endTime}
                      onValueChange={(value) => handleQuietHoursTimeChange('endTime', value)}
                    >
                      <SelectTrigger id="end-time" className="bg-white border-0 shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <p className="text-xs text-slate-600 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Critical alerts will still be delivered during quiet hours
                </p>
              </motion.div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="border-0 shadow-sm min-h-[44px] touch-manipulation"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white border-0 shadow-lg shadow-emerald-500/25 min-h-[44px] touch-manipulation"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// Setting Item Component
// ============================================================================

interface SettingItemProps {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  title: string
  description: string
  checked: boolean
  onToggle: () => void
  disabled?: boolean
  disabledMessage?: string
}

function SettingItem({
  icon,
  iconBg,
  iconColor,
  title,
  description,
  checked,
  onToggle,
  disabled = false,
  disabledMessage
}: SettingItemProps) {
  return (
    <div className={cn(
      'flex items-start gap-4 p-4 rounded-xl transition-all duration-300',
      'bg-white/60 backdrop-blur-sm border-0 shadow-sm',
      !disabled && 'hover:shadow-md hover:bg-white'
    )}>
      <div className={cn(
        'flex-shrink-0 p-2.5 rounded-xl shadow-sm',
        iconBg,
        iconColor
      )}>
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-1">
              {title}
            </h4>
            <p className="text-sm text-slate-600">
              {description}
            </p>
            {disabled && disabledMessage && (
              <p className="text-xs text-slate-500 mt-1 italic">
                {disabledMessage}
              </p>
            )}
          </div>

          <Switch
            checked={checked}
            onCheckedChange={onToggle}
            disabled={disabled}
            className={cn(
              'data-[state=checked]:bg-emerald-600',
              'min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0',
              'touch-manipulation'
            )}
            aria-label={`Toggle ${title}`}
          />
        </div>
      </div>
    </div>
  )
}
