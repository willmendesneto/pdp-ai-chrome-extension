# API integration (Google Gemini)

## Endpoint

- **URL**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`
- **Auth**: API key as query parameter `?key=` on POST (implemented in `projects/background/src/gemini-service.ts`)
- **Caller**: MV3 service worker only

## Request shape

```json
{
  "contents": [{ "parts": [{ "text": "<prompt including HTML>" }] }],
  "generationConfig": { "responseMimeType": "application/json" }
}
```

The prompt embeds PDP HTML (after preprocessing) and instructs JSON matching the head/body schema — see [features/gemini-llm.md](./features/gemini-llm.md).

## Response handling

- Parse `result.candidates[0].content.parts[0].text` as JSON
- If top-level array, use first element (defensive parse in `generateLLMContent`)
- On HTTP error: read `error.message` when JSON body present

## Retries

- Up to **4** attempts (`LLM_MAX_RETRIES`)
- Retry on 429, 502, 503, 504 and message heuristics (quota, rate limit, overloaded)
- Backoff: `2000ms * 2^attempt`

## Errors surfaced to UI

| Condition | User-facing path |
|-----------|------------------|
| No API key | `LLM_ERROR` → popup error section |
| Exhausted retries | `sendResponse` error + `LLM_ERROR` |
| Invalid JSON from model | Uncaught parse error → generic failure |

## Security notes

- Full trimmed HTML leaves the browser to Google — disclose in product/privacy messaging if shipping broadly
- Never log API key or full HTML in production builds
- CSP `connect-src` on extension pages must include Gemini host (see `extension/manifest.template.json`)

## Related code

- `prepareHtmlForLlm` — strip scripts/styles/svg, cap length (`MAX_HTML_FOR_LLM`)
- `generateLLMContent` — prompt + fetch + retry
