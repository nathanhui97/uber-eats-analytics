# 💾 Portable Setup Guide for Work Computer

## 🎯 **Problem**: Work computer has no local storage
## ✅ **Solution**: Use portable/cloud-based setup

## 🚀 **Option 1: USB Drive Setup (Recommended)**

### **Step 1: Prepare on Your Personal Computer**
1. **Copy the entire project** to a USB drive
2. **Include all files**:
   ```
   uber-eats-analytics/
   ├── backend/
   ├── extension/
   ├── shared/
   ├── test-pages/
   ├── package.json
   ├── README.md
   └── all other files
   ```

### **Step 2: On Work Computer**
1. **Insert USB drive**
2. **Navigate to the project folder**
3. **Follow the testing steps** (same as local)

## ☁️ **Option 2: Cloud Storage (Google Drive, Dropbox, etc.)**

### **Step 1: Upload to Cloud**
1. **Upload the entire project** to Google Drive/Dropbox
2. **Make sure all files** are included
3. **Test that files** can be downloaded

### **Step 2: On Work Computer**
1. **Download the project** from cloud storage
2. **Extract to a temporary folder**
3. **Follow testing steps**

## 🌐 **Option 3: GitHub Clone (Best for Development)**

### **Step 1: Push to GitHub** (already done!)
```bash
# Your project is already on GitHub:
# https://github.com/nathanhui97/uber-eats-analytics
```

### **Step 2: On Work Computer**
```bash
# Clone the repository
git clone https://github.com/nathanhui97/uber-eats-analytics.git
cd uber-eats-analytics

# Install dependencies
npm run install:all

# Build extension
cd extension && npm run build

# Start backend
cd ../backend && npm start
```

## 📱 **Option 4: Browser-Based Testing (No Installation)**

### **Step 1: Use GitHub Pages or Similar**
1. **Upload the test files** to a web server
2. **Access via URL** on work computer
3. **Test extension** by loading from URL

### **Step 2: Alternative - Use GitHub Raw URLs**
- **Test page**: `https://raw.githubusercontent.com/nathanhui97/uber-eats-analytics/main/extension/test-pages/mock-uber-eats.html`
- **Extension**: Download and load from GitHub

## 🎯 **Recommended Approach for Work Computer:**

### **Quick Setup (5 minutes):**
1. **Go to**: https://github.com/nathanhui97/uber-eats-analytics
2. **Click "Code" → "Download ZIP"**
3. **Extract ZIP** to desktop
4. **Open Chrome** → `chrome://extensions/`
5. **Load unpacked** → Select `extension/dist` folder
6. **Open test page** from extracted files

### **Full Setup (10 minutes):**
1. **Clone repository** (if git is available)
2. **Install dependencies** with npm
3. **Build and test** as normal

## 🔧 **Work Computer Specific Considerations:**

### **If No Admin Rights:**
- **Use portable Node.js** (no installation required)
- **Use portable Chrome** (if allowed)
- **Use browser-based testing** only

### **If No Internet Access:**
- **USB drive** is your best option
- **Pre-build everything** on personal computer
- **Copy built files** to USB

### **If No npm/Node.js:**
- **Pre-build extension** on personal computer
- **Copy built files** to work computer
- **Use browser-based backend** (if possible)

## 📋 **Quick Test Checklist for Work Computer:**

- [ ] Project files accessible
- [ ] Chrome can load extension
- [ ] Test page opens correctly
- [ ] Extension popup works
- [ ] Data capture functions
- [ ] Backend accessible (if running)

## 🚀 **Immediate Next Steps:**

1. **Choose your preferred method** (USB, cloud, or GitHub)
2. **Prepare the files** on your personal computer
3. **Transfer to work computer**
4. **Follow the testing guide**
5. **Test on real Uber Eats Manager**

---

**Which option works best for your work computer setup?** Let me know and I can provide more specific instructions!
