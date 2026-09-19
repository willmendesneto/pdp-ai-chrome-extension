// dom-updater.js
/**
 * This script is injected into the page's main world. It can access and
 * modify the DOM directly. It communicates with the content script via
 * window.postMessage.
 */

(() => {
  /**
   * Updates an element's content based on a selector.
   * @param {string} selector - The CSS selector for the element.
   * @param {string} newText - The new text content.
   */
  const updateElement = (selector, newText) => {
    try {
      const el = document.querySelector(selector);
      if (el) {
        // Handle special cases for meta tags and title
        if (selector.startsWith('meta')) {
          el.setAttribute('content', newText);
        } else if (selector.toLowerCase() === 'title') {
          document.title = newText;
        } else {
          el.textContent = newText;
        }
        console.log(`Updated element with selector: ${selector}`);
      } else {
        console.warn(`Element with selector not found: ${selector}`);
      }
    } catch (e) {
      console.error(`Error updating element with selector ${selector}:`, e);
    }
  };

  /**
   * Replaces content on the page based on the LLM's response.
   * @param {object} data - The LLM-generated data with selectors and new content.
   */
  const replaceContentOnPage = (data) => {
    try {
      // Update Head elements (SEO focused)
      if (data.head) {
        // Update Title
        if (
          data.head.newTitle &&
          data.head.originalTitle &&
          Array.isArray(data.head.originalTitle.selectors)
        ) {
          data.head.originalTitle.selectors.forEach((selector) =>
            updateElement(selector, data.head.newTitle.text),
          );
        }
        // Update Description
        if (
          data.head.newDescription &&
          data.head.originalDescription &&
          Array.isArray(data.head.originalDescription.selectors)
        ) {
          data.head.originalDescription.selectors.forEach((selector) =>
            updateElement(selector, data.head.newDescription.text),
          );
        }
        // No Shipping/Returns for Head
      }

      // Update Body elements (Customer focused)
      if (data.body) {
        // Update Title
        if (
          data.body.newTitle &&
          data.body.originalTitle &&
          Array.isArray(data.body.originalTitle.selectors)
        ) {
          data.body.originalTitle.selectors.forEach((selector) =>
            updateElement(selector, data.body.newTitle.text),
          );
        }
        // Update Description
        if (
          data.body.newDescription &&
          data.body.originalDescription &&
          Array.isArray(data.body.originalDescription.selectors)
        ) {
          data.body.originalDescription.selectors.forEach((selector) =>
            updateElement(selector, data.body.newDescription.text),
          );
        }
        // Update Shipping/Returns
        if (
          data.body.newShippingReturns &&
          data.body.originalShippingReturns &&
          Array.isArray(data.body.originalShippingReturns.selectors)
        ) {
          data.body.originalShippingReturns.selectors.forEach((selector) =>
            updateElement(selector, data.body.newShippingReturns.text),
          );
        }
      }
    } catch (error) {
      console.error('Error updating page content:', error);
    }
  };

  // Listen for messages from the content script (in isolated world)
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;

    // Check if the message is from our extension
    if (event.data.type === 'UPDATE_PAGE_CONTENT') {
      console.log('Received data to update page content:', event.data.payload);
      replaceContentOnPage(event.data.payload);
    }

    if (event.data.type === 'EXTENSION_CONTEXT_INVALID') {
      console.warn('[Copilot]', event.data.payload?.message);
    }
  });

  // Immediately send the HTML to the content script to start the process
  const fullHtml = document.documentElement.outerHTML;
  window.postMessage({ type: 'SEND_HTML_TO_EXTENSION', payload: fullHtml }, '*');
})();
