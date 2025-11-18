"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  unreadCount?: number;
  onClick?: () => void;
  className?: string;
}

/**
 * Notification Bell Component for Student Dashboard
 * Displays a bell icon with green badge showing unread notification count
 */
export function NotificationBell({
  unreadCount = 0,
  onClick,
  className,
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
        className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl hover:bg-emerald-50/80 transition-all duration-300 border-0 relative"
      >
        <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600" />
        
        {/* Green badge for unread notifications */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </Button>
    </motion.div>
  );
}
