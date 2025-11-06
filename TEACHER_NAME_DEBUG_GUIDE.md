# Teacher Name Display Issue - Debugging Guide

## Problem
Teacher "dd" teaches all 6 periods on Wednesday for class ARCH-101-A (08:30-12:45), but the attendance table shows "Teacher 1", "Teacher 2", "Teacher 3" instead of "dd" in all columns.

## What I've Added

### 1. **Debug Logging in standardPeriods**
Added console logs to track how periods are being generated:
```typescript
console.log('[StandardPeriods] Schedule data:', schedule);
console.log('[StandardPeriods] Schedule length:', schedule.length);
console.log(`[StandardPeriods] Period ${i}:`, scheduleEntry);
console.log('[StandardPeriods] Final periods:', periods);
```

### 2. **Debug Logging in loadSchedule**
Added console logs to track the API response:
```typescript
console.log('[LoadSchedule] Fetching schedule with params:', {...});
console.log('[LoadSchedule] API Response:', result);
console.log('[LoadSchedule] Schedule data:', result.data);
console.log('[LoadSchedule] Teacher names:', result.data?.map((s: any) => s.teacherName));
```

## How to Debug

### Step 1: Open Browser Console
1. Navigate to the mark-attendance page for class ARCH-101-A
2. Select Wednesday as the date
3. Open browser Developer Tools (F12)
4. Go to the Console tab

### Step 2: Check the Logs

Look for these log messages:

#### **LoadSchedule Logs:**
```
[LoadSchedule] Fetching schedule with params: {
  classId: "...",
  className: "ARCH-101-A",
  session: "MORNING",
  dayOfWeek: "wednesday"
}
[LoadSchedule] API Response: { success: true, data: [...], source: "database" }
[LoadSchedule] Schedule data: [...]
[LoadSchedule] Teacher names: ["dd", "dd", "dd", "dd", "dd", "dd"]
```

#### **StandardPeriods Logs:**
```
[StandardPeriods] Schedule data: [...]
[StandardPeriods] Schedule length: 6
[StandardPeriods] Period 1: { periodNumber: 1, teacherName: "dd", ... }
[StandardPeriods] Period 2: { periodNumber: 2, teacherName: "dd", ... }
...
[StandardPeriods] Final periods: [...]
```

## Possible Issues and Solutions

### Issue 1: API Returns Empty Schedule
**Symptoms:**
```
[LoadSchedule] Schedule data: []
[StandardPeriods] Schedule length: 0
```

**Solution:**
- Check if schedule data exists in the database for Wednesday
- Verify the schedule_entries table has records for class ARCH-101-A
- Run this SQL query:
```sql
SELECT * FROM schedule_entries 
WHERE class_id = (SELECT id FROM classes WHERE name = 'ARCH-101-A')
AND day_of_week = 'wednesday'
ORDER BY start_time;
```

### Issue 2: API Returns Default Template
**Symptoms:**
```
[LoadSchedule] API Response: { ..., source: "default_template" }
[LoadSchedule] Teacher names: ["Teacher 1", "Teacher 1", "Teacher 2", ...]
```

**Solution:**
- The API is using the default template because no database records were found
- Add schedule data using the Schedule Builder page
- Or manually insert records into the database

### Issue 3: Period Numbers Don't Match
**Symptoms:**
```
[StandardPeriods] Period 1: undefined
[StandardPeriods] Period 2: undefined
```

**Solution:**
- The schedule entries in the database don't have correct `periodNumber` values
- Check the database records:
```sql
SELECT period_number, teacher_name, start_time, end_time 
FROM schedule_entries 
WHERE class_id = (SELECT id FROM classes WHERE name = 'ARCH-101-A')
AND day_of_week = 'wednesday'
ORDER BY start_time;
```
- Period numbers should be 1, 2, 3, 4, 5, 6

### Issue 4: Teacher Name Field is NULL
**Symptoms:**
```
[LoadSchedule] Teacher names: [null, null, null, null, null, null]
```

**Solution:**
- The `teacher_name` field in the database is NULL
- Update the records:
```sql
UPDATE schedule_entries 
SET teacher_name = 'dd'
WHERE class_id = (SELECT id FROM classes WHERE name = 'ARCH-101-A')
AND day_of_week = 'wednesday';
```

## Expected Correct Output

When everything is working correctly, you should see:

### Console Logs:
```
[LoadSchedule] Teacher names: ["dd", "dd", "dd", "dd", "dd", "dd"]
[StandardPeriods] Schedule length: 6
[StandardPeriods] Period 1: { periodNumber: 1, teacherName: "dd", startTime: "08:30", endTime: "09:10" }
[StandardPeriods] Period 2: { periodNumber: 2, teacherName: "dd", startTime: "09:10", endTime: "09:50" }
[StandardPeriods] Period 3: { periodNumber: 3, teacherName: "dd", startTime: "09:50", endTime: "10:30" }
[StandardPeriods] Period 4: { periodNumber: 4, teacherName: "dd", startTime: "10:45", endTime: "11:25" }
[StandardPeriods] Period 5: { periodNumber: 5, teacherName: "dd", startTime: "11:25", endTime: "12:05" }
[StandardPeriods] Period 6: { periodNumber: 6, teacherName: "dd", startTime: "12:05", endTime: "12:45" }
```

### UI Display:
```
| 08:30-09:10 | 09:10-09:50 | 09:50-10:30 | 10:45-11:25 | 11:25-12:05 | 12:05-12:45 |
|     dd      |     dd      |     dd      |     dd      |     dd      |     dd      |
```

## Next Steps

1. **Open the attendance page** for class ARCH-101-A on Wednesday
2. **Check the console logs** to see what's happening
3. **Share the console output** with me so I can identify the exact issue
4. **Based on the logs**, I'll provide the specific fix needed

## Files Modified
- ✅ `app/(office)/dashboard/(attendance)/mark-attendance/[classId]/page.tsx` - Added debug logging

The debug logs will help us identify exactly where the issue is occurring!