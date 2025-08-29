#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, '..', 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

const iconPath = path.join(imagesDir, 'icon.png');

console.log('🐳 Setting up Docker logo as extension icon...');
console.log('');
console.log('📁 Icon path:', iconPath);
console.log('');
console.log('📋 Instructions:');
console.log('1. Save the Docker logo image as "icon.png"');
console.log('2. Place it in the "images" folder');
console.log('3. Make sure it\'s 128x128 pixels (recommended)');
console.log('4. Use PNG format for best compatibility');
console.log('');
console.log('✅ Once you place the icon.png file in the images folder,');
console.log('   the extension will automatically use it as its icon!');
console.log('');
console.log('🎨 The Docker logo represents:');
console.log('   - Containerization and Docker platform');
console.log('   - Automation of Docker configuration');
console.log('   - Professional and recognizable branding'); 