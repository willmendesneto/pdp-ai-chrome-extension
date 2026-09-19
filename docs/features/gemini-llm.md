# Feature: Gemini LLM

## Overview

Background service worker calls **Gemini 2.5 Flash** to analyze PDP HTML and return structured SEO (head) and UX (body) suggestions with reasons and CSS selectors.

## Key modules

- `projects/background/src/gemini-service.ts` — `generateLLMContent`
- `projects/background/src/html-prep.ts` — `prepareHtmlForLlm`
- `projects/background/src/main.ts` — `PROCESS_HTML` listener

## Auth rules

- Requires `geminiApiKey` in `chrome.storage.local`
- Key never sent to content or MAIN world — only background fetch

## External dependencies

- Google Generative Language API (`generativelanguage.googleapis.com`)

## Response schema (summary)

Top-level object with `head` and `body`, each containing:

- `originalTitle`, `originalDescription`, `originalShippingReturns` — `{ text, selectors[] }`
- `newTitle`, `newDescription`, `newShippingReturns` — `{ text, reason }` (head shipping/returns typically unused)

Full schema is embedded in the prompt string in `generateLLMContent`.

## Unhappy paths

- Missing key → `LLM_ERROR` without API call
- HTTP errors → retries then thrown error
- Malformed JSON from model → parse failure

## Observability

- Service worker console: HTML char counts, retry warnings, API errors

## Related docs

- [API-INTEGRATION.md](../API-INTEGRATION.md)
- Skill: `.cursor/skills/change-gemini-prompt/`

## Code paths

- Prompt + fetch: `projects/background/src/gemini-service.ts` (`generateLLMContent`, `LLM_API_ENDPOINT`, retry helpers)
