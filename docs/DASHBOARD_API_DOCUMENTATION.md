# Dashboard API Backend Documentation

## Overview
Complete backend implementation for the Office Dashboard page, providing real-time statistics, attendance tracking, activity logs, and data export functionality.

## API Endpoints

### 1. Dashboard Statistics
**Endpoint:** `GET /api/dashboard/stats`

**Description:** Fetches comprehensive dashboard statistics including total users, active classes, attendance rates, and pending reviews.

**Response:**
```typescript
{
  totalUsers: {
    count: number;
    change: number; // percentage change vs last month
    changeLabel: string;
  };
  activeClasses: {
    count: number;
    change: number; // new classes this term
    changeLabel: string;
  };
  attendanceRate: {
    rate: number; // percentage
    change: number; // percentage change vs last week
    changeLabel: string;
  };
  pendingReviews: {
    count: number;
    change: number;
    changeLabel: string;
  };
}
```

**Example:**
```bash
curl http://localhost:3000/api/dashboard/stats
```

---

### 2. Weekly Attendance Trends
**Endpoint:** `GET /api/dashboard/attendance`

**Description:** Fetches weekly attendance trends for displaying charts.

**Query Parameters:**
- `weeks` (optional): Number of weeks to fetch (default: 4)

**Response:**
```typescript
[
  {
    week: string;
    attendanceRate: number;
    totalClasses: number;
    presentCount: number;
    absentCount: number;
  }
]
```

**Example:**
```bash
curl "http://localhost:3000/api/dashboard/attendance?weeks=4"
```

---

### 3. Recent Activity
**Endpoint:** `GET /api/dashboard/activity`

**Description:** Fetches recent system activities for the activity feed.

**Query Parameters:**
- `limit` (optional): Number of activities to fetch (default: 10)

**Response:**
```typescript
[
  {
    id: string;
    type: 'user_created' | 'attendance_marked' | 'certificate_approved' | 'schedule_updated';
    action: string;
    details: string;
    timestamp: Date;
    icon: string;
  }
]
```

**Example:**
```bash
curl "http://localhost:3000/api/dashboard/activity?limit=10"
```

---

### 4. Export Dashboard Data
**Endpoint:** `GET /api/dashboard/export`

**Description:** Exports all dashboard data (students, teachers, classes) in JSON or CSV format.

**Query Parameters:**
- `format` (optional): Export format - 'json' or 'csv' (default: json)

**Response:**
- JSON file download or CSV file download

**Example:**
```bash
curl "http://localhost:3000/api/dashboard/export?format=json" -o export.json
```

---

## Database Operations

### Core Functions

Located in: `lib/database/dashboard-operations.ts`

#### `getDashboardStats()`
Aggregates statistics from multiple tables:
- Counts total users (students + teachers)
- Calculates user growth trends
- Counts active classes
- Calculates attendance rates
- Counts pending reviews

#### `getWeeklyAttendanceTrends(weeks: number)`
Fetches attendance data grouped by week for the specified number of weeks.

#### `getRecentActivity(limit: number)`
Retrieves recent system activities including:
- New user registrations
- Attendance markings
- Certificate approvals
- Schedule updates

#### `exportDashboardData(format: 'json' | 'csv')`
Exports all system data in the specified format.

---

## Database Tables

### Required Tables

#### 1. `attendance_records`
Tracks daily student attendance.

**Schema:**
```sql
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY,
    student_id UUID REFERENCES students(id),
    class_id UUID REFERENCES classes(id),
    schedule_entry_id UUID REFERENCES schedule_entries(id),
    date DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('present', 'absent', 'sick', 'leave', 'excused')),
    marked_by UUID REFERENCES teachers(id),
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(student_id, class_id, date)
);
```

**Migration:** `database/migrations/create_attendance_records_table.sql`

#### 2. `medical_certificates`
Tracks medical certificates and sick leave requests.

**Schema:**
```sql
CREATE TABLE medical_certificates (
    id UUID PRIMARY KEY,
    student_id UUID REFERENCES students(id),
    submission_date DATE DEFAULT CURRENT_DATE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER GENERATED ALWAYS AS (end_date - start_date + 1) STORED,
    reason TEXT NOT NULL,
    certificate_url TEXT,
    doctor_name VARCHAR(255),
    hospital_clinic VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES office_staff(id),
    reviewed_at TIMESTAMP,
    review_notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Migration:** `database/migrations/create_medical_certificates_table.sql`

---

## Client-Side API Usage

### Setup
Import the client-side API functions:

```typescript
import {
  fetchDashboardStats,
  fetchWeeklyAttendance,
  fetchRecentActivity,
  exportDashboardData
} from '@/lib/api/dashboard-api';
```

### Examples

#### Fetch Dashboard Stats
```typescript
const stats = await fetchDashboardStats();
console.log(stats.totalUsers.count); // 1247
console.log(stats.attendanceRate.rate); // 94.2
```

#### Fetch Weekly Attendance
```typescript
const trends = await fetchWeeklyAttendance(4);
trends.forEach(week => {
  console.log(`${week.week}: ${week.attendanceRate}%`);
});
```

#### Fetch Recent Activity
```typescript
const activities = await fetchRecentActivity(10);
activities.forEach(activity => {
  console.log(`${activity.action}: ${activity.details}`);
});
```

#### Export Data
```typescript
// Downloads a JSON file
await exportDashboardData('json');

