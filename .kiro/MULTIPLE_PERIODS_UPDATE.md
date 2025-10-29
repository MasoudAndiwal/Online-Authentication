# 📚 Multiple Teaching Periods Feature

**Date:** October 19, 2025

---

## ✅ Feature Added: Multiple Consecutive Periods

### **Problem Solved:**
Previously, teachers could only be assigned **1 period (40 minutes)** at a time. However, many teachers teach **multiple consecutive periods** for the same subject.

### **Solution:**
Updated the schedule entry form to allow selecting:
1. **Start Period** - When the class begins
2. **Number of Periods** - How many consecutive periods (1-6)

The system automatically calculates the correct end time.

---

## 🎯 How It Works

### **Before:**
```
Time Slot: Period 1 (08:30 AM - 09:10 AM)
Result: 1 period only (40 minutes)
```

### **After:**
```
Start Period: Period 1 (08:30 AM - 09:10 AM)
Number of Periods: 3
Result: Period 1 - Period 3 (08:30 AM - 10:30 AM) = 120 minutes
```

---

## 📋 New Form Fields

### **1. Start Period Dropdown**
- Replaces "Time Slot"
- Shows all available periods for the session
- Example: "Period 1 (08:30 AM - 09:10 AM)"

### **2. Number of Periods Dropdown**
Options:
- **1 Period** (40 min)
- **2 Periods** (80 min)
- **3 Periods** (120 min)
- **4 Periods** (160 min)
- **5 Periods** (200 min)
- **6 Periods** (240 min)

### **3. Calculated Time Range Display**
Shows the complete time range:
```
🕐 Total Time: Period 1 - Period 3 (08:30 - 10:30)
   3 periods (120 minutes)
```

### **4. Validation**
If you select too many periods (e.g., start at Period 5 and select 3 periods), the system shows:
```
⚠️ Not enough periods available. 
   Please select fewer periods or an earlier start time.
```

---

## 💡 Examples

### **Example 1: Single Period Math Class**
- **Teacher:** Ahmad Karimi
- **Subject:** Mathematics
- **Day:** Saturday
- **Start Period:** Period 1 (08:30 - 09:10)
- **Number of Periods:** 1
- **Result:** 08:30 - 09:10 (40 minutes)

### **Example 2: Double Period Physics Lab**
- **Teacher:** Karimi Ahmadi
- **Subject:** Physics
- **Day:** Monday
- **Start Period:** Period 2 (09:10 - 09:50)
- **Number of Periods:** 2
- **Result:** 09:10 - 10:30 (80 minutes)

### **Example 3: Triple Period Computer Science**
- **Teacher:** Mohammadi Safi
- **Subject:** Computer Science
- **Day:** Wednesday
- **Start Period:** Period 1 (08:30 - 09:10)
- **Number of Periods:** 3
- **Result:** 08:30 - 10:30 (120 minutes)

---

## 🔄 How Multiple Periods Are Calculated

The system automatically:

1. **Finds the start period index**
   - Example: Period 1 = index 0

2. **Adds the number of periods**
   - 3 periods = index 0, 1, 2

3. **Gets the end time from last period**
   - Period 3 ends at 10:30

4. **Creates the time range**
   - Start: 08:30 (from Period 1)
   - End: 10:30 (from Period 3)
   - Hours: 3

---

## 📊 Morning Session Example

| Start Period | Periods | End Period | Time Range | Total Minutes |
|--------------|---------|------------|------------|---------------|
| Period 1 | 1 | Period 1 | 08:30 - 09:10 | 40 min |
| Period 1 | 2 | Period 2 | 08:30 - 09:50 | 80 min |
| Period 1 | 3 | Period 3 | 08:30 - 10:30 | 120 min |
| Period 4 | 2 | Period 5 | 10:45 - 12:05 | 80 min |
| Period 4 | 3 | Period 6 | 10:45 - 12:45 | 120 min |

---

## 📊 Afternoon Session Example

| Start Period | Periods | End Period | Time Range | Total Minutes |
|--------------|---------|------------|------------|---------------|
| Period 1 | 1 | Period 1 | 01:15 PM - 01:55 PM | 40 min |
| Period 1 | 2 | Period 2 | 01:15 PM - 02:35 PM | 80 min |
| Period 1 | 3 | Period 3 | 01:15 PM - 03:15 PM | 120 min |
| Period 4 | 2 | Period 5 | 03:30 PM - 04:50 PM | 80 min |
| Period 4 | 3 | Period 6 | 03:30 PM - 05:30 PM | 120 min |

---

## 🎨 Visual Improvements

### **Time Range Display Box:**
```
┌─────────────────────────────────────────────────────────┐
│ 🕐 Total Time: Period 1 - Period 3 (08:30 - 10:30)    │
│    3 periods (120 minutes)                              │
└─────────────────────────────────────────────────────────┘
```
- Orange gradient background
- Shows complete time range
- Shows total periods and minutes

