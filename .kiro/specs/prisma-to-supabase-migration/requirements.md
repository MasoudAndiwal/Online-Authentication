# Requirements Document

## Introduction

This feature involves migrating the existing Next.js application from Prisma ORM to direct Supabase client queries while maintaining all existing functionality, routes, validation, and business logic. The migration will replace the database abstraction layer without changing the API contracts or user-facing behavior.

## Requirements

### Requirement 1

**User Story:** As a developer, I want to remove Prisma ORM dependencies and replace them with direct Supabase client queries, so that the application uses a simpler database connection approach without changing existing functionality.

#### Acceptance Criteria

1. WHEN the application starts THEN the system SHALL connect to Supabase using the Supabase client instead of Prisma
2. WHEN any API endpoint is called THEN the system SHALL execute database operations using Supabase queries instead of Prisma queries
3. WHEN the migration is complete THEN all Prisma-related dependencies SHALL be removed from package.json
4. WHEN the migration is complete THEN the prisma directory and generated Prisma client SHALL be removed
5. WHEN database operations are performed THEN the system SHALL maintain the same data validation and error handling as before

### Requirement 2

**User Story:** As a developer, I want all existing API routes to continue working exactly as before, so that the migration is transparent to API consumers.

#### Acceptance Criteria

1. WHEN the /api/students POST endpoint is called THEN the system SHALL create student records using Supabase queries with identical validation
2. WHEN the /api/teachers POST endpoint is called THEN the system SHALL create teacher records using Supabase queries with identical validation
3. WHEN any API endpoint encounters validation errors THEN the system SHALL return the same error responses as before
4. WHEN unique constraint violations occur THEN the system SHALL handle them with equivalent error messages
5. WHEN API operations succeed THEN the system SHALL return identical response formats

### Requirement 3

**User Story:** As a developer, I want transaction functionality to be preserved using Supabase's transaction capabilities, so that multi-table operations remain atomic and consistent.

#### Acceptance Criteria

1. WHEN multi-table operations are performed THEN the system SHALL use Supabase transactions to maintain atomicity
2. WHEN transaction operations fail THEN the system SHALL rollback all changes within the transaction
3. WHEN retry logic is needed THEN the system SHALL implement equivalent retry mechanisms using Supabase
4. WHEN batch operations are performed THEN the system SHALL maintain the same transactional guarantees
5. WHEN transaction timeouts occur THEN the system SHALL handle them with appropriate error responses

### Requirement 4

**User Story:** As a developer, I want the database schema and indexes to be maintained in Supabase, so that query performance and data integrity are preserved.

#### Acceptance Criteria

1. WHEN the migration is complete THEN all existing tables (students, teachers, office_staff) SHALL exist in Supabase with identical structure
2. WHEN the migration is complete THEN all existing indexes SHALL be recreated in Supabase for optimal query performance
3. WHEN the migration is complete THEN all enum types (StudentStatus, TeacherStatus, OfficeRole) SHALL be properly defined in Supabase
4. WHEN queries are executed THEN the system SHALL utilize the same indexes for performance optimization
5. WHEN data constraints are violated THEN the system SHALL enforce the same validation rules

### Requirement 5

**User Story:** As a developer, I want environment configuration to be updated for Supabase connection, so that the application connects to the correct database with proper credentials.

#### Acceptance Criteria

1. WHEN the application starts THEN the system SHALL use Supabase URL and API key from environment variables
2. WHEN database connections are established THEN the system SHALL use Supabase client configuration instead of Prisma connection strings
3. WHEN the migration is complete THEN DATABASE_URL environment variable SHALL be replaced with SUPABASE_URL and SUPABASE_ANON_KEY
4. WHEN connection errors occur THEN the system SHALL provide clear error messages for Supabase connection issues
5. WHEN the application runs in different environments THEN the system SHALL support development, staging, and production Supabase configurations

### Requirement 6

**User Story:** As a developer, I want all existing validation schemas and business logic to remain unchanged, so that data integrity and application behavior are preserved.

#### Acceptance Criteria

1. WHEN data is submitted to any endpoint THEN the system SHALL apply the same Zod validation schemas
2. WHEN password hashing is performed THEN the system SHALL use the same bcrypt implementation
3. WHEN data transformation is needed THEN the system SHALL apply identical business logic
4. WHEN error handling is triggered THEN the system SHALL maintain the same error response formats
5. WHEN data queries are performed THEN the system SHALL return data in the same format as before