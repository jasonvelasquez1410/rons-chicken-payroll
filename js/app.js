/**
 * Ron's Chicken Custom Payroll & Biometric Attendance System
 * Main UI Controller & Application Logic
 */

let currentView = 'dashboard';
let currentMode = 'manager'; // 'manager' | 'staff'
let selectedStaffEmployeeId = 12; // Default to Argie Daliva for staff preview
let activeCutoff = null;
let cachedPayrollSummary = null;

// Icons SVG Map
const ICONS = {
  dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
  fingerprint: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4"></path><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"></path><path d="M17.29 21.02c.12-.6.41-2.3.41-4.02 0-3.4-2.7-6-6-6s-6 2.6-6 6c0 .52.05 1.01.14 1.48"></path><path d="M12 10a2 2 0 0 0-2 2c0 1.9.4 3.7.8 5.2"></path><path d="M9 12a3 3 0 0 1 6 0c0 1.6-.3 3.3-.8 4.8"></path></svg>`,
  calculator: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><path d="M16 10h.01"></path><path d="M12 10h.01"></path><path d="M8 10h.01"></path><path d="M12 14h.01"></path><path d="M8 14h.01"></path><path d="M12 18h.01"></path><path d="M8 18h.01"></path></svg>`,
  users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
  shifts: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
  advances: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>`,
  device: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"></rect><path d="M9 9h6"></path><path d="M9 13h6"></path><path d="M9 17h2"></path></svg>`,
  upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`,
  print: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  fire: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>`
};

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  // Check URL parameters for view
  const params = new URLSearchParams(window.location.search);
  if (params.get('view') === 'staff') {
    currentMode = 'staff';
  }

  // Load active cutoff
  const cutoffs = window.DB.getCutoffs();
  activeCutoff = cutoffs.length > 0 ? cutoffs[0] : {
    id: "CO-2026-08-2",
    name: "August 16 - September 05, 2026 (Cugman Attendance)",
    startDate: "2026-08-16",
    endDate: "2026-09-05"
  };

  // Run initial payroll calculation in background
  cachedPayrollSummary = window.PayrollEngine.runBranchPayroll(activeCutoff);

  // Setup Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(() => {
      console.log('[PWA] Service Worker active');
    }).catch(err => console.log('[PWA] SW registration failed:', err));
  }

  renderApp();
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
    container.innerHTML = renderStaffPortal();
    attachStaffEvents();
  } else {
    container.innerHTML = `
      <header class="app-header">
        <div class="brand-container" onclick="navigateTo('dashboard')">
          <img src="assets/logo.jpg" alt="Ron's Chicken" class="brand-logo">
          <div>
            <div class="brand-name">RON'S CHICKEN <span>PAYROLL</span></div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">Lechon Manok & Liempo • Cugman Branch</div>
          </div>
          <span class="branch-badge">Live System</span>
        </div>

        <div style="display: flex; align-items: center; gap: 1rem;">
          <div class="mode-switch">
            <button class="mode-btn active" onclick="setMode('manager')">${ICONS.dashboard} Manager Portal</button>
            <button class="mode-btn" onclick="setMode('staff')">${ICONS.users} Staff PWA Portal</button>
          </div>
        </div>
      </header>

      <div class="app-layout">
        <aside class="sidebar">
          <div class="nav-item ${currentView === 'dashboard' ? 'active' : ''}" onclick="navigateTo('dashboard')">
            ${ICONS.dashboard} Dashboard Overview
          </div>
          <div class="nav-item ${currentView === 'attendance' ? 'active' : ''}" onclick="navigateTo('attendance')">
            ${ICONS.fingerprint} Biometric Timekeeping
          </div>
          <div class="nav-item ${currentView === 'payroll' ? 'active' : ''}" onclick="navigateTo('payroll')">
            ${ICONS.calculator} Payroll Computation
          </div>
          <div class="nav-item ${currentView === 'employees' ? 'active' : ''}" onclick="navigateTo('employees')">
            ${ICONS.users} Employee Roster (31)
          </div>
          <div class="nav-item ${currentView === 'shifts' ? 'active' : ''}" onclick="navigateTo('shifts')">
            ${ICONS.shifts} Shifts & Scheduling
          </div>
          <div class="nav-item ${currentView === 'advances' ? 'active' : ''}" onclick="navigateTo('advances')">
            ${ICONS.advances} Cash Advances (Vale)
          </div>
          <div class="nav-item ${currentView === 'device' ? 'active' : ''}" onclick="navigateTo('device')">
            ${ICONS.device} Biometric Device / Cloud
          </div>

          <div class="sidebar-divider"></div>

          <div style="padding: 0 0.5rem;">
            <button class="btn btn-primary" style="width: 100%;" onclick="openUploadModal()">
              ${ICONS.upload} Import Biometric .xls
            </button>
          </div>

          <div class="sidebar-footer">
            <div style="font-weight: 700; color: #fff; margin-bottom: 0.2rem;">Ron's Chicken Cugman</div>
            <div>Sayre Hwy, CDO City</div>
            <div style="color: var(--primary); margin-top: 0.3rem;">Biometrics: Deli e3960 (USB Mode)</div>
          </div>
        </aside>

        <main class="main-content">
          ${renderManagerView()}
        </main>
      </div>

      <!-- Upload Modal -->
      <div id="upload-modal" class="modal-backdrop">
        <div class="modal-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <h3 style="color: #fff;">Import Biometric Attendance Sheet</h3>
            <button class="btn btn-secondary btn-sm" onclick="closeModal('upload-modal')">✕</button>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">
            Select or drag & drop the attendance file exported from your biometric device (e.g. <code>cugman_(August)Employee Attendance Record.xls</code>).
          </p>
          <div class="upload-box" id="drop-zone" onclick="document.getElementById('excel-file-input').click()">
            <div class="upload-icon">${ICONS.upload}</div>
            <h4 style="color: #fff; margin-bottom: 0.3rem;">Click or Drag & Drop Biometric File</h4>
            <p style="font-size: 0.8rem; color: var(--text-sub);">Supports .xls, .xlsx, and .csv exports from ZKTeco & Standalone Biometrics</p>
            <input type="file" id="excel-file-input" style="display: none;" accept=".xls,.xlsx,.csv" onchange="handleFileSelected(event)">
          </div>
          <div id="upload-status" style="margin-top: 1rem; font-size: 0.85rem; text-align: center;"></div>
        </div>
      </div>

      <!-- Payslip View / Print Modal -->
      <div id="payslip-modal" class="modal-backdrop">
        <div class="modal-card" style="max-width: 720px; background: transparent; border: none; box-shadow: none;">
          <div style="display: flex; justify-content: flex-end; margin-bottom: 0.75rem; gap: 0.5rem;">
            <button class="btn btn-primary btn-sm" onclick="window.print()">${ICONS.print} Print / Save PDF</button>
            <button class="btn btn-secondary btn-sm" onclick="closeModal('payslip-modal')">Close</button>
          </div>
          <div id="payslip-printable-content" class="payslip-printable"></div>
        </div>
      </div>
    `;

    attachManagerEvents();
  }
}

/* ==========================================================================
   Manager Views
   ========================================================================== */

function renderManagerView() {
  switch (currentView) {
    case 'dashboard':
      return renderDashboard();
    case 'attendance':
      return renderAttendanceMatrix();
    case 'payroll':
      return renderPayrollView();
    case 'employees':
      return renderEmployeesView();
    case 'shifts':
      return renderShiftsView();
    case 'advances':
      return renderAdvancesView();
    case 'device':
      return renderDeviceView();
    default:
      return renderDashboard();
  }
}

function renderDashboard() {
  const employees = window.DB.getEmployees();
  const summary = cachedPayrollSummary || window.PayrollEngine.runBranchPayroll(activeCutoff);

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">${ICONS.fire} Branch Payroll & Attendance Dashboard</h1>
        <div class="page-subtitle">Ron's Chicken (Lechon Manok & Liempo) • Cutoff: ${activeCutoff.name}</div>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" onclick="openSimulatePunchModal()">${ICONS.fingerprint} Simulate Biometric Scan</button>
        <button class="btn btn-primary" onclick="navigateTo('payroll')">${ICONS.calculator} View Full Payroll</button>
      </div>
    </div>

    <div class="metrics-grid">
      <div class="glass-panel metric-card">
        <div class="metric-header">
          <span>Active Staff Roster</span>
          <div class="metric-icon">${ICONS.users}</div>
        </div>
        <div class="metric-value">${employees.length}</div>
        <div class="metric-footer" style="color: var(--accent-success);">● Cugman Branch Active</div>
      </div>

      <div class="glass-panel metric-card">
        <div class="metric-header">
          <span>Branch Net Payroll</span>
          <div class="metric-icon" style="color: var(--accent-success);">${ICONS.calculator}</div>
        </div>
        <div class="metric-value">₱${summary.totals.net.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        <div class="metric-footer">Gross: ₱${summary.totals.gross.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
      </div>

      <div class="glass-panel metric-card">
        <div class="metric-header">
          <span>Total Overtime (125%)</span>
          <div class="metric-icon" style="color: var(--primary);">${ICONS.shifts}</div>
        </div>
        <div class="metric-value">₱${summary.totals.overtime.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        <div class="metric-footer">DOLE Overtime Premiums</div>
      </div>

      <div class="glass-panel metric-card">
        <div class="metric-header">
          <span>Night Shift Diff (10%)</span>
          <div class="metric-icon" style="color: var(--accent-purple);">${ICONS.fire}</div>
        </div>
        <div class="metric-value">₱${summary.totals.nightDiff.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        <div class="metric-footer">Late Night Roasting Operations</div>
      </div>
    </div>

    <!-- Quick Attendance Status Banner -->
    <div class="glass-panel" style="padding: 1.5rem; margin-bottom: 1.75rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h3 style="color: #fff; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
          ${ICONS.fingerprint} Active Biometric Records & Top Roasting Operations Staff
        </h3>
        <button class="btn btn-secondary btn-sm" onclick="navigateTo('attendance')">View All Attendance →</button>
      </div>

      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Employee Name</th>
              <th>Department / Role</th>
              <th>Days Present</th>
              <th>Total Hours</th>
              <th>Overtime</th>
              <th>Night Diff</th>
              <th>Net Wage</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${summary.records.filter(r => r.timecardSummary.daysPresent > 0).slice(0, 7).map(r => `
              <tr>
                <td><strong>#${r.employeeId}</strong></td>
                <td style="font-weight: 700; color: #fff;">${r.employeeName}</td>
                <td><span class="status-pill status-${r.department === 'OPERATION' ? 'ot' : 'present'}">${r.position}</span></td>
                <td><strong>${r.timecardSummary.daysPresent}</strong> days</td>
                <td>${r.timecardSummary.totalRegularHours} hrs</td>
                <td><span style="color: var(--primary); font-weight: 700;">${r.timecardSummary.totalOtHours} hrs</span></td>
                <td><span style="color: var(--accent-purple); font-weight: 700;">${r.timecardSummary.totalNightDiffHours} hrs</span></td>
                <td style="font-weight: 800; color: var(--accent-success);">₱${r.netPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td>
                  <button class="btn btn-secondary btn-sm" onclick="showEmployeePayslip(${r.employeeId})">Payslip</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderAttendanceMatrix() {
  const employees = window.DB.getEmployees();
  const shifts = window.DB.getShifts();

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">${ICONS.fingerprint} Biometric Attendance Matrix</h1>
        <div class="page-subtitle">Cugman Branch Biometric In/Out Punches & Timecards</div>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" onclick="exportAttendanceCSV()">${ICONS.download} Export CSV</button>
        <button class="btn btn-primary" onclick="openUploadModal()">${ICONS.upload} Ingest New Sheet</button>
      </div>
    </div>

    <div class="glass-panel" style="padding: 1.5rem;">
      <div style="margin-bottom: 1.25rem; display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
        <input type="text" id="search-employee" placeholder="Search employee by name or ID..." 
          style="padding: 0.55rem 1rem; background: var(--bg-surface); border: 1px solid var(--border-subtle); color: #fff; border-radius: var(--radius-sm); width: 280px;"
          onkeyup="filterAttendanceTable()">
        <select id="filter-dept" onchange="filterAttendanceTable()" style="padding: 0.55rem 1rem; background: var(--bg-surface); border: 1px solid var(--border-subtle); color: #fff; border-radius: var(--radius-sm);">
          <option value="">All Departments</option>
          <option value="OPERATION">OPERATION (Roasters & Kitchen)</option>
          <option value="COMPANY">COMPANY (Cashiers & Front)</option>
        </select>
      </div>

      <div class="table-container">
        <table class="custom-table" id="attendance-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Dept</th>
              <th>Total Punches</th>
              <th>Days Present</th>
              <th>Regular Hrs</th>
              <th>OT Hrs</th>
              <th>Night Diff</th>
              <th>Late Mins</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${employees.map(emp => {
              const tc = window.BiometricParser.calculateTimecard(emp, activeCutoff.startDate, activeCutoff.endDate, shifts);
              const punchCount = (emp.attendanceLogs || []).length;
              return `
                <tr data-name="${emp.name.toLowerCase()}" data-dept="${emp.department}">
                  <td><strong>#${emp.id}</strong></td>
                  <td style="font-weight: 700; color: #fff;">${emp.name}</td>
                  <td><span class="status-pill status-${emp.department === 'OPERATION' ? 'ot' : 'present'}">${emp.department}</span></td>
                  <td>${punchCount} logs</td>
                  <td><strong>${tc.daysPresent}</strong></td>
                  <td>${tc.totalRegularHours} hrs</td>
                  <td><span style="color: var(--primary); font-weight: 700;">${tc.totalOtHours} hrs</span></td>
                  <td><span style="color: var(--accent-purple); font-weight: 700;">${tc.totalNightDiffHours} hrs</span></td>
                  <td>${tc.totalLateMinutes > 0 ? `<span style="color: var(--accent-flame);">${tc.totalLateMinutes}m</span>` : '0m'}</td>
                  <td>
                    <button class="btn btn-secondary btn-sm" onclick="showTimecardDetail(${emp.id})">Inspect Timecard</button>
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

function renderPayrollView() {
  const summary = cachedPayrollSummary || window.PayrollEngine.runBranchPayroll(activeCutoff);

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">${ICONS.calculator} Philippine Payroll Computation</h1>
        <div class="page-subtitle">DOLE & BIR Standard • Ron's Chicken Cugman Branch (${activeCutoff.name})</div>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" onclick="exportPayrollCSV()">${ICONS.download} Export Bank Advice CSV</button>
        <button class="btn btn-primary" onclick="recalculatePayroll()">${ICONS.calculator} Recalculate Payroll</button>
      </div>
    </div>

    <!-- Summary Total Bar -->
    <div class="glass-panel" style="padding: 1.25rem 1.5rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
      <div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">Total Branch Gross</div>
        <div style="font-size: 1.4rem; font-weight: 800; color: #fff;">₱${summary.totals.gross.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
      </div>
      <div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">Total Deductions (SSS/PhilH/Pag-IBIG/Vale)</div>
        <div style="font-size: 1.4rem; font-weight: 800; color: var(--accent-flame);">₱${summary.totals.deductions.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
      </div>
      <div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">Total Net Disbursable</div>
        <div style="font-size: 1.4rem; font-weight: 800; color: var(--accent-success);">₱${summary.totals.net.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
      </div>
      <div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">Employees In Payroll</div>
        <div style="font-size: 1.4rem; font-weight: 800; color: var(--primary);">${summary.records.length} Staff</div>
      </div>
    </div>

    <div class="glass-panel" style="padding: 1.5rem;">
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Employee Name</th>
              <th>Daily Rate</th>
              <th>Days</th>
              <th>Basic Pay</th>
              <th>OT Pay (125%)</th>
              <th>Night Diff</th>
              <th>Meal Allow.</th>
              <th>Gross Pay</th>
              <th>SSS / PhilH / HDMF</th>
              <th>Vale Deduct</th>
              <th>Net Pay</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${summary.records.map(r => `
              <tr>
                <td><strong>#${r.employeeId}</strong></td>
                <td style="font-weight: 700; color: #fff;">${r.employeeName}</td>
                <td>₱${r.dailyRate.toFixed(2)}</td>
                <td><strong>${r.daysPresent}</strong></td>
                <td>₱${r.earnings.basicPay.toFixed(2)}</td>
                <td>₱${r.earnings.otPay.toFixed(2)}</td>
                <td>₱${r.earnings.nightDiffPay.toFixed(2)}</td>
                <td>₱${r.earnings.allowances.toFixed(2)}</td>
                <td style="font-weight: 700; color: #fff;">₱${r.earnings.grossPay.toFixed(2)}</td>
                <td style="color: var(--text-muted); font-size: 0.78rem;">
                  ₱${(r.deductions.sss + r.deductions.philHealth + r.deductions.pagIbig).toFixed(2)}
                </td>
                <td style="color: var(--accent-flame);">
                  ${r.deductions.cashAdvance > 0 ? `₱${r.deductions.cashAdvance.toFixed(2)}` : '-'}
                </td>
                <td style="font-weight: 800; color: var(--accent-success); font-size: 0.95rem;">
                  ₱${r.netPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td>
                  <button class="btn btn-secondary btn-sm" onclick="showEmployeePayslip(${r.employeeId})">Payslip</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderEmployeesView() {
  const employees = window.DB.getEmployees();

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">${ICONS.users} Ron's Chicken Staff Roster (31 Employees)</h1>
        <div class="page-subtitle">Manage daily rates, DOLE statutory numbers, and branch roles</div>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" onclick="openAddEmployeeModal()">+ Add New Staff</button>
      </div>
    </div>

    <div class="glass-panel" style="padding: 1.5rem;">
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Department</th>
              <th>Role / Position</th>
              <th>Daily Rate</th>
              <th>Meal Allowance</th>
              <th>SSS No.</th>
              <th>PhilHealth No.</th>
              <th>Pag-IBIG No.</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${employees.map(e => `
              <tr>
                <td><strong>#${e.id}</strong></td>
                <td style="font-weight: 700; color: #fff;">${e.name}</td>
                <td><span class="status-pill status-${e.department === 'OPERATION' ? 'ot' : 'present'}">${e.department}</span></td>
                <td>${e.position || 'Staff'}</td>
                <td>₱${e.dailyRate ? e.dailyRate.toFixed(2) : '438.00'}</td>
                <td>₱${e.allowance ? e.allowance.toFixed(2) : '50.00'}</td>
                <td style="font-family: monospace; font-size: 0.78rem;">${e.sssNumber || '-'}</td>
                <td style="font-family: monospace; font-size: 0.78rem;">${e.philHealthNumber || '-'}</td>
                <td style="font-family: monospace; font-size: 0.78rem;">${e.pagIbigNumber || '-'}</td>
                <td>
                  <button class="btn btn-secondary btn-sm" onclick="showEmployeePayslip(${e.id})">Payslip</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderShiftsView() {
  const shifts = window.DB.getShifts();

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">${ICONS.shifts} Shifts & Scheduling</h1>
        <div class="page-subtitle">Configure roasting shifts, kitchen prep, and front counter hours</div>
      </div>
    </div>

    <div class="metrics-grid">
      ${shifts.map(s => `
        <div class="glass-panel metric-card" style="border-left: 4px solid ${s.color};">
          <div class="metric-header">
            <span style="font-weight: 700; color: #fff;">${s.name}</span>
            <div class="metric-icon" style="color: ${s.color};">${ICONS.shifts}</div>
          </div>
          <div class="metric-value" style="font-size: 1.25rem;">${s.start} - ${s.end}</div>
          <div class="metric-footer">Grace Period: ${s.gracePeriodMinutes || 15} minutes</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderAdvancesView() {
  const advances = window.DB.getAdvances();
  const employees = window.DB.getEmployees();

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">${ICONS.advances} Cash Advances (Vale Ledger)</h1>
        <div class="page-subtitle">Staff emergency cash advances and automated payroll deductions</div>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" onclick="openAddAdvanceModal()">+ Record New Vale</button>
      </div>
    </div>

    <div class="glass-panel" style="padding: 1.5rem;">
      <div class="table-container">
        <table class="custom-table">
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
                <td style="font-weight: 700; color: #fff;">${a.employeeName}</td>
                <td>${a.date}</td>
                <td style="font-weight: 800; color: var(--accent-flame);">₱${a.amount.toFixed(2)}</td>
                <td>${a.reason}</td>
                <td><span class="status-pill status-ot">${a.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderDeviceView() {
  const config = window.DeviceSync.getConfig();

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">${ICONS.device} Biometric Device & Future Cloud Sync</h1>
        <div class="page-subtitle">Hardware connection configuration and cloud sync readiness</div>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" onclick="testDeviceConnection()">${ICONS.check} Test IP Connection</button>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
      <div class="glass-panel" style="padding: 1.5rem;">
        <h3 style="color: #fff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          ${ICONS.fingerprint} Current Biometric Hardware Settings
        </h3>
        
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.3rem;">Device Name</label>
            <input type="text" value="${config.deviceName}" style="width: 100%; padding: 0.55rem; background: var(--bg-surface); border: 1px solid var(--border-subtle); color: #fff; border-radius: var(--radius-sm);" readonly>
          </div>
          <div>
            <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.3rem;">Local IP Address (Ethernet/WiFi)</label>
            <input type="text" id="device-ip" value="${config.ipAddress}" style="width: 100%; padding: 0.55rem; background: var(--bg-surface); border: 1px solid var(--border-subtle); color: #fff; border-radius: var(--radius-sm);">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.3rem;">Port</label>
              <input type="number" id="device-port" value="${config.port}" style="width: 100%; padding: 0.55rem; background: var(--bg-surface); border: 1px solid var(--border-subtle); color: #fff; border-radius: var(--radius-sm);">
            </div>
            <div>
              <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.3rem;">Comm Key</label>
              <input type="number" id="device-key" value="${config.commKey}" style="width: 100%; padding: 0.55rem; background: var(--bg-surface); border: 1px solid var(--border-subtle); color: #fff; border-radius: var(--radius-sm);">
            </div>
          </div>
        </div>
      </div>

      <div class="glass-panel" style="padding: 1.5rem;">
        <h3 style="color: #fff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          ${ICONS.device} Future Internet / Cloud ADMS Push Sync
        </h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">
          When Ron's Chicken upgrades to an internet-connected biometric device, configure the Cloud Push ADMS endpoint below for instant automatic synchronization.
        </p>
        <div>
          <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.3rem;">Cloud Server Push URL</label>
          <input type="text" value="${config.admsUrl}" style="width: 100%; padding: 0.55rem; background: var(--bg-surface); border: 1px solid var(--border-subtle); color: #fff; border-radius: var(--radius-sm);" readonly>
        </div>
        <div id="device-test-result" style="margin-top: 1.25rem; font-size: 0.85rem;"></div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   Staff Self-Service PWA Portal
   ========================================================================== */

function renderStaffPortal() {
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
      <div class="brand-container" onclick="setMode('staff')">
        <img src="assets/logo.jpg" alt="Ron's Chicken" class="brand-logo">
        <div>
          <div class="brand-name">RON'S CHICKEN <span>STAFF</span></div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">Employee Attendance & Payslip Portal</div>
        </div>
      </div>

      <div class="mode-switch">
        <button class="mode-btn" onclick="setMode('manager')">${ICONS.dashboard} Manager View</button>
        <button class="mode-btn active" onclick="setMode('staff')">${ICONS.users} Staff PWA</button>
      </div>
    </header>

    <div style="max-width: 800px; margin: 0 auto; padding: 1.5rem 1rem;">
      <!-- Staff Profile Switcher -->
      <div class="glass-panel" style="padding: 1.25rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <div style="width: 52px; height: 52px; border-radius: 50%; background: var(--primary); color: #000; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 800;">
            ${currentEmp.name.charAt(0)}
          </div>
          <div>
            <h2 style="font-size: 1.25rem; color: #fff; margin: 0;">${currentEmp.name}</h2>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${currentEmp.position} • ID #${currentEmp.id}</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <label style="font-size: 0.8rem; color: var(--text-muted);">Switch Staff:</label>
          <select id="staff-select" onchange="changeStaffUser(this.value)" style="padding: 0.45rem 0.75rem; background: var(--bg-surface); border: 1px solid var(--border-subtle); color: #fff; border-radius: var(--radius-sm);">
            ${employees.map(e => `
              <option value="${e.id}" ${e.id === currentEmp.id ? 'selected' : ''}>#${e.id} ${e.name}</option>
            `).join('')}
          </select>
        </div>
      </div>

      <!-- Quick Action Mobile Punch -->
      <div class="glass-panel" style="padding: 1.5rem; margin-bottom: 1.5rem; text-align: center; background: radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.12) 0%, rgba(21, 24, 33, 0.9) 100%);">
        <h3 style="color: #fff; margin-bottom: 0.3rem;">Mobile Time Clock & Biometric Punch</h3>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1.25rem;">Tap to record biometric time in / time out (Cugman Branch Geofenced)</p>
        
        <button class="btn btn-primary" style="padding: 0.9rem 2rem; font-size: 1rem; border-radius: var(--radius-full);" onclick="staffSelfPunch(${currentEmp.id})">
          ${ICONS.fingerprint} Biometric Clock In / Out
        </button>
        <div id="punch-feedback" style="margin-top: 0.75rem; font-size: 0.85rem; font-weight: 600;"></div>
      </div>

      <!-- Current Cutoff Payslip Card -->
      <div class="glass-panel" style="padding: 1.5rem; margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
          <h3 style="color: #fff; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
            ${ICONS.calculator} Current Cutoff Estimated Payslip
          </h3>
          <button class="btn btn-secondary btn-sm" onclick="showEmployeePayslip(${currentEmp.id})">${ICONS.print} View Printable Payslip</button>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
          <div style="background: var(--bg-surface); padding: 1rem; border-radius: var(--radius-sm);">
            <div style="font-size: 0.75rem; color: var(--text-muted);">Days Present</div>
            <div style="font-size: 1.4rem; font-weight: 800; color: #fff;">${timecard.daysPresent} Days</div>
            <div style="font-size: 0.75rem; color: var(--text-sub);">${timecard.totalRegularHours} Regular Hours</div>
          </div>
          <div style="background: var(--bg-surface); padding: 1rem; border-radius: var(--radius-sm);">
            <div style="font-size: 0.75rem; color: var(--text-muted);">Estimated Net Take-Home</div>
            <div style="font-size: 1.4rem; font-weight: 800; color: var(--accent-success);">₱${payroll.netPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div style="font-size: 0.75rem; color: var(--text-sub);">Gross: ₱${payroll.earnings.grossPay.toFixed(2)}</div>
          </div>
        </div>

        <div style="font-size: 0.85rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.4rem;">
          <div style="display: flex; justify-content: space-between;">
            <span>Basic Pay (${timecard.totalRegularHours} hrs @ ₱${(currentEmp.dailyRate/8).toFixed(2)}/hr):</span>
            <span style="color: #fff; font-weight: 600;">₱${payroll.earnings.basicPay.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Overtime Pay (${timecard.totalOtHours} hrs @ 125%):</span>
            <span style="color: var(--primary); font-weight: 600;">₱${payroll.earnings.otPay.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Night Differential (${timecard.totalNightDiffHours} hrs @ 10%):</span>
            <span style="color: var(--accent-purple); font-weight: 600;">₱${payroll.earnings.nightDiffPay.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Meal Allowance:</span>
            <span style="color: #fff; font-weight: 600;">₱${payroll.earnings.allowances.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: 0.4rem;">
            <span>Total Statutory Deductions (SSS, PhilHealth, Pag-IBIG):</span>
            <span style="color: var(--accent-flame); font-weight: 600;">-₱${payroll.deductions.totalDeductions.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <!-- Timecard Breakdown -->
      <div class="glass-panel" style="padding: 1.5rem;">
        <h3 style="color: #fff; font-size: 1.1rem; margin-bottom: 1rem;">Daily Punch Log (${activeCutoff.name})</h3>
        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Status</th>
                <th>Punches</th>
                <th>Reg. Hrs</th>
                <th>OT</th>
                <th>Night Diff</th>
              </tr>
            </thead>
            <tbody>
              ${timecard.dailyBreakdown.map(d => `
                <tr>
                  <td>${d.date}</td>
                  <td><strong>${d.dayOfWeek}</strong></td>
                  <td><span class="status-pill status-${d.punches.length > 0 ? 'present' : 'absent'}">${d.status}</span></td>
                  <td>
                    <div class="punch-matrix-row">
                      ${d.punches.length > 0 ? d.punches.map(p => `<span class="punch-chip">${p}</span>`).join('') : '<span style="color: var(--text-sub);">-</span>'}
                    </div>
                  </td>
                  <td>${d.regularHours} hrs</td>
                  <td>${d.otHours > 0 ? `<span style="color: var(--primary); font-weight: 700;">${d.otHours}h</span>` : '-'}</td>
                  <td>${d.nightDiffHours > 0 ? `<span style="color: var(--accent-purple); font-weight: 700;">${d.nightDiffHours}h</span>` : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
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
    feedback.innerHTML = `<span style="color: var(--accent-success);">${ICONS.check} ${result.message}</span>`;
  }
  // Refresh payroll cache
  cachedPayrollSummary = window.PayrollEngine.runBranchPayroll(activeCutoff);
  setTimeout(() => renderApp(), 1200);
}

/* ==========================================================================
   Payslip Generator & Modal
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
            <p style="font-size: 0.72rem; color: #6b7280;">Contact: 0928 775 6605 • Biometric Attendance Verified</p>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: 800; font-size: 1rem; color: #111827;">PAYSLIP</div>
          <div style="font-size: 0.75rem; color: #4b5563;">Period: ${activeCutoff.startDate} to ${activeCutoff.endDate}</div>
          <div style="font-size: 0.72rem; color: #6b7280;">Date Issued: ${new Date().toLocaleDateString()}</div>
        </div>
      </div>

      <div style="background: #f9fafb; padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.8rem;">
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
              <span>Tardiness / Late (${payroll.lateMinutes} mins):</span>
              <span>-₱${payroll.deductions.late.toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="payslip-row">
            <span>SSS EE Contribution:</span>
            <span>-₱${payroll.deductions.sss.toFixed(2)}</span>
          </div>
          <div class="payslip-row">
            <span>PhilHealth EE:</span>
            <span>-₱${payroll.deductions.philHealth.toFixed(2)}</span>
          </div>
          <div class="payslip-row">
            <span>Pag-IBIG (HDMF):</span>
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

function showTimecardDetail(employeeId) {
  showEmployeePayslip(employeeId);
}

/* ==========================================================================
   Modals & Event Handlers
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
    statusEl.innerHTML = `<span style="color: var(--primary);">Processing ${file.name}...</span>`;
  }

  try {
    const result = await window.DeviceSync.processUploadedFile(file);
    if (result.success) {
      if (statusEl) {
        statusEl.innerHTML = `<span style="color: var(--accent-success); font-weight: 700;">✓ ${result.message}</span>`;
      }
      cachedPayrollSummary = window.PayrollEngine.runBranchPayroll(activeCutoff);
      setTimeout(() => {
        closeModal('upload-modal');
        renderApp();
      }, 1500);
    } else {
      if (statusEl) {
        statusEl.innerHTML = `<span style="color: var(--accent-flame);">${result.message}</span>`;
      }
    }
  } catch (err) {
    if (statusEl) {
      statusEl.innerHTML = `<span style="color: var(--accent-flame);">Error parsing file: ${err.message}</span>`;
    }
  }
}

function openSimulatePunchModal() {
  const employees = window.DB.getEmployees();
  const empId = prompt(`Enter Employee ID (1 - ${employees.length}) to simulate biometric scan:`, "12");
  if (empId) {
    const result = window.DeviceSync.simulateLivePunch(Number(empId));
    alert(result.message);
    cachedPayrollSummary = window.PayrollEngine.runBranchPayroll(activeCutoff);
    renderApp();
  }
}

async function testDeviceConnection() {
  const ip = document.getElementById('device-ip')?.value || "192.168.1.201";
  const port = document.getElementById('device-port')?.value || 4370;
  const resultDiv = document.getElementById('device-test-result');
  if (resultDiv) {
    resultDiv.innerHTML = `<span style="color: var(--primary);">Testing communication with ${ip}:${port}...</span>`;
  }

  const res = await window.DeviceSync.testConnection(ip, port);
  if (resultDiv) {
    resultDiv.innerHTML = `
      <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); padding: 0.85rem; border-radius: var(--radius-sm); color: #fff;">
        <div style="color: var(--accent-success); font-weight: 700; margin-bottom: 0.3rem;">✓ Communication Established (Latency: ${res.latency}ms)</div>
        <div>Device: ${res.firmware} (S/N: ${res.serialNumber})</div>
        <div>Registered Staff: ${res.userCount} | Stored Logs: ${res.logCount}</div>
      </div>
    `;
  }
}

function recalculatePayroll() {
  cachedPayrollSummary = window.PayrollEngine.runBranchPayroll(activeCutoff);
  renderApp();
  alert("Payroll recalculated successfully for all employees.");
}

function filterAttendanceTable() {
  const search = document.getElementById('search-employee')?.value.toLowerCase() || '';
  const dept = document.getElementById('filter-dept')?.value || '';
  const rows = document.querySelectorAll('#attendance-table tbody tr');

  rows.forEach(row => {
    const name = row.getAttribute('data-name') || '';
    const d = row.getAttribute('data-dept') || '';
    const matchName = name.includes(search);
    const matchDept = !dept || d === dept;
    row.style.display = (matchName && matchDept) ? '' : 'none';
  });
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

function attachManagerEvents() {}
function attachStaffEvents() {}

// Global Exposure
window.navigateTo = navigateTo;
window.setMode = setMode;
window.openUploadModal = openUploadModal;
window.closeModal = closeModal;
window.handleFileSelected = handleFileSelected;
window.showEmployeePayslip = showEmployeePayslip;
window.showTimecardDetail = showTimecardDetail;
window.openSimulatePunchModal = openSimulatePunchModal;
window.testDeviceConnection = testDeviceConnection;
window.recalculatePayroll = recalculatePayroll;
window.filterAttendanceTable = filterAttendanceTable;
window.exportPayrollCSV = exportPayrollCSV;
window.exportAttendanceCSV = exportAttendanceCSV;
window.changeStaffUser = changeStaffUser;
window.staffSelfPunch = staffSelfPunch;
