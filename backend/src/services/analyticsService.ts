import { RestaurantData, AnalyticsReport, SalesData, AdData, PromotionData } from '../../../shared/types';

export class AnalyticsService {
  private static instance: AnalyticsService;

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Process captured data from the browser extension
  processCapturedData(capturedData: any[]): RestaurantData | null {
    if (!capturedData || capturedData.length === 0) {
      return null;
    }

    // Find restaurant info from the first valid data point
    let restaurantInfo = null;
    for (const data of capturedData) {
      if (data.data?.restaurant?.name) {
        restaurantInfo = data.data.restaurant;
        break;
      }
    }

    if (!restaurantInfo) {
      return null;
    }

    // Aggregate sales data
    const salesData = this.aggregateSalesData(capturedData);
    
    // Aggregate ad data
    const adData = this.aggregateAdData(capturedData);
    
    // Aggregate promotion data
    const promotionData = this.aggregatePromotionData(capturedData);

    // Determine date range
    const dateRange = this.determineDateRange(capturedData);

    return {
      restaurantId: restaurantInfo.id || 'unknown',
      restaurantName: restaurantInfo.name,
      period: dateRange,
      sales: salesData,
      ads: adData,
      promotions: promotionData,
      capturedAt: new Date().toISOString()
    };
  }

  // Generate comprehensive analytics report
  generateAnalyticsReport(restaurantData: RestaurantData): AnalyticsReport {
    const summary = this.calculateSummary(restaurantData);
    const recommendations = this.generateRecommendations(restaurantData, summary);

    return {
      restaurantId: restaurantData.restaurantId,
      restaurantName: restaurantData.restaurantName,
      period: restaurantData.period,
      summary,
      recommendations,
      generatedAt: new Date().toISOString()
    };
  }

  private aggregateSalesData(capturedData: any[]): SalesData[] {
    const salesMap = new Map<string, SalesData>();

    capturedData.forEach(page => {
      if (page.data?.sales) {
        const sales = page.data.sales;
        const date = this.extractDate(page.timestamp);
        
        if (!salesMap.has(date)) {
          salesMap.set(date, {
            date,
            totalSales: 0,
            totalOrders: 0,
            averageBasket: 0,
            netDeliveryGross: 0,
            netDeliveryGrossPercentage: 0
          });
        }

        const existing = salesMap.get(date)!;
        existing.totalSales += sales.totalSales || 0;
        existing.totalOrders += sales.totalOrders || 0;
        existing.netDeliveryGross += sales.netDeliveryGross || 0;
      }
    });

    // Calculate averages and percentages
    salesMap.forEach(sales => {
      if (sales.totalOrders > 0) {
        sales.averageBasket = sales.totalSales / sales.totalOrders;
      }
      if (sales.totalSales > 0) {
        sales.netDeliveryGrossPercentage = (sales.netDeliveryGross / sales.totalSales) * 100;
      }
    });

    return Array.from(salesMap.values());
  }

  private aggregateAdData(capturedData: any[]): AdData[] {
    const adMap = new Map<string, AdData>();

    capturedData.forEach(page => {
      if (page.data?.ads) {
        const ads = page.data.ads;
        const date = this.extractDate(page.timestamp);
        
        if (!adMap.has(date)) {
          adMap.set(date, {
            date,
            adSpend: 0,
            adSales: 0,
            adOrders: 0,
            adROI: 0,
            impressions: 0,
            clicks: 0,
            ctr: 0,
            cpc: 0
          });
        }

        const existing = adMap.get(date)!;
        existing.adSpend += ads.adSpend || 0;
        existing.adSales += ads.adSales || 0;
        existing.adOrders += ads.adOrders || 0;
        existing.impressions += ads.impressions || 0;
        existing.clicks += ads.clicks || 0;
      }
    });

    // Calculate derived metrics
    adMap.forEach(ad => {
      if (ad.adSpend > 0) {
        ad.adROI = ((ad.adSales - ad.adSpend) / ad.adSpend) * 100;
      }
      if (ad.impressions > 0) {
        ad.ctr = (ad.clicks / ad.impressions) * 100;
      }
      if (ad.clicks > 0) {
        ad.cpc = ad.adSpend / ad.clicks;
      }
    });

    return Array.from(adMap.values());
  }

  private aggregatePromotionData(capturedData: any[]): PromotionData[] {
    const promotions: PromotionData[] = [];

    capturedData.forEach(page => {
      if (page.data?.promotions && Array.isArray(page.data.promotions)) {
        page.data.promotions.forEach((promo: any) => {
          const date = this.extractDate(page.timestamp);
          promotions.push({
            date,
            promotionName: promo.name || 'Unknown Promotion',
            promotionType: promo.type || 'other',
            promotionSpend: promo.spend || 0,
            promotionSales: promo.sales || 0,
            promotionOrders: promo.orders || 0,
            promotionROI: promo.roi || 0,
            redemptionCount: promo.redemptions || 0
          });
        });
      }
    });

    return promotions;
  }

