'use client';

import { CheckCircle2, XCircle, Thermometer, Calendar } from 'lucide-react';
import { AttendanceStats } from '@/types/types';
import { CountUp } from '@/components/animations/CountUp';
import { StaggerChildren, StaggerItem } from '@/components/animations/StaggerChildren';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
  stats: AttendanceStats;
}

interface StatCard {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  colorClasses: {
    bg: string;
    icon: string;
    border: string;
  };
}

/**
 * StatsCards component displays attendance statistics in a responsive grid
 * Features:
 * - Responsive grid layout (1 col mobile, 2 col tablet, 4 col desktop)
 * - Borderless cards with shadow-sm and left border accent
 * - Icon containers with solid color backgrounds
 * - Count-up animation for numbers
 * - Smooth hover effects with scale and shadow transitions
 * - Staggered entrance animation (100ms delay)
 */
export function StatsCards({ stats }: StatsCardsProps) {
  const statCards: StatCard[] = [
    {
      label: 'Present Days',
      value: stats.presentDays,
      icon: CheckCircle2,
      colorClasses: {
        bg: 'bg-emerald-100',
        icon: 'text-emerald-600',
        border: 'border-emerald-500',
      },
    },
    {
      label: 'Absent Days',
      value: stats.absentDays,
      icon: XCircle,
      colorClasses: {
        bg: 'bg-red-100',
        icon: 'text-red-600',
        border: 'border-red-500',
      },
    },
    {
      label: 'Sick Days',
      value: stats.sickDays,
      icon: Thermometer,
      colorClasses: {
        bg: 'bg-amber-100',
        icon: 'text-amber-600',
        border: 'border-amber-500',
      },
    },
    {
      label: 'Leave Days',
      value: stats.leaveDays,
      icon: Calendar,
      colorClasses: {
        bg: 'bg-cyan-100',
        icon: 'text-cyan-600',
        border: 'border-cyan-500',
      },
    },
  ];

  return (
    <StaggerChildren
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
      staggerDelay={0.1}
    >
      {statCards.map((card) => (
        <StaggerItem key={card.label}>
          <StatCardItem card={card} />
        </StaggerItem>
      ))}
    </StaggerChildren>
  );
}

interface StatCardItemProps {
  card: StatCard;
}

function StatCardItem({ card }: StatCardItemProps) {
  const Icon = card.icon;

  return (
    <article
      className={cn(
        // Base styles - borderless with shadow
        'bg-white border-0 shadow-sm rounded-xl p-6',
        // Left border accent
        'border-l-4',
        card.colorClasses.border,
        // Smooth hover effect
        'transition-all duration-300 hover:shadow-md hover:-translate-y-1',
        // Ensure proper structure
        'flex flex-col gap-4',
        // Focus styles for keyboard navigation
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
      )}
      tabIndex={0}
      role="region"
      aria-label={`${card.label}: ${card.value}`}
    >
      {/* Icon container with solid color background */}
      <div
        className={cn(
          'w-12 h-12 rounded-lg flex items-center justify-center',
          card.colorClasses.bg
        )}
        aria-hidden="true"
      >
        <Icon className={cn('w-6 h-6', card.colorClasses.icon)} />
      </div>

      {/* Number with count-up animation */}
      <div className="flex flex-col gap-1">
        <div aria-live="polite" aria-atomic="true">
          <CountUp
            end={card.value}
            duration={1200}
            className="text-3xl font-bold text-slate-900"
          />
        </div>
        
        {/* Label */}
        <p className="text-sm text-slate-600">{card.label}</p>
      </div>
    </article>
  );
}
