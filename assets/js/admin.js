let allBookingsData = [];
let allPackagesData = [];

const MOCK_ADMIN_BOOKINGS = [
  {
    id: "WO-982341",
    clientName: "Anisa & Rizky",
    phone: "081234567890",
    eventDate: "2026-08-20",
    location: "Grand Ballroom Hotel Mulia, Jakarta",
    packageSelected: "Grand Royal Wedding All-In",
    totalEstimate: 65000000,
    paymentStatus: "DP",
    submittedAt: "2026-07-20T10:15:00.000Z"
  }
];

const MOCK_ADMIN_PACKAGES = [
  {
    id: "PKG-01",
    name: "Royal Diamond Wedding",
    category: "Makeup",
    price: 15000000,
    description: "Makeup pengantin premium, melati, & retouch 3x",
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600"
  },
  {
    id: "PKG-02",
    name: "Luxury Rose Gold Decor",
    category: "Dekorasi",
    price: 25000000,
    description: "Panggung 12m, Fresh Flowers, Photobooth & Gate",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  applyDynamicBrandingAdmin();
  setupPasscodeAuth();
  setupTabNavigation();
  setupFiltersAndSearch();
  setupPackageForm();
  setupSettingsAndLicense();
  checkLicenseGuardOnLoad();
});

/**
 * SHOW TOAST NOTIFICATION
 */
function showToast(msg) {
  const toast = document.getElementById("toastBox");
  const toastMsg = document.getElementById("toastMessage");
  if (toast && toastMsg) {
    toastMsg.innerText = msg;
    toast.classList.remove("hidden");
    setTimeout(() => {
      toast.classList.add("hidden");
    }, 3500);
  }
}

/**
 * DYNAMIC BRANDING RENDERER FOR ADMIN
 */
function applyDynamicBrandingAdmin() {
  const brandName = CONFIG.getAppName();
  document.title = `Admin Portal - ${brandName}`;

  const brandLabels = document.querySelectorAll(".dynamic-brand-name");
  brandLabels.forEach(el => {
    el.innerText = brandName;
  });
}

function setupPasscodeAuth() {
  const form = document.getElementById("passcodeForm");
  const passcodeModal = document.getElementById("passcodeModal");
  const dashboardContent = document.getElementById("dashboardContent");
  const passcodeError = document.getElementById("passcodeError");
  const logoutBtn = document.getElementById("logoutBtn");

  const loginUser = document.getElementById("loginUsername");
  if (loginUser) loginUser.value = CONFIG.getAdminUsername();

  if (sessionStorage.getItem("wo_admin_authenticated") === "true") {
    passcodeModal.classList.add("hidden");
    dashboardContent.classList.remove("hidden");
    loadAdminData();
    loadPackagesData();
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const enteredUsername = document.getElementById("loginUsername").value.trim();
      const enteredPasscode = document.getElementById("adminPasscode").value.trim();

      const validUser = CONFIG.getAdminUsername();
      const validPass = CONFIG.getAdminPasscode();

      if (enteredUsername === validUser && enteredPasscode === validPass) {
        sessionStorage.setItem("wo_admin_authenticated", "true");
        passcodeError.classList.add("hidden");
        passcodeModal.classList.add("hidden");
        dashboardContent.classList.remove("hidden");
        loadAdminData();
        loadPackagesData();
      } else {
        passcodeError.classList.remove("hidden");
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("wo_admin_authenticated");
      location.reload();
    });
  }
}

