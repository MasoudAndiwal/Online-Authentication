# Quick Start: Add Test Student

## 🚀 Quick Method (Recommended)

Run this command in your terminal:

```bash
node scripts/add-test-student.js
```

This will:
- Hash the password securely
- Remove any existing test student
- Add the new test student to your database
- Display the login credentials

## 📋 Login Credentials

After running the script, use these credentials to log in:

- **Username:** `student`
- **Password:** `password123`
- **Student ID:** `99999`

## 🌐 Login URL

Navigate to: `http://localhost:3000/login`

## 🔧 Alternative Method: SQL Script

If you prefer to use SQL directly in Supabase:

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `add-test-student-simple.sql`
4. Click "Run"

## ✅ Verify Installation

After adding the student, verify it was created:

```sql
SELECT 
  id,
  first_name,
  last_name,
  student_id,
  username,
  status
FROM students 
WHERE username = 'student';
```

## 🐛 Troubleshooting

### Error: "Missing Supabase credentials"

Make sure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Error: "bcryptjs not found"

Install the required dependency:

```bash
npm install bcryptjs
```

### Login Still Fails

1. Check if the student exists:
   ```sql
   SELECT * FROM students WHERE username = 'student';
   ```

2. Verify the password hash is correct:
   ```sql
   SELECT username, password FROM students WHERE username = 'student';
   ```
   
   The password should be: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`

3. Check the authentication logs in your terminal for detailed error messages

## 🗑️ Remove Test Student

When you're done testing:

```sql
DELETE FROM students WHERE username = 'student' OR student_id = '99999';
```

Or run:

```bash
node -e "const { createClient } = require('@supabase/supabase-js'); require('dotenv').config({ path: '.env.local' }); const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); supabase.from('students').delete().eq('username', 'student').then(() => console.log('✅ Test student removed'));"
```

## 📚 What's Next?

After logging in, you can access:

1. **Dashboard** - `/student/student-dashboard`
2. **Attendance History** - `/student/attendance-history`
3. **Class Info** - `/student/class-info`
4. **Messages** - `/student/student-dashboard/messages`
5. **Help & Support** - `/student/help-support`

## ⚠️ Security Note

**DO NOT use this test account in production!**

This account uses a simple password for testing purposes only. Always use strong passwords and proper security measures in production environments.
