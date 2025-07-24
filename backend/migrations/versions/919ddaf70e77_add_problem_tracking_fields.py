"""add_problem_tracking_fields

Revision ID: 919ddaf70e77
Revises: streak_tracking_001
Create Date: 2025-07-24 22:32:46.402541

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '919ddaf70e77'
down_revision: Union[str, Sequence[str], None] = 'streak_tracking_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add tracking fields to problems table
    op.add_column('problems', sa.Column('view_count', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('problems', sa.Column('solve_count', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('problems', sa.Column('attempt_count', sa.Integer(), nullable=False, server_default='0'))


def downgrade() -> None:
    """Downgrade schema."""
    # Remove tracking fields from problems table
    op.drop_column('problems', 'attempt_count')
    op.drop_column('problems', 'solve_count')
    op.drop_column('problems', 'view_count')
