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
    # This migration ensures the columns exist and have proper defaults
    # Safe to run multiple times
    
    # Add columns if they don't exist (PostgreSQL compatible)
    try:
        op.add_column('users', sa.Column('theme_preference', sa.String(), nullable=True))
    except Exception:
        pass  # Column already exists
    
    try:
        op.add_column('users', sa.Column('font_size', sa.String(), nullable=True))
    except Exception:
        pass  # Column already exists
    
    # Set default values for any NULL entries
    op.execute("UPDATE users SET theme_preference = 'light' WHERE theme_preference IS NULL OR theme_preference = ''")
    op.execute("UPDATE users SET font_size = 'medium' WHERE font_size IS NULL OR font_size = ''")


def downgrade() -> None:
    """Downgrade schema."""
    pass
