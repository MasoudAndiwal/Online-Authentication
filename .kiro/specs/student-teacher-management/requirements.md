# Requirements Document

## Introduction

This feature implements backend logic for adding students and teachers to the system using Prisma ORM with a Supabase PostgreSQL database. The system needs to handle form submissions from the existing add-student and add-teacher pages, validate the data, and persist it to the database. The implementation will include proper data models, API routes, and database schema design to support the comprehensive form inputs already built in the frontend.

## Requirements

### Requirement 1: Database Schema and Models

**User Story:** As a system administrator, I want a well-structured database schema that accurately represents students and teachers with all their attributes, so that data is organized and relationships are maintained properly.

#### Acceptance Criteria

1. WHEN the Prisma schema is defined THEN it SHALL include a Student model with fields for firstName, lastName, fatherName, grandFatherName, studentId (unique), dateOfBirth (optional), phone, fatherPhone, address, programs (array), semester, enrollmentYear, classSection, timeSlot, username (unique), studentIdRef, password (hashed), and timestamps
2. WHEN the Prisma schema is defined THEN it SHALL include a Teacher model with fields for firstName, lastName, fatherName, grandFatherName, teacherId (unique), dateOfBirth (optional), phone, secondaryPhone, address, departments (array), qualification, experience, specialization, subjects (array), classes (array), username (unique), password (hashed), and timestamps
3. WHEN the database connection is configured THEN it SHALL use the DATABASE_URL environment variable pointing to the Supabase PostgreSQL database
4. WHEN the Prisma schema is migrated THEN it SHALL create the necessary tables in the Supabase database without errors

### Requirement 2: Student Creation API

**User Story:** As an office staff member, I want to submit the add student form and have the data saved to the database, so that new students can be registered in the system.

#### Acceptance Criteria

1. WHEN a POST request is made to the student creation endpoint with valid data THEN the system SHALL validate all required fields (firstName, lastName, fatherName, grandFatherName, studentId, phone, fatherPhone, address, programs, semester, enrollmentYear, classSection, timeSlot, username, studentIdRef, password)
2. WHEN the student data is validated THEN the system SHALL hash the password before storing it in the database
3. WHEN the studentId or username already exists THEN the system SHALL return a 409 conflict error with an appropriate message
4. WHEN all validations pass THEN the system SHALL create a new student record in the database and return a 201 status with the created student data (excluding password)
5. WHEN the creation fails due to database errors THEN the system SHALL return a 500 error with an appropriate error message
6. WHEN optional fields like dateOfBirth are not provided THEN the system SHALL accept null values for those fields

### Requirement 3: Teacher Creation API

**User Story:** As an office staff member, I want to submit the add teacher form and have the data saved to the database, so that new teachers can be registered in the system.

#### Acceptance Criteria

1. WHEN a POST request is made to the teacher creation endpoint with valid data THEN the system SHALL validate all required fields (firstName, lastName, fatherName, grandFatherName, teacherId, phone, address, qualification, experience, specialization, subjects, classes, username, password)
2. WHEN the teacher data is validated THEN the system SHALL hash the password before storing it in the database
3. WHEN the teacherId or username already exists THEN the system SHALL return a 409 conflict error with an appropriate message
4. WHEN all validations pass THEN the system SHALL create a new teacher record in the database and return a 201 status with the created teacher data (excluding password)
5. WHEN the creation fails due to database errors THEN the system SHALL return a 500 error with an appropriate error message
6. WHEN optional fields like dateOfBirth or secondaryPhone are not provided THEN the system SHALL accept null values for those fields

### Requirement 4: Data Validation and Security

**User Story:** As a system administrator, I want all user input to be validated and sanitized, so that the system is protected from invalid data and security vulnerabilities.

#### Acceptance Criteria

1. WHEN any API endpoint receives data THEN it SHALL validate that required string fields are not empty or contain only whitespace
2. WHEN a password is provided THEN it SHALL be at least 6 characters long
3. WHEN array fields (programs, departments, subjects, classes) are provided THEN they SHALL contain at least one item
4. WHEN phone numbers are provided THEN they SHALL be validated for proper format
5. WHEN passwords are stored THEN they SHALL be hashed using bcrypt or a similar secure hashing algorithm
6. WHEN student or teacher data is returned from the API THEN the password field SHALL be excluded from the response

### Requirement 5: Prisma Client Integration

**User Story:** As a developer, I want a properly configured Prisma client that can be used throughout the application, so that database operations are consistent and type-safe.

#### Acceptance Criteria

1. WHEN the Prisma client is initialized THEN it SHALL use the custom output path specified in the schema (../app/generated/prisma)
2. WHEN database operations are performed THEN they SHALL use the Prisma client singleton pattern to avoid connection issues
3. WHEN the application starts THEN it SHALL be able to connect to the Supabase database using the provided credentials
4. WHEN Prisma migrations are run THEN they SHALL successfully apply to the Supabase PostgreSQL database
