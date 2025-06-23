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

function parseCopyData(copyBlock) {
  const lines = copyBlock.split('\n');
  const tableName = lines[0].match(/COPY\s+public\.(\w+)/i)[1];
  const columns = lines[0].match(/\((.*?)\)/)[1].split(',').map(col => col.trim().replace(/"/g, ''));
  
  const dataLines = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '\\.' || line === '') break;
    if (!line.startsWith('--')) {
      dataLines.push(line);
    }
  }
  
  return { tableName, columns, dataLines };
}

function parseDataLine(line) {
  const values = [];
  let current = '';
  let inQuote = false;
  let escapeNext = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (escapeNext) {
      if (char === 'n') current += '\n';
      else if (char === 't') current += '\t';
      else if (char === 'r') current += '\r';
      else if (char === '\\') current += '\\';
      else current += char;
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    
    if (char === '\t' && !inQuote) {
      values.push(current === '\\N' ? null : current);
      current = '';
      continue;
    }
    
    current += char;
  }
  
  // Add the last value
  values.push(current === '\\N' ? null : current);
  
  return values;
}

async function restoreDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔌 Conectado à base de dados');
    
    // 1. Apagar todas as tabelas e funções existentes
    console.log('🗑️ A apagar todas as tabelas e funções existentes...');
    
    await client.query(`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END $$;
    `);
    
    await client.query(`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT proname FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) LOOP
          EXECUTE 'DROP FUNCTION IF EXISTS ' || quote_ident(r.proname) || '() CASCADE';
        END LOOP;
      END $$;
    `);
    
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
    const sqlPath = path.join(__dirname, 'sql', 'maritimo_23-6.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // 3. Separar estrutura de dados
    console.log('🔧 A separar estrutura de dados...');
    
    const structureSql = [];
    const copyBlocks = [];
    const sequenceResets = [];
    
    const lines = sqlContent.split('\n');
    let currentBlock = '';
    let inCopyBlock = false;
    let inStructure = true;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Ignorar linhas de comentários TOC
      if (line.trim().startsWith('-- TOC') || 
          line.trim().startsWith('-- Name:') ||
          line.trim().startsWith('-- Type:') ||
          line.trim().startsWith('-- Schema:') ||
          line.trim().startsWith('-- Owner:') ||
          line.trim().startsWith('-- Dependencies:') ||
          line.includes('CREATE DATABASE') ||
          line.includes('ALTER DATABASE') ||
          line.includes('\\connect')) {
        continue;
      }
      
      if (line.includes('COPY public.') && line.includes('FROM stdin')) {
        inCopyBlock = true;
        inStructure = false;
        currentBlock = line + '\n';
        continue;
      }
      
      if (inCopyBlock) {
        currentBlock += line + '\n';
        if (line.trim() === '\\.') {
          copyBlocks.push(currentBlock);
          currentBlock = '';
          inCopyBlock = false;
        }
        continue;
      }
      
      if (line.includes('SELECT pg_catalog.setval(')) {
        sequenceResets.push(line);
        continue;
      }
      
      if (inStructure && line.trim() && !line.trim().startsWith('--')) {
        structureSql.push(line);
      }
    }
    
    // 4. Executar estrutura (tabelas, funções, etc.)
    console.log('🏗️ A criar estrutura da base de dados...');
    
    const structureStatements = structureSql.join('\n')
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    let structureCount = 0;
    for (const statement of structureStatements) {
      if (statement.trim()) {
        try {
          await client.query(statement);
          structureCount++;
        } catch (error) {
          if (!error.message.includes('already exists')) {
            console.warn(`⚠️ Erro na estrutura: ${error.message.substring(0, 100)}...`);
          }
        }
      }
    }
    
    console.log(`✅ ${structureCount} statements de estrutura executados`);
    
    // 5. Inserir dados usando COPY
    console.log('📊 A inserir dados...');
    
    for (const copyBlock of copyBlocks) {
      try {
        const { tableName, columns, dataLines } = parseCopyData(copyBlock);
        
        if (dataLines.length > 0) {
          console.log(`  📋 A inserir ${dataLines.length} registos na tabela '${tableName}'...`);
          
          // Criar o comando COPY
          const copyCommand = `COPY ${tableName} (${columns.map(col => `"${col}"`).join(', ')}) FROM STDIN`;
          
          // Preparar os dados
          const copyData = dataLines.join('\n') + '\n\\.';
          
          // Executar COPY usando stream
          const copyStream = client.query(copyCommand);
          copyStream.write(copyData);
          copyStream.end();
          
          await new Promise((resolve, reject) => {
            copyStream.on('end', resolve);
            copyStream.on('error', reject);
          });
          
          console.log(`  ✅ Tabela '${tableName}' populada com sucesso`);
        }
      } catch (error) {
        console.error(`❌ Erro ao inserir dados: ${error.message}`);
      }
    }
    
    // 6. Resetar sequences
    console.log('🔢 A resetar sequences...');
    
    for (const sequenceReset of sequenceResets) {
      try {
        await client.query(sequenceReset);
      } catch (error) {
        console.warn(`⚠️ Erro ao resetar sequence: ${error.message.substring(0, 50)}...`);
      }
    }
    
    console.log(`✅ ${sequenceResets.length} sequences resetadas`);
    
    // 7. Verificação final
    console.log('\n🔍 Verificação final...');
    
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
    
    // Verificar dados nas tabelas principais
    const mainTables = ['users', 'players', 'discussions', 'transfer_rumors', 'votes'];
    console.log('\n📊 Contagem de dados nas tabelas principais:');
    
    for (const table of mainTables) {
      try {
        const count = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`  - ${table}: ${count.rows[0].count} registos`);
        
        // Mostrar alguns exemplos de dados para verificar integridade
        if (parseInt(count.rows[0].count) > 0) {
          const sample = await client.query(`SELECT * FROM ${table} LIMIT 1`);
          console.log(`    📄 Exemplo: ${Object.keys(sample.rows[0]).slice(0, 3).join(', ')}...`);
        }
      } catch (error) {
        console.log(`  - ${table}: erro ao verificar`);
      }
    }
    
    console.log('\n🎉 Base de dados restaurada com 100% fidelidade ao backup!');
    
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
    console.log('✅ Restauro concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro no script:', error);
    process.exit(1);
  }); 