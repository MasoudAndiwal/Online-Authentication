# Schedule Management System - Backend Integration Guide

## 📋 Overview

This document provides complete instructions for setting up the backend integration for the Class Schedule Management System using Supabase.

## 🗄️ Database Setup

### Step 1: Run SQL Migration in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the sidebar
3. Copy the entire content from `supabase/migrations/create_schedule_tables.sql`
4. Paste it into the SQL Editor
5. Click **Run** to execute the migration

This will create:
- `classes` table - Stores class information (name, session)
- `schedule_entries` table - Stores individual schedule entries
- Row Level Security (RLS) policies - Only OFFICE role can modify
- Indexes for better performance
- Views for easier data querying

### Step 2: Verify Tables Created

Check that these tables exist in your database:
```sql
SELECT * FROM classes;
SELECT * FROM schedule_entries;
```

### Step 3: (Optional) Insert Sample Data

If you want to test with sample data, uncomment the sample data section at the bottom of the SQL file and run it again.

## 📁 File Structure

```
lib/
├── api/
│   └── schedule-api.ts          # API service functions
├── data/
│   └── schedule-data.ts         # TypeScript interfaces
└── supabase/
    └── client.ts                # Supabase client (should exist)

supabase/
└── migrations/
    └── create_schedule_tables.sql  # Database schema

app/(office)/dashboard/(class&schedule)/schedule/
└── page.tsx                     # Main schedule page

components/schedule/
├── class-list-item.tsx          # Class list item component
├── schedule-table.tsx           # Schedule display component
├── create-schedule-dialog.tsx  # Create class dialog
└── add-schedule-entry-dialog.tsx # Add/Edit entry dialog
```

## 🔧 API Functions Available

### Classes
- `fetchClasses()` - Get all classes with their schedule entries
- `createClass(data)` - Create a new class
- `updateClass(classId, data)` - Update class name
- `deleteClass(classId)` - Delete class (CASCADE deletes entries)

### Schedule Entries
- `createScheduleEntry(classId, data)` - Add new schedule entry
- `updateScheduleEntry(entryId, data)` - Update existing entry
- `deleteScheduleEntry(entryId)` - Delete entry

### Statistics
- `getScheduleStats()` - Get overview statistics

## 🎯 Usage Examples

### Creating a New Class

```typescript
import * as scheduleApi from "@/lib/api/schedule-api";

const newClass = await scheduleApi.createClass({
  name: "Class D",
  session: "MORNING"
});
```

### Adding a Schedule Entry

```typescript
const newEntry = await scheduleApi.createScheduleEntry("class-id-here", {
  teacherName: "Prof. Ahmad",
  subject: "Mathematics",
  hours: 2,
  dayOfWeek: "saturday",
  startTime: "08:00",
  endTime: "10:00"
});
```

### Fetching All Classes

```typescript
const classes = await scheduleApi.fetchClasses();
// Returns: Class[] with all schedule entries populated
```

## 🔐 Row Level Security (RLS)

The database has RLS enabled with these policies:

### Read Access (SELECT)
- ✅ All authenticated users can view classes and schedule entries

### Write Access (INSERT/UPDATE/DELETE)
- ✅ Only users with `role: "OFFICE"` in their `user_metadata` can modify data
- ❌ Other roles (TEACHER, STUDENT) have read-only access

### Setting User Role

When creating users, set their role in metadata:
```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'admin@university.edu',
  password: 'password',
  options: {
    data: {
      role: 'OFFICE'
    }
  }
});
```

## 📊 Database Schema

### `classes` Table
```sql
Column      | Type      | Description
------------|-----------|----------------------------------
id          | UUID      | Primary key
name        | VARCHAR   | Class name (e.g., "Class A")
session     | VARCHAR   | "MORNING" or "AFTERNOON"
created_at  | TIMESTAMP | Creation timestamp
updated_at  | TIMESTAMP | Last update timestamp
created_by  | UUID      | User who created (FK to auth.users)
```

