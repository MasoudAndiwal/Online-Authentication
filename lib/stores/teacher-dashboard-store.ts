import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Teacher dashboard state interfaces
export interface TeacherDashboardMetrics {
  totalStudents: number;
  totalClasses: number;
  weeklyAttendanceRate: number;
  studentsAtRisk: number;
}

export interface Class {
  id: string;
  name: string;
  session?: string;
  major?: string;
  semester?: number;
  studentCount: number;
  scheduleCount?: number;
  schedule: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    room: string;
  }[];
  attendanceRate: number;
  nextSession?: Date;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  currentStatus: 'Present' | 'Absent' | 'Sick' | 'Leave';
  attendanceRate: number;
  isAtRisk: boolean;
  riskType?: 'محروم' | 'تصدیق طلب';
}

export interface Notification {
  id: string;
  type: 'student_risk' | 'system_update' | 'schedule_change';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
}

// Teacher dashboard store interface
interface TeacherDashboardStore {
  // State
  metrics: TeacherDashboardMetrics | null;
  classes: Class[];
  notifications: Notification[];
  selectedClassId: string | null;
  isLoading: boolean;
  error: string | null;

  // UI State
  activeView: 'overview' | 'attendance' | 'progress' | 'reports';
  sidebarCollapsed: boolean;
  notificationsPanelOpen: boolean;

  // Actions
  setMetrics: (metrics: TeacherDashboardMetrics) => void;
  setClasses: (classes: Class[]) => void;
  addClass: (classItem: Class) => void;
  updateClass: (classId: string, updates: Partial<Class>) => void;
  removeClass: (classId: string) => void;
  
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  
  setSelectedClassId: (classId: string | null) => void;
  setActiveView: (view: 'overview' | 'attendance' | 'progress' | 'reports') => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setNotificationsPanelOpen: (open: boolean) => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Reset store
  reset: () => void;
}

// Initial state
const initialState = {
  metrics: null,
  classes: [],
  notifications: [],
  selectedClassId: null,
  isLoading: false,
  error: null,
  activeView: 'overview' as const,
  sidebarCollapsed: false,
  notificationsPanelOpen: false,
};

// Create the store
export const useTeacherDashboardStore = create<TeacherDashboardStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Metrics actions
      setMetrics: (metrics) => set({ metrics }, false, 'setMetrics'),

      // Classes actions
      setClasses: (classes) => {
        set({ classes }, false, 'setClasses');
      },
      
      addClass: (classItem) => 
        set(
          (state) => ({ classes: [...state.classes, classItem] }),
          false,
          'addClass'
        ),
      
      updateClass: (classId, updates) =>
        set(
          (state) => ({
            classes: state.classes.map((cls) =>
              cls.id === classId ? { ...cls, ...updates } : cls
            ),
          }),
          false,
          'updateClass'
        ),
      
      removeClass: (classId) =>
        set(
          (state) => ({
            classes: state.classes.filter((cls) => cls.id !== classId),
            selectedClassId: state.selectedClassId === classId ? null : state.selectedClassId,
          }),
          false,
          'removeClass'
        ),

      // Notifications actions
      setNotifications: (notifications) => set({ notifications }, false, 'setNotifications'),
      
      addNotification: (notification) =>
        set(
          (state) => ({ notifications: [notification, ...state.notifications] }),
          false,
          'addNotification'
        ),
      
      markNotificationAsRead: (notificationId) =>
        set(
          (state) => ({
            notifications: state.notifications.map((notification) =>
              notification.id === notificationId
                ? { ...notification, isRead: true }
                : notification
            ),
          }),
          false,
          'markNotificationAsRead'
        ),
      
      markAllNotificationsAsRead: () =>
        set(
          (state) => ({
            notifications: state.notifications.map((notification) => ({
              ...notification,
              isRead: true,
            })),
          }),
          false,
          'markAllNotificationsAsRead'
        ),

      // UI state actions
      setSelectedClassId: (classId) => set({ selectedClassId: classId }, false, 'setSelectedClassId'),
      setActiveView: (view) => set({ activeView: view }, false, 'setActiveView'),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }, false, 'setSidebarCollapsed'),
      setNotificationsPanelOpen: (open) => set({ notificationsPanelOpen: open }, false, 'setNotificationsPanelOpen'),

      // Loading and error actions
      setLoading: (loading) => set({ isLoading: loading }, false, 'setLoading'),
      setError: (error) => set({ error }, false, 'setError'),

      // Reset store
      reset: () => set(initialState, false, 'reset'),
    }),
    {
      name: 'teacher-dashboard-store',
    }
  )
);

// Selectors for computed values
export const useTeacherDashboardSelectors = () => {
  const store = useTeacherDashboardStore();
  
  return {
    // Computed values
    unreadNotificationsCount: store.notifications.filter(n => !n.isRead).length,
    totalStudentsAcrossClasses: store.classes.reduce((total, cls) => total + cls.studentCount, 0),
    averageAttendanceRate: store.classes.length > 0 
      ? store.classes.reduce((total, cls) => total + cls.attendanceRate, 0) / store.classes.length 
      : 0,
    selectedClass: store.selectedClassId 
      ? store.classes.find(cls => cls.id === store.selectedClassId) 
      : null,
    
    // State getters
    ...store,
  };
};