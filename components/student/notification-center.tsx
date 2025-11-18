'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  X,
  AlertTriangle,
  Info,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  Settings,
  MessageSquare,
  UserCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'

// ============================================================================
// Types
// ============================================================================

export type StudentNotificationType = 
  | 'attendance_marked' 
  | 'warning_threshold' 
  | 'critical_alert' 
  | 'schedule_change' 
  | 'message_received'

export interface StudentNotification {
  id: string
  type: StudentNotificationType
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  actionUrl?: string
  metadata?: {
    sessionNumber?: number
    status?: 'present' | 'absent' | 'sick' | 'leave'
    remainingAbsences?: number
    alertType?: 'محروم' | 'تصدیق طلب' | 'warning'
    senderName?: string
    [key: string]: unknown
  }
}

interface StudentNotificationCenterProps {
  isOpen: boolean
  onClose: () => void
  notifications?: StudentNotification[]
  onMarkAsRead?: (notificationId: string) => void
  onMarkAllAsRead?: () => void
  onDelete?: (notificationId: string) => void
  onOpenSettings?: () => void
}

// ============================================================================
// Notification Type Configuration (Green Theme for Students)
// ============================================================================

const notificationConfig: Record<StudentNotificationType, {
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
}> = {
  attendance_marked: {
    icon: <UserCheck className="h-5 w-5" />,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  warning_threshold: {
    icon: <AlertTriangle className="h-5 w-5" />,
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  critical_alert: {
    icon: <AlertTriangle className="h-5 w-5" />,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  schedule_change: {
    icon: <Calendar className="h-5 w-5" />,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  message_received: {
    icon: <MessageSquare className="h-5 w-5" />,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  }
}

// ============================================================================
// Notification Item Component
// ============================================================================

interface NotificationItemProps {
  notification: StudentNotification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const config = notificationConfig[notification.type]
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDelete = () => {
    setIsDeleting(true)
    setTimeout(() => {
      onDelete(notification.id)
    }, 300)
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <motion.div
      initial={{ opacity: 1, x: 0 }}
      animate={{ 
        opacity: isDeleting ? 0 : 1,
        x: isDeleting ? 100 : 0
      }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'group relative rounded-2xl border-0 shadow-sm transition-all duration-300',
        'hover:shadow-md min-h-[44px]',
        notification.isRead 
          ? 'bg-white/60 backdrop-blur-sm' 
          : 'bg-white backdrop-blur-xl'
      )}
    >
      {/* Unread indicator - Green theme */}
      {!notification.isRead && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-emerald-600 rounded-r-full" />
      )}

      <div className="p-4 pl-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={cn(
            'flex-shrink-0 p-2.5 rounded-xl shadow-sm border-0',
            config.bgColor,
            config.color
          )}>
            {config.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className={cn(
                'text-sm font-semibold text-slate-900 line-clamp-1',
                !notification.isRead && 'font-bold'
              )}>
                {notification.title}
              </h4>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onMarkAsRead(notification.id)}
                    className="h-9 w-9 min-h-[44px] min-w-[44px] sm:h-7 sm:w-7 sm:min-h-0 sm:min-w-0 rounded-lg hover:bg-emerald-50 text-emerald-600 touch-manipulation"
                    aria-label="Mark as read"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  className="h-9 w-9 min-h-[44px] min-w-[44px] sm:h-7 sm:w-7 sm:min-h-0 sm:min-w-0 rounded-lg hover:bg-red-50 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity touch-manipulation"
                  aria-label="Delete notification"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="text-sm text-slate-600 line-clamp-2 mb-2">
              {notification.message}
            </p>

            {/* Metadata */}
            {notification.metadata && (
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {notification.metadata.status && (
                  <Badge className={cn(
                    'border-0 shadow-sm',
                    notification.metadata.status === 'present' && 'bg-green-50 text-green-700',
                    notification.metadata.status === 'absent' && 'bg-red-50 text-red-700',
                    notification.metadata.status === 'sick' && 'bg-yellow-50 text-yellow-700',
                    notification.metadata.status === 'leave' && 'bg-blue-50 text-blue-700'
                  )}>
                    {notification.metadata.status.charAt(0).toUpperCase() + notification.metadata.status.slice(1)}
                  </Badge>
                )}
                {notification.metadata.sessionNumber && (
                  <Badge className="bg-emerald-50 text-emerald-700 border-0 shadow-sm">
                    Session {notification.metadata.sessionNumber}
                  </Badge>
                )}
                {notification.metadata.alertType && (
                  <Badge className="bg-red-50 text-red-700 border-0 shadow-sm">
                    {notification.metadata.alertType}
                  </Badge>
                )}
                {notification.metadata.senderName && (
                  <Badge className="bg-blue-50 text-blue-700 border-0 shadow-sm">
                    {notification.metadata.senderName}
                  </Badge>
                )}
              </div>
            )}

            {/* Timestamp */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              <span>{getTimeAgo(notification.timestamp)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================================
// Empty State Component
// ============================================================================

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-3xl shadow-lg mb-6">
        <Bell className="h-12 w-12 text-emerald-600" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        No notifications
      </h3>
      <p className="text-sm text-slate-600 max-w-xs">
        You're all caught up! We'll notify you when there's something new.
      </p>
    </motion.div>
  )
}

// ============================================================================
// Main Student Notification Center Component
// ============================================================================

export function StudentNotificationCenter({
  isOpen,
  onClose,
  notifications = [],
  onMarkAsRead = () => {},
  onMarkAllAsRead = () => {},
  onDelete = () => {},
  onOpenSettings = () => {}
}: StudentNotificationCenterProps) {
  const unreadCount = notifications.filter(n => !n.isRead).length
  const hasNotifications = notifications.length > 0

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className={cn(
          'p-0 border-0 bg-gradient-to-br from-slate-50 to-white',
          // Responsive widths
          'w-full',           // Mobile: Full screen
          'sm:max-w-md',      // Tablet: Medium width
          'lg:max-w-lg'       // Desktop: Standard width
        )}
      >
        {/* Header */}
        <SheetHeader className="p-4 sm:p-6 pb-4 border-b border-slate-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/25">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div>
                <SheetTitle className="text-lg sm:text-xl font-bold text-slate-900">
                  Notifications
                </SheetTitle>
                <SheetDescription className="text-xs sm:text-sm text-slate-600">
                  {unreadCount > 0 
                    ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                    : 'All caught up'
                  }
                </SheetDescription>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {hasNotifications && (
            <div className="flex items-center gap-2 mt-4">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onMarkAllAsRead}
                  className="flex-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-0 shadow-sm rounded-xl min-h-[44px] touch-manipulation"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenSettings}
                className="bg-white hover:bg-slate-50 border-0 shadow-sm rounded-xl min-h-[44px] min-w-[44px] touch-manipulation"
                aria-label="Notification settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          )}
        </SheetHeader>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          <AnimatePresence mode="popLayout">
            {hasNotifications ? (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                  onDelete={onDelete}
                />
              ))
            ) : (
              <EmptyState />
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ============================================================================
// Notification Trigger Button Component (Green Theme)
// ============================================================================

interface StudentNotificationTriggerProps {
  unreadCount: number
  onClick: () => void
  className?: string
}

export function StudentNotificationTrigger({ 
  unreadCount, 
  onClick,
  className 
}: StudentNotificationTriggerProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      className={cn(
        'relative bg-white hover:bg-emerald-50 border-0 shadow-sm rounded-xl',
        'transition-all duration-300 min-h-[44px] min-w-[44px] touch-manipulation',
        unreadCount > 0 && 'ring-2 ring-emerald-500/20',
        className
      )}
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
    >
      <Bell className="h-5 w-5 text-slate-700" />
      {unreadCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-xs font-bold rounded-full shadow-lg"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </motion.div>
      )}
    </Button>
  )
}
