import { ProgressChart } from '../ProgressChart';
import { AttendanceStats } from '@/types/types';

// Example usage of ProgressChart component
export function ProgressChartExample() {
  // Sample attendance data
  const sampleStats: AttendanceStats = {
    totalDays: 120,
    presentDays: 95,
    absentDays: 15,
    sickDays: 7,
    leaveDays: 3,
    attendancePercentage: 79.2,
    pureAbsenceHours: 30,
    combinedAbsenceHours: 50,
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-slate-900">
          Progress Chart Component Example
        </h1>
        
        <ProgressChart stats={sampleStats} />
        
        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Component Features:</h2>
          <ul className="space-y-2 text-slate-700">
            <li>• Animated circular progress ring with gradient stroke</li>
            <li>• Count-up animation for percentage display</li>
            <li>• Status breakdown with horizontal progress bars</li>
            <li>• Responsive layout (stacked on mobile, side-by-side on desktop)</li>
            <li>• Summary statistics at the bottom</li>
            <li>• Persian/Farsi text support</li>
            <li>• Smooth animations with proper timing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}