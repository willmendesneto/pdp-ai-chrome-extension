/** Max HTML length sent to the LLM (~30k tokens rough upper bound). */
export const MAX_HTML_FOR_LLM = 120_000;

/**
 * Strips heavy/noisy markup and caps size to reduce Gemini input tokens.
 * Uses string/regex only (DOMParser is unavailable in MV3 service workers).
 */
export const prepareHtmlForLlm = (html: string): string => {
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
