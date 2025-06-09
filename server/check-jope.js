const pool = require('./dist/config/db').default;

async function checkJope() {
    try {
        const result = await pool.query('SELECT id, name, image_url FROM players WHERE name = $1', ['Jope']);
        console.log('=== JOPE DATA ===');
        console.log(result.rows);
        
        if (result.rows.length > 0) {
            const jope = result.rows[0];
            console.log('Jope ID:', jope.id);
            console.log('Jope name:', jope.name);
            console.log('Jope image_url:', jope.image_url);
        } else {
            console.log('NENHUM JOPE ENCONTRADO NA DB!');
        }
        
        // Check all players to see what we have
        const allPlayers = await pool.query('SELECT id, name, image_url FROM players ORDER BY id DESC LIMIT 5');
        console.log('\n=== ÚLTIMOS 5 JOGADORES ===');
        allPlayers.rows.forEach(player => {
            console.log(`ID: ${player.id}, Nome: ${player.name}, Imagem: ${player.image_url}`);
        });
        
        pool.end();
    } catch (error) {
        console.error('ERRO:', error);
        pool.end();
    }
}

checkJope(); 