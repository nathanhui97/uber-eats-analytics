// Popup script for Uber Eats Analytics extension

class PopupController {
  private isCapturing: boolean = false;
  private capturedData: any[] = [];

  constructor() {
    this.init();
  }

  private async init() {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Check if we're on Uber Eats Manager
    if (!this.isUberEatsManager(tab.url)) {
      this.showError('Please navigate to Uber Eats Manager portal first.');
      return;
    }

    // Set up event listeners
    this.setupEventListeners();
    
    // Load current state
    await this.loadCurrentState();
    
    // Update UI
    this.updateUI();
  }

  private isUberEatsManager(url?: string): boolean {
    if (!url) return false;
    return url.includes('manager.ubereats.com') || 
           url.includes('partners.ubereats.com') ||
           url.includes('localhost:8080') ||
           url.includes('127.0.0.1:8080');
  }

  private setupEventListeners() {
    document.getElementById('startCaptureBtn')?.addEventListener('click', () => {
      this.startCapture();
    });

    document.getElementById('stopCaptureBtn')?.addEventListener('click', () => {
      this.stopCapture();
    });

    document.getElementById('generateReportBtn')?.addEventListener('click', () => {
      this.generateReport();
    });

    document.getElementById('clearDataBtn')?.addEventListener('click', () => {
      this.clearData();
    });

    document.getElementById('debugSelectorsBtn')?.addEventListener('click', () => {
      this.debugSelectors();
    });

    document.getElementById('startAutoNavBtn')?.addEventListener('click', () => {
      this.startAutoNavigation();
    });

    document.getElementById('stopAutoNavBtn')?.addEventListener('click', () => {
      this.stopAutoNavigation();
    });
  }

