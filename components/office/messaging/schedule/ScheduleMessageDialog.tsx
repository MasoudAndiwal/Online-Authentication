/**
 * ScheduleMessageDialog Component
 * 
 * Dialog for scheduling messages for later delivery.
 * Features date/time picker, validation, and confirmation.
 * 
 * Requirements: 15.1, 15.2, 15.3
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Send, AlertCircle } from 'lucide-react';
import { format, addMinutes, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  MessageDraft,
  ScheduleMessageRequest,
} from '@/types/office/messaging';

// ============================================================================
// Types
// ============================================================================

interface ScheduleMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (request: ScheduleMessageRequest) => Promise<void>;
  conversationId: string;
  recipientId: string;
  draft: MessageDraft;
}

// ============================================================================
// Component
// ============================================================================

export function ScheduleMessageDialog({
  isOpen,
  onClose,
  onSchedule,
  conversationId,
  recipientId,
  draft,
}: ScheduleMessageDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // Computed Values
  // ============================================================================

  // Get scheduled datetime
  const scheduledDateTime = useMemo(() => {
    if (!selectedTime) return null;

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const dateTime = new Date(selectedDate);
    dateTime.setHours(hours, minutes, 0, 0);

    return dateTime;
  }, [selectedDate, selectedTime]);

  // Validate scheduled time is in the future
  const validationError = useMemo(() => {
    if (!scheduledDateTime) {
      return 'Please select a time';
    }

    const now = new Date();
    const minScheduleTime = addMinutes(now, 5); // At least 5 minutes in the future

    if (isBefore(scheduledDateTime, minScheduleTime)) {
      return 'Scheduled time must be at least 5 minutes in the future';
    }

    return null;
  }, [scheduledDateTime]);

  const canSchedule = !validationError && !isSubmitting;

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleSchedule = useCallback(async () => {
    if (!scheduledDateTime || validationError) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const request: ScheduleMessageRequest = {
        conversationId,
        recipientId,
        draft,
        scheduledFor: scheduledDateTime,
      };

      await onSchedule(request);

      // Reset and close
      setSelectedDate(new Date());
      setSelectedTime('');
      onClose();
    } catch (err) {
      console.error('Failed to schedule message:', err);
      setError(err instanceof Error ? err.message : 'Failed to schedule message');
    } finally {
      setIsSubmitting(false);
    }
  }, [scheduledDateTime, validationError, conversationId, recipientId, draft, onSchedule, onClose]);

  const handleClose = useCallback(() => {
    setSelectedDate(new Date());
    setSelectedTime('');
    setError(null);
    onClose();
  }, [onClose]);

  // Generate time options (every 15 minutes)
  const timeOptions = useMemo(() => {
    const options: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeStr);
      }
    }
    return options;
  }, []);

  // Quick schedule options
  const quickOptions = useMemo(() => {
    const now = new Date();
    return [
      { label: 'In 1 hour', date: addMinutes(now, 60) },
      { label: 'In 2 hours', date: addMinutes(now, 120) },
      { label: 'In 4 hours', date: addMinutes(now, 240) },
      { label: 'Tomorrow 9 AM', date: (() => {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        return tomorrow;
      })() },
    ];
  }, []);

  const handleQuickOption = useCallback((date: Date) => {
    setSelectedDate(date);
    setSelectedTime(format(date, 'HH:mm'));
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Dialog */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 shadow-md shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Schedule Message</h2>
                <p className="text-sm text-gray-500">Choose when to send this message</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-xl bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600 flex items-center justify-center transition-all shadow-sm hover:shadow-md border-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="p-6 space-y-6">
            {/* Quick Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Quick Schedule
              </label>
              <div className="grid grid-cols-2 gap-3">
                {quickOptions.map((option) => (
                  <button
                    key={option.label}
                    onClick={() => handleQuickOption(option.date)}
                    className="px-4 py-3 rounded-xl border-0 shadow-md hover:shadow-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 transition-all text-left"
                  >
                    <div className="font-medium text-gray-900 text-sm">{option.label}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {format(option.date, 'MMM d, h:mm a')}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-sm text-gray-500">or choose custom time</span>
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date
              </label>
              <DatePicker
                date={selectedDate}
                onDateChange={(date) => date && setSelectedDate(date)}
                placeholder="Select a date"
                className="border-0 shadow-md"
              />
            </div>

            {/* Time Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Time
              </label>
              <Select
                value={selectedTime}
                onValueChange={setSelectedTime}
              >
                <SelectTrigger className="w-full border-0 shadow-md bg-white">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {format(new Date(`2000-01-01T${time}`), 'h:mm a')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Scheduled Time Preview */}
            {scheduledDateTime && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border-0 shadow-md ${
                  validationError
                    ? 'bg-red-50'
                    : 'bg-gradient-to-br from-blue-50 to-purple-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {validationError ? (
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  ) : (
                    <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${validationError ? 'text-red-900' : 'text-gray-900'}`}>
                      {validationError || 'Message will be sent on'}
                    </div>
                    {!validationError && (
                      <div className="text-lg font-semibold text-gray-900 mt-1">
                        {format(scheduledDateTime, 'EEEE, MMMM d, yyyy')}
                      </div>
                    )}
                    {!validationError && (
                      <div className="text-sm text-gray-600 mt-1">
                        at {format(scheduledDateTime, 'h:mm a')}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-red-50 border-0 shadow-md flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">{error}</div>
              </motion.div>
            )}

            {/* Message Preview */}
            <div className="p-4 rounded-xl bg-gray-50 border-0 shadow-md">
              <div className="text-sm font-medium text-gray-700 mb-2">Message Preview</div>
              <div className="text-sm text-gray-900 line-clamp-3">{draft.content}</div>
              {draft.attachments.length > 0 && (
                <div className="text-xs text-gray-500 mt-2">
                  {draft.attachments.length} attachment{draft.attachments.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 shadow-md bg-gray-50 shrink-0">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 transition-all shadow-md hover:shadow-lg border-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              onClick={handleSchedule}
              disabled={!canSchedule}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md border-0"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Schedule Message
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
