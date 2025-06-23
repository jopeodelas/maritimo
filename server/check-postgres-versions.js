const { Pool } = require('pg');
require('dotenv').config();

const awsPool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const checkPostgreSQLSettings = async () => {
  const client = await awsPool.connect();
  
  try {
    console.log('🔍 AWS RDS PostgreSQL Information:\n');
    
    // Check PostgreSQL version
    const versionResult = await client.query('SELECT version()');
    console.log('📊 Version:', versionResult.rows[0].version);
    
    // Check specific settings related to GROUP BY
    const groupBySettings = await client.query(`
      SELECT name, setting, short_desc 
      FROM pg_settings 
      WHERE name IN (
        'sql_inheritance',
        'standard_conforming_strings',
        'transform_null_equals',
        'enable_groupagg',
        'enable_hashagg',
        'enable_sort'
      )
      ORDER BY name
    `);
    
    console.log('\n⚙️  GROUP BY related settings:');
    groupBySettings.rows.forEach(row => {
      console.log(`   ${row.name}: ${row.setting} - ${row.short_desc}`);
    });
    
    // Test the problematic query to see exact error
    console.log('\n🧪 Testing problematic query...');
    
    try {
      const testResult = await client.query(`
        SELECT p.*, COUNT(v.id) as vote_count
        FROM players p
        LEFT JOIN votes v ON p.id = v.player_id
        GROUP BY p.id
        ORDER BY vote_count DESC
        LIMIT 1
      `);
      console.log('✅ Original query works fine! No GROUP BY issues.');
      console.log('Result:', testResult.rows);
    } catch (queryError) {
      console.log('❌ Original query failed:');
      console.log('Error code:', queryError.code);
      console.log('Error message:', queryError.message);
      
      // Try the fixed version
      console.log('\n🔧 Testing fixed query...');
      try {
        const fixedResult = await client.query(`
          SELECT p.id, p.name, p.position, p.image_url, p.created_at, COUNT(v.id) as vote_count
          FROM players p
          LEFT JOIN votes v ON p.id = v.player_id
          GROUP BY p.id, p.name, p.position, p.image_url, p.created_at
          ORDER BY vote_count DESC
          LIMIT 1
        `);
        console.log('✅ Fixed query works!');
        console.log('Result:', fixedResult.rows);
      } catch (fixedError) {
        console.log('❌ Even fixed query failed:', fixedError.message);
      }
    }
    
    // Check if the issue is PostgreSQL version related
    console.log('\n📋 PostgreSQL version analysis:');
    const majorVersion = versionResult.rows[0].version.match(/PostgreSQL (\d+)/);
    if (majorVersion) {
      const version = parseInt(majorVersion[1]);
      console.log(`   Major version: ${version}`);
      
      if (version >= 9.1) {
        console.log('   ⚠️  PostgreSQL 9.1+ has stricter GROUP BY rules');
        console.log('   📝 This explains why the query worked locally but not on AWS');
        console.log('   💡 Solution: Specify all non-aggregate columns in GROUP BY');
      }
    }
    
    // Check current database configuration
    console.log('\n🗄️  Current database info:');
    const dbInfo = await client.query(`
      SELECT 
        current_database() as database_name,
        current_user as user_name,
        inet_server_addr() as server_ip,
        inet_server_port() as server_port
    `);
    console.log('Database info:', dbInfo.rows[0]);
    
  } catch (error) {
    console.error('❌ Error checking PostgreSQL settings:', error);
  } finally {
    client.release();
    awsPool.end();
  }
};

checkPostgreSQLSettings(); 