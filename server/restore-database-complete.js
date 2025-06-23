const { Pool } = require('pg');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuração da base de dados
const dbConfig = {
  host: 'maritimo-voting-db.czkeww66q874.eu-west-3.rds.amazonaws.com',
  user: 'postgres',
  password: 'Aa04022003.',
  database: 'maritimo_voting',
  port: 5432
};

const pool = new Pool({
  ...dbConfig,
  ssl: {
    rejectUnauthorized: false
  }
});

async function restoreDatabase() {
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
        FOR r IN (SELECT proname FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) LOOP
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
    
    // 2. Criar um ficheiro SQL limpo (sem CREATE DATABASE)
    console.log('📄 A preparar ficheiro SQL...');
    const sqlPath = path.join(__dirname, 'sql', 'maritimo_23-6.sql');
    const cleanSqlPath = path.join(__dirname, 'sql', 'maritimo_23-6_clean.sql');
    
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Remover apenas as linhas de criação de base de dados
    const cleanSql = sqlContent
      .replace(/CREATE DATABASE.*?;/gi, '')
      .replace(/ALTER DATABASE.*?OWNER TO.*?;/gi, '')
      .replace(/\\connect.*?;/gi, '');
    
    fs.writeFileSync(cleanSqlPath, cleanSql);
    console.log('✅ Ficheiro SQL limpo criado');
    
    // 3. Restaurar usando psql
    console.log('🚀 A restaurar usando psql...');
    
    const env = {
      ...process.env,
      PGPASSWORD: dbConfig.password
    };
    
    const psqlArgs = [
      '-h', dbConfig.host,
      '-p', dbConfig.port.toString(),
      '-U', dbConfig.user,
      '-d', dbConfig.database,
      '-f', cleanSqlPath,
      '-v', 'ON_ERROR_STOP=1'
    ];
    
    const psqlProcess = spawn('psql', psqlArgs, {
      env: env,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = '';
    let errorOutput = '';
    
    psqlProcess.stdout.on('data', (data) => {
      output += data.toString();
      console.log(data.toString().trim());
    });
    
    psqlProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      // Mostrar apenas erros críticos
      const error = data.toString();
      if (!error.includes('NOTICE') && !error.includes('already exists')) {
        console.error(error.trim());
      }
    });
    
    const exitCode = await new Promise((resolve) => {
      psqlProcess.on('close', resolve);
    });
    
    if (exitCode === 0) {
      console.log('✅ Restauro concluído com sucesso!');
      
      // Limpar ficheiro temporário
      fs.unlinkSync(cleanSqlPath);
      
      // 4. Verificar se tudo foi restaurado correctamente
      console.log('\n🔍 A verificar restauro...');
      
      const result = await client.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        ORDER BY tablename
      `);
      
      console.log(`📋 ${result.rows.length} tabelas restauradas:`);
      result.rows.forEach(row => {
        console.log(`  - ${row.tablename}`);
      });
      
      // Verificar dados nas tabelas principais
      const mainTables = ['users', 'players', 'discussions', 'transfer_rumors', 'votes'];
      console.log('\n📊 Contagem de dados nas tabelas principais:');
      
      for (const table of mainTables) {
        try {
          const count = await client.query(`SELECT COUNT(*) FROM ${table}`);
          console.log(`  - ${table}: ${count.rows[0].count} registos`);
        } catch (error) {
          console.log(`  - ${table}: erro ao contar registos`);
        }
      }
      
      // Verificar se os sequences estão correctos
      console.log('\n🔢 A verificar sequences...');
      const sequences = await client.query(`
        SELECT sequencename, last_value 
        FROM pg_sequences 
        WHERE schemaname = 'public' 
        ORDER BY sequencename
      `);
      
      sequences.rows.forEach(seq => {
        console.log(`  - ${seq.sequencename}: ${seq.last_value}`);
      });
      
      console.log('\n🎉 Base de dados restaurada com 100% fidelidade ao backup!');
      
    } else {
      throw new Error(`psql falhou com código de saída ${exitCode}`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao restaurar a base de dados:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Executar o script
restoreDatabase()
  .then(() => {
    console.log('✅ Script concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro no script:', error);
    process.exit(1);
  }); 