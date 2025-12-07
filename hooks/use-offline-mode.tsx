/**
 * Offline Mode Management Hook
 * Handles feature disabling and UI state during offline mode
 * 
 * Requirements: 6.2, 6.3, 6.5
 */

'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useOfflineStatus } from '@/hooks/use-client-cache'

// ============================================================================
// Types
// ============================================================================

export interface OfflineModeConfig {
  disableUploads?: boolean
  disableExports?: boolean
  disablePreferenceChanges?: boolean
  disableMessaging?: boolean
  disableNotificationSettings?: boolean
  showOfflineIndicators?: boolean
  enableOfflineToasts?: boolean
}

export interface OfflineModeState {
  isOnline: boolean
  isOfflineModeActive: boolean
  disabledFeatures: Set<string>
  canUpload: boolean
  canExport: boolean
  canModifyPreferences: boolean
  canSendMessages: boolean
  canModifyNotifications: boolean
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: Required<OfflineModeConfig> = {
  disableUploads: true,
  disableExports: true,
  disablePreferenceChanges: true,
  disableMessaging: true,
  disableNotificationSettings: true,
  showOfflineIndicators: true,
  enableOfflineToasts: true
}

// ============================================================================
// Offline Mode Hook
// ============================================================================

export function useOfflineMode(config: OfflineModeConfig = {}) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }
  const offlineStatus = useOfflineStatus()
  const [hasShownOfflineToast, setHasShownOfflineToast] = useState(false)
  const [hasShownOnlineToast, setHasShownOnlineToast] = useState(false)

  // Calculate disabled features
  const disabledFeatures = new Set<string>()
  if (!offlineStatus.isOnline) {
    if (mergedConfig.disableUploads) disabledFeatures.add('uploads')
    if (mergedConfig.disableExports) disabledFeatures.add('exports')
    if (mergedConfig.disablePreferenceChanges) disabledFeatures.add('preferences')
    if (mergedConfig.disableMessaging) disabledFeatures.add('messaging')
    if (mergedConfig.disableNotificationSettings) disabledFeatures.add('notifications')
  }

  // Create offline mode state
  const offlineModeState: OfflineModeState = {
    isOnline: offlineStatus.isOnline,
    isOfflineModeActive: !offlineStatus.isOnline,
    disabledFeatures,
    canUpload: offlineStatus.isOnline || !mergedConfig.disableUploads,
    canExport: offlineStatus.isOnline || !mergedConfig.disableExports,
    canModifyPreferences: offlineStatus.isOnline || !mergedConfig.disablePreferenceChanges,
    canSendMessages: offlineStatus.isOnline || !mergedConfig.disableMessaging,
    canModifyNotifications: offlineStatus.isOnline || !mergedConfig.disableNotificationSettings
  }

  // Show toast notifications for offline/online transitions
  useEffect(() => {
    if (!mergedConfig.enableOfflineToasts) return

    if (!offlineStatus.isOnline && !hasShownOfflineToast) {
      // Offline mode activated
      setHasShownOfflineToast(true)
      setHasShownOnlineToast(false)
    } else if (offlineStatus.isOnline && offlineStatus.wasOffline && !hasShownOnlineToast) {
      // Connection restored
      setHasShownOnlineToast(true)
      setHasShownOfflineToast(false)
    }
  }, [
    offlineStatus.isOnline, 
    offlineStatus.wasOffline, 
    hasShownOfflineToast, 
    hasShownOnlineToast,
    mergedConfig.enableOfflineToasts
  ])

  // Helper functions
  const isFeatureDisabled = useCallback((feature: string): boolean => {
    return disabledFeatures.has(feature)
  }, [disabledFeatures])

  const getDisabledMessage = useCallback((feature: string): string => {
    if (!isFeatureDisabled(feature)) return ''
    
    const messages: Record<string, string> = {
      uploads: 'File uploads are not available while offline',
      exports: 'Data exports are not available while offline',
      preferences: 'Preference changes are not available while offline',
      messaging: 'Messaging is not available while offline',
      notifications: 'Notification settings cannot be changed while offline'
    }
    
    return messages[feature] || 'This feature is not available while offline'
  }, [isFeatureDisabled])

  const checkFeatureAvailability = useCallback((feature: string): {
    available: boolean
    message?: string
  } => {
    const available = !isFeatureDisabled(feature)
    return {
      available,
      message: available ? undefined : getDisabledMessage(feature)
    }
  }, [isFeatureDisabled, getDisabledMessage])

  return {
    ...offlineModeState,
    offlineStatus,
    config: mergedConfig,
    isFeatureDisabled,
    getDisabledMessage,
    checkFeatureAvailability
  }
}

