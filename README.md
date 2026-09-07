# Ron's Chicken - Custom Biometric Payroll & Timekeeping PWA

A custom Progressive Web Application (PWA) built specifically for **Ron's Chicken (Lechon Manok & Liempo - Cugman Branch, Cagayan de Oro)**.

---

## 🚀 Key Features

- **Deli e3960 Biometric USB Parser**: Directly drag & drop or upload `.xls` files downloaded via USB flash drive from the Deli e3960 biometric attendance device (e.g. `cugman_(August)Employee Attendance Record.xls`).
- **Philippine DOLE & BIR Compliant Payroll**:
  - Overtime Pay (125% regular OT)
  - Night Shift Differential (10% premium for 10:00 PM – 6:00 AM roasting operations)
  - Statutory Deductions: SSS, PhilHealth (5%), Pag-IBIG (₱100/cutoff)
  - Cash Advance (*Vale*) tracking & automated deduction
  - Daily Meal / Food Allowances (₱50/day) & Grillmaster incentives
  - 13th Month Pay real-time accrual tracking
- **Staff Self-Service Mobile PWA**: Staff can install the app on Android/iPhone, view their daily punch logs, check estimated net take-home pay, and view official printable payslips.
- **Future Cloud Sync Ready**: Built-in Network/ADMS Cloud Push configuration ready when upgrading to a WiFi/Ethernet biometric device.

---

## 📦 How to Upload to GitHub and Deploy to Vercel

### Option A: Create a Standalone GitHub Repository (Recommended)

1. Open your terminal in this folder:
   ```bash
   cd "c:\Users\USER\Documents\Programming Folder Rep\Ron's Chickent Custom Payroll System"
   ```

2. Initialize a dedicated git repo:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Ron's Chicken Custom Biometric Payroll PWA"
   ```

3. Create a new repository on [GitHub](https://github.com/new) named `rons-chicken-payroll`.

4. Link and push to GitHub:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/rons-chicken-payroll.git
   git push -u origin main
   ```

5. Deploy to [Vercel](https://vercel.com/):
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click **Import** next to your `rons-chicken-payroll` repository.
   - Framework Preset: **Other** (Pure HTML/CSS/JS).
   - Click **Deploy**.
   - Your PWA will be live at `https://rons-chicken-payroll.vercel.app`!

---

### Option B: Deploy Directly via Vercel CLI

If you have `vercel` CLI installed:
```bash
npx vercel
```
Follow the interactive prompts to deploy in seconds!
