import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTeacherDashboardStore, type TeacherDashboardMetrics, type Class, type Notification } from '@/lib/stores/teacher-dashboard-store';

// Query keys
export const teacherDashboardKeys = {
  all: ['teacher-dashboard'] as const,
  metrics: () => [...teacherDashboardKeys.all, 'metrics'] as const,
  classes: () => [...teacherDashboardKeys.all, 'classes'] as const,
  notifications: () => [...teacherDashboardKeys.all, 'notifications'] as const,
  class: (id: string) => [...teacherDashboardKeys.classes(), id] as const,
};

// Mock API functions - will be replaced with actual API calls
const mockApi = {
  fetchMetrics: async (): Promise<TeacherDashboardMetrics> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      totalStudents: 247,
      totalClasses: 8,
      weeklyAttendanceRate: 94.2,
      studentsAtRisk: 12,
    };
  },

  fetchClasses: async (): Promise<Class[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return [
      {
        id: '1',
        name: 'Computer Science 101',
        studentCount: 28,
        schedule: [
          { dayOfWeek: 1, startTime: '10:00', endTime: '11:30', room: 'A-204' },
          { dayOfWeek: 3, startTime: '10:00', endTime: '11:30', room: 'A-204' },
        ],
        attendanceRate: 94.2,
        nextSession: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      },
      {
        id: '2',
        name: 'Data Structures',
        studentCount: 32,
        schedule: [
          { dayOfWeek: 2, startTime: '14:00', endTime: '15:30', room: 'B-101' },
          { dayOfWeek: 4, startTime: '14:00', endTime: '15:30', room: 'B-101' },
        ],
        attendanceRate: 91.8,
        nextSession: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
      },
    ];
  },

  fetchNotifications: async (): Promise<Notification[]> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return [
      {
        id: '1',
        type: 'student_risk',
        title: 'Student at Risk',
        message: 'Ahmad Hassan is approaching محروم threshold in Computer Science 101',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        isRead: false,
        actionUrl: '/teacher/progress/ahmad-hassan',
      },
      {
        id: '2',
        type: 'system_update',
        title: 'System Maintenance',
        message: 'Scheduled maintenance tonight from 2:00 AM to 4:00 AM',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isRead: false,
      },
    ];
  },
};

// Custom hooks for teacher dashboard data
export function useTeacherDashboardMetrics() {
  const setMetrics = useTeacherDashboardStore(state => state.setMetrics);
  const setLoading = useTeacherDashboardStore(state => state.setLoading);
  const setError = useTeacherDashboardStore(state => state.setError);

  return useQuery({
    queryKey: teacherDashboardKeys.metrics(),
    queryFn: mockApi.fetchMetrics,
    onSuccess: (data) => {
      setMetrics(data);
      setError(null);
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to fetch metrics');
    },
    onSettled: () => {
      setLoading(false);
    },
  });
}

export function useTeacherClasses() {
  const setClasses = useTeacherDashboardStore(state => state.setClasses);
  const setError = useTeacherDashboardStore(state => state.setError);

  return useQuery({
    queryKey: teacherDashboardKeys.classes(),
    queryFn: mockApi.fetchClasses,
    onSuccess: (data) => {
      setClasses(data);
      setError(null);
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to fetch classes');
    },
  });
}

export function useTeacherNotifications() {
  const setNotifications = useTeacherDashboardStore(state => state.setNotifications);
  const setError = useTeacherDashboardStore(state => state.setError);

  return useQuery({
    queryKey: teacherDashboardKeys.notifications(),
    queryFn: mockApi.fetchNotifications,
    onSuccess: (data) => {
      setNotifications(data);
      setError(null);
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to fetch notifications');
    },
  });
}

// Mutation hooks for teacher dashboard actions
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  const markNotificationAsRead = useTeacherDashboardStore(state => state.markNotificationAsRead);

  return useMutation({
    mutationFn: async (notificationId: string) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 200));
      return notificationId;
    },
    onSuccess: (notificationId) => {
      markNotificationAsRead(notificationId);
      queryClient.invalidateQueries({ queryKey: teacherDashboardKeys.notifications() });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  const markAllNotificationsAsRead = useTeacherDashboardStore(state => state.markAllNotificationsAsRead);

  return useMutation({
    mutationFn: async () => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      return true;
    },
    onSuccess: () => {
      markAllNotificationsAsRead();
      queryClient.invalidateQueries({ queryKey: teacherDashboardKeys.notifications() });
    },
  });
}

// Hook to initialize teacher dashboard data
export function useInitializeTeacherDashboard() {
  const setLoading = useTeacherDashboardStore(state => state.setLoading);
  
  const metricsQuery = useTeacherDashboardMetrics();
  const classesQuery = useTeacherClasses();
  const notificationsQuery = useTeacherNotifications();

  const isLoading = metricsQuery.isLoading || classesQuery.isLoading || notificationsQuery.isLoading;
  const error = metricsQuery.error || classesQuery.error || notificationsQuery.error;

  // Update global loading state
  React.useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  return {
    isLoading,
    error,
    refetch: () => {
      metricsQuery.refetch();
      classesQuery.refetch();
      notificationsQuery.refetch();
    },
  };
}

// Re-export React for the useEffect hook
import * as React from 'react';