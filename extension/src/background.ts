// Background script for Uber Eats Analytics extension

chrome.runtime.onInstalled.addListener(() => {
  console.log('Uber Eats Analytics extension installed');
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'openPopup':
      // Open popup programmatically if needed
      chrome.action.openPopup();
      break;
    default:
      // Forward message to content script if needed
      break;
  }
});

// Handle tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    if (tab.url.includes('manager.ubereats.com') || tab.url.includes('partners.ubereats.com')) {
      // Content script should already be injected via manifest
      console.log('Uber Eats Manager page loaded:', tab.url);
    }
  }
});
