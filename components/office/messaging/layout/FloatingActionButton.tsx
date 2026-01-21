/**
 * FloatingActionButton Component
 * 
 * Floating action button for creating new conversations on mobile.
 * Positioned in bottom-right corner with proper touch target size.
 * 
 * Requirements: 21.1, 21.5
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
  label?: string;
}

export function FloatingActionButton({ 
  onClick,
  label = 'New conversation'
}: FloatingActionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed rounded-full shadow-lg"
      style={{
        bottom: '80px', // Above bottom nav
        right: '16px',
        width: '56px',
        height: '56px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        zIndex: 40,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.2 }}
      aria-label={label}
    >
      <div className="w-full h-full flex items-center justify-center">
        <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
      </div>
    </motion.button>
  );
}
