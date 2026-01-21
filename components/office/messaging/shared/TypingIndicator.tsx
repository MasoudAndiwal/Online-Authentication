'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  userName?: string;
  className?: string;
}

/**
 * TypingIndicator Component
 * 
 * Displays an animated typing indicator with three pulsing dots.
 * Shows the user's name if provided.
 * 
 * Requirements: 19.1, 19.2, 19.3
 */
export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  userName,
  className = '',
}) => {
  const dotVariants = {
    animate: {
      y: [0, -8, 0],
    },
  };

  const dotTransition = {
    duration: 0.6,
    repeat: Infinity,
    ease: 'easeInOut',
  };

  return (
    <div
      className={`typing-indicator ${className}`}
      role="status"
      aria-live="polite"
      aria-label={userName ? `${userName} is typing` : 'Someone is typing'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 0.75rem',
        fontSize: '0.875rem',
        color: '#757575',
      }}
    >
      {userName && (
        <span style={{ fontWeight: 500 }}>
          {userName}
        </span>
      )}
      <span style={{ marginRight: '0.25rem' }}>is typing</span>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
        }}
      >
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            variants={dotVariants}
            animate="animate"
            transition={{
              ...dotTransition,
              delay: index * 0.15,
            }}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TypingIndicator;
