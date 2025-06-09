const fs = require('fs');
const path = require('path');

// Paths
const serverImagesDir = path.join(__dirname, 'public', 'images');
const clientImagesDir = path.join(__dirname, '..', 'client', 'public', 'images');

function syncImages() {
    console.log('=== SYNC IMAGES SCRIPT ===');
    console.log('Server images dir:', serverImagesDir);
    console.log('Client images dir:', clientImagesDir);
    
    // Check if directories exist
    if (!fs.existsSync(serverImagesDir)) {
        console.error('Server images directory does not exist!');
        return;
    }
    
    if (!fs.existsSync(clientImagesDir)) {
        console.error('Client images directory does not exist!');
        return;
    }
    
    // Get all files from server images
    const serverFiles = fs.readdirSync(serverImagesDir);
    const clientFiles = fs.readdirSync(clientImagesDir);
    
    // Find new player images (files that start with 'player-' and are not in client)
    const newPlayerImages = serverFiles.filter(file => 
        file.startsWith('player-') && 
        file.endsWith('.png') && 
        !clientFiles.includes(file)
    );
    
    console.log(`Found ${newPlayerImages.length} new player images to sync:`);
    
    newPlayerImages.forEach(filename => {
        const sourcePath = path.join(serverImagesDir, filename);
        const destPath = path.join(clientImagesDir, filename);
        
        try {
            fs.copyFileSync(sourcePath, destPath);
            console.log(`✓ Copied: ${filename}`);
        } catch (error) {
            console.error(`✗ Failed to copy ${filename}:`, error.message);
        }
    });
    
    if (newPlayerImages.length === 0) {
        console.log('No new images to sync!');
    } else {
        console.log(`\n🎉 Successfully synced ${newPlayerImages.length} images!`);
    }
}

// Run immediately
syncImages();

// Export for use in other scripts
module.exports = { syncImages }; 