# Fixed: Teacher Name Expansion for Multiple Periods

## Problem
When a teacher (e.g., "dd") teaches all 6 periods, the system was:
1. Showing ONE column with merged time "08:30-12:45" and teacher "dd"
2. Showing remaining columns with default teacher names (Teacher 1, Teacher 2, Teacher 3)

**Root Cause**: The Schedule Builder creates ONE database entry with `hours: 6`, but the Schedule API wasn't expanding this into 6 separate period entries.

## Solution Implemented

### **Updated Schedule API** (`app/api/schedule/route.ts`)

Added logic to **expand multi-period entries** into individual period entries:

```typescript
// Define standard period times based on session
const morningTimes = [
  { start: '08:30', end: '09:10' }, // Period 1
  { start: '09:10', end: '09:50' }, // Period 2
  { start: '09:50', end: '10:30' }, // Period 3
  { start: '10:45', end: '11:25' }, // Period 4
  { start: '11:25', end: '12:05' }, // Period 5
  { start: '12:05', end: '12:45' }, // Period 6
];

// Expand entries that cover multiple periods (hours > 1) into individual period entries
const expandedSchedule: any[] = [];

scheduleEntries.forEach((entry: DbScheduleEntry) => {
  const hoursCount = entry.hours || 1;
  
  // If this entry covers multiple hours/periods, create separate entries for each
  for (let i = 0; i < hoursCount; i++) {
    const periodNumber = expandedSchedule.length + 1;
    
    // Use standard times for this period
    const periodTimes = standardTimes[periodNumber - 1] || standardTimes[0];
    
    expandedSchedule.push({
      id: `${entry.id}-period-${periodNumber}`,
      teacherName: entry.teacher_name,
      subject: entry.subject,
      hours: 1, // Each expanded entry represents 1 period
      dayOfWeek: entry.day_of_week,
      startTime: periodTimes.start,
      endTime: periodTimes.end,
      periodNumber: periodNumber,
    });
  }
});
```

## How It Works Now

### **Before Fix:**

**Database Entry:**
```
teacher_name: "dd"
hours: 6
start_time: "08:30:00"
end_time: "12:45:00"
```

**API Response:**
```json
[
  {
    "teacherName": "dd",
    "startTime": "08:30",
    "endTime": "12:45",
    "periodNumber": 1
  }
]
```

**UI Display:**
```
| 08:30-12:45 | 09:10-09:50 | 09:50-10:30 | 10:45-11:25 | 11:25-12:05 | 12:05-12:45 |
|     dd      |  Teacher 1  |  Teacher 2  |  Teacher 2  |  Teacher 3  |  Teacher 3  |
```

### **After Fix:**

**Database Entry:** (same)
```
teacher_name: "dd"
hours: 6
start_time: "08:30:00"
end_time: "12:45:00"
```

**API Response:** (expanded)
```json
[
  { "teacherName": "dd", "startTime": "08:30", "endTime": "09:10", "periodNumber": 1 },
  { "teacherName": "dd", "startTime": "09:10", "endTime": "09:50", "periodNumber": 2 },
  { "teacherName": "dd", "startTime": "09:50", "endTime": "10:30", "periodNumber": 3 },
  { "teacherName": "dd", "startTime": "10:45", "endTime": "11:25", "periodNumber": 4 },
  { "teacherName": "dd", "startTime": "11:25", "endTime": "12:05", "periodNumber": 5 },
  { "teacherName": "dd", "startTime": "12:05", "endTime": "12:45", "periodNumber": 6 }
]
```

**UI Display:**
```
| 08:30-09:10 | 09:10-09:50 | 09:50-10:30 | 10:45-11:25 | 11:25-12:05 | 12:05-12:45 |
|     dd      |     dd      |     dd      |     dd      |     dd      |     dd      |
```

## Key Features

