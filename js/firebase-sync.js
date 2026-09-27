/**
 * Ron's Chicken Firebase Real-Time Cloud Sync Engine
 * Enables seamless multi-device data synchronization across Laptop, Smartphone, and Tablet
 * 100% Free Forever via Google Firebase Spark Tier
 */

const FIREBASE_STORAGE_KEY = 'rons_payroll_firebase_config_v1';
const SYNC_COLLECTION = 'branches';
const SYNC_DOC_ID = 'cugman_branch';

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDOCehcvMJlR-dnQL2JqQGrz3UJb1pgMmw",
  authDomain: "rons-chicken-payroll.firebaseapp.com",
  projectId: "rons-chicken-payroll",
  storageBucket: "rons-chicken-payroll.firebasestorage.app",
  messagingSenderId: "638631328440",
  appId: "1:638631328440:web:a24ac1117d61821e31124d",
  measurementId: "G-3REF4JJG00"
};

class FirebaseSync {
  static isInitialized = false;
  static isSyncing = false;
  static db = null;
  static unsubscribeListener = null;

  static getSavedConfig() {
    try {
      const stored = localStorage.getItem(FIREBASE_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return DEFAULT_FIREBASE_CONFIG;
  }

  static saveConfig(config) {
    try {
      localStorage.setItem(FIREBASE_STORAGE_KEY, JSON.stringify(config));
      return true;
    } catch (e) {
      return false;
    }
  }

  static removeConfig() {
    try {
      localStorage.removeItem(FIREBASE_STORAGE_KEY);
      if (this.unsubscribeListener) {
        this.unsubscribeListener();
        this.unsubscribeListener = null;
      }
      this.isInitialized = false;
      this.db = null;
      this.updateStatusPill('disconnected');
    } catch (e) {}
  }

  /**
   * Dynamically ensure Firebase SDK scripts are loaded
   */
  static async loadFirebaseSDK() {
    if (typeof window.firebase !== 'undefined' && window.firebase.firestore) {
      return true;
    }

    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(s);
      });
    };

    try {
      await loadScript('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
      await loadScript('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js');
      return true;
    } catch (err) {
      console.warn("[FirebaseSync] SDK Load Warning:", err);
      return false;
    }
  }

  /**
   * Initialize Firebase with provided config or saved config
   */
  static async init(customConfig = null) {
    const config = customConfig || this.getSavedConfig();
    if (!config || !config.projectId || !config.apiKey) {
      this.updateStatusPill('disconnected');
      return false;
    }

    try {
      this.updateStatusPill('connecting');
      const sdkLoaded = await this.loadFirebaseSDK();
      if (!sdkLoaded) {
        this.updateStatusPill('error', 'SDK Load Failed');
        return false;
      }

      if (!window.firebase.apps.length) {
        window.firebase.initializeApp(config);
      }
      this.db = window.firebase.firestore();
      this.isInitialized = true;
      this.saveConfig(config);

      // Start listening to real-time changes
      this.startRealtimeListener();
      this.updateStatusPill('connected');
      console.log("[FirebaseSync] Connected to Firebase Firestore project:", config.projectId);
      return true;
    } catch (err) {
      console.error("[FirebaseSync] Init Error:", err);
      this.updateStatusPill('error', err.message);
      return false;
    }
  }

  /**
   * Start Real-Time Firestore Listener
   */
  static startRealtimeListener() {
    if (!this.db || !this.isInitialized) return;
    if (this.unsubscribeListener) {
      this.unsubscribeListener();
    }

    const docRef = this.db.collection(SYNC_COLLECTION).doc(SYNC_DOC_ID);

    this.unsubscribeListener = docRef.onSnapshot((doc) => {
      if (doc.exists) {
        const remoteData = doc.data();
        if (remoteData && remoteData.payload) {
          const lastRemoteUpdated = remoteData.updatedAt || 0;
          const lastLocalUpdated = parseInt(localStorage.getItem('rons_payroll_last_local_edit') || '0', 10);

          // If remote is newer than local or if local has never synced, apply it
          if (lastRemoteUpdated > lastLocalUpdated) {
            console.log("[FirebaseSync] Ingesting newer real-time data from Cloud...");
            if (window.DB && typeof window.DB.importBackupJson === 'function') {
              window.DB.importBackupJson(remoteData.payload);
              localStorage.setItem('rons_payroll_last_local_edit', lastRemoteUpdated.toString());
              if (typeof window.renderApp === 'function') {
                window.renderApp();
              }
            }
          }
        }
      } else {
        // Document does not exist yet; push initial seed data
        console.log("[FirebaseSync] Creating initial cloud document for Cugman branch...");
        this.pushLocalToCloud(true);
      }
      this.updateStatusPill('connected');
    }, (error) => {
      console.warn("[FirebaseSync] Listener Error:", error);
      this.updateStatusPill('error', error.message);
    });
  }

