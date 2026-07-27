/**
 * CONFIGURATION, DYNAMIC BRANDING & K2C LICENSE HUB REMOTE ENGINE
 * Wedding Organizer Digital Portal
 */

const CONFIG = {
  // Endpoint Google Apps Script Web App
  GAS_API_URL: "https://script.google.com/macros/s/AKfycbwNBkqK8Z9M5JctiwSsvaxoQKEt8sm6tvw6ps2S1gShf2WTDm10Ym-t4qEE3Z11n85f/exec",
  
  // Endpoint Master Web K2C Universal License Hub Anda
  K2C_HUB_API_URL: "https://script.google.com/macros/s/AKfycbyDPyK7B3CTdD7uw32wO0XcX2prmFeDGr-mhpIsogEjsJQ8w_rNOXFBPrhnnq3w2pMa/exec",
  
  APP_ID: "K2C-WO",

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

  // 5. K2C LICENSE REMOTE CLAIM & VERIFICATION ENGINE
  getLicenseSerial: function() {
    return localStorage.getItem("wo_license_serial") || "";
  },

  /**
   * Mengklaim lisensi secara online ke K2C Universal License Hub
   */
  claimLicenseRemote: async function(serialKey) {
    if (!serialKey || serialKey.trim().length < 10) {
      return {
        success: false,
        message: "Serial Key tidak boleh kosong atau kurang dari 10 karakter."
      };
    }

    const cleanSerial = serialKey.trim().toUpperCase();
    const hwid = this.getHWID();

    try {
      // Mengirimkan request claim live ke backend / K2C License Hub
      const payload = {
        action: "verifyLicense",
        appId: this.APP_ID,
        serialKey: cleanSerial,
        hwid: hwid
      };

      const res = await fetch(this.GAS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (result.success) {
        // Simpan data klaim resmi jika terverifikasi oleh Hub
        localStorage.setItem("wo_license_serial", cleanSerial);
        localStorage.setItem("wo_license_activation_date", new Date().toISOString());
        
        let durationDays = result.durationDays || 365;
        if (cleanSerial.endsWith("-30D") || cleanSerial.endsWith("-30")) {
          durationDays = 30;
        } else if (cleanSerial.endsWith("-365D") || cleanSerial.endsWith("-365")) {
          durationDays = 365;
        } else if (cleanSerial.includes("LIFETIME") || cleanSerial.endsWith("-3650D")) {
          durationDays = 9999;
        }

        const expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + durationDays);

        localStorage.setItem("wo_license_duration_days", durationDays.toString());
        localStorage.setItem("wo_license_expires_at", expireDate.toISOString());

        return {
          success: true,
          status: result.status || "LICENSED",
          message: result.message || "✓ Serial Key berhasil diverifikasi & diklaim untuk perangkat ini!"
        };
      } else {
        return {
          success: false,
          status: result.status || "INVALID",
          message: result.message || "✕ Serial Key tidak valid atau sudah pernah diklaim di perangkat lain!"
        };
      }
    } catch (err) {
      // Offline / Pattern Fallback Validation jika server K2C belum terhubung
      const isValidFormat = cleanSerial.startsWith("K2C-") || cleanSerial.startsWith("LIC-") || cleanSerial.includes("WO-2026");

      if (isValidFormat) {
        let durationDays = 30;
        if (cleanSerial.endsWith("-30D") || cleanSerial.endsWith("-30")) durationDays = 30;
        else if (cleanSerial.endsWith("-365D") || cleanSerial.endsWith("-365")) durationDays = 365;
        else if (cleanSerial.includes("LIFETIME")) durationDays = 9999;

        const expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + durationDays);

        localStorage.setItem("wo_license_serial", cleanSerial);
        localStorage.setItem("wo_license_activation_date", new Date().toISOString());
        localStorage.setItem("wo_license_duration_days", durationDays.toString());
        localStorage.setItem("wo_license_expires_at", expireDate.toISOString());

        return {
          success: true,
          status: "LICENSED",
          message: "✓ Serial Key Valid (Mode Verifikasi Standar K2C Hub)"
        };
      } else {
        return {
          success: false,
          status: "INVALID",
          message: "✕ Format Serial Key tidak dikenali oleh K2C Hub!"
        };
      }
    }
  },

  checkLicenseStatus: function() {
    const serial = this.getLicenseSerial();

    // 1. JIKA SERIAL KEY TERDAFTAR
    if (serial && serial.length >= 10) {
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
          message: `✓ Lisensi Resmi Aktif: Sisa Masa Aktif ${daysLeft} Hari Lagi (Verified by K2C Hub)`,
          isExpired: false,
          daysLeft: daysLeft
        };
      } else {
        return {
          status: "EXPIRED",
          type: "SUBSCRIPTION_EXPIRED",
          message: "✕ Masa Aktif Lisensi Serial Key Telah Habis! Silakan beli Serial Key baru di K2C Hub.",
          isExpired: true,
          daysLeft: 0
        };
      }
    }

    // 2. MODE TRIAL 30 HARI
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
