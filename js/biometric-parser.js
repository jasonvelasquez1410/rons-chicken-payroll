/**
 * Ron's Chicken Custom Biometric Parser Engine
 * Handles ZKTeco Excel matrix exports, raw CSV/TXT punch logs, and timecard processing
 */

class BiometricParser {
  static async ensureSheetJS() {
    if (typeof window !== 'undefined' && typeof window.XLSX !== 'undefined') return true;
    return new Promise((resolve, reject) => {
      // First attempt to load local bundle
      const localScript = document.createElement('script');
      localScript.src = 'js/xlsx.full.min.js?v=4.0.9-erp';
      localScript.onload = () => resolve(true);
      localScript.onerror = () => {
        // Fallback to CDN if local bundle fails
        const cdnScript = document.createElement('script');
        cdnScript.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
        cdnScript.onload = () => resolve(true);
        cdnScript.onerror = () => reject(new Error("Unable to download SheetJS parser library. Please check your internet connection."));
        document.head.appendChild(cdnScript);
      };
      document.head.appendChild(localScript);
    });
  }

  /**
   * Parse an Excel / CSV File or Buffer
   * @param {ArrayBuffer|File} fileData 
   * @returns {Promise<Object>} Parsed cutoff metadata and employee logs
   */
  static async parseFile(fileData) {
    if (typeof XLSX === 'undefined') {
      await this.ensureSheetJS();
    }

    const data = new Uint8Array(fileData);
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert sheet to array of rows
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
    return this.parseRows(rows, firstSheetName);
  }

  /**
   * Parse rows array from SheetJS
   * @param {Array<Array>} rows 
   * @param {string} sheetName 
   */
  static parseRows(rows, sheetName = "Attendance") {
    let cutoffRange = "Unknown Cutoff Period";
    let tablingDate = "";
    let startDate = "2026-08-16";
    let endDate = "2026-09-05";
    let employeesMap = new Map();

    // Look for attendance period in top rows
    for (let r = 0; r < Math.min(rows.length, 10); r++) {
      const rowStr = (rows[r] || []).join(" ");
      const matchPeriod = rowStr.match(/Attendance\s*date\s*:\s*([0-9\/\-~]+)/i);
      if (matchPeriod) {
        cutoffRange = matchPeriod[1].trim();
        const parts = cutoffRange.split("~");
        if (parts.length === 2) {
          const m1 = parts[0].trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
          if (m1) startDate = `${m1[3]}-${m1[1].padStart(2, '0')}-${m1[2].padStart(2, '0')}`;
          const m2 = parts[1].trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
          if (m2) endDate = `${m2[3]}-${m2[1].padStart(2, '0')}-${m2[2].padStart(2, '0')}`;
        }
      }

      const matchTabling = rowStr.match(/Tabling\s*date\s*:\s*([0-9\/\-: ]+)/i);
      if (matchTabling) tablingDate = matchTabling[1].trim();
    }

    let currentEmp = null;
    let daysHeaderMap = null;

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r] || [];
      const rowStr = row.map(c => String(c).trim()).join(" ");

      // 1. Check if this row is an Employee Header: supports both cell-separated and concatenated strings
      let userId = null;
      let name = "";
      let dept = "";

      for (let c = 0; c < row.length; c++) {
        const val = String(row[c]).trim();
        if (/^User\s*ID:?$/i.test(val) && row[c + 1] !== undefined) {
          const parsed = parseInt(String(row[c + 1]).trim(), 10);
          if (!isNaN(parsed)) userId = parsed;
        }
        if (/^Name:?$/i.test(val) && row[c + 1] !== undefined) {
          name = String(row[c + 1]).trim();
        }
        if (/^Department:?$/i.test(val) && row[c + 1] !== undefined) {
          dept = String(row[c + 1]).trim();
        }
      }

      // Regex fallback if cell scanning did not extract
      if (userId === null) {
        const userIdMatch = rowStr.match(/User\s*ID\s*:\s*(\d+)/i);
        if (userIdMatch) {
          userId = parseInt(userIdMatch[1], 10);
        }
      }

