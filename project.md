# Ron's Chicken Custom Payroll & Biometric Attendance System

**Business Name:** Ron's Chicken (Lechon Manok & Liempo)  
**Branch:** Cugman Branch (Cagayan de Oro City, Misamis Oriental, Philippines)  
**Contact / Info:** 0928 775 6605 • [Facebook Page](https://www.facebook.com/pages/Rons-Chicken/1808066046182615)  
**Live Deployment (Vercel):** [https://rons-chicken-payroll.vercel.app](https://rons-chicken-payroll.vercel.app)  
**GitHub Repository:** [https://github.com/jasonvelasquez1410/rons-chicken-payroll](https://github.com/jasonvelasquez1410/rons-chicken-payroll)

---

## 1. Project Background & Objective

- **Current Biometric Hardware:** **Deli e3960** (Standalone biometric fingerprint attendance machine, non-WiFi).
- **Current Process:** Staff log in via the Deli e3960 machine. Attendance records are downloaded manually to a USB flash drive as an Excel spreadsheet (`cugman_(August)Employee Attendance Record.xls`).
- **Goal:** Provide a modern, offline-first Progressive Web Application (PWA) tailored for Ron's Chicken to ingest Deli e3960 USB attendance exports, automate DOLE/BIR compliant Philippine payroll calculations, offer a mobile staff self-service portal, and prepare for future internet-connected biometric devices.

---

## 2. System Architecture & Tech Stack

- **Frontend Core:** Pure HTML5, Vanilla Modern JavaScript (ES6+), Vanilla CSS (Zero heavy framework overhead).
- **Spreadsheet Ingestion:** Embedded SheetJS (`xlsx.full.min.js`) for 100% offline client-side parsing of `.xls`, `.xlsx`, and `.csv` files.
- **Persistence Layer (`js/db.js`):** LocalStorage & IndexedDB holding employee master records (31 staff preloaded), shift schedules, raw biometric punch logs, processed timecards, cutoffs, cash advance (vale) ledger, and settings.
- **PWA & Offline (`sw.js`, `manifest.json`):** Service Worker with Network-First strategy (v3) ensuring instant updates on Vercel and full offline availability when installed on Android, iOS, Windows, or Tablets.
- **Vercel Config (`vercel.json`):** Clean routing, manifest headers, and service worker caching headers.

---

## 3. Philippine DOLE & BIR Payroll Engine (`js/payroll-engine.js`)

- **Wage Rates:** Daily rate (₱438.00 – ₱480.00) / Hourly rate (`Daily Rate / 8`).
- **DOLE Overtime:** 125% regular OT premium for hours worked beyond 8 hours.
- **Night Shift Differential:** 10% premium for work between 10:00 PM and 6:00 AM (crucial for late-night roasting and early morning prep shifts).
- **Allowances & Incentives:** Daily meal/food allowance (₱50/day) and Roaster/Grillmaster performance incentives.
- **Statutory Deductions:**
  - **SSS:** Updated contribution schedule with semi-monthly cutoff splitting.
  - **PhilHealth:** 5% standard rate (2.5% EE share).
  - **Pag-IBIG (HDMF):** ₱100/cutoff (₱200/month).
  - **Withholding Tax:** TRAIN Law brackets (minimum wage earners ≤ ₱10,417 per cutoff are 100% exempt).
- **Cash Advance (Vale):** Integrated vale tracking and automated payroll deduction.
- **13th Month Pay Accrual:** Real-time calculation (`Basic Pay / 12`).

---

## 4. Deli e3960 Parser & Timekeeping Engine (`js/biometric-parser.js`)

- Ingests the matrix format exported by the Deli e3960 (`User ID:`, `Name:`, `Department:`, dates header `16, 17 ... 31, 1 ... 5`, and multi-line cell timestamps).
- Groups punches per date, calculates total elapsed work intervals, deducts 1-hour lunch break for shifts > 5 hours, handles overnight cross-midnight shifts, and computes tardiness and undertime against assigned shift schedules.

---

## 5. UI / UX Design: "Mi Nomina" Bento Grid Theme

- **Design Reference:** Inspired by the *Mi Nomina* luxury Bento Grid payroll aesthetic.
- **Signature Bento Cards:**
  - 🟧 **Vibrant Tangerine Orange (`#FF5500`):** Employee & Biometrics Management.
  - 🟪 **Electric Violet Purple (`#7928CA`):** Deli e3960 File Ingestion & Vale Ledger.
  - ⬜ **High-Contrast Pure White (`#FFFFFF`):** DOLE / BIR Payroll Management & Net Pay Disbursal.
  - ⬛ **Graphite Obsidian Glass:** Clean data panels and punch logs.
- **Real-Time Theme Brightness Slider:** Sun icon (`☀️`) dimmer in the header allowing users to slide smoothly between **Midnight (0%)**, **Dark (30%)**, **Ambient (65%)**, and **Bright Light Mode (100%)** with `localStorage` persistence.
- **1-Click Batch Payslip Generator:** Manager can generate and batch-print all 31 employee payslips in one continuous document.
- **Staff Mobile PWA Portal:** Mobile-optimized self-service view with digital ID, mobile geofenced punch simulation, daily attendance logs, and personal payslips.

---

## 6. Directory File Structure

```
📁 Ron's Chickent Custom Payroll System/
├── 📄 project.md                       # Project master documentation (this file)
├── 📄 README.md                        # Deployment & GitHub instructions
├── 📄 index.html                       # Application shell (Manager & Staff PWA portals)
├── 📄 manifest.json                    # Web App Manifest for mobile/desktop install
├── 📄 sw.js                            # Service Worker v3 (Network-First offline caching)
├── 📄 vercel.json                      # Vercel deployment configuration
├── 📄 cugman_(August)Employee Attendance Record.xls # Real Deli e3960 attendance source
├── 📁 assets/
│   └── 🖼️ logo.jpg                     # Official Ron's Chicken logo
├── 📁 css/
│   └── 🎨 style.css                    # Mi Nomina Bento Grid & Brightness Dimmer CSS
└── 📁 js/
    ├── ⚙️ db.js                        # Offline database with preloaded 31 Cugman staff
    ├── ⏱️ biometric-parser.js          # Deli e3960 multi-punch Excel parser & timecards
    ├── 💰 payroll-engine.js           # Philippine DOLE/BIR compliant payroll engine
    ├── 📡 device-sync.js              # Hardware USB config & Cloud push simulator
    └── 🚀 app.js                      # Application controller, payslip generator & events
```

---

## 7. Useful Git & Maintenance Commands

```bash
# Push updates to GitHub & auto-deploy to Vercel:
git add .
git commit -m "Update message"
git push origin main
```
