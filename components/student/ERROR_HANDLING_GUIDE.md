# Student Dashboard Error Handling Guide

## Overview

This guide explains the comprehensive error handling system implemented for the student dashboard. The system provides user-friendly error messages, automatic retry mechanisms, and graceful degradation.

## Requirements

**Requirement 15.2**: Implement network error handling, data validation errors, permission errors, user-friendly error messages, and retry mechanisms.

## Components

### 1. Error Boundary Components

#### StudentErrorBoundary
Full-page error boundary that catches JavaScript errors in the student dashboard.

```tsx
import { StudentErrorBoundary } from '@/components/student/error-boundary'

<StudentErrorBoundary>
  <YourComponent />
</StudentErrorBoundary>
```

#### StudentSectionErrorBoundary
Section-level error boundary for wrapping individual dashboard sections.

```tsx
import { StudentSectionErrorBoundary } from '@/components/student/error-boundary'

<StudentSectionErrorBoundary sectionName="Dashboard Metrics">
  <DashboardMetrics {...props} />
</StudentSectionErrorBoundary>
```

### 2. Error Display Components

#### ErrorDisplay
Main error display component with multiple variants.

```tsx
import { ErrorDisplay } from '@/components/student/error-display'

// Full variant (default)
<ErrorDisplay
  error={error}
  onRetry={() => refetch()}
  variant="full"
  showDetails={true}
/>

// Compact variant
<ErrorDisplay
  error={error}
  onRetry={() => refetch()}
  variant="compact"
/>

// Inline variant
<ErrorDisplay
  error={error}
  onRetry={() => refetch()}
  onDismiss={() => setError(null)}
  variant="inline"
/>
```

#### NetworkErrorDisplay
Specialized component for network errors.

```tsx
import { NetworkErrorDisplay } from '@/components/student/error-display'

<NetworkErrorDisplay onRetry={() => refetch()} />
```

#### PermissionErrorDisplay
Specialized component for permission errors.

```tsx
import { PermissionErrorDisplay } from '@/components/student/error-display'

<PermissionErrorDisplay message="You cannot access this data." />
```

## Error Types

### 1. Network Errors
Occurs when there's no internet connection or network issues.

```typescript
import { NetworkError } from '@/lib/utils/student-error-handling'

throw new NetworkError('Unable to connect to server')
```

**User Message**: "Unable to connect. Please check your internet connection and try again."

**Actions**:
- Check internet connection
- Try refreshing the page
- Switch to a different network

### 2. Authentication Errors
Occurs when the user's session has expired.

```typescript
import { AuthenticationError } from '@/lib/utils/student-error-handling'

throw new AuthenticationError()
```

**User Message**: "Your session has expired. Please log in again to continue."

**Actions**:
- Log in again
- Clear browser cache
- Contact support if unable to log in

### 3. Permission Errors
Occurs when the user doesn't have permission to access data.

```typescript
import { PermissionError } from '@/lib/utils/student-error-handling'

throw new PermissionError('You can only view your own data')
```

**User Message**: "You do not have permission to view this information."

**Actions**:
- Contact teacher for assistance
- Verify correct account
- Check account permissions

### 4. Validation Errors
Occurs when data validation fails.

```typescript
import { ValidationError } from '@/lib/utils/student-error-handling'

throw new ValidationError('Invalid date range', 'dateRange')
```

**User Message**: "The information provided is invalid. Please check and try again."

**Actions**:
- Check entered information
- Fill all required fields
- Try different information

### 5. Server Errors
Occurs when the server encounters an error.

```typescript
import { ServerError } from '@/lib/utils/student-error-handling'

throw new ServerError()
```

**User Message**: "Our servers are experiencing issues. Please try again in a few moments."

**Actions**:
- Wait and try again
- Refresh the page
- Contact support if problem persists

## Data Validation

### Validate Student ID

```typescript
import { validateStudentId } from '@/lib/utils/student-error-handling'

const error = validateStudentId(studentId)
if (error) {
  throw error
}
```

### Validate Date Range

```typescript
import { validateDateRange } from '@/lib/utils/student-error-handling'

const error = validateDateRange(startDate, endDate)
if (error) {
  throw error
}
```

### Validate Attendance Status

```typescript
import { validateAttendanceStatus } from '@/lib/utils/student-error-handling'

const error = validateAttendanceStatus(status)
if (error) {
  throw error
}
```

## API Error Handling

### Fetch with Error Handling

```typescript
import { fetchWithErrorHandling } from '@/lib/utils/student-error-handling'

try {
  const data = await fetchWithErrorHandling<StudentData>(
    '/api/students/dashboard',
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      maxAttempts: 3,
      initialDelay: 1000,
    }
  )
  return data
} catch (error) {
  // Error is already classified and user-friendly
  console.error(error)
}
```

### Handle API Response

```typescript
import { handleApiResponse } from '@/lib/utils/student-error-handling'

const response = await fetch('/api/students/dashboard')
const data = await handleApiResponse<StudentData>(response)
```

## Permission Checking

### Check Student Data Permission

```typescript
import { checkStudentDataPermission } from '@/lib/utils/student-error-handling'

const error = checkStudentDataPermission(currentUserId, requestedStudentId)
if (error) {
  throw error
}
```

### Check Export Permission

```typescript
import { checkExportPermission } from '@/lib/utils/student-error-handling'

const error = checkExportPermission(currentUserId)
if (error) {
  throw error
}
```

## Retry Mechanisms

### Automatic Retry with Exponential Backoff

The system automatically retries failed requests with exponential backoff:

- **Initial delay**: 1 second
- **Max delay**: 10 seconds
- **Max attempts**: 3
- **Backoff multiplier**: 2x

