/**
 * NotificationBellTrigger Component
 * 
 * Bell icon button that triggers the NotificationCenter slide-in panel.
 * Shows unread count badge and is fully responsive.
 * 
 * Requirements: 16.1, 16.2, 29.1-29.12
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationBellTriggerProps {
  unreadCount: number;
  onClick: () => void;
  className?: string;
}

export function NotificationBellTrigger({
  unreadCount,
  onClick,
  className,
}: NotificationBellTriggerProps) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClick}
        className="relative h-11 w-11 rounded-2xl hover:bg-slate-100/80 transition-all duration-300 border-0 shadow-sm"
      >
        <Bell className="h-5 w-5 text-slate-600" />
        
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
  );
}
