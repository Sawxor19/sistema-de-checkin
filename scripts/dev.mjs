import { spawn, execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createServer } from 'node:net';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const demo = process.argv.includes('--demo');
function port(name, fallback) {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isInteger(value) || value < 1 || value > 65535)
    throw new Error(`${name} deve ser uma porta válida.`);
  return value;
}
const apiPort = port('API_PORT', 3000);
const mockPort = port('MOCK_PORT', 4000);
const webPort = port('WEB_PORT', 5173);
const origin = `http://localhost:${webPort}`;
const children = new Set();
let closing = false;

function stop(code = 0) {
  if (closing) return;
  closing = true;
  for (const child of children) {
    if (child.exitCode !== null || child.signalCode !== null) continue;
    try {
      if (process.platform === 'win32')
        execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
          stdio: 'ignore',
          windowsHide: true,
        });
      else process.kill(-child.pid, 'SIGTERM');
    } catch {
      /* O processo pode já ter encerrado. */
    }
  }
  process.exitCode = code;
  setTimeout(() => {
    for (const child of children)
      if (child.exitCode === null && child.signalCode === null)
        try {
          if (process.platform === 'win32') child.kill('SIGKILL');
          else process.kill(-child.pid, 'SIGKILL');
        } catch {
          /* Processo já encerrado. */
        }
  }, 5000).unref();
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());

function start(name, entry, args, cwd, env) {
  const script = resolve(root, entry);
  if (!existsSync(script))
    throw new Error(`Dependências de ${name} ausentes. Execute npm run setup.`);
  const child = spawn(process.execPath, [script, ...args], {
    cwd: resolve(root, cwd),
    stdio: 'inherit',
    windowsHide: true,
    detached: process.platform !== 'win32',
    env: { ...process.env, ...env },
  });
  children.add(child);
  child.on('error', () => {
    console.error(`Não foi possível iniciar ${name}.`);
    stop(1);
  });
  child.on('exit', (code) => {
    if (!closing) {
      console.error(`${name} encerrou inesperadamente.`);
      stop(code || 1);
    }
  });
}

async function free(value) {
  await new Promise((resolvePromise, reject) => {
    const server = createServer();
    server.once('error', () =>
      reject(
        new Error(
          `Porta ${value} indisponível. Encerre o serviço que já está usando essa porta.`,
        ),
      ),
    );
    server.listen(value, () => server.close(resolvePromise));
  });
}
async function ready(url) {
  for (let attempt = 0; attempt < 120 && !closing; attempt++) {
    try {
      if ((await fetch(url, { signal: AbortSignal.timeout(1000) })).ok) return;
    } catch {
      /* Aguarda inicialização. */
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 250));
  }
  if (!closing)
    throw new Error(
      'Um dos serviços não ficou disponível. Confira as mensagens acima.',
    );
}

try {
  const ports = demo ? [webPort] : [mockPort, apiPort, webPort];
  if (new Set(ports).size !== ports.length)
    throw new Error('Os serviços devem usar portas diferentes.');
  for (const value of ports) await free(value);
  if (!demo) {
    start('Cadastro', 'mock-service/server.js', [], 'mock-service', {
      PORT: String(mockPort),
    });
    await ready(`http://localhost:${mockPort}/health`);
    if (closing) process.exit(process.exitCode ?? 0);
    start(
      'API',
      'backend/node_modules/@nestjs/cli/bin/nest.js',
      ['start', '--watch'],
      'backend',
      {
        PORT: String(apiPort),
        CADASTRO_URL: `http://localhost:${mockPort}`,
        FRONTEND_ORIGIN: `${origin},http://127.0.0.1:${webPort}`,
      },
    );
    await ready(`http://localhost:${apiPort}/health`);
  }
  if (!closing) {
    start(
      'Interface',
      'frontend/node_modules/vite/bin/vite.js',
      ['--host', 'localhost', '--port', String(webPort), '--strictPort'],
      'frontend',
      {
        VITE_DEMO_MODE: String(demo),
        VITE_HOSTED: 'false',
        VITE_BASE_PATH: '/',
        VITE_API_BASE_URL: `http://localhost:${apiPort}`,
      },
    );
    await ready(origin);
    if (!closing)
      console.log(
        `\nAplicação pronta: ${origin}/#totem\nFila: ${origin}/#fila\nModo: ${demo ? 'demonstração em memória na aba' : 'API NestJS + cadastro externo'}\nCtrl+C encerra os serviços.\n`,
      );
  }
} catch (error) {
  console.error(error.message);
  stop(1);
}
