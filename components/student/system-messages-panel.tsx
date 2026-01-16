"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  AlertTriangle,
  Info,
  Calendar,
  CheckCircle2,
  X,
  ExternalLink,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

// ============================================================================
// Types
// ============================================================================

export type SystemMessageCategory = 
  | "attendance_alert"
  | "schedule_change"
  | "announcement"
  | "reminder"
  | "warning"
  | "info";

export type Severity = "info" | "warning" | "error" | "success";

export interface SystemMessage {
  id: string;
  title: string;
  content: string;
  category: SystemMessageCategory;
  severity: Severity;
  createdAt: Date;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

interface SystemMessagesPanelProps {
  messages: SystemMessage[];
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onAction?: (url: string) => void;
  isLoading?: boolean;
}

// ============================================================================
// Category Configuration
// ============================================================================

const categoryConfig: Record<SystemMessageCategory, {
  icon: React.ReactNode;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  attendance_alert: {
    icon: <AlertTriangle className="h-5 w-5" />,
    label: "هشدار حاضری",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  schedule_change: {
    icon: <Calendar className="h-5 w-5" />,
    label: "تغییر برنامه",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  announcement: {
    icon: <Bell className="h-5 w-5" />,
    label: "اعلامیه",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  reminder: {
    icon: <Clock className="h-5 w-5" />,
    label: "یادآوری",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5" />,
    label: "هشدار",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  info: {
    icon: <Info className="h-5 w-5" />,
    label: "اطلاعیه",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
};

const severityConfig: Record<Severity, {
  badge: string;
  label: string;
}> = {
  info: { badge: "bg-blue-100 text-blue-800", label: "اطلاعات" },
  warning: { badge: "bg-yellow-100 text-yellow-800", label: "هشدار" },
  error: { badge: "bg-red-100 text-red-800", label: "خطا" },
  success: { badge: "bg-green-100 text-green-800", label: "موفق" },
};

/**
 * SystemMessagesPanel Component
 * 
 * Displays system-generated messages (automated notifications) separately from user messages.
 * Features:
 * - Visual distinction from user messages (different styling)
 * - Category-based icons and colors
 * - Severity badges
 * - Mark as read / Dismiss actions
 * - Action buttons for navigating to related pages
 */
export function SystemMessagesPanel({
  messages,
  onMarkAsRead,
  onDismiss,
  onAction,
  isLoading = false,
}: SystemMessagesPanelProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          پیام سیستمی جدیدی ندارید
        </h3>
        <p className="text-sm text-slate-500">
          همه پیام‌های سیستمی خوانده شده‌اند
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Bell className="h-4 w-4" />
          پیام‌های سیستم
          {messages.filter(m => !m.isRead).length > 0 && (
            <Badge className="bg-red-500 text-white text-xs">
              {messages.filter(m => !m.isRead).length}
            </Badge>
          )}
        </h3>
      </div>

      {/* Messages List */}
      <AnimatePresence mode="popLayout">
        {messages.map((message) => {
          const config = categoryConfig[message.category];
          const severity = severityConfig[message.severity];

          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={cn(
                "relative p-4 rounded-xl border-2 shadow-sm transition-all",
                config.bgColor,
                config.borderColor,
                !message.isRead && "ring-2 ring-offset-2 ring-emerald-300"
              )}
            >
              {/* Unread Indicator */}
              {!message.isRead && (
                <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}

              {/* Header */}
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg", config.bgColor, config.color)}>
                  {config.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className="font-semibold text-slate-800">{message.title}</h4>
                    <Badge className={cn("text-xs", severity.badge)}>
                      {severity.label}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {config.label}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-2">{message.content}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {formatDistanceToNow(message.createdAt, { addSuffix: true })}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      {message.actionUrl && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onAction?.(message.actionUrl!)}
                          className="h-7 text-xs text-emerald-600 hover:text-emerald-700"
                        >
                          {message.actionLabel || "مشاهده"}
                          <ExternalLink className="h-3 w-3 mr-1" />
                        </Button>
                      )}
                      
                      {!message.isRead && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onMarkAsRead(message.id)}
                          disabled={isLoading}
                          className="h-7 text-xs"
                        >
                          خوانده شد
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDismiss(message.id)}
                        disabled={isLoading}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
