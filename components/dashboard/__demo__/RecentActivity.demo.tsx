'use client';

import { RecentActivity } from '../RecentActivity';
import { AttendanceRecord } from '@/types/types';

/**
 * Interactive demo page for RecentActivity component
 * Shows different states and variations
 */
export default function RecentActivityDemo() {
  // Sample data with all status types
  const fullRecords: AttendanceRecord[] = [
    {
      id: '1',
      date: '2024-11-17',
      dayOfWeek: 'Sunday',
      status: 'present',
      courseName: 'Advanced Calculus',
      period: 1,
    },
    {
      id: '2',
      date: '2024-11-16',
      dayOfWeek: 'Saturday',
      status: 'present',
      courseName: 'Data Structures',
      period: 2,
    },
    {
      id: '3',
      date: '2024-11-15',
      dayOfWeek: 'Friday',
      status: 'absent',
      courseName: 'Physics II',
      period: 3,
      notes: 'Unexcused absence',
    },
    {
      id: '4',
      date: '2024-11-14',
      dayOfWeek: 'Thursday',
      status: 'sick',
      courseName: 'Organic Chemistry',
      period: 1,
      notes: 'Medical certificate submitted',
    },
    {
      id: '5',
      date: '2024-11-13',
      dayOfWeek: 'Wednesday',
      status: 'leave',
      courseName: 'English Literature',
      period: 4,
      notes: 'Approved family leave',
    },
    {
      id: '6',
      date: '2024-11-12',
      dayOfWeek: 'Tuesday',
      status: 'present',
      courseName: 'World History',
      period: 2,
    },
    {
      id: '7',
      date: '2024-11-11',
      dayOfWeek: 'Monday',
      status: 'present',
      courseName: 'Biology Lab',
      period: 3,
    },
    {
      id: '8',
      date: '2024-11-10',
      dayOfWeek: 'Sunday',
      status: 'absent',
      courseName: 'Geography',
      period: 1,
    },
    {
      id: '9',
      date: '2024-11-09',
      dayOfWeek: 'Saturday',
      status: 'present',
      courseName: 'Art & Design',
      period: 4,
    },
    {
      id: '10',
      date: '2024-11-08',
      dayOfWeek: 'Friday',
      status: 'present',
      courseName: 'Physical Education',
      period: 2,
    },
    {
      id: '11',
      date: '2024-11-07',
      dayOfWeek: 'Thursday',
      status: 'sick',
      courseName: 'Computer Networks',
      period: 1,
    },
    {
      id: '12',
      date: '2024-11-06',
      dayOfWeek: 'Wednesday',
      status: 'present',
      courseName: 'Database Systems',
      period: 3,
    },
  ];

  const handleViewFullHistory = () => {
    alert('Navigating to full attendance history...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            RecentActivity Component Demo
          </h1>
          <p className="text-lg text-slate-600">
            Interactive demonstration of the RecentActivity component with various states
          </p>
        </div>

        {/* Demo Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Demo 1: Full Records (10 items) */}
          <div className="space-y-4">
            <div className="bg-white border-0 shadow-sm rounded-lg p-4">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Full Records (10 items)
              </h2>
              <p className="text-sm text-slate-600">
                Shows the standard view with 10 recent records and all status types
              </p>
            </div>
            <RecentActivity
              records={fullRecords}
              onViewFullHistory={handleViewFullHistory}
            />
          </div>

          {/* Demo 2: Few Records */}
          <div className="space-y-4">
            <div className="bg-white border-0 shadow-sm rounded-lg p-4">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Few Records (3 items)
              </h2>
              <p className="text-sm text-slate-600">
                Shows how the component looks with fewer records
              </p>
            </div>
            <RecentActivity
              records={fullRecords.slice(0, 3)}
              onViewFullHistory={handleViewFullHistory}
            />
          </div>

          {/* Demo 3: Empty State */}
          <div className="space-y-4">
            <div className="bg-white border-0 shadow-sm rounded-lg p-4">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Empty State
              </h2>
              <p className="text-sm text-slate-600">
                Shows the empty state when no records are available
              </p>
            </div>
            <RecentActivity records={[]} />
          </div>

          {/* Demo 4: Only Present Records */}
          <div className="space-y-4">
            <div className="bg-white border-0 shadow-sm rounded-lg p-4">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Only Present Status
              </h2>
              <p className="text-sm text-slate-600">
                Shows records with only present status
              </p>
            </div>
            <RecentActivity
              records={fullRecords.filter((r) => r.status === 'present')}
              onViewFullHistory={handleViewFullHistory}
            />
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="bg-white border-0 shadow-lg rounded-xl p-6 md:p-8 mt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Component Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                Staggered Animations
              </h3>
              <p className="text-sm text-slate-600 ml-4">
                Items animate in with 100ms delay between each for smooth entrance
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Hover Effects
              </h3>
              <p className="text-sm text-slate-600 ml-4">
                Background transitions to slate-50 and icons rotate 12° on hover
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                Status Icons
              </h3>
              <p className="text-sm text-slate-600 ml-4">
                32px solid color containers with status-specific icons and colors
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                Gradient Button
              </h3>
              <p className="text-sm text-slate-600 ml-4">
                "View Full History" button with blue-to-violet gradient and shadow
              </p>
            </div>
          </div>
        </div>

        {/* Status Legend */}
        <div className="bg-white border-0 shadow-lg rounded-xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Status Types
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <div className="w-5 h-5 text-emerald-600">✓</div>
              </div>
              <div>
                <div className="font-semibold text-emerald-900">Present</div>
                <div className="text-xs text-emerald-700">Student attended</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                <div className="w-5 h-5 text-red-600">✕</div>
              </div>
              <div>
                <div className="font-semibold text-red-900">Absent</div>
                <div className="text-xs text-red-700">Unexcused absence</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <div className="w-5 h-5 text-amber-600">!</div>
              </div>
              <div>
                <div className="font-semibold text-amber-900">Sick</div>
                <div className="text-xs text-amber-700">Medical absence</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-cyan-50">
              <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                <div className="w-5 h-5 text-cyan-600">📄</div>
              </div>
              <div>
                <div className="font-semibold text-cyan-900">Leave</div>
                <div className="text-xs text-cyan-700">Approved leave</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
