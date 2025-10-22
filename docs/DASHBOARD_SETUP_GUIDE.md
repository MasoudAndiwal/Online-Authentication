# Dashboard Backend - Quick Setup Guide

## 🚀 Quick Start

Follow these steps to get the dashboard backend running:

### Step 1: Run Database Migrations

Execute the SQL migration files in your Supabase/PostgreSQL database:

```bash
# Option 1: Using psql command line
psql -U your_username -d your_database -f database/migrations/create_attendance_records_table.sql
psql -U your_username -d your_database -f database/migrations/create_medical_certificates_table.sql

# Option 2: Using Supabase Dashboard
# Copy and paste the SQL from each migration file into the SQL Editor in Supabase Dashboard
```

### Step 2: Verify Database Tables

Check that the tables were created successfully:

```sql
-- Check attendance_records table
SELECT * FROM attendance_records LIMIT 1;

-- Check medical_certificates table
SELECT * FROM medical_certificates LIMIT 1;

-- Verify indexes
\d attendance_records
\d medical_certificates
```

### Step 3: Test API Endpoints

Start your development server and test the endpoints:

```bash
# Start the dev server
npm run dev

# In another terminal, test the endpoints
curl http://localhost:3000/api/dashboard/stats
curl http://localhost:3000/api/dashboard/activity
curl http://localhost:3000/api/dashboard/attendance?weeks=4
```

### Step 4: Access the Dashboard

1. Navigate to: `http://localhost:3000/dashboard`
2. Login with an OFFICE role account
3. Verify that statistics are loading
4. Test the "Export Data" button

---

## 📁 Files Created

### API Routes
- ✅ `app/api/dashboard/stats/route.ts` - Dashboard statistics endpoint
- ✅ `app/api/dashboard/attendance/route.ts` - Weekly attendance trends
- ✅ `app/api/dashboard/activity/route.ts` - Recent activity feed
- ✅ `app/api/dashboard/export/route.ts` - Data export functionality

### Database Operations
- ✅ `lib/database/dashboard-operations.ts` - Core business logic for dashboard

### Client API
- ✅ `lib/api/dashboard-api.ts` - Client-side API wrapper functions

### Database Migrations
- ✅ `database/migrations/create_attendance_records_table.sql`
- ✅ `database/migrations/create_medical_certificates_table.sql`

### Documentation
- ✅ `docs/DASHBOARD_API_DOCUMENTATION.md` - Comprehensive API documentation
- ✅ `docs/DASHBOARD_SETUP_GUIDE.md` - This quick setup guide

### Updated Files
- ✅ `app/(office)/dashboard/page.tsx` - Integrated with real backend APIs

---

## 🔧 Configuration

### Environment Variables

Ensure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📊 Sample Data (Optional)

To test the dashboard with sample data, you can insert test records:

```sql
-- Insert sample attendance records
INSERT INTO attendance_records (student_id, class_id, date, status, marked_by)
SELECT 
    s.id,
    c.id,
    CURRENT_DATE,
    'present',
    t.id
FROM students s
CROSS JOIN classes c
CROSS JOIN teachers t
LIMIT 100;

-- Insert sample medical certificates
INSERT INTO medical_certificates (student_id, start_date, end_date, reason, status)
SELECT 
    id,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '3 days',
    'Flu symptoms',
    'pending'
FROM students
LIMIT 5;
```

---

## 🐛 Troubleshooting

### Issue: "Cannot find module '@/lib/database/dashboard-operations'"

**Solution**: TypeScript needs to recognize the new file. Try:
1. Restart your IDE/editor
2. Run `npm run build` to regenerate types
3. Check that the file exists at the correct path

### Issue: Database table not found

**Solution**: Run the migration files first:
```bash
psql -d your_database -f database/migrations/create_attendance_records_table.sql
```

### Issue: Stats showing 0 or mock data

**Solution**: This is normal for a fresh database. Either:
1. Use the system to generate real data over time
2. Insert sample data using the SQL above
3. Mock data will be shown until real data exists

### Issue: Export button not working

**Solution**: Check browser console for errors and ensure:
1. User is authenticated
2. API endpoint is accessible
3. Database connection is working

---

## ✅ Verification Checklist

- [ ] Database migrations applied successfully
- [ ] All API endpoints returning 200 status
- [ ] Dashboard page loads without errors
- [ ] Statistics display correctly (or show loading state)
- [ ] Export button triggers download
- [ ] Activity feed shows recent events
- [ ] No TypeScript errors in the console
- [ ] Authentication works for OFFICE role users

---

## 📈 What Each Metric Shows

### Total Users
- **Count**: Combined total of students + teachers
- **Trend**: Percentage change compared to last month
- **Calculation**: Current total vs. (current - users created last month)

### Active Classes
- **Count**: Total number of classes in the system
- **Trend**: Number of new classes added this term
- **Calculation**: Counts from `classes` table

### Attendance Rate
- **Rate**: Percentage of present students vs. total
- **Trend**: Change compared to last week
- **Calculation**: (Present count / Total attendance records) × 100

### Pending Reviews
- **Count**: Medical certificates awaiting approval
- **Trend**: Number needing immediate attention (> 5)
- **Calculation**: Counts from `medical_certificates` where status = 'pending'

---

## 🔄 Data Flow

```
User Opens Dashboard
        ↓
React useEffect triggers
        ↓
fetchDashboardStats() + fetchRecentActivity()
        ↓
API Routes: /api/dashboard/stats & /api/dashboard/activity
        ↓
dashboard-operations.ts functions
        ↓
Supabase database queries
        ↓
Data aggregation & calculations
        ↓
JSON response to frontend
        ↓
React state updated
        ↓
UI re-renders with real data
```

---

## 🎨 UI Integration

The dashboard page now:
- ✅ Fetches real data from backend APIs
- ✅ Shows loading states with '...' placeholders
- ✅ Handles errors with toast notifications
- ✅ Exports data with loading indicator
- ✅ Displays recent activity feed
- ✅ Auto-refreshes data on mount
- ✅ Mobile responsive (from previous fixes)

---

## 🚀 Next Steps

After basic setup:

1. **Add Sample Data**: Insert test records to see the dashboard in action
2. **Test Export**: Try exporting data in both JSON and CSV formats
3. **Monitor Performance**: Check API response times
4. **Add Caching**: Consider Redis for frequently accessed stats
5. **Enable Real-time**: Implement WebSocket for live updates
6. **Create Reports**: Build custom report generation
7. **Add Analytics**: Integrate charts for attendance trends

---

## 📞 Need Help?

If you encounter issues:
1. Check the comprehensive documentation: `DASHBOARD_API_DOCUMENTATION.md`
2. Review browser console for errors
3. Check database logs for query errors
4. Verify environment variables are set
5. Ensure all migrations have been applied

---

## 🎉 Success!

Once everything is working, you should see:
- Real-time statistics on the dashboard
- Activity feed with recent events
- Working export functionality
- Smooth loading states
- No console errors

Your dashboard backend is now complete and ready for production! 🚀
