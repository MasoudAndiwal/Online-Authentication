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

// API functions for teacher dashboard
const teacherApi = {
  fetchMetrics: async (): Promise<TeacherDashboardMetrics> => {
    // Get teacher ID from session
    let teacherId = '';
    if (typeof window !== 'undefined') {
      const sessionData = localStorage.getItem('user_session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        teacherId = session.id || '';
      }
    }

    if (!teacherId) {
      return {
        totalStudents: 0,
        totalClasses: 0,
        weeklyAttendanceRate: 0,
        studentsAtRisk: 0,
      };
    }

    const response = await fetch(`/api/teachers/metrics?teacherId=${teacherId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch teacher metrics');
    }
    return response.json();
  },

};

// Classes API
const classesApi = {
  fetchClasses: async (): Promise<Class[]> => {
    try {
      // Get teacher ID from session (if available)
      let teacherId = '';
      if (typeof window !== 'undefined') {
        const sessionData = localStorage.getItem('user_session');
        if (sessionData) {
          const session = JSON.parse(sessionData);
          teacherId = session.id || '';
          console.log('[useTeacherClasses] Session data:', {
            id: session.id,
            username: session.username,
            firstName: session.firstName,
            lastName: session.lastName,
            role: session.role
          });
        } else {
          console.log('[useTeacherClasses] No session data found in localStorage');
        }
      }
      
      // Build API URL with teacher ID
      const apiUrl = teacherId 
        ? `/api/teachers/classes?teacherId=${teacherId}`
        : '/api/teachers/classes';
      
      console.log('[useTeacherClasses] Fetching classes for teacher:', teacherId);
      console.log('[useTeacherClasses] API URL:', apiUrl);
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        console.error('[useTeacherClasses] API response not OK:', response.status, response.statusText);
        throw new Error('Failed to fetch teacher classes');
      }
      const apiClasses = await response.json();
      
      console.log('[useTeacherClasses] Fetched classes from API:', apiClasses);
      console.log('[useTeacherClasses] Classes array length:', Array.isArray(apiClasses) ? apiClasses.length : 'Not an array');
      console.log('[useTeacherClasses] Classes data:', JSON.stringify(apiClasses, null, 2));
      
      // Ensure we always return an array
      const classesArray = Array.isArray(apiClasses) ? apiClasses : [apiClasses];
      return classesArray;
    } catch (error) {
      console.error('[useTeacherClasses] Error fetching teacher classes:', error);
      throw error;
    }
  },
};

// Notifications API (still mock for now)
const notificationsApi = {
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

  const query = useQuery({
    queryKey: teacherDashboardKeys.metrics(),
    queryFn: teacherApi.fetchMetrics,
  });

  // Use useEffect to sync query data with store
  React.useEffect(() => {
    if (query.data) {
      setMetrics(query.data);
      setError(null);
    }
    if (query.error) {
      setError(query.error instanceof Error ? query.error.message : 'Failed to fetch metrics');
    }
    if (!query.isLoading) {
      setLoading(false);
    }
  }, [query.data, query.error, query.isLoading, setMetrics, setError, setLoading]);

  return query;
}

export function useTeacherClasses() {
  const setClasses = useTeacherDashboardStore(state => state.setClasses);
  const setError = useTeacherDashboardStore(state => state.setError);

  const query = useQuery({
    queryKey: teacherDashboardKeys.classes(),
    queryFn: classesApi.fetchClasses,
  });

  // Use useEffect to sync query data with store
  React.useEffect(() => {
    if (query.data) {
      console.log('Setting classes in store:', query.data);
      console.log('Is array?', Array.isArray(query.data), 'Length:', query.data?.length);
      setClasses(query.data);
      setError(null);
    }
    if (query.error) {
      console.error('Error in useTeacherClasses:', query.error);
      setError(query.error instanceof Error ? query.error.message : 'Failed to fetch classes');
    }
  }, [query.data, query.error, setClasses, setError]);

  return query;
}

export function useTeacherNotifications() {
  const setNotifications = useTeacherDashboardStore(state => state.setNotifications);
  const setError = useTeacherDashboardStore(state => state.setError);

  const query = useQuery({
    queryKey: teacherDashboardKeys.notifications(),
    queryFn: notificationsApi.fetchNotifications,
  });

  // Use useEffect to sync query data with store
  React.useEffect(() => {
    if (query.data) {
      setNotifications(query.data);
      setError(null);
    }
    if (query.error) {
      setError(query.error instanceof Error ? query.error.message : 'Failed to fetch notifications');
    }
  }, [query.data, query.error, setNotifications, setError]);

  return query;
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