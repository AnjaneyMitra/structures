#!/usr/bin/env python3
"""
Manual migration script for snippets table
Run this to apply the snippets migration to the production database
"""

import os
import sys
from alembic import command
from alembic.config import Config

def run_migration():
    """Run the snippets migration manually"""
    print("🚀 Running snippets migration manually...")
    
    # Get the alembic config
    alembic_cfg = Config("alembic.ini")
    
    try:
        # Check current migration status
        print("📋 Current migration status:")
        command.current(alembic_cfg)
        
        # Show available migrations
        print("📚 Available migrations:")
        command.history(alembic_cfg, verbose=True)
        
        # Apply all pending migrations
        print("⬆️ Applying pending migrations...")
        command.upgrade(alembic_cfg, "head")
        
        print("✅ Migration completed successfully!")
        
        # Show final status
        print("🔍 Final migration status:")
        command.current(alembic_cfg)
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_migration() 