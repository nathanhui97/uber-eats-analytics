# Uber Eats Manager Portal - Data Selector Guide

This guide helps you identify the correct CSS selectors and data extraction points on the Uber Eats Manager portal.

## 🔍 How to Find the Right Selectors

### Step 1: Open Developer Tools
1. Navigate to the Uber Eats Manager portal
2. Press `F12` or right-click → "Inspect Element"
3. Go to the "Elements" tab

### Step 2: Use the Element Inspector
1. Click the element inspector tool (cursor icon)
2. Hover over the data you want to capture
3. The element will be highlighted in the DOM tree

### Step 3: Identify Selectors
Look for these attributes in order of preference:
1. `data-testid` - Most reliable
2. `data-*` attributes - Good for custom data
3. `class` names - Look for semantic names
4. `id` attributes - Unique identifiers
5. Text content - Use `:contains()` for text-based selection

## 📊 Key Data Points to Capture

### Sales Data
Look for these metrics on dashboard/analytics pages:

**Total Sales**
- Look for: "Total Sales", "Revenue", "Gross Sales"
- Common selectors: `[data-testid*="sales"]`, `.total-sales`, `.revenue`
- Format: Usually starts with `$` or currency symbol

**Total Orders**
- Look for: "Total Orders", "Order Count", "Orders"
- Common selectors: `[data-testid*="orders"]`, `.order-count`, `.total-orders`
- Format: Usually a number

**Average Basket/Order Value**
- Look for: "Average Order", "AOV", "Basket Size"
- Common selectors: `[data-testid*="average"]`, `.aov`, `.basket-size`
- Format: Usually starts with `$`

**Net Delivery Gross (NDG)**
- Look for: "Net Delivery Gross", "NDG", "Net Revenue"
- Common selectors: `[data-testid*="ndg"]`, `.net-delivery-gross`
- Format: Usually starts with `$` and may include percentage

### Advertising Data
Look for these metrics on ads/advertising pages:

**Ad Spend**
- Look for: "Ad Spend", "Advertising Cost", "Campaign Spend"
- Common selectors: `[data-testid*="spend"]`, `.ad-spend`, `.campaign-cost`
- Format: Usually starts with `$`

**Ad Sales/Revenue**
- Look for: "Ad Revenue", "Sales from Ads", "Attributed Sales"
- Common selectors: `[data-testid*="revenue"]`, `.ad-revenue`, `.attributed-sales`
- Format: Usually starts with `$`

**Impressions**
- Look for: "Impressions", "Views", "Reach"
- Common selectors: `[data-testid*="impressions"]`, `.impressions`, `.views`
- Format: Usually a large number

**Clicks**
- Look for: "Clicks", "Click-throughs"
- Common selectors: `[data-testid*="clicks"]`, `.clicks`, `.click-throughs`
- Format: Usually a number

**CTR (Click-Through Rate)**
- Look for: "CTR", "Click Rate", "Click-through Rate"
- Common selectors: `[data-testid*="ctr"]`, `.ctr`, `.click-rate`
- Format: Usually a percentage

### Promotion Data
Look for these metrics on promotions/offers pages:

**Promotion Name**
- Look for: Promotion titles, offer names
- Common selectors: `[data-testid*="promotion"]`, `.promotion-name`, `.offer-title`
- Format: Text content

**Promotion Type**
- Look for: "Discount", "Free Delivery", "BOGO", etc.
- Common selectors: `.promotion-type`, `.offer-type`
- Format: Text content

**Promotion Spend**
- Look for: "Promotion Cost", "Offer Spend", "Discount Cost"
- Common selectors: `[data-testid*="promotion-spend"]`, `.promotion-cost`
- Format: Usually starts with `$`

**Redemptions**
- Look for: "Redemptions", "Uses", "Claimed"
- Common selectors: `[data-testid*="redemptions"]`, `.redemptions`, `.uses`
- Format: Usually a number

## 🛠️ Testing Your Selectors

### Method 1: Browser Console
```javascript
// Test a selector
document.querySelector('[data-testid="total-sales"]')

// Test multiple selectors
['[data-testid="total-sales"]', '.total-sales', '[class*="sales"]'].forEach(selector => {
  const element = document.querySelector(selector);
  if (element) {
    console.log(`Found with ${selector}:`, element.textContent);
  }
});
```

### Method 2: Extension Testing
1. Load the extension in developer mode
2. Open the popup and start capturing
3. Navigate to different pages
4. Check the console for captured data

## 📝 Common Uber Eats Selector Patterns

### Dashboard/Overview Page
```css
/* Sales metrics */
[data-testid="dashboard-sales"]
[data-testid="total-revenue"]
[data-testid="order-count"]

/* KPI cards */
.dashboard-card
.kpi-card
.metric-card

/* Date range */
[data-testid="date-picker"]
.period-selector
```

### Analytics Page
```css
/* Charts and graphs */
[data-testid="sales-chart"]
[data-testid="orders-chart"]
.analytics-chart

/* Metrics table */
[data-testid="metrics-table"]
.analytics-table
```

### Ads Page
```css
/* Campaign data */
[data-testid="campaign-card"]
.ad-campaign
.campaign-item

/* Performance metrics */
[data-testid="campaign-performance"]
.ad-metrics
```

### Promotions Page
```css
/* Promotion cards */
[data-testid="promotion-card"]
.promotion-item
.offer-card

/* Promotion details */
[data-testid="promotion-details"]
.promotion-info
```

## 🔧 Updating the Data Extractor

When you find the correct selectors, update the `dataExtractor.ts` file:

```typescript
// Update the selectors object
const selectors = {
  totalSales: [
    '[data-testid="total-sales"]',        // Add your found selectors
    '.total-sales',
    '[class*="sales-total"]',
    // Add more selectors as needed
  ],
  // ... other selectors
};
```

## 🚨 Important Notes

1. **Uber Eats may change their UI** - Selectors might break with updates
2. **Test thoroughly** - Always verify selectors work on different pages
3. **Use multiple selectors** - Provide fallbacks for reliability
4. **Handle dynamic content** - Some data might load asynchronously
5. **Respect rate limits** - Don't make too many requests too quickly

## 📋 Checklist for Each Page Type

### Dashboard Page
- [ ] Total sales amount
- [ ] Total orders count
- [ ] Average order value
- [ ] Net delivery gross
- [ ] Date range selector
- [ ] Restaurant name

### Sales/Analytics Page
- [ ] Sales breakdown by period
- [ ] Order trends
- [ ] Revenue metrics
- [ ] Performance indicators

### Ads Page
- [ ] Campaign spend
- [ ] Ad revenue
- [ ] Impressions and clicks
- [ ] CTR and CPC
- [ ] Campaign performance

### Promotions Page
- [ ] Active promotions list
- [ ] Promotion spend
- [ ] Redemption counts
- [ ] Promotion performance

## 🎯 Pro Tips

1. **Use browser extensions** like "SelectorGadget" to quickly identify selectors
2. **Check network requests** to see if data comes from API calls
3. **Look for data attributes** that might contain structured data
4. **Test on different browsers** to ensure compatibility
5. **Monitor for changes** - Set up alerts for selector failures

Remember: The goal is to capture the data merchants need to make informed decisions about their Uber Eats performance, ads, and promotions.
