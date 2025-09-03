import express from 'express';
import { analyticsService } from '../services/analyticsService';
import { reportService } from '../services/reportService';
import { RestaurantData, ReportRequest, ReportResponse } from '../../../shared/types';

const router = express.Router();

// Generate report from captured data
router.post('/generate-report', async (req, res) => {
  try {
    const { capturedData, email }: { capturedData: any[], email?: string } = req.body;

    if (!capturedData || capturedData.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No captured data provided'
      });
    }

    // Process and aggregate the captured data
    const restaurantData = analyticsService.processCapturedData(capturedData);
    
    if (!restaurantData) {
      return res.status(400).json({
        success: false,
        error: 'Unable to process captured data'
      });
    }

    // Generate analytics report
    const report = analyticsService.generateAnalyticsReport(restaurantData);

    // Generate PDF report
    const reportRequest: ReportRequest = {
      restaurantData,
      email,
      format: email ? 'both' : 'pdf'
    };

    const result = await reportService.generateReport(reportRequest);

    const response: ReportResponse = {
      success: true,
      reportId: result.reportId,
      downloadUrl: result.downloadUrl,
      emailSent: result.emailSent
    };

    res.json(response);

  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate report',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get report by ID
router.get('/report/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await reportService.getReport(reportId);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    res.json({
      success: true,
      report
    });

  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch report'
    });
  }
});

// Download report PDF
router.get('/report/:reportId/download', async (req, res) => {
  try {
    const { reportId } = req.params;
    const pdfBuffer = await reportService.getReportPDF(reportId);
    
    if (!pdfBuffer) {
      return res.status(404).json({
        success: false,
        error: 'Report PDF not found'
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="uber-eats-report-${reportId}.pdf"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download report'
    });
  }
});

// Test endpoint for development
router.post('/test-data', async (req, res) => {
  try {
    const testData = {
      restaurantId: 'test-restaurant-123',
      restaurantName: 'Test Restaurant',
      period: {
        startDate: '2024-01-01',
        endDate: '2024-01-07'
      },
      sales: [
        {
          date: '2024-01-01',
          totalSales: 1500,
          totalOrders: 45,
          averageBasket: 33.33,
          netDeliveryGross: 1200,
          netDeliveryGrossPercentage: 80
        }
      ],
      ads: [
        {
          date: '2024-01-01',
          adSpend: 100,
          adSales: 300,
          adOrders: 10,
          adROI: 200,
          impressions: 5000,
          clicks: 50,
          ctr: 1.0,
          cpc: 2.0
        }
      ],
      promotions: [
        {
          date: '2024-01-01',
          promotionName: '20% Off First Order',
          promotionType: 'discount' as const,
          promotionSpend: 50,
          promotionSales: 200,
          promotionOrders: 8,
          promotionROI: 300,
          redemptionCount: 8
        }
      ],
      capturedAt: new Date().toISOString()
    };

    const report = analyticsService.generateAnalyticsReport(testData);
    res.json({
      success: true,
      report
    });

  } catch (error) {
    console.error('Error processing test data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process test data'
    });
  }
});

export { router as reportRoutes };
