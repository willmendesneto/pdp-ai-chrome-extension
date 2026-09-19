---
name: debug-chrome-extension
description: Diagnoses PDP AI MV3 issues across service worker, popup, content, and MAIN world scripts. Use when analyze fails, partial DOM updates occur, or extension context is invalidated.
---

# Debug Chrome extension

Read [`docs/playbooks/debug-extension.md`](../../docs/playbooks/debug-extension.md) and [`docs/TROUBLESHOOTING.md`](../../docs/TROUBLESHOOTING.md).

## Ordered investigation

1. Reproduce with extension reloaded + tab refreshed.
2. **Service worker** console: `PROCESS_HTML` size logs, fetch status, retries, parse errors.
3. **Popup** inspector: `UPDATE_SUCCESS` / `LLM_ERROR` handling.
4. **Page** console: `dom-updater` selector warnings (MAIN world).
5. Grep message types — ensure producer/consumer agreement (`docs/features/message-passing.md`).

## Do not

- Log or paste API keys or full HTML in chat/commits
- Put secrets into MAIN world for debugging

## Output

- Likely layer (background / bridge / DOM / API)
- Specific message type or HTTP status involved
- Minimal fix suggestion with file paths
