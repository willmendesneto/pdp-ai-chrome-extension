# Architecture guidelines

## Directory layout

```
/
├── angular.json
├── package.json
├── extension/manifest.template.json
├── scripts/build-scripts.mjs, assemble-extension.mjs
├── projects/
│   ├── background/          # MV3 service worker — Gemini API, HTML prep
│   ├── content-script/      # Isolated world — message bridge
│   ├── dom-updater/         # MAIN world — HTML send + DOM apply (TS, no Angular)
│   ├── popup/               # Angular toolbar popup
│   └── options/             # Angular API key settings
├── libs/
│   ├── messaging/           # Message type constants and TS unions
│   ├── llm-contract/        # LLM JSON interfaces
│   └── extension-paths/     # Inject paths, storage key names
├── dist/pdp-ai/             # Load unpacked target (generated)
├── README.md
├── PDR.md
└── docs/
```

## Module boundaries

| Component | Runs in | May use | Must not |
|-----------|---------|---------|----------|
| `projects/background` | Extension service worker | `fetch`, `chrome.storage`, `chrome.tabs` | DOM, `window` |
| `projects/content-script` | Isolated content script | `chrome.runtime`, `postMessage` | Direct DOM mutation |
| `projects/dom-updater` | Page MAIN world | DOM, `postMessage` | `chrome.*`, storage |
| `projects/popup` | Extension popup | `chrome.scripting`, `chrome.tabs`, runtime messages | Page DOM |
| `projects/options` | Extension options | `chrome.storage.local` | Page context |

## Data flow (analyze)

1. User clicks **Analyze Page** in popup → inject `content-script/main.js` (isolated) then `dom-updater/main.js` (MAIN).
2. `dom-updater` posts `SEND_HTML_TO_EXTENSION` with `document.documentElement.outerHTML`.
3. `content-script` forwards `PROCESS_HTML` to background.
4. Background strips/noise-caps HTML, calls Gemini with embedded prompt, parses JSON.
5. Background sends `LLM_RESPONSE_UPDATE` to tab → content forwards `UPDATE_PAGE_CONTENT` to MAIN + `UPDATE_SUCCESS` to popup.
6. `dom-updater` applies selectors; popup renders comparison UI.

See [features/message-passing.md](./features/message-passing.md) for message types.

## Build & ship

- `npm run build:extension` → `dist/pdp-ai/`
- Manifest is copied from `extension/manifest.template.json` during assemble.
- Bump `version` in the template for releases.

## Auth & secrets

- API key: `chrome.storage.local.geminiApiKey`, set on options page only
- Key is read in **background** only; never inject into page scripts
- CSP on extension pages restricts `connect-src` to Gemini host (see manifest template)

## Logging & observability

- `console.log` / `warn` / `error` in extension contexts and page script
- No analytics pipeline — avoid logging full HTML or API keys

## Environment & configuration

- No `.env` — configuration is storage + constants in `projects/background/` (model id, retry counts, `MAX_HTML_FOR_LLM`)
- Model endpoint: `generativelanguage.googleapis.com` v1beta `gemini-2.5-flash:generateContent`

## Versioning

- `extension/manifest.template.json` `version` field is the extension release identifier
- Document breaking permission or message contract changes in release playbook

## Extensibility

- Prompt and JSON response shape are centralized in `projects/background/src/gemini-service.ts` — coordinate with [features/gemini-llm.md](./features/gemini-llm.md)
- New PDP fields require prompt schema, `dom-updater` apply paths, popup result sections, and `libs/llm-contract`
