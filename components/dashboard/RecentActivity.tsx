'use client';

import { AttendanceRecord, AttendanceStatus } from '@/types/types';
import { StaggerChildren, StaggerItem } from '@/components/animations/StaggerChildren';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, XCircle, AlertCircle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecentActivityProps {
  records: AttendanceRecord[];
  onViewFullHistory?: () => void;
}

/**
 * RecentActivity component displays the 10 most recent attendance records
 * with staggered entrance animations and hover effects
 */
export function RecentActivity({ records, onViewFullHistory }: RecentActivityProps) {
  // Take only the 10 most recent records
  const recentRecords = records.slice(0, 10);

  return (
    <div className="bg-white border-0 shadow-sm rounded-xl p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
          Recent Activity
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Your latest attendance records
        </p>
      </div>

      {/* Activity List */}
      {recentRecords.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600">No attendance records yet</p>
        </div>
      ) : (
        <StaggerChildren staggerDelay={0.1} className="space-y-2">
          {recentRecords.map((record) => (
            <StaggerItem key={record.id}>
              <ActivityItem record={record} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      )}

      {/* View Full History Button */}
      {recentRecords.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          <Button
            onClick={onViewFullHistory}
            className="w-full bg-gradient-to-r from-blue-500 to-violet-500 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 group"
          >
            View Full History
            <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * ActivityItem component for individual attendance record
 */
function ActivityItem({ record }: { record: AttendanceRecord }) {
  const statusConfig = getStatusConfig(record.status);

  return (
    <div
      className="group flex items-center gap-4 p-4 rounded-lg transition-all duration-200 hover:bg-slate-50 cursor-pointer"
      role="article"
      aria-label={`${record.courseName} on ${formatDate(record.date)} - ${statusConfig.label}`}
    >
      {/* Status Icon Container (32px) */}
      <div
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:rotate-12',
          statusConfig.bgColor
        )}
      >
        <statusConfig.icon className={cn('w-5 h-5', statusConfig.iconColor)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-slate-900 truncate">
          {record.courseName}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-slate-600">
            {formatDate(record.date)} • {record.dayOfWeek}
          </p>
          {record.period && (
            <span className="text-xs text-slate-400">
              • Period {record.period}
            </span>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div
        className={cn(
          'px-3 py-1 rounded-full text-xs font-medium flex-shrink-0',
          statusConfig.badgeBg,
          statusConfig.badgeText
        )}
      >
        {statusConfig.label}
      </div>
    </div>
  );
}

/**
 * Get status configuration for icons and colors
 */
function getStatusConfig(status: AttendanceStatus) {
  const configs = {
    present: {
      icon: CheckCircle2,
      bgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-800',
      label: 'Present',
    },
    absent: {
      icon: XCircle,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      badgeBg: 'bg-red-100',
      badgeText: 'text-red-800',
      label: 'Absent',
    },
    sick: {
      icon: AlertCircle,
      bgColor: 'bg-amber-100',
      iconColor: 'text-amber-600',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
      label: 'Sick',
    },
    leave: {
      icon: FileText,
      bgColor: 'bg-cyan-100',
      iconColor: 'text-cyan-600',
      badgeBg: 'bg-cyan-100',
      badgeText: 'text-cyan-800',
      label: 'Leave',
    },
  };

  return configs[status];
}

/**
 * Format date string to readable format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}
