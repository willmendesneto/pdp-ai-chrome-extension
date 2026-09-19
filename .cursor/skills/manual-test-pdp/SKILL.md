---
name: manual-test-pdp
description: Runs the manual Chrome extension test matrix for PDP AI analyze flow on a product page. Use when validating changes, before PRs, or when the user asks to test the extension.
---

# Manual test PDP extension

Follow [`docs/TESTING-GUIDE.md`](../../docs/TESTING-GUIDE.md).

## Steps

1. Run **`npm run build:extension`**; confirm changed files saved.
2. Load unpacked **`dist/pdp-ai`** (or reload if already pointed there). Note if manifest template or service worker changed.
3. Open `chrome://extensions` → reload **PDP AI**.
4. Refresh the target PDP tab (required after reload).
5. Options: verify API key saved (`geminiApiKey`).
6. Open popup → **Analyze Page** → observe loading → success or error.
7. Verify popup results sections match LLM fields (head/body title, description, shipping/returns).
8. Verify visible DOM changes on PDP; refresh tab to confirm revert.
9. If error: open service worker console; cross-check [`docs/TROUBLESHOOTING.md`](../../docs/TROUBLESHOOTING.md).

## Report back

- Browser used
- Pass/fail per scenario in testing guide matrix
- Console errors (redact URLs/keys if sensitive)
