"use client";

import React from "react";
import { AttendanceHistoryView } from "@/components/student/attendance-history-view";
import type { AttendanceRecord } from "@/types/types";

/**
 * Attendance History Page
 * Displays the complete attendance history for a student
 * Features filtering, export, statistics, and infinite scroll
 */
export default function AttendanceHistoryPage() {
  // Mock data for demonstration
  const mockRecords: AttendanceRecord[] = generateMockRecords();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <AttendanceHistoryView
          records={mockRecords}
          studentName="Ahmed Hassan"
          isLoading={false}
        />
      </div>
    </div>
  );
}

/**
 * Generate mock attendance records for demonstration
 */
function generateMockRecords(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const statuses: Array<"present" | "absent" | "sick" | "leave"> = [
    "present",
    "absent",
    "sick",
    "leave",
  ];
  const courses = [
    "Computer Science 101",
    "Mathematics 201",
    "Physics 150",
    "English Literature",
    "Database Systems",
    "Web Development",
  ];
  const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
  const teachers = ["Dr. Smith", "Prof. Johnson", "Dr. Williams", "Prof. Brown"];

  // Generate records for the past 60 days
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Skip Fridays (no classes)
    if (date.getDay() === 5) continue;

    const dayOfWeek = days[date.getDay()];
    const numSessions = Math.floor(Math.random() * 3) + 2; // 2-4 sessions per day

    for (let session = 1; session <= numSessions; session++) {
      // 85% chance of being present
      const statusIndex = Math.random() < 0.85 ? 0 : Math.floor(Math.random() * 4);
      const status = statuses[statusIndex];
      const course = courses[Math.floor(Math.random() * courses.length)];
      const teacher = teachers[Math.floor(Math.random() * teachers.length)];
      const time = `${8 + session}:00 AM`;

      records.push({
        id: `record-${i}-${session}`,
        date: date.toISOString(),
        dayOfWeek,
        status,
        courseName: course,
        period: session,
        notes: `Marked by: ${teacher} at ${time}`,
      });
    }
  }

  return records;
}
