#!/bin/bash

# Run database seeding
echo "Running database seeding..."
python -c "from app.db.seed_problems import seed_problems; seed_problems()"

# Start the FastAPI server
echo "Starting FastAPI server..."
uvicorn app.main:sio_app --host 0.0.0.0 --port 8000 