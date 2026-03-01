import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "../src/locales");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));

const enKeys =
  ',"occupationStepTitle":"What\'s your occupation?","occupationStepDesc":"Select a category, then your job. Canadian workplace focus.","selectCategory":"Select category","selectJob":"Select your job"';

let added = 0;
for (const file of files) {
  const p = path.join(dir, file);
  let s = fs.readFileSync(p, "utf8");
  if (s.includes("occupationStepTitle")) continue;
  const re = /"maybeLater":"[^"]*"}\s*,\s*"landingChoices"/;
  const match = s.match(re);
  if (match) {
    s = s.replace(re, match[0].replace('},"landingChoices"', enKeys + '},"landingChoices"'));
    fs.writeFileSync(p, s);
    added++;
    console.log("Added to", file);
  }
}
console.log("Total added:", added);
