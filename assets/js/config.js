/**
 * CONFIGURATION, DYNAMIC BRANDING & K2C LICENSE HUB ENGINE
 * Wedding Organizer Digital Portal
 */

const CONFIG = {
  // Endpoint Google Apps Script Web App
  GAS_API_URL: "https://script.google.com/macros/s/AKfycbwNBkqK8Z9M5JctiwSsvaxoQKEt8sm6tvw6ps2S1gShf2WTDm10Ym-t4qEE3Z11n85f/exec",
  
  // Theme Constants
  COLORS: {
    ROSE_GOLD: "#B76E79",
    CHAMPAGNE: "#F7E7CE",
    SOFT_BURGUNDY: "#800020",
    DARK_BG: "#120A0C"
  },

  // 1. DYNAMIC BRANDING GETTER & SETTER
  getAppName: function() {
    return localStorage.getItem("wo_app_name") || "AURA ELEGANCE";
  },
  setAppName: function(newName) {
    if (newName && newName.trim() !== "") {
      localStorage.setItem("wo_app_name", newName.trim());
      return true;
    }
    return false;
  },

  // 2. DYNAMIC ADMIN CREDENTIALS GETTER & SETTER
  getAdminUsername: function() {
    return localStorage.getItem("wo_admin_username") || "admin";
  },
  setAdminUsername: function(newUsername) {
    if (newUsername && newUsername.trim() !== "") {
      localStorage.setItem("wo_admin_username", newUsername.trim());
      return true;
    }
    return false;
  },

  getAdminPasscode: function() {
    return localStorage.getItem("wo_admin_passcode") || "WO-ADMIN-2026";
  },
  setAdminPasscode: function(newPasscode) {
    if (newPasscode && newPasscode.trim() !== "") {
      localStorage.setItem("wo_admin_passcode", newPasscode.trim());
      return true;
    }
    return false;
  },

  // 3. HWID GENERATOR (DEVICE FINGERPRINT FOR K2C LICENSE HUB)
  getHWID: function() {
    let hwid = localStorage.getItem("wo_client_hwid");
    if (!hwid) {
      const rawStr = (navigator.userAgent || "") + (screen.width + "x" + screen.height) + (navigator.language || "");
      let hash = 0;
      for (let i = 0; i < rawStr.length; i++) {
        const char = rawStr.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
      }
      const hexHash = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
      hwid = `WO-HWID-${hexHash.slice(0, 4)}-${hexHash.slice(4, 8)}`;
      localStorage.setItem("wo_client_hwid", hwid);
    }
    return hwid;
  },

  // 4. INSTALL DATE & TRIAL SYSTEM (30 DAYS)
  getInstallDate: function() {
    let dateStr = localStorage.getItem("wo_install_date");
    if (!dateStr) {
      dateStr = new Date().toISOString();
      localStorage.setItem("wo_install_date", dateStr);
    }
    return new Date(dateStr);
  },

  // 5. K2C LICENSE VERIFICATION ENGINE & DURATION CALCULATOR
  getLicenseSerial: function() {
    return localStorage.getItem("wo_license_serial") || "";
  },
  
  setLicenseSerial: function(serialKey) {
    if (serialKey && serialKey.trim().length >= 10) {
      const cleanSerial = serialKey.trim().toUpperCase();
      localStorage.setItem("wo_license_serial", cleanSerial);
      localStorage.setItem("wo_license_activation_date", new Date().toISOString());
      
      // Deteksi Durasi dari Format Serial Key K2C Hub (e.g. -30D, -365D, -3650D / LIFETIME)
      let durationDays = 30; // Default jika berdurasi
      if (cleanSerial.endsWith("-30D") || cleanSerial.endsWith("-30")) {
        durationDays = 30;
      } else if (cleanSerial.endsWith("-365D") || cleanSerial.endsWith("-365")) {
        durationDays = 365;
      } else if (cleanSerial.includes("LIFETIME") || cleanSerial.endsWith("-3650D")) {
        durationDays = 9999;
      } else {
        durationDays = 365; // Default valid serial
      }
      localStorage.setItem("wo_license_duration_days", durationDays.toString());
      return true;
    } else {
      localStorage.removeItem("wo_license_serial");
      localStorage.removeItem("wo_license_activation_date");
      localStorage.removeItem("wo_license_duration_days");
      return false;
    }
  },

  checkLicenseStatus: function() {
    const serial = this.getLicenseSerial();

    // 1. JIKA SERIAL KEY RESMI TERISI
    if (serial && serial.length >= 10) {
      const isFormatValid = serial.startsWith("K2C-") || serial.startsWith("LIC-") || serial.includes("WO-2026") || serial.includes("K2C");
      
      if (isFormatValid) {
        const activationDateStr = localStorage.getItem("wo_license_activation_date") || new Date().toISOString();
        const durationDays = parseInt(localStorage.getItem("wo_license_duration_days") || "365", 10);
        
        if (durationDays >= 9000) {
          return {
            status: "LICENSED",
            type: "LIFETIME",
            message: "✓ Lisensi Resmi Aktif (Lifetime Verified by K2C License Hub)",
            isExpired: false,
            daysLeft: 9999
          };
        }

        const actDate = new Date(activationDateStr);
        const now = new Date();
        const diffTime = now.getTime() - actDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
        const daysLeft = Math.max(0, durationDays - diffDays);

        if (daysLeft > 0) {
          return {
            status: "LICENSED",
            type: "SUBSCRIPTION",
            message: `✓ Lisensi Resmi Aktif: Sisa ${daysLeft} Hari lagi (Verified by K2C License Hub)`,
            isExpired: false,
            daysLeft: daysLeft
          };
        } else {
          return {
            status: "EXPIRED",
            type: "SUBSCRIPTION_EXPIRED",
            message: "✕ Masa Aktif Lisensi Serial Key Telah Habis! Silakan perpanjang Serial Key.",
            isExpired: true,
            daysLeft: 0
          };
        }
      }
    }

    // 2. JIKA MODES TRIAL 30 HARI
    const installDate = this.getInstallDate();
    const now = new Date();
    const diffTime = now.getTime() - installDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
    const daysLeft = Math.max(0, 30 - diffDays);

    if (daysLeft > 0) {
      return {
        status: "TRIAL",
        type: "TRIAL",
        message: `⏳ Masa Trial Aktif: Sisa ${daysLeft} Hari lagi...`,
        isExpired: false,
        daysLeft: daysLeft
      };
    } else {
      return {
        status: "EXPIRED",
        type: "TRIAL_EXPIRED",
        message: "✕ Masa Trial 30 Hari Telah Habis! Aplikasi Terkunci.",
        isExpired: true,
        daysLeft: 0
      };
    }
  }
};
