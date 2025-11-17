'use client';

import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Heart, Plane } from 'lucide-react';
import { STATUS_COLORS } from '@/lib/constants';
import { AttendanceStats } from '@/types/types';

interface StatusBreakdownProps {
  stats: AttendanceStats;
  animationDelay?: number;
  className?: string;
}

interface StatusItem {
  key: keyof Pick<AttendanceStats, 'presentDays' | 'absentDays' | 'sickDays' | 'leaveDays'>;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: typeof STATUS_COLORS[keyof typeof STATUS_COLORS];
  gradient: string;
}

const statusItems: StatusItem[] = [
  {
    key: 'presentDays',
    label: 'حاضر',
    icon: CheckCircle,
    color: STATUS_COLORS.present,
    gradient: 'from-emerald-400 to-emerald-600',
  },
  {
    key: 'absentDays',
    label: 'غایب',
    icon: XCircle,
    color: STATUS_COLORS.absent,
    gradient: 'from-red-400 to-red-600',
  },
  {
    key: 'sickDays',
    label: 'مریض',
    icon: Heart,
    color: STATUS_COLORS.sick,
    gradient: 'from-amber-400 to-amber-600',
  },
  {
    key: 'leaveDays',
    label: 'مرخصی',
    icon: Plane,
    color: STATUS_COLORS.leave,
    gradient: 'from-cyan-400 to-cyan-600',
  },
];

/**
 * Status breakdown component with animated progress bars
 * Shows horizontal bars for Present, Absent, Sick, Leave statuses
 * 
 * @param stats - Attendance statistics
 * @param animationDelay - Delay before animation starts in ms (default: 300)
 * @param className - Additional CSS classes
 */
export function StatusBreakdown({
  stats,
  animationDelay = 300,
  className = '',
}: StatusBreakdownProps) {
  const totalDays = stats.totalDays || 1; // Prevent division by zero

  return (
    <div className={`space-y-4 ${className}`}>
      {statusItems.map((item, index) => {
        const value = stats[item.key];
        const percentage = (value / totalDays) * 100;
        const Icon = item.icon;

        return (
          <div key={item.key} className="flex items-center gap-4">
            {/* Icon container */}
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: item.color.bg }}
            >
              <Icon 
                className="w-5 h-5"
                style={{ color: item.color.main }}
              />
            </div>

            {/* Progress bar and label */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">
                  {item.label}
                </span>
                <span className="text-sm font-semibold" style={{ color: item.color.text }}>
                  {value} روز
                </span>
              </div>
              
              {/* Progress bar container */}
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${item.gradient} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{
                    duration: 0.8,
                    delay: (animationDelay + index * 100) / 1000,
                    ease: "easeOut",
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}