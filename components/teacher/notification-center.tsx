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
  Settings
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

export type NotificationType = 'student_risk' | 'system_update' | 'schedule_change'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  actionUrl?: string
  metadata?: {
    studentName?: string
    className?: string
    riskType?: 'محروم' | 'تصدیق طلب'
    [key: string]: unknown
  }
}

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
  notifications?: Notification[]
  onMarkAsRead?: (notificationId: string) => void
  onMarkAllAsRead?: () => void
  onDelete?: (notificationId: string) => void
  onOpenSettings?: () => void
}

// ============================================================================
// Notification Type Configuration
// ============================================================================

const notificationConfig: Record<NotificationType, {
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
}> = {
  student_risk: {
    icon: <AlertTriangle className="h-5 w-5" />,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  system_update: {
    icon: <Info className="h-5 w-5" />,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  schedule_change: {
    icon: <Calendar className="h-5 w-5" />,
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  }
}

// ============================================================================
// Notification Item Component
// ============================================================================

interface NotificationItemProps {
  notification: Notification
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
        'hover:shadow-md',
        notification.isRead 
          ? 'bg-white/60 backdrop-blur-sm' 
          : 'bg-white backdrop-blur-xl'
      )}
    >
      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-orange-600 rounded-r-full" />
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
                    size="icon-sm"
                    onClick={() => onMarkAsRead(notification.id)}
                    className="h-7 w-7 rounded-lg hover:bg-orange-50 text-orange-600"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleDelete}
                  className="h-7 w-7 rounded-lg hover:bg-red-50 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
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
                {notification.metadata.studentName && (
                  <Badge className="bg-orange-50 text-orange-700 border-0 shadow-sm">
                    {notification.metadata.studentName}
                  </Badge>
                )}
                {notification.metadata.className && (
                  <Badge className="bg-blue-50 text-blue-700 border-0 shadow-sm">
                    {notification.metadata.className}
                  </Badge>
                )}
                {notification.metadata.riskType && (
                  <Badge className="bg-red-50 text-red-700 border-0 shadow-sm">
                    {notification.metadata.riskType}
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
      <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-3xl shadow-lg mb-6">
        <Bell className="h-12 w-12 text-orange-600" />
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
// Main Notification Center Component
// ============================================================================

export function NotificationCenter({
  isOpen,
  onClose,
  notifications = [],
  onMarkAsRead = () => {},
  onMarkAllAsRead = () => {},
  onDelete = () => {},
  onOpenSettings = () => {}
}: NotificationCenterProps) {
  const unreadCount = notifications.filter(n => !n.isRead).length
  const hasNotifications = notifications.length > 0

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-md p-0 border-0 bg-gradient-to-br from-slate-50 to-white"
      >
        {/* Header */}
        <SheetHeader className="p-6 pb-4 border-b border-slate-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg shadow-orange-500/25">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div>
                <SheetTitle className="text-xl font-bold text-slate-900">
                  Notifications
                </SheetTitle>
                <SheetDescription className="text-sm text-slate-600">
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
                  className="flex-1 bg-orange-50 text-orange-700 hover:bg-orange-100 border-0 shadow-sm rounded-xl"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenSettings}
                className="bg-white hover:bg-slate-50 border-0 shadow-sm rounded-xl"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          )}
        </SheetHeader>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
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
// Notification Trigger Button Component
// ============================================================================

interface NotificationTriggerProps {
  unreadCount: number
  onClick: () => void
  className?: string
}

export function NotificationTrigger({ 
  unreadCount, 
  onClick,
  className 
}: NotificationTriggerProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      className={cn(
        'relative bg-white hover:bg-orange-50 border-0 shadow-sm rounded-xl',
        'transition-all duration-300',
        unreadCount > 0 && 'ring-2 ring-orange-500/20',
        className
      )}
    >
      <Bell className="h-5 w-5 text-slate-700" />
      {unreadCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full shadow-lg"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </motion.div>
      )}
    </Button>
  )
}