      if (userId !== null) {
        if (!name) {
          const nameMatch = rowStr.match(/Name\s*:\s*([^\s][^:]*?)(?:\s+Department|\s+Dept|$)/i);
          if (nameMatch) name = nameMatch[1].trim();
        }
        if (!dept) {
          const deptMatch = rowStr.match(/Department\s*:\s*([^\s]+)/i);
          if (deptMatch) dept = deptMatch[1].trim();
        }

        let formattedName = name || `Employee #${userId}`;
        formattedName = formattedName.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

        currentEmp = {
          id: userId,
          name: formattedName,
          department: dept || "OPERATION",
          punches: []
        };
        employeesMap.set(userId, currentEmp);
        daysHeaderMap = null;
        continue;
      }

      // 2. Check if this row is a day numbers header (e.g. 16, 17, 18 ... 31, 1, 2, 3, 4, 5)
      // Must be pure day numbers without colons/timestamps to prevent punch lines from overwriting the header map
      if (currentEmp && !daysHeaderMap) {
        let sequentialDayCount = 0;
        const candidateMap = {};
        for (let colIdx = 0; colIdx < row.length; colIdx++) {
          const cellStr = String(row[colIdx]).trim();
          if (/^\d{1,2}$/.test(cellStr)) {
            const val = parseInt(cellStr, 10);
            if (val >= 1 && val <= 31) {
              candidateMap[colIdx] = val;
              sequentialDayCount++;
            }
          }
        }
        if (sequentialDayCount >= 10) {
          daysHeaderMap = candidateMap;
          continue;
        }
      }

