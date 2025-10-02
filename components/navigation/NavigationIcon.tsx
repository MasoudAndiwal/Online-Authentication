"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface NavigationIconProps {
  icon: React.ComponentType<{ className?: string }>;
  isHovered?: boolean;
  isActive?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "3d" | "glow";
  className?: string;
}

// Animation configurations for different effects
const iconAnimations = {
  hover: {
    scale: 1.1,
    rotateY: 5,
    rotateX: -2,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
  active: {
    scale: 1.05,
    rotateZ: 2,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
    },
  },
};

const glowAnimations = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

export const NavigationIcon: React.FC<NavigationIconProps> = ({
  icon: Icon,
  isHovered = false,
  isActive = false,
  size = "md",
  variant = "3d",
  className,
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const baseClasses = cn(
    "relative transition-colors duration-300",
    sizeClasses[size],
    className
  );

  const iconColorClasses = cn(
    "transition-colors duration-300",
    isActive && "text-blue-600",
    isHovered && !isActive && "text-blue-500",
    !isHovered && !isActive && "text-slate-600"
  );

  if (variant === "default") {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={baseClasses}
      >
        <Icon className={iconColorClasses} />
      </motion.div>
    );
  }

  if (variant === "glow") {
    return (
      <motion.div
        className={cn(baseClasses, "perspective-1000")}
        whileHover={iconAnimations.hover}
        whileTap={iconAnimations.tap}
        animate={isActive ? iconAnimations.active : {}}
      >
        {/* Glow effect background */}
        {(isHovered || isActive) && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={glowAnimations}
            className={cn(
              "absolute inset-0 rounded-lg blur-sm",
              isActive ? "bg-blue-400/30" : "bg-blue-300/20",
              "-z-10"
            )}
          />
        )}
        
        {/* Main icon */}
        <Icon className={iconColorClasses} />
      </motion.div>
    );
  }

  // 3D variant (default)
  return (
    <motion.div
      className={cn(baseClasses, "perspective-1000")}
      whileHover={iconAnimations.hover}
      whileTap={iconAnimations.tap}
      animate={isActive ? iconAnimations.active : {}}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {/* Shadow layer for 3D effect */}
      <motion.div
        className={cn(
          "absolute inset-0 rounded-lg opacity-20",
          isActive ? "bg-blue-600" : "bg-slate-400",
          "transform translate-x-0.5 translate-y-0.5 -z-10"
        )}
        animate={{
          opacity: isHovered || isActive ? 0.3 : 0.1,
          scale: isHovered ? 1.1 : 1,
        }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Glow effect for 3D variant */}
      {(isHovered || isActive) && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={glowAnimations}
          className={cn(
            "absolute inset-0 rounded-lg blur-md",
            isActive ? "bg-blue-500/25" : "bg-blue-400/15",
            "-z-20"
          )}
        />
      )}
      
      {/* Main icon with 3D transform */}
      <motion.div
        className="relative z-10"
        animate={{
          rotateY: isHovered ? 5 : 0,
          rotateX: isHovered ? -2 : 0,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <Icon className={iconColorClasses} />
      </motion.div>
    </motion.div>
  );
};

// Animated Chevron component for dropdown indicators
export interface AnimatedChevronProps {
  isExpanded: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const AnimatedChevron: React.FC<AnimatedChevronProps> = ({
  isExpanded,
  size = "md",
  className,
}) => {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <motion.div
      animate={{ rotate: isExpanded ? 90 : 0 }}
      transition={{ 
        duration: 0.3, 
        ease: "easeOut",
        type: "spring",
        stiffness: 200,
        damping: 15,
      }}
      className={cn("transition-colors duration-200", className)}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(sizeClasses[size], "transition-colors duration-200")}
      >
        <polyline points="9,18 15,12 9,6" />
      </svg>
    </motion.div>
  );
};

// Hover indicator bar component
export interface HoverIndicatorProps {
  isVisible: boolean;
  variant?: "left" | "bottom" | "glow";
  className?: string;
}

export const HoverIndicator: React.FC<HoverIndicatorProps> = ({
  isVisible,
  variant = "left",
  className,
}) => {
  const baseClasses = "bg-gradient-to-b from-blue-500 to-purple-500";
  
  if (variant === "left") {
    return (
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isVisible ? 1 : 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 rounded-r origin-left",
          baseClasses,
          className
        )}
      />
    );
  }

  if (variant === "bottom") {
    return (
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isVisible ? 1 : 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          "absolute bottom-0 left-0 right-0 h-0.5 rounded-t origin-center",
          baseClasses,
          className
        )}
      />
    );
  }

  // Glow variant
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0.8,
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "absolute inset-0 rounded-lg blur-sm pointer-events-none",
        "bg-gradient-to-r from-blue-500/20 to-purple-500/20",
        className
      )}
    />
  );
};

// Status badge with pulse animation
export interface StatusBadgeProps {
  count?: number | string;
  variant?: "primary" | "success" | "warning" | "error";
  pulse?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  count,
  variant = "primary",
  pulse = false,
  className,
}) => {
  const variantClasses = {
    primary: "bg-blue-100 text-blue-700 border-blue-200",
    success: "bg-green-100 text-green-700 border-green-200",
    warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
    error: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ 
        delay: 0.2, 
        type: "spring", 
        stiffness: 300,
        damping: 20,
      }}
      className={cn(
        "inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full border",
        variantClasses[variant],
        pulse && "animate-pulse",
        className
      )}
    >
      {count}
    </motion.div>
  );
};