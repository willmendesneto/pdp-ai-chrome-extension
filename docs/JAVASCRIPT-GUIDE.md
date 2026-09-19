# JavaScript guide

This repo uses **plain JavaScript** (no TypeScript, no build step).

## Types & documentation

- Use JSDoc for public functions and complex objects (see `prepareHtmlForLlm`, `generateLLMContent`)
- LLM response shape is documented in the prompt in `projects/background/src/gemini-service.ts`, in `libs/llm-contract`, and in [features/gemini-llm.md](./features/gemini-llm.md) — keep them aligned

## Errors

- Background: throw `Error` with user-actionable messages after retry exhaustion
- Background listener: `sendResponse({ status: 'error', message })` and broadcast `LLM_ERROR` to popup
- DOM updater: catch per-selector errors; log and continue other selectors
- Content script: detect invalidated extension context before `sendMessage`

## Async patterns

- Service worker: `return true` from `onMessage` when using async `sendResponse`
- Prefer `async/await` in background for fetch/retry loops
- Popup/options: callback style with `chrome.*` APIs is acceptable to match existing code

## Chrome APIs

- **MV3 service worker** may sleep — avoid assuming long-lived state in memory
- Use `chrome.scripting.executeScript` with `world: 'MAIN'` only for `dom-updater/main.js` (see `EXTENSION_SCRIPT_PATHS`)
- Storage: `chrome.storage.local` for API key only

## Constants & magic strings

- Message types (`PROCESS_HTML`, `LLM_RESPONSE_UPDATE`, etc.) are string contracts — change all producers/consumers together
- Consider a future `messages.js` duplicated via build; until then, grep the repo when renaming

## What to avoid

- Importing Node-only APIs in extension scripts
- `eval` or inline scripts in extension pages (CSP `script-src 'self'`)
- Passing API keys into content or MAIN world scripts
