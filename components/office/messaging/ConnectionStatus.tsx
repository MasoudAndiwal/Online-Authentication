/**
 * ConnectionStatus Component
 * 
 * Displays connection status warning when offline or reconnecting.
 * Shows loading indicators during operations.
 * 
 * Requirements: 6.5, 19.1, 19.5
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, RefreshCw, AlertCircle } from 'lucide-react';
import { useRealTimeUpdates } from '@/hooks/office/messaging';

// ============================================================================
// Component Props
// ============================================================================

interface ConnectionStatusProps {
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const { isConnected, isReconnecting, reconnect, connectionError } = useRealTimeUpdates();

  // Don't show anything if connected and no errors
  if (isConnected && !connectionError && !isReconnecting) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 ${className}`}
      >
        {/* Reconnecting state */}
        {isReconnecting && (
          <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg shadow-lg">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <RefreshCw className="w-5 h-5 text-amber-600" />
            </motion.div>
            <div>
              <p className="text-sm font-medium text-amber-900">Reconnecting...</p>
              <p className="text-xs text-amber-700">Attempting to restore connection</p>
            </div>
          </div>
        )}

        {/* Offline state */}
        {!isConnected && !isReconnecting && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg shadow-lg">
            <WifiOff className="w-5 h-5 text-red-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">Connection Lost</p>
              <p className="text-xs text-red-700">
                {connectionError || 'Unable to connect to the server'}
              </p>
            </div>
            <button
              onClick={reconnect}
              className="px-3 py-1.5 text-sm font-medium text-red-700 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Connection error with active connection */}
        {isConnected && connectionError && (
          <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg shadow-lg">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">Connection Issue</p>
              <p className="text-xs text-amber-700">{connectionError}</p>
            </div>
            <button
              onClick={reconnect}
              className="px-3 py-1.5 text-sm font-medium text-amber-700 hover:text-amber-800 hover:bg-amber-100 rounded transition-colors"
            >
              Reconnect
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Inline Connection Indicator
 * 
 * Small indicator that can be placed in headers or toolbars
 */
export const ConnectionIndicator: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isConnected, isReconnecting } = useRealTimeUpdates();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isReconnecting ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <RefreshCw className="w-4 h-4 text-amber-500" />
          </motion.div>
          <span className="text-xs text-amber-600">Reconnecting...</span>
        </>
      ) : isConnected ? (
        <>
          <Wifi className="w-4 h-4 text-green-500" />
          <span className="text-xs text-green-600">Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-red-500" />
          <span className="text-xs text-red-600">Offline</span>
        </>
      )}
    </div>
  );
};
