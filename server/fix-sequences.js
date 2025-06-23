const { Pool } = require('pg');

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

async function fixSequences() {
    const client = await pool.connect();
    
    try {
        console.log('🔧 A reparar sequences...\n');
        
        // Define tabelas e suas sequences correspondentes
        const tableSequencePairs = [
            { table: 'users', sequence: 'users_id_seq' },
            { table: 'players', sequence: 'players_id_seq' },
            { table: 'discussions', sequence: 'discussions_id_seq' },
            { table: 'comments', sequence: 'comments_id_seq' },
            { table: 'custom_polls', sequence: 'custom_polls_id_seq' },
            { table: 'custom_poll_votes', sequence: 'custom_poll_votes_id_seq' },
            { table: 'transfer_rumors', sequence: 'transfer_rumors_id_seq' },
            { table: 'football_matches_cache', sequence: 'football_matches_cache_id_seq' },
            { table: 'football_lineups_cache', sequence: 'football_lineups_cache_id_seq' },
            { table: 'football_sync_control', sequence: 'football_sync_control_id_seq' },
            { table: 'man_of_match_votes', sequence: 'man_of_match_votes_id_seq' },
            { table: 'maritodle_daily_attempts', sequence: 'maritodle_daily_attempts_id_seq' },
            { table: 'maritodle_daily_games', sequence: 'maritodle_daily_games_id_seq' },
            { table: 'maritodle_players', sequence: 'maritodle_players_id_seq' },
            { table: 'match_players', sequence: 'match_players_id_seq' },
            { table: 'match_voting', sequence: 'match_voting_id_seq' },
            { table: 'match_voting_players', sequence: 'match_voting_players_id_seq' },
            { table: 'player_ratings', sequence: 'player_ratings_id_seq' },
            { table: 'poll_votes', sequence: 'poll_votes_id_seq' },
            { table: 'votes', sequence: 'votes_id_seq' }
        ];
        
        let fixedCount = 0;
        let errorCount = 0;
        
        for (const { table, sequence } of tableSequencePairs) {
            try {
                // Verificar se a tabela tem registos
                const countResult = await client.query(`SELECT COUNT(*) FROM "${table}"`);
                const rowCount = parseInt(countResult.rows[0].count);
                
                if (rowCount === 0) {
                    // Se não há registos, definir sequence para 1
                    await client.query(`SELECT pg_catalog.setval('${sequence}', 1, false)`);
                    console.log(`  ✅ ${sequence}: definido para 1 (tabela vazia)`);
                } else {
                    // Encontrar o maior ID na tabela
                    const maxResult = await client.query(`SELECT MAX(id) as max_id FROM "${table}"`);
                    const maxId = maxResult.rows[0].max_id;
                    
                    if (maxId) {
                        await client.query(`SELECT pg_catalog.setval('${sequence}', $1, true)`, [maxId]);
                        console.log(`  ✅ ${sequence}: definido para ${maxId} (${rowCount} registos)`);
                    } else {
                        await client.query(`SELECT pg_catalog.setval('${sequence}', 1, false)`);
                        console.log(`  ✅ ${sequence}: definido para 1 (sem ID válido)`);
                    }
                }
                
                fixedCount++;
                
            } catch (error) {
                console.log(`  ❌ ${sequence}: ${error.message}`);
                errorCount++;
            }
        }
        
        console.log(`\n📊 Resumo:`);
        console.log(`  ✅ ${fixedCount} sequences reparadas`);
        console.log(`  ❌ ${errorCount} erros`);
        
        // Testar inserção após reparação
        console.log('\n🧪 Teste de inserção após reparação...');
        
        try {
            await client.query('BEGIN');
            
            // Testar inserção de utilizador
            const testUser = await client.query(`
                INSERT INTO users (username, email, password_hash, role, created_at, updated_at)
                VALUES ('teste_sequence', 'teste.seq@temp.com', 'hash123', 'user', NOW(), NOW())
                RETURNING id
            `);
            
            console.log(`  ✅ Utilizador criado com ID: ${testUser.rows[0].id}`);
            
            // Testar inserção de jogador
            const testPlayer = await client.query(`
                INSERT INTO players (name, position, created_at, updated_at)
                VALUES ('Teste Sequence Player', 'Médio', NOW(), NOW())
                RETURNING id
            `);
            
            console.log(`  ✅ Jogador criado com ID: ${testPlayer.rows[0].id}`);
            
            // Limpar dados de teste
            await client.query('DELETE FROM players WHERE name = $1', ['Teste Sequence Player']);
            await client.query('DELETE FROM users WHERE username = $1', ['teste_sequence']);
            
            await client.query('COMMIT');
            
            console.log('  ✅ Teste de inserção passou - sequences funcionam!');
            
        } catch (error) {
            await client.query('ROLLBACK');
            console.log(`  ❌ Teste falhou: ${error.message}`);
        }
        
        console.log('\n🎉 Reparação de sequences concluída!');
        console.log('   ✅ As operações de escrita devem funcionar agora');
        
    } catch (error) {
        console.error('❌ Erro na reparação:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

fixSequences(); 