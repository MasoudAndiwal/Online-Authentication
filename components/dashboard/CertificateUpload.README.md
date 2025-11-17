# CertificateUpload Component

## Overview

The `CertificateUpload` component provides a comprehensive interface for students to upload and manage medical certificates. It features drag-and-drop functionality, client-side validation, upload progress tracking, and a list of uploaded files with status indicators.

## Features

### 1. Drag-and-Drop Upload Zone
- **Dashed border** (only exception to the borderless design rule)
- **Gradient background** on hover state
- **Upload icon** in solid color container
- **File type and size limits** clearly displayed
- **Keyboard accessible** with Enter/Space key support

### 2. File Validation
- **Client-side validation** for file type (PDF, JPG, PNG)
- **File size validation** (max 5MB)
- **Inline error messages** for validation failures
- **Clear error feedback** with visual indicators

### 3. Upload Progress
- **Animated progress bar** with gradient fill
- **Percentage indicator** showing upload progress
- **Smooth transitions** using Framer Motion
- **Visual feedback** during upload process

### 4. Uploaded Files List
- **Borderless cards** with shadow-md
- **File icon** based on file type (PDF or Image)
- **File metadata** (name, size, upload date)
- **Status badges** (Pending, Approved, Rejected)
- **Action buttons** (Preview, Delete) with hover effects
- **Rejection reason** displayed for rejected files
- **Staggered entrance animation** for list items

## Usage

```tsx
import { CertificateUpload } from '@/components/dashboard/CertificateUpload';
import { UploadedFile } from '@/types/types';

function MyComponent() {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const handleUpload = async (file: File) => {
    // Upload file to server
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    
    if (data.success && data.file) {
      setFiles([...files, data.file]);
    } else {
      throw new Error(data.error || 'Upload failed');
    }
  };

  const handleDelete = async (fileId: string) => {
    // Delete file from server
    await fetch(`/api/upload/${fileId}`, {
      method: 'DELETE',
    });
    
    setFiles(files.filter(f => f.id !== fileId));
  };

  return (
    <CertificateUpload
      files={files}
      onUpload={handleUpload}
      onDelete={handleDelete}
    />
  );
}
```

## Props

### CertificateUploadProps

| Prop | Type | Description |
|------|------|-------------|
| `files` | `UploadedFile[]` | Array of uploaded files to display |
| `onUpload` | `(file: File) => Promise<void>` | Callback function to handle file upload |
| `onDelete` | `(fileId: string) => Promise<void>` | Callback function to handle file deletion |

### UploadedFile Interface

```typescript
interface UploadedFile {
  id: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}
```

## Design Specifications

### Upload Zone
- **Border**: 2px dashed border (slate-300 default, blue-400 on drag)
- **Background**: slate-50 default, gradient (blue-50 to violet-50) on drag
- **Padding**: 2rem (p-8)
- **Border radius**: 1rem (rounded-2xl)
- **Icon container**: 64px (w-16 h-16), rounded-lg, solid color background
- **Icon size**: 32px (w-8 h-8)

### File Cards
- **Background**: white
- **Border**: none (border-0)
- **Shadow**: shadow-md (hover: shadow-lg)
- **Border radius**: 0.75rem (rounded-xl)
- **Padding**: 1rem (p-4)
- **Icon container**: 48px (w-12 h-12), rounded-lg, blue-100 background
- **Icon size**: 24px (w-6 h-6)

### Status Badges
- **Pending**: amber-100 background, amber-700 text
- **Approved**: emerald-100 background, emerald-700 text
- **Rejected**: red-100 background, red-700 text
- **Border**: none (border-0)
- **Shadow**: shadow-sm
- **Padding**: 0.375rem 0.75rem (px-3 py-1.5)
- **Border radius**: 0.5rem (rounded-lg)

### Progress Bar
- **Height**: 0.5rem (h-2)
- **Background**: slate-200
- **Fill**: gradient from blue-500 to violet-500
- **Border radius**: 9999px (rounded-full)
- **Animation**: 0.3s ease-out

## Validation Rules

### File Type
- **Allowed MIME types**: `application/pdf`, `image/jpeg`, `image/png`
- **Allowed extensions**: `.pdf`, `.jpg`, `.jpeg`, `.png`
- **Error message**: "Invalid file type. Please upload PDF, JPG, or PNG files only."

### File Size
- **Maximum size**: 5MB (5,242,880 bytes)
- **Error message**: "File size exceeds 5MB limit. Please upload a smaller file."

## Accessibility

### Keyboard Navigation
- Upload zone is keyboard accessible (Tab to focus, Enter/Space to activate)
- All buttons are keyboard accessible
- Focus indicators visible on all interactive elements

### ARIA Labels
- Upload zone has `role="button"` and `aria-label="Upload medical certificate"`
- File input has `aria-hidden="true"` (hidden from screen readers)
- Action buttons have descriptive `aria-label` attributes

### Screen Reader Support
- Clear labels for all interactive elements
- Status information announced via status badges
- Error messages are visible and announced

## Animation Details

### Entrance Animations
- **Upload zone icon**: Scale animation on drag (1 to 1.1)
- **File list items**: Fade in with y-offset (0 to 10px), staggered by 50ms
- **Error messages**: Fade in with y-offset (-10px to 0)

### Exit Animations
- **File list items**: Fade out with x-offset (0 to -20px)

### Hover Effects
- **File cards**: Shadow elevation (shadow-md to shadow-lg)
- **Action buttons**: Scale transformation (1 to 1.1)

### Progress Animation
- **Progress bar**: Width transition from 0 to percentage (0.3s ease-out)
- **Percentage text**: Updates in sync with progress bar

## Error Handling

### Upload Errors
- Validation errors displayed inline below upload zone
- Network errors caught and displayed with retry option
- Clear error messages with visual indicators (X icon, red background)

### Delete Errors
- Confirmation dialog before deletion
- Error alert if deletion fails
- State rollback on error

## Requirements Mapping

This component satisfies the following requirements from the spec:

- **Requirement 6.1**: Display medical certificate upload section with drag-and-drop zone
- **Requirement 6.2**: Apply hover state styling with border and background color transitions
- **Requirement 6.3**: Validate file type (PDF, JPG, PNG) and size (maximum 5MB) before upload
- **Requirement 6.4**: Show file name, size, upload date, and status badge
- **Requirement 6.5**: Provide preview and delete action buttons with hover scale effects
- **Requirement 6.6**: Display animated progress indicator during upload

## Future Enhancements

- [ ] File preview modal for viewing uploaded documents
- [ ] Bulk upload support (multiple files at once)
- [ ] Image compression before upload
- [ ] PDF thumbnail generation
- [ ] Download uploaded files
- [ ] Real-time upload progress from server
- [ ] Drag to reorder files
- [ ] File categories/tags
