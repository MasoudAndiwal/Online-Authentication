import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// ============================================================================
// Type Definitions
// ============================================================================

export interface StudentDashboardPreferences {
  theme: 'light' | 'dark' | 'auto';
  animationsEnabled: boolean;
  compactMode: boolean;
  notificationSettings: NotificationSettings;
}

export interface NotificationSettings {
  attendanceMarked: boolean;
  statusChanges: boolean;
  messageReceived: boolean;
  scheduleChanges: boolean;
  emailNotifications: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string; // HH:mm format
  quietHoursEnd?: string; // HH:mm format
}

export interface AttendanceFilters {
  startDate?: Date;
  endDate?: Date;
  statusTypes: string[];
  month?: number;
}

export interface MessageFilters {
  category?: 'attendance_inquiry' | 'documentation' | 'general' | 'urgent' | 'all';
  unreadOnly: boolean;
}

export interface Notification {
  id: string;
  type: 'attendance_marked' | 'status_change' | 'message_received' | 'schedule_change';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
}

// ============================================================================
// Store Interface
// ============================================================================

interface StudentDashboardStore {
  // UI State
  sidebarCollapsed: boolean;
  activeView: 'dashboard' | 'attendance' | 'class-info' | 'messages' | 'help';
  notificationsPanelOpen: boolean;
  currentWeekOffset: number; // For calendar navigation
  
  // Modal States
  messageComposeOpen: boolean;
  exportDialogOpen: boolean;
  settingsDialogOpen: boolean;
  
  // Filters
  attendanceFilters: AttendanceFilters;
  messageFilters: MessageFilters;
  
  // Notifications
  notifications: Notification[];
  
  // Preferences (persisted)
  preferences: StudentDashboardPreferences;
  
  // UI Actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setActiveView: (view: 'dashboard' | 'attendance' | 'class-info' | 'messages' | 'help') => void;
  setNotificationsPanelOpen: (open: boolean) => void;
  toggleNotificationsPanel: () => void;
  
  // Week Navigation
  setCurrentWeekOffset: (offset: number) => void;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  goToCurrentWeek: () => void;
  
  // Modal Actions
  setMessageComposeOpen: (open: boolean) => void;
  setExportDialogOpen: (open: boolean) => void;
  setSettingsDialogOpen: (open: boolean) => void;
  
  // Filter Actions
  setAttendanceFilters: (filters: Partial<AttendanceFilters>) => void;
  resetAttendanceFilters: () => void;
  setMessageFilters: (filters: Partial<MessageFilters>) => void;
  resetMessageFilters: () => void;
  
  // Notification Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  
  // Preferences Actions
  setPreferences: (preferences: Partial<StudentDashboardPreferences>) => void;
  setNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  toggleAnimations: () => void;
  toggleCompactMode: () => void;
  
  // Reset
  reset: () => void;
}

// ============================================================================
// Initial State
// ============================================================================

const defaultPreferences: StudentDashboardPreferences = {
  theme: 'auto',
  animationsEnabled: true,
  compactMode: false,
  notificationSettings: {
    attendanceMarked: true,
    statusChanges: true,
    messageReceived: true,
    scheduleChanges: true,
    emailNotifications: false,
    quietHoursEnabled: false,
  },
};

const defaultAttendanceFilters: AttendanceFilters = {
  statusTypes: [],
};

const defaultMessageFilters: MessageFilters = {
  category: 'all',
  unreadOnly: false,
};

