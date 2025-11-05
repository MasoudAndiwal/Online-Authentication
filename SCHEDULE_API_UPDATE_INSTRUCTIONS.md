# Schedule API Update - Dynamic Teacher Names

## Problem
The attendance page was showing static teacher names ("Teacher 1", "Teacher 2", "Teacher 3") instead of the actual teacher names from the Schedule Builder.

## Solution
Updated the `/api/schedule` endpoint to fetch schedule data from the database instead of using mock data.

## Changes Made

### 1. Updated `app/api/schedule/route.ts`
- Added Supabase import to connect to the database
- Modified the GET function to fetch from `schedule_entries` table
- Added proper fallback chain: Database → Sample Data → Default Template
- Added console logging for debugging
- Added cache-control headers to prevent browser caching

### 2. Data Flow
```
1. API receives request with classId/className+session and dayOfWeek
2. Looks up class in database if only className+session provided
3. Fetches schedule_entries from database for that class and day
4. Maps database fields to expected format:
   - teacher_name → teacherName
   - start_time/end_time → formatted as HH:MM
5. Returns formatted schedule with actual teacher names
```

## How to Test

### Step 1: Restart Development Server
**IMPORTANT**: You MUST restart your dev server for changes to take effect!

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 2: Clear Browser Cache
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

OR

Press: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)

### Step 3: Check Console Logs
Open browser console and look for logs like:
```
[Schedule API] Request params: { classId: '...', className: 'AI-301-A', session: 'MORNING', dayOfWeek: 'saturday' }
[Schedule API] Found class ID: ...
[Schedule API] Found schedule entries: 2
[Schedule API] Returning database schedule with teachers: ['Jamil Mire', 'masoud andiwal']
```

### Step 4: Verify Teacher Names
The attendance table should now show:
- Period 1 (08:30-09:10): **Jamil Mire** (not "Teacher 1")
- Period 2 (10:45-12:45): **masoud andiwal** (not "Teacher 2")

## Troubleshooting

### Issue: Still showing "Teacher 1, 2, 3"
**Solutions:**
1. ✅ Restart dev server
2. ✅ Hard refresh browser (Ctrl+Shift+R)
3. ✅ Check console for API logs
4. ✅ Verify schedule exists in database for that day

### Issue: No schedule entries found
**Check:**
1. Does the class exist in the `classes` table?
2. Are there entries in `schedule_entries` table for that class?
3. Is the `day_of_week` field lowercase? (e.g., "saturday" not "Saturday")
4. Does the class_id in schedule_entries match the class id?

### Issue: API returns default template
This means no schedule was found in database. Check:
```sql
-- Check if class exists
SELECT * FROM classes WHERE name = 'AI-301-A' AND session = 'MORNING';

-- Check if schedule entries exist
SELECT * FROM schedule_entries 
WHERE class_id = '<class-id-from-above>' 
AND day_of_week = 'saturday';
```

## Database Schema Reference

### schedule_entries table
```sql
- id: UUID (primary key)
- class_id: UUID (foreign key to classes)
- teacher_name: VARCHAR(200)
- subject: VARCHAR(200)
- hours: INTEGER
- day_of_week: VARCHAR(20) -- lowercase: 'saturday', 'sunday', etc.
- start_time: TIME
- end_time: TIME
```

## API Response Format

### Success Response (from database)
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "teacherName": "Jamil Mire",
      "subject": "Chemistry",
      "hours": 3,
      "dayOfWeek": "saturday",
      "startTime": "08:30",
      "endTime": "10:30",
      "periodNumber": 1
    }
  ],
  "totalPeriods": 2,
  "source": "database"
}
```

### Fallback Response (default template)
```json
{
  "success": true,
  "data": [...],
  "totalPeriods": 6,
  "source": "default_template",
  "message": "Using default schedule template - please add schedule entries in Schedule Builder"
}
```

## Next Steps

1. **Restart your dev server** - This is the most important step!
2. **Hard refresh the browser** - Clear any cached API responses
3. **Check the console logs** - Verify the API is fetching from database
4. **Verify the data** - Make sure schedule entries exist in the database

If you still see "Teacher 1, 2, 3" after following these steps, check the console logs to see which source the API is using (database, sample_data, or default_template).
