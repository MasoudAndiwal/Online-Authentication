'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface StaggerChildrenProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
}

/**
 * StaggerChildren animation wrapper component
 * Provides staggered entrance animation for child elements
 * 
 * @param children - Child elements to animate with stagger effect
 * @param staggerDelay - Delay between each child animation (default: 0.1s / 100ms)
 * @param delayChildren - Initial delay before first child animates (default: 0s)
 */
export function StaggerChildren({
  children,
  staggerDelay = 0.1,
  delayChildren = 0,
  ...props
}: StaggerChildrenProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren,
          },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerItem component to be used as direct children of StaggerChildren
 * Provides the animation variants for individual items
 */
export function StaggerItem({
  children,
  ...props
}: Omit<HTMLMotionProps<'div'>, 'variants'>) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
            ease: 'easeOut',
          },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
