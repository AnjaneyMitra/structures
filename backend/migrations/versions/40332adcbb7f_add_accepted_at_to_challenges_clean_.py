"""Add accepted_at to challenges - clean version

Revision ID: 40332adcbb7f
Revises: db0eeae6fe88
Create Date: 2025-07-29 08:35:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text


# revision identifiers, used by Alembic.
revision: str = '40332adcbb7f'
down_revision: Union[str, Sequence[str], None] = 'db0eeae6fe88'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add the accepted_at column to challenges table
    op.add_column('challenges', sa.Column('accepted_at', sa.DateTime(), nullable=True))
    
    # Add index for better query performance
    op.create_index('idx_challenges_accepted_at', 'challenges', ['accepted_at'])
    
    # Data migration: For existing accepted challenges, set accepted_at to created_at
    # This is a reasonable default since we don't have the actual acceptance time
    connection = op.get_bind()
    connection.execute(
        text("UPDATE challenges SET accepted_at = created_at WHERE status = 'accepted' AND accepted_at IS NULL")
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Drop index first
    op.drop_index('idx_challenges_accepted_at', table_name='challenges')
    # Drop the column
    op.drop_column('challenges', 'accepted_at')