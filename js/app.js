/**
 * Ron's Chicken Custom Payroll & Biometric Attendance System
 * "Mi Nomina" Bento Grid Theme & Interactive PWA Controller
 * with Real-Time Theme Brightness Slider & Batch Payslip Generator
 */

let currentView = 'dashboard';
let currentMode = 'manager'; // 'manager' | 'staff'
let selectedStaffEmployeeId = 12; // Default to Argie Daliva (Senior Roaster)
let activeCutoff = null;
let cachedPayrollSummary = null;
let currentBrightness = parseInt(localStorage.getItem('rons_payroll_brightness') || '0', 10);

// SVG Icons
const ICONS = {
  dashboard: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="2"></rect><rect x="14" y="3" width="7" height="7" rx="2"></rect><rect x="14" y="14" width="7" height="7" rx="2"></rect><rect x="3" y="14" width="7" height="7" rx="2"></rect></svg>`,
  employee: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
  payroll: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>`,
  receipt: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"></path><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 17.5v-11"></path></svg>`,
  folder: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
  fingerprint: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4"></path><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"></path><path d="M17.29 21.02c.12-.6.41-2.3.41-4.02 0-3.4-2.7-6-6-6s-6 2.6-6 6c0 .52.05 1.01.14 1.48"></path><path d="M12 10a2 2 0 0 0-2 2c0 1.9.4 3.7.8 5.2"></path><path d="M9 12a3 3 0 0 1 6 0c0 1.6-.3 3.3-.8 4.8"></path></svg>`,
  upload: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>`,
  download: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`,
  print: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>`,
  check: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  settings: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
  sun: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
  book: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`
};

