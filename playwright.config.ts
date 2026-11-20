import { defineConfig } from "@playwright/test";
import { testEnvironment } from "./e2e/test-environment";

export default defineConfig({
  globalSetup: "./e2e/global-setup.ts",
  testDir: "./e2e",
  use: {
    baseURL: "http://127.0.0.1:3100",
    browserName: "chromium",
    headless: true,
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100/login",
    env: { ...process.env, ...testEnvironment },
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
