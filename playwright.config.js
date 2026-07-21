import { defineConfig, devices } from "@playwright/test";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Lokalny kontener ma gotowe Chromium pod ta sciezka; na CI i innych
// maszynach Playwright uzywa przegladarki z `npx playwright install`.
const LOCAL_CHROMIUM = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const launchOptions = existsSync(LOCAL_CHROMIUM) ? { executablePath: LOCAL_CHROMIUM } : {};

export default defineConfig({
  testDir: "./tests",
  testMatch: ["**/*.visual.js", "**/*.e2e.js"],
  snapshotDir: "./tests/snapshots",
  updateSnapshots: "missing",
  use: {
    baseURL: `file://${resolve(__dirname, "index.html")}`,
    launchOptions,
  },
  // Gazetka i panel zaproszen czytaja products.json przez XHR - to wymaga
  // http, nie file://. Prosty serwer statyczny tylko na czas testow.
  webServer: {
    command: "python3 -m http.server 8123",
    url: "http://127.0.0.1:8123/index.html",
    reuseExistingServer: true,
    timeout: 15000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
