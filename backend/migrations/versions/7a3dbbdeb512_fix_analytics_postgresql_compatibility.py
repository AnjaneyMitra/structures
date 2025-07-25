"""fix_analytics_postgresql_compatibility

Revision ID: 7a3dbbdeb512
Revises: 919ddaf70e77
Create Date: 2025-07-25 18:53:30.972180

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7a3dbbdeb512'
down_revision: Union[str, Sequence[str], None] = '919ddaf70e77'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema for PostgreSQL compatibility."""
    # Check if columns exist before trying to add them
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    
    # Get existing columns for problems table
    existing_columns = [col['name'] for col in inspector.get_columns('problems')]
    
    # Add tracking columns if they don't exist
    if 'view_count' not in existing_columns:
        op.add_column('problems', sa.Column('view_count', sa.Integer(), nullable=False, server_default='0'))
    
    if 'solve_count' not in existing_columns:
        op.add_column('problems', sa.Column('solve_count', sa.Integer(), nullable=False, server_default='0'))
    
    if 'attempt_count' not in existing_columns:
        op.add_column('problems', sa.Column('attempt_count', sa.Integer(), nullable=False, server_default='0'))
    
    # Safely update any NULL values to 0 (PostgreSQL compatible)
    try:
        # Use COALESCE to handle NULL values safely
        op.execute("UPDATE problems SET view_count = COALESCE(view_count, 0)")
        op.execute("UPDATE problems SET solve_count = COALESCE(solve_count, 0)")  
        op.execute("UPDATE problems SET attempt_count = COALESCE(attempt_count, 0)")
    except Exception:
        # If update fails, it's likely the columns already have proper values
        pass
    
    # Ensure NOT NULL constraints are properly set
    try:
        op.alter_column('problems', 'view_count', nullable=False, server_default='0')
        op.alter_column('problems', 'solve_count', nullable=False, server_default='0')
        op.alter_column('problems', 'attempt_count', nullable=False, server_default='0')
    except Exception:
        # Constraints may already be set
        pass


def downgrade() -> None:
    """Downgrade schema."""
    # Only drop columns if they exist
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    existing_columns = [col['name'] for col in inspector.get_columns('problems')]
    
    if 'attempt_count' in existing_columns:
        op.drop_column('problems', 'attempt_count')
    if 'solve_count' in existing_columns:
        op.drop_column('problems', 'solve_count')
    if 'view_count' in existing_columns:
        op.drop_column('problems', 'view_count')
