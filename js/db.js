// Resilient storage layer with automatic in-memory fallback for restricted laptop browsers
const memStorage = new Map();
const safeStorage = {
  getItem(key) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = window.localStorage.getItem(key);
        if (val !== null && val !== undefined) return val;
      }
    } catch (e) {}
    return memStorage.get(key) || null;
  },
  setItem(key, val) {
    const str = String(val);
    memStorage.set(key, str);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, str);
      }
    } catch (e) {}
  },
  removeItem(key) {
    memStorage.delete(key);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {}
  },
  clear() {
    memStorage.clear();
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
    } catch (e) {}
  }
};
if (typeof window !== 'undefined') {
  window.safeStorage = safeStorage;
}
/**
 * Ron's Chicken Custom Payroll & Biometric Attendance System
 * Database & Persistence Layer (Offline IndexedDB & LocalStorage)
 */

const STORAGE_KEYS = {
  EMPLOYEES: 'rons_payroll_employees_v1',
  SHIFTS: 'rons_payroll_shifts_v1',
  CUTOFFS: 'rons_payroll_cutoffs_v1',
  ADVANCES: 'rons_payroll_advances_v1',
  DEDUCTIONS: 'rons_erp_deductions_v2', // Utang, CA, Shortages, Lacking Products, Others
  USERS: 'rons_erp_users_v2', // 3 Cashiers + Admin/Owner
  CURRENT_USER: 'rons_erp_current_user_v2', // Active session
  INVENTORY: 'rons_erp_inventory_v2', // Daily Lechon & Liempo Stock, batches, variance
  REMITTANCES: 'rons_erp_remittances_v2', // Cashier Shift Remittances & Sales
  AI_ADVISORY: 'rons_erp_ai_advisory_v2', // AI Financial Analyst State & Simulations
  AI_CHAT_HISTORY: 'rons_erp_ai_chat_history_v2', // Conversational message thread
  AI_MEMORY: 'rons_erp_ai_business_memory_v2', // Learned business facts & rules
  AI_CONFIG: 'rons_erp_ai_config_v2', // Optional Gemini API key & settings
  SETTINGS: 'rons_payroll_settings_v1',
  PAYROLL_HISTORY: 'rons_payroll_history_v1',
  DEVICE_CONFIG: 'rons_payroll_device_config_v1',
  LEAVES: 'rons_payroll_leaves_v1'
};

const DEFAULT_SETTINGS = {
  businessName: "Ron's Chicken (Lechon Manok & Liempo)",
  branchName: "Cugman Branch (Cagayan de Oro)",
  contactNumber: "0928 775 6605",
  address: "Sayre Hwy / National Hwy, Cugman, Cagayan de Oro City, Misamis Oriental",
  facebookUrl: "https://www.facebook.com/pages/Rons-Chicken/1808066046182615",
  regularDailyHours: 8,
  otMultiplier: 1.25,
  restDayMultiplier: 1.30,
  specialHolidayMultiplier: 1.30,
  regularHolidayMultiplier: 2.00,
  nightDiffRate: 0.10, // 10%
  nightDiffStart: "22:00",
  nightDiffEnd: "06:00",
  sssDeductionType: "semimonthly", // deducted every 2nd cutoff or split
  philHealthRate: 0.05, // 5% total (2.5% employee share)
  pagIbigDeduction: 100, // ₱100/cutoff (₱200/month)
  currencySymbol: "₱"
};

const DEFAULT_SHIFTS = [
  { id: "S1", name: "Early Morning Roasting", start: "04:00", end: "13:00", gracePeriodMinutes: 15, color: "#f59e0b" },
  { id: "S2", name: "Morning Service & Kitchen", start: "08:00", end: "17:00", gracePeriodMinutes: 15, color: "#10b981" },
  { id: "S3", name: "Mid-Day / Evening Roasting", start: "14:00", end: "23:00", gracePeriodMinutes: 15, color: "#ef4444" },
  { id: "S4", name: "Night Shift Operations", start: "22:00", end: "07:00", gracePeriodMinutes: 15, color: "#8b5cf6" },
  { id: "S5", name: "Flexible Split Shift", start: "00:00", end: "23:59", gracePeriodMinutes: 15, color: "#3b82f6" }
];

const DEFAULT_USERS = [
  {
    id: "usr_admin",
    name: "Sir Irl (Owner & Management)",
    role: "admin",
    pin: "8888",
    avatar: "👑",
    title: "General Manager / Owner",
    cashierShift: "All Shifts / Executive Access",
    permissions: {
      all: true,
      canAccessPayroll: true,
      canViewStaffRates: true,
      canEditInventory: true,
      canVerifyRemittances: true,
      canManageDeductions: true,
      canAccessAiAdvisor: true,
      canManageUsers: true
    }
  },
  {
    id: "usr_cashier_1",
    name: "Chailene Dolido (Cashier 1)",
    role: "cashier",
    pin: "1111",
    avatar: "💳",
    employeeId: 13,
    title: "Morning Shift Cashier (06:00 - 14:00)",
    cashierShift: "Morning Shift (06:00 - 14:00)",
    permissions: {
      all: false,
      canAccessPayroll: false,
      canViewStaffRates: false,
      canEditInventory: true,
      canVerifyRemittances: true,
      canManageDeductions: false,
      canReportShortages: true,
      canReportLackingProducts: true,
      canAccessAiAdvisor: false,
      canManageUsers: false
    }
  },
  {
    id: "usr_cashier_2",
    name: "Pamela Galdo (Cashier 2)",
    role: "cashier",
    pin: "2222",
    avatar: "💳",
    employeeId: 30,
    title: "Evening Shift Cashier (14:00 - 22:00)",
    cashierShift: "Evening Shift (14:00 - 22:00)",
    permissions: {
      all: false,
      canAccessPayroll: false,
      canViewStaffRates: false,
      canEditInventory: true,
      canVerifyRemittances: true,
      canManageDeductions: false,
      canReportShortages: true,
      canReportLackingProducts: true,
      canAccessAiAdvisor: false,
      canManageUsers: false
    }
  },
  {
    id: "usr_cashier_3",
    name: "Relief Cashier (Cashier 3)",
    role: "cashier",
    pin: "3333",
    avatar: "💳",
    employeeId: 31,
    title: "Weekend & Relief Cashier",
    cashierShift: "Relief / Weekend Shift",
    permissions: {
      all: false,
      canAccessPayroll: false,
      canViewStaffRates: false,
      canEditInventory: true,
      canVerifyRemittances: true,
      canManageDeductions: false,
      canReportShortages: true,
      canReportLackingProducts: true,
      canAccessAiAdvisor: false,
      canManageUsers: false
    }
  }
];

const DEFAULT_DEDUCTIONS = [
  {
    id: "DED-101",
    employeeId: 19,
    employeeName: "Sherwin Cagas",
    category: "Utang",
    type: "Utang (Store Credit / Loan)",
    date: "2026-08-20",
    amount: 600,
    deductionPerCutoff: 300,
    deducted: 0,
    reason: "Store emergency credit / rice grocery loan",
    status: "Active",
    loggedBy: "Sir Irl (Owner)"
  },
  {
    id: "DED-102",
    employeeId: 12,
    employeeName: "Argie Daliva",
    category: "CA",
    type: "Cash Advance (Vale)",
    date: "2026-08-22",
    amount: 500,
    deductionPerCutoff: 500,
    deducted: 0,
    reason: "Family emergency allowance vale",
    status: "Active",
    loggedBy: "Sir Irl (Owner)"
  },
  {
    id: "DED-103",
    employeeId: 30,
    employeeName: "Pamela Galdo",
    category: "Shortage",
    type: "Shortages (Cashier Cash Shortage)",
    date: "2026-08-24",
    amount: 180,
    deductionPerCutoff: 180,
    deducted: 0,
    reason: "Evening shift register remittance shortage discrepancy",
    status: "Active",
    loggedBy: "Pamela Galdo (Cashier 2)"
  },
  {
    id: "DED-104",
    employeeId: 7,
    employeeName: "Gerald Ladasa",
    category: "Lacking",
    type: "Lacking Products (Burnt / Missing Chicken)",
    date: "2026-08-25",
    amount: 420,
    deductionPerCutoff: 210,
    deducted: 0,
    reason: "2 Overcooked whole chickens on spit 4 (accountability cost)",
    status: "Active",
    loggedBy: "Sir Irl (Owner)"
  },
  {
    id: "DED-105",
    employeeId: 31,
    employeeName: "Josh Abenir",
    category: "CA",
    type: "Cash Advance (Vale)",
    date: "2026-08-28",
    amount: 400,
    deductionPerCutoff: 400,
    deducted: 0,
    reason: "Motorcycle gas and maintenance vale",
    status: "Active",
    loggedBy: "Sir Irl (Owner)"
  }
];

const DEFAULT_INVENTORY = {
  products: [
    { id: "PROD-MANOK", name: "Whole Lechon Manok", category: "Chicken", sellingPrice: 360, rawCost: 210, unit: "heads" },
    { id: "PROD-HALF", name: "Half Lechon Manok", category: "Chicken", sellingPrice: 190, rawCost: 105, unit: "heads" },
    { id: "PROD-LIEMPO", name: "Roasted Pork Liempo", category: "Pork", sellingPrice: 420, rawCost: 250, unit: "slabs" },
    { id: "PROD-RICE", name: "Extra Steamed Rice", category: "Sides", sellingPrice: 20, rawCost: 7, unit: "servings" },
    { id: "PROD-SAUCE", name: "Special Spiced Gravy Bottle", category: "Sides", sellingPrice: 25, rawCost: 8, unit: "bottles" },
    { id: "PROD-DRINKS", name: "Soft Drinks / Beverages", category: "Drinks", sellingPrice: 25, rawCost: 14, unit: "bottles" }
  ],
  dailySheets: [
    {
      id: "INV-2026-08-20",
      date: "2026-08-20",
      cashierOnDuty: "Chailene Dolido (Cashier 1)",
      roasterOnDuty: "Argie Daliva (Senior Roaster)",
      beginningChicken: 6,
      receivedChicken: 85,
      roastedBatches: [
        { batchNo: 1, time: "05:30 AM", chickenCount: 25, liempoCount: 6, roaster: "Argie Daliva" },
        { batchNo: 2, time: "10:30 AM", chickenCount: 35, liempoCount: 10, roaster: "Gerald Ladasa" },
        { batchNo: 3, time: "04:30 PM", chickenCount: 25, liempoCount: 8, roaster: "Ronald Sedon" }
      ],
      totalRoastedChicken: 85,
      soldWholeChicken: 76,
      soldHalfChicken: 14,
      soldLiempoSlabs: 22,
      spoilageRejectChicken: 1,
      staffMealChicken: 1,
      expectedEndingChicken: 7,
      actualEndingChicken: 7,
      varianceChicken: 0,
      beginningLiempo: 2,
      receivedLiempo: 24,
      totalRoastedLiempo: 24,
      endingLiempo: 4,
      notes: "Steady lunchtime surge. Roasting spit 2 adjusted for evening batch."
    },
    {
      id: "INV-2026-08-21",
      date: "2026-08-21",
      cashierOnDuty: "Pamela Galdo (Cashier 2)",
      roasterOnDuty: "Gerald Lacasa (Roaster)",
      beginningChicken: 7,
      receivedChicken: 90,
      roastedBatches: [
        { batchNo: 1, time: "05:45 AM", chickenCount: 30, liempoCount: 8, roaster: "Gerald Lacasa" },
        { batchNo: 2, time: "11:00 AM", chickenCount: 35, liempoCount: 12, roaster: "Argie Daliva" },
        { batchNo: 3, time: "04:45 PM", chickenCount: 25, liempoCount: 6, roaster: "Sherwin Cagas" }
      ],
      totalRoastedChicken: 90,
      soldWholeChicken: 80,
      soldHalfChicken: 16,
      soldLiempoSlabs: 24,
      spoilageRejectChicken: 1,
      staffMealChicken: 1,
      expectedEndingChicken: 7,
      actualEndingChicken: 7,
      varianceChicken: 0,
      beginningLiempo: 4,
      receivedLiempo: 26,
      totalRoastedLiempo: 26,
      endingLiempo: 6,
      notes: "All 90 whole chickens accounted for at closing."
    }
  ]
};

