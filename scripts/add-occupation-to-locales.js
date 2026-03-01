import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, "../src/locales");

const OCCUPATION_EN = {
  management: "Management",
  manager_sales: "Sales manager",
  manager_marketing: "Marketing manager",
  manager_hr: "HR manager",
  manager_retail: "Retail manager",
  manager_restaurant: "Restaurant manager",
  manager_general: "General manager",
  business_finance: "Business & Finance",
  accountant: "Accountant",
  financial_advisor: "Financial advisor",
  office_admin: "Office administrator",
  receptionist: "Receptionist",
  bookkeeper: "Bookkeeper",
  payroll_clerk: "Payroll clerk",
  bank_teller: "Bank teller",
  tech_sciences: "IT & Sciences",
  software_dev: "Software developer",
  data_analyst: "Data analyst",
  web_dev: "Web developer",
  it_support: "IT support specialist",
  engineer: "Engineer",
  scientist: "Scientist / researcher",
  health: "Health",
  nurse: "Nurse",
  doctor: "Doctor / physician",
  pharmacist: "Pharmacist",
  dental_assistant: "Dental assistant",
  medical_lab: "Medical lab technician",
  caregiver: "Caregiver / PSW",
  physiotherapist: "Physiotherapist",
  education_social: "Education & Social Services",
  teacher: "Teacher / instructor",
  early_childhood: "Early childhood educator",
  social_worker: "Social worker",
  lawyer: "Lawyer / paralegal",
  counsellor: "Counsellor",
  arts_recreation: "Arts, Culture & Recreation",
  chef: "Chef / cook",
  baker: "Baker",
  designer: "Designer (graphic, UX)",
  photographer: "Photographer / videographer",
  fitness: "Fitness instructor",
  sales_service: "Sales & Service",
  retail_sales: "Retail sales associate",
  customer_service: "Customer service rep",
  cashier: "Cashier",
  barista: "Barista / server",
  barber_hair: "Barber / hairstylist",
  driver_delivery: "Delivery driver",
  trades_transport: "Trades & Transport",
  electrician: "Electrician",
  plumber: "Plumber",
  carpenter: "Carpenter",
  mechanic: "Mechanic / auto technician",
  truck_driver: "Truck driver",
  welder: "Welder",
  natural_agriculture: "Natural Resources & Agriculture",
  farmer: "Farmer / farm worker",
  mining: "Mining / oil & gas",
  forestry: "Forestry worker",
  manufacturing: "Manufacturing & Utilities",
  factory_worker: "Factory worker",
  assembler: "Assembler",
  machine_operator: "Machine operator",
};

const files = fs.readdirSync(localesDir).filter((f) => f.endsWith(".json"));
let added = 0;
for (const file of files) {
  const p = path.join(localesDir, file);
  const raw = fs.readFileSync(p, "utf8");
  if (raw.includes('"occupation"') && raw.includes("management")) continue;
  let obj;
  try {
    obj = JSON.parse(raw);
  } catch (e) {
    console.error("Skip (invalid JSON):", file);
    continue;
  }
  if (obj.occupation && typeof obj.occupation === "object") continue;
  obj.occupation = OCCUPATION_EN;
  const out = JSON.stringify(obj, null, 2);
  fs.writeFileSync(p, out);
  added++;
  console.log("Added occupation to", file);
}
console.log("Total added:", added);
