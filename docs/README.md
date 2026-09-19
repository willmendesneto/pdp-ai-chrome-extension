# Engineering documentation

Canonical source of truth for **PDP AI** (Chrome extension). User-facing install/usage stays in root `README.md`; deep design notes also appear in `PDR.md`.

## Table of contents

### Cross-cutting

- [Development standards](./DEVELOPMENT-STANDARDS.md)
- [Architecture guidelines](./ARCHITECTURE-GUIDELINES.md)
- [Code review standards](./CODE-REVIEW-STANDARDS.md)
- [JavaScript guide](./JAVASCRIPT-GUIDE.md)
- [Testing guide](./TESTING-GUIDE.md)
- [API integration (Gemini)](./API-INTEGRATION.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Discovery summary](./DISCOVERY-SUMMARY.md) — repo inventory baseline

### Features

- [Gemini LLM](./features/gemini-llm.md)
- [HTML preprocessing](./features/html-preprocessing.md)
- [Message passing](./features/message-passing.md)
- [DOM updates](./features/dom-updates.md)
- [Popup UI](./features/popup-ui.md)
- [Options & API key](./features/options-api-key.md)

### Playbooks

- [Debug extension](./playbooks/debug-extension.md)
- [Release / sideload](./playbooks/release-extension.md)

## How to maintain docs

- Prefer **editing an existing doc** over adding a new file for routine changes.
- **Product behavior** → `docs/features/`; **engineering norms** → `docs/` root.
- Update feature docs in the **same PR** as behavior changes when that feature is documented.
