"""Ensure XP fields exist

Revision ID: a4e73afef3b3
Revises: add_xp_fields_001
Create Date: 2025-07-22 21:38:50.683275

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a4e73afef3b3'
down_revision: Union[str, Sequence[str], None] = 'add_xp_fields_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Ensure XP fields exist in database."""
    # This migration will definitely run since it's new
    # Use PostgreSQL-specific syntax for Railway's database
    op.execute("""
        DO $$ 
        BEGIN 
            -- Add total_xp to users if it doesn't exist
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'total_xp'
            ) THEN
                ALTER TABLE users ADD COLUMN total_xp INTEGER DEFAULT 0;
                RAISE NOTICE 'Added total_xp column to users table';
            ELSE
                RAISE NOTICE 'total_xp column already exists in users table';
            END IF;
            
            -- Add xp_awarded to submissions if it doesn't exist
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'submissions' AND column_name = 'xp_awarded'
            ) THEN
                ALTER TABLE submissions ADD COLUMN xp_awarded INTEGER DEFAULT 0;
                RAISE NOTICE 'Added xp_awarded column to submissions table';
            ELSE
                RAISE NOTICE 'xp_awarded column already exists in submissions table';
            END IF;
        END $$;
    """)
    
    # Always run these updates to ensure data consistency
    op.execute("UPDATE users SET total_xp = 0 WHERE total_xp IS NULL")
    op.execute("UPDATE submissions SET xp_awarded = 0 WHERE xp_awarded IS NULL")


def downgrade() -> None:
    """Downgrade schema."""
    pass
