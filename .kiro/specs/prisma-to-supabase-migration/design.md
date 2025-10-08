# Design Document

## Overview

This design outlines the migration from Prisma ORM to direct Supabase client queries while maintaining identical functionality, API contracts, and data integrity. The migration will replace the database abstraction layer without affecting the user-facing behavior or existing validation logic.

The current system uses Prisma with PostgreSQL hosted on Supabase. We will remove the Prisma layer and connect directly to the same Supabase PostgreSQL database using the Supabase JavaScript client.

## Architecture

### Current Architecture
```
API Routes → Prisma Client → Generated Prisma Types → PostgreSQL (Supabase)
```

### Target Architecture
```
API Routes → Supabase Client → TypeScript Interfaces → PostgreSQL (Supabase)
```

### Key Changes
- Replace `@/lib/prisma.ts` with `@/lib/supabase.ts`
- Remove Prisma client and generated types
- Create TypeScript interfaces for database models
- Replace Prisma queries with Supabase queries
- Implement transaction handling using Supabase RPC functions
- Update error handling for Supabase-specific errors

## Components and Interfaces

### 1. Database Client (`lib/supabase.ts`)
**Purpose:** Central Supabase client configuration and connection management

**Key Features:**
- Supabase client initialization with environment variables
- Connection error handling
- Type-safe database operations
- Singleton pattern for client reuse

### 2. Database Models (`lib/database/models.ts`)
**Purpose:** TypeScript interfaces replacing Prisma generated types

**Models to Define:**
- `Student` interface with all fields from Prisma schema
- `Teacher` interface with all fields from Prisma schema  
- `Office` interface with all fields from Prisma schema
- Enum types: `StudentStatus`, `TeacherStatus`, `OfficeRole`

### 3. Database Operations (`lib/database/operations.ts`)
**Purpose:** Centralized database operation functions

**Key Functions:**
- `createStudent(data: StudentCreateInput): Promise<Student>`
- `createTeacher(data: TeacherCreateInput): Promise<Teacher>`
- `findStudentByField(field: string, value: any): Promise<Student | null>`
- `findTeacherByField(field: string, value: any): Promise<Teacher | null>`

### 4. Transaction Management (`lib/database/transactions.ts`)
**Purpose:** Transaction handling using Supabase RPC functions

**Key Functions:**
- `withTransaction<T>(operation: (client: SupabaseClient) => Promise<T>): Promise<T>`
- `withRetryTransaction<T>(...): Promise<T>`
- `createStudentWithTransaction(...): Promise<Student>`
- `createTeacherWithTransaction(...): Promise<Teacher>`

### 5. Error Handling (`lib/database/errors.ts`)
**Purpose:** Supabase error mapping to maintain API compatibility

**Key Features:**
- Map Supabase errors to Prisma-equivalent error codes
- Unique constraint violation detection
- Consistent error response formats

## Data Models

### Student Model
```typescript
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  fatherName: string;
  grandFatherName: string;
  studentId: string;
  dateOfBirth: Date | null;
  phone: string;
  fatherPhone: string;
  address: string;
  programs: string;
  semester: string;
  enrollmentYear: string;
  classSection: string;
  timeSlot: string;
  username: string;
  studentIdRef: string;
  password: string;
  status: StudentStatus;
  createdAt: Date;
  updatedAt: Date;
}
```

### Teacher Model
```typescript
interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  fatherName: string;
  grandFatherName: string;
  teacherId: string;
  dateOfBirth: Date | null;
  phone: string;
  secondaryPhone: string | null;
  address: string;
  departments: string[];
  qualification: string;
  experience: string;
  specialization: string;
  subjects: string[];
  classes: string[];
  username: string;
  password: string;
  status: TeacherStatus;
  createdAt: Date;
  updatedAt: Date;
}
```

### Office Model
```typescript
interface Office {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: OfficeRole;
  supabaseUserId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Handling

### Supabase Error Mapping
- **Unique Constraint Violations:** Map Supabase `23505` error code to Prisma `P2002` equivalent
- **Foreign Key Violations:** Map Supabase `23503` error code appropriately
- **Connection Errors:** Handle Supabase connection failures with clear messages
- **Validation Errors:** Maintain existing Zod validation error handling

### Error Response Format
Maintain identical error response formats:
```typescript
{
  error: string;
  details?: {
    field: string;
    message: string;
  } | Array<{
    field: string;
    message: string;
  }>;
}
```

## Testing Strategy

### Unit Tests
- Database operation functions
- Error handling and mapping
- Transaction utilities
- Model validation

### Integration Tests
- API endpoint functionality
- Database connection and queries
- Transaction rollback scenarios
- Error response consistency

### Migration Validation
- Data integrity verification
- Performance comparison
- API contract compliance
- Error handling compatibility

## Migration Steps

### Phase 1: Setup Supabase Client
1. Install Supabase client dependencies
2. Create Supabase client configuration
3. Set up environment variables
4. Create TypeScript interfaces

### Phase 2: Replace Database Operations
1. Create database operation functions
2. Replace Prisma queries in API routes
3. Update error handling
4. Implement transaction support

### Phase 3: Remove Prisma Dependencies
1. Remove Prisma client usage
2. Delete Prisma configuration files
3. Remove Prisma dependencies from package.json
4. Clean up generated files

### Phase 4: Testing and Validation
1. Run comprehensive tests
2. Validate API functionality
3. Performance testing
4. Error handling verification

## Environment Configuration

### Required Environment Variables
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (for admin operations)
```

### Removed Environment Variables
```env
DATABASE_URL (Prisma connection string)
```

## Performance Considerations

### Query Optimization
- Utilize existing database indexes
- Implement query result caching where appropriate
- Use Supabase query builders for complex operations
- Maintain connection pooling through Supabase client

### Connection Management
- Reuse Supabase client instances
- Implement proper connection error handling
- Configure appropriate timeout settings
- Monitor connection pool usage

## Security Considerations

### Row Level Security (RLS)
- Leverage Supabase RLS policies if needed
- Maintain current authentication patterns
- Ensure proper data access controls
- Implement audit logging if required

### API Security
- Maintain existing validation schemas
- Preserve password hashing implementation
- Keep current error message patterns
- Ensure no sensitive data exposure