function initApp() {
  try {
    if (window.DB && typeof window.DB.init === 'function') {
      window.DB.init();
    }
    applyBrightness(currentBrightness);

    // Enforce Manager Portal (Staff smartphone punching disabled per store policy)
    currentMode = 'manager';

    const cutoffs = (window.DB && typeof window.DB.getCutoffs === 'function') ? window.DB.getCutoffs() : [];
    activeCutoff = (cutoffs && cutoffs.length > 0) ? cutoffs[0] : {
      id: "CO-2026-08-2",
      name: "August 16 - September 05, 2026 (Cugman Attendance)",
      startDate: "2026-08-16",
      endDate: "2026-09-05"
    };

    if (window.PayrollEngine && typeof window.PayrollEngine.runBranchPayroll === 'function') {
      cachedPayrollSummary = window.PayrollEngine.runBranchPayroll(activeCutoff);
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  } catch (err) {
    console.error("[Ron's Payroll] Init Error:", err);
  }

  renderApp();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

function applyBrightness(level) {
  currentBrightness = level;
  document.documentElement.style.setProperty('--brightness-level', level);
  localStorage.setItem('rons_payroll_brightness', level);
  const label = document.getElementById('brightness-label');
  if (label) {
    if (level <= 15) label.textContent = 'Midnight';
    else if (level <= 45) label.textContent = 'Dark';
    else if (level <= 75) label.textContent = 'Ambient';
    else label.textContent = 'Bright';
  }
}

function handleBrightnessChange(e) {
  applyBrightness(parseInt(e.target.value, 10));
}

function setMode(mode) {
  currentMode = mode;
  renderApp();
}

function navigateTo(view) {
  currentView = view;
  renderApp();
}

function renderApp() {
  const container = document.getElementById('app-root');
  if (!container) return;

  if (currentMode === 'staff') {
    container.innerHTML = renderStaffBentoPortal();
  } else {
    container.innerHTML = `
      <!-- Header with Brightness Slider -->
      <header class="app-header">
        <div class="brand-wrapper" onclick="navigateTo('dashboard')">
          <div class="brand-icon-monogram">Σ</div>
          <div class="brand-text">
            <div class="brand-title">RON'S CHICKEN <span>PAYROLL</span></div>
            <div class="brand-sub">Cugman Branch • Deli e3960 Biometrics</div>
          </div>
        </div>

        <div class="header-controls">
          <button class="btn-bento btn-bento-dark btn-sm" style="padding: 0.45rem 0.85rem; font-size: 0.78rem; display: inline-flex; align-items: center; gap: 0.4rem;" onclick="openModal('guide-modal')" title="View Owner / Admin DOLE & System Guide">
            ${ICONS.book} Reference Guide
          </button>

          <!-- Real-Time Theme Brightness Slider -->
          <div class="brightness-control-pill" title="Adjust Theme Brightness / Lighting">
            ${ICONS.sun}
            <input type="range" class="brightness-slider" id="theme-brightness-slider" min="0" max="100" value="${currentBrightness}" oninput="handleBrightnessChange(event)">
            <span id="brightness-label" style="min-width: 46px;">${getBrightnessName(currentBrightness)}</span>
          </div>

          <div class="pill pill-orange" style="font-size: 0.78rem; font-weight: 700; padding: 0.45rem 0.85rem; display: inline-flex; align-items: center; gap: 0.4rem;">
            ${ICONS.dashboard} Manager Portal
          </div>
        </div>
      </header>

      <!-- Main Bento Layout -->
      <main class="bento-container">
        ${renderManagerBentoView()}
      </main>

      <!-- Floating Bottom Navigation -->
      <nav class="bottom-floating-nav">
        <div class="bottom-nav-item ${currentView === 'dashboard' ? 'active' : ''}" onclick="navigateTo('dashboard')">
          ${ICONS.dashboard}
          <span>Overview</span>
        </div>
        <div class="bottom-nav-item ${currentView === 'attendance' ? 'active' : ''}" onclick="navigateTo('attendance')">
          ${ICONS.fingerprint}
          <span>Attendance</span>
        </div>
        <div class="bottom-nav-item ${currentView === 'payroll' ? 'active' : ''}" onclick="navigateTo('payroll')">
          ${ICONS.payroll}
          <span>Payroll</span>
        </div>
        <div class="bottom-nav-item ${currentView === 'advances' ? 'active' : ''}" onclick="navigateTo('advances')">
          ${ICONS.receipt}
          <span>Vale Ledger</span>
        </div>
        <div class="bottom-nav-item ${currentView === 'device' ? 'active' : ''}" onclick="navigateTo('device')">
          ${ICONS.settings}
          <span>Deli e3960</span>
        </div>
        <div class="bottom-nav-item" onclick="openModal('guide-modal')">
          ${ICONS.book}
          <span>Guide</span>
        </div>
      </nav>

      <!-- Upload Modal -->
      <div id="upload-modal" class="modal-backdrop">
        <div class="modal-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <h3 style="color: var(--text-primary); font-size: 1.25rem;">Import Deli e3960 USB Biometric File</h3>
            <button class="btn-bento btn-bento-dark btn-sm" onclick="closeModal('upload-modal')">✕</button>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
            Upload the <code>Employee Attendance Record.xls</code> exported to your USB drive from the Deli e3960 biometric attendance device.
          </p>
          <div style="border: 2px dashed rgba(255, 85, 0, 0.4); border-radius: var(--radius-md); padding: 2.5rem 1.5rem; text-align: center; background: rgba(255, 85, 0, 0.04); cursor: pointer;"
               onclick="document.getElementById('excel-file-input').click()">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--bento-orange); color: #fff; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; box-shadow: 0 4px 16px var(--bento-orange-glow);">
              ${ICONS.upload}
            </div>
            <h4 style="color: var(--text-primary); margin-bottom: 0.3rem;">Click or Drag & Drop Excel File</h4>
            <p style="font-size: 0.8rem; color: var(--text-muted);">Supports .xls, .xlsx, and .csv from Deli e3960 & ZKTeco</p>
            <input type="file" id="excel-file-input" style="display: none;" accept=".xls,.xlsx,.csv" onchange="handleFileSelected(event)">
          </div>
          <div id="upload-status" style="margin-top: 1rem; font-size: 0.85rem; text-align: center;"></div>
        </div>
      </div>

      <!-- Cash Advance / Vale / Loan Modal -->
      <div id="advance-modal" class="modal-backdrop">
        <div class="modal-card" style="max-width: 580px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <h3 style="color: var(--text-primary); font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
              ${ICONS.receipt} Add Staff Vale / Loan / Deduction
            </h3>
            <button class="btn-bento btn-bento-dark btn-sm" onclick="closeModal('advance-modal')">✕</button>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
            Add a cash advance, emergency loan, or custom deduction. It will automatically deduct from their gross pay and itemize on their payslip.
          </p>

          <form id="advance-form" onsubmit="handleSaveAdvance(event)">
            <div style="display: grid; gap: 1rem;">
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.4rem; color: var(--text-secondary);">Select Employee</label>
                <select id="adv-employee-id" required style="width: 100%; padding: 0.75rem 1rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 0.9rem;">
                  ${window.DB.getEmployees().map(e => `
                    <option value="${e.id}">#${e.id} ${e.name} (${e.position || e.department})</option>
                  `).join('')}
                </select>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.4rem; color: var(--text-secondary);">Deduction Type</label>
                  <select id="adv-type" style="width: 100%; padding: 0.75rem 1rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 0.9rem;">
                    <option value="Cash Advance (Vale)">Cash Advance (Vale)</option>
                    <option value="Emergency Staff Loan">Emergency Staff Loan</option>
                    <option value="Uniform / Equipment">Uniform / Equipment</option>
                    <option value="Meal / Food Vale">Meal / Food Vale</option>
                    <option value="Other Custom Deduction">Other Custom Deduction</option>
                  </select>
                </div>

                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.4rem; color: var(--text-secondary);">Date Issued</label>
                  <input type="date" id="adv-date" required value="${new Date().toISOString().split('T')[0]}" style="width: 100%; padding: 0.75rem 1rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 0.9rem;">
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.4rem; color: var(--text-secondary);">Total Amount (₱)</label>
                  <input type="number" id="adv-amount" min="1" step="0.5" required placeholder="e.g. 500" style="width: 100%; padding: 0.75rem 1rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 0.9rem;">
                </div>

                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.4rem; color: var(--text-secondary);">Deduction per Cutoff (₱)</label>
                  <input type="number" id="adv-cutoff-deduct" min="1" step="0.5" placeholder="Leave blank for full" style="width: 100%; padding: 0.75rem 1rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 0.9rem;">
                </div>
              </div>

              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.4rem; color: var(--text-secondary);">Reason / Remarks</label>
                <input type="text" id="adv-reason" placeholder="e.g. Medicine, Family emergency, Motorcycle gas vale" style="width: 100%; padding: 0.75rem 1rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 0.9rem;">
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem;">
                <button type="button" class="btn-bento btn-bento-dark" onclick="closeModal('advance-modal')">Cancel</button>
                <button type="submit" class="btn-bento btn-bento-orange" style="font-weight: 800;">${ICONS.check} Save & Deduct in Payroll</button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Employee Profile & Statutory Details Modal -->
      <div id="employee-modal" class="modal-backdrop">
        <div class="modal-card" style="max-width: 680px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <h3 style="color: var(--text-primary); font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
              ${ICONS.employee} Staff Profile & Statutory Deduction Settings
            </h3>
            <button class="btn-bento btn-bento-dark btn-sm" onclick="closeModal('employee-modal')">✕</button>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
            Configure staff wage rates, daily meal allowances, and government statutory deduction numbers (SSS, PhilHealth, Pag-IBIG, TIN) or custom deduction amounts.
          </p>

          <form id="employee-form" onsubmit="handleSaveEmployee(event)">
            <input type="hidden" id="emp-edit-id">

            <div style="display: grid; gap: 1.25rem;">
              <!-- Employee Switcher -->
              <div style="background: var(--bg-surface); padding: 0.75rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
                <label style="font-size: 0.82rem; font-weight: 700; color: var(--text-primary); white-space: nowrap;">Active Staff Member:</label>
                <select id="emp-select-switcher" onchange="handleEmployeeSelectChange(this.value)" style="flex: 1; padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); background: var(--bg-card-dark); border: 1px solid var(--border-glass); color: var(--text-primary); font-size: 0.85rem;">
                  ${window.DB.getEmployees().map(e => `
                    <option value="${e.id}">#${e.id} ${e.name} (${e.position || e.department})</option>
                  `).join('')}
                </select>
              </div>

              <!-- Section 1: Basic Employment & Wage -->
              <div>
                <div style="font-size: 0.8rem; font-weight: 800; color: var(--bento-orange); text-transform: uppercase; margin-bottom: 0.6rem; letter-spacing: 0.05em;">
                  1. Wage & Employment Details
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;">
                  <div>
                    <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.3rem; color: var(--text-secondary);">Full Name</label>
                    <input type="text" id="emp-name" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 0.85rem;">
                  </div>
                  <div>
                    <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.3rem; color: var(--text-secondary);">Position / Role</label>
                    <input type="text" id="emp-position" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 0.85rem;">
                  </div>
                  <div>
                    <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.3rem; color: var(--text-secondary);">Daily Wage Rate (₱)</label>
                    <input type="number" id="emp-daily-rate" step="0.5" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 0.85rem;">
                  </div>
                  <div>
                    <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.3rem; color: var(--text-secondary);">Daily Meal Allowance (₱)</label>
                    <input type="number" id="emp-allowance" step="0.5" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 0.85rem;">
                  </div>
                </div>
              </div>

              <!-- Section 2: Statutory Numbers & Contribution Settings -->
              <div>
                <div style="font-size: 0.8rem; font-weight: 800; color: #a855f7; text-transform: uppercase; margin-bottom: 0.6rem; letter-spacing: 0.05em;">
                  2. Philippine Statutory Contributions (DOLE / BIR)
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;">
                  <div>
                    <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.3rem; color: var(--text-secondary);">SSS Number</label>
                    <input type="text" id="emp-sss-no" placeholder="34-10000000-1" style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 0.85rem;">
                  </div>
                  <div>
                    <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.3rem; color: var(--text-secondary);">SSS Deduction (₱/Cutoff or Blank for Auto Table)</label>
                    <input type="number" id="emp-sss-custom" step="0.5" placeholder="Auto DOLE table" style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 0.85rem;">
                  </div>

                  <div>
                    <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.3rem; color: var(--text-secondary);">PhilHealth Number</label>
                    <input type="text" id="emp-philhealth-no" placeholder="12-200000000-3" style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 0.85rem;">
                  </div>
                  <div>
                    <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.3rem; color: var(--text-secondary);">PhilHealth Deduction (₱/Cutoff or Blank for Auto 5%)</label>
                    <input type="number" id="emp-philhealth-custom" step="0.5" placeholder="Auto 5% (2.5% EE)" style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 0.85rem;">
                  </div>

                  <div>
                    <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.3rem; color: var(--text-secondary);">Pag-IBIG (HDMF) Number</label>
                    <input type="text" id="emp-pagibig-no" placeholder="1210-30000000-4" style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 0.85rem;">
                  </div>
                  <div>
                    <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.3rem; color: var(--text-secondary);">Pag-IBIG Deduction (₱/Cutoff or Blank for ₱100)</label>
                    <input type="number" id="emp-pagibig-custom" step="0.5" placeholder="Standard ₱100.00" style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 0.85rem;">
                  </div>

                  <div>
                    <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.3rem; color: var(--text-secondary);">TIN (Tax ID Number)</label>
                    <input type="text" id="emp-tin-no" placeholder="400-500000-000" style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 0.85rem;">
                  </div>
                  <div style="display: flex; align-items: center; gap: 0.75rem; padding-top: 1.2rem; flex-wrap: wrap;">
                    <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; color: var(--text-primary); cursor: pointer;">
                      <input type="checkbox" id="emp-sss-exempt"> Exempt SSS
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; color: var(--text-primary); cursor: pointer;">
                      <input type="checkbox" id="emp-phic-exempt"> Exempt PHIC
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; color: var(--text-primary); cursor: pointer;">
                      <input type="checkbox" id="emp-hdmf-exempt"> Exempt HDMF
                    </label>
                  </div>
                </div>
              </div>

              <!-- Statutory Quick Reference Box for Admin/Owner -->
              <div style="background: rgba(255, 85, 0, 0.05); border: 1px solid rgba(255, 85, 0, 0.2); border-radius: var(--radius-sm); padding: 0.85rem 1rem; font-size: 0.76rem; color: var(--text-secondary); line-height: 1.55;">
                <div style="font-weight: 800; color: var(--bento-orange); margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.4rem;">
                  ℹ️ Statutory Deduction Quick Reference (DOLE / BIR):
                </div>
                <ul style="padding-left: 1.15rem; margin: 0;">
                  <li><strong>SSS:</strong> If blank, automatically calculates exact semi-monthly EE share from the official DOLE/SSS table using <code>Daily Rate × 26</code> (~₱258.75 for ₱438/day). Type an amount only if overriding with a custom fixed deduction.</li>
                  <li><strong>PhilHealth (PHIC):</strong> If blank, automatically applies the statutory 5% premium (2.5% Employee share split semi-monthly = ~₱143.00).</li>
                  <li><strong>Pag-IBIG (HDMF):</strong> If blank, automatically applies standard statutory ₱100.00 per cutoff (₱200/month).</li>
                  <li><strong>Withholding Tax:</strong> Minimum wage earners earning ≤ ₱10,417 per cutoff are 100% Tax Exempt under TRAIN Law (₱0.00 tax).</li>
                  <li><strong>Exemption Checkboxes:</strong> Check "Exempt" if a worker is under probation, apprentice, or pays voluntary contributions outside the branch.</li>
                </ul>
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem;">
                <button type="button" class="btn-bento btn-bento-dark" onclick="closeModal('employee-modal')">Cancel</button>
                <button type="submit" class="btn-bento btn-bento-orange" style="font-weight: 800;">${ICONS.check} Save Staff & Update Payroll</button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Payslip Printable Modal -->
      <div id="payslip-modal" class="modal-backdrop">
        <div class="modal-card" style="max-width: 760px; background: transparent; border: none; box-shadow: none;">
          <div style="display: flex; justify-content: flex-end; margin-bottom: 0.75rem; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn-bento btn-bento-orange btn-sm" onclick="window.print()">${ICONS.print} Print / Save PDF</button>
            <button class="btn-bento btn-bento-white btn-sm" onclick="closeModal('payslip-modal')">Close</button>
          </div>
          <div id="payslip-printable-content" class="payslip-printable"></div>
        </div>
      </div>

      <!-- Comprehensive System Reference & DOLE Guide Modal -->
      <div id="guide-modal" class="modal-backdrop">
        <div class="modal-card" style="max-width: 820px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <h3 style="color: var(--text-primary); font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
              📘 Ron's Chicken Payroll & DOLE System Reference Guide
            </h3>
            <button class="btn-bento btn-bento-dark btn-sm" onclick="closeModal('guide-modal')">✕</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 1.25rem; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">
            
            <!-- Section 1 -->
            <div style="background: var(--bg-surface); padding: 1.25rem; border-radius: var(--radius-md); border-left: 4px solid var(--bento-orange);">
              <h4 style="color: var(--text-primary); margin-bottom: 0.4rem; font-size: 0.95rem; font-weight: 800;">1. Biometric Attendance Ingestion (Deli e3960 USB)</h4>
              <p>The system features 100% offline client-side parsing powered by SheetJS to process raw biometric matrices exported by your standalone Deli e3960 fingerprint attendance machine.</p>
              <ul style="padding-left: 1.2rem; margin-top: 0.4rem;">
                <li><strong>USB Flash Drive Export:</strong> Insert a USB drive into the Deli e3960, download the attendance report (e.g. <code>Employee Attendance Record.xls</code>), and upload it here.</li>
                <li><strong>Automated Calculation:</strong> The parser groups multi-punch timestamps per date, applies shift schedules, automatically deducts a 1-hour lunch break for shifts over 5 hours, and calculates tardiness & overtime.</li>
              </ul>
            </div>

            <!-- Section 2 -->
            <div style="background: var(--bg-surface); padding: 1.25rem; border-radius: var(--radius-md); border-left: 4px solid #a855f7;">
              <h4 style="color: var(--text-primary); margin-bottom: 0.4rem; font-size: 0.95rem; font-weight: 800;">2. Philippine DOLE & BIR Statutory Payroll Rules</h4>
              <ul style="padding-left: 1.2rem; margin-top: 0.4rem;">
                <li><strong>Basic Pay:</strong> Computed as <code>(Daily Rate / 8) × Regular Hours Worked</code>.</li>
                <li><strong>Overtime Pay (125%):</strong> Hours worked beyond 8 hours are compensated at <code>125% × Hourly Rate</code> per DOLE rules.</li>
                <li><strong>Night Shift Differential (10%):</strong> Work between <strong>10:00 PM and 6:00 AM</strong> receives an additional 10% premium (essential for night roasting and early morning prep).</li>
                <li><strong>Daily Meal Allowance:</strong> Standard ₱50.00/day for each day the employee is present.</li>
                <li><strong>13th Month Pay Accrual:</strong> Accrued continuously on each cutoff at <code>Basic Pay ÷ 12</code>.</li>
              </ul>
            </div>

            <!-- Section 3 -->
            <div style="background: var(--bg-surface); padding: 1.25rem; border-radius: var(--radius-md); border-left: 4px solid var(--accent-emerald);">
              <h4 style="color: var(--text-primary); margin-bottom: 0.4rem; font-size: 0.95rem; font-weight: 800;">3. Automatic Statutory Deductions (SSS, PhilHealth, Pag-IBIG, Tax)</h4>
              <ul style="padding-left: 1.2rem; margin-top: 0.4rem;">
                <li><strong>SSS:</strong> Computed automatically from the official DOLE/SSS table using the employee's monthly equivalent rate (<code>Daily Rate × 26</code>). Split semi-monthly.</li>
                <li><strong>PhilHealth (PHIC):</strong> Standard statutory 5% premium (2.5% Employee share, semi-monthly).</li>
                <li><strong>Pag-IBIG (HDMF):</strong> Standard statutory ₱100.00 per cutoff (₱200/month).</li>
                <li><strong>Withholding Tax:</strong> Evaluated using the BIR TRAIN Law table. Minimum wage earners earning ≤ ₱10,417 per cutoff are <strong>100% Tax Exempt</strong> (₱0.00 tax).</li>
                <li><strong>Custom Amounts:</strong> Leaving the statutory boxes blank triggers automatic legal calculations. If your store has a specific agreed fixed deduction, simply type the number to override it.</li>
              </ul>
            </div>

            <!-- Section 4 -->
            <div style="background: var(--bg-surface); padding: 1.25rem; border-radius: var(--radius-md); border-left: 4px solid var(--accent-rose);">
              <h4 style="color: var(--text-primary); margin-bottom: 0.4rem; font-size: 0.95rem; font-weight: 800;">4. Cash Advances (*Vale*) & Emergency Staff Loans</h4>
              <p>When an employee requests an advance, navigate to the <strong>Vale Ledger</strong> and click <strong>+ New Vale / Loan Entry</strong>:</p>
              <ul style="padding-left: 1.2rem; margin-top: 0.4rem;">
                <li>Select the employee, enter the total amount (e.g. ₱1,000.00), and specify the cutoff deduction (e.g. ₱500/cutoff to split over 2 cutoffs, or leave blank for full deduction).</li>
                <li>The system immediately recalculates payroll and itemizes the exact loan deduction on their official payslip.</li>
              </ul>
            </div>

            <!-- Section 5 -->
            <div style="background: var(--bg-surface); padding: 1.25rem; border-radius: var(--radius-md); border-left: 4px solid #3b82f6;">
              <h4 style="color: var(--text-primary); margin-bottom: 0.4rem; font-size: 0.95rem; font-weight: 800;">5. Physical Biometric Attendance Policy (Mobile Clock-In Disabled)</h4>
              <p><strong>Mobile smartphone check-in is strictly disabled.</strong> In accordance with store policy, staff must physically report in person to the Cugman branch and punch in/out on the physical Deli e3960 fingerprint biometric machine.</p>
              <ul style="padding-left: 1.2rem; margin-top: 0.4rem;">
                <li><strong>No Remote Punching:</strong> To guarantee full attendance accountability and prevent time theft or buddy punching, attendance cannot be logged via mobile phones.</li>
                <li><strong>Verified Records:</strong> All attendance records originate from the Deli e3960 attendance export, ensuring 100% verified payroll computations.</li>
              </ul>
            </div>

          </div>

          <div style="display: flex; justify-content: flex-end; margin-top: 1.5rem;">
            <button class="btn-bento btn-bento-orange" onclick="closeModal('guide-modal')">Got it / Close Guide</button>
          </div>
        </div>
      </div>
    `;
  }
}

function getBrightnessName(level) {
  if (level <= 15) return 'Midnight';
  if (level <= 45) return 'Dark';
  if (level <= 75) return 'Ambient';
  return 'Bright';
}

function renderManagerBentoView() {
  switch (currentView) {
    case 'attendance':
      return renderBentoAttendance();
    case 'payroll':
      return renderBentoPayroll();
    case 'advances':
      return renderBentoAdvances();
    case 'device':
      return renderBentoDevice();
    case 'dashboard':
    default:
      return renderManagerBentoDashboard();
  }
}

/* ==========================================================================
   Manager Bento Dashboard & Views
   ========================================================================== */

function renderManagerBentoDashboard() {
  const employees = window.DB.getEmployees();
  const summary = cachedPayrollSummary || window.PayrollEngine.runBranchPayroll(activeCutoff);

  return `
    <!-- Top Welcome Banner -->
    <div class="user-welcome-banner">
      <div class="user-welcome-info">
        <div class="user-avatar-circle">RC</div>
        <div class="user-welcome-text">
          <h1>Welcome, Branch Manager</h1>
          <p>Ron's Chicken Cugman • Cutoff: ${activeCutoff.name}</p>
        </div>
      </div>
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <button class="btn-bento btn-bento-purple" onclick="openEmployeeModal()">
          ${ICONS.employee} Staff & Statutory
        </button>
        <button class="btn-bento btn-bento-white" onclick="generateAllBatchPayslips()">
          ${ICONS.print} Batch Print All Payslips (31 Staff)
        </button>
        <button class="btn-bento btn-bento-orange" onclick="openUploadModal()">
          ${ICONS.upload} Import Deli e3960 .xls
        </button>
      </div>
    </div>

    <!-- Mi Nomina Bento Grid Cards -->
    <div class="bento-grid">
      
      <!-- Big Orange Bento Card: Employee Management -->
      <div class="bento-card bento-orange col-7" onclick="openEmployeeModal()" style="cursor: pointer;">
        <div class="bento-card-header">
          <div class="bento-badge-circle">${ICONS.employee}</div>
          <span class="bento-tag">31 Active Staff</span>
        </div>
        <div>
          <div class="bento-value">${employees.length} Staff</div>
          <div class="bento-title">Staff & Statutory Management</div>
          <div class="bento-meta" style="margin-top: 0.4rem;">Configure SSS, PhilHealth, Pag-IBIG, TIN, and daily wage rates</div>
        </div>
      </div>

      <!-- Electric Purple Bento Card: File & USB Ingestion -->
      <div class="bento-card bento-purple col-5" onclick="openUploadModal()">
        <div class="bento-card-header">
          <div class="bento-badge-circle">${ICONS.folder}</div>
          <span class="bento-tag">Deli e3960 USB</span>
        </div>
        <div>
          <div class="bento-value">USB .XLS</div>
          <div class="bento-title">File Management</div>
          <div class="bento-meta" style="margin-top: 0.4rem;">Import attendance records directly from USB flash drive</div>
        </div>
      </div>

      <!-- High Contrast White Bento Card: Payroll Management & Payslips Generator -->
      <div class="bento-card bento-white col-7" onclick="navigateTo('payroll')">
        <div class="bento-card-header">
          <div class="bento-badge-circle">${ICONS.payroll}</div>
          <span class="bento-tag" style="background: #111827; color: #fff;">DOLE / BIR Compliant</span>
        </div>
        <div>
          <div class="bento-value" style="color: #000;">₱${summary.totals.net.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div class="bento-title" style="color: #000;">Payroll Management & Payslips</div>
          <div class="bento-meta" style="color: #4b5563; margin-top: 0.4rem;">
            Gross: ₱${summary.totals.gross.toLocaleString('en-US', { minimumFractionDigits: 2 })} • Click to generate and print payslips
          </div>
        </div>
      </div>

      <!-- Electric Purple Bento Card: Expenses & Vale Management -->
      <div class="bento-card bento-purple col-5" onclick="navigateTo('advances')">
        <div class="bento-card-header">
          <div class="bento-badge-circle">${ICONS.receipt}</div>
          <span class="bento-tag">Vale Ledger</span>
        </div>
        <div>
          <div class="bento-value">₱1,250.00</div>
          <div class="bento-title">Expenses & Vale</div>
          <div class="bento-meta" style="margin-top: 0.4rem;">Staff cash advances & emergency loans deduction</div>
        </div>
      </div>

    </div>

    <!-- Active Attendance Table Section with Direct Payslip Generator Buttons -->
    <div class="data-panel-card" style="margin-top: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
        <h3 style="color: var(--text-primary); font-size: 1.2rem; display: flex; align-items: center; gap: 0.5rem;">
          ${ICONS.fingerprint} Deli e3960 Attendance Summary (${activeCutoff.name})
        </h3>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn-bento btn-bento-purple btn-sm" onclick="openEmployeeModal()">
            ${ICONS.employee} Staff & Statutory
          </button>
          <button class="btn-bento btn-bento-orange btn-sm" onclick="generateAllBatchPayslips()">
            ${ICONS.print} Generate All Payslips
          </button>
          <button class="btn-bento btn-bento-dark btn-sm" onclick="navigateTo('payroll')">Full Payroll Table →</button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table-bento">
          <thead>
            <tr>
              <th>ID</th>
              <th>Employee Name</th>
              <th>Department / Role</th>
              <th>Days Present</th>
              <th>Total Hours</th>
              <th>Overtime</th>
              <th>Night Diff</th>
              <th>Net Pay</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${summary.records.filter(r => r.timecardSummary.daysPresent > 0).slice(0, 8).map(r => `
              <tr>
                <td><strong>#${r.employeeId}</strong></td>
                <td style="font-weight: 700; color: var(--text-primary);">${r.employeeName}</td>
                <td><span class="pill ${r.department === 'OPERATION' ? 'pill-orange' : 'pill-purple'}">${r.position}</span></td>
                <td><strong>${r.timecardSummary.daysPresent}</strong> days</td>
                <td>${r.timecardSummary.totalRegularHours} hrs</td>
                <td><span style="color: var(--bento-orange); font-weight: 700;">${r.timecardSummary.totalOtHours}h</span></td>
                <td><span style="color: #a855f7; font-weight: 700;">${r.timecardSummary.totalNightDiffHours}h</span></td>
                <td style="font-weight: 800; color: var(--accent-emerald);">₱${r.netPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td>
                  <div style="display: flex; gap: 0.35rem;">
                    <button class="btn-bento btn-bento-orange btn-sm" style="font-weight: 800; padding: 0.3rem 0.6rem;" onclick="showEmployeePayslip(${r.employeeId})">
                      ${ICONS.print} Payslip
                    </button>
                    <button class="btn-bento btn-bento-dark btn-sm" style="font-size: 0.72rem; padding: 0.3rem 0.5rem;" onclick="openEmployeeModal(${r.employeeId})" title="Edit Staff & Statutory Settings">
                      ⚙️
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderBentoAttendance() {
  const employees = window.DB.getEmployees();
  const shifts = window.DB.getShifts();

  return `
    <div class="user-welcome-banner">
      <div>
        <h1 style="color: var(--text-primary); font-size: 1.75rem;">Biometric Timekeeping Matrix</h1>
        <p style="color: var(--text-secondary);">Deli e3960 USB Attendance Logs • 31 Cugman Employees</p>
      </div>
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <button class="btn-bento btn-bento-purple" onclick="openEmployeeModal()">${ICONS.employee} Staff & Statutory</button>
        <button class="btn-bento btn-bento-white" onclick="generateAllBatchPayslips()">${ICONS.print} Generate All Payslips</button>
        <button class="btn-bento btn-bento-dark" onclick="exportAttendanceCSV()">${ICONS.download} Export CSV</button>
        <button class="btn-bento btn-bento-orange" onclick="openUploadModal()">${ICONS.upload} Ingest USB .xls</button>
      </div>
    </div>

    <div class="data-panel-card">
      <div class="table-responsive">
        <table class="table-bento">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Total Logs</th>
              <th>Days Present</th>
              <th>Reg. Hours</th>
              <th>OT (125%)</th>
              <th>Night Diff (10%)</th>
              <th>Late</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${employees.map(emp => {
              const tc = window.BiometricParser.calculateTimecard(emp, activeCutoff.startDate, activeCutoff.endDate, shifts);
              const punchCount = (emp.attendanceLogs || []).length;
              return `
                <tr>
                  <td><strong>#${emp.id}</strong></td>
                  <td style="font-weight: 700; color: var(--text-primary);">${emp.name}</td>
                  <td><span class="pill ${emp.department === 'OPERATION' ? 'pill-orange' : 'pill-purple'}">${emp.department}</span></td>
                  <td>${punchCount} punches</td>
                  <td><strong>${tc.daysPresent}</strong></td>
                  <td>${tc.totalRegularHours} hrs</td>
                  <td><span style="color: var(--bento-orange); font-weight: 700;">${tc.totalOtHours}h</span></td>
                  <td><span style="color: #a855f7; font-weight: 700;">${tc.totalNightDiffHours}h</span></td>
                  <td>${tc.totalLateMinutes > 0 ? `<span style="color: var(--accent-rose);">${tc.totalLateMinutes}m</span>` : '0m'}</td>
                  <td>
                    <div style="display: flex; gap: 0.35rem;">
                      <button class="btn-bento btn-bento-orange btn-sm" style="font-weight: 800; padding: 0.3rem 0.6rem;" onclick="showEmployeePayslip(${emp.id})">
                        ${ICONS.print} Payslip
                      </button>
                      <button class="btn-bento btn-bento-dark btn-sm" style="font-size: 0.72rem; padding: 0.3rem 0.5rem;" onclick="openEmployeeModal(${emp.id})" title="Edit Staff & Statutory Settings">
                        ⚙️
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderBentoPayroll() {
  const summary = cachedPayrollSummary || window.PayrollEngine.runBranchPayroll(activeCutoff);

  return `
    <div class="user-welcome-banner">
      <div>
        <h1 style="color: var(--text-primary); font-size: 1.75rem;">Philippine DOLE & BIR Payroll Computation</h1>
        <p style="color: var(--text-secondary);">${activeCutoff.name} • Ron's Chicken Cugman</p>
      </div>
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <button class="btn-bento btn-bento-purple" onclick="openEmployeeModal()">${ICONS.employee} Edit Staff & Statutory</button>
        <button class="btn-bento btn-bento-orange" onclick="generateAllBatchPayslips()">${ICONS.print} Print All Payslips (31 Staff)</button>
        <button class="btn-bento btn-bento-dark" onclick="exportPayrollCSV()">${ICONS.download} Bank Advice CSV</button>
        <button class="btn-bento btn-bento-purple" onclick="recalculatePayroll()">${ICONS.payroll} Recalculate</button>
      </div>
    </div>

    <div class="data-panel-card">
      <div class="table-responsive">
        <table class="table-bento">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Daily Rate</th>
              <th>Days</th>
              <th>Basic Pay</th>
              <th>OT Pay</th>
              <th>Night Diff</th>
              <th>Meal Allow.</th>
              <th>Gross</th>
              <th>SSS/PhilH/HDMF</th>
              <th>Vale</th>
              <th>Net Take-Home</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${summary.records.map(r => `
              <tr>
                <td><strong>#${r.employeeId}</strong></td>
                <td style="font-weight: 700; color: var(--text-primary);">${r.employeeName}</td>
                <td>₱${r.dailyRate.toFixed(2)}</td>
                <td><strong>${r.daysPresent}</strong></td>
                <td>₱${r.earnings.basicPay.toFixed(2)}</td>
                <td>₱${r.earnings.otPay.toFixed(2)}</td>
                <td>₱${r.earnings.nightDiffPay.toFixed(2)}</td>
                <td>₱${r.earnings.allowances.toFixed(2)}</td>
                <td style="font-weight: 700; color: var(--text-primary);">₱${r.earnings.grossPay.toFixed(2)}</td>
                <td style="color: var(--text-secondary); font-size: 0.78rem;">₱${(r.deductions.sss + r.deductions.philHealth + r.deductions.pagIbig).toFixed(2)}</td>
                <td style="color: var(--accent-rose);">${r.deductions.cashAdvance > 0 ? `₱${r.deductions.cashAdvance.toFixed(2)}` : '-'}</td>
                <td style="font-weight: 800; color: var(--accent-emerald); font-size: 0.95rem;">₱${r.netPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td>
                  <div style="display: flex; gap: 0.35rem;">
                    <button class="btn-bento btn-bento-orange btn-sm" style="font-weight: 800; padding: 0.3rem 0.6rem;" onclick="showEmployeePayslip(${r.employeeId})">
                      ${ICONS.print} Payslip
                    </button>
                    <button class="btn-bento btn-bento-dark btn-sm" style="font-size: 0.72rem; padding: 0.3rem 0.5rem;" onclick="openEmployeeModal(${r.employeeId})" title="Edit Staff & Statutory Settings">
                      ⚙️
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderBentoAdvances() {
  const advances = window.DB.getAdvances();
  const activeList = advances.filter(a => a.status === 'Active');
  const activeCount = activeList.length;
  const totalLoanBalance = activeList.reduce((s, a) => s + Math.max(0, (a.amount || 0) - (a.deducted || 0)), 0);
  const totalCutoffDeduct = activeList.reduce((s, a) => {
    const remaining = Math.max(0, (a.amount || 0) - (a.deducted || 0));
    return s + (a.deductionPerCutoff ? Math.min(a.deductionPerCutoff, remaining) : remaining);
  }, 0);

  return `
    <div class="user-welcome-banner">
      <div>
        <h1 style="color: var(--text-primary); font-size: 1.75rem;">Cash Advances & Vale Ledger</h1>
        <p style="color: var(--text-secondary);">Track emergency staff loans, cash advances, and automated payroll deductions</p>
      </div>
      <button class="btn-bento btn-bento-purple" onclick="openAdvanceModal()">+ New Vale / Loan Entry</button>
    </div>

    <!-- Quick Stats Bento -->
    <div class="bento-grid" style="margin-bottom: 1.5rem;">
      <div class="bento-card bento-purple col-4">
        <div class="bento-badge-circle">${ICONS.receipt}</div>
        <div class="bento-value">₱${totalLoanBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        <div class="bento-title">Active Loan Balance</div>
        <div class="bento-meta">${activeCount} active staff advance requests</div>
      </div>
      <div class="bento-card bento-orange col-4">
        <div class="bento-badge-circle">${ICONS.payroll}</div>
        <div class="bento-value">₱${totalCutoffDeduct.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        <div class="bento-title">Cutoff Deduction</div>
        <div class="bento-meta">Auto-deducted from gross earnings this cutoff</div>
      </div>
      <div class="bento-card bento-white col-4" onclick="openAdvanceModal()" style="cursor: pointer;">
        <div class="bento-badge-circle">${ICONS.check}</div>
        <div class="bento-value" style="color: #111;">+ Add Entry</div>
        <div class="bento-title" style="color: #111;">New Vale / Loan</div>
        <div class="bento-meta" style="color: #6b7280;">Click to record cash advance or loan</div>
      </div>
    </div>

    <div class="data-panel-card">
      <div class="table-responsive">
        <table class="table-bento">
          <thead>
            <tr>
              <th>Vale ID</th>
              <th>Employee Name</th>
              <th>Type</th>
              <th>Date Issued</th>
              <th>Total Amount</th>
              <th>Cutoff Deduction</th>
              <th>Reason / Remarks</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${advances.length === 0 ? `
              <tr>
                <td colspan="9" style="text-align: center; color: var(--text-muted); padding: 2rem;">No cash advance or loan records found. Click <strong>+ New Vale / Loan Entry</strong> to add one.</td>
              </tr>
            ` : advances.map(a => {
              const remaining = Math.max(0, (a.amount || 0) - (a.deducted || 0));
              const cutoffDeduct = a.deductionPerCutoff ? Math.min(a.deductionPerCutoff, remaining) : remaining;
              const isActive = a.status === 'Active';
              return `
                <tr>
                  <td><strong>${a.id}</strong></td>
                  <td style="font-weight: 700; color: var(--text-primary);">#${a.employeeId} ${a.employeeName}</td>
                  <td><span class="pill ${a.type && a.type.includes('Loan') ? 'pill-purple' : 'pill-orange'}">${a.type || 'Cash Advance (Vale)'}</span></td>
                  <td>${a.date}</td>
                  <td style="font-weight: 800; color: var(--text-primary);">₱${(a.amount || 0).toFixed(2)}</td>
                  <td style="font-weight: 700; color: var(--accent-rose);">₱${cutoffDeduct.toFixed(2)}</td>
                  <td>${a.reason || '-'}</td>
                  <td>
                    <span class="pill ${isActive ? 'pill-orange' : 'pill-emerald'}">${a.status}</span>
                  </td>
                  <td>
                    <div style="display: flex; gap: 0.4rem;">
                      <button class="btn-bento btn-bento-dark btn-sm" style="font-size: 0.72rem; padding: 0.25rem 0.6rem;" onclick="toggleAdvanceStatus('${a.id}')" title="${isActive ? 'Mark as Paid / Settled' : 'Reactivate'}">
                        ${isActive ? '✓ Settle' : '↺ Reactivate'}
                      </button>
                      <button class="btn-bento btn-bento-dark btn-sm" style="font-size: 0.72rem; color: var(--accent-rose); padding: 0.25rem 0.6rem;" onclick="deleteAdvanceEntry('${a.id}')" title="Delete">
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderBentoDevice() {
  return `
    <div class="user-welcome-banner">
      <div>
        <h1 style="color: var(--text-primary); font-size: 1.75rem;">Deli e3960 & Biometric Setup</h1>
        <p style="color: var(--text-secondary);">USB Flash Drive Workflow & Future Internet Upgrade</p>
      </div>
    </div>

    <div class="bento-grid">
      <div class="bento-card bento-orange col-6">
        <div class="bento-card-header">
          <div class="bento-badge-circle">${ICONS.fingerprint}</div>
          <span class="bento-tag">Active Device</span>
        </div>
        <div>
          <div class="bento-value">Deli e3960</div>
          <div class="bento-title">USB Flash Drive Mode</div>
          <div class="bento-meta" style="margin-top: 0.4rem;">
            1. Plug USB into Deli e3960<br>
            2. Download Attendance Report (.xls)<br>
            3. Upload to Ron's Chicken Payroll PWA
          </div>
        </div>
      </div>

      <div class="bento-card bento-purple col-6">
        <div class="bento-card-header">
          <div class="bento-badge-circle">${ICONS.settings}</div>
          <span class="bento-tag">Future Cloud Ready</span>
        </div>
        <div>
          <div class="bento-value">Cloud Sync</div>
          <div class="bento-title">Internet Push Endpoint</div>
          <div class="bento-meta" style="margin-top: 0.4rem;">
            ADMS Server URL: <code>https://ronschicken.cloud/api/biometrics/push</code>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   Staff Self-Service Bento PWA (Mobile First)
   ========================================================================== */

function renderStaffBentoPortal() {
  const employees = window.DB.getEmployees();
  const currentEmp = window.DB.getEmployeeById(selectedStaffEmployeeId) || employees[0];
  const shifts = window.DB.getShifts();
  const timecard = window.BiometricParser.calculateTimecard(currentEmp, activeCutoff.startDate, activeCutoff.endDate, shifts);
  const payroll = window.PayrollEngine.computeEmployeePayroll(currentEmp, timecard, {
    cashAdvanceDeduction: 0,
    incentives: (currentEmp.position && currentEmp.position.includes("Grill")) ? 200 : 0
  });

  return `
    <header class="app-header">
      <div class="brand-wrapper" onclick="setMode('staff')">
        <div class="brand-icon-monogram">Σ</div>
        <div class="brand-text">
          <div class="brand-title">RON'S CHICKEN <span>STAFF</span></div>
          <div class="brand-sub">Employee PWA Portal</div>
        </div>
      </div>

      <div class="header-controls">
        <div class="brightness-control-pill" title="Adjust Theme Brightness / Lighting">
          ${ICONS.sun}
          <input type="range" class="brightness-slider" id="theme-brightness-slider" min="0" max="100" value="${currentBrightness}" oninput="handleBrightnessChange(event)">
        </div>

        <div class="mode-switch-pill">
          <button class="mode-pill-btn" onclick="setMode('manager')">${ICONS.dashboard} Manager</button>
          <button class="mode-pill-btn active" onclick="setMode('staff')">${ICONS.employee} Staff PWA</button>
        </div>
      </div>
    </header>

    <main class="bento-container" style="max-width: 600px;">
      <!-- Welcome Paul / Staff Header -->
      <div class="user-welcome-banner" style="margin-bottom: 1.5rem;">
        <div class="user-welcome-info">
          <div class="user-avatar-circle" style="width: 48px; height: 48px; font-size: 1.2rem;">
            ${currentEmp.name.charAt(0)}
          </div>
          <div class="user-welcome-text">
            <h1 style="font-size: 1.45rem;">Welcome, ${currentEmp.name.split(' ')[0]}</h1>
            <p>${currentEmp.position} • ID #${currentEmp.id}</p>
          </div>
        </div>

        <select id="staff-select" onchange="changeStaffUser(this.value)" 
          style="padding: 0.4rem 0.75rem; background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); border-radius: var(--radius-full); font-size: 0.8rem;">
          ${employees.map(e => `
            <option value="${e.id}" ${e.id === currentEmp.id ? 'selected' : ''}>#${e.id} ${e.name}</option>
          `).join('')}
        </select>
      </div>

      <!-- Mobile Smartphone PWA Tip -->
      <div style="background: rgba(121, 40, 202, 0.12); border: 1px solid rgba(121, 40, 202, 0.3); border-radius: var(--radius-sm); padding: 0.75rem 1rem; margin-bottom: 1.25rem;">
        <div style="font-size: 0.78rem; color: var(--text-primary); line-height: 1.45;">
          📱 <strong>Install on your Smartphone:</strong> Tap your mobile browser menu (<strong>⋮</strong> on Android Chrome or <strong>Share</strong> on iPhone Safari) and choose <strong>"Add to Home Screen"</strong> to use as a standalone mobile app!
        </div>
      </div>

      <!-- Bento Cards Stack (Mobile PWA) -->
        <!-- Deli e3960 Physical Attendance Card -->
        <div class="bento-card bento-orange" style="cursor: default;">
          <div class="bento-card-header">
            <div class="bento-badge-circle">${ICONS.fingerprint}</div>
            <span class="bento-tag">Physical Biometric Machine</span>
          </div>
          <div>
            <div class="bento-title">Deli e3960 Attendance Machine</div>
            <div class="bento-meta" style="margin-top: 0.4rem;">
              Mobile check-in is disabled. Staff must report in person and punch in/out on the Deli e3960 biometric attendance device at the Cugman branch.
            </div>
          </div>
        </div>

        <!-- High Contrast White Bento: My Estimated Payslip & GENERATE Button -->
        <div class="bento-card bento-white" onclick="showEmployeePayslip(${currentEmp.id})">
          <div class="bento-card-header">
            <div class="bento-badge-circle">${ICONS.payroll}</div>
            <span class="bento-tag" style="background: #111827; color: #fff;">${timecard.daysPresent} Days Present</span>
          </div>
          <div>
            <div class="bento-value" style="color: #000;">₱${payroll.netPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div class="bento-title" style="color: #000;">My Estimated Net Pay</div>
            <div class="bento-meta" style="color: #4b5563; margin-top: 0.4rem;">
              Gross: ₱${payroll.earnings.grossPay.toFixed(2)} • Basic: ₱${payroll.earnings.basicPay.toFixed(2)} • OT: ₱${payroll.earnings.otPay.toFixed(2)}
            </div>
            <div style="margin-top: 1rem;">
              <span class="btn-bento btn-bento-orange btn-sm" style="font-size: 0.8rem; font-weight: 800; display: inline-flex;">
                ${ICONS.print} View & Generate Official Payslip
              </span>
            </div>
          </div>
        </div>

        <!-- Electric Purple Bento: Expenses & Vale Management -->
        <div class="bento-card bento-purple">
          <div class="bento-card-header">
            <div class="bento-badge-circle">${ICONS.receipt}</div>
            <span class="bento-tag">Vale & Requests</span>
          </div>
          <div>
            <div class="bento-title">Expenses & Vale</div>
            <div class="bento-meta" style="margin-top: 0.4rem;">Emergency cash advances and meal subsidies balance</div>
          </div>
        </div>

        <!-- Dark Bento: Attendance Log -->
        <div class="data-panel-card" style="padding: 1.25rem;">
          <h3 style="color: var(--text-primary); font-size: 1rem; margin-bottom: 0.85rem;">Daily Punches (${activeCutoff.name})</h3>
          <div class="table-responsive">
            <table class="table-bento" style="font-size: 0.78rem;">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Status</th>
                  <th>Punches</th>
                  <th>Reg</th>
                  <th>OT</th>
                </tr>
              </thead>
              <tbody>
                ${timecard.dailyBreakdown.map(d => `
                  <tr>
                    <td>${d.date.slice(5)}</td>
                    <td><strong>${d.dayOfWeek}</strong></td>
                    <td><span class="pill ${d.punches.length > 0 ? 'pill-emerald' : 'pill-rose'}">${d.status}</span></td>
                    <td style="font-family: monospace;">${d.punches.join(', ') || '-'}</td>
                    <td>${d.regularHours}h</td>
                    <td style="color: var(--bento-orange); font-weight: 700;">${d.otHours > 0 ? `${d.otHours}h` : '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  `;
}

function changeStaffUser(id) {
  selectedStaffEmployeeId = Number(id);
  renderApp();
}

function staffSelfPunch(employeeId) {
  const result = window.DeviceSync.simulateLivePunch(employeeId);
  const feedback = document.getElementById('punch-feedback');
  if (feedback) {
    feedback.innerHTML = `<span style="color: #ffffff; background: rgba(0,0,0,0.3); padding: 0.3rem 0.6rem; border-radius: 6px;">✓ ${result.message}</span>`;
  }
  cachedPayrollSummary = window.PayrollEngine.runBranchPayroll(activeCutoff);
  setTimeout(() => renderApp(), 1200);
}

/* ==========================================================================
   Payslip Generator Engine (Individual & Batch)
   ========================================================================== */

function generatePayslipHTML(employeeId) {
  const emp = window.DB.getEmployeeById(employeeId);
  if (!emp) return '';

  const shifts = window.DB.getShifts();
  const timecard = window.BiometricParser.calculateTimecard(emp, activeCutoff.startDate, activeCutoff.endDate, shifts);
  const advances = window.DB.getAdvances().filter(a => a.employeeId === emp.id && a.status === 'Active');
  const advanceDeduct = advances.reduce((sum, a) => {
    const remaining = Math.max(0, (a.amount || 0) - (a.deducted || 0));
    const perCutoff = a.deductionPerCutoff ? Math.min(a.deductionPerCutoff, remaining) : remaining;
    return sum + perCutoff;
  }, 0);

  const payroll = window.PayrollEngine.computeEmployeePayroll(emp, timecard, {
    cashAdvanceDeduction: advanceDeduct,
    incentives: (emp.position && emp.position.includes("Grill")) ? 200 : 0
  });

  return `
    <div class="payslip-container" style="margin-bottom: 2rem; page-break-after: always;">
      <div class="payslip-header">
        <div class="payslip-brand">
          <img src="assets/logo.jpg" alt="Ron's Chicken">
          <div class="payslip-title">
            <h2>RON'S CHICKEN</h2>
            <p>Lechon Manok & Liempo • Cugman Branch, Cagayan de Oro</p>
            <p style="font-size: 0.72rem; color: #6b7280;">Deli e3960 Biometric Attendance Verified</p>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: 800; font-size: 1.1rem; color: #111827;">OFFICIAL PAYSLIP</div>
          <div style="font-size: 0.75rem; color: #4b5563;">Period: ${activeCutoff.startDate} to ${activeCutoff.endDate}</div>
          <div style="font-size: 0.72rem; color: #6b7280;">Date Issued: ${new Date().toLocaleDateString()}</div>
        </div>
      </div>

      <div style="background: #f9fafb; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.8rem;">
        <div><strong>Employee ID:</strong> #${emp.id}</div>
        <div><strong>Employee Name:</strong> ${emp.name}</div>
        <div><strong>Department:</strong> ${emp.department}</div>
        <div><strong>Position:</strong> ${emp.position || 'Staff'}</div>
        <div><strong>Daily Rate:</strong> ₱${payroll.dailyRate.toFixed(2)} (₱${payroll.hourlyRate.toFixed(2)}/hr)</div>
        <div><strong>Days Worked:</strong> ${payroll.daysPresent} Days (${payroll.regularHours} hrs)</div>
      </div>

      <div class="payslip-grid">
        <!-- Earnings -->
        <div>
          <div class="payslip-section-title">EARNINGS</div>
          <div class="payslip-row">
            <span>Basic Pay:</span>
            <strong>₱${payroll.earnings.basicPay.toFixed(2)}</strong>
          </div>
          <div class="payslip-row">
            <span>Overtime Pay (${payroll.otHours} hrs @ 125%):</span>
            <strong>₱${payroll.earnings.otPay.toFixed(2)}</strong>
          </div>
          <div class="payslip-row">
            <span>Night Shift Diff (${payroll.nightDiffHours} hrs @ 10%):</span>
            <strong>₱${payroll.earnings.nightDiffPay.toFixed(2)}</strong>
          </div>
          <div class="payslip-row">
            <span>Meal / Food Allowance:</span>
            <strong>₱${payroll.earnings.allowances.toFixed(2)}</strong>
          </div>
          ${payroll.earnings.incentives > 0 ? `
            <div class="payslip-row">
              <span>Roaster / Grill Incentive:</span>
              <strong>₱${payroll.earnings.incentives.toFixed(2)}</strong>
            </div>
          ` : ''}
          <div class="payslip-row payslip-total">
            <span>GROSS EARNINGS:</span>
            <span>₱${payroll.earnings.grossPay.toFixed(2)}</span>
          </div>
        </div>

        <!-- Deductions -->
        <div>
          <div class="payslip-section-title">DEDUCTIONS</div>
          ${payroll.deductions.late > 0 ? `
            <div class="payslip-row">
              <span>Tardiness / Late:</span>
              <span>-₱${payroll.deductions.late.toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="payslip-row">
            <span>SSS Contribution:</span>
            <span>-₱${payroll.deductions.sss.toFixed(2)}</span>
          </div>
          <div class="payslip-row">
            <span>PhilHealth:</span>
            <span>-₱${payroll.deductions.philHealth.toFixed(2)}</span>
          </div>
          <div class="payslip-row">
            <span>Pag-IBIG:</span>
            <span>-₱${payroll.deductions.pagIbig.toFixed(2)}</span>
          </div>
          ${advances.map(a => {
            const remaining = Math.max(0, (a.amount || 0) - (a.deducted || 0));
            const deduct = a.deductionPerCutoff ? Math.min(a.deductionPerCutoff, remaining) : remaining;
            if (deduct <= 0) return '';
            const typeLabel = a.type || 'Cash Advance (Vale)';
            const reasonLabel = a.reason ? ` (${a.reason})` : '';
            return `
              <div class="payslip-row">
                <span>${typeLabel}${reasonLabel}:</span>
                <span style="color: var(--accent-rose); font-weight: 700;">-₱${deduct.toFixed(2)}</span>
              </div>
            `;
          }).join('')}
          ${advances.length === 0 && payroll.deductions.cashAdvance > 0 ? `
            <div class="payslip-row">
              <span>Cash Advance (Vale):</span>
              <span style="color: var(--accent-rose); font-weight: 700;">-₱${payroll.deductions.cashAdvance.toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="payslip-row payslip-total">
            <span>TOTAL DEDUCTIONS:</span>
            <span>-₱${payroll.deductions.totalDeductions.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div class="payslip-net">
        <span>NET TAKE-HOME PAY:</span>
        <span style="font-size: 1.4rem; color: #111827;">₱${payroll.netPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      </div>

      <div style="font-size: 0.75rem; color: #6b7280; margin-top: 0.75rem;">
        * 13th Month Accrual for this cutoff: ₱${payroll.thirtenthMonthAccrual.toFixed(2)}
      </div>

      <div class="payslip-footer">
        <div>
          <div class="payslip-sig-line">Prepared & Verified By (Manager)</div>
        </div>
        <div>
          <div class="payslip-sig-line">Employee Signature / Acknowledged</div>
        </div>
      </div>
    </div>
  `;
}

function showEmployeePayslip(employeeId) {
  const content = document.getElementById('payslip-printable-content');
  if (!content) return;
  content.innerHTML = generatePayslipHTML(employeeId);
  openModal('payslip-modal');
}

function generateAllBatchPayslips() {
  const employees = window.DB.getEmployees();
  const content = document.getElementById('payslip-printable-content');
  if (!content) return;

  const activeEmployees = employees.filter(e => {
    const shifts = window.DB.getShifts();
    const tc = window.BiometricParser.calculateTimecard(e, activeCutoff.startDate, activeCutoff.endDate, shifts);
    return tc.daysPresent > 0 || (e.attendanceLogs && e.attendanceLogs.length > 0);
  });

  const targetList = activeEmployees.length > 0 ? activeEmployees : employees;
  content.innerHTML = targetList.map(e => generatePayslipHTML(e.id)).join('');
  openModal('payslip-modal');
}

/* ==========================================================================
   Modals & File Upload
   ========================================================================== */

function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('open');
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('open');
}

function openUploadModal() {
  openModal('upload-modal');
}

async function handleFileSelected(event) {
  const file = event.target.files[0];
  if (!file) return;

  const statusEl = document.getElementById('upload-status');
  if (statusEl) {
    statusEl.innerHTML = `<span style="color: var(--bento-orange);">Processing ${file.name}...</span>`;
  }

  try {
    const result = await window.DeviceSync.processUploadedFile(file);
    if (result.success) {
      if (statusEl) {
        statusEl.innerHTML = `<span style="color: var(--accent-emerald); font-weight: 700;">✓ ${result.message}</span>`;
      }
      cachedPayrollSummary = window.PayrollEngine.runBranchPayroll(activeCutoff);
      setTimeout(() => {
        closeModal('upload-modal');
        renderApp();
      }, 1400);
    }
  } catch (err) {
    if (statusEl) {
      statusEl.innerHTML = `<span style="color: var(--accent-rose);">Error: ${err.message}</span>`;
    }
  }
}

function recalculatePayroll() {
  cachedPayrollSummary = window.PayrollEngine.runBranchPayroll(activeCutoff);
  renderApp();
  alert("Payroll recalculated successfully.");
}

function exportPayrollCSV() {
  const summary = cachedPayrollSummary || window.PayrollEngine.runBranchPayroll(activeCutoff);
  let csv = "Employee ID,Full Name,Department,Position,Daily Rate,Days Present,Regular Hours,OT Hours,Night Diff Hours,Basic Pay,OT Pay,Night Diff Pay,Allowances,Gross Pay,SSS EE,PhilHealth EE,PagIBIG,Cash Advance Vale,Total Deductions,Net Pay\n";
  summary.records.forEach(r => {
    csv += `"${r.employeeId}","${r.employeeName}","${r.department}","${r.position}",${r.dailyRate},${r.daysPresent},${r.regularHours},${r.otHours},${r.nightDiffHours},${r.earnings.basicPay},${r.earnings.otPay},${r.earnings.nightDiffPay},${r.earnings.allowances},${r.earnings.grossPay},${r.deductions.sss},${r.deductions.philHealth},${r.deductions.pagIbig},${r.deductions.cashAdvance},${r.deductions.totalDeductions},${r.netPay}\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Rons_Chicken_Payroll_${activeCutoff.startDate}_to_${activeCutoff.endDate}.csv`;
  a.click();
}

function exportAttendanceCSV() {
  const employees = window.DB.getEmployees();
  let csv = "Employee ID,Name,Date,Time,Punch Source\n";
  employees.forEach(e => {
    (e.attendanceLogs || []).forEach(p => {
      csv += `"${e.id}","${e.name}","${p.date}","${p.time}","${p.source}"\n`;
    });
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Rons_Chicken_Attendance_Logs.csv`;
  a.click();
}

function openAdvanceModal() {
  openModal('advance-modal');
}

function handleSaveAdvance(event) {
  event.preventDefault();
  const empId = parseInt(document.getElementById('adv-employee-id').value, 10);
  const emp = window.DB.getEmployeeById(empId);
  if (!emp) return;

  const type = document.getElementById('adv-type').value;
  const date = document.getElementById('adv-date').value;
  const amount = parseFloat(document.getElementById('adv-amount').value) || 0;
  const cutoffVal = document.getElementById('adv-cutoff-deduct').value;
  const cutoffDeduct = cutoffVal ? parseFloat(cutoffVal) : amount;
  const reason = document.getElementById('adv-reason').value || type;

  const newAdvance = {
    id: `VA-${Date.now().toString().slice(-4)}`,
    employeeId: emp.id,
    employeeName: emp.name,
    type,
    date,
    amount,
    deductionPerCutoff: cutoffDeduct,
    deducted: 0,
    reason,
    status: 'Active'
  };

  window.DB.addAdvance(newAdvance);
  cachedPayrollSummary = window.PayrollEngine.runBranchPayroll(activeCutoff);
  closeModal('advance-modal');
  renderApp();
}

function toggleAdvanceStatus(id) {
  const advances = window.DB.getAdvances();
  const adv = advances.find(a => a.id === id);
  if (!adv) return;
  adv.status = (adv.status === 'Active') ? 'Settled' : 'Active';
  window.DB.updateAdvance(adv);
  cachedPayrollSummary = window.PayrollEngine.runBranchPayroll(activeCutoff);
  renderApp();
}

function deleteAdvanceEntry(id) {
  if (confirm("Are you sure you want to remove this deduction entry?")) {
    window.DB.deleteAdvance(id);
    cachedPayrollSummary = window.PayrollEngine.runBranchPayroll(activeCutoff);
    renderApp();
  }
}

function openEmployeeModal(employeeId) {
  const employees = window.DB.getEmployees();
  if (!employees || employees.length === 0) return;
  const targetId = employeeId ? Number(employeeId) : (employees[0] ? employees[0].id : 1);
  handleEmployeeSelectChange(targetId);
  openModal('employee-modal');
}

function handleEmployeeSelectChange(employeeId) {
  const emp = window.DB.getEmployeeById(Number(employeeId));
  if (!emp) return;

  const editIdEl = document.getElementById('emp-edit-id');
  const switcherEl = document.getElementById('emp-select-switcher');
  const nameEl = document.getElementById('emp-name');
  const posEl = document.getElementById('emp-position');
  const rateEl = document.getElementById('emp-daily-rate');
  const allowEl = document.getElementById('emp-allowance');
  const sssNoEl = document.getElementById('emp-sss-no');
  const sssCustomEl = document.getElementById('emp-sss-custom');
  const phicNoEl = document.getElementById('emp-philhealth-no');
  const phicCustomEl = document.getElementById('emp-philhealth-custom');
  const hdmfNoEl = document.getElementById('emp-pagibig-no');
  const hdmfCustomEl = document.getElementById('emp-pagibig-custom');
  const tinNoEl = document.getElementById('emp-tin-no');
  const sssExemptEl = document.getElementById('emp-sss-exempt');
  const phicExemptEl = document.getElementById('emp-phic-exempt');
  const hdmfExemptEl = document.getElementById('emp-hdmf-exempt');

  if (editIdEl) editIdEl.value = emp.id;
  if (switcherEl) switcherEl.value = emp.id;
  if (nameEl) nameEl.value = emp.name || '';
  if (posEl) posEl.value = emp.position || '';
  if (rateEl) rateEl.value = emp.dailyRate || 438;
  if (allowEl) allowEl.value = emp.allowance || 50;
  if (sssNoEl) sssNoEl.value = emp.sssNumber || '';
  if (sssCustomEl) sssCustomEl.value = (emp.customSssAmount !== undefined && emp.customSssAmount !== null) ? emp.customSssAmount : '';
  if (phicNoEl) phicNoEl.value = emp.philHealthNumber || '';
  if (phicCustomEl) phicCustomEl.value = (emp.customPhilHealthAmount !== undefined && emp.customPhilHealthAmount !== null) ? emp.customPhilHealthAmount : '';
  if (hdmfNoEl) hdmfNoEl.value = emp.pagIbigNumber || '';
  if (hdmfCustomEl) hdmfCustomEl.value = (emp.customPagIbigAmount !== undefined && emp.customPagIbigAmount !== null) ? emp.customPagIbigAmount : '';
  if (tinNoEl) tinNoEl.value = emp.tinNumber || '';
  if (sssExemptEl) sssExemptEl.checked = !!emp.sssExempt;
  if (phicExemptEl) phicExemptEl.checked = !!emp.philHealthExempt;
  if (hdmfExemptEl) hdmfExemptEl.checked = !!emp.pagIbigExempt;
}

function handleSaveEmployee(event) {
  event.preventDefault();
  const empId = Number(document.getElementById('emp-edit-id').value);
  const emp = window.DB.getEmployeeById(empId);
  if (!emp) return;

  const sssCustomVal = document.getElementById('emp-sss-custom').value;
  const phicCustomVal = document.getElementById('emp-philhealth-custom').value;
  const hdmfCustomVal = document.getElementById('emp-pagibig-custom').value;

  emp.name = document.getElementById('emp-name').value.trim();
  emp.position = document.getElementById('emp-position').value.trim();
  emp.dailyRate = parseFloat(document.getElementById('emp-daily-rate').value) || 438;
  emp.allowance = parseFloat(document.getElementById('emp-allowance').value) || 50;
  emp.sssNumber = document.getElementById('emp-sss-no').value.trim();
  emp.customSssAmount = sssCustomVal !== '' ? parseFloat(sssCustomVal) : null;
  emp.philHealthNumber = document.getElementById('emp-philhealth-no').value.trim();
  emp.customPhilHealthAmount = phicCustomVal !== '' ? parseFloat(phicCustomVal) : null;
  emp.pagIbigNumber = document.getElementById('emp-pagibig-no').value.trim();
  emp.customPagIbigAmount = hdmfCustomVal !== '' ? parseFloat(hdmfCustomVal) : null;
  emp.tinNumber = document.getElementById('emp-tin-no').value.trim();
  emp.sssExempt = document.getElementById('emp-sss-exempt').checked;
  emp.philHealthExempt = document.getElementById('emp-phic-exempt').checked;
  emp.pagIbigExempt = document.getElementById('emp-hdmf-exempt').checked;

  window.DB.addOrUpdateEmployee(emp);
  cachedPayrollSummary = window.PayrollEngine.runBranchPayroll(activeCutoff);
  closeModal('employee-modal');
  renderApp();
}

// Global Exports
window.navigateTo = navigateTo;
window.setMode = setMode;
window.openUploadModal = openUploadModal;
window.openAdvanceModal = openAdvanceModal;
window.openEmployeeModal = openEmployeeModal;
window.handleEmployeeSelectChange = handleEmployeeSelectChange;
window.handleSaveEmployee = handleSaveEmployee;
window.closeModal = closeModal;
window.handleFileSelected = handleFileSelected;
window.handleSaveAdvance = handleSaveAdvance;
window.toggleAdvanceStatus = toggleAdvanceStatus;
window.deleteAdvanceEntry = deleteAdvanceEntry;
window.showEmployeePayslip = showEmployeePayslip;
window.generateAllBatchPayslips = generateAllBatchPayslips;
window.recalculatePayroll = recalculatePayroll;
window.exportPayrollCSV = exportPayrollCSV;
window.exportAttendanceCSV = exportAttendanceCSV;
window.changeStaffUser = changeStaffUser;
window.staffSelfPunch = staffSelfPunch;
window.handleBrightnessChange = handleBrightnessChange;


