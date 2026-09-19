# Feature: Options & API key

## Overview

Dedicated options page stores the user’s Gemini API key in extension local storage.

## Key modules

- `projects/options/` — Angular options app, `ChromeStorageService`
- Storage key: `geminiApiKey` (see `libs/extension-paths`)

## Behavior

- Options page uses the same visual language as the popup (`projects/options/src/styles.scss`)
- Load saved key on page open
- Save trims whitespace; empty input shows validation message
- Success/status messages auto-clear after 3s

## Auth rules

- Key readable/writable only in extension pages (options) and background worker
- Never expose in content scripts or MAIN world

## Unhappy paths

- Empty save → red validation text
- Missing key at analyze time → background error (see [gemini-llm.md](./gemini-llm.md))

## Code paths

- `options.js` — `chrome.storage.local.get/set`
