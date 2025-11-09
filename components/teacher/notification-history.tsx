'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  History,
  Bell,
  Eye,
  Trash2,
  Clock,
  Filter,
  Download,
  RefreshCw
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
import type { NotificationHistory } from '@/lib/services/notification-service'

// ============================================================================
// Types
// ============================================================================

interface NotificationHistoryProps {
  isOpen: boolean
  onClose: () => void
  history?: NotificationHistory[]
  onRefresh?: () => void
  onClear?: () => void
  isLoading?: boolean
}

// ============================================================================
// Action Configuration
// ============================================================================

const actionConfig = {
  created: {
    label: 'Created',
    icon: <Bell className="h-3.5 w-3.5" />,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
  },
  read: {
    label: 'Read',
    icon: <Eye className="h-3.5 w-3.5" />,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
  },
  deleted: {
    label: 'Deleted',
    icon: <Trash2 className="h-3.5 w-3.5" />,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
  }
}

// ============================================================================
// History Item Component
// ============================================================================

interface HistoryItemProps {
  item: NotificationHistory
}

function HistoryItem({ item }: HistoryItemProps) {
  const config = actionConfig[item.action]

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="group relative rounded-xl border-0 bg-white shadow-sm hover:shadow-md transition-all duration-300 p-4"
    >
      <div className="flex items-start gap-3">
        {/* Action Badge */}
        <div className={cn(
          'flex-shrink-0 p-2 rounded-lg shadow-sm border-0',
          config.bgColor,
          config.color
        )}>
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">
              {item.notification.title}
            </h4>
            <Badge className={cn(
              'border-0 shadow-sm text-xs',
              config.bgColor,
              config.color
            )}>
              {config.label}
            </Badge>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 mb-2">
            {item.notification.message}
          </p>

          {/* Timestamp */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="h-3 w-3" />
            <span>{getTimeAgo(item.timestamp)}</span>
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
        <History className="h-12 w-12 text-orange-600" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        No history yet
      </h3>
      <p className="text-sm text-slate-600 max-w-xs">
        Your notification activity will appear here
      </p>
    </motion.div>
  )
}

// ============================================================================
// Main Notification History Component
// ============================================================================

export function NotificationHistory({
  isOpen,
  onClose,
  history = [],
  onRefresh = () => {},
  onClear = () => {},
  isLoading = false
}: NotificationHistoryProps) {
  const [filter, setFilter] = React.useState<'all' | 'created' | 'read' | 'deleted'>('all')

  const filteredHistory = filter === 'all'
    ? history
    : history.filter(item => item.action === filter)

  const stats = {
    total: history.length,
    created: history.filter(h => h.action === 'created').length,
    read: history.filter(h => h.action === 'read').length,
    deleted: history.filter(h => h.action === 'deleted').length
  }

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
                <History className="h-5 w-5 text-white" />
              </div>
              <div>
                <SheetTitle className="text-xl font-bold text-slate-900">
                  Notification History
                </SheetTitle>
                <SheetDescription className="text-sm text-slate-600">
                  {stats.total} total activities
                </SheetDescription>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <Card className="rounded-xl shadow-sm border-0 bg-blue-50">
              <CardContent className="p-3 text-center">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
                  Created
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {stats.created}
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-xl shadow-sm border-0 bg-green-50">
              <CardContent className="p-3 text-center">
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">
                  Read
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {stats.read}
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-xl shadow-sm border-0 bg-red-50">
              <CardContent className="p-3 text-center">
                <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1">
                  Deleted
                </p>
                <p className="text-2xl font-bold text-red-900">
                  {stats.deleted}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 mt-4">
            {(['all', 'created', 'read', 'deleted'] as const).map((f) => (
              <Button
                key={f}
                variant="outline"
                size="sm"
                onClick={() => setFilter(f)}
                className={cn(
                  'flex-1 rounded-xl border-0 shadow-sm capitalize',
                  filter === f
                    ? 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                    : 'bg-white hover:bg-slate-50'
                )}
              >
                {f}
              </Button>
            ))}
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
            {history.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClear}
                className="bg-red-50 text-red-700 hover:bg-red-100 border-0 shadow-sm rounded-xl"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </SheetHeader>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((item) => (
                <HistoryItem key={item.id} item={item} />
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
