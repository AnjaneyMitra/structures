"""add_global_leaderboards_system

Revision ID: 3facb9149237
Revises: 7a3dbbdeb512
Create Date: 2025-07-27 17:54:57.111335

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3facb9149237'
down_revision: Union[str, Sequence[str], None] = '7a3dbbdeb512'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create leaderboard_entries table
    op.create_table(
        'leaderboard_entries',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('leaderboard_type', sa.String(), nullable=False),
        sa.Column('score', sa.Integer(), nullable=False),
        sa.Column('rank', sa.Integer(), nullable=False),
        sa.Column('period_start', sa.DateTime(), nullable=True),
        sa.Column('period_end', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_leaderboard_entries_id'), 'leaderboard_entries', ['id'], unique=False)
    op.create_index('ix_leaderboard_type_rank', 'leaderboard_entries', ['leaderboard_type', 'rank'], unique=False)
    op.create_index('ix_user_leaderboard_type', 'leaderboard_entries', ['user_id', 'leaderboard_type'], unique=False)
    
    # Add rank columns to users table
    op.add_column('users', sa.Column('global_rank', sa.Integer(), nullable=True))
    op.add_column('users', sa.Column('weekly_rank', sa.Integer(), nullable=True))
    op.add_column('users', sa.Column('monthly_rank', sa.Integer(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    # Remove rank columns from users table
    op.drop_column('users', 'monthly_rank')
    op.drop_column('users', 'weekly_rank')
    op.drop_column('users', 'global_rank')
    
    # Drop leaderboard_entries table
    op.drop_index('ix_user_leaderboard_type', table_name='leaderboard_entries')
    op.drop_index('ix_leaderboard_type_rank', table_name='leaderboard_entries')
    op.drop_index(op.f('ix_leaderboard_entries_id'), table_name='leaderboard_entries')
    op.drop_table('leaderboard_entries')
