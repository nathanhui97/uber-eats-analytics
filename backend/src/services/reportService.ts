import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { ReportRequest, ReportResponse, AnalyticsReport } from '../../../shared/types';

interface ReportResult {
  reportId: string;
  downloadUrl?: string;
  emailSent?: boolean;
}

export class ReportService {
  private static instance: ReportService;
  private reports: Map<string, AnalyticsReport> = new Map();
  private reportFiles: Map<string, string> = new Map();

  public static getInstance(): ReportService {
    if (!ReportService.instance) {
      ReportService.instance = new ReportService();
    }
    return ReportService.instance;
  }

  async generateReport(request: ReportRequest): Promise<ReportResult> {
    const reportId = uuidv4();
    
    // Generate analytics report
    const analyticsReport = this.createAnalyticsReport(request.restaurantData);
    this.reports.set(reportId, analyticsReport);

    let downloadUrl: string | undefined;
    let emailSent = false;

    // Generate PDF if requested
    if (request.format === 'pdf' || request.format === 'both') {
      const pdfPath = await this.generatePDF(analyticsReport, reportId);
      downloadUrl = `/api/report/${reportId}/download`;
      this.reportFiles.set(reportId, pdfPath);
    }

    // Send email if requested
    if (request.email && (request.format === 'email' || request.format === 'both')) {
      emailSent = await this.sendEmailReport(analyticsReport, request.email, reportId);
    }

    return {
      reportId,
      downloadUrl,
      emailSent
    };
  }

  async getReport(reportId: string): Promise<AnalyticsReport | null> {
    return this.reports.get(reportId) || null;
  }

  async getReportPDF(reportId: string): Promise<Buffer | null> {
    const filePath = this.reportFiles.get(reportId);
    if (!filePath || !fs.existsSync(filePath)) {
      return null;
    }

    return fs.readFileSync(filePath);
  }

  private createAnalyticsReport(restaurantData: any): AnalyticsReport {
    // Calculate summary metrics
    const totalSales = restaurantData.sales?.reduce((sum: number, s: any) => sum + (s.totalSales || 0), 0) || 0;
    const totalOrders = restaurantData.sales?.reduce((sum: number, s: any) => sum + (s.totalOrders || 0), 0) || 0;
    const averageBasket = totalOrders > 0 ? totalSales / totalOrders : 0;
    const netDeliveryGross = restaurantData.sales?.reduce((sum: number, s: any) => sum + (s.netDeliveryGross || 0), 0) || 0;
    const netDeliveryGrossPercentage = totalSales > 0 ? (netDeliveryGross / totalSales) * 100 : 0;

    const totalAdSpend = restaurantData.ads?.reduce((sum: number, a: any) => sum + (a.adSpend || 0), 0) || 0;
    const totalAdSales = restaurantData.ads?.reduce((sum: number, a: any) => sum + (a.adSales || 0), 0) || 0;
    const adROI = totalAdSpend > 0 ? ((totalAdSales - totalAdSpend) / totalAdSpend) * 100 : 0;

    const totalPromotionSpend = restaurantData.promotions?.reduce((sum: number, p: any) => sum + (p.promotionSpend || 0), 0) || 0;
    const totalPromotionSales = restaurantData.promotions?.reduce((sum: number, p: any) => sum + (p.promotionSales || 0), 0) || 0;
    const promotionROI = totalPromotionSpend > 0 ? ((totalPromotionSales - totalPromotionSpend) / totalPromotionSpend) * 100 : 0;

    // Generate recommendations
    const recommendations = this.generateRecommendations({
      adROI,
      promotionROI,
      netDeliveryGrossPercentage,
      totalAdSpend,
      totalPromotionSpend
    });

    return {
      restaurantId: restaurantData.restaurantId,
      restaurantName: restaurantData.restaurantName,
      period: restaurantData.period,
      summary: {
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
      },
      recommendations,
      generatedAt: new Date().toISOString()
    };
  }

