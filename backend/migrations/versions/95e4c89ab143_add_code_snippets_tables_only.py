"""Add code snippets tables only

Revision ID: 95e4c89ab143
Revises: f22eac93cc8b
Create Date: 2025-07-29 17:17:20.221105

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '95e4c89ab143'
down_revision: Union[str, Sequence[str], None] = 'f22eac93cc8b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create code_snippets table
    op.create_table(
        'code_snippets',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('code', sa.Text(), nullable=False),
        sa.Column('language', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=True),
        sa.Column('is_public', sa.Boolean(), nullable=True, default=False),
        sa.Column('tags', sa.JSON(), nullable=True),
        sa.Column('usage_count', sa.Integer(), nullable=True, default=0),
        sa.Column('view_count', sa.Integer(), nullable=True, default=0),
        sa.Column('like_count', sa.Integer(), nullable=True, default=0),
        sa.Column('is_featured', sa.Boolean(), nullable=True, default=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_code_snippets_id'), 'code_snippets', ['id'], unique=False)
    
    # Create snippet_usage table
    op.create_table(
        'snippet_usage',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('snippet_id', sa.Integer(), nullable=False),
        sa.Column('used_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['snippet_id'], ['code_snippets.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_snippet_usage_id'), 'snippet_usage', ['id'], unique=False)
    
    # Create snippet_likes table
    op.create_table(
        'snippet_likes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('snippet_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['snippet_id'], ['code_snippets.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'snippet_id', name='unique_snippet_like')
    )
    op.create_index(op.f('ix_snippet_likes_id'), 'snippet_likes', ['id'], unique=False)
    
    # Create snippet_comments table
    op.create_table(
        'snippet_comments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('snippet_id', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['snippet_id'], ['code_snippets.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_snippet_comments_id'), 'snippet_comments', ['id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    # Drop tables in reverse order
    op.drop_index(op.f('ix_snippet_comments_id'), table_name='snippet_comments')
    op.drop_table('snippet_comments')
    op.drop_index(op.f('ix_snippet_likes_id'), table_name='snippet_likes')
    op.drop_table('snippet_likes')
    op.drop_index(op.f('ix_snippet_usage_id'), table_name='snippet_usage')
    op.drop_table('snippet_usage')
    op.drop_index(op.f('ix_code_snippets_id'), table_name='code_snippets')
    op.drop_table('code_snippets')
