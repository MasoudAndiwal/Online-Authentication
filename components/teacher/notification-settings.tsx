'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Bell,
  Mail,
  MessageSquare,
  AlertTriangle,
  Calendar,
  Info,
  Clock,
  Save,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'

// ============================================================================
// Types
// ============================================================================

export interface NotificationPreferences {
  // Notification Types
  studentRiskAlerts: boolean
  systemUpdates: boolean
  scheduleChanges: boolean
  
  // Delivery Methods
  inAppNotifications: boolean
  emailNotifications: boolean
  
  // Digest Settings
  enableDigest: boolean
  digestFrequency: 'daily' | 'weekly' | 'never'
  digestTime: string // HH:MM format
  
  // Advanced Settings
  quietHours: {
    enabled: boolean
    startTime: string // HH:MM format
    endTime: string // HH:MM format
  }
  
  // Risk Thresholds
  notifyOnMahroom: boolean // محروم threshold
  notifyOnTasdiq: boolean // تصدیق طلب threshold
  notifyOnAbsenceCount: boolean
  absenceCountThreshold: number
}

interface NotificationSettingsProps {
  isOpen: boolean
  onClose: () => void
  preferences?: NotificationPreferences
  onSave?: (preferences: NotificationPreferences) => void
}

// ============================================================================
// Default Preferences
// ============================================================================

