#!/usr/bin/env node
// Checks that every product in products.json is reflected in index.html.
// Catches the most common editing mistake: updating the JSON but forgetting the HTML.

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PRODUCTS_PATH = resolve(__dirname, "../alterbake-menu/products.json");
const HTML_PATH = resolve(__dirname, "../alterbake-menu/index.html");

let failures = 0;

function fail(msg) {
  console.error(`  FAIL  ${msg}`);
  failures++;
}

function pass(msg) {
  console.log(`  OK    ${msg}`);
}

// --- Load files ---

const html = readFileSync(HTML_PATH, "utf8");
const data = JSON.parse(readFileSync(PRODUCTS_PATH, "utf8"));

console.log("\n=== products.json ↔ index.html sync ===\n");

// Strip HTML tags for text search so we match content, not markup.
const htmlText = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

// --- Check each product ---

for (const p of data.products) {
  const label = `"${p.name}"`;

  // Every product name must appear somewhere in the HTML.
  const namePresent = html.includes(p.name);
  if (namePresent) pass(`${label}: name found in HTML`);
  else fail(`${label}: name NOT found in HTML — did you update index.html after editing products.json?`);

  // Available products: price must appear in the HTML.
  if (!p.soldOut && p.price) {
    const pricePresent = htmlText.includes(p.price);
    if (pricePresent) pass(`${label}: price "${p.price}" found in HTML`);
    else fail(`${label}: price "${p.price}" NOT found in HTML`);
  }

  // Any status badge (WYPRZEDANE, OSTATNIE SZTUKI, ...) must appear in the HTML.
  if (p.status) {
    const statusPresent = html.includes(p.status);
    if (statusPresent) pass(`${label}: status badge "${p.status}" found in HTML`);
    else fail(`${label}: status badge "${p.status}" NOT found in HTML`);
  }
}

// --- Check for stale HTML entries not in products.json ---
// We look for <h3> headings in menu-item sections that don't match any product name.

// Strip nested tags (e.g. <span class="status-badge">WYPRZEDANE</span>) before reading h3 text.
const menuItemH3s = [...html.matchAll(/<article class="menu-item[^"]*"[\s\S]*?<h3>([\s\S]*?)<\/h3>/g)]
  .map(m => m[1].replace(/<[^>]+>[\s\S]*?<\/[^>]+>/g, "").replace(/<[^>]+>/g, "").trim());

const productNames = new Set(data.products.map(p => p.name));

for (const heading of menuItemH3s) {
  if (productNames.has(heading)) {
    pass(`HTML <h3> "${heading}" exists in products.json`);
  } else {
    fail(`HTML <h3> "${heading}" has NO matching entry in products.json — stale content?`);
  }
}

// --- Result ---

console.log(`\n${failures === 0
  ? "All checks passed — JSON and HTML are in sync."
  : `${failures} check(s) failed.`}\n`);

process.exit(failures > 0 ? 1 : 0);
