---
name: change-gemini-prompt
description: Safely edits Gemini prompt, JSON response schema, model id, or retry settings in projects/background for PDP AI. Use when improving SEO/UX suggestions, adding PDP fields, or changing LLM behavior.
---

# Change Gemini prompt / schema

Canonical docs: [`docs/features/gemini-llm.md`](../../docs/features/gemini-llm.md), [`docs/API-INTEGRATION.md`](../../docs/API-INTEGRATION.md). Rule: `.cursor/rules/gemini-prompt-changes.mdc`.

## Workflow

1. Read current `generateLLMContent` prompt and `generationConfig` in `projects/background/src/gemini-service.ts`.
2. Edit prompt — keep **head/body** structure unless intentionally migrating consumers.
3. Grep repo for affected keys: `originalTitle`, `newDescription`, `selectors`, etc.
4. Update `projects/dom-updater/`, `projects/popup/`, and `libs/llm-contract` if fields added/removed.
5. Update `docs/features/gemini-llm.md` (and popup/dom feature docs if UI changed).
6. Run `npm run build:extension`, then skill `manual-test-pdp` on a sample PDP.

## Constraints

- Maintain `responseMimeType: application/json` unless switching parse logic
- Keep HTML preprocessing separate (`prepareHtmlForLlm`) — do not move DOMParser into service worker
- Coordinate CSP/`host_permissions` if endpoint or host changes
