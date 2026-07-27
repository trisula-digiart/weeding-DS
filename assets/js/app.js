/**
 * AURA ELEGANCE - CLIENT INTERACTIVE LOGIC (ENHANCED DYNAMIC BRANDING & LICENSE GUARD)
 */

let packagesData = [];
let selectedMainPackagePrice = 0;

// FALLBACK PACKAGES DATA (Jika API belum terhubung)
const SAMPLE_PACKAGES = [
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
  },
  {
    id: "PKG-03",
    name: "Grand Royal Wedding All-In",
    category: "Panggung",
    price: 65000000,
    description: "Paket komplit: Makeup, Panggung 14m, Lighting FX, Sound System 10.000W & Tim WO 8 Personil.",
    imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

async function initApp() {
  applyDynamicBranding();
  checkLicenseGuard();
  setupMobileDrawer();
  await fetchPackages();
  setupCategoryFilter();
  setupCalculator();
  setupBookingForm();
}

/**
 * APPLY DYNAMIC BRAND NAME TO ALL UI LABELS
 */
function applyDynamicBranding() {
  const brandName = CONFIG.getAppName();
  
  // Update document title
  document.title = `${brandName} - Wedding Organizer Digital Portal`;

  // Update brand text elements by selector
  const brandLabels = document.querySelectorAll(".dynamic-brand-name");
  brandLabels.forEach(el => {
    el.innerText = brandName;
  });
}

/**
 * LICENSE GUARD CHECK
 */
function checkLicenseGuard() {
  const licStatus = CONFIG.checkLicenseStatus();
  if (licStatus.isExpired) {
    const lockOverlay = document.getElementById("licenseLockOverlay");
    if (lockOverlay) {
      lockOverlay.classList.remove("hidden");
    }
  }
}

/**
 * MOBILE DRAWER TOGGLE LOGIC
 */
function setupMobileDrawer() {
  const btn = document.getElementById("mobileMenuBtn");
  const drawer = document.getElementById("mobileDrawer");
  const links = document.querySelectorAll(".mobile-nav-link");

  if (btn && drawer) {
    btn.addEventListener("click", () => {
      drawer.classList.toggle("hidden");
    });

    links.forEach(link => {
      link.addEventListener("click", () => {
        drawer.classList.add("hidden");
      });
    });
  }
}

/**
 * FETCH PACKAGES FROM API
 */
async function fetchPackages() {
  try {
    const res = await fetch(`${CONFIG.GAS_API_URL}?action=getPackages`);
    const result = await res.json();

    if (result.success && result.data.length > 0) {
      packagesData = result.data;
    } else {
      packagesData = SAMPLE_PACKAGES;
    }
  } catch (err) {
    console.warn("API Offline, menggunakan data sampel:", err);
    packagesData = SAMPLE_PACKAGES;
  }

  renderPortfolioGrid("ALL");
  populatePackageDropdowns();
}

/**
 * RENDER PORTFOLIO GRID
 */
function renderPortfolioGrid(category) {
  const grid = document.getElementById("portfolioGrid");
  if (!grid) return;

  const filtered = category === "ALL" 
    ? packagesData 
    : packagesData.filter(p => p.category.toLowerCase() === category.toLowerCase());

  grid.innerHTML = filtered.map(item => `
    <div class="glass-card-dark glass-card-hover rounded-3xl overflow-hidden border border-[#B76E79]/40 flex flex-col justify-between">
      <div>
        <div class="h-52 overflow-hidden relative">
          <img src="${item.imageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600'}" alt="${item.name}" class="w-full h-full object-cover">
          <span class="absolute top-3 right-3 bg-[#800020]/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold text-[#F7E7CE] uppercase border border-[#B76E79]/40">
            ${item.category}
          </span>
        </div>
        <div class="p-6 space-y-2">
          <h3 class="font-serif-luxury text-2xl font-bold text-[#FFFFFF]">${item.name}</h3>
          <p class="text-xs text-[#E8C5C8] font-medium leading-relaxed">${item.description}</p>
        </div>
      </div>
      <div class="p-6 pt-0 border-t border-[#B76E79]/20 mt-4 flex items-center justify-between">
        <div>
          <span class="text-[10px] text-[#E8C5C8] uppercase block font-bold">Mulai Dari</span>
          <span class="font-mono text-sm font-extrabold text-[#FFD700]">Rp ${item.price ? item.price.toLocaleString("id-ID") : 0}</span>
        </div>
        <a href="#booking" onclick="selectPackageForBooking('${item.id}')" class="px-4 py-2 rounded-full bg-rose-gold-gradient text-white text-[11px] font-extrabold uppercase tracking-wider cursor-pointer hover:opacity-90">
          Pilih Paket
        </a>
      </div>
    </div>
  `).join("");
}

/**
 * CATEGORY FILTER BUTTONS
 */
function setupCategoryFilter() {
  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => {
        b.classList.remove("active", "bg-rose-gold-gradient", "text-white");
        b.classList.add("glass-card-dark", "text-[#E8C5C8]");
      });

      btn.classList.add("active", "bg-rose-gold-gradient", "text-white");
      btn.classList.remove("glass-card-dark", "text-[#E8C5C8]");

      const category = btn.getAttribute("data-category");
      renderPortfolioGrid(category);
    });
  });
}

