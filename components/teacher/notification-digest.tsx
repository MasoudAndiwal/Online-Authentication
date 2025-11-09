'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Mail,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  Calendar,
  Clock,
  Download,
  RefreshCw,
  BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import type { DigestSummary, NotificationType } from '@/lib/services/notification-service'

// ============================================================================
// Types
// ============================================================================

interface NotificationDigestProps {
  isOpen: boolean
  onClose: () => void
  digest?: DigestSummary | null
  frequency: 'daily' | 'weekly'
  onFrequencyChange?: (frequency: 'daily' | 'weekly') => void
  onRefresh?: () => void
  onExport?: () => void
  isLoading?: boolean
}

// ============================================================================
// Notification Type Configuration
// ============================================================================

const typeConfig: Record<NotificationType, {
  label: string
  icon: React.ReactNode
  color: string
  bgColor: string
}> = {
  student_risk: {
    label: 'Student Risk',
    icon: <AlertTriangle className="h-4 w-4" />,
    color: 'text-red-700',
    bgColor: 'bg-red-50'
  },
  system_update: {
    label: 'System Updates',
    icon: <Info className="h-4 w-4" />,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50'
  },
  schedule_change: {
    label: 'Schedule Changes',
    icon: <Calendar className="h-4 w-4" />,
    color: 'text-orange-700',
    bgColor: 'bg-orange-50'
  }
}

// ============================================================================
// Trend Indicator Component
// ============================================================================

interface TrendIndicatorProps {
  value: number
}

function TrendIndicator({ value }: TrendIndicatorProps) {
  const isPositive = value > 0
  const isNeutral = value === 0

  return (
    <div className={cn(
      'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold',
      isNeutral && 'bg-slate-100 text-slate-700',
      isPositive && 'bg-green-100 text-green-700',
      !isPositive && !isNeutral && 'bg-red-100 text-red-700'
    )}>
      {isNeutral ? (
        <span>No change</span>
      ) : (
        <>
          {isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          <span>{Math.abs(value).toFixed(1)}%</span>
        </>
      )}
    </div>
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
        <Mail className="h-12 w-12 text-orange-600" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        No digest data
      </h3>
      <p className="text-sm text-slate-600 max-w-xs">
        Digest summary will appear here once notifications are available
      </p>
    </motion.div>
  )
}

// ============================================================================
// Main Notification Digest Component
// ============================================================================

export function NotificationDigest({
  isOpen,
  onClose,
  digest,
  frequency,
  onFrequencyChange = () => {},
  onRefresh = () => {},
  onExport = () => {},
  isLoading = false
}: NotificationDigestProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-lg p-0 border-0 bg-gradient-to-br from-slate-50 to-white overflow-y-auto"
      >
        {/* Header */}
        <SheetHeader className="sticky top-0 z-10 p-6 pb-4 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg shadow-orange-500/25">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <SheetTitle className="text-xl font-bold text-slate-900">
                  Notification Digest
                </SheetTitle>
                <SheetDescription className="text-sm text-slate-600">
                  {frequency === 'daily' ? 'Daily' : 'Weekly'} summary
                </SheetDescription>
              </div>
            </div>
          </div>

          {/* Frequency Toggle */}
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFrequencyChange('daily')}
              className={cn(
                'flex-1 rounded-xl border-0 shadow-sm',
                frequency === 'daily'
                  ? 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                  : 'bg-white hover:bg-slate-50'
              )}
            >
              Daily
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFrequencyChange('weekly')}
              className={cn(
                'flex-1 rounded-xl border-0 shadow-sm',
                frequency === 'weekly'
                  ? 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                  : 'bg-white hover:bg-slate-50'
              )}
            >
              Weekly
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="flex-1 bg-white hover:bg-slate-50 border-0 shadow-sm rounded-xl"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
              Refresh
            </Button>
            {digest && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-0 shadow-sm rounded-xl"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </SheetHeader>

        {/* Digest Content */}
        <div className="p-6 space-y-6">
          {digest ? (
            <>
              {/* Period Info */}
              <Card className="rounded-2xl shadow-sm border-0 bg-white backdrop-blur-xl">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                    <Clock className="h-4 w-4" />
                    <span>
                      {formatDate(digest.period.start)} - {formatDate(digest.period.end)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                        Total Notifications
                      </p>
                      <p className="text-3xl font-bold text-slate-900">
                        {digest.totalNotifications}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                        Unread
                      </p>
                      <p className="text-3xl font-bold text-orange-600">
                        {digest.unreadCount}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trends */}
              <Card className="rounded-2xl shadow-sm border-0 bg-gradient-to-br from-orange-50 to-orange-100/50">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Trend Analysis
                    </h3>
                    <BarChart3 className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">
                        Compared to previous period
                      </span>
                      <TrendIndicator value={digest.trends.comparedToPrevious} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">
                        Most active type
                      </span>
                      <Badge className={cn(
                        'border-0 shadow-sm',
                        typeConfig[digest.trends.mostActiveType].bgColor,
                        typeConfig[digest.trends.mostActiveType].color
                      )}>
                        {typeConfig[digest.trends.mostActiveType].label}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* By Type */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  Notifications by Type
                </h3>
                {(Object.entries(digest.byType) as [NotificationType, number][]).map(([type, count]) => {
                  const config = typeConfig[type]
                  const percentage = digest.totalNotifications > 0
                    ? (count / digest.totalNotifications) * 100
                    : 0

                  return (
                    <Card key={type} className="rounded-xl shadow-sm border-0 bg-white">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              'p-2 rounded-lg shadow-sm border-0',
                              config.bgColor,
                              config.color
                            )}>
                              {config.icon}
                            </div>
                            <span className="text-sm font-medium text-slate-900">
                              {config.label}
                            </span>
                          </div>
                          <span className="text-lg font-bold text-slate-900">
                            {count}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className={cn(
                              'h-full rounded-full',
                              type === 'student_risk' && 'bg-red-500',
                              type === 'system_update' && 'bg-blue-500',
                              type === 'schedule_change' && 'bg-orange-500'
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Recent Notifications */}
              {digest.recentNotifications.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Recent Notifications
                  </h3>
                  {digest.recentNotifications.slice(0, 5).map((notification) => {
                    const config = typeConfig[notification.type]
                    return (
                      <Card key={notification.id} className="rounded-xl shadow-sm border-0 bg-white">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              'flex-shrink-0 p-2 rounded-lg shadow-sm border-0',
                              config.bgColor,
                              config.color
                            )}>
                              {config.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-slate-900 line-clamp-1 mb-1">
                                {notification.title}
                              </h4>
                              <p className="text-xs text-slate-600 line-clamp-2">
                                {notification.message}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
