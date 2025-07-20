#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Testing Build Process for Vercel Deployment...\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function checkDirectoryExists(dirPath) {
  return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
}

try {
  // Step 1: Clean previous builds
  log('📁 Cleaning previous builds...', 'blue');
  if (checkDirectoryExists('dist')) {
    execSync('npm run clean', { stdio: 'inherit' });
  }
  log('✅ Clean completed\n', 'green');

  // Step 2: Install dependencies
  log('📦 Installing dependencies...', 'blue');
  execSync('npm install', { stdio: 'inherit' });
  log('✅ Dependencies installed\n', 'green');

  // Step 3: Run build
  log('🔨 Building applications...', 'blue');
  execSync('npm run build', { stdio: 'inherit' });
  log('✅ Build completed\n', 'green');

  // Step 4: Verify build output
  log('🔍 Verifying build output...', 'blue');
  
  const requiredFiles = [
    'dist/index.html',
    'dist/admin/index.html',
    'dist/assets',
    'dist/admin/assets'
  ];

  let allFilesExist = true;
  
  for (const file of requiredFiles) {
    if (checkFileExists(file) || checkDirectoryExists(file)) {
      log(`✅ ${file} exists`, 'green');
    } else {
      log(`❌ ${file} missing`, 'red');
      allFilesExist = false;
    }
  }

  if (allFilesExist) {
    log('\n🎉 Build verification successful!', 'green');
    log('Your project is ready for Vercel deployment.', 'green');
    
    // Show build output structure
    log('\n📁 Build output structure:', 'blue');
    try {
      execSync('dir dist /s /b | findstr "\\.html$"', { stdio: 'inherit' });
    } catch (error) {
      log('Could not display file structure (Windows command)', 'yellow');
    }
    
  } else {
    log('\n❌ Build verification failed!', 'red');
    log('Please check the build process and try again.', 'red');
    process.exit(1);
  }

  // Step 5: Check for environment variables
  log('\n🔧 Checking environment variables...', 'blue');
  const envFile = '.env';
  if (checkFileExists(envFile)) {
    log('✅ .env file found', 'green');
    log('⚠️  Remember to set environment variables in Vercel dashboard', 'yellow');
  } else {
    log('⚠️  No .env file found', 'yellow');
    log('Make sure to set all required environment variables in Vercel', 'yellow');
  }

  // Step 6: Verify vercel.json
  log('\n📋 Checking Vercel configuration...', 'blue');
  if (checkFileExists('vercel.json')) {
    log('✅ vercel.json found', 'green');
  } else {
    log('❌ vercel.json missing', 'red');
    process.exit(1);
  }

  log('\n🎯 Ready for deployment!', 'green');
  log('Next steps:', 'blue');
  log('1. Push your code to Git repository', 'blue');
  log('2. Connect repository to Vercel', 'blue');
  log('3. Set environment variables in Vercel dashboard', 'blue');
  log('4. Deploy!', 'blue');

} catch (error) {
  log(`\n❌ Build test failed: ${error.message}`, 'red');
  process.exit(1);
} 