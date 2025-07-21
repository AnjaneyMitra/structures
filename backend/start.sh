#!/bin/bash
set -e

cd /app

echo "Current directory: $(pwd)"
echo "Listing contents:"
ls -la

echo "Running database migrations..."
alembic upgrade head

echo "Running database seeding..."
python -c "from app.db.seed_problems import seed_problems; seed_problems()"

echo "Starting FastAPI server..."
uvicorn app.main:sio_app --host 0.0.0.0 --port 8000 