# PostgreSQL Migration Fix Guide

## Problem
The production server has a migration file `7af9927e99b5_add_analytics_support_for_success_rate_.py` that doesn't exist in the local repository, causing migration failures.

## Solution Options

### Option 1: Quick Fix (Recommended for Production)

Run this script on the production server to fix the migration state:

```bash
cd backend
source venv/bin/activate  # or your virtual environment
python reset_migration_for_analytics.py
```

This script will:
- Check current database state
- Add missing analytics columns if needed
- Fix NULL values
- Reset migration state to a known good version
- Allow `alembic upgrade head` to work

### Option 2: Manual Database Fix

If you have direct database access, run these SQL commands:

```sql
-- Add missing columns if they don't exist
ALTER TABLE problems ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE problems ADD COLUMN IF NOT EXISTS solve_count INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE problems ADD COLUMN IF NOT EXISTS attempt_count INTEGER DEFAULT 0 NOT NULL;

-- Add missing column for submissions
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS overall_status VARCHAR;

-- Update any NULL values
UPDATE problems SET view_count = 0 WHERE view_count IS NULL;
UPDATE problems SET solve_count = 0 WHERE solve_count IS NULL;
UPDATE problems SET attempt_count = 0 WHERE attempt_count IS NULL;

-- Fix migration state
DELETE FROM alembic_version WHERE version_num = '7af9927e99b5';
DELETE FROM alembic_version;
INSERT INTO alembic_version (version_num) VALUES ('919ddaf70e77');
```

### Option 3: Complete Migration Reset

If the above doesn't work, you can reset the entire migration state:

```bash
# Backup your data first!
pg_dump your_database > backup.sql

# Drop alembic version table
psql -d your_database -c "DROP TABLE IF EXISTS alembic_version;"

# Run the fix script
python reset_migration_for_analytics.py

# Then run migrations
alembic upgrade head
```

## After Fixing

Once the migration issue is resolved, you can:

1. Run `alembic upgrade head` to apply the latest migrations
2. The analytics features will work properly
3. The problems page will show acceptance rates
4. The analytics API endpoints will be functional

## Error Handling

The updated code includes error handling for:
- Missing database columns
- Failed acceptance rate calculations
- Migration state issues

If analytics columns don't exist, the system will:
- Show 0% acceptance rates
- Log warnings instead of crashing
- Continue to function normally

## Files Modified

- `backend/app/api/routes/problems.py` - Added error handling
- `backend/app/api/routes/analytics.py` - Analytics endpoints
- `backend/migrations/versions/7a3dbbdeb512_fix_analytics_postgresql_compatibility.py` - Safe migration
- `backend/reset_migration_for_analytics.py` - Fix script

## Testing

After applying the fix, test these endpoints:
- `GET /api/problems/` - Should include acceptance_rate field
- `GET /api/analytics/success-rate` - Personal success rates
- `GET /api/analytics/global-success-rate` - Global success rates
- `GET /api/analytics/problem-acceptance-rates` - All problem rates

## Prevention

To prevent similar issues in the future:
1. Always commit migration files to version control
2. Test migrations on staging before production
3. Use the provided error handling patterns
4. Keep local and production environments in sync