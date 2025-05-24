# Database Restore Instructions

## Option 1: Using pgAdmin
1. Open pgAdmin
2. Create a new database named `maritimo_voting`
3. Right-click on the database → "Restore..."
4. Select the `maritimo_voting_backup.sql` file
5. Click "Restore"

## Option 2: Using Command Line
```bash
# Create database first
createdb -U postgres maritimo_voting

# Restore from backup
psql -U postgres -d maritimo_voting -f database/maritimo_voting_backup.sql
```

## Environment Setup
Make sure your .env file has the correct database credentials:

DB_NAME=maritimo_voting
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432