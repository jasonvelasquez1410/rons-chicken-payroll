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
let currentBrightness = 0;
try {
  if (typeof localStorage !== 'undefined') {
    currentBrightness = parseInt(localStorage.getItem('rons_payroll_brightness') || '0', 10);
  }
} catch (e) {
  currentBrightness = 0;
}

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
  book: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
  database: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>`,
  chicken: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path></svg>`,
  money: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>`,
  ai: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path><circle cx="12" cy="12" r="4"></circle></svg>`,
  users: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
  alert: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
  flame: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>`
};

function safeGetEmployees() {
  try {
    return (window.DB && typeof window.DB.getEmployees === 'function') ? window.DB.getEmployees() : [];
  } catch (e) {
    return [];
  }
}

function safeGetShifts() {
  try {
    return (window.DB && typeof window.DB.getShifts === 'function') ? window.DB.getShifts() : [];
  } catch (e) {
    return [];
  }
}

function safeGetCutoffs() {
  try {
    return (window.DB && typeof window.DB.getCutoffs === 'function') ? window.DB.getCutoffs() : [];
  } catch (e) {
    return [];
  }
}

function safeGetDeductions() {
  try {
    if (window.DB && typeof window.DB.getDeductions === 'function') {
      return window.DB.getDeductions();
    }
    return (window.DB && typeof window.DB.getAdvances === 'function') ? window.DB.getAdvances() : [];
  } catch (e) {
    return [];
  }
}

function safeGetAdvances() {
  return safeGetDeductions();
}

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
    window.activeCutoff = activeCutoff;

    if (window.PayrollEngine && typeof window.PayrollEngine.runBranchPayroll === 'function') {
      cachedPayrollSummary = window.PayrollEngine.runBranchPayroll(activeCutoff);
      window.cachedPayrollSummary = cachedPayrollSummary;
    }

    // Service worker disabled for live desktop/mobile synchronization
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(regs) {
        for (var i = 0; i < regs.length; i++) {
          regs[i].unregister();
        }
      }).catch(function() {});
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
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('rons_payroll_brightness', level);
    }
  } catch (e) {}
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

  const currentUser = (window.DB && typeof window.DB.getCurrentUser === 'function') 
    ? window.DB.getCurrentUser() 
    : { id: 'usr_admin', name: "Sir Irl (Owner)", role: "admin", avatar: "👑" };

  if (currentMode === 'staff') {
    container.innerHTML = renderStaffBentoPortal();
  } else {
    container.innerHTML = `
      <!-- Header with Brightness Slider -->
      <header class="app-header">
        <div class="brand-wrapper" onclick="navigateTo('dashboard')">
          <div class="brand-icon-monogram">Σ</div>
          <div class="brand-text">
            <div class="brand-title">RON'S CHICKEN <span>CUSTOM ERP</span></div>
            <div class="brand-sub">Cugman Branch • Lechon Manok &amp; Liempo Suite</div>
          </div>
        </div>

        <div class="header-controls">
          <div id="user-session-chip" class="pill ${currentUser.role === 'admin' ? 'pill-orange' : 'pill-purple'}" style="font-size: 0.78rem; font-weight: 700; padding: 0.45rem 0.85rem; display: inline-flex; align-items: center; gap: 0.45rem; cursor: pointer;" onclick="openModal('switch-user-modal')" title="Active Profile: Click to Switch User / Cashier">
            <span>${currentUser.avatar || '👤'}</span>
            <span>${currentUser.name}</span>
            <span style="font-size: 0.68rem; opacity: 0.8;">(${currentUser.role === 'admin' ? 'Owner' : 'Cashier'})</span>
          </div>

          <div id="firebase-sync-pill" class="pill pill-dark" style="font-size: 0.76rem; padding: 0.45rem 0.85rem; display: inline-flex; align-items: center; gap: 0.45rem; cursor: pointer;" onclick="openCloudSyncModal()" title="Click to view Multi-Device Cloud Sync Status">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #64748b; display: inline-block;"></span>
            <span style="color: #94a3b8; font-weight: 600;">Local Device</span>
          </div>

          <button class="btn-bento btn-bento-dark btn-sm" style="padding: 0.45rem 0.85rem; font-size: 0.78rem; display: inline-flex; align-items: center; gap: 0.4rem;" onclick="openModal('backup-modal')" title="Backup & Restore Full Payroll Database">
            ${ICONS.database} Backup &amp; Data
          </button>

          <button class="btn-bento btn-bento-dark btn-sm" style="padding: 0.45rem 0.85rem; font-size: 0.78rem; display: inline-flex; align-items: center; gap: 0.4rem;" onclick="openModal('guide-modal')" title="View Owner / Admin DOLE & System Guide">
            ${ICONS.book} Reference Guide
          </button>

          <!-- Real-Time Theme Brightness Slider -->
          <div class="brightness-control-pill" title="Adjust Theme Brightness / Lighting">
            ${ICONS.sun}
            <input type="range" class="brightness-slider" id="theme-brightness-slider" min="0" max="100" value="${currentBrightness}" oninput="handleBrightnessChange(event)">
            <span id="brightness-label" style="min-width: 46px;">${getBrightnessName(currentBrightness)}</span>
          </div>
        </div>
      </header>

      <!-- ERP Modules Sub-Navigation Bar -->
      <div class="erp-subnav-bar">
        ${currentUser.role === 'admin' ? `
          <button class="erp-tab-btn ${currentView === 'dashboard' ? 'active' : ''}" onclick="navigateTo('dashboard')">
            ${ICONS.dashboard} Overview
          </button>
          <button class="erp-tab-btn ${currentView === 'inventory' ? 'active' : ''}" onclick="navigateTo('inventory')">
            ${ICONS.chicken} Lechon Inventory
          </button>
          <button class="erp-tab-btn ${currentView === 'remittances' ? 'active' : ''}" onclick="navigateTo('remittances')">
            ${ICONS.money} POS Remittances
          </button>
          <button class="erp-tab-btn ${currentView === 'advances' || currentView === 'deductions' ? 'active' : ''}" onclick="navigateTo('advances')">
            ${ICONS.receipt} Utang &amp; Deductions
          </button>
          <button class="erp-tab-btn ${currentView === 'payroll' ? 'active' : ''}" onclick="navigateTo('payroll')">
            ${ICONS.payroll} Payroll &amp; Payslips
          </button>
          <button class="erp-tab-btn ${currentView === 'attendance' ? 'active' : ''}" onclick="navigateTo('attendance')">
            ${ICONS.fingerprint} Biometrics
          </button>
          <button class="erp-tab-btn ${currentView === 'aiAdvisor' ? 'active' : ''}" onclick="navigateTo('aiAdvisor')">
            ${ICONS.ai} AI Financial Analyst
          </button>
          <button class="erp-tab-btn ${currentView === 'users' ? 'active' : ''}" onclick="navigateTo('users')">
            ${ICONS.users} 3 Cashiers &amp; Roles
          </button>
          <button class="erp-tab-btn ${currentView === 'device' ? 'active' : ''}" onclick="navigateTo('device')">
            ${ICONS.settings} Deli e3960
          </button>
        ` : `
          <button class="erp-tab-btn active" onclick="navigateTo('dashboard')">
            💳 Cashier POS Terminal
          </button>
          <button class="erp-tab-btn" onclick="openModal('remittance-modal')">
            ${ICONS.money} + Record Shift Remittance
          </button>
          <button class="erp-tab-btn" onclick="openModal('inventory-daily-modal')">
            ${ICONS.chicken} + Chicken Stock Count
          </button>
          <button class="erp-tab-btn" onclick="openModal('inventory-batch-modal')">
            ${ICONS.flame} + Roast Batch Intake
          </button>
          <button class="erp-tab-btn" onclick="ErpModules.openReportLackingModal()">
            ${ICONS.alert} Report Lacking Chicken
          </button>
          <button class="erp-tab-btn" onclick="openModal('switch-user-modal')">
            🔒 Switch Cashier / Lock
          </button>
        `}
      </div>

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
        <div class="bottom-nav-item ${currentView === 'inventory' ? 'active' : ''}" onclick="navigateTo('inventory')">
          ${ICONS.chicken}
          <span>Inventory</span>
        </div>
        <div class="bottom-nav-item ${currentView === 'remittances' ? 'active' : ''}" onclick="navigateTo('remittances')">
          ${ICONS.money}
          <span>Sales</span>
        </div>
        <div class="bottom-nav-item ${currentView === 'advances' || currentView === 'deductions' ? 'active' : ''}" onclick="navigateTo('advances')">
          ${ICONS.receipt}
          <span>Deductions</span>
        </div>
        <div class="bottom-nav-item ${currentView === 'payroll' ? 'active' : ''}" onclick="navigateTo('payroll')">
          ${ICONS.payroll}
          <span>Payroll</span>
        </div>
        <div class="bottom-nav-item ${currentView === 'aiAdvisor' ? 'active' : ''}" onclick="navigateTo('aiAdvisor')">
          ${ICONS.ai}
          <span>AI Analyst</span>
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
                  ${safeGetEmployees().map(e => `
                    <option value="${e.id}">#${e.id} ${e.name} (${e.position || e.department})</option>
                  `).join('')}
                </select>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.4rem; color: var(--text-secondary);">Deduction Type</label>
                  <select id="adv-type" style="width: 100%; padding: 0.75rem 1rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 0.9rem;">
                    <option value="Utang (Store Credit / Loans)">📝 Utang (Store Credit / Loans)</option>
                    <option value="Cash Advance (Vale)">💵 Cash Advance (Vale)</option>
                    <option value="Shortages (Cashier Cash Shortage)">⚠️ Shortages (Cashier Cash Shortage)</option>
                    <option value="Lacking Products (Burnt / Missing Chicken)">🍗 Lacking Products (Burnt / Missing Chicken)</option>
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
                  ${safeGetEmployees().map(e => `
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

            <!-- Section 6: Data Safety & Automatic Backups -->
            <div style="background: var(--bg-surface); padding: 1.25rem; border-radius: var(--radius-md); border-left: 4px solid #10b981;">
              <h4 style="color: var(--text-primary); margin-bottom: 0.4rem; font-size: 0.95rem; font-weight: 800;">6. Data Safety, Continuous Auto-Backup & System Recovery</h4>
              <p>The system is built with automated offline persistence, browser storage protection, and 1-click full database export / import:</p>
              <ul style="padding-left: 1.2rem; margin-top: 0.4rem;">
                <li><strong>Continuous Auto-Snapshots:</strong> Every time attendance is uploaded, staff rates are saved, or vale loans are recorded, the system automatically takes rolling backup snapshots.</li>
                <li><strong>Persistent Storage:</strong> Uses modern browser Storage API (<code>navigator.storage.persist</code>) so browser cache cleanups or OS updates do not evict your payroll database.</li>
                <li><strong>1-Click Backup Export (.json):</strong> Click <strong>"Backup & Data"</strong> in the top header or Deli e3960 tab to download a complete backup file to your flash drive or Google Drive in 1 second.</li>
                <li><strong>1-Click Restore:</strong> To transfer all payroll records to a new store laptop or tablet, simply click <strong>"Restore / Import Backup"</strong> and select your <code>.json</code> file.</li>
              </ul>
            </div>

          </div>

          <div style="display: flex; justify-content: flex-end; margin-top: 1.5rem;">
            <button class="btn-bento btn-bento-orange" onclick="closeModal('guide-modal')">Got it / Close Guide</button>
          </div>
        </div>
      </div>

      <!-- Backup & Restore Data Management Modal -->
      <div id="backup-modal" class="modal-backdrop">
        <div class="modal-card" style="max-width: 680px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <h3 style="color: var(--text-primary); font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
              ${ICONS.database} Data Safety, Backup & System Recovery
            </h3>
            <button class="btn-bento btn-bento-dark btn-sm" onclick="closeModal('backup-modal')">✕</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 1.25rem;">
            
            <!-- Continuous Auto-Backup Status Pill Card -->
            <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-md); padding: 1rem 1.25rem;">
              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <div style="width: 10px; height: 10px; border-radius: 50%; background: #10b981; box-shadow: 0 0 10px #10b981;"></div>
                  <strong style="color: var(--text-primary); font-size: 0.9rem;">Continuous Auto-Backup: ACTIVE</strong>
                </div>
                <span class="pill pill-emerald" style="font-size: 0.72rem;">Protected Local Storage</span>
              </div>
              <p style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.5rem; line-height: 1.45;">
                The system automatically creates rolling snapshots in browser storage every time attendance is imported or staff details are updated. Browser eviction protection is active.
              </p>
            </div>

            <!-- Manual 1-Click Backup & Restore Actions -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              
              <!-- Download Backup -->
              <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem;">
                    <div style="color: var(--bento-orange);">${ICONS.download}</div>
                    <h4 style="color: var(--text-primary); font-size: 0.95rem; font-weight: 700;">Download Backup</h4>
                  </div>
                  <p style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 1rem;">
                    Export all 31 staff profiles, wage rates, statutory settings, vale records, and attendance logs to a single portable <code>.json</code> file.
                  </p>
                </div>
                <button class="btn-bento btn-bento-orange" style="width: 100%; justify-content: center; font-size: 0.85rem;" onclick="handleDownloadBackup()">
                  ${ICONS.download} Export Backup (.json)
                </button>
              </div>

              <!-- Restore Backup -->
              <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem;">
                    <div style="color: #a855f7;">${ICONS.upload}</div>
                    <h4 style="color: var(--text-primary); font-size: 0.95rem; font-weight: 700;">Restore / Transfer Data</h4>
                  </div>
                  <p style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 1rem;">
                    Upload a previously downloaded <code>.json</code> backup file to instantly restore or transfer all data to this computer or device.
                  </p>
                </div>
                <button class="btn-bento btn-bento-purple" style="width: 100%; justify-content: center; font-size: 0.85rem;" onclick="document.getElementById('backup-file-input').click()">
                  ${ICONS.upload} Restore from .json
                </button>
                <input type="file" id="backup-file-input" style="display: none;" accept=".json" onchange="handleImportBackupFile(event)">
              </div>

            </div>

            <!-- Rolling Auto-Snapshots Rollback -->
            <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem;">
              <h4 style="color: var(--text-primary); font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem;">
                🕒 Rolling Automatic Snapshots
              </h4>
              <p style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
                If you made a mistake or want to undo recent changes, you can roll back to a previously saved automatic snapshot:
              </p>
              
              <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
                <select id="auto-snapshot-select" style="flex: 1; min-width: 240px; padding: 0.6rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-card-dark); border: 1px solid var(--border-glass); color: var(--text-primary); font-size: 0.82rem;">
                  ${(window.DB && typeof window.DB.getAutoBackups === 'function' ? window.DB.getAutoBackups() : []).map(s => `
                    <option value="${s.id}">${s.formattedDate} — ${s.label || 'Auto Snapshot'}</option>
                  `).join('') || '<option value="">No snapshots available</option>'}
                </select>
                <button class="btn-bento btn-bento-dark btn-sm" onclick="handleRestoreSnapshot(document.getElementById('auto-snapshot-select').value)">
                  ↺ Rollback to Snapshot
                </button>
              </div>
            </div>

            <!-- Factory Reset Emergency Section -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 0.5rem; border-top: 1px solid var(--border-subtle); flex-wrap: wrap; gap: 0.75rem;">
              <span style="font-size: 0.75rem; color: var(--text-muted);">Ron's Chicken Cugman Payroll Engine v1.0</span>
              <button class="btn-bento btn-bento-dark btn-sm" style="font-size: 0.72rem; color: var(--accent-rose); border-color: rgba(239, 68, 68, 0.3);" onclick="handleResetFactoryConfirm()">
                ⚠️ Reset to Factory Defaults
              </button>
            </div>

          </div>
        </div>
      </div>

      <!-- Add New Cutoff Modal -->
      <div id="new-cutoff-modal" class="modal-backdrop">
        <div class="modal-card" style="max-width: 520px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <h3 style="color: var(--text-primary); font-size: 1.2rem; display: flex; align-items: center; gap: 0.5rem;">
              📅 Create New Payroll Cutoff Period
            </h3>
            <button class="btn-bento btn-bento-dark btn-sm" onclick="closeModal('new-cutoff-modal')">✕</button>
          </div>
          <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
            Define the start and end dates for your upcoming bi-monthly payroll cutoff (e.g. 1st–15th or 16th–end of month).
          </p>

          <form id="new-cutoff-form" onsubmit="handleSaveNewCutoff(event)">
            <div style="display: grid; gap: 1rem;">
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Cutoff Display Name</label>
                <input type="text" id="new-co-name" required placeholder="e.g. September 01 - September 15, 2026 (1st Cutoff)" style="width: 100%; padding: 0.7rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 0.85rem;">
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;">
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Start Date (From)</label>
                  <input type="date" id="new-co-start" required value="${new Date().toISOString().slice(0, 8) + '01'}" style="width: 100%; padding: 0.7rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 0.85rem;">
                </div>
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">End Date (To)</label>
                  <input type="date" id="new-co-end" required value="${new Date().toISOString().slice(0, 8) + '15'}" style="width: 100%; padding: 0.7rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 0.85rem;">
                </div>
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.75rem;">
                <button type="button" class="btn-bento btn-bento-dark" onclick="closeModal('new-cutoff-modal')">Cancel</button>
                <button type="submit" class="btn-bento btn-bento-orange" style="font-weight: 800;">⚡ Save & Set Active Cutoff</button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Real-Time Firebase Cloud Sync Modal -->
      <div id="cloud-sync-modal" class="modal-backdrop">
        <div class="modal-card" style="max-width: 680px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <h3 style="color: var(--text-primary); font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
              ☁️ Multi-Device Real-Time Cloud Sync
            </h3>
            <button class="btn-bento btn-bento-dark btn-sm" onclick="closeModal('cloud-sync-modal')">✕</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 1.25rem;">
            <!-- Cloud Status Card -->
            <div id="modal-cloud-status-card" style="background: rgba(121, 40, 202, 0.08); border: 1px solid rgba(121, 40, 202, 0.3); border-radius: var(--radius-md); padding: 1rem 1.25rem;">
              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <div style="width: 10px; height: 10px; border-radius: 50%; background: ${window.FirebaseSync && window.FirebaseSync.isInitialized ? '#10b981' : '#64748b'}; box-shadow: 0 0 10px ${window.FirebaseSync && window.FirebaseSync.isInitialized ? '#10b981' : '#64748b'};"></div>
                  <strong style="color: var(--text-primary); font-size: 0.9rem;">
                    ${window.FirebaseSync && window.FirebaseSync.isInitialized ? 'Cloud Sync Status: CONNECTED & LIVE' : 'Cloud Sync Status: LOCAL OFFLINE MODE'}
                  </strong>
                </div>
                <span class="pill ${window.FirebaseSync && window.FirebaseSync.isInitialized ? 'pill-emerald' : 'pill-dark'}" style="font-size: 0.72rem;">
                  ${window.FirebaseSync && window.FirebaseSync.isInitialized ? 'Google Firestore Real-Time' : 'Not Connected'}
                </span>
              </div>
              <p style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.5rem; line-height: 1.45;">
                Syncs all 31 staff records, daily wage rates, attendance logs, and vale deductions automatically across your Laptop, Mobile Smartphone, and Tablet in real-time ($0 monthly cost via Google Firebase Spark Tier).
              </p>
            </div>

            <!-- Firebase Config Input Box -->
            <form id="firebase-config-form" onsubmit="handleSaveFirebaseConfig(event)">
              <div style="display: grid; gap: 1rem;">
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">
                    Paste Firebase Config (JSON or JavaScript snippet)
                  </label>
                  <textarea id="firebase-config-input" rows="6" placeholder='Paste your firebaseConfig here, e.g.:
{
  "apiKey": "AIzaSy...",
  "authDomain": "rons-chicken-payroll.firebaseapp.com",
  "projectId": "rons-chicken-payroll",
  "storageBucket": "rons-chicken-payroll.appspot.com",
  "messagingSenderId": "123456789",
  "appId": "1:123456789:web:abcdef"
}' style="width: 100%; padding: 0.75rem 1rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-family: monospace; font-size: 0.8rem; resize: vertical; line-height: 1.4;">${window.FirebaseSync && window.FirebaseSync.getSavedConfig() ? JSON.stringify(window.FirebaseSync.getSavedConfig(), null, 2) : ''}</textarea>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
                  <div style="display: flex; gap: 0.5rem;">
                    ${window.FirebaseSync && window.FirebaseSync.isInitialized ? `
                      <button type="button" class="btn-bento btn-bento-dark btn-sm" onclick="handleManualCloudSync()" style="font-size: 0.78rem; font-weight: 700;">
                        ↺ Force Sync Now
                      </button>
                      <button type="button" class="btn-bento btn-bento-dark btn-sm" onclick="handleDisconnectFirebase()" style="font-size: 0.78rem; color: var(--accent-rose);">
                        Disconnect
                      </button>
                    ` : ''}
                  </div>

                  <div style="display: flex; gap: 0.75rem;">
                    <button type="button" class="btn-bento btn-bento-dark" onclick="closeModal('cloud-sync-modal')">Cancel</button>
                    <button type="submit" class="btn-bento btn-bento-purple" style="font-weight: 800;">
                      ☁️ Save & Connect Cloud Sync
                    </button>
                  </div>
                </div>
              </div>
            </form>

            <!-- Quick Setup Guide for Developer & Sir Irl -->
            <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 1rem 1.15rem; font-size: 0.76rem; color: var(--text-secondary); line-height: 1.55;">
              <strong style="color: var(--bento-orange); display: block; margin-bottom: 0.35rem;">
                📋 3-Step Free Firebase Project Setup:
              </strong>
              <ol style="padding-left: 1.2rem; margin: 0;">
                <li>Go to <strong><a href="https://console.firebase.google.com" target="_blank" style="color: var(--bento-orange); text-decoration: underline;">console.firebase.google.com</a></strong> and click <strong>"Add project"</strong> (Name: <em>rons-chicken-payroll</em>).</li>
                <li>Click <strong>Firestore Database</strong> > <strong>Create Database</strong> > Choose <strong>"Start in test mode"</strong>.</li>
                <li>Go to <strong>Project Settings (⚙️)</strong> > <strong>General</strong> > Under <em>"Your apps"</em> click Web (<strong>&lt;/&gt;</strong>) > Copy the <code>firebaseConfig</code> object and paste it above!</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <!-- Switch User & Cashier PIN Modal -->
      <div id="switch-user-modal" class="modal-backdrop">
        <div class="modal-card" style="max-width: 520px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <h3 style="color: var(--text-primary); font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
              🔒 Switch User / Cashier PIN
            </h3>
            <button class="btn-bento btn-bento-dark btn-sm" onclick="closeModal('switch-user-modal')">✕</button>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
            Select user profile to activate terminal permissions. Cashiers only have access to POS, daily chicken counts, and remittance.
          </p>

          <form onsubmit="ErpModules.handleAuthenticatePin(event)">
            <div style="display: grid; gap: 1rem;">
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.4rem; color: var(--text-secondary);">Select Account / Cashier</label>
                <select id="switch-user-select" style="width: 100%; padding: 0.75rem 1rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 0.9rem;">
                  ${((window.DB && typeof window.DB.getUsers === 'function') ? window.DB.getUsers() : []).map(u => `
                    <option value="${u.id}" ${u.id === currentUser.id ? 'selected' : ''}>
                      ${u.avatar || '👤'} ${u.name} (${u.cashierShift || u.role})
                    </option>
                  `).join('')}
                </select>
              </div>

              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.4rem; color: var(--text-secondary);">4-Digit PIN Code</label>
                <input type="password" id="switch-user-pin" maxlength="6" placeholder="PIN: Sir Irl (8888), Cashier 1 (1111), Cashier 2 (2222)" style="width: 100%; padding: 0.75rem 1rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 1.1rem; letter-spacing: 0.2em; text-align: center;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.4rem; font-size: 0.75rem; color: var(--text-muted);">
                  <span>Default PINs: Sir Irl (8888) • Cashier 1 (1111) • Cashier 2 (2222) • Cashier 3 (3333)</span>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; flex-wrap: wrap; gap: 0.5rem;">
                <button type="button" class="btn-bento btn-bento-dark btn-sm" onclick="ErpModules.quickSwitchUser(document.getElementById('switch-user-select').value)">
                  ⚡ Quick Switch (Bypass PIN)
                </button>
                <div style="display: flex; gap: 0.5rem;">
                  <button type="button" class="btn-bento btn-bento-dark" onclick="closeModal('switch-user-modal')">Cancel</button>
                  <button type="submit" class="btn-bento btn-bento-orange" style="font-weight: 800;">Unlock &amp; Switch</button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Log Roasting Spit Batch Modal -->
      <div id="inventory-batch-modal" class="modal-backdrop">
        <div class="modal-card" style="max-width: 520px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <h3 style="color: var(--text-primary); font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
              🔥 Log Roasting Spit Batch
            </h3>
            <button class="btn-bento btn-bento-dark btn-sm" onclick="closeModal('inventory-batch-modal')">✕</button>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
            Record freshly roasted chicken heads and pork liempo slabs transferred from rotisserie charcoal spits to counter.
          </p>

          <form onsubmit="ErpModules.handleSaveRoastBatch(event)">
            <div style="display: grid; gap: 1rem;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.4rem; color: var(--text-secondary);">Batch Time</label>
                  <input type="text" id="batch-time" value="${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}" required style="width: 100%; padding: 0.75rem 1rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 0.9rem;">
                </div>
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.4rem; color: var(--text-secondary);">Roast Master on Duty</label>
                  <select id="batch-roaster" style="width: 100%; padding: 0.75rem 1rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 0.9rem;">
                    <option value="Argie Daliva (Senior Roaster)">Argie Daliva (Senior Roaster)</option>
                    <option value="Gerald Lacasa (Roaster)">Gerald Lacasa (Roaster)</option>
                    <option value="Gerald Ladasa (Roaster)">Gerald Ladasa (Roaster)</option>
                    <option value="Ronald Sedon (Operations)">Ronald Sedon (Operations)</option>
                    <option value="Sherwin Cagas (Staff)">Sherwin Cagas (Staff)</option>
                  </select>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.4rem; color: var(--text-secondary);">Whole Chickens (Heads)</label>
                  <input type="number" id="batch-chickens" min="1" max="100" value="25" required style="width: 100%; padding: 0.75rem 1rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 1.1rem; font-weight: 700;">
                </div>
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.4rem; color: var(--text-secondary);">Pork Liempo (Slabs)</label>
                  <input type="number" id="batch-liempo" min="0" max="50" value="8" required style="width: 100%; padding: 0.75rem 1rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 1.1rem; font-weight: 700;">
                </div>
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem;">
                <button type="button" class="btn-bento btn-bento-dark" onclick="closeModal('inventory-batch-modal')">Cancel</button>
                <button type="submit" class="btn-bento btn-bento-orange" style="font-weight: 800;">🔥 Save Spit Batch</button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Daily Chicken Stock Reconciliation Sheet Modal -->
      <div id="inventory-daily-modal" class="modal-backdrop">
        <div class="modal-card" style="max-width: 640px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <h3 style="color: var(--text-primary); font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
              🍗 Daily Chicken Stock Reconciliation
            </h3>
            <button class="btn-bento btn-bento-dark btn-sm" onclick="closeModal('inventory-daily-modal')">✕</button>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
            Reconcile physical whole chicken inventory: Beginning + Roasted - Sold - Spoilage = Ending Warmer Count.
          </p>

          <form onsubmit="ErpModules.handleSaveDailyInventory(event)">
            <div style="display: grid; gap: 1rem;">
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.4rem; color: var(--text-secondary);">Sheet Date</label>
                  <input type="date" id="inv-date" value="${new Date().toISOString().split('T')[0]}" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 0.85rem;">
                </div>
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.4rem; color: var(--text-secondary);">Cashier on Duty</label>
                  <input type="text" id="inv-cashier" value="${currentUser.name}" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 0.85rem;">
                </div>
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.4rem; color: var(--text-secondary);">Roast Lead</label>
                  <input type="text" id="inv-roaster" value="Argie Daliva" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 0.85rem;">
                </div>
              </div>

              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                <div>
                  <label style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.35rem;">Beginning Stock</label>
                  <input type="number" id="inv-beg-chicken" value="6" min="0" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-weight: 700;">
                </div>
                <div>
                  <label style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.35rem;">Deliveries (Raw)</label>
                  <input type="number" id="inv-recv-chicken" value="85" min="0" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-weight: 700;">
                </div>
                <div>
                  <label style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.35rem;">Total Roasted</label>
                  <input type="number" id="inv-roasted-chicken" value="85" min="0" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--bento-orange); font-weight: 800;">
                </div>
              </div>

              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                <div>
                  <label style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.35rem;">Sold Whole Chicken</label>
                  <input type="number" id="inv-sold-whole" value="76" min="0" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-weight: 700;">
                </div>
                <div>
                  <label style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.35rem;">Sold Half Chicken</label>
                  <input type="number" id="inv-sold-half" value="14" min="0" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-weight: 700;">
                </div>
                <div>
                  <label style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.35rem;">Sold Liempo Slabs</label>
                  <input type="number" id="inv-sold-liempo" value="22" min="0" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-weight: 700;">
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                  <label style="display: block; font-size: 0.78rem; font-weight: 700; color: #f43f5e; margin-bottom: 0.35rem;">Burnt / Spoilage (Lacking)</label>
                  <input type="number" id="inv-spoilage" value="1" min="0" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid rgba(244,63,94,0.4); color: #f43f5e; font-weight: 700;">
                </div>
                <div>
                  <label style="display: block; font-size: 0.78rem; font-weight: 700; color: #10b981; margin-bottom: 0.35rem;">Actual Ending Warmer Count</label>
                  <input type="number" id="inv-ending-chicken" value="7" min="0" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid rgba(16,185,129,0.4); color: #10b981; font-weight: 800;">
                </div>
              </div>

              <div>
                <label style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.35rem;">Reconciliation Remarks</label>
                <input type="text" id="inv-notes" placeholder="e.g. 1 whole chicken overcooked on spit 2, balanced ending count" style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 0.85rem;">
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem;">
                <button type="button" class="btn-bento btn-bento-dark" onclick="closeModal('inventory-daily-modal')">Cancel</button>
                <button type="submit" class="btn-bento btn-bento-orange" style="font-weight: 800;">Save Daily Stock Audit</button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Cashier Shift Sales & Remittance Modal -->
      <div id="remittance-modal" class="modal-backdrop">
        <div class="modal-card" style="max-width: 600px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <h3 style="color: var(--text-primary); font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
              💰 Cashier Shift Sales &amp; Safe Remittance
            </h3>
            <button class="btn-bento btn-bento-dark btn-sm" onclick="closeModal('remittance-modal')">✕</button>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
            Enter drawer cash count, GCash collections, and store expenses. Shortages are calculated automatically.
          </p>

          <form onsubmit="ErpModules.handleSaveRemittance(event)">
            <div style="display: grid; gap: 1rem;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Remittance Date</label>
                  <input type="date" id="rem-date" value="${new Date().toISOString().split('T')[0]}" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 0.85rem;">
                </div>
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Shift</label>
                  <select id="rem-shift" style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 0.85rem;">
                    <option value="Morning Shift (06:00 - 14:00)">Morning Shift (06:00 - 14:00)</option>
                    <option value="Evening Shift (14:00 - 22:00)">Evening Shift (14:00 - 22:00)</option>
                    <option value="Relief / Weekend Shift">Relief / Weekend Shift</option>
                  </select>
                </div>
              </div>

              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Cashier Name</label>
                <select id="rem-cashier" style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 0.85rem;">
                  <option value="Chailene Dolido (Cashier 1)">Chailene Dolido (Cashier 1 - Morning)</option>
                  <option value="Pamela Galdo (Cashier 2)">Pamela Galdo (Cashier 2 - Evening)</option>
                  <option value="Relief Cashier (Cashier 3)">Relief Cashier (Cashier 3 - Weekend)</option>
                </select>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Gross Counter Sales (₱)</label>
                  <input type="number" id="rem-gross" step="0.5" placeholder="e.g. 18500" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 1rem; font-weight: 700;">
                </div>
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">GCash / Digital Payments (₱)</label>
                  <input type="number" id="rem-gcash" step="0.5" placeholder="e.g. 2500" value="0" style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 1rem;">
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Store Petty Expenses (₱)</label>
                  <input type="number" id="rem-petty" step="0.5" placeholder="e.g. 450 (Ice/Charcoal)" value="0" style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary);">
                </div>
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: #10b981;">Actual Cash in Envelope (₱)</label>
                  <input type="number" id="rem-actual-cash" step="0.5" placeholder="Counted cash remitted" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid rgba(16,185,129,0.4); color: #10b981; font-size: 1.05rem; font-weight: 800;">
                </div>
              </div>

              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Petty Cash Expense Details</label>
                <input type="text" id="rem-petty-details" placeholder="e.g. 1 sack mangrove charcoal (₱300), Ice (₱150)" style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 0.85rem;">
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem;">
                <button type="button" class="btn-bento btn-bento-dark" onclick="closeModal('remittance-modal')">Cancel</button>
                <button type="submit" class="btn-bento btn-bento-orange" style="font-weight: 800;">💰 Verify &amp; Save Remittance</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    `;
  }
  window.__ronsAppReady = true;
}

