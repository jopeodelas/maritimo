const { Pool } = require('pg');
require('dotenv').config();
const fs = require('fs');

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

async function cleanDatabase() {
    const client = await pool.connect();
    try {
        console.log('🗑️ A limpar base de dados...');
        
        // Disable triggers first
        await client.query('SET session_replication_role = replica;');
        
        // Get all tables
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
        `);
        
        // Drop all tables with CASCADE
        for (const row of tablesResult.rows) {
            await client.query(`DROP TABLE IF EXISTS "${row.table_name}" CASCADE`);
        }
        
        // Drop all sequences
        const sequencesResult = await client.query(`
            SELECT sequence_name 
            FROM information_schema.sequences 
            WHERE sequence_schema = 'public'
        `);
        
        for (const row of sequencesResult.rows) {
            await client.query(`DROP SEQUENCE IF EXISTS "${row.sequence_name}" CASCADE`);
        }
        
        // Drop all functions
        const functionsResult = await client.query(`
            SELECT proname, oidvectortypes(proargtypes) as argtypes
            FROM pg_proc 
            INNER JOIN pg_namespace ns ON (pg_proc.pronamespace = ns.oid) 
            WHERE ns.nspname = 'public'
        `);
        
        for (const row of functionsResult.rows) {
            await client.query(`DROP FUNCTION IF EXISTS "${row.proname}"(${row.argtypes}) CASCADE`);
        }
        
        // Re-enable triggers
        await client.query('SET session_replication_role = DEFAULT;');
        
        console.log('✅ Base de dados limpa');
    } catch (error) {
        console.error('❌ Erro ao limpar:', error.message);
        throw error;
    } finally {
        client.release();
    }
}

function parseSQL(content) {
    const lines = content.split('\n');
    const structureStatements = [];
    const insertStatements = [];
    const sequenceStatements = [];
    
    let currentStatement = '';
    let inFunction = false;
    let functionDepth = 0;
    let inQuotes = false;
    let quoteChar = '';
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip comments and empty lines
        if (!line || line.startsWith('--') || line.startsWith('/*') || line.startsWith('*/')) {
            continue;
        }
        
        // Skip SET commands and other PostgreSQL directives
        if (line.startsWith('SET ') || line.startsWith('SELECT pg_catalog.') || 
            line.startsWith('COMMENT ON ') || line.startsWith('ALTER TABLE') && line.includes('OWNER TO')) {
            continue;
        }
        
        currentStatement += line + '\n';
        
        // Handle quoted strings
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            const prevChar = j > 0 ? line[j-1] : '';
            
            if (!inQuotes && (char === "'" || char === '"')) {
                inQuotes = true;
                quoteChar = char;
            } else if (inQuotes && char === quoteChar && prevChar !== '\\') {
                inQuotes = false;
                quoteChar = '';
            }
        }
        
        // Handle function definitions
        if (line.includes('CREATE OR REPLACE FUNCTION') || line.includes('CREATE FUNCTION')) {
            inFunction = true;
            functionDepth = 0;
        }
        
        if (inFunction) {
            // Count BEGIN/END pairs in functions
            if (line.includes('BEGIN') && !inQuotes) functionDepth++;
            if (line.includes('END') && !inQuotes) functionDepth--;
            
            // End function when we reach the final semicolon after all END statements
            if (functionDepth === 0 && line.includes(';') && !inQuotes) {
                inFunction = false;
                structureStatements.push(currentStatement.trim());
                currentStatement = '';
                continue;
            }
        }
        
        // Normal statement ending
        if (!inFunction && !inQuotes && line.endsWith(';')) {
            const statement = currentStatement.trim();
            
            if (statement.startsWith('INSERT INTO')) {
                insertStatements.push(statement);
            } else if (statement.startsWith('SELECT pg_catalog.setval')) {
                sequenceStatements.push(statement);
            } else if (statement && 
                      !statement.startsWith('SET ') && 
                      !statement.startsWith('SELECT pg_catalog.') &&
                      !statement.startsWith('COMMENT ON ')) {
                structureStatements.push(statement);
            }
            
            currentStatement = '';
        }
    }
    
    return { structureStatements, insertStatements, sequenceStatements };
}

// Define table dependency order for foreign keys
const tableOrder = [
    'users',
    'players', 
    'discussions',
    'comments',
    'polls',
    'poll_options', 
    'votes',
    'custom_polls',
    'custom_poll_options',
    'custom_poll_votes',
    'transfer_rumors',
    'football_matches_cache',
    'football_lineups_cache',
    'football_statistics_cache',
    'maritodle_games',
    'maritodle_guesses',
    'maritodle_daily_games',
    'maritodle_daily_guesses',
    'match_voting_players',
    'player_ratings'
];

function sortInsertsByDependency(insertStatements) {
    const sortedInserts = [];
    const remainingInserts = [...insertStatements];
    
    // First, add inserts in dependency order
    for (const tableName of tableOrder) {
        const tableInserts = remainingInserts.filter(stmt => 
            stmt.toLowerCase().includes(`insert into ${tableName.toLowerCase()} `) ||
            stmt.toLowerCase().includes(`insert into "${tableName.toLowerCase()}" `)
        );
        
        sortedInserts.push(...tableInserts);
        
        // Remove processed inserts
        tableInserts.forEach(insert => {
            const index = remainingInserts.indexOf(insert);
            if (index > -1) remainingInserts.splice(index, 1);
        });
    }
    
    // Add any remaining inserts
    sortedInserts.push(...remainingInserts);
    
    return sortedInserts;
}

async function executeStatements(statements, type, client) {
    let successful = 0;
    let failed = 0;
    
    for (let i = 0; i < statements.length; i++) {
        try {
            await client.query(statements[i]);
            successful++;
            
            if ((i + 1) % 20 === 0 || i === statements.length - 1) {
                console.log(`  📈 ${i + 1}/${statements.length} ${type}...`);
            }
        } catch (error) {
            failed++;
            if (type !== 'insert' || failed <= 10) { // Only show first 10 insert errors
                console.log(`⚠️ ${type}: ${error.message.substring(0, 80)}...`);
            }
        }
    }
    
    console.log(`✅ ${successful}/${statements.length} ${type} ${successful > 1 ? 'executados' : 'executado'}`);
    if (failed > 0) {
        console.log(`⚠️ ${failed}/${statements.length} ${type} falharam`);
    }
}

async function restoreDatabase() {
    const client = await pool.connect();
    
    try {
        console.log('🔧 Conectado à base de dados');
        
        // Clean database
        await cleanDatabase();
        
        // Read backup file
        console.log('📄 A ler backup...');
        const backupContent = fs.readFileSync('./sql/maritimo_backup_perfeito.sql', 'utf8');
        
        // Parse SQL
        console.log('🔧 A processar SQL...');
        const { structureStatements, insertStatements, sequenceStatements } = parseSQL(backupContent);
        
        console.log(`📊 Encontrados: ${structureStatements.length} estrutura, ${insertStatements.length} inserts, ${sequenceStatements.length} sequences`);
        
        // Disable foreign key checks and triggers
        console.log('🔒 A desativar verificações...');
        await client.query('SET session_replication_role = replica;');
        await client.query('SET check_function_bodies = false;');
        await client.query('SET client_min_messages = WARNING;');
        
        // Execute structure
        console.log('🏗️ A criar estrutura...');
        await executeStatements(structureStatements, 'estrutura', client);
        
        // Sort and execute inserts
        console.log('📊 A ordenar e inserir dados...');
        const sortedInserts = sortInsertsByDependency(insertStatements);
        await executeStatements(sortedInserts, 'insert', client);
        
        // Execute sequences
        console.log('🔢 A ajustar sequences...');
        await executeStatements(sequenceStatements, 'sequence', client);
        
        // Re-enable checks
        console.log('🔓 A reativar verificações...');
        await client.query('SET session_replication_role = DEFAULT;');
        await client.query('SET check_function_bodies = true;');
        await client.query('SET client_min_messages = NOTICE;');
        
        console.log('🎉 Restauro completado com sucesso!');
        
        // Show final stats
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);
        
        console.log(`📊 Total de tabelas criadas: ${tablesResult.rows.length}`);
        console.log('📋 Tabelas:', tablesResult.rows.map(r => r.table_name).join(', '));
        
    } catch (error) {
        console.error('❌ Erro no restauro:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Execute
restoreDatabase()
    .then(() => {
        console.log('✅ Processo finalizado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Erro fatal:', error);
        process.exit(1);
    }); 