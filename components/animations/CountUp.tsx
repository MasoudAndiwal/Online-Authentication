'use client';

import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  end: number;
  start?: number;
  duration?: number;
  decimals?: number;
  separator?: string;
  prefix?: string;
  suffix?: string;
  className?: string;
  onComplete?: () => void;
}

/**
 * CountUp animation component
 * Animates a number from start to end value with smooth easing
 * 
 * @param end - Target number to count up to
 * @param start - Starting number (default: 0)
 * @param duration - Animation duration in milliseconds (default: 1200ms)
 * @param decimals - Number of decimal places to display (default: 0)
 * @param separator - Thousands separator (default: ',')
 * @param prefix - Text to display before the number
 * @param suffix - Text to display after the number
 * @param className - CSS classes to apply
 * @param onComplete - Callback function when animation completes
 */
export function CountUp({
  end,
  start = 0,
  duration = 1200,
  decimals = 0,
  separator = ',',
  prefix = '',
  suffix = '',
  className = '',
  onComplete,
}: CountUpProps) {
  const [count, setCount] = useState(start);
  const frameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      
      // Ease out cubic function for smooth deceleration
      const easeOutCubic = (t: number): number => {
        return 1 - Math.pow(1 - t, 3);
      };

      const easedProgress = easeOutCubic(progress);
      const currentCount = start + (end - start) * easedProgress;

      setCount(currentCount);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end);
        if (onComplete) {
          onComplete();
        }
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [end, start, duration, onComplete]);

  const formatNumber = (num: number): string => {
    const fixed = num.toFixed(decimals);
    const parts = fixed.split('.');
    
    // Add thousands separator
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    
    return parts.join('.');
  };

  return (
    <span className={className}>
      {prefix}
      {formatNumber(count)}
      {suffix}
    </span>
  );
}
