/**
 * HoverCard Component
 * 
 * Card component with enhanced hover effects for desktop.
 * Provides smooth transitions and visual feedback.
 * 
 * Requirements: 21.3
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface HoverCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  onContextMenu?: (event: React.MouseEvent) => void;
  isSelected?: boolean;
  className?: string;
  hoverScale?: number;
  hoverElevation?: boolean;
}

export function HoverCard({
  children,
  onClick,
  onContextMenu,
  isSelected = false,
  className = '',
  hoverScale = 1.02,
  hoverElevation = true,
}: HoverCardProps) {
  return (
    <motion.div
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`cursor-pointer transition-all ${className}`}
      initial={false}
      whileHover={{
        scale: hoverScale,
        boxShadow: hoverElevation
          ? '0 10px 25px rgba(0, 0, 0, 0.1)'
          : undefined,
      }}
      whileTap={{ scale: 0.98 }}
      animate={{
        backgroundColor: isSelected ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
      }}
      transition={{
        duration: 0.2,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  );
}

// Preset hover effects
export const HoverEffects = {
  subtle: {
    hoverScale: 1.01,
    hoverElevation: false,
  },
  moderate: {
    hoverScale: 1.02,
    hoverElevation: true,
  },
  pronounced: {
    hoverScale: 1.05,
    hoverElevation: true,
  },
};
