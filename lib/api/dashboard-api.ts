/**
 * Client-side API functions for dashboard endpoints
 */

import type { DashboardStats, WeeklyAttendance, ActivityItem } from '@/lib/database/dashboard-operations';

/**
 * Fetch dashboard statistics
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch('/api/dashboard/stats');
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch dashboard stats');
  }
  
  return response.json();
}

/**
 * Fetch weekly attendance trends
 * @param weeks - Number of weeks to fetch (default: 4)
 */
export async function fetchWeeklyAttendance(weeks: number = 4): Promise<WeeklyAttendance[]> {
  const response = await fetch(`/api/dashboard/attendance?weeks=${weeks}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch attendance data');
  }
  
  return response.json();
}

/**
 * Fetch recent system activity
 * @param limit - Number of activities to fetch (default: 10)
 */
export async function fetchRecentActivity(limit: number = 10): Promise<ActivityItem[]> {
  const response = await fetch(`/api/dashboard/activity?limit=${limit}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch activity data');
  }
  
  return response.json();
}

/**
 * Export dashboard data
 * @param format - Export format ('json' or 'csv')
 */
export async function exportDashboardData(format: 'json' | 'csv' = 'json'): Promise<void> {
  const response = await fetch(`/api/dashboard/export?format=${format}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to export data');
  }
  
  // Download the file
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dashboard-export-${new Date().toISOString()}.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
