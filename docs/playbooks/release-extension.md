# Playbook: Release / sideload

## Pre-release

- [ ] `npm run build:extension` succeeds
- [ ] Manual test matrix in [TESTING-GUIDE.md](../TESTING-GUIDE.md) against **`dist/pdp-ai`**
- [ ] Bump `version` in [extension/manifest.template.json](../../extension/manifest.template.json)
- [ ] README screenshots/GIF paths valid
- [ ] No secrets or debug HTML in repo
- [ ] Update feature docs if behavior changed

## Package

Zip **`dist/pdp-ai/`** (built artifact), not the repo root. Exclude `.map` files if internal policy requires smaller packages.

```bash
npm ci
npm run build:extension
cd dist && zip -r pdp-ai-extension.zip pdp-ai
```

## Sideload (development)

Load unpacked at `chrome://extensions` → select **`dist/pdp-ai`**.

## Chrome Web Store (future)

When publishing:

- Upload zip of `dist/pdp-ai`
- Narrow `host_permissions` if possible
- Privacy policy for HTML sent to Gemini
- Store listing aligns with README capabilities

## Post-release

- Tag git release matching manifest version (optional convention)
- Monitor user reports for selector breakage on major merchant themes
