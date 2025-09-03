// Data extraction logic for Uber Eats Manager portal
// This file contains selectors and extraction logic for different pages

export interface PageData {
  pageType: 'dashboard' | 'sales' | 'ads' | 'promotions' | 'analytics';
  url: string;
  data: any;
  timestamp: string;
}

export class UberEatsDataExtractor {
  private static instance: UberEatsDataExtractor;
  private navigationQueue: string[] = [];
  private currentNavigationIndex: number = 0;
  private isNavigating: boolean = false;
  
  public static getInstance(): UberEatsDataExtractor {
    if (!UberEatsDataExtractor.instance) {
      UberEatsDataExtractor.instance = new UberEatsDataExtractor();
    }
    return UberEatsDataExtractor.instance;
  }

  // Detect which page we're on based on URL patterns
  detectPageType(url: string): string {
    // Check for hash-based navigation (mock page)
    if (url.includes('#dashboard')) return 'dashboard';
    if (url.includes('#sales')) return 'sales';
    if (url.includes('#ads')) return 'ads';
    if (url.includes('#promotions')) return 'promotions';
    if (url.includes('#analytics')) return 'analytics';
    
    // Check for path-based navigation (real Uber Eats)
    if (url.includes('/dashboard') || url.includes('/overview')) return 'dashboard';
    if (url.includes('/sales') || url.includes('/orders')) return 'sales';
    if (url.includes('/ads') || url.includes('/advertising')) return 'ads';
    if (url.includes('/promotions') || url.includes('/offers')) return 'promotions';
    if (url.includes('/analytics') || url.includes('/insights')) return 'analytics';
    
    // For mock page, also check current hash
    if (window.location.hash) {
      const hash = window.location.hash;
      if (hash === '#dashboard') return 'dashboard';
      if (hash === '#sales') return 'sales';
      if (hash === '#ads') return 'ads';
      if (hash === '#promotions') return 'promotions';
      if (hash === '#analytics') return 'analytics';
    }
    
    return 'unknown';
  }

  // Extract sales data from various pages
  extractSalesData(): any {
    console.log('🔍 Uber Eats Analytics: Starting sales data extraction...');
    const salesData: any = {
      totalSales: null,
      totalOrders: null,
      averageBasket: null,
      netDeliveryGross: null,
      netDeliveryGrossPercentage: null,
      dateRange: null
    };

    // Enhanced selectors for sales data - based on common Uber Eats patterns
    const selectors = {
      totalSales: [
        // Data test IDs (most reliable)
        '[data-testid*="sales"]',
        '[data-testid*="revenue"]',
        '[data-testid*="total"]',
        '[data-testid="dashboard-sales-total"]',
        '[data-testid="sales-total"]',
        
        // Class-based selectors
        '[class*="sales"]',
        '[class*="revenue"]',
        '[class*="total"]',
        '.sales-total',
        '.revenue-total',
        '.metric-value',
        
        // Text-based selectors (fallback)
        '[aria-label*="sales"]',
        '[aria-label*="revenue"]'
      ],
      totalOrders: [
        // Data test IDs
        '[data-testid*="orders"]',
        '[data-testid*="order-count"]',
        '[data-testid="dashboard-orders-total"]',
        
        // Class-based selectors
        '[class*="orders"]',
        '[class*="order-count"]',
        '.orders-total',
        '.order-count',
        
        // Text-based selectors
        '[aria-label*="orders"]'
      ],
      averageBasket: [
        // Data test IDs
        '[data-testid*="basket"]',
        '[data-testid*="average"]',
        '[data-testid*="aov"]',
        
        // Class-based selectors
        '[class*="basket"]',
        '[class*="average"]',
        '[class*="aov"]',
        '.average-basket',
        '.aov',
        
        // Text-based selectors
        '[aria-label*="average"]',
        '[aria-label*="basket"]'
      ],
      netDeliveryGross: [
        // Data test IDs
        '[data-testid*="ndg"]',
        '[data-testid*="net-delivery"]',
        '[data-testid*="gross"]',
        
        // Class-based selectors
        '[class*="ndg"]',
        '[class*="net-delivery"]',
        '[class*="gross"]',
        '.ndg',
        '.net-delivery-gross',
        
        // Text-based selectors
        '[aria-label*="net delivery"]'
      ]
    };

    // Try to extract each metric with debugging
    Object.keys(selectors).forEach(key => {
      for (const selector of (selectors as any)[key]) {
        const element = document.querySelector(selector);
        if (element) {
          const value = this.extractNumericValue(element.textContent || '');
          (salesData as any)[key] = value;
          console.log(`🎯 Uber Eats Analytics: Found ${key} = ${value} using selector: ${selector}`);
          break;
        }
      }
    });

    // Direct test for the specific element we know exists
    const directTest = document.querySelector('[data-testid="total-sales"]');
    if (directTest) {
      const directValue = this.extractNumericValue(directTest.textContent || '');
      console.log(`🎯 Uber Eats Analytics: Direct test found total-sales element with value: ${directValue}`);
      if (!salesData.totalSales) {
        salesData.totalSales = directValue;
      }
    } else {
      console.log('❌ Uber Eats Analytics: Direct test - total-sales element NOT found');
    }

    // Fallback: Try text-based search for common patterns
    if (!salesData.totalSales) {
      const totalSalesElement = this.findElementByText('Total Sales');
      if (totalSalesElement) {
        salesData.totalSales = this.extractNumericValue(totalSalesElement.textContent || '');
        console.log(`🎯 Uber Eats Analytics: Found totalSales = ${salesData.totalSales} using text search`);
      }
    }

    if (!salesData.averageBasket) {
      const avgBasketElement = this.findElementByText('Average Basket') || this.findElementByText('AOV');
      if (avgBasketElement) {
        salesData.averageBasket = this.extractNumericValue(avgBasketElement.textContent || '');
        console.log(`🎯 Uber Eats Analytics: Found averageBasket = ${salesData.averageBasket} using text search`);
      }
    }

    if (!salesData.netDeliveryGross) {
      const ndgElement = this.findElementByText('Net Delivery Gross') || this.findElementByText('NDG');
      if (ndgElement) {
        salesData.netDeliveryGross = this.extractNumericValue(ndgElement.textContent || '');
        console.log(`🎯 Uber Eats Analytics: Found netDeliveryGross = ${salesData.netDeliveryGross} using text search`);
      }
    }

    // Log what we found
    const foundMetrics = Object.keys(salesData).filter(key => salesData[key] !== null);
    console.log(`📊 Uber Eats Analytics: Found ${foundMetrics.length} sales metrics:`, foundMetrics);

    return salesData;
  }

