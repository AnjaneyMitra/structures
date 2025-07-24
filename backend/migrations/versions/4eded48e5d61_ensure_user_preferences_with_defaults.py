"""ensure_user_preferences_with_defaults

Revision ID: 4eded48e5d61
Revises: 1e624225a14a
Create Date: 2025-07-24 09:01:13.674367

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4eded48e5d61'
down_revision: Union[str, Sequence[str], None] = '1e624225a14a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Ensure user preferences exist with proper defaults for production."""
    # Get database connection to check which database we're using
    connection = op.get_bind()
    
    # Check database type
    if connection.dialect.name == 'postgresql':
        # Use PostgreSQL-specific syntax
        op.execute("""
            DO $$ 
            BEGIN 
                -- Add theme_preference column if it doesn't exist
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'theme_preference'
                ) THEN
                    ALTER TABLE users ADD COLUMN theme_preference VARCHAR;
                END IF;
                
                -- Add font_size column if it doesn't exist
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'font_size'
                ) THEN
                    ALTER TABLE users ADD COLUMN font_size VARCHAR;
                END IF;
            END $$;
        """)
    else:
        # Use standard Alembic operations for SQLite and other databases
        try:
            op.add_column('users', sa.Column('theme_preference', sa.String(), nullable=True))
        except Exception:
            pass  # Column might already exist
        
        try:
            op.add_column('users', sa.Column('font_size', sa.String(), nullable=True))
        except Exception:
            pass  # Column might already exist
    
    # Always run these updates to ensure data consistency (works for all databases)
    op.execute("UPDATE users SET theme_preference = 'light' WHERE theme_preference IS NULL")
    op.execute("UPDATE users SET font_size = 'medium' WHERE font_size IS NULL")


def downgrade() -> None:
    """Downgrade schema."""
    pass
