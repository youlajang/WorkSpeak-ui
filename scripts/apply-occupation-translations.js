import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { OCCUPATION_TRANSLATIONS } from "./occupation-translations.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, "../src/locales");

const files = fs.readdirSync(localesDir).filter((f) => f.endsWith(".json"));
let updated = 0;
for (const file of files) {
  const localeCode = file.replace(".json", "");
  const trans = OCCUPATION_TRANSLATIONS[localeCode];
  if (!trans) continue;
  const p = path.join(localesDir, file);
  let obj;
  try {
    obj = JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    console.error("Skip (invalid JSON):", file);
    continue;
  }
  if (!obj.occupation || obj.occupation.management !== "Management") continue;
  obj.occupation = trans;
  fs.writeFileSync(p, JSON.stringify(obj, null, 2));
  updated++;
  console.log("Updated occupation:", file);
}
console.log("Total updated:", updated);
