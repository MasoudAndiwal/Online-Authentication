# Authentication Troubleshooting Guide

## Error: 401 (Unauthorized)

If you're getting a 401 error when trying to authenticate, follow these steps:

### Step 1: Check Browser Console

Open the browser console (F12) and look for these log messages:

```
[Verify Password] Attempting to verify password for: user@example.com
[Verify Password] Supabase URL: https://your-project.supabase.co
[Verify Password] Calling Supabase signInWithPassword...
[Verify Password] Authentication failed: Invalid login credentials
```

### Step 2: Verify Your Credentials

**Common Issues:**

1. **Wrong Password**: Make sure you're entering the correct password for your account
2. **Wrong Email**: The system uses the email of the currently logged-in user
3. **Account Not Created**: The user account might not exist in Supabase Auth

### Step 3: Check Supabase Auth

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Find your user account
4. Verify:
   - ✅ Email matches the logged-in user
   - ✅ Email is confirmed
   - ✅ Account is not disabled

### Step 4: Test Password Reset

If you're unsure about your password:

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Find your user
3. Click the three dots (⋮) → **Send Password Reset Email**
4. Reset your password
5. Try authenticating again with the new password

### Step 5: Check Environment Variables

Make sure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Step 6: Verify Supabase Auth is Enabled

1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Make sure **Email** provider is enabled

### Step 7: Check User Creation

If the user doesn't exist in Supabase Auth, you need to create it:

**Option A: Via Supabase Dashboard**
1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Enter email and password
4. Click **Create User**

**Option B: Via SQL**
```sql
-- Check if user exists
SELECT * FROM auth.users WHERE email = 'your-email@example.com';

-- If no results, the user doesn't exist in Supabase Auth
```

## Common Error Messages

### "Invalid login credentials"

**Cause:** Email or password is incorrect

**Solution:**
1. Double-check the email of the logged-in user
2. Verify the password is correct
3. Try resetting the password

### "Email not confirmed"

**Cause:** User's email address hasn't been verified

**Solution:**
1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Find the user
3. Click **Confirm Email**

### "User not found"

**Cause:** User account doesn't exist in Supabase Auth

**Solution:**
1. Create the user account in Supabase Auth
2. Make sure the email matches

### "Server configuration error"

**Cause:** Missing environment variables

**Solution:**
1. Check `.env.local` file exists
2. Verify `NEXT_PUBLIC_SUPABASE_URL` is set
3. Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
4. Restart the development server

## Testing Authentication

### Test 1: Check Current User Email

Add this to your browser console on the mark-attendance page:

```javascript
// This will show you the current user's email
console.log('Current user email:', document.querySelector('[data-user-email]')?.textContent);
```

### Test 2: Test API Directly

Use this curl command to test the API:

```bash
curl -X POST http://localhost:3000/api/auth/verify-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}'
```

**Expected Success Response:**
```json
{
  "success": true,
  "message": "Password verified successfully",
  "user": {
    "id": "user-uuid",
    "email": "your-email@example.com"
  }
}
```

**Expected Error Response:**
```json
{
  "success": false,
  "error": "Invalid password",
  "message": "Invalid email or password. Please check your credentials and try again."
}
```

### Test 3: Check Supabase Connection

Run this in your browser console:

```javascript
fetch('/api/auth/verify-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'test123'
  })
})
.then(r => r.json())
.then(data => console.log('API Response:', data))
.catch(err => console.error('API Error:', err));
```

## Quick Fix Checklist

- [ ] User account exists in Supabase Auth
- [ ] Email is confirmed in Supabase Auth
- [ ] Password is correct
- [ ] Environment variables are set
- [ ] Supabase URL is correct
- [ ] Email provider is enabled in Supabase
- [ ] Development server has been restarted

## Still Having Issues?

### Enable Debug Mode

The API now includes debug information in development mode. Check the browser console for:

```
Authentication failed: {
  success: false,
  error: "Invalid password",
  message: "...",
  debug: "Detailed error message from Supabase"
}
```

### Check Server Logs

Look at your terminal where the Next.js dev server is running for:

```
[Verify Password] Attempting to verify password for: user@example.com
[Verify Password] Supabase URL: https://...
[Verify Password] Calling Supabase signInWithPassword...
[Verify Password] Authentication failed: Invalid login credentials
[Verify Password] Error details: {...}
```

### Create a Test User

Create a test user with a known password:

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **Add User**
3. Email: `test@example.com`
4. Password: `Test123!@#`
5. Click **Create User**
6. Try authenticating with these credentials

## Contact Support

If none of these solutions work, provide:

1. Browser console logs
2. Server terminal logs
3. Supabase project URL
4. User email being tested
5. Error message received

This will help diagnose the issue quickly.