      // 3. If we have a current employee and a days map, parse punches in this row
      if (currentEmp && daysHeaderMap) {
        for (const [colIdxStr, dayNum] of Object.entries(daysHeaderMap)) {
          const colIdx = parseInt(colIdxStr, 10);
          const cellContent = String(row[colIdx] || "").trim();
          if (!cellContent) continue;

          // Split cell lines (e.g. "00:22\n09:30\n15:11")
          const lines = cellContent.split(/\r?\n|\s{2,}/).map(l => l.trim()).filter(l => l.length > 0);
          
          for (const line of lines) {
            const timeMatch = line.match(/^(\d{1,2}):(\d{2})$/);
            if (timeMatch) {
              // Infer month: if day >= 16 assume previous month (e.g., Aug), else current (e.g., Sept)
              const year = 2026;
              const month = (dayNum >= 16) ? 8 : 9;
              const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              
              currentEmp.punches.push({
                date: dateStr,
                time: line,
                raw: line,
                source: "biometric_excel"
              });
            }
          }
        }
      }
    }

    // Format results
    const parsedEmployees = Array.from(employeesMap.values()).map(emp => {
      // Sort punches by date and time
      emp.punches.sort((a, b) => (a.date + " " + a.time).localeCompare(b.date + " " + b.time));
      return emp;
    });

    return {
      cutoffRange,
      tablingDate,
      startDate,
      endDate,
      employeeCount: parsedEmployees.length,
      employees: parsedEmployees
    };
  }

  /**
   * Process and calculate daily attendance metrics for an employee given a date range and shifts
   * @param {Object} employee 
   * @param {string} startDate 'YYYY-MM-DD'
   * @param {string} endDate 'YYYY-MM-DD'
   * @param {Array} shiftList 
   * @returns {Object} Daily breakdown and totals
   */
  static calculateTimecard(employee, startDate = "2026-08-16", endDate = "2026-09-05", shiftList = null) {
    const punches = employee.attendanceLogs || employee.punches || [];
    const shifts = shiftList || (window.DB ? window.DB.getShifts() : []);
    const defaultShift = shifts[0] || { start: "08:00", end: "17:00", gracePeriodMinutes: 15 };

    // Group punches by date
    const punchesByDate = {};
    punches.forEach(p => {
      if (p.date >= startDate && p.date <= endDate) {
        if (!punchesByDate[p.date]) punchesByDate[p.date] = [];
        punchesByDate[p.date].push(p.time);
      }
    });

    // Generate all dates in range
    const dateList = [];
    let curr = new Date(startDate);
    const end = new Date(endDate);
    while (curr <= end) {
      dateList.push(curr.toISOString().split('T')[0]);
      curr.setDate(curr.getDate() + 1);
    }

    const dailyBreakdown = [];
    let totalRegularHours = 0;
    let totalOtHours = 0;
    let totalNightDiffHours = 0;
    let totalLateMinutes = 0;
    let totalUndertimeMinutes = 0;
    let daysPresent = 0;
    let daysAbsent = 0;

    dateList.forEach(dateStr => {
      const dayPunches = punchesByDate[dateStr] ? [...punchesByDate[dateStr]].sort() : [];
      const dayOfWeek = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
      const isSunday = (dayOfWeek === 'Sun');

      if (dayPunches.length === 0) {
        if (!isSunday) {
          // If no punches on a weekday/scheduled day, mark absent or rest day depending on logs count
          daysAbsent++;
        }
        dailyBreakdown.push({
          date: dateStr,
          dayOfWeek,
          punches: [],
          firstIn: null,
          lastOut: null,
          status: isSunday ? "Rest Day" : "Absent / Off",
          regularHours: 0,
          otHours: 0,
          nightDiffHours: 0,
          lateMinutes: 0,
          undertimeMinutes: 0
        });
        return;
      }

      daysPresent++;
      const firstIn = dayPunches[0];
      const lastOut = dayPunches.length > 1 ? dayPunches[dayPunches.length - 1] : dayPunches[0];

      // Compute total elapsed time between earliest in and latest out
      const inMinutes = this.timeToMinutes(firstIn);
      let outMinutes = this.timeToMinutes(lastOut);
      
      // If out is smaller than in, span into next day (e.g. night shift 22:00 to 06:00 or 17:00 to 00:40)
      if (outMinutes < inMinutes && dayPunches.length > 1) {
        outMinutes += 24 * 60;
      }

      let grossMinutes = (dayPunches.length > 1) ? (outMinutes - inMinutes) : (8 * 60); // Default standard if single punch
      
      // Deduct 1 hour lunch break if worked > 5 hours
      let netWorkMinutes = grossMinutes > (5 * 60) ? (grossMinutes - 60) : grossMinutes;
      if (netWorkMinutes < 0) netWorkMinutes = 0;

      let regularMinutes = Math.min(netWorkMinutes, 8 * 60);
      let otMinutes = Math.max(0, netWorkMinutes - 8 * 60);

      // Night shift differential (10:00 PM to 6:00 AM)
      let nightDiffMins = this.calculateNightDiffMinutes(inMinutes, outMinutes);

      // Late minutes calculation against default shift start
      const shiftStartMins = this.timeToMinutes(defaultShift.start || "08:00");
      let lateMins = 0;
      if (inMinutes > (shiftStartMins + (defaultShift.gracePeriodMinutes || 15)) && inMinutes < (shiftStartMins + 240)) {
        lateMins = inMinutes - shiftStartMins;
      }

      const regularHours = parseFloat((regularMinutes / 60).toFixed(2));
      const otHours = parseFloat((otMinutes / 60).toFixed(2));
      const nightDiffHours = parseFloat((nightDiffMins / 60).toFixed(2));

      totalRegularHours += regularHours;
      totalOtHours += otHours;
      totalNightDiffHours += nightDiffHours;
      totalLateMinutes += lateMins;

      dailyBreakdown.push({
        date: dateStr,
        dayOfWeek,
        punches: dayPunches,
        firstIn,
        lastOut,
        status: isSunday ? "Rest Day Work" : "Present",
        regularHours,
        otHours,
        nightDiffHours,
        lateMinutes: lateMins,
        undertimeMinutes: 0
      });
    });

    return {
      employeeId: employee.id,
      employeeName: employee.name,
      department: employee.department,
      startDate,
      endDate,
      daysPresent,
      daysAbsent,
      totalRegularHours: parseFloat(totalRegularHours.toFixed(2)),
      totalOtHours: parseFloat(totalOtHours.toFixed(2)),
      totalNightDiffHours: parseFloat(totalNightDiffHours.toFixed(2)),
      totalLateMinutes,
      dailyBreakdown
    };
  }

  static timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    return (parseInt(parts[0], 10) * 60) + parseInt(parts[1], 10);
  }

  static calculateNightDiffMinutes(startMins, endMins) {
    // Night window: 22:00 (1320 mins) to 06:00 (360 mins or 1800 mins next day)
    let nightMins = 0;
    for (let m = startMins; m < endMins; m++) {
      const modMinute = m % (24 * 60);
      if (modMinute >= (22 * 60) || modMinute < (6 * 60)) {
        nightMins++;
      }
    }
    return nightMins;
  }
}

window.BiometricParser = BiometricParser;
