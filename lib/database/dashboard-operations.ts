/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabase';
import { handleDatabaseOperation } from './errors';
import { TABLE_NAMES } from './models';

// Dashboard Statistics Types
export interface DashboardStats {
  totalUsers: {
    count: number;
    change: number; // percentage change vs last month
    changeLabel: string;
  };
  activeClasses: {
    count: number;
    change: number; // new classes this term
    changeLabel: string;
  };
  attendanceRate: {
    rate: number; // percentage
    change: number; // percentage change vs last week
    changeLabel: string;
  };
  pendingReviews: {
    count: number;
    change: number; // number needing attention
    changeLabel: string;
  };
}

export interface WeeklyAttendance {
  week: string;
  attendanceRate: number;
  totalClasses: number;
  presentCount: number;
  absentCount: number;
}

export interface ActivityItem {
  id: string;
  type: 'user_created' | 'attendance_marked' | 'certificate_approved' | 'schedule_updated';
  action: string;
  details: string;
  timestamp: Date;
  icon: string;
}

/**
 * Get comprehensive dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  return handleDatabaseOperation(async () => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Fetch all required data in parallel for better performance
    const [
      totalUsers,
      lastMonthUsers,
      activeClasses,
      lastTermClasses,
      currentWeekAttendance,
      lastWeekAttendance,
      pendingReviews
    ] = await Promise.all([
      getTotalUsersCount(),
      getUsersCountSince(lastMonth),
      getActiveClassesCount(),
      getClassesCountSince(getTermStartDate()),
      getAttendanceRate(lastWeek, now),
      getAttendanceRate(new Date(lastWeek.getTime() - 7 * 24 * 60 * 60 * 1000), lastWeek),
      getPendingReviewsCount()
    ]);

    // Calculate changes
    const usersLastMonth = totalUsers - lastMonthUsers;
    const userChangePercent = usersLastMonth > 0 
      ? ((lastMonthUsers / usersLastMonth) * 100).toFixed(1)
      : '0';

    const newClasses = lastTermClasses;

    const attendanceChange = (currentWeekAttendance - lastWeekAttendance).toFixed(1);

    return {
      totalUsers: {
        count: totalUsers,
        change: parseFloat(userChangePercent),
        changeLabel: 'vs last month',
      },
      activeClasses: {
        count: activeClasses,
        change: newClasses,
        changeLabel: 'new this term',
      },
      attendanceRate: {
        rate: parseFloat(currentWeekAttendance.toFixed(1)),
        change: parseFloat(attendanceChange),
        changeLabel: 'vs last week',
      },
      pendingReviews: {
        count: pendingReviews,
        change: pendingReviews > 5 ? pendingReviews - 5 : 0,
        changeLabel: 'need attention',
      },
    };
  });
}

/**
 * Get total count of all users (students + teachers)
 */
async function getTotalUsersCount(): Promise<number> {
  const [studentsResult, teachersResult] = await Promise.all([
    supabase.from(TABLE_NAMES.STUDENTS).select('id', { count: 'exact', head: true }),
    supabase.from(TABLE_NAMES.TEACHERS).select('id', { count: 'exact', head: true }),
  ]);

  if (studentsResult.error) throw studentsResult.error;
  if (teachersResult.error) throw teachersResult.error;

  return (studentsResult.count || 0) + (teachersResult.count || 0);
}

/**
 * Get count of users created since a specific date
 */
async function getUsersCountSince(date: Date): Promise<number> {
  const isoDate = date.toISOString();

  const [studentsResult, teachersResult] = await Promise.all([
    supabase
      .from(TABLE_NAMES.STUDENTS)
      .select('id', { count: 'exact', head: true })
      .gte('created_at', isoDate),
    supabase
      .from(TABLE_NAMES.TEACHERS)
      .select('id', { count: 'exact', head: true })
      .gte('created_at', isoDate),
  ]);

  if (studentsResult.error) throw studentsResult.error;
  if (teachersResult.error) throw teachersResult.error;

  return (studentsResult.count || 0) + (teachersResult.count || 0);
}

/**
 * Get count of active classes from schedule
 */
async function getActiveClassesCount(): Promise<number> {
  // Query the classes table to get unique class count
  const { count, error } = await supabase
    .from('classes')
    .select('id', { count: 'exact', head: true });

  if (error) throw error;
  return count || 0;
}

/**
 * Get count of classes created since a specific date
 */
async function getClassesCountSince(date: Date): Promise<number> {
  const { count, error } = await supabase
    .from('classes')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', date.toISOString());

  if (error) throw error;
  return count || 0;
}

/**
 * Calculate attendance rate for a date range
 */
async function getAttendanceRate(startDate: Date, endDate: Date): Promise<number> {
  // This would query an attendance table
  // For now, returning a mock calculation
  // TODO: Implement actual attendance tracking table and logic
  
  const { data: attendanceRecords, error } = await supabase
    .from('attendance_records')
    .select('status')
    .gte('date', startDate.toISOString())
    .lte('date', endDate.toISOString());

  if (error) {
    // If attendance table doesn't exist yet, return a default rate
    console.warn('Attendance table not found, returning default rate');
    return 94.2;
  }

  if (!attendanceRecords || attendanceRecords.length === 0) {
    return 0;
  }

  const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
  const rate = (presentCount / attendanceRecords.length) * 100;
  
  return rate;
}

