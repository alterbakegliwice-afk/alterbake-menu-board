import { test, expect } from "@playwright/test";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX = `file://${resolve(__dirname, "../index.html")}`;

const VIEWPORTS = [
  { name: "iPad landscape", width: 1024, height: 768 },
  { name: "iPad portrait", width: 768, height: 1024 },
  { name: "breakpoint 900px", width: 900, height: 768 },
  { name: "breakpoint 620px", width: 620, height: 900 },
  { name: "narrow mobile", width: 390, height: 844 },
];

for (const vp of VIEWPORTS) {
  test(`visual: ${vp.name} (${vp.width}×${vp.height})`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(INDEX);
    await page.waitForLoadState("load");

    // Disable CSS animations so screenshots are deterministic.
    await page.addStyleTag({
      content: "*, *::before, *::after { animation: none !important; transition: none !important; }",
    });

    await expect(page).toHaveScreenshot(`${vp.name.replace(/ /g, "-")}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });
}
