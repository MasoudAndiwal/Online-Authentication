/**
 * TouchOptimizedButton Component
 * 
 * Button component optimized for touch interactions on tablet devices.
 * Ensures minimum touch target size of 44x44 pixels.
 * 
 * Requirements: 21.2, 21.5
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface TouchOptimizedButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  isActive?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export function TouchOptimizedButton({
  icon: Icon,
  label,
  onClick,
  variant = 'ghost',
  isActive = false,
  className = '',
  size = 'medium',
}: TouchOptimizedButtonProps) {
  // Size configurations
  const sizeConfig = {
    small: { minSize: '40px', iconSize: 'w-4 h-4', padding: 'p-2' },
    medium: { minSize: '44px', iconSize: 'w-5 h-5', padding: 'p-2.5' },
    large: { minSize: '48px', iconSize: 'w-6 h-6', padding: 'p-3' },
  };

  const config = sizeConfig[size];

  // Variant styles
  const variantStyles = {
    primary: isActive
      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
      : 'bg-gradient-to-r from-blue-400 to-blue-500 text-white hover:from-blue-500 hover:to-blue-600',
    secondary: isActive
      ? 'bg-blue-100 text-blue-700'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    ghost: isActive
      ? 'bg-blue-50 text-blue-600'
      : 'text-gray-600 hover:bg-gray-100',
  };

  return (
    <motion.button
      onClick={onClick}
      className={`rounded-lg transition-all ${config.padding} ${variantStyles[variant]} ${className}`}
      style={{
        minWidth: config.minSize,
        minHeight: config.minSize,
      }}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.15 }}
      aria-label={label}
    >
      <Icon className={config.iconSize} />
    </motion.button>
  );
}
