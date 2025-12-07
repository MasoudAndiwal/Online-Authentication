// Student Progress Tracking Components
export { StudentProgressCard, StudentProgressGrid } from './student-progress-card'
export type { StudentProgressData, AttendanceHistoryEntry } from './student-progress-card'

export { ProgressCharts } from './progress-charts'
export type { 
  AttendanceDataPoint, 
  WeeklyAttendanceData, 
  MonthlyAttendanceData 
} from './progress-charts'

export { RiskAssessment } from './risk-assessment'
export type { 
  RiskAssessmentData, 
  Recommendation, 
  AlertPattern 
} from './risk-assessment'

export { StudentProgressSection } from './student-progress-section'

// Reports and Analytics Components
export { ReportsDashboard } from './reports-dashboard'
export type { ReportType, ReportFilters } from './reports-dashboard'

export { FilterPanel } from './filter-panel'
export { ExportDialog } from './export-dialog'
export type { ExportFormat } from './export-dialog'

export { ExportManager } from './export-manager'
export { AdvancedFilter } from './advanced-filter'
export type { AdvancedReportFilters } from './advanced-filter'

// Demo Components

// Class-specific Reports
export { ClassReportsDashboard } from './class-reports-dashboard'
export type { ClassReportType } from './class-reports-dashboard'

// Class-specific Students Management
export { ClassStudentsDashboard } from './class-students-dashboard'
export type { ClassStudent } from './class-students-dashboard'

// Class-specific Schedule Management
export { ClassScheduleDashboard } from './class-schedule-dashboard'
export type { ClassScheduleEntry } from './class-schedule-dashboard'

// Class-specific Management
export { ClassManageDashboard } from './class-manage-dashboard'
export type { ClassInfo } from './class-manage-dashboard'

// Notification Center Components
export { NotificationCenter, NotificationTrigger } from './notification-center'
export type { Notification, NotificationType } from './notification-center'

export { NotificationSettings } from './notification-settings'
export type { NotificationPreferences } from './notification-settings'


// Loading States and Skeleton Components
export {
  ShimmerEffect,
  SkeletonMetricCard,
  SkeletonClassCard,
  SkeletonStudentProgressCard,
  SkeletonReportCard,
  SkeletonAttendanceGrid,
  SkeletonNotificationItem,
  SkeletonChart,
  SkeletonMetricGrid,
  SkeletonClassGrid,
  SkeletonStudentProgressGrid,
  SkeletonReportGrid,
  SkeletonTeacherDashboard
} from './skeleton-loaders'

// Error Handling Components
export {
  ErrorBoundary,
  DefaultErrorFallback,
  CompactErrorFallback,
  SectionErrorBoundary,
  useErrorHandler
} from './error-boundary'
export type { ErrorFallbackProps } from './error-boundary'

// Offline Support Components
export {
  OfflineIndicator,
  OfflineBadge,
  SyncQueueStatus,
  NetworkStatusIcon,
  OfflineModeProvider
} from './offline-indicator'