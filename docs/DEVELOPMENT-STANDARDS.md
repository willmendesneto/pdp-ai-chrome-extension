# Development standards

## Scope

Flat JavaScript Chrome extension (MV3). All application files live at the **repository root** unless we introduce a build step later.

## Naming & branding

- **Product name** (manifest, user-facing copy): **PDP AI: LLM-generated for Merchandisers**
- Legacy **"Copilot for Merchandisers"** in `@fileoverview` comments — align new edits with PDP AI when touching headers
- Files: lowercase kebab for new assets; existing `camelCase` JS at root is canonical

## Formatting & style

- No automated formatter today — match surrounding file style (2-space indent in JS, semicolons as in file)
- Use file-level comments and JSDoc/TSDoc on non-trivial functions (see `projects/background/`)
- Prefer `const` / arrow functions; IIFE for content scripts that must not leak globals
- User-facing strings: **English** (README notes future i18n)

## Imports & modules

- No bundler — each HTML page loads its script via `<script src="...">`
- Shared logic lives in `libs/`; do not copy prompt/schema strings outside `projects/background/src/gemini-service.ts` without updating docs

## Files & scope of change

- **Minimize diff**: change only files required for the task
- Avoid new files unless they reduce coupling (e.g. shared message constants) — discuss in PR if splitting
- **`extension/manifest.template.json`**: bump `version` for user-visible releases; document permission changes in PR body
- **`npm run build:extension`** before manual validation; ship `dist/pdp-ai/`

## Commits

- Imperative subject line; explain *why* in body when behavior is non-obvious
- Never commit API keys, `.env`, or captured PDP HTML from real sites

## User-facing copy

- Popup/options: clear, merchandiser-focused; mention refresh-to-revert when describing applied changes
- Error messages should suggest **action** (configure API key, retry, refresh page after extension reload)

## Documentation policy

- See [docs/README.md](./README.md)
- Behavior change in a documented feature → update matching `docs/features/*.md`

## Agent routing

| You are… | Read |
|----------|------|
| Changing Gemini prompt or retries | [features/gemini-llm.md](./features/gemini-llm.md), [API-INTEGRATION.md](./API-INTEGRATION.md) |
| Changing messages between worlds | [features/message-passing.md](./features/message-passing.md) |
| Changing apply logic | [features/dom-updates.md](./features/dom-updates.md) |
| Changing popup/options | [features/popup-ui.md](./features/popup-ui.md), [features/options-api-key.md](./features/options-api-key.md) |
