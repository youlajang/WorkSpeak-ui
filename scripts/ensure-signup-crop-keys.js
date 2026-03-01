/**
 * Ensures every locale in signup-login-translations.json has signup.cropTitle and signup.cropHint.
 * Run: node scripts/ensure-signup-login-crop-keys.js
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const p = path.join(__dirname, "signup-login-translations.json");
const data = JSON.parse(fs.readFileSync(p, "utf8"));
const enSignup = data.en?.signup || {};
const needCrop = enSignup.cropTitle && enSignup.cropHint;
if (!needCrop) {
  console.error("en.signup must have cropTitle and cropHint");
  process.exit(1);
}
let fixed = 0;
for (const code of Object.keys(data)) {
  if (!data[code].signup) continue;
  if (!data[code].signup.cropTitle) {
    data[code].signup.cropTitle = enSignup.cropTitle;
    data[code].signup.cropHint = enSignup.cropHint;
    fixed++;
  }
}
fs.writeFileSync(p, JSON.stringify(data, null, 2));
console.log("Added cropTitle/cropHint to", fixed, "locales");
