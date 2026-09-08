/**
 * Ron's Chicken Philippine Payroll Engine
 * DOLE & BIR Compliant calculation for Cagayan de Oro branch operations
 */

class PayrollEngine {
  /**
   * Calculate Philippine SSS Employee Contribution (2024-2026 DOLE/SSS Table)
   * @param {number} monthlySalary 
   * @returns {number} Semi-monthly EE contribution
   */
  static computeSSS(monthlySalary) {
    if (monthlySalary <= 4250) return 180 / 2;
    if (monthlySalary >= 29750) return 1350 / 2;
    // Step by 500 MSC brackets
    const msc = Math.min(30000, Math.max(4000, Math.round(monthlySalary / 500) * 500));
    const eeContribution = msc * 0.045; // 4.5% EE share
    return parseFloat((eeContribution / 2).toFixed(2));
  }

  /**
   * Calculate PhilHealth Employee Contribution (5% Total, 2.5% EE share)
   * @param {number} monthlySalary 
   * @returns {number} Semi-monthly EE contribution
   */
  static computePhilHealth(monthlySalary) {
    const minSalary = 10000;
    const maxSalary = 100000;
    const cappedSalary = Math.min(maxSalary, Math.max(minSalary, monthlySalary));
    const totalPremium = cappedSalary * 0.05;
    const eeShare = totalPremium / 2;
    return parseFloat((eeShare / 2).toFixed(2));
  }

  /**
   * Calculate Pag-IBIG (HDMF) Contribution
   * @returns {number} Semi-monthly EE contribution
   */
  static computePagIbig() {
    return 100.00; // Standard ₱100 per cutoff (₱200/month)
  }

  /**
   * Calculate BIR Withholding Tax (TRAIN Law Semi-Monthly Table)
   * Minimum wage earners & salaries <= ₱10,417 per cutoff are 100% EXEMPT.
   */
  static computeWithholdingTax(taxableIncome, isMinimumWage = true) {
    if (isMinimumWage || taxableIncome <= 10417) {
      return 0.00;
    }
    if (taxableIncome <= 16666) {
      return parseFloat(((taxableIncome - 10417) * 0.15).toFixed(2));
    }
    if (taxableIncome <= 33332) {
      return parseFloat((937.50 + (taxableIncome - 16667) * 0.20).toFixed(2));
    }
    return parseFloat((4270.70 + (taxableIncome - 33333) * 0.25).toFixed(2));
  }

  /**
   * Run full payroll calculation for an employee for a cutoff period
   * @param {Object} employee 
   * @param {Object} timecard 
   * @param {Object} options Options like custom deductions, cash advances, incentives
   * @returns {Object} Complete payroll breakdown
   */
  static computeEmployeePayroll(employee, timecard, options = {}) {
    const dailyRate = employee.dailyRate || 438.00;
    const hourlyRate = dailyRate / 8.00;
    const minuteRate = hourlyRate / 60.00;

    // Timecard figures
    const daysPresent = timecard.daysPresent || 0;
    const regularHours = timecard.totalRegularHours || 0;
    const otHours = timecard.totalOtHours || 0;
    const nightDiffHours = timecard.totalNightDiffHours || 0;
    const lateMinutes = timecard.totalLateMinutes || 0;

    // Basic Pay
    // If hourly calculation:
    const basicPay = parseFloat((regularHours * hourlyRate).toFixed(2));

    // Overtime Pay (125% DOLE standard)
    const otRate = hourlyRate * 1.25;
    const otPay = parseFloat((otHours * otRate).toFixed(2));

    // Night Shift Differential Pay (10% additional)
    const nightDiffRate = hourlyRate * 0.10;
    const nightDiffPay = parseFloat((nightDiffHours * nightDiffRate).toFixed(2));

    // Allowances & Incentives
    const dailyAllowance = employee.allowance || 50.00; // Meal/food allowance
    const totalAllowance = parseFloat((daysPresent * dailyAllowance).toFixed(2));
    const incentivePay = parseFloat((options.incentives || 0).toFixed(2));

    // Gross Pay
    const grossPay = parseFloat((basicPay + otPay + nightDiffPay + totalAllowance + incentivePay).toFixed(2));

    // Deductions
    const lateDeduction = parseFloat((lateMinutes * minuteRate).toFixed(2));
    const monthlySalaryEstimated = dailyRate * 26;

    // Statutory contributions
    let sssEE = 0;
    if (!employee.sssExempt && !options.exemptStatutory) {
      sssEE = (employee.customSssAmount !== undefined && employee.customSssAmount !== null && employee.customSssAmount !== '')
        ? parseFloat(Number(employee.customSssAmount).toFixed(2))
        : this.computeSSS(monthlySalaryEstimated);
    }

    let philHealthEE = 0;
    if (!employee.philHealthExempt && !options.exemptStatutory) {
      philHealthEE = (employee.customPhilHealthAmount !== undefined && employee.customPhilHealthAmount !== null && employee.customPhilHealthAmount !== '')
        ? parseFloat(Number(employee.customPhilHealthAmount).toFixed(2))
        : this.computePhilHealth(monthlySalaryEstimated);
    }

    let pagIbigEE = 0;
    if (!employee.pagIbigExempt && !options.exemptStatutory) {
      pagIbigEE = (employee.customPagIbigAmount !== undefined && employee.customPagIbigAmount !== null && employee.customPagIbigAmount !== '')
        ? parseFloat(Number(employee.customPagIbigAmount).toFixed(2))
        : this.computePagIbig();
    }

    // Cash Advance (Vale)
    const cashAdvanceDeduction = parseFloat((options.cashAdvanceDeduction || 0).toFixed(2));
    const otherDeductions = parseFloat((options.otherDeductions || 0).toFixed(2));

    // Total Deductions
    const totalDeductions = parseFloat((
      lateDeduction + sssEE + philHealthEE + pagIbigEE + cashAdvanceDeduction + otherDeductions
    ).toFixed(2));

    // Net Pay
    const netPay = Math.max(0, parseFloat((grossPay - totalDeductions).toFixed(2)));

    // 13th Month Pay Accrual (1/12th of basic pay)
    const thirtenthMonthAccrual = parseFloat((basicPay / 12).toFixed(2));

    return {
      employeeId: employee.id,
      employeeName: employee.name,
      department: employee.department,
      position: employee.position,
      dailyRate,
      hourlyRate: parseFloat(hourlyRate.toFixed(2)),
      daysPresent,
      regularHours,
      otHours,
      nightDiffHours,
      lateMinutes,
      
      // Earnings Breakdown
      earnings: {
        basicPay,
        otPay,
        nightDiffPay,
        allowances: totalAllowance,
        incentives: incentivePay,
        grossPay
      },

      // Deductions Breakdown
      deductions: {
        late: lateDeduction,
        sss: sssEE,
        philHealth: philHealthEE,
        pagIbig: pagIbigEE,
        cashAdvance: cashAdvanceDeduction,
        other: otherDeductions,
        totalDeductions
      },

      // Net Pay & Accrual
      netPay,
      thirtenthMonthAccrual,
      calculatedAt: new Date().toISOString()
    };
  }

