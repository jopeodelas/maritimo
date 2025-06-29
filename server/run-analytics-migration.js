const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configurações do banco de dados
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

async function runAnalyticsMigration() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('🚀 Connecting to database...');
    await pool.connect();
    console.log('✅ Connected to database');
    
    // Ler o arquivo de migração
    const migrationPath = path.join(__dirname, 'database/migrations/create_analytics_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Executing analytics migration...');
    await pool.query(migrationSQL);
    console.log('✅ Analytics migration completed successfully!');
    
    // Verificar se as tabelas foram criadas
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('analytics_events', 'user_sessions', 'page_performance')
      ORDER BY table_name;
    `);
    
    console.log('📋 Created tables:');
    tableCheck.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('🔚 Database connection closed');
  }
}

runAnalyticsMigration(); 