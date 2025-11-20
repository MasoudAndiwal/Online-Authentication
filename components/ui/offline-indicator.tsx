/**
 * Offline Indicator Component
 * Shows when the user is offline or connection is poor
 * 
 * Requirements: 6.2, 6.3, 6.5
 */

'use client'

import React from 'react'
import { AlertTriangle, Wifi, WifiOff, Clock, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useOfflineStatus } from '@/hooks/use-client-cache'

// ============================================================================
// Offline Banner Component
// ============================================================================

export interface OfflineBannerProps {
  className?: string
  showWhenOnline?: boolean
  onRetry?: () => void
}

export function OfflineBanner({ 
  className, 
  showWhenOnline = false,
  onRetry 
}: OfflineBannerProps) {
  const offlineStatus = useOfflineStatus()

  // Don't show if online and showWhenOnline is false
  if (offlineStatus.isOnline && !showWhenOnline) {
    return null
  }

  // Don't show indicator if we shouldn't
  if (!offlineStatus.showOfflineIndicator && offlineStatus.isOnline) {
    return null
  }

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  return (
    <Alert 
      className={cn(
        "border-l-4 transition-all duration-300",
        offlineStatus.isOnline 
          ? "border-l-green-500 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200" 
          : "border-l-orange-500 bg-orange-50 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {offlineStatus.isOnline ? (
            <Wifi className="h-4 w-4" />
          ) : (
            <WifiOff className="h-4 w-4" />
          )}
          
          <AlertDescription className="mb-0">
            {offlineStatus.isOnline ? (
              <span>
                Connection restored
                {offlineStatus.wasOffline && offlineStatus.timeSinceOnline && (
                  <span className="ml-1 text-sm opacity-75">
                    (was offline for {formatDuration(offlineStatus.timeSinceOnline)})
                  </span>
                )}
              </span>
            ) : (
              <span>
                You're currently offline
                {offlineStatus.offlineDuration && (
                  <span className="ml-1 text-sm opacity-75">
                    for {formatDuration(offlineStatus.offlineDuration)}
                  </span>
                )}
              </span>
            )}
          </AlertDescription>
        </div>

        {!offlineStatus.isOnline && onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="ml-4"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
    </Alert>
  )
}

// ============================================================================
// Offline Status Badge Component
// ============================================================================

export interface OfflineStatusBadgeProps {
  className?: string
  showWhenOnline?: boolean
}

export function OfflineStatusBadge({ 
  className, 
  showWhenOnline = false 
}: OfflineStatusBadgeProps) {
  const offlineStatus = useOfflineStatus()

  // Don't show if online and showWhenOnline is false
  if (offlineStatus.isOnline && !showWhenOnline) {
    return null
  }

  return (
    <Badge
      variant={offlineStatus.isOnline ? "default" : "destructive"}
      className={cn(
        "flex items-center gap-1 text-xs",
        offlineStatus.isOnline && "bg-green-100 text-green-800 hover:bg-green-200",
        className
      )}
    >
      {offlineStatus.isOnline ? (
        <Wifi className="h-3 w-3" />
      ) : (
        <WifiOff className="h-3 w-3" />
      )}
      {offlineStatus.isOnline ? "Online" : "Offline"}
    </Badge>
  )
}

// ============================================================================
// Staleness Warning Component
// ============================================================================

export interface StalenessWarningProps {
  lastUpdated?: number | null
  staleThreshold?: number
  className?: string
  onRefresh?: () => void
  isRefreshing?: boolean
}

export function StalenessWarning({
  lastUpdated,
  staleThreshold = 24 * 60 * 60 * 1000, // 24 hours
  className,
  onRefresh,
  isRefreshing = false
}: StalenessWarningProps) {
  if (!lastUpdated) {
    return null
  }

  const age = Date.now() - lastUpdated
  const isStale = age > staleThreshold

  if (!isStale) {
    return null
  }

  const formatAge = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else {
      const minutes = Math.floor(ms / (1000 * 60))
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    }
  }

  return (
    <Alert 
      className={cn(
        "border-l-4 border-l-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
        className
      )}
    >
      <AlertTriangle className="h-4 w-4" />
      <div className="flex items-center justify-between">
        <AlertDescription className="mb-0">
          <span className="font-medium">Data may be outdated</span>
          <span className="ml-1 text-sm opacity-75">
            Last updated {formatAge(age)}
          </span>
        </AlertDescription>

        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="ml-4"
          >
            <RefreshCw className={cn("h-3 w-3 mr-1", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        )}
      </div>
    </Alert>
  )
}

