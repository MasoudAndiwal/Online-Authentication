# Implementation Plan

- [x] 1. Set up enhanced Prisma schema with production-ready models and indexes


  - Update datasource to use `DATABASE_URL` environment variable for Supabase PostgreSQL
  - Define Student model with all required fields, enums for status (Active/Sick), and proper constraints
  - Define Teacher model with all required fields, enums for status (Active/Inactive), and proper constraints
  - Define Office model for staff with role-based permissions (Admin/Staff/Manager)
  - Add performance indexes for common query patterns (search, filtering, sorting)
  - Add composite indexes for filter combinations (program+semester+class, department+status)
  - Add full-text search indexes on name fields
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 6.1_

- [x] 2. Set up Prisma client and database utilities with transaction support




  - Create enhanced Prisma client singleton at `lib/prisma.ts` with connection pooling
  - Create transaction utilities at `lib/database/transactions.ts` for multi-table operations

  - Run fresh Prisma migration to create all tables and indexes in new Supabase database
  - Generate Prisma client and verify database connection
  - _Requirements: 1.4, 1.6, 7.1, 7.4_

- [ ] 3. Install dependencies and create security utilities

  - Add bcrypt, @supabase/supabase-js packages to dependencies
  - Create `lib/utils/password.ts` with secure password hashing (salt rounds 12)
  - Create `lib/auth/supabase.ts` for JWT verification and role checking
  - Create `lib/middleware/auth.ts` for request authentication
  - _Requirements: 4.5, 4.1, 4.2_

- [ ] 4. Create comprehensive validation schemas

  - Create `lib/validations/student.validation.ts` with StudentCreateSchema, StudentUpdateSchema, and StudentListQuerySchema
  - Create `lib/validations/teacher.validation.ts` with TeacherCreateSchema, TeacherUpdateSchema, and TeacherListQuerySchema
  - Add strict validation for phone numbers, passwords (8+ chars, mixed case, numbers), and array fields
  - Add pagination and filtering validation schemas
  - _Requirements: 5.1, 5.2, 5.5, 5.6_

- [ ] 5. Implement comprehensive Student API endpoints
- [ ] 5.1 Create POST /api/students endpoint

  - Implement authentication middleware and role-based access control
  - Validate request using StudentCreateSchema with detailed error messages
  - Use database transaction for atomic student creation
  - Hash password with bcrypt and check for duplicate constraints
  - Return sanitized student data (excluding password) with proper HTTP status codes
  - _Requirements: 2.1, 4.1, 4.3, 7.1_

- [ ] 5.2 Create GET /api/students endpoint with advanced features

  - Implement pagination with cursor-based approach for large datasets
  - Add filtering by program, class section, and status with proper indexing
  - Add full-text search across name fields using database capabilities
  - Add sorting by any field in ascending/descending order
  - Return paginated results with metadata (page, limit, total, hasMore)
  - _Requirements: 2.2, 8.1, 8.2, 8.5, 8.6, 6.2, 6.3_

- [ ] 5.3 Create GET /api/students/[id] and PUT /api/students/[id] endpoints

  - Implement individual student retrieval with proper error handling (404)
  - Implement student update with optimistic locking and conflict resolution
  - Use transactions for update operations and validate partial updates
  - Enforce authentication and authorization for all operations
  - _Requirements: 2.3, 2.4, 2.5, 7.2_

- [ ] 6. Implement comprehensive Teacher API endpoints
- [ ] 6.1 Create POST /api/teachers endpoint

  - Implement authentication middleware and role-based access control
  - Validate request using TeacherCreateSchema with detailed error messages
  - Use database transaction for atomic teacher creation
  - Hash password with bcrypt and check for duplicate constraints
  - Return sanitized teacher data (excluding password) with proper HTTP status codes
  - _Requirements: 3.1, 4.1, 4.3, 7.1_

- [ ] 6.2 Create GET /api/teachers endpoint with advanced features

  - Implement pagination with cursor-based approach for large datasets
  - Add filtering by department, subject, and status with proper indexing
  - Add full-text search across name, department, and subject fields
  - Add sorting by any field in ascending/descending order
  - Return paginated results with metadata (page, limit, total, hasMore)
  - _Requirements: 3.2, 8.3, 8.4, 8.5, 8.6, 6.2, 6.3_

- [ ] 6.3 Create GET /api/teachers/[id] and PUT /api/teachers/[id] endpoints

  - Implement individual teacher retrieval with proper error handling (404)
  - Implement teacher update with optimistic locking and conflict resolution
  - Use transactions for update operations and validate partial updates
  - Enforce authentication and authorization for all operations
  - _Requirements: 3.3, 3.4, 3.5, 7.2_

- [ ] 7. Create error handling and logging infrastructure

  - Create `lib/errors/api-errors.ts` with custom error classes (ValidationError, ConflictError, NotFoundError)
  - Create `lib/middleware/error-handler.ts` for centralized error handling
  - Implement structured logging for security events and debugging
  - Handle Prisma errors (P2002 unique violations, connection errors) with proper HTTP status codes
  - _Requirements: 5.3, 5.4, 7.5_

- [ ] 8. Create utility functions for pagination and search

  - Create `lib/utils/pagination.ts` for cursor-based pagination calculations
  - Create `lib/utils/search.ts` for full-text search query building
  - Create `lib/utils/filtering.ts` for dynamic filter query construction
  - Implement performance optimizations for large dataset operations
  - _Requirements: 6.2, 6.3, 6.4, 6.6_

- [ ] 9. Update frontend integration and error handling

  - Update student and teacher forms to integrate with comprehensive API endpoints
  - Add proper error handling for all HTTP status codes (400, 401, 403, 409, 500)
  - Implement loading states and success feedback for better UX
  - Add client-side validation that matches server-side schemas
  - _Requirements: 2.1, 3.1, 5.2_

- [ ] 10. Create database migration and setup documentation

  - Document step-by-step Supabase database setup process
  - Create migration scripts with proper rollback procedures
  - Document environment variable configuration
  - Create performance tuning recommendations and index optimization guide
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ]\* 11. Write comprehensive test suite
  - Create unit tests for validation schemas and utility functions
  - Create integration tests for all API endpoints with authentication
  - Test pagination, filtering, sorting, and search functionality
  - Test error handling scenarios and edge cases
  - Create performance tests for large dataset operations
  - _Requirements: 2.1-2.6, 3.1-3.6, 5.1-5.6, 6.1-6.6_
