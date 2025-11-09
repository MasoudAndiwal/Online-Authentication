"use client";

import * as React from "react";
import { BulkActionsPanel } from "./bulk-actions-panel";
import { AttendanceGrid } from "./attendance-grid";
import { AttendanceManagement } from "./attendance-management";
import type { AttendanceStatus, StudentWithAttendance } from "@/types/attendance";

// Mock data for testing bulk actions
const mockStudents: StudentWithAttendance[] = [
  {
    id: "1",
    studentId: "CS001",
    firstName: "John",
    lastName: "Doe",
    name: "John Doe",
    classSection: "CS-A",
    programs: "Computer Science",
    semester: "Fall 2024",
    status: "NOT_MARKED",
  },
  {
    id: "2",
    studentId: "CS002",
    firstName: "Jane",
    lastName: "Smith",
    name: "Jane Smith",
    classSection: "CS-A",
    programs: "Computer Science",
    semester: "Fall 2024",
    status: "NOT_MARKED",
  },
  {
    id: "3",
    studentId: "CS003",
    firstName: "Bob",
    lastName: "Johnson",
    name: "Bob Johnson",
    classSection: "CS-A",
    programs: "Computer Science",
    semester: "Fall 2024",
    status: "PRESENT",
  },
];

/**
 * Test component for bulk actions functionality
 * This component demonstrates and tests the enhanced bulk actions features:
 * 1. Real-time updates during bulk operations
 * 2. Visual confirmation feedback
 * 3. Comprehensive error handling with retry mechanisms
 * 4. Auto-save functionality with connection monitoring
 */
export function BulkActionsTest() {
  const [selectedStudents, setSelectedStudents] = React.useState<string[]>([]);
  const [students, setStudents] = React.useState<StudentWithAttendance[]>(mockStudents);
  const [isLoading, setIsLoading] = React.useState(false);

  // Mock bulk status change function with realistic behavior
  const handleBulkStatusChange = async (studentIds: string[], status: AttendanceStatus) => {
    console.log(`Bulk updating ${studentIds.length} students to ${status}`);
    
    // Simulate network delay and potential errors
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate occasional errors for testing error handling
    if (Math.random() < 0.2) { // 20% chance of error
      throw new Error("Network timeout - please try again");
    }
    
    // Update students state
    setStudents(prev => 
      prev.map(student => 
        studentIds.includes(student.id)
          ? { ...student, status, markedAt: new Date() }
          : student
      )
    );
    
    console.log(`Successfully updated ${studentIds.length} students`);
  };

  // Handle individual student selection
  const handleStudentSelect = (studentId: string, selected: boolean) => {
    setSelectedStudents(prev => 
      selected 
        ? [...prev, studentId]
        : prev.filter(id => id !== studentId)
    );
  };

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    setSelectedStudents(selected ? students.map(s => s.id) : []);
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedStudents([]);
  };

  // Create student names mapping
  const studentNames = React.useMemo(() => {
    return students.reduce((acc, student) => {
      acc[student.id] = student.name;
      return acc;
    }, {} as Record<string, string>);
  }, [students]);

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Bulk Actions Test Environment
          </h1>
          <p className="text-slate-600">
            Test the enhanced bulk attendance actions with real-time updates, 
            visual feedback, and error handling capabilities.
          </p>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-6">
          <h3 className="font-semibold text-slate-900 mb-3">Test Controls</h3>
          <div className="flex gap-3">
            <button
              onClick={() => handleSelectAll(true)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Select All Students
            </button>
            <button
              onClick={() => handleSelectAll(false)}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Clear Selection
            </button>
            <button
              onClick={() => setStudents(mockStudents)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reset Students
            </button>
          </div>
        </div>

        {/* Status Display */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-6">
          <h3 className="font-semibold text-slate-900 mb-3">Current Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-slate-700">Selected Students:</span>
              <span className="ml-2 text-orange-600">{selectedStudents.length}</span>
            </div>
            <div>
              <span className="font-medium text-slate-700">Total Students:</span>
              <span className="ml-2 text-slate-600">{students.length}</span>
            </div>
            <div>
              <span className="font-medium text-slate-700">Present:</span>
              <span className="ml-2 text-green-600">
                {students.filter(s => s.status === 'PRESENT').length}
              </span>
            </div>
          </div>
        </div>

        {/* Attendance Grid */}
        <AttendanceGrid
          classId="test-class"
          students={students}
          isLoading={isLoading}
          error={null}
          onStatusChange={(studentId, status) => {
            setStudents(prev => 
              prev.map(student => 
                student.id === studentId 
                  ? { ...student, status, markedAt: new Date() }
                  : student
              )
            );
          }}
          onBulkStatusChange={handleBulkStatusChange}
          selectedStudents={selectedStudents}
          onStudentSelect={handleStudentSelect}
          onSelectAll={handleSelectAll}
          searchQuery=""
          onSearchChange={() => {}}
          showRiskIndicators={true}
        />

        {/* Bulk Actions Panel */}
        <BulkActionsPanel
          selectedStudents={selectedStudents}
          studentNames={studentNames}
          onBulkStatusChange={handleBulkStatusChange}
          onClearSelection={handleClearSelection}
          isVisible={selectedStudents.length > 0}
          isSaving={false}
        />

        {/* Feature Documentation */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mt-8"></div>   <h3 className="font-semibold text-slate-900 mb-4">Enhanced Features Implemented</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-slate-800 mb-2">Real-time Updates</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Live progress tracking during bulk operations</li>
                <li>• Real-time connection status monitoring</li>
                <li>• Automatic sync when connection is restored</li>
                <li>• Smart auto-save with adaptive intervals</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-slate-800 mb-2">Visual Feedback</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Animated progress bars with status messages</li>
                <li>• Success confirmations with detailed metrics</li>
                <li>• Auto-hide countdown with visual indicators</li>
                <li>• Optimistic updates with rollback on error</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-slate-800 mb-2">Error Handling</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Exponential backoff retry mechanism</li>
                <li>• Comprehensive error categorization</li>
                <li>• Recovery suggestions based on error type</li>
                <li>• Graceful degradation for network issues</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-slate-800 mb-2">User Experience</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Contextual toast notifications</li>
                <li>• Batch processing for large selections</li>
                <li>• Performance metrics and timing</li>
                <li>• Accessibility-compliant interactions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}