// ============================================================================
// Feature-Specific Hooks
// ============================================================================

/**
 * Hook for file upload availability
 */
export function useUploadAvailability() {
  const { canUpload, getDisabledMessage, checkFeatureAvailability } = useOfflineMode()
  
  return {
    canUpload,
    uploadDisabledMessage: getDisabledMessage('uploads'),
    checkUploadAvailability: () => checkFeatureAvailability('uploads')
  }
}

/**
 * Hook for export availability
 */
export function useExportAvailability() {
  const { canExport, getDisabledMessage, checkFeatureAvailability } = useOfflineMode()
  
  return {
    canExport,
    exportDisabledMessage: getDisabledMessage('exports'),
    checkExportAvailability: () => checkFeatureAvailability('exports')
  }
}

/**
 * Hook for messaging availability
 */
export function useMessagingAvailability() {
  const { canSendMessages, getDisabledMessage, checkFeatureAvailability } = useOfflineMode()
  
  return {
    canSendMessages,
    messagingDisabledMessage: getDisabledMessage('messaging'),
    checkMessagingAvailability: () => checkFeatureAvailability('messaging')
  }
}

/**
 * Hook for preferences modification availability
 */
export function usePreferencesAvailability() {
  const { canModifyPreferences, getDisabledMessage, checkFeatureAvailability } = useOfflineMode()
  
  return {
    canModifyPreferences,
    preferencesDisabledMessage: getDisabledMessage('preferences'),
    checkPreferencesAvailability: () => checkFeatureAvailability('preferences')
  }
}

// ============================================================================
// Offline-Aware Component Wrapper Hook
// ============================================================================

export interface OfflineAwareOptions {
  feature?: string
  fallbackContent?: React.ReactNode
  showDisabledOverlay?: boolean
  disableInteractions?: boolean
}

/**
 * Hook for making components offline-aware
 */
export function useOfflineAware(options: OfflineAwareOptions = {}) {
  const {
    feature,
    fallbackContent,
    showDisabledOverlay = true,
    disableInteractions = true
  } = options

  const offlineMode = useOfflineMode()
  
  const isDisabled = feature ? offlineMode.isFeatureDisabled(feature) : !offlineMode.isOnline
  const disabledMessage = feature ? offlineMode.getDisabledMessage(feature) : 'Not available offline'

  return {
    isDisabled,
    disabledMessage,
    showDisabledOverlay: showDisabledOverlay && isDisabled,
    disableInteractions: disableInteractions && isDisabled,
    fallbackContent: isDisabled ? fallbackContent : null,
    offlineMode
  }
}

// ============================================================================
// Offline Mode Provider Context (Optional)
// ============================================================================

import { createContext, useContext } from 'react'

const OfflineModeContext = createContext<ReturnType<typeof useOfflineMode> | null>(null)

export interface OfflineModeProviderProps {
  children: React.ReactNode
  config?: OfflineModeConfig
}

export function OfflineModeProvider({ children, config }: OfflineModeProviderProps) {
  const offlineMode = useOfflineMode(config)
  
  return (
    <OfflineModeContext.Provider value={offlineMode}>
      {children}
    </OfflineModeContext.Provider>
  )
}

export function useOfflineModeContext() {
  const context = useContext(OfflineModeContext)
  if (!context) {
    throw new Error('useOfflineModeContext must be used within OfflineModeProvider')
  }
  return context
}