```typescript
// Configured in React Query hooks
retry: (failureCount, error: any) => {
  // Don't retry on client errors (4xx)
  if (error.status >= 400 && error.status < 500) {
    return false
  }
  // Don't retry on network errors if offline
  if (error.name === 'NetworkError' && !navigator.onLine) {
    return false
  }
  // Retry up to 3 times for server errors
  return failureCount < 3
},
retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
```

### Manual Retry

```typescript
import { recoverWithRetry } from '@/lib/utils/student-error-handling'

try {
  const data = await recoverWithRetry(
    async () => {
      const response = await fetch('/api/students/dashboard')
      return await response.json()
    },
    3 // max attempts
  )
} catch (error) {
  // Handle error after all retries failed
}
```

## Error Logging

### Development Logging

```typescript
import { logError } from '@/lib/utils/student-error-handling'

try {
  // Your code
} catch (error) {
  logError(error as Error, {
    context: 'Dashboard Metrics',
    userId: user.id,
  })
}
```

### Production Error Reporting

```typescript
import { reportError } from '@/lib/utils/student-error-handling'

try {
  // Your code
} catch (error) {
  reportError(error as Error, {
    context: 'Dashboard Metrics',
    userId: user.id,
  })
}
```

## Usage Examples

### Example 1: Dashboard Page with Error Handling

```tsx
import { StudentErrorBoundary, StudentSectionErrorBoundary } from '@/components/student/error-boundary'
import { ErrorDisplay } from '@/components/student/error-display'
import { useStudentDashboard } from '@/hooks/use-student-dashboard'

export default function StudentDashboardPage() {
  const { data, error, isLoading, refetch } = useStudentDashboard(userId)

  return (
    <StudentErrorBoundary>
      <StudentSectionErrorBoundary sectionName="Dashboard Metrics">
        {error ? (
          <ErrorDisplay
            error={error}
            onRetry={() => refetch()}
            variant="compact"
          />
        ) : isLoading ? (
          <LoadingSkeleton />
        ) : data ? (
          <DashboardMetrics {...data} />
        ) : null}
      </StudentSectionErrorBoundary>
    </StudentErrorBoundary>
  )
}
```

### Example 2: API Hook with Error Handling

```typescript
import { useQuery } from '@tanstack/react-query'
import { fetchWithErrorHandling } from '@/lib/utils/student-error-handling'

export function useStudentData(studentId: string) {
  return useQuery({
    queryKey: ['student-data', studentId],
    queryFn: async () => {
      return await fetchWithErrorHandling<StudentData>(
        `/api/students/${studentId}`,
        {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        },
        {
          maxAttempts: 3,
          initialDelay: 1000,
        }
      )
    },
    retry: (failureCount, error: any) => {
      if (error.status >= 400 && error.status < 500) return false
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  })
}
```

### Example 3: Form Submission with Validation

```typescript
import { validateStudentId, ValidationError } from '@/lib/utils/student-error-handling'

async function handleSubmit(formData: FormData) {
  try {
    // Validate input
    const studentId = formData.get('studentId') as string
    const validationError = validateStudentId(studentId)
    if (validationError) {
      throw validationError
    }

    // Submit data
    const response = await fetch('/api/students/update', {
      method: 'POST',
      body: JSON.stringify({ studentId }),
    })

    if (!response.ok) {
      throw new Error('Failed to update')
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ValidationError) {
      // Show validation error to user
      showError(error.message)
    } else {
      // Show generic error
      showError('An error occurred. Please try again.')
    }
  }
}
```

## Best Practices

1. **Always wrap components in error boundaries**: Use `StudentSectionErrorBoundary` for individual sections and `StudentErrorBoundary` for the entire page.

2. **Provide retry mechanisms**: Always offer users a way to retry failed operations.

3. **Show user-friendly messages**: Use the error classification system to show appropriate messages.

4. **Validate data early**: Validate user input before making API calls.

5. **Log errors appropriately**: Use `logError` in development and `reportError` in production.

6. **Handle offline scenarios**: Check `navigator.onLine` and show appropriate messages.

7. **Don't retry client errors**: 4xx errors indicate client-side issues that won't be fixed by retrying.

8. **Use exponential backoff**: Prevent overwhelming the server with rapid retry attempts.

9. **Provide context**: Include relevant context when logging errors.

10. **Test error scenarios**: Test network failures, permission errors, and validation errors.

## Testing

### Test Network Errors

```typescript
// Simulate network error
global.fetch = jest.fn(() => Promise.reject(new TypeError('Failed to fetch')))

// Test component
render(<YourComponent />)
expect(screen.getByText(/network error/i)).toBeInTheDocument()
```

### Test Permission Errors

```typescript
// Simulate 403 error
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: false,
    status: 403,
    json: () => Promise.resolve({ error: 'Forbidden' }),
  })
)

// Test component
render(<YourComponent />)
expect(screen.getByText(/permission/i)).toBeInTheDocument()
```

### Test Validation Errors

```typescript
import { validateStudentId } from '@/lib/utils/student-error-handling'

test('validates student ID', () => {
  expect(validateStudentId('')).toBeInstanceOf(ValidationError)
  expect(validateStudentId('valid-id')).toBeNull()
})
```

## Troubleshooting

### Error boundaries not catching errors

- Ensure error boundaries are client components (`'use client'`)
- Check that errors are thrown during render, not in event handlers
- Use `useStudentErrorHandler` hook for imperative error throwing

### Retry not working

- Check retry configuration in React Query
- Verify `shouldRetry` function logic
- Ensure network is available

### Error messages not user-friendly

- Use `getStudentErrorMessage` to get user-friendly messages
- Classify errors with `classifyError` before displaying
- Provide context-specific messages

## Support

For issues or questions about error handling:
1. Check this guide first
2. Review error logs in development console
3. Contact technical support with error details