function setupTabNavigation() {
  const tabBookingsBtn = document.getElementById("tabBookingsBtn");
  const tabPackagesBtn = document.getElementById("tabPackagesBtn");
  const tabSettingsBtn = document.getElementById("tabSettingsBtn");

  const viewBookings = document.getElementById("viewBookings");
  const viewPackages = document.getElementById("viewPackages");
  const viewSettings = document.getElementById("viewSettings");

  function resetTabStyles() {
    tabBookingsBtn.className = "py-4 px-5 text-xs font-extrabold uppercase tracking-wider text-[#E8C5C8] hover:text-[#F7E7CE] flex items-center gap-2 cursor-pointer shrink-0";
    tabPackagesBtn.className = "py-4 px-5 text-xs font-extrabold uppercase tracking-wider text-[#E8C5C8] hover:text-[#F7E7CE] flex items-center gap-2 cursor-pointer shrink-0";
    tabSettingsBtn.className = "py-4 px-5 text-xs font-extrabold uppercase tracking-wider text-[#E8C5C8] hover:text-[#F7E7CE] flex items-center gap-2 cursor-pointer shrink-0";

    viewBookings.classList.add("hidden");
    viewPackages.classList.add("hidden");
    viewSettings.classList.add("hidden");
  }

  function switchToSettingsTab() {
    resetTabStyles();
    tabSettingsBtn.className = "py-4 px-5 text-xs font-extrabold uppercase tracking-wider border-b-4 border-[#F7E7CE] text-[#F7E7CE] flex items-center gap-2 cursor-pointer shrink-0";
    viewSettings.classList.remove("hidden");
  }

  if (tabBookingsBtn && tabPackagesBtn && tabSettingsBtn) {
    tabBookingsBtn.addEventListener("click", () => {
      const lic = CONFIG.checkLicenseStatus();
      if (lic.isExpired) {
        showToast("🛑 Aplikasi Terkunci! Masa trial/lisensi telah habis. Harap aktivasi di Tab Pengaturan.");
        switchToSettingsTab();
        return;
      }
      resetTabStyles();
      tabBookingsBtn.className = "py-4 px-5 text-xs font-extrabold uppercase tracking-wider border-b-4 border-[#F7E7CE] text-[#F7E7CE] flex items-center gap-2 cursor-pointer shrink-0";
      viewBookings.classList.remove("hidden");
    });

    tabPackagesBtn.addEventListener("click", () => {
      const lic = CONFIG.checkLicenseStatus();
      if (lic.isExpired) {
        showToast("🛑 Aplikasi Terkunci! Masa trial/lisensi telah habis. Harap aktivasi di Tab Pengaturan.");
        switchToSettingsTab();
        return;
      }
      resetTabStyles();
      tabPackagesBtn.className = "py-4 px-5 text-xs font-extrabold uppercase tracking-wider border-b-4 border-[#F7E7CE] text-[#F7E7CE] flex items-center gap-2 cursor-pointer shrink-0";
      viewPackages.classList.remove("hidden");
    });

    tabSettingsBtn.addEventListener("click", () => {
      switchToSettingsTab();
    });
  }
}

function checkLicenseGuardOnLoad() {
  const lic = CONFIG.checkLicenseStatus();
  if (lic.isExpired) {
    const tabSettingsBtn = document.getElementById("tabSettingsBtn");
    if (tabSettingsBtn) {
      tabSettingsBtn.click();
    }
    disableOperationalActions(true);
    showToast("🛑 Masa Trial/Lisensi Telah Habis! Fitur operasional dinonaktifkan.");
  } else {
    disableOperationalActions(false);
  }
}

function disableOperationalActions(disabled) {
  const addNewPackageBtn = document.getElementById("addNewPackageBtn");
  if (addNewPackageBtn) {
    addNewPackageBtn.disabled = disabled;
    if (disabled) {
      addNewPackageBtn.classList.add("opacity-50", "cursor-not-allowed");
    } else {
      addNewPackageBtn.classList.remove("opacity-50", "cursor-not-allowed");
    }
  }
}

async function loadAdminData() {
  const tableBody = document.getElementById("bookingsTableBody");
  if (!tableBody) return;

  try {
    const res = await fetch(`${CONFIG.GAS_API_URL}?action=getBookings&passcode=${CONFIG.getAdminPasscode()}`);
    const result = await res.json();

    if (result.success && Array.isArray(result.data)) {
      allBookingsData = result.data;
    } else {
      allBookingsData = MOCK_ADMIN_BOOKINGS;
    }
  } catch (err) {
    allBookingsData = MOCK_ADMIN_BOOKINGS;
  }

  updateStatsSummary(allBookingsData);
  renderBookingsTable(allBookingsData);
}

function updateStatsSummary(data) {
  const totalClients = data.length;
  const totalRevenue = data.reduce((acc, curr) => acc + (curr.totalEstimate || 0), 0);
  const pendingCount = data.filter(d => d.paymentStatus === "Pending").length;
  const lunasCount = data.filter(d => d.paymentStatus === "Lunas").length;

  document.getElementById("statTotalClients").innerText = totalClients;
  document.getElementById("statTotalRevenue").innerText = `Rp ${totalRevenue.toLocaleString("id-ID")}`;
  document.getElementById("statPendingCount").innerText = pendingCount;
  document.getElementById("statLunasCount").innerText = lunasCount;
}

