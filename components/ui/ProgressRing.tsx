'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { CountUp } from '@/components/animations/CountUp';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showPercentage?: boolean;
  animationDelay?: number;
  duration?: number;
}

/**
 * Circular progress ring with gradient stroke and animated percentage
 * 
 * @param percentage - Progress percentage (0-100)
 * @param size - Ring diameter in pixels (default: 200)
 * @param strokeWidth - Ring stroke width (default: 8)
 * @param className - Additional CSS classes
 * @param showPercentage - Whether to show percentage in center (default: true)
 * @param animationDelay - Delay before animation starts in ms (default: 0)
 * @param duration - Animation duration in ms (default: 1500)
 */
export function ProgressRing({
  percentage,
  size = 200,
  strokeWidth = 8,
  className = '',
  showPercentage = true,
  animationDelay = 0,
  duration = 1500,
}: ProgressRingProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Calculate circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, animationDelay);

    return () => clearTimeout(timer);
  }, [animationDelay]);

  return (
    <div 
      className={`relative inline-flex items-center justify-center ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(percentage)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`نسبة الحضور: ${Math.round(percentage)}%`}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-slate-200"
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progress-gradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={isAnimating ? { strokeDashoffset } : { strokeDashoffset: circumference }}
          transition={{
            duration: duration / 1000,
            ease: "easeInOut",
          }}
        />
      </svg>
      
      {/* Center percentage display */}
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-600 bg-clip-text text-transparent">
              {isAnimating ? (
                <CountUp
                  end={percentage}
                  duration={duration}
                  suffix="%"
                  className="tabular-nums"
                />
              ) : (
                "0%"
              )}
            </div>
            <div className="text-sm text-slate-600 mt-1">حضور</div>
          </div>
        </div>
      )}
    </div>
  );
}