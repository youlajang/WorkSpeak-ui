/**
 * Creates missing locale JSON files by copying en.json.
 * Run: node scripts/copy-locales.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const localesDir = join(__dirname, "..", "src", "locales");
const enPath = join(localesDir, "en.json");

const LOCALE_CODES = [
  "ar", "hi", "ru", "it", "vi", "th", "id", "nl", "pl", "tr", "ms", "sv", "uk",
  "he", "bn", "fa", "ta", "te", "mr", "ur", "fil", "ro", "hu", "cs", "el", "da",
  "fi", "no", "sk", "bg", "hr", "sr", "ca", "af", "sw", "am", "km", "my", "ne",
  "si", "pa", "gu", "kn", "ml", "or", "as", "lo", "mk", "sl", "et", "lv", "lt",
  "sq", "hy", "ka", "az", "uz", "kk", "ky", "tg", "mn", "bo", "tl",
];

const en = readFileSync(enPath, "utf8");
let created = 0;
for (const code of LOCALE_CODES) {
  const outPath = join(localesDir, `${code}.json`);
  if (!existsSync(outPath)) {
    writeFileSync(outPath, en, "utf8");
    created++;
    console.log("Created", code + ".json");
  }
}
console.log("Done. Created", created, "locale files.");