function renderBookingsTable(data) {
  const tableBody = document.getElementById("bookingsTableBody");
  if (!tableBody) return;

  if (data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8" class="py-8 text-center text-[#E8C5C8] font-extrabold">Tidak ada data booking.</td></tr>`;
    return;
  }

  const lic = CONFIG.checkLicenseStatus();
  const disabledAttr = lic.isExpired ? "disabled" : "";

  tableBody.innerHTML = data.map(item => {
    let statusBadgeClass = "bg-amber-500/20 text-amber-300 border-amber-500/50 font-extrabold";
    if (item.paymentStatus === "DP") statusBadgeClass = "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-extrabold";
    if (item.paymentStatus === "Lunas") statusBadgeClass = "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-extrabold";

    const cleanPhone = item.phone ? item.phone.replace(/[^0-9]/g, "") : "";
    const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : "#";

    return `
      <tr class="hover:bg-[#280F16] transition-colors border-b border-[#B76E79]/20">
        <td class="py-4 px-6 font-mono text-[11px]"><span style="color: #F7E7CE !important;" class="font-extrabold block">${item.id}</span></td>
        <td class="py-4 px-6 font-extrabold" style="color: #FFFFFF !important;">${item.clientName}</td>
        <td class="py-4 px-6">
          <a href="${waUrl}" target="_blank" class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 font-bold text-[11px]">
            <i data-lucide="message-square" class="w-3 h-3 text-emerald-400"></i><span>${item.phone}</span>
          </a>
        </td>
        <td class="py-4 px-6"><span style="color: #F7E7CE !important;" class="font-extrabold block">${item.eventDate}</span><span style="color: #E8C5C8 !important;" class="text-[11px] font-medium">${item.location}</span></td>
        <td class="py-4 px-6 font-extrabold" style="color: #FFFFFF !important;">${item.packageSelected}</td>
        <td class="py-4 px-6 font-mono font-extrabold" style="color: #FFD700 !important;">Rp ${item.totalEstimate ? item.totalEstimate.toLocaleString("id-ID") : 0}</td>
        <td class="py-4 px-6"><span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold border uppercase ${statusBadgeClass}">${item.paymentStatus}</span></td>
        <td class="py-4 px-6 text-center">
          <select ${disabledAttr} onchange="updateStatus('${item.id}', this.value)" class="bg-[#120A0C] border border-[#B76E79]/50 rounded-lg px-2 py-1 text-[11px] font-extrabold focus:outline-none" style="color: #FFFFFF !important;">
            <option value="Pending" ${item.paymentStatus === "Pending" ? "selected" : ""}>Pending</option>
            <option value="DP" ${item.paymentStatus === "DP" ? "selected" : ""}>DP</option>
            <option value="Lunas" ${item.paymentStatus === "Lunas" ? "selected" : ""}>Lunas</option>
          </select>
        </td>
      </tr>
    `;
  }).join("");

  lucide.createIcons();
}

async function loadPackagesData() {
  const tableBody = document.getElementById("packagesTableBody");
  if (!tableBody) return;

  try {
    const res = await fetch(`${CONFIG.GAS_API_URL}?action=getPackages`);
    const result = await res.json();

    if (result.success && Array.isArray(result.data)) {
      allPackagesData = result.data;
    } else {
      allPackagesData = MOCK_ADMIN_PACKAGES;
    }
  } catch (err) {
    allPackagesData = MOCK_ADMIN_PACKAGES;
  }

  renderPackagesTable(allPackagesData);
}

function renderPackagesTable(data) {
  const tableBody = document.getElementById("packagesTableBody");
  if (!tableBody) return;

  if (data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-[#E8C5C8] font-extrabold">Belum ada paket. Klik "Tambah Paket Baru".</td></tr>`;
    return;
  }

  const lic = CONFIG.checkLicenseStatus();
  const disabledAttr = lic.isExpired ? "disabled" : "";

  tableBody.innerHTML = data.map(item => `
    <tr class="hover:bg-[#280F16] transition-colors border-b border-[#B76E79]/20">
      <td class="py-4 px-6 font-mono font-extrabold text-xs" style="color: #FFD700 !important;">${item.id}</td>
      <td class="py-4 px-6 font-extrabold text-xs" style="color: #FFFFFF !important;">${item.name}</td>
      <td class="py-4 px-6"><span class="px-2.5 py-1 rounded-full text-[10px] bg-[#800020] border border-[#B76E79]/50 text-[#F7E7CE] uppercase font-extrabold">${item.category}</span></td>
      <td class="py-4 px-6 font-mono font-extrabold text-xs" style="color: #F7E7CE !important;">Rp ${item.price ? item.price.toLocaleString("id-ID") : 0}</td>
      <td class="py-4 px-6 font-medium truncate max-w-xs text-xs" style="color: #E8C5C8 !important;">${item.description}</td>
      <td class="py-4 px-6 text-center space-x-2">
        <button ${disabledAttr} onclick="editPackage('${item.id}')" class="px-3 py-1.5 rounded-lg bg-amber-500/30 border border-amber-400 text-amber-200 text-[11px] font-extrabold hover:bg-amber-500/50 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
          Edit
        </button>
        <button ${disabledAttr} onclick="deletePackage('${item.id}')" class="px-3 py-1.5 rounded-lg bg-rose-500/30 border border-rose-400 text-rose-200 text-[11px] font-extrabold hover:bg-rose-500/50 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
          Hapus
        </button>
      </td>
    </tr>
  `).join("");

  lucide.createIcons();
}

function setupPackageForm() {
  const addNewBtn = document.getElementById("addNewPackageBtn");
  const form = document.getElementById("packageForm");

  if (addNewBtn) {
    addNewBtn.addEventListener("click", () => {
      const lic = CONFIG.checkLicenseStatus();
      if (lic.isExpired) {
        showToast("🛑 Fitur Terkunci! Silakan aktifkan lisensi di Tab Pengaturan.");
        return;
      }
      document.getElementById("modalPackageTitle").innerText = "Tambah Paket Baru";
      form.reset();
      document.getElementById("pkgId").value = "";
      document.getElementById("packageModal").classList.remove("hidden");
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const lic = CONFIG.checkLicenseStatus();
      if (lic.isExpired) {
        showToast("🛑 Fitur Terkunci! Silakan aktifkan lisensi di Tab Pengaturan.");
        return;
      }

      const saveBtn = document.getElementById("savePkgBtn");
      saveBtn.disabled = true;
      saveBtn.innerText = "Menyimpan...";

      const pkgData = {
        id: document.getElementById("pkgId").value,
        name: document.getElementById("pkgName").value,
        category: document.getElementById("pkgCategory").value,
        price: Number(document.getElementById("pkgPrice").value) || 0,
        imageUrl: document.getElementById("pkgImageUrl").value,
        description: document.getElementById("pkgDescription").value
      };

      try {
        const payload = {
          action: "savePackage",
          passcode: CONFIG.getAdminPasscode(),
          data: pkgData
        };

        const res = await fetch(CONFIG.GAS_API_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload)
        });

        const result = await res.json();
        showToast(result.message || "Paket berhasil disimpan!");

        closePackageModal();
        loadPackagesData();
      } catch (err) {
        showToast("Gagal menyimpan paket ke server.");
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerText = "Simpan Paket";
      }
    });
  }
}

