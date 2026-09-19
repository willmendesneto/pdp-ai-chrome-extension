/**
 * @fileoverview MV3 service worker — Gemini API and extension messaging.
 */

import { GEMINI_API_KEY_STORAGE } from '@pdp-ai/extension-paths';
import { MESSAGE_TYPES } from '@pdp-ai/messaging';
import { generateLLMContent } from './gemini-service';
import { prepareHtmlForLlm } from './html-prep';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === MESSAGE_TYPES.PROCESS_HTML) {
    const rawHtml = request.payload as string;
    const fullHtml = prepareHtmlForLlm(rawHtml);
    const tabId = sender.tab?.id;
    console.log(
      'Processing HTML from tab:',
      tabId,
      `(${fullHtml.length} chars, was ${rawHtml.length})`,
    );

    if (tabId === undefined) {
      sendResponse({ status: 'error', message: 'Missing tab id.' });
      return false;
    }

    chrome.storage.local.get(GEMINI_API_KEY_STORAGE, (data) => {
      const apiKey = data[GEMINI_API_KEY_STORAGE] as string | undefined;
      if (!apiKey) {
        chrome.runtime.sendMessage({
          type: MESSAGE_TYPES.LLM_ERROR,
          payload: {
            message: 'Gemini API key is not configured. Open the extension options.',
          },
        });
        sendResponse({ status: 'error', message: 'API key not configured.' });
        return;
      }

      generateLLMContent({ fullHtml, apiKey })
        .then((llmResponse) => {
          chrome.tabs.sendMessage(tabId, {
            type: MESSAGE_TYPES.LLM_RESPONSE_UPDATE,
            payload: llmResponse,
          });
          sendResponse({ status: 'success' });
        })
        .catch((error: Error) => {
          console.error('LLM API error:', error);
          chrome.runtime.sendMessage({
            type: MESSAGE_TYPES.LLM_ERROR,
            payload: { message: error.message },
          });
          sendResponse({ status: 'error', message: error.message });
        });
    });
    return true;
  }
  return false;
});
