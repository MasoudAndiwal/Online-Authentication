# Design Document

## Overview

This design implements a comprehensive, production-ready backend system for student and teacher management using Next.js 15 App Router API routes, Prisma ORM, and Supabase PostgreSQL database. The architecture provides full CRUD operations with advanced features including pagination, filtering, sorting, search, authentication, role-based access control, database transactions, and performance optimizations. The system follows enterprise-grade best practices with robust error handling, data validation, security measures, and scalability considerations.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                          │
│  • Add/Edit Student/Teacher Forms                           │
│  • Student/Teacher List Pages with Filtering               │
│  • Authentication UI (Supabase Auth)                       │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP Requests + JWT Token
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                Authentication Middleware                    │
│  • Supabase JWT Verification                                │
│  • Role-based Access Control                               │
│  • Request Authorization                                    │
└────────────────────┬────────────────────────────────────────┘
                     │ Authenticated Requests
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Routes Layer                          │
│  • /api/students (GET, POST, PUT)                          │
│  • /api/students/[id] (GET, PUT)                           │
│  • /api/teachers (GET, POST, PUT)                          │
│  • /api/teachers/[id] (GET, PUT)                           │
│  • Request validation with Zod                              │
│  • Error handling & logging                                │
│  • Response formatting                                      │
└────────────────────┬────────────────────────────────────────┘
                     │ Prisma Client + Transactions
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Access Layer                         │
│  • Prisma Client (Singleton)                                │
│  • Database Transactions                                    │
│  • Query Optimization                                       │
│  • Connection Pooling                                       │
└────────────────────┬────────────────────────────────────────┘
                     │ PostgreSQL Protocol
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase PostgreSQL Database                   │
│  • Students table (with indexes)                            │
│  • Teachers table (with indexes)                            │
│  • Office table (for staff)                                │
│  • Performance indexes for filtering/sorting               │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Framework**: Next.js 15.5.4 (App Router)
- **ORM**: Prisma 6.16.2 with PostgreSQL provider
- **Database**: Supabase PostgreSQL with connection pooling
- **Authentication**: Supabase Auth with JWT tokens
- **Validation**: Zod 4.1.11 for request/response validation
- **Password Hashing**: bcrypt with salt rounds of 12
- **Testing**: Jest + Supertest for API testing
- **Language**: TypeScript 5 with strict mode
- **Error Handling**: Custom error classes with proper HTTP status codes
- **Logging**: Structured logging for debugging and monitoring

## Components and Interfaces

### 1. Enhanced Prisma Schema Configuration

**File**: `prisma/schema.prisma`

The schema includes comprehensive models with performance optimizations:

**Key Design Decisions**:
- Use `String[]` for array fields with PostgreSQL native array support
- Implement composite indexes for common query patterns
- Add full-text search indexes for name fields
- Use `@unique` constraints with proper error handling
- Include audit fields (createdAt, updatedAt) on all models
- Define proper relationships between models
- Use enum types for status fields to ensure data consistency

**Performance Indexes**:
- Composite index on (program, semester, classSection) for student filtering
- Composite index on (department, status) for teacher filtering
- Full-text search indexes on name fields
- Individual indexes on frequently queried fields (studentId, teacherId, username)

### 2. Enhanced Prisma Client and Database Layer

**File**: `lib/prisma.ts`

Enhanced singleton with connection management and error handling:

```typescript
import { PrismaClient } from '@/app/generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})
```

**File**: `lib/database/transactions.ts`

Transaction utilities for complex operations:

```typescript
export async function withTransaction<T>(
  operation: (tx: PrismaTransactionClient) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(operation, {
    maxWait: 5000,
    timeout: 10000,
  })
}
```

### 3. Comprehensive Validation Schemas

**File**: `lib/validations/student.validation.ts`

```typescript
export const StudentCreateSchema = z.object({
  firstName: z.string().min(1).max(50).trim(),
  lastName: z.string().min(1).max(50).trim(),
  fatherName: z.string().min(1).max(50).trim(),
  grandFatherName: z.string().min(1).max(50).trim(),
  studentId: z.string().regex(/^[A-Z]{2,4}-\d{4}-\d{3}$/),
  dateOfBirth: z.date().optional(),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]{10,15}$/),
  fatherPhone: z.string().regex(/^\+?[\d\s\-\(\)]{10,15}$/),
  address: z.string().min(10).max(200),
  programs: z.array(z.string()).min(1),
  semester: z.string().min(1),
  enrollmentYear: z.string().regex(/^\d{4}$/),
  classSection: z.string().min(1),
  timeSlot: z.string().min(1),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  studentIdRef: z.string().min(1),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
})

export const StudentUpdateSchema = StudentCreateSchema.partial().omit({ password: true })

export const StudentListQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  program: z.string().optional(),
  classSection: z.string().optional(),
  status: z.enum(['Active', 'Sick']).optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})
```

