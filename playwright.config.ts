import { defineConfig, devices } from "@playwright/test";

const webServer =
  process.env.PLAYWRIGHT_SKIP_WEB_SERVER === "1"
    ? undefined
    : {
        command:
          'cmd /c "npm run build && npm run start -- --hostname 127.0.0.1 --port 3000"',
        url: "http://127.0.0.1:3000/queen",
        reuseExistingServer: true,
        timeout: 180_000,
        env: {
          THRONEERA_ALLOW_MOCK_CHECKOUT: "true",
          THRONEERA_LOCAL_STORE_PATH: ".throneera/e2e-store.json",
          META_PIXEL_ID: "test_pixel",
        },
      };

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  workers: 1,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  webServer,
  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
