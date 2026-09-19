(() => {
  /**
   * @fileoverview Content script for Copilot for Merchandisers.
   * Acts as an intermediary between the background script and a script
   * injected into the main page context to update the DOM.
   */

  const CONTEXT_INVALIDATED_MESSAGE =
    'The extension was reloaded. Refresh this page (F5) and try again.';

  /**
   * Sends a message to the extension, handling invalidated extension context.
   * @param {object} message
   */
  const safeSendMessage = (message) => {
    if (!chrome.runtime?.id) {
      window.postMessage(
        { type: 'EXTENSION_CONTEXT_INVALID', payload: { message: CONTEXT_INVALIDATED_MESSAGE } },
        '*',
      );
      return;
    }

    try {
      chrome.runtime.sendMessage(message, () => {
        const err = chrome.runtime.lastError;
        if (!err) return;
        console.warn('Extension message failed:', err.message);
        if (err.message?.includes('invalidated') || err.message?.includes('Extension context')) {
          window.postMessage(
            { type: 'EXTENSION_CONTEXT_INVALID', payload: { message: CONTEXT_INVALIDATED_MESSAGE } },
            '*',
          );
        }
      });
    } catch (error) {
      console.warn('Extension context invalidated:', error);
      window.postMessage(
        { type: 'EXTENSION_CONTEXT_INVALID', payload: { message: CONTEXT_INVALIDATED_MESSAGE } },
        '*',
      );
    }
  };

  // Listen for messages from the main page context (from the script we inject)
  window.addEventListener('message', (event) => {
    // Only accept messages from ourselves
    if (event.source !== window) return;

    if (event.data.type === 'SEND_HTML_TO_EXTENSION') {
      const fullHtml = event.data.payload;
      safeSendMessage({
        type: 'PROCESS_HTML',
        payload: fullHtml,
      });
    }
  });

  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'LLM_RESPONSE_UPDATE') {
      // Forward the LLM's response to a script injected in the main world
      window.postMessage({ type: 'UPDATE_PAGE_CONTENT', payload: request.payload }, '*');
      safeSendMessage({ type: 'UPDATE_SUCCESS', payload: request.payload });
    }
  });
})();