function closePackageModal() {
  document.getElementById("packageModal").classList.add("hidden");
}

function setupSettingsAndLicense() {
  const brandingForm = document.getElementById("brandingForm");
  const credentialsForm = document.getElementById("credentialsForm");
  const licenseForm = document.getElementById("licenseForm");
  const copyHwidBtn = document.getElementById("copyHwidBtn");
  const resetLicenseBtn = document.getElementById("resetLicenseBtn");

  const settingBrandName = document.getElementById("settingBrandName");
  const settingUsername = document.getElementById("settingUsername");
  const settingPasscode = document.getElementById("settingPasscode");

  if (settingBrandName) settingBrandName.value = CONFIG.getAppName();
  if (settingUsername) settingUsername.value = CONFIG.getAdminUsername();
  if (settingPasscode) settingPasscode.value = CONFIG.getAdminPasscode();

  updateLicenseUI();

  if (brandingForm) {
    brandingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newName = settingBrandName.value;
      if (CONFIG.setAppName(newName)) {
        applyDynamicBrandingAdmin();
        showToast("Nama Brand WO Berhasil Diperbarui!");
      }
    });
  }

  if (credentialsForm) {
    credentialsForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newUser = settingUsername.value;
      const newPass = settingPasscode.value;

      CONFIG.setAdminUsername(newUser);
      CONFIG.setAdminPasscode(newPass);
      showToast("Kredensial Admin Berhasil Diperbarui!");
    });
  }

  if (copyHwidBtn) {
    copyHwidBtn.addEventListener("click", () => {
      const hwidText = CONFIG.getHWID();
      const dummyInput = document.createElement("textarea");
      document.body.appendChild(dummyInput);
      dummyInput.value = hwidText;
      dummyInput.select();
      document.execCommand("copy");
      document.body.removeChild(dummyInput);

      showToast("HWID Client berhasil disalin ke Clipboard!");
    });
  }

  // ASYNC LIVE CLAIM LICENSING VIA K2C UNIVERSAL LICENSE HUB
  if (licenseForm) {
    licenseForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const serialKeyInput = document.getElementById("serialKeyInput");
      const submitBtn = licenseForm.querySelector("button[type='submit']");
      const serialKey = serialKeyInput.value;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Memverifikasi ke K2C Hub...";
      }

      const res = await CONFIG.claimLicenseRemote(serialKey);

      if (res.success) {
        updateLicenseUI();
        disableOperationalActions(false);
        showToast(res.message || "✓ Serial Key Berhasil Diklaim & Diaktifkan!");
      } else {
        showToast(res.message || "✕ Gagal Memverifikasi Serial Key!");
      }

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = "Aktivasi Lisensi Resmi";
      }
    });
  }

  if (resetLicenseBtn) {
    resetLicenseBtn.addEventListener("click", () => {
      localStorage.removeItem("wo_license_serial");
      localStorage.removeItem("wo_license_activation_date");
      localStorage.removeItem("wo_license_duration_days");
      localStorage.removeItem("wo_license_expires_at");
      document.getElementById("serialKeyInput").value = "";
      updateLicenseUI();
      checkLicenseGuardOnLoad();
      showToast("Lisensi di-reset ke Mode Trial!");
    });
  }
}

