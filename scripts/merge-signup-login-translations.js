/**
 * Merges full translations from signup-login-translations-full.json into signup-login-translations.json.
 * Only keys present in -full are overwritten; others keep current (e.g. en, ko, ja).
 * Run: node scripts/merge-signup-login-translations.js
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const basePath = path.join(__dirname, "signup-login-translations.json");
const fullPath = path.join(__dirname, "signup-login-translations-full.json");

if (!fs.existsSync(fullPath)) {
  console.log("No signup-login-translations-full.json found. Create it with locale blocks to merge.");
  process.exit(0);
}

const base = JSON.parse(fs.readFileSync(basePath, "utf8"));
const full = JSON.parse(fs.readFileSync(fullPath, "utf8"));
let merged = 0;
for (const code of Object.keys(full)) {
  if (full[code].login && full[code].signup) {
    base[code] = { login: full[code].login, signup: full[code].signup };
    merged++;
  }
}
fs.writeFileSync(basePath, JSON.stringify(base, null, 2));
console.log("Merged", merged, "locales from -full into signup-login-translations.json");
