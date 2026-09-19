import { cp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const buildDir = path.join(root, 'dist/build');
const outDir = path.join(root, 'dist/pdp-ai');

async function assertExists(filePath, label) {
  try {
    await stat(filePath);
  } catch {
    throw new Error(`Missing build output: ${label} (${filePath})`);
  }
}

async function resolvePopupDir() {
  const browser = path.join(buildDir, 'popup/browser');
  try {
    await stat(path.join(browser, 'index.html'));
    return browser;
  } catch {
    const flat = path.join(buildDir, 'popup');
    await assertExists(path.join(flat, 'index.html'), 'popup index');
    return flat;
  }
}

/** MV3 extension_pages CSP blocks inline event handlers (e.g. Angular beasties onload). */
async function sanitizeExtensionPageHtml(htmlPath) {
  let html = await readFile(htmlPath, 'utf8');
  const hadViolation =
    html.includes('onload=') || html.includes('data-beasties-container') || /<style>/.test(html);
  if (!hadViolation) {
    return;
  }
  html = html
    .replace(/\sdata-beasties-container/g, '')
    .replace(/<style>[^<]*<\/style>/gi, '')
    .replace(
      /<link rel="stylesheet" href="styles\.css" media="print" onload="[^"]*"><noscript><link rel="stylesheet" href="styles\.css"><\/noscript>/gi,
      '<link rel="stylesheet" href="styles.css">',
    )
    .replace(/\s+onload="[^"]*"/gi, '');
  await writeFile(htmlPath, html);
}

async function resolveOptionsDir() {
  const browser = path.join(buildDir, 'options/browser');
  try {
    await stat(path.join(browser, 'index.html'));
    return browser;
  } catch {
    const flat = path.join(buildDir, 'options');
    await assertExists(path.join(flat, 'index.html'), 'options index');
    return flat;
  }
}

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

await assertExists(path.join(buildDir, 'background/main.js'), 'background');
await assertExists(path.join(buildDir, 'content-script/main.js'), 'content-script');
await assertExists(path.join(buildDir, 'dom-updater/main.js'), 'dom-updater');

const popupSrc = await resolvePopupDir();
const optionsSrc = await resolveOptionsDir();

await cp(path.join(buildDir, 'background'), path.join(outDir, 'background'), { recursive: true });
await cp(path.join(buildDir, 'content-script'), path.join(outDir, 'content-script'), {
  recursive: true,
});
await cp(path.join(buildDir, 'dom-updater'), path.join(outDir, 'dom-updater'), { recursive: true });
await cp(popupSrc, path.join(outDir, 'popup'), { recursive: true });
await cp(optionsSrc, path.join(outDir, 'options'), { recursive: true });

await sanitizeExtensionPageHtml(path.join(outDir, 'popup/index.html'));
await sanitizeExtensionPageHtml(path.join(outDir, 'options/index.html'));

const manifestTemplate = JSON.parse(
  await readFile(path.join(root, 'extension/manifest.template.json'), 'utf8'),
);
await writeFile(path.join(outDir, 'manifest.json'), `${JSON.stringify(manifestTemplate, null, 2)}\n`);

const gifPath = path.join(root, 'extension-in-action.gif');
try {
  await stat(gifPath);
  await cp(gifPath, path.join(outDir, 'extension-in-action.gif'));
} catch {
  // optional
}

const required = [
  'manifest.json',
  'background/main.js',
  'content-script/main.js',
  'dom-updater/main.js',
  'popup/index.html',
  'options/index.html',
];

for (const rel of required) {
  await assertExists(path.join(outDir, rel), rel);
}

console.log(`Extension assembled at ${outDir}`);
