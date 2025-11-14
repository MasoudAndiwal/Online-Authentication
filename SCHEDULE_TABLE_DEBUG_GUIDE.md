# Schedule Table Debugging Guide

## How to Check What's Happening

### Step 1: Open Browser Console
1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Reload the schedule page

### Step 2: Look for These Log Messages

#### A. Raw Data from Database
```
[Schedule Dashboard] Raw entries: [...]
```
This shows exactly what came from the database. Check:
- How many entries are there?
- What are the `dayOfWeek` values? (should be: "monday", "tuesday", etc.)
- What are the `startTime` values? (should be: "15:30:00" format)

#### B. Day Mapping
```
[Mapping] Computer Programming: "monday" -> 1 (Monday)
[Mapping] Chemistry: "tuesday" -> 2 (Tuesday)
```
This shows how each entry's day is being converted. Check:
- Is the day name being recognized correctly?
- Is it mapping to the right number? (0=Sunday, 1=Monday, 2=Tuesday, etc.)

#### C. Summary Table
```
[Schedule Dashboard] Summary by day:
┌─────────┬────────────────────────────────┐
│ Monday  │ Computer Programming at 15:30  │
│ Tuesday │ Chemistry at 16:00             │
│ ...     │ ...                            │
└─────────┴────────────────────────────────┘
```
This shows all entries grouped by day. Check:
- Are all your days showing up?
- Are the times correct?

### Step 3: Check the Grid Rendering

Look for logs like:
```
[Grid] Day Monday (1): [{ subject: "Computer Programming", startTime: "15:30:00" }]
```

This shows what entries are found for each day when rendering the grid.

## Common Issues and Solutions

### Issue 1: Day Names Don't Match
**Symptom**: Database has "Monday" but code expects "monday"
**Solution**: Day names must be lowercase in database

**Check your database**:
```sql
SELECT day_of_week FROM schedule_entries;
```

Should return: `monday`, `tuesday`, etc. (all lowercase)

### Issue 2: Time Format Mismatch
**Symptom**: Times in database don't match time slots
**Solution**: Ensure times are in HH:MM:SS format

**Check your database**:
```sql
SELECT start_time FROM schedule_entries;
```

Should return: `15:30:00`, `16:00:00`, etc.

### Issue 3: Wrong Day Numbers
**Symptom**: Classes appear on wrong days

**Day Number Mapping**:
- 0 = Sunday
- 1 = Monday
- 2 = Tuesday
- 3 = Wednesday
- 4 = Thursday
- 5 = Friday
- 6 = Saturday

### Issue 4: Only One Entry Shows
**Possible Causes**:
1. Database only has one entry
2. Other entries have invalid day names
3. Other entries have times outside the time slot range
4. Day mapping is failing for some entries

## What to Share for Help

If you need help debugging, share:
1. The "Raw entries" log output
2. All the "Mapping" log outputs
3. The "Summary by day" table
4. A screenshot of what you see vs what you expect

## Quick Database Check

Run this query to see all your schedule entries:
```sql
SELECT 
  subject,
  day_of_week,
  start_time,
  end_time
FROM schedule_entries
WHERE class_id = 'your-class-id'
ORDER BY day_of_week, start_time;
```

Expected format:
- `day_of_week`: lowercase (monday, tuesday, etc.)
- `start_time`: HH:MM:SS format (15:30:00)
- `end_time`: HH:MM:SS format (17:30:00)
