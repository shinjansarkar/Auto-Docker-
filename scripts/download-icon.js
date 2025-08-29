#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, '..', 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

// Docker logo URL (official Docker logo)
const dockerLogoUrl = 'https://www.docker.com/wp-content/uploads/2022/03/vertical-logo-monochromatic.png';
const iconPath = path.join(imagesDir, 'icon.png');

console.log('🐳 Downloading Docker logo for extension icon...');

// Download the Docker logo
https.get(dockerLogoUrl, (response) => {
    if (response.statusCode === 200) {
        const file = fs.createWriteStream(iconPath);
        response.pipe(file);
        
        file.on('finish', () => {
            file.close();
            console.log('✅ Docker logo downloaded successfully!');
            console.log(`📁 Icon saved to: ${iconPath}`);
            console.log('🎨 The extension will now use the Docker logo as its icon');
        });
    } else {
        console.error('❌ Failed to download Docker logo:', response.statusCode);
        console.log('💡 You can manually download the Docker logo and save it as images/icon.png');
    }
}).on('error', (err) => {
    console.error('❌ Error downloading Docker logo:', err.message);
    console.log('💡 You can manually download the Docker logo and save it as images/icon.png');
}); 