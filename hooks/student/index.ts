/**
 * Student Dashboard Hooks
 * 
 * Centralized exports for all student-related hooks
 * 
 * Requirements: 1.2, 3.1, 5.1, 11.1, 13.5
 */

// Dashboard Metrics Hooks
export {
  useStudentDashboardMetrics,
  useStudentDashboard, // Legacy name
  useStudentAttendance,
  useAttendanceHistory,
  useStudentClass,
  useAcademicStatus,
  useExportAttendance,
  useRefetchStudentData,
  type StudentDashboardMetrics,
  type AcademicStatus,
  type AttendanceStatistics,
  type WeekAttendance,
  type SessionAttendance,
  type AttendanceRecord,
  type ClassInfo,
  type ClassSchedule,
  type TeacherInfo,
  type AttendancePolicy,
} from "../use-student-dashboard";

// Messaging Hooks
export {
  useStudentConversations,
  useStudentMessages, // Alias
  useConversationMessages,
  useSendMessage,
  useMarkMessagesRead,
  useMessageWebSocket,
  useUploadAttachment,
  type Conversation,
  type Message,
  type Attachment,
  type SendMessageData,
} from "../use-student-messages";

// Real-time Updates Hooks
export {
  useStudentRealtime,
  useOptimisticUpdates,
  useConnectionStatus,
  type RealtimeEventType,
  type RealtimeEvent,
  type AttendanceMarkedEvent,
  type MessageReceivedEvent,
  type StatusChangedEvent,
  type ScheduleUpdatedEvent,
} from "../use-student-realtime";

// State Management
export {
  useStudentDashboardStore,
  useStudentDashboardSelectors,
  useShouldAnimate,
  useIsMobile,
  type StudentDashboardPreferences,
  type NotificationSettings,
  type AttendanceFilters,
  type MessageFilters,
  type Notification,
} from "../../lib/stores/student-dashboard-store";