**File**: `lib/validations/teacher.validation.ts`

Similar comprehensive validation for teachers with department, subject, and qualification validations.

### 4. Comprehensive API Route Handlers

#### Student API Routes

**File**: `app/api/students/route.ts`

**GET /api/students** - List students with advanced filtering
- Query parameters: page, limit, search, program, classSection, status, sortBy, sortOrder
- Returns paginated results with metadata
- Supports full-text search across name fields
- Implements cursor-based pagination for performance
- Includes total count and hasMore indicators

**POST /api/students** - Create student
- Validates request using StudentCreateSchema
- Uses database transaction for atomic operations
- Hashes password with bcrypt (12 salt rounds)
- Checks for unique constraints (studentId, username)
- Returns sanitized student data (excluding password)

**File**: `app/api/students/[id]/route.ts`

**GET /api/students/[id]** - Get student by ID
- Validates student ID format
- Returns student data (excluding password)
- Handles 404 for non-existent students

**PUT /api/students/[id]** - Update student
- Validates request using StudentUpdateSchema
- Uses optimistic locking to prevent concurrent updates
- Handles partial updates efficiently
- Returns updated student data

#### Teacher API Routes

**File**: `app/api/teachers/route.ts` & `app/api/teachers/[id]/route.ts`

Similar structure to student routes with teacher-specific validations and filtering:
- Filter by department, subject, status
- Search across name, department, and subject fields
- Handle teacher-specific business logic

#### Response Format Standards

```typescript
// Success Response
{
  success: true,
  data: T,
  meta?: {
    page: number,
    limit: number,
    total: number,
    hasMore: boolean
  }
}

// Error Response
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: ValidationError[]
  }
}
```

### 5. Authentication and Authorization

**File**: `lib/auth/supabase.ts`

Supabase authentication integration:
```typescript
export async function verifySupabaseJWT(token: string): Promise<User | null>
export async function checkUserRole(userId: string): Promise<UserRole>
export async function hasPermission(user: User, resource: string, action: string): Promise<boolean>
```

**File**: `middleware.ts`

Next.js middleware for authentication:
```typescript
export async function middleware(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  
  if (!token) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  const user = await verifySupabaseJWT(token)
  if (!user) {
    return new Response('Invalid token', { status: 401 })
  }
  
  // Add user to request headers for API routes
  request.headers.set('x-user-id', user.id)
  request.headers.set('x-user-role', user.role)
  
  return NextResponse.next()
}
```

### 6. Utility Functions and Helpers

**File**: `lib/utils/password.ts`
```typescript
export async function hashPassword(password: string): Promise<string>
export async function comparePassword(password: string, hash: string): Promise<boolean>
```

**File**: `lib/utils/pagination.ts`
```typescript
export function calculatePagination(page: number, limit: number, total: number)
export function buildCursorQuery(cursor?: string, limit: number)
```

**File**: `lib/utils/search.ts`
```typescript
export function buildSearchQuery(searchTerm: string, fields: string[])
export function sanitizeSearchInput(input: string): string
```

## Data Models

### Enhanced Student Model

```prisma
enum StudentStatus {
  ACTIVE
  SICK
  INACTIVE
}

model Student {
  id              String        @id @default(cuid())
  firstName       String        @db.VarChar(50)
  lastName        String        @db.VarChar(50)
  fatherName      String        @db.VarChar(50)
  grandFatherName String        @db.VarChar(50)
  studentId       String        @unique @db.VarChar(20)
  dateOfBirth     DateTime?
  phone           String        @db.VarChar(20)
  fatherPhone     String        @db.VarChar(20)
  address         String        @db.Text
  programs        String[]
  semester        String        @db.VarChar(20)
  enrollmentYear  String        @db.VarChar(4)
  classSection    String        @db.VarChar(20)
  timeSlot        String        @db.VarChar(50)
  username        String        @unique @db.VarChar(30)
  studentIdRef    String        @db.VarChar(20)
  password        String        @db.VarChar(255)
  status          StudentStatus @default(ACTIVE)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  // Indexes for performance
  @@index([firstName, lastName])
  @@index([studentId])
  @@index([programs, semester, classSection])
  @@index([status])
  @@index([createdAt])
  @@map("students")
}
```

### Enhanced Teacher Model

