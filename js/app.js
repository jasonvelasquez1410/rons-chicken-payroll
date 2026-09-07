/**
 * Ron's Chicken Custom Payroll & Biometric Attendance System
 * "Mi Nomina" Bento Grid Theme & Interactive PWA Controller
 * with Real-Time Theme Brightness / Dimmer Slider
 */

let currentView = 'dashboard';
let currentMode = 'manager'; // 'manager' | 'staff'
let selectedStaffEmployeeId = 12; // Default to Argie Daliva (Senior Roaster)
let activeCutoff = null;
let cachedPayrollSummary = null;
let currentBrightness = parseInt(localStorage.getItem('rons_payroll_brightness') || '0', 10);

// SVG Icons (Mi Nomina crisp line style)
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
  settings: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
  sun: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
};

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  applyBrightness(currentBrightness);

  const params = new URLSearchParams(window.location.search);
  if (params.get('view') === 'staff') {
    currentMode = 'staff';
  }

  const cutoffs = window.DB.getCutoffs();
  activeCutoff = cutoffs.length > 0 ? cutoffs[0] : {
    id: "CO-2026-08-2",
    name: "August 16 - September 05, 2026 (Cugman Attendance)",
    startDate: "2026-08-16",
    endDate: "2026-09-05"
  };

  cachedPayrollSummary = window.PayrollEngine.runBranchPayroll(activeCutoff);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  renderApp();
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
      <!-- Mi Nomina Header with Brightness Slider -->
      <header class="app-header">
        <div class="brand-wrapper" onclick="navigateTo('dashboard')">
          <div class="brand-icon-monogram">Σ</div>
          <div class="brand-text">
            <div class="brand-title">RON'S CHICKEN <span>PAYROLL</span></div>
            <div class="brand-sub">Cugman Branch • Deli e3960 Biometrics</div>
          </div>
        </div>

        <div class="header-controls">
          <!-- Real-Time Theme Brightness Slider -->
          <div class="brightness-control-pill" title="Adjust Theme Brightness / Lighting">
            ${ICONS.sun}
            <input type="range" class="brightness-slider" id="theme-brightness-slider" min="0" max="100" value="${currentBrightness}" oninput="handleBrightnessChange(event)">
            <span id="brightness-label" style="min-width: 46px;">${getBrightnessName(currentBrightness)}</span>
          </div>

          <div class="mode-switch-pill">
            <button class="mode-pill-btn active" onclick="setMode('manager')">${ICONS.dashboard} Manager</button>
            <button class="mode-pill-btn" onclick="setMode('staff')">${ICONS.employee} Staff PWA</button>
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

      <!-- Payslip Printable Modal -->
      <div id="payslip-modal" class="modal-backdrop">
        <div class="modal-card" style="max-width: 720px; background: transparent; border: none; box-shadow: none;">
          <div style="display: flex; justify-content: flex-end; margin-bottom: 0.75rem; gap: 0.5rem;">
            <button class="btn-bento btn-bento-orange btn-sm" onclick="window.print()">${ICONS.print} Print / Save PDF</button>
            <button class="btn-bento btn-bento-white btn-sm" onclick="closeModal('payslip-modal')">Close</button>
          </div>
          <div id="payslip-printable-content" class="payslip-printable"></div>
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

/* ==========================================================================
   Manager Bento Dashboard & Views
   ========================================================================== */

function renderManagerBentoView() {
  switch (currentView) {
    case 'dashboard':
      return renderManagerBentoDashboard();
    case 'attendance':
      return renderBentoAttendance();
    case 'payroll':
      return renderBentoPayroll();
    case 'advances':
      return renderBentoAdvances();
    case 'device':
      return renderBentoDevice();
    default:
      return renderManagerBentoDashboard();
  }
}

