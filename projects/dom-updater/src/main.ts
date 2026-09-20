/**
 * MAIN world script — DOM updates and HTML capture. No chrome.* APIs.
 */

import type { LlmPayload } from '@pdp-ai/llm-contract';
import { MESSAGE_TYPES } from '@pdp-ai/messaging';

const updateElement = (selector: string, newText: string): void => {
  try {
    const el = document.querySelector(selector);
    if (el) {
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

const replaceContentOnPage = (data: LlmPayload): void => {
  try {
    if (data.head) {
      if (
        data.head.newTitle &&
        data.head.originalTitle &&
        Array.isArray(data.head.originalTitle.selectors)
      ) {
        data.head.originalTitle.selectors.forEach((selector) =>
          updateElement(selector, data.head.newTitle.text),
        );
      }
      if (
        data.head.newDescription &&
        data.head.originalDescription &&
        Array.isArray(data.head.originalDescription.selectors)
      ) {
        data.head.originalDescription.selectors.forEach((selector) =>
          updateElement(selector, data.head.newDescription.text),
        );
      }
    }

    if (data.body) {
      if (
        data.body.newTitle &&
        data.body.originalTitle &&
        Array.isArray(data.body.originalTitle.selectors)
      ) {
        data.body.originalTitle.selectors.forEach((selector) =>
          updateElement(selector, data.body.newTitle.text),
        );
      }
      if (
        data.body.newDescription &&
        data.body.originalDescription &&
        Array.isArray(data.body.originalDescription.selectors)
      ) {
        data.body.originalDescription.selectors.forEach((selector) =>
          updateElement(selector, data.body.newDescription.text),
        );
      }
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

window.addEventListener('message', (event) => {
  if (event.source !== window) return;

  if (event.data?.type === MESSAGE_TYPES.UPDATE_PAGE_CONTENT) {
    console.log('Received data to update page content:', event.data.payload);
    replaceContentOnPage(event.data.payload as LlmPayload);
  }

  if (event.data?.type === MESSAGE_TYPES.EXTENSION_CONTEXT_INVALID) {
    console.warn('[Copilot]', event.data.payload?.message);
  }
});

const fullHtml = document.documentElement.outerHTML;
window.postMessage({ type: MESSAGE_TYPES.SEND_HTML_TO_EXTENSION, payload: fullHtml }, '*');
