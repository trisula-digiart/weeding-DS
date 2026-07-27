let allBookingsData = [];
let allPackagesData = [];
let allInventoryData = [];

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
    description: "Makeup pengantin premium, melati asli, & retouch 3x",
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600",
    itemComposition: "INV-004"
  },
  {
    id: "PKG-02",
    name: "Luxury Rose Gold Decor",
    category: "Dekorasi",
    price: 25000000,
    description: "Panggung 12m, Fresh Flowers, Photobooth & Gate",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600",
    itemComposition: "INV-001,INV-005"
  }
];

const MOCK_ADMIN_INVENTORY = [
  { id: "INV-001", jenis: "Aksesoris", namaItem: "Panggung Utama 4x2m", spesifikasi: "Modul panggung karpet merah tinggi 50cm", hargaSewaUnit: 750000, imageUrl: "" },
  { id: "INV-002", jenis: "Aksesoris", namaItem: "Tenda Semi Dekorasi", spesifikasi: "Ukuran per lokal 3x6m termasuk kain plafon", hargaSewaUnit: 1200000, imageUrl: "" },
  { id: "INV-003", jenis: "Aksesoris", namaItem: "Kursi Futura + Cover", spesifikasi: "Kursi futura besi lapis cover putih & pita", hargaSewaUnit: 15000, imageUrl: "" },
  { id: "INV-004", jenis: "Makeup", namaItem: "Makeup Pengantin Akad & Resepsi", spesifikasi: "Pengantin Pria & Wanita (Free Melati Asli)", hargaSewaUnit: 3500000, imageUrl: "" },
  { id: "INV-005", jenis: "Dekorasi", namaItem: "Pelaminan Luxury Rose Gold 8m", spesifikasi: "Fresh Flowers, Standing Flowers & Lighting FX", hargaSewaUnit: 8500000, imageUrl: "" }
];

document.addEventListener("DOMContentLoaded", () => {
  applyDynamicBrandingAdmin();
  setupPasscodeAuth();
  setupTabNavigation();
  setupFiltersAndSearch();
  setupPackageForm();
  setupInventoryForm();
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
    loadInventoryData();
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
        loadInventoryData();
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
  const tabInventoryBtn = document.getElementById("tabInventoryBtn");
  const tabSettingsBtn = document.getElementById("tabSettingsBtn");

  const viewBookings = document.getElementById("viewBookings");
  const viewPackages = document.getElementById("viewPackages");
  const viewInventory = document.getElementById("viewInventory");
  const viewSettings = document.getElementById("viewSettings");

  function resetTabStyles() {
    const inactiveClass = "py-4 px-5 text-xs font-extrabold uppercase tracking-wider text-[#E8C5C8] hover:text-[#F7E7CE] flex items-center gap-2 cursor-pointer shrink-0";
    tabBookingsBtn.className = inactiveClass;
    tabPackagesBtn.className = inactiveClass;
    if (tabInventoryBtn) tabInventoryBtn.className = inactiveClass;
    tabSettingsBtn.className = inactiveClass;

    viewBookings.classList.add("hidden");
    viewPackages.classList.add("hidden");
    if (viewInventory) viewInventory.classList.add("hidden");
    viewSettings.classList.add("hidden");
  }

  function switchToSettingsTab() {
    resetTabStyles();
    tabSettingsBtn.className = "py-4 px-5 text-xs font-extrabold uppercase tracking-wider border-b-4 border-[#F7E7CE] text-[#F7E7CE] flex items-center gap-2 cursor-pointer shrink-0";
    viewSettings.classList.remove("hidden");
  }

  const activeTabClass = "py-4 px-5 text-xs font-extrabold uppercase tracking-wider border-b-4 border-[#F7E7CE] text-[#F7E7CE] flex items-center gap-2 cursor-pointer shrink-0";

  if (tabBookingsBtn && tabPackagesBtn && tabSettingsBtn) {
    tabBookingsBtn.addEventListener("click", () => {
      const lic = CONFIG.checkLicenseStatus();
      if (lic.isExpired) {
        showToast("🛑 Aplikasi Terkunci! Masa trial/lisensi telah habis. Harap aktivasi di Tab Pengaturan.");
        switchToSettingsTab();
        return;
      }
      resetTabStyles();
      tabBookingsBtn.className = activeTabClass;
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
      tabPackagesBtn.className = activeTabClass;
      viewPackages.classList.remove("hidden");
    });

    if (tabInventoryBtn) {
      tabInventoryBtn.addEventListener("click", () => {
        const lic = CONFIG.checkLicenseStatus();
        if (lic.isExpired) {
          showToast("🛑 Aplikasi Terkunci! Masa trial/lisensi telah habis. Harap aktivasi di Tab Pengaturan.");
          switchToSettingsTab();
          return;
        }
        resetTabStyles();
        tabInventoryBtn.className = activeTabClass;
        viewInventory.classList.remove("hidden");
      });
    }

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
  const addNewInventoryBtn = document.getElementById("addNewInventoryBtn");

  [addNewPackageBtn, addNewInventoryBtn].forEach(btn => {
    if (btn) {
      btn.disabled = disabled;
      if (disabled) {
        btn.classList.add("opacity-50", "cursor-not-allowed");
      } else {
        btn.classList.remove("opacity-50", "cursor-not-allowed");
      }
    }
  });
}

// ==========================================
// GOOGLE DRIVE DIRECT FILE UPLOADER ENGINE
// ==========================================

async function uploadFileToDrive(fileInput, statusElementId, targetUrlInputId) {
  const statusEl = document.getElementById(statusElementId);
  const targetUrlInput = document.getElementById(targetUrlInputId);

  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    if (statusEl) statusEl.innerText = "Pilih file gambar terlebih dahulu!";
    return null;
  }

  const file = fileInput.files[0];
  if (statusEl) statusEl.innerText = "⏳ Mengunggah ke Google Drive...";

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async function(e) {
      const rawBase64 = e.target.result.split(",")[1];
      const payload = {
        action: "uploadImage",
        fileName: file.name,
        mimeType: file.type,
        base64Data: rawBase64
      };

      try {
        const res = await fetch(CONFIG.GAS_API_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload)
        });

        const result = await res.json();
        if (result.success && result.imageUrl) {
          if (targetUrlInput) targetUrlInput.value = result.imageUrl;
          if (statusEl) {
            statusEl.innerText = "✓ Gambar Berhasil Disimpan Di Google Drive!";
            statusEl.className = "text-[10px] font-extrabold text-emerald-400 block";
          }
          showToast("✓ Foto berhasil di-upload ke Google Drive!");
          resolve(result.imageUrl);
        } else {
          if (statusEl) statusEl.innerText = "✕ Gagal upload file ke Drive.";
          showToast("Gagal upload file ke Drive");
          resolve(null);
        }
      } catch (err) {
        if (statusEl) statusEl.innerText = "✕ Error koneksi saat upload ke Drive.";
        showToast("Error koneksi upload gambar.");
        resolve(null);
      }
    };
    reader.readAsDataURL(file);
  });
}

