
# 🤖 PDP AI: LLM-generated for Merchandisers

PDP AI: LLM-generated for Merchandisers is a Chrome extension that uses Google's Gemini AI to analyze and optimize product detail pages (PDPs) for SEO and customer experience. It provides real-time suggestions and allows users to apply changes directly to the page.

---

## 📦 Architecture & Workflow

- **Manifest v3**: Built from [`extension/manifest.template.json`](extension/manifest.template.json) into `dist/pdp-ai/`.
- **Angular workspace**: Popup and options are standalone Angular apps; shared types live in `libs/`.
- **Service worker** (`projects/background/`): Gemini API calls and HTML preprocessing.
- **Content script** (`projects/content-script/`): Bridges extension and page context.
- **DOM updater** (`projects/dom-updater/`): MAIN-world script injected on analyze (TypeScript bundle, no Angular runtime).
- **Popup** (`projects/popup/`): Analyze UX and suggestion comparison UI.
- **Options** (`projects/options/`): Secure API key management.

### Data Flow
1. User clicks "Analyze Page" in the popup.
2. Page HTML is sent to Gemini API via background script.
3. Suggestions are returned and displayed in the popup.
4. Changes are applied on the page (refresh to revert).

### Security & Privacy
- API key is stored securely in Chrome local storage.
- Only explicit user actions trigger page changes.

---

## 🛠️ Installation & Setup

1. **Clone the repository** and install dependencies: `npm install`
2. **Build the extension**: `npm run build:extension`
3. **Enable Developer Mode** at `chrome://extensions`
4. **Load unpacked** and select the **`dist/pdp-ai`** folder (not the repo root).
5. **Get a Gemini API key**: [Google AI Studio](https://aistudio.google.com/app/apikey)
6. **Configure the extension**: paste your API key on the options page.

After code changes, run `npm run build:extension` again, reload the extension, and refresh the PDP tab.

---

## 🚀 Usage

1. Go to any product page (PDP).
2. Click the extension icon and **Analyze Page**.
3. Review suggestions for SEO and UX in the popup.
4. Refresh the page to revert applied changes.

---

## ✅ Validation & Testing

See [`docs/TESTING-GUIDE.md`](docs/TESTING-GUIDE.md). Build first, then load `dist/pdp-ai`.

---

## How to use

![How to use](./using-the-chrome-extension.gif)

## Results - Extension in Action

![Results - Extension in Action](./extension-in-action.gif)

## 🚧 Future Improvements

- i18n: Multi-language support for global users.
- Change reversion: Undo applied changes without refresh.
- Suggestion history: Log and browse previous suggestions.
- Prompt customization: User control over AI instructions.
- User feedback: Rate AI suggestions for future improvement.
- Image optimization: Analyze and suggest alt text for images.
- More PDP properties: Support for bullet points, specs, reviews, etc.

---

## 📄 Project Design Review (PDR)

See `PDR.md` for a detailed technical and architectural review of the project.