### **Error Display:**
```
┌─────────────────────────────────────────────────────────┐
│ ⚠️ Not enough periods available.                       │
│    Please select fewer periods or an earlier start.    │
└─────────────────────────────────────────────────────────┘
```
- Red background for errors
- Clear guidance

---

## 🔍 Validation Rules

### **Rule 1: Consecutive Periods Only**
The system ensures periods are consecutive (no gaps).

**Valid:**
- Period 1 + 2 periods = Period 1, 2 ✅
- Period 4 + 3 periods = Period 4, 5, 6 ✅

**Invalid:**
- Cannot skip break times or non-existent periods ❌

### **Rule 2: Maximum Periods Check**
Cannot exceed available periods in session.

**Morning Session (6 periods):**
- Start at Period 6 → Max 1 period ✅
- Start at Period 5 → Max 2 periods ✅
- Start at Period 1 → Max 6 periods ✅

### **Rule 3: Auto-calculation**
The end time is automatically calculated:
- **Manual input NOT required**
- **System validates automatically**
- **Shows preview before saving**

---

## 📁 Files Modified

| File | Changes |
|------|---------|
| `components/schedule/add-schedule-entry-dialog.tsx` | Complete update with multiple periods support |

---

## 🧮 Technical Details

### **State Management:**
```typescript
const [startPeriod, setStartPeriod] = useState("");      // e.g., "08:30-09:10"
const [numberOfPeriods, setNumberOfPeriods] = useState("1"); // "1" to "6"
```

### **Calculation Logic:**
```typescript
const calculatedTimeRange = useMemo(() => {
  const startIdx = findPeriodIndex(startPeriod);
  const endIdx = startIdx + parseInt(numberOfPeriods) - 1;
  
  return {
    startTime: periods[startIdx].startTime,
    endTime: periods[endIdx].endTime,
    hours: parseInt(numberOfPeriods)
  };
}, [startPeriod, numberOfPeriods]);
```

### **Data Saved:**
```typescript
{
  teacherId: "teacher-uuid",
  teacherName: "Ahmad Karimi",
  subject: "Mathematics",
  hours: 3,                    // Number of periods
  dayOfWeek: "saturday",
  startTime: "08:30",         // Start of first period
  endTime: "10:30"            // End of last period
}
```

---

## 🧪 Testing Checklist

- [ ] Select 1 period → Shows correct time
- [ ] Select 2 periods → Calculates correctly
- [ ] Select 3 periods → Calculates correctly
- [ ] Select 6 periods from Period 1 → Works
- [ ] Select 3 periods from Period 5 → Shows error (not enough)
- [ ] Edit existing entry → Loads correct values
- [ ] Time range preview shows correctly
- [ ] Total minutes calculation correct (periods × 40)
- [ ] Orange theme consistent
- [ ] Validation prevents invalid selections

---

## 💾 Database Impact

### **No Schema Changes Required**
The `hours` field already exists in the database:
```sql
hours INTEGER NOT NULL CHECK (hours >= 1 AND hours <= 8)
```

Now it represents:
- **1 hour** = 1 period (40 min)
- **2 hours** = 2 periods (80 min)
- **3 hours** = 3 periods (120 min)
- etc.

---

## 🎓 Use Cases

### **Common Teaching Scenarios:**

**1. Regular Classes (1 period)**
- Most subjects: Math, English, History
- 40 minutes each

**2. Lab Sessions (2-3 periods)**
- Physics Lab, Chemistry Lab
- 80-120 minutes for experiments

**3. Computer Practicals (2-3 periods)**
- Programming, Software
- Extended time for hands-on work

**4. Workshop/Project Time (4-6 periods)**
- Special projects
- Extended learning sessions

---

## 📝 User Guide

### **How to Add Multiple Period Class:**

1. **Click "Add Class"** on any day
2. **Select Teacher** from dropdown
3. **Select Subject** (auto-populated from teacher)
4. **Select Day** of week
5. **Select Start Period** (e.g., Period 1)
6. **Select Number of Periods** (e.g., 3)
7. **Review** the calculated time range
8. **Click "Add Entry"**

### **The system automatically:**
- ✅ Calculates end time
- ✅ Shows total duration
- ✅ Validates availability
- ✅ Checks for conflicts
- ✅ Updates the schedule

---

## ✅ Summary

### **What's New:**
- ✅ Teachers can teach multiple consecutive periods
- ✅ Flexible 1-6 period selection
- ✅ Automatic time calculation
- ✅ Visual preview of total time
- ✅ Smart validation

### **Benefits:**
- 🎯 More realistic scheduling
- 📚 Supports lab sessions
- ⏰ Accurate time tracking
- 🔒 Prevents invalid schedules
- 👁️ Clear visual feedback

### **User Experience:**
- Simple 2-dropdown interface
- Real-time calculation
- Clear error messages
- Orange theme throughout
- No manual time math needed

---

**🚀 Ready to use! Teachers can now be scheduled for multiple consecutive periods!**