```prisma
enum TeacherStatus {
  ACTIVE
  INACTIVE
}

model Teacher {
  id              String        @id @default(cuid())
  firstName       String        @db.VarChar(50)
  lastName        String        @db.VarChar(50)
  fatherName      String        @db.VarChar(50)
  grandFatherName String        @db.VarChar(50)
  teacherId       String        @unique @db.VarChar(20)
  dateOfBirth     DateTime?
  phone           String        @db.VarChar(20)
  secondaryPhone  String?       @db.VarChar(20)
  address         String        @db.Text
  departments     String[]
  qualification   String        @db.VarChar(100)
  experience      String        @db.VarChar(50)
  specialization  String        @db.VarChar(100)
  subjects        String[]
  classes         String[]
  username        String        @unique @db.VarChar(30)
  password        String        @db.VarChar(255)
  status          TeacherStatus @default(ACTIVE)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  // Indexes for performance
  @@index([firstName, lastName])
  @@index([teacherId])
  @@index([departments, status])
  @@index([subjects])
  @@index([status])
  @@index([createdAt])
  @@map("teachers")
}
```

### Office Staff Model

```prisma
enum OfficeRole {
  ADMIN
  STAFF
  MANAGER
}

model Office {
  id              String     @id @default(cuid())
  firstName       String     @db.VarChar(50)
  lastName        String     @db.VarChar(50)
  email           String     @unique @db.VarChar(100)
  phone           String     @db.VarChar(20)
  role            OfficeRole @default(STAFF)
  supabaseUserId  String     @unique
  isActive        Boolean    @default(true)
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
  
  @@index([email])
  @@index([supabaseUserId])
  @@index([role, isActive])
  @@map("office_staff")
}
```

## Error Handling

### Comprehensive Error Management

**File**: `lib/errors/api-errors.ts`

```typescript
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message)
  }
}

export class ValidationError extends APIError {
  constructor(details: ValidationIssue[]) {
    super(400, 'VALIDATION_ERROR', 'Validation failed', details)
  }
}

export class ConflictError extends APIError {
  constructor(field: string, value: string) {
    super(409, 'CONFLICT_ERROR', `${field} '${value}' already exists`)
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string, id: string) {
    super(404, 'NOT_FOUND', `${resource} with id '${id}' not found`)
  }
}
```

### Error Handler Middleware

**File**: `lib/middleware/error-handler.ts`

```typescript
export function handleAPIError(error: unknown): Response {
  if (error instanceof APIError) {
    return Response.json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    }, { status: error.statusCode })
  }
  
  // Handle Prisma errors
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return Response.json({
        success: false,
        error: {
          code: 'UNIQUE_CONSTRAINT_VIOLATION',
          message: 'A record with this value already exists',
          details: error.meta
        }
      }, { status: 409 })
    }
  }
  
  // Log unexpected errors
  console.error('Unexpected API error:', error)
  
  return Response.json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred'
    }
  }, { status: 500 })
}
```

### Error Types and Status Codes

1. **Authentication Errors (401)**
   - Missing or invalid JWT token
   - Expired session
   - Invalid credentials

2. **Authorization Errors (403)**
   - Insufficient permissions
   - Role-based access denied
   - Resource access forbidden

3. **Validation Errors (400)**
   - Invalid request format
   - Missing required fields
   - Data type mismatches
   - Business rule violations

4. **Conflict Errors (409)**
   - Duplicate unique fields
   - Concurrent modification conflicts
   - Business logic conflicts

5. **Not Found Errors (404)**
   - Resource not found
   - Invalid resource ID

6. **Server Errors (500)**
   - Database connection failures
   - Unexpected system errors
   - Third-party service failures

## Testing Strategy

### Unit Tests with Jest

**File**: `__tests__/lib/validations/student.test.ts`

```typescript
describe('Student Validation', () => {
  test('should validate correct student data', () => {
    const validData = {
      firstName: 'Ahmad',
      lastName: 'Hassan',
      // ... complete valid data
    }
    expect(() => StudentCreateSchema.parse(validData)).not.toThrow()
  })
  
  test('should reject invalid student ID format', () => {
    const invalidData = { studentId: 'invalid-format' }
    expect(() => StudentCreateSchema.parse(invalidData)).toThrow()
  })
})
```

### Integration Tests with Supertest

**File**: `__tests__/api/students.test.ts`

