# Implementation Plan

- [-] 1. Fix Prisma schema configuration and define data models



  - Update datasource to use `DATABASE_URL` environment variable instead of hardcoded URL
  - Define Student model with all required fields (firstName, lastName, fatherName, grandFatherName, studentId, dateOfBirth, phone, fatherPhone, address, programs, semester, enrollmentYear, classSection, timeSlot, username, studentIdRef, password, timestamps)
  - Define Teacher model with all required fields (firstName, lastName, fatherName, grandFatherName, teacherId, dateOfBirth, phone, secondaryPhone, address, departments, qualification, experience, specialization, subjects, classes, username, password, timestamps)
  - Add unique constraints on studentId, teacherId, and username fields
  - Configure proper field types (String[], DateTime?, etc.)
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2. Set up Prisma client and database utilities
  - Create Prisma client singleton at `lib/prisma.ts` to prevent multiple instances
  - Run Prisma migration to create tables in Supabase database
  - Generate Prisma client with custom output path
  - Verify database connection works
  - _Requirements: 1.4, 5.1, 5.2, 5.3, 5.4_

- [ ] 3. Install bcrypt and create password utilities
  - Add bcrypt package to dependencies
  - Create `lib/utils/password.ts` with hashPassword and comparePassword functions
  - Implement bcrypt hashing with salt rounds of 10
  - _Requirements: 4.5, 6.1_

- [ ] 4. Create validation schemas with Zod
  - Create `lib/validations/user.validation.ts` file
  - Define StudentCreateSchema with all field validations (required fields, min lengths, array validations)
  - Define TeacherCreateSchema with all field validations
  - Add password minimum length validation (6 characters)
  - Add array minimum length validations (programs, subjects, classes must have at least 1 item)
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 5. Implement Student API route
  - Create `app/api/students/route.ts` file
  - Implement POST handler that accepts student data
  - Validate request body using StudentCreateSchema
  - Hash password before storing
  - Check for existing studentId or username (handle P2002 Prisma error)
  - Create student record using Prisma client
  - Return created student data excluding password field
  - Implement error handling for validation errors (400), conflicts (409), and server errors (500)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 4.6_

- [ ] 6. Implement Teacher API route
  - Create `app/api/teachers/route.ts` file
  - Implement POST handler that accepts teacher data
  - Validate request body using TeacherCreateSchema
  - Hash password before storing
  - Check for existing teacherId or username (handle P2002 Prisma error)
  - Create teacher record using Prisma client
  - Return created teacher data excluding password field
  - Implement error handling for validation errors (400), conflicts (409), and server errors (500)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.6_

- [ ] 7. Update frontend forms to integrate with API
  - Update `app/(office)/user-management/add-student/page.tsx` handleSubmit to call `/api/students`
  - Update `app/(office)/user-management/add-teacher/page.tsx` handleSubmit to call `/api/teachers`
  - Add proper error handling for API responses (400, 409, 500)
  - Display appropriate error messages to users
  - Handle success responses and show success state
  - _Requirements: 2.1, 3.1_

- [ ]* 8. Write integration tests for API routes
  - Create test file for student API route
  - Test successful student creation
  - Test duplicate studentId rejection
  - Test duplicate username rejection
  - Test validation errors
  - Create test file for teacher API route
  - Test successful teacher creation
  - Test duplicate teacherId rejection
  - Test validation errors
  - Verify passwords are hashed and excluded from responses
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 4.5, 4.6_