const initialState = {
  sidebarCollapsed: false,
  activeView: 'dashboard' as const,
  notificationsPanelOpen: false,
  currentWeekOffset: 0,
  messageComposeOpen: false,
  exportDialogOpen: false,
  settingsDialogOpen: false,
  attendanceFilters: defaultAttendanceFilters,
  messageFilters: defaultMessageFilters,
  notifications: [],
  preferences: defaultPreferences,
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useStudentDashboardStore = create<StudentDashboardStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // UI Actions
        setSidebarCollapsed: (collapsed) =>
          set({ sidebarCollapsed: collapsed }, false, 'setSidebarCollapsed'),

        toggleSidebar: () =>
          set(
            (state) => ({ sidebarCollapsed: !state.sidebarCollapsed }),
            false,
            'toggleSidebar'
          ),

        setActiveView: (view) =>
          set({ activeView: view }, false, 'setActiveView'),

        setNotificationsPanelOpen: (open) =>
          set({ notificationsPanelOpen: open }, false, 'setNotificationsPanelOpen'),

        toggleNotificationsPanel: () =>
          set(
            (state) => ({ notificationsPanelOpen: !state.notificationsPanelOpen }),
            false,
            'toggleNotificationsPanel'
          ),

        // Week Navigation
        setCurrentWeekOffset: (offset) =>
          set({ currentWeekOffset: offset }, false, 'setCurrentWeekOffset'),

        goToPreviousWeek: () =>
          set(
            (state) => ({ currentWeekOffset: state.currentWeekOffset - 1 }),
            false,
            'goToPreviousWeek'
          ),

        goToNextWeek: () =>
          set(
            (state) => ({ currentWeekOffset: state.currentWeekOffset + 1 }),
            false,
            'goToNextWeek'
          ),

        goToCurrentWeek: () =>
          set({ currentWeekOffset: 0 }, false, 'goToCurrentWeek'),

        // Modal Actions
        setMessageComposeOpen: (open) =>
          set({ messageComposeOpen: open }, false, 'setMessageComposeOpen'),

        setExportDialogOpen: (open) =>
          set({ exportDialogOpen: open }, false, 'setExportDialogOpen'),

        setSettingsDialogOpen: (open) =>
          set({ settingsDialogOpen: open }, false, 'setSettingsDialogOpen'),

        // Filter Actions
        setAttendanceFilters: (filters) =>
          set(
            (state) => ({
              attendanceFilters: { ...state.attendanceFilters, ...filters },
            }),
            false,
            'setAttendanceFilters'
          ),

        resetAttendanceFilters: () =>
          set({ attendanceFilters: defaultAttendanceFilters }, false, 'resetAttendanceFilters'),

        setMessageFilters: (filters) =>
          set(
            (state) => ({
              messageFilters: { ...state.messageFilters, ...filters },
            }),
            false,
            'setMessageFilters'
          ),

        resetMessageFilters: () =>
          set({ messageFilters: defaultMessageFilters }, false, 'resetMessageFilters'),

        // Notification Actions
        addNotification: (notification) =>
          set(
            (state) => ({
              notifications: [
                {
                  ...notification,
                  id: `notif-${Date.now()}-${Math.random()}`,
                  timestamp: new Date(),
                },
                ...state.notifications,
              ],
            }),
            false,
            'addNotification'
          ),

        markNotificationAsRead: (notificationId) =>
          set(
            (state) => ({
              notifications: state.notifications.map((notif) =>
                notif.id === notificationId ? { ...notif, isRead: true } : notif
              ),
            }),
            false,
            'markNotificationAsRead'
          ),

        markAllNotificationsAsRead: () =>
          set(
            (state) => ({
              notifications: state.notifications.map((notif) => ({
                ...notif,
                isRead: true,
              })),
            }),
            false,
            'markAllNotificationsAsRead'
          ),

        removeNotification: (notificationId) =>
          set(
            (state) => ({
              notifications: state.notifications.filter(
                (notif) => notif.id !== notificationId
              ),
            }),
            false,
            'removeNotification'
          ),

        clearAllNotifications: () =>
          set({ notifications: [] }, false, 'clearAllNotifications'),

        // Preferences Actions
        setPreferences: (preferences) =>
          set(
            (state) => ({
              preferences: { ...state.preferences, ...preferences },
            }),
            false,
            'setPreferences'
          ),

        setNotificationSettings: (settings) =>
          set(
            (state) => ({
              preferences: {
                ...state.preferences,
                notificationSettings: {
                  ...state.preferences.notificationSettings,
                  ...settings,
                },
              },
            }),
            false,
            'setNotificationSettings'
          ),

        toggleAnimations: () =>
          set(
            (state) => ({
              preferences: {
                ...state.preferences,
                animationsEnabled: !state.preferences.animationsEnabled,
              },
            }),
            false,
            'toggleAnimations'
          ),

        toggleCompactMode: () =>
          set(
            (state) => ({
              preferences: {
                ...state.preferences,
                compactMode: !state.preferences.compactMode,
              },
            }),
            false,
            'toggleCompactMode'
          ),

        // Reset
        reset: () => set(initialState, false, 'reset'),
      }),
      {
        name: 'student-dashboard-storage',
        // Only persist preferences and some UI state
        partialize: (state) => ({
          preferences: state.preferences,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      }
    ),
    {
      name: 'student-dashboard-store',
    }
  )
);

// ============================================================================
// Selectors
// ============================================================================

/**
 * Hook for computed values and selectors
 * 
 * Requirements: 7.1
 */
export const useStudentDashboardSelectors = () => {
  const store = useStudentDashboardStore();

  return {
    // Computed values
    unreadNotificationsCount: store.notifications.filter((n) => !n.isRead).length,
    hasActiveFilters:
      store.attendanceFilters.statusTypes.length > 0 ||
      !!store.attendanceFilters.startDate ||
      !!store.attendanceFilters.endDate,
    hasUnreadMessages: store.messageFilters.unreadOnly,
    isCurrentWeek: store.currentWeekOffset === 0,

    // State getters
    ...store,
  };
};

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook to check if animations should be enabled
 * Respects both user preference and system preference
 * 
 * Requirements: 6.3, 7.1
 */
export const useShouldAnimate = () => {
  const { preferences } = useStudentDashboardStore();
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return preferences.animationsEnabled && !prefersReducedMotion;
};

/**
 * Hook to check if device is mobile
 * Used for disabling hover effects and enabling touch interactions
 * 
 * Requirements: 7.1, 7.2
 */
export const useIsMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};
