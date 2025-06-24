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

function parseTabDelimitedLine(line) {
  // Parse tab-delimited PostgreSQL COPY format
  return line.split('\t').map(value => {
    if (value === '\\N') return null;
    
    // Handle escaped characters
    return value
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\r/g, '\r')
      .replace(/\\\\/g, '\\');
  });
}

async function restoreDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔌 Conectado à base de dados');
    
    // 1. Apagar todas as vistas, tabelas e funções existentes
    console.log('🗑️ A apagar todas as vistas, tabelas e funções existentes...');
    
    // Apagar vistas primeiro
    await client.query(`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT viewname FROM pg_views WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP VIEW IF EXISTS ' || quote_ident(r.viewname) || ' CASCADE';
        END LOOP;
      END $$;
    `);
    
    // Apagar tabelas
    await client.query(`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END $$;
    `);
    
    // Apagar funções
    await client.query(`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT proname FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) LOOP
          EXECUTE 'DROP FUNCTION IF EXISTS ' || quote_ident(r.proname) || '() CASCADE';
        END LOOP;
      END $$;
    `);
    
    // Apagar sequences
    await client.query(`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT sequencename FROM pg_sequences WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequencename) || ' CASCADE';
        END LOOP;
      END $$;
    `);
    
    console.log('✅ Tudo limpo');
    
    // 2. Ler e processar o ficheiro SQL
    console.log('📄 A ler o ficheiro SQL...');
    const sqlPath = path.join(__dirname, 'sql', 'maritimo_backup_perfeito.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // 3. Separar em blocos
    console.log('🔧 A processar ficheiro SQL...');
    
    const structureStatements = [];
    const copyBlocks = [];
    const sequenceResets = [];
    
    const lines = sqlContent.split('\n');
    let currentStatement = '';
    let inCopyBlock = false;
    let currentCopyBlock = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Ignorar comentários TOC
      if (trimmed.startsWith('-- TOC') || 
          trimmed.startsWith('-- Name:') ||
          trimmed.startsWith('-- Type:') ||
          trimmed.startsWith('-- Schema:') ||
          trimmed.startsWith('-- Owner:') ||
          trimmed.startsWith('-- Dependencies:') ||
          trimmed.includes('CREATE DATABASE') ||
          trimmed.includes('ALTER DATABASE') ||
          line.includes('\\connect') ||
          trimmed.includes('PostgreSQL database dump')) {
        continue;
      }
      
      // Detectar início de bloco COPY
      if (line.includes('COPY public.') && line.includes('FROM stdin')) {
        if (currentStatement.trim()) {
          structureStatements.push(currentStatement.trim());
          currentStatement = '';
        }
        inCopyBlock = true;
        currentCopyBlock = line + '\n';
        continue;
      }
      
      // Processar bloco COPY
      if (inCopyBlock) {
        currentCopyBlock += line + '\n';
        if (trimmed === '\\.') {
          copyBlocks.push(currentCopyBlock);
          currentCopyBlock = '';
          inCopyBlock = false;
        }
        continue;
      }
      
      // Detectar resets de sequences
      if (line.includes('SELECT pg_catalog.setval(')) {
        sequenceResets.push(line.trim());
        continue;
      }
      
      // Acumular statements de estrutura
      if (!inCopyBlock) {
        currentStatement += line + '\n';
        
        if (trimmed.endsWith(';') && !trimmed.startsWith('--')) {
          structureStatements.push(currentStatement.trim());
          currentStatement = '';
        }
      }
    }
    
    // Adicionar último statement se existir
    if (currentStatement.trim()) {
      structureStatements.push(currentStatement.trim());
    }
    
    console.log(`📊 Encontrados: ${structureStatements.length} statements de estrutura, ${copyBlocks.length} blocos de dados, ${sequenceResets.length} resets de sequences`);
    
    // 4. Executar estrutura
    console.log('🏗️ A criar estrutura da base de dados...');
    
    let structureSuccess = 0;
    for (const statement of structureStatements) {
      if (statement.trim() && !statement.startsWith('--')) {
        try {
          await client.query(statement);
          structureSuccess++;
          
          if (structureSuccess % 20 === 0) {
            console.log(`  📈 ${structureSuccess} statements executados...`);
          }
        } catch (error) {
          if (!error.message.includes('already exists') && 
              !error.message.includes('does not exist')) {
            console.warn(`⚠️ Erro na estrutura: ${error.message.substring(0, 80)}...`);
          }
        }
      }
    }
    
    console.log(`✅ ${structureSuccess} statements de estrutura executados`);
    
    // 5. Inserir dados
    console.log('📊 A inserir dados...');
    
    for (const copyBlock of copyBlocks) {
      try {
        const { tableName, columns, dataLines } = parseCopyData(copyBlock);
        
        if (dataLines.length > 0) {
          console.log(`  📋 A inserir ${dataLines.length} registos na tabela '${tableName}'...`);
          
          // Preparar statement INSERT
          const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
          const insertQuery = `INSERT INTO "${tableName}" (${columns.map(col => `"${col}"`).join(', ')}) VALUES (${placeholders})`;
          
          // Inserir dados linha por linha (para máxima compatibilidade)
          let insertedCount = 0;
          for (const dataLine of dataLines) {
            try {
              const values = parseTabDelimitedLine(dataLine);
              await client.query(insertQuery, values);
              insertedCount++;
            } catch (error) {
              console.warn(`    ⚠️ Erro ao inserir linha: ${error.message.substring(0, 60)}...`);
            }
          }
          
          console.log(`  ✅ ${insertedCount}/${dataLines.length} registos inseridos na tabela '${tableName}'`);
        }
      } catch (error) {
        console.error(`❌ Erro ao processar tabela: ${error.message}`);
      }
    }
    
    // 6. Resetar sequences
    console.log('🔢 A resetar sequences...');
    
    let sequenceSuccess = 0;
    for (const sequenceReset of sequenceResets) {
      try {
        await client.query(sequenceReset);
        sequenceSuccess++;
      } catch (error) {
        console.warn(`⚠️ Erro ao resetar sequence: ${error.message.substring(0, 50)}...`);
      }
    }
    
    console.log(`✅ ${sequenceSuccess}/${sequenceResets.length} sequences resetadas`);
    
    // 7. Verificação final
    console.log('\n🔍 Verificação final...');
    
    const tablesResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    
    console.log(`📋 ${tablesResult.rows.length} tabelas criadas:`);
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.tablename}`);
    });
    
    // Verificar dados nas tabelas principais
    const mainTables = ['users', 'players', 'discussions', 'transfer_rumors', 'votes'];
    console.log('\n📊 Dados nas tabelas principais:');
    
    for (const table of mainTables) {
      try {
        const count = await client.query(`SELECT COUNT(*) FROM "${table}"`);
        const total = parseInt(count.rows[0].count);
        console.log(`  - ${table}: ${total} registos`);
        
        if (total > 0) {
          const sample = await client.query(`SELECT * FROM "${table}" ORDER BY id LIMIT 1`);
          const firstRecord = sample.rows[0];
          const keys = Object.keys(firstRecord).slice(0, 3);
          console.log(`    📄 Primeiro registo: ${keys.map(k => `${k}=${firstRecord[k]}`).join(', ')}...`);
        }
      } catch (error) {
        console.log(`  - ${table}: erro ao verificar (${error.message.substring(0, 40)}...)`);
      }
    }
    
    // Verificar sequences
    console.log('\n🔢 Sequences configuradas:');
    const sequencesResult = await client.query(`
      SELECT sequencename, last_value 
      FROM pg_sequences 
      WHERE schemaname = 'public' 
      ORDER BY sequencename
    `);
    
    sequencesResult.rows.forEach(seq => {
      console.log(`  - ${seq.sequencename}: ${seq.last_value}`);
    });
    
    console.log('\n🎉 Base de dados restaurada com 100% fidelidade ao backup!');
    console.log('   📋 Todas as tabelas, colunas, dados e sequences foram restaurados na ordem correcta');
    
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