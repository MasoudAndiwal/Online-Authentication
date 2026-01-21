/**
 * ScheduledMessagesList Component
 * 
 * Displays list of scheduled messages with options to edit, cancel, and view countdown.
 * 
 * Requirements: 15.5
 */

'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Calendar, 
  Edit2, 
  Trash2, 
  User, 
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { format, formatDistanceToNow, isPast, differenceInSeconds } from 'date-fns';
import type { ScheduledMessage } from '@/types/office/messaging';

// ============================================================================
// Types
// ============================================================================

interface ScheduledMessagesListProps {
  scheduledMessages: ScheduledMessage[];
  onEdit?: (message: ScheduledMessage) => void;
  onCancel: (messageId: string) => Promise<void>;
  onRefresh?: () => void;
  isLoading?: boolean;
}

interface CountdownProps {
  scheduledFor: Date;
}

// ============================================================================
// Countdown Component
// ============================================================================

function Countdown({ scheduledFor }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      if (isPast(scheduledFor)) {
        setTimeLeft('Sending...');
        return;
      }

      const seconds = differenceInSeconds(scheduledFor, new Date());
      
      if (seconds < 60) {
        setTimeLeft(`${seconds}s`);
      } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        setTimeLeft(`${minutes}m`);
      } else if (seconds < 86400) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        setTimeLeft(`${days}d ${hours}h`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [scheduledFor]);

  return (
    <div className="flex items-center gap-2 text-sm">
      <Clock className="w-4 h-4 text-blue-600" />
      <span className="font-medium text-blue-600">{timeLeft}</span>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ScheduledMessagesList({
  scheduledMessages,
  onEdit,
  onCancel,
  onRefresh,
  isLoading = false,
}: ScheduledMessagesListProps) {
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleCancelClick = useCallback((messageId: string) => {
    setShowCancelConfirm(messageId);
  }, []);

  const handleCancelConfirm = useCallback(async (messageId: string) => {
    setCancellingId(messageId);
    try {
      await onCancel(messageId);
      setShowCancelConfirm(null);
      onRefresh?.();
    } catch (error) {
      console.error('Failed to cancel scheduled message:', error);
    } finally {
      setCancellingId(null);
    }
  }, [onCancel, onRefresh]);

  const handleCancelDismiss = useCallback(() => {
    setShowCancelConfirm(null);
  }, []);

  // ============================================================================
  // Computed Values
  // ============================================================================

  // Sort messages by scheduled time
  const sortedMessages = useMemo(() => {
    return [...scheduledMessages].sort((a, b) => 
      a.scheduledFor.getTime() - b.scheduledFor.getTime()
    );
  }, [scheduledMessages]);

  // Group messages by status
  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    return {
      upcoming: sortedMessages.filter(msg => msg.scheduledFor > now && msg.status === 'pending'),
      past: sortedMessages.filter(msg => msg.scheduledFor <= now || msg.status !== 'pending'),
    };
  }, [sortedMessages]);

  // ============================================================================
  // Render
  // ============================================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (scheduledMessages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Scheduled Messages</h3>
        <p className="text-sm text-gray-500 text-center max-w-sm">
          You don't have any scheduled messages. Schedule a message to send it at a specific time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming Messages */}
      {upcoming.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Upcoming ({upcoming.length})
          </h3>
          <div className="space-y-3">
            {upcoming.map((message) => (
              <ScheduledMessageCard
                key={message.id}
                message={message}
                onEdit={onEdit}
                onCancelClick={handleCancelClick}
                isCancelling={cancellingId === message.id}
                showCancelConfirm={showCancelConfirm === message.id}
                onCancelConfirm={handleCancelConfirm}
                onCancelDismiss={handleCancelDismiss}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past/Sent Messages */}
      {past.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Sent/Cancelled ({past.length})
          </h3>
          <div className="space-y-3">
            {past.map((message) => (
              <ScheduledMessageCard
                key={message.id}
                message={message}
                isPast
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Message Card Component
// ============================================================================

interface ScheduledMessageCardProps {
  message: ScheduledMessage;
  onEdit?: (message: ScheduledMessage) => void;
  onCancelClick?: (messageId: string) => void;
  isCancelling?: boolean;
  showCancelConfirm?: boolean;
  onCancelConfirm?: (messageId: string) => void;
  onCancelDismiss?: () => void;
  isPast?: boolean;
}

function ScheduledMessageCard({
  message,
  onEdit,
  onCancelClick,
  isCancelling = false,
  showCancelConfirm = false,
  onCancelConfirm,
  onCancelDismiss,
  isPast = false,
}: ScheduledMessageCardProps) {
  const statusConfig = useMemo(() => {
    switch (message.status) {
      case 'pending':
        return {
          icon: Clock,
          label: 'Scheduled',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
        };
      case 'sent':
        return {
          icon: CheckCircle,
          label: 'Sent',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        };
      case 'cancelled':
        return {
          icon: XCircle,
          label: 'Cancelled',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
      default:
        return {
          icon: AlertCircle,
          label: 'Unknown',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
    }
  }, [message.status]);

  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`p-4 rounded-xl border-2 ${statusConfig.borderColor} ${statusConfig.bgColor} transition-all ${
        !isPast ? 'hover:shadow-md' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div className={`w-10 h-10 rounded-lg ${statusConfig.bgColor} flex items-center justify-center`}>
            <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-semibold ${statusConfig.color} uppercase tracking-wide`}>
                {statusConfig.label}
              </span>
              {message.draft.priority !== 'normal' && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  message.draft.priority === 'urgent'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {message.draft.priority}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{format(message.scheduledFor, 'MMM d, yyyy')}</span>
              <span className="text-gray-400">•</span>
              <span>{format(message.scheduledFor, 'h:mm a')}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {!isPast && message.status === 'pending' && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(message)}
                className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center transition-colors"
                title="Edit scheduled message"
              >
                <Edit2 className="w-4 h-4 text-gray-600" />
              </button>
            )}
            {onCancelClick && (
              <button
                onClick={() => onCancelClick(message.id)}
                disabled={isCancelling}
                className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Cancel scheduled message"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className="mb-3">
        <div className="text-sm text-gray-900 line-clamp-2 mb-2">
          {message.draft.content}
        </div>
        {message.draft.attachments.length > 0 && (
          <div className="text-xs text-gray-500">
            {message.draft.attachments.length} attachment{message.draft.attachments.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Countdown or Time Info */}
      {!isPast && message.status === 'pending' ? (
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <span className="text-xs text-gray-500">Sends in</span>
          <Countdown scheduledFor={message.scheduledFor} />
        </div>
      ) : (
        <div className="pt-3 border-t border-gray-200">
          <span className="text-xs text-gray-500">
            {message.status === 'sent' 
              ? `Sent ${formatDistanceToNow(message.scheduledFor, { addSuffix: true })}`
              : `Cancelled ${formatDistanceToNow(message.createdAt, { addSuffix: true })}`
            }
          </span>
        </div>
      )}

      {/* Cancel Confirmation */}
      <AnimatePresence>
        {showCancelConfirm && onCancelConfirm && onCancelDismiss && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-gray-200"
          >
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-red-900 mb-2">
                  Cancel this scheduled message?
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onCancelConfirm(message.id)}
                    disabled={isCancelling}
                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                  </button>
                  <button
                    onClick={onCancelDismiss}
                    disabled={isCancelling}
                    className="px-3 py-1.5 rounded-lg bg-white text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    No, Keep It
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
