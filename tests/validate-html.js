#!/usr/bin/env node
// Validates index.html structure and accessibility rules using html-validate.

import { HtmlValidate } from "html-validate";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const HTML_PATH = resolve(__dirname, "../alterbake-menu/index.html");
const CONFIG_PATH = resolve(__dirname, "../.htmlvalidate.json");

const html = readFileSync(HTML_PATH, "utf8");
const config = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));

console.log("\n=== index.html structure & accessibility ===\n");

const validator = new HtmlValidate(config);
const result = await validator.validateString(html);

if (result.valid) {
  console.log("  OK    No HTML validation errors.\n");
  process.exit(0);
} else {
  for (const msg of result.results.flatMap(r => r.messages)) {
    const severity = msg.severity === 2 ? "FAIL" : "WARN";
    console.error(`  ${severity}  line ${msg.line}: [${msg.ruleId}] ${msg.message}`);
  }
  const errors = result.results.flatMap(r => r.messages).filter(m => m.severity === 2).length;
  console.error(`\n${errors} error(s) found.\n`);
  process.exit(1);
}
