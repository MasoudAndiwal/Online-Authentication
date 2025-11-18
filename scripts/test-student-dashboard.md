# Student Dashboard Testing Guide

## Issues Fixed

### ✅ 1. Infinite Recursion in Session Management
**Problem:** `getSession()` was calling `updateActivity()` which called `getSession()` again.
**Fix:** Removed the recursive call and made `updateActivity()` read session data directly.

### ✅ 2. Performance Issues in Activity Tracker
**Problem:** Activity tracker was updating on every mouse/scroll event.
**Fix:** Added 5-second throttling to prevent excessive updates.

### ✅ 3. 403 Forbidden Error in Weekly Attendance API
**Problem:** Server-side API was trying to use client-side session function.
**Fix:** Created server-side session management and updated API to use it.

### ✅ 4. Missing Session Data in API Calls
**Problem:** API calls weren't including session information.
**Fix:** Updated hooks to include session data in request headers.

## Testing Steps

### 1. Start Your Server
```bash
npm run dev
```

### 2. Add Test Student
```bash
node scripts/add-test-student-numeric.js
```

### 3. Login and Test Dashboard
1. Go to: http://localhost:3000/login
2. Use the credentials from the script output
3. Navigate to student dashboard
4. Check browser console for errors

## Expected Results

### ✅ No More Errors
- No "Maximum call stack size exceeded" errors
- No 403 Forbidden errors on weekly attendance API
- No performance violations in scroll/click handlers

### ✅ Working Features
- Student dashboard loads successfully
- Weekly attendance calendar displays data
- No infinite loops or performance issues
- Session management works properly

## Debugging Commands

### Check Session Data
```javascript
// In browser console
console.log('Session:', localStorage.getItem('user_session'));
```

### Test API Directly
```bash
# Replace with actual student ID from login
curl -X GET "http://localhost:3000/api/students/attendance/weekly?studentId=YOUR_STUDENT_ID&week=1" \
  -H "x-session-data: $(echo '{"id":"YOUR_STUDENT_ID","role":"STUDENT","firstName":"Test","lastName":"Student"}' | base64)"
```

### Monitor Performance
1. Open Chrome DevTools
2. Go to Performance tab
3. Record while using the dashboard
4. Check for long tasks or excessive function calls

## Additional Improvements Made

### Session Management
- Separated client and server session handling
- Added proper error handling
- Removed recursive calls

### API Security
- Added server-side session validation
- Proper student data access controls
- Better error messages

### Performance
- Throttled activity tracking
- Reduced unnecessary API calls
- Optimized event handlers

## If Issues Persist

1. **Clear Browser Storage:**
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Check Network Tab:**
   - Look for failed API requests
   - Verify session headers are being sent

3. **Check Server Logs:**
   - Look at terminal where `npm run dev` is running
   - Check for detailed error messages

4. **Restart Development Server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

The dashboard should now work without the previous errors!