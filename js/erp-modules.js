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
    const aiData = window.DB.getAiAdvisory();
    const insights = aiData.insights || [];
    const payroll = window.cachedPayrollSummary || (window.PayrollEngine ? window.PayrollEngine.runBranchPayroll(window.activeCutoff) : { totals: { gross: 112000, net: 98000 } });
    const remittances = window.DB.getRemittances();
    const estRevenue = remittances.reduce((s, r) => s + (Number(r.grossSales) || 0), 0) || 165000;
    const laborCost = payroll.totals.gross || 112450;
    const laborCostPct = ((laborCost / (estRevenue * 3)) * 100).toFixed(1); // normalized to semi-monthly revenue
    const estCOGS = (estRevenue * 0.515).toFixed(2);
    const estProfit = ((estRevenue * 3) - laborCost - (estRevenue * 3 * 0.515)).toFixed(2);

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

      <!-- Interactive "Ask Ron's AI Advisor" Terminal -->
      <div class="data-panel-card">
        <h3 style="color: var(--text-primary); font-size: 1.15rem; margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.5rem;">
          💬 Interactive Financial Advisor Consultation
        </h3>
        <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1rem;">
          Click any preset scenario or ask a question to calculate instant profit &amp; break-even impacts:
        </p>

        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
          <button class="btn-bento btn-bento-dark btn-sm" onclick="ErpModules.runAiPrompt('profit15')">
            💡 How do we boost net monthly profit by 15%?
          </button>
          <button class="btn-bento btn-bento-dark btn-sm" onclick="ErpModules.runAiPrompt('breakeven')">
            🍗 What is our break-even chicken count per day?
          </button>
          <button class="btn-bento btn-bento-dark btn-sm" onclick="ErpModules.runAiPrompt('shortages')">
            ⚠️ How to prevent evening cashier shortages?
          </button>
          <button class="btn-bento btn-bento-dark btn-sm" onclick="ErpModules.runAiPrompt('liempo')">
            🥩 Analyze Liempo vs Whole Chicken profitability
          </button>
        </div>

        <div id="ai-advisor-response-box" style="background: var(--bg-surface); border: 1px solid rgba(139,92,246,0.3); border-radius: var(--radius-sm); padding: 1.25rem; display: none;">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.65rem;">
            <span style="font-size: 1.2rem;">🤖</span>
            <strong style="color: #c4b5fd; font-size: 0.95rem;" id="ai-response-title">AI Financial Analysis</strong>
          </div>
          <div style="color: var(--text-primary); font-size: 0.86rem; line-height: 1.6;" id="ai-response-content">
          </div>
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

  function runAiPrompt(type) {
    const box = document.getElementById('ai-advisor-response-box');
    const title = document.getElementById('ai-response-title');
    const content = document.getElementById('ai-response-content');
    if (!box || !title || !content) return;

    box.style.display = 'block';

    if (type === 'profit15') {
      title.textContent = "Strategic Plan: Boost Monthly Net Profit by 15% (+₱28,500)";
      content.innerHTML = `
        <p>To generate an additional 15% net profit at Cugman branch without hiring more staff or increasing prices:</p>
        <ol style="margin-left: 1.25rem; margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.4rem;">
          <li><strong>Roast 6 more Liempo slabs daily:</strong> Liempo yields 40.5% margin vs 38.2% on chicken. Adding 6 slabs at peak dinner hours captures ₱2,520/day extra revenue (+₱18,900 net margin/month).</li>
          <li><strong>Train Cashiers on 'Sauce & Drink' combo:</strong> Upselling 1 bottle of Ron's spiced gravy (₱25) + 1 drink to 25% of chicken buyers yields ₱720 daily profit (+₱21,600/month).</li>
          <li><strong>Enforce Shortage Reconciliation:</strong> Continuing to link cashier shortages to cutoff deductions prevents an average ₱3,500 monthly cash drift.</li>
        </ol>
        <div style="margin-top: 0.75rem; color: #10b981; font-weight: 700;">Projected Net Gain: +₱33,200 / month ($0 additional fixed overhead).</div>
      `;
    } else if (type === 'breakeven') {
      title.textContent = "Break-Even Calculation: Cugman Daily Operating Target";
      content.innerHTML = `
        <p><strong>Fixed Daily Branch Costs:</strong></p>
        <ul style="margin-left: 1.25rem; margin-top: 0.35rem; display: flex; flex-direction: column; gap: 0.25rem;">
          <li>Staff Wages (31 employees, ~₱450 avg daily rate split across shifts): <strong>₱13,950 / day</strong></li>
          <li>Estimated Utilities & Charcoal (electricity, mangrove charcoal, gas): <strong>₱1,850 / day</strong></li>
          <li>Total Daily Fixed Operating Overhead: <strong>₱15,800 / day</strong></li>
        </ul>
        <p style="margin-top: 0.65rem;"><strong>Gross Contribution Margin per Whole Chicken:</strong></p>
        <p>Selling Price: ₱360.00 — Raw Chicken Cost: ₱210.00 = <strong>₱150.00 Contribution Margin / Chicken</strong></p>
        <div style="margin-top: 0.75rem; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); padding: 0.75rem; border-radius: 8px;">
          <strong style="color: #10b981;">Daily Break-Even Volume: 105 Whole Chickens / day</strong> (or 85 Chickens + 15 Liempo slabs). Any chicken sold beyond 105 is pure operating profit!
        </div>
      `;
    } else if (type === 'shortages') {
      title.textContent = "Cashier Shortage Mitigation Protocol";
      content.innerHTML = `
        <p>Historical audit indicates 85% of cash discrepancies occur during the <strong>2:00 PM shift handover</strong> between Morning and Evening cashiers.</p>
        <ul style="margin-left: 1.25rem; margin-top: 0.35rem; display: flex; flex-direction: column; gap: 0.35rem;">
          <li><strong>Mandatory Mid-Day Blind Drawer Count:</strong> Cashier 1 (Chailene) must print or verify drawer cash before Cashier 2 (Pamela) signs into the terminal.</li>
          <li><strong>Petty Cash Voucher Requirement:</strong> Never permit unreceipted cash withdrawals for charcoal or ice. All expenses must have an immediate voucher.</li>
          <li><strong>Active Auto-Deduction Safeguard:</strong> Knowing shortages are itemized on payslips eliminates careless register handling.</li>
        </ul>
      `;
    } else if (type === 'liempo') {
      title.textContent = "Product Profitability Comparison: Whole Chicken vs Roasted Liempo";
      content.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 0.5rem;">
          <div style="background: rgba(255,85,0,0.1); border: 1px solid rgba(255,85,0,0.25); padding: 0.75rem; border-radius: 8px;">
            <strong style="color: var(--bento-orange);">Whole Lechon Manok</strong><br>
            • Selling Price: ₱360.00<br>
            • Raw Cost: ₱210.00<br>
            • Gross Margin: <strong>₱150.00 (41.6%)</strong><br>
            • Roasting Time: ~1 hr 15 mins
          </div>
          <div style="background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.25); padding: 0.75rem; border-radius: 8px;">
            <strong style="color: #c4b5fd;">Roasted Pork Liempo</strong><br>
            • Selling Price: ₱420.00<br>
            • Raw Cost: ₱250.00<br>
            • Gross Margin: <strong>₱170.00 (40.5%)</strong><br>
            • Absolute Profit: <strong>+₱20.00 higher per unit!</strong>
          </div>
        </div>
        <p style="margin-top: 0.75rem;"><strong>Strategic Takeaway:</strong> Liempo provides higher peso contribution per transaction. Ensure spit 3 always has 6-8 Liempo slabs on roast during 5 PM dinner peak.</p>
      `;
    }
  }

  function simulateStrategy(insightId) {
    runAiPrompt(insightId === 'INS-02' ? 'liempo' : (insightId === 'INS-01' ? 'profit15' : 'shortages'));
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
    runAiPrompt,
    simulateStrategy
  };
})();
