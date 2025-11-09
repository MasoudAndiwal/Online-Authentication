'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, Wifi, Cloud, CloudOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useOnlineStatus, useSyncQueue, AttendanceSyncQueue } from '@/lib/utils/offline-support'
import { cn } from '@/lib/utils'

/**
 * Offline Indicator Banner
 * Shows at the top of the page when offline
 */
export function OfflineIndicator() {
  const isOnline = useOnlineStatus()
  const [showBanner, setShowBanner] = React.useState(false)
  const [wasOffline, setWasOffline] = React.useState(false)

  React.useEffect(() => {
    if (!isOnline) {
      setShowBanner(true)
      setWasOffline(true)
    } else if (wasOffline) {
      // Show "back online" message briefly
      const timer = setTimeout(() => {
        setShowBanner(false)
        setWasOffline(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, wasOffline])

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-50"
        >
          <div
            className={cn(
              'px-6 py-3 shadow-lg backdrop-blur-xl',
              isOnline
                ? 'bg-gradient-to-r from-green-500 to-green-600'
                : 'bg-gradient-to-r from-orange-500 to-orange-600'
            )}
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isOnline ? (
                  <Wifi className="w-5 h-5 text-white" />
                ) : (
                  <WifiOff className="w-5 h-5 text-white animate-pulse" />
                )}
                <div>
                  <p className="text-white font-semibold">
                    {isOnline ? 'Back Online' : 'You are offline'}
                  </p>
                  <p className="text-white/90 text-sm">
                    {isOnline
                      ? 'Your connection has been restored'
                      : 'Some features may be limited. Changes will sync when you reconnect.'}
                  </p>
                </div>
              </div>
              {isOnline && (
                <Button
                  onClick={() => setShowBanner(false)}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 border-0"
                >
                  Dismiss
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Compact Offline Badge
 * Shows in the corner when offline
 */
export function OfflineBadge() {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full shadow-lg backdrop-blur-xl flex items-center gap-2">
        <WifiOff className="w-4 h-4 animate-pulse" />
        <span className="text-sm font-medium">Offline</span>
      </div>
    </motion.div>
  )
}

/**
 * Sync Queue Status
 * Shows pending sync items
 */
interface SyncQueueStatusProps {
  queue: AttendanceSyncQueue
  className?: string
}

export function SyncQueueStatus({ queue, className }: SyncQueueStatusProps) {
  const { queueItems, queueSize, isSyncing, processQueue } = useSyncQueue(queue)
  const isOnline = useOnlineStatus()

  if (queueSize === 0) return null

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className={cn('fixed bottom-6 left-6 z-40', className)}
    >
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200 p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
            {isSyncing ? (
              <RefreshCw className="w-5 h-5 text-orange-600 animate-spin" />
            ) : (
              <CloudOff className="w-5 h-5 text-orange-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-900 mb-1">
              {isSyncing ? 'Syncing...' : 'Pending Changes'}
            </h4>
            <p className="text-xs text-slate-600 mb-3">
              {queueSize} {queueSize === 1 ? 'change' : 'changes'} waiting to sync
            </p>
            {isOnline && !isSyncing && (
              <Button
                onClick={processQueue}
                size="sm"
                className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-0 shadow-sm h-8 text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Sync Now
              </Button>
            )}
            {!isOnline && (
              <p className="text-xs text-orange-600 font-medium">
                Will sync when back online
              </p>
            )}
          </div>
        </div>

        {/* Queue items preview */}
        {queueItems.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <p className="text-xs text-slate-500 mb-2">Recent changes:</p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {queueItems.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="text-xs text-slate-600 flex items-center gap-2"
                >
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0" />
                  <span className="truncate">{item.type}</span>
                </div>
              ))}
              {queueItems.length > 3 && (
                <p className="text-xs text-slate-500 italic">
                  +{queueItems.length - 3} more
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

/**
 * Network Status Icon
 * Small icon showing connection status
 */
export function NetworkStatusIcon({ className }: { className?: string }) {
  const isOnline = useOnlineStatus()

  return (
    <motion.div
      animate={{
        scale: isOnline ? 1 : [1, 1.1, 1],
        opacity: isOnline ? 1 : [1, 0.7, 1]
      }}
      transition={{
        duration: 2,
        repeat: isOnline ? 0 : Infinity
      }}
      className={cn('flex items-center gap-2', className)}
    >
      {isOnline ? (
        <Wifi className="w-4 h-4 text-green-600" />
      ) : (
        <WifiOff className="w-4 h-4 text-orange-600" />
      )}
      <span className={cn(
        'text-xs font-medium',
        isOnline ? 'text-green-600' : 'text-orange-600'
      )}>
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </motion.div>
  )
}

/**
 * Offline Mode Provider
 * Wraps the app to provide offline functionality
 */
interface OfflineModeProviderProps {
  children: React.ReactNode
  showIndicator?: boolean
  showBadge?: boolean
  syncQueue?: AttendanceSyncQueue
}

export function OfflineModeProvider({
  children,
  showIndicator = true,
  showBadge = false,
  syncQueue
}: OfflineModeProviderProps) {
  return (
    <>
      {children}
      {showIndicator && <OfflineIndicator />}
      {showBadge && <OfflineBadge />}
      {syncQueue && <SyncQueueStatus queue={syncQueue} />}
    </>
  )
}
