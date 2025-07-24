"""Add streak tracking fields to users table

Revision ID: streak_tracking_001
Revises: a4e73afef3b3
Create Date: 2025-07-24 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text

# revision identifiers, used by Alembic.
revision = 'streak_tracking_001'
down_revision = 'a4e73afef3b3'
branch_labels = None
depends_on = None

def upgrade():
    """Add streak tracking fields to users table."""
    
    # Use standard Alembic operations for cross-database compatibility
    try:
        op.add_column('users', sa.Column('current_streak', sa.Integer(), nullable=True, default=0))
    except:
        pass  # Column might already exist
    
    try:
        op.add_column('users', sa.Column('longest_streak', sa.Integer(), nullable=True, default=0))
    except:
        pass  # Column might already exist
    
    try:
        op.add_column('users', sa.Column('last_solve_date', sa.DateTime(), nullable=True))
    except:
        pass  # Column might already exist
    
    # Update existing records to have 0 streak (safe to run multiple times)
    op.execute("UPDATE users SET current_streak = 0 WHERE current_streak IS NULL")
    op.execute("UPDATE users SET longest_streak = 0 WHERE longest_streak IS NULL")

def downgrade():
    """Remove streak tracking fields from users table."""
    op.drop_column('users', 'last_solve_date')
    op.drop_column('users', 'longest_streak')
    op.drop_column('users', 'current_streak')