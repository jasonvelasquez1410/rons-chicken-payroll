/**
 * Ron's Chicken Custom Payroll & Biometric Attendance System
 * Database & Persistence Layer (Offline IndexedDB & LocalStorage)
 */

const STORAGE_KEYS = {
  EMPLOYEES: 'rons_payroll_employees_v1',
  SHIFTS: 'rons_payroll_shifts_v1',
  CUTOFFS: 'rons_payroll_cutoffs_v1',
  ADVANCES: 'rons_payroll_advances_v1',
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
  pagIbigDeduction: 100, // â‚±100/cutoff (â‚±200/month)
  currencySymbol: "â‚±"
};

const DEFAULT_SHIFTS = [
  { id: "S1", name: "Early Morning Roasting", start: "04:00", end: "13:00", gracePeriodMinutes: 15, color: "#f59e0b" },
  { id: "S2", name: "Morning Service & Kitchen", start: "08:00", end: "17:00", gracePeriodMinutes: 15, color: "#10b981" },
  { id: "S3", name: "Mid-Day / Evening Roasting", start: "14:00", end: "23:00", gracePeriodMinutes: 15, color: "#ef4444" },
  { id: "S4", name: "Night Shift Operations", start: "22:00", end: "07:00", gracePeriodMinutes: 15, color: "#8b5cf6" },
  { id: "S5", name: "Flexible Split Shift", start: "00:00", end: "23:59", gracePeriodMinutes: 15, color: "#3b82f6" }
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
    if (!localStorage.getItem(STORAGE_KEYS.EMPLOYEES)) {
      console.log("[DB] Seeding initial Ron's Chicken employee data...");
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(INITIAL_DATA.employees));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SHIFTS)) {
      localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(DEFAULT_SHIFTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUTOFFS)) {
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
      localStorage.setItem(STORAGE_KEYS.CUTOFFS, JSON.stringify(defaultCutoff));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ADVANCES)) {
      const defaultAdvances = [
        { id: "VA-101", employeeId: 12, employeeName: "Argie Daliva", type: "Cash Advance (Vale)", date: "2026-08-20", amount: 500, deductionPerCutoff: 500, reason: "Family emergency allowance", status: "Active", deducted: 0 },
        { id: "VA-102", employeeId: 19, employeeName: "Sherwin Cagas", type: "Cash Advance (Vale)", date: "2026-08-25", amount: 350, deductionPerCutoff: 350, reason: "Medicine vale", status: "Active", deducted: 0 },
        { id: "VA-103", employeeId: 31, employeeName: "Josh Abenir", type: "Cash Advance (Vale)", date: "2026-08-28", amount: 400, deductionPerCutoff: 400, reason: "Motorcycle gas vale", status: "Active", deducted: 0 }
      ];
      localStorage.setItem(STORAGE_KEYS.ADVANCES, JSON.stringify(defaultAdvances));
    } else {
      // Auto-migrate any legacy seed entries where deducted was set to amount
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADVANCES)) || [];
        let modified = false;
        stored.forEach(a => {
          if (a.status === 'Active' && a.deducted === a.amount && (a.id === 'VA-101' || a.id === 'VA-102' || a.id === 'VA-103')) {
            a.deducted = 0;
            if (!a.deductionPerCutoff) a.deductionPerCutoff = a.amount;
            modified = true;
          }
        });
        if (modified) {
          localStorage.setItem(STORAGE_KEYS.ADVANCES, JSON.stringify(stored));
        }
      } catch (e) {}
    }
    if (!localStorage.getItem(STORAGE_KEYS.DEVICE_CONFIG)) {
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
      localStorage.setItem(STORAGE_KEYS.DEVICE_CONFIG, JSON.stringify(defaultDevice));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LEAVES)) {
      const defaultLeaves = [
        { id: "LV-1", employeeId: 13, employeeName: "Chailene Dolido", type: "Sick Leave", startDate: "2026-08-18", endDate: "2026-08-18", days: 1, reason: "Fever and flu", status: "Approved" }
      ];
      localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(defaultLeaves));
    }
  }

  // Employees CRUD
  static getEmployees() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES)) || [];
    } catch (e) {
      return [];
    }
  }

  static getEmployeeById(id) {
    const employees = this.getEmployees();
    return employees.find(e => e.id === Number(id));
  }

  static saveEmployees(employees) {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
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
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  }

  static saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  // Shifts
  static getShifts() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SHIFTS)) || DEFAULT_SHIFTS;
    } catch (e) {
      return DEFAULT_SHIFTS;
    }
  }

  static saveShifts(shifts) {
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
  }

  // Cutoffs
  static getCutoffs() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUTOFFS)) || [];
    } catch (e) {
      return [];
    }
  }

  static saveCutoffs(cutoffs) {
    localStorage.setItem(STORAGE_KEYS.CUTOFFS, JSON.stringify(cutoffs));
  }

  // Cash Advances (Vale)
  static getAdvances() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ADVANCES)) || [];
    } catch (e) {
      return [];
    }
  }

  static saveAdvances(advances) {
    localStorage.setItem(STORAGE_KEYS.ADVANCES, JSON.stringify(advances));
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

  // Leaves
  static getLeaves() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.LEAVES)) || [];
    } catch (e) {
      return [];
    }
  }

  static saveLeaves(leaves) {
    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(leaves));
  }

  static addLeave(leave) {
    const leaves = this.getLeaves();
    leaves.unshift(leave);
    this.saveLeaves(leaves);
  }

  // Device Config
  static getDeviceConfig() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.DEVICE_CONFIG));
    } catch (e) {
      return null;
    }
  }

  static saveDeviceConfig(config) {
    localStorage.setItem(STORAGE_KEYS.DEVICE_CONFIG, JSON.stringify(config));
  }

  // Payroll History
  static getPayrollHistory() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYROLL_HISTORY)) || [];
    } catch (e) {
      return [];
    }
  }

  static savePayrollHistory(history) {
    localStorage.setItem(STORAGE_KEYS.PAYROLL_HISTORY, JSON.stringify(history));
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
        snapshots = JSON.parse(localStorage.getItem('rons_payroll_autobackup_snapshots')) || [];
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

      localStorage.setItem('rons_payroll_autobackup_snapshots', JSON.stringify(snapshots));
      localStorage.setItem('rons_payroll_last_autobackup', new Date().toISOString());
    } catch (err) {
      console.warn("[DB] Auto backup snapshot warning:", err);
    }
  }

  static getAutoBackups() {
    try {
      return JSON.parse(localStorage.getItem('rons_payroll_autobackup_snapshots')) || [];
    } catch (e) {
      return [];
    }
  }

  static getFullBackupData(label = 'Manual Export') {
    return {
      version: '1.0',
      system: "Ron's Chicken Custom Payroll & Biometric Attendance System",
      branch: "Cugman Branch (Cagayan de Oro)",
      exportDate: new Date().toISOString(),
      label: label,
      payload: {
        employees: this.getEmployees(),
        shifts: this.getShifts(),
        cutoffs: this.getCutoffs(),
        advances: this.getAdvances(),
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
    downloadAnchor.setAttribute("download", `rons_chicken_cugman_payroll_backup_${dateStr}.json`);
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
      if (payload.settings) this.saveSettings(payload.settings);
      if (payload.payrollHistory) this.savePayrollHistory(payload.payrollHistory);
      if (payload.leaves) this.saveLeaves(payload.leaves);
      if (payload.deviceConfig) this.saveDeviceConfig(payload.deviceConfig);

      this.autoBackupSnapshot('Post-Restore Snapshot');
      return { success: true, message: `Successfully restored ${payload.employees.length} employees and records.` };
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
    localStorage.clear();
    this.init();
  }
}

// Auto-initialize on load
DB.init();
if (typeof DB.requestPersistentStorage === 'function') {
  DB.requestPersistentStorage().catch(() => {});
}
DB.autoBackupSnapshot('App Init Snapshot');

window.DB = DB;

