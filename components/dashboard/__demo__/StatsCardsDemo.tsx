'use client';

import { StatsCards } from '../StatsCards';
import { AttendanceStats } from '@/types/types';

/**
 * Demo component to showcase StatsCards functionality
 * This is for development/testing purposes only
 */
export function StatsCardsDemo() {
  // Mock data for demonstration
  const mockStats: AttendanceStats = {
    totalDays: 120,
    presentDays: 95,
    absentDays: 15,
    sickDays: 7,
    leaveDays: 3,
    attendancePercentage: 79.17,
    pureAbsenceHours: 15,
    combinedAbsenceHours: 25,
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            StatsCards Component Demo
          </h1>
          <p className="text-slate-600">
            Responsive grid with animated statistics cards
          </p>
        </div>

        <div className="bg-white border-0 shadow-lg rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            Attendance Statistics
          </h2>
          <StatsCards stats={mockStats} />
        </div>

        <div className="bg-white border-0 shadow-lg rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Features Implemented
          </h2>
          <ul className="space-y-2 text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-1">✓</span>
              <span>Responsive grid layout (1 col mobile, 2 col tablet, 4 col desktop)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-1">✓</span>
              <span>Borderless cards with shadow-sm and left border accent</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-1">✓</span>
              <span>Icon containers with solid color backgrounds (emerald, red, amber, cyan)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-1">✓</span>
              <span>Count-up animation for numbers (1.2s duration)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-1">✓</span>
              <span>Smooth hover effects with scale and shadow transitions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-1">✓</span>
              <span>Staggered entrance animation (100ms delay between cards)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