**Constraints:**
- `UNIQUE(name, session)` - Each class can have one morning and one afternoon session

### `schedule_entries` Table
```sql
Column       | Type      | Description
-------------|-----------|----------------------------------
id           | UUID      | Primary key
class_id     | UUID      | Foreign key to classes
teacher_name | VARCHAR   | Teacher's full name
subject      | VARCHAR   | Subject/Book name
hours        | INTEGER   | Teaching hours (1-8)
day_of_week  | VARCHAR   | Day key (saturday, sunday, etc.)
start_time   | TIME      | Class start time
end_time     | TIME      | Class end time
created_at   | TIMESTAMP | Creation timestamp
updated_at   | TIMESTAMP | Last update timestamp
```

**Constraints:**
- `hours CHECK (hours >= 1 AND hours <= 8)`
- `end_time > start_time`
- `ON DELETE CASCADE` - Deleting a class deletes all its entries

## 🚀 Testing the Integration

### 1. Start Your Development Server
```bash
npm run dev
```

### 2. Navigate to Schedule Page
```
http://localhost:3000/dashboard/schedule
```

### 3. Test Features
- ✅ View existing classes (if any)
- ✅ Create a new class
- ✅ Add schedule entries
- ✅ Edit entries
- ✅ Delete entries
- ✅ Edit class name
- ✅ Delete class

### 4. Check Database
After creating data, verify in Supabase:
```sql
-- View all classes
SELECT * FROM classes ORDER BY name, session;

-- View all entries with class info
SELECT 
    c.name as class_name,
    c.session,
    se.teacher_name,
    se.subject,
    se.day_of_week,
    se.start_time,
    se.end_time
FROM classes c
JOIN schedule_entries se ON c.id = se.class_id
ORDER BY c.name, se.day_of_week, se.start_time;

-- Get summary statistics
SELECT * FROM v_classes_summary;
```

## ❗ Troubleshooting

### Error: "Failed to load classes"
- **Check**: Supabase client is properly configured
- **Check**: SQL migration ran successfully
- **Check**: User is authenticated
- **Solution**: Check browser console for detailed error

### Error: "Failed to create class"
- **Check**: User has OFFICE role in metadata
- **Check**: Class name + session combination is unique
- **Solution**: Verify RLS policies are active

### Error: "Failed to add entry"
- **Check**: Class ID exists
- **Check**: Time format is correct (HH:MM)
- **Check**: End time is after start time
- **Solution**: Validate input data

### Data Not Showing
- **Check**: Run `SELECT * FROM classes;` in SQL Editor
- **Check**: Browser console for errors
- **Check**: Network tab shows successful API calls
- **Solution**: Refresh page, check authentication

## 📝 Next Steps

### Optional Enhancements

1. **Add Toast Notifications**
   ```bash
   npm install sonner
   ```
   Then replace `showNotification` with `toast` from sonner

2. **Add Loading Skeletons**
   - Show skeleton loaders instead of simple spinner
   - Better UX for slow connections

3. **Add Bulk Operations**
   - Import/Export schedules
   - Duplicate class schedules
   - Batch delete entries

4. **Add Validation**
   - Check for time conflicts
   - Prevent overlapping entries
   - Validate teacher availability

5. **Add Search & Filters**
   - Search by teacher name
   - Filter by subject
   - Filter by day

6. **Add Real-time Updates**
   ```typescript
   // Subscribe to changes
   supabase
     .channel('schedule-changes')
     .on('postgres_changes', 
       { event: '*', schema: 'public', table: 'classes' },
       () => loadClasses()
     )
     .subscribe();
   ```

## 📞 Support

For issues or questions:
1. Check the browser console for errors
2. Verify Supabase SQL Editor output
3. Check RLS policies are enabled
4. Ensure user has correct role

---

## 🎉 Success!

Your schedule management system is now fully integrated with Supabase backend! All CRUD operations are working with persistent storage.
