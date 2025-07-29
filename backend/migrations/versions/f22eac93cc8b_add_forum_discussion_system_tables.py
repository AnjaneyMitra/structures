"""Add forum discussion system tables

Revision ID: f22eac93cc8b
Revises: 40332adcbb7f
Create Date: 2025-07-29 13:34:10.520988

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f22eac93cc8b'
down_revision: Union[str, Sequence[str], None] = '40332adcbb7f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create forum_categories table
    op.create_table(
        'forum_categories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('order', sa.Integer(), nullable=True, default=0),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_forum_categories_id'), 'forum_categories', ['id'], unique=False)
    
    # Create forum_threads table
    op.create_table(
        'forum_threads',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('category_id', sa.Integer(), nullable=False),
        sa.Column('problem_id', sa.Integer(), nullable=True),
        sa.Column('author_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('is_pinned', sa.Boolean(), nullable=True, default=False),
        sa.Column('is_locked', sa.Boolean(), nullable=True, default=False),
        sa.Column('view_count', sa.Integer(), nullable=True, default=0),
        sa.Column('reply_count', sa.Integer(), nullable=True, default=0),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['author_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['category_id'], ['forum_categories.id'], ),
        sa.ForeignKeyConstraint(['problem_id'], ['problems.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_forum_threads_id'), 'forum_threads', ['id'], unique=False)
    
    # Create forum_replies table
    op.create_table(
        'forum_replies',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('thread_id', sa.Integer(), nullable=False),
        sa.Column('author_id', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('parent_id', sa.Integer(), nullable=True),
        sa.Column('is_solution', sa.Boolean(), nullable=True, default=False),
        sa.Column('upvotes', sa.Integer(), nullable=True, default=0),
        sa.Column('downvotes', sa.Integer(), nullable=True, default=0),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['author_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['parent_id'], ['forum_replies.id'], ),
        sa.ForeignKeyConstraint(['thread_id'], ['forum_threads.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_forum_replies_id'), 'forum_replies', ['id'], unique=False)
    
    # Create forum_votes table
    op.create_table(
        'forum_votes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('reply_id', sa.Integer(), nullable=False),
        sa.Column('vote_type', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['reply_id'], ['forum_replies.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'reply_id', name='unique_forum_vote')
    )
    op.create_index(op.f('ix_forum_votes_id'), 'forum_votes', ['id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    # Drop tables in reverse order
    op.drop_index(op.f('ix_forum_votes_id'), table_name='forum_votes')
    op.drop_table('forum_votes')
    op.drop_index(op.f('ix_forum_replies_id'), table_name='forum_replies')
    op.drop_table('forum_replies')
    op.drop_index(op.f('ix_forum_threads_id'), table_name='forum_threads')
    op.drop_table('forum_threads')
    op.drop_index(op.f('ix_forum_categories_id'), table_name='forum_categories')
    op.drop_table('forum_categories')
