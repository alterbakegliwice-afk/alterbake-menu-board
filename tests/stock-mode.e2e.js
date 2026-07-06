import { test, expect } from "@playwright/test";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX = `file://${resolve(__dirname, "../alterbake-menu/index.html")}`;

// Item helper: the SŁODKIE column's "Chałka maślana" (available, has a price).
const ITEM = '.menu-item:has(h3:text-is("Chałka maślana"))';

async function enterEditMode(page) {
  const logo = page.locator("h1");
  for (let i = 0; i < 5; i++) await logo.click({ delay: 20 });
  await expect(page.locator(".edit-banner")).toBeVisible();
}

test("edit mode is hidden by default and opens after 5 logo taps", async ({ page }) => {
  await page.goto(INDEX);
  await expect(page.locator(".edit-banner")).toBeHidden();
  await enterEditMode(page);
  await page.locator(".edit-banner button").click();
  await expect(page.locator(".edit-banner")).toBeHidden();
});

test("tapping an item cycles available -> low -> sold out -> available", async ({ page }) => {
  await page.goto(INDEX);
  await enterEditMode(page);
  const item = page.locator(ITEM).first();

  await item.click();
  await expect(item.locator(".status-badge")).toHaveText("OSTATNIE SZTUKI");
  await expect(item.locator(".item-price")).toBeVisible();

  await item.click();
  await expect(item.locator(".status-badge")).toHaveText("WYPRZEDANE");
  await expect(item.locator(".item-price")).toBeHidden();

  await item.click();
  await expect(item.locator(".status-badge")).toHaveCount(0);
  await expect(item.locator(".item-price")).toBeVisible();
});

test("status survives a page reload on the same day", async ({ page }) => {
  await page.goto(INDEX);
  await enterEditMode(page);
  const item = page.locator(ITEM).first();
  await item.click(); // -> OSTATNIE SZTUKI
  await page.reload();
  await expect(page.locator(ITEM).first().locator(".status-badge")).toHaveText("OSTATNIE SZTUKI");
  // Tablica po odswiezeniu nie jest w trybie edycji.
  await expect(page.locator(".edit-banner")).toBeHidden();
});

test("saved statuses from a previous day are ignored (fresh bake)", async ({ page }) => {
  await page.goto(INDEX);
  await page.evaluate(() => {
    localStorage.setItem("alterbake-stock-v1", JSON.stringify({
      day: "2000-1-1",
      items: { "Chałka maślana": "wyprzedane" },
    }));
  });
  await page.reload();
  await expect(page.locator(ITEM).first().locator(".status-badge")).toHaveCount(0);
});

test("morning sold-out item (no price in HTML) is not toggleable", async ({ page }) => {
  await page.goto(INDEX);
  await enterEditMode(page);
  const orkiszowy = page.locator('.menu-item:has(h3:has-text("Orkiszowy"))').first();
  await orkiszowy.click();
  await expect(orkiszowy.locator(".status-badge")).toHaveText("WYPRZEDANE");
});
