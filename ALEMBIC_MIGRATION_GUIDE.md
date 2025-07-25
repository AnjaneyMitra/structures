# Alembic Migration Guide

A comprehensive guide for managing database migrations with Alembic in our FastAPI project.

## Table of Contents
1. [Basic Concepts](#basic-concepts)
2. [Setting Up Alembic](#setting-up-alembic)
3. [Creating Migrations](#creating-migrations)
4. [Common Migration Patterns](#common-migration-patterns)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)
7. [Production Deployment](#production-deployment)

## Basic Concepts

### What is Alembic?
Alembic is a database migration tool for SQLAlchemy. It allows you to:
- Track database schema changes over time
- Apply changes incrementally
- Rollback changes if needed
- Keep development and production databases in sync

### Key Terms
- **Migration**: A script that describes how to change the database schema
- **Revision**: A unique identifier for each migration
- **Head**: The latest migration in a branch
- **Upgrade**: Apply migrations to move forward
- **Downgrade**: Reverse migrations to move backward

## Setting Up Alembic

### Initial Setup (Already Done)
```bash
# Initialize Alembic (only done once)
alembic init migrations

# Configure alembic.ini and env.py
# Point to your database URL and models
```

### Project Structure
```
backend/
├── alembic.ini              # Alembic configuration
├── migrations/
│   ├── env.py              # Migration environment
│   ├── script.py.mako      # Migration template
│   └── versions/           # Migration files
│       ├── 001_initial.py
│       ├── 002_add_users.py
│       └── ...
└── app/
    └── db/
        └── models.py       # SQLAlchemy models
```

## Creating Migrations

### Step 1: Modify Your Models
First, update your SQLAlchemy models in `app/db/models.py`:

```python
# Example: Adding a new column
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, nullable=False)
    email = Column(String, nullable=True)  # NEW COLUMN
    created_at = Column(DateTime, default=datetime.utcnow)  # NEW COLUMN
```

### Step 2: Generate Migration
```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
source ../backend_venv/bin/activate

# Generate migration automatically (recommended)
alembic revision --autogenerate -m "add_email_and_created_at_to_users"

# Or create empty migration manually
alembic revision -m "add_email_and_created_at_to_users"
```

### Step 3: Review Generated Migration
Check the generated file in `migrations/versions/`:

```python
"""add_email_and_created_at_to_users

Revision ID: abc123def456
Revises: previous_revision_id
Create Date: 2025-01-15 10:30:00.123456
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision: str = 'abc123def456'
down_revision: Union[str, Sequence[str], None] = 'previous_revision_id'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    """Upgrade database schema."""
    op.add_column('users', sa.Column('email', sa.String(), nullable=True))
    op.add_column('users', sa.Column('created_at', sa.DateTime(), nullable=True))

def downgrade() -> None:
    """Downgrade database schema."""
    op.drop_column('users', 'created_at')
    op.drop_column('users', 'email')
```

### Step 4: Apply Migration
```bash
# Apply migration to database
alembic upgrade head

# Or apply specific revision
alembic upgrade abc123def456
```

## Common Migration Patterns

### Adding a New Table
```python
def upgrade() -> None:
    op.create_table(
        'posts',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id')),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now())
    )
    op.create_index('ix_posts_user_id', 'posts', ['user_id'])

def downgrade() -> None:
    op.drop_index('ix_posts_user_id', 'posts')
    op.drop_table('posts')
```

### Adding a Column with Default Value
```python
def upgrade() -> None:
    # Add column with default
    op.add_column('users', sa.Column('status', sa.String(20), nullable=False, server_default='active'))
    
    # Update existing rows (if needed)
    op.execute("UPDATE users SET status = 'active' WHERE status IS NULL")

def downgrade() -> None:
    op.drop_column('users', 'status')
```

### Adding Foreign Key Constraint
```python
def upgrade() -> None:
    op.add_column('posts', sa.Column('category_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_posts_category', 'posts', 'categories', ['category_id'], ['id'])

def downgrade() -> None:
    op.drop_constraint('fk_posts_category', 'posts', type_='foreignkey')
    op.drop_column('posts', 'category_id')
```

### Renaming a Column
```python
def upgrade() -> None:
    op.alter_column('users', 'username', new_column_name='user_name')

def downgrade() -> None:
    op.alter_column('users', 'user_name', new_column_name='username')
```

### Adding Index
```python
def upgrade() -> None:
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

def downgrade() -> None:
    op.drop_index('ix_users_email', 'users')
```

### Data Migration
```python
def upgrade() -> None:
    # Schema change
    op.add_column('users', sa.Column('full_name', sa.String(200), nullable=True))
    
    # Data migration
    connection = op.get_bind()
    connection.execute(
        "UPDATE users SET full_name = first_name || ' ' || last_name WHERE first_name IS NOT NULL AND last_name IS NOT NULL"
    )

def downgrade() -> None:
    op.drop_column('users', 'full_name')
```

## Best Practices

### 1. Always Review Generated Migrations
- Check that autogenerated migrations are correct
- Add data migrations if needed
- Test both upgrade and downgrade functions

### 2. Use Descriptive Migration Names
```bash
# Good
alembic revision -m "add_user_email_verification_system"
alembic revision -m "create_posts_table_with_categories"

# Bad
alembic revision -m "update_db"
alembic revision -m "fix_stuff"
```

### 3. Handle Nullable Columns Carefully
```python
# When adding NOT NULL column to existing table
def upgrade() -> None:
    # Step 1: Add nullable column
    op.add_column('users', sa.Column('email', sa.String(), nullable=True))
    
    # Step 2: Populate data
    op.execute("UPDATE users SET email = username || '@example.com' WHERE email IS NULL")
    
    # Step 3: Make it NOT NULL
    op.alter_column('users', 'email', nullable=False)
```

### 4. Use Transactions for Complex Migrations
```python
def upgrade() -> None:
    # Alembic automatically wraps in transaction, but you can be explicit
    connection = op.get_bind()
    trans = connection.begin()
    try:
        op.add_column('users', sa.Column('temp_field', sa.String()))
        connection.execute("UPDATE users SET temp_field = 'default'")
        op.alter_column('users', 'temp_field', nullable=False)
        trans.commit()
    except:
        trans.rollback()
        raise
```

### 5. Test Migrations
```bash
# Test upgrade
alembic upgrade head

# Test downgrade
alembic downgrade -1

# Test upgrade again
alembic upgrade head
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Multiple Head Revisions
**Error:** `Multiple head revisions are present`

**Solution:**
```bash
# Check current heads
alembic heads

# Create merge revision
alembic merge -m "merge_heads" head1_id head2_id

# Or use our emergency fix
python emergency_migration_fix.py
```

#### 2. Migration Out of Sync
**Error:** `Can't locate revision identified by 'xyz'`

**Solution:**
```bash
# Check current revision
alembic current

# Stamp to correct revision (if you know the database state)
alembic stamp head

# Or clear and re-stamp
python emergency_migration_fix.py
```

#### 3. Column Already Exists
**Error:** `column "xyz" of relation "table" already exists`

**Solution:**
```python
def upgrade() -> None:
    # Check if column exists before adding
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    columns = [col['name'] for col in inspector.get_columns('table_name')]
    
    if 'column_name' not in columns:
        op.add_column('table_name', sa.Column('column_name', sa.String()))
```

#### 4. Foreign Key Constraint Issues
**Solution:**
```python
def upgrade() -> None:
    # Drop constraint first, then recreate
    op.drop_constraint('constraint_name', 'table_name', type_='foreignkey')
    op.create_foreign_key('new_constraint_name', 'table_name', 'referenced_table', ['column'], ['id'])
```

## Production Deployment

### Safe Deployment Process

#### 1. Development
```bash
# Create and test migration locally
alembic revision --autogenerate -m "description"
alembic upgrade head
# Test your application
alembic downgrade -1  # Test rollback
alembic upgrade head  # Test upgrade again
```

#### 2. Staging
```bash
# Deploy to staging environment
# Run migration
alembic upgrade head
# Test application thoroughly
```

#### 3. Production
```bash
# Backup database first!
pg_dump your_database > backup_$(date +%Y%m%d_%H%M%S).sql

# Run migration
alembic upgrade head

# Verify application works
# Monitor for issues
```

### Railway Deployment
Our project includes automatic migration handling:

```bash
# start.sh automatically runs:
python emergency_migration_fix.py  # Fix any conflicts
alembic upgrade head               # Apply migrations
```

### Rollback Plan
```bash
# If something goes wrong, rollback
alembic downgrade previous_revision_id

# Or restore from backup
psql your_database < backup_file.sql
```

## Useful Commands

### Information Commands
```bash
# Show current revision
alembic current

# Show all revisions
alembic history

# Show head revisions
alembic heads

# Show specific revision info
alembic show revision_id
```

### Migration Commands
```bash
# Create new migration
alembic revision -m "description"
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head
alembic upgrade +1
alembic upgrade revision_id

# Rollback migrations
alembic downgrade -1
alembic downgrade revision_id
alembic downgrade base  # Rollback everything
```

### Maintenance Commands
```bash
# Stamp database to specific revision (without running migration)
alembic stamp revision_id

# Merge multiple heads
alembic merge -m "merge_description" head1 head2

# Generate SQL instead of applying
alembic upgrade head --sql
```

## Emergency Procedures

### If Migrations Are Completely Broken
1. **Backup your data**
2. **Run emergency fix:**
   ```bash
   python emergency_migration_fix.py
   ```
3. **Manually verify database schema**
4. **Stamp to correct revision:**
   ```bash
   alembic stamp head
   ```

### If You Need to Skip a Migration
```bash
# Mark migration as applied without running it
alembic stamp revision_id
```

### If You Need to Reset Everything
```bash
# Clear all migration history
DELETE FROM alembic_version;

# Stamp to current state
alembic stamp head
```

## Conclusion

Following this guide will help you:
- Create safe, reliable database migrations
- Avoid common pitfalls
- Handle production deployments confidently
- Troubleshoot issues when they arise

Remember: **Always backup your production database before running migrations!**

For our specific project, the emergency fix scripts handle most common issues automatically, but understanding these fundamentals will help you create better migrations and debug issues when they occur.