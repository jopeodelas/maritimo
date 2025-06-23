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

// Expected columns based on common patterns in the codebase
const expectedColumns = {
  users: ['id', 'username', 'email', 'password', 'created_at', 'google_id', 'is_admin', 'is_banned'],
  players: ['id', 'name', 'position', 'created_at', 'updated_at', 'image_url', 'team_id'],
  discussions: ['id', 'title', 'description', 'author_id', 'created_at', 'updated_at'],
  comments: ['id', 'discussion_id', 'author_id', 'content', 'created_at', 'updated_at'],
  custom_polls: ['id', 'title', 'options', 'created_by', 'created_at', 'is_active'],
  custom_poll_votes: ['id', 'poll_id', 'user_id', 'option_index', 'created_at'],
  transfer_rumors: ['id', 'player_name', 'from_team', 'to_team', 'transfer_fee', 'reliability', 'source_url', 'created_at', 'updated_at', 'unique_id'],
  votes: ['id', 'user_id', 'player_id', 'created_at'],
  player_ratings: ['id', 'player_id', 'user_id', 'match_id', 'rating', 'created_at', 'player_type', 'match_player_id'],
  man_of_match_votes: ['id', 'player_id', 'user_id', 'match_id', 'created_at', 'player_type', 'match_player_id']
};

