#!/usr/bin/env node
// Renders the HTML marketing templates in materials/ to ready-to-post PNG files.
// Usage: npm run materials  ->  writes materials/out/*.png

import { chromium } from "@playwright/test";
import { mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MATERIALS = resolve(__dirname, "../materials");
const OUT = resolve(MATERIALS, "out");

const TARGETS = [
  { file: "social-story.html", out: "social-story.png", width: 1080, height: 1920 },
  { file: "social-post.html", out: "social-post.png", width: 1080, height: 1080 },
  { file: "ulotka-a4.html", out: "ulotka-a4.png", width: 794, height: 1123 },
];

mkdirSync(OUT, { recursive: true });

const LOCAL_CHROMIUM = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch(
  existsSync(LOCAL_CHROMIUM) ? { executablePath: LOCAL_CHROMIUM } : {},
);

for (const t of TARGETS) {
  const page = await browser.newPage({ viewport: { width: t.width, height: t.height } });
  await page.goto(`file://${resolve(MATERIALS, t.file)}`);
  await page.waitForLoadState("load");
  await page.screenshot({ path: resolve(OUT, t.out), fullPage: t.file.startsWith("ulotka") });
  await page.close();
  console.log(`  OK    ${t.file} -> materials/out/${t.out}`);
}

await browser.close();
console.log("\nGotowe. Pliki PNG sa w materials/out/.");
