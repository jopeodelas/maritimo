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

function cleanSqlContent(sqlContent) {
  // Remover comentários TOC e linhas desnecessárias
  const lines = sqlContent.split('\n');
  const cleanLines = [];
  let inComment = false;
  let inMultiLineComment = false;
  
  for (let line of lines) {
    const trimmedLine = line.trim();
    
    // Ignorar linhas vazias
    if (!trimmedLine) {
      cleanLines.push('');
      continue;
    }
    
    // Ignorar comentários TOC específicos
    if (trimmedLine.startsWith('-- TOC entry') || 
        trimmedLine.startsWith('-- Name:') || 
        trimmedLine.startsWith('-- Type:') ||
        trimmedLine.startsWith('-- Schema:') ||
        trimmedLine.startsWith('-- Owner:') ||
        trimmedLine.startsWith('-- Dependencies:') ||
        trimmedLine.startsWith('-- Dumped from') ||
        trimmedLine.startsWith('-- Dumped by') ||
        trimmedLine.startsWith('-- Started on') ||
        trimmedLine.startsWith('-- Completed on') ||
        trimmedLine.includes('PostgreSQL database dump') ||
        trimmedLine.includes('CREATE DATABASE') ||
        trimmedLine.includes('ALTER DATABASE') ||
        trimmedLine.includes('\\connect')) {
      continue;
    }
    
    // Ignorar comentários simples
    if (trimmedLine.startsWith('--')) {
      continue;
    }
    
    cleanLines.push(line);
  }
  
  return cleanLines.join('\n');
}

function splitSqlStatements(sqlContent) {
  const statements = [];
  let currentStatement = '';
  let inQuote = false;
  let inDollarQuote = false;
  let dollarTag = '';
  
  for (let i = 0; i < sqlContent.length; i++) {
    const char = sqlContent[i];
    const nextChar = sqlContent[i + 1];
    
    // Handle dollar quoting
    if (char === '$' && !inQuote) {
      let tagEnd = sqlContent.indexOf('$', i + 1);
      if (tagEnd !== -1) {
        let tag = sqlContent.substring(i, tagEnd + 1);
        if (inDollarQuote && tag === dollarTag) {
          inDollarQuote = false;
          dollarTag = '';
        } else if (!inDollarQuote) {
          inDollarQuote = true;
          dollarTag = tag;
        }
        currentStatement += tag;
        i = tagEnd;
        continue;
      }
    }
    
    // Handle regular quotes
    if (char === "'" && !inDollarQuote) {
      inQuote = !inQuote;
    }
    
    currentStatement += char;
    
    // Check for statement end
    if (char === ';' && !inQuote && !inDollarQuote) {
      const statement = currentStatement.trim();
      if (statement && statement !== ';') {
        statements.push(statement);
      }
      currentStatement = '';
    }
  }
  
  // Add the last statement if it exists
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }
  
  return statements;
}

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
    
    // 2. Ler e processar o ficheiro SQL
    console.log('📄 A ler o ficheiro SQL...');
    const sqlPath = path.join(__dirname, 'sql', 'maritimo_backup_perfeito.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('🔧 A processar o ficheiro SQL...');
    const cleanSql = cleanSqlContent(sqlContent);
    const statements = splitSqlStatements(cleanSql);
    
    console.log(`📊 ${statements.length} statements encontrados para executar`);
    
    // 3. Executar statements
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.trim()) {
        try {
          await client.query(statement);
          successCount++;
          
          if (successCount % 50 === 0) {
            console.log(`📈 Executados ${successCount}/${statements.length} statements...`);
          }
        } catch (error) {
          errorCount++;
          
          // Só mostrar erros críticos
          if (!error.message.includes('already exists') && 
              !error.message.includes('does not exist') &&
              !error.message.includes('permission denied') &&
              !error.message.includes('relation') &&
              errorCount <= 10) {
            console.warn(`⚠️ Erro no statement ${i + 1}: ${error.message}`);
          }
        }
      }
    }
    
    console.log(`✅ Processamento concluído: ${successCount} sucesso, ${errorCount} erros`);
    
    // 4. Verificar se as tabelas foram criadas
    console.log('🔍 A verificar as tabelas criadas...');
    const result = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    
    console.log(`📋 ${result.rows.length} tabelas criadas:`);
    result.rows.forEach(row => {
      console.log(`  - ${row.tablename}`);
    });
    
    // 5. Verificar se há dados nas tabelas principais
    console.log('🔍 A verificar dados nas tabelas principais...');
    const tablesWithData = ['users', 'players', 'discussions', 'transfer_rumors'];
    
    for (const table of tablesWithData) {
      try {
        const countResult = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`  - ${table}: ${countResult.rows[0].count} registos`);
      } catch (error) {
        console.log(`  - ${table}: tabela não encontrada ou vazia`);
      }
    }
    
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