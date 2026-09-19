# Feature: DOM updates

## Overview

After LLM success, the MAIN-world bundle applies suggested text to DOM nodes identified by CSS selectors from the model.

## Key modules

- `projects/dom-updater/src/main.ts` — `updateElement`, `replaceContentOnPage`

## Apply rules

- **Head**: title + meta description (SEO suggestions); shipping/returns skipped for head
- **Body**: title, description, shipping/returns
- For each field, iterate all selectors in `original*.selectors` and set content to `new*.text`
- Special cases: `meta` → `content` attribute; `title` → `document.title`; else `textContent`

## Auth rules

- Runs in page MAIN world — same privileges as page JS; no elevation

## Unhappy paths

- Missing selector → console warn, continue
- Invalid selector → caught, logged

## Product note

Updates run when analysis completes (same flow as popup success) — not a separate per-field approval step in code.

## Revert

User refreshes page — no persisted merchant-side write.

## Code paths

- `replaceContentOnPage`, `updateElement` in `projects/dom-updater/src/main.ts`
