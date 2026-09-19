# Code review standards

## CI vs review

| Owned by CI | Owned by review |
|-------------|-----------------|
| *Nothing automated today* | Correctness, security, UX copy, docs sync |
| Future: lint/test workflows | Architecture boundaries, permission scope, prompt changes |

When CI is added, move mechanical checks to workflows; review focuses on product and security.

## Review lenses

1. **Security** — API key handling, HTML exfiltration scope, permission changes, MAIN vs isolated world
2. **Contract** — message `type` strings and JSON payload shape stay consistent across files and `libs/`
3. **UX** — loading/error states, refresh-to-revert messaging, auto-apply implications
4. **LLM** — prompt edits, token/size limits, retry behavior
5. **Docs** — feature doc updated when behavior in that area changes

## Module routing (path → must enforce)

| Path | Enforce |
|------|---------|
| `projects/background/` | No DOM; retries; no logging secrets/HTML; prompt/schema docs |
| `projects/content-script/` | Safe send on invalidated context; forward-only bridge |
| `projects/dom-updater/` | Selector safety; no extension APIs; idempotent apply where possible |
| `projects/popup/` | Injection order (content then MAIN); UI state machine |
| `projects/options/` | Trim key; storage only; no network |
| `extension/manifest.template.json` | Minimal permissions; CSP; version bump for releases |

## Known failure modes

- **Extension context invalidated** after reload — user must refresh tab (handled in content-script)
- **Missing API key** — background emits `LLM_ERROR`; popup shows error panel
- **Gemini rate limits** — exponential backoff in background; user sees generic error if exhausted
- **Wrong selectors** — silent skip with console warn; partial page updates
- **Duplicate listeners** — manifest registers content script on all URLs *and* popup re-injects — watch for double processing when changing listeners

## PR checklist

- [ ] `npm run build:extension` succeeds
- [ ] Manual test on a sample PDP (see [TESTING-GUIDE.md](./TESTING-GUIDE.md)) using **`dist/pdp-ai`**
- [ ] No secrets in diff
- [ ] Feature docs updated if applicable
- [ ] Manifest template version/permissions called out in description if changed
