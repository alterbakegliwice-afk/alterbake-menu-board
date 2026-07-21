#!/usr/bin/env node
// Validates the customer-facing pages' structure and accessibility
// using html-validate: index.html (kiosk), gazetka.html (newsletter),
// zaproszenia.html (staff panel).

import { HtmlValidate } from "html-validate";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = resolve(__dirname, "../.htmlvalidate.json");
const FILES = ["index.html", "gazetka.html", "zaproszenia.html"];

const config = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
const validator = new HtmlValidate(config);

let errors = 0;

for (const file of FILES) {
  console.log(`\n=== ${file} structure & accessibility ===\n`);
  const html = readFileSync(resolve(__dirname, "..", file), "utf8");
  const result = await validator.validateString(html);
  if (result.valid) {
    console.log("  OK    No HTML validation errors.");
    continue;
  }
  for (const msg of result.results.flatMap(r => r.messages)) {
    const severity = msg.severity === 2 ? "FAIL" : "WARN";
    console.error(`  ${severity}  line ${msg.line}: [${msg.ruleId}] ${msg.message}`);
  }
  errors += result.results.flatMap(r => r.messages).filter(m => m.severity === 2).length;
}

console.log(`\n${errors === 0 ? "All pages valid." : `${errors} error(s) found.`}\n`);
process.exit(errors > 0 ? 1 : 0);
