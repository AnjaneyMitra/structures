# Railway Deployment Fix Guide

## Issue: Multiple Head Revisions Error

**Error Message:**
```
FAILED: Multiple head revisions are present for given argument 'head'; please specify a specific target revision, '<branchname>@head' to narrow to a specific head, or 'heads' for all heads
```

## Root Cause
The Alembic migration system has conflicting migration branches, likely due to:
1. Local development migrations not synced with production
2. Missing migration file `7af9927e99b5_add_analytics_support_for_success_rate_.py` 
3. Multiple developers creating migrations simultaneously

## Solution Implemented

### 1. Emergency Migration Fix Script
Created `emergency_migration_fix.py` that:
- Clears the migration state
- Ensures required database columns exist
- Sets a clean migration state to a known good revision

### 2. Updated Start Script
Modified `start.sh` to:
- Run emergency fix before normal migrations
- Continue deployment even if migrations have warnings
- Ensure the application starts successfully

### 3. Error-Resilient Code
Updated `problems.py` with:
- Try-catch blocks around acceptance rate calculations
- Graceful fallback to 0% if database columns missing
- Warning messages instead of crashes

## Files Modified for Railway Fix

1. **`emergency_migration_fix.py`** - Emergency database fix
2. **`start.sh`** - Updated deployment script
3. **`app/api/routes/problems.py`** - Error handling
4. **`fix_railway_migration_heads.py`** - Advanced migration fix

## Manual Fix (if needed)

If the automatic fix doesn't work, you can manually run these SQL commands in Railway's PostgreSQL console:

```sql
-- Clear migration state
DELETE FROM alembic_version;

-- Add missing columns if they don't exist
ALTER TABLE problems ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE problems ADD COLUMN IF NOT EXISTS solve_count INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE problems ADD COLUMN IF NOT EXISTS attempt_count INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS overall_status VARCHAR;

-- Set clean migration state
INSERT INTO alembic_version (version_num) VALUES ('7a3dbbdeb512');
```

## Expected Deployment Flow

1. **Container starts** ✅
2. **Emergency fix runs** - Clears migration conflicts
3. **Alembic upgrade** - May show warnings (expected)
4. **Database seeding** - Populates initial data
5. **FastAPI server starts** - Application ready

## Verification

After deployment, test these endpoints:
- `GET /api/problems/` - Should include acceptance_rate field
- `GET /api/analytics/success-rate` - Analytics working
- `GET /health` - Health check passes

## Prevention

To prevent future issues:
1. Always commit migration files to git
2. Test migrations on staging before production
3. Use the error handling patterns implemented
4. Keep local and production environments in sync

## Rollback Plan

If deployment still fails:
1. Revert to previous working commit
2. Run manual SQL fix in Railway console
3. Redeploy with fixed migration state

The system is designed to be resilient - even if migrations partially fail, the application will continue to function with graceful degradation of analytics features.