function renderManagerBentoDashboard() {
  const employees = window.DB.getEmployees();
  const summary = cachedPayrollSummary || window.PayrollEngine.runBranchPayroll(activeCutoff);

  return `
    <!-- Top Welcome Banner (Mi Nomina Style) -->
    <div class="user-welcome-banner">
      <div class="user-welcome-info">
        <div class="user-avatar-circle">RC</div>
        <div class="user-welcome-text">
          <h1>Welcome, Branch Manager</h1>
          <p>Ron's Chicken Cugman • Cutoff: ${activeCutoff.name}</p>
        </div>
      </div>
      <div style="display: flex; gap: 0.75rem;">
        <button class="btn-bento btn-bento-orange" onclick="openUploadModal()">
          ${ICONS.upload} Import Deli e3960 .xls
        </button>
      </div>
    </div>

    <!-- Mi Nomina Bento Grid Cards -->
    <div class="bento-grid">
      
      <!-- Big Orange Bento Card: Employee Management -->
      <div class="bento-card bento-orange col-7" onclick="navigateTo('attendance')">
        <div class="bento-card-header">
          <div class="bento-badge-circle">${ICONS.employee}</div>
          <span class="bento-tag">31 Active Staff</span>
        </div>
        <div>
          <div class="bento-value">${employees.length} Staff</div>
          <div class="bento-title">Employee & Biometrics Management</div>
          <div class="bento-meta" style="margin-top: 0.4rem;">Cugman Roasters, Kitchen Prep, and Service Counter</div>
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

      <!-- High Contrast White Bento Card: Payroll Management -->
      <div class="bento-card bento-white col-7" onclick="navigateTo('payroll')">
        <div class="bento-card-header">
          <div class="bento-badge-circle">${ICONS.payroll}</div>
          <span class="bento-tag" style="background: #111827; color: #fff;">DOLE / BIR Compliant</span>
        </div>
        <div>
          <div class="bento-value" style="color: #000;">₱${summary.totals.net.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div class="bento-title" style="color: #000;">Payroll Management</div>
          <div class="bento-meta" style="color: #4b5563; margin-top: 0.4rem;">
            Gross: ₱${summary.totals.gross.toLocaleString('en-US', { minimumFractionDigits: 2 })} • Deductions: ₱${summary.totals.deductions.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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

    <!-- Active Attendance Table Section -->
    <div class="data-panel-card" style="margin-top: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
        <h3 style="color: var(--text-primary); font-size: 1.2rem; display: flex; align-items: center; gap: 0.5rem;">
          ${ICONS.fingerprint} Deli e3960 Attendance Summary (${activeCutoff.name})
        </h3>
        <button class="btn-bento btn-bento-dark btn-sm" onclick="navigateTo('payroll')">View Full Payroll →</button>
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
              <th>Action</th>
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
                  <button class="btn-bento btn-bento-dark btn-sm" onclick="showEmployeePayslip(${r.employeeId})">Payslip</button>
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
      <div style="display: flex; gap: 0.75rem;">
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
              <th>Action</th>
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
                    <button class="btn-bento btn-bento-dark btn-sm" onclick="showEmployeePayslip(${emp.id})">Payslip</button>
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
      <div style="display: flex; gap: 0.75rem;">
        <button class="btn-bento btn-bento-dark" onclick="exportPayrollCSV()">${ICONS.download} Bank Advice CSV</button>
        <button class="btn-bento btn-bento-orange" onclick="recalculatePayroll()">${ICONS.payroll} Recalculate</button>
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
              <th>Action</th>
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
                  <button class="btn-bento btn-bento-dark btn-sm" onclick="showEmployeePayslip(${r.employeeId})">Payslip</button>
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

  return `
    <div class="user-welcome-banner">
      <div>
        <h1 style="color: var(--text-primary); font-size: 1.75rem;">Cash Advances & Vale Ledger</h1>
        <p style="color: var(--text-secondary);">Track emergency staff loans and automated payroll deductions</p>
      </div>
      <button class="btn-bento btn-bento-purple" onclick="alert('Vale ledger synchronized.')">+ New Vale Entry</button>
    </div>

    <div class="data-panel-card">
      <div class="table-responsive">
        <table class="table-bento">
          <thead>
            <tr>
              <th>Vale ID</th>
              <th>Employee Name</th>
              <th>Date Issued</th>
              <th>Amount</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${advances.map(a => `
              <tr>
                <td><strong>${a.id}</strong></td>
                <td style="font-weight: 700; color: var(--text-primary);">${a.employeeName}</td>
                <td>${a.date}</td>
                <td style="font-weight: 800; color: var(--bento-orange);">₱${a.amount.toFixed(2)}</td>
                <td>${a.reason}</td>
                <td><span class="pill pill-orange">${a.status}</span></td>
              </tr>
            `).join('')}
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
      <!-- Welcome Paul / Staff Header (Mi Nomina Style) -->
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

      <!-- Bento Cards Stack (Mobile PWA) -->
      <div style="display: flex; flex-direction: column; gap: 1.2rem;">

        <!-- Big Orange Bento: Employee Management & Mobile Time Clock -->
        <div class="bento-card bento-orange" onclick="staffSelfPunch(${currentEmp.id})">
          <div class="bento-card-header">
            <div class="bento-badge-circle">${ICONS.fingerprint}</div>
            <span class="bento-tag">Tap to Punch</span>
          </div>
          <div>
            <div class="bento-title">Biometric Time Clock</div>
            <div class="bento-meta" style="margin-top: 0.4rem;">Tap to record mobile check-in (Cugman Geofenced)</div>
            <div id="punch-feedback" style="margin-top: 0.75rem; font-weight: 700; font-size: 0.85rem;"></div>
          </div>
        </div>

        <!-- High Contrast White Bento: My Estimated Payslip -->
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
   Payslip Generator
   ========================================================================== */

function showEmployeePayslip(employeeId) {
  const emp = window.DB.getEmployeeById(employeeId);
  if (!emp) return;

  const shifts = window.DB.getShifts();
  const timecard = window.BiometricParser.calculateTimecard(emp, activeCutoff.startDate, activeCutoff.endDate, shifts);
  const advances = window.DB.getAdvances().filter(a => a.employeeId === emp.id && a.status === 'Active');
  const advanceDeduct = advances.reduce((s, a) => s + (a.amount - (a.deducted || 0)), 0);

  const payroll = window.PayrollEngine.computeEmployeePayroll(emp, timecard, {
    cashAdvanceDeduction: Math.min(advanceDeduct, 500),
    incentives: (emp.position && emp.position.includes("Grill")) ? 200 : 0
  });

  const content = document.getElementById('payslip-printable-content');
  if (!content) return;

  content.innerHTML = `
    <div class="payslip-container">
      <div class="payslip-header">
        <div class="payslip-brand">
          <img src="assets/logo.jpg" alt="Ron's Chicken">
          <div class="payslip-title">
            <h2>RON'S CHICKEN</h2>
            <p>Lechon Manok & Liempo • Cugman Branch, Cagayan de Oro</p>
            <p style="font-size: 0.72rem; color: #6b7280;">Deli e3960 Biometric Verified Attendance</p>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: 800; font-size: 1rem; color: #111827;">PAYSLIP</div>
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
          ${payroll.deductions.cashAdvance > 0 ? `
            <div class="payslip-row">
              <span>Cash Advance (Vale):</span>
              <span>-₱${payroll.deductions.cashAdvance.toFixed(2)}</span>
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

// Global Exports
window.navigateTo = navigateTo;
window.setMode = setMode;
window.openUploadModal = openUploadModal;
window.closeModal = closeModal;
window.handleFileSelected = handleFileSelected;
window.showEmployeePayslip = showEmployeePayslip;
window.recalculatePayroll = recalculatePayroll;
window.exportPayrollCSV = exportPayrollCSV;
window.exportAttendanceCSV = exportAttendanceCSV;
window.changeStaffUser = changeStaffUser;
window.staffSelfPunch = staffSelfPunch;
window.handleBrightnessChange = handleBrightnessChange;
