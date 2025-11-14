# Schedule Table Debugging - Summary

## Changes Made

### 1. ✅ Fixed Time Format (24h → 12h)
Changed the time column to display in 12-hour format:
- Before: `15:30` (24-hour)
- After: `3:30 PM` (12-hour)

### 2. ✅ Added Comprehensive Logging
Added detailed console logs to track:
- Raw data from database
- Day name mapping for each entry
- Summary table of all entries by day
- Grid rendering for each day

## How to Debug "Only Monday Shows" Issue

### Check Browser Console

**Open Developer Tools (F12) and look for:**

1. **Raw Data Log**:
```
[Schedule Dashboard] Raw entries: [...]
```
→ Shows all entries from database

2. **Mapping Logs**:
```
[Mapping] Computer Programming: "monday" -> 1 (Monday)
[Mapping] Chemistry: "tuesday" -> 2 (Tuesday)
```
→ Shows how each day is converted

3. **Summary Table**:
```
┌─────────┬────────────────────────────────┐
│ Monday  │ Computer Programming at 15:30  │
│ Tuesday │ Chemistry at 16:00             │
└─────────┴────────────────────────────────┘
```
→ Shows all entries grouped by day

## Common Causes

### Why Only Monday Might Show:

1. **Database Only Has Monday Entries**
   - Check: Do you actually have entries for other days in the database?

2. **Day Names Are Wrong Format**
   - Database must have: `monday`, `tuesday` (lowercase)
   - NOT: `Monday`, `MONDAY`, `Mon`

3. **Times Don't Match Time Slots**
   - Times must be in range: 08:00 to 18:00
   - Format must be: `HH:MM:SS` (e.g., `15:30:00`)

4. **Day Mapping Fails**
   - Check mapping logs to see if days are recognized

## What to Check in Database

```sql
-- See all your schedule entries
SELECT 
  subject,
  day_of_week,
  start_time,
  end_time
FROM schedule_entries
WHERE class_id = 'your-class-id'
ORDER BY day_of_week, start_time;
```

**Expected Format**:
- `day_of_week`: `monday`, `tuesday`, `wednesday`, etc. (lowercase)
- `start_time`: `15:30:00` (with seconds)
- `end_time`: `17:30:00` (with seconds)

## Next Steps

1. **Open browser console** (F12)
2. **Reload the page**
3. **Look at the logs** to see:
   - How many entries are loaded
   - What days they map to
   - If any mapping is failing

4. **Share the console output** if you need help debugging

The logs will tell us exactly what's happening!
