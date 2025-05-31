const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'maritimo_voting',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
};

async function runMigration() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, '..', 'database', 'add_poll_table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('Running migration...');
    await client.query(sql);
    
    console.log('Migration completed successfully!');
    client.release();
  } catch (error) {
    console.error('Error running migration:', error);
  } finally {
    await pool.end();
  }
}

runMigration(); 