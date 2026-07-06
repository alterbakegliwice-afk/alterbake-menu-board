#!/usr/bin/env node
// Validates products.json against the documented schema and business rules.

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PRODUCTS_PATH = resolve(__dirname, "../alterbake-menu/products.json");

const VALID_CATEGORIES = new Set(["polecane", "słodkie", "chleby", "na-wagę"]);
const VALID_TAGS = new Set([
  "Ciepłe", "Na słodko", "Do domu", "Dziś", "Limit", "Nowość", "Bestseller", "",
]);

let failures = 0;

function fail(msg) {
  console.error(`  FAIL  ${msg}`);
  failures++;
}

function pass(msg) {
  console.log(`  OK    ${msg}`);
}

function check(condition, passMsg, failMsg) {
  if (condition) pass(passMsg);
  else fail(failMsg);
}

// --- Load file ---

let raw;
try {
  raw = readFileSync(PRODUCTS_PATH, "utf8");
} catch (e) {
  console.error(`Cannot read ${PRODUCTS_PATH}: ${e.message}`);
  process.exit(1);
}

let data;
try {
  data = JSON.parse(raw);
} catch (e) {
  console.error(`Invalid JSON in products.json: ${e.message}`);
  process.exit(1);
}

console.log("\n=== products.json schema & business rules ===\n");

// --- Top-level structure ---

check(typeof data === "object" && !Array.isArray(data),
  "Root is an object",
  "Root must be an object, not an array");

check(Array.isArray(data.products),
  'Root has "products" array',
  'Root must have a "products" array');

if (!Array.isArray(data.products)) {
  console.error("\nCannot continue without products array.");
  process.exit(1);
}

check(data.products.length > 0,
  `products array has ${data.products.length} item(s)`,
  "products array is empty");

// --- Per-product rules ---

data.products.forEach((p, i) => {
  const label = `products[${i}] "${p.name ?? "(no name)"}"`;

  // Required string fields
  for (const field of ["name", "description", "category"]) {
    check(typeof p[field] === "string" && p[field].trim().length > 0,
      `${label}: "${field}" is a non-empty string`,
      `${label}: "${field}" must be a non-empty string (got ${JSON.stringify(p[field])})`);
  }

  // soldOut must be a boolean
  check(typeof p.soldOut === "boolean",
    `${label}: "soldOut" is a boolean`,
    `${label}: "soldOut" must be boolean (got ${JSON.stringify(p.soldOut)})`);

  // stockLevel must be one of the known values and agree with soldOut
  const VALID_LEVELS = ["dostępne", "ostatnie-sztuki", "wyprzedane"];
  check(VALID_LEVELS.includes(p.stockLevel),
    `${label}: stockLevel "${p.stockLevel}" is valid`,
    `${label}: unknown stockLevel "${p.stockLevel}" (expected one of: ${VALID_LEVELS.join(", ")})`);
  check((p.stockLevel === "wyprzedane") === (p.soldOut === true),
    `${label}: stockLevel agrees with soldOut`,
    `${label}: stockLevel "${p.stockLevel}" contradicts soldOut=${p.soldOut}`);

  // ostatnie-sztuki: still purchasable, must carry a badge and a price
  if (p.stockLevel === "ostatnie-sztuki") {
    check(typeof p.status === "string" && p.status.trim().length > 0,
      `${label}: low-stock product has a status badge`,
      `${label}: low-stock product must have a non-empty "status" (e.g. "OSTATNIE SZTUKI")`);
  }

  // dostępne: no badge
  if (p.stockLevel === "dostępne") {
    check(!p.status || p.status.trim() === "",
      `${label}: available product has empty status`,
      `${label}: available product must have an empty "status" (got "${p.status}")`);
  }

  // category must be one of the known values
  check(VALID_CATEGORIES.has(p.category),
    `${label}: category "${p.category}" is valid`,
    `${label}: unknown category "${p.category}" (expected one of: ${[...VALID_CATEGORIES].join(", ")})`);

  // tag must be one of the known values or empty
  check(VALID_TAGS.has(p.tag ?? ""),
    `${label}: tag "${p.tag}" is valid`,
    `${label}: unknown tag "${p.tag}" (expected one of: ${[...VALID_TAGS].join(", ")})`);

  // Business rule: sold-out products must have empty price/unit and a non-empty status
  if (p.soldOut === true) {
    check(!p.price || p.price.trim() === "",
      `${label}: sold-out product has empty price`,
      `${label}: sold-out product must not have a price (got "${p.price}")`);
    check(!p.unit || p.unit.trim() === "",
      `${label}: sold-out product has empty unit`,
      `${label}: sold-out product must not have a unit (got "${p.unit}")`);
    check(typeof p.status === "string" && p.status.trim().length > 0,
      `${label}: sold-out product has a non-empty status`,
      `${label}: sold-out product must have a non-empty "status" (e.g. "WYPRZEDANE")`);
  }

  // Business rule: available products must have a non-empty price and unit
  if (p.soldOut === false) {
    check(typeof p.price === "string" && p.price.trim().length > 0,
      `${label}: available product has a price`,
      `${label}: available product must have a non-empty "price" (got ${JSON.stringify(p.price)})`);
    check(typeof p.unit === "string" && p.unit.trim().length > 0,
      `${label}: available product has a unit`,
      `${label}: available product must have a non-empty "unit" (got ${JSON.stringify(p.unit)})`);
  }

  // Readability: name and description length (warn, not fail)
  if (typeof p.name === "string" && p.name.length > 30) {
    console.warn(`  WARN  ${label}: name is ${p.name.length} chars — may be hard to read from 1-2 m`);
  }
  if (typeof p.description === "string" && p.description.length > 60) {
    console.warn(`  WARN  ${label}: description is ${p.description.length} chars — consider shortening`);
  }
});

// --- Result ---

console.log(`\n${failures === 0
  ? `All checks passed (${data.products.length} products).`
  : `${failures} check(s) failed.`}\n`);

process.exit(failures > 0 ? 1 : 0);