### ✅ **Static Period Times**
- Period times are always taken from the standard schedule (Schedule Builder configuration)
- Never uses the merged start/end times from the database entry
- Morning periods: 08:30-09:10, 09:10-09:50, etc.
- Afternoon periods: 13:15-13:55, 13:55-14:35, etc.

### ✅ **Teacher Name Repetition**
- If a teacher teaches 6 periods → their name appears in all 6 columns
- If a teacher teaches 3 periods → their name appears in 3 columns
- Each period gets its own entry with the correct teacher name

### ✅ **Handles Multiple Teachers**
- If multiple teachers teach on the same day, each gets their periods expanded
- Example: Teacher A (periods 1-3), Teacher B (periods 4-6)

### ✅ **Backward Compatible**
- Existing database structure unchanged
- Existing UI components work without modification
- No breaking changes to field names or formats

## Example Scenarios

### **Scenario 1: One Teacher, All 6 Periods**
**Database:**
```sql
INSERT INTO schedule_entries (teacher_name, hours, start_time, end_time)
VALUES ('dd', 6, '08:30:00', '12:45:00');
```

**Result:**
- Period 1: dd (08:30-09:10)
- Period 2: dd (09:10-09:50)
- Period 3: dd (09:50-10:30)
- Period 4: dd (10:45-11:25)
- Period 5: dd (11:25-12:05)
- Period 6: dd (12:05-12:45)

### **Scenario 2: Two Teachers, 3 Periods Each**
**Database:**
```sql
INSERT INTO schedule_entries (teacher_name, hours, start_time, end_time)
VALUES 
  ('Ahmad', 3, '08:30:00', '10:30:00'),
  ('Sara', 3, '10:45:00', '12:45:00');
```

**Result:**
- Period 1: Ahmad (08:30-09:10)
- Period 2: Ahmad (09:10-09:50)
- Period 3: Ahmad (09:50-10:30)
- Period 4: Sara (10:45-11:25)
- Period 5: Sara (11:25-12:05)
- Period 6: Sara (12:05-12:45)

### **Scenario 3: Three Teachers, 2 Periods Each**
**Database:**
```sql
INSERT INTO schedule_entries (teacher_name, hours, start_time, end_time)
VALUES 
  ('Teacher A', 2, '08:30:00', '09:50:00'),
  ('Teacher B', 2, '09:50:00', '11:25:00'),
  ('Teacher C', 2, '11:25:00', '12:45:00');
```

**Result:**
- Period 1: Teacher A (08:30-09:10)
- Period 2: Teacher A (09:10-09:50)
- Period 3: Teacher B (09:50-10:30)
- Period 4: Teacher B (10:45-11:25)
- Period 5: Teacher C (11:25-12:05)
- Period 6: Teacher C (12:05-12:45)

## Testing

### **Test Case 1: Verify Teacher "dd" Appears in All Columns**
1. Navigate to mark-attendance page for class ARCH-101-A
2. Select Wednesday
3. Verify all 6 columns show "dd" as the teacher name
4. Verify each column shows correct individual period times

### **Test Case 2: Check Console Logs**
Open browser console and look for:
```
[Schedule API] Expanded schedule entries: 6
[Schedule API] Returning database schedule with teachers: ["dd", "dd", "dd", "dd", "dd", "dd"]
[StandardPeriods] Schedule length: 6
[StandardPeriods] Period 1: { periodNumber: 1, teacherName: "dd", startTime: "08:30", endTime: "09:10" }
...
```

### **Test Case 3: Verify Database Compatibility**
- Existing schedule entries continue to work
- No migration needed
- Schedule Builder continues to work as before

## Files Modified
- ✅ `app/api/schedule/route.ts` - Added period expansion logic

## Result
✅ **Fixed**: Teacher names now repeat correctly across all their assigned periods
✅ **Fixed**: Period times are always static from Schedule Builder configuration
✅ **Fixed**: No more merged time ranges (08:30-12:45)
✅ **Fixed**: Each period column shows the correct teacher name

The attendance system now correctly displays teacher names for all their assigned periods with static period times!