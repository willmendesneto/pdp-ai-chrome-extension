/**
 * @fileoverview Content script — bridge between background and MAIN world.
 */

import { MESSAGE_TYPES } from '@pdp-ai/messaging';

const CONTEXT_INVALIDATED_MESSAGE =
  'The extension was reloaded. Refresh this page (F5) and try again.';

const safeSendMessage = (message: object): void => {
  if (!chrome.runtime?.id) {
    window.postMessage(
      {
        type: MESSAGE_TYPES.EXTENSION_CONTEXT_INVALID,
        payload: { message: CONTEXT_INVALIDATED_MESSAGE },
      },
      '*',
    );
    return;
  }

  try {
    chrome.runtime.sendMessage(message, () => {
      const err = chrome.runtime.lastError;
      if (!err) return;
      // Fire-and-forget messages (e.g. UPDATE_SUCCESS) have no sendResponse — ignore.
      if (err.message?.includes('message port closed before a response was received')) {
        return;
      }
      console.warn('Extension message failed:', err.message);
      if (err.message?.includes('invalidated') || err.message?.includes('Extension context')) {
        window.postMessage(
          {
            type: MESSAGE_TYPES.EXTENSION_CONTEXT_INVALID,
            payload: { message: CONTEXT_INVALIDATED_MESSAGE },
          },
          '*',
        );
      }
    });
  } catch (error) {
    console.warn('Extension context invalidated:', error);
    window.postMessage(
      {
        type: MESSAGE_TYPES.EXTENSION_CONTEXT_INVALID,
        payload: { message: CONTEXT_INVALIDATED_MESSAGE },
      },
      '*',
    );
  }
};

window.addEventListener('message', (event) => {
  if (event.source !== window) return;

  if (event.data?.type === MESSAGE_TYPES.SEND_HTML_TO_EXTENSION) {
    const fullHtml = event.data.payload as string;
    safeSendMessage({
      type: MESSAGE_TYPES.PROCESS_HTML,
      payload: fullHtml,
    });
  }
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.type === MESSAGE_TYPES.LLM_RESPONSE_UPDATE) {
    window.postMessage(
      { type: MESSAGE_TYPES.UPDATE_PAGE_CONTENT, payload: request.payload },
      '*',
    );
    safeSendMessage({ type: MESSAGE_TYPES.UPDATE_SUCCESS, payload: request.payload });
  }
});
