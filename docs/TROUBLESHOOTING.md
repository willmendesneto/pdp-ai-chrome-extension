# Troubleshooting

## Extension was reloaded — refresh the page

**Symptoms**: Analyze does nothing; console mentions invalidated context.

**Fix**: Refresh the PDP tab (F5), then analyze again. See `CONTEXT_INVALIDATED_MESSAGE` in `projects/content-script/src/main.ts`.

## Gemini API key not configured

**Symptoms**: Immediate error in popup after analyze.

**Fix**: Extension options → paste key from [Google AI Studio](https://aistudio.google.com/app/apikey) → Save.

## Analyze spins then errors

**Checks**:

1. Service worker console (`chrome://extensions` → service worker) for HTTP status / retry logs
2. Quota or rate limit — wait and retry
3. Model name / endpoint unchanged in `projects/background/src/gemini-service.ts` vs Google API availability

## Partial or no DOM updates

**Causes**:

- LLM returned empty selector arrays
- Selectors don’t match merchant DOM (dynamic classes)
- Check page console for `Element with selector not found`

**Mitigation**: Improve prompt selector guidance; site-specific selectors are inherently fragile.

## Duplicate processing / double listeners

**Context**: `content-script/main.js` loads via manifest on all URLs and popup injection on analyze.

**Symptoms**: Duplicate network calls or duplicated handlers.

**Investigation**: Count listeners after navigation + analyze; consider consolidating injection strategy in a future change.

## CSP or network blocked

**Symptoms**: fetch fails in service worker.

**Fix**: Verify `host_permissions` and extension CSP `connect-src` include `https://generativelanguage.googleapis.com/`.

## Revert unwanted changes

Refresh the PDP tab — changes are in-memory DOM edits only (no persistence to merchant backend).

## Debug playbook

See [playbooks/debug-extension.md](./playbooks/debug-extension.md).