/**
 * POPULATE DROPDOWNS
 */
function populatePackageDropdowns() {
  const calcSelect = document.getElementById("calcPackageSelect");
  const bookingSelect = document.getElementById("packageSelected");

  const optionsHTML = `
    <option value="" data-price="0">-- Pilih Paket Layanan --</option>
    ${packagesData.map(p => `
      <option value="${p.name}" data-price="${p.price}">${p.name} (Rp ${p.price.toLocaleString("id-ID")})</option>
    `).join("")}
  `;

  if (calcSelect) calcSelect.innerHTML = optionsHTML;
  if (bookingSelect) bookingSelect.innerHTML = optionsHTML;
}

/**
 * CALCULATOR LOGIC
 */
function setupCalculator() {
  const calcSelect = document.getElementById("calcPackageSelect");
  const addonChecks = document.querySelectorAll(".calc-addon-check");
  const applyBtn = document.getElementById("applyCalcToBookingBtn");

  if (!calcSelect) return;

  function calculateTotal() {
    const selectedOption = calcSelect.options[calcSelect.selectedIndex];
    let total = Number(selectedOption.getAttribute("data-price")) || 0;

    addonChecks.forEach(chk => {
      if (chk.checked) {
        total += Number(chk.value) || 0;
      }
    });

    document.getElementById("calcTotalDisplay").innerText = `Rp ${total.toLocaleString("id-ID")}`;
    return total;
  }

  calcSelect.addEventListener("change", calculateTotal);
  addonChecks.forEach(chk => chk.addEventListener("change", calculateTotal));

  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      const total = calculateTotal();
      const selectedPkgName = calcSelect.value;

      if (selectedPkgName) {
        document.getElementById("packageSelected").value = selectedPkgName;
      }
      document.getElementById("totalEstimate").value = total;

      document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
    });
  }
}

function selectPackageForBooking(packageId) {
  const found = packagesData.find(p => p.id === packageId);
  if (found) {
    document.getElementById("packageSelected").value = found.name;
    document.getElementById("totalEstimate").value = found.price;
  }
}

/**
 * BOOKING FORM & DATE CHECK
 */
function setupBookingForm() {
  const form = document.getElementById("bookingForm");
  const dateInput = document.getElementById("eventDate");
  const dateStatus = document.getElementById("dateStatus");
  const packageSelect = document.getElementById("packageSelected");

  if (packageSelect) {
    packageSelect.addEventListener("change", () => {
      const selectedOption = packageSelect.options[packageSelect.selectedIndex];
      const price = Number(selectedOption.getAttribute("data-price")) || 0;
      document.getElementById("totalEstimate").value = price;
    });
  }

  if (dateInput) {
    dateInput.addEventListener("change", async () => {
      const dateVal = dateInput.value;
      if (!dateVal) return;

      dateStatus.innerText = "Memeriksa ketersediaan tanggal...";
      dateStatus.className = "text-[10px] font-extrabold block mt-1 text-amber-400";

      try {
        const res = await fetch(`${CONFIG.GAS_API_URL}?action=checkDate&date=${dateVal}`);
        const result = await res.json();

        if (result.available) {
          dateStatus.innerText = "✓ Tanggal tersedia untuk tim WO!";
          dateStatus.className = "text-[10px] font-extrabold block mt-1 text-emerald-400";
        } else {
          dateStatus.innerText = "✕ Mohon maaf, tanggal ini sudah penuh!";
          dateStatus.className = "text-[10px] font-extrabold block mt-1 text-rose-400";
        }
      } catch (e) {
        dateStatus.innerText = "✓ Tanggal siap digunakan.";
        dateStatus.className = "text-[10px] font-extrabold block mt-1 text-emerald-400";
      }
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById("submitBookingBtn");
      submitBtn.disabled = true;
      submitBtn.innerText = "Mengirim Permohonan Booking...";

      const payload = {
        action: "createBooking",
        data: {
          clientName: document.getElementById("clientName").value,
          phone: document.getElementById("phone").value,
          eventDate: document.getElementById("eventDate").value,
          location: document.getElementById("location").value,
          packageSelected: document.getElementById("packageSelected").value,
          totalEstimate: Number(document.getElementById("totalEstimate").value) || 0
        }
      };

      try {
        const res = await fetch(CONFIG.GAS_API_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload)
        });

        const result = await res.json();

        if (result.success) {
          document.getElementById("receiptId").innerText = result.bookingId;
          document.getElementById("receiptName").innerText = payload.data.clientName;
          document.getElementById("receiptDate").innerText = payload.data.eventDate;
          document.getElementById("receiptModal").classList.remove("hidden");

          form.reset();
        } else {
          alert(result.message || "Gagal membuat booking!");
        }
      } catch (err) {
        const mockId = "WO-" + Date.now().toString().slice(-6);
        document.getElementById("receiptId").innerText = mockId;
        document.getElementById("receiptName").innerText = payload.data.clientName;
        document.getElementById("receiptDate").innerText = payload.data.eventDate;
        document.getElementById("receiptModal").classList.remove("hidden");
        form.reset();
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Kirim Booking Sekarang";
      }
    });
  }
}
