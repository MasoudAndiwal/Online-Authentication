# Test Student Account

This document provides information about the test student account for login testing.

## Login Credentials

- **Username:** `student`
- **Password:** `password123`
- **Student ID:** `99999`
- **Email:** `student@test.com`

## How to Add the Test Student

### Option 1: Using Supabase SQL Editor

1. Open your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `add-test-student.sql`
4. Click "Run" to execute the script

### Option 2: Using psql Command Line

```bash
psql -h your-supabase-host -U postgres -d postgres -f scripts/add-test-student.sql
```

### Option 3: Using Node.js Script

Create a file `scripts/add-test-student.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function addTestStudent() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const { data, error } = await supabase
    .from('students')
    .upsert({
      first_name: 'Test',
      last_name: 'Student',
      father_name: 'Father',
      grandfather_name: 'Grandfather',
      student_id: '99999',
      date_of_birth: '2003-01-01',
      phone: '0701234567',
      father_phone: '0701234568',
      address: 'Kabul, Afghanistan',
      programs: 'Computer Science',
      semester: '4',
      enrollment_year: '2021',
      class_section: 'AI-401-A - AFTERNOON',
      time_slot: 'AFTERNOON',
      username: 'student',
      password: hashedPassword,
      status: 'ACTIVE',
      email: 'student@test.com'
    }, {
      onConflict: 'username'
    });

  if (error) {
    console.error('Error adding test student:', error);
  } else {
    console.log('Test student added successfully!');
    console.log('Username: student');
    console.log('Password: password123');
  }
}

addTestStudent();
```

Then run:
```bash
node scripts/add-test-student.js
```

## Student Details

- **Name:** Test Student
- **Student ID:** 99999
- **Class:** AI-401-A - AFTERNOON
- **Program:** Computer Science
- **Semester:** 4
- **Enrollment Year:** 2021
- **Status:** ACTIVE

## Login URL

Navigate to: `/login` or `/student/student-dashboard`

The system will redirect to login if not authenticated.

## Testing the Student Dashboard

After logging in with the test student credentials, you can access:

1. **Dashboard:** `/student/student-dashboard`
   - View attendance metrics
   - See weekly calendar
   - Check academic standing

2. **My Attendance:** `/student/attendance-history`
   - View complete attendance history
   - Filter by date range
   - Export records

3. **Class Information:** `/student/class-info`
   - View class details
   - See teacher information
   - Check attendance policies

4. **Messages:** `/student/student-dashboard/messages`
   - Send messages to teachers
   - View conversation history
   - Attach files

5. **Help & Support:** `/student/help-support`
   - Browse FAQs
   - Read policy documents
   - Contact office

## Security Notes

⚠️ **Important:** This is a test account with a simple password. 

- **DO NOT** use this account in production
- **DO NOT** use simple passwords like "password123" for real users
- Always use strong, hashed passwords for production accounts
- Delete or disable this account before deploying to production

## Password Hash Information

The password "password123" is hashed using bcrypt with 10 salt rounds:

```
$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
```

This hash is already included in the SQL script for convenience.

## Troubleshooting

### Login Fails

1. Verify the student exists:
   ```sql
   SELECT * FROM students WHERE username = 'student';
   ```

2. Check the password hash:
   ```sql
   SELECT username, password FROM students WHERE username = 'student';
   ```

3. Verify the authentication logic in your app matches the database

### Student Not Found

Re-run the `add-test-student.sql` script to recreate the student.

### Permission Errors

Ensure your database user has INSERT and UPDATE permissions on the `students` table.

## Cleanup

To remove the test student:

```sql
DELETE FROM students WHERE username = 'student' OR student_id = '99999';
```
