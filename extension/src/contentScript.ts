// Content script for Uber Eats Manager portal
// This script runs on Uber Eats pages and captures data as users navigate

import { UberEatsDataExtractor, PageData } from './dataExtractor';

class UberEatsContentScript {
  private dataExtractor: UberEatsDataExtractor;
  private capturedData: PageData[] = [];
  private isCapturing: boolean = false;
  private lastUrl: string = '';

  constructor() {
    this.dataExtractor = UberEatsDataExtractor.getInstance();
    this.init();
  }

  private init() {
    // Listen for messages from popup/background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case 'startCapture':
          this.startCapture();
          sendResponse({ success: true });
          break;
        case 'stopCapture':
          this.stopCapture();
          sendResponse({ success: true });
          break;
        case 'getCapturedData':
          sendResponse({ data: this.capturedData });
          break;
        case 'clearData':
          this.clearData();
          sendResponse({ success: true });
          break;
        case 'generateReport':
          this.generateReport(request.email);
          sendResponse({ success: true });
          break;
      }
    });

    // Auto-capture data when page loads or changes
    this.setupAutoCapture();
    
    // Add visual indicator when capturing
    this.addCaptureIndicator();
  }

  private setupAutoCapture() {
    // Capture data on page load
    this.captureCurrentPage();

    // Capture data when URL changes (SPA navigation)
    let currentUrl = window.location.href;
    const observer = new MutationObserver(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        setTimeout(() => this.captureCurrentPage(), 1000); // Wait for page to load
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Also listen for popstate events
    window.addEventListener('popstate', () => {
      setTimeout(() => this.captureCurrentPage(), 1000);
    });
  }

  private captureCurrentPage() {
    if (!this.isCapturing) return;

    try {
      const pageData = this.dataExtractor.extractAllData();
      
      // Only capture if we have meaningful data
      if (this.hasValidData(pageData)) {
        this.capturedData.push(pageData);
        this.updateCaptureIndicator();
        console.log('Uber Eats Analytics: Captured data from', pageData.pageType, 'page');
      }
    } catch (error) {
      console.error('Uber Eats Analytics: Error capturing data:', error);
    }
  }

  private hasValidData(pageData: PageData): boolean {
    const { data } = pageData;
    
    // Check if we have any meaningful data
    return !!(
      data.sales?.totalSales ||
      data.ads?.adSpend ||
      data.promotions?.length > 0 ||
      data.restaurant?.name
    );
  }

  private startCapture() {
    this.isCapturing = true;
    this.captureCurrentPage();
    this.updateCaptureIndicator();
    console.log('Uber Eats Analytics: Started capturing data');
  }

  private stopCapture() {
    this.isCapturing = false;
    this.updateCaptureIndicator();
    console.log('Uber Eats Analytics: Stopped capturing data');
  }

  private clearData() {
    this.capturedData = [];
    this.updateCaptureIndicator();
    console.log('Uber Eats Analytics: Cleared captured data');
  }

  private async generateReport(email?: string) {
    if (this.capturedData.length === 0) {
      alert('No data captured yet. Please navigate through the Uber Eats Manager portal first.');
      return;
    }

    try {
      // Send data to backend
      const response = await fetch('http://localhost:3001/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          capturedData: this.capturedData,
          email: email
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Report generated successfully! Check your email or download from the provided link.');
        if (result.downloadUrl) {
          window.open(result.downloadUrl, '_blank');
        }
      } else {
        alert('Error generating report: ' + result.error);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    }
  }

  private addCaptureIndicator() {
    // Create a floating indicator
    const indicator = document.createElement('div');
    indicator.id = 'uber-eats-analytics-indicator';
    indicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #00D4AA;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      z-index: 10000;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
    `;
    
    indicator.innerHTML = 'UE<br>Analytics';
    indicator.title = 'Uber Eats Analytics - Click to open';
    
    // Add click handler to open popup
    indicator.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'openPopup' });
    });

    document.body.appendChild(indicator);
    this.updateCaptureIndicator();
  }

  private updateCaptureIndicator() {
    const indicator = document.getElementById('uber-eats-analytics-indicator');
    if (!indicator) return;

    if (this.isCapturing) {
      indicator.style.background = '#00D4AA';
      indicator.style.animation = 'pulse 2s infinite';
    } else {
      indicator.style.background = '#666';
      indicator.style.animation = 'none';
    }

    // Update data count
    const dataCount = this.capturedData.length;
    indicator.innerHTML = `UE<br>Analytics<br><small>${dataCount}</small>`;
  }
}

// Initialize the content script
new UberEatsContentScript();

// Add CSS for pulse animation
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;
document.head.appendChild(style);
