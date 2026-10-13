import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { npm } from './npm.mjs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
for (const project of ['backend', 'frontend', 'mock-service'])
  npm(['ci'], resolve(root, project));
console.log(
  'Dependências instaladas. Execute npm run dev ou npm run dev:demo.',
);
