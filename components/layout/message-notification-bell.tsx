"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface MessageNotification {
  id: string;
  senderName: string;
  senderRole: "student" | "teacher";
  message: string;
  timestamp: Date;
  read: boolean;
}

interface MessageNotificationBellProps {
  unreadCount?: number;
  messages?: MessageNotification[];
  onNavigateToMessages?: () => void;
  className?: string;
}

export function MessageNotificationBell({
  unreadCount = 0,
  messages = [],
  onNavigateToMessages,
  className,
}: MessageNotificationBellProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();

  const handleNavigateToMessages = () => {
    setIsOpen(false);
    if (onNavigateToMessages) {
      onNavigateToMessages();
    } else {
      router.push("/dashboard/messages");
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className={cn("relative", className)}>
      {/* Notification Bell Button */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="relative h-11 w-11 rounded-2xl hover:bg-slate-100/80 transition-all duration-300 border-0 shadow-sm"
        >
          <MessageSquare className="h-5 w-5 text-slate-600" />
          
          {/* Unread Badge */}
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </Button>
      </motion.div>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Notification Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border-0 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Messages</h3>
                  {unreadCount > 0 && (
                    <p className="text-sm text-slate-600">
                      {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 rounded-lg hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Messages List */}
              <div className="max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm text-slate-600 font-medium">
                      No messages yet
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Your messages will appear here
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {messages.slice(0, 5).map((message) => (
                      <motion.div
                        key={message.id}
                        whileHover={{ backgroundColor: "rgba(241, 245, 249, 0.5)" }}
                        onClick={handleNavigateToMessages}
                        className={cn(
                          "p-4 cursor-pointer transition-colors",
                          !message.read && "bg-blue-50/50"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0",
                            message.senderRole === "student"
                              ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                              : "bg-gradient-to-br from-orange-500 to-orange-600"
                          )}>
                            {message.senderName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-semibold text-slate-900 truncate">
                                {message.senderName}
                              </p>
                              <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
                                {formatTimeAgo(message.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 line-clamp-2">
                              {message.message}
                            </p>
                          </div>

                          {/* Unread Indicator */}
                          {!message.read && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-gray-100 bg-slate-50/50">
                <Button
                  onClick={handleNavigateToMessages}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl py-2.5 font-semibold shadow-lg shadow-blue-500/25 transition-all duration-300"
                >
                  View All Messages
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
