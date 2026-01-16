"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Bell3D, SystemAlert3D, Check3D } from "@/components/ui/message-3d-icons";

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

const categoryConfig: Record<SystemMessageCategory, {
  label: string;
  gradient: string;
  iconBg: string;
}> = {
  attendance_alert: {
    label: "Attendance Alert",
    gradient: "from-red-50 to-red-100/50",
    iconBg: "bg-gradient-to-br from-red-400 to-red-500",
  },
  schedule_change: {
    label: "Schedule Change",
    gradient: "from-blue-50 to-blue-100/50",
    iconBg: "bg-gradient-to-br from-blue-400 to-blue-500",
  },
  announcement: {
    label: "Announcement",
    gradient: "from-purple-50 to-purple-100/50",
    iconBg: "bg-gradient-to-br from-purple-400 to-purple-500",
  },
  reminder: {
    label: "Reminder",
    gradient: "from-amber-50 to-amber-100/50",
    iconBg: "bg-gradient-to-br from-amber-400 to-amber-500",
  },
  warning: {
    label: "Warning",
    gradient: "from-orange-50 to-orange-100/50",
    iconBg: "bg-gradient-to-br from-orange-400 to-orange-500",
  },
  info: {
    label: "Information",
    gradient: "from-emerald-50 to-emerald-100/50",
    iconBg: "bg-gradient-to-br from-emerald-400 to-emerald-500",
  },
};

const severityConfig: Record<Severity, { badge: string; label: string }> = {
  info: { badge: "bg-blue-100 text-blue-700", label: "Info" },
  warning: { badge: "bg-yellow-100 text-yellow-700", label: "Warning" },
  error: { badge: "bg-red-100 text-red-700", label: "Error" },
  success: { badge: "bg-green-100 text-green-700", label: "Success" },
};

const listVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 }
};

export function SystemMessagesPanel({
  messages,
  onMarkAsRead,
  onDismiss,
  onAction,
  isLoading = false,
}: SystemMessagesPanelProps) {
  if (messages.length === 0) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center py-16 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="mb-6"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center shadow-lg shadow-emerald-200/50">
            <Check3D size="xl" />
          </div>
        </motion.div>
        <h3 className="text-xl font-semibold text-slate-700 mb-2">
          All caught up!
        </h3>
        <p className="text-sm text-slate-500 max-w-xs">
          You have no new system messages. We&apos;ll notify you when something important comes up.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <Bell3D size="lg" />
          <div>
            <h3 className="text-lg font-semibold text-slate-800">System Messages</h3>
            <p className="text-sm text-slate-500">Important notifications from the system</p>
          </div>
        </div>
        {messages.filter(m => !m.isRead).length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500 }}
          >
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 px-3 py-1 border-0">
              {messages.filter(m => !m.isRead).length} unread
            </Badge>
          </motion.div>
        )}
      </motion.div>

      {/* Messages List */}
      <motion.div
        className="space-y-3"
        variants={listVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence mode="popLayout">
          {messages.map((message) => {
            const config = categoryConfig[message.category];
            const severity = severityConfig[message.severity];

            return (
              <motion.div
                key={message.id}
                variants={itemVariants}
                exit={{ opacity: 0, x: 100, scale: 0.9 }}
                layout
                whileHover={{ scale: 1.01 }}
                className={cn(
                  "relative p-5 rounded-2xl shadow-md transition-all border-0",
                  `bg-gradient-to-r ${config.gradient}`,
                  !message.isRead && "shadow-lg shadow-amber-200/50"
                )}
              >
                {/* Unread Indicator */}
                {!message.isRead && (
                  <motion.div 
                    className="absolute top-4 right-4 w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-lg shadow-amber-500/50"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}

                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <motion.div 
                    className={cn("p-3 rounded-xl shadow-md", config.iconBg)}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <SystemAlert3D size="md" className="text-white" animated={false} />
                  </motion.div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h4 className="font-semibold text-slate-800">{message.title}</h4>
                      <Badge className={cn("text-xs shadow-sm", severity.badge)}>
                        {severity.label}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-white/50">
                        {config.label}
                      </Badge>
                    </div>
                    
                    {/* Content */}
                    <p className="text-sm text-slate-600 mb-3 leading-relaxed">{message.content}</p>
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">
                        {formatDistanceToNow(message.createdAt, { addSuffix: true })}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        {message.actionUrl && (
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              size="sm"
                              onClick={() => onAction?.(message.actionUrl!)}
                              className="h-8 text-xs bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md rounded-lg"
                            >
                              {message.actionLabel || "View"}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          </motion.div>
                        )}
                        
                        {!message.isRead && (
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onMarkAsRead(message.id)}
                              disabled={isLoading}
                              className="h-8 text-xs text-slate-600 hover:bg-white/50 rounded-lg"
                            >
                              Mark as read
                            </Button>
                          </motion.div>
                        )}
                        
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDismiss(message.id)}
                            disabled={isLoading}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
