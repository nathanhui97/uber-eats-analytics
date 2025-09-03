# Data Selector Research Guide

## 🎯 How to Find Real Uber Eats Manager Data Selectors

### Step 1: Access Uber Eats Manager
1. Go to [manager.ubereats.com](https://manager.ubereats.com)
2. Log in with your restaurant account
3. Navigate to different sections (Dashboard, Sales, Ads, Promotions)

### Step 2: Use Browser Developer Tools
1. **Open Developer Tools**: Press `F12` or right-click → "Inspect"
2. **Go to Elements Tab**: This shows the HTML structure
3. **Use Element Inspector**: Click the cursor icon (top-left) to hover over elements

### Step 3: Find Data Elements
Look for these key metrics on each page:

#### 📊 Dashboard Page
- **Total Sales**: Look for dollar amounts, revenue figures
- **Total Orders**: Order count numbers
- **Average Order Value**: AOV, basket size
- **Net Delivery Gross**: NDG percentage or amount

#### 📈 Sales/Analytics Page
- **Sales Breakdown**: Daily/weekly/monthly sales
- **Order Metrics**: Order counts, completion rates
- **Revenue Data**: Gross sales, net sales, fees

#### 📢 Ads/Advertising Page
- **Ad Spend**: Campaign budget, daily spend
- **Ad Performance**: Impressions, clicks, conversions
- **ROI Metrics**: Return on ad spend, cost per acquisition

#### 🎁 Promotions Page
- **Active Promotions**: Current offers and campaigns
- **Promotion Spend**: Cost of running promotions
- **Redemption Data**: Usage statistics, conversion rates

### Step 4: Identify Selectors
When you find a data element:

1. **Right-click** on the element
2. **Select "Inspect Element"**
3. **Look for these attributes** (in order of preference):
   - `data-testid="..."` (most reliable)
   - `data-*` attributes
   - `class` names
   - `id` attributes
   - Text content patterns

### Step 5: Test Selectors
```javascript
// Test in browser console
document.querySelector('[data-testid="total-sales"]')
document.querySelector('.sales-total')
document.querySelector('[class*="revenue"]')
```

### Step 6: Common Selector Patterns

#### Sales Data Selectors
```css
/* Look for these patterns */
[data-testid*="sales"]
[data-testid*="revenue"]
[data-testid*="orders"]
[class*="sales"]
[class*="revenue"]
[class*="orders"]

/* Text-based selectors */
div:contains("Total Sales")
span:contains("$")
div:contains("Orders")
```

#### Ad Data Selectors
```css
/* Advertising metrics */
[data-testid*="ad"]
[data-testid*="campaign"]
[data-testid*="spend"]
[class*="ad"]
[class*="campaign"]
[class*="spend"]

/* Performance metrics */
[data-testid*="impression"]
[data-testid*="click"]
[data-testid*="conversion"]
```

#### Promotion Data Selectors
```css
/* Promotion elements */
[data-testid*="promotion"]
[data-testid*="offer"]
[class*="promotion"]
[class*="offer"]

/* Promotion cards */
.promotion-card
.offer-card
[class*="promo"]
```

### Step 7: Update Your Code
Once you find working selectors, update `extension/src/dataExtractor.ts`:

```typescript
const selectors = {
  totalSales: [
    '[data-testid="total-sales"]',        // Your found selector
    '.sales-total',                       // Fallback
    '[class*="revenue"]',                 // Another fallback
    'div:contains("Total Sales")'         // Text-based fallback
  ],
  // ... other selectors
};
```

### Step 8: Handle Dynamic Content
Uber Eats uses dynamic loading, so:

1. **Wait for content**: Use `setTimeout` or `MutationObserver`
2. **Retry logic**: Try multiple times if element not found
3. **Fallback selectors**: Always have multiple selector options

### Step 9: Test and Validate
1. **Load extension** in Chrome
2. **Navigate** to Uber Eats Manager pages
3. **Check console** for capture logs
4. **Verify data** is being extracted correctly

### 🔍 Pro Tips

1. **Use Multiple Selectors**: Always provide fallbacks
2. **Test on Different Pages**: Selectors may vary by page
3. **Handle Loading States**: Wait for content to load
4. **Monitor Changes**: Uber Eats may update their interface
5. **Use Data Attributes**: `data-testid` is most reliable
6. **Text Content**: Sometimes text-based selectors work best

### 🚨 Common Issues

1. **Dynamic Loading**: Content loads after page load
2. **SPA Navigation**: URL changes without page reload
3. **Multiple Restaurants**: Selectors may vary by account
4. **A/B Testing**: Uber Eats may show different interfaces
5. **Mobile vs Desktop**: Different layouts

### 📝 Example Research Session

1. Go to Dashboard page
2. Open DevTools → Elements
3. Hover over "Total Sales: $1,234.56"
4. See HTML: `<div data-testid="dashboard-sales-total" class="metric-value">$1,234.56</div>`
5. Test: `document.querySelector('[data-testid="dashboard-sales-total"]')`
6. Add to selectors: `'[data-testid="dashboard-sales-total"]'`

### 🔄 Maintenance

- **Regular Updates**: Check selectors monthly
- **Version Control**: Track selector changes
- **User Feedback**: Report when selectors break
- **Automated Testing**: Test selectors in CI/CD

---

**Remember**: The key is to inspect the actual Uber Eats Manager interface and find the real selectors that work with their current implementation!
