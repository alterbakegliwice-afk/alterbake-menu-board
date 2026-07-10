import { test, expect } from "@playwright/test";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX = `file://${resolve(__dirname, "../index.html")}`;

// Item helper: the SŁODKIE column's "Cynamonka" (available, no highlight).
const ITEM = '.menu-item:has(h3:text-is("Cynamonka"))';

async function enterEditMode(page) {
  const logo = page.locator("h1");
  for (let i = 0; i < 5; i++) await logo.click({ delay: 20 });
  await expect(page.locator(".pin-overlay")).toBeVisible();
  for (const digit of ["1", "2", "3", "4"]) {
    await page.locator(".pin-pad button", { hasText: digit }).click();
  }
  await expect(page.locator(".edit-banner")).toBeVisible();
}

test("edit mode is hidden by default and opens after 5 logo taps + PIN", async ({ page }) => {
  await page.goto(INDEX);
  await expect(page.locator(".edit-banner")).toBeHidden();
  await expect(page.locator(".pin-overlay")).toBeHidden();
  await enterEditMode(page);
  await page.locator(".edit-banner .btn-exit").click();
  await expect(page.locator(".edit-banner")).toBeHidden();
});

test("PIN locks after 5 wrong attempts and unlocks after a minute", async ({ page }) => {
  await page.clock.install();
  await page.goto(INDEX);
  for (let i = 0; i < 5; i++) await page.locator("h1").click({ delay: 20 });
  await expect(page.locator(".pin-overlay")).toBeVisible();

  // 5 blednych prob -> blokada.
  for (let attempt = 0; attempt < 5; attempt++) {
    for (let i = 0; i < 4; i++) await page.locator(".pin-pad button", { hasText: "9" }).click();
  }
  await expect(page.locator(".pin-title")).toHaveText("Za dużo prób – poczekaj minutę");

  // Poprawny PIN w trakcie blokady nie dziala.
  for (const digit of ["1", "2", "3", "4"]) {
    await page.locator(".pin-pad button", { hasText: digit }).click();
  }
  await expect(page.locator(".edit-banner")).toBeHidden();

  // Po minucie blokada mija (klawiatura zdazyla sie auto-zamknac po 30 s
  // bezczynnosci, wiec otwieramy ja ponownie).
  await page.clock.fastForward(61_000);
  await expect(page.locator(".pin-overlay")).toBeHidden();
  for (let i = 0; i < 5; i++) await page.locator("h1").click({ delay: 20 });
  for (const digit of ["1", "2", "3", "4"]) {
    await page.locator(".pin-pad button", { hasText: digit }).click();
  }
  await expect(page.locator(".edit-banner")).toBeVisible();
});

test("kiosk running overnight reloads itself after midnight", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-07-07T23:59:30") });
  await page.goto(INDEX);
  await page.evaluate(() => { window.__beforeMidnight = true; });

  // 2 minuty pozniej jest juz po polnocy - interwal (60 s) wykrywa zmiane
  // daty i przeladowuje strone, wiec marker znika.
  try {
    await page.clock.fastForward(2 * 60 * 1000);
  } catch (e) { /* nawigacja w trakcie fastForward jest oczekiwana */ }
  await page.waitForFunction(() => window.__beforeMidnight === undefined);
});

test("wrong PIN does not open edit mode", async ({ page }) => {
  await page.goto(INDEX);
  for (let i = 0; i < 5; i++) await page.locator("h1").click({ delay: 20 });
  await expect(page.locator(".pin-overlay")).toBeVisible();
  for (let i = 0; i < 4; i++) await page.locator(".pin-pad button", { hasText: "9" }).click();
  await expect(page.locator(".pin-title")).toHaveText("Błędny PIN");
  await expect(page.locator(".edit-banner")).toBeHidden();
  await page.locator(".pin-cancel").click();
  await expect(page.locator(".pin-overlay")).toBeHidden();
  // Stukanie w produkty poza trybem edycji nic nie zmienia.
  await page.locator(ITEM).first().click();
  await expect(page.locator(ITEM).first().locator(".status-badge")).toHaveCount(0);
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
      items: { "Cynamonka": "wyprzedane" },
    }));
  });
  await page.reload();
  await expect(page.locator(ITEM).first().locator(".status-badge")).toHaveCount(0);
});

