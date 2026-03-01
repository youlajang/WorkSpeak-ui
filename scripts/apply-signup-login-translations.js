/**
 * Applies login + signup translations from signup-login-translations.json
 * to each locale file. Run: node scripts/apply-signup-login-translations.js
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, "../src/locales");
const translationsPath = path.join(__dirname, "signup-login-translations.json");

let translations = {};
try {
  translations = JSON.parse(fs.readFileSync(translationsPath, "utf8"));
} catch (e) {
  console.error("Could not load signup-login-translations.json:", e.message);
  process.exit(1);
}

const files = fs.readdirSync(localesDir).filter((f) => f.endsWith(".json"));
let updated = 0;
for (const file of files) {
  const code = file.replace(".json", "");
  const block = translations[code];
  if (!block || !block.login || !block.signup) continue;
  const p = path.join(localesDir, file);
  let obj;
  try {
    obj = JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    console.error("Skip (invalid JSON):", file);
    continue;
  }
  obj.login = block.login;
  obj.signup = block.signup;
  fs.writeFileSync(p, JSON.stringify(obj, null, 2));
  updated++;
  console.log("Updated signup/login:", file);
}
console.log("Total updated:", updated);