  private async loadCurrentState() {
    try {
      // Get current capture state
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'getCapturedData' });
        if (response?.data) {
          this.capturedData = response.data;
        }
      }
    } catch (error) {
      console.error('Error loading state:', error);
    }
  }

  private async startCapture() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        await chrome.tabs.sendMessage(tab.id, { action: 'startCapture' });
        this.isCapturing = true;
        this.updateUI();
        this.showSuccess('Started capturing data. Navigate through the portal to collect information.');
      }
    } catch (error) {
      console.error('Error starting capture:', error);
      this.showError('Error starting data capture. Please refresh the page and try again.');
    }
  }

  private async stopCapture() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        await chrome.tabs.sendMessage(tab.id, { action: 'stopCapture' });
        this.isCapturing = false;
        this.updateUI();
        this.showSuccess('Stopped capturing data.');
      }
    } catch (error) {
      console.error('Error stopping capture:', error);
      this.showError('Error stopping data capture.');
    }
  }

  private async generateReport() {
    const emailInput = document.getElementById('emailInput') as HTMLInputElement;
    const email = emailInput?.value?.trim();
    
    if (this.capturedData.length === 0) {
      this.showError('No data captured yet. Please start capturing and navigate through the portal.');
      return;
    }

    this.showLoading(true);
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        await chrome.tabs.sendMessage(tab.id, { 
          action: 'generateReport',
          email: email 
        });
        this.showSuccess('Report generation started! Check your email or download from the provided link.');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      this.showError('Error generating report. Please try again.');
    } finally {
      this.showLoading(false);
    }
  }

  private async clearData() {
    if (!confirm('Are you sure you want to clear all captured data?')) {
      return;
    }

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        await chrome.tabs.sendMessage(tab.id, { action: 'clearData' });
        this.capturedData = [];
        this.updateUI();
        this.showSuccess('All data cleared.');
      }
    } catch (error) {
      console.error('Error clearing data:', error);
      this.showError('Error clearing data.');
    }
  }

  private updateUI() {
    // Update capture status
    const captureIndicator = document.getElementById('captureIndicator');
    const captureStatus = document.getElementById('captureStatus');
    const startBtn = document.getElementById('startCaptureBtn');
    const stopBtn = document.getElementById('stopCaptureBtn');
    const generateBtn = document.getElementById('generateReportBtn');

    if (this.isCapturing) {
      captureIndicator?.classList.remove('inactive');
      captureIndicator?.classList.add('active');
      captureStatus!.textContent = 'Active';
      startBtn!.style.display = 'none';
      stopBtn!.style.display = 'block';
    } else {
      captureIndicator?.classList.remove('active');
      captureIndicator?.classList.add('inactive');
      captureStatus!.textContent = 'Inactive';
      startBtn!.style.display = 'block';
      stopBtn!.style.display = 'none';
    }

    // Update data summary
    this.updateDataSummary();

    // Enable/disable generate button
    (generateBtn as HTMLButtonElement)!.disabled = this.capturedData.length === 0;
  }

  private updateDataSummary() {
    const pageCount = document.getElementById('pageCount');
    const lastUpdated = document.getElementById('lastUpdated');
    const dataSummary = document.getElementById('dataSummary');
    const restaurantName = document.getElementById('restaurantName');
    const totalSales = document.getElementById('totalSales');
    const adSpend = document.getElementById('adSpend');
    const promotionCount = document.getElementById('promotionCount');

    pageCount!.textContent = this.capturedData.length.toString();
    
    if (this.capturedData.length > 0) {
      const lastData = this.capturedData[this.capturedData.length - 1];
      lastUpdated!.textContent = new Date(lastData.timestamp).toLocaleTimeString();
      dataSummary!.style.display = 'block';

      // Aggregate data
      let totalSalesValue = 0;
      let totalAdSpend = 0;
      let totalPromotions = 0;
      let restaurant = '';

      this.capturedData.forEach(page => {
        if (page.data.restaurant?.name) {
          restaurant = page.data.restaurant.name;
        }
        if (page.data.sales?.totalSales) {
          totalSalesValue += page.data.sales.totalSales;
        }
        if (page.data.ads?.adSpend) {
          totalAdSpend += page.data.ads.adSpend;
        }
        if (page.data.promotions?.length) {
          totalPromotions += page.data.promotions.length;
        }
      });

      restaurantName!.textContent = restaurant || 'Unknown';
      totalSales!.textContent = totalSalesValue > 0 ? `$${totalSalesValue.toLocaleString()}` : '-';
      adSpend!.textContent = totalAdSpend > 0 ? `$${totalAdSpend.toLocaleString()}` : '-';
      promotionCount!.textContent = totalPromotions > 0 ? totalPromotions.toString() : '-';
    } else {
      lastUpdated!.textContent = 'Never';
      dataSummary!.style.display = 'none';
    }
  }

  private showError(message: string) {
    const errorEl = document.getElementById('errorMessage');
    const successEl = document.getElementById('successMessage');
    
    successEl!.style.display = 'none';
    errorEl!.textContent = message;
    errorEl!.style.display = 'block';
    
    setTimeout(() => {
      errorEl!.style.display = 'none';
    }, 5000);
  }

  private showSuccess(message: string) {
    const errorEl = document.getElementById('errorMessage');
    const successEl = document.getElementById('successMessage');
    
    errorEl!.style.display = 'none';
    successEl!.textContent = message;
    successEl!.style.display = 'block';
    
    setTimeout(() => {
      successEl!.style.display = 'none';
    }, 5000);
  }

  private async debugSelectors() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        await chrome.tabs.sendMessage(tab.id, { action: 'debugSelectors' });
        this.showSuccess('Debug info logged to console. Open DevTools (F12) to view.');
      }
    } catch (error) {
      console.error('Error debugging selectors:', error);
      this.showError('Error debugging selectors. Make sure you\'re on an Uber Eats Manager page.');
    }
  }

  private async startAutoNavigation() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) return;

      await chrome.tabs.sendMessage(tab.id, { action: 'startAutoNavigation' });
      
      // Update UI
      (document.getElementById('startAutoNavBtn') as HTMLButtonElement)!.style.display = 'none';
      (document.getElementById('stopAutoNavBtn') as HTMLButtonElement)!.style.display = 'block';
      (document.getElementById('navigationProgress') as HTMLElement)!.style.display = 'block';
      
      this.showSuccess('Auto-navigation started! The extension will automatically navigate through all Uber Eats Manager pages.');
      
      // Start progress monitoring
      this.monitorNavigationProgress();
      
    } catch (error) {
      console.error('Error starting auto-navigation:', error);
      this.showError('Error starting auto-navigation. Please refresh the page and try again.');
    }
  }

  private async stopAutoNavigation() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) return;

      await chrome.tabs.sendMessage(tab.id, { action: 'stopAutoNavigation' });
      
      // Update UI
      (document.getElementById('startAutoNavBtn') as HTMLButtonElement)!.style.display = 'block';
      (document.getElementById('stopAutoNavBtn') as HTMLButtonElement)!.style.display = 'none';
      (document.getElementById('navigationProgress') as HTMLElement)!.style.display = 'none';
      
      this.showSuccess('Auto-navigation stopped.');
      
    } catch (error) {
      console.error('Error stopping auto-navigation:', error);
      this.showError('Error stopping auto-navigation.');
    }
  }

  private async monitorNavigationProgress() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) return;

      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getNavigationStatus' });
      
      if (response.isNavigating) {
        const progress = response.progress;
        const progressFill = document.getElementById('progressFill') as HTMLElement;
        const progressText = document.getElementById('progressText') as HTMLElement;
        
        const percentage = (progress.current / progress.total) * 100;
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `Page ${progress.current} of ${progress.total} - ${progress.currentPage}`;
        
        // Continue monitoring
        setTimeout(() => this.monitorNavigationProgress(), 1000);
      } else {
        // Navigation completed
        (document.getElementById('startAutoNavBtn') as HTMLButtonElement)!.style.display = 'block';
        (document.getElementById('stopAutoNavBtn') as HTMLButtonElement)!.style.display = 'none';
        (document.getElementById('navigationProgress') as HTMLElement)!.style.display = 'none';
        
        this.showSuccess('Auto-navigation completed! All data has been captured.');
        await this.loadCurrentState();
        this.updateUI();
      }
      
    } catch (error) {
      console.error('Error monitoring navigation progress:', error);
    }
  }

  private showLoading(show: boolean) {
    const loadingEl = document.getElementById('loadingMessage');
    const generateBtn = document.getElementById('generateReportBtn');
    
    loadingEl!.style.display = show ? 'block' : 'none';
    (generateBtn as HTMLButtonElement)!.disabled = show;
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});
