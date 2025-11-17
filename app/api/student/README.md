# Student API Routes

This directory contains API routes for the student dashboard feature.

## Authentication

All routes require authentication. The authentication middleware validates user sessions from:
- Cookie: `user_session`
- Header: `Authorization: Bearer <session_token>`

Session data should be a JSON object containing:
```json
{
  "id": "student-uuid",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STUDENT",
  "username": "john.doe"
}
```

## Routes

### GET /api/student/attendance

Fetches comprehensive attendance data for the authenticated student.

**Query Parameters:**
- `studentId` (optional): Student ID to fetch data for. Defaults to authenticated user's ID.
- `weekOffset` (optional): Week offset for calendar view. 0 = current week, -1 = previous week, 1 = next week.

**Authorization:**
- Students can only access their own data
- Office staff can access any student's data

**Response:**
```json
{
  "student": {
    "id": "uuid",
    "name": "John Doe",
    "studentNumber": "12345",
    "email": ""
  },
  "stats": {
    "totalDays": 50,
    "presentDays": 45,
    "absentDays": 3,
    "sickDays": 1,
    "leaveDays": 1,
    "attendancePercentage": 90,
    "pureAbsenceHours": 3,
    "combinedAbsenceHours": 2
  },
  "status": {
    "isDisqualified": false,
    "needsCertification": false,
    "disqualificationThreshold": 20,
    "certificationThreshold": 30
  },
  "weekData": {
    "weekNumber": 1,
    "startDate": "2024-01-01",
    "endDate": "2024-01-07",
    "days": [...]
  },
  "recentRecords": [...],
  "uploadedFiles": [...]
}
```

**Error Responses:**
- `401 Unauthorized`: No valid authentication token
- `403 Forbidden`: User doesn't have permission to access this data
- `404 Not Found`: Student not found or no attendance data
- `500 Internal Server Error`: Server error

---

### POST /api/student/upload

Uploads a medical certificate for the authenticated student.

**Authorization:**
- Only students can upload certificates

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with `file` field

**File Validation:**
- Maximum size: 5MB
- Allowed types: PDF, JPG, PNG
- Server-side validation using magic numbers (file signatures)

**Response:**
```json
{
  "success": true,
  "file": {
    "id": "uuid",
    "fileName": "certificate.pdf",
    "fileSize": 1024000,
    "uploadDate": "2024-01-01T12:00:00Z",
    "status": "pending"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "File size exceeds maximum limit of 5MB"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid file or validation failed
- `401 Unauthorized`: No valid authentication token
- `403 Forbidden`: Only students can upload
- `500 Internal Server Error`: Server error

---

### DELETE /api/student/upload

Deletes an uploaded medical certificate.

**Query Parameters:**
- `fileId` (required): ID of the file to delete

**Authorization:**
- Only students can delete their own certificates
- Cannot delete approved certificates

**Response:**
```json
{
  "success": true
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Cannot delete approved certificates"
}
```

**Error Responses:**
- `400 Bad Request`: File not found or cannot be deleted
- `401 Unauthorized`: No valid authentication token
- `403 Forbidden`: Access denied
- `500 Internal Server Error`: Server error

## Security Features

### Authentication Middleware
- Validates session tokens from cookies or headers
- Ensures required user fields are present
- Returns 401 for invalid/missing tokens

### Authorization
- Students can only access their own data
- Office staff have broader access
- Role-based access control

### File Upload Security
- Client-side validation (file type, size)
- Server-side validation using magic numbers
- File name sanitization to prevent path traversal
- Files stored outside public directory
- Unique file names using UUID
- Maximum file size enforcement (5MB)
- MIME type validation
- File signature validation

## Database Tables

### attendance_records
- `id`: UUID
- `student_id`: UUID (foreign key)
- `date`: DATE
- `status`: VARCHAR (PRESENT, ABSENT, SICK, LEAVE)
- `subject`: VARCHAR
- `period_number`: INTEGER

### medical_certificates
- `id`: UUID
- `student_id`: UUID (foreign key)
- `file_name`: VARCHAR
- `file_path`: VARCHAR
- `file_size`: INTEGER
- `upload_date`: TIMESTAMP
- `status`: VARCHAR (pending, approved, rejected)
- `rejection_reason`: TEXT

## Error Handling

All routes implement comprehensive error handling:
- Database errors are caught and logged
- User-friendly error messages returned
- Appropriate HTTP status codes
- No sensitive information leaked in errors
