const { Pool } = require('pg');

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

async function addIsBannedColumn() {
    const client = await pool.connect();
    
    try {
        console.log('🔧 A adicionar coluna is_banned...');
        
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN is_banned BOOLEAN DEFAULT false NOT NULL
        `);
        
        console.log('✅ Coluna is_banned adicionada com sucesso!');
        
        // Testar uma query de ban
        const testQuery = await client.query(`
            SELECT id, username, is_banned 
            FROM users 
            LIMIT 3
        `);
        
        console.log('✅ Teste de query com is_banned:');
        console.log(testQuery.rows);
        
    } catch (error) {
        if (error.message.includes('already exists')) {
            console.log('✅ Coluna is_banned já existe!');
        } else {
            console.error('❌ Erro:', error.message);
        }
    } finally {
        client.release();
        await pool.end();
    }
}

addIsBannedColumn(); 