  /**
   * Push current local database to Firebase Cloud
   */
  static async pushLocalToCloud(isInitial = false) {
    if (!this.db || !this.isInitialized) return false;

    try {
      this.updateStatusPill('syncing');
      const now = Date.now();
      localStorage.setItem('rons_payroll_last_local_edit', now.toString());

      const fullData = (window.DB && typeof window.DB.getFullBackupData === 'function')
        ? window.DB.getFullBackupData('Cloud Live Sync')
        : null;

      if (!fullData || !fullData.payload) return false;

      const docRef = this.db.collection(SYNC_COLLECTION).doc(SYNC_DOC_ID);
      await docRef.set({
        updatedAt: now,
        updatedAtFormatted: new Date().toLocaleString(),
        deviceInfo: navigator.userAgent.includes('Mobi') ? 'Mobile Smartphone' : 'Desktop / Laptop',
        payload: fullData.payload
      }, { merge: true });

      this.updateStatusPill('connected');
      console.log("[FirebaseSync] Successfully synced local database to Cloud Firestore.");
      return true;
    } catch (err) {
      console.error("[FirebaseSync] Push Error:", err);
      this.updateStatusPill('error', err.message);
      return false;
    }
  }

  /**
   * Update visual status indicator in the top navbar and modal
   */
  static updateStatusPill(status, message = '') {
    const pill = document.getElementById('firebase-sync-pill');
    if (pill) {
      if (status === 'connected') {
        pill.innerHTML = `
          <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981; display: inline-block;"></span>
          <span style="color: #10b981; font-weight: 700;">Cloud Synced</span>
        `;
        pill.title = "Real-time Cloud Synchronization Active across all devices";
      } else if (status === 'syncing' || status === 'connecting') {
        pill.innerHTML = `
          <span style="width: 8px; height: 8px; border-radius: 50%; background: #f59e0b; box-shadow: 0 0 8px #f59e0b; display: inline-block; animation: pulse 1s infinite;"></span>
          <span style="color: #f59e0b; font-weight: 700;">Syncing Cloud...</span>
        `;
        pill.title = "Connecting / Syncing with Google Cloud Firestore...";
      } else if (status === 'error') {
        pill.innerHTML = `
          <span style="width: 8px; height: 8px; border-radius: 50%; background: #ef4444; display: inline-block;"></span>
          <span style="color: #ef4444; font-weight: 700;">Sync Offline</span>
        `;
        pill.title = `Cloud Sync Error: ${message}`;
      } else {
        pill.innerHTML = `
          <span style="width: 8px; height: 8px; border-radius: 50%; background: #64748b; display: inline-block;"></span>
          <span style="color: #94a3b8; font-weight: 600;">Local Device</span>
        `;
        pill.title = "Running in Local Offline Mode. Click to connect Free Firebase Cloud Sync.";
      }
    }

    const modalStatus = document.getElementById('modal-cloud-status-card');
    if (modalStatus) {
      if (status === 'connected') {
        modalStatus.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <div style="width: 10px; height: 10px; border-radius: 50%; background: #10b981; box-shadow: 0 0 10px #10b981;"></div>
              <strong style="color: var(--text-primary); font-size: 0.9rem;">Cloud Sync Status: CONNECTED &amp; LIVE</strong>
            </div>
            <span class="pill pill-emerald" style="font-size: 0.72rem;">Google Firestore Real-Time</span>
          </div>
          <p style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.5rem; line-height: 1.45;">
            Connected to project: <code>rons-chicken-payroll</code>. Real-time multi-device sync is active across your Laptop, Smartphone, and Tablet.
          </p>
        `;
      } else if (status === 'syncing' || status === 'connecting') {
        modalStatus.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <div style="width: 10px; height: 10px; border-radius: 50%; background: #f59e0b; box-shadow: 0 0 10px #f59e0b;"></div>
              <strong style="color: var(--text-primary); font-size: 0.9rem;">Cloud Sync Status: CONNECTING / SYNCING...</strong>
            </div>
            <span class="pill pill-orange" style="font-size: 0.72rem;">Syncing</span>
          </div>
        `;
      } else if (status === 'error') {
        modalStatus.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <div style="width: 10px; height: 10px; border-radius: 50%; background: #ef4444;"></div>
              <strong style="color: var(--text-primary); font-size: 0.9rem;">Cloud Sync Status: OFFLINE (${message})</strong>
            </div>
            <span class="pill pill-rose" style="font-size: 0.72rem;">Error</span>
          </div>
        `;
      }
    }
  }
}

// Attach to window
window.FirebaseSync = FirebaseSync;

// Auto-initialize if config is already saved
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => FirebaseSync.init());
  } else {
    FirebaseSync.init();
  }
}
