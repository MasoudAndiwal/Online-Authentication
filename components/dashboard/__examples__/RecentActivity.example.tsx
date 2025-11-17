'use client';

import { RecentActivity } from '../RecentActivity';
import { AttendanceRecord } from '@/types/types';

/**
 * Example usage of RecentActivity component
 * This demonstrates the component with sample data
 */
export function RecentActivityExample() {
  // Sample attendance records
  const sampleRecords: AttendanceRecord[] = [
    {
      id: '1',
      date: '2024-11-15',
      dayOfWeek: 'Friday',
      status: 'present',
      courseName: 'Advanced Mathematics',
      period: 1,
    },
    {
      id: '2',
      date: '2024-11-14',
      dayOfWeek: 'Thursday',
      status: 'present',
      courseName: 'Computer Science',
      period: 2,
    },
    {
      id: '3',
      date: '2024-11-13',
      dayOfWeek: 'Wednesday',
      status: 'absent',
      courseName: 'Physics',
      period: 3,
      notes: 'Unexcused absence',
    },
    {
      id: '4',
      date: '2024-11-12',
      dayOfWeek: 'Tuesday',
      status: 'sick',
      courseName: 'Chemistry',
      period: 1,
      notes: 'Medical certificate provided',
    },
    {
      id: '5',
      date: '2024-11-11',
      dayOfWeek: 'Monday',
      status: 'leave',
      courseName: 'English Literature',
      period: 4,
      notes: 'Approved leave',
    },
    {
      id: '6',
      date: '2024-11-10',
      dayOfWeek: 'Sunday',
      status: 'present',
      courseName: 'History',
      period: 2,
    },
    {
      id: '7',
      date: '2024-11-08',
      dayOfWeek: 'Friday',
      status: 'present',
      courseName: 'Biology',
      period: 3,
    },
    {
      id: '8',
      date: '2024-11-07',
      dayOfWeek: 'Thursday',
      status: 'absent',
      courseName: 'Geography',
      period: 1,
    },
    {
      id: '9',
      date: '2024-11-06',
      dayOfWeek: 'Wednesday',
      status: 'present',
      courseName: 'Art',
      period: 4,
    },
    {
      id: '10',
      date: '2024-11-05',
      dayOfWeek: 'Tuesday',
      status: 'present',
      courseName: 'Physical Education',
      period: 2,
    },
  ];

  const handleViewFullHistory = () => {
    console.log('View full history clicked');
    // In a real app, this would navigate to the full history page
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            RecentActivity Component Examples
          </h1>
          <p className="text-slate-600">
            Displays the 10 most recent attendance records with staggered animations
          </p>
        </div>

        {/* Example 1: With Records */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            With Attendance Records
          </h2>
          <RecentActivity
            records={sampleRecords}
            onViewFullHistory={handleViewFullHistory}
          />
        </div>

        {/* Example 2: Empty State */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Empty State (No Records)
          </h2>
          <RecentActivity records={[]} />
        </div>

        {/* Example 3: Few Records */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            With Few Records (3 items)
          </h2>
          <RecentActivity
            records={sampleRecords.slice(0, 3)}
            onViewFullHistory={handleViewFullHistory}
          />
        </div>
      </div>
    </div>
  );
}

export default RecentActivityExample;