window.uploadPackageImageToDrive = function() {
  const fileInput = document.getElementById("pkgImageFile");
  uploadFileToDrive(fileInput, "uploadPkgStatus", "pkgImageUrl");
};

window.uploadInventoryImageToDrive = function() {
  const fileInput = document.getElementById("invImageFile");
  uploadFileToDrive(fileInput, "uploadInvStatus", "invImageUrl");
};

// ==========================================
// BOOKINGS MANAGEMENT LOGIC
// ==========================================

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

window.updateStatus = async function(bookingId, newStatus) {
  try {
    const payload = {
      action: "updatePaymentStatus",
      passcode: CONFIG.getAdminPasscode(),
      bookingId: bookingId,
      newStatus: newStatus
    };

    await fetch(CONFIG.GAS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    const target = allBookingsData.find(b => b.id === bookingId);
    if (target) target.paymentStatus = newStatus;
    updateStatsSummary(allBookingsData);
    renderBookingsTable(allBookingsData);
    showToast(`Status booking ${bookingId} diperbarui!`);
  } catch (err) {
    const target = allBookingsData.find(b => b.id === bookingId);
    if (target) target.paymentStatus = newStatus;
    updateStatsSummary(allBookingsData);
    renderBookingsTable(allBookingsData);
  }
};

// ==========================================
// PACKAGES MANAGEMENT LOGIC & DETAIL MODAL
// ==========================================

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
        <button onclick="viewPackageDetail('${item.id}')" class="px-3 py-1.5 rounded-lg bg-rose-900/60 border border-[#B76E79] text-[#F7E7CE] text-[11px] font-extrabold hover:bg-[#800020] cursor-pointer">
          Detail
        </button>
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

window.viewPackageDetail = function(id) {
  const item = allPackagesData.find(p => p.id === id);
  if (!item) return;

  document.getElementById("detailPkgCategory").innerText = item.category || "PAKET";
  document.getElementById("detailPkgName").innerText = item.name;
  document.getElementById("detailPkgPrice").innerText = `Rp ${(item.price || 0).toLocaleString("id-ID")}`;
  document.getElementById("detailPkgDescription").innerText = item.description || "Tidak ada deskripsi rincian.";
  document.getElementById("detailPkgImage").src = item.imageUrl || "https://images.unsplash.com/photo-1519741497674-611481863552?w=600";

  // Build Item Composition Details
  const compositionContainer = document.getElementById("detailPkgCompositionList");
  if (compositionContainer) {
    const rawIds = (item.itemComposition || "").split(",").map(i => i.trim()).filter(Boolean);
    if (rawIds.length > 0) {
      const itemsMatched = allInventoryData.filter(inv => rawIds.includes(inv.id));
      compositionContainer.innerHTML = `<span class="text-[#F7E7CE] font-bold block mb-1">📦 Terdiri dari Item Master:</span>` +
        itemsMatched.map(m => `
          <div class="flex justify-between items-center bg-[#1A0D11] p-2 rounded-lg border border-[#B76E79]/20">
            <span>• ${m.namaItem} (${m.jenis})</span>
            <span class="font-mono text-[#FFD700]">Rp ${(m.hargaSewaUnit || 0).toLocaleString("id-ID")}</span>
          </div>
        `).join("");
    } else {
      compositionContainer.innerHTML = "";
    }
  }

  document.getElementById("packageDetailModal").classList.remove("hidden");
};

window.closePackageDetailModal = function() {
  document.getElementById("packageDetailModal").classList.add("hidden");
};

/**
 * POPULATE INVENTORY CHECKBOXES WITH REALTIME DYNAMIC PRICE RE-CALCULATION
 */
function populatePackageInventoryCheckboxes(selectedCompositionIds = "") {
  const container = document.getElementById("pkgInventorySelection");
  if (!container) return;

  if (allInventoryData.length === 0) {
    container.innerHTML = `<p class="text-[10px] text-[#E8C5C8] italic">Belum ada item di Master Inventaris. Tambahkan di Tab ke-3.</p>`;
    return;
  }

  const selectedSet = new Set(selectedCompositionIds.split(",").map(s => s.trim()).filter(Boolean));

  container.innerHTML = allInventoryData.map(item => {
    const isChecked = selectedSet.has(item.id) ? "checked" : "";
    return `
      <label class="flex items-center justify-between p-2 rounded-xl bg-[#1A0D11] border border-[#B76E79]/30 hover:border-[#B76E79] cursor-pointer text-xs">
        <div class="flex items-center gap-2">
          <input type="checkbox" value="${item.id}" data-price="${item.hargaSewaUnit || 0}" ${isChecked} class="pkg-inv-checkbox accent-[#B76E79] w-3.5 h-3.5">
          <span class="font-bold text-[#FFFFFF]">${item.namaItem} <span class="text-[9px] text-[#E8C5C8]">(${item.jenis})</span></span>
        </div>
        <span class="font-mono text-[11px] text-[#FFD700] font-extrabold">+Rp ${(item.hargaSewaUnit || 0).toLocaleString("id-ID")}</span>
      </label>
    `;
  }).join("");

  // Recalculates sum of all checked checkboxes
  function updateCombinedPrice() {
    const checkboxes = container.querySelectorAll(".pkg-inv-checkbox");
    let combinedPrice = 0;
    let checkedCount = 0;
    checkboxes.forEach(c => {
      if (c.checked) {
        combinedPrice += Number(c.getAttribute("data-price")) || 0;
        checkedCount++;
      }
    });

    if (checkedCount > 0) {
      document.getElementById("pkgPrice").value = combinedPrice;
    }
  }

  // Attach change listeners to every checkbox
  const checkboxes = container.querySelectorAll(".pkg-inv-checkbox");
  checkboxes.forEach(chk => {
    chk.addEventListener("change", updateCombinedPrice);
  });

  // Calculate price immediately upon loading modal
  updateCombinedPrice();
}

window.editPackage = function(id) {
  const lic = CONFIG.checkLicenseStatus();
  if (lic.isExpired) {
    showToast("🛑 Fitur Terkunci! Silakan aktifkan lisensi di Tab Pengaturan.");
    return;
  }

  const item = allPackagesData.find(p => p.id === id);
  if (!item) return;

  document.getElementById("modalPackageTitle").innerText = "Edit Paket Layanan";
  document.getElementById("pkgId").value = item.id;
  document.getElementById("pkgName").value = item.name;
  document.getElementById("pkgCategory").value = item.category || "Aksesoris";
  document.getElementById("pkgPrice").value = item.price;
  document.getElementById("pkgImageUrl").value = item.imageUrl || "";
  document.getElementById("pkgDescription").value = item.description || "";

  populatePackageInventoryCheckboxes(item.itemComposition || "");

  document.getElementById("packageModal").classList.remove("hidden");
};

window.deletePackage = async function(id) {
  const lic = CONFIG.checkLicenseStatus();
  if (lic.isExpired) {
    showToast("🛑 Fitur Terkunci! Silakan aktifkan lisensi di Tab Pengaturan.");
    return;
  }

  if (!confirm("Apakah Anda yakin ingin menghapus paket ini?")) return;

  try {
    const payload = {
      action: "deletePackage",
      passcode: CONFIG.getAdminPasscode(),
      packageId: id
    };

    const res = await fetch(CONFIG.GAS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    showToast(result.message || "Paket berhasil dihapus!");
    loadPackagesData();
  } catch (err) {
    allPackagesData = allPackagesData.filter(p => p.id !== id);
    renderPackagesTable(allPackagesData);
    showToast("Paket berhasil dihapus!");
  }
};

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
      document.getElementById("uploadPkgStatus").innerText = "";
      populatePackageInventoryCheckboxes("");
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

      // Get Selected Master Item IDs
      const checkedBoxes = document.querySelectorAll(".pkg-inv-checkbox:checked");
      const selectedItemIds = Array.from(checkedBoxes).map(cb => cb.value).join(",");

      const pkgData = {
        id: document.getElementById("pkgId").value,
        name: document.getElementById("pkgName").value,
        category: document.getElementById("pkgCategory").value,
        price: Number(document.getElementById("pkgPrice").value) || 0,
        imageUrl: document.getElementById("pkgImageUrl").value,
        description: document.getElementById("pkgDescription").value,
        itemComposition: selectedItemIds
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

window.closePackageModal = function() {
  document.getElementById("packageModal").classList.add("hidden");
};

// ==========================================
// INVENTORY MANAGEMENT LOGIC (AKSESORIS, MUA & DEKOR)
// ==========================================

async function loadInventoryData() {
  const tableBody = document.getElementById("inventoryTableBody");
  if (!tableBody) return;

  try {
    const res = await fetch(`${CONFIG.GAS_API_URL}?action=getInventoryItems`);
    const result = await res.json();

    if (result.success && Array.isArray(result.data)) {
      allInventoryData = result.data;
    } else {
      allInventoryData = MOCK_ADMIN_INVENTORY;
    }
  } catch (err) {
    allInventoryData = MOCK_ADMIN_INVENTORY;
  }

  renderInventoryTable(allInventoryData);
}

function renderInventoryTable(data) {
  const tableBody = document.getElementById("inventoryTableBody");
  if (!tableBody) return;

  if (data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-[#E8C5C8] font-extrabold">Belum ada item inventaris. Klik "Tambah Item Master".</td></tr>`;
    return;
  }

  const lic = CONFIG.checkLicenseStatus();
  const disabledAttr = lic.isExpired ? "disabled" : "";

  tableBody.innerHTML = data.map(item => `
    <tr class="hover:bg-[#280F16] transition-colors border-b border-[#B76E79]/20">
      <td class="py-4 px-6 font-mono font-extrabold text-xs" style="color: #FFD700 !important;">${item.id}</td>
      <td class="py-4 px-6"><span class="px-2.5 py-1 rounded-full text-[10px] bg-[#800020] border border-[#B76E79]/50 text-[#F7E7CE] uppercase font-extrabold">${item.jenis}</span></td>
      <td class="py-4 px-6 font-extrabold text-xs" style="color: #FFFFFF !important;">${item.namaItem}</td>
      <td class="py-4 px-6 font-medium text-xs" style="color: #E8C5C8 !important;">${item.spesifikasi}</td>
      <td class="py-4 px-6 font-mono font-extrabold text-xs" style="color: #F7E7CE !important;">Rp ${item.hargaSewaUnit ? item.hargaSewaUnit.toLocaleString("id-ID") : 0}</td>
      <td class="py-4 px-6 text-center space-x-2">
        <button ${disabledAttr} onclick="editInventoryItem('${item.id}')" class="px-3 py-1.5 rounded-lg bg-amber-500/30 border border-amber-400 text-amber-200 text-[11px] font-extrabold hover:bg-amber-500/50 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
          Edit
        </button>
        <button ${disabledAttr} onclick="deleteInventoryItem('${item.id}')" class="px-3 py-1.5 rounded-lg bg-rose-500/30 border border-rose-400 text-rose-200 text-[11px] font-extrabold hover:bg-rose-500/50 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
          Hapus
        </button>
      </td>
    </tr>
  `).join("");

  lucide.createIcons();
}

window.filterInventoryCategory = function(cat) {
  const buttons = document.querySelectorAll(".inv-filter-btn");
  buttons.forEach(b => {
    b.className = "inv-filter-btn px-4 py-2 rounded-full text-xs font-extrabold border glass-card-dark text-[#E8C5C8] hover:text-[#F7E7CE]";
  });

  if (cat === "ALL") {
    renderInventoryTable(allInventoryData);
  } else {
    const filtered = allInventoryData.filter(i => i.jenis.toLowerCase() === cat.toLowerCase());
    renderInventoryTable(filtered);
  }
};

window.editInventoryItem = function(id) {
  const lic = CONFIG.checkLicenseStatus();
  if (lic.isExpired) {
    showToast("🛑 Fitur Terkunci! Silakan aktifkan lisensi di Tab Pengaturan.");
    return;
  }

  const item = allInventoryData.find(i => i.id === id);
  if (!item) return;

  document.getElementById("modalInventoryTitle").innerText = "Edit Item Inventaris";
  document.getElementById("invId").value = item.id;
  document.getElementById("invJenis").value = item.jenis;
  document.getElementById("invHarga").value = item.hargaSewaUnit;
  document.getElementById("invNama").value = item.namaItem;
  document.getElementById("invSpesifikasi").value = item.spesifikasi;
  document.getElementById("invImageUrl").value = item.imageUrl || "";

  document.getElementById("inventoryModal").classList.remove("hidden");
};

window.deleteInventoryItem = async function(id) {
  const lic = CONFIG.checkLicenseStatus();
  if (lic.isExpired) {
    showToast("🛑 Fitur Terkunci! Silakan aktifkan lisensi di Tab Pengaturan.");
    return;
  }

  if (!confirm("Apakah Anda yakin ingin menghapus item inventaris ini?")) return;

  try {
    const payload = {
      action: "deleteInventoryItem",
      passcode: CONFIG.getAdminPasscode(),
      itemId: id
    };

    const res = await fetch(CONFIG.GAS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    showToast(result.message || "Item inventaris berhasil dihapus!");
    loadInventoryData();
  } catch (err) {
    allInventoryData = allInventoryData.filter(i => i.id !== id);
    renderInventoryTable(allInventoryData);
    showToast("Item inventaris berhasil dihapus!");
  }
};

function setupInventoryForm() {
  const addNewBtn = document.getElementById("addNewInventoryBtn");
  const form = document.getElementById("inventoryForm");

  if (addNewBtn) {
    addNewBtn.addEventListener("click", () => {
      const lic = CONFIG.checkLicenseStatus();
      if (lic.isExpired) {
        showToast("🛑 Fitur Terkunci! Silakan aktifkan lisensi di Tab Pengaturan.");
        return;
      }
      document.getElementById("modalInventoryTitle").innerText = "Tambah Item Master Inventaris";
      form.reset();
      document.getElementById("invId").value = "";
      document.getElementById("uploadInvStatus").innerText = "";
      document.getElementById("inventoryModal").classList.remove("hidden");
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

      const saveBtn = document.getElementById("saveInvBtn");
      saveBtn.disabled = true;
      saveBtn.innerText = "Menyimpan...";

      const invData = {
        id: document.getElementById("invId").value,
        jenis: document.getElementById("invJenis").value,
        hargaSewaUnit: Number(document.getElementById("invHarga").value) || 0,
        namaItem: document.getElementById("invNama").value,
        spesifikasi: document.getElementById("invSpesifikasi").value,
        imageUrl: document.getElementById("invImageUrl").value
      };

      try {
        const payload = {
          action: "saveInventoryItem",
          passcode: CONFIG.getAdminPasscode(),
          data: invData
        };

        const res = await fetch(CONFIG.GAS_API_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload)
        });

        const result = await res.json();
        showToast(result.message || "Item inventaris berhasil disimpan!");

        closeInventoryModal();
        loadInventoryData();
      } catch (err) {
        showToast("Gagal menyimpan item inventaris.");
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerText = "Simpan Item Inventaris";
      }
    });
  }
}

window.closeInventoryModal = function() {
  document.getElementById("inventoryModal").classList.add("hidden");
};

// ==========================================
// SETTINGS & LICENSE LOGIC
// ==========================================

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
