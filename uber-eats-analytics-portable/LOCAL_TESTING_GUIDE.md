# 🧪 Local Testing Guide

## 🎯 **Testing Strategy: Local First, Then Real**

This guide will help you test the Uber Eats Analytics extension locally before using it on real Uber Eats Manager pages.

## 📋 **Prerequisites**

✅ **Backend Server Running** (already done)
✅ **Extension Built** (already done)
✅ **Mock Test Page Created** (already done)

## 🚀 **Step 1: Load the Extension in Chrome**

1. **Open Chrome** and go to `chrome://extensions/`
2. **Enable "Developer mode"** (toggle in top right)
3. **Click "Load unpacked"**
4. **Select the `extension/dist` folder**
5. **Verify the extension appears** in your extensions list

## 🧪 **Step 2: Test with Mock Uber Eats Page**

1. **Open the mock page**: `extension/test-pages/mock-uber-eats.html`
   - Right-click the file → "Open with" → Chrome
   - Or drag the file into Chrome

2. **Verify the page loads** with test data:
   - Restaurant name: "Test Restaurant - Downtown Location"
   - Sales metrics: $2,847.50, 127 orders, etc.
   - Ad campaigns with spend/sales data
   - Active promotions

## 🔍 **Step 3: Test Extension Functionality**

### **A. Test Extension Loading**
1. **Click the extension icon** in Chrome toolbar
2. **Verify popup opens** with "Uber Eats Analytics" interface
3. **Check status**: Should show "Ready to capture data"

### **B. Test Data Capture**
1. **Click "Start Capturing Data"**
2. **Navigate between sections** (Dashboard, Sales, Ads, Promotions)
3. **Check console logs** (F12 → Console):
   ```
   🎯 Uber Eats Analytics: Found totalSales = 2847.5 using selector: [data-testid="total-sales"]
   📊 Uber Eats Analytics: Found 4 sales metrics: ["totalSales", "totalOrders", ...]
   ```

### **C. Test Debug Tools**
1. **Click "🔍 Debug Selectors"** in extension popup
2. **Check console** for detailed page analysis:
   ```
   🔍 Uber Eats Analytics: Debug Mode - Analyzing page structure...
   📋 Found 15 elements with data-testid: [...]
   💰 Found 8 sales-related elements: [...]
   💵 Found 12 elements with $: [...]
   ```

### **D. Test Report Generation**
1. **Click "Generate Report"**
2. **Check backend logs** for report processing
3. **Verify success message** in extension popup

## 📊 **Step 4: Verify Data Capture**

### **Expected Captured Data:**
```json
{
  "pageType": "dashboard",
  "data": {
    "restaurant": {
      "name": "Test Restaurant - Downtown Location",
      "id": "test-restaurant-123"
    },
    "sales": {
      "totalSales": 2847.5,
      "totalOrders": 127,
      "averageBasket": 22.42,
      "netDeliveryGross": 2278.0
    },
    "ads": {
      "adSpend": 77.5,
      "adSales": 275.0,
      "adOrders": 12,
      "impressions": 4270,
      "clicks": 42
    },
    "promotions": [
      {
        "name": "20% Off First Order",
        "type": "discount",
        "spend": 25.0,
        "sales": 120.0,
        "orders": 6
      }
    ]
  }
}
```

## 🐛 **Step 5: Troubleshooting**

### **Extension Not Loading:**
- Check `chrome://extensions/` for errors
- Reload the extension
- Check console for manifest errors

### **No Data Captured:**
- Verify you're on the mock page
- Check console for selector errors
- Use "Debug Selectors" button
- Ensure "Start Capturing Data" was clicked

### **Backend Connection Issues:**
- Verify backend is running: `curl http://localhost:3001/health`
- Check CORS settings
- Verify port 3001 is available

### **Report Generation Fails:**
- Check backend logs
- Verify captured data exists
- Test backend directly: `curl -X POST http://localhost:3001/api/test-data`

## ✅ **Step 6: Success Criteria**

**Local Testing is Complete When:**
- ✅ Extension loads without errors
- ✅ Mock page displays correctly
- ✅ Data capture works (console shows found metrics)
- ✅ Debug tools provide useful information
- ✅ Report generation completes successfully
- ✅ Backend processes data correctly

## 🚀 **Step 7: Ready for Real Testing**

Once local testing passes, you're ready to:

1. **Copy the extension** to your work computer
2. **Load it in Chrome** on work computer
3. **Navigate to real Uber Eats Manager**
4. **Use debug tools** to find real selectors
5. **Update selectors** based on real page structure
6. **Test with real data**

## 📝 **Testing Checklist**

- [ ] Extension loads in Chrome
- [ ] Mock page displays test data
- [ ] Extension popup opens correctly
- [ ] "Start Capturing Data" works
- [ ] Data is captured (check console)
- [ ] Debug selectors provides useful info
- [ ] Report generation works
- [ ] Backend processes data
- [ ] No critical errors in console

## 🎯 **Next Steps After Local Testing**

1. **Document any issues** found during local testing
2. **Fix any bugs** before real testing
3. **Prepare for real Uber Eats Manager testing**
4. **Use debug tools** to find real selectors
5. **Update selectors** for production use

---

**Ready to test?** Start with Step 1 and work through each step systematically!
