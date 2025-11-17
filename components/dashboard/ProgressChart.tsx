'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { StatusBreakdown } from '@/components/ui/StatusBreakdown';
import { AttendanceStats } from '@/types/types';
import { ANIMATION_DURATIONS } from '@/lib/constants';

interface ProgressChartProps {
  stats: AttendanceStats;
  className?: string;
}

/**
 * Progress chart component showing attendance overview
 * Combines circular progress ring with status breakdown bars
 * 
 * @param stats - Attendance statistics
 * @param className - Additional CSS classes
 */
export function ProgressChart({ stats, className = '' }: ProgressChartProps) {
  return (
    <Card className={`border-0 shadow-lg ${className}`}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-900 text-center">
          نمای کلی حضور و غیاب
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Circular Progress Ring */}
          <div className="flex justify-center">
            <ProgressRing
              percentage={stats.attendancePercentage}
              size={200}
              strokeWidth={8}
              duration={ANIMATION_DURATIONS.progressRing}
              className="drop-shadow-sm"
            />
          </div>
          
          {/* Status Breakdown */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-slate-800 mb-4 text-center lg:text-right">
              تفکیک وضعیت حضور
            </h3>
            <StatusBreakdown
              stats={stats}
              animationDelay={ANIMATION_DURATIONS.progressRing + 300}
            />
          </div>
        </div>
        
        {/* Summary Statistics */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {stats.totalDays}
              </div>
              <div className="text-sm text-slate-600">کل روزها</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">
                {stats.presentDays}
              </div>
              <div className="text-sm text-slate-600">حاضر</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {stats.absentDays}
              </div>
              <div className="text-sm text-slate-600">غایب</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(stats.attendancePercentage)}%
              </div>
              <div className="text-sm text-slate-600">درصد حضور</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}