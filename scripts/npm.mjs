import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export function npm(args, cwd, env = {}) {
  const cli =
    process.env.npm_execpath ||
    resolve(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
  if (process.platform === 'win32' && !existsSync(cli))
    throw new Error('Execute este comando pelo npm instalado com Node.js 24.');
  const usingCli = existsSync(cli);
  const result = spawnSync(
    usingCli ? process.execPath : 'npm',
    usingCli ? [cli, ...args] : args,
    {
      cwd,
      stdio: 'inherit',
      env: { ...process.env, ...env },
      windowsHide: true,
    },
  );
  if (result.error || result.status !== 0)
    throw new Error(`Falha ao executar npm ${args.join(' ')}.`);
}
