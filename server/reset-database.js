const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuração da base de dados
const pool = new Pool({
  host: 'maritimo-voting-db.czkeww66q874.eu-west-3.rds.amazonaws.com',
  user: 'postgres',
  password: 'Aa04022003.',
  database: 'maritimo_voting',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

async function resetDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔌 Conectado à base de dados');
    
    // 1. Apagar todas as tabelas e funções existentes
    console.log('🗑️ A apagar todas as tabelas e funções existentes...');
    
    // Primeiro, apagar todas as foreign key constraints
    await client.query(`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END $$;
    `);
    
    // Apagar todas as funções
    await client.query(`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT proname, pronargs FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) LOOP
          EXECUTE 'DROP FUNCTION IF EXISTS ' || quote_ident(r.proname) || '() CASCADE';
        END LOOP;
      END $$;
    `);
    
    // Apagar todas as sequences
    await client.query(`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT sequencename FROM pg_sequences WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequencename) || ' CASCADE';
        END LOOP;
      END $$;
    `);
    
    console.log('✅ Todas as tabelas, funções e sequences foram apagadas');
    
    // 2. Ler e executar o ficheiro SQL
    console.log('📄 A ler o ficheiro SQL...');
    const sqlPath = path.join(__dirname, 'sql', 'maritimo_23-6.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Remover as linhas que criam a base de dados (já existe)
    const cleanSql = sqlContent
      .replace(/CREATE DATABASE.*?;/gi, '')
      .replace(/ALTER DATABASE.*?;/gi, '')
      .replace(/\\connect.*?;/gi, '')
      .replace(/-- Completed on.*$/gm, '')
      .replace(/-- PostgreSQL database dump complete.*$/gm, '');
    
    console.log('🔧 A executar o ficheiro SQL...');
    
    // Dividir por statements e executar um por um
    const statements = cleanSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    let successCount = 0;
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await client.query(statement);
          successCount++;
          if (successCount % 50 === 0) {
            console.log(`📈 Executados ${successCount} statements...`);
          }
        } catch (error) {
          // Ignorar erros de statements que já existem ou não são críticos
          if (!error.message.includes('already exists') && 
              !error.message.includes('does not exist') &&
              !error.message.includes('permission denied')) {
            console.warn(`⚠️ Erro ao executar statement: ${error.message}`);
          }
        }
      }
    }
    
    console.log(`✅ Ficheiro SQL executado com sucesso! (${successCount} statements executados)`);
    
    // 3. Verificar se as tabelas foram criadas
    console.log('🔍 A verificar as tabelas criadas...');
    const result = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    
    console.log('📋 Tabelas criadas:');
    result.rows.forEach(row => {
      console.log(`  - ${row.tablename}`);
    });
    
    console.log('🎉 Base de dados resetada com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao resetar a base de dados:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Executar o script
resetDatabase()
  .then(() => {
    console.log('✅ Script concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro no script:', error);
    process.exit(1);
  }); 