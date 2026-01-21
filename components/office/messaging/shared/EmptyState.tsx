'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * EmptyState Component
 * 
 * Displays an empty state with an illustration, title, description, and optional action button.
 * Used when there are no conversations, messages, or search results.
 * 
 * Requirements: 19.1, 19.2, 19.3
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = '',
}) => {
  return (
    <motion.div
      className={`empty-state ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        minHeight: '400px',
      }}
    >
      {/* Icon/Illustration */}
      {icon ? (
        <div
          style={{
            marginBottom: '1.5rem',
            fontSize: '4rem',
            opacity: 0.6,
          }}
        >
          {icon}
        </div>
      ) : (
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            width: '120px',
            height: '120px',
            marginBottom: '1.5rem',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="60"
            height="60"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: '#667eea' }}
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </motion.div>
      )}

      {/* Title */}
      <h3
        style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: '#212121',
          marginBottom: '0.5rem',
        }}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          style={{
            fontSize: '0.875rem',
            color: '#757575',
            maxWidth: '400px',
            marginBottom: action ? '1.5rem' : '0',
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      )}

      {/* Action Button */}
      {action && (
        <motion.button
          onClick={action.onClick}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#FFFFFF',
            fontSize: '0.875rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'all 0.25s ease',
          }}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
};

export default EmptyState;