// Downloads a CSV file
await exportDashboardData('csv');
```

---

## Integration with Dashboard Page

The dashboard page (`app/(office)/dashboard/page.tsx`) has been updated to:

1. **Fetch real-time statistics** on component mount
2. **Display loading states** while data is being fetched
3. **Handle errors gracefully** with toast notifications
4. **Export data functionality** with loading indicators
5. **Auto-refresh capability** through the `loadDashboardData()` function

### Key State Variables
```typescript
const [stats, setStats] = useState<DashboardStats | null>(null);
const [activities, setActivities] = useState<ActivityItem[]>([]);
const [loadingStats, setLoadingStats] = useState(true);
const [exporting, setExporting] = useState(false);
```

### Data Flow
```
Component Mount
    ↓
useEffect triggers
    ↓
loadDashboardData()
    ↓
Promise.all([fetchDashboardStats(), fetchRecentActivity()])
    ↓
API Routes (/api/dashboard/*)
    ↓
Database Operations (lib/database/dashboard-operations.ts)
    ↓
Supabase Queries
    ↓
Data returned to component
    ↓
UI updates with real data
```

---

## Error Handling

All API endpoints implement comprehensive error handling:

1. **Database Errors**: Caught and formatted using `DatabaseError` class
2. **Validation Errors**: Input validation before processing
3. **Network Errors**: Graceful fallbacks and error messages
4. **Missing Data**: Default values and mock data during development

### Example Error Response
```json
{
  "error": "Failed to fetch dashboard statistics",
  "details": "Database connection timeout"
}
```

---

## Performance Optimization

### Implemented Optimizations

1. **Parallel Queries**: Uses `Promise.all()` for concurrent data fetching
2. **Caching Strategy**: Consider implementing Redis/in-memory caching for frequently accessed stats
3. **Pagination**: Activity feed supports limit parameter
4. **Indexed Queries**: Database indexes on frequently queried columns
5. **Optimized Calculations**: Efficient SQL aggregations instead of application-level calculations

### Recommended Improvements

1. **Add Redis caching** for dashboard stats (TTL: 5 minutes)
2. **Implement WebSocket** for real-time activity updates
3. **Add query result caching** in database operations
4. **Implement server-side pagination** for large datasets
5. **Add data aggregation tables** for historical statistics

---

## Testing

### Manual Testing

1. **Test Statistics Endpoint**:
```bash
curl http://localhost:3000/api/dashboard/stats | jq
```

2. **Test Attendance Endpoint**:
```bash
curl "http://localhost:3000/api/dashboard/attendance?weeks=4" | jq
```

3. **Test Activity Endpoint**:
```bash
curl "http://localhost:3000/api/dashboard/activity?limit=5" | jq
```

4. **Test Export**:
```bash
curl "http://localhost:3000/api/dashboard/export?format=json" -o test-export.json
```

### Unit Testing (Future Implementation)

```typescript
describe('Dashboard API', () => {
  test('should fetch dashboard stats', async () => {
    const stats = await fetchDashboardStats();
    expect(stats.totalUsers.count).toBeGreaterThan(0);
    expect(stats.attendanceRate.rate).toBeGreaterThanOrEqual(0);
    expect(stats.attendanceRate.rate).toBeLessThanOrEqual(100);
  });
});
```

---

## Migration Steps

To implement this backend logic:

1. **Run Database Migrations**:
```bash
# Apply attendance_records table
psql -d your_database -f database/migrations/create_attendance_records_table.sql

# Apply medical_certificates table
psql -d your_database -f database/migrations/create_medical_certificates_table.sql
```

2. **Verify API Endpoints**: Test each endpoint manually or with automated tests

3. **Update Environment Variables**: Ensure Supabase connection is properly configured

4. **Deploy**: Deploy the updated backend to your hosting platform

---

## Troubleshooting

### Common Issues

**Issue**: TypeScript can't find module '@/lib/database/dashboard-operations'
**Solution**: Restart TypeScript server or run `npm run build` to regenerate types

**Issue**: Database table not found errors
**Solution**: Run the SQL migration files to create required tables

**Issue**: Stats returning 0 or mock data
**Solution**: This is expected if tables are empty. Add sample data or use the system to generate real data

**Issue**: CORS errors when calling API
**Solution**: Ensure API routes are called from the same origin or configure CORS headers

---

## Security Considerations

1. **Authentication Required**: All dashboard endpoints should verify user authentication
2. **Role-Based Access**: Only OFFICE role users should access these endpoints
3. **Rate Limiting**: Consider implementing rate limiting for export endpoints
4. **Data Sanitization**: All database queries use parameterized statements
5. **Sensitive Data**: Passwords are excluded from all responses

---

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live dashboard updates
2. **Advanced Analytics**: Add trend analysis and predictive analytics
3. **Custom Reports**: Allow users to generate custom reports
4. **Email Notifications**: Alert admins about critical metrics
5. **Mobile App Support**: Extend API for mobile application
6. **GraphQL Support**: Consider GraphQL for more flexible queries
7. **Audit Logging**: Track all data access and modifications
8. **Data Retention Policies**: Implement automated data archival

---

## Support

For issues or questions:
- Check the error logs in your browser console
- Review database connection settings
- Verify API routes are properly configured
- Check that all migrations have been applied

## License

This implementation is part of the University Attendance Management System.
