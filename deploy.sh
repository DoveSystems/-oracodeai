#!/bin/bash

# OraCodeAI Deployment Script
echo "🚀 Building OraCodeAI for production..."

# Clean previous build
rm -rf dist

# Install dependencies
npm ci

# Build for production
npm run build

# Check if build was successful
if [ -d "dist" ]; then
    echo "✅ Build successful! Ready for deployment."
    echo "📁 Build output: dist/"
    echo "🌐 Deploy to Netlify by connecting your GitHub repository"
    echo "📋 Build command: npm run build"
    echo "📋 Publish directory: dist"
else
    echo "❌ Build failed!"
    exit 1
fi
