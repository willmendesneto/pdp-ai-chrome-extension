/**
 * @fileoverview Service worker for Copilot for Merchandisers.
 * Handles LLM API calls and communication with other parts of the extension.
 */

const LLM_API_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/** Max HTML length sent to the LLM (~30k tokens rough upper bound). */
const MAX_HTML_FOR_LLM = 120_000;

/**
 * Strips heavy/noisy markup and caps size to reduce Gemini input tokens.
 * Uses string/regex only (DOMParser is unavailable in MV3 service workers).
 * @param {string} html - Full page HTML from the content script.
 * @returns {string}
 */
const prepareHtmlForLlm = (html) => {
  let compact = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, '')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, '')
    .replace(/<iframe\b[\s\S]*?<\/iframe>/gi, '')
    .replace(/<link\b[^>]*rel\s*=\s*["']?stylesheet["']?[^>]*>/gi, '')
    .replace(/\ssrc\s*=\s*["']data:[^"']*["']/gi, '')
    .replace(/\ssrcset\s*=\s*["']data:[^"']*["']/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (compact.length > MAX_HTML_FOR_LLM) {
    compact =
      compact.slice(0, MAX_HTML_FOR_LLM) + '\n<!-- HTML truncated for API token limits -->';
  }

  return compact;
};

/**
 * Handles incoming messages from content scripts or the popup.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'PROCESS_HTML') {
    const rawHtml = request.payload;
    const fullHtml = prepareHtmlForLlm(rawHtml);
    console.log(
      'Processing HTML from tab:',
      sender.tab.id,
      `(${fullHtml.length} chars, was ${rawHtml.length})`,
    );

    // Retrieve the API key from storage
    chrome.storage.local.get('geminiApiKey', (data) => {
      const apiKey = data.geminiApiKey;
      if (!apiKey) {
        chrome.runtime.sendMessage({
          type: 'LLM_ERROR',
          payload: {
            message: 'Gemini API key is not configured. Open the extension options.',
          },
        });
        sendResponse({ status: 'error', message: 'API key not configured.' });
        return;
      }

      generateLLMContent({ fullHtml, apiKey })
        .then((llmResponse) => {
          // Send the response back to the content script to update the page
          chrome.tabs.sendMessage(sender.tab.id, {
            type: 'LLM_RESPONSE_UPDATE',
            payload: llmResponse,
          });
          sendResponse({ status: 'success' });
        })
        .catch((error) => {
          console.error('LLM API error:', error);
          chrome.runtime.sendMessage({
            type: 'LLM_ERROR',
            payload: { message: error.message },
          });
          sendResponse({ status: 'error', message: error.message });
        });
    });
    return true; // Indicates an asynchronous response
  }
});

const LLM_MAX_RETRIES = 4;
const LLM_RETRY_BASE_MS = 2000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @param {number} status - HTTP status from the API.
 * @param {string} message - Error message from the API.
 * @returns {boolean}
 */
const isRetryableLlmError = (status, message) => {
  if (status === 429 || status === 503 || status === 502 || status === 504) return true;
  const lower = message.toLowerCase();
  return (
    lower.includes('high demand') ||
    lower.includes('resource exhausted') ||
    lower.includes('please retry') ||
    lower.includes('quota') ||
    lower.includes('rate limit') ||
    lower.includes('overloaded')
  );
};

/**
 * Makes the call to the LLM API to generate new content.
 * @param {object} data - The scraped data and API key.
 * @returns {Promise<object>} The LLM's generated content.
 */
const generateLLMContent = async (data) => {
  const prompt = `You are a product page (PDP) analysis expert. Your task is to analyze the HTML code of a product page, extract the essential information (title, description, shipping, and returns), and then generate new, optimized versions.
  
  You must identify the most specific CSS selector for each of the original elements so the content can be dynamically replaced on the page. The optimizations for the <head> tag should be aimed at SEO, while those for the <body> tag should be focused on the customer experience.
  
  Follow the optimization standard below:
  
  **SEO Optimization (<head>):**
  - **Titles:** Must be concise (up to 60 characters), include relevant keywords, and be attractive to search engines.
  - **Descriptions:** Must be direct and informative (up to 160 characters), summarizing the product's main benefits to attract clicks.
  - **Shipping and Returns:** Normally do not apply to <head> metadata.

  **Customer Optimization (<body>):**
  - **Titles:** Must be attractive, clear, and summarize the product in a few words. The priority is user clarity.
  - **Descriptions:** Must be **detailed and complete**. Increase the level of detail with the product's features and functionalities. The description should be persuasive and answer customer questions. **Do not remove important information.**
  - **Shipping and Returns:** Must be direct and reassuring. Highlight guarantees, deadlines, and policies in a clear and simple way.

  For each new suggestion (title, description, shipping, and returns), add a "reason" field with a detailed explanation of why the suggestion was made and how it improves the original content.
  
  CSS selectors must be precise and specific to avoid conflicts with other elements on the page. They should be returned as an array of selectors so all items can be found and updated correctly. If a selector cannot be found with certainty, return an empty array.
  
  Maintain the page's original language. Follow the exact JSON response format below.
  
  HTML Code:
  ${data.fullHtml}
  
  Response Format:
  {
    "head": {
      "originalTitle": {
        "text": "...",
        "selectors": ["<title>", "..."]
      },
      "originalDescription": {
        "text": "...",
        "selectors": ["meta[name='description']", "..."]
      },
      "originalShippingReturns": {
        "text": "...",
        "selectors": ["..."]
      },
      "newTitle": {
        "text": "...",
        "reason": "..."
      },
      "newDescription": {
        "text": "...",
        "reason": "..."
      },
      "newShippingReturns": {
        "text": "...",
        "reason": "..."
      }
    },
    "body": {
      "originalTitle": {
        "text": "...",
        "selectors": ["...", "..."]
      },
      "originalDescription": {
        "text": "...",
        "selectors": ["...", "..."]
      },
      "originalShippingReturns": {
        "text": "...",
        "selectors": ["...", "..."]
      },
      "newTitle": {
        "text": "...",
        "reason": "..."
      },
      "newDescription": {
        "text": "...",
        "reason": "..."
      },
      "newShippingReturns": {
        "text": "...",
        "reason": "..."
      }
    }
  }`;

  const requestBody = JSON.stringify({
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  let lastErrorMessage = 'Unknown error';

  for (let attempt = 0; attempt < LLM_MAX_RETRIES; attempt++) {
    const response = await fetch(`${LLM_API_ENDPOINT}?key=${data.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: requestBody,
    });

    if (response.ok) {
      const result = await response.json();
      const generatedContent = JSON.parse(result.candidates[0].content.parts[0].text);
      return Array.isArray(generatedContent) ? generatedContent[0] : generatedContent;
    }

    let apiMessage = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      apiMessage = errorData.error?.message ?? apiMessage;
    } catch {
      // ignore non-JSON error bodies
    }
    lastErrorMessage = apiMessage;

    const canRetry = attempt < LLM_MAX_RETRIES - 1 && isRetryableLlmError(response.status, apiMessage);
    if (!canRetry) {
      break;
    }

    const delayMs = LLM_RETRY_BASE_MS * 2 ** attempt;
    console.warn(
      `LLM API busy (attempt ${attempt + 1}/${LLM_MAX_RETRIES}), retrying in ${delayMs}ms:`,
      apiMessage,
    );
    await sleep(delayMs);
  }

  throw new Error(
    `LLM API request failed: ${lastErrorMessage}. Wait a moment and try again.`,
  );
};