# AGENTS.md — PDP AI Chrome Extension

Entry point for cloud and IDE agents working in this repository.

## Project summary

**PDP AI** is a Manifest V3 Chrome extension that sends trimmed PDP HTML to **Google Gemini**, then applies SEO/UX suggestions to the live page via CSS selectors. The repo is an **Angular 19** workspace with **esbuild** bundles for the service worker, content script, and MAIN-world DOM updater. Ship artifact: **`dist/pdp-ai/`** (Load unpacked).

Human install/usage: [`README.md`](README.md). Engineering docs: [`docs/README.md`](docs/README.md). Inventory baseline: [`docs/DISCOVERY-SUMMARY.md`](docs/DISCOVERY-SUMMARY.md).

## Mandatory gates

Before marking work complete:

1. **Scope** — Smallest correct diff; no unrelated refactors
2. **Secrets** — No API keys, captured HTML, or credentials in code or commits
3. **World boundaries** — Secrets and `fetch` only in `projects/background/`; no `chrome.*` in `projects/dom-updater/`
4. **Contract** — If message types or LLM JSON shape change, update all call sites (grep) + `docs/features/*` + `libs/messaging` / `libs/llm-contract`
5. **Docs** — Behavior changes in a documented feature → update that feature doc in the same PR
6. **Validation** — `npm run build:extension`, then manual test flow in [`docs/TESTING-GUIDE.md`](docs/TESTING-GUIDE.md) (reload extension + refresh tab)

## Path routing

| Paths | Focus | Docs |
|-------|--------|------|
| `projects/background/` | Gemini, HTML prep, retries | `docs/features/gemini-llm.md`, `docs/API-INTEGRATION.md` |
| `projects/content-script/`, `projects/dom-updater/` | postMessage, DOM apply | `docs/features/message-passing.md`, `docs/features/dom-updates.md` |
| `projects/popup/` | Analyze UX | `docs/features/popup-ui.md` |
| `projects/options/` | API key storage | `docs/features/options-api-key.md` |
| `extension/manifest.template.json` | Permissions, CSP, version | `docs/ARCHITECTURE-GUIDELINES.md`, `docs/playbooks/release-extension.md` |
| `libs/messaging`, `libs/llm-contract` | Message + LLM types | `docs/features/message-passing.md` |

Cursor rules in [`.cursor/rules/README.md`](.cursor/rules/README.md) mirror this routing.

## Quality commands

| Gate | Command | Notes |
|------|---------|--------|
| Build extension | `npm run build:extension` | Output `dist/pdp-ai/` |
| Format | — | Not configured |
| Lint | — | Not configured |
| Typecheck | Via Angular/esbuild build | TypeScript strict |
| Unit tests | — | Not configured |
| E2E / manual | Load unpacked **`dist/pdp-ai`** | Primary QA |
| Grep message contract | `rg "MESSAGE_TYPES" --glob '*.ts'` | After messaging changes |

Update this table when tooling is added.

## Git & CI

- **CI**: None (no `.github/workflows`)
- **Commits**: Only when the user asks; imperative messages; no secrets
- **PRs**: Use `gh pr create` if requested; include manual test notes

## Cursor agent assets

| Asset | Location |
|-------|----------|
| Rules | `.cursor/rules/` |
| Skills | `.cursor/skills/` |
| Slash commands | `.cursor/commands/` |

### Skills

| Skill | Use when |
|-------|----------|
| `manual-test-pdp` | Validating analyze flow end-to-end |
| `debug-chrome-extension` | Investigating failures across worlds |
| `change-gemini-prompt` | Editing prompt, schema, model, retries |

### Commands

| Command | Paired skill |
|---------|----------------|
| `test-extension` | `manual-test-pdp` |
| `review-extension-change` | — (uses `docs/CODE-REVIEW-STANDARDS.md`) |

## Risk reminders

- `<all_urls>` permission — changes affect any site the user analyzes
- Full trimmed HTML is sent to Google — privacy-sensitive
- DOM changes apply on successful analysis; refresh reverts
