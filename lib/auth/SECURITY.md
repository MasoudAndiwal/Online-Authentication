# Security Implementation Guide

## Overview

This document outlines the security measures implemented for the Student Dashboard, focusing on authentication, authorization, data privacy, and file upload security.

## Authentication & Authorization

### Role-Based Access Control (RBAC)

**Implementation:**
- `StudentGuard` component protects all student routes
- `useAuth` hook validates user session and role
- Automatic redirect for unauthorized access attempts

**Files:**
- `components/auth/role-guard.tsx` - Role guard components
- `hooks/use-auth.ts` - Authentication hook with error handling
- `lib/auth/session.ts` - Session management utilities

**Requirements:** 10.1, 10.3

### Session Management

**Features:**
- Secure session storage in localStorage
- Session expiration after 30 minutes of inactivity
- Automatic activity tracking
- Auto-logout on session expiration

**Implementation:**
```typescript
// Session includes last activity timestamp
interface UserSession {
  id: string;
  role: 'OFFICE' | 'TEACHER' | 'STUDENT';
  loginTime: number;
  lastActivity: number;
}

// Activity is tracked automatically
useActivityTracker(); // In student layout
```

**Files:**
- `lib/auth/session.ts` - Session management with expiration
- `hooks/use-activity-tracker.ts` - Activity tracking and auto-logout

**Requirements:** 10.4

## Read-Only Access Enforcement

### Client-Side Protection

**Implementation:**
- `useReadOnly` hook prevents modification attempts
- Clear messaging for read-only restrictions
- Disabled edit/delete buttons for students

**Files:**
- `hooks/use-read-only.ts` - Read-only enforcement hook

**Usage:**
```typescript
const { isReadOnly, preventModification } = useReadOnly();

const handleEdit = () => {
  if (isReadOnly) {
    preventModification('edit attendance records');
    return;
  }
  // Proceed with edit
};
```

### API-Level Protection

**Implementation:**
- Middleware checks user role before allowing modifications
- POST, PUT, PATCH, DELETE requests blocked for students
- Returns 403 Forbidden with clear error message

**Files:**
- `lib/auth/read-only-middleware.ts` - API middleware

**Usage in API routes:**
```typescript
import { enforceReadOnly } from '@/lib/auth/read-only-middleware';

export async function POST(request: NextRequest) {
  const readOnlyCheck = enforceReadOnly(request);
  if (readOnlyCheck) return readOnlyCheck;
  
  // Continue with modification logic
}
```

**Protected APIs:**
- `/api/students/[id]` - PUT, DELETE
- `/api/attendance` - POST
- All modification endpoints

**Requirements:** 10.3, 10.4

## Data Privacy Controls

### Student Data Access Validation

**Implementation:**
- Students can only access their own data
- API validates student ID matches session user ID
- Other roles (TEACHER, OFFICE) can access any student data

**Files:**
- `lib/auth/read-only-middleware.ts` - `validateStudentDataAccess` function

**Usage:**
```typescript
import { validateStudentDataAccess } from '@/lib/auth/read-only-middleware';

const session = getSession();
const accessCheck = validateStudentDataAccess(session, studentId);

if (!accessCheck.allowed) {
  return NextResponse.json(
    { error: accessCheck.error },
    { status: 403 }
  );
}
```

**Protected APIs:**
- `/api/students/dashboard` - Dashboard metrics
- `/api/students/[id]` - Student details
- `/api/students/attendance/weekly` - Weekly attendance

**Requirements:** 10.2, 10.4

### HTTPS Enforcement

**Implementation:**
- All API calls use HTTPS in production
- Secure cookie flags for session management
- No sensitive data in URL parameters

**Requirements:** 10.4

## File Upload Security

### Validation Layers

**1. Client-Side Validation:**
- File type validation (PDF, JPG, PNG only)
- File size limits (max 10MB)
- MIME type validation
- Minimum file size check (prevents empty files)

**2. Server-Side Validation:**
- File extension validation
- MIME type validation
- Magic number validation (prevents file type spoofing)
- File size validation
- Secure file naming (prevents path traversal)