  private determineDateRange(capturedData: any[]): { startDate: string; endDate: string } {
    const dates = capturedData.map(page => new Date(page.timestamp));
    const startDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const endDate = new Date(Math.max(...dates.map(d => d.getTime())));

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }

  private calculateSummary(restaurantData: RestaurantData) {
    const totalSales = restaurantData.sales.reduce((sum, s) => sum + s.totalSales, 0);
    const totalOrders = restaurantData.sales.reduce((sum, s) => sum + s.totalOrders, 0);
    const averageBasket = totalOrders > 0 ? totalSales / totalOrders : 0;
    const netDeliveryGross = restaurantData.sales.reduce((sum, s) => sum + s.netDeliveryGross, 0);
    const netDeliveryGrossPercentage = totalSales > 0 ? (netDeliveryGross / totalSales) * 100 : 0;

    const totalAdSpend = restaurantData.ads.reduce((sum, a) => sum + a.adSpend, 0);
    const totalAdSales = restaurantData.ads.reduce((sum, a) => sum + a.adSales, 0);
    const adROI = totalAdSpend > 0 ? ((totalAdSales - totalAdSpend) / totalAdSpend) * 100 : 0;

    const totalPromotionSpend = restaurantData.promotions.reduce((sum, p) => sum + p.promotionSpend, 0);
    const totalPromotionSales = restaurantData.promotions.reduce((sum, p) => sum + p.promotionSales, 0);
    const promotionROI = totalPromotionSpend > 0 ? ((totalPromotionSales - totalPromotionSpend) / totalPromotionSpend) * 100 : 0;

    return {
      totalSales,
      totalOrders,
      averageBasket,
      netDeliveryGross,
      netDeliveryGrossPercentage,
      totalAdSpend,
      totalAdSales,
      adROI,
      totalPromotionSpend,
      totalPromotionSales,
      promotionROI
    };
  }

  private generateRecommendations(restaurantData: RestaurantData, summary: any): string[] {
    const recommendations: string[] = [];

    // Ad performance recommendations
    if (summary.adROI > 200) {
      recommendations.push(`🚀 Your ads are performing excellently (${summary.adROI.toFixed(0)}% ROI). Consider increasing your ad budget to scale successful campaigns.`);
    } else if (summary.adROI > 100) {
      recommendations.push(`✅ Your ads are profitable (${summary.adROI.toFixed(0)}% ROI). Monitor performance and consider moderate budget increases.`);
    } else if (summary.adROI > 0) {
      recommendations.push(`⚠️ Your ads are barely profitable (${summary.adROI.toFixed(0)}% ROI). Review targeting and creative to improve performance.`);
    } else if (summary.totalAdSpend > 0) {
      recommendations.push(`❌ Your ads are losing money (${summary.adROI.toFixed(0)}% ROI). Consider pausing campaigns and optimizing before restarting.`);
    }

    // Promotion performance recommendations
    if (summary.promotionROI > 300) {
      recommendations.push(`🎯 Your promotions are highly effective (${summary.promotionROI.toFixed(0)}% ROI). Scale successful offers and test similar promotions.`);
    } else if (summary.promotionROI > 100) {
      recommendations.push(`👍 Your promotions are working well (${summary.promotionROI.toFixed(0)}% ROI). Continue with current strategy and test new offers.`);
    } else if (summary.promotionROI > 0) {
      recommendations.push(`⚠️ Your promotions need optimization (${summary.promotionROI.toFixed(0)}% ROI). Review offer terms and targeting.`);
    } else if (summary.totalPromotionSpend > 0) {
      recommendations.push(`❌ Your promotions are not profitable (${summary.promotionROI.toFixed(0)}% ROI). Consider pausing and redesigning offers.`);
    }

    // NDG recommendations
    if (summary.netDeliveryGrossPercentage < 70) {
      recommendations.push(`📉 Your Net Delivery Gross is low (${summary.netDeliveryGrossPercentage.toFixed(1)}%). Consider optimizing menu pricing or reducing delivery fees.`);
    } else if (summary.netDeliveryGrossPercentage > 85) {
      recommendations.push(`📈 Excellent Net Delivery Gross (${summary.netDeliveryGrossPercentage.toFixed(1)}%). Your pricing strategy is working well.`);
    }

    // Default recommendation if no specific insights
    if (recommendations.length === 0) {
      recommendations.push(`📊 Continue monitoring your performance metrics. Focus on improving ad ROI and promotion effectiveness.`);
    }

    return recommendations.slice(0, 3); // Limit to 3 recommendations
  }

  private extractDate(timestamp: string): string {
    return new Date(timestamp).toISOString().split('T')[0];
  }
}

export const analyticsService = AnalyticsService.getInstance();
