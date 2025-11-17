'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface FadeInProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
}

/**
 * FadeIn animation wrapper component
 * Provides smooth fade-in with subtle y-offset animation
 * 
 * @param children - Content to animate
 * @param delay - Delay before animation starts (in seconds)
 * @param duration - Animation duration (default: 0.4s)
 * @param yOffset - Vertical offset for slide effect (default: 10px)
 */
export function FadeIn({
  children,
  delay = 0,
  duration = 0.4,
  yOffset = 10,
  ...props
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration,
        delay,
        ease: 'easeOut',
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
