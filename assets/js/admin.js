/**
 * AURA ELEGANCE - ADMIN DASHBOARD LOGIC (CRUD ENHANCED)
 */

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
    name: "Royal Diamond Makeup & Attire",
    category: "Makeup",
    price: 15000000,
    description: "Makeup pengantin premium, melati asli, busana akad & resepsi (3x retouch).",
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600"
  },
  {
    id: "PKG-02",
    name: "Luxury Rose Gold Stage & Decor",
    category: "Dekorasi",
    price: 28000000,
    description: "Panggung 12m, fresh flowers impor, photobooth eksklusif, gate lorong lampu.",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  setupPasscodeAuth();
  setupTabNavigation();
  setupFiltersAndSearch();
  setupPackageForm();
});

/**
 * PASSCODE AUTHENTICATION
 */
function setupPasscodeAuth() {
  const form = document.getElementById("passcodeForm");
  const passcodeModal = document.getElementById("passcodeModal");
  const dashboardContent = document.getElementById("dashboardContent");
  const passcodeError = document.getElementById("passcodeError");
  const logoutBtn = document.getElementById("logoutBtn");

  if (sessionStorage.getItem("wo_admin_authenticated") === "true") {
    passcodeModal.classList.add("hidden");
    dashboardContent.classList.remove("hidden");
    loadAdminData();
    loadPackagesData();
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const enteredPasscode = document.getElementById("adminPasscode").value;

      if (enteredPasscode === CONFIG.ADMIN_PASSCODE) {
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

/**
 * TAB NAVIGATION LOGIC
 */
function setupTabNavigation() {
  const tabBookingsBtn = document.getElementById("tabBookingsBtn");
  const tabPackagesBtn = document.getElementById("tabPackagesBtn");
  const viewBookings = document.getElementById("viewBookings");
  const viewPackages = document.getElementById("viewPackages");

  if (tabBookingsBtn && tabPackagesBtn) {
    tabBookingsBtn.addEventListener("click", () => {
      tabBookingsBtn.className = "py-4 px-4 text-xs font-bold uppercase tracking-wider border-b-2 border-[#B76E79] text-[#F7E7CE] flex items-center gap-2";
      tabPackagesBtn.className = "py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 flex items-center gap-2";
      viewBookings.classList.remove("hidden");
      viewPackages.classList.add("hidden");
    });

    tabPackagesBtn.addEventListener("click", () => {
      tabPackagesBtn.className = "py-4 px-4 text-xs font-bold uppercase tracking-wider border-b-2 border-[#B76E79] text-[#F7E7CE] flex items-center gap-2";
      tabBookingsBtn.className = "py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 flex items-center gap-2";
      viewPackages.classList.remove("hidden");
      viewBookings.classList.add("hidden");
    });
  }
}

/**
 * FETCH BOOKINGS
 */
async function loadAdminData() {
  const tableBody = document.getElementById("bookingsTableBody");
  if (!tableBody) return;

  try {
    const res = await fetch(`${CONFIG.GAS_API_URL}?action=getBookings&passcode=${CONFIG.ADMIN_PASSCODE}`);
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
    tableBody.innerHTML = `<tr><td colspan="8" class="py-8 text-center text-slate-500">Tidak ada data booking.</td></tr>`;
    return;
  }

  tableBody.innerHTML = data.map(item => {
    let statusBadgeClass = "bg-amber-500/20 text-amber-300 border-amber-500/30";
    if (item.paymentStatus === "DP") statusBadgeClass = "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
    if (item.paymentStatus === "Lunas") statusBadgeClass = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";

    const cleanPhone = item.phone ? item.phone.replace(/[^0-9]/g, "") : "";
    const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : "#";

    return `
      <tr class="hover:bg-[#1A0F12]/50 transition-colors">
        <td class="py-4 px-6 font-mono text-[11px]"><span class="text-[#F7E7CE] font-bold block">${item.id}</span></td>
        <td class="py-4 px-6 font-semibold text-slate-200">${item.clientName}</td>
        <td class="py-4 px-6">
          <a href="${waUrl}" target="_blank" class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 text-[11px]">
            <i data-lucide="message-square" class="w-3 h-3"></i><span>${item.phone}</span>
          </a>
        </td>
        <td class="py-4 px-6"><span class="text-[#F7E7CE] font-semibold block">${item.eventDate}</span><span class="text-[11px] text-slate-400">${item.location}</span></td>
        <td class="py-4 px-6 text-slate-300">${item.packageSelected}</td>
        <td class="py-4 px-6 font-mono font-bold text-gradient-rose">Rp ${item.totalEstimate ? item.totalEstimate.toLocaleString("id-ID") : 0}</td>
        <td class="py-4 px-6"><span class="px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${statusBadgeClass}">${item.paymentStatus}</span></td>
        <td class="py-4 px-6 text-center">
          <select onchange="updateStatus('${item.id}', this.value)" class="bg-[#120A0C] border border-[#B76E79]/40 rounded-lg px-2 py-1 text-[11px] text-slate-200 focus:outline-none">
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

async function updateStatus(bookingId, newStatus) {
  try {
    const payload = {
      action: "updatePaymentStatus",
      passcode: CONFIG.ADMIN_PASSCODE,
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
  } catch (err) {
    const target = allBookingsData.find(b => b.id === bookingId);
    if (target) target.paymentStatus = newStatus;
    updateStatsSummary(allBookingsData);
    renderBookingsTable(allBookingsData);
  }
}

/**
 * FETCH & RENDER PACKAGES (CRUD FITUR BARU)
 */
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
    tableBody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-500">Belum ada paket. Klik "Tambah Paket Baru".</td></tr>`;
    return;
  }

  tableBody.innerHTML = data.map(item => `
    <tr class="hover:bg-[#1A0F12]/50 transition-colors">
      <td class="py-4 px-6 font-mono font-bold text-[#F7E7CE] text-[11px]">${item.id}</td>
      <td class="py-4 px-6 font-bold text-slate-200">${item.name}</td>
      <td class="py-4 px-6"><span class="px-2.5 py-1 rounded-full text-[10px] bg-[#800020]/40 border border-[#B76E79]/30 text-[#F7E7CE] uppercase font-bold">${item.category}</span></td>
      <td class="py-4 px-6 font-mono font-bold text-gradient-rose">Rp ${item.price ? item.price.toLocaleString("id-ID") : 0}</td>
      <td class="py-4 px-6 text-slate-400 truncate max-w-xs">${item.description}</td>
      <td class="py-4 px-6 text-center space-x-2">
        <button onclick="editPackage('${item.id}')" class="px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold hover:bg-amber-500/40">
          Edit
        </button>
        <button onclick="deletePackage('${item.id}')" class="px-3 py-1 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[11px] font-bold hover:bg-rose-500/40">
          Hapus
        </button>
      </td>
    </tr>
  `).join("");

  lucide.createIcons();
}

/**
 * PACKAGE FORM HANDLERS (SAVE & DELETE)
 */
function setupPackageForm() {
  const addNewBtn = document.getElementById("addNewPackageBtn");
  const form = document.getElementById("packageForm");

  if (addNewBtn) {
    addNewBtn.addEventListener("click", () => {
      document.getElementById("modalPackageTitle").innerText = "Tambah Paket Baru";
      form.reset();
      document.getElementById("pkgId").value = "";
      document.getElementById("packageModal").classList.remove("hidden");
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
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
          passcode: CONFIG.ADMIN_PASSCODE,
          data: pkgData
        };

        const res = await fetch(CONFIG.GAS_API_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload)
        });

        const result = await res.json();
        alert(result.message || "Berhasil disimpan!");

        closePackageModal();
        loadPackagesData();
      } catch (err) {
        alert("Gagal menyimpan paket ke server Google Sheets.");
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

function editPackage(id) {
  const item = allPackagesData.find(p => p.id === id);
  if (!item) return;

  document.getElementById("modalPackageTitle").innerText = "Edit Paket Layanan";
  document.getElementById("pkgId").value = item.id;
  document.getElementById("pkgName").value = item.name;
  document.getElementById("pkgCategory").value = item.category;
  document.getElementById("pkgPrice").value = item.price;
  document.getElementById("pkgImageUrl").value = item.imageUrl || "";
  document.getElementById("pkgDescription").value = item.description || "";

  document.getElementById("packageModal").classList.remove("hidden");
}

async function deletePackage(id) {
  if (!confirm(`Apakah Anda yakin ingin menghapus paket ID: ${id}?`)) return;

  try {
    const payload = {
      action: "deletePackage",
      passcode: CONFIG.ADMIN_PASSCODE,
      packageId: id
    };

    const res = await fetch(CONFIG.GAS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    alert(result.message || "Berhasil dihapus!");
    loadPackagesData();
  } catch (err) {
    alert("Gagal menghapus paket.");
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
