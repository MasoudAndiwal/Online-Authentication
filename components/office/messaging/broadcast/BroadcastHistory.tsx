/**
 * BroadcastHistory Component
 * 
 * Displays a list of past broadcast messages with delivery statistics,
 * recipient details, and retry options for failed deliveries.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { officeMessagingService } from '@/lib/services/office/messaging/messaging-service';
import type { BroadcastMessage } from '@/types/office/messaging';
import { formatDistanceToNow } from 'date-fns';

// ============================================================================
// Types
// ============================================================================

interface BroadcastHistoryProps {
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function BroadcastHistory({ className = '' }: BroadcastHistoryProps) {
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ============================================================================
  // Load broadcast history
  // ============================================================================

  const loadBroadcasts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const history = await officeMessagingService.getBroadcastHistory();
      setBroadcasts(history);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load broadcast history';
      setError(errorMessage);
      console.error('Error loading broadcasts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBroadcasts();
  }, [loadBroadcasts]);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  const handleRetry = useCallback(async (broadcastId: string) => {
    try {
      await officeMessagingService.retryFailedBroadcast(broadcastId);
      // Reload broadcasts to get updated stats
      await loadBroadcasts();
    } catch (err) {
      console.error('Failed to retry broadcast:', err);
    }
  }, [loadBroadcasts]);

  // ============================================================================
  // Render helpers
  // ============================================================================

  const getCriteriaDescription = (broadcast: BroadcastMessage) => {
    switch (broadcast.criteria.type) {
      case 'all_students':
        return 'All Students';
      case 'specific_class':
        return `${broadcast.criteria.className} - ${broadcast.criteria.session}`;
      case 'all_teachers':
        return 'All Teachers';
      case 'specific_department':
        return `${broadcast.criteria.department} Department`;
      default:
        return 'Unknown';
    }
  };

  const getDeliveryRate = (broadcast: BroadcastMessage) => {
    if (broadcast.recipientCount === 0) return 0;
    return Math.round((broadcast.deliveredCount / broadcast.recipientCount) * 100);
  };

  // ============================================================================
  // Render
  // ============================================================================

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 rounded-xl bg-red-50 border border-red-200 ${className}`}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-red-900">Error</div>
            <div className="text-sm text-red-700 mt-1">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (broadcasts.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Broadcast History</h3>
        <p className="text-sm text-gray-600">
          You haven't sent any broadcast messages yet
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Broadcast History</h2>
        <button
          onClick={loadBroadcasts}
          className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {broadcasts.map((broadcast) => (
          <BroadcastItem
            key={broadcast.id}
            broadcast={broadcast}
            isExpanded={expandedId === broadcast.id}
            onToggleExpand={() => handleToggleExpand(broadcast.id)}
            onRetry={() => handleRetry(broadcast.id)}
            getCriteriaDescription={getCriteriaDescription}
            getDeliveryRate={getDeliveryRate}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Broadcast Item Component
// ============================================================================

interface BroadcastItemProps {
  broadcast: BroadcastMessage;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRetry: () => void;
  getCriteriaDescription: (broadcast: BroadcastMessage) => string;
  getDeliveryRate: (broadcast: BroadcastMessage) => number;
}

function BroadcastItem({
  broadcast,
  isExpanded,
  onToggleExpand,
  onRetry,
  getCriteriaDescription,
  getDeliveryRate,
}: BroadcastItemProps) {
  const deliveryRate = getDeliveryRate(broadcast);

  return (
    <motion.div
      layout
      className="rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <button
        onClick={onToggleExpand}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start gap-4 flex-1 text-left">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900">
                {getCriteriaDescription(broadcast)}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                broadcast.priority === 'urgent'
                  ? 'bg-red-100 text-red-700'
                  : broadcast.priority === 'important'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {broadcast.priority}
              </span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {broadcast.content}
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(broadcast.timestamp, { addSuffix: true })}
              </span>
              <span>{broadcast.recipientCount} recipients</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {deliveryRate}%
              </div>
              <div className="text-xs text-gray-500">Delivered</div>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-200"
          >
            <div className="p-4 space-y-4">
              {/* Delivery Statistics */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Delivery Statistics</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-gray-600" />
                      <span className="text-xs text-gray-600">Total</span>
                    </div>
                    <div className="text-xl font-bold text-gray-900">
                      {broadcast.recipientCount}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-green-600">Delivered</span>
                    </div>
                    <div className="text-xl font-bold text-green-700">
                      {broadcast.deliveredCount}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Eye className="w-4 h-4 text-blue-600" />
                      <span className="text-xs text-blue-600">Read</span>
                    </div>
                    <div className="text-xl font-bold text-blue-700">
                      {broadcast.readCount}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-xs text-red-600">Failed</span>
                    </div>
                    <div className="text-xl font-bold text-red-700">
                      {broadcast.failedCount}
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Details */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Message Content</h4>
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                      {broadcast.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {broadcast.content}
                  </p>
                </div>
              </div>

              {/* Failed Recipients */}
              {broadcast.failedCount > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900">
                      Failed Deliveries ({broadcast.failedCount})
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRetry();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Retry Failed
                    </button>
                  </div>
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <div className="space-y-1">
                      {broadcast.failedRecipients.slice(0, 5).map((recipientId, index) => (
                        <div key={index} className="text-sm text-red-700">
                          Recipient ID: {recipientId}
                        </div>
                      ))}
                      {broadcast.failedRecipients.length > 5 && (
                        <div className="text-sm text-red-600 font-medium mt-2">
                          +{broadcast.failedRecipients.length - 5} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Attachments */}
              {broadcast.attachments.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Attachments</h4>
                  <div className="space-y-2">
                    {broadcast.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="p-3 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-700">
                              {attachment.type.split('/')[1]?.toUpperCase().slice(0, 3)}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {attachment.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {(attachment.size / 1024).toFixed(1)} KB
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
