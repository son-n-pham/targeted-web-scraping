console.log('Content script loaded.');

let extensionEnabled = false; // Initially disabled, will be controlled by the side panel

function highlightElement(element) {
  // Basic highlighting: add a border
  element.style.border = '2px solid red';
}

function removeHighlight(element) {
  element.style.border = ''; // Remove the border
}

document.addEventListener('click', function (event) {
  if (!extensionEnabled) {
    return; // Do nothing if extension is disabled
  }

  event.preventDefault(); // Prevent default click behavior (e.g., following links)
  event.stopPropagation(); // Stop event from bubbling up to parent elements

  const targetElement = event.target;

  // Remove highlight from previously highlighted element (if any)
  const previouslyHighlighted = document.querySelector(
    '[data-roo-highlighted]'
  );
  if (previouslyHighlighted) {
    removeHighlight(previouslyHighlighted);
    previouslyHighlighted.removeAttribute('data-roo-highlighted');
  }

  // Highlight the clicked element
  highlightElement(targetElement);
  targetElement.setAttribute('data-roo-highlighted', 'true'); // Mark as highlighted

  console.log('Clicked element:', targetElement);

  // In the future, send element information to the background script here
  chrome.runtime.sendMessage({
    action: 'elementSelected',
    elementInfo: {
      tagName: targetElement.tagName,
      xpath: getXPathTree(targetElement),
      attributes: getAttributes(targetElement),
    },
  });
});

// Listen for messages from the background script (e.g., to enable/disable extension)
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'toggleExtension') {
    extensionEnabled = request.enabled;
    console.log('Extension toggled:', extensionEnabled ? 'ON' : 'OFF');

    // Remove highlight when extension is toggled off
    if (!extensionEnabled) {
      const highlightedElement = document.querySelector(
        '[data-roo-highlighted]'
      );
      if (highlightedElement) {
        removeHighlight(highlightedElement);
        highlightedElement.removeAttribute('data-roo-highlighted');
      }
    }
  }
  sendResponse({ status: 'received' }); // Optional: send a response back to background script
});

// Helper function to generate XPath as a tree
function getXPathTree(element, stopAtBoundary = true) {
  const segments = [];
  let currentElement = element;
  while (currentElement && currentElement.nodeType === Node.ELEMENT_NODE) {
    // Stop if we hit a shadow root or iframe
    if (
      stopAtBoundary &&
      (currentElement.parentNode instanceof ShadowRoot ||
        currentElement.parentNode instanceof HTMLIFrameElement)
    ) {
      break;
    }
    let index = 0;
    let sibling = currentElement.previousSibling;
    while (sibling) {
      if (
        sibling.nodeType === Node.ELEMENT_NODE &&
        sibling.nodeName === currentElement.nodeName
      ) {
        index++;
      }
      sibling = sibling.previousSibling;
    }
    const tagName = currentElement.nodeName.toLowerCase();
    const xpathIndex = index > 0 ? `[${index + 1}]` : '';
    segments.unshift(`${tagName}${xpathIndex}`);
    currentElement = currentElement.parentNode;
  }
  return segments.join('/');
}

// Helper function to get all attributes of an element
function getAttributes(element) {
  const attributes = {};
  if (element.attributes) {
    const attributeNames = element.getAttributeNames?.() || [];
    for (const name of attributeNames) {
      attributes[name] = element.getAttribute(name);
    }
  }
  return attributes;
}
