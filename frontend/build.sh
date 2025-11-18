#!/bin/bash

# Production Build Script for Hospital Management System

echo "🏥 Building Hospital Management System for Production..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist
echo ""

# Build for production
echo "🔨 Building for production..."
npm run build

# Check if build was successful
if [ -d "dist" ]; then
    echo ""
    echo "✅ Build completed successfully!"
    echo ""
    echo "📁 Build output: ./dist"
    echo ""
    echo "📤 Next steps:"
    echo "   1. Upload all files from ./dist to /azanhospital/"
    echo "   2. Upload backend files to /backendhospital/"
    echo "   3. Configure database settings in backend"
    echo ""
    echo "🌐 URLs:"
    echo "   Frontend: https://0neconnect.com/azanhospital"
    echo "   Backend:  https://0neconnect.com/backendhospital"
    echo ""
else
    echo ""
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi

