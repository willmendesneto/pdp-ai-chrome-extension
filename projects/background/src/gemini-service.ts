import type { LlmPayload } from '@pdp-ai/llm-contract';

const LLM_API_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const LLM_MAX_RETRIES = 4;
const LLM_RETRY_BASE_MS = 2000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableLlmError = (status: number, message: string): boolean => {
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

export const generateLLMContent = async (data: {
  fullHtml: string;
  apiKey: string;
}): Promise<LlmPayload> => {
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

    const canRetry =
      attempt < LLM_MAX_RETRIES - 1 && isRetryableLlmError(response.status, apiMessage);
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
