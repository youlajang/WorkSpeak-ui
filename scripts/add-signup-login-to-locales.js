import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, "../src/locales");
const enPath = path.join(localesDir, "en.json");

const en = JSON.parse(fs.readFileSync(enPath, "utf8"));
const loginBlock = en.login;
const signupBlock = en.signup;

if (!loginBlock || !signupBlock) {
  console.error("en.json must have login and signup");
  process.exit(1);
}

const files = fs.readdirSync(localesDir).filter((f) => f.endsWith(".json"));
let added = 0;
for (const file of files) {
  if (file === "en.json") continue;
  const p = path.join(localesDir, file);
  const raw = fs.readFileSync(p, "utf8");
  let obj;
  try {
    obj = JSON.parse(raw);
  } catch (e) {
    console.error("Skip (invalid JSON):", file);
    continue;
  }
  let changed = false;
  if (!obj.login || typeof obj.login !== "object") {
    obj.login = { ...loginBlock };
    changed = true;
  }
  if (!obj.signup || typeof obj.signup !== "object") {
    obj.signup = { ...signupBlock };
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(p, JSON.stringify(obj, null, 2));
    added++;
    console.log("Added login/signup to", file);
  }
}
console.log("Total files updated:", added);
