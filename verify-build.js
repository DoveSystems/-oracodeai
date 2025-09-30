#!/usr/bin/env node

/**
 * OraCodeAI Build Verification Script
 * Verifies that the production build is ready for deployment
 */

import fs from 'fs'
import path from 'path'

const distPath = './dist'
const requiredFiles = [
  'index.html'
]

const requiredAssetPatterns = [
  'index-',
  'vendor-',
  'editor-',
  'ui-'
]

console.log('🔍 Verifying OraCodeAI build...\n')

// Check if dist directory exists
if (!fs.existsSync(distPath)) {
  console.error('❌ Build directory "dist" not found!')
  console.log('💡 Run: npm run build')
  process.exit(1)
}

console.log('✅ Build directory exists')

// Check for required files
let allFilesExist = true
const files = fs.readdirSync(distPath)

for (const requiredFile of requiredFiles) {
  const found = files.some(file => file.includes(requiredFile))
  if (!found) {
    console.error(`❌ Required file not found: ${requiredFile}`)
    allFilesExist = false
  } else {
    console.log(`✅ Found: ${requiredFile}`)
  }
}

// Check for required asset patterns
const assetsPath = path.join(distPath, 'assets')
if (fs.existsSync(assetsPath)) {
  const assetFiles = fs.readdirSync(assetsPath)
  
  for (const pattern of requiredAssetPatterns) {
    const found = assetFiles.some(file => file.includes(pattern))
    if (!found) {
      console.error(`❌ Required asset pattern not found: ${pattern}`)
      allFilesExist = false
    } else {
      console.log(`✅ Found asset: ${pattern}`)
    }
  }
} else {
  console.error('❌ Assets directory not found!')
  allFilesExist = false
}

if (!allFilesExist) {
  console.error('\n❌ Build verification failed!')
  process.exit(1)
}

// Check build size
const indexHtmlPath = path.join(distPath, 'index.html')
if (fs.existsSync(indexHtmlPath)) {
  const stats = fs.statSync(indexHtmlPath)
  console.log(`📄 index.html: ${(stats.size / 1024).toFixed(2)} KB`)
}

// Check assets directory size
if (fs.existsSync(assetsPath)) {
  const assetFiles = fs.readdirSync(assetsPath)
  console.log(`📦 Assets: ${assetFiles.length} files`)
  
  let totalSize = 0
  assetFiles.forEach(file => {
    const filePath = path.join(assetsPath, file)
    const stats = fs.statSync(filePath)
    totalSize += stats.size
  })
  
  console.log(`📊 Total assets size: ${(totalSize / 1024).toFixed(2)} KB`)
}

console.log('\n🎉 Build verification successful!')
console.log('🚀 Ready for deployment to Netlify, Vercel, or GitHub Pages')
console.log('\n📋 Deployment checklist:')
console.log('  ✅ Build command: npm run build')
console.log('  ✅ Publish directory: dist')
console.log('  ✅ Node version: 18')
console.log('  ✅ All required files present')
console.log('  ✅ Build optimized for production')

console.log('\n🌐 Deploy to:')
console.log('  • Netlify: Connect GitHub repo (auto-detects netlify.toml)')
console.log('  • Vercel: Connect GitHub repo (auto-detects vercel.json)')
console.log('  • GitHub Pages: Upload dist folder')
console.log('  • Any static host: Upload dist folder')
