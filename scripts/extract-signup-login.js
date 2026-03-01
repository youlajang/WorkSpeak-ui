/**
 * Extracts login + signup from each locale file into signup-login-translations.json.
 * Run: node scripts/extract-signup-login.js
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, "../src/locales");
const outPath = path.join(__dirname, "signup-login-translations.json");

const files = fs.readdirSync(localesDir).filter((f) => f.endsWith(".json"));
const result = {};
for (const file of files) {
  const code = file.replace(".json", "");
  try {
    const obj = JSON.parse(fs.readFileSync(path.join(localesDir, file), "utf8"));
    if (obj.login && obj.signup) result[code] = { login: obj.login, signup: obj.signup };
  } catch (e) {
    console.error("Skip:", file, e.message);
  }
}
fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
console.log("Wrote", outPath, "with", Object.keys(result).length, "locales");
