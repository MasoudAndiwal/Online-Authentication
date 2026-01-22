/**
 * Office Broadcast History Dialog
 * 
 * Beautiful borderless UI for viewing broadcast message history
 * Features:
 * - No borders design
 * - Unfilled/ghost buttons
 * - Smooth animations
 * - Real-time stats
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, CheckCircle2, Clock, TrendingUp, AlertCircle, RefreshCw, Inbox, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useBroadcastHistory } from '@/hooks/use-broadcast-history';

interface BroadcastHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BroadcastHistoryDialog({ isOpen, onClose }: BroadcastHistoryDialogProps) {
  const { data: broadcasts, isLoading, error, refetch, isRefetching } = useBroadcastHistory();

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, "'Today at' h:mm a");
    } else if (diffInHours < 48) {
      return format(date, "'Yesterday at' h:mm a");
    } else {
      return format(date, "MMM d, yyyy 'at' h:mm a");
    }
  };

  const getCategoryConfig = (category: string) => {
    const configs: Record<string, { label: string; color: string; bgColor: string }> = {
      announcement: { label: 'Announcement', color: 'text-blue-700', bgColor: 'bg-blue-50' },
      urgent: { label: 'Urgent', color: 'text-red-700', bgColor: 'bg-red-50' },
      general: { label: 'General', color: 'text-slate-700', bgColor: 'bg-slate-50' },
      attendance_inquiry: { label: 'Attendance', color: 'text-purple-700', bgColor: 'bg-purple-50' },
      documentation: { label: 'Documentation', color: 'text-indigo-700', bgColor: 'bg-indigo-50' },
    };
    return configs[category] || configs.general;
  };

  const getReadPercentage = (readCount: number, totalRecipients: number) => {
    if (totalRecipients === 0) return 0;
    return Math.round((readCount / totalRecipients) * 100);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl md:h-[85vh] bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header - No borders */}
            <div className="p-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Send className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Broadcast History</h2>
                    <p className="text-sm text-slate-500">
                      {broadcasts?.length || 0} {broadcasts?.length === 1 ? 'broadcast' : 'broadcasts'} sent
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Refresh Button - Ghost/Unfilled */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => refetch()}
                    disabled={isRefetching}
                    className="p-2 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50"
                  >
                    <motion.div
                      animate={isRefetching ? { rotate: 360 } : {}}
                      transition={{ duration: 1, repeat: isRefetching ? Infinity : 0, ease: 'linear' }}
                    >
                      <RefreshCw className="h-5 w-5 text-slate-600" />
                    </motion.div>
                  </motion.button>

                  {/* Close Button - Ghost/Unfilled */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <X className="h-5 w-5 text-slate-600" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {/* Loading State */}
              {isLoading && (
                <div className="h-full flex items-center justify-center">
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <motion.div className="relative mb-6">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        className="h-16 w-16 rounded-full mx-auto"
                        style={{
                          background: 'conic-gradient(from 0deg, transparent 0deg, #3b82f6 360deg)',
                          WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 0)',
                          mask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 0)',
                        }}
                      />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">Loading broadcasts</h3>
                    <p className="text-slate-500 text-sm">Fetching your sent messages...</p>
                  </motion.div>
                </div>
              )}

              {/* Error State */}
              {error && !isLoading && (
                <div className="h-full flex items-center justify-center">
                  <motion.div
                    className="text-center max-w-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Error</h3>
                    <p className="text-slate-600 text-sm mb-4">
                      {error.message || 'Failed to load broadcast history'}
                    </p>
                    {/* Retry Button - Ghost/Unfilled */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => refetch()}
                      disabled={isRefetching}
                      className="px-6 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium transition-colors disabled:opacity-50"
                    >
                      {isRefetching ? (
                        <>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="inline-block mr-2"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </motion.span>
                          Retrying...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 inline mr-2" />
                          Try Again
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !error && (!broadcasts || broadcasts.length === 0) && (
                <div className="h-full flex items-center justify-center">
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Inbox className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No broadcasts yet</h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto">
                      Your broadcast messages will appear here once you send them
                    </p>
                  </motion.div>
                </div>
              )}

              {/* Broadcast List */}
              {!isLoading && !error && broadcasts && broadcasts.length > 0 && (
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {broadcasts.map((broadcast, index) => {
                      const categoryConfig = getCategoryConfig(broadcast.category);
                      const readPercentage = getReadPercentage(broadcast.readCount, broadcast.totalRecipients);
                      const isFullyRead = readPercentage === 100;
                      const isFullyDelivered = broadcast.deliveredCount === broadcast.totalRecipients;

                      return (
                        <motion.div
                          key={broadcast.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-6 rounded-2xl bg-gradient-to-br from-white to-slate-50/50 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3 gap-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={cn(
                                'px-3 py-1 rounded-full text-sm font-medium shadow-sm',
                                'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700'
                              )}>
                                {broadcast.className}
                              </span>
                              <span className={cn(
                                'px-3 py-1 rounded-full text-sm font-medium shadow-sm',
                                categoryConfig.bgColor,
                                categoryConfig.color
                              )}>
                                {categoryConfig.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-500 whitespace-nowrap">
                              <Clock className="h-3 w-3" />
                              {formatTimestamp(broadcast.createdAt)}
                            </div>
                          </div>

                          {/* Content */}
                          <p className="text-sm text-slate-700 mb-4 leading-relaxed line-clamp-3">
                            {broadcast.content}
                          </p>

                          {/* Stats - No borders */}
                          <div className="grid grid-cols-3 gap-3 mb-4">
                            {/* Total Recipients */}
                            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50">
                              <div className="flex items-center gap-2 mb-1">
                                <Users className="h-4 w-4 text-blue-600" />
                                <span className="text-xs font-medium text-blue-600">Recipients</span>
                              </div>
                              <p className="text-lg font-bold text-blue-700">{broadcast.totalRecipients}</p>
                            </div>

                            {/* Delivered */}
                            <div className={cn(
                              'p-3 rounded-xl',
                              isFullyDelivered
                                ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50'
                                : 'bg-gradient-to-br from-amber-50 to-amber-100/50'
                            )}>
                              <div className="flex items-center gap-2 mb-1">
                                <CheckCircle2 className={cn(
                                  'h-4 w-4',
                                  isFullyDelivered ? 'text-emerald-600' : 'text-amber-600'
                                )} />
                                <span className={cn(
                                  'text-xs font-medium',
                                  isFullyDelivered ? 'text-emerald-600' : 'text-amber-600'
                                )}>
                                  Delivered
                                </span>
                              </div>
                              <p className={cn(
                                'text-lg font-bold',
                                isFullyDelivered ? 'text-emerald-700' : 'text-amber-700'
                              )}>
                                {broadcast.deliveredCount}
                              </p>
                            </div>

                            {/* Read */}
                            <div className={cn(
                              'p-3 rounded-xl',
                              isFullyRead
                                ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50'
                                : 'bg-gradient-to-br from-amber-50 to-amber-100/50'
                            )}>
                              <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className={cn(
                                  'h-4 w-4',
                                  isFullyRead ? 'text-emerald-600' : 'text-amber-600'
                                )} />
                                <span className={cn(
                                  'text-xs font-medium',
                                  isFullyRead ? 'text-emerald-600' : 'text-amber-600'
                                )}>
                                  Read
                                </span>
                              </div>
                              <div className="flex items-baseline gap-1">
                                <p className={cn(
                                  'text-lg font-bold',
                                  isFullyRead ? 'text-emerald-700' : 'text-amber-700'
                                )}>
                                  {broadcast.readCount}
                                </p>
                                <span className={cn(
                                  'text-xs font-medium',
                                  isFullyRead ? 'text-emerald-600' : 'text-amber-600'
                                )}>
                                  ({readPercentage}%)
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Progress Bar - No borders */}
                          <div>
                            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                              <span>Read Progress</span>
                              <span className="font-medium">{readPercentage}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                className={cn(
                                  'h-full rounded-full',
                                  isFullyRead
                                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                                    : 'bg-gradient-to-r from-amber-400 to-amber-500'
                                )}
                                initial={{ width: 0 }}
                                animate={{ width: `${readPercentage}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
