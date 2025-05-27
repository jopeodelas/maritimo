import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.join(__dirname, '../public/images');
const outputDir = path.join(__dirname, '../public/images/optimized');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Simple optimization settings for better quality
const optimizationSettings = {
  jpeg: {
    quality: 85,
    progressive: true,
    mozjpeg: true
  },
  png: {
    quality: 90,
    compressionLevel: 6,
    progressive: true
  },
  webp: {
    quality: 85,
    effort: 4
  }
};

async function optimizeImage(inputPath, outputPath, format = 'webp') {
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    console.log(`Optimizing: ${path.basename(inputPath)} (${metadata.width}x${metadata.height})`);
    
    let pipeline = image;
    
    // Resize only if image is very large
    if (metadata.width && metadata.width > 800) {
      pipeline = pipeline.resize(800, null, {
        withoutEnlargement: true,
        fit: 'inside'
      });
    }
    
    // Apply format-specific optimization
    switch (format) {
      case 'webp':
        pipeline = pipeline.webp(optimizationSettings.webp);
        break;
      case 'jpeg':
      case 'jpg':
        pipeline = pipeline.jpeg(optimizationSettings.jpeg);
        break;
      case 'png':
        pipeline = pipeline.png(optimizationSettings.png);
        break;
    }
    
    await pipeline.toFile(outputPath);
    
    const originalStats = fs.statSync(inputPath);
    const optimizedStats = fs.statSync(outputPath);
    const savings = ((originalStats.size - optimizedStats.size) / originalStats.size * 100).toFixed(1);
    
    console.log(`✓ Saved ${savings}% (${(originalStats.size / 1024).toFixed(1)}KB → ${(optimizedStats.size / 1024).toFixed(1)}KB)`);
    
  } catch (error) {
    console.error(`Error optimizing ${inputPath}:`, error.message);
  }
}

async function optimizeAllImages() {
  try {
    if (!fs.existsSync(inputDir)) {
      console.log('Images directory not found, skipping optimization');
      return;
    }

    const files = fs.readdirSync(inputDir);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png)$/i.test(file)
    );

    if (imageFiles.length === 0) {
      console.log('No images found to optimize');
      return;
    }

    console.log(`Found ${imageFiles.length} images to optimize`);

    for (const file of imageFiles) {
      const inputPath = path.join(inputDir, file);
      const baseName = path.parse(file).name;
      
      // Create WebP version
      const webpPath = path.join(outputDir, `${baseName}.webp`);
      await optimizeImage(inputPath, webpPath, 'webp');
      
      // Keep original format but optimized
      const ext = path.parse(file).ext.toLowerCase();
      const optimizedPath = path.join(outputDir, file);
      await optimizeImage(inputPath, optimizedPath, ext.slice(1));
    }

    console.log('\n✅ Image optimization completed!');
    
  } catch (error) {
    console.error('Error during optimization:', error);
    process.exit(1);
  }
}

// Run optimization
optimizeAllImages(); 