function updateLicenseUI() {
  const hwidDisplay = document.getElementById("hwidDisplay");
  const licenseBadge = document.getElementById("licenseBadge");
  const licenseStatusText = document.getElementById("licenseStatusText");
  const serialKeyInput = document.getElementById("serialKeyInput");

  if (hwidDisplay) hwidDisplay.innerText = CONFIG.getHWID();

  const lic = CONFIG.checkLicenseStatus();

  if (serialKeyInput) serialKeyInput.value = CONFIG.getLicenseSerial();

  if (licenseBadge && licenseStatusText) {
    if (lic.status === "LICENSED") {
      if (lic.type === "LIFETIME") {
        licenseBadge.innerText = "VERIFIED PREMIUM";
        licenseBadge.className = "px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
        licenseStatusText.innerText = "✓ Lisensi Resmi Aktif (Lifetime Verified by K2C License Hub)";
        licenseStatusText.className = "text-xs font-bold text-emerald-300";
      } else {
        licenseBadge.innerText = `ACTIVE (${lic.daysLeft} HARI)`;
        licenseBadge.className = "px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
        licenseStatusText.innerText = `✓ Lisensi Resmi Aktif: Sisa Masa Aktif ${lic.daysLeft} Hari Lagi (Verified by K2C Hub).`;
        licenseStatusText.className = "text-xs font-bold text-emerald-300";
      }
    } else if (lic.status === "TRIAL") {
      licenseBadge.innerText = `TRIAL (${lic.daysLeft} HARI)`;
      licenseBadge.className = "px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border bg-amber-500/20 text-amber-300 border-amber-500/40";
      licenseStatusText.innerText = `⏳ Masa Trial Aktif: Sisa ${lic.daysLeft} Hari lagi. Silakan beli Serial Key resmi K2C sebelum habis.`;
      licenseStatusText.className = "text-xs font-bold text-amber-300";
    } else {
      licenseBadge.innerText = "EXPIRED";
      licenseBadge.className = "px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border bg-rose-500/20 text-rose-300 border-rose-500/40";
      licenseStatusText.innerText = "✕ Masa Trial / Lisensi Telah Habis! Aplikasi Terkunci.";
      licenseStatusText.className = "text-xs font-bold text-rose-400";
    }
  }
}

function setupFiltersAndSearch() {
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");
  const refreshBtn = document.getElementById("refreshDataBtn");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const val = searchInput.value.toLowerCase();
      const filtered = allBookingsData.filter(b => b.clientName.toLowerCase().includes(val) || b.id.toLowerCase().includes(val));
      renderBookingsTable(filtered);
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", () => {
      const val = statusFilter.value;
      const filtered = val === "ALL" ? allBookingsData : allBookingsData.filter(b => b.paymentStatus === val);
      renderBookingsTable(filtered);
    });
  }

  if (refreshBtn) refreshBtn.addEventListener("click", loadAdminData);
}
