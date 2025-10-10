# Authentication System Implementation Guide

## Overview
Complete backend authentication system for three user roles: Office, Teacher, and Student.

## Database Changes

### Office Staff Table
Added two new columns to `office_staff` table:
- `username` VARCHAR(30) UNIQUE - For login identification
- `password` VARCHAR(255) - For bcrypt hashed passwords

**SQL Migration:**
```sql
ALTER TABLE office_staff 
ADD COLUMN username VARCHAR(30) UNIQUE,
ADD COLUMN password VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_office_username ON office_staff (username);
```

## File Structure Created/Modified

### 1. Authentication Core Logic
**File:** `lib/auth/authentication.ts` ✅ NEW
- `authenticateOffice()` - Office staff authentication
- `authenticateTeacher()` - Teacher authentication  
- `authenticateStudent()` - Student authentication with Student ID validation

### 2. API Routes Created
**Directory:** `app/api/auth/login/`

#### Office Login ✅ NEW
**File:** `app/api/auth/login/office/route.ts`
- Endpoint: `POST /api/auth/login/office`
- Validates username and password
- Returns user data on success

#### Teacher Login ✅ NEW
**File:** `app/api/auth/login/teacher/route.ts`
- Endpoint: `POST /api/auth/login/teacher`
- Validates username and password
- Checks teacher status (ACTIVE)

#### Student Login ✅ NEW
**File:** `app/api/auth/login/student/route.ts`
- Endpoint: `POST /api/auth/login/student`
- Validates username, student ID (from student_id_ref), and password
- Checks student status (ACTIVE)

### 3. Database Models Updated
**File:** `lib/database/models.ts` ✅ MODIFIED
- Added `username` and `password` fields to `Office` interface
- Updated `OfficeCreateInput` and `OfficeUpdateInput`

### 4. Database Operations Updated
**File:** `lib/database/operations.ts` ✅ MODIFIED
- Updated `createOffice()` to handle username/password
- Updated `transformOfficeFromDb()` to include username/password
- Added `findOfficeByUsername()` function
- Added `camelToSnakeCase()` helper function

### 5. Login Page Updated
**File:** `app/(office)/login/page.tsx` ✅ MODIFIED
- Replaced mock authentication with real API calls
- Stores user data in sessionStorage
- Proper error handling and user feedback

## Authentication Flow

### Office Login
```
1. User enters username + password
2. Frontend → POST /api/auth/login/office
3. Backend queries office_staff table by username
4. Verifies password with bcrypt.compare()
5. Checks is_active = true
6. Returns user data → Redirects to /dashboard
```

### Teacher Login
```
1. User enters username + password
2. Frontend → POST /api/auth/login/teacher
3. Backend queries teachers table by username
4. Verifies password with bcrypt.compare()
5. Checks status = 'ACTIVE'
6. Returns user data → Redirects to /teacher/dashboard
```

### Student Login
```
1. User enters username + student ID + password
2. Frontend → POST /api/auth/login/student
3. Backend queries students table by username
4. Validates student_id_ref matches provided student ID
5. Verifies password with bcrypt.compare()
6. Checks status = 'ACTIVE'
7. Returns user data → Redirects to /student/dashboard
```

## Security Features Implemented

✅ **Password Security:**
- All passwords are bcrypt hashed (using existing `lib/utils/password.ts`)
- Passwords never returned in API responses
- Minimum 6 characters enforced

✅ **Input Validation:**
- Zod schema validation on all API routes
- Username minimum 3 characters
- Student ID: 6-12 digits, numeric only

✅ **Database Security:**
- Prepared statements via Supabase SDK (prevents SQL injection)
- Unique constraints on username fields
- Indexed columns for performance

✅ **Error Handling:**
- Generic error messages (no user enumeration)
- Proper HTTP status codes (400, 401, 500)
- Server-side error logging

✅ **Session Management:**
- User data stored in sessionStorage
- Role-based redirects
- Cleared on logout

## API Request/Response Examples

### Office Login Request
```json
POST /api/auth/login/office
{
  "username": "admin.user",
  "password": "SecurePass123"
}
```

### Successful Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "uuid-here",
    "username": "admin.user",
    "email": "admin@university.edu",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Invalid credentials. Please check your username and password."
}
```

## Next Steps for You

### 1. Update Existing Office Staff Records
Run this SQL to set usernames for existing office staff:
```sql
-- Example: Set usernames based on email
UPDATE office_staff 
SET username = LOWER(SPLIT_PART(email, '@', 1))
WHERE username IS NULL;
```

### 2. Set Passwords for Office Staff
You'll need to create a script or manually set bcrypt hashed passwords.

**Option A:** Use the existing password hashing utility:
```typescript
import { hashPassword } from '@/lib/utils/password';

const hashedPassword = await hashPassword('temporaryPassword123');
// Update database with hashedPassword
```

**Option B:** SQL with pgcrypto (if enabled):
```sql
UPDATE office_staff 
SET password = crypt('TemporaryPass123', gen_salt('bf'))
WHERE id = 'specific-user-id';
```

### 3. Test All Three Login Flows
1. Create test users for each role with proper passwords
2. Test login with correct credentials
3. Test login with incorrect credentials
4. Test validation errors
5. Verify redirects work properly

### 4. Environment Variables
Ensure these are set in your `.env.local`:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Testing Checklist

- [ ] Office login with valid credentials
- [ ] Office login with invalid username
- [ ] Office login with invalid password
- [ ] Teacher login with valid credentials
- [ ] Teacher login with inactive account
- [ ] Student login with all three fields correct
- [ ] Student login with wrong student ID
- [ ] Student login with wrong password
- [ ] Test form validation (client-side)
- [ ] Test API validation (server-side)
- [ ] Verify redirects to correct dashboards
- [ ] Check sessionStorage data is stored
- [ ] Test error messages display properly

## Files Summary

### Created (7 files)
1. `scripts/add-office-auth-fields.sql`
2. `lib/auth/authentication.ts`
3. `app/api/auth/login/office/route.ts`
4. `app/api/auth/login/teacher/route.ts`
5. `app/api/auth/login/student/route.ts`
6. `AUTHENTICATION_IMPLEMENTATION.md` (this file)

### Modified (3 files)
1. `lib/database/models.ts`
2. `lib/database/operations.ts`
3. `app/(office)/login/page.tsx`

## Troubleshooting

### "Missing Supabase environment variables"
- Check `.env.local` has SUPABASE_URL and SUPABASE_ANON_KEY

### "Invalid credentials" error on correct password
- Ensure passwords are bcrypt hashed in database
- Check if user account is active (is_active = true for office, status = 'ACTIVE' for teachers/students)

### "Module not found" errors
- Run `npm install` to ensure all dependencies are installed

### CORS or network errors
- Ensure Next.js dev server is running
- Check browser console for detailed error messages

## Support
If you encounter issues, check:
1. Supabase connection is working
2. Database schema matches expected structure
3. Environment variables are set correctly
4. All npm dependencies are installed