function getBrightnessName(level) {
  if (level <= 15) return 'Midnight';
  if (level <= 45) return 'Dark';
  if (level <= 75) return 'Ambient';
  return 'Bright';
}

function renderManagerBentoView() {
  const currentUser = (window.DB && typeof window.DB.getCurrentUser === 'function') 
    ? window.DB.getCurrentUser() 
    : { role: 'admin' };

  if (currentUser && currentUser.role === 'cashier') {
    if (window.ErpModules && typeof window.ErpModules.renderCashierBentoPortal === 'function') {
      try {
        return window.ErpModules.renderCashierBentoPortal();
      } catch (e) {
        console.error("Cashier portal render error:", e);
      }
    }
  }

  try {
    switch (currentView) {
      case 'inventory':
        return (window.ErpModules && typeof window.ErpModules.renderBentoInventory === 'function')
          ? window.ErpModules.renderBentoInventory()
          : '<div class="data-panel-card" style="padding: 2rem;">Inventory Module Loading...</div>';
      case 'remittances':
        return (window.ErpModules && typeof window.ErpModules.renderBentoRemittances === 'function')
          ? window.ErpModules.renderBentoRemittances()
          : '<div class="data-panel-card" style="padding: 2rem;">Remittances Module Loading...</div>';
      case 'aiAdvisor':
        return (window.ErpModules && typeof window.ErpModules.renderBentoAiAdvisor === 'function')
          ? window.ErpModules.renderBentoAiAdvisor()
          : '<div class="data-panel-card" style="padding: 2rem;">AI Financial Analyst Loading...</div>';
      case 'users':
        return (window.ErpModules && typeof window.ErpModules.renderBentoUsers === 'function')
          ? window.ErpModules.renderBentoUsers()
          : '<div class="data-panel-card" style="padding: 2rem;">User Permissions Loading...</div>';
      case 'attendance':
        return renderBentoAttendance();
      case 'payroll':
        return renderBentoPayroll();
      case 'advances':
      case 'deductions':
        return renderBentoAdvances();
      case 'device':
        return renderBentoDevice();
      case 'dashboard':
      default:
        return renderManagerBentoDashboard();
    }
  } catch (err) {
    console.error("Render view error:", err);
    return `
      <div class="data-panel-card" style="padding: 2.5rem; text-align: center;">
        <h3 style="color: var(--accent-rose); margin-bottom: 0.5rem;">View Loading Notice</h3>
        <p style="color: var(--text-secondary); margin-bottom: 1rem;">An unexpected issue occurred while rendering: ${err.message}</p>
        <button class="btn-bento btn-bento-orange" onclick="navigateTo('dashboard')">Return to Overview</button>
      </div>
    `;
  }
}

