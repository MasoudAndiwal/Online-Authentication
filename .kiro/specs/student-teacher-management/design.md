# Design Document

## Overview

This design implements a backend system for student and teacher management using Next.js 15 App Router API routes, Prisma ORM, and Supabase PostgreSQL database. The architecture follows Next.js best practices with server-side API routes, type-safe database operations using Prisma, and secure password handling. The system integrates with existing frontend forms to provide a complete end-to-end solution for user registration.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                          │
│  (Add Student/Teacher Pages - Already Implemented)         │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP POST
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Routes Layer                          │
│  • /api/students (POST)                                     │
│  • /api/teachers (POST)                                     │
│  • Request validation with Zod                              │
│  • Password hashing with bcrypt                             │
└────────────────────┬────────────────────────────────────────┘
                     │ Prisma Client
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Access Layer                         │
│  • Prisma Client (Singleton)                                │
│  • Type-safe database operations                            │
└────────────────────┬────────────────────────────────────────┘
                     │ PostgreSQL Protocol
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase PostgreSQL Database                   │
│  • Students table                                           │
│  • Teachers table                                           │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Framework**: Next.js 15.5.4 (App Router)
- **ORM**: Prisma 6.16.2
- **Database**: Supabase PostgreSQL
- **Validation**: Zod 4.1.11
- **Password Hashing**: bcrypt (to be added)
- **Language**: TypeScript 5

## Components and Interfaces

### 1. Prisma Schema Configuration

**File**: `prisma/schema.prisma`

The schema will be updated to:
- Fix the datasource URL to use `DATABASE_URL` environment variable
- Define Student and Teacher models with all required fields
- Configure proper field types and constraints

**Key Design Decisions**:
- Use `String[]` for array fields (programs, departments, subjects, classes) - PostgreSQL native array support
- Use `DateTime` for dateOfBirth with `@default(now())` for timestamps
- Use `@unique` constraints on studentId, teacherId, and username fields
- Use `@id @default(cuid())` for primary keys
- Store passwords as strings (will be hashed before storage)

### 2. Prisma Client Singleton

**File**: `lib/prisma.ts`

A singleton pattern to prevent multiple Prisma Client instances in development (hot reload issue).

```typescript
import { PrismaClient } from '@/app/generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 3. Validation Schemas

**File**: `lib/validations/user.validation.ts`

Zod schemas for request validation:

**StudentCreateSchema**:
- firstName, lastName, fatherName, grandFatherName: non-empty strings
- studentId: unique identifier string
- dateOfBirth: optional date
- phone, fatherPhone: string (with optional format validation)
- address: non-empty string
- programs: array with min 1 item
- semester, enrollmentYear, classSection, timeSlot: non-empty strings
- username: non-empty string
- studentIdRef: non-empty string
- password: min 6 characters

**TeacherCreateSchema**:
- firstName, lastName, fatherName, grandFatherName: non-empty strings
- teacherId: unique identifier string
- dateOfBirth: optional date
- phone: required string
- secondaryPhone: optional string
- address: non-empty string
- departments: array with min 1 item (optional based on form)
- qualification, experience, specialization: non-empty strings
- subjects, classes: arrays with min 1 item each
- username: non-empty string
- password: min 6 characters

### 4. API Route Handlers

#### Student API Route

**File**: `app/api/students/route.ts`

**POST /api/students**
- Accepts JSON body with student data
- Validates request using StudentCreateSchema
- Hashes password using bcrypt
- Checks for existing studentId or username
- Creates student record in database
- Returns created student (excluding password) with 201 status
- Handles errors with appropriate status codes

**Response Format**:
```typescript
// Success (201)
{
  id: string
  firstName: string
  lastName: string
  // ... other fields except password
  createdAt: Date
  updatedAt: Date
}

