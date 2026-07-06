import { defineConfig, devices } from "@playwright/test";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: "./tests",
  testMatch: ["**/*.visual.js", "**/*.e2e.js"],
  snapshotDir: "./tests/snapshots",
  updateSnapshots: "missing",
  use: {
    baseURL: `file://${resolve(__dirname, "alterbake-menu/index.html")}`,
    launchOptions: {
      executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