  /**
   * Run entire branch payroll calculation for all employees
   */
  static runBranchPayroll(cutoff, options = {}) {
    const employees = window.DB ? window.DB.getEmployees() : [];
    const advances = window.DB ? window.DB.getAdvances() : [];
    const shifts = window.DB ? window.DB.getShifts() : [];

    const payrollResults = [];
    let branchTotalGross = 0;
    let branchTotalDeductions = 0;
    let branchTotalNet = 0;
    let branchTotalOT = 0;
    let branchTotalNightDiff = 0;

    employees.forEach(emp => {
      // Calculate timecard
      const timecard = window.BiometricParser.calculateTimecard(
        emp,
        cutoff.startDate,
        cutoff.endDate,
        shifts
      );

      // Find active advances for employee
      const empAdvances = advances.filter(a => a.employeeId === emp.id && a.status === "Active");
      const advanceToDeduct = empAdvances.reduce((sum, a) => {
        const remaining = Math.max(0, (a.amount || 0) - (a.deducted || 0));
        const perCutoff = a.deductionPerCutoff ? Math.min(a.deductionPerCutoff, remaining) : remaining;
        return sum + perCutoff;
      }, 0);

      // Run calculation
      const payroll = this.computeEmployeePayroll(emp, timecard, {
        cashAdvanceDeduction: advanceToDeduct,
        incentives: (emp.position && emp.position.includes("Grill")) ? 200 : 0 // Grill master bonus
      });

      payrollResults.push({
        ...payroll,
        timecardSummary: {
          daysPresent: timecard.daysPresent,
          totalRegularHours: timecard.totalRegularHours,
          totalOtHours: timecard.totalOtHours,
          totalNightDiffHours: timecard.totalNightDiffHours,
          totalLateMinutes: timecard.totalLateMinutes
        }
      });

      branchTotalGross += payroll.earnings.grossPay;
      branchTotalDeductions += payroll.deductions.totalDeductions;
      branchTotalNet += payroll.netPay;
      branchTotalOT += payroll.earnings.otPay;
      branchTotalNightDiff += payroll.earnings.nightDiffPay;
    });

    const summary = {
      cutoffId: cutoff.id || `CO-${Date.now()}`,
      cutoffName: cutoff.name || `${cutoff.startDate} ~ ${cutoff.endDate}`,
      startDate: cutoff.startDate,
      endDate: cutoff.endDate,
      generatedAt: new Date().toLocaleString(),
      employeeCount: payrollResults.length,
      totals: {
        gross: parseFloat(branchTotalGross.toFixed(2)),
        deductions: parseFloat(branchTotalDeductions.toFixed(2)),
        net: parseFloat(branchTotalNet.toFixed(2)),
        overtime: parseFloat(branchTotalOT.toFixed(2)),
        nightDiff: parseFloat(branchTotalNightDiff.toFixed(2))
      },
      records: payrollResults
    };

    // Save to payroll history in DB
    if (window.DB) {
      window.DB.addPayrollRecord(summary);
    }

    return summary;
  }
}

window.PayrollEngine = PayrollEngine;
