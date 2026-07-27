/**
 * AURA ELEGANCE - ADMIN DASHBOARD LOGIC
 */

let allBookingsData = [];

// SAMPLE FALLBACK DATA ADMIN (JIKA OFFLINE)
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
  },
  {
    id: "WO-412563",
    clientName: "Siti & Budi",
    phone: "085712345678",
    eventDate: "2026-09-15",
    location: "Gedung Balai Kartini, Jakarta",
    packageSelected: "Luxury Rose Gold Stage & Decor",
    totalEstimate: 28000000,
    paymentStatus: "Pending",
    submittedAt: "2026-07-25T14:30:00.000Z"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  setupPasscodeAuth();
  setupFiltersAndSearch();
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

  // Auto-login if session exists
  if (sessionStorage.getItem("wo_admin_authenticated") === "true") {
    passcodeModal.classList.add("hidden");
    dashboardContent.classList.remove("hidden");
    loadAdminData();
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
 * FETCH BOOKINGS FROM GAS API
 */
async function loadAdminData() {
  const tableBody = document.getElementById("bookingsTableBody");
  if (!tableBody) return;

  tableBody.innerHTML = `
    <tr>
      <td colspan="8" class="py-8 text-center text-slate-400">
        <i data-lucide="loader-2" class="w-6 h-6 animate-spin mx-auto mb-2 text-[#B76E79]"></i>
        <span>Memuat data booking klien...</span>
      </td>
    </tr>
  `;
  lucide.createIcons();

  try {
    const res = await fetch(`${CONFIG.GAS_API_URL}?action=getBookings&passcode=${CONFIG.ADMIN_PASSCODE}`);
    const result = await res.json();

    if (result.success && Array.isArray(result.data)) {
      allBookingsData = result.data;
    } else {
      allBookingsData = MOCK_ADMIN_BOOKINGS;
    }
  } catch (err) {
    console.warn("API Admin Offline, memuat mock data:", err);
    allBookingsData = MOCK_ADMIN_BOOKINGS;
  }

  updateStatsSummary(allBookingsData);
  renderBookingsTable(allBookingsData);
}

/**
 * UPDATE STATS SUMMARY CARDS
 */
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

/**
 * RENDER BOOKINGS TABLE
 */
function renderBookingsTable(data) {
  const tableBody = document.getElementById("bookingsTableBody");
  if (!tableBody) return;

  if (data.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="py-8 text-center text-slate-500">
          Tidak ada data booking klien yang ditemukan.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = data.map(item => {
    let statusBadgeClass = "bg-amber-500/20 text-amber-300 border-amber-500/30";
    if (item.paymentStatus === "DP") statusBadgeClass = "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
    if (item.paymentStatus === "Lunas") statusBadgeClass = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";

    const cleanPhone = item.phone ? item.phone.replace(/[^0-9]/g, "") : "";
    const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=Halo%20Kak%20${encodeURIComponent(item.clientName)},%20kami%20dari%20Aura%20Elegance%20WO` : "#";

    return `
      <tr class="hover:bg-[#1A0F12]/50 transition-colors">
        <td class="py-4 px-6 font-mono text-[11px]">
          <span class="text-[#F7E7CE] font-bold block">${item.id}</span>
          <span class="text-[10px] text-slate-500">${item.submittedAt ? new Date(item.submittedAt).toLocaleDateString("id-ID") : "-"}</span>
        </td>
        <td class="py-4 px-6 font-semibold text-slate-200">${item.clientName}</td>
        <td class="py-4 px-6">
          <a href="${waUrl}" target="_blank" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/50 font-mono text-[11px] transition-all">
            <i data-lucide="message-square" class="w-3 h-3"></i>
            <span>${item.phone}</span>
          </a>
        </td>
        <td class="py-4 px-6">
          <span class="text-[#F7E7CE] font-semibold block">${item.eventDate}</span>
          <span class="text-[11px] text-slate-400 truncate max-w-[150px] block" title="${item.location}">${item.location}</span>
        </td>
        <td class="py-4 px-6 text-slate-300">${item.packageSelected}</td>
        <td class="py-4 px-6 font-mono font-bold text-gradient-rose">Rp ${item.totalEstimate ? item.totalEstimate.toLocaleString("id-ID") : 0}</td>
        <td class="py-4 px-6">
          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statusBadgeClass}">
            ${item.paymentStatus}
          </span>
        </td>
        <td class="py-4 px-6 text-center">
          <select onchange="updateStatus('${item.id}', this.value)" class="bg-[#120A0C] border border-[#B76E79]/40 rounded-lg px-2 py-1 text-[11px] text-slate-200 focus:outline-none">
            <option value="Pending" ${item.paymentStatus === "Pending" ? "selected" : ""}>Set Pending</option>
            <option value="DP" ${item.paymentStatus === "DP" ? "selected" : ""}>Set DP</option>
            <option value="Lunas" ${item.paymentStatus === "Lunas" ? "selected" : ""}>Set Lunas</option>
          </select>
        </td>
      </tr>
    `;
  }).join("");

  lucide.createIcons();
}

/**
 * UPDATE PAYMENT STATUS API CALL
 */
async function updateStatus(bookingId, newStatus) {
  try {
    const payload = {
      action: "updatePaymentStatus",
      passcode: CONFIG.ADMIN_PASSCODE,
      bookingId: bookingId,
      newStatus: newStatus
    };

    const res = await fetch(CONFIG.GAS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    const result = await res.json();

    if (result.success) {
      // Update local state
      const target = allBookingsData.find(b => b.id === bookingId);
      if (target) target.paymentStatus = newStatus;
      updateStatsSummary(allBookingsData);
      renderBookingsTable(allBookingsData);
    } else {
      alert(result.message || "Gagal memperbarui status!");
    }
  } catch (err) {
    // Fallback update local state
    const target = allBookingsData.find(b => b.id === bookingId);
    if (target) target.paymentStatus = newStatus;
    updateStatsSummary(allBookingsData);
    renderBookingsTable(allBookingsData);
  }
}

/**
 * SEARCH AND FILTER HANDLERS
 */
function setupFiltersAndSearch() {
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");
  const refreshBtn = document.getElementById("refreshDataBtn");

  function applyFilters() {
    const searchVal = searchInput ? searchInput.value.toLowerCase() : "";
    const statusVal = statusFilter ? statusFilter.value : "ALL";

    const filtered = allBookingsData.filter(item => {
      const matchSearch = item.clientName.toLowerCase().includes(searchVal) || item.id.toLowerCase().includes(searchVal);
      const matchStatus = statusVal === "ALL" || item.paymentStatus === statusVal;
      return matchSearch && matchStatus;
    });

    renderBookingsTable(filtered);
  }

  if (searchInput) searchInput.addEventListener("input", applyFilters);
  if (statusFilter) statusFilter.addEventListener("change", applyFilters);
  if (refreshBtn) refreshBtn.addEventListener("click", loadAdminData);
}
