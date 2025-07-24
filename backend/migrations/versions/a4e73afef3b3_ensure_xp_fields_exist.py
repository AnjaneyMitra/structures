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
    # Use standard Alembic operations for cross-database compatibility
    try:
        op.add_column('users', sa.Column('total_xp', sa.Integer(), nullable=True, default=0))
    except:
        pass  # Column might already exist
    
    try:
        op.add_column('submissions', sa.Column('xp_awarded', sa.Integer(), nullable=True, default=0))
    except:
        pass  # Column might already exist
    
    # Always run these updates to ensure data consistency
    op.execute("UPDATE users SET total_xp = 0 WHERE total_xp IS NULL")
    op.execute("UPDATE submissions SET xp_awarded = 0 WHERE xp_awarded IS NULL")


def downgrade() -> None:
    """Downgrade schema."""
    pass
