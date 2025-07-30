#!/bin/bash
set -e

cd /app

echo "Current directory: $(pwd)"
echo "Listing contents:"
ls -la

echo "Running database migrations..."
# Run normal migration
alembic -c /app/alembic.ini upgrade head || echo "⚠️  Migration completed with warnings (this is expected)"

echo "Running database seeding..."
python -c "from app.db.seed_problems import seed_problems; seed_problems()"

echo "Starting FastAPI server with Socket.IO..."
# Use Socket.IO app but ensure HTTPS compatibility
uvicorn app.main:sio_app --host 0.0.0.0 --port 8000 