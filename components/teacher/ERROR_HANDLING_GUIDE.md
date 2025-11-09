# Error Handling and Loading States Guide

This guide explains how to use the comprehensive error handling and loading state components in the teacher dashboard.

## Table of Contents

1. [Skeleton Loading Components](#skeleton-loading-components)
2. [Error Boundaries](#error-boundaries)
3. [Retry Mechanisms](#retry-mechanisms)
4. [Offline Support](#offline-support)
5. [Complete Examples](#complete-examples)

---

## Skeleton Loading Components

### Available Skeleton Components

All skeleton components feature shimmer animations and match the structure of their actual components:

```tsx
import {
  SkeletonMetricCard,
  SkeletonClassCard,
  SkeletonStudentProgressCard,
  SkeletonReportCard,
  SkeletonAttendanceGrid,
  SkeletonNotificationItem,
  SkeletonChart,
  SkeletonTeacherDashboard
} from '@/components/teacher'
```

### Grid Layouts

Use grid components for multiple skeleton cards:

```tsx
import {
  SkeletonMetricGrid,
  SkeletonClassGrid,
  SkeletonStudentProgressGrid,
  SkeletonReportGrid
} from '@/components/teacher'

// Example: Loading state for class cards
function ClassesSection() {
  const { data, isLoading } = useClasses()

  if (isLoading) {
    return <SkeletonClassGrid count={6} columns={3} />
  }

  return <ClassGrid classes={data} />
}
```

### Full Page Loading

```tsx
import { SkeletonTeacherDashboard } from '@/components/teacher'

function TeacherDashboard() {
  const { data, isLoading } = useDashboardData()

  if (isLoading) {
    return <SkeletonTeacherDashboard />
  }

  return <DashboardContent data={data} />
}
```

---

## Error Boundaries

### Basic Error Boundary

Wrap components to catch and handle errors gracefully:

```tsx
import { ErrorBoundary } from '@/components/teacher'

function App() {
  return (
    <ErrorBoundary>
      <TeacherDashboard />
    </ErrorBoundary>
  )
}
```

### Section Error Boundary

For individual dashboard sections:

```tsx
import { SectionErrorBoundary } from '@/components/teacher'

function Dashboard() {
  return (
    <div>
      <SectionErrorBoundary sectionName="Class Overview">
        <ClassOverviewSection />
      </SectionErrorBoundary>

      <SectionErrorBoundary sectionName="Student Progress">
        <StudentProgressSection />
      </SectionErrorBoundary>
    </div>
  )
}
```

### Custom Error Fallback

```tsx
import { ErrorBoundary, CompactErrorFallback } from '@/components/teacher'

function MyComponent() {
  return (
    <ErrorBoundary fallback={CompactErrorFallback}>
      <SomeComponent />
    </ErrorBoundary>
  )
}
```

### Error Handler Hook

Throw errors imperatively:

```tsx
import { useErrorHandler } from '@/components/teacher'

function MyComponent() {
  const handleError = useErrorHandler()

  async function fetchData() {
    try {
      const data = await api.getData()
      return data
    } catch (error) {
      handleError(error) // This will be caught by nearest ErrorBoundary
    }
  }

  return <div>...</div>
}
```

---

## Retry Mechanisms

### Basic Retry with Exponential Backoff

```tsx
import { retryWithBackoff } from '@/lib/utils/retry'

async function fetchData() {
  const data = await retryWithBackoff(
    async () => {
      const response = await fetch('/api/data')
      if (!response.ok) throw new Error('Failed to fetch')
      return response.json()
    },
    {
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
      onRetry: (error, attempt, delay) => {
        console.log(`Retry attempt ${attempt} after ${delay}ms`)
      }
    }
  )
  return data
}
```

### Fetch with Retry

```tsx
import { fetchWithRetry } from '@/lib/utils/retry'

async function getData() {
  const response = await fetchWithRetry('/api/data', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }, {
    maxAttempts: 3,
    shouldRetry: (error, attempt) => {
      // Custom retry logic
      return error.status >= 500 && attempt < 3
    }
  })
  
  return response.json()
}
```

### React Hook for Retry

```tsx
import { useRetry } from '@/lib/utils/retry'

function MyComponent() {
  const { retry, isRetrying, retryCount, lastError } = useRetry()

  async function handleSubmit() {
    try {
      await retry(async () => {
        return await api.submitData(formData)
      }, {
        maxAttempts: 3
      })
      
      toast.success('Data submitted successfully')
    } catch (error) {
      toast.error('Failed to submit data after retries')
    }
  }

  return (
    <div>
      <button onClick={handleSubmit} disabled={isRetrying}>
        {isRetrying ? `Retrying (${retryCount})...` : 'Submit'}
      </button>
      {lastError && <p>Error: {lastError.message}</p>}
    </div>
  )
}
```

### Error Handling Hooks

```tsx
import { useErrorHandling, useAsyncOperation, useFormSubmission } from '@/lib/hooks/use-error-handling'

// 1. useErrorHandling - Comprehensive error handling
function DataComponent() {
  const { execute, data, isLoading, error, resetError } = useErrorHandling({
    maxAttempts: 3,
    fallbackData: []
  })

  React.useEffect(() => {
    execute(async () => {
      const response = await fetch('/api/data')
      return response.json()
    })
  }, [])

  if (isLoading) return <SkeletonGrid />
  if (error) return <ErrorMessage error={error} onRetry={resetError} />
  return <DataDisplay data={data} />
}

// 2. useAsyncOperation - Simple async operations
function SimpleComponent() {
  const { data, loading, error, execute } = useAsyncOperation()

  async function loadData() {
    await execute(async () => {
      return await api.getData()
    })
  }

  return <div>...</div>
}

// 3. useFormSubmission - Form submissions with retry
function FormComponent() {
  const { submit, isSubmitting, submitError, submitSuccess } = useFormSubmission()

  async function handleSubmit(e) {
    e.preventDefault()
    await submit(async () => {
      return await api.submitForm(formData)
    }, {
      maxAttempts: 2
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
      {submitSuccess && <p>Success!</p>}
      {submitError && <p>Error: {submitError.message}</p>}
    </form>
  )
}
```

---

## Offline Support

### Online Status Detection

```tsx
import { useOnlineStatus } from '@/lib/utils/offline-support'

function MyComponent() {
  const isOnline = useOnlineStatus()

  return (
    <div>
      {!isOnline && (
        <div className="bg-orange-500 text-white p-2">
          You are offline. Changes will sync when you reconnect.
        </div>
      )}
      {/* rest of component */}
    </div>
  )
}
```

### Offline Indicators

```tsx
import { 
  OfflineIndicator, 
  OfflineBadge, 
  NetworkStatusIcon 
} from '@/components/teacher'

function Layout({ children }) {
  return (
    <div>
      <OfflineIndicator /> {/* Banner at top */}
      <OfflineBadge /> {/* Badge in corner */}
      
      <header>
        <NetworkStatusIcon /> {/* Small icon */}
      </header>
      
      {children}
    </div>
  )
}
```

### Sync Queue

```tsx
import { AttendanceSyncQueue, useSyncQueue } from '@/lib/utils/offline-support'

// Create queue instance
const attendanceQueue = new AttendanceSyncQueue()

function AttendanceComponent() {
  const { queueSize, addToQueue, processQueue } = useSyncQueue(attendanceQueue)

  async function markAttendance(studentId, status) {
    // Add to queue (will sync when online)
    addToQueue('attendance-update', {
      studentId,
      status,
      timestamp: Date.now()
    })

    // Show feedback
    toast.success('Attendance marked (will sync when online)')
  }

  return (
    <div>
      {queueSize > 0 && (
        <div>
          {queueSize} changes pending sync
          <button onClick={processQueue}>Sync Now</button>
        </div>
      )}
      {/* attendance UI */}
    </div>
  )
}
```

### Offline Mode Provider

Wrap your app to enable offline functionality:

```tsx
import { OfflineModeProvider, AttendanceSyncQueue } from '@/components/teacher'

const syncQueue = new AttendanceSyncQueue()

function App() {
  return (
    <OfflineModeProvider
      showIndicator={true}
      showBadge={false}
      syncQueue={syncQueue}
    >
      <TeacherDashboard />
    </OfflineModeProvider>
  )
}
```

### Cache Management

```tsx
import { useCache, CacheManager } from '@/lib/utils/offline-support'

// Using the hook
function DataComponent() {
  const { cachedData, setCache, clearCache } = useCache('dashboard-data', 5 * 60 * 1000) // 5 min TTL

  async function loadData() {
    if (cachedData) {
      return cachedData
    }

    const data = await api.getData()
    await setCache(data)
    return data
  }

  return <div>...</div>
}

// Using the class directly
const cacheManager = new CacheManager()

async function saveToCache() {
  await cacheManager.set('key', data, 60000) // 1 minute TTL
}

async function getFromCache() {
  const data = await cacheManager.get('key')
  return data
}
```

---

## Complete Examples

### Complete Dashboard with All Features

```tsx
import {
  ErrorBoundary,
  SectionErrorBoundary,
  SkeletonTeacherDashboard,
  SkeletonClassGrid,
  OfflineModeProvider,
  AttendanceSyncQueue
} from '@/components/teacher'
import { useErrorHandling } from '@/lib/hooks/use-error-handling'
import { useOnlineStatus } from '@/lib/utils/offline-support'

const syncQueue = new AttendanceSyncQueue()

function TeacherDashboard() {
  const { execute, data, isLoading, error, resetError } = useErrorHandling({
    maxAttempts: 3,
    fallbackData: null
  })
  const isOnline = useOnlineStatus()

  React.useEffect(() => {
    execute(async () => {
      const response = await fetch('/api/dashboard')
      return response.json()
    })
  }, [])

  if (isLoading) {
    return <SkeletonTeacherDashboard />
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-red-900 mb-2">
            Failed to Load Dashboard
          </h2>
          <p className="text-red-700 mb-4">{error.message}</p>
          <button
            onClick={resetError}
            className="bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <OfflineModeProvider syncQueue={syncQueue} showIndicator={true}>
      <ErrorBoundary>
        <div className="space-y-6">
          <SectionErrorBoundary sectionName="Metrics">
            <MetricsSection data={data.metrics} />
          </SectionErrorBoundary>

          <SectionErrorBoundary sectionName="Classes">
            <ClassesSection classes={data.classes} />
          </SectionErrorBoundary>

          <SectionErrorBoundary sectionName="Student Progress">
            <StudentProgressSection students={data.students} />
          </SectionErrorBoundary>
        </div>
      </ErrorBoundary>
    </OfflineModeProvider>
  )
}

function ClassesSection({ classes }) {
  const [isLoading, setIsLoading] = React.useState(false)

  if (isLoading) {
    return <SkeletonClassGrid count={6} columns={3} />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {classes.map(cls => (
        <ClassCard key={cls.id} class={cls} />
      ))}
    </div>
  )
}

export default TeacherDashboard
```

### Attendance Marking with Offline Support

```tsx
import { useFormSubmission } from '@/lib/hooks/use-error-handling'
import { useSyncQueue, AttendanceSyncQueue } from '@/lib/utils/offline-support'
import { useOnlineStatus } from '@/lib/utils/offline-support'

const attendanceQueue = new AttendanceSyncQueue()

function AttendanceMarking({ classId, students }) {
  const { submit, isSubmitting, submitError } = useFormSubmission()
  const { addToQueue } = useSyncQueue(attendanceQueue)
  const isOnline = useOnlineStatus()

  async function markAttendance(studentId, status) {
    if (!isOnline) {
      // Queue for later sync
      addToQueue('attendance-update', {
        classId,
        studentId,
        status,
        timestamp: Date.now()
      })
      toast.success('Marked offline - will sync when online')
      return
    }

    // Submit immediately if online
    await submit(async () => {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId, studentId, status })
      })
      
      if (!response.ok) throw new Error('Failed to mark attendance')
      return response.json()
    }, {
      maxAttempts: 2
    })
  }

  return (
    <div>
      {!isOnline && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <p className="text-orange-800">
            You are offline. Attendance will be synced when you reconnect.
          </p>
        </div>
      )}

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800">{submitError.message}</p>
        </div>
      )}

      <div className="space-y-2">
        {students.map(student => (
          <div key={student.id} className="flex items-center gap-4">
            <span>{student.name}</span>
            <button
              onClick={() => markAttendance(student.id, 'PRESENT')}
              disabled={isSubmitting}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Present
            </button>
            <button
              onClick={() => markAttendance(student.id, 'ABSENT')}
              disabled={isSubmitting}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Absent
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## Best Practices

1. **Always wrap async operations with error handling**
   - Use `retryWithBackoff` for network requests
   - Implement proper error boundaries
   - Show user-friendly error messages

2. **Provide loading states**
   - Use skeleton components that match actual content
   - Never show blank screens or simple spinners
   - Implement progressive loading for better UX

3. **Handle offline scenarios**
   - Queue important operations when offline
   - Show clear offline indicators
   - Sync automatically when back online

4. **Cache strategically**
   - Cache frequently accessed data
   - Set appropriate TTLs
   - Clear cache when data becomes stale

5. **Test error scenarios**
   - Test with network throttling
   - Test offline functionality
   - Test error recovery flows

---

## Summary

This comprehensive error handling and loading state system provides:

- ✅ Beautiful skeleton loading components with shimmer effects
- ✅ Robust error boundaries with graceful fallbacks
- ✅ Automatic retry with exponential backoff
- ✅ Offline support with sync queue
- ✅ Network status detection and indicators
- ✅ Cache management for better performance
- ✅ React hooks for easy integration

All components follow the teacher dashboard's orange theme and modern design patterns.
