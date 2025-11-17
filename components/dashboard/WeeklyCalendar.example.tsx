/**
 * Example usage of WeeklyCalendar component
 * This file demonstrates how to use the WeeklyCalendar component
 * with sample data and proper event handling.
 */

'use client';

import { useState } from 'react';
import { WeeklyCalendar } from './WeeklyCalendar';
import { WeekData } from '@/types/types';

// Sample week data for demonstration
const sampleWeekData: WeekData = {
  weekNumber: 1,
  startDate: '2024-01-01',
  endDate: '2024-01-07',
  days: [
    {
      date: '2024-01-01',
      dayName: 'شنبه',
      status: 'present',
      sessions: [
        { period: 1, courseName: 'ریاضی', status: 'present' },
        { period: 2, courseName: 'فیزیک', status: 'present' }
      ]
    },
    {
      date: '2024-01-02',
      dayName: 'یکشنبه',
      status: 'absent',
      sessions: [
        { period: 1, courseName: 'شیمی', status: 'absent' }
      ]
    },
    {
      date: '2024-01-03',
      dayName: 'دوشنبه',
      status: 'sick',
      sessions: [
        { period: 1, courseName: 'زیست', status: 'sick' }
      ]
    },
    {
      date: '2024-01-04',
      dayName: 'سه‌شنبه',
      status: 'leave',
      sessions: []
    },
    {
      date: '2024-01-05',
      dayName: 'چهارشنبه',
      status: 'future',
      sessions: []
    },
    {
      date: '2024-01-06',
      dayName: 'پنج‌شنبه',
      status: 'future',
      sessions: []
    },
    {
      date: '2024-01-07',
      dayName: 'جمعه',
      status: 'future',
      sessions: []
    }
  ]
};

export function WeeklyCalendarExample() {
  const [currentWeekData, setCurrentWeekData] = useState<WeekData>(sampleWeekData);

  const handleWeekChange = (direction: 'prev' | 'next') => {
    console.log(`Changing week: ${direction}`);
    
    // In a real application, you would:
    // 1. Calculate the new week dates
    // 2. Fetch attendance data for the new week
    // 3. Update the state with new data
    
    // For this example, we'll just log the action
    // setCurrentWeekData(newWeekData);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">
          Weekly Calendar Example
        </h1>
        
        <WeeklyCalendar 
          weekData={currentWeekData}
          onWeekChange={handleWeekChange}
        />
        
        <div className="mt-6 p-4 bg-white rounded-lg border-0 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Features Demonstrated:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
            <li>Responsive grid layout (1 col mobile → 7 col desktop)</li>
            <li>Status-based gradient backgrounds for day cards</li>
            <li>Session indicators with colored dots</li>
            <li>Smooth hover animations and transitions</li>
            <li>Staggered entrance animations</li>
            <li>Swipe gesture support for mobile navigation</li>
            <li>Keyboard navigation support</li>
            <li>Accessibility features (ARIA labels, semantic HTML)</li>
            <li>Reduced motion support</li>
            <li>RTL-friendly navigation (right swipe = previous)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}