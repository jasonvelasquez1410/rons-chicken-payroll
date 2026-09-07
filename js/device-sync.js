/**
 * Ron's Chicken Biometric Device Sync & Cloud Simulator
 * Prepares Ron's Chicken for Internet-connected Biometric Hardware & Live Sync
 */

class DeviceSync {
  constructor() {
    this.isListening = false;
    this.pollTimer = null;
    this.listeners = [];
  }

  static getConfig() {
    return window.DB ? window.DB.getDeviceConfig() : {
      enabled: true,
      deviceName: "Ron's Chicken Biometrics - Cugman Deli e3960",
      deviceModel: "Deli e3960 (USB Flash Drive Attendance Machine / Non-WiFi)",
      ipAddress: "N/A (Offline USB Flash Drive Export)",
      port: 0,
      commKey: 0,
      admsUrl: "https://ronschicken.cloud/api/biometrics/push",
      autoSyncIntervalMinutes: 0,
      lastSyncTimestamp: "2026-09-07 01:05:57",
      status: "USB Flash Drive Mode Active (Deli e3960)"
    };
  }

  static updateConfig(newConfig) {
    if (window.DB) {
      window.DB.saveDeviceConfig(newConfig);
    }
  }

  /**
   * Test direct IP connectivity to device
   */
  static async testConnection(ip, port) {
    // Simulated handshake
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      success: true,
      latency: Math.floor(Math.random() * 15) + 12,
      firmware: "ZEM560_Ver 6.60 (Ver 2.1.8-build)",
      serialNumber: "BK40260907001",
      deviceTime: new Date().toLocaleString(),
      userCount: (window.DB ? window.DB.getEmployees().length : 31),
      logCount: 1420
    };
  }

  /**
   * Simulate a live biometric fingerprint or face scan from an employee
   */
  static simulateLivePunch(employeeId, customTime = null) {
    const emp = window.DB ? window.DB.getEmployeeById(employeeId) : null;
    if (!emp) return { success: false, message: "Employee not found." };

    const now = new Date();
    const dateStr = customTime ? customTime.split(' ')[0] : now.toISOString().split('T')[0];
    const timeStr = customTime ? customTime.split(' ')[1] : now.toTimeString().slice(0, 5);

    const punchRecord = {
      date: dateStr,
      time: timeStr,
      raw: timeStr,
      source: "live_biometric_device"
    };

    window.DB.addPunchLog(employeeId, punchRecord);

    return {
      success: true,
      employee: emp,
      punch: punchRecord,
      message: `Biometric punch logged for ${emp.name} at ${timeStr}`
    };
  }

  /**
   * Process raw Excel / CSV file upload
   */
  static async processUploadedFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const result = await window.BiometricParser.parseFile(e.target.result);
          
          // Merge parsed punches into DB employees
          if (result && result.employees) {
            let updatedCount = 0;
            result.employees.forEach(parsedEmp => {
              const dbEmp = window.DB.getEmployeeById(parsedEmp.id);
              if (dbEmp) {
                // Merge punches avoiding exact duplicates
                const existingPunches = dbEmp.attendanceLogs || [];
                const newPunches = parsedEmp.punches || [];
                
                const punchSet = new Set(existingPunches.map(p => `${p.date}_${p.time}`));
                newPunches.forEach(p => {
                  const key = `${p.date}_${p.time}`;
                  if (!punchSet.has(key)) {
                    existingPunches.push(p);
                    punchSet.add(key);
                  }
                });
                
                window.DB.setEmployeeAttendance(parsedEmp.id, existingPunches);
                updatedCount++;
              }
            });

            // Record cutoff if detected
            if (result.cutoffRange) {
              const cutoffs = window.DB.getCutoffs();
              const newCutoff = {
                id: `CO-${Date.now()}`,
                name: `Attendance: ${result.cutoffRange}`,
                startDate: "2026-08-16",
                endDate: "2026-09-05",
                status: "Imported & Ready",
                importedAt: new Date().toLocaleString(),
                sourceFile: file.name
              };
              cutoffs.unshift(newCutoff);
              window.DB.saveCutoffs(cutoffs);
            }

            resolve({
              success: true,
              cutoffRange: result.cutoffRange,
              employeeCount: result.employeeCount,
              updatedCount,
              message: `Successfully processed ${result.employeeCount} employee time records from ${file.name}`
            });
          } else {
            resolve({ success: false, message: "No attendance records found in file." });
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  }
}

window.DeviceSync = DeviceSync;
