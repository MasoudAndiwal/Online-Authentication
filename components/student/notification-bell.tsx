"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  unreadCount?: number;
  onClick?: () => void;
  className?: string;
  isActive?: boolean;
}

/**
 * Notification Bell Component for Student Dashboard
 * Displays a bell icon with green badge showing unread notification count
 * Fully responsive with touch-friendly sizing
 */
export function NotificationBell({
  unreadCount = 0,
  onClick,
  className,
  isActive = false,
}: NotificationBellProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn("relative", className)}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onClick}
        className={cn(
          "h-10 w-10 sm:h-12 sm:w-12 rounded-xl transition-all duration-300 border-0 relative touch-manipulation",
          isActive 
            ? "bg-emerald-100 hover:bg-emerald-100" 
            : "hover:bg-emerald-50/80"
        )}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
      >
        <motion.div
          animate={unreadCount > 0 ? { rotate: [0, -15, 15, -15, 0] } : {}}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
        >
          <Bell className={cn(
            "h-5 w-5 sm:h-6 sm:w-6 transition-colors",
            isActive ? "text-emerald-600" : "text-slate-600"
          )} />
        </motion.div>
        
        {/* Green badge for unread notifications */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 h-5 w-5 sm:h-6 sm:w-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg ring-2 ring-white"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
    </motion.div>
  );
}
