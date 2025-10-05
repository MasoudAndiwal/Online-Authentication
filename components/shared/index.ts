// Shared components for the teacher-student list redesign
export { 
  ListItemCard,
  type ColorScheme,
  type BaseListItem,
  type TeacherListItem,
  type StudentListItem,
  type ListItemActions
} from './ListItemCard'

export {
  ResponsiveGrid,
  ResponsiveContainer,
  useBreakpoint,
  breakpoints,
  gridConfigs,
  responsiveClasses,
  mobileOptimizations,
  mediaQueries,
  type GridConfig
} from './ResponsiveGrid'

export {
  EmptyState,
  NoTeachersState,
  NoStudentsState,
  NoSearchResultsState,
  type EmptyStateType,
  type EmptyStateActions
} from './EmptyState'

export {
  LoadingState,
  SkeletonCard,
  SkeletonGrid,
  SkeletonTable,
  TeacherListLoading,
  StudentListLoading,
  DataLoading,
  RefreshLoading,
  type LoadingStateType
} from './LoadingState'