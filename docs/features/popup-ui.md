# Feature: Popup UI

## Overview

Toolbar popup drives **Analyze Page**, shows loading/success/error, and displays original vs suggested content with reasons.

## Key modules

- `projects/popup/` — Angular standalone app (`AppComponent`, `ComparisonBlockComponent`)
- `projects/popup/src/app/services/` — scripting and runtime messaging

## User flow

1. Click **Analyze Page** → show loading
2. Inject scripts into active tab (content isolated, then dom-updater MAIN)
3. On `UPDATE_SUCCESS` → show success banner + results sections
4. On `LLM_ERROR` / `UPDATE_ERROR` → error panel

## UI sections

- **Metadata (SEO)**: head title, head description
- **Page content (UX)**: body title, description, shipping/returns

## Auth rules

- Popup has no direct API access — only messaging and scripting

## Build / CSP

- Angular production builds must set `optimization.styles.inlineCritical: false` (see `angular.json`) so `index.html` has no inline `onload` handlers — MV3 `script-src 'self'` blocks them on extension pages.

## Copy notes

- Results explain changes are live until page refresh
- Fix typos in user copy when editing (`aplied` → `applied` in HTML)

## Code paths

- Angular `AppComponent` + `ExtensionRuntimeService` in `projects/popup/`
- Markup ids: `head-title`, `head-description`, `body-*`, `analyzeButton`, `loading`, `results`, `error`
