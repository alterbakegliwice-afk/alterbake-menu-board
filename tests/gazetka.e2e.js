import { test, expect } from "@playwright/test";

// Gazetka i panel zaproszen czytaja products.json przez XHR, wiec testy
// chodza po http (webServer w playwright.config.js), nie po file://.
const BASE = "http://127.0.0.1:8123";

test("gazetka shows all groups with prices from products.json", async ({ page }) => {
  await page.goto(`${BASE}/gazetka.html`);
  await expect(page.locator(".group h3")).toHaveText(["SŁODKIE", "CHLEBY", "BUŁKI"]);
  await expect(page.locator("#hero-tab")).toHaveText("DZIŚ NA LADZIE");

  const jagodzianka = page.locator('.item:has(h4:has-text("Jagodzianka"))');
  await expect(jagodzianka.locator(".price strong")).toHaveText("19 zł");

  // Wyprzedany od rana gryczany: przekreslony, z plakietka, bez ceny.
  const gryczany = page.locator('.item:has(h4:has-text("gryczanej"))');
  await expect(gryczany).toHaveClass(/sold-out/);
  await expect(gryczany.locator(".badge")).toHaveText("W CZWARTEK");
  await expect(gryczany.locator(".price")).toHaveCount(0);
});

test("?grupa=slodkie promotes the invited group to the top", async ({ page }) => {
  await page.goto(`${BASE}/gazetka.html?grupa=slodkie`);
  await expect(page.locator("#hero-tab")).toHaveText("ZAPROSZENIE");
  await expect(page.locator("#hero-title")).toHaveText("Przyjdź na słodkie wypieki");
  const firstGroup = page.locator(".group").first();
  await expect(firstGroup).toHaveClass(/accent/);
  await expect(firstGroup.locator("h3")).toHaveText("SŁODKIE");
});

test("order CTA points to the Google order form", async ({ page }) => {
  await page.goto(`${BASE}/gazetka.html`);
  await expect(page.locator(".order")).toHaveAttribute("href", /docs\.google\.com\/forms/);
});

test("invite tap composes message with live prices and logs the tap", async ({ page }) => {
  await page.goto(`${BASE}/zaproszenia.html`);
  await page.evaluate(() => localStorage.removeItem("alterbake-zaproszenia-log"));
  await page.reload();
  await page.waitForLoadState("networkidle"); // products.json zaladowany

  await page.locator('.invite-btn[data-group="chleby"]').click();

  const message = page.locator("#message");
  await expect(message).toHaveValue(/Na ladzie: .*16 zł/);
  await expect(message).toHaveValue(/gazetka\.html\?grupa=chleby/);
  await expect(page.locator("#tg-link")).toHaveAttribute("href", /t\.me\/share\/url\?url=.*grupa%3Dchleby/);

  // Stukniecie trafilo do dziennika (dokladnie jedno, grupa "chleby").
  const log = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("alterbake-zaproszenia-log") || "[]"));
  expect(log).toHaveLength(1);
  expect(log[0].g).toBe("chleby");
  await expect(page.locator("#stats-table")).toContainText("C1");
});

test("composed message never claims fresh-out-of-oven in the evening", async ({ page }) => {
  // Zegar ustawiony na wieczor: hooki musza pochodzic z puli "koncowka".
  await page.clock.install({ time: new Date("2026-07-21T19:30:00") });
  await page.goto(`${BASE}/zaproszenia.html`);
  await page.waitForLoadState("networkidle");
  await page.locator('.invite-btn[data-group="slodkie"]').click();
  const text = await page.locator("#message").inputValue();
  expect(text).toMatch(/Końcówka|Ostatnie/);
  expect(text).not.toMatch(/właśnie wyjechała|pieczone dziś rano/);
});
