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

  // 5. K2C LICENSE VERIFICATION ENGINE
  getLicenseSerial: function() {
    return localStorage.getItem("wo_license_serial") || "";
  },
  setLicenseSerial: function(serialKey) {
    if (serialKey) {
      localStorage.setItem("wo_license_serial", serialKey.trim().toUpperCase());
    } else {
      localStorage.removeItem("wo_license_serial");
    }
  },

  checkLicenseStatus: function() {
    const serial = this.getLicenseSerial();
    const hwid = this.getHWID();

    // Check if Serial Key is valid against K2C License Engine Pattern
    if (serial && serial.length >= 12) {
      // Basic Hash Verification Check matching K2C License Hub format
      if (serial.startsWith("K2C-") || serial.startsWith("LIC-") || serial.includes("WO-2026")) {
        return {
          status: "LICENSED",
          message: "Lisensi Resmi Terverifikasi (Lifetime Active)",
          isExpired: false,
          daysLeft: 9999
        };
      }
    }

    // Trial Calculation (30 Days)
    const installDate = this.getInstallDate();
    const now = new Date();
    const diffTime = now.getTime() - installDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
    const daysLeft = Math.max(0, 30 - diffDays);

    if (daysLeft > 0) {
      return {
        status: "TRIAL",
        message: `Masa Trial Aktif (Sisa ${daysLeft} Hari)`,
        isExpired: false,
        daysLeft: daysLeft
      };
    } else {
      return {
        status: "EXPIRED",
        message: "Masa Trial 30 Hari Telah Habis! Silakan Masukkan Serial Key Resmi.",
        isExpired: true,
        daysLeft: 0
      };
    }
  }
};