test("morning sold-out item (no price in HTML) is not toggleable", async ({ page }) => {
  await page.goto(INDEX);
  await enterEditMode(page);
  const gryczany = page.locator('.menu-item:has(h3:has-text("gryczanej"))').first();
  await gryczany.click();
  await expect(gryczany.locator(".status-badge")).toHaveText("W CZWARTEK");
});

test("long-press toggles the gold highlight and survives reload", async ({ page }) => {
  await page.goto(INDEX);
  await enterEditMode(page);
  const item = page.locator(ITEM).first();
  await expect(item).not.toHaveClass(/highlight/);

  // Przytrzymanie (mousedown -> 600 ms -> mouseup) przelacza wyroznienie...
  await item.click({ delay: 600 });
  await expect(item).toHaveClass(/highlight/);
  // ...i NIE zmienia statusu (klik po przytrzymaniu jest ignorowany).
  await expect(item.locator(".status-badge")).toHaveCount(0);

  await page.reload();
  await expect(page.locator(ITEM).first()).toHaveClass(/highlight/);

  // Przytrzymanie raz jeszcze wylacza wyroznienie.
  await enterEditMode(page);
  await page.locator(ITEM).first().click({ delay: 600 });
  await expect(page.locator(ITEM).first()).not.toHaveClass(/highlight/);
});

test("tapping the feature panel cycles the bake of the day and back", async ({ page }) => {
  await page.goto(INDEX);
  await enterEditMode(page);
  const feature = page.locator(".feature");
  const originalTitle = await feature.locator("h2").textContent();

  // Pierwsze stukniecie: pierwszy dostepny produkt z kolumn.
  await feature.click();
  await expect(feature.locator("h2")).toHaveText("Jagodzianka");
  await expect(feature.locator(".feature-price strong")).toHaveText("19 zł");

  // Wybor przezywa odswiezenie strony.
  await page.reload();
  await expect(page.locator(".feature h2")).toHaveText("Jagodzianka");

  // Cykl przez wszystkie dostepne produkty wraca do oryginalu.
  await enterEditMode(page);
  const eligible = await page.locator(".menu-item:not(.sold-out) .item-price strong").count();
  for (let i = 0; i < eligible; i++) await page.locator(".feature").click();
  await expect(page.locator(".feature h2")).toHaveText(originalTitle);
});

test("marking the featured product sold out restores the original feature", async ({ page }) => {
  await page.goto(INDEX);
  await enterEditMode(page);
  const feature = page.locator(".feature");
  const originalTitle = await feature.locator("h2").textContent();

  await feature.click(); // wypiek dnia -> "Jagodzianka"
  const jagodzianka = page.locator('.menu-item:has(h3:text-is("Jagodzianka"))').first();
  await jagodzianka.click(); // -> OSTATNIE SZTUKI
  await jagodzianka.click(); // -> WYPRZEDANE
  await expect(feature.locator("h2")).toHaveText(originalTitle);
});

test("evening mode swaps the masthead message and survives reload", async ({ page }) => {
  await page.goto(INDEX);
  await expect(page.locator(".today strong")).toHaveText("świeże od 8:00");
  await enterEditMode(page);

  await page.locator(".edit-banner .btn-evening").click();
  await expect(page.locator(".today strong")).toHaveText("ostatnie wypieki");
  await expect(page.locator(".edit-banner .btn-evening")).toHaveText("Dzień");

  await page.reload();
  await expect(page.locator(".today strong")).toHaveText("ostatnie wypieki");

  // Powrot do trybu dziennego.
  await enterEditMode(page);
  await page.locator(".edit-banner .btn-evening").click();
  await expect(page.locator(".today strong")).toHaveText("świeże od 8:00");
});