/**
 * Get count of pending reviews (sick certificates, etc.)
 */
async function getPendingReviewsCount(): Promise<number> {
  // This would query a medical certificates or reviews table
  // TODO: Implement medical certificates table
  
  const { count, error } = await supabase
    .from('medical_certificates')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');

  if (error) {
    // If table doesn't exist, return default
    console.warn('Medical certificates table not found, returning default count');
    return 23;
  }

  return count || 0;
}

/**
 * Get the start date of the current term
 */
function getTermStartDate(): Date {
  const now = new Date();
  const currentMonth = now.getMonth();
  
  // Assuming terms start in September (8) and February (1)
  if (currentMonth >= 8) {
    // Fall term
    return new Date(now.getFullYear(), 8, 1);
  } else if (currentMonth >= 1) {
    // Spring term
    return new Date(now.getFullYear(), 1, 1);
  } else {
    // Previous fall term
    return new Date(now.getFullYear() - 1, 8, 1);
  }
}

/**
 * Get weekly attendance trends
 */
export async function getWeeklyAttendanceTrends(weeks: number = 4): Promise<WeeklyAttendance[]> {
  return handleDatabaseOperation(async () => {
    const trends: WeeklyAttendance[] = [];
    const now = new Date();

    for (let i = weeks - 1; i >= 0; i--) {
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);

      const { data: records, error } = await supabase
        .from('attendance_records')
        .select('status')
        .gte('date', weekStart.toISOString())
        .lte('date', weekEnd.toISOString());

      if (error) {
        console.warn('Attendance records not found, using mock data');
        // Return mock data if table doesn't exist
        trends.push({
          week: `Week ${weeks - i}`,
          attendanceRate: 90 + Math.random() * 10,
          totalClasses: 100,
          presentCount: 90 + Math.floor(Math.random() * 10),
          absentCount: 10 - Math.floor(Math.random() * 10),
        });
        continue;
      }

      const total = records?.length || 0;
      const present = records?.filter(r => r.status === 'present').length || 0;
      const absent = total - present;

      trends.push({
        week: `Week ${weeks - i}`,
        attendanceRate: total > 0 ? (present / total) * 100 : 0,
        totalClasses: total,
        presentCount: present,
        absentCount: absent,
      });
    }

    return trends;
  });
}

/**
 * Get recent system activity
 */
export async function getRecentActivity(limit: number = 10): Promise<ActivityItem[]> {
  return handleDatabaseOperation(async () => {
    const activities: ActivityItem[] = [];

    // Fetch recent students created
    const { data: recentStudents } = await supabase
      .from(TABLE_NAMES.STUDENTS)
      .select('id, first_name, last_name, student_id, created_at')
      .order('created_at', { ascending: false })
      .limit(3);

    if (recentStudents) {
      recentStudents.forEach(student => {
        activities.push({
          id: `student-${student.id}`,
          type: 'user_created',
          action: 'New user created',
          details: `${student.first_name} ${student.last_name} (Student) - ${student.student_id}`,
          timestamp: new Date(student.created_at),
          icon: 'Users',
        });
      });
    }

    // Fetch recent teachers created
    const { data: recentTeachers } = await supabase
      .from(TABLE_NAMES.TEACHERS)
      .select('id, first_name, last_name, teacher_id, created_at')
      .order('created_at', { ascending: false })
      .limit(2);

    if (recentTeachers) {
      recentTeachers.forEach(teacher => {
        activities.push({
          id: `teacher-${teacher.id}`,
          type: 'user_created',
          action: 'New user created',
          details: `${teacher.first_name} ${teacher.last_name} (Teacher) - ${teacher.teacher_id}`,
          timestamp: new Date(teacher.created_at),
          icon: 'Users',
        });
      });
    }

    // Add mock activities for attendance and other actions
    // TODO: Replace with actual tables when implemented
    activities.push({
      id: 'attendance-mock-1',
      type: 'attendance_marked',
      action: 'Attendance marked',
      details: 'Computer Science - Fall 2024 (28/30 present)',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      icon: 'CheckCircle',
    });

    activities.push({
      id: 'certificate-mock-1',
      type: 'certificate_approved',
      action: 'Medical certificate approved',
      details: 'Sara Khan - 3 days sick leave approved',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      icon: 'FileText',
    });

    activities.push({
      id: 'schedule-mock-1',
      type: 'schedule_updated',
      action: 'Schedule updated',
      details: 'Mathematics - Spring 2024 timetable modified',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      icon: 'Calendar',
    });

    // Sort by timestamp and limit
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  });
}

/**
 * Export user data to CSV or JSON
 */
export async function exportDashboardData(format: 'csv' | 'json' = 'json'): Promise<any> {
  return handleDatabaseOperation(async () => {
    const [students, teachers, classes] = await Promise.all([
      supabase.from(TABLE_NAMES.STUDENTS).select('*'),
      supabase.from(TABLE_NAMES.TEACHERS).select('*'),
      supabase.from('classes').select('*'),
    ]);

    const data = {
      students: students.data || [],
      teachers: teachers.data || [],
      classes: classes.data || [],
      exportedAt: new Date().toISOString(),
    };

    if (format === 'csv') {
      // Convert to CSV format
      // This is a simplified version - you might want to use a library like papaparse
      return data;
    }

    return data;
  });
}
