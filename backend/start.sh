#!/bin/bash
set -e  # Exit on error

echo "Current directory: $(pwd)"
echo "Listing contents:"
ls -la

# Run database seeding
echo "Running database seeding..."
python -c "
import sys
from app.db.seed_problems import seed_problems
try:
    seed_problems()
    print('Problems seeded successfully!')
except Exception as e:
    print(f'Error seeding problems: {e}', file=sys.stderr)
    sys.exit(1)
"

# Start the FastAPI server
echo "Starting FastAPI server..."
uvicorn app.main:sio_app --host 0.0.0.0 --port 8000 