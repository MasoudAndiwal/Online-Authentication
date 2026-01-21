/**
 * Animated Components
 * 
 * Pre-configured animated components using Framer Motion
 * Requirements: 22.4
 * 
 * Features:
 * - Message send/receive animations
 * - Typing indicator animation
 * - Button hover animations
 * - Notification slide-in animation
 * - Reaction pop animation
 * - Unread badge pulse animation
 * - Modal backdrop and content animations
 * - Sidebar slide animation
 * - Loading spinner animation
 */

'use client';

import React from 'react';
import { motion, AnimatePresence, type HTMLMotionProps } from 'framer-motion';
import { animations } from '@/lib/design-system/office-messaging-visual';

// ============================================================================
// Message Animations
// ============================================================================

/**
 * AnimatedMessageSend - Animation for sent messages
 */
export const AnimatedMessageSend: React.FC<HTMLMotionProps<'div'>> = ({ children, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * AnimatedMessageReceive - Animation for received messages
 */
export const AnimatedMessageReceive: React.FC<HTMLMotionProps<'div'>> = ({ children, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ============================================================================
// Typing Indicator Animation
// ============================================================================

/**
 * AnimatedTypingDot - Single animated dot for typing indicator
 */
interface AnimatedTypingDotProps {
  delay?: number;
  className?: string;
}

export const AnimatedTypingDot: React.FC<AnimatedTypingDotProps> = ({ delay = 0, className = '' }) => {
  return (
    <motion.div
      className={`w-2 h-2 rounded-full bg-gray-400 ${className}`}
      animate={{ y: [0, -8, 0] }}
      transition={{
        duration: 0.6,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    />
  );
};

/**
 * AnimatedTypingIndicator - Complete typing indicator with three dots
 */
export const AnimatedTypingIndicator: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <AnimatedTypingDot delay={0} />
      <AnimatedTypingDot delay={0.2} />
      <AnimatedTypingDot delay={0.4} />
    </div>
  );
};

// ============================================================================
// Notification Animations
// ============================================================================

/**
 * AnimatedNotification - Slide-in animation for notifications
 */
export const AnimatedNotification: React.FC<HTMLMotionProps<'div'>> = ({ children, ...props }) => {
  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ============================================================================
// Reaction Animation
// ============================================================================

/**
 * AnimatedReaction - Pop animation for reactions
 */
export const AnimatedReaction: React.FC<HTMLMotionProps<'div'>> = ({ children, ...props }) => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: [0, 1.2, 1] }}
      exit={{ scale: 0 }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ============================================================================
// Badge Animation
// ============================================================================

/**
 * AnimatedBadge - Pulse animation for unread badges
 */
export const AnimatedBadge: React.FC<HTMLMotionProps<'div'>> = ({ children, ...props }) => {
  return (
    <motion.div
      animate={{
        scale: [1, 1.1, 1],
        opacity: [1, 0.8, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ============================================================================
// Modal Animations
// ============================================================================

/**
 * AnimatedModalBackdrop - Backdrop fade animation
 */
export const AnimatedModalBackdrop: React.FC<HTMLMotionProps<'div'>> = ({ children, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * AnimatedModalContent - Modal content scale animation
 */
export const AnimatedModalContent: React.FC<HTMLMotionProps<'div'>> = ({ children, ...props }) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ============================================================================
// Sidebar Animation
// ============================================================================

/**
 * AnimatedSidebar - Slide animation for sidebar
 */
interface AnimatedSidebarProps extends HTMLMotionProps<'div'> {
  direction?: 'left' | 'right';
}

export const AnimatedSidebar: React.FC<AnimatedSidebarProps> = ({ 
  direction = 'left', 
  children, 
  ...props 
}) => {
  const initialX = direction === 'left' ? -320 : 320;
  
  return (
    <motion.div
      initial={{ x: initialX }}
      animate={{ x: 0 }}
      exit={{ x: initialX }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ============================================================================
// Loading Spinner Animation
// ============================================================================

/**
 * AnimatedSpinner - Rotating spinner animation
 */
interface AnimatedSpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

export const AnimatedSpinner: React.FC<AnimatedSpinnerProps> = ({ 
  size = 24, 
  color = '#2196F3',
  className = '' 
}) => {
  return (
    <motion.div
      className={`inline-block ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="60"
          strokeDashoffset="15"
          opacity="0.25"
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="60"
          strokeDashoffset="15"
        />
      </svg>
    </motion.div>
  );
};

// ============================================================================
// Fade Animation
// ============================================================================

/**
 * AnimatedFade - Simple fade in/out animation
 */
export const AnimatedFade: React.FC<HTMLMotionProps<'div'>> = ({ children, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ============================================================================
// Scale Animation
// ============================================================================

/**
 * AnimatedScale - Scale in/out animation
 */
export const AnimatedScale: React.FC<HTMLMotionProps<'div'>> = ({ children, ...props }) => {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ============================================================================
// Slide Animations
// ============================================================================

/**
 * AnimatedSlideUp - Slide up animation
 */
export const AnimatedSlideUp: React.FC<HTMLMotionProps<'div'>> = ({ children, ...props }) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * AnimatedSlideDown - Slide down animation
 */
export const AnimatedSlideDown: React.FC<HTMLMotionProps<'div'>> = ({ children, ...props }) => {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * AnimatedSlideLeft - Slide from left animation
 */
export const AnimatedSlideLeft: React.FC<HTMLMotionProps<'div'>> = ({ children, ...props }) => {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * AnimatedSlideRight - Slide from right animation
 */
export const AnimatedSlideRight: React.FC<HTMLMotionProps<'div'>> = ({ children, ...props }) => {
  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 20, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ============================================================================
// List Animation
// ============================================================================

/**
 * AnimatedList - Staggered animation for list items
 */
interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({ 
  children, 
  className = '',
  staggerDelay = 0.05 
}) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * AnimatedListItem - Individual list item with fade-in animation
 */
export const AnimatedListItem: React.FC<HTMLMotionProps<'div'>> = ({ children, ...props }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ============================================================================
// Hover Animation Wrapper
// ============================================================================

/**
 * AnimatedHover - Wrapper for hover animations
 */
interface AnimatedHoverProps extends HTMLMotionProps<'div'> {
  scale?: number;
  lift?: number;
}

export const AnimatedHover: React.FC<AnimatedHoverProps> = ({ 
  scale = 1.02, 
  lift = -2,
  children, 
  ...props 
}) => {
  return (
    <motion.div
      whileHover={{ scale, y: lift }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ============================================================================
// Presence Wrapper
// ============================================================================

/**
 * AnimatedPresence - Wrapper for AnimatePresence with common settings
 */
interface AnimatedPresenceWrapperProps {
  children: React.ReactNode;
  mode?: 'wait' | 'sync' | 'popLayout';
}

export const AnimatedPresenceWrapper: React.FC<AnimatedPresenceWrapperProps> = ({ 
  children, 
  mode = 'wait' 
}) => {
  return <AnimatePresence mode={mode}>{children}</AnimatePresence>;
};
