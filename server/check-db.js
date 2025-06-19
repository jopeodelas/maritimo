const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: '123asd!',
  database: 'maritimo_voting',
  port: 5432
});

async function checkDB() {
  try {
    const result = await pool.query('SELECT * FROM match_voting WHERE is_active = true');
    console.log('Active voting:', result.rows[0]);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkDB(); 