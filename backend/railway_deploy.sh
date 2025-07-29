#!/bin/bash
# Railway Production Deployment Script
# This script follows the database migration guide for proper production deployment

echo "🚀 Starting Railway production deployment..."
echo "================================================"

# Step 1: Check current migration status
echo "📋 Checking current migration status..."
python3 -m alembic current

# Step 2: Show migration history
echo "📚 Available migrations:"
python3 -m alembic history --verbose

# Step 3: Apply all pending migrations
echo "⬆️ Applying pending migrations..."
python3 -m alembic upgrade head

if [ $? -eq 0 ]; then
    echo "✅ Migrations applied successfully!"
    
    # Step 4: Verify final migration state
    echo "🔍 Final migration status:"
    python3 -m alembic current
    
    # Step 5: Seed initial data if needed
    echo "🌱 Seeding initial data..."
    python3 init_production_db.py
    
    echo "🎉 Railway deployment completed successfully!"
    echo "✅ Your API endpoints should now be working:"
    echo "   - /api/forums/categories"
    echo "   - /api/snippets/public"
    echo "   - /api/snippets/languages/popular"
    echo "   - /api/snippets/categories"
    
else
    echo "❌ Migration failed!"
    echo "🔧 Troubleshooting steps:"
    echo "   1. Check database connection"
    echo "   2. Verify environment variables"
    echo "   3. Check migration files exist"
    echo "   4. Review Railway logs for detailed errors"
    exit 1
fi

echo "================================================"
echo "🏁 Deployment script completed!"