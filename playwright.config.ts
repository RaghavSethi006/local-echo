import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  globalTimeout: 120_000,
  expect: {
    timeout: 15_000,
  },
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:3100',
    trace: 'retain-on-failure',
    permissions: ['clipboard-read', 'clipboard-write'],
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
            '--disable-features=WebRtcHideLocalIpsWithMdns',
            '--force-webrtc-ip-handling-policy=default_public_and_private_interfaces',
          ],
        },
      },
    },
  ],
  webServer: [
    {
      command: 'node tests/e2e/signaling-server.mjs',
      url: 'http://127.0.0.1:9100/offgrid',
      reuseExistingServer: false,
      timeout: 15_000,
    },
    {
      command: 'npx vite --host 127.0.0.1 --port 3100 --strictPort',
      url: 'http://127.0.0.1:3100',
      reuseExistingServer: false,
      timeout: 30_000,
      env: {
        VITE_PEERJS_HOST: '127.0.0.1',
        VITE_PEERJS_PORT: '9100',
        VITE_PEERJS_SECURE: 'false',
        VITE_PEERJS_PATH: '/offgrid',
        VITE_ICE_SERVERS: '[{"urls":"stun:127.0.0.1:3478"}]',
      },
    },
  ],
});
