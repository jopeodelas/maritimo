const { Pool } = require('pg');
require('dotenv').config();

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

async function checkDatabaseStructure() {
    const client = await pool.connect();
    
    try {
        console.log('🔍 A verificar estrutura da base de dados...\n');
        
        // 1. Verificar tabelas principais
        console.log('📋 TABELAS:');
        const tablesResult = await client.query(`
            SELECT table_name, 
                   (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
            FROM information_schema.tables t
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);
        
        for (const table of tablesResult.rows) {
            const countResult = await client.query(`SELECT COUNT(*) FROM "${table.table_name}"`);
            const rowCount = countResult.rows[0].count;
            console.log(`  ✅ ${table.table_name}: ${table.column_count} colunas, ${rowCount} registos`);
        }
        
        // 2. Verificar chaves estrangeiras
        console.log('\n🔗 CHAVES ESTRANGEIRAS:');
        const fkResult = await client.query(`
            SELECT
                tc.table_name,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name,
                tc.constraint_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
            ORDER BY tc.table_name, kcu.column_name;
        `);
        
        if (fkResult.rows.length === 0) {
            console.log('  ⚠️ PROBLEMA: Nenhuma chave estrangeira encontrada!');
        } else {
            for (const fk of fkResult.rows) {
                console.log(`  ✅ ${fk.table_name}.${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
            }
        }
        
        // 3. Verificar sequences
        console.log('\n🔢 SEQUENCES:');
        const sequencesResult = await client.query(`
            SELECT sequence_name, last_value, increment_by
            FROM information_schema.sequences s
            JOIN pg_sequences ps ON s.sequence_name = ps.sequencename
            WHERE sequence_schema = 'public'
            ORDER BY sequence_name
        `);
        
        if (sequencesResult.rows.length === 0) {
            console.log('  ⚠️ PROBLEMA: Nenhuma sequence encontrada!');
        } else {
            for (const seq of sequencesResult.rows) {
                console.log(`  ✅ ${seq.sequence_name}: último valor = ${seq.last_value}`);
            }
        }
        
        // 4. Verificar triggers
        console.log('\n⚡ TRIGGERS:');
        const triggersResult = await client.query(`
            SELECT trigger_name, event_manipulation, event_object_table
            FROM information_schema.triggers
            WHERE trigger_schema = 'public'
            ORDER BY event_object_table, trigger_name
        `);
        
        if (triggersResult.rows.length === 0) {
            console.log('  ⚠️ Nenhum trigger encontrado');
        } else {
            for (const trigger of triggersResult.rows) {
                console.log(`  ✅ ${trigger.trigger_name} on ${trigger.event_object_table} (${trigger.event_manipulation})`);
            }
        }
        
        // 5. Verificar funções
        console.log('\n🔧 FUNÇÕES:');  
        const functionsResult = await client.query(`
            SELECT proname, prosrc
            FROM pg_proc 
            WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
            ORDER BY proname
        `);
        
        if (functionsResult.rows.length === 0) {
            console.log('  ⚠️ Nenhuma função encontrada');
        } else {
            for (const func of functionsResult.rows) {
                console.log(`  ✅ ${func.proname}()`);
            }
        }
        
        // 6. Testar inserção simples
        console.log('\n🧪 TESTE DE INSERÇÃO:');
        try {
            // Tentar inserir e apagar um utilizador de teste
            await client.query('BEGIN');
            
            const testUser = await client.query(`
                INSERT INTO users (username, email, password_hash, role, created_at, updated_at)
                VALUES ('teste_temp', 'teste@temp.com', 'hash123', 'user', NOW(), NOW())
                RETURNING id
            `);
            
            console.log(`  ✅ Inserção funcionou (ID: ${testUser.rows[0].id})`);
            
            await client.query('DELETE FROM users WHERE username = $1', ['teste_temp']);
            console.log('  ✅ Remoção funcionou');
            
            await client.query('COMMIT');
            
        } catch (error) {
            await client.query('ROLLBACK');
            console.log(`  ❌ ERRO NA INSERÇÃO: ${error.message}`);
        }
        
        // 7. Verificar constraints
        console.log('\n🔒 CONSTRAINTS:');
        const constraintsResult = await client.query(`
            SELECT 
                tc.table_name,
                tc.constraint_name,
                tc.constraint_type
            FROM information_schema.table_constraints tc
            WHERE tc.table_schema = 'public'
            AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE', 'CHECK')
            ORDER BY tc.table_name, tc.constraint_type
        `);
        
        const constraintsByType = {};
        for (const constraint of constraintsResult.rows) {
            if (!constraintsByType[constraint.constraint_type]) {
                constraintsByType[constraint.constraint_type] = [];
            }
            constraintsByType[constraint.constraint_type].push(`${constraint.table_name}.${constraint.constraint_name}`);
        }
        
        for (const [type, constraints] of Object.entries(constraintsByType)) {
            console.log(`  ${type}: ${constraints.length} encontradas`);
        }
        
        console.log('\n✅ Verificação concluída!');
        
    } catch (error) {
        console.error('❌ Erro na verificação:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

checkDatabaseStructure(); 