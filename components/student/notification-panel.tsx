"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, CheckCircle, AlertCircle, Info, Calendar, MessageSquare, Send, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "message";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  senderId?: string;
  senderName?: string;
  senderType?: "teacher" | "office";
  actionUrl?: string;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onReply?: (notification: Notification) => void;
  onViewAllMessages?: () => void;
}

/**
 * Notification Panel Component
 * Displays a sliding panel with notifications
 * Fully responsive for mobile, tablet, and desktop
 */
export function NotificationPanel({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onReply,
  onViewAllMessages,
}: NotificationPanelProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;
  const messageNotifications = notifications.filter((n) => n.type === "message");

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "message":
        return <MessageSquare className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5 text-slate-600" />;
    }
  };

  const getTypeColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "message":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-slate-50 border-slate-200";
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-96 md:w-[28rem] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-emerald-100/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Notifications</h2>
                  <p className="text-xs text-slate-600">
                    {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-9 w-9 rounded-lg hover:bg-emerald-100 border-0"
              >
                <X className="h-5 w-5 text-slate-600" />
              </Button>
            </div>

            {/* Actions */}
            {notifications.length > 0 && (
              <div className="flex items-center justify-between gap-2 p-3 sm:p-4 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onMarkAllAsRead}
                    disabled={unreadCount === 0}
                    className="text-xs border-0 shadow-sm bg-white hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    Mark all read
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearAll}
                    className="text-xs border-0 shadow-sm bg-white hover:bg-red-50 hover:text-red-700"
                  >
                    Clear all
                  </Button>
                </div>
                {onViewAllMessages && messageNotifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onViewAllMessages}
                    className="text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  >
                    View Messages
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
            )}

            {/* Notifications List */}
            <ScrollArea className="flex-1">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <Bell className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">No notifications</h3>
                  <p className="text-sm text-slate-600">
                    You&apos;re all caught up! Check back later for updates.
                  </p>
                </div>
              ) : (
                <div className="p-3 sm:p-4 space-y-3">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      className={cn(
                        "p-3 sm:p-4 rounded-xl border-0 shadow-sm transition-all duration-300",
                        getTypeColor(notification.type),
                        !notification.read && "ring-2 ring-emerald-500/20"
                      )}
                    >
                      <div 
                        className="flex items-start gap-3 cursor-pointer"
                        onClick={() => onMarkAsRead(notification.id)}
                      >
                        <div className="flex-shrink-0 mt-0.5">{getIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-slate-800 line-clamp-1">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="flex-shrink-0 h-2 w-2 rounded-full bg-emerald-500" />
                            )}
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Calendar className="h-3 w-3" />
                              <span>{formatTimestamp(notification.timestamp)}</span>
                            </div>
                            
                            {/* Reply button for message notifications */}
                            {notification.type === "message" && onReply && (
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onReply(notification);
                                  }}
                                  className={cn(
                                    "h-7 px-3 text-xs rounded-lg",
                                    "bg-gradient-to-r from-blue-500 to-blue-600",
                                    "hover:from-blue-600 hover:to-blue-700",
                                    "text-white shadow-md"
                                  )}
                                >
                                  <Send className="h-3 w-3 mr-1" />
                                  Reply
                                </Button>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