// Error (400, 409, 500)
{
  error: string
  details?: any
}
```

#### Teacher API Route

**File**: `app/api/teachers/route.ts`

**POST /api/teachers**
- Accepts JSON body with teacher data
- Validates request using TeacherCreateSchema
- Hashes password using bcrypt
- Checks for existing teacherId or username
- Creates teacher record in database
- Returns created teacher (excluding password) with 201 status
- Handles errors with appropriate status codes

**Response Format**: Same structure as student response

### 5. Utility Functions

**File**: `lib/utils/password.ts`

Password hashing utilities:
```typescript
export async function hashPassword(password: string): Promise<string>
export async function comparePassword(password: string, hash: string): Promise<boolean>
```

## Data Models

### Student Model

```prisma
model Student {
  id              String    @id @default(cuid())
  firstName       String
  lastName        String
  fatherName      String
  grandFatherName String
  studentId       String    @unique
  dateOfBirth     DateTime?
  phone           String
  fatherPhone     String
  address         String
  programs        String[]
  semester        String
  enrollmentYear  String
  classSection    String
  timeSlot        String
  username        String    @unique
  studentIdRef    String
  password        String
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

### Teacher Model

```prisma
model Teacher {
  id              String    @id @default(cuid())
  firstName       String
  lastName        String
  fatherName      String
  grandFatherName String
  teacherId       String    @unique
  dateOfBirth     DateTime?
  phone           String
  secondaryPhone  String?
  address         String
  departments     String[]
  qualification   String
  experience      String
  specialization  String
  subjects        String[]
  classes         String[]
  username        String    @unique
  password        String
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

## Error Handling

### Error Types and Status Codes

1. **Validation Errors (400 Bad Request)**
   - Missing required fields
   - Invalid data format
   - Password too short
   - Empty arrays where items required

2. **Conflict Errors (409 Conflict)**
   - Duplicate studentId
   - Duplicate teacherId
   - Duplicate username

3. **Server Errors (500 Internal Server Error)**
   - Database connection failures
   - Unexpected Prisma errors
   - Password hashing failures

### Error Response Format

```typescript
{
  error: string,           // Human-readable error message
  details?: {              // Optional validation details
    field: string,
    message: string
  }[]
}
```

### Error Handling Strategy

- Use try-catch blocks in API routes
- Check for Prisma unique constraint violations (P2002)
- Log errors server-side for debugging
- Return sanitized error messages to client
- Never expose sensitive information in error responses

## Testing Strategy

### Unit Tests

1. **Validation Schema Tests**
   - Test valid student/teacher data passes validation
   - Test invalid data fails with appropriate errors
   - Test edge cases (empty strings, null values, array lengths)

2. **Password Utility Tests**
   - Test password hashing produces different hashes for same input
   - Test password comparison works correctly
   - Test hash format is bcrypt compatible

### Integration Tests

1. **API Route Tests**
   - Test successful student creation
   - Test successful teacher creation
   - Test duplicate ID/username rejection
   - Test validation error responses
   - Test password is hashed before storage
   - Test password is excluded from response

2. **Database Tests**
   - Test Prisma client connection
   - Test model creation with all fields
   - Test unique constraints enforcement
   - Test optional fields handling

### Manual Testing Checklist

1. Submit add student form with valid data → Success
2. Submit add teacher form with valid data → Success
3. Submit form with duplicate studentId/teacherId → Error 409
4. Submit form with duplicate username → Error 409
5. Submit form with missing required fields → Error 400
6. Submit form with short password → Error 400
7. Verify password is hashed in database
8. Verify timestamps are set correctly

## Security Considerations

1. **Password Security**
   - Use bcrypt with salt rounds of 10
   - Never return password in API responses
   - Never log passwords

2. **Input Validation**
   - Validate all inputs with Zod schemas
   - Sanitize string inputs to prevent injection
   - Limit array sizes to prevent DoS

3. **Database Security**
   - Use environment variables for credentials
   - Use Prisma parameterized queries (built-in)
   - Implement proper error handling to avoid information leakage

4. **API Security**
   - Consider adding rate limiting (future enhancement)
   - Consider adding authentication middleware (future enhancement)
   - Use HTTPS in production (Vercel/Supabase default)

## Implementation Notes

### Prisma Migration Strategy

1. Update `prisma/schema.prisma` with new models
2. Run `npx prisma migrate dev --name init_student_teacher` to create migration
3. Run `npx prisma generate` to generate Prisma Client
4. Verify tables created in Supabase dashboard

### Environment Variables Required

```env
DATABASE_URL="postgresql://..."  # Supabase connection string
```

Note: The current `.env` has a Prisma Accelerate URL. We'll need to verify if this should be used or if we should use the direct Supabase connection string.

### Frontend Integration

The existing forms need to be updated to:
1. Make POST requests to `/api/students` or `/api/teachers`
2. Handle success responses (201)
3. Handle error responses (400, 409, 500)
4. Display appropriate success/error messages

The forms already have the `handleSubmit` function with a simulated API call - this needs to be replaced with actual fetch calls.

## Deployment Considerations

1. **Database Migrations**: Run migrations before deploying new code
2. **Environment Variables**: Ensure DATABASE_URL is set in production
3. **Prisma Client**: Ensure `prisma generate` runs during build
4. **Build Process**: Verify custom Prisma output path works in production

## Future Enhancements

1. Add authentication and authorization
2. Add student/teacher update and delete endpoints
3. Add list and search endpoints
4. Add email verification
5. Add password reset functionality
6. Add role-based access control
7. Add audit logging
8. Add data export functionality