**Files:**
- `hooks/use-file-upload.ts` - Client-side validation
- `lib/services/file-upload-service.ts` - Server-side validation

### File Type Validation

**Magic Number Validation:**
```typescript
const FILE_SIGNATURES: Record<string, number[]> = {
  'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
};
```

This prevents attackers from renaming malicious files with allowed extensions.

### Secure Storage

**Implementation:**
- Files stored outside public directory (`/uploads/medical-certificates/`)
- Unique file names using UUID
- Sanitized file names to prevent path traversal
- Access controls via database records

**File Naming:**
```typescript
// Original: "my certificate.pdf"
// Sanitized: "my_certificate.pdf"
// Stored as: "550e8400-e29b-41d4-a716-446655440000.pdf"
```

### Virus Scanning

**Note:** Virus scanning is mentioned in requirements but not implemented in this phase. For production:

**Recommended Implementation:**
1. Use ClamAV or similar antivirus service
2. Scan files before saving to disk
3. Quarantine suspicious files
4. Notify administrators of threats

**Integration Point:**
```typescript
// In uploadMedicalCertificate function, after validation:
const scanResult = await scanFileForViruses(buffer);
if (!scanResult.clean) {
  return {
    success: false,
    error: 'File failed security scan',
  };
}
```

**Requirements:** 13.3

## Security Best Practices

### Input Validation

✅ All user inputs validated on client and server
✅ SQL injection prevented by using Supabase parameterized queries
✅ XSS prevented by React's automatic escaping
✅ Path traversal prevented by file name sanitization

### Error Handling

✅ Generic error messages to prevent information leakage
✅ Detailed errors logged server-side only
✅ No stack traces exposed to clients
✅ Consistent error response format

### Session Security

✅ Session timeout after 30 minutes inactivity
✅ Activity tracking on all user interactions
✅ Automatic logout on session expiration
✅ Session validation on every request

### API Security

✅ Role-based access control on all endpoints
✅ Data access validation for student-specific data
✅ Read-only enforcement for student role
✅ HTTPS for all data transmission

## Testing Security

### Manual Testing Checklist

- [ ] Try accessing another student's data as a student
- [ ] Try modifying attendance as a student
- [ ] Try uploading non-allowed file types
- [ ] Try uploading files larger than 10MB
- [ ] Try uploading files with spoofed extensions
- [ ] Wait 30 minutes and verify auto-logout
- [ ] Try accessing student routes without authentication
- [ ] Try accessing student routes with wrong role

### Automated Testing

Consider adding:
- Unit tests for validation functions
- Integration tests for API security
- E2E tests for authentication flows

## Security Incident Response

### If a Security Issue is Discovered:

1. **Immediate Actions:**
   - Document the issue
   - Assess the impact
   - Notify administrators

2. **Mitigation:**
   - Apply temporary fixes if needed
   - Review related code for similar issues
   - Update security measures

3. **Long-term:**
   - Implement permanent fix
   - Add tests to prevent regression
   - Update documentation

## Future Enhancements

### Recommended Additions:

1. **Rate Limiting:**
   - Prevent brute force attacks
   - Limit API requests per user

2. **Audit Logging:**
   - Log all data access attempts
   - Track failed authentication attempts
   - Monitor suspicious activity

3. **Two-Factor Authentication:**
   - Add 2FA for sensitive operations
   - SMS or email verification codes

4. **Content Security Policy:**
   - Implement CSP headers
   - Prevent XSS attacks

5. **Virus Scanning:**
   - Integrate ClamAV or similar
   - Scan all uploaded files

## Compliance

### WCAG 2.1 AA Compliance

Security features maintain accessibility:
- Clear error messages
- Keyboard navigation support
- Screen reader compatibility
- High contrast error states

### Data Privacy

- Students can only view their own data
- No PII exposed in URLs or logs
- Secure session management
- Auto-logout for privacy

## Contact

For security concerns or questions, contact the development team.