  // Extract advertising data
  extractAdData(): any {
    const adData: any = {
      adSpend: null,
      adSales: null,
      adOrders: null,
      adROI: null,
      impressions: null,
      clicks: null,
      ctr: null,
      cpc: null
    };

    const selectors = {
      adSpend: [
        '[data-testid="ad-spend"]',
        '.ad-spend',
        '[class*="spend"]',
        'div:contains("Ad Spend")'
      ],
      adSales: [
        '[data-testid="ad-sales"]',
        '.ad-sales',
        '[class*="ad-revenue"]',
        'div:contains("Ad Sales")'
      ],
      adOrders: [
        '[data-testid="ad-orders"]',
        '.ad-orders',
        '[class*="ad-orders"]',
        'div:contains("Ad Orders")'
      ],
      impressions: [
        '[data-testid="impressions"]',
        '.impressions',
        '[class*="impressions"]',
        'div:contains("Impressions")'
      ],
      clicks: [
        '[data-testid="clicks"]',
        '.clicks',
        '[class*="clicks"]',
        'div:contains("Clicks")'
      ]
    };

    Object.keys(selectors).forEach(key => {
      for (const selector of (selectors as any)[key]) {
        const element = document.querySelector(selector);
        if (element) {
          (adData as any)[key] = this.extractNumericValue(element.textContent || '');
          break;
        }
      }
    });

    // Calculate derived metrics
    if (adData.adSpend && adData.adSales) {
      adData.adROI = ((adData.adSales - adData.adSpend) / adData.adSpend) * 100;
    }
    if (adData.impressions && adData.clicks) {
      adData.ctr = (adData.clicks / adData.impressions) * 100;
    }
    if (adData.adSpend && adData.clicks) {
      adData.cpc = adData.adSpend / adData.clicks;
    }

    return adData;
  }

