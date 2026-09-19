# Discovery Summary

Generated from repository inventory (code, config, README, PDR). Treat this as the baseline for `docs/` and Cursor agent routing.

## Repository shape

| Aspect | Finding |
|--------|---------|
| **Layout** | Angular workspace — `projects/`, `libs/`, ship **`dist/pdp-ai/`** |
| **Languages** | **TypeScript** — Angular 19 (popup/options) + esbuild bundles (background, content, dom-updater) |
| **Runtime** | **Chrome Extension Manifest V3** (service worker + content scripts) |
| **Package manager** | **npm** — `package.json`, `npm run build:extension` |
| **CI** | None — **no `.github/workflows`** |
| **Formatters / linters** | None configured (no ESLint, Prettier, Biome, etc.) |
| **Automated tests** | None — manual validation only (per README / PDR) |
| **Existing docs** | `README.md` (user-facing), `PDR.md` (architecture review) |

## Proposed source roots

| Area | Root | Notes |
|------|------|--------|
| **Application code** | `projects/`, `libs/` | Built artifact: `dist/pdp-ai/`; manifest template: `extension/manifest.template.json` |
| **Tests** | *Not present* | Manual flows documented in `docs/TESTING-GUIDE.md` |
| **Assets** | Root | GIFs referenced in README (may be gitignored locally) |

## Tech stack (facts from repo)

- **Chrome**: MV3 — manifest template v1.1
- **Permissions**: `activeTab`, `scripting`, `storage`; host `https://generativelanguage.googleapis.com/` and `<all_urls>`
- **LLM**: Google **Gemini** `gemini-2.5-flash` via `generateContent`, JSON response MIME type
- **Storage**: `chrome.storage.local` key `geminiApiKey`
- **UI**: Angular standalone apps (`projects/popup`, `projects/options`)
- **Isolation**: Content script (isolated world) + dom-updater injected into **MAIN** world; `window.postMessage` bridge

## Quality command matrix

No scripted quality gates exist today. Use these **manual** checks until tooling is added:

| Gate | Command / action | Status |
|------|-------------------|--------|
| Format | — | Not configured |
| Lint | — | Not configured |
| Typecheck | — | No static types |
| Unit tests | — | No test runner |
| Build | `npm run build:extension` | Required before sideload |
| E2E | Load unpacked **`dist/pdp-ai`**, exercise popup on a PDP | **Primary validation** |
| Extension reload | After source changes: rebuild, reload extension + refresh target tab | Required |

When adding tooling, update this table and `AGENTS.md` in the same PR.

## Domain / feature areas

1. **Gemini LLM integration** — prompt, JSON schema, retries (`projects/background/`)
2. **HTML capture & preprocessing** — full page HTML, strip scripts/styles, token cap (background + dom-updater)
3. **Extension messaging** — `chrome.runtime` + `postMessage` types (`libs/messaging`, content, background, popup)
4. **DOM application** — selector-based updates for head/body fields (`projects/dom-updater/`)
5. **Popup UX** — analyze flow, loading/results/error (`projects/popup/`)
6. **Options / API key** — persist key locally (`projects/options/`)
7. **SEO vs UX content split** — `head` vs `body` suggestion buckets (prompt + UI)
8. **PDP field coverage** — title, description, shipping/returns
9. **Error handling** — missing API key, rate limits, extension context invalidated
10. **Security / CSP** — extension pages CSP; API key never in page context

## Risk boundaries

| Boundary | Detail |
|----------|--------|
| **Secrets** | Gemini API key in `chrome.storage.local`; passed to API as **query param** on fetch — never log or commit keys |
| **PII / page data** | Full (trimmed) page HTML sent to Google Gemini — treat as **user data leaving the browser** |
| **Page context** | dom-updater runs in page MAIN world — no extension APIs; do not expose storage/API key there |
| **Broad permissions** | `<all_urls>` content script + scripting — changes affect any site the user analyzes |
| **postMessage** | Uses target origin `'*'` between isolated and main world — keep message `type` guards strict |
| **Auto-apply behavior** | LLM response triggers DOM updates when analysis completes — not a separate per-field confirm step |

## Gaps (tribal knowledge today)

- No CI; release checklist uses zip of `dist/pdp-ai/`
- Naming drift: file headers say **"Copilot for Merchandisers"**; product name is **PDP AI** in manifest/README
- Content script is both **manifest-registered** and **re-injected** from popup on analyze — listener duplication risk
- **Message types** live in `libs/messaging`; LLM shape in `libs/llm-contract`
- **Prompt changes** are embedded as a large template string in `gemini-service.ts`
- No telemetry, feature flags, or structured logging beyond `console.*`
- README mentions GIF filenames that may not match repo (`using-the-chrome-extension.gif` vs `extension-in-action.gif`)

## Doc routing (for agents)

| Task | Read first |
|------|------------|
| Architecture / data flow | `docs/ARCHITECTURE-GUIDELINES.md`, `PDR.md` |
| Gemini / API errors | `docs/API-INTEGRATION.md`, `docs/features/gemini-llm.md` |
| Messaging / worlds | `docs/features/message-passing.md` |
| DOM updates | `docs/features/dom-updates.md` |
| UI copy / popup | `docs/features/popup-ui.md`, `docs/features/options-api-key.md` |
| Manual test | `docs/TESTING-GUIDE.md`, skill `.cursor/skills/manual-test-pdp/` |
| Debug | `docs/TROUBLESHOOTING.md`, playbook `docs/playbooks/debug-extension.md` |
