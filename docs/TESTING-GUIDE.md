# Testing guide

## Current state

There is **no automated test suite**. Validation is **manual** through Chrome’s extension developer workflow.

## Prerequisites

- Node.js and `npm install` completed
- **`npm run build:extension`** — load **`dist/pdp-ai`** at `chrome://extensions`
- Valid Gemini API key in extension options
- A public product detail page (PDP) for end-to-end exercise

## Manual test matrix

| Scenario | Steps | Expected |
|----------|--------|----------|
| Options save | Open options → enter key → Save | Green success message; key persists on reopen |
| Missing key | Clear storage / fresh install → Analyze | Error UI; background message about configuring key |
| Happy path | PDP → Analyze Page | Loading → success → results populated; visible DOM changes on page |
| Revert | Refresh PDP tab | Original merchant content restored |
| Extension reload | Reload extension without refreshing tab → Analyze | Context invalidated message / user refresh guidance |
| Rate limit | (Optional) stress API | Retries in service worker console; eventual error if exhausted |

## Reload discipline

After changing **any** extension source or `extension/manifest.template.json`:

1. Run **`npm run build:extension`**
2. Reload extension on `chrome://extensions`
3. **Refresh** the target PDP tab before re-analyzing

## Future automation (optional)

If adding tests later, prefer:

- **Unit**: `prepareHtmlForLlm`, retry predicate, `libs/llm-contract` helpers with Node test runner
- **E2E**: Playwright + unpacked extension loading (heavier setup)

Document new commands in [DISCOVERY-SUMMARY.md](./DISCOVERY-SUMMARY.md) and root `AGENTS.md`.

## Fixtures

Use public merchant PDPs only; do not commit captured HTML or API keys in bug reports.
