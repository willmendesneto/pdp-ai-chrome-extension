# Playbook: Debug extension

## 1. Reproduce

- Note browser version, extension version (`extension/manifest.template.json`), PDP URL (avoid sharing proprietary URLs in tickets if policy requires)

## 2. Open devtools surfaces

| Surface | How |
|---------|-----|
| Service worker | `chrome://extensions` → **Service worker** link for PDP AI |
| Popup | Right-click popup → Inspect |
| Options | Right-click options page → Inspect |
| Page | Regular DevTools on PDP (MAIN world logs from dom-updater bundle) |

## 3. Trace analyze flow

1. Confirm `SEND_HTML_TO_EXTENSION` / `PROCESS_HTML` in content logs
2. Background: char count after prep, fetch status, retries
3. Content: `LLM_RESPONSE_UPDATE` forwarded
4. Page: `UPDATE_PAGE_CONTENT` and selector warnings

## 4. Common fixes

- Reload extension + refresh tab
- Re-enter API key
- Wait for quota/rate limits

## 5. Escalation data to capture

- Redacted service worker log lines (no key, no full HTML)
- HTTP status and API error message text
- Whether selectors were empty in LLM JSON (inspect popup payload via breakpoint)

See [TROUBLESHOOTING.md](../TROUBLESHOOTING.md).
