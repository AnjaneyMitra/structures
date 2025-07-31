#!/usr/bin/env python3
"""
Manual migration application script
This script will apply the snippets migration to fix the database schema issue
"""

import os
import sys
import subprocess
from pathlib import Path

def apply_migration():
    """Apply the snippets migration manually"""
    print("🚀 Applying snippets migration to fix database schema...")
    
    # Change to backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    try:
        # Check if alembic is available
        print("📋 Checking alembic availability...")
        result = subprocess.run(["python", "-m", "alembic", "--version"], 
                              capture_output=True, text=True)
        if result.returncode != 0:
            print("❌ Alembic not available. Installing...")
            subprocess.run(["pip", "install", "alembic"], check=True)
        
        # Check current migration status
        print("📋 Current migration status:")
        subprocess.run(["python", "-m", "alembic", "current"], check=True)
        
        # Show available migrations
        print("📚 Available migrations:")
        subprocess.run(["python", "-m", "alembic", "history", "--verbose"], check=True)
        
        # Apply all pending migrations
        print("⬆️ Applying pending migrations...")
        subprocess.run(["python", "-m", "alembic", "upgrade", "head"], check=True)
        
        print("✅ Migration completed successfully!")
        
        # Show final status
        print("🔍 Final migration status:")
        subprocess.run(["python", "-m", "alembic", "current"], check=True)
        
        print("🎉 Database schema should now be fixed!")
        print("📝 The code_snippets.category column should now exist.")
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Migration failed: {e}")
        print(f"Error output: {e.stderr}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    apply_migration() 