const DEFAULT_REMITTANCES = [
  {
    id: "REM-101",
    date: "2026-08-20",
    shift: "Morning Shift (06:00 - 14:00)",
    cashierId: "usr_cashier_1",
    cashierName: "Chailene Dolido (Cashier 1)",
    wholeManokSold: 42,
    halfManokSold: 8,
    liempoSold: 12,
    sidesRevenue: 1250,
    grossSales: 21850,
    digitalGcash: 3450,
    cashSalesExpected: 18400,
    storePettyExpenses: 450,
    pettyExpenseDetails: "Ice for drinks and takeout wrapping paper",
    netCashExpected: 17950,
    actualCashCounted: 17950,
    shortageOverage: 0,
    status: "Verified & Deposited",
    verifiedBy: "Sir Irl (Owner)"
  },
  {
    id: "REM-102",
    date: "2026-08-20",
    shift: "Evening Shift (14:00 - 22:00)",
    cashierId: "usr_cashier_2",
    cashierName: "Pamela Galdo (Cashier 2)",
    wholeManokSold: 34,
    halfManokSold: 6,
    liempoSold: 10,
    sidesRevenue: 980,
    grossSales: 18560,
    digitalGcash: 2800,
    cashSalesExpected: 15760,
    storePettyExpenses: 600,
    pettyExpenseDetails: "1 Sack of Mangrove Roasting Charcoal",
    netCashExpected: 15160,
    actualCashCounted: 14980,
    shortageOverage: -180,
    status: "Shortage Logged to Deduction",
    verifiedBy: "Sir Irl (Owner)"
  }
];

const DEFAULT_AI_ADVISORY = {
  lastAnalyzed: new Date().toISOString(),
  healthScore: 92,
  benchmarks: {
    laborCostTargetPct: 22,
    foodCostTargetPct: 50,
    leakageMaxThresholdPct: 1.0
  },
  insights: [
    {
      id: "INS-01",
      category: "Roasting Timing & Waste Prevention",
      title: "Batch 3 (Evening Roasting) Schedule Optimization",
      impact: "+₱14,400 / month saved in spoilage",
      confidence: "High",
      summary: "Data indicates peak Cugman takeout traffic peaks at 5:15 PM - 6:45 PM. Moving Batch 3 roasting start from 5:00 PM to 4:15 PM eliminates customer wait queues and prevents rushed overcooking."
    },
    {
      id: "INS-02",
      category: "Product Mix & Margin Expansion",
      title: "Increase Liempo Roasting Spit Allocation (+15% Net Margin)",
      impact: "+₱18,900 / month net profit",
      confidence: "High",
      summary: "Roasted Liempo commands a 40.5% gross margin compared to 38.2% for Whole Chicken. Cugman branch sells out Liempo by 7:00 PM daily. Adding 5 more Liempo slabs per evening run captures unfulfilled dinner demand."
    },
    {
      id: "INS-03",
      category: "Shortage & Shrinkage Defense",
      title: "Cashier Remittance & Lacking Chicken Accountability",
      impact: "100% loss recovery via automated payroll deductions",
      confidence: "Very High",
      summary: "Shortages and damaged chicken across the active cutoff totaled ₱600 (<0.4% of branch gross sales). Auto-linking cashier shortage logs to payroll ensures zero company loss while training counter accuracy."
    },
    {
      id: "INS-04",
      category: "Side Item Upselling",
      title: "High-Margin Atchara & Secret Spiced Gravy Bundles",
      impact: "+₱21,600 / month pure gross profit",
      confidence: "High",
      summary: "Sauce and side items carry a 70%+ gross margin (₱25 retail vs ₱8 production cost). Training cashiers to suggest 'Add Special Gravy & Cold Drink' to 25% of Whole Chicken customers raises average order value by ₱45."
    }
  ]
};

const DEFAULT_AI_MEMORY = [
  {
    id: "mem_1",
    category: "Operations",
    title: "Cugman Highway Location & Peak Rush",
    fact: "Located along National Highway in Cugman, Cagayan de Oro. Peak customer takeout traffic occurs between 5:15 PM and 6:45 PM daily.",
    dateAdded: "2026-09-01",
    addedBy: "System Setup"
  },
  {
    id: "mem_2",
    category: "Cost & Margin",
    title: "Whole Chicken Cost & Pricing",
    fact: "Whole Lechon Manok sells for ₱360.00. Raw chicken supplier cost is ₱210.00, yielding ₱150.00 gross margin (41.6%).",
    dateAdded: "2026-09-01",
    addedBy: "System Setup"
  },
  {
    id: "mem_3",
    category: "Cost & Margin",
    title: "Roasted Pork Liempo Cost & Pricing",
    fact: "Roasted Pork Liempo sells for ₱420.00. Raw pork cost is ₱250.00, yielding ₱170.00 gross margin (40.5%).",
    dateAdded: "2026-09-01",
    addedBy: "System Setup"
  },
  {
    id: "mem_4",
    category: "Break-Even",
    title: "Daily Operating Break-Even Volume",
    fact: "Daily fixed overhead (staff wages + charcoal + utilities) is ~₱15,800/day. Daily break-even volume is 105 Whole Chickens, or 85 Chickens + 15 Liempo slabs.",
    dateAdded: "2026-09-01",
    addedBy: "System Setup"
  },
  {
    id: "mem_5",
    category: "Personnel",
    title: "Staff & Shift Structure",
    fact: "31 active employees with DOLE standard daily rates (₱438–₱480/day) plus ₱50 daily meal allowance. Overtime rate is 125%, Night diff is 10% (10 PM–6 AM).",
    dateAdded: "2026-09-01",
    addedBy: "System Setup"
  },
  {
    id: "mem_6",
    category: "Security",
    title: "Cashier Shift Handover & Shortage Rule",
    fact: "Cashier 1 (Chailene) does morning shift; Cashier 2 (Pamela) does evening shift. Handover is at 2:00 PM with mandatory drawer verification. Cash shortages are automatically charged to staff deductions.",
    dateAdded: "2026-09-01",
    addedBy: "System Setup"
  }
];

const DEFAULT_AI_CHAT_HISTORY = [
  {
    id: "msg_welcome",
    role: "assistant",
    timestamp: "Just now",
    date: "2026-10-21",
    text: "Mabuhay Sir Irl! Ako ang iyong **Autonomous CFO & Financial Advisor** para sa Ron's Chicken (Cugman Branch).\n\nKabisado ko ang real-time payroll ng ating 31 staff, lechon manok at liempo inventory, daily roasting batches, at cashier remittances. Maaari mo akong tanungin sa Taglish o English tungkol sa kita, break-even targets, food costs, o turuan ng mga bagong patakaran sa tindahan. Paano kita matutulungan ngayon?"
  }
];


const INITIAL_DATA = {
    "branch":  "Cugman Branch (Cagayan de Oro)",
    "cutoff":  "August 16, 2026 - September 05, 2026",
    "employees":  [
                      {
                          "id":  1,
                          "name":  "Christopher Mulato",
                          "department":  "COMPANY",
                          "position":  "Service \u0026 Operations Staff",
                          "dailyRate":  438,
                          "allowance":  50,
                          "sssNumber":  "34-10000001-1",
                          "philHealthNumber":  "12-200000001-3",
                          "pagIbigNumber":  "1210-30000001-4",
                          "tinNumber":  "400-500001-000",
                          "shiftStart":  "08:00",
                          "shiftEnd":  "17:00",
                          "attendanceLogs":  [

                                             ]
                      },
                      {
                          "id":  2,
                          "name":  "Ronald Sedon",
                          "department":  "COMPANY",
                          "position":  "Service \u0026 Operations Staff",
                          "dailyRate":  438,
                          "allowance":  50,
                          "sssNumber":  "34-10000002-1",
                          "philHealthNumber":  "12-200000002-3",
                          "pagIbigNumber":  "1210-30000002-4",
                          "tinNumber":  "400-500002-000",
                          "shiftStart":  "08:00",
                          "shiftEnd":  "17:00",
                          "attendanceLogs":  [

                                             ]
                      },
                      {
                          "id":  3,
                          "name":  "Vincent Arazo",
                          "department":  "COMPANY",
                          "position":  "Service \u0026 Operations Staff",
                          "dailyRate":  438,
                          "allowance":  50,
                          "sssNumber":  "34-10000003-1",
                          "philHealthNumber":  "12-200000003-3",
                          "pagIbigNumber":  "1210-30000003-4",
                          "tinNumber":  "400-500003-000",
                          "shiftStart":  "08:00",
                          "shiftEnd":  "17:00",
                          "attendanceLogs":  [

                                             ]
                      },
                      {
                          "id":  4,
                          "name":  "John Lasdose",
                          "department":  "COMPANY",
                          "position":  "Service \u0026 Operations Staff",
                          "dailyRate":  438,
                          "allowance":  50,
                          "sssNumber":  "34-10000004-1",
                          "philHealthNumber":  "12-200000004-3",
                          "pagIbigNumber":  "1210-30000004-4",
                          "tinNumber":  "400-500004-000",
                          "shiftStart":  "08:00",
                          "shiftEnd":  "17:00",
                          "attendanceLogs":  [

                                             ]
                      },
                      {
                          "id":  5,
                          "name":  "Ariel Emboltorio",
                          "department":  "OPERATION",
                          "position":  "Kitchen Prep Staff",
                          "dailyRate":  440,
                          "allowance":  50,
                          "sssNumber":  "34-10000005-1",
                          "philHealthNumber":  "12-200000005-3",
                          "pagIbigNumber":  "1210-30000005-4",
                          "tinNumber":  "400-500005-000",
                          "shiftStart":  "08:00",
                          "shiftEnd":  "17:00",
                          "attendanceLogs":  [
                                                 {
                                                     "date":  "2026-08-30",
                                                     "time":  "17:20",
                                                     "raw":  "17:20",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-31",
                                                     "time":  "00:40",
                                                     "raw":  "00:40",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-04",
                                                     "time":  "14:29",
                                                     "raw":  "14:29",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-05",
                                                     "time":  "00:49",
                                                     "raw":  "00:49",
                                                     "source":  "biometric_import"
                                                 }
                                             ]
                      },
                      {
                          "id":  6,
                          "name":  "Jasen Mata",
                          "department":  "COMPANY",
                          "position":  "Service \u0026 Operations Staff",
                          "dailyRate":  438,
                          "allowance":  50,
                          "sssNumber":  "34-10000006-1",
                          "philHealthNumber":  "12-200000006-3",
                          "pagIbigNumber":  "1210-30000006-4",
                          "tinNumber":  "400-500006-000",
                          "shiftStart":  "08:00",
                          "shiftEnd":  "17:00",
                          "attendanceLogs":  [

                                             ]
                      },
                      {
                          "id":  7,
                          "name":  "Gerald Ladasa",
                          "department":  "OPERATION",
                          "position":  "Roaster / Kitchen Staff",
                          "dailyRate":  438,
                          "allowance":  50,
                          "sssNumber":  "34-10000007-1",
                          "philHealthNumber":  "12-200000007-3",
                          "pagIbigNumber":  "1210-30000007-4",
                          "tinNumber":  "400-500007-000",
                          "shiftStart":  "08:00",
                          "shiftEnd":  "17:00",
                          "attendanceLogs":  [

                                             ]
                      },
                      {
                          "id":  8,
                          "name":  "Gerald Lacasa",
                          "department":  "OPERATION",
                          "position":  "Roaster / Kitchen Staff",
                          "dailyRate":  438,
                          "allowance":  50,
                          "sssNumber":  "34-10000008-1",
                          "philHealthNumber":  "12-200000008-3",
                          "pagIbigNumber":  "1210-30000008-4",
                          "tinNumber":  "400-500008-000",
                          "shiftStart":  "08:00",
                          "shiftEnd":  "17:00",
                          "attendanceLogs":  [

                                             ]
                      },
                      {
                          "id":  9,
                          "name":  "Gerald Lacasa",
                          "department":  "OPERATION",
                          "position":  "Roaster / Kitchen Staff",
                          "dailyRate":  438,
                          "allowance":  50,
                          "sssNumber":  "34-10000009-1",
                          "philHealthNumber":  "12-200000009-3",
                          "pagIbigNumber":  "1210-30000009-4",
                          "tinNumber":  "400-500009-000",
                          "shiftStart":  "08:00",
                          "shiftEnd":  "17:00",
                          "attendanceLogs":  [

                                             ]
                      },
                      {
                          "id":  10,
                          "name":  "Belen Nava",
                          "department":  "OPERATION",
                          "position":  "Roaster / Kitchen Staff",
                          "dailyRate":  438,
                          "allowance":  50,
                          "sssNumber":  "34-10000010-1",
                          "philHealthNumber":  "12-200000010-3",
                          "pagIbigNumber":  "1210-30000010-4",
                          "tinNumber":  "400-500010-000",
                          "shiftStart":  "08:00",
                          "shiftEnd":  "17:00",
                          "attendanceLogs":  [

                                             ]
                      },
                      {
                          "id":  11,
                          "name":  "Hiedy Rosales",
                          "department":  "OPERATION",
                          "position":  "Roaster / Kitchen Staff",
                          "dailyRate":  438,
                          "allowance":  50,
                          "sssNumber":  "34-10000011-1",
                          "philHealthNumber":  "12-200000011-3",
                          "pagIbigNumber":  "1210-30000011-4",
                          "tinNumber":  "400-500011-000",
                          "shiftStart":  "08:00",
                          "shiftEnd":  "17:00",
                          "attendanceLogs":  [

                                             ]
                      },
                      {
                          "id":  12,
                          "name":  "Argie Daliva",
                          "department":  "OPERATION",
                          "position":  "Senior Roaster / Grill Master",
                          "dailyRate":  480,
                          "allowance":  50,
                          "sssNumber":  "34-10000012-1",
                          "philHealthNumber":  "12-200000012-3",
                          "pagIbigNumber":  "1210-30000012-4",
                          "tinNumber":  "400-500012-000",
                          "shiftStart":  "08:00",
                          "shiftEnd":  "17:00",
                          "attendanceLogs":  [
                                                 {
                                                     "date":  "2026-08-16",
                                                     "time":  "00:22",
                                                     "raw":  "00:22",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-16",
                                                     "time":  "09:30",
                                                     "raw":  "09:30",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-18",
                                                     "time":  "08:06",
                                                     "raw":  "08:06",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-18",
                                                     "time":  "22:17",
                                                     "raw":  "22:17",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-19",
                                                     "time":  "09:39",
                                                     "raw":  "09:39",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-19",
                                                     "time":  "17:37",
                                                     "raw":  "17:37",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-20",
                                                     "time":  "17:27",
                                                     "raw":  "17:27",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-20",
                                                     "time":  "18:29",
                                                     "raw":  "18:29",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-21",
                                                     "time":  "09:42",
                                                     "raw":  "09:42",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-23",
                                                     "time":  "08:02",
                                                     "raw":  "08:02",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-23",
                                                     "time":  "15:06",
                                                     "raw":  "15:06",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-25",
                                                     "time":  "10:06",
                                                     "raw":  "10:06",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-25",
                                                     "time":  "15:06",
                                                     "raw":  "15:06",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-27",
                                                     "time":  "14:54",
                                                     "raw":  "14:54",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-28",
                                                     "time":  "00:44",
                                                     "raw":  "00:44",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-29",
                                                     "time":  "14:56",
                                                     "raw":  "14:56",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-30",
                                                     "time":  "00:12",
                                                     "raw":  "00:12",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-31",
                                                     "time":  "09:03",
                                                     "raw":  "09:03",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-31",
                                                     "time":  "15:33",
                                                     "raw":  "15:33",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-01",
                                                     "time":  "08:57",
                                                     "raw":  "08:57",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-01",
                                                     "time":  "15:05",
                                                     "raw":  "15:05",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-04",
                                                     "time":  "15:00",
                                                     "raw":  "15:00",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-05",
                                                     "time":  "00:43",
                                                     "raw":  "00:43",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-16",
                                                     "time":  "15:11",
                                                     "raw":  "15:11",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-16",
                                                     "time":  "17:10",
                                                     "raw":  "17:10",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-19",
                                                     "time":  "18:27",
                                                     "raw":  "18:27",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-20",
                                                     "time":  "21:12",
                                                     "raw":  "21:12",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-23",
                                                     "time":  "17:56",
                                                     "raw":  "17:56",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-23",
                                                     "time":  "21:09",
                                                     "raw":  "21:09",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-25",
                                                     "time":  "16:59",
                                                     "raw":  "16:59",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-25",
                                                     "time":  "22:00",
                                                     "raw":  "22:00",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-31",
                                                     "time":  "18:03",
                                                     "raw":  "18:03",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-31",
                                                     "time":  "21:03",
                                                     "raw":  "21:03",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-01",
                                                     "time":  "17:59",
                                                     "raw":  "17:59",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-01",
                                                     "time":  "21:00",
                                                     "raw":  "21:00",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-16",
                                                     "time":  "22:01",
                                                     "raw":  "22:01",
                                                     "source":  "biometric_import"
                                                 }
                                             ]
                      },
                      {
                          "id":  13,
                          "name":  "Chailene Dolido",
                          "department":  "COMPANY",
                          "position":  "Cashier \u0026 Counter Staff",
                          "dailyRate":  450,
                          "allowance":  50,
                          "sssNumber":  "34-10000013-1",
                          "philHealthNumber":  "12-200000013-3",
                          "pagIbigNumber":  "1210-30000013-4",
                          "tinNumber":  "400-500013-000",
                          "shiftStart":  "08:00",
                          "shiftEnd":  "17:00",
                          "attendanceLogs":  [
                                                 {
                                                     "date":  "2026-08-16",
                                                     "time":  "00:22",
                                                     "raw":  "00:22",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-16",
                                                     "time":  "14:54",
                                                     "raw":  "14:54",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-17",
                                                     "time":  "00:16",
                                                     "raw":  "00:16",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-17",
                                                     "time":  "10:20",
                                                     "raw":  "10:20",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-19",
                                                     "time":  "14:41",
                                                     "raw":  "14:41",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-20",
                                                     "time":  "00:27",
                                                     "raw":  "00:27",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-20",
                                                     "time":  "14:44",
                                                     "raw":  "14:44",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-21",
                                                     "time":  "00:21",
                                                     "raw":  "00:21",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-21",
                                                     "time":  "09:55",
                                                     "raw":  "09:55",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-22",
                                                     "time":  "00:39",
                                                     "raw":  "00:39",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-22",
                                                     "time":  "14:53",
                                                     "raw":  "14:53",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-23",
                                                     "time":  "00:19",
                                                     "raw":  "00:19",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-23",
                                                     "time":  "14:45",
                                                     "raw":  "14:45",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-24",
                                                     "time":  "00:44",
                                                     "raw":  "00:44",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-24",
                                                     "time":  "09:53",
                                                     "raw":  "09:53",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-25",
                                                     "time":  "00:58",
                                                     "raw":  "00:58",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-25",
                                                     "time":  "14:45",
                                                     "raw":  "14:45",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-26",
                                                     "time":  "00:24",
                                                     "raw":  "00:24",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-26",
                                                     "time":  "09:53",
                                                     "raw":  "09:53",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-27",
                                                     "time":  "00:20",
                                                     "raw":  "00:20",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-27",
                                                     "time":  "14:55",
                                                     "raw":  "14:55",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-28",
                                                     "time":  "00:43",
                                                     "raw":  "00:43",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-28",
                                                     "time":  "14:44",
                                                     "raw":  "14:44",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-29",
                                                     "time":  "00:48",
                                                     "raw":  "00:48",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-29",
                                                     "time":  "14:50",
                                                     "raw":  "14:50",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-30",
                                                     "time":  "01:05",
                                                     "raw":  "01:05",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-30",
                                                     "time":  "10:04",
                                                     "raw":  "10:04",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-31",
                                                     "time":  "14:49",
                                                     "raw":  "14:49",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-01",
                                                     "time":  "00:30",
                                                     "raw":  "00:30",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-01",
                                                     "time":  "14:45",
                                                     "raw":  "14:45",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-02",
                                                     "time":  "01:25",
                                                     "raw":  "01:25",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-02",
                                                     "time":  "14:45",
                                                     "raw":  "14:45",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-03",
                                                     "time":  "00:24",
                                                     "raw":  "00:24",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-03",
                                                     "time":  "14:45",
                                                     "raw":  "14:45",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-04",
                                                     "time":  "01:14",
                                                     "raw":  "01:14",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-05",
                                                     "time":  "14:38",
                                                     "raw":  "14:38",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-24",
                                                     "time":  "09:54",
                                                     "raw":  "09:54",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-30",
                                                     "time":  "15:31",
                                                     "raw":  "15:31",
                                                     "source":  "biometric_import"
                                                 }
                                             ]
                      },
                      {
                          "id":  14,
                          "name":  "Jesie Piollo",
                          "department":  "COMPANY",
                          "position":  "Service \u0026 Operations Staff",
                          "dailyRate":  438,
                          "allowance":  50,
                          "sssNumber":  "34-10000014-1",
                          "philHealthNumber":  "12-200000014-3",
                          "pagIbigNumber":  "1210-30000014-4",
                          "tinNumber":  "400-500014-000",
                          "shiftStart":  "08:00",
                          "shiftEnd":  "17:00",
                          "attendanceLogs":  [

                                             ]
                      },
                      {
                          "id":  15,
                          "name":  "Jovan Monter",
                          "department":  "COMPANY",
                          "position":  "Service \u0026 Operations Staff",
                          "dailyRate":  438,
                          "allowance":  50,
                          "sssNumber":  "34-10000015-1",
                          "philHealthNumber":  "12-200000015-3",
                          "pagIbigNumber":  "1210-30000015-4",
                          "tinNumber":  "400-500015-000",
                          "shiftStart":  "08:00",
                          "shiftEnd":  "17:00",
                          "attendanceLogs":  [

                                             ]
                      },
                      {
                          "id":  16,
                          "name":  "April Silva",
                          "department":  "OPERATION",
                          "position":  "Roaster / Kitchen Staff",
                          "dailyRate":  438,
                          "allowance":  50,
                          "sssNumber":  "34-10000016-1",
                          "philHealthNumber":  "12-200000016-3",
                          "pagIbigNumber":  "1210-30000016-4",
                          "tinNumber":  "400-500016-000",
                          "shiftStart":  "08:00",
                          "shiftEnd":  "17:00",
                          "attendanceLogs":  [

                                             ]
                      },
                      {
                          "id":  17,
                          "name":  "Jonnies Manbacuan",
                          "department":  "COMPANY",
                          "position":  "Service \u0026 Operations Staff",
                          "dailyRate":  438,
                          "allowance":  50,
                          "sssNumber":  "34-10000017-1",
                          "philHealthNumber":  "12-200000017-3",
                          "pagIbigNumber":  "1210-30000017-4",
                          "tinNumber":  "400-500017-000",
                          "shiftStart":  "08:00",
                          "shiftEnd":  "17:00",
                          "attendanceLogs":  [

                                             ]
                      },
                      {
                          "id":  18,
                          "name":  "Juril Arojo",
                          "department":  "COMPANY",
                          "position":  "Service \u0026 Operations Staff",
                          "dailyRate":  438,
                          "allowance":  50,
                          "sssNumber":  "34-10000018-1",
                          "philHealthNumber":  "12-200000018-3",
                          "pagIbigNumber":  "1210-30000018-4",
                          "tinNumber":  "400-500018-000",
                          "shiftStart":  "08:00",
                          "shiftEnd":  "17:00",
                          "attendanceLogs":  [

                                             ]
                      },
                      {
                          "id":  19,
                          "name":  "Sherwin Cagas",
                          "department":  "COMPANY",
                          "position":  "Senior Roaster / Grill Master",
                          "dailyRate":  480,
                          "allowance":  50,
                          "sssNumber":  "34-10000019-1",
                          "philHealthNumber":  "12-200000019-3",
                          "pagIbigNumber":  "1210-30000019-4",
                          "tinNumber":  "400-500019-000",
                          "shiftStart":  "08:00",
                          "shiftEnd":  "17:00",
                          "attendanceLogs":  [
                                                 {
                                                     "date":  "2026-08-16",
                                                     "time":  "00:22",
                                                     "raw":  "00:22",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-16",
                                                     "time":  "15:03",
                                                     "raw":  "15:03",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-17",
                                                     "time":  "00:20",
                                                     "raw":  "00:20",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-17",
                                                     "time":  "11:06",
                                                     "raw":  "11:06",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-18",
                                                     "time":  "15:02",
                                                     "raw":  "15:02",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-19",
                                                     "time":  "08:21",
                                                     "raw":  "08:21",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-19",
                                                     "time":  "15:01",
                                                     "raw":  "15:01",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-20",
                                                     "time":  "08:04",
                                                     "raw":  "08:04",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-20",
                                                     "time":  "15:00",
                                                     "raw":  "15:00",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-21",
                                                     "time":  "08:08",
                                                     "raw":  "08:08",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-21",
                                                     "time":  "15:25",
                                                     "raw":  "15:25",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-22",
                                                     "time":  "14:49",
                                                     "raw":  "14:49",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-23",
                                                     "time":  "00:17",
                                                     "raw":  "00:17",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-24",
                                                     "time":  "08:34",
                                                     "raw":  "08:34",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-24",
                                                     "time":  "15:00",
                                                     "raw":  "15:00",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-26",
                                                     "time":  "08:09",
                                                     "raw":  "08:09",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-26",
                                                     "time":  "15:00",
                                                     "raw":  "15:00",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-27",
                                                     "time":  "08:12",
                                                     "raw":  "08:12",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-27",
                                                     "time":  "15:12",
                                                     "raw":  "15:12",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-28",
                                                     "time":  "08:10",
                                                     "raw":  "08:10",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-28",
                                                     "time":  "15:00",
                                                     "raw":  "15:00",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-31",
                                                     "time":  "14:46",
                                                     "raw":  "14:46",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-01",
                                                     "time":  "00:23",
                                                     "raw":  "00:23",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-01",
                                                     "time":  "14:55",
                                                     "raw":  "14:55",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-02",
                                                     "time":  "00:51",
                                                     "raw":  "00:51",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-04",
                                                     "time":  "08:13",
                                                     "raw":  "08:13",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-04",
                                                     "time":  "15:18",
                                                     "raw":  "15:18",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-05",
                                                     "time":  "08:20",
                                                     "raw":  "08:20",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-05",
                                                     "time":  "15:07",
                                                     "raw":  "15:07",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-21",
                                                     "time":  "15:27",
                                                     "raw":  "15:27",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-21",
                                                     "time":  "17:58",
                                                     "raw":  "17:58",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-24",
                                                     "time":  "17:58",
                                                     "raw":  "17:58",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-24",
                                                     "time":  "21:00",
                                                     "raw":  "21:00",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-26",
                                                     "time":  "18:02",
                                                     "raw":  "18:02",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-26",
                                                     "time":  "21:14",
                                                     "raw":  "21:14",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-27",
                                                     "time":  "17:59",
                                                     "raw":  "17:59",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-27",
                                                     "time":  "21:00",
                                                     "raw":  "21:00",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-28",
                                                     "time":  "18:00",
                                                     "raw":  "18:00",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-28",
                                                     "time":  "21:00",
                                                     "raw":  "21:00",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-04",
                                                     "time":  "17:58",
                                                     "raw":  "17:58",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-04",
                                                     "time":  "21:00",
                                                     "raw":  "21:00",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-05",
                                                     "time":  "17:57",
                                                     "raw":  "17:57",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-05",
                                                     "time":  "21:01",
                                                     "raw":  "21:01",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-21",
                                                     "time":  "21:00",
                                                     "raw":  "21:00",
                                                     "source":  "biometric_import"
                                                 }
                                             ]
                      },
                      {
                          "id":  20,
                          "name":  "Angelo Labandero",
                          "department":  "COMPANY",
                          "position":  "Service \u0026 Operations Staff",
                          "dailyRate":  438,
                          "allowance":  50,
                          "sssNumber":  "34-10000020-1",
                          "philHealthNumber":  "12-200000020-3",
                          "pagIbigNumber":  "1210-30000020-4",
                          "tinNumber":  "400-500020-000",
                          "shiftStart":  "08:00",
                          "shiftEnd":  "17:00",
                          "attendanceLogs":  [

                                             ]
                      },
                      {
                          "id":  21,
                          "name":  "John Mark Adolfo",
                          "department":  "OPERATION",
                          "position":  "Roaster / Kitchen Staff",
                          "dailyRate":  438,
                          "allowance":  50,
                          "sssNumber":  "34-10000021-1",
                          "philHealthNumber":  "12-200000021-3",
                          "pagIbigNumber":  "1210-30000021-4",
                          "tinNumber":  "400-500021-000",
                          "shiftStart":  "08:00",
                          "shiftEnd":  "17:00",
                          "attendanceLogs":  [

                                             ]
                      },
                      {
                          "id":  22,
                          "name":  "Eliezer Basas",
                          "department":  "OPERATION",
                          "position":  "Roaster / Kitchen Staff",
                          "dailyRate":  438,
                          "allowance":  50,
                          "sssNumber":  "34-10000022-1",
                          "philHealthNumber":  "12-200000022-3",
                          "pagIbigNumber":  "1210-30000022-4",
                          "tinNumber":  "400-500022-000",
                          "shiftStart":  "08:00",
                          "shiftEnd":  "17:00",
                          "attendanceLogs":  [

                                             ]
                      },
                      {
                          "id":  23,
                          "name":  "Roniel Basilides",
                          "department":  "COMPANY",
                          "position":  "Service \u0026 Operations Staff",
                          "dailyRate":  438,
                          "allowance":  50,
                          "sssNumber":  "34-10000023-1",
                          "philHealthNumber":  "12-200000023-3",
                          "pagIbigNumber":  "1210-30000023-4",
                          "tinNumber":  "400-500023-000",
                          "shiftStart":  "08:00",
                          "shiftEnd":  "17:00",
                          "attendanceLogs":  [

                                             ]
                      },
                      {
                          "id":  24,
                          "name":  "Marlon Doncillos",
                          "department":  "OPERATION",
                          "position":  "Roaster / Kitchen Staff",
                          "dailyRate":  438,
                          "allowance":  50,
                          "sssNumber":  "34-10000024-1",
                          "philHealthNumber":  "12-200000024-3",
                          "pagIbigNumber":  "1210-30000024-4",
                          "tinNumber":  "400-500024-000",
                          "shiftStart":  "08:00",
                          "shiftEnd":  "17:00",
                          "attendanceLogs":  [

                                             ]
                      },
                      {
                          "id":  25,
                          "name":  "John Castanos",
                          "department":  "COMPANY",
                          "position":  "Service \u0026 Operations Staff",
                          "dailyRate":  438,
                          "allowance":  50,
                          "sssNumber":  "34-10000025-1",
                          "philHealthNumber":  "12-200000025-3",
                          "pagIbigNumber":  "1210-30000025-4",
                          "tinNumber":  "400-500025-000",
                          "shiftStart":  "08:00",
                          "shiftEnd":  "17:00",
                          "attendanceLogs":  [

                                             ]
                      },
                      {
                          "id":  26,
                          "name":  "Jake Valmoria",
                          "department":  "OPERATION",
                          "position":  "Senior Roaster / Grill Master",
                          "dailyRate":  480,
                          "allowance":  50,
                          "sssNumber":  "34-10000026-1",
                          "philHealthNumber":  "12-200000026-3",
                          "pagIbigNumber":  "1210-30000026-4",
                          "tinNumber":  "400-500026-000",
                          "shiftStart":  "08:00",
                          "shiftEnd":  "17:00",
                          "attendanceLogs":  [
                                                 {
                                                     "date":  "2026-08-16",
                                                     "time":  "07:37",
                                                     "raw":  "07:37",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-18",
                                                     "time":  "16:39",
                                                     "raw":  "16:39",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-19",
                                                     "time":  "01:21",
                                                     "raw":  "01:21",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-19",
                                                     "time":  "14:41",
                                                     "raw":  "14:41",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-20",
                                                     "time":  "00:32",
                                                     "raw":  "00:32",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-20",
                                                     "time":  "14:32",
                                                     "raw":  "14:32",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-21",
                                                     "time":  "01:47",
                                                     "raw":  "01:47",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-21",
                                                     "time":  "14:44",
                                                     "raw":  "14:44",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-22",
                                                     "time":  "00:55",
                                                     "raw":  "00:55",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-24",
                                                     "time":  "14:49",
                                                     "raw":  "14:49",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-25",
                                                     "time":  "00:58",
                                                     "raw":  "00:58",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-25",
                                                     "time":  "08:55",
                                                     "raw":  "08:55",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-28",
                                                     "time":  "14:36",
                                                     "raw":  "14:36",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-29",
                                                     "time":  "00:47",
                                                     "raw":  "00:47",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-29",
                                                     "time":  "14:51",
                                                     "raw":  "14:51",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-30",
                                                     "time":  "00:12",
                                                     "raw":  "00:12",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-30",
                                                     "time":  "14:44",
                                                     "raw":  "14:44",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-31",
                                                     "time":  "00:40",
                                                     "raw":  "00:40",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-02",
                                                     "time":  "07:43",
                                                     "raw":  "07:43",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-02",
                                                     "time":  "15:21",
                                                     "raw":  "15:21",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-03",
                                                     "time":  "07:28",
                                                     "raw":  "07:28",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-03",
                                                     "time":  "15:09",
                                                     "raw":  "15:09",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-25",
                                                     "time":  "15:21",
                                                     "raw":  "15:21",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-25",
                                                     "time":  "17:36",
                                                     "raw":  "17:36",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-02",
                                                     "time":  "17:41",
                                                     "raw":  "17:41",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-02",
                                                     "time":  "21:02",
                                                     "raw":  "21:02",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-03",
                                                     "time":  "17:47",
                                                     "raw":  "17:47",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-03",
                                                     "time":  "21:02",
                                                     "raw":  "21:02",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-25",
                                                     "time":  "21:04",
                                                     "raw":  "21:04",
                                                     "source":  "biometric_import"
                                                 }
                                             ]
                      },
                      {
                          "id":  27,
                          "name":  "Angel Borja",
                          "department":  "OPERATION",
                          "position":  "Roaster / Kitchen Staff",
                          "dailyRate":  438,
                          "allowance":  50,
                          "sssNumber":  "34-10000027-1",
                          "philHealthNumber":  "12-200000027-3",
                          "pagIbigNumber":  "1210-30000027-4",
                          "tinNumber":  "400-500027-000",
                          "shiftStart":  "08:00",
                          "shiftEnd":  "17:00",
                          "attendanceLogs":  [

                                             ]
                      },
                      {
                          "id":  28,
                          "name":  "Angelica Legaspi",
                          "department":  "OPERATION",
                          "position":  "Roaster / Kitchen Staff",
                          "dailyRate":  438,
                          "allowance":  50,
                          "sssNumber":  "34-10000028-1",
                          "philHealthNumber":  "12-200000028-3",
                          "pagIbigNumber":  "1210-30000028-4",
                          "tinNumber":  "400-500028-000",
                          "shiftStart":  "08:00",
                          "shiftEnd":  "17:00",
                          "attendanceLogs":  [

                                             ]
                      },
                      {
                          "id":  29,
                          "name":  "Andrew Daniel",
                          "department":  "OPERATION",
                          "position":  "Senior Roaster / Grill Master",
                          "dailyRate":  480,
                          "allowance":  50,
                          "sssNumber":  "34-10000029-1",
                          "philHealthNumber":  "12-200000029-3",
                          "pagIbigNumber":  "1210-30000029-4",
                          "tinNumber":  "400-500029-000",
                          "shiftStart":  "08:00",
                          "shiftEnd":  "17:00",
                          "attendanceLogs":  [
                                                 {
                                                     "date":  "2026-08-22",
                                                     "time":  "07:47",
                                                     "raw":  "07:47",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-22",
                                                     "time":  "15:24",
                                                     "raw":  "15:24",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-23",
                                                     "time":  "14:44",
                                                     "raw":  "14:44",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-24",
                                                     "time":  "00:42",
                                                     "raw":  "00:42",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-25",
                                                     "time":  "14:41",
                                                     "raw":  "14:41",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-26",
                                                     "time":  "00:31",
                                                     "raw":  "00:31",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-26",
                                                     "time":  "14:47",
                                                     "raw":  "14:47",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-27",
                                                     "time":  "00:27",
                                                     "raw":  "00:27",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-29",
                                                     "time":  "07:37",
                                                     "raw":  "07:37",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-29",
                                                     "time":  "15:06",
                                                     "raw":  "15:06",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-30",
                                                     "time":  "07:42",
                                                     "raw":  "07:42",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-30",
                                                     "time":  "15:28",
                                                     "raw":  "15:28",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-02",
                                                     "time":  "14:34",
                                                     "raw":  "14:34",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-03",
                                                     "time":  "00:25",
                                                     "raw":  "00:25",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-03",
                                                     "time":  "14:46",
                                                     "raw":  "14:46",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-04",
                                                     "time":  "00:58",
                                                     "raw":  "00:58",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-05",
                                                     "time":  "14:45",
                                                     "raw":  "14:45",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-22",
                                                     "time":  "17:42",
                                                     "raw":  "17:42",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-22",
                                                     "time":  "21:42",
                                                     "raw":  "21:42",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-30",
                                                     "time":  "17:47",
                                                     "raw":  "17:47",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-30",
                                                     "time":  "21:03",
                                                     "raw":  "21:03",
                                                     "source":  "biometric_import"
                                                 }
                                             ]
                      },
                      {
                          "id":  30,
                          "name":  "Pamela Galdo",
                          "department":  "COMPANY",
                          "position":  "Cashier \u0026 Counter Staff",
                          "dailyRate":  450,
                          "allowance":  50,
                          "sssNumber":  "34-10000030-1",
                          "philHealthNumber":  "12-200000030-3",
                          "pagIbigNumber":  "1210-30000030-4",
                          "tinNumber":  "400-500030-000",
                          "shiftStart":  "08:00",
                          "shiftEnd":  "17:00",
                          "attendanceLogs":  [
                                                 {
                                                     "date":  "2026-08-16",
                                                     "time":  "14:57",
                                                     "raw":  "14:57",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-17",
                                                     "time":  "00:17",
                                                     "raw":  "00:17",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-18",
                                                     "time":  "09:45",
                                                     "raw":  "09:45",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-19",
                                                     "time":  "01:20",
                                                     "raw":  "01:20",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-19",
                                                     "time":  "09:41",
                                                     "raw":  "09:41",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-20",
                                                     "time":  "09:41",
                                                     "raw":  "09:41",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-20",
                                                     "time":  "15:13",
                                                     "raw":  "15:13",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-22",
                                                     "time":  "09:46",
                                                     "raw":  "09:46",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-22",
                                                     "time":  "15:04",
                                                     "raw":  "15:04",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-19",
                                                     "time":  "15:41",
                                                     "raw":  "15:41",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-19",
                                                     "time":  "22:09",
                                                     "raw":  "22:09",
                                                     "source":  "biometric_import"
                                                 }
                                             ]
                      },
                      {
                          "id":  31,
                          "name":  "Josh Abenir",
                          "department":  "COMPANY",
                          "position":  "Senior Roaster / Grill Master",
                          "dailyRate":  480,
                          "allowance":  50,
                          "sssNumber":  "34-10000031-1",
                          "philHealthNumber":  "12-200000031-3",
                          "pagIbigNumber":  "1210-30000031-4",
                          "tinNumber":  "400-500031-000",
                          "shiftStart":  "08:00",
                          "shiftEnd":  "17:00",
                          "attendanceLogs":  [
                                                 {
                                                     "date":  "2026-08-24",
                                                     "time":  "09:48",
                                                     "raw":  "09:48",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-24",
                                                     "time":  "15:13",
                                                     "raw":  "15:13",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-25",
                                                     "time":  "14:48",
                                                     "raw":  "14:48",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-26",
                                                     "time":  "00:25",
                                                     "raw":  "00:25",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-26",
                                                     "time":  "09:54",
                                                     "raw":  "09:54",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-27",
                                                     "time":  "00:26",
                                                     "raw":  "00:26",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-27",
                                                     "time":  "09:50",
                                                     "raw":  "09:50",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-28",
                                                     "time":  "09:58",
                                                     "raw":  "09:58",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-28",
                                                     "time":  "16:58",
                                                     "raw":  "16:58",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-29",
                                                     "time":  "09:54",
                                                     "raw":  "09:54",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-29",
                                                     "time":  "09:55",
                                                     "raw":  "09:55",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-30",
                                                     "time":  "14:41",
                                                     "raw":  "14:41",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-31",
                                                     "time":  "00:43",
                                                     "raw":  "00:43",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-01",
                                                     "time":  "09:54",
                                                     "raw":  "09:54",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-01",
                                                     "time":  "15:32",
                                                     "raw":  "15:32",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-02",
                                                     "time":  "09:44",
                                                     "raw":  "09:44",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-02",
                                                     "time":  "16:55",
                                                     "raw":  "16:55",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-03",
                                                     "time":  "09:54",
                                                     "raw":  "09:54",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-03",
                                                     "time":  "15:34",
                                                     "raw":  "15:34",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-04",
                                                     "time":  "09:57",
                                                     "raw":  "09:57",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-04",
                                                     "time":  "15:21",
                                                     "raw":  "15:21",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-05",
                                                     "time":  "09:53",
                                                     "raw":  "09:53",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-05",
                                                     "time":  "15:56",
                                                     "raw":  "15:56",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-24",
                                                     "time":  "16:51",
                                                     "raw":  "16:51",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-24",
                                                     "time":  "22:10",
                                                     "raw":  "22:10",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-27",
                                                     "time":  "15:23",
                                                     "raw":  "15:23",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-27",
                                                     "time":  "16:56",
                                                     "raw":  "16:56",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-28",
                                                     "time":  "22:01",
                                                     "raw":  "22:01",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-29",
                                                     "time":  "15:28",
                                                     "raw":  "15:28",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-29",
                                                     "time":  "16:57",
                                                     "raw":  "16:57",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-01",
                                                     "time":  "16:57",
                                                     "raw":  "16:57",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-01",
                                                     "time":  "22:05",
                                                     "raw":  "22:05",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-02",
                                                     "time":  "22:06",
                                                     "raw":  "22:06",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-03",
                                                     "time":  "16:56",
                                                     "raw":  "16:56",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-03",
                                                     "time":  "23:33",
                                                     "raw":  "23:33",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-05",
                                                     "time":  "16:57",
                                                     "raw":  "16:57",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-09-05",
                                                     "time":  "22:06",
                                                     "raw":  "22:06",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-27",
                                                     "time":  "22:04",
                                                     "raw":  "22:04",
                                                     "source":  "biometric_import"
                                                 },
                                                 {
                                                     "date":  "2026-08-29",
                                                     "time":  "22:17",
                                                     "raw":  "22:17",
                                                     "source":  "biometric_import"
                                                 }
                                             ]
                      }
                  ]
}
;

class DB {
  static init() {
    if (!safeStorage.getItem(STORAGE_KEYS.EMPLOYEES)) {
      console.log("[DB] Seeding initial Ron's Chicken employee data...");
      safeStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(INITIAL_DATA.employees));
    }
    if (!safeStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      safeStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!safeStorage.getItem(STORAGE_KEYS.SHIFTS)) {
      safeStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(DEFAULT_SHIFTS));
    }
    if (!safeStorage.getItem(STORAGE_KEYS.CUTOFFS)) {
      const defaultCutoff = [
        {
          id: "CO-2026-08-2",
          name: "August 16 - September 05, 2026 (Cugman Attendance)",
          startDate: "2026-08-16",
          endDate: "2026-09-05",
          status: "Processed",
          importedAt: "2026-09-07 01:05:57",
          sourceFile: "cugman_(August)Employee Attendance Record.xls"
        }
      ];
      safeStorage.setItem(STORAGE_KEYS.CUTOFFS, JSON.stringify(defaultCutoff));
    }
    if (!safeStorage.getItem(STORAGE_KEYS.ADVANCES)) {
      const defaultAdvances = [
        { id: "VA-101", employeeId: 12, employeeName: "Argie Daliva", type: "Cash Advance (Vale)", date: "2026-08-20", amount: 500, deductionPerCutoff: 500, reason: "Family emergency allowance", status: "Active", deducted: 0 },
        { id: "VA-102", employeeId: 19, employeeName: "Sherwin Cagas", type: "Cash Advance (Vale)", date: "2026-08-25", amount: 350, deductionPerCutoff: 350, reason: "Medicine vale", status: "Active", deducted: 0 },
        { id: "VA-103", employeeId: 31, employeeName: "Josh Abenir", type: "Cash Advance (Vale)", date: "2026-08-28", amount: 400, deductionPerCutoff: 400, reason: "Motorcycle gas vale", status: "Active", deducted: 0 }
      ];
      safeStorage.setItem(STORAGE_KEYS.ADVANCES, JSON.stringify(defaultAdvances));
    } else {
      // Auto-migrate any legacy seed entries where deducted was set to amount
      try {
        const stored = JSON.parse(safeStorage.getItem(STORAGE_KEYS.ADVANCES)) || [];
        let modified = false;
        stored.forEach(a => {
          if (a.status === 'Active' && a.deducted === a.amount && (a.id === 'VA-101' || a.id === 'VA-102' || a.id === 'VA-103')) {
            a.deducted = 0;
            if (!a.deductionPerCutoff) a.deductionPerCutoff = a.amount;
            modified = true;
          }
        });
        if (modified) {
          safeStorage.setItem(STORAGE_KEYS.ADVANCES, JSON.stringify(stored));
        }
      } catch (e) {}
    }
    if (!safeStorage.getItem(STORAGE_KEYS.DEVICE_CONFIG)) {
      const defaultDevice = {
        enabled: true,
        deviceName: "Ron's Chicken Biometrics - Cugman Deli e3960",
        deviceModel: "Deli e3960 (USB Flash Drive Attendance Machine / Non-WiFi)",
        ipAddress: "N/A (Offline USB Flash Drive Export)",
        port: 0,
        commKey: 0,
        admsUrl: "https://ronschicken.cloud/api/biometrics/push",
        autoSyncIntervalMinutes: 0,
        lastSyncTimestamp: "2026-09-07 01:05:57",
        status: "USB Flash Drive Mode Active (Deli e3960)"
      };
      safeStorage.setItem(STORAGE_KEYS.DEVICE_CONFIG, JSON.stringify(defaultDevice));
    }
    if (!safeStorage.getItem(STORAGE_KEYS.LEAVES)) {
      const defaultLeaves = [
        { id: "LV-1", employeeId: 13, employeeName: "Chailene Dolido", type: "Sick Leave", startDate: "2026-08-18", endDate: "2026-08-18", days: 1, reason: "Fever and flu", status: "Approved" }
      ];
      safeStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(defaultLeaves));
    }
    // ERP User Accounts & Cashier Roles
    if (!safeStorage.getItem(STORAGE_KEYS.USERS)) {
      safeStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    }
    if (!safeStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      safeStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_USERS[0]));
    }
    // ERP Deductions Ledger (Utang, CA, Shortages, Lacking Products)
    if (!safeStorage.getItem(STORAGE_KEYS.DEDUCTIONS)) {
      const existingAdvances = this.getAdvances();
      if (existingAdvances && existingAdvances.length > 0) {
        const migrated = existingAdvances.map(a => ({
          id: a.id || `DED-${Date.now()}-${Math.floor(Math.random()*1000)}`,
          employeeId: a.employeeId,
          employeeName: a.employeeName,
          category: a.category || (a.type && a.type.toLowerCase().includes('loan') ? 'Utang' : 'CA'),
          type: a.type || "Cash Advance (Vale)",
          date: a.date || new Date().toISOString().split('T')[0],
          amount: a.amount || 0,
          deductionPerCutoff: a.deductionPerCutoff || a.amount,
          deducted: a.deducted || 0,
          reason: a.reason || "Staff cash advance / vale",
          status: a.status || "Active",
          loggedBy: a.loggedBy || "Management"
        }));
        safeStorage.setItem(STORAGE_KEYS.DEDUCTIONS, JSON.stringify(migrated));
      } else {
        safeStorage.setItem(STORAGE_KEYS.DEDUCTIONS, JSON.stringify(DEFAULT_DEDUCTIONS));
      }
    }
    // ERP Lechon & Liempo Daily Inventory
    if (!safeStorage.getItem(STORAGE_KEYS.INVENTORY)) {
      safeStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(DEFAULT_INVENTORY));
    }
    // ERP Cashier Sales & Shift Remittances
    if (!safeStorage.getItem(STORAGE_KEYS.REMITTANCES)) {
      safeStorage.setItem(STORAGE_KEYS.REMITTANCES, JSON.stringify(DEFAULT_REMITTANCES));
    }
    // ERP AI Financial Analyst State
    if (!safeStorage.getItem(STORAGE_KEYS.AI_ADVISORY)) {
      safeStorage.setItem(STORAGE_KEYS.AI_ADVISORY, JSON.stringify(DEFAULT_AI_ADVISORY));
    }
    // ERP AI Business Memory & Conversational Thread
    if (!safeStorage.getItem(STORAGE_KEYS.AI_MEMORY)) {
      safeStorage.setItem(STORAGE_KEYS.AI_MEMORY, JSON.stringify(DEFAULT_AI_MEMORY));
    }
    if (!safeStorage.getItem(STORAGE_KEYS.AI_CHAT_HISTORY)) {
      safeStorage.setItem(STORAGE_KEYS.AI_CHAT_HISTORY, JSON.stringify(DEFAULT_AI_CHAT_HISTORY));
    }
    if (!safeStorage.getItem(STORAGE_KEYS.AI_CONFIG)) {
      safeStorage.setItem(STORAGE_KEYS.AI_CONFIG, JSON.stringify({
        geminiApiKey: '',
        model: 'gemini-1.5-flash',
        mode: 'hybrid',
        language: 'taglish'
      }));
    }
  }

  // Employees CRUD
  static getEmployees() {
    try {
      return JSON.parse(safeStorage.getItem(STORAGE_KEYS.EMPLOYEES)) || [];
    } catch (e) {
      return [];
    }
  }

  static getEmployeeById(id) {
    const employees = this.getEmployees();
    return employees.find(e => e.id === Number(id));
  }

  static triggerCloudSync() {
    if (typeof window !== 'undefined' && window.FirebaseSync && typeof window.FirebaseSync.pushLocalToCloud === 'function') {
      window.FirebaseSync.pushLocalToCloud().catch(() => {});
    }
  }

  static saveEmployees(employees) {
    safeStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    this.triggerCloudSync();
  }

  static addOrUpdateEmployee(empData) {
    const employees = this.getEmployees();
    const index = employees.findIndex(e => e.id === Number(empData.id));
    if (index >= 0) {
      employees[index] = { ...employees[index], ...empData };
    } else {
      employees.push(empData);
    }
    this.saveEmployees(employees);
    return empData;
  }

  static deleteEmployee(id) {
    let employees = this.getEmployees();
    employees = employees.filter(e => e.id !== Number(id));
    this.saveEmployees(employees);
  }

  // Attendance Punch Logging
  static addPunchLog(employeeId, punchLog) {
    const employees = this.getEmployees();
    const emp = employees.find(e => e.id === Number(employeeId));
    if (!emp) return false;
    
    if (!emp.attendanceLogs) emp.attendanceLogs = [];
    emp.attendanceLogs.push(punchLog);
    this.saveEmployees(employees);
    return true;
  }

  static setEmployeeAttendance(employeeId, logs) {
    const employees = this.getEmployees();
    const emp = employees.find(e => e.id === Number(employeeId));
    if (!emp) return false;
    emp.attendanceLogs = logs;
    this.saveEmployees(employees);
    return true;
  }

  // Settings
  static getSettings() {
    try {
      return JSON.parse(safeStorage.getItem(STORAGE_KEYS.SETTINGS)) || DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  }

  static saveSettings(settings) {
    safeStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    this.triggerCloudSync();
  }

  // Shifts
  static getShifts() {
    try {
      return JSON.parse(safeStorage.getItem(STORAGE_KEYS.SHIFTS)) || DEFAULT_SHIFTS;
    } catch (e) {
      return DEFAULT_SHIFTS;
    }
  }

  static saveShifts(shifts) {
    safeStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
    this.triggerCloudSync();
  }

  // Cutoffs
  static getCutoffs() {
    try {
      const stored = JSON.parse(safeStorage.getItem(STORAGE_KEYS.CUTOFFS));
      if (stored && Array.isArray(stored) && stored.length > 0) return stored;
    } catch (e) {}

    const defaultCutoffs = [
      {
        id: "CO-2026-08-2",
        name: "August 16 - September 05, 2026 (Deli e3960 Ingestion)",
        startDate: "2026-08-16",
        endDate: "2026-09-05",
        status: "Processed"
      },
      {
        id: "CO-2026-09-1",
        name: "September 01 - September 15, 2026 (1st Cutoff)",
        startDate: "2026-09-01",
        endDate: "2026-09-15",
        status: "Open"
      },
      {
        id: "CO-2026-09-2",
        name: "September 16 - September 30, 2026 (2nd Cutoff)",
        startDate: "2026-09-16",
        endDate: "2026-09-30",
        status: "Upcoming"
      },
      {
        id: "CO-2026-10-1",
        name: "October 01 - October 15, 2026 (1st Cutoff)",
        startDate: "2026-10-01",
        endDate: "2026-10-15",
        status: "Upcoming"
      },
      {
        id: "CO-2026-10-2",
        name: "October 16 - October 31, 2026 (2nd Cutoff)",
        startDate: "2026-10-16",
        endDate: "2026-10-31",
        status: "Upcoming"
      }
    ];
    this.saveCutoffs(defaultCutoffs);
    return defaultCutoffs;
  }

  static saveCutoffs(cutoffs) {
    safeStorage.setItem(STORAGE_KEYS.CUTOFFS, JSON.stringify(cutoffs));
    this.triggerCloudSync();
  }

  static addCutoff(cutoff) {
    const cutoffs = this.getCutoffs();
    const existingIdx = cutoffs.findIndex(c => c.id === cutoff.id);
    if (existingIdx >= 0) {
      cutoffs[existingIdx] = { ...cutoffs[existingIdx], ...cutoff };
    } else {
      cutoffs.unshift(cutoff);
    }
    this.saveCutoffs(cutoffs);
    this.autoBackupSnapshot(`Added Cutoff ${cutoff.name}`);
  }

  // Cash Advances (Vale)
  static getAdvances() {
    try {
      return JSON.parse(safeStorage.getItem(STORAGE_KEYS.ADVANCES)) || [];
    } catch (e) {
      return [];
    }
  }

  static saveAdvances(advances) {
    safeStorage.setItem(STORAGE_KEYS.ADVANCES, JSON.stringify(advances));
    this.triggerCloudSync();
  }

  static addAdvance(advance) {
    const advances = this.getAdvances();
    advances.unshift(advance);
    this.saveAdvances(advances);
  }

  static deleteAdvance(id) {
    let advances = this.getAdvances();
    advances = advances.filter(a => a.id !== id);
    this.saveAdvances(advances);
  }

  static updateAdvance(updated) {
    const advances = this.getAdvances();
    const idx = advances.findIndex(a => a.id === updated.id);
    if (idx >= 0) {
      advances[idx] = { ...advances[idx], ...updated };
      this.saveAdvances(advances);
    }
  }

  // ==========================================
  // ERP USER PERMISSIONS & CASHIER ROLES
  // ==========================================
  static getUsers() {
    try {
      const u = JSON.parse(safeStorage.getItem(STORAGE_KEYS.USERS));
      if (u && Array.isArray(u) && u.length > 0) return u;
    } catch (e) {}
    return DEFAULT_USERS;
  }

  static saveUsers(users) {
    safeStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.triggerCloudSync();
  }

  static getCurrentUser() {
    try {
      const u = JSON.parse(safeStorage.getItem(STORAGE_KEYS.CURRENT_USER));
      if (u && u.id) return u;
    } catch (e) {}
    const all = this.getUsers();
    return all[0] || DEFAULT_USERS[0];
  }

  static setCurrentUser(user) {
    safeStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('rons_user_switched', { detail: user }));
    }
  }

  static authenticateUser(userId, pin) {
    const users = this.getUsers();
    const target = users.find(u => u.id === userId);
    if (!target) return { success: false, error: "Staff/User profile not found." };
    if (target.pin && String(target.pin).trim() !== String(pin).trim()) {
      return { success: false, error: "Incorrect 4-digit PIN code." };
    }
    this.setCurrentUser(target);
    return { success: true, user: target };
  }

  static updateUser(updated) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === updated.id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...updated };
      this.saveUsers(users);
      const curr = this.getCurrentUser();
      if (curr && curr.id === updated.id) {
        this.setCurrentUser(users[idx]);
      }
    }
  }

  // ==========================================
  // ERP DEDUCTIONS LEDGER (Utang, CA, Shortages, Lacking Products)
  // ==========================================
  static getDeductions() {
    try {
      const stored = JSON.parse(safeStorage.getItem(STORAGE_KEYS.DEDUCTIONS));
      if (stored && Array.isArray(stored) && stored.length > 0) return stored;
    } catch (e) {}
    // If advances exist in legacy key, migrate them
    const legacy = this.getAdvances();
    if (legacy && legacy.length > 0) {
      const migrated = legacy.map(a => ({
        id: a.id || `DED-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        employeeId: a.employeeId,
        employeeName: a.employeeName,
        category: a.category || "CA",
        type: a.type || "Cash Advance (Vale)",
        date: a.date || new Date().toISOString().split('T')[0],
        amount: a.amount || 0,
        deductionPerCutoff: a.deductionPerCutoff || a.amount,
        deducted: a.deducted || 0,
        reason: a.reason || "Staff cash advance / vale",
        status: a.status || "Active",
        loggedBy: a.loggedBy || "Management"
      }));
      this.saveDeductions(migrated);
      return migrated;
    }
    return DEFAULT_DEDUCTIONS;
  }

  static saveDeductions(deductions) {
    safeStorage.setItem(STORAGE_KEYS.DEDUCTIONS, JSON.stringify(deductions));
    // Also keep advances key synchronized for backward compatibility
    safeStorage.setItem(STORAGE_KEYS.ADVANCES, JSON.stringify(deductions));
    this.triggerCloudSync();
  }

  static addDeduction(deduction) {
    const deductions = this.getDeductions();
    deductions.unshift(deduction);
    this.saveDeductions(deductions);
    this.autoBackupSnapshot(`Added Deduction (${deduction.category}) for ${deduction.employeeName}`);
  }

  static updateDeduction(updated) {
    const deductions = this.getDeductions();
    const idx = deductions.findIndex(d => d.id === updated.id);
    if (idx >= 0) {
      deductions[idx] = { ...deductions[idx], ...updated };
      this.saveDeductions(deductions);
    }
  }

  static deleteDeduction(id) {
    let deductions = this.getDeductions();
    deductions = deductions.filter(d => d.id !== id);
    this.saveDeductions(deductions);
  }

  // ==========================================
  // ERP LECHON MANOK & LIEMPO INVENTORY
  // ==========================================
  static getInventory() {
    try {
      const inv = JSON.parse(safeStorage.getItem(STORAGE_KEYS.INVENTORY));
      if (inv && inv.products && inv.dailySheets) return inv;
    } catch (e) {}
    return DEFAULT_INVENTORY;
  }

  static saveInventory(inventory) {
    safeStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
    this.triggerCloudSync();
  }

  static addInventoryDailySheet(sheet) {
    const inv = this.getInventory();
    const existingIdx = inv.dailySheets.findIndex(s => s.id === sheet.id || s.date === sheet.date);
    if (existingIdx >= 0) {
      inv.dailySheets[existingIdx] = { ...inv.dailySheets[existingIdx], ...sheet };
    } else {
      inv.dailySheets.unshift(sheet);
    }
    this.saveInventory(inv);
    this.autoBackupSnapshot(`Saved Daily Chicken Inventory (${sheet.date})`);
  }

  static addRoastBatch(sheetDate, batch) {
    const inv = this.getInventory();
    let sheet = inv.dailySheets.find(s => s.date === sheetDate);
    if (!sheet) {
      sheet = {
        id: `INV-${sheetDate}`,
        date: sheetDate,
        cashierOnDuty: "Cashier on duty",
        roasterOnDuty: batch.roaster || "Grill Master",
        beginningChicken: 0,
        receivedChicken: 0,
        roastedBatches: [],
        totalRoastedChicken: 0,
        soldWholeChicken: 0,
        soldHalfChicken: 0,
        soldLiempoSlabs: 0,
        spoilageRejectChicken: 0,
        staffMealChicken: 0,
        expectedEndingChicken: 0,
        actualEndingChicken: 0,
        varianceChicken: 0,
        beginningLiempo: 0,
        receivedLiempo: 0,
        totalRoastedLiempo: 0,
        endingLiempo: 0
      };
      inv.dailySheets.unshift(sheet);
    }
    if (!sheet.roastedBatches) sheet.roastedBatches = [];
    batch.batchNo = sheet.roastedBatches.length + 1;
    sheet.roastedBatches.push(batch);
    sheet.totalRoastedChicken = sheet.roastedBatches.reduce((sum, b) => sum + (Number(b.chickenCount) || 0), 0);
    sheet.totalRoastedLiempo = sheet.roastedBatches.reduce((sum, b) => sum + (Number(b.liempoCount) || 0), 0);
    this.saveInventory(inv);
    return sheet;
  }

  // ==========================================
  // ERP CASHIER SALES & REMITTANCES
  // ==========================================
  static getRemittances() {
    try {
      const rems = JSON.parse(safeStorage.getItem(STORAGE_KEYS.REMITTANCES));
      if (rems && Array.isArray(rems)) return rems;
    } catch (e) {}
    return DEFAULT_REMITTANCES;
  }

  static saveRemittances(remittances) {
    safeStorage.setItem(STORAGE_KEYS.REMITTANCES, JSON.stringify(remittances));
    this.triggerCloudSync();
  }

  static addRemittance(remittance) {
    const rems = this.getRemittances();
    rems.unshift(remittance);
    this.saveRemittances(rems);
    this.autoBackupSnapshot(`Saved Shift Remittance (${remittance.shift} - ${remittance.cashierName})`);
  }

  static updateRemittance(updated) {
    const rems = this.getRemittances();
    const idx = rems.findIndex(r => r.id === updated.id);
    if (idx >= 0) {
      rems[idx] = { ...rems[idx], ...updated };
      this.saveRemittances(rems);
    }
  }

  // ==========================================
  // ERP AI FINANCIAL ADVISOR
  // ==========================================
  static getAiAdvisory() {
    try {
      const adv = JSON.parse(safeStorage.getItem(STORAGE_KEYS.AI_ADVISORY));
      if (adv && adv.insights) return adv;
    } catch (e) {}
    return DEFAULT_AI_ADVISORY;
  }

  static saveAiAdvisory(advisory) {
    safeStorage.setItem(STORAGE_KEYS.AI_ADVISORY, JSON.stringify(advisory));
    this.triggerCloudSync();
  }

  // ==========================================
  // ERP AI CFO CHAT & BUSINESS MEMORY
  // ==========================================
  static getAiChatHistory() {
    try {
      const history = JSON.parse(safeStorage.getItem(STORAGE_KEYS.AI_CHAT_HISTORY));
      if (history && Array.isArray(history) && history.length > 0) return history;
    } catch (e) {}
    return DEFAULT_AI_CHAT_HISTORY;
  }

  static saveAiChatHistory(history) {
    safeStorage.setItem(STORAGE_KEYS.AI_CHAT_HISTORY, JSON.stringify(history));
    this.triggerCloudSync();
  }

  static addAiChatMessage(role, text) {
    const history = this.getAiChatHistory();
    const now = new Date();
    const msg = {
      id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      role: role,
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: now.toISOString().split('T')[0],
      text: text
    };
    history.push(msg);
    if (history.length > 60) {
      history.splice(0, history.length - 60);
    }
    this.saveAiChatHistory(history);
    return msg;
  }

  static clearAiChatHistory() {
    this.saveAiChatHistory(DEFAULT_AI_CHAT_HISTORY);
  }

  static getAiMemory() {
    try {
      const mem = JSON.parse(safeStorage.getItem(STORAGE_KEYS.AI_MEMORY));
      if (mem && Array.isArray(mem) && mem.length > 0) return mem;
    } catch (e) {}
    return DEFAULT_AI_MEMORY;
  }

  static saveAiMemory(memory) {
    safeStorage.setItem(STORAGE_KEYS.AI_MEMORY, JSON.stringify(memory));
    this.triggerCloudSync();
  }

  static addAiMemoryItem(item) {
    const memory = this.getAiMemory();
    const newItem = {
      id: item.id || `mem_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      category: item.category || 'Manager Notes',
      title: item.title || 'Learned Rule',
      fact: item.fact || item.text,
      dateAdded: item.dateAdded || new Date().toISOString().split('T')[0],
      addedBy: item.addedBy || 'Sir Irl'
    };
    memory.unshift(newItem);
    this.saveAiMemory(memory);
    this.autoBackupSnapshot(`Added AI Learned Memory: ${newItem.title}`);
    return newItem;
  }

  static deleteAiMemoryItem(id) {
    let memory = this.getAiMemory();
    memory = memory.filter(m => m.id !== id);
    this.saveAiMemory(memory);
  }

  static getAiConfig() {
    try {
      const cfg = JSON.parse(safeStorage.getItem(STORAGE_KEYS.AI_CONFIG));
      if (cfg && typeof cfg === 'object') return cfg;
    } catch (e) {}
    return {
      geminiApiKey: '',
      model: 'gemini-1.5-flash',
      mode: 'hybrid',
      language: 'taglish'
    };
  }

  static saveAiConfig(cfg) {
    safeStorage.setItem(STORAGE_KEYS.AI_CONFIG, JSON.stringify(cfg));
    this.triggerCloudSync();
  }

  // Leaves
  static getLeaves() {
    try {
      return JSON.parse(safeStorage.getItem(STORAGE_KEYS.LEAVES)) || [];
    } catch (e) {
      return [];
    }
  }

  static saveLeaves(leaves) {
    safeStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(leaves));
    this.triggerCloudSync();
  }

  static addLeave(leave) {
    const leaves = this.getLeaves();
    leaves.unshift(leave);
    this.saveLeaves(leaves);
  }

  // Device Config
  static getDeviceConfig() {
    try {
      return JSON.parse(safeStorage.getItem(STORAGE_KEYS.DEVICE_CONFIG));
    } catch (e) {
      return null;
    }
  }

  static saveDeviceConfig(config) {
    safeStorage.setItem(STORAGE_KEYS.DEVICE_CONFIG, JSON.stringify(config));
    this.triggerCloudSync();
  }

  // Payroll History
  static getPayrollHistory() {
    try {
      return JSON.parse(safeStorage.getItem(STORAGE_KEYS.PAYROLL_HISTORY)) || [];
    } catch (e) {
      return [];
    }
  }

  static savePayrollHistory(history) {
    safeStorage.setItem(STORAGE_KEYS.PAYROLL_HISTORY, JSON.stringify(history));
    this.triggerCloudSync();
  }

  static addPayrollRecord(record) {
    const history = this.getPayrollHistory();
    const existingIndex = history.findIndex(h => h.cutoffId === record.cutoffId);
    if (existingIndex >= 0) {
      history[existingIndex] = record;
    } else {
      history.unshift(record);
    }
    this.savePayrollHistory(history);
  }

  // Automatic Rolling Backups & Snapshots
  static autoBackupSnapshot(label = 'Auto Snapshot') {
    try {
      const backupData = this.getFullBackupData(label);
      let snapshots = [];
      try {
        snapshots = JSON.parse(safeStorage.getItem('rons_payroll_autobackup_snapshots')) || [];
      } catch (e) {
        snapshots = [];
      }
      
      // Keep up to 10 rolling snapshots
      snapshots.unshift({
        id: 'snap_' + Date.now(),
        timestamp: new Date().toISOString(),
        formattedDate: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
        label: label,
        data: backupData
      });

      if (snapshots.length > 10) {
        snapshots = snapshots.slice(0, 10);
      }

      safeStorage.setItem('rons_payroll_autobackup_snapshots', JSON.stringify(snapshots));
      safeStorage.setItem('rons_payroll_last_autobackup', new Date().toISOString());
    } catch (err) {
      console.warn("[DB] Auto backup snapshot warning:", err);
    }
  }

  static getAutoBackups() {
    try {
      return JSON.parse(safeStorage.getItem('rons_payroll_autobackup_snapshots')) || [];
    } catch (e) {
      return [];
    }
  }

  static getFullBackupData(label = 'Manual Export') {
    return {
      version: '2.0',
      system: "Ron's Chicken Custom ERP, Inventory & Payroll System",
      branch: "Cugman Branch (Cagayan de Oro)",
      exportDate: new Date().toISOString(),
      label: label,
      payload: {
        employees: this.getEmployees(),
        shifts: this.getShifts(),
        cutoffs: this.getCutoffs(),
        advances: this.getAdvances(),
        deductions: this.getDeductions(),
        users: this.getUsers(),
        inventory: this.getInventory(),
        remittances: this.getRemittances(),
        aiAdvisory: this.getAiAdvisory(),
        aiChatHistory: this.getAiChatHistory(),
        aiMemory: this.getAiMemory(),
        aiConfig: this.getAiConfig(),
        settings: this.getSettings(),
        payrollHistory: this.getPayrollHistory(),
        leaves: this.getLeaves(),
        deviceConfig: this.getDeviceConfig()
      }
    };
  }

  static downloadBackupJson() {
    this.autoBackupSnapshot('Pre-Export Snapshot');
    const data = this.getFullBackupData('User Downloaded Backup');
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `rons_chicken_cugman_erp_backup_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    return true;
  }

  static importBackupJson(jsonString) {
    try {
      const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      const payload = parsed.payload || parsed;

      if (!payload || !payload.employees || !Array.isArray(payload.employees)) {
        throw new Error("Invalid backup file format. Missing employee records.");
      }

      // Create safety snapshot before restoring
      this.autoBackupSnapshot('Pre-Restore Safety Snapshot');

      if (payload.employees) this.saveEmployees(payload.employees);
      if (payload.shifts) this.saveShifts(payload.shifts);
      if (payload.cutoffs) this.saveCutoffs(payload.cutoffs);
      if (payload.advances) this.saveAdvances(payload.advances);
      if (payload.deductions) this.saveDeductions(payload.deductions);
      if (payload.users) this.saveUsers(payload.users);
      if (payload.inventory) this.saveInventory(payload.inventory);
      if (payload.remittances) this.saveRemittances(payload.remittances);
      if (payload.aiAdvisory) this.saveAiAdvisory(payload.aiAdvisory);
      if (payload.aiChatHistory) this.saveAiChatHistory(payload.aiChatHistory);
      if (payload.aiMemory) this.saveAiMemory(payload.aiMemory);
      if (payload.aiConfig) this.saveAiConfig(payload.aiConfig);
      if (payload.settings) this.saveSettings(payload.settings);
      if (payload.payrollHistory) this.savePayrollHistory(payload.payrollHistory);
      if (payload.leaves) this.saveLeaves(payload.leaves);
      if (payload.deviceConfig) this.saveDeviceConfig(payload.deviceConfig);

      this.autoBackupSnapshot('Post-Restore Snapshot');
      return { success: true, message: `Successfully restored ${payload.employees.length} employees and ERP records.` };
    } catch (err) {
      console.error("[DB] Import Backup Error:", err);
      return { success: false, error: err.message };
    }
  }

  static restoreAutoSnapshot(snapshotId) {
    const snapshots = this.getAutoBackups();
    const target = snapshots.find(s => s.id === snapshotId);
    if (!target || !target.data) {
      return { success: false, error: "Snapshot not found." };
    }
    return this.importBackupJson(target.data);
  }

  static async requestPersistentStorage() {
    if (navigator.storage && navigator.storage.persist) {
      const isPersisted = await navigator.storage.persist();
      console.log(`[DB] Persistent storage granted: ${isPersisted}`);
      return isPersisted;
    }
    return false;
  }

  // Reset to Default Factory State
  static resetToDefaults() {
    this.autoBackupSnapshot('Pre-Reset Factory Snapshot');
    safeStorage.clear();
    this.init();
  }
}

// Expose DB to global window immediately so other modules have access
window.DB = DB;

// Auto-initialize on load with protective try-catch
try {
  DB.init();
} catch (err) {
  console.warn("[DB] Initialization safe-recovery:", err);
}

if (typeof DB.requestPersistentStorage === 'function') {
  try {
    DB.requestPersistentStorage().catch(() => {});
  } catch (e) {}
}

try {
  DB.autoBackupSnapshot('App Init Snapshot');
} catch (e) {}