const defaultPreferences: NotificationPreferences = {
  studentRiskAlerts: true,
  systemUpdates: true,
  scheduleChanges: true,
  inAppNotifications: true,
  emailNotifications: false,
  enableDigest: true,
  digestFrequency: 'daily',
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

// ============================================================================
// Setting Section Component
// ============================================================================

interface SettingSectionProps {
  title: string
  description: string
  icon: React.ReactNode
  children: React.ReactNode
}

function SettingSection({ title, description, icon, children }: SettingSectionProps) {
  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-white backdrop-blur-xl">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-2.5 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl shadow-sm">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              {title}
            </h3>
            <p className="text-sm text-slate-600">
              {description}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {children}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Setting Item Component
// ============================================================================

interface SettingItemProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  badge?: string
}

function SettingItem({ label, description, checked, onChange, badge }: SettingItemProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <label className="text-sm font-medium text-slate-900 cursor-pointer">
            {label}
          </label>
          {badge && (
            <Badge className="bg-orange-50 text-orange-700 border-0 shadow-sm text-xs">
              {badge}
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-xs text-slate-600">
            {description}
          </p>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
      />
    </div>
  )
}

// ============================================================================
// Main Notification Settings Component
// ============================================================================

export function NotificationSettings({
  isOpen,
  onClose,
  preferences: initialPreferences = defaultPreferences,
  onSave = () => {}
}: NotificationSettingsProps) {
  const [preferences, setPreferences] = React.useState<NotificationPreferences>(initialPreferences)
  const [hasChanges, setHasChanges] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)

  // Update preferences when prop changes
  React.useEffect(() => {
    setPreferences(initialPreferences)
    setHasChanges(false)
  }, [initialPreferences])

  const updatePreference = <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const updateQuietHours = <K extends keyof NotificationPreferences['quietHours']>(
    key: K,
    value: NotificationPreferences['quietHours'][K]
  ) => {
    setPreferences(prev => ({
      ...prev,
      quietHours: { ...prev.quietHours, [key]: value }
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(preferences)
      setHasChanges(false)
      // Show success feedback
      setTimeout(() => {
        setIsSaving(false)
      }, 1000)
    } catch (error) {
      console.error('Failed to save preferences:', error)
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setPreferences(initialPreferences)
    setHasChanges(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-lg p-0 border-0 bg-gradient-to-br from-slate-50 to-white overflow-y-auto"
      >
        {/* Header */}
        <SheetHeader className="sticky top-0 z-10 p-6 pb-4 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg shadow-orange-500/25">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <SheetTitle className="text-xl font-bold text-slate-900">
                Notification Settings
              </SheetTitle>
              <SheetDescription className="text-sm text-slate-600">
                Customize how you receive notifications
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Settings Content */}
        <div className="p-6 space-y-6">
          {/* Notification Types */}
          <SettingSection
            title="Notification Types"
            description="Choose which types of notifications you want to receive"
            icon={<Bell className="h-5 w-5 text-orange-600" />}
          >
            <SettingItem
              label="Student Risk Alerts"
              description="Get notified when students are at risk of محروم or تصدیق طلب"
              checked={preferences.studentRiskAlerts}
              onChange={(checked) => updatePreference('studentRiskAlerts', checked)}
              badge="Important"
            />
            <SettingItem
              label="System Updates"
              description="Receive notifications about system maintenance and new features"
              checked={preferences.systemUpdates}
              onChange={(checked) => updatePreference('systemUpdates', checked)}
            />
            <SettingItem
              label="Schedule Changes"
              description="Get alerts when your class schedule is modified"
              checked={preferences.scheduleChanges}
              onChange={(checked) => updatePreference('scheduleChanges', checked)}
            />
          </SettingSection>

          {/* Delivery Methods */}
          <SettingSection
            title="Delivery Methods"
            description="Choose how you want to receive notifications"
            icon={<MessageSquare className="h-5 w-5 text-orange-600" />}
          >
            <SettingItem
              label="In-App Notifications"
              description="Show notifications in the application"
              checked={preferences.inAppNotifications}
              onChange={(checked) => updatePreference('inAppNotifications', checked)}
            />
            <SettingItem
              label="Email Notifications"
              description="Send notifications to your email address"
              checked={preferences.emailNotifications}
              onChange={(checked) => updatePreference('emailNotifications', checked)}
            />
          </SettingSection>

          {/* Digest Settings */}
          <SettingSection
            title="Digest Summary"
            description="Receive periodic summaries of your notifications"
            icon={<Mail className="h-5 w-5 text-orange-600" />}
          >
            <SettingItem
              label="Enable Digest"
              description="Receive a summary of notifications at scheduled times"
              checked={preferences.enableDigest}
              onChange={(checked) => updatePreference('enableDigest', checked)}
            />
            
            {preferences.enableDigest && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pl-4 space-y-3 border-l-2 border-orange-200"
              >
                <div>
                  <label className="text-sm font-medium text-slate-900 mb-2 block">
                    Frequency
                  </label>
                  <div className="flex gap-2">
                    {(['daily', 'weekly', 'never'] as const).map((freq) => (
                      <Button
                        key={freq}
                        variant="outline"
                        size="sm"
                        onClick={() => updatePreference('digestFrequency', freq)}
                        className={cn(
                          'flex-1 rounded-xl border-0 shadow-sm',
                          preferences.digestFrequency === freq
                            ? 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                            : 'bg-white hover:bg-slate-50'
                        )}
                      >
                        {freq.charAt(0).toUpperCase() + freq.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {preferences.digestFrequency !== 'never' && (
                  <div>
                    <label className="text-sm font-medium text-slate-900 mb-2 block">
                      Delivery Time
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                      <Clock className="h-4 w-4 text-slate-600" />
                      <input
                        type="time"
                        value={preferences.digestTime}
                        onChange={(e) => updatePreference('digestTime', e.target.value)}
                        className="flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </SettingSection>

          {/* Risk Thresholds */}
          <SettingSection
            title="Risk Thresholds"
            description="Configure when to receive alerts about student attendance"
            icon={<AlertTriangle className="h-5 w-5 text-orange-600" />}
          >
            <SettingItem
              label="محروم Status Alert"
              description="Notify when a student reaches محروم threshold"
              checked={preferences.notifyOnMahroom}
              onChange={(checked) => updatePreference('notifyOnMahroom', checked)}
              badge="Critical"
            />
            <SettingItem
              label="تصدیق طلب Status Alert"
              description="Notify when a student reaches تصدیق طلب threshold"
              checked={preferences.notifyOnTasdiq}
              onChange={(checked) => updatePreference('notifyOnTasdiq', checked)}
            />
            <SettingItem
              label="Absence Count Alert"
              description="Notify after a specific number of consecutive absences"
              checked={preferences.notifyOnAbsenceCount}
              onChange={(checked) => updatePreference('notifyOnAbsenceCount', checked)}
            />
            
            {preferences.notifyOnAbsenceCount && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pl-4 border-l-2 border-orange-200"
              >
                <label className="text-sm font-medium text-slate-900 mb-2 block">
                  Absence Threshold
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={preferences.absenceCountThreshold}
                    onChange={(e) => updatePreference('absenceCountThreshold', parseInt(e.target.value))}
                    className="flex-1 accent-orange-600"
                  />
                  <Badge className="bg-orange-50 text-orange-700 border-0 shadow-sm min-w-[3rem] justify-center">
                    {preferences.absenceCountThreshold}
                  </Badge>
                </div>
              </motion.div>
            )}
          </SettingSection>

          {/* Quiet Hours */}
          <SettingSection
            title="Quiet Hours"
            description="Pause notifications during specific hours"
            icon={<Clock className="h-5 w-5 text-orange-600" />}
          >
            <SettingItem
              label="Enable Quiet Hours"
              description="Don't send notifications during these hours"
              checked={preferences.quietHours.enabled}
              onChange={(checked) => updateQuietHours('enabled', checked)}
            />
            
            {preferences.quietHours.enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pl-4 space-y-3 border-l-2 border-orange-200"
              >
                <div>
                  <label className="text-sm font-medium text-slate-900 mb-2 block">
                    Start Time
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                    <Clock className="h-4 w-4 text-slate-600" />
                    <input
                      type="time"
                      value={preferences.quietHours.startTime}
                      onChange={(e) => updateQuietHours('startTime', e.target.value)}
                      className="flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-900 mb-2 block">
                    End Time
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                    <Clock className="h-4 w-4 text-slate-600" />
                    <input
                      type="time"
                      value={preferences.quietHours.endTime}
                      onChange={(e) => updateQuietHours('endTime', e.target.value)}
                      className="flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </SettingSection>
        </div>

        {/* Footer Actions */}
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky bottom-0 p-6 pt-4 border-t border-slate-200/50 bg-white/80 backdrop-blur-xl"
          >
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isSaving}
                className="flex-1 bg-white hover:bg-slate-50 border-0 shadow-sm rounded-xl"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-lg shadow-orange-500/25 rounded-xl border-0"
              >
                {isSaving ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Save className="h-4 w-4 mr-2" />
                    </motion.div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </SheetContent>
    </Sheet>
  )
}