/* ==========================================================================
   Manager Bento Dashboard & Views
   ========================================================================== */

function renderCutoffControlBar() {
  const cutoffs = (window.DB && typeof window.DB.getCutoffs === 'function') ? window.DB.getCutoffs() : [];
  const isCustom = !cutoffs.some(c => c.id === activeCutoff.id);

  return `
    <div class="cutoff-control-bar" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 0.85rem 1.25rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
      <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 0.4rem; color: var(--bento-orange); font-weight: 800; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em;">
          📅 Active Payroll Cutoff:
        </div>
        <select id="cutoff-preset-selector" onchange="handleCutoffSelectChange(this.value)" style="padding: 0.5rem 0.85rem; border-radius: var(--radius-sm); background: var(--bg-card-dark); border: 1px solid var(--border-glass); color: var(--text-primary); font-size: 0.85rem; font-weight: 700; cursor: pointer;">
          ${cutoffs.map(c => `
            <option value="${c.id}" ${c.id === activeCutoff.id ? 'selected' : ''}>${c.name}</option>
          `).join('')}
          <option value="custom" ${isCustom ? 'selected' : ''}>⚙️ Custom Date Range...</option>
        </select>
      </div>

      <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem; color: var(--text-secondary);">
          <span>From:</span>
          <input type="date" id="cutoff-start-input" value="${activeCutoff.startDate}" style="padding: 0.45rem 0.65rem; border-radius: var(--radius-sm); background: var(--bg-card-dark); border: 1px solid var(--border-glass); color: var(--text-primary); font-size: 0.82rem; font-weight: 600;">
        </div>
        <div style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem; color: var(--text-secondary);">
          <span>To:</span>
          <input type="date" id="cutoff-end-input" value="${activeCutoff.endDate}" style="padding: 0.45rem 0.65rem; border-radius: var(--radius-sm); background: var(--bg-card-dark); border: 1px solid var(--border-glass); color: var(--text-primary); font-size: 0.82rem; font-weight: 600;">
        </div>
        <button class="btn-bento btn-bento-orange btn-sm" style="font-weight: 800; padding: 0.45rem 0.85rem; display: inline-flex; align-items: center; gap: 0.35rem;" onclick="handleApplyCustomCutoffDates()" title="Recalculate entire branch payroll and timecards for these dates">
          ⚡ Apply & Recalculate
        </button>
        <button class="btn-bento btn-bento-dark btn-sm" style="padding: 0.45rem 0.75rem;" onclick="openModal('new-cutoff-modal')" title="Save as New Named Cutoff Period">
          + New Cutoff
        </button>
      </div>
    </div>
  `;
}

