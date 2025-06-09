const pool = require('./dist/config/db').default;
const fs = require('fs');
const path = require('path');

async function fixJope() {
    try {
        // List all image files
        const imagesDir = path.join(__dirname, 'public', 'images');
        const files = fs.readdirSync(imagesDir);
        console.log('FICHEIROS DISPONÍVEIS:');
        files.forEach(file => console.log(`- ${file}`));
        
        // Get current Jope data
        const jopeResult = await pool.query('SELECT * FROM players WHERE name = $1', ['Jope']);
        if (jopeResult.rows.length === 0) {
            console.log('JOPE NÃO ENCONTRADO!');
            return;
        }
        
        const jope = jopeResult.rows[0];
        console.log(`\nJOPE ACTUAL: ID=${jope.id}, image_url="${jope.image_url}"`);
        
        // Check if current image exists
        const currentImagePath = path.join(imagesDir, jope.image_url);
        const currentExists = fs.existsSync(currentImagePath);
        console.log(`Ficheiro actual existe: ${currentExists}`);
        
        if (!currentExists) {
            // Find a player image file to use
            const playerFiles = files.filter(f => f.startsWith('player-') && f.endsWith('.png'));
            if (playerFiles.length > 0) {
                const newImageUrl = playerFiles[0]; // Use the first available player image
                console.log(`\nVAI USAR: ${newImageUrl}`);
                
                // Update database
                await pool.query('UPDATE players SET image_url = $1 WHERE id = $2', [newImageUrl, jope.id]);
                console.log('BASE DE DADOS ACTUALIZADA!');
            } else {
                console.log('NENHUMA IMAGEM DE JOGADOR ENCONTRADA!');
            }
        } else {
            console.log('A IMAGEM JÁ EXISTE, DEVIA ESTAR A FUNCIONAR!');
        }
        
        pool.end();
    } catch (error) {
        console.error('ERRO:', error);
        pool.end();
    }
}

fixJope(); 