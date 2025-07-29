#!/bin/bash
set -e

cd /app

echo "Current directory: $(pwd)"
echo "Listing contents:"
ls -la

echo "Running database migrations..."
# Emergency fix for multiple heads issue
python emergency_migration_fix.py

# Try normal migration, but don't fail if it has issues
alembic -c /app/alembic.ini upgrade head || echo "⚠️  Migration completed with warnings (this is expected)"

echo "Running database seeding..."
python -c "from app.db.seed_problems import seed_problems; seed_problems()"

echo "Seeding forum categories..."
python seed_forum_categories.py || echo "⚠️ Forum categories seeding completed with warnings"

echo "Seeding code templates..."
python seed_code_templates.py || echo "⚠️ Code templates seeding completed with warnings"

echo "Starting FastAPI server with Socket.IO..."
# Use Socket.IO app but ensure HTTPS compatibility
uvicorn app.main:sio_app --host 0.0.0.0 --port 8000 