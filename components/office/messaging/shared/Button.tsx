/**
 * Button Component
 * 
 * Professional button component with gradient fills and animations
 * Requirements: 22.1
 * 
 * Features:
 * - Gradient-filled primary buttons
 * - Solid color secondary buttons
 * - Icon buttons with glass effect
 * - Hover animations (translateY, scale)
 * - No outline buttons
 */

'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'icon';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
  fullWidth?: boolean;
}

// ============================================================================
// Styles
// ============================================================================

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white shadow-md hover:shadow-lg',
  secondary: 'bg-[#2196F3] text-white shadow-sm hover:bg-[#1976D2] hover:shadow-md',
  success: 'bg-gradient-to-br from-[#4CAF50] to-[#388E3C] text-white shadow-md hover:shadow-lg',
  danger: 'bg-gradient-to-br from-[#F44336] to-[#D32F2F] text-white shadow-md hover:shadow-lg',
  icon: 'bg-white/70 backdrop-blur-md text-gray-700 hover:bg-white/90',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

const iconSizeStyles: Record<ButtonSize, string> = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-3',
};

// ============================================================================
// Animation Variants
// ============================================================================

const buttonVariants = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -2 },
  tap: { scale: 0.98, y: 0 },
};

const iconButtonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

// ============================================================================
// Component
// ============================================================================

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      fullWidth = false,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const isIconButton = variant === 'icon';
    const isDisabled = disabled || isLoading;

    // Build className
    const buttonClassName = [
      // Base styles
      'inline-flex items-center justify-center gap-2',
      'font-medium rounded-lg',
      'border-none outline-none',
      'transition-all duration-250',
      'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      
      // Variant styles
      variantStyles[variant],
      
      // Size styles
      isIconButton ? iconSizeStyles[size] : sizeStyles[size],
      
      // Full width
      fullWidth ? 'w-full' : '',
      
      // Custom className
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // Animation variants based on button type
    const animationVariants = isIconButton ? iconButtonVariants : buttonVariants;

    return (
      <motion.button
        ref={ref}
        className={buttonClassName}
        disabled={isDisabled}
        variants={animationVariants}
        initial="rest"
        whileHover={!isDisabled ? 'hover' : 'rest'}
        whileTap={!isDisabled ? 'tap' : 'rest'}
        transition={{ duration: 0.15 }}
        {...props}
      >
        {/* Left icon or loading spinner */}
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : leftIcon ? (
          <span className="flex-shrink-0">{leftIcon}</span>
        ) : null}

        {/* Button content */}
        {children && <span>{children}</span>}

        {/* Right icon */}
        {rightIcon && !isLoading && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

// ============================================================================
// Specialized Button Components
// ============================================================================

/**
 * IconButton - Button with only an icon
 */
interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, ...props }, ref) => {
    return (
      <Button ref={ref} variant="icon" {...props}>
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

/**
 * GradientButton - Primary gradient button (alias for convenience)
 */
export const GradientButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => {
    return <Button ref={ref} variant="primary" {...props} />;
  }
);

GradientButton.displayName = 'GradientButton';

/**
 * SolidButton - Secondary solid color button (alias for convenience)
 */
export const SolidButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => {
    return <Button ref={ref} variant="secondary" {...props} />;
  }
);

SolidButton.displayName = 'SolidButton';
