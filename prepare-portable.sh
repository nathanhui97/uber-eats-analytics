#!/bin/bash

# 🚀 Prepare Uber Eats Analytics for Portable Use
# This script prepares the project for use on work computers without local storage

echo "🎯 Preparing Uber Eats Analytics for portable use..."

# Create portable directory
PORTABLE_DIR="uber-eats-analytics-portable"
rm -rf $PORTABLE_DIR
mkdir $PORTABLE_DIR

echo "📁 Creating portable directory: $PORTABLE_DIR"

# Copy essential files
echo "📋 Copying project files..."
cp -r backend $PORTABLE_DIR/
cp -r extension $PORTABLE_DIR/
cp -r shared $PORTABLE_DIR/
cp -r test-pages $PORTABLE_DIR/
cp package.json $PORTABLE_DIR/
cp README.md $PORTABLE_DIR/
cp *.md $PORTABLE_DIR/

# Build extension for portable use
echo "🔨 Building extension..."
cd extension
npm run build
cd ..

# Copy built extension
echo "📦 Copying built extension..."
cp -r extension/dist $PORTABLE_DIR/extension/

# Create portable setup script
echo "📝 Creating setup script..."
cat > $PORTABLE_DIR/setup-portable.sh << 'EOF'
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
EOF

chmod +x $PORTABLE_DIR/setup-portable.sh

# Create Windows batch file
cat > $PORTABLE_DIR/setup-portable.bat << 'EOF'
@echo off
echo 🚀 Setting up Uber Eats Analytics on work computer...

where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Node.js found, installing dependencies...
    cd backend && npm install --silent
    cd ..\extension && npm install --silent
    echo ✅ Dependencies installed
) else (
    echo ⚠️  Node.js not found. Using pre-built files only.
)

echo 🎯 Setup complete! You can now:
echo 1. Load extension: chrome://extensions/ → Load unpacked → select extension/dist
echo 2. Open test page: test-pages/mock-uber-eats.html
echo 3. Start backend: cd backend && npm start (if Node.js available)
pause
EOF

# Create README for portable use
cat > $PORTABLE_DIR/README-PORTABLE.md << 'EOF'
# 🚀 Uber Eats Analytics - Portable Version

## 📋 Quick Start

### **Option 1: With Node.js (Full Functionality)**
1. Run `setup-portable.sh` (Mac/Linux) or `setup-portable.bat` (Windows)
2. Load extension: `chrome://extensions/` → Load unpacked → select `extension/dist`
3. Open test page: `test-pages/mock-uber-eats.html`
4. Start backend: `cd backend && npm start`

### **Option 2: Without Node.js (Extension Only)**
1. Load extension: `chrome://extensions/` → Load unpacked → select `extension/dist`
2. Open test page: `test-pages/mock-uber-eats.html`
3. Test data capture (backend features won't work)

## 🎯 What's Included

- ✅ **Built Extension** - Ready to load in Chrome
- ✅ **Test Pages** - Mock Uber Eats Manager for testing
- ✅ **Backend Code** - For full functionality (requires Node.js)
- ✅ **Documentation** - All guides and instructions

## 📱 Testing Steps

1. **Load Extension**: Chrome → Extensions → Load unpacked → `extension/dist`
2. **Open Test Page**: Open `test-pages/mock-uber-eats.html` in Chrome
3. **Test Data Capture**: Click extension icon → Start Capturing Data
4. **Check Console**: F12 → Console to see capture logs
5. **Test Report**: Click Generate Report (if backend running)

## 🔧 Troubleshooting

- **Extension won't load**: Check Chrome extensions page for errors
- **No data captured**: Ensure you're on the test page and started capture
- **Backend won't start**: Install Node.js or use extension-only mode

## 📞 Support

- **GitHub**: https://github.com/nathanhui97/uber-eats-analytics
- **Issues**: Open an issue on GitHub
- **Documentation**: See all .md files in this directory
EOF

# Create zip file for easy transfer
echo "📦 Creating zip file..."
zip -r uber-eats-analytics-portable.zip $PORTABLE_DIR/

echo "✅ Portable version created successfully!"
echo ""
echo "📁 Directory: $PORTABLE_DIR/"
echo "📦 Zip file: uber-eats-analytics-portable.zip"
echo ""
echo "🚀 Next steps:"
echo "1. Copy $PORTABLE_DIR/ to USB drive or cloud storage"
echo "2. Transfer to work computer"
echo "3. Run setup-portable.sh (Mac/Linux) or setup-portable.bat (Windows)"
echo "4. Load extension in Chrome and test!"
echo ""
echo "🎯 Or simply copy the zip file and extract on work computer!"