function renderManagerBentoDashboard() {
  const employees = safeGetEmployees();
  const summary = cachedPayrollSummary || (window.PayrollEngine && typeof window.PayrollEngine.runBranchPayroll === 'function' ? window.PayrollEngine.runBranchPayroll(activeCutoff) : { totals: { net: 0, gross: 0 }, records: [] });
  const inv = (window.DB && typeof window.DB.getInventory === 'function') ? window.DB.getInventory() : { dailySheets: [] };
  const todaySheet = (inv.dailySheets && inv.dailySheets.length > 0) ? inv.dailySheets[0] : { totalRoastedChicken: 85, soldWholeChicken: 76, actualEndingChicken: 7, varianceChicken: 0 };
  const remittances = (window.DB && typeof window.DB.getRemittances === 'function') ? window.DB.getRemittances() : [];
  const totalRemitted = remittances.reduce((s, r) => s + (Number(r.actualCashCounted) || 0), 0);
  const deductions = (window.DB && typeof window.DB.getDeductions === 'function') ? window.DB.getDeductions() : [];
  const activeDeductionsBalance = deductions.filter(d => d.status === 'Active').reduce((s, d) => s + Math.max(0, (Number(d.amount) || 0) - (Number(d.deducted) || 0)), 0);

  return `
    <!-- Top Welcome Banner -->
    <div class="user-welcome-banner">
      <div class="user-welcome-info">
        <div class="user-avatar-circle" style="background: var(--bento-orange); color: #fff;">🍗</div>
        <div class="user-welcome-text">
          <h1>Welcome, Sir Irl &amp; Management</h1>
          <p>Ron's Chicken Cugman • Custom ERP, Inventory &amp; Payroll Suite</p>
        </div>
      </div>
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <button class="btn-bento btn-bento-orange" onclick="openModal('inventory-batch-modal')">
          ${ICONS.flame} + Log Roast Batch
        </button>
        <button class="btn-bento btn-bento-purple" onclick="openModal('remittance-modal')">
          ${ICONS.money} + Record Remittance
        </button>
        <button class="btn-bento btn-bento-dark" onclick="openAdvanceModal()">
          ${ICONS.receipt} + Add Utang / CA
        </button>
        <button class="btn-bento btn-bento-white" onclick="generateAllBatchPayslips()">
          ${ICONS.print} Batch Payslips (31 Staff)
        </button>
      </div>
    </div>

    <!-- Cutoff Period Controller Bar -->
    ${renderCutoffControlBar()}

    <!-- Comprehensive ERP Bento Grid Cards -->
    <div class="bento-grid">
      
      <!-- Big Orange Bento Card: Lechon Manok & Liempo Inventory -->
      <div class="bento-card bento-orange col-6" onclick="navigateTo('inventory')" style="cursor: pointer;">
        <div class="bento-card-header">
          <div class="bento-badge-circle">${ICONS.chicken}</div>
          <span class="bento-tag">${todaySheet.varianceChicken === 0 ? '✓ Balanced' : '! Discrepancy'}</span>
        </div>
        <div>
          <div class="bento-value">${todaySheet.totalRoastedChicken || 85} Heads Roasted</div>
          <div class="bento-title">Lechon Manok &amp; Liempo Stock</div>
          <div class="bento-meta" style="margin-top: 0.4rem;">
            ${todaySheet.soldWholeChicken || 76} Sold • ${todaySheet.actualEndingChicken || 7} Display Ending • Click to view spit batches &amp; reconciliation
          </div>
        </div>
      </div>

      <!-- Electric Purple Bento Card: Cashier Remittances & Sales -->
      <div class="bento-card bento-purple col-6" onclick="navigateTo('remittances')" style="cursor: pointer;">
        <div class="bento-card-header">
          <div class="bento-badge-circle">${ICONS.money}</div>
          <span class="bento-tag">3 Cashier Shifts</span>
        </div>
        <div>
          <div class="bento-value">₱${totalRemitted.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div class="bento-title">Cashier Sales &amp; Safe Remittances</div>
          <div class="bento-meta" style="margin-top: 0.4rem;">
            Cash drawer audit, GCash receipts &amp; automatic register shortage detection
          </div>
        </div>
      </div>

      <!-- High Contrast White Bento Card: DOLE Payroll & Payslips -->
      <div class="bento-card bento-white col-6" onclick="navigateTo('payroll')" style="cursor: pointer;">
        <div class="bento-card-header">
          <div class="bento-badge-circle">${ICONS.payroll}</div>
          <span class="bento-tag" style="background: #111827; color: #fff;">DOLE / BIR Compliant</span>
        </div>
        <div>
          <div class="bento-value" style="color: #000;">₱${summary.totals.net.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div class="bento-title" style="color: #000;">Payroll Management &amp; Payslips</div>
          <div class="bento-meta" style="color: #4b5563; margin-top: 0.4rem;">
            Gross: ₱${summary.totals.gross.toLocaleString('en-US', { minimumFractionDigits: 2 })} • Split statutory contributions &amp; 1-click batch payslips
          </div>
        </div>
      </div>

      <!-- Deductions Bento Card: Utang, CA, Shortages, Lacking -->
      <div class="bento-card bento-purple col-6" onclick="navigateTo('advances')" style="cursor: pointer;">
        <div class="bento-card-header">
          <div class="bento-badge-circle">${ICONS.receipt}</div>
          <span class="bento-tag">Utang / CA / Shortages</span>
        </div>
        <div>
          <div class="bento-value">₱${activeDeductionsBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div class="bento-title">Staff Credit &amp; Deductions Ledger</div>
          <div class="bento-meta" style="margin-top: 0.4rem;">
            Sections for Utang loans, Cash Advances (Vale), Cashier Shortages &amp; Lacking chicken
          </div>
        </div>
      </div>

      <!-- AI Financial Analyst & CFO Health Scorecard -->
      <div class="bento-card bento-dark col-8" onclick="navigateTo('aiAdvisor')" style="cursor: pointer; border: 1px solid rgba(139, 92, 246, 0.4); background: linear-gradient(135deg, rgba(121, 40, 202, 0.12) 0%, rgba(255, 85, 0, 0.08) 100%);">
        <div class="bento-card-header">
          <div class="bento-badge-circle" style="background: rgba(139, 92, 246, 0.2); color: #c4b5fd;">${ICONS.ai}</div>
          <span class="pill pill-purple" style="font-size: 0.75rem; font-weight: 800;">Health Score: 92/100</span>
        </div>
        <div>
          <div class="bento-value" style="color: #ffffff; font-size: 1.6rem;">
            AI Financial Advisor: ~19.8% Labor Ratio
          </div>
          <div class="bento-title" style="color: var(--bento-orange);">
            Optimal Roasting Spit Scheduling &amp; Liempo Margin Boost
          </div>
          <div class="bento-meta" style="margin-top: 0.4rem;">
            Click to explore 4 actionable profit playbooks and run interactive CFO simulations
          </div>
        </div>
      </div>

      <!-- User Permissions & 3 Cashiers Card -->
      <div class="bento-card bento-orange col-4" onclick="navigateTo('users')" style="cursor: pointer;">
        <div class="bento-card-header">
          <div class="bento-badge-circle">${ICONS.users}</div>
          <span class="bento-tag">RBAC Security</span>
        </div>
        <div>
          <div class="bento-value">3 Cashiers</div>
          <div class="bento-title">User Roles &amp; Permissions</div>
          <div class="bento-meta" style="margin-top: 0.4rem;">
            Configure 4-digit PINs, shift assignments &amp; access controls
          </div>
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
  const employees = safeGetEmployees();
  const shifts = safeGetShifts();

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

    <!-- Cutoff Period Controller Bar -->
    ${renderCutoffControlBar()}

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

    <!-- Cutoff Period Controller Bar -->
    ${renderCutoffControlBar()}

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

let currentDeductionFilter = 'all';

function setDeductionFilter(category) {
  currentDeductionFilter = category;
  renderApp();
}
window.setDeductionFilter = setDeductionFilter;

function getDeductionCategoryKey(item) {
  const cat = (item.category || '').toLowerCase();
  const typ = (item.type || '').toLowerCase();
  if (cat === 'utang' || typ.includes('utang') || typ.includes('loan')) return 'utang';
  if (cat === 'ca' || typ.includes('cash advance') || typ.includes('vale')) return 'ca';
  if (cat === 'shortage' || typ.includes('shortage')) return 'shortage';
  if (cat === 'lacking' || typ.includes('lacking') || typ.includes('chicken')) return 'lacking';
  return 'other';
}

function getDeductionBadgeHtml(item) {
  const key = getDeductionCategoryKey(item);
  switch (key) {
    case 'utang':
      return `<span class="deduction-badge badge-utang">📝 Utang / Credit</span>`;
    case 'ca':
      return `<span class="deduction-badge badge-ca">💵 Cash Advance (Vale)</span>`;
    case 'shortage':
      return `<span class="deduction-badge badge-shortage">⚠️ Cashier Shortage</span>`;
    case 'lacking':
      return `<span class="deduction-badge badge-lacking">🍗 Lacking Chicken</span>`;
    default:
      return `<span class="deduction-badge badge-other">${item.category || item.type || 'Other'}</span>`;
  }
}

function renderBentoAdvances() {
  const allDeductions = safeGetDeductions();
  const activeList = allDeductions.filter(a => a.status === 'Active');
  
  // Outstanding balances
  const totalBalance = activeList.reduce((s, a) => s + Math.max(0, (Number(a.amount) || 0) - (Number(a.deducted) || 0)), 0);
  const totalCutoffDeduct = activeList.reduce((s, a) => {
    const rem = Math.max(0, (Number(a.amount) || 0) - (Number(a.deducted) || 0));
    return s + (a.deductionPerCutoff ? Math.min(Number(a.deductionPerCutoff), rem) : rem);
  }, 0);

  // Category subtotals
  const utangAndCaBalance = activeList
    .filter(a => ['utang', 'ca'].includes(getDeductionCategoryKey(a)))
    .reduce((s, a) => s + Math.max(0, (Number(a.amount) || 0) - (Number(a.deducted) || 0)), 0);

  const shortagesAndLackingBalance = activeList
    .filter(a => ['shortage', 'lacking'].includes(getDeductionCategoryKey(a)))
    .reduce((s, a) => s + Math.max(0, (Number(a.amount) || 0) - (Number(a.deducted) || 0)), 0);

  // Counts by category
  const countAll = allDeductions.length;
  const countUtang = allDeductions.filter(a => getDeductionCategoryKey(a) === 'utang').length;
  const countCa = allDeductions.filter(a => getDeductionCategoryKey(a) === 'ca').length;
  const countShortages = allDeductions.filter(a => getDeductionCategoryKey(a) === 'shortage').length;
  const countLacking = allDeductions.filter(a => getDeductionCategoryKey(a) === 'lacking').length;

  const currentFilter = currentDeductionFilter || 'all';
  const displayedList = (currentFilter === 'all')
    ? allDeductions
    : allDeductions.filter(a => getDeductionCategoryKey(a) === currentFilter);

  return `
    <div class="user-welcome-banner">
      <div>
        <h1 style="color: var(--text-primary); font-size: 1.75rem;">Staff Credit &amp; Deductions Ledger</h1>
        <p style="color: var(--text-secondary);">
          Itemized accounting for <strong>Utang (Store Credit / Loans)</strong>, <strong>Cash Advances (Vale)</strong>, <strong>Cashier Shortages</strong> &amp; <strong>Lacking Products</strong>
        </p>
      </div>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <button class="btn-bento btn-bento-orange" onclick="openAdvanceModal()">
          ${ICONS.receipt} + Record Deduction / Vale
        </button>
      </div>
    </div>

    <!-- Quick Stats Bento Grid -->
    <div class="bento-grid" style="margin-bottom: 1.5rem;">
      <div class="bento-card bento-purple col-3">
        <div class="bento-badge-circle">${ICONS.receipt}</div>
        <div class="bento-value">₱${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        <div class="bento-title">Active Deductions Balance</div>
        <div class="bento-meta">${activeList.length} total active items across branch staff</div>
      </div>

      <div class="bento-card bento-orange col-3">
        <div class="bento-badge-circle">${ICONS.payroll}</div>
        <div class="bento-value">₱${totalCutoffDeduct.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        <div class="bento-title">Cutoff Deduction</div>
        <div class="bento-meta">Auto-deducted from gross earnings this cutoff</div>
      </div>

      <div class="bento-card bento-dark col-3">
        <div class="bento-badge-circle" style="background: rgba(245, 158, 11, 0.2); color: #f59e0b;">${ICONS.money}</div>
        <div class="bento-value">₱${utangAndCaBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        <div class="bento-title">Utang &amp; Cash Advances</div>
        <div class="bento-meta">Store loans &amp; emergency vale accounts</div>
      </div>

      <div class="bento-card bento-dark col-3" style="border-left: 3px solid var(--accent-rose);">
        <div class="bento-badge-circle" style="background: rgba(244, 63, 94, 0.2); color: var(--accent-rose);">${ICONS.alert}</div>
        <div class="bento-value">₱${shortagesAndLackingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        <div class="bento-title">Shortages &amp; Lacking</div>
        <div class="bento-meta">100% loss recovery on counter &amp; burnt chicken</div>
      </div>
    </div>

    <!-- Category Filter Tabs Bar -->
    <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
      <button class="btn-bento ${currentFilter === 'all' ? 'btn-bento-orange' : 'btn-bento-dark'} btn-sm" onclick="setDeductionFilter('all')">
        All Records (${countAll})
      </button>
      <button class="btn-bento ${currentFilter === 'utang' ? 'btn-bento-orange' : 'btn-bento-dark'} btn-sm" onclick="setDeductionFilter('utang')">
        📝 Utang / Store Credit (${countUtang})
      </button>
      <button class="btn-bento ${currentFilter === 'ca' ? 'btn-bento-orange' : 'btn-bento-dark'} btn-sm" onclick="setDeductionFilter('ca')">
        💵 Cash Advance / Vale (${countCa})
      </button>
      <button class="btn-bento ${currentFilter === 'shortage' ? 'btn-bento-orange' : 'btn-bento-dark'} btn-sm" onclick="setDeductionFilter('shortage')">
        ⚠️ Cashier Shortages (${countShortages})
      </button>
      <button class="btn-bento ${currentFilter === 'lacking' ? 'btn-bento-orange' : 'btn-bento-dark'} btn-sm" onclick="setDeductionFilter('lacking')">
        🍗 Lacking Products (${countLacking})
      </button>
    </div>

    <!-- Deductions Table -->
    <div class="data-panel-card">
      <div class="table-responsive">
        <table class="table-bento">
          <thead>
            <tr>
              <th>Ref ID</th>
              <th>Category</th>
              <th>Staff Member</th>
              <th>Reason / Particulars</th>
              <th>Date</th>
              <th>Total Amount</th>
              <th>Per Cutoff</th>
              <th>Remaining</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${displayedList.length === 0 ? `
              <tr>
                <td colspan="10" style="text-align: center; color: var(--text-muted); padding: 2.5rem;">
                  No deduction records found for category "<strong>${currentFilter.toUpperCase()}</strong>". Click <strong>+ Record Deduction / Vale</strong> to create one.
                </td>
              </tr>
            ` : displayedList.map(item => {
              const remaining = Math.max(0, (Number(item.amount) || 0) - (Number(item.deducted) || 0));
              const cutoffDeduct = item.deductionPerCutoff ? Math.min(Number(item.deductionPerCutoff), remaining) : remaining;
              const isActive = item.status === 'Active';
              return `
                <tr>
                  <td><strong>${item.id}</strong></td>
                  <td>${getDeductionBadgeHtml(item)}</td>
                  <td style="font-weight: 700; color: var(--text-primary);">#${item.employeeId} ${item.employeeName}</td>
                  <td style="color: var(--text-secondary); max-width: 260px; font-size: 0.82rem;">${item.reason || item.type || '-'}</td>
                  <td>${item.date}</td>
                  <td style="font-weight: 800; color: var(--text-primary);">₱${Number(item.amount || 0).toFixed(2)}</td>
                  <td style="font-weight: 700; color: var(--accent-rose);">-₱${cutoffDeduct.toFixed(2)}</td>
                  <td style="font-weight: 800; color: ${remaining > 0 ? 'var(--bento-orange)' : 'var(--accent-emerald)'};">
                    ₱${remaining.toFixed(2)}
                  </td>
                  <td>
                    <span class="pill ${isActive ? 'pill-orange' : 'pill-emerald'}">${item.status}</span>
                  </td>
                  <td>
                    <div style="display: flex; gap: 0.4rem;">
                      <button class="btn-bento btn-bento-dark btn-sm" style="font-size: 0.72rem; padding: 0.25rem 0.6rem;" onclick="toggleAdvanceStatus('${item.id}')" title="${isActive ? 'Mark as Paid / Settled' : 'Reactivate'}">
                        ${isActive ? '✓ Settle' : '↺ Reactivate'}
                      </button>
                      <button class="btn-bento btn-bento-dark btn-sm" style="font-size: 0.72rem; color: var(--accent-rose); padding: 0.25rem 0.6rem;" onclick="deleteAdvanceEntry('${item.id}')" title="Delete">
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
  const autoBackups = (window.DB && typeof window.DB.getAutoBackups === 'function') ? window.DB.getAutoBackups() : [];
  const lastBackupStr = autoBackups.length > 0 ? autoBackups[0].formattedDate : 'Just now';

  return `
    <div class="user-welcome-banner">
      <div>
        <h1 style="color: var(--text-primary); font-size: 1.75rem;">Deli e3960 & Data Management</h1>
        <p style="color: var(--text-secondary);">Biometric Hardware, Persistent Storage & Continuous Auto-Backups</p>
      </div>
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <button class="btn-bento btn-bento-orange" onclick="handleDownloadBackup()">
          ${ICONS.download} Export Backup (.json)
        </button>
        <button class="btn-bento btn-bento-purple" onclick="openModal('backup-modal')">
          ${ICONS.database} Backup & Data Center
        </button>
      </div>
    </div>

    <div class="bento-grid">
      <!-- Deli e3960 Hardware Card -->
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

      <!-- Continuous Auto-Backup & Safety Card -->
      <div class="bento-card bento-white col-6" onclick="openModal('backup-modal')" style="cursor: pointer;">
        <div class="bento-card-header">
          <div class="bento-badge-circle" style="background: #10b981; color: #fff;">${ICONS.database}</div>
          <span class="bento-tag" style="background: #10b981; color: #fff;">Continuous Auto-Backup</span>
        </div>
        <div>
          <div class="bento-value" style="color: #000; font-size: 1.5rem;">Auto-Saved</div>
          <div class="bento-title" style="color: #000;">Persistent Local Storage</div>
          <div class="bento-meta" style="color: #4b5563; margin-top: 0.4rem;">
            Last auto-snapshot: ${lastBackupStr}<br>
            Click to download or restore .json backup
          </div>
        </div>
      </div>

      <!-- Cloud Sync Future Ready -->
      <div class="bento-card bento-purple col-12">
        <div class="bento-card-header">
          <div class="bento-badge-circle">${ICONS.settings}</div>
          <span class="bento-tag">Future Cloud Ready</span>
        </div>
        <div>
          <div class="bento-value">Cloud Sync</div>
          <div class="bento-title">Internet Push Endpoint</div>
          <div class="bento-meta" style="margin-top: 0.4rem;">
            ADMS Server URL: <code>https://ronschicken.cloud/api/biometrics/push</code> • Automatically syncs future WiFi-enabled biometric clocks.
          </div>
        </div>
      </div>
    </div>

    <!-- Data Safety & Recovery Panel -->
    <div class="data-panel-card" style="margin-top: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
        <h3 style="color: var(--text-primary); font-size: 1.2rem; display: flex; align-items: center; gap: 0.5rem;">
          ${ICONS.database} Data Protection & Backup Center
        </h3>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button class="btn-bento btn-bento-orange btn-sm" onclick="handleDownloadBackup()">
            ${ICONS.download} Download .json Backup
          </button>
          <button class="btn-bento btn-bento-purple btn-sm" onclick="document.getElementById('device-backup-input').click()">
            ${ICONS.upload} Restore from .json
          </button>
          <input type="file" id="device-backup-input" style="display: none;" accept=".json" onchange="handleImportBackupFile(event)">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; font-size: 0.85rem; color: var(--text-secondary);">
        <div style="background: var(--bg-surface); padding: 1.25rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
          <strong style="color: var(--text-primary); display: block; margin-bottom: 0.4rem;">🛡️ How Continuous Auto-Backup Works</strong>
          Your data is automatically saved to high-speed persistent browser storage (IndexedDB / LocalStorage). Even if you refresh or close your browser, your 31 staff profiles, wage rates, statutory settings, and attendance records remain 100% intact.
        </div>
        <div style="background: var(--bg-surface); padding: 1.25rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
          <strong style="color: var(--text-primary); display: block; margin-bottom: 0.4rem;">💻 Switching Computers or OS Updates</strong>
          Before performing major computer maintenance or if you want to run payroll from a home laptop or tablet, simply click <strong>"Download .json Backup"</strong>. You can restore it on any device in 1 second!
        </div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   Staff Self-Service Bento PWA (Mobile First)
   ========================================================================== */

function renderStaffBentoPortal() {
  const employees = safeGetEmployees();
  const currentEmp = (window.DB && typeof window.DB.getEmployeeById === 'function' ? window.DB.getEmployeeById(selectedStaffEmployeeId) : null) || employees[0] || { id: 1, name: "Staff Member", position: "Staff", dailyRate: 438 };
  const shifts = safeGetShifts();
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
  
  // Fetch active deductions for employee
  const allDeductions = safeGetDeductions().filter(a => a.employeeId === emp.id && a.status === 'Active');

  const valeList = allDeductions.filter(a => {
    const cat = (a.category || '').toLowerCase();
    const typ = (a.type || '').toLowerCase();
    return cat === 'ca' || typ.includes('cash advance') || typ.includes('vale');
  });
  const valeDeduct = valeList.reduce((sum, a) => {
    const remaining = Math.max(0, (Number(a.amount) || 0) - (Number(a.deducted) || 0));
    return sum + (a.deductionPerCutoff ? Math.min(Number(a.deductionPerCutoff), remaining) : remaining);
  }, 0);

  const utangList = allDeductions.filter(a => {
    const cat = (a.category || '').toLowerCase();
    const typ = (a.type || '').toLowerCase();
    return cat === 'utang' || typ.includes('utang') || typ.includes('loan');
  });
  const utangDeduct = utangList.reduce((sum, a) => {
    const remaining = Math.max(0, (Number(a.amount) || 0) - (Number(a.deducted) || 0));
    return sum + (a.deductionPerCutoff ? Math.min(Number(a.deductionPerCutoff), remaining) : remaining);
  }, 0);

  const shortageList = allDeductions.filter(a => {
    const cat = (a.category || '').toLowerCase();
    const typ = (a.type || '').toLowerCase();
    return cat === 'shortage' || typ.includes('shortage');
  });
  const shortageDeduct = shortageList.reduce((sum, a) => {
    const remaining = Math.max(0, (Number(a.amount) || 0) - (Number(a.deducted) || 0));
    return sum + (a.deductionPerCutoff ? Math.min(Number(a.deductionPerCutoff), remaining) : remaining);
  }, 0);

  const lackingList = allDeductions.filter(a => {
    const cat = (a.category || '').toLowerCase();
    const typ = (a.type || '').toLowerCase();
    return cat === 'lacking' || typ.includes('lacking') || typ.includes('chicken');
  });
  const lackingDeduct = lackingList.reduce((sum, a) => {
    const remaining = Math.max(0, (Number(a.amount) || 0) - (Number(a.deducted) || 0));
    return sum + (a.deductionPerCutoff ? Math.min(Number(a.deductionPerCutoff), remaining) : remaining);
  }, 0);

  const accountedIds = new Set([...valeList, ...utangList, ...shortageList, ...lackingList].map(x => x.id));
  const otherList = allDeductions.filter(a => !accountedIds.has(a.id));
  const otherDeduct = otherList.reduce((sum, a) => {
    const remaining = Math.max(0, (Number(a.amount) || 0) - (Number(a.deducted) || 0));
    return sum + (a.deductionPerCutoff ? Math.min(Number(a.deductionPerCutoff), remaining) : remaining);
  }, 0);

  const payroll = window.PayrollEngine.computeEmployeePayroll(emp, timecard, {
    cashAdvanceDeduction: valeDeduct,
    utangDeduction: utangDeduct,
    shortageDeduction: shortageDeduct,
    lackingProductDeduction: lackingDeduct,
    otherDeductions: otherDeduct,
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
        <div class="payslip-meta-right" style="text-align: right; white-space: nowrap; flex-shrink: 0;">
          <div style="font-weight: 800; font-size: 1.1rem; color: #111827; letter-spacing: 0.02em;">OFFICIAL PAYSLIP</div>
          <div style="font-size: 0.78rem; font-weight: 600; color: #374151; white-space: nowrap; margin-top: 0.2rem;">
            Period: ${activeCutoff.startDate} to ${activeCutoff.endDate}
          </div>
          <div style="font-size: 0.72rem; color: #6b7280; white-space: nowrap; margin-top: 0.15rem;">Date Issued: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
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
          ${utangDeduct > 0 ? `
            <div class="payslip-row">
              <span>Utang (Store Credit / Loans):</span>
              <span style="color: var(--accent-rose); font-weight: 700;">-₱${utangDeduct.toFixed(2)}</span>
            </div>
          ` : ''}
          ${valeDeduct > 0 ? `
            <div class="payslip-row">
              <span>Cash Advance (Vale):</span>
              <span style="color: var(--accent-rose); font-weight: 700;">-₱${valeDeduct.toFixed(2)}</span>
            </div>
          ` : ''}
          ${shortageDeduct > 0 ? `
            <div class="payslip-row">
              <span>Cashier Shortages:</span>
              <span style="color: var(--accent-rose); font-weight: 700;">-₱${shortageDeduct.toFixed(2)}</span>
            </div>
          ` : ''}
          ${lackingDeduct > 0 ? `
            <div class="payslip-row">
              <span>Lacking Products (Chicken):</span>
              <span style="color: var(--accent-rose); font-weight: 700;">-₱${lackingDeduct.toFixed(2)}</span>
            </div>
          ` : ''}
          ${otherDeduct > 0 ? `
            <div class="payslip-row">
              <span>Other Deductions:</span>
              <span style="color: var(--accent-rose); font-weight: 700;">-₱${otherDeduct.toFixed(2)}</span>
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
  const employees = safeGetEmployees();
  const content = document.getElementById('payslip-printable-content');
  if (!content) return;

  const activeEmployees = employees.filter(e => {
    const shifts = safeGetShifts();
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
  const employees = safeGetEmployees();
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
  const emp = (window.DB && typeof window.DB.getEmployeeById === 'function') ? window.DB.getEmployeeById(empId) : null;
  if (!emp) return;

  const type = document.getElementById('adv-type').value;
  const date = document.getElementById('adv-date').value;
  const amount = parseFloat(document.getElementById('adv-amount').value) || 0;
  const cutoffVal = document.getElementById('adv-cutoff-deduct').value;
  const cutoffDeduct = cutoffVal ? parseFloat(cutoffVal) : amount;
  const reason = document.getElementById('adv-reason').value || type;

  // Classify category
  let category = 'Other';
  const typeLower = type.toLowerCase();
  if (typeLower.includes('utang') || typeLower.includes('loan')) category = 'Utang';
  else if (typeLower.includes('cash advance') || typeLower.includes('vale')) category = 'CA';
  else if (typeLower.includes('shortage')) category = 'Shortage';
  else if (typeLower.includes('lacking') || typeLower.includes('chicken')) category = 'Lacking';

  const prefix = (category === 'Utang') ? 'UT' : (category === 'CA') ? 'CA' : (category === 'Shortage') ? 'SH' : (category === 'Lacking') ? 'LP' : 'DED';

  const newDeduction = {
    id: `${prefix}-${Date.now().toString().slice(-4)}`,
    employeeId: emp.id,
    employeeName: emp.name,
    category,
    type,
    date,
    amount,
    deductionPerCutoff: cutoffDeduct,
    deducted: 0,
    reason,
    status: 'Active'
  };

  if (window.DB && typeof window.DB.addDeduction === 'function') {
    window.DB.addDeduction(newDeduction);
  } else if (window.DB && typeof window.DB.addAdvance === 'function') {
    window.DB.addAdvance(newDeduction);
  }

  if (window.PayrollEngine && typeof window.PayrollEngine.runBranchPayroll === 'function') {
    cachedPayrollSummary = window.PayrollEngine.runBranchPayroll(activeCutoff);
  }
  closeModal('advance-modal');
  renderApp();
}

function toggleAdvanceStatus(id) {
  const deductions = safeGetDeductions();
  const ded = deductions.find(a => a.id === id);
  if (!ded) return;
  ded.status = (ded.status === 'Active') ? 'Settled' : 'Active';
  if (ded.status === 'Settled') {
    ded.deducted = ded.amount;
  }
  if (window.DB && typeof window.DB.updateDeduction === 'function') {
    window.DB.updateDeduction(ded);
  } else if (window.DB && typeof window.DB.updateAdvance === 'function') {
    window.DB.updateAdvance(ded);
  }
  if (window.PayrollEngine && typeof window.PayrollEngine.runBranchPayroll === 'function') {
    cachedPayrollSummary = window.PayrollEngine.runBranchPayroll(activeCutoff);
  }
  renderApp();
}

function deleteAdvanceEntry(id) {
  if (confirm("Are you sure you want to remove this deduction entry?")) {
    if (window.DB && typeof window.DB.deleteDeduction === 'function') {
      window.DB.deleteDeduction(id);
    } else if (window.DB && typeof window.DB.deleteAdvance === 'function') {
      window.DB.deleteAdvance(id);
    }
    if (window.PayrollEngine && typeof window.PayrollEngine.runBranchPayroll === 'function') {
      cachedPayrollSummary = window.PayrollEngine.runBranchPayroll(activeCutoff);
    }
    renderApp();
  }
}

function openEmployeeModal(employeeId) {
  const employees = safeGetEmployees();
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

function openBackupModal() {
  openModal('backup-modal');
}

function handleDownloadBackup() {
  if (window.DB && typeof window.DB.downloadBackupJson === 'function') {
    window.DB.downloadBackupJson();
    alert("✅ Payroll Backup Downloaded!\n\nAll 31 staff records, wage rates, statutory settings, vale ledger, and attendance history have been exported to your computer.");
  }
}

function handleImportBackupFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const content = e.target.result;
      const res = window.DB.importBackupJson(content);
      if (res.success) {
        alert("✅ Backup Restored Successfully!\n\n" + res.message);
        cachedPayrollSummary = window.PayrollEngine.runBranchPayroll(activeCutoff);
        closeModal('backup-modal');
        renderApp();
      } else {
        alert("❌ Error Restoring Backup: " + (res.error || "Unknown format"));
      }
    } catch (err) {
      alert("❌ Could not read backup file: " + err.message);
    }
  };
  reader.readAsText(file);
}

function handleRestoreSnapshot(snapshotId) {
  if (!snapshotId) {
    alert("Please select a valid snapshot.");
    return;
  }
  if (!confirm("Are you sure you want to roll back the system to this snapshot? Current data will be replaced with that snapshot.")) {
    return;
  }
  const res = window.DB.restoreAutoSnapshot(snapshotId);
  if (res.success) {
    alert("✅ System Rolled Back Successfully!\n\n" + res.message);
    cachedPayrollSummary = window.PayrollEngine.runBranchPayroll(activeCutoff);
    closeModal('backup-modal');
    renderApp();
  } else {
    alert("❌ Error: " + res.error);
  }
}

function handleResetFactoryConfirm() {
  const code = prompt("⚠️ FACTORY RESET WARNING:\n\nThis will clear current modified records and restore the default 31 Cugman branch staff database.\n\nType 'RESET' to confirm:");
  if (code === 'RESET') {
    window.DB.resetToDefaults();
    cachedPayrollSummary = window.PayrollEngine.runBranchPayroll(activeCutoff);
    alert("✅ System reset to factory default state with 31 Cugman employees.");
    closeModal('backup-modal');
    renderApp();
  }
}

function handleCutoffSelectChange(cutoffId) {
  if (cutoffId === 'custom') {
    const startEl = document.getElementById('cutoff-start-input');
    if (startEl) startEl.focus();
    return;
  }
  const cutoffs = window.DB.getCutoffs();
  const selected = cutoffs.find(c => c.id === cutoffId);
  if (selected) {
    activeCutoff = selected;
    cachedPayrollSummary = window.PayrollEngine.runBranchPayroll(activeCutoff);
    renderApp();
  }
}

function handleApplyCustomCutoffDates() {
  const startEl = document.getElementById('cutoff-start-input');
  const endEl = document.getElementById('cutoff-end-input');
  if (!startEl || !endEl) return;

  const startDate = startEl.value;
  const endDate = endEl.value;

  if (!startDate || !endDate) {
    alert("Please specify both Start Date and End Date.");
    return;
  }
  if (startDate > endDate) {
    alert("Start Date cannot be after End Date.");
    return;
  }

  activeCutoff = {
    id: `CO-CUSTOM-${startDate}_${endDate}`,
    name: `Custom Period (${startDate} to ${endDate})`,
    startDate: startDate,
    endDate: endDate
  };

  cachedPayrollSummary = window.PayrollEngine.runBranchPayroll(activeCutoff);
  renderApp();
}

function handleSaveNewCutoff(event) {
  event.preventDefault();
  const name = document.getElementById('new-co-name').value.trim();
  const startDate = document.getElementById('new-co-start').value;
  const endDate = document.getElementById('new-co-end').value;

  if (!name || !startDate || !endDate) {
    alert("Please fill in all fields.");
    return;
  }
  if (startDate > endDate) {
    alert("Start Date cannot be after End Date.");
    return;
  }

  const newCutoff = {
    id: `CO-${Date.now()}`,
    name: name,
    startDate: startDate,
    endDate: endDate,
    status: 'Open'
  };

  window.DB.addCutoff(newCutoff);
  activeCutoff = newCutoff;
  cachedPayrollSummary = window.PayrollEngine.runBranchPayroll(activeCutoff);
  closeModal('new-cutoff-modal');
  renderApp();
}

/* ==========================================================================
   Firebase Cloud Sync Handlers
   ========================================================================== */

async function handleSaveFirebaseConfig(event) {
  event.preventDefault();
  const rawInput = document.getElementById('firebase-config-input').value.trim();
  if (!rawInput) {
    alert("Please paste your Firebase configuration object or JSON.");
    return;
  }

  try {
    let parsedConfig = null;
    if (rawInput.startsWith('{') && rawInput.endsWith('}')) {
      // JSON format
      parsedConfig = JSON.parse(rawInput);
    } else {
      // Clean JS snippet format e.g. const firebaseConfig = { ... };
      const jsonLike = rawInput
        .replace(/^[^{]*{/, '{')
        .replace(/}[^}]*$/, '}')
        .replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":')
        .replace(/'/g, '"')
        .replace(/,\s*([}\]])/g, '$1');
      parsedConfig = JSON.parse(jsonLike);
    }

    if (!parsedConfig || !parsedConfig.projectId || !parsedConfig.apiKey) {
      throw new Error("Missing required 'apiKey' or 'projectId' in Firebase config.");
    }

    const success = await window.FirebaseSync.init(parsedConfig);
    if (success) {
      await window.FirebaseSync.pushLocalToCloud(true);
      alert("✓ Successfully connected to Google Firebase Cloud Sync!\nYour records will now sync across all devices in real-time.");
      closeModal('cloud-sync-modal');
      renderApp();
    } else {
      alert("Could not connect to Firebase with the provided config. Please check your credentials.");
    }
  } catch (err) {
    alert("Error parsing Firebase configuration:\n" + err.message + "\n\nTip: You can copy and paste the exact firebaseConfig object from Firebase Console.");
  }
}

function handleDisconnectFirebase() {
  if (confirm("Are you sure you want to disconnect Cloud Sync? The app will operate in local offline mode.")) {
    window.FirebaseSync.removeConfig();
    alert("Disconnected from Cloud Sync.");
    closeModal('cloud-sync-modal');
    renderApp();
  }
}

async function handleManualCloudSync() {
  if (!window.FirebaseSync || !window.FirebaseSync.isInitialized) {
    alert("Cloud Sync is not configured yet. Please enter your Firebase project credentials.");
    return;
  }
  const ok = await window.FirebaseSync.pushLocalToCloud();
  if (ok) {
    alert("✓ Local database pushed and synchronized with Cloud Firestore successfully!");
  } else {
    alert("Sync error. Please check your internet connection and Firestore rules.");
  }
}

function openCloudSyncModal() {
  if (window.FirebaseSync && typeof window.FirebaseSync.updateStatusPill === 'function') {
    window.FirebaseSync.updateStatusPill(window.FirebaseSync.isInitialized ? 'connected' : 'disconnected');
  }
  openModal('cloud-sync-modal');
}

// Global Exports
window.navigateTo = navigateTo;
window.setMode = setMode;
window.openUploadModal = openUploadModal;
window.openAdvanceModal = openAdvanceModal;
window.openEmployeeModal = openEmployeeModal;
window.openBackupModal = openBackupModal;
window.openCloudSyncModal = openCloudSyncModal;
window.handleDownloadBackup = handleDownloadBackup;
window.handleImportBackupFile = handleImportBackupFile;
window.handleRestoreSnapshot = handleRestoreSnapshot;
window.handleResetFactoryConfirm = handleResetFactoryConfirm;
window.handleCutoffSelectChange = handleCutoffSelectChange;
window.handleApplyCustomCutoffDates = handleApplyCustomCutoffDates;
window.handleSaveNewCutoff = handleSaveNewCutoff;
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
window.handleSaveFirebaseConfig = handleSaveFirebaseConfig;
window.handleDisconnectFirebase = handleDisconnectFirebase;
window.handleManualCloudSync = handleManualCloudSync;
window.safeGetDeductions = safeGetDeductions;
window.setDeductionFilter = setDeductionFilter;
