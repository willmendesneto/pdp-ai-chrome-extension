import * as esbuild from 'esbuild';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const bundles = [
  {
    name: 'background',
    entry: 'projects/background/src/main.ts',
    outfile: 'dist/build/background/main.js',
  },
  {
    name: 'content-script',
    entry: 'projects/content-script/src/main.ts',
    outfile: 'dist/build/content-script/main.js',
  },
  {
    name: 'dom-updater',
    entry: 'projects/dom-updater/src/main.ts',
    outfile: 'dist/build/dom-updater/main.js',
  },
];

for (const bundle of bundles) {
  const outdir = path.dirname(path.join(root, bundle.outfile));
  await mkdir(outdir, { recursive: true });
  await esbuild.build({
    entryPoints: [path.join(root, bundle.entry)],
    bundle: true,
    outfile: path.join(root, bundle.outfile),
    format: 'iife',
    target: 'chrome109',
    sourcemap: true,
    tsconfig: path.join(root, `projects/${bundle.name}/tsconfig.json`),
    alias: {
      '@pdp-ai/messaging': path.join(root, 'libs/messaging/src/index.ts'),
      '@pdp-ai/llm-contract': path.join(root, 'libs/llm-contract/src/index.ts'),
      '@pdp-ai/extension-paths': path.join(root, 'libs/extension-paths/src/index.ts'),
    },
    logLevel: 'info',
  });
}

console.log('Extension script bundles built.');
