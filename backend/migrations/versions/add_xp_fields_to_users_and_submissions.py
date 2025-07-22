"""Add XP fields to users and submissions tables

Revision ID: add_xp_fields_001
Revises: f2255827e20d
Create Date: 2025-07-22 15:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_xp_fields_001'
down_revision: Union[str, Sequence[str], None] = 'f2255827e20d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add XP fields to users and submissions tables."""
    # Use raw SQL with IF NOT EXISTS to avoid duplicate column errors
    op.execute("""
        DO $$ 
        BEGIN 
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'total_xp'
            ) THEN
                ALTER TABLE users ADD COLUMN total_xp INTEGER DEFAULT 0;
            END IF;
        END $$;
    """)
    
    op.execute("""
        DO $$ 
        BEGIN 
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'submissions' AND column_name = 'xp_awarded'
            ) THEN
                ALTER TABLE submissions ADD COLUMN xp_awarded INTEGER DEFAULT 0;
            END IF;
        END $$;
    """)
    
    # Update existing records to have 0 XP (safe to run multiple times)
    op.execute("UPDATE users SET total_xp = 0 WHERE total_xp IS NULL")
    op.execute("UPDATE submissions SET xp_awarded = 0 WHERE xp_awarded IS NULL")


def downgrade() -> None:
    """Remove XP fields from users and submissions tables."""
    op.drop_column('submissions', 'xp_awarded')
    op.drop_column('users', 'total_xp')