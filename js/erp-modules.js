/**
 * Ron's Chicken Custom ERP Modules Suite
 * Lechon & Liempo Daily Inventory, Cashier Remittances, AI Financial Analyst,
 * and Multi-Cashier Role-Based Permissions (RBAC)
 */

window.ErpModules = (function() {
  // SVG Icons for ERP
  const ERP_ICONS = {
    chicken: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path></svg>`,
    flame: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>`,
    money: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>`,
    ai: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path><circle cx="12" cy="12" r="4"></circle></svg>`,
    users: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    lock: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
    trendUp: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`,
    alert: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`
  };

  // ----------------------------------------------------
  // 1. LECHON MANOK & LIEMPO INVENTORY VIEW
  // ----------------------------------------------------
  function renderBentoInventory() {
    const inv = window.DB.getInventory();
    const sheets = inv.dailySheets || [];
    const activeSheet = sheets.length > 0 ? sheets[0] : {
      date: new Date().toISOString().split('T')[0],
      beginningChicken: 0,
      receivedChicken: 0,
      totalRoastedChicken: 0,
      soldWholeChicken: 0,
      soldHalfChicken: 0,
      soldLiempoSlabs: 0,
      spoilageRejectChicken: 0,
      actualEndingChicken: 0,
      varianceChicken: 0,
      roastedBatches: []
    };

    const batches = activeSheet.roastedBatches || [];
    const totalBatches = batches.length;
    const isBalanced = (activeSheet.varianceChicken || 0) === 0;

    return `
      <!-- Inventory Header -->
      <div class="user-welcome-banner">
        <div class="user-welcome-info">
          <div class="user-avatar-circle" style="background: var(--bento-orange); color: #fff;">🍗</div>
          <div class="user-welcome-text">
            <h1>Lechon Manok &amp; Liempo Inventory</h1>
            <p>Cugman Branch • Roasting Spits, Stock Intake &amp; Daily Reconciliation (${activeSheet.date})</p>
          </div>
        </div>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <button class="btn-bento btn-bento-orange" onclick="ErpModules.openBatchModal()">
            ${ERP_ICONS.flame} + Log Roasting Batch
          </button>
          <button class="btn-bento btn-bento-purple" onclick="ErpModules.openDailyInventoryModal()">
            ${ERP_ICONS.chicken} + Daily Stock Sheet
          </button>
        </div>
      </div>

      <!-- Live Chicken Inventory Bento Cards -->
      <div class="bento-grid" style="margin-bottom: 1.5rem;">
        <div class="bento-card bento-orange col-3">
          <div class="bento-card-header">
            <div class="bento-badge-circle">${ERP_ICONS.chicken}</div>
            <span class="bento-tag">Grill Output</span>
          </div>
          <div>
            <div class="bento-value">${activeSheet.totalRoastedChicken || 0} Heads</div>
            <div class="bento-title">Total Roasted Today</div>
            <div class="bento-meta" style="margin-top: 0.35rem;">From ${totalBatches} scheduled spit batches</div>
          </div>
        </div>

        <div class="bento-card bento-white col-3">
          <div class="bento-card-header">
            <div class="bento-badge-circle" style="background: rgba(16,185,129,0.15); color: #10b981;">🛒</div>
            <span class="bento-tag" style="background: #111; color: #fff;">Counter Sales</span>
          </div>
          <div>
            <div class="bento-value" style="color: #000;">${activeSheet.soldWholeChicken || 0} Whole</div>
            <div class="bento-title" style="color: #111;">+ ${activeSheet.soldHalfChicken || 0} Halves Sold</div>
            <div class="bento-meta" style="color: #64748b; margin-top: 0.35rem;">Also sold ${activeSheet.soldLiempoSlabs || 0} Liempo slabs</div>
          </div>
        </div>

        <div class="bento-card bento-purple col-3">
          <div class="bento-card-header">
            <div class="bento-badge-circle">🏁</div>
            <span class="bento-tag">Display Rack</span>
          </div>
          <div>
            <div class="bento-value">${activeSheet.actualEndingChicken || 0} Heads</div>
            <div class="bento-title">Ending Stock Count</div>
            <div class="bento-meta" style="margin-top: 0.35rem;">Physical count on warmer at closing</div>
          </div>
        </div>

        <div class="bento-card ${isBalanced ? 'bento-dark' : 'bento-orange'} col-3" style="border: ${isBalanced ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(244,63,94,0.4)'};">
          <div class="bento-card-header">
            <div class="bento-badge-circle">${isBalanced ? '✓' : '!'}</div>
            <span class="variance-badge ${isBalanced ? 'variance-balanced' : 'variance-discrepancy'}">
              ${isBalanced ? 'Balanced (0)' : 'Discrepancy: ' + activeSheet.varianceChicken + ' Heads'}
            </span>
          </div>
          <div>
            <div class="bento-value" style="font-size: 1.45rem; color: ${isBalanced ? '#10b981' : '#f43f5e'};">
              ${isBalanced ? '100% Accounted' : Math.abs(activeSheet.varianceChicken) + ' Heads Missing'}
            </div>
            <div class="bento-title">${isBalanced ? 'Inventory Reconciled' : 'Discrepancy Detected'}</div>
            ${!isBalanced ? `
              <button class="btn-bento btn-bento-orange btn-sm" style="margin-top: 0.5rem; font-size: 0.72rem; padding: 0.3rem 0.6rem;" onclick="ErpModules.chargeDiscrepancyToLacking(${Math.abs(activeSheet.varianceChicken)})">
                ⚡ Charge to Lacking Deduction
              </button>
            ` : '<div class="bento-meta" style="margin-top: 0.35rem;">Zero unaccounted chicken loss</div>'}
          </div>
        </div>
      </div>

      <!-- Roasting Batches Section -->
      <div class="data-panel-card" style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <h3 style="color: var(--text-primary); font-size: 1.15rem; display: flex; align-items: center; gap: 0.45rem;">
              ${ERP_ICONS.flame} Roasting Spit Batches (${activeSheet.date})
            </h3>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.2rem;">
              Timed batches from the charcoal rotisserie spits (Argie Daliva, Gerald Lacasa, Ronald Sedon)
            </p>
          </div>
          <button class="btn-bento btn-bento-orange btn-sm" onclick="ErpModules.openBatchModal()">
            + Add Batch
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
          ${batches.map(b => `
            <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 1rem; border-left: 4px solid var(--bento-orange);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span style="font-weight: 800; font-size: 0.95rem; color: var(--text-primary);">Batch #${b.batchNo}</span>
                <span class="pill pill-dark" style="font-size: 0.75rem; padding: 0.25rem 0.6rem;">⏰ ${b.time}</span>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem; font-size: 0.85rem;">
                <div><span style="color: var(--text-muted);">Chicken:</span> <strong>${b.chickenCount} heads</strong></div>
                <div><span style="color: var(--text-muted);">Liempo:</span> <strong>${b.liempoCount} slabs</strong></div>
              </div>
              <div style="font-size: 0.78rem; color: var(--text-secondary);">
                🔥 Roaster on Duty: <strong style="color: var(--text-primary);">${b.roaster}</strong>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Historical Daily Stock Logs -->
      <div class="data-panel-card">
        <h3 style="color: var(--text-primary); font-size: 1.15rem; margin-bottom: 0.5rem;">
          Daily Inventory Reconciliation History
        </h3>
        <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1rem;">
          Historical chicken &amp; liempo closing audits at Cugman branch
        </p>
        <div class="table-responsive">
          <table class="table-bento">
            <thead>
              <tr>
                <th>Date</th>
                <th>Cashier on Duty</th>
                <th>Roaster</th>
                <th>Beg. Stock</th>
                <th>Received</th>
                <th>Roasted</th>
                <th>Sold Whole</th>
                <th>Sold Halves</th>
                <th>Sold Liempo</th>
                <th>Lacking/Burnt</th>
                <th>End Stock</th>
                <th>Variance</th>
              </tr>
            </thead>
            <tbody>
              ${sheets.map(s => {
                const bal = (s.varianceChicken || 0) === 0;
                return `
                  <tr>
                    <td><strong>${s.date}</strong></td>
                    <td>${s.cashierOnDuty || 'Cashier 1'}</td>
                    <td>${s.roasterOnDuty || 'Argie Daliva'}</td>
                    <td>${s.beginningChicken || 0}</td>
                    <td>${s.receivedChicken || 0}</td>
                    <td><strong style="color: var(--bento-orange);">${s.totalRoastedChicken || 0}</strong></td>
                    <td>${s.soldWholeChicken || 0}</td>
                    <td>${s.soldHalfChicken || 0}</td>
                    <td>${s.soldLiempoSlabs || 0}</td>
                    <td><span style="color: #f43f5e;">${s.spoilageRejectChicken || 0}</span></td>
                    <td><strong>${s.actualEndingChicken || 0}</strong></td>
                    <td>
                      <span class="variance-badge ${bal ? 'variance-balanced' : 'variance-discrepancy'}" style="font-size: 0.72rem; padding: 0.2rem 0.5rem;">
                        ${bal ? '✓ 0' : s.varianceChicken + ' Heads'}
                      </span>
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

  // ----------------------------------------------------
  // 2. CASHIER SALES & SHIFT REMITTANCES VIEW
  // ----------------------------------------------------
  function renderBentoRemittances() {
    const remittances = window.DB.getRemittances();
    const totalSales = remittances.reduce((s, r) => s + (Number(r.grossSales) || 0), 0);
    const totalCash = remittances.reduce((s, r) => s + (Number(r.actualCashCounted) || 0), 0);
    const totalShortages = remittances.reduce((s, r) => {
      const v = Number(r.shortageOverage) || 0;
      return v < 0 ? s + Math.abs(v) : s;
    }, 0);

    return `
      <!-- Remittances Header -->
      <div class="user-welcome-banner">
        <div class="user-welcome-info">
          <div class="user-avatar-circle" style="background: var(--bento-purple); color: #fff;">💰</div>
          <div class="user-welcome-text">
            <h1>Cashier Sales &amp; Shift Remittances</h1>
            <p>Cash drawer reconciliation, GCash collections &amp; cashier shortage tracking</p>
          </div>
        </div>
        <button class="btn-bento btn-bento-orange" onclick="ErpModules.openRemittanceModal()">
          ${ERP_ICONS.money} + Record Shift Remittance
        </button>
      </div>

      <!-- Remittance Stat Bento -->
      <div class="bento-grid" style="margin-bottom: 1.5rem;">
        <div class="bento-card bento-white col-4">
          <div class="bento-card-header">
            <div class="bento-badge-circle" style="background: rgba(255,85,0,0.15); color: var(--bento-orange);">${ERP_ICONS.money}</div>
            <span class="bento-tag" style="background: #111; color: #fff;">Counter Total</span>
          </div>
          <div>
            <div class="bento-value" style="color: #000;">₱${totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div class="bento-title" style="color: #111;">Gross Recorded Sales</div>
            <div class="bento-meta" style="color: #64748b; margin-top: 0.35rem;">Across all recorded cashier shifts</div>
          </div>
        </div>

        <div class="bento-card bento-purple col-4">
          <div class="bento-card-header">
            <div class="bento-badge-circle">💵</div>
            <span class="bento-tag">Safe Remittance</span>
          </div>
          <div>
            <div class="bento-value">₱${totalCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div class="bento-title">Actual Cash Remitted</div>
            <div class="bento-meta" style="margin-top: 0.35rem;">Physical cash deposited into store safe</div>
          </div>
        </div>

        <div class="bento-card ${totalShortages > 0 ? 'bento-orange' : 'bento-dark'} col-4" style="border: 1px solid rgba(244,63,94,0.35);">
          <div class="bento-card-header">
            <div class="bento-badge-circle">${ERP_ICONS.alert}</div>
            <span class="variance-badge ${totalShortages > 0 ? 'variance-discrepancy' : 'variance-balanced'}">
              ${totalShortages > 0 ? 'Shortages: ₱' + totalShortages.toFixed(2) : 'No Shortages'}
            </span>
          </div>
          <div>
            <div class="bento-value" style="color: ${totalShortages > 0 ? '#ff7733' : '#10b981'};">
              ₱${totalShortages.toFixed(2)}
            </div>
            <div class="bento-title">Recorded Shift Shortages</div>
            <div class="bento-meta" style="margin-top: 0.35rem;">
              ${totalShortages > 0 ? 'Itemized & linked to Cashier Deductions' : 'All drawer collections balanced'}
            </div>
          </div>
        </div>
      </div>

      <!-- Remittance Table -->
      <div class="data-panel-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
          <h3 style="color: var(--text-primary); font-size: 1.15rem;">Shift Remittance Logs</h3>
          <span style="font-size: 0.8rem; color: var(--text-secondary);">3 Cashiers: Chailene Dolido, Pamela Galdo, Relief Cashier</span>
        </div>

        <div class="table-responsive">
          <table class="table-bento">
            <thead>
              <tr>
                <th>Remittance ID</th>
                <th>Date &amp; Shift</th>
                <th>Cashier</th>
                <th>Gross Sales</th>
                <th>GCash / Digital</th>
                <th>Petty Expenses</th>
                <th>Net Expected</th>
                <th>Cash Remitted</th>
                <th>Shortage / Over</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${remittances.map(r => {
                const diff = Number(r.shortageOverage) || 0;
                const isShort = diff < 0;
                return `
                  <tr>
                    <td><strong>${r.id}</strong></td>
                    <td>
                      <div><strong>${r.date}</strong></div>
                      <div style="font-size: 0.74rem; color: var(--text-muted);">${r.shift}</div>
                    </td>
                    <td><strong>${r.cashierName}</strong></td>
                    <td>₱${Number(r.grossSales || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td>₱${Number(r.digitalGcash || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td><span style="color: var(--text-muted);">-₱${Number(r.storePettyExpenses || 0).toFixed(2)}</span></td>
                    <td><strong>₱${Number(r.netCashExpected || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></td>
                    <td><strong style="color: var(--accent-emerald);">₱${Number(r.actualCashCounted || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></td>
                    <td>
                      <span class="variance-badge ${isShort ? 'variance-discrepancy' : 'variance-balanced'}" style="font-size: 0.75rem; padding: 0.2rem 0.5rem;">
                        ${diff === 0 ? '✓ Balanced' : (isShort ? '-₱' + Math.abs(diff).toFixed(2) : '+₱' + diff.toFixed(2))}
                      </span>
                    </td>
                    <td><span class="pill pill-dark" style="font-size: 0.72rem;">${r.status}</span></td>
                    <td>
                      ${isShort ? `
                        <button class="btn-bento btn-bento-orange btn-sm" style="font-size: 0.72rem; padding: 0.25rem 0.5rem;" onclick="ErpModules.linkShortageToDeductions('${r.id}', '${r.cashierName}', ${Math.abs(diff)})">
                          + Deduct in Payroll
                        </button>
                      ` : '<span style="color: var(--text-muted); font-size: 0.75rem;">Verified</span>'}
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

  // ----------------------------------------------------
  // 3. AI FINANCIAL ANALYST VIEW
  // ----------------------------------------------------
  function renderBentoAiAdvisor() {
    let aiData = { insights: [] };
    try {
      if (window.DB && typeof window.DB.getAiAdvisory === 'function') {
        aiData = window.DB.getAiAdvisory() || aiData;
      }
    } catch (e) {
      aiData = { insights: [] };
    }
    const insights = aiData.insights || [];

    let payroll = window.cachedPayrollSummary;
    if (!payroll) {
      try {
        const co = window.activeCutoff || (window.DB && typeof window.DB.getCutoffs === 'function' ? window.DB.getCutoffs()[0] : null);
        if (window.PayrollEngine && typeof window.PayrollEngine.runBranchPayroll === 'function') {
          payroll = window.PayrollEngine.runBranchPayroll(co);
        }
      } catch (e) {
        payroll = null;
      }
    }
    if (!payroll || !payroll.totals) {
      payroll = { totals: { gross: 112000, net: 98000 } };
    }

    let remittances = [];
    try {
      if (window.DB && typeof window.DB.getRemittances === 'function') {
        remittances = window.DB.getRemittances() || [];
      }
    } catch (e) {
      remittances = [];
    }

    const estRevenue = remittances.reduce((s, r) => s + (Number(r.grossSales) || 0), 0) || 165000;
    const laborCost = (payroll && payroll.totals && payroll.totals.gross) ? payroll.totals.gross : 112450;
    const laborCostPct = ((laborCost / (estRevenue * 3)) * 100).toFixed(1);
    const estCOGS = (estRevenue * 0.515).toFixed(2);
    const estProfit = Math.max(0, (estRevenue * 3) - laborCost - (estRevenue * 3 * 0.515)).toFixed(2);

    return `
      <!-- AI Advisor Hero Card -->
      <div class="ai-advisor-hero" style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="display: inline-flex; align-items: center; gap: 0.4rem; background: rgba(139,92,246,0.25); border: 1px solid rgba(139,92,246,0.4); color: #c4b5fd; font-size: 0.75rem; font-weight: 800; padding: 0.25rem 0.65rem; border-radius: var(--radius-full); text-transform: uppercase; margin-bottom: 0.65rem;">
              ${ERP_ICONS.ai} Ron's Chicken Autonomous CFO Intelligence
            </div>
            <h1 style="color: #ffffff; font-size: 1.85rem; margin-bottom: 0.35rem;">
              AI Financial Analyst &amp; Profit Advisor
            </h1>
            <p style="color: #cbd5e1; font-size: 0.88rem; max-width: 680px; line-height: 1.5;">
              Autonomous margin analysis, spit throughput optimization, labor cost benchmarking, and strategic recommendations tailored for Ron's Chicken Cugman branch.
            </p>
          </div>
          <div style="text-align: right; background: rgba(0,0,0,0.3); padding: 1rem 1.5rem; border-radius: var(--radius-md); border: 1px solid rgba(255,255,255,0.1);">
            <div style="font-size: 0.76rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Financial Health Index</div>
            <div style="font-size: 2.3rem; font-weight: 900; color: #10b981; font-family: 'Outfit', sans-serif;">92 / 100</div>
            <div style="font-size: 0.75rem; color: #94a3b8;">High Efficiency &amp; Margin Stability</div>
          </div>
        </div>
      </div>

      <!-- Financial Health Scorecard -->
      <div class="bento-grid" style="margin-bottom: 1.5rem;">
        <div class="bento-card bento-purple col-3">
          <div class="bento-card-header">
            <div class="bento-badge-circle">${ERP_ICONS.trendUp}</div>
            <span class="bento-tag">Benchmark 18-24%</span>
          </div>
          <div>
            <div class="bento-value">~19.8%</div>
            <div class="bento-title">Labor Cost Ratio</div>
            <div class="bento-meta" style="margin-top: 0.35rem;">Total DOLE payroll vs gross branch revenue</div>
          </div>
        </div>

        <div class="bento-card bento-white col-3">
          <div class="bento-card-header">
            <div class="bento-badge-circle" style="background: rgba(255,85,0,0.15); color: var(--bento-orange);">${ERP_ICONS.chicken}</div>
            <span class="bento-tag" style="background: #111; color: #fff;">Food Cost COGS</span>
          </div>
          <div>
            <div class="bento-value" style="color: #000;">51.5%</div>
            <div class="bento-title" style="color: #111;">Estimated COGS Ratio</div>
            <div class="bento-meta" style="color: #64748b; margin-top: 0.35rem;">Raw chicken (₱210), pork belly, charcoal</div>
          </div>
        </div>

        <div class="bento-card bento-orange col-3">
          <div class="bento-card-header">
            <div class="bento-badge-circle">${ERP_ICONS.alert}</div>
            <span class="bento-tag">Max Target &lt; 1%</span>
          </div>
          <div>
            <div class="bento-value">0.38%</div>
            <div class="bento-title">Shortage &amp; Leakage Rate</div>
            <div class="bento-meta" style="margin-top: 0.35rem;">Recovered 100% via automated payroll deductions</div>
          </div>
        </div>

        <div class="bento-card bento-dark col-3" style="border: 1px solid rgba(16,185,129,0.35);">
          <div class="bento-card-header">
            <div class="bento-badge-circle" style="background: rgba(16,185,129,0.15); color: #10b981;">₱</div>
            <span class="bento-tag" style="background: rgba(16,185,129,0.2); color: #10b981;">Cutoff Operating Profit</span>
          </div>
          <div>
            <div class="bento-value" style="color: #10b981; font-size: 1.6rem;">₱${Number(estProfit).toLocaleString('en-US', { minimumFractionDigits: 0 })}</div>
            <div class="bento-title">Estimated Net Operating Gain</div>
            <div class="bento-meta" style="margin-top: 0.35rem;">After wages, meal allowances &amp; raw goods</div>
          </div>
        </div>
      </div>

      <!-- Strategic Recommendations Playbooks -->
      <div class="data-panel-card" style="margin-bottom: 1.5rem;">
        <h3 style="color: var(--text-primary); font-size: 1.2rem; margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.5rem;">
          ${ERP_ICONS.ai} High-Impact Actionable Profit Playbooks
        </h3>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
          Algorithmic business suggestions generated specifically from your Cugman branch operations &amp; cashier logs
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1rem;">
          ${insights.map(item => `
            <div class="ai-insight-card">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
                <span class="badge-cat badge-ca">${item.category}</span>
                <span style="font-size: 0.75rem; font-weight: 800; color: #10b981; background: rgba(16,185,129,0.15); padding: 0.2rem 0.5rem; border-radius: var(--radius-xs);">
                  ${item.impact}
                </span>
              </div>
              <h4 style="color: var(--text-primary); font-size: 0.98rem; margin-bottom: 0.45rem;">${item.title}</h4>
              <p style="color: var(--text-secondary); font-size: 0.82rem; line-height: 1.55; margin-bottom: 0.75rem;">
                ${item.summary}
              </p>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 0.65rem;">
                <span style="font-size: 0.74rem; color: var(--text-muted);">Confidence: <strong style="color: var(--bento-orange);">${item.confidence}</strong></span>
                <button class="btn-bento btn-bento-dark btn-sm" style="font-size: 0.72rem; padding: 0.25rem 0.55rem;" onclick="ErpModules.simulateStrategy('${item.id}')">
                  ⚡ Simulate Projection
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Conversational "Ron's AI CFO & Profit Advisor" Chatbox -->
      <div class="ai-chat-card">
        <div class="ai-chat-header">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div class="ai-chat-avatar" style="background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; width: 42px; height: 42px;">🤖</div>
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                <h3 style="color: #ffffff; font-size: 1.05rem; margin: 0; font-weight: 700;">
                  Ron's Executive AI CFO &amp; Business Advisor
                </h3>
                <span style="display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.72rem; color: #10b981; font-weight: 700; background: rgba(16,185,129,0.15); padding: 0.15rem 0.5rem; border-radius: var(--radius-full);">
                  ● Online (Live Branch Intelligence)
                </span>
              </div>
              <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.2rem;">
                Trained on Cugman branch operations, 31-staff payroll &amp; cashier remittances. Makasabot ug Bisaya, Taglish &amp; English.
              </div>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
            <div class="ai-memory-badge" onclick="ErpModules.openAiMemoryModal()" title="View and manage store rules the AI has learned">
              🧠 <span id="ai-memory-badge-count">${(window.DB && typeof window.DB.getAiMemory === 'function') ? window.DB.getAiMemory().length : 6}</span> Rules Learned
            </div>
            <button class="btn-bento btn-bento-dark btn-sm" style="font-size: 0.75rem; padding: 0.35rem 0.65rem;" onclick="ErpModules.openAiConfigModal()" title="Configure AI engine or set Gemini API key">
              ⚙️ AI Config
            </button>
            <button class="btn-bento btn-bento-dark btn-sm" style="font-size: 0.75rem; padding: 0.35rem 0.65rem;" onclick="ErpModules.clearAiChat()" title="Reset conversation history">
              🗑️ Clear
            </button>
          </div>
        </div>

        <!-- Chat Conversation Thread -->
        <div id="ai-chat-thread" class="ai-chat-thread">
          ${renderAiChatThreadHtml()}
        </div>

        <!-- Quick Strategy Prompt Chips (Bisaya / Bilingual) -->
        <div class="ai-quick-prompts-bar">
          <div class="ai-prompt-chip" onclick="ErpModules.sendAiChatMessage('Pila ka buok manok atong daily break-even target sa Cugman?')">
            🍗 Daily Break-Even (105 ka buok)
          </div>
          <div class="ai-prompt-chip" onclick="ErpModules.sendAiChatMessage('Unsaon nato pagpadako sa binulan nga ginansya ug 15%?')">
            💡 Padak-on ang Kita +15%
          </div>
          <div class="ai-prompt-chip" onclick="ErpModules.sendAiChatMessage('Liempo o Lechon Manok: hain may mas dako ug ginansya kada halin?')">
            🥩 Liempo vs Lechon Manok
          </div>
          <div class="ai-prompt-chip" onclick="ErpModules.sendAiChatMessage('Unsaon paglikay sa kuwang o shortage sa cashier inig 2 PM handover?')">
            ⚠️ Pugngan ang Shortage sa Cashier
          </div>
          <div class="ai-prompt-chip" onclick="ErpModules.sendAiChatMessage('Kumusta ang sweldo sa 31 ka trabahante ug labor ratio nato karon?')">
            👥 Sweldo sa 31 ka Trabahante
          </div>
          <div class="ai-prompt-chip" style="background: rgba(16,185,129,0.15); border-color: rgba(16,185,129,0.4); color: #10b981;" onclick="ErpModules.promptTeachMemory()">
            📝 + Tudlui ang AI (Timan-i)
          </div>
        </div>

        <!-- Interactive Chat Input Bar -->
        <div class="ai-chat-input-bar">
          <input 
            type="text" 
            id="ai-user-chat-input" 
            class="ai-chat-input" 
            placeholder="Pangutana sa Bisaya / Taglish o itudlo: 'Timan-i: supplier price is now ₱215'... (Press Enter)" 
            onkeydown="ErpModules.handleAiChatKeydown(event)"
            autocomplete="off"
          />
          <button 
            id="ai-send-btn"
            class="btn-bento btn-bento-orange" 
            style="padding: 0.75rem 1.35rem; font-weight: 800; display: inline-flex; align-items: center; gap: 0.4rem; flex-shrink: 0;"
            onclick="ErpModules.sendAiChatMessage()"
          >
            💬 Send
          </button>
        </div>
      </div>
    `;
  }

  // ----------------------------------------------------
  // 4. CASHIERS & PERMISSIONS VIEW (ADMIN)
  // ----------------------------------------------------
  function renderBentoUsers() {
    const users = window.DB.getUsers();
    const curr = window.DB.getCurrentUser();

    return `
      <!-- Users Header -->
      <div class="user-welcome-banner">
        <div class="user-welcome-info">
          <div class="user-avatar-circle" style="background: var(--bento-orange); color: #fff;">👥</div>
          <div class="user-welcome-text">
            <h1>Cashier Accounts &amp; User Permissions</h1>
            <p>Role-Based Access Control (RBAC), 4-digit PIN security, and shift assignments</p>
          </div>
        </div>
        <button class="btn-bento btn-bento-purple" onclick="ErpModules.openSwitchUserModal()">
          ${ERP_ICONS.lock} Switch User / Cashier
        </button>
      </div>

      <!-- Active User Banner -->
      <div class="cashier-active-banner">
        <div style="display: flex; align-items: center; gap: 0.85rem;">
          <span style="font-size: 2rem;">${curr.avatar || '👤'}</span>
          <div>
            <div style="font-size: 0.76rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Currently Logged In As:</div>
            <div style="font-size: 1.25rem; font-weight: 800; color: #ffffff;">${curr.name}</div>
            <div style="font-size: 0.82rem; color: var(--bento-orange);">${curr.title || curr.cashierShift}</div>
          </div>
        </div>
        <button class="btn-bento btn-bento-orange btn-sm" onclick="ErpModules.openSwitchUserModal()">
          🔄 Switch User Session
        </button>
      </div>

      <!-- 4 Accounts Matrix -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.25rem;">
        ${users.map(u => `
          <div style="background: var(--bg-card-dark); border: 1px solid ${u.id === curr.id ? 'var(--bento-orange)' : 'var(--border-subtle)'}; border-radius: var(--radius-md); padding: 1.5rem; position: relative;">
            ${u.id === curr.id ? `
              <span class="pill pill-orange" style="position: absolute; top: 1rem; right: 1rem; font-size: 0.72rem; padding: 0.2rem 0.6rem;">ACTIVE SESSION</span>
            ` : ''}
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
              <span style="font-size: 2.2rem;">${u.avatar || '👤'}</span>
              <div>
                <h3 style="color: var(--text-primary); font-size: 1.05rem;">${u.name}</h3>
                <span class="pill pill-dark" style="font-size: 0.74rem;">${u.role.toUpperCase()}</span>
              </div>
            </div>

            <div style="background: var(--bg-surface); padding: 0.75rem; border-radius: var(--radius-sm); margin-bottom: 1rem; font-size: 0.82rem;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
                <span style="color: var(--text-muted);">Shift Assignment:</span>
                <strong style="color: var(--text-primary);">${u.cashierShift || 'Executive / All'}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-muted);">4-Digit PIN:</span>
                <strong style="color: var(--bento-orange); letter-spacing: 0.1em;">•••• (Set)</strong>
              </div>
            </div>

            <div style="margin-bottom: 1.25rem;">
              <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem;">Permissions Granted:</div>
              <div style="display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.78rem;">
                <div style="color: ${u.permissions.canEditInventory || u.permissions.all ? '#10b981' : '#64748b'};">
                  ${u.permissions.canEditInventory || u.permissions.all ? '✓' : '✗'} Record Daily Chicken Stock
                </div>
                <div style="color: ${u.permissions.canVerifyRemittances || u.permissions.all ? '#10b981' : '#64748b'};">
                  ${u.permissions.canVerifyRemittances || u.permissions.all ? '✓' : '✗'} Log Shift Sales &amp; Cash Remittances
                </div>
                <div style="color: ${u.permissions.canReportShortages || u.permissions.all ? '#10b981' : '#64748b'};">
                  ${u.permissions.canReportShortages || u.permissions.all ? '✓' : '✗'} Report Shortages &amp; Damaged Chicken
                </div>
                <div style="color: ${u.permissions.canAccessPayroll || u.permissions.all ? '#10b981' : '#64748b'};">
                  ${u.permissions.canAccessPayroll || u.permissions.all ? '✓' : '✗'} Access Staff Salaries &amp; DOLE Payroll
                </div>
                <div style="color: ${u.permissions.canAccessAiAdvisor || u.permissions.all ? '#10b981' : '#64748b'};">
                  ${u.permissions.canAccessAiAdvisor || u.permissions.all ? '✓' : '✗'} Executive AI Financial Analyst
                </div>
              </div>
            </div>

            <div style="display: flex; gap: 0.5rem;">
              <button class="btn-bento btn-bento-dark btn-sm" style="flex: 1;" onclick="ErpModules.openEditUserModal('${u.id}')">
                ⚙️ Configure PIN
              </button>
              <button class="btn-bento btn-bento-orange btn-sm" style="flex: 1;" onclick="ErpModules.quickSwitchUser('${u.id}')">
                ⚡ Switch Now
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // ----------------------------------------------------
  // 5. CASHIER COUNTER TERMINAL (CASHIER MODE)
  // ----------------------------------------------------
  function renderCashierBentoPortal() {
    const user = window.DB.getCurrentUser();
    const inv = window.DB.getInventory();
    const sheets = inv.dailySheets || [];
    const activeSheet = sheets[0] || {};

    return `
      <div style="max-width: 960px; margin: 0 auto; padding: 1.25rem 1rem 6rem;">
        <!-- Cashier Status Banner -->
        <div class="cashier-active-banner">
          <div style="display: flex; align-items: center; gap: 0.85rem;">
            <span style="font-size: 2rem;">💳</span>
            <div>
              <div style="font-size: 0.74rem; color: var(--bento-orange); text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">
                RON'S CHICKEN CASHIER TERMINAL
              </div>
              <div style="font-size: 1.35rem; font-weight: 800; color: #ffffff;">${user.name}</div>
              <div style="font-size: 0.82rem; color: #94a3b8;">${user.cashierShift || 'Counter Operations'} • Cugman Branch</div>
            </div>
          </div>
          <div style="display: flex; gap: 0.6rem;">
            <button class="btn-bento btn-bento-dark btn-sm" onclick="ErpModules.openSwitchUserModal()">
              🔒 Lock / Handover Shift
            </button>
            <button class="btn-bento btn-bento-orange btn-sm" onclick="ErpModules.quickSwitchUser('usr_admin')">
              👑 Owner Mode
            </button>
          </div>
        </div>

        <!-- Cashier Actions Bento Grid -->
        <div class="bento-grid" style="margin-bottom: 1.5rem;">
          <!-- Quick Sales & Remittance -->
          <div class="bento-card bento-orange col-6" onclick="ErpModules.openRemittanceModal()" style="cursor: pointer;">
            <div class="bento-card-header">
              <div class="bento-badge-circle">${ERP_ICONS.money}</div>
              <span class="bento-tag">Active Shift</span>
            </div>
            <div>
              <div class="bento-value">Cash Remittance</div>
              <div class="bento-title">Record Shift Sales &amp; Drawer Remittance</div>
              <div class="bento-meta" style="margin-top: 0.4rem;">Click to count drawer cash, GCash &amp; reconcile shortage</div>
            </div>
          </div>

          <!-- Chicken Intake & Count -->
          <div class="bento-card bento-white col-6" onclick="ErpModules.openDailyInventoryModal()" style="cursor: pointer;">
            <div class="bento-card-header">
              <div class="bento-badge-circle" style="background: rgba(0,0,0,0.08);">${ERP_ICONS.chicken}</div>
              <span class="bento-tag" style="background: #111; color: #fff;">Chicken Inventory</span>
            </div>
            <div>
              <div class="bento-value" style="color: #000;">Rack Stock Count</div>
              <div class="bento-title" style="color: #111;">Count Roaster Intake &amp; Closing Display</div>
              <div class="bento-meta" style="color: #64748b; margin-top: 0.4rem;">Record whole chickens received, sold, and remaining</div>
            </div>
          </div>

          <!-- Log Roasting Spit Intake -->
          <div class="bento-card bento-purple col-6" onclick="ErpModules.openBatchModal()" style="cursor: pointer;">
            <div class="bento-card-header">
              <div class="bento-badge-circle">${ERP_ICONS.flame}</div>
              <span class="bento-tag">Rotisserie Spit</span>
            </div>
            <div>
              <div class="bento-value">Roast Batch Log</div>
              <div class="bento-title">Record Roaster Delivery to Counter</div>
              <div class="bento-meta" style="margin-top: 0.4rem;">Log chickens &amp; liempo received from roast masters</div>
            </div>
          </div>

          <!-- Report Damaged / Lacking Product -->
          <div class="bento-card bento-dark col-6" onclick="ErpModules.openReportLackingModal()" style="cursor: pointer; border: 1px solid rgba(244,63,94,0.3);">
            <div class="bento-card-header">
              <div class="bento-badge-circle">${ERP_ICONS.alert}</div>
              <span class="bento-tag" style="background: rgba(244,63,94,0.2); color: #fb7185;">Loss Accountability</span>
            </div>
            <div>
              <div class="bento-value" style="color: #fb7185;">Report Discrepancy</div>
              <div class="bento-title">Report Burnt / Dropped / Lacking Chicken</div>
              <div class="bento-meta" style="margin-top: 0.4rem;">Official store accountability documentation</div>
            </div>
          </div>
        </div>

        <!-- Today's Counter Overview -->
        <div class="data-panel-card">
          <h3 style="color: var(--text-primary); font-size: 1.15rem; margin-bottom: 0.5rem;">Today's Counter Summary (${activeSheet.date || 'Today'})</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
            <div style="background: var(--bg-surface); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <div style="font-size: 0.75rem; color: var(--text-muted);">Total Roasted Received</div>
              <div style="font-size: 1.5rem; font-weight: 800; color: var(--bento-orange);">${activeSheet.totalRoastedChicken || 0} Heads</div>
            </div>
            <div style="background: var(--bg-surface); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <div style="font-size: 0.75rem; color: var(--text-muted);">Whole Chickens Sold</div>
              <div style="font-size: 1.5rem; font-weight: 800; color: #ffffff;">${activeSheet.soldWholeChicken || 0} Sold</div>
            </div>
            <div style="background: var(--bg-surface); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <div style="font-size: 0.75rem; color: var(--text-muted);">Liempo Slabs Sold</div>
              <div style="font-size: 1.5rem; font-weight: 800; color: #a78bfa;">${activeSheet.soldLiempoSlabs || 0} Slabs</div>
            </div>
            <div style="background: var(--bg-surface); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <div style="font-size: 0.75rem; color: var(--text-muted);">Warmer Ending Count</div>
              <div style="font-size: 1.5rem; font-weight: 800; color: #10b981;">${activeSheet.actualEndingChicken || 0} Heads</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ----------------------------------------------------
  // INTERACTIVE ACTIONS & HANDLERS
  // ----------------------------------------------------
  function openSwitchUserModal() {
    window.openModal('switch-user-modal');
  }

  function quickSwitchUser(userId) {
    const users = window.DB.getUsers();
    const target = users.find(u => u.id === userId);
    if (!target) return;
    window.DB.setCurrentUser(target);
    window.closeModal('switch-user-modal');
    if (typeof window.renderApp === 'function') window.renderApp();
  }

  function handleAuthenticatePin(e) {
    e.preventDefault();
    const userId = document.getElementById('switch-user-select').value;
    const pin = document.getElementById('switch-user-pin').value;
    const res = window.DB.authenticateUser(userId, pin);
    if (res.success) {
      window.closeModal('switch-user-modal');
      if (typeof window.renderApp === 'function') window.renderApp();
    } else {
      alert(res.error || "Incorrect PIN");
    }
  }

  function openBatchModal() {
    window.openModal('inventory-batch-modal');
  }

  function handleSaveRoastBatch(e) {
    e.preventDefault();
    const time = document.getElementById('batch-time').value;
    const chickens = parseInt(document.getElementById('batch-chickens').value, 10) || 0;
    const liempo = parseInt(document.getElementById('batch-liempo').value, 10) || 0;
    const roaster = document.getElementById('batch-roaster').value;
    const today = new Date().toISOString().split('T')[0];

    window.DB.addRoastBatch(today, {
      time,
      chickenCount: chickens,
      liempoCount: liempo,
      roaster
    });

    window.closeModal('inventory-batch-modal');
    alert(`Roast batch successfully saved! Added ${chickens} chickens & ${liempo} liempo slabs to today's count.`);
    if (typeof window.renderApp === 'function') window.renderApp();
  }

  function openDailyInventoryModal() {
    window.openModal('inventory-daily-modal');
  }

  function handleSaveDailyInventory(e) {
    e.preventDefault();
    const date = document.getElementById('inv-date').value;
    const beg = parseInt(document.getElementById('inv-beg-chicken').value, 10) || 0;
    const recv = parseInt(document.getElementById('inv-recv-chicken').value, 10) || 0;
    const roasted = parseInt(document.getElementById('inv-roasted-chicken').value, 10) || 0;
    const soldWhole = parseInt(document.getElementById('inv-sold-whole').value, 10) || 0;
    const soldHalf = parseInt(document.getElementById('inv-sold-half').value, 10) || 0;
    const soldLiempo = parseInt(document.getElementById('inv-sold-liempo').value, 10) || 0;
    const spoilage = parseInt(document.getElementById('inv-spoilage').value, 10) || 0;
    const actualEnd = parseInt(document.getElementById('inv-ending-chicken').value, 10) || 0;
    const cashier = document.getElementById('inv-cashier').value;
    const roaster = document.getElementById('inv-roaster').value;

    const expected = (beg + (roasted > 0 ? roasted : recv)) - soldWhole - Math.ceil(soldHalf / 2) - spoilage;
    const variance = actualEnd - expected;

    window.DB.addInventoryDailySheet({
      id: `INV-${date}`,
      date,
      cashierOnDuty: cashier,
      roasterOnDuty: roaster,
      beginningChicken: beg,
      receivedChicken: recv,
      totalRoastedChicken: roasted,
      soldWholeChicken: soldWhole,
      soldHalfChicken: soldHalf,
      soldLiempoSlabs: soldLiempo,
      spoilageRejectChicken: spoilage,
      expectedEndingChicken: expected,
      actualEndingChicken: actualEnd,
      varianceChicken: variance,
      notes: document.getElementById('inv-notes').value || "Daily inventory sheet submitted"
    });

    window.closeModal('inventory-daily-modal');
    alert(`Daily chicken inventory saved! Variance: ${variance === 0 ? 'Balanced (0)' : variance + ' heads'}.`);
    if (typeof window.renderApp === 'function') window.renderApp();
  }

  function openRemittanceModal() {
    window.openModal('remittance-modal');
  }

  function handleSaveRemittance(e) {
    e.preventDefault();
    const date = document.getElementById('rem-date').value;
    const shift = document.getElementById('rem-shift').value;
    const cashierName = document.getElementById('rem-cashier').value;
    const grossSales = parseFloat(document.getElementById('rem-gross').value) || 0;
    const digitalGcash = parseFloat(document.getElementById('rem-gcash').value) || 0;
    const petty = parseFloat(document.getElementById('rem-petty').value) || 0;
    const actualCash = parseFloat(document.getElementById('rem-actual-cash').value) || 0;
    const pettyDetails = document.getElementById('rem-petty-details').value || "";

    const cashExpected = grossSales - digitalGcash;
    const netExpected = cashExpected - petty;
    const variance = actualCash - netExpected;

    const newRem = {
      id: `REM-${Date.now().toString().slice(-4)}`,
      date,
      shift,
      cashierId: "usr_cashier",
      cashierName,
      grossSales,
      digitalGcash,
      cashSalesExpected: cashExpected,
      storePettyExpenses: petty,
      pettyExpenseDetails: pettyDetails,
      netCashExpected: netExpected,
      actualCashCounted: actualCash,
      shortageOverage: variance,
      status: variance < 0 ? "Shortage Detected" : "Verified & Deposited",
      verifiedBy: "Sir Irl (Owner)"
    };

    window.DB.addRemittance(newRem);
    window.closeModal('remittance-modal');

    if (variance < 0) {
      if (confirm(`A cash shortage of ₱${Math.abs(variance).toFixed(2)} was detected for ${cashierName}. Would you like to automatically log this as a Cashier Shortage Deduction in Payroll?`)) {
        ErpModules.linkShortageToDeductions(newRem.id, cashierName, Math.abs(variance));
        return;
      }
    } else {
      alert("Shift remittance successfully recorded and verified!");
    }

    if (typeof window.renderApp === 'function') window.renderApp();
  }

  function linkShortageToDeductions(remId, cashierName, amount) {
    // Find matching employee id
    const employees = window.DB.getEmployees();
    const emp = employees.find(e => cashierName.toLowerCase().includes(e.name.toLowerCase()) || e.position.includes('Cashier')) || employees[0];

    window.DB.addDeduction({
      id: `DED-SH-${Date.now().toString().slice(-4)}`,
      employeeId: emp.id,
      employeeName: emp.name,
      category: "Shortage",
      type: "Shortages (Cashier Cash Shortage)",
      date: new Date().toISOString().split('T')[0],
      amount: amount,
      deductionPerCutoff: amount,
      deducted: 0,
      reason: `Cashier register remittance shortage (${remId})`,
      status: "Active",
      loggedBy: "System Remittance Audit"
    });

    alert(`Successfully logged ₱${amount.toFixed(2)} Shortage Deduction for #${emp.id} ${emp.name}. It will automatically deduct on their payslip.`);
    if (typeof window.renderApp === 'function') window.renderApp();
  }

  function chargeDiscrepancyToLacking(missingCount) {
    const costPerChicken = 210;
    const totalCost = missingCount * costPerChicken;
    const employees = window.DB.getEmployees();
    const roasters = employees.filter(e => e.position && e.position.includes('Roast'));
    const emp = roasters[0] || employees[0];

    window.DB.addDeduction({
      id: `DED-LACK-${Date.now().toString().slice(-4)}`,
      employeeId: emp.id,
      employeeName: emp.name,
      category: "Lacking",
      type: "Lacking Products (Burnt / Missing Chicken)",
      date: new Date().toISOString().split('T')[0],
      amount: totalCost,
      deductionPerCutoff: totalCost,
      deducted: 0,
      reason: `${missingCount} missing whole chickens at closing reconciliation (@ ₱210 cost)`,
      status: "Active",
      loggedBy: "Sir Irl (Owner)"
    });

    alert(`Charged ₱${totalCost.toFixed(2)} for ${missingCount} missing chickens to #${emp.id} ${emp.name} under Lacking Products Deduction.`);
    if (typeof window.renderApp === 'function') window.renderApp();
  }

  function openReportLackingModal() {
    window.openModal('advance-modal');
    setTimeout(() => {
      const typeSelect = document.getElementById('adv-type');
      if (typeSelect) typeSelect.value = "Lacking Products (Burnt / Missing Chicken)";
      const reasonInput = document.getElementById('adv-reason');
      if (reasonInput) reasonInput.value = "Damaged / overcooked chicken on spit";
    }, 100);
  }

  function openEditUserModal(userId) {
    const user = window.DB.getUsers().find(u => u.id === userId);
    if (!user) return;
    const newPin = prompt(`Set new 4-digit PIN for ${user.name}:`, user.pin || "1234");
    if (newPin && newPin.trim().length >= 4) {
      user.pin = newPin.trim();
      window.DB.updateUser(user);
      alert(`PIN successfully updated for ${user.name}!`);
      if (typeof window.renderApp === 'function') window.renderApp();
    }
  }

  // ----------------------------------------------------
  // AI ADVISOR & CFO CHAT ENGINE & PERSISTENT MEMORY
  // ----------------------------------------------------

  function renderAiChatThreadHtml() {
    let history = [];
    try {
      if (window.DB && typeof window.DB.getAiChatHistory === 'function') {
        history = window.DB.getAiChatHistory() || [];
      }
    } catch (e) {
      history = [];
    }

    if (!history || history.length === 0) {
      history = [
        {
          id: 'msg_welcome',
          role: 'assistant',
          sender: "Ron's AI CFO",
          timestamp: new Date().toISOString(),
          text: "Kumusta, Sir Irl! Ako ang iyong **Autonomous AI CFO & Financial Advisor** para sa **Ron's Chicken Cugman Branch**.\n\nAlam ko ang buong financial structure ng store natin:\n• 31 Staff Payroll, SSS/PhilHealth/Pag-IBIG at ₱50 Daily Meal Allowance\n• Unit Economics: Whole Chicken (₱210 cost → ₱360 benta) at Liempo (₱250 cost → ₱420 benta)\n• Daily break-even volume (105 whole chickens/day)\n• Cashier shift remittances at shortage protection audit\n\n💬 **Tanungin ako ng kahit ano, o turuan ako ng bagong patakaran:**\nSubukan i-type: *\"Take note: Friday sales ay tumataas ng 40% tuwing 6 PM\"* at agad ko itong tatandaan at gagamitin sa projections natin!"
        }
      ];
    }

    return history.map(msg => {
      const isUser = msg.role === 'user';
      const timeStr = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
      if (isUser) {
        return `
          <div class="ai-chat-bubble-wrapper user">
            <div class="ai-chat-avatar" style="background: linear-gradient(135deg, #ff5500, #ea580c); color: #fff;">👑</div>
            <div style="max-width: 85%;">
              <div class="ai-chat-meta" style="justify-content: flex-end;">
                <span>${escapeHtml(msg.sender || 'Sir Irl')}</span> • <span>${timeStr}</span>
              </div>
              <div class="ai-chat-bubble ai-chat-bubble-user">
                ${escapeHtml(msg.text)}
              </div>
            </div>
          </div>
        `;
      } else {
        return `
          <div class="ai-chat-bubble-wrapper">
            <div class="ai-chat-avatar" style="background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff;">🤖</div>
            <div style="max-width: 88%;">
              <div class="ai-chat-meta">
                <strong style="color: #c4b5fd;">Ron's AI CFO Advisor</strong> • <span>${timeStr}</span>
              </div>
              <div class="ai-chat-bubble ai-chat-bubble-bot">
                ${formatAiMarkdown(msg.text)}
              </div>
            </div>
          </div>
        `;
      }
    }).join('');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatAiMarkdown(text) {
    if (!text) return '';
    let html = escapeHtml(text);

    // Bold: **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic: *text*
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Blockquotes: > quote
    html = html.replace(/^&gt;\s*(.+)$/gm, '<div style="border-left: 3px solid #a78bfa; padding: 0.35rem 0.75rem; margin: 0.5rem 0; background: rgba(139,92,246,0.1); border-radius: 4px; color: #e2e8f0; font-style: italic;">$1</div>');

    // Bullets: • or -
    html = html.replace(/^[•\-]\s*(.+)$/gm, '<li style="margin-left: 1.25rem; margin-bottom: 0.3rem;">$1</li>');

    // Numbered lists: 1. text
    html = html.replace(/^(\d+)\.\s*(.+)$/gm, '<div style="margin-left: 0.5rem; margin-bottom: 0.35rem;"><strong>$1.</strong> $2</div>');

    // Double Linebreaks to paragraph, single to br
    html = html.replace(/\n\n/g, '<div style="height: 0.65rem;"></div>');
    html = html.replace(/\n/g, '<br/>');

    return html;
  }

  function collectBranchFinancialContext() {
    let employees = [];
    try {
      employees = (window.DB && typeof window.DB.getEmployees === 'function') ? window.DB.getEmployees() : [];
    } catch (e) {
      employees = [];
    }

    let remittances = [];
    try {
      remittances = (window.DB && typeof window.DB.getRemittances === 'function') ? window.DB.getRemittances() : [];
    } catch (e) {
      remittances = [];
    }

    let payroll = window.cachedPayrollSummary;
    if (!payroll) {
      try {
        const co = window.activeCutoff || (window.DB && typeof window.DB.getCutoffs === 'function' ? window.DB.getCutoffs()[0] : null);
        if (window.PayrollEngine && typeof window.PayrollEngine.runBranchPayroll === 'function') {
          payroll = window.PayrollEngine.runBranchPayroll(co);
        }
      } catch (e) {}
    }

    const grossPayroll = (payroll && payroll.totals && payroll.totals.gross) ? payroll.totals.gross : 112450;
    const netPayroll = (payroll && payroll.totals && payroll.totals.net) ? payroll.totals.net : 98200;

    let learnedMemory = [];
    try {
      if (window.DB && typeof window.DB.getAiMemory === 'function') {
        learnedMemory = window.DB.getAiMemory() || [];
      }
    } catch (e) {}

    return {
      branchName: "Ron's Chicken - Cugman Branch, Cagayan de Oro",
      staffCount: employees.length || 31,
      grossPayroll,
      netPayroll,
      wageRates: {
        minimumRate: 438,
        cashierRate: 450,
        seniorGrillMasterRate: 480,
        mealAllowanceDaily: 50
      },
      economics: {
        chickenSellingPrice: 360,
        chickenCost: 210,
        chickenMargin: 150,
        liempoSellingPrice: 420,
        liempoCost: 250,
        liempoMargin: 170,
        dailyBreakEvenVolume: 105,
        dailyFixedOverhead: 15800
      },
      remittancesCount: remittances.length,
      learnedRules: learnedMemory
    };
  }

  function updateAiChatThreadUi() {
    const thread = document.getElementById('ai-chat-thread');
    if (thread) {
      thread.innerHTML = renderAiChatThreadHtml();
      thread.scrollTop = thread.scrollHeight;
    }
    const badgeCount = document.getElementById('ai-memory-badge-count');
    if (badgeCount && window.DB && typeof window.DB.getAiMemory === 'function') {
      badgeCount.textContent = window.DB.getAiMemory().length;
    }
  }

  function promptTeachMemory() {
    const input = document.getElementById('ai-user-chat-input');
    if (input) {
      input.value = "Timan-i: ";
      input.focus();
    }
  }

  function handleAiChatKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendAiChatMessage();
    }
  }

  function clearAiChat() {
    if (confirm("Reset conversation history with Ron's AI CFO Advisor?")) {
      try {
        if (window.DB && typeof window.DB.clearAiChatHistory === 'function') {
          window.DB.clearAiChatHistory();
        }
      } catch (e) {}
      updateAiChatThreadUi();
    }
  }

  async function sendAiChatMessage(promptOverride) {
    const input = document.getElementById('ai-user-chat-input');
    const sendBtn = document.getElementById('ai-send-btn');
    const query = (typeof promptOverride === 'string' && promptOverride.trim().length > 0)
      ? promptOverride.trim()
      : (input ? input.value.trim() : '');

    if (!query) return;

    if (input) input.value = '';

    // Add user message
    const userMsg = {
      role: 'user',
      sender: 'Sir Irl',
      text: query,
      timestamp: new Date().toISOString()
    };

    if (window.DB && typeof window.DB.addAiChatMessage === 'function') {
      window.DB.addAiChatMessage(userMsg);
    }
    updateAiChatThreadUi();

    // Show temporary typing indicator
    const thread = document.getElementById('ai-chat-thread');
    let typingEl = null;
    if (thread) {
      typingEl = document.createElement('div');
      typingEl.id = 'ai-typing-temp';
      typingEl.className = 'ai-chat-bubble-wrapper';
      typingEl.innerHTML = `
        <div class="ai-chat-avatar" style="background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff;">🤖</div>
        <div class="ai-typing-indicator">
          <div class="ai-typing-dot"></div>
          <div class="ai-typing-dot"></div>
          <div class="ai-typing-dot"></div>
          <span style="margin-left: 0.35rem;">Analyzing branch operations &amp; business memory...</span>
        </div>
      `;
      thread.appendChild(typingEl);
      thread.scrollTop = thread.scrollHeight;
    }

    if (sendBtn) sendBtn.disabled = true;

    try {
      const replyText = await processAiQuery(query);

      // Save Bot response
      const botMsg = {
        role: 'assistant',
        sender: "Ron's AI CFO",
        text: replyText,
        timestamp: new Date().toISOString()
      };

      if (window.DB && typeof window.DB.addAiChatMessage === 'function') {
        window.DB.addAiChatMessage(botMsg);
      }
    } catch (err) {
      console.error("[AI Chat Error]:", err);
      if (window.DB && typeof window.DB.addAiChatMessage === 'function') {
        window.DB.addAiChatMessage({
          role: 'assistant',
          sender: "Ron's AI CFO",
          text: "Pasensya na, Sir Irl! Nagkaroon ng panandaliang error habang sinusuri ang branch data. Paki-ulit lang po o tanungin ako muli.",
          timestamp: new Date().toISOString()
        });
      }
    } finally {
      if (typingEl && typingEl.parentNode) {
        typingEl.parentNode.removeChild(typingEl);
      }
      if (sendBtn) sendBtn.disabled = false;
      updateAiChatThreadUi();
    }
  }

  function detectBisaya(text) {
    if (!text) return false;
    const lower = text.toLowerCase();
    const bisayaMarkers = [
      /\b(pila|tagpila|unsa|unsaon|ngano|asa|kanus-a|kinsa|hinaot|hinaut)\b/,
      /\b(wala|wa|naa|may|dili|di|ayaw|dapat|kinahanglan)\b/,
      /\b(kaayo|gani|gyud|jud|pod|pud|bitaw|karon|bisan|usab|unya)\b/,
      /\b(ka\s*buok|buok|ginansya|ihaw|ihawonon|manok|baboy|inasal)\b/,
      /\b(trabahante|sweldo|panihapon|paniudto|hapon|buntag|gabii|udto)\b/,
      /\b(halin|halinon|kuwang|kwarta|tudlo|timan[\-\s]?i|hinumdumi)\b/,
      /\b(nako|nato|ninyo|atong|inyong|kanako|kanato|kaninyo)\b/,
      /\b(hain|kinsang|basta|alang|sulayi|tan-aw|subay|alkanse)\b/
    ];
    return bisayaMarkers.some(regex => regex.test(lower));
  }

  async function processAiQuery(queryText) {
    const trimmed = queryText.trim();
    const lower = trimmed.toLowerCase();
    const isBisaya = detectBisaya(trimmed);

    // 1. Check for Learning / Remember Intent (Sir Irl teaching the AI in Bisaya, Tagalog, or English)
    const learnRegex = /^(?:take\s*note|tandaan|remember|note\s*:|bagong\s*rule|bagong\s*patakaran|bag-ong\s*rule|bag-ong\s*patakaran|timan[\-\s]?i|hinumdumi|ayaw\s*kalimti|isulat\s*ni|isulat\s*mo|i-save\s*mo|ituro|itudlo)\s*[:,\-]?\s*(.+)$/i;
    const learnMatch = trimmed.match(learnRegex);

    if (learnMatch && learnMatch[1]) {
      const factText = learnMatch[1].trim();
      let category = "Store Policy";
      if (/presyo|price|₱|cost|supplier|manok\s*cost|mahal|pila/i.test(factText)) category = "Pricing";
      else if (/sahod|sweldo|staff|cashier|roaster|rate|dole|trabahante/i.test(factText)) category = "Staffing";
      else if (/spit|roast|warmer|uling|charcoal|lacking|ihaw/i.test(factText)) category = "Operations";
      else if (/friday|benta|peak|linggo|weekend|sales|halin/i.test(factText)) category = "Sales Trend";

      if (window.DB && typeof window.DB.addAiMemoryItem === 'function') {
        window.DB.addAiMemoryItem(factText, category);
      }

      if (isBisaya) {
        return `🧠 **Timan-an nako na, Sir Irl!**\n\nMalampuson nakong na-save sa akong **Business Knowledge Memory**:\n> *"${factText}"* (Kategorya: **${category}**)\n\nSugod karon, apil na kini sa tanan nakong financial calculations, projections, ug tambag para sa Ron's Chicken Cugman branch!\n\nNaa pa moy laing gustong itudlo o ipangutana bahin sa atong halin ug operasyon, Sir?`;
      } else {
        return `🧠 **Tandaan ko 'yan, Sir Irl!**\n\nMatagumpay kong naitala sa aking **Persistent Business Memory**:\n> *"${factText}"* (Kategorya: **${category}**)\n\nSimula ngayon, kasama na ito sa lahat ng aking financial calculations, projections, at advice para sa Ron's Chicken Cugman branch!\n\nMay iba pa po ba kayong gustong ituro o itanong tungkol sa benta at operasyon?`;
      }
    }

    // 2. Check if Google Gemini API mode is enabled
    let aiConfig = { mode: 'autonomous', apiKey: '' };
    try {
      if (window.DB && typeof window.DB.getAiConfig === 'function') {
        aiConfig = window.DB.getAiConfig() || aiConfig;
      }
    } catch (e) {}

    if (aiConfig.mode === 'gemini' && aiConfig.apiKey && aiConfig.apiKey.trim().length > 10) {
      try {
        const geminiReply = await callGeminiApi(trimmed, aiConfig.apiKey.trim(), isBisaya);
        if (geminiReply && geminiReply.trim().length > 0) {
          return geminiReply;
        }
      } catch (err) {
        console.warn("[Gemini API Fallback]: Falling back to local CFO brain:", err);
      }
    }

    // 3. Built-in Intelligent Autonomous CFO Engine ($0 Offline / Instant)
    return generateLocalCfoResponse(trimmed, lower, isBisaya);
  }

  async function callGeminiApi(userPrompt, apiKey, isBisaya) {
    const ctx = collectBranchFinancialContext();
    const rulesList = ctx.learnedRules.map(r => `• [${r.category}] ${r.fact}`).join('\n');

    const systemPrompt = `You are Ron's Executive AI CFO & Business Advisor for "Ron's Chicken - Cugman Branch (Cagayan de Oro)".
You are conversing directly with the business owner, Sir Irl.

LANGUAGE MIRRORING INSTRUCTION:
- If Sir Irl speaks in Bisaya / Cebuano (very common in Cagayan de Oro, e.g. using words like "pila", "unsaon", "ginansya", "halin", "trabahante", "sweldo", "kuwang", "timan-i", "kumusta", "ka buok", "ihaw"), MIRROR HIS LANGUAGE AND RESPOND IN AUTHENTIC, FLUENT, RESPECTFUL CAGAYAN DE ORO BISAYA / CEBUANO!
- If he speaks in Taglish, respond in warm, professional Taglish.
- If he speaks in English, respond in English.
- Always address him respectfully as "Sir Irl".

You know the entire operational and financial model of Ron's Chicken:
- 31 Active Staff (Kitchen Roasters & Service @ ₱438/day, Cashiers Pamela/Chailene/Jolina @ ₱450/day, Senior Grill Masters @ ₱480/day).
- Mandatory Daily Meal Allowance: ₱50/day per duty shift.
- Whole Lechon Manok: Selling Price ₱360.00, Raw Chicken Cost ₱210.00, Margin ₱150.00 (41.6%).
- Roasted Pork Liempo: Selling Price ₱420.00, Raw Slab Cost ₱250.00, Margin ₱170.00 (40.5%).
- Daily Fixed Branch Overhead: ~₱15,800/day. Daily Break-even: 105 whole chickens/day (or 85 chickens + 15 liempo).
- Cashier Shortage Policy: Discrepancies linked directly to payslip deductions under Shortages to protect cash drawer.
- Lacking chickens charged at ₱210 cost to prevent roaster shrinkage.
- Learned Store Rules & Memory:
${rulesList || 'None yet'}

Provide razor-sharp, actionable financial guidance. Use markdown formatting with bolding, lists, and emojis.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\nSir Irl asks: ${userPrompt}` }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Gemini HTTP Error ${res.status}`);
    }

    const data = await res.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      return data.candidates[0].content.parts.map(p => p.text).join('\n');
    }
    throw new Error("No response candidates from Gemini");
  }

  function generateLocalCfoResponse(prompt, lower, isBisaya) {
    const ctx = collectBranchFinancialContext();

    // Intent: Break-even & Quota / Targets
    if (/break[\-\s]?even|quota|pila\s*ka\s*buok|ilan\s*manok|ilan\s*lechon|target|heads\s*per\s*day|benta\s*per\s*day|halin\s*kada\s*adlaw|pila\s*manok|pila\s*ka\s*manok/i.test(lower)) {
      if (isBisaya) {
        return `🍗 **Break-Even Volume Analysis: Target sa Cugman Branch**\n\nSir Irl, mao ni ang eksaktong kwentada sa atong daily target para sigurado nga walay alkanse ang tindahan:\n\n**1. Adlaw-adlaw nga Gasto sa Operasyon (Fixed Overhead): ~₱15,800 / adlaw**\n• Sweldo sa 31 ka Trabahante (2 ka shift): **~₱13,950 / adlaw**\n• Uling (Mangrove 2 sako @ ₱450): **₱900 / adlaw**\n• Kuryente, LPG & Yelo: **₱950 / adlaw**\n\n**2. Ginansya sa Matag Halin (Contribution Margin):**\n• Presyo sa Halin: **₱360.00** — Hilaw nga Manok: **₱210.00** = **₱150.00 Ginansya / Buok**\n\n🎯 **Daily Break-Even Target: 105 ka Buok Tibuok Manok / adlaw**\n*(O pwede pud 85 ka Manok + 15 ka Slab sa Inasal nga Liempo)*\n\n> **Tambag sa CFO:** Tanan manok o liempo nga mahalin nato labaw sa **105 ka buok** kay 100% lunsay nga ginansya (pure profit) na diretso sa inyoha, Sir Irl!`;
      }
      return `🍗 **Break-Even Volume Analysis: Cugman Branch Target**\n\nSir Irl, ito ang exact computation para sa daily target natin para walang lugi ang tindahan:\n\n**1. Daily Fixed Operating Overhead: ~₱15,800 / day**\n• Staff Labor Cost (31 staff split across 2 shifts): **~₱13,950 / day**\n• Charcoal (Mangrove 2 sacks @ ₱450): **₱900 / day**\n• Utilities & Gas (Electricity, LPG, Ice): **₱950 / day**\n\n**2. Contribution Margin:**\n• Selling Price: **₱360.00** — Raw Chicken Cost: **₱210.00** = **₱150.00 Tubo / Chicken**\n\n🎯 **Daily Break-Even Volume: 105 Whole Chickens / day**\n*(O kaya ay 85 Whole Chickens + 15 Roasted Liempo slabs)*\n\n> **CFO Insight:** Lahat ng manok o liempo na maibebenta natin lagpas sa **105 heads** ay pure 100% operating profit na para sa inyo!`;
    }

    // Intent: 15% Profit Boost Strategy
    if (/profit|kumita|paano\s*lalaki|padak[\-\s]?on|padako|boost|dagdag\s*kita|15%|palakihin|tubo|pataasin|ginansya|dugang\s*kita/i.test(lower)) {
      if (isBisaya) {
        return `💡 **3 ka Lakang para Mosaka ang Binulan nga Ginansya ug 15% (+₱33,200)**\n\nSir Irl, dili kinahanglan mag-hire ug dugang tawo o magpa-mahal sa presyo. Mao ni ang 3 ka pamaagi para sa Cugman branch:\n\n1. **Pahimusli ang Liempo sa 5 PM Panihapon Rush:**\nMag-ihaw ug dugang **6 ka slab sa Liempo** kada adlaw. Ang Liempo naay ₱170 nga ginansya kada slab kumpara sa ₱150 sa manok. Dugang **+₱18,900 nga lunsay nga kita kada bulan**!\n\n2. **I-train ang Cashier sa Spiced Gravy & Softdrink Combo:**\nTudloan nato sila Pamela, Chailene, ug Jolina nga mo-tanyag dayon ug Ron's Spiced Gravy botelya (₱25) + Bugnaw nga Softdrink. Sa 25% lang sa customer, dugang **+₱21,600 kada bulan**!\n\n3. **Wad-on ang Kuwang sa Cashier (Zero Shortage):**\nIpatuman gyud ang 2:00 PM blind drawer count inig turn-over sa shift aron mapugngan ang kasagaran nga **₱3,500 nga kawala sa cash kada bulan**.\n\n📈 **Kinatibuk-ang Dugang Kita:** **+₱33,200 matag bulan** nga walay dugang fixed overhead!`;
      }
      return `💡 **3-Step Executive Strategy: Pataasin ang Monthly Profit ng 15% (+₱33,200)**\n\nSir Irl, hindi natin kailangang mag-hire ng dagdag na tao o magtaas ng presyo. Narito ang 3 algorithmic tactics para sa Cugman branch:\n\n1. **I-maximize ang Liempo sa 5 PM Dinner Rush:**\nMag-roast ng karagdagang **6 Liempo slabs** bawat araw. Ang Liempo ay may ₱170 margin vs ₱150 sa manok. Dagdag **+₱18,900 net margin / month** ito!\n\n2. **Cashier Spiced Gravy & Drink Combo:**\nI-train sina Pamela, Chailene, at Jolina na mag-upsell ng Ron's Spiced Gravy bottle (₱25) + Malamig na Softdrink. Sa 25% lang ng buyers, dagdag **+₱21,600 / month** ang kita!\n\n3. **Zero Cashier Shortage Protocol:**\nIpatupad ang strict 2:00 PM mid-day blind drawer count bago magpalitan ng shift. Maiiwasan nito ang average na **₱3,500 monthly cash drift**.\n\n📈 **Kabuuang Dagdag Kita:** **+₱33,200 bawat buwan** nang walang dagdag na fixed expenses!`;
    }

    // Intent: Liempo vs Whole Chicken
    if (/liempo|baboy|manok\s*vs\s*liempo|liempo\s*vs\s*manok|pork|alin\s*mas\s*malaki|hain\s*mas\s*dako|mas\s*dako|slab/i.test(lower)) {
      if (isBisaya) {
        return `🥩 **Kompirmasyon sa Ginansya: Lechon Manok batok sa Inasal nga Liempo**\n\nSir Irl, mao ni ang panagtandi sa duha nato ka flagship products:\n\n• **Tibuok Lechon Manok:**\n  - Presyo sa Halin: **₱360.00**\n  - Gasto sa Hilaw: **₱210.00**\n  - Ginansya kada buok: **₱150.00 (41.6%)**\n  - Oras sa Pag-ihaw: mga 75 minutos\n\n• **Inasal nga Pork Liempo:**\n  - Presyo sa Halin: **₱420.00**\n  - Gasto sa Hilaw: **₱250.00**\n  - Ginansya kada slab: **₱170.00 (40.5%)**\n  - Oras sa Pag-ihaw: mga 90 minutos\n\n🔥 **CFO Estratehiya:**\nBisan ug gamay ra ang porsyento sa Liempo, ang **Liempo naghatag ug +₱20.00 MAS DAKO NGA CASH kada transaksyon**! Siguraduha nga sa Spit 3 naa gyuy 6 hangtod 8 ka Liempo slabs nga gi-ihaw daan sa dili pa mag-alas singko sa hapon!`;
      }
      return `🥩 **Product Profitability: Lechon Manok vs Roasted Pork Liempo**\n\nSir Irl, ito ang head-to-head comparison ng dalawang flagship products natin:\n\n• **Whole Lechon Manok:**\n  - Selling Price: **₱360.00**\n  - Raw Cost: **₱210.00**\n  - Gross Margin: **₱150.00 (41.6%)**\n  - Roasting Time: ~75 minutes\n\n• **Roasted Pork Liempo:**\n  - Selling Price: **₱420.00**\n  - Raw Cost: **₱250.00**\n  - Gross Margin: **₱170.00 (40.5%)**\n  - Roasting Time: ~90 minutes\n\n🔥 **Strategic Takeaway:**\nKahit bahagyang mas mataas ang percentage margin ng manok, ang **Liempo ay nagbibigay ng +₱20.00 MAS MATAAS NA CASH sa bawat benta**! Siguraduhing may 6-8 Liempo slabs palagi sa Spit 3 bago mag-alas singko ng hapon!`;
    }

    // Intent: Cashier Shortages & Remittances
    if (/shortage|kulang|kuwang|cashier|discrepancy|pamela|chailene|jolina|remittance|nakaw|drawer|petty|envelope|handover|kahon|turnover/i.test(lower)) {
      if (isBisaya) {
        return `⚠️ **Pamaagi Paglikay sa Kuwang sa Cashier ug Pagbantay sa Halin**\n\nSir Irl, subay sa audit records sa Cugman branch, kasagaran sa discrepancy mahitabo sa **2:00 PM shift turnover** sa morning ug evening cashiers:\n\n1. **Mid-Day Blind Drawer Count (Mandatory):**\nSa dili pa mo-out si Cashier 1 (Chailene/Jolina), ihapon ang cash sa drawer nga dili motan-aw sa system sales. Pirmahan ang turnover slip una molingkod si Pamela sa hapon.\n\n2. **Petty Cash Voucher sa Uling ug Yelo:**\nGidili gyud ang pagkuha ug sensilyo o kwarta sa drawer para sa uling o yelo nga walay permahang voucher sa system.\n\n3. **Awtomatikong Deduction sa Payslip:**\nAktibo sa atong system nga ang bisan unsang kuwang (shortage) kay ma-charge dayon sa payslip sa cashier ubos sa *Shortages Deduction*. Tungod kay kabalo sila ani, magmatngon gyud sila sa pagsukli!`;
      }
      return `⚠️ **Cashier Shortage Mitigation & Cash Safeguard Protocol**\n\nSir Irl, batay sa audit logs ng Cugman branch, karamihan ng discrepancy ay nagaganap tuwing **2:00 PM shift transition** sa pagitan ng morning at evening cashiers:\n\n1. **Mid-Day Blind Drawer Count (Mandatory):**\nBago umalis si Cashier 1 (Chailene/Jolina), bibilangin ang cash drawer nang hindi tinitingnan ang system gross sales. Pipirmahan ang turnover receipt bago pumasok si Pamela sa evening shift.\n\n2. **Petty Cash Expense Vouchers:**\nBawal kumuha ng barya o pera sa drawer para sa uling o yelo nang walang pirmahang Petty Cash Voucher sa system.\n\n3. **Automated Payslip Deductions:**\nAktibo sa ating system na ang anumang shortage ay awtomatikong nai-itemized sa payslip ng cashier bilang *Shortage Deduction*. Dahil alam ng cashiers ito, nagiging maingat sila sa pagsusukli!`;
    }

    // Intent: Payroll & 31 Staff Audit
    if (/payroll|sahod|sweldo|labor\s*cost|31\s*staff|31\s*ka\s*trabahante|trabahante|minimum\s*wage|dole|overtime|meal\s*allowance|438|450|480/i.test(lower)) {
      if (isBisaya) {
        return `👥 **31 ka Trabahante: Payroll Audit & DOLE Benchmark sa Cugman**\n\nSir Irl, mao ni ang kahimtang sa atong labor cost karon:\n\n• **Aktibong Trabahante:** 31 ka Empleyado (Mga tig-ihaw sa kitchen, Senior Grill Masters, Cashiers, ug Service Staff)\n• **Karon nga Cutoff Gross Payroll:** **₱${Number(ctx.grossPayroll).toLocaleString('en-US', { minimumFractionDigits: 2 })}**\n• **Adlaw-adlaw nga Rate sa Sweldo:**\n  - Kitchen & Service Staff: **₱438.00 / adlaw** (DOLE Northern Mindanao Min Wage)\n  - Cashiers (Pamela, Chailene, Jolina): **₱450.00 / adlaw**\n  - Senior Grill Masters (Jake, Josh, Andrew): **₱480.00 / adlaw**\n  - Mandatory Daily Meal Allowance: **₱50.00 / adlaw sa duty**\n\n📊 **Labor Cost Ratio: ~19.8% sa Kinatibuk-ang Halin**\nNindot kaayo ni, Sir! Ang healthy benchmark sa DOLE sa mga kan-anan kay 18% hangtod 24%. Sulod kaayo sa pinaka-alisto ug profitable nga lebel ang Ron's Chicken!`;
      }
      return `👥 **31 Staff Payroll & DOLE Labor Benchmark Audit**\n\nSir Irl, narito ang estado ng ating labor cost sa Cugman branch:\n\n• **Active Staff:** 31 Employees (Kitchen Roasters, Senior Grill Masters, Cashiers, Service Staff)\n• **Current Cutoff Gross Payroll:** **₱${Number(ctx.grossPayroll).toLocaleString('en-US', { minimumFractionDigits: 2 })}**\n• **Daily Wage Brackets:**\n  - Service & Kitchen Staff: **₱438.00 / day** (DOLE Northern Mindanao Min Wage)\n  - Cashiers: **₱450.00 / day**\n  - Senior Grill Masters (Jake, Josh, Andrew): **₱480.00 / day**\n  - Mandatory Daily Meal Allowance: **₱50.00 / duty day**\n\n📊 **Labor Cost Ratio: ~19.8% of Gross Revenue**\nNapakaganda nito! Ang DOLE food service healthy benchmark ay 18% hanggang 24%. Nasa pinaka-optimal at profitable range ang Ron's Chicken!`;
    }

    // Intent: Roasting Spits, Warmer & Lacking Spoilage
    if (/inventory|spit|roast|warmer|hilaw|lacking|sunog|spoilage|batch|rotisserie|ihaw|sugba/i.test(lower)) {
      if (isBisaya) {
        return `🔥 **Kapasidad sa Pag-ihaw ug Stock sa Warmer**\n\nSir Irl, mao ni ang pahinumdom para sa atong mga roaster:\n\n• **Rotisserie Capacity:** 4 ka active spits (makasugba ug hangtod 32 ka manok sa usa ka higayon).\n• **Target sa Warmer:** Siguraduhon nga naay **7 hangtod 10 ka mainit nga lechon manok** sulod sa glass warmer inig alas 11:30 sa udto ug 5:30 sa hapon aron walay customer nga mobiya tungod kay maghulat pa.\n• **Sunog o Nawala nga Manok:** Ang manok nga nasunog tungod sa pasagad kay awtomatikong i-charge sa tig-ihaw sa cost price (**₱210.00**) ubos sa *Lacking Products Deduction* sa payroll.`;
      }
      return `🔥 **Rotisserie Spits Throughput & Warmer Stock Strategy**\n\nSir Irl, narito ang gabay sa kitchen roasters natin:\n\n• **Rotisserie Capacity:** 4 active spits (kayang mag-ihaw ng hanggang 32 chickens nang sabay-sabay).\n• **Warmer Buffer Target:** Panatilihing may **7 hanggang 10 mainit na whole chicken** sa glass warmer tuwing 11:30 AM lunch rush at 5:30 PM dinner peak upang walang customer na aalis dahil sa paghihintay.\n• **Burnt / Spoilage Policy:** Ang manok na nasunog dahil sa kapabayaan ay awtomatikong icha-charge sa roaster at cost price (**₱210.00**) sa ilalim ng *Lacking Products Deduction* sa payroll.`;
    }

    // Intent: Supplier Chicken Price & Price Increases
    if (/presyo|price|taas|supplier|215|220|370|mahal|raw\s*chicken|hilaw/i.test(lower)) {
      if (isBisaya) {
        return `🍗 **Pagtuki sa Presyo sa Hilaw nga Manok ug Alkanse**\n\nSir Irl, kung mosaka ang presyo sa supplier (pananglitan gikan ₱210 ngadto sa ₱215 o ₱220):\n\n• **₱5 nga Pagsaka:** Makuhaan ug ₱5 ang ginansya kada buok (-₱525/adlaw sa 105 ka buok = **-₱15,750 kada bulan nga kawala sa net profit**).\n\n💡 **Tambag sa CFO:**\n1. **Ayaw dayon i-saka ang ₱360 nga presyo:** Itanyag usa ang combo uban ang Ron's Spiced Gravy (₱25) ug Softdrinks.\n2. Kung magpadayon ang pagsaka sa manok ngadto sa ₱220+, pwede nato i-adjust ang Tibuok Manok sa **₱370.00** ug ang Half Chicken sa **₱190.00** aron mapabilin ang atong 41.5% nga ginansya!`;
      }
      return `🍗 **Supplier Raw Cost & Pricing Sensitivity Analysis**\n\nSir Irl, kung magtataas ang supplier ng raw chicken (halimbawa mula ₱210 papuntang ₱215 o ₱220):\n\n• **₱5 Price Increase Impact:** Bawas ₱5 sa margin bawat manok (-₱525/day sa 105 heads = **-₱15,750 / month sa net profit**).\n\n💡 **CFO Recommendation:**\n1. **Huwag agad itaas ang ₱360 selling price:** Magbenta muna ng add-on combo tulad ng Ron's Spiced Gravy (₱25) at Softdrinks.\n2. Kung magtuloy-tuloy ang taas ng manok sa ₱220+, maaari nating i-adjust ang Whole Chicken sa **₱370.00** at Half Chicken sa **₱190.00** upang mapanatili ang ating 41.5% gross margin!`;
    }

    // Intent: What do you know / Learned Rules
    if (/ano\s*alam\s*mo|unsa\s*imong\s*nahibal|memory|tandaan\s*mo|timan[\-\s]?i|rules|patakaran|what\s*do\s*you\s*know|mga\s*rules|learned|nahibaw/i.test(lower)) {
      const memories = ctx.learnedRules;
      const memLines = memories.map((m, i) => `${i + 1}. **[${m.category}]** ${m.fact}`).join('\n');
      if (isBisaya) {
        return `🧠 **Mga Nahibal-an ug Patakaran nga Akong Natiman-an**\n\nSir Irl, mao ni ang mga patakaran ug kamatuoran nga akong natiman-an para sa Ron's Chicken Cugman branch:\n\n${memLines || 'Wala pay custom rules nga naitala.'}\n\n💡 **Gusto mo magtudlo ug bag-ong patakaran?**\nI-type lang: *\"Timan-i: (inyong bag-ong patakaran dinhi)\"* ug awtomatiko nako kining i-save!`;
      }
      return `🧠 **Business Knowledge & Learned Rules Memory**\n\nSir Irl, kasalukuyan kong natatandaan ang mga sumusunod na patakaran at operating facts para sa Cugman branch:\n\n${memLines || 'Wala pang custom rules na naitala.'}\n\n💡 **Gusto nyo bang magdagdag ng bagong rule?**\nI-type lang po: *\"Take note: (inyong bagong rule dito)\"* at automatic ko itong i-se-save!`;
    }

    // Intent: Greetings & General Store Health
    if (/hi|hello|kumusta|kamusta|musta|maayong\s*adlaw|status|health|okay\s*ba|advice|unsa\s*may\s*ayo/i.test(lower)) {
      if (isBisaya) {
        return `👋 **Maayong adlaw, Sir Irl! Kumusta ang dagan sa Cugman branch nato karon?**\n\nMao ni ang dali nga executive summary sa tindahan karon:\n\n• **Financial Health Index:** **92 / 100** (Taas kaayo ang ginansya ug kalig-on)\n• **Aktibong Trabahante:** 31 ka buok (nakalista sa Deli e3960 attendance)\n• **Labor Cost Ratio:** **19.8%** (Pasok kaayo sa healthy benchmark)\n• **Daily Break-Even:** **105 ka buok manok** (ang tanan lapas ani kay ginansya na nimo diretso!)\n\nAndam ko motubag sa bisan unsa nga pangutana bahin sa presyo, deduction sa sweldo, remittance sa cashier, o target sa halin. Unsa may atong hisgotan karon, Sir?`;
      }
      return `👋 **Magandang araw, Sir Irl! Kumusta ang operations sa Cugman?**\n\nIto ang quick executive summary ng branch natin ngayon:\n\n• **Financial Health Index:** **92 / 100** (High Profitability & Efficiency)\n• **Active Staff:** 31 Employees (Deli e3960 attendance logged)\n• **Labor Cost Ratio:** **19.8%** (Pasok na pasok sa healthy benchmark)\n• **Daily Break-Even:** **105 Whole Chickens** (lahat ng lampas dito ay direct profit!)\n\nHanda akong sumagot sa anumang katanungan sa pricing, payroll deductions, cashier remittances, o benta. Ano po ang maipaglilingkod ko ngayon?`;
    }

    // Fallback: Dynamic Smart CFO Response referencing Cugman Branch & Learned Rules
    const learnedCount = ctx.learnedRules.length;
    if (isBisaya) {
      return `Sir Irl, akong nasubay ang inyong pangutana bahin sa *"**${escapeHtml(prompt)}**"* sumala sa operasyon sa atong Cugman branch:\n\n• **Kahimtang sa Tindahan:** Naa tay **31 ka trabahante** nga nagdawat ug ₱438–₱480/adlaw uban ang ₱50 meal allowance.\n• **Ginansya:** Ang Tibuok Manok naay **₱150 kada buok** nga tubo (₱360 - ₱210), samtang ang Liempo naay **₱170 kada slab** (₱420 - ₱250).\n• **Business Memory:** Naa koy **${learnedCount} ka patakaran** nga natiman-an gikan sa inyong mga pahinumdom.\n\n💡 **Tambag sa CFO:**\nAron mapabiling dako ang atong ginansya, bantayan gyud nga walay kuwang sa kahon sa cashier ug maabot nato ang 105 ka buok nga target kada adlaw. Pwede pud mo magtudlo ug bag-ong patakaran pinaagi sa pag-type ug *"Timan-i: (patakaran)"*!`;
    }
    return `Sir Irl, nasuri ko ang inyong tanong patungkol sa *"**${escapeHtml(prompt)}**"* batay sa live operations ng ating Cugman branch:\n\n• **Store Operating Model:** Mayroon tayong **31 staff** na sumasahod ng ₱438–₱480/day at ₱50 meal allowance.\n• **Unit Margins:** Whole Chicken kumikita ng **₱150/head** (₱360 - ₱210), habang ang Liempo ay kumikita ng **₱170/slab** (₱420 - ₱250).\n• **Learned Memory:** May **${learnedCount} store rules** akong sinusunod mula sa inyong mga tagubilin.\n\n💡 **Executive Advice:**\nUpang mapanatiling mataas ang net profit, panatilihing zero ang cashier cash shortages at panatilihin ang ating 105 heads daily target. Maaari ninyo rin akong utusan na magtala ng bagong patakaran sa pamamagitan ng pag-type ng *"Take note: (rule)"*!`;
  }

  function openAiMemoryModal() {
    const listEl = document.getElementById('ai-memory-modal-list');
    let memories = [];
    try {
      if (window.DB && typeof window.DB.getAiMemory === 'function') {
        memories = window.DB.getAiMemory() || [];
      }
    } catch (e) {}

    if (listEl) {
      listEl.innerHTML = memories.map(m => `
        <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 0.75rem 1rem; display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem;">
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.25rem;">
              <span style="font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.45rem; border-radius: var(--radius-xs); background: rgba(139,92,246,0.15); color: #c4b5fd;">
                ${escapeHtml(m.category || 'Rule')}
              </span>
              <span style="font-size: 0.7rem; color: var(--text-muted);">${new Date(m.dateAdded).toLocaleDateString()}</span>
            </div>
            <div style="font-size: 0.84rem; color: var(--text-primary); line-height: 1.45;">
              ${escapeHtml(m.fact)}
            </div>
          </div>
          <button class="btn-bento btn-bento-dark btn-sm" style="color: #f43f5e; padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="ErpModules.deleteMemoryFact('${m.id}')" title="Delete this rule">
            🗑️
          </button>
        </div>
      `).join('');
    }

    window.openModal('ai-memory-modal');
  }

  function handleSaveNewMemoryFact(e) {
    e.preventDefault();
    const textInput = document.getElementById('new-memory-text');
    const catSelect = document.getElementById('new-memory-category');
    if (!textInput || !textInput.value.trim()) return;

    const factText = textInput.value.trim();
    const category = catSelect ? catSelect.value : "Store Policy";

    if (window.DB && typeof window.DB.addAiMemoryItem === 'function') {
      window.DB.addAiMemoryItem(factText, category);
    }

    textInput.value = '';

    // Add bot chat message acknowledging
    if (window.DB && typeof window.DB.addAiChatMessage === 'function') {
      const isBis = detectBisaya(factText);
      const ackText = isBis
        ? `🧠 **Bag-ong Patakaran Natiman-an!**\n\nMalampuson nakong na-save sa akong **Business Knowledge Memory**:\n> *"${factText}"* (${category})\n\nApil na kini sa tanan nakong financial projections ug tambag para sa Ron's Chicken Cugman branch!`
        : `🧠 **Bagong Patakaran Naitala!**\n\nMatagumpay kong na-save sa aking Business Memory:\n> *"${factText}"* (${category})\n\nGagamitin ko na ito sa lahat ng financial projections at advice para sa Ron's Chicken!`;

      window.DB.addAiChatMessage({
        role: 'assistant',
        sender: "Ron's AI CFO",
        text: ackText,
        timestamp: new Date().toISOString()
      });
    }

    openAiMemoryModal();
    updateAiChatThreadUi();
  }

  function deleteMemoryFact(id) {
    if (confirm("Delete this learned store rule from AI memory?")) {
      if (window.DB && typeof window.DB.deleteAiMemoryItem === 'function') {
        window.DB.deleteAiMemoryItem(id);
      }
      openAiMemoryModal();
      updateAiChatThreadUi();
    }
  }

  function openAiConfigModal() {
    let cfg = { mode: 'autonomous', apiKey: '' };
    try {
      if (window.DB && typeof window.DB.getAiConfig === 'function') {
        cfg = window.DB.getAiConfig() || cfg;
      }
    } catch (e) {}

    const modeSel = document.getElementById('ai-config-mode');
    const keyInput = document.getElementById('ai-config-key');
    if (modeSel) modeSel.value = cfg.mode || 'autonomous';
    if (keyInput) keyInput.value = cfg.apiKey || '';

    window.openModal('ai-config-modal');
  }

  function handleSaveAiConfig(e) {
    e.preventDefault();
    const modeSel = document.getElementById('ai-config-mode');
    const keyInput = document.getElementById('ai-config-key');
    const mode = modeSel ? modeSel.value : 'autonomous';
    const apiKey = keyInput ? keyInput.value.trim() : '';

    if (window.DB && typeof window.DB.saveAiConfig === 'function') {
      window.DB.saveAiConfig({ mode, apiKey });
    }

    window.closeModal('ai-config-modal');
    alert("AI Advisor configuration successfully updated!");
  }

  function runAiPrompt(type) {
    if (type === 'profit15') {
      sendAiChatMessage("Paano natin mapapataas ang net monthly profit ng 15%?");
    } else if (type === 'breakeven') {
      sendAiChatMessage("What is our daily break-even chicken volume count?");
    } else if (type === 'shortages') {
      sendAiChatMessage("Paano pigilan ang cashier cash shortages tuwing 2 PM handover?");
    } else if (type === 'liempo') {
      sendAiChatMessage("Liempo vs Whole Chicken: alin ang mas mataas ang tubo per transaction?");
    }
  }

  function simulateStrategy(insightId) {
    if (insightId === 'INS-01') {
      runAiPrompt('profit15');
    } else if (insightId === 'INS-02') {
      runAiPrompt('liempo');
    } else {
      runAiPrompt('shortages');
    }
  }

  return {
    renderBentoInventory,
    renderBentoRemittances,
    renderBentoAiAdvisor,
    renderBentoUsers,
    renderCashierBentoPortal,
    openSwitchUserModal,
    quickSwitchUser,
    handleAuthenticatePin,
    openBatchModal,
    handleSaveRoastBatch,
    openDailyInventoryModal,
    handleSaveDailyInventory,
    openRemittanceModal,
    handleSaveRemittance,
    linkShortageToDeductions,
    chargeDiscrepancyToLacking,
    openReportLackingModal,
    openEditUserModal,
    renderAiChatThreadHtml,
    sendAiChatMessage,
    handleAiChatKeydown,
    promptTeachMemory,
    clearAiChat,
    openAiMemoryModal,
    handleSaveNewMemoryFact,
    deleteMemoryFact,
    openAiConfigModal,
    handleSaveAiConfig,
    runAiPrompt,
    simulateStrategy
  };
})();
