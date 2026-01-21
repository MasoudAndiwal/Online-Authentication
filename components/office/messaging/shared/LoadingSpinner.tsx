'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  label?: string;
}

/**
 * LoadingSpinner Component
 * 
 * Displays an animated loading spinner with gradient colors.
 * Supports three sizes: small, medium, and large.
 * 
 * Requirements: 19.1, 19.2, 19.3
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  className = '',
  label = 'Loading',
}) => {
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 56,
  };

  const spinnerSize = sizeMap[size];
  const strokeWidth = size === 'small' ? 3 : size === 'medium' ? 4 : 5;

  return (
    <div
      className={`loading-spinner ${className}`}
      role="status"
      aria-label={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.svg
        width={spinnerSize}
        height={spinnerSize}
        viewBox="0 0 50 50"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <defs>
          <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#667eea" />
            <stop offset="100%" stopColor="#764ba2" />
          </linearGradient>
        </defs>
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="url(#spinner-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray="80, 200"
          strokeDashoffset="0"
        />
      </motion.svg>
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default LoadingSpinner;
