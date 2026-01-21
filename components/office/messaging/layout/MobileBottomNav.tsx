/**
 * MobileBottomNav Component
 * 
 * Bottom navigation bar for mobile devices with quick actions.
 * Ensures touch targets are at least 44x44 pixels.
 * 
 * Requirements: 21.1, 21.5
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Search, Bell, Settings } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab?: 'messages' | 'search' | 'notifications' | 'settings';
  onTabChange?: (tab: 'messages' | 'search' | 'notifications' | 'settings') => void;
}

export function MobileBottomNav({ 
  activeTab = 'messages',
  onTabChange 
}: MobileBottomNavProps) {
  const tabs = [
    { id: 'messages' as const, icon: MessageSquare, label: 'Messages' },
    { id: 'search' as const, icon: Search, label: 'Search' },
    { id: 'notifications' as const, icon: Bell, label: 'Notifications' },
    { id: 'settings' as const, icon: Settings, label: 'Settings' },
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="h-16 border-t border-gray-200 bg-white shadow-lg"
      style={{
        position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
      }}
    >
      <div className="h-full flex items-center justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className="flex flex-col items-center justify-center gap-1 rounded-lg transition-colors"
              style={{
                minWidth: '64px',
                minHeight: '48px',
                padding: '8px',
              }}
              whileTap={{ scale: 0.95 }}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  color: isActive ? '#2196F3' : '#6B7280',
                }}
                transition={{ duration: 0.2 }}
              >
                <Icon className="w-6 h-6" />
              </motion.div>
              <span
                className={`text-xs font-medium transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}
