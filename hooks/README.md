# Custom Hooks Documentation

## useAttendance

Hook for fetching and managing student attendance data with automatic retry logic and authentication handling.

### Features
- Automatic authentication check with redirect to login
- Authorization validation (students can only access their own data)
- Exponential backoff retry logic for network errors
- Loading and error state management
- Manual refetch capability

### Usage

```typescript
import { useAttendance } from '@/hooks/use-attendance';

function AttendanceDashboard() {
  const { data, isLoading, error, refetch, retry } = useAttendance({
    autoFetch: true, // Optional: auto-fetch on mount (default: true)
    studentId: 'optional-student-id', // Optional: defaults to current user
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <ErrorState 
        message={error.message}
        onRetry={retry}
      />
    );
  }

  if (!data) {
    return <EmptyState />;
  }

  return (
    <div>
      <h1>Welcome, {data.student.name}</h1>
      <StatsCards stats={data.stats} />
      <WeeklyCalendar weekData={data.weekData} />
      {/* ... other components */}
    </div>
  );
}
```

### Return Values

- `data`: AttendanceResponse | null - The fetched attendance data
- `isLoading`: boolean - Loading state
- `error`: Error | null - Error object if fetch failed
- `refetch`: () => Promise<void> - Manually refetch data
- `retry`: () => Promise<void> - Retry failed request

## useFileUpload

Hook for uploading medical certificates with client-side validation and progress tracking.

### Features
- Client-side file validation (type, size)
- Real-time upload progress tracking
- State management (idle, uploading, success, error)
- Comprehensive error handling

### Usage

```typescript
import { useFileUpload } from '@/hooks/use-file-upload';

function CertificateUpload() {
  const {
    uploadState,
    uploadProgress,
    uploadedFile,
    error,
    uploadFile,
    reset,
    validateFile,
  } = useFileUpload();

  const handleFileSelect = async (file: File) => {
    // Optional: validate before upload
    const validation = validateFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    // Upload file
    await uploadFile(file);
  };

  return (
    <div>
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />

      {uploadState === 'uploading' && (
        <ProgressBar progress={uploadProgress} />
      )}

      {uploadState === 'success' && uploadedFile && (
        <div>
          <p>File uploaded successfully!</p>
          <p>{uploadedFile.fileName}</p>
        </div>
      )}

      {uploadState === 'error' && error && (
        <div>
          <p>Error: {error}</p>
          <button onClick={reset}>Try Again</button>
        </div>
      )}
    </div>
  );
}
```

### Return Values

- `uploadState`: 'idle' | 'uploading' | 'success' | 'error' - Current upload state
- `uploadProgress`: number - Upload progress (0-100)
- `uploadedFile`: UploadedFile | null - Uploaded file metadata on success
- `error`: string | null - Error message if upload failed
- `uploadFile`: (file: File) => Promise<void> - Upload a file
- `reset`: () => void - Reset upload state
- `validateFile`: (file: File) => { valid: boolean; error?: string } - Validate file before upload

### File Validation Rules

- **Max file size**: 5MB
- **Allowed types**: PDF, JPG, PNG
- **Validation**: Both extension and MIME type are checked

## Requirements Mapping

### useAttendance
- **Requirement 9.3**: Error handling with retry logic
- **Requirement 10.1**: Authentication verification
- **Requirement 10.2**: Authorization check (students can only access own data)

### useFileUpload
- **Requirement 6.3**: Client-side file validation
- **Requirement 6.6**: Upload progress indicator
