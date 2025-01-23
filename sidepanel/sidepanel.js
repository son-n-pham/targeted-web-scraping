console.log('Side panel script loaded.');

const toggleButton = document.getElementById('toggleButton');
const elementInfoDiv = document.getElementById('elementInfo');

// Load initial state from storage
chrome.storage.local.get(['extensionEnabled'], function (result) {
  const enabled =
    result.extensionEnabled !== undefined ? result.extensionEnabled : false;
  toggleButton.textContent = enabled ? 'Extension ON' : 'Extension OFF';
});

toggleButton.addEventListener('click', function () {
  // Toggle the extension state
  chrome.storage.local.get(['extensionEnabled'], function (result) {
    const enabled =
      result.extensionEnabled !== undefined ? result.extensionEnabled : false;
    const newEnabled = !enabled;
    chrome.storage.local.set({ extensionEnabled: newEnabled }, function () {
      toggleButton.textContent = newEnabled ? 'Extension ON' : 'Extension OFF';
      console.log('Side panel - Extension toggled:', newEnabled ? 'ON' : 'OFF');

      // Send message to background script to toggle the extension
      chrome.runtime.sendMessage(
        { action: 'toggleExtension', enabled: newEnabled },
        function (response) {
          if (chrome.runtime.lastError) {
            console.error(
              'Error sending message to background script:',
              chrome.runtime.lastError.message
            );
          } else {
            console.log(
              'Response from background script:',
              response ? response.status : 'no response'
            );
          }
        }
      );
    });
  });
});

function fetchSelectedElements() {
  chrome.runtime.sendMessage(
    { action: 'getAction', apiEndpoint: 'getSelectedElements' },
    function (response) {
      if (chrome.runtime.lastError) {
        console.error(
          'Error fetching selected elements:',
          chrome.runtime.lastError.message
        );
      } else if (response && response.status === 'success') {
        console.log('Selected elements:', response.data);
        elementInfoDiv.textContent = JSON.stringify(response.data, null, 2);
      } else {
        console.error(
          'Error fetching selected elements:',
          response ? response.message : 'Unknown error'
        );
      }
    }
  );
}

// Listen for messages from the background script (e.g., to update element info)
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'updateElementInfo') {
    elementInfoDiv.textContent = JSON.stringify(request.elementInfo, null, 2);
    fetchSelectedElements(); // Fetch and display selected elements after update
  }
  sendResponse({ status: 'received' });
});