  // Extract promotion data
  extractPromotionData(): any[] {
    const promotions: any[] = [];
    
    // Look for promotion cards or tables
    const promotionSelectors = [
      '[data-testid="promotion-card"]',
      '.promotion-card',
      '[class*="promotion"]',
      '.offer-card'
    ];

    promotionSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const promotion: any = {
          name: this.extractText(element, [
            '[data-testid="promotion-name"]',
            '.promotion-name',
            'h3',
            'h4'
          ]),
          type: this.detectPromotionType(element),
          spend: this.extractNumericValue(this.extractText(element, [
            '[data-testid="promotion-spend"]',
            '.spend',
            '[class*="cost"]'
          ])),
          sales: this.extractNumericValue(this.extractText(element, [
            '[data-testid="promotion-sales"]',
            '.sales',
            '[class*="revenue"]'
          ])),
          orders: this.extractNumericValue(this.extractText(element, [
            '[data-testid="promotion-orders"]',
            '.orders',
            '[class*="orders"]'
          ])),
          redemptions: this.extractNumericValue(this.extractText(element, [
            '[data-testid="redemptions"]',
            '.redemptions',
            '[class*="redemption"]'
          ]))
        };

        if (promotion.name && (promotion.spend || promotion.sales)) {
          if (promotion.spend && promotion.sales) {
            promotion.roi = ((promotion.sales - promotion.spend) / promotion.spend) * 100;
          }
          promotions.push(promotion);
        }
      });
    });

    return promotions;
  }

  // Extract restaurant information
  extractRestaurantInfo(): any {
    return {
      name: this.extractText(document, [
        '[data-testid="restaurant-name"]',
        '.restaurant-name',
        'h1',
        '.header-title'
      ]),
      id: this.extractRestaurantId(),
      currentPeriod: this.extractDateRange()
    };
  }

  // Helper methods
  private extractNumericValue(text: string): number | null {
    if (!text) return null;
    
    // Remove currency symbols, commas, and extract number
    const cleaned = text.replace(/[$,\s]/g, '');
    const match = cleaned.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : null;
  }

  // Find element by text content
  private findElementByText(searchText: string): Element | null {
    const allElements = document.querySelectorAll('*');
    for (let i = 0; i < allElements.length; i++) {
      const element = allElements[i];
      if (element.textContent?.includes(searchText)) {
        // Look for a sibling element that contains a dollar amount
        const parent = element.parentElement;
        if (parent) {
          const siblings = parent.children;
          for (let j = 0; j < siblings.length; j++) {
            const sibling = siblings[j] as Element;
            if (sibling.textContent?.includes('$')) {
              return sibling;
            }
          }
        }
        // If no sibling with $ found, return the element itself
        return element;
      }
    }
    return null;
  }

  private extractText(element: Element | Document, selectors: string[]): string {
    for (const selector of selectors) {
      const found = element.querySelector(selector);
      if (found) {
        return found.textContent?.trim() || '';
      }
    }
    return '';
  }

  private detectPromotionType(element: Element): string {
    const text = element.textContent?.toLowerCase() || '';
    if (text.includes('discount') || text.includes('% off')) return 'discount';
    if (text.includes('free delivery')) return 'free_delivery';
    if (text.includes('buy one') || text.includes('bogo')) return 'bogo';
    return 'other';
  }

  private extractRestaurantId(): string | null {
    // Try to extract from URL or data attributes
    const url = window.location.href;
    const match = url.match(/restaurant\/([^\/]+)/);
    if (match) return match[1];

    // Try data attributes
    const element = document.querySelector('[data-restaurant-id]');
    return element?.getAttribute('data-restaurant-id') || null;
  }

  private extractDateRange(): any {
    // Look for date range selectors
    const dateSelectors = [
      '[data-testid="date-range"]',
      '.date-range',
      '.period-selector',
      '[class*="date-picker"]'
    ];

    for (const selector of dateSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent || '';
        // Try to parse date range
        const dates = text.match(/(\d{1,2}\/\d{1,2}\/\d{4})/g);
        if (dates && dates.length >= 2) {
          return {
            startDate: dates[0],
            endDate: dates[1]
          };
        }
      }
    }

    return null;
  }

  // Debug method to help research selectors
  debugSelectors(): void {
    console.log('🔍 Uber Eats Analytics: Debug Mode - Analyzing page structure...');
    
    // Find all elements with data-testid
    const testIdElements = document.querySelectorAll('[data-testid]');
    console.log(`📋 Found ${testIdElements.length} elements with data-testid:`, 
      Array.from(testIdElements).map(el => ({
        testid: el.getAttribute('data-testid'),
        text: el.textContent?.trim().substring(0, 50),
        tag: el.tagName
      }))
    );

    // Find elements with sales-related classes
    const salesElements = document.querySelectorAll('[class*="sales"], [class*="revenue"], [class*="total"]');
    console.log(`💰 Found ${salesElements.length} sales-related elements:`, 
      Array.from(salesElements).map(el => ({
        classes: el.className,
        text: el.textContent?.trim().substring(0, 50),
        tag: el.tagName
      }))
    );

    // Find elements containing dollar signs
    const dollarElements = Array.from(document.querySelectorAll('*')).filter(el => 
      el.textContent?.includes('$') && el.textContent.length < 100
    );
    console.log(`💵 Found ${dollarElements.length} elements with $:`, 
      dollarElements.map(el => ({
        text: el.textContent?.trim(),
        tag: el.tagName,
        classes: el.className
      }))
    );
  }

  // Main extraction method
  extractAllData(): PageData {
    const pageType = this.detectPageType(window.location.href);
    console.log(`🔍 Uber Eats Analytics: Detected page type: ${pageType} for URL: ${window.location.href}`);
    const restaurantInfo = this.extractRestaurantInfo();
    
    let data: any = {
      restaurant: restaurantInfo,
      timestamp: new Date().toISOString()
    };

    // Extract data based on page type
    switch (pageType) {
      case 'dashboard':
        data.sales = this.extractSalesData();
        data.ads = this.extractAdData();
        data.promotions = this.extractPromotionData();
        break;
      case 'sales':
        data.sales = this.extractSalesData();
        break;
      case 'ads':
        data.ads = this.extractAdData();
        break;
      case 'promotions':
        data.promotions = this.extractPromotionData();
        break;
      case 'analytics':
        data.sales = this.extractSalesData();
        data.ads = this.extractAdData();
        data.promotions = this.extractPromotionData();
        break;
    }

    return {
      pageType: pageType as 'dashboard' | 'sales' | 'ads' | 'promotions' | 'analytics',
      url: window.location.href,
      data,
      timestamp: new Date().toISOString()
    };
  }

  // Auto-navigation methods
  startAutoNavigation(): void {
    // Check if we're on localhost (mock page) or real Uber Eats Manager
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isLocalhost) {
      // For mock page, use hash-based navigation
      this.navigationQueue = [
        '#dashboard',
        '#sales', 
        '#ads',
        '#promotions'
      ];
    } else {
      // For real Uber Eats Manager, use path-based navigation
      this.navigationQueue = [
        '/dashboard',
        '/sales', 
        '/ads',
        '/promotions',
        '/analytics'
      ];
    }
    
    this.currentNavigationIndex = 0;
    this.isNavigating = true;
    console.log('🚀 Starting auto-navigation through Uber Eats Manager pages...');
    this.navigateToNextPage();
  }

  stopAutoNavigation(): void {
    this.isNavigating = false;
    this.navigationQueue = [];
    this.currentNavigationIndex = 0;
    console.log('⏹️ Auto-navigation stopped');
  }

  private navigateToNextPage(): void {
    if (!this.isNavigating || this.currentNavigationIndex >= this.navigationQueue.length) {
      this.isNavigating = false;
      console.log('✅ Auto-navigation completed!');
      return;
    }

    const targetPath = this.navigationQueue[this.currentNavigationIndex];
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    console.log(`📍 Navigating to: ${targetPath}`);
    
    if (isLocalhost && targetPath.startsWith('#')) {
      // For mock page, use hash-based navigation
      window.location.hash = targetPath;
      
      // Also click the corresponding nav link to update the UI
      const navLink = document.querySelector(`[data-testid="nav-${targetPath.substring(1)}"]`) as HTMLAnchorElement;
      if (navLink) {
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        // Add active class to current nav link
        navLink.classList.add('active');
      }
    } else {
      // For real Uber Eats Manager, use path-based navigation
      const currentUrl = new URL(window.location.href);
      const targetUrl = `${currentUrl.origin}${targetPath}`;
      window.location.href = targetUrl;
    }
  }

  // Call this when a page loads to continue navigation
  onPageLoad(): void {
    if (this.isNavigating) {
      // Wait a bit for the page to fully load, then capture data and move to next page
      setTimeout(() => {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const currentLocation = isLocalhost ? window.location.hash : window.location.pathname;
        
        console.log(`📊 Capturing data from: ${currentLocation}`);
        // Capture data from current page
        const pageData = this.extractAllData();
        console.log('📈 Data captured:', pageData);
        
        // Move to next page
        this.currentNavigationIndex++;
        this.navigateToNextPage();
      }, 2000); // Wait 2 seconds for page to load
    }
  }

  isAutoNavigating(): boolean {
    return this.isNavigating;
  }

  getNavigationProgress(): { current: number; total: number; currentPage: string } {
    return {
      current: this.currentNavigationIndex + 1,
      total: this.navigationQueue.length,
      currentPage: this.navigationQueue[this.currentNavigationIndex] || 'Complete'
    };
  }
}
