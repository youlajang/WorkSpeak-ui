/**
 * Canadian occupations by category (simplified NOC 2021)
 * Category → sub-occupations
 */
export type OccupationCategory = {
  id: string;
  labelEn: string;
  labelKey?: string;
  jobs: { id: string; labelEn: string; labelKey?: string }[];
};

export const CANADIAN_OCCUPATIONS: OccupationCategory[] = [
  {
    id: "management",
    labelEn: "Management",
    labelKey: "occupation.management",
    jobs: [
      { id: "manager_sales", labelEn: "Sales manager", labelKey: "occupation.manager_sales" },
      { id: "manager_marketing", labelEn: "Marketing manager", labelKey: "occupation.manager_marketing" },
      { id: "manager_hr", labelEn: "HR manager", labelKey: "occupation.manager_hr" },
      { id: "manager_retail", labelEn: "Retail manager", labelKey: "occupation.manager_retail" },
      { id: "manager_restaurant", labelEn: "Restaurant manager", labelKey: "occupation.manager_restaurant" },
      { id: "manager_general", labelEn: "General manager", labelKey: "occupation.manager_general" },
    ],
  },
  {
    id: "business_finance",
    labelEn: "Business & Finance",
    labelKey: "occupation.business_finance",
    jobs: [
      { id: "accountant", labelEn: "Accountant", labelKey: "occupation.accountant" },
      { id: "financial_advisor", labelEn: "Financial advisor", labelKey: "occupation.financial_advisor" },
      { id: "office_admin", labelEn: "Office administrator", labelKey: "occupation.office_admin" },
      { id: "receptionist", labelEn: "Receptionist", labelKey: "occupation.receptionist" },
      { id: "bookkeeper", labelEn: "Bookkeeper", labelKey: "occupation.bookkeeper" },
      { id: "payroll_clerk", labelEn: "Payroll clerk", labelKey: "occupation.payroll_clerk" },
      { id: "bank_teller", labelEn: "Bank teller", labelKey: "occupation.bank_teller" },
    ],
  },
  {
    id: "tech_sciences",
    labelEn: "IT & Sciences",
    labelKey: "occupation.tech_sciences",
    jobs: [
      { id: "software_dev", labelEn: "Software developer", labelKey: "occupation.software_dev" },
      { id: "data_analyst", labelEn: "Data analyst", labelKey: "occupation.data_analyst" },
      { id: "web_dev", labelEn: "Web developer", labelKey: "occupation.web_dev" },
      { id: "it_support", labelEn: "IT support specialist", labelKey: "occupation.it_support" },
      { id: "pm", labelEn: "Project manager (PM)", labelKey: "occupation.pm" },
      { id: "engineer", labelEn: "Engineer", labelKey: "occupation.engineer" },
      { id: "scientist", labelEn: "Scientist / researcher", labelKey: "occupation.scientist" },
    ],
  },
  {
    id: "health",
    labelEn: "Health",
    labelKey: "occupation.health",
    jobs: [
      { id: "nurse", labelEn: "Nurse", labelKey: "occupation.nurse" },
      { id: "doctor", labelEn: "Doctor / physician", labelKey: "occupation.doctor" },
      { id: "pharmacist", labelEn: "Pharmacist", labelKey: "occupation.pharmacist" },
      { id: "dental_assistant", labelEn: "Dental assistant", labelKey: "occupation.dental_assistant" },
      { id: "medical_lab", labelEn: "Medical lab technician", labelKey: "occupation.medical_lab" },
      { id: "caregiver", labelEn: "Caregiver / PSW", labelKey: "occupation.caregiver" },
      { id: "physiotherapist", labelEn: "Physiotherapist", labelKey: "occupation.physiotherapist" },
    ],
  },
  {
    id: "education_social",
    labelEn: "Education & Social Services",
    labelKey: "occupation.education_social",
    jobs: [
      { id: "teacher", labelEn: "Teacher / instructor", labelKey: "occupation.teacher" },
      { id: "early_childhood", labelEn: "Early childhood educator", labelKey: "occupation.early_childhood" },
      { id: "social_worker", labelEn: "Social worker", labelKey: "occupation.social_worker" },
      { id: "lawyer", labelEn: "Lawyer / paralegal", labelKey: "occupation.lawyer" },
      { id: "counsellor", labelEn: "Counsellor", labelKey: "occupation.counsellor" },
    ],
  },
  {
    id: "arts_recreation",
    labelEn: "Arts, Culture & Recreation",
    labelKey: "occupation.arts_recreation",
    jobs: [
      { id: "chef", labelEn: "Chef / cook", labelKey: "occupation.chef" },
      { id: "baker", labelEn: "Baker", labelKey: "occupation.baker" },
      { id: "designer", labelEn: "Designer (graphic, UX)", labelKey: "occupation.designer" },
      { id: "photographer", labelEn: "Photographer / videographer", labelKey: "occupation.photographer" },
      { id: "fitness", labelEn: "Fitness instructor", labelKey: "occupation.fitness" },
    ],
  },
  {
    id: "sales_service",
    labelEn: "Sales & Service",
    labelKey: "occupation.sales_service",
    jobs: [
      { id: "retail_sales", labelEn: "Retail sales associate", labelKey: "occupation.retail_sales" },
      { id: "customer_service", labelEn: "Customer service rep", labelKey: "occupation.customer_service" },
      { id: "cashier", labelEn: "Cashier", labelKey: "occupation.cashier" },
      { id: "barista", labelEn: "Barista / server", labelKey: "occupation.barista" },
      { id: "barber_hair", labelEn: "Barber / hairstylist", labelKey: "occupation.barber_hair" },
      { id: "driver_delivery", labelEn: "Delivery driver", labelKey: "occupation.driver_delivery" },
    ],
  },
  {
    id: "trades_transport",
    labelEn: "Trades & Transport",
    labelKey: "occupation.trades_transport",
    jobs: [
      { id: "electrician", labelEn: "Electrician", labelKey: "occupation.electrician" },
      { id: "plumber", labelEn: "Plumber", labelKey: "occupation.plumber" },
      { id: "carpenter", labelEn: "Carpenter", labelKey: "occupation.carpenter" },
      { id: "mechanic", labelEn: "Mechanic / auto technician", labelKey: "occupation.mechanic" },
      { id: "truck_driver", labelEn: "Truck driver", labelKey: "occupation.truck_driver" },
      { id: "welder", labelEn: "Welder", labelKey: "occupation.welder" },
    ],
  },
  {
    id: "natural_agriculture",
    labelEn: "Natural Resources & Agriculture",
    labelKey: "occupation.natural_agriculture",
    jobs: [
      { id: "farmer", labelEn: "Farmer / farm worker", labelKey: "occupation.farmer" },
      { id: "mining", labelEn: "Mining / oil & gas", labelKey: "occupation.mining" },
      { id: "forestry", labelEn: "Forestry worker", labelKey: "occupation.forestry" },
    ],
  },
  {
    id: "manufacturing",
    labelEn: "Manufacturing & Utilities",
    labelKey: "occupation.manufacturing",
    jobs: [
      { id: "factory_worker", labelEn: "Factory worker", labelKey: "occupation.factory_worker" },
      { id: "assembler", labelEn: "Assembler", labelKey: "occupation.assembler" },
      { id: "machine_operator", labelEn: "Machine operator", labelKey: "occupation.machine_operator" },
    ],
  },
];
