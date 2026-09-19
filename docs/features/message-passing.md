# Feature: Message passing

## Overview

Three execution contexts communicate via **`chrome.runtime` messages** and **`window.postMessage`** with a shared string `type` contract.

## Message types

| Type | Direction | Payload |
|------|-----------|---------|
| `SEND_HTML_TO_EXTENSION` | MAIN → isolated | full HTML string |
| `PROCESS_HTML` | content → background | full HTML string |
| `LLM_RESPONSE_UPDATE` | background → content | LLM JSON object |
| `UPDATE_PAGE_CONTENT` | isolated → MAIN | LLM JSON object |
| `UPDATE_SUCCESS` | content → popup (via runtime) | LLM JSON object |
| `LLM_ERROR` | background → popup | `{ message }` |
| `EXTENSION_CONTEXT_INVALID` | isolated → MAIN | `{ message }` |

## Auth rules

- Only extension contexts use `chrome.runtime`
- Page MAIN world only sees `postMessage` types above — never storage or API key

## Unhappy paths

- Invalidated extension context → `EXTENSION_CONTEXT_INVALID` / user refresh
- Missing tab id on async background response — rare if sender tab present

## Invariants

- `event.source === window` guard on all `message` listeners
- Background async handler returns `true` for `PROCESS_HTML`

## Code paths

- `libs/messaging` — `MESSAGE_TYPES` and TypeScript message unions
- `projects/content-script/` — bridge
- `projects/popup/` — runtime listener, script injection (`EXTENSION_SCRIPT_PATHS`)
- `projects/background/` — `PROCESS_HTML` listener
- `projects/dom-updater/` — `SEND_HTML_TO_EXTENSION`, `UPDATE_PAGE_CONTENT`
