import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  workers: 1,
  timeout: 30000,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { browserName: 'chromium', trace: 'retain-on-failure' },
  webServer: [
    {
      command: 'node scripts/dev.mjs',
      url: 'http://localhost:5195',
      env: { API_PORT: '3030', MOCK_PORT: '4030', WEB_PORT: '5195' },
      timeout: 90000,
      gracefulShutdown: { signal: 'SIGTERM', timeout: 10000 },
    },
    {
      command:
        'node node_modules/vite/bin/vite.js preview --host localhost --port 5196 --strictPort',
      cwd: 'frontend',
      url: 'http://localhost:5196/sistema-de-checkin/',
      env: { VITE_BASE_PATH: '/sistema-de-checkin/' },
      gracefulShutdown: { signal: 'SIGTERM', timeout: 10000 },
    },
  ],
  projects: [
    {
      name: 'fullstack',
      testMatch: 'fullstack.spec.ts',
      use: { baseURL: 'http://localhost:5195' },
    },
    {
      name: 'pages',
      testMatch: 'pages.spec.ts',
      use: { baseURL: 'http://localhost:5196/sistema-de-checkin/' },
    },
  ],
});