  private async generatePDF(report: AnalyticsReport, reportId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const fileName = `uber-eats-report-${reportId}.pdf`;
      const filePath = path.join(process.cwd(), 'reports', fileName);
      
      // Ensure reports directory exists
      const reportsDir = path.dirname(filePath);
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(24)
         .fillColor('#00D4AA')
         .text('Uber Eats Analytics Report', 50, 50);

      doc.fontSize(16)
         .fillColor('#333')
         .text(report.restaurantName, 50, 90);

      doc.fontSize(12)
         .fillColor('#666')
         .text(`Period: ${report.period.startDate} to ${report.period.endDate}`, 50, 115);

      // Summary section
      let yPosition = 150;
      doc.fontSize(18)
         .fillColor('#333')
         .text('Performance Summary', 50, yPosition);
      
      yPosition += 30;

      // Key metrics
      const metrics = [
        { label: 'Total Sales', value: `$${report.summary.totalSales.toLocaleString()}` },
        { label: 'Total Orders', value: report.summary.totalOrders.toLocaleString() },
        { label: 'Average Basket', value: `$${report.summary.averageBasket.toFixed(2)}` },
        { label: 'Net Delivery Gross', value: `$${report.summary.netDeliveryGross.toLocaleString()}` },
        { label: 'NDG Percentage', value: `${report.summary.netDeliveryGrossPercentage.toFixed(1)}%` }
      ];

      metrics.forEach(metric => {
        doc.fontSize(12)
           .fillColor('#333')
           .text(metric.label + ':', 50, yPosition);
        
        doc.text(metric.value, 200, yPosition);
        yPosition += 20;
      });

      yPosition += 20;

      // Ad performance
      if (report.summary.totalAdSpend > 0) {
        doc.fontSize(16)
           .fillColor('#333')
           .text('Advertising Performance', 50, yPosition);
        
        yPosition += 25;

        const adMetrics = [
          { label: 'Ad Spend', value: `$${report.summary.totalAdSpend.toLocaleString()}` },
          { label: 'Ad Sales', value: `$${report.summary.totalAdSales.toLocaleString()}` },
          { label: 'Ad ROI', value: `${report.summary.adROI.toFixed(1)}%` }
        ];

        adMetrics.forEach(metric => {
          doc.fontSize(12)
             .fillColor('#333')
             .text(metric.label + ':', 50, yPosition);
          
          doc.text(metric.value, 200, yPosition);
          yPosition += 20;
        });

        yPosition += 20;
      }

      // Promotion performance
      if (report.summary.totalPromotionSpend > 0) {
        doc.fontSize(16)
           .fillColor('#333')
           .text('Promotion Performance', 50, yPosition);
        
        yPosition += 25;

        const promoMetrics = [
          { label: 'Promotion Spend', value: `$${report.summary.totalPromotionSpend.toLocaleString()}` },
          { label: 'Promotion Sales', value: `$${report.summary.totalPromotionSales.toLocaleString()}` },
          { label: 'Promotion ROI', value: `${report.summary.promotionROI.toFixed(1)}%` }
        ];

        promoMetrics.forEach(metric => {
          doc.fontSize(12)
             .fillColor('#333')
             .text(metric.label + ':', 50, yPosition);
          
          doc.text(metric.value, 200, yPosition);
          yPosition += 20;
        });

        yPosition += 20;
      }

      // Recommendations
      doc.fontSize(16)
         .fillColor('#333')
         .text('Recommendations', 50, yPosition);
      
      yPosition += 25;

      report.recommendations.forEach((recommendation, index) => {
        doc.fontSize(12)
           .fillColor('#333')
           .text(`${index + 1}. ${recommendation}`, 50, yPosition, {
             width: 500,
             align: 'left'
           });
        
        yPosition += 30;
      });

      // Footer
      doc.fontSize(10)
         .fillColor('#666')
         .text(`Generated on ${new Date(report.generatedAt).toLocaleString()}`, 50, doc.page.height - 50);

      doc.end();

      stream.on('finish', () => {
        resolve(filePath);
      });

      stream.on('error', (error) => {
        reject(error);
      });
    });
  }

  private async sendEmailReport(report: AnalyticsReport, email: string, reportId: string): Promise<boolean> {
    try {
      // Create transporter (you'll need to configure this with your email service)
      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const htmlContent = this.generateEmailHTML(report);

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@uber-eats-analytics.com',
        to: email,
        subject: `Uber Eats Analytics Report - ${report.restaurantName}`,
        html: htmlContent,
        attachments: []
      };

      // Attach PDF if available
      const pdfPath = this.reportFiles.get(reportId);
      if (pdfPath && fs.existsSync(pdfPath)) {
        mailOptions.attachments.push({
          filename: `uber-eats-report-${reportId}.pdf`,
          path: pdfPath
        });
      }

      await transporter.sendMail(mailOptions);
      return true;

    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  private generateEmailHTML(report: AnalyticsReport): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: #00D4AA; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .metric { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .recommendation { background: #e3f2fd; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #2196f3; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Uber Eats Analytics Report</h1>
          <h2>${report.restaurantName}</h2>
          <p>Period: ${report.period.startDate} to ${report.period.endDate}</p>
        </div>
        
        <div class="content">
          <h3>Performance Summary</h3>
          <div class="metric">
            <strong>Total Sales:</strong> $${report.summary.totalSales.toLocaleString()}
          </div>
          <div class="metric">
            <strong>Total Orders:</strong> ${report.summary.totalOrders.toLocaleString()}
          </div>
          <div class="metric">
            <strong>Average Basket:</strong> $${report.summary.averageBasket.toFixed(2)}
          </div>
          <div class="metric">
            <strong>Net Delivery Gross:</strong> $${report.summary.netDeliveryGross.toLocaleString()} (${report.summary.netDeliveryGrossPercentage.toFixed(1)}%)
          </div>
          
          ${report.summary.totalAdSpend > 0 ? `
          <h3>Advertising Performance</h3>
          <div class="metric">
            <strong>Ad Spend:</strong> $${report.summary.totalAdSpend.toLocaleString()}
          </div>
          <div class="metric">
            <strong>Ad Sales:</strong> $${report.summary.totalAdSales.toLocaleString()}
          </div>
          <div class="metric">
            <strong>Ad ROI:</strong> ${report.summary.adROI.toFixed(1)}%
          </div>
          ` : ''}
          
          ${report.summary.totalPromotionSpend > 0 ? `
          <h3>Promotion Performance</h3>
          <div class="metric">
            <strong>Promotion Spend:</strong> $${report.summary.totalPromotionSpend.toLocaleString()}
          </div>
          <div class="metric">
            <strong>Promotion Sales:</strong> $${report.summary.totalPromotionSales.toLocaleString()}
          </div>
          <div class="metric">
            <strong>Promotion ROI:</strong> ${report.summary.promotionROI.toFixed(1)}%
          </div>
          ` : ''}
          
          <h3>Recommendations</h3>
          ${report.recommendations.map(rec => `<div class="recommendation">${rec}</div>`).join('')}
        </div>
        
        <div class="footer">
          <p>Generated on ${new Date(report.generatedAt).toLocaleString()}</p>
          <p>Uber Eats Analytics Tool</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateRecommendations(metrics: any): string[] {
    const recommendations: string[] = [];

    // Ad performance recommendations
    if (metrics.adROI > 200) {
      recommendations.push(`🚀 Your ads are performing excellently (${metrics.adROI.toFixed(0)}% ROI). Consider increasing your ad budget to scale successful campaigns.`);
    } else if (metrics.adROI > 100) {
      recommendations.push(`✅ Your ads are profitable (${metrics.adROI.toFixed(0)}% ROI). Monitor performance and consider moderate budget increases.`);
    } else if (metrics.adROI > 0) {
      recommendations.push(`⚠️ Your ads are barely profitable (${metrics.adROI.toFixed(0)}% ROI). Review targeting and creative to improve performance.`);
    } else if (metrics.totalAdSpend > 0) {
      recommendations.push(`❌ Your ads are losing money (${metrics.adROI.toFixed(0)}% ROI). Consider pausing campaigns and optimizing before restarting.`);
    }

    // Promotion performance recommendations
    if (metrics.promotionROI > 300) {
      recommendations.push(`🎯 Your promotions are highly effective (${metrics.promotionROI.toFixed(0)}% ROI). Scale successful offers and test similar promotions.`);
    } else if (metrics.promotionROI > 100) {
      recommendations.push(`👍 Your promotions are working well (${metrics.promotionROI.toFixed(0)}% ROI). Continue with current strategy and test new offers.`);
    } else if (metrics.promotionROI > 0) {
      recommendations.push(`⚠️ Your promotions need optimization (${metrics.promotionROI.toFixed(0)}% ROI). Review offer terms and targeting.`);
    } else if (metrics.totalPromotionSpend > 0) {
      recommendations.push(`❌ Your promotions are not profitable (${metrics.promotionROI.toFixed(0)}% ROI). Consider pausing and redesigning offers.`);
    }

    // NDG recommendations
    if (metrics.netDeliveryGrossPercentage < 70) {
      recommendations.push(`📉 Your Net Delivery Gross is low (${metrics.netDeliveryGrossPercentage.toFixed(1)}%). Consider optimizing menu pricing or reducing delivery fees.`);
    } else if (metrics.netDeliveryGrossPercentage > 85) {
      recommendations.push(`📈 Excellent Net Delivery Gross (${metrics.netDeliveryGrossPercentage.toFixed(1)}%). Your pricing strategy is working well.`);
    }

    // Default recommendation if no specific insights
    if (recommendations.length === 0) {
      recommendations.push(`📊 Continue monitoring your performance metrics. Focus on improving ad ROI and promotion effectiveness.`);
    }

    return recommendations.slice(0, 3); // Limit to 3 recommendations
  }
}

export const reportService = ReportService.getInstance();
