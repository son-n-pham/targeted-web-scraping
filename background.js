// State management
const state = {
  extensionEnabled: false,
  selectedElementsData: {},
};

// Initialize the extension
async function initializeExtension() {
  try {
    const result = await chrome.storage.local.get(['extensionEnabled']);
    state.extensionEnabled = result.extensionEnabled ?? false;
    console.log(
      'Extension initialized:',
      state.extensionEnabled ? 'ON' : 'OFF'
    );
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

// Handle extension toggle
async function handleExtensionToggle(enabled, sendResponse) {
  try {
    state.extensionEnabled = enabled;
    await chrome.storage.local.set({ extensionEnabled: enabled });

    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs?.[0]?.id) {
      try {
        await chrome.tabs.sendMessage(tabs[0].id, {
          action: 'toggleExtension',
          enabled: state.extensionEnabled,
        });
      } catch (error) {
        console.warn('Content script not ready:', error);
      }
    }

    sendResponse({ status: 'success', enabled: state.extensionEnabled });
  } catch (error) {
    console.error('Toggle error:', error);
    sendResponse({ status: 'error', message: error.message });
  }
}

// Handle API requests
async function handleApiRequest(request, sender, sendResponse) {
  try {
    if (request.apiEndpoint === 'getSelectedElements') {
      const currentPageUrl = sender.tab?.url || 'unknown-url';
      const selectedElements = state.selectedElementsData[currentPageUrl] || [];
      sendResponse({ status: 'success', data: selectedElements });
    } else {
      sendResponse({ status: 'error', message: 'Unknown API endpoint' });
    }
  } catch (error) {
    console.error('API request error:', error);
    sendResponse({ status: 'error', message: error.message });
  }
}

// Message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleExtension') {
    handleExtensionToggle(request.enabled, sendResponse);
    return true; // Will respond asynchronously
  }

  if (request.action === 'getAction') {
    handleApiRequest(request, sender, sendResponse);
    return true; // Will respond asynchronously
  }
});

// Side panel handling
chrome.sidePanel?.onShown?.addListener(async () => {
  try {
    console.log('Side panel shown');
    // Optionally initialize side panel state here
  } catch (error) {
    console.error('Side panel error:', error);
  }
});

// Installation handling
chrome.runtime.onInstalled.addListener(async details => {
  try {
    await chrome.storage.local.set({
      extensionEnabled: state.extensionEnabled,
    });
    console.log('Extension installed/updated:', details.reason);
  } catch (error) {
    console.error('Installation error:', error);
  }
});

// Initialize the extension
initializeExtension().catch(console.error);

// Service worker keep-alive
const KEEP_ALIVE_INTERVAL = 20000; // 20 seconds
setInterval(() => {
  chrome.runtime.getPlatformInfo().catch(error => {
    console.warn('Service worker wake-up check:', error);
  });
}, KEEP_ALIVE_INTERVAL);
