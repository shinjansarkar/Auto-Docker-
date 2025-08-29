#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple test to verify the extension structure
console.log('🧪 Testing Auto Docker Extension...\n');

// Check if all required files exist
const requiredFiles = [
    'package.json',
    'tsconfig.json',
    'src/extension.ts',
    'src/projectAnalyzer.ts',
    'src/dockerGenerator.ts',
    'README.md'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        allFilesExist = false;
    }
});

console.log('\n📁 Extension Structure:');
console.log('├── package.json (Extension manifest)');
console.log('├── tsconfig.json (TypeScript config)');
console.log('├── src/');
console.log('│   ├── extension.ts (Main extension entry)');
console.log('│   ├── projectAnalyzer.ts (Project detection logic)');
console.log('│   └── dockerGenerator.ts (Docker file generation)');
console.log('├── examples/ (Test projects)');
console.log('│   ├── react-frontend/');
console.log('│   ├── nodejs-backend/');
console.log('│   ├── python-backend/');
console.log('│   └── fullstack-react-node/');
console.log('└── README.md (Documentation)');

if (allFilesExist) {
    console.log('\n🎉 All required files are present!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: npm install');
    console.log('2. Run: npm run compile');
    console.log('3. Press F5 in VS Code to launch extension');
    console.log('4. Open one of the example projects');
    console.log('5. Run "Generate Docker Setup" command');
} else {
    console.log('\n❌ Some required files are missing. Please check the structure.');
    process.exit(1);
} 