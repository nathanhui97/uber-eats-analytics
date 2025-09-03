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
  
  public static getInstance(): UberEatsDataExtractor {
    if (!UberEatsDataExtractor.instance) {
      UberEatsDataExtractor.instance = new UberEatsDataExtractor();
    }
    return UberEatsDataExtractor.instance;
  }

  // Detect which page we're on based on URL patterns
  detectPageType(url: string): string {
    if (url.includes('/dashboard') || url.includes('/overview')) return 'dashboard';
    if (url.includes('/sales') || url.includes('/orders')) return 'sales';
    if (url.includes('/ads') || url.includes('/advertising')) return 'ads';
    if (url.includes('/promotions') || url.includes('/offers')) return 'promotions';
    if (url.includes('/analytics') || url.includes('/insights')) return 'analytics';
    return 'unknown';
  }

  // Extract sales data from various pages
  extractSalesData(): any {
    const salesData: any = {
      totalSales: null,
      totalOrders: null,
      averageBasket: null,
      netDeliveryGross: null,
      netDeliveryGrossPercentage: null,
      dateRange: null
    };

    // Common selectors for sales data (these need to be updated based on actual Uber Eats structure)
    const selectors = {
      totalSales: [
        '[data-testid="total-sales"]',
        '.total-sales',
        '[class*="sales-total"]',
        'div:contains("Total Sales")',
        'span:contains("$")'
      ],
      totalOrders: [
        '[data-testid="total-orders"]',
        '.total-orders',
        '[class*="orders-total"]',
        'div:contains("Total Orders")'
      ],
      averageBasket: [
        '[data-testid="average-basket"]',
        '.average-basket',
        '[class*="basket-average"]',
        'div:contains("Average Order")'
      ],
      netDeliveryGross: [
        '[data-testid="net-delivery-gross"]',
        '.net-delivery-gross',
        '[class*="ndg"]',
        'div:contains("Net Delivery Gross")'
      ]
    };

    // Try to extract each metric
    Object.keys(selectors).forEach(key => {
      for (const selector of selectors[key]) {
        const element = document.querySelector(selector);
        if (element) {
          salesData[key] = this.extractNumericValue(element.textContent || '');
          break;
        }
      }
    });

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
      for (const selector of selectors[key]) {
        const element = document.querySelector(selector);
        if (element) {
          adData[key] = this.extractNumericValue(element.textContent || '');
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
        const promotion = {
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

  // Main extraction method
  extractAllData(): PageData {
    const pageType = this.detectPageType(window.location.href);
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
      pageType,
      url: window.location.href,
      data,
      timestamp: new Date().toISOString()
    };
  }
}