// ============================================================================
// Data Freshness Indicator Component
// ============================================================================

export interface DataFreshnessIndicatorProps {
  lastUpdated?: number | null
  className?: string
  showAge?: boolean
}

export function DataFreshnessIndicator({
  lastUpdated,
  className,
  showAge = true
}: DataFreshnessIndicatorProps) {
  if (!lastUpdated) {
    return null
  }

  const age = Date.now() - lastUpdated
  const minutes = Math.floor(age / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  const getColor = () => {
    if (minutes < 5) return "text-green-600 dark:text-green-400"
    if (minutes < 30) return "text-blue-600 dark:text-blue-400"
    if (hours < 2) return "text-yellow-600 dark:text-yellow-400"
    if (hours < 24) return "text-orange-600 dark:text-orange-400"
    return "text-red-600 dark:text-red-400"
  }

  const getIcon = () => {
    if (minutes < 5) return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
    if (minutes < 30) return <div className="w-2 h-2 bg-blue-500 rounded-full" />
    if (hours < 2) return <div className="w-2 h-2 bg-yellow-500 rounded-full" />
    if (hours < 24) return <div className="w-2 h-2 bg-orange-500 rounded-full" />
    return <Clock className="w-3 h-3 text-red-500" />
  }

  const getAgeText = () => {
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className={cn("flex items-center gap-1 text-xs", getColor(), className)}>
      {getIcon()}
      {showAge && <span>{getAgeText()}</span>}
    </div>
  )
}

// ============================================================================
// Offline Mode Overlay Component
// ============================================================================

export interface OfflineModeOverlayProps {
  children: React.ReactNode
  className?: string
  disableInteractions?: boolean
}

export function OfflineModeOverlay({
  children,
  className,
  disableInteractions = true
}: OfflineModeOverlayProps) {
  const offlineStatus = useOfflineStatus()

  if (offlineStatus.isOnline) {
    return <>{children}</>
  }

  return (
    <div className={cn("relative", className)}>
      {children}
      {disableInteractions && (
        <div className="absolute inset-0 bg-gray-100/50 dark:bg-gray-900/50 backdrop-blur-[1px] flex items-center justify-center z-10">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border max-w-sm mx-4">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <WifiOff className="h-5 w-5" />
              <div>
                <p className="font-medium">Offline Mode</p>
                <p className="text-sm">This feature is disabled while offline</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Combined Offline Status Component
// ============================================================================

export interface OfflineStatusProps {
  lastUpdated?: number | null
  onRefresh?: () => void
  isRefreshing?: boolean
  className?: string
  showStalenessWarning?: boolean
  staleThreshold?: number
}

export function OfflineStatus({
  lastUpdated,
  onRefresh,
  isRefreshing = false,
  className,
  showStalenessWarning = true,
  staleThreshold = 24 * 60 * 60 * 1000
}: OfflineStatusProps) {
  const offlineStatus = useOfflineStatus()

  return (
    <div className={cn("space-y-2", className)}>
      <OfflineBanner onRetry={onRefresh} />
      
      {showStalenessWarning && (
        <StalenessWarning
          lastUpdated={lastUpdated}
          staleThreshold={staleThreshold}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />
      )}
    </div>
  )
}