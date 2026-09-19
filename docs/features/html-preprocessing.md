# Feature: HTML preprocessing

## Overview

Before calling Gemini, the service worker compacts page HTML to reduce tokens and noise.

## Key modules

- `projects/background/src/html-prep.ts` — `prepareHtmlForLlm`
- `projects/dom-updater/src/main.ts` — captures `document.documentElement.outerHTML` (raw, full size)

## Behavior

- Strip: `script`, `style`, `noscript`, `svg`, `iframe`, stylesheet `link`, data-URI src/srcset, HTML comments
- Collapse whitespace
- Truncate to `MAX_HTML_FOR_LLM` (120_000 chars) with HTML comment marker

## Constraints

- No `DOMParser` in service worker — regex/string only
- Raw HTML may still contain PII — treat as sensitive outbound data

## Code paths

- `prepareHtmlForLlm` in `projects/background/src/html-prep.ts`
- Capture: end of `projects/dom-updater/src/main.ts`
