"""Add challenges and challenge_results tables

Revision ID: db0eeae6fe88
Revises: 3facb9149237
Create Date: 2025-07-27 19:24:43.361837

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'db0eeae6fe88'
down_revision: Union[str, Sequence[str], None] = '3facb9149237'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create challenges table
    op.create_table(
        'challenges',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('challenger_id', sa.Integer(), nullable=False),
        sa.Column('challenged_id', sa.Integer(), nullable=False),
        sa.Column('problem_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(), nullable=False, server_default='pending'),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('time_limit', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('expires_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['challenger_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['challenged_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['problem_id'], ['problems.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create challenge_results table
    op.create_table(
        'challenge_results',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('challenge_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('submission_id', sa.Integer(), nullable=True),
        sa.Column('completion_time', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['challenge_id'], ['challenges.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['submission_id'], ['submissions.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for better performance
    op.create_index('idx_challenges_challenger', 'challenges', ['challenger_id'])
    op.create_index('idx_challenges_challenged', 'challenges', ['challenged_id'])
    op.create_index('idx_challenges_problem', 'challenges', ['problem_id'])
    op.create_index('idx_challenges_status', 'challenges', ['status'])
    op.create_index('idx_challenge_results_challenge', 'challenge_results', ['challenge_id'])
    op.create_index('idx_challenge_results_user', 'challenge_results', ['user_id'])


def downgrade() -> None:
    """Downgrade schema."""
    # Drop indexes
    op.drop_index('idx_challenge_results_user', 'challenge_results')
    op.drop_index('idx_challenge_results_challenge', 'challenge_results')
    op.drop_index('idx_challenges_status', 'challenges')
    op.drop_index('idx_challenges_problem', 'challenges')
    op.drop_index('idx_challenges_challenged', 'challenges')
    op.drop_index('idx_challenges_challenger', 'challenges')
    
    # Drop tables
    op.drop_table('challenge_results')
    op.drop_table('challenges')
