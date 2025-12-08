'use client';

import React, { useRef, useEffect, ReactNode } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface ScrollFloatProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  duration?: number;
  delay?: number;
  rotate?: number;
  scale?: number;
  opacity?: boolean;
}

const ScrollFloat: React.FC<ScrollFloatProps> = ({
  children,
  className = '',
  direction = 'up',
  distance = 100,
  duration = 0.8,
  delay = 0,
  rotate = 0,
  scale = 1,
  opacity = true,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };

  const getTransformValue = () => {
    switch (direction) {
      case 'up':
        return { y: [distance, 0] };
      case 'down':
        return { y: [-distance, 0] };
      case 'left':
        return { x: [distance, 0] };
      case 'right':
        return { x: [-distance, 0] };
      default:
        return { y: [distance, 0] };
    }
  };

  const transform = getTransformValue();
  const yValue = useTransform(scrollYProgress, [0, 0.5], transform.y || [0, 0]);
  const xValue = useTransform(scrollYProgress, [0, 0.5], transform.x || [0, 0]);
  const opacityValue = useTransform(scrollYProgress, [0, 0.3], opacity ? [0, 1] : [1, 1]);
  const rotateValue = useTransform(scrollYProgress, [0, 0.5], [rotate, 0]);
  const scaleValue = useTransform(scrollYProgress, [0, 0.5], [scale, 1]);

  const springY = useSpring(yValue, springConfig);
  const springX = useSpring(xValue, springConfig);
  const springOpacity = useSpring(opacityValue, springConfig);
  const springRotate = useSpring(rotateValue, springConfig);
  const springScale = useSpring(scaleValue, springConfig);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        y: springY,
        x: springX,
        opacity: springOpacity,
        rotate: springRotate,
        scale: springScale,
      }}
      transition={{ duration, delay }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollFloat;
