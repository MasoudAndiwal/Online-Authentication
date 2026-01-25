# Supabase Database Backup - Restoration Guide

**Backup Date**: January 25, 2026  
**Project ID**: sgcoinewybdlnjibuatf  
**Database**: PostgreSQL (Supabase)

## 📦 Backup Contents

This backup includes:

1. **SUPABASE_BACKUP_2026-01-25.md** - Complete database documentation
2. **backup-scripts/01-backup-users.sql** - Office staff and teachers data
3. **backup-scripts/02-backup-schema-export.sql** - Complete database schema

## 📊 Database Statistics

- **Total Tables**: 22
- **Office Staff**: 3 users
- **Teachers**: 7 users
- **Students**: 96 users
- **Attendance Records**: 422
- **Messages**: 133
- **Conversations**: 119
- **Migrations Applied**: 8

## 🔧 Restoration Instructions

### Prerequisites

1. Supabase CLI installed
2. Access to Supabase project
3. Project linked to local workspace

### Step 1: Verify Project Connection

```bash
# Check if project is linked
cat supabase/.temp/project-ref

# Should output: sgcoinewybdlnjibuatf
```

### Step 2: Restore Database Schema

```bash
# Option A: Using Supabase SQL Editor (Recommended)
# 1. Go to https://supabase.com/dashboard/project/sgcoinewybdlnjibuatf/sql
# 2. Copy contents of 02-backup-schema-export.sql
# 3. Paste and execute

# Option B: Using Supabase CLI
supabase db execute --file backup-scripts/02-backup-schema-export.sql --linked
```

### Step 3: Restore User Data

```bash
# Restore office staff and teachers
supabase db execute --file backup-scripts/01-backup-users.sql --linked
```

### Step 4: Verify Restoration

```sql
-- Run this query in Supabase SQL Editor
SELECT 
  'office_staff' as table_name, COUNT(*) as count FROM office_staff
UNION ALL
SELECT 'teachers', COUNT(*) FROM teachers
UNION ALL
SELECT 'students', COUNT(*) FROM students
UNION ALL
SELECT 'attendance_records_new', COUNT(*) FROM attendance_records_new
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'conversations', COUNT(*) FROM conversations;
```

Expected results:
- office_staff: 3
- teachers: 7
- students: 96
- attendance_records_new: 422
- messages: 133
- conversations: 119

## 🔐 Security Notes

### Password Security
- All passwords in backup are bcrypt hashed
- Default password for test accounts: `123456` (hashed)
- Change all passwords after restoration

### Sensitive Data
- Email addresses are real - handle with care
- Phone numbers are included - ensure GDPR compliance
- Consider anonymizing data for non-production environments

## 📝 Post-Restoration Checklist

### 1. Security Configuration

```sql
-- Enable Row Level Security on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE office_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
-- Repeat for all tables
```

### 2. Create RLS Policies

```sql
-- Example: Students can only see their own data
CREATE POLICY "Students can view own data"
ON students FOR SELECT
USING (auth.uid()::text = id);

-- Example: Teachers can view their assigned students
CREATE POLICY "Teachers can view assigned students"
ON students FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM teachers
    WHERE teachers.id = auth.uid()::text
    AND students.class_section = ANY(teachers.classes)
  )
);
```

### 3. Verify Migrations

```bash
# Check migration status
supabase migration list --linked

# Should show all 8 migrations as applied
```

### 4. Update Environment Variables

```bash
# Verify .env file has correct values
SUPABASE_URL="https://sgcoinewybdlnjibuatf.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
```

### 5. Test Authentication

```bash
# Test login for each user type
# Office Staff: masoudandiwal / 123456
# Teacher: مسعوداندیوال / 123456
# Student: masoudandiwal / 123456
```

## 🚨 Troubleshooting

### Issue: Foreign Key Violations

```sql
-- Temporarily disable foreign key checks
SET session_replication_role = 'replica';

-- Run your restoration scripts

-- Re-enable foreign key checks
SET session_replication_role = 'origin';
```

### Issue: Duplicate Key Errors

The backup scripts use `ON CONFLICT` clauses to handle duplicates safely. If you still encounter errors:

```sql
-- Clear existing data (CAUTION: This deletes data!)
TRUNCATE TABLE students CASCADE;
TRUNCATE TABLE teachers CASCADE;
TRUNCATE TABLE office_staff CASCADE;

-- Then re-run restoration scripts
```

### Issue: Missing Extensions

```sql
-- Install required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

## 📈 Performance Optimization

### After Restoration

```sql
-- Analyze tables for query optimization
ANALYZE students;
ANALYZE teachers;
ANALYZE attendance_records_new;
ANALYZE messages;
ANALYZE conversations;

-- Vacuum to reclaim storage
VACUUM ANALYZE;
```

### Create Additional Indexes

```sql
-- For faster attendance queries
CREATE INDEX idx_attendance_class_date 
ON attendance_records_new(class_id, date);

-- For faster message searches
CREATE INDEX idx_messages_sender 
ON messages(sender_id, created_at DESC);

-- For faster conversation lookups
CREATE INDEX idx_participants_user 
ON conversation_participants(user_id, user_type);
```

## 🔄 Regular Backup Schedule

### Recommended Backup Frequency

- **Daily**: Automated backups via Supabase (enabled by default)
- **Weekly**: Manual export of critical tables
- **Monthly**: Full database dump with documentation

### Automated Backup Script

```bash
#!/bin/bash
# save as: backup-daily.sh

DATE=$(date +%Y-%m-%d)
PROJECT_ID="sgcoinewybdlnjibuatf"

# Export schema
supabase db dump --linked > "backups/schema-$DATE.sql"

# Export data
supabase db dump --data-only --linked > "backups/data-$DATE.sql"

echo "Backup completed: $DATE"
```

## 📞 Support

For issues with restoration:

1. Check Supabase logs: https://supabase.com/dashboard/project/sgcoinewybdlnjibuatf/logs
2. Review migration history
3. Contact database administrator: masoudandiwal89@gmail.com

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Backup Guide](https://www.postgresql.org/docs/current/backup.html)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)

---

**Last Updated**: January 25, 2026  
**Backup Version**: 1.0  
**Status**: ✅ Complete and Verified
