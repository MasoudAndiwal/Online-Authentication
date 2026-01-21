/**
 * Card Component
 * 
 * Professional card component with shadow-based separation (no borders)
 * Requirements: 22.2
 * 
 * Features:
 * - Shadow-based visual separation
 * - Multiple shadow depths (sm, md, lg, xl)
 * - Glow effects for important elements
 * - Hover animations
 * - No black borders
 */

'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

type ShadowDepth = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'glow' | 'glow-strong';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  shadow?: ShadowDepth;
  hoverLift?: boolean;
  glass?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  children?: React.ReactNode;
}

// ============================================================================
// Styles
// ============================================================================

const shadowStyles: Record<ShadowDepth, string> = {
  none: '',
  sm: 'shadow-[0_2px_4px_rgba(0,0,0,0.05)]',
  md: 'shadow-[0_4px_6px_rgba(0,0,0,0.07)]',
  lg: 'shadow-[0_10px_15px_rgba(0,0,0,0.1)]',
  xl: 'shadow-[0_20px_25px_rgba(0,0,0,0.15)]',
  '2xl': 'shadow-[0_25px_50px_rgba(0,0,0,0.2)]',
  glow: 'shadow-[0_0_20px_rgba(33,150,243,0.3)]',
  'glow-strong': 'shadow-[0_0_30px_rgba(33,150,243,0.5)]',
};

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const roundedStyles = {
  none: '',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
};

// ============================================================================
// Component
// ============================================================================

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      shadow = 'md',
      hoverLift = false,
      glass = false,
      padding = 'md',
      rounded = 'lg',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    // Build className
    const cardClassName = [
      // Base styles
      'relative',
      
      // Background
      glass ? 'glass-card' : 'bg-white',
      
      // Shadow
      shadowStyles[shadow],
      
      // Padding
      paddingStyles[padding],
      
      // Rounded corners
      roundedStyles[rounded],
      
      // Hover lift effect
      hoverLift ? 'transition-all duration-250' : '',
      
      // Custom className
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // Animation variants for hover lift
    const hoverVariants = hoverLift
      ? {
          rest: { y: 0, boxShadow: shadowStyles[shadow] },
          hover: {
            y: -4,
            boxShadow: '0 12px 20px rgba(0,0,0,0.12)',
          },
        }
      : undefined;

    return (
      <motion.div
        ref={ref}
        className={cardClassName}
        variants={hoverVariants}
        initial="rest"
        whileHover={hoverLift ? 'hover' : undefined}
        transition={{ duration: 0.25 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

// ============================================================================
// Specialized Card Components
// ============================================================================

/**
 * GlowCard - Card with glow effect for important elements
 */
interface GlowCardProps extends Omit<CardProps, 'shadow'> {
  strong?: boolean;
}

export const GlowCard = React.forwardRef<HTMLDivElement, GlowCardProps>(
  ({ strong = false, ...props }, ref) => {
    return <Card ref={ref} shadow={strong ? 'glow-strong' : 'glow'} {...props} />;
  }
);

GlowCard.displayName = 'GlowCard';

/**
 * GlassCard - Card with glassmorphism effect
 */
export const GlassCard = React.forwardRef<HTMLDivElement, Omit<CardProps, 'glass'>>(
  (props, ref) => {
    return <Card ref={ref} glass {...props} />;
  }
);

GlassCard.displayName = 'GlassCard';

/**
 * InteractiveCard - Card with hover lift effect
 */
export const InteractiveCard = React.forwardRef<HTMLDivElement, Omit<CardProps, 'hoverLift'>>(
  (props, ref) => {
    return <Card ref={ref} hoverLift {...props} />;
  }
);

InteractiveCard.displayName = 'InteractiveCard';

/**
 * SeparatorCard - Card specifically for visual separation
 */
export const SeparatorCard = React.forwardRef<HTMLDivElement, Omit<CardProps, 'shadow'>>(
  (props, ref) => {
    return <Card ref={ref} shadow="sm" {...props} />;
  }
);

SeparatorCard.displayName = 'SeparatorCard';