```typescript
describe('/api/students', () => {
  beforeEach(async () => {
    await setupTestDatabase()
  })
  
  afterEach(async () => {
    await cleanupTestDatabase()
  })
  
  describe('POST /api/students', () => {
    test('should create student with valid data', async () => {
      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${validJWT}`)
        .send(validStudentData)
        .expect(201)
      
      expect(response.body.success).toBe(true)
      expect(response.body.data.password).toBeUndefined()
    })
    
    test('should reject duplicate student ID', async () => {
      await createTestStudent({ studentId: 'CS-2024-001' })
      
      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${validJWT}`)
        .send({ ...validStudentData, studentId: 'CS-2024-001' })
        .expect(409)
      
      expect(response.body.error.code).toBe('CONFLICT_ERROR')
    })
  })
  
  describe('GET /api/students', () => {
    test('should return paginated students', async () => {
      await createTestStudents(25)
      
      const response = await request(app)
        .get('/api/students?page=1&limit=10')
        .set('Authorization', `Bearer ${validJWT}`)
        .expect(200)
      
      expect(response.body.data).toHaveLength(10)
      expect(response.body.meta.total).toBe(25)
      expect(response.body.meta.hasMore).toBe(true)
    })
    
    test('should filter students by program', async () => {
      await createTestStudents([
        { program: 'Computer Science' },
        { program: 'Mathematics' }
      ])
      
      const response = await request(app)
        .get('/api/students?program=Computer Science')
        .set('Authorization', `Bearer ${validJWT}`)
        .expect(200)
      
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].program).toBe('Computer Science')
    })
  })
})
```

### Performance Tests

**File**: `__tests__/performance/database.test.ts`

```typescript
describe('Database Performance', () => {
  test('should handle large dataset queries efficiently', async () => {
    await createTestStudents(10000)
    
    const startTime = Date.now()
    const response = await request(app)
      .get('/api/students?page=1&limit=20')
      .set('Authorization', `Bearer ${validJWT}`)
    const endTime = Date.now()
    
    expect(response.status).toBe(200)
    expect(endTime - startTime).toBeLessThan(100) // Should complete in < 100ms
  })
})
```

### Test Database Setup

**File**: `__tests__/setup/database.ts`

```typescript
export async function setupTestDatabase() {
  // Use separate test database
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
  await prisma.$executeRaw`TRUNCATE TABLE students, teachers, office_staff CASCADE`
}

export async function cleanupTestDatabase() {
  await prisma.$executeRaw`TRUNCATE TABLE students, teachers, office_staff CASCADE`
}
```

## Security Considerations

### Authentication Security

1. **JWT Token Validation**
   - Verify Supabase JWT signatures
   - Check token expiration
   - Validate token issuer and audience
   - Implement token refresh mechanism

2. **Password Security**
   - Use bcrypt with salt rounds of 12
   - Enforce strong password requirements (8+ chars, mixed case, numbers)
   - Never return passwords in API responses
   - Never log passwords or sensitive data

### Authorization Security

3. **Role-Based Access Control**
   - Implement granular permissions system
   - Validate user roles on every request
   - Enforce resource-level access controls
   - Log authorization failures for monitoring

4. **Input Validation & Sanitization**
   - Validate all inputs with strict Zod schemas
   - Sanitize string inputs to prevent XSS
   - Limit request payload sizes
   - Implement rate limiting per user/IP

### Database Security

5. **Data Protection**
   - Use Prisma parameterized queries (prevents SQL injection)
   - Implement row-level security where needed
   - Encrypt sensitive data at rest
   - Use database connection pooling with limits

6. **Error Handling Security**
   - Never expose internal system details in errors
   - Log security events for monitoring
   - Implement proper error sanitization
   - Use structured logging for security analysis

### Infrastructure Security

7. **Environment Security**
   - Use environment variables for all secrets
   - Implement proper secret rotation
   - Use HTTPS/TLS for all communications
   - Configure CORS policies appropriately

8. **Monitoring & Auditing**
   - Log all authentication attempts
   - Monitor for suspicious activity patterns
   - Implement audit trails for data changes
   - Set up alerts for security events

## Implementation Notes

### Database Migration Strategy

**Step 1: Fresh Supabase Database Setup**
```bash
# Create new Supabase project and get DATABASE_URL
# Update .env with new DATABASE_URL

# Initialize Prisma with new schema
npx prisma migrate dev --name initial_schema
npx prisma generate
```

**Step 2: Create Performance Indexes**
```sql
-- Additional indexes for optimal performance
CREATE INDEX CONCURRENTLY idx_students_search ON students USING gin(to_tsvector('english', firstName || ' ' || lastName));
CREATE INDEX CONCURRENTLY idx_teachers_search ON teachers USING gin(to_tsvector('english', firstName || ' ' || lastName));
CREATE INDEX CONCURRENTLY idx_students_composite ON students(programs, semester, classSection, status);
CREATE INDEX CONCURRENTLY idx_teachers_composite ON teachers(departments, status);
```

**Step 3: Seed Initial Data**
```typescript
// prisma/seed.ts
async function main() {
  // Create initial office staff
  await prisma.office.create({
    data: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@university.edu',
      role: 'ADMIN',
      supabaseUserId: 'uuid-from-supabase-auth'
    }
  })
}
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://postgres:[password]@[host]:5432/[database]"

# Supabase
