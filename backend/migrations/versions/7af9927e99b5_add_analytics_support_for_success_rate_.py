"""add_analytics_support_for_success_rate_feature

Revision ID: 7af9927e99b5
Revises: 919ddaf70e77
Create Date: 2025-07-25 08:18:00.308879

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7af9927e99b5'
down_revision: Union[str, Sequence[str], None] = '919ddaf70e77'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Ensure all fields needed for analytics/success rate feature are properly set up."""
    
    # Ensure submissions table has overall_status field for success rate calculations
    # This field is crucial for determining if a submission passed or failed
    try:
        op.add_column('submissions', sa.Column('overall_status', sa.String(), nullable=True))
    except Exception:
        # Column might already exist
        pass
    
    # Ensure submissions table has xp_awarded field
    try:
        op.add_column('submissions', sa.Column('xp_awarded', sa.Integer(), nullable=False, server_default='0'))
    except Exception:
        # Column might already exist
        pass
    
    # Ensure problems table has tracking fields with proper defaults
    try:
        op.add_column('problems', sa.Column('view_count', sa.Integer(), nullable=False, server_default='0'))
    except Exception:
        # Column might already exist, ensure it has proper default
        pass
    
    try:
        op.add_column('problems', sa.Column('solve_count', sa.Integer(), nullable=False, server_default='0'))
    except Exception:
        # Column might already exist
        pass
    
    try:
        op.add_column('problems', sa.Column('attempt_count', sa.Integer(), nullable=False, server_default='0'))
    except Exception:
        # Column might already exist
        pass
    
    # Update any NULL values to 0 for existing records
    op.execute("UPDATE problems SET view_count = 0 WHERE view_count IS NULL")
    op.execute("UPDATE problems SET solve_count = 0 WHERE solve_count IS NULL")
    op.execute("UPDATE problems SET attempt_count = 0 WHERE attempt_count IS NULL")
    op.execute("UPDATE submissions SET xp_awarded = 0 WHERE xp_awarded IS NULL")
    
    # Create indexes for better performance on analytics queries
    try:
        op.create_index('idx_submissions_overall_status', 'submissions', ['overall_status'])
    except Exception:
        # Index might already exist
        pass
    
    try:
        op.create_index('idx_submissions_problem_user', 'submissions', ['problem_id', 'user_id'])
    except Exception:
        # Index might already exist
        pass
    
    try:
        op.create_index('idx_problems_difficulty', 'problems', ['difficulty'])
    except Exception:
        # Index might already exist
        pass


def downgrade() -> None:
    """Downgrade analytics support."""
    
    # Drop indexes
    try:
        op.drop_index('idx_submissions_overall_status', table_name='submissions')
    except Exception:
        pass
    
    try:
        op.drop_index('idx_submissions_problem_user', table_name='submissions')
    except Exception:
        pass
    
    try:
        op.drop_index('idx_problems_difficulty', table_name='problems')
    except Exception:
        pass
    
    # Note: We don't drop columns in downgrade to avoid data loss
    # The columns can remain as they don't hurt existing functionality
