# 🔧 Student Login Troubleshooting Guide

## Issue 1: ERR_CONNECTION_REFUSED

**Error:** `POST http://localhost:3000/api/auth/login/student net::ERR_CONNECTION_REFUSED`

**Cause:** Your Next.js development server is not running.

**Solution:**
1. Open a terminal in your project directory
2. Start the development server:
   ```bash
   npm run dev
   ```
   or
   ```bash
   yarn dev
   ```
3. Wait for the server to start (you should see "Ready" message)
4. Then try logging in again

## Issue 2: Duplicate Student ID Error

**Error:** `duplicate key value violates unique constraint "students_student_id_key"`

**Cause:** Student ID 99999 already exists in the database.

**Solution:** Use the unique ID script:
```bash
node scripts/add-test-student-unique.js
```

This will:
- Generate a unique student ID
- Clean up any existing test students
- Create a new test student with unique credentials

## Step-by-Step Login Process

### Step 1: Start Your Server
```bash
npm run dev
```

### Step 2: Add Test Student
```bash
node scripts/add-test-student-unique.js
```

**Expected Output:**
```
✅ Test student added successfully!

🔑 Login Credentials:
   Username: student
   Password: password123
   Student ID: TEST123456  # This will be unique

⚠️  IMPORTANT: Use Student ID: TEST123456 for login
```

### Step 3: Test Login
1. Go to: http://localhost:3000/login
2. Click "Student Login"
3. Enter:
   - Username: `student`
   - Password: `password123`
   - Student ID: `TEST123456` (use the ID from the script output)

## Alternative: Manual SQL Method

If the Node.js script still doesn't work, use SQL directly:

1. Go to: https://supabase.com/dashboard/project/sgcoinewybdlnjibuatf
2. Click "SQL Editor"
3. Run this SQL:

```sql
-- Clean up existing test students
DELETE FROM students WHERE username = 'student' OR student_id LIKE 'TEST%';

-- Add new test student with unique ID
INSERT INTO students (
  first_name, last_name, father_name, grandfather_name,
  student_id, date_of_birth, phone, father_phone, address,
  programs, semester, enrollment_year, class_section, time_slot,
  username, student_id_ref, password, status
) VALUES (
  'Test', 'Student', 'Test Father', 'Test Grandfather',
  'TEST999888', '2003-01-01', '0701234567', '0701234568', 'Kabul, Afghanistan',
  'Computer Science', '4', '2021', 'AI-401-A - AFTERNOON', 'AFTERNOON',
  'student', 'TEST999888', 
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 
  'ACTIVE'
);

-- Verify creation
SELECT id, first_name, last_name, student_id, username, status 
FROM students WHERE username = 'student';
```

**Login Credentials for SQL method:**
- Username: `student`
- Password: `password123`
- Student ID: `TEST999888`

## Debugging Steps

### Check if Server is Running
```bash
curl http://localhost:3000/api/auth/login/student
```

**Expected:** Should return a method not allowed error (not connection refused)

### Check if Student Exists
```sql
SELECT * FROM students WHERE username = 'student';
```

### Check API Logs
Look at your terminal where `npm run dev` is running for detailed error logs.

### Test API Directly
Use a tool like Postman or curl:
```bash
curl -X POST http://localhost:3000/api/auth/login/student \
  -H "Content-Type: application/json" \
  -d '{"username":"student","studentId":"TEST999888","password":"password123"}'
```

## Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Server not running | Run `npm run dev` |
| Student doesn't exist | Run the unique script or SQL |
| Wrong Student ID | Use the exact ID from script output |
| API errors | Check terminal logs for details |
| Database connection | Verify Supabase credentials in `.env` |

## Quick Test Commands

```bash
# 1. Start server
npm run dev

# 2. In another terminal, add student
node scripts/add-test-student-unique.js

# 3. Test login (replace with actual student ID)
curl -X POST http://localhost:3000/api/auth/login/student \
  -H "Content-Type: application/json" \
  -d '{"username":"student","studentId":"TEST123456","password":"password123"}'
```

## Success Indicators

✅ **Server Running:** Terminal shows "Ready in X.Xs"
✅ **Student Created:** Script shows "Test student added successfully!"
✅ **Login Works:** Browser redirects to student dashboard
✅ **API Response:** Returns `{"success":true,"message":"Login successful"}`

If you're still having issues, please share:
1. The exact error message
2. Your terminal output from `npm run dev`
3. The output from the student creation script