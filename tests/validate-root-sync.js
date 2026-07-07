#!/usr/bin/env node
// Checks that the root-level copies of index.html, styles.css and products.json
// are byte-for-byte identical to the canonical files inside alterbake-menu/.

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const MENU = resolve(ROOT, "alterbake-menu");

const FILES = [
  "index.html",
  "styles.css",
  "products.json",
  "products.sample.json",
  "board.js",
  "fonts/fraunces-latin-400-normal.woff2",
  "fonts/fraunces-latin-ext-400-normal.woff2",
  "fonts/fraunces-latin-600-normal.woff2",
  "fonts/fraunces-latin-ext-600-normal.woff2",
];

let failures = 0;

function fail(msg) {
  console.error(`  FAIL  ${msg}`);
  failures++;
}

function pass(msg) {
  console.log(`  OK    ${msg}`);
}

console.log("\n=== root/ ↔ alterbake-menu/ file sync ===\n");

for (const file of FILES) {
  const rootPath = resolve(ROOT, file);
  const menuPath = resolve(MENU, file);

  let rootContent, menuContent;

  try {
    rootContent = readFileSync(rootPath);
  } catch (e) {
    fail(`${file}: cannot read root copy (${e.message})`);
    continue;
  }

  try {
    menuContent = readFileSync(menuPath);
  } catch (e) {
    fail(`${file}: cannot read alterbake-menu copy (${e.message})`);
    continue;
  }

  if (rootContent.equals(menuContent)) {
    pass(`${file}: root and alterbake-menu copies are identical`);
  } else {
    fail(`${file}: root copy differs from alterbake-menu/${file} — remember to keep them in sync`);

    // Give a hint about where they diverge.
    const rootLines = rootContent.toString("utf8").split("\n");
    const menuLines = menuContent.toString("utf8").split("\n");
    for (let i = 0; i < Math.max(rootLines.length, menuLines.length); i++) {
      if (rootLines[i] !== menuLines[i]) {
        console.error(`         First difference at line ${i + 1}:`);
        console.error(`         root:          ${JSON.stringify(rootLines[i] ?? "(missing)")}`);
        console.error(`         alterbake-menu: ${JSON.stringify(menuLines[i] ?? "(missing)")}`);
        break;
      }
    }
  }
}

console.log(`\n${failures === 0
  ? "All copies are in sync."
  : `${failures} file(s) out of sync.`}\n`);

process.exit(failures > 0 ? 1 : 0);
