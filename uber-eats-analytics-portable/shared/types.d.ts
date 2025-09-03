export interface SalesData {
    date: string;
    totalSales: number;
    totalOrders: number;
    averageBasket: number;
    netDeliveryGross: number;
    netDeliveryGrossPercentage: number;
}
export interface AdData {
    date: string;
    adSpend: number;
    adSales: number;
    adOrders: number;
    adROI: number;
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
}
export interface PromotionData {
    date: string;
    promotionName: string;
    promotionType: 'discount' | 'free_delivery' | 'bogo' | 'other';
    promotionSpend: number;
    promotionSales: number;
    promotionOrders: number;
    promotionROI: number;
    redemptionCount: number;
}
export interface RestaurantData {
    restaurantId: string;
    restaurantName: string;
    period: {
        startDate: string;
        endDate: string;
    };
    sales: SalesData[];
    ads: AdData[];
    promotions: PromotionData[];
    capturedAt: string;
}
export interface AnalyticsReport {
    restaurantId: string;
    restaurantName: string;
    period: {
        startDate: string;
        endDate: string;
    };
    summary: {
        totalSales: number;
        totalOrders: number;
        averageBasket: number;
        netDeliveryGross: number;
        netDeliveryGrossPercentage: number;
        totalAdSpend: number;
        totalAdSales: number;
        adROI: number;
        totalPromotionSpend: number;
        totalPromotionSales: number;
        promotionROI: number;
    };
    recommendations: string[];
    generatedAt: string;
}
export interface ReportRequest {
    restaurantData: RestaurantData;
    email?: string;
    format: 'pdf' | 'email' | 'both';
}
export interface ReportResponse {
    success: boolean;
    reportId: string;
    downloadUrl?: string;
    emailSent?: boolean;
    error?: string;
}
//# sourceMappingURL=types.d.ts.map