"""Add friendship system

Revision ID: 0f48a74cc1f2
Revises: a4e73afef3b3
Create Date: 2025-07-22 22:29:24.096823

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0f48a74cc1f2'
down_revision: Union[str, Sequence[str], None] = 'a4e73afef3b3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add friendship system tables."""
    # Create friendships table
    op.create_table('friendships',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('requester_id', sa.Integer(), nullable=False),
        sa.Column('addressee_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['addressee_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['requester_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('requester_id', 'addressee_id', name='unique_friendship')
    )
    op.create_index(op.f('ix_friendships_id'), 'friendships', ['id'], unique=False)


def downgrade() -> None:
    """Remove friendship system tables."""
    op.drop_index(op.f('ix_friendships_id'), table_name='friendships')
    op.drop_table('friendships')
