import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { npm } from './npm.mjs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repository =
  process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'sistema-de-checkin';
if (!/^[A-Za-z0-9_.-]+$/.test(repository))
  throw new Error('Nome de repositório inválido.');
npm(['run', 'build'], resolve(root, 'frontend'), {
  VITE_BASE_PATH: `/${repository}/`,
  VITE_HOSTED: 'true',
  VITE_DEMO_MODE: 'true',
  VITE_API_BASE_URL: '',
});
