"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, CheckCircle2, Clock, TrendingUp, AlertCircle, RefreshCw, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useBroadcastHistory } from "@/hooks/use-broadcast-history";

interface BroadcastHistoryProps {
  teacherId: string;
}

export function BroadcastHistory({ teacherId }: BroadcastHistoryProps) {
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
      announcement: { label: "Announcement", color: "text-blue-700", bgColor: "bg-blue-100" },
      urgent: { label: "Urgent", color: "text-red-700", bgColor: "bg-red-100" },
      general: { label: "General", color: "text-slate-700", bgColor: "bg-slate-100" },
      attendance_inquiry: { label: "Attendance", color: "text-purple-700", bgColor: "bg-purple-100" },
      documentation: { label: "Documentation", color: "text-indigo-700", bgColor: "bg-indigo-100" },
    };
    return configs[category] || configs.general;
  };

  const getReadPercentage = (readCount: number, totalRecipients: number) => {
    if (totalRecipients === 0) return 0;
    return Math.round((readCount / totalRecipients) * 100);
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {/* Animated Spinner */}
          <motion.div className="relative mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="h-16 w-16 rounded-full mx-auto"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0deg, #ea580c 360deg)',
                WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 0)',
                mask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 0)',
              }}
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 h-16 w-16 rounded-full bg-orange-100 mx-auto -z-10"
            />
          </motion.div>

          {/* Loading Text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              Loading broadcast history
            </h3>
            <p className="text-slate-500 text-sm">
              Fetching your sent messages...
            </p>
          </motion.div>

          {/* Animated Dots */}
          <motion.div className="flex items-center justify-center gap-1.5 mt-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="h-2 w-2 rounded-full bg-orange-500"
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <motion.div 
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Failed to Load Broadcasts</h3>
          <p className="text-slate-600 text-sm mb-4">
            {error.message || "An error occurred while fetching your broadcast history."}
          </p>
          <Button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl shadow-lg"
          >
            {isRefetching ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <RefreshCw className="h-4 w-4" />
                </motion.div>
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </>
            )}
          </Button>
        </motion.div>
      </div>
    );
  }

  // Empty State
  if (!broadcasts || broadcasts.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Inbox className="h-10 w-10 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No broadcasts yet</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Your broadcast messages will appear here once you send them to your classes
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-orange-50/80 to-white/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Broadcast History</h2>
              <p className="text-sm text-slate-500">
                {broadcasts.length} {broadcasts.length === 1 ? 'broadcast' : 'broadcasts'} sent
              </p>
            </div>
          </div>
          <Button
            onClick={() => refetch()}
            disabled={isRefetching}
            variant="ghost"
            size="sm"
            className="rounded-lg"
          >
            <motion.div
              animate={isRefetching ? { rotate: 360 } : {}}
              transition={{ duration: 1, repeat: isRefetching ? Infinity : 0, ease: "linear" }}
            >
              <RefreshCw className="h-4 w-4" />
            </motion.div>
          </Button>
        </div>
      </div>

      {/* Broadcast List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
                className="p-5 rounded-2xl bg-gradient-to-br from-white to-slate-50 shadow-md hover:shadow-lg transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3 gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 font-semibold rounded-full px-3 py-1 shadow-sm">
                      {broadcast.className}
                    </Badge>
                    <Badge className={cn(
                      "font-medium rounded-full px-3 py-1 shadow-sm",
                      categoryConfig.bgColor,
                      categoryConfig.color
                    )}>
                      {categoryConfig.label}
                    </Badge>
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

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
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
                    "p-3 rounded-xl",
                    isFullyDelivered
                      ? "bg-gradient-to-br from-emerald-50 to-emerald-100/50"
                      : "bg-gradient-to-br from-amber-50 to-amber-100/50"
                  )}>
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className={cn(
                        "h-4 w-4",
                        isFullyDelivered ? "text-emerald-600" : "text-amber-600"
                      )} />
                      <span className={cn(
                        "text-xs font-medium",
                        isFullyDelivered ? "text-emerald-600" : "text-amber-600"
                      )}>
                        Delivered
                      </span>
                    </div>
                    <p className={cn(
                      "text-lg font-bold",
                      isFullyDelivered ? "text-emerald-700" : "text-amber-700"
                    )}>
                      {broadcast.deliveredCount}
                    </p>
                  </div>

                  {/* Read */}
                  <div className={cn(
                    "p-3 rounded-xl",
                    isFullyRead
                      ? "bg-gradient-to-br from-emerald-50 to-emerald-100/50"
                      : "bg-gradient-to-br from-amber-50 to-amber-100/50"
                  )}>
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className={cn(
                        "h-4 w-4",
                        isFullyRead ? "text-emerald-600" : "text-amber-600"
                      )} />
                      <span className={cn(
                        "text-xs font-medium",
                        isFullyRead ? "text-emerald-600" : "text-amber-600"
                      )}>
                        Read
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <p className={cn(
                        "text-lg font-bold",
                        isFullyRead ? "text-emerald-700" : "text-amber-700"
                      )}>
                        {broadcast.readCount}
                      </p>
                      <span className={cn(
                        "text-xs font-medium",
                        isFullyRead ? "text-emerald-600" : "text-amber-600"
                      )}>
                        ({readPercentage}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span>Read Progress</span>
                    <span className="font-medium">{readPercentage}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className={cn(
                        "h-full rounded-full",
                        isFullyRead
                          ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                          : "bg-gradient-to-r from-amber-400 to-amber-500"
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${readPercentage}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