async function checkAndPopulateMissingColumns() {
  const client = await pool.connect();
  
  try {
    console.log('🔌 Conectado à base de dados');
    
    // 1. Verificar estrutura das tabelas principais
    console.log('🔍 A verificar estrutura das tabelas...');
    
    const tables = [
      'users', 'players', 'discussions', 'transfer_rumors', 
      'match_voting', 'player_ratings', 'comments', 'votes'
    ];
    
    for (const table of tables) {
      try {
        const result = await client.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_name = '${table}' 
          ORDER BY ordinal_position
        `);
        
        console.log(`\n📋 Estrutura da tabela '${table}':`);
        result.rows.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
        });
      } catch (error) {
        console.error(`❌ Erro ao verificar tabela ${table}:`, error.message);
      }
    }
    
    // 2. Verificar se existem dados
    console.log('\n📊 A verificar dados existentes...');
    
    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`  - ${table}: ${result.rows[0].count} registos`);
      } catch (error) {
        console.log(`  - ${table}: erro ao contar registos`);
      }
    }
    
    // 3. Inserir utilizador admin se não existir
    console.log('\n👤 A verificar utilizador admin...');
    const adminCheck = await client.query(`SELECT id FROM users WHERE username = 'jope' OR email = 'jope@example.com'`);
    
    if (adminCheck.rows.length === 0) {
      console.log('📝 A criar utilizador admin...');
      await client.query(`
        INSERT INTO users (username, email, password_hash, is_admin, created_at) 
        VALUES ('jope', 'jope@example.com', '$2b$10$placeholder', true, CURRENT_TIMESTAMP)
      `);
      console.log('✅ Utilizador admin criado');
    } else {
      console.log('✅ Utilizador admin já existe');
    }
    
    // 4. Inserir alguns jogadores básicos se não existirem
    console.log('\n⚽ A verificar jogadores...');
    const playersCheck = await client.query(`SELECT COUNT(*) FROM players`);
    
    if (parseInt(playersCheck.rows[0].count) === 0) {
      console.log('📝 A inserir jogadores básicos...');
      
      const basicPlayers = [
        { name: 'Fábio China', position: 'GR', number: 1 },
        { name: 'Igor Julião', position: 'DD', number: 2 },
        { name: 'Gonçalo Tabuaço', position: 'DC', number: 3 },
        { name: 'Carlos Daniel', position: 'DC', number: 4 },
        { name: 'Afonso Freitas', position: 'DE', number: 5 }
      ];
      
      for (const player of basicPlayers) {
        await client.query(`
          INSERT INTO players (name, position, number, created_at) 
          VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        `, [player.name, player.position, player.number]);
      }
      console.log(`✅ ${basicPlayers.length} jogadores básicos inseridos`);
    } else {
      console.log('✅ Jogadores já existem na base de dados');
    }
    
    // 5. Verificar constraints e índices
    console.log('\n🔗 A verificar constraints...');
    const constraintsResult = await client.query(`
      SELECT 
        tc.constraint_name,
        tc.table_name,
        tc.constraint_type
      FROM information_schema.table_constraints tc
      WHERE tc.table_schema = 'public'
      ORDER BY tc.table_name, tc.constraint_type
    `);
    
    console.log(`📋 ${constraintsResult.rows.length} constraints encontradas:`);
    constraintsResult.rows.forEach(constraint => {
      console.log(`  - ${constraint.table_name}.${constraint.constraint_name} (${constraint.constraint_type})`);
    });
    
    console.log('\n🔍 Verificando colunas em falta...\n');
    
    // Get all tables in the database
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('📋 Tabelas encontradas na base de dados:');
    for (const table of tablesResult.rows) {
      console.log(`  - ${table.table_name}`);
    }
    
    console.log('\n🔍 Verificando cada tabela...\n');
    
    const missingColumns = [];
    
    for (const [tableName, expectedCols] of Object.entries(expectedColumns)) {
      console.log(`📊 Tabela: ${tableName.toUpperCase()}`);
      
      // Check if table exists
      const tableExists = tablesResult.rows.some(row => row.table_name === tableName);
      
      if (!tableExists) {
        console.log(`  ⚠️ Tabela ${tableName} não existe!`);
        continue;
      }
      
      // Get existing columns
      const columnsResult = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `, [tableName]);
      
      const existingColumns = columnsResult.rows.map(row => row.column_name);
      
      console.log(`  ✅ Colunas existentes: ${existingColumns.join(', ')}`);
      
      // Check for missing columns
      const missing = expectedCols.filter(col => !existingColumns.includes(col));
      
      if (missing.length > 0) {
        console.log(`  ❌ Colunas em falta: ${missing.join(', ')}`);
        missingColumns.push({ table: tableName, columns: missing });
      } else {
        console.log(`  ✅ Todas as colunas esperadas estão presentes`);
      }
      
      console.log('');
    }
    
    // Report summary
    if (missingColumns.length > 0) {
      console.log('🚨 RESUMO DE COLUNAS EM FALTA:\n');
      
      for (const { table, columns } of missingColumns) {
        console.log(`📊 Tabela: ${table}`);
        for (const col of columns) {
          console.log(`  ❌ ${col}`);
        }
        console.log('');
      }
      
      // Try to add missing columns with reasonable defaults
      console.log('🔧 Tentando adicionar colunas em falta...\n');
      
      for (const { table, columns } of missingColumns) {
        console.log(`🛠️ Reparando tabela: ${table}`);
        
        for (const col of columns) {
          try {
            let alterQuery = '';
            
            // Define column types based on common patterns
            switch (col) {
              case 'is_banned':
              case 'is_active':
              case 'is_admin':
                alterQuery = `ALTER TABLE ${table} ADD COLUMN ${col} BOOLEAN DEFAULT false NOT NULL`;
                break;
              case 'image_url':
              case 'source_url':
                alterQuery = `ALTER TABLE ${table} ADD COLUMN ${col} VARCHAR(500)`;
                break;
              case 'team_id':
              case 'match_id':
              case 'player_id':
              case 'user_id':
              case 'match_player_id':
                alterQuery = `ALTER TABLE ${table} ADD COLUMN ${col} INTEGER`;
                break;
              case 'player_type':
                alterQuery = `ALTER TABLE ${table} ADD COLUMN ${col} VARCHAR(20) DEFAULT 'regular'`;
                break;
              case 'unique_id':
                alterQuery = `ALTER TABLE ${table} ADD COLUMN ${col} VARCHAR(255) UNIQUE`;
                break;
              case 'created_at':
              case 'updated_at':
                alterQuery = `ALTER TABLE ${table} ADD COLUMN ${col} TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`;
                break;
              default:
                alterQuery = `ALTER TABLE ${table} ADD COLUMN ${col} TEXT`;
            }
            
            await client.query(alterQuery);
            console.log(`    ✅ Adicionada coluna: ${col}`);
            
          } catch (error) {
            console.log(`    ❌ Erro ao adicionar ${col}: ${error.message}`);
          }
        }
        console.log('');
      }
      
    } else {
      console.log('🎉 TODAS AS COLUNAS ESPERADAS ESTÃO PRESENTES!\n');
    }
    
    // Final verification
    console.log('🔍 Verificação final...\n');
    
    for (const [tableName] of Object.entries(expectedColumns)) {
      const finalCheck = await client.query(`
        SELECT column_name
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `, [tableName]);
      
      const finalColumns = finalCheck.rows.map(row => row.column_name);
      console.log(`📊 ${tableName}: ${finalColumns.join(', ')}`);
    }
    
    console.log('\n🎉 Verificação e população da base de dados concluída!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Executar o script
checkAndPopulateMissingColumns()
  .then(() => {
    console.log('✅ Script concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro no script:', error);
    process.exit(1);
  }); 