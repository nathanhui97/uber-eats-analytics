# Uber Eats Analytics Tool

A lightweight analytics tool for restaurants that plugs directly into the Uber Eats Manager portal via a browser extension. Capture key performance data, generate actionable reports, and make smarter ad/promo decisions in minutes, not hours.

## 🚀 Features

- **Automatic Data Capture**: Quietly captures sales, ads, and promotion data as you navigate the Uber Eats Manager portal
- **One-Click Reports**: Generate comprehensive weekly PDF/email digests with actionable insights
- **Smart Analytics**: Calculate ROI, NDG%, and other key metrics automatically
- **Actionable Recommendations**: Get 3 specific bullet points on what to do next week
- **Email Delivery**: Receive reports directly in your inbox
- **PDF Export**: Download detailed reports for offline viewing

## 📊 What Data We Capture

### Sales Metrics
- Total Sales
- Total Orders
- Average Basket Size
- Net Delivery Gross (NDG)
- NDG Percentage

### Advertising Performance
- Ad Spend
- Ad Sales
- Ad ROI
- Impressions & Clicks
- CTR & CPC

### Promotion Analytics
- Promotion Spend
- Promotion Sales
- Promotion ROI
- Redemption Counts
- Performance by Offer Type

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Chrome or Edge browser
- Uber Eats Manager account access

### 1. Install Dependencies

```bash
# Install all dependencies
npm run install:all
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# Backend Configuration
PORT=3001
NODE_ENV=development

# Email Configuration (optional - for email reports)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@your-domain.com

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3001,chrome-extension://*
```

### 3. Build the Extension

```bash
# Build the browser extension
cd extension
npm run build
```

### 4. Load the Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension/dist` folder
5. The extension should now appear in your extensions list

### 5. Start the Backend Server

```bash
# Start the backend API
cd backend
npm run dev
```

The backend will be available at `http://localhost:3001`

### 6. Test the Setup

1. Navigate to the Uber Eats Manager portal
2. Click the extension icon in your browser toolbar
3. Click "Start Capturing Data"
4. Navigate through different pages (Dashboard, Sales, Ads, Promotions)
5. Click "Generate Report" to test the full workflow

## 🎯 How to Use

### Step 1: Start Data Capture
1. Navigate to the Uber Eats Manager portal
2. Click the extension icon (UE Analytics)
3. Click "Start Capturing Data"
4. The extension will now quietly capture data as you browse

### Step 2: Navigate Through Pages
Visit these key pages to capture comprehensive data:
- **Dashboard/Overview**: Core sales metrics
- **Sales/Analytics**: Detailed sales breakdown
- **Ads/Advertising**: Campaign performance
- **Promotions/Offers**: Promotion analytics

### Step 3: Generate Report
1. Click "Generate Report" in the extension popup
2. Optionally enter your email for delivery
3. The system will:
   - Process all captured data
   - Calculate KPIs and ROI metrics
   - Generate actionable recommendations
   - Create a PDF report
   - Send email (if requested)

## 🔧 Customizing Data Selectors

The extension needs to know where to find data on the Uber Eats Manager portal. Since Uber Eats may change their interface, you might need to update the selectors.

### Finding the Right Selectors

1. **Open Developer Tools** (F12) on the Uber Eats Manager page
2. **Use the Element Inspector** to hover over data points
3. **Look for these attributes** in order of preference:
   - `data-testid` (most reliable)
   - `data-*` attributes
   - `class` names
   - `id` attributes

### Common Selector Patterns

```css
/* Sales data */
[data-testid="total-sales"]
[data-testid="total-orders"]
[data-testid="average-basket"]

/* Ad data */
[data-testid="ad-spend"]
[data-testid="ad-sales"]
[data-testid="impressions"]

/* Promotion data */
[data-testid="promotion-card"]
[data-testid="promotion-spend"]
```

### Updating Selectors

Edit `extension/src/dataExtractor.ts` and update the `selectors` objects:

```typescript
const selectors = {
  totalSales: [
    '[data-testid="total-sales"]',  // Add your found selectors
    '.total-sales',
    '[class*="sales-total"]',
    // Add more fallbacks
  ],
  // ... other selectors
};
```

See `SELECTOR_GUIDE.md` for detailed instructions.

## 📁 Project Structure

```
uber-eats-analytics/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── tsconfig.json
├── extension/              # Browser extension
│   ├── src/
│   │   ├── contentScript.ts    # Runs on Uber Eats pages
│   │   ├── popup.ts           # Extension popup UI
│   │   ├── background.ts      # Background script
│   │   └── dataExtractor.ts   # Data extraction logic
│   ├── manifest.json
│   ├── popup.html
│   └── webpack.config.js
├── shared/                 # Shared types
│   └── types.ts
├── SELECTOR_GUIDE.md       # Detailed selector guide
└── README.md
```

## 🚨 Important Notes

### Data Privacy
- All data processing happens locally or on your own server
- No data is sent to third parties
- You control your own data and reports

### Uber Eats Terms of Service
- This tool is for legitimate business analytics
- Respect Uber Eats' terms of service
- Don't overload their servers with requests

### Browser Compatibility
- Tested on Chrome and Edge
- Requires Manifest V3 support
- May need updates for other browsers

## 🔧 Development

### Running in Development Mode

```bash
# Start both backend and extension in watch mode
npm run dev
```

### Building for Production

```bash
# Build everything
npm run build
```

### Testing

```bash
# Test the backend API
curl -X POST http://localhost:3001/api/test-data

# Test report generation
curl -X POST http://localhost:3001/api/generate-report \
  -H "Content-Type: application/json" \
  -d '{"capturedData": [], "email": "test@example.com"}'
```

## 🐛 Troubleshooting

### Extension Not Working
1. Check that the extension is loaded in `chrome://extensions/`
2. Verify you're on a supported Uber Eats Manager page
3. Check the browser console for errors
4. Try refreshing the page

### Data Not Capturing
1. Verify selectors in `dataExtractor.ts`
2. Check if Uber Eats changed their interface
3. Use browser dev tools to find new selectors
4. Update the selector arrays

### Backend Errors
1. Check that the server is running on port 3001
2. Verify environment variables are set
3. Check server logs for detailed error messages
4. Ensure all dependencies are installed

### Email Not Sending
1. Verify SMTP credentials in `.env`
2. Check if your email provider requires app passwords
3. Test SMTP connection separately
4. Check server logs for email errors

## 📈 Roadmap

- [ ] Support for multiple restaurants
- [ ] Historical data tracking
- [ ] Advanced analytics and forecasting
- [ ] Integration with other delivery platforms
- [ ] Mobile app companion
- [ ] Automated weekly reports
- [ ] Custom dashboard interface

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the selector guide
3. Open an issue on GitHub
4. Contact support

---

**Built for restaurant owners who want to make data-driven decisions without the complexity of traditional analytics tools.**
