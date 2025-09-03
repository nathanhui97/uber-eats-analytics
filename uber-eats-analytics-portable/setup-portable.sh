#!/bin/bash

echo "🚀 Setting up Uber Eats Analytics on work computer..."

# Check if Node.js is available
if command -v node &> /dev/null; then
    echo "✅ Node.js found, installing dependencies..."
    cd backend && npm install --silent
    cd ../extension && npm install --silent
    echo "✅ Dependencies installed"
else
    echo "⚠️  Node.js not found. Using pre-built files only."
fi

echo "🎯 Setup complete! You can now:"
echo "1. Load extension: chrome://extensions/ → Load unpacked → select extension/dist"
echo "2. Open test page: test-pages/mock-uber-eats.html"
echo "3. Start backend: cd backend && npm start (if Node.js available)"
