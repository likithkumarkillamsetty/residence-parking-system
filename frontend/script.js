// script.js — corrected and complete
// ===============================
// CONFIGURATION
// ===============================
const API_BASE_URL = "http://localhost:8080";
const USE_MOCK_DATA = false; // keep false to use your backend

// GLOBAL STATE
let currentView = "dashboard";
let parkingSlots = [];
let parkingAlerts = [];
let parkingOwners = [];
let parkingVehicles = [];

let _lastOCR = null; // stores last detected plate + raw text

// ===============================
// DOM ELEMENTS
// ===============================
const dom = {
    content: document.getElementById("content-area"),
    views: document.querySelectorAll(".view"),
    navItems: document.querySelectorAll(".nav-item"),
    pageTitle: document.getElementById("page-title"),
    slotsGrid: document.getElementById("slots-grid"),
    alertBadge: document.getElementById("alert-badge"),

    // OCR Elements
    ocrInput: document.getElementById("ocr-file-input"),
    previewContainer: document.getElementById("image-preview-container"),
    previewImage: document.getElementById("image-preview"),
    removeImageBtn: document.getElementById("remove-image-btn"),
    extractBtn: document.getElementById("extract-btn"),
    extractionResult: document.getElementById("extraction-result"),
    ocrEmptyState: document.getElementById("ocr-empty-state"),
    detectedPlate: document.getElementById("detected-plate"),
    targetSlotSelect: document.getElementById("target-slot-select"),
    finalizeBtn: document.getElementById("finalize-btn"),

    toastContainer: document.getElementById("toast-container"),

    stats: {
        total: document.getElementById("total-slots-count"),
        available: document.getElementById("available-slots-count"),
        alerts: document.getElementById("active-alerts-count"),
    },

    tables: {
        alertsBody: document.getElementById("alerts-table-body"),
        ownersBody: document.getElementById("owners-table-body"),
        vehiclesBody: document.getElementById("vehicles-table-body"),
    },
};

// ===============================
// INITIALIZATION
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initOCRHandlers();
    loadData();

    setInterval(() => {
        if (currentView === "slots" || currentView === "dashboard") fetchSlots(true);
        if (currentView === "alerts" || currentView === "dashboard") fetchAlerts(true);
        if (currentView === "owners") fetchOwners(true);
        if (currentView === "vehicles") fetchVehicles(true);
    }, 3000);

    showToast("System Initialized", "success");
});

// ===============================
// NAVIGATION
// ===============================
function initNavigation() {
    dom.navItems.forEach((item) => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            switchView(item.dataset.target);
        });
    });

    const refreshBtn = document.getElementById("refresh-btn");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
            showToast("Refreshing...", "success");
            loadData();
        });
    }
}

function switchView(view) {
    currentView = view;

    dom.navItems.forEach((n) => n.classList.remove("active"));
    const navItem = document.querySelector(`.nav-item[data-target="${view}"]`);
    if (navItem) navItem.classList.add("active");

    dom.views.forEach((v) => v.classList.remove("active-view"));
    const viewEl = document.getElementById(`view-${view}`);
    if (viewEl) viewEl.classList.add("active-view");

    const titles = {
        dashboard: "Dashboard",
        slots: "Live Parking Slots",
        ocr: "OCR Scanner",
        alerts: "Active Alerts",
        owners: "Resident Owners",
        vehicles: "Registered Vehicles",
    };
    dom.pageTitle.textContent = titles[view] || "Dashboard";

    // Load view-specific data
    if (view === "owners") fetchOwners();
    if (view === "vehicles") fetchVehicles();
    if (view === "alerts") fetchAlerts();
    if (view === "slots") fetchSlots();
}

// ===============================
// DATA LOADING
// ===============================
async function loadData() {
    // fetch everything needed by dashboard & UI
    await Promise.all([fetchSlots(), fetchAlerts(), fetchOwners(), fetchVehicles()]);
    updateDashboard();
}

// ===============================
// FETCH SLOTS
// ===============================
async function fetchSlots(silent = false) {
    try {
        if (USE_MOCK_DATA) {
            // generate sample slots
            if (!parkingSlots || parkingSlots.length === 0) parkingSlots = generateMockSlots(12);
        } else {
            const res = await fetch(`${API_BASE_URL}/api/slots`);
            if (!res.ok) throw new Error("slots fetch failed");
            parkingSlots = await res.json();
        }

        renderSlots();
        updateStats();
        populateSlotSelect();
    } catch (err) {
        console.error("fetchSlots:", err);
        if (!silent) showToast("Failed to load slots", "error");
    }
}

// ===============================
// FETCH ALERTS
// ===============================
async function fetchAlerts(silent = false) {
    try {
        if (USE_MOCK_DATA) {
            parkingAlerts = parkingSlots.filter((s) => s.state === "VIOLATION").map((s) => ({
                id: `mock-${s.slotId}`,
                slotId: s.slotId,
                expectedOwnerId: s.ownerId,
                wrongVehicleNumber: s.currentVehicle || "UNKNOWN",
                timestamp: new Date().toISOString(),
                imagePath: null,
            }));
        } else {
            const res = await fetch(`${API_BASE_URL}/api/alerts`);
            if (!res.ok) {
                // If no endpoint, fallback derive from slots
                console.warn("GET /api/alerts not available, deriving from slots");
                parkingAlerts = (parkingSlots || []).filter((s) => s.state === "VIOLATION").map((s) => ({
                    id: s.id || s.slotId,
                    slotId: s.slotId,
                    expectedOwnerId: s.ownerId,
                    wrongVehicleNumber: s.currentVehicle || "UNKNOWN",
                    timestamp: new Date().toISOString(),
                    imagePath: s.imagePath || null,
                }));
            } else {
                parkingAlerts = await res.json();
            }
        }

        renderAlerts();
        updateAlertBadge();
    } catch (err) {
        console.error("fetchAlerts:", err);
        if (!silent) showToast("Failed to load alerts", "error");
    }
}

// ===============================
// FETCH OWNERS
// ===============================
// async function fetchOwners(silent = false) {
//   try {
//     if (USE_MOCK_DATA) {
//       parkingOwners = [
//         { name: "John Doe", flatNumber: "A101", phone: "9876543210", vehicleNumbers: ["TS09AB1111"] },
//         { name: "Jane Smith", flatNumber: "A102", phone: "9988776655", vehicleNumbers: ["TS09AB2222", "KA01MN9999"] },
//       ];
//     } else {
//       const res = await fetch(`${API_BASE_URL}/api/owners`);
//       if (!res.ok) throw new Error("owners fetch failed");
//       parkingOwners = await res.json();
//     }

//     renderOwners();
//   } catch (err) {
//     console.error("fetchOwners:", err);
//     if (!silent) showToast("Failed to load owners", "error");
//   }
// }

// ===============================
// FETCH VEHICLES
// ===============================
// async function fetchVehicles(silent = false) {
//   try {
//     if (USE_MOCK_DATA) {
//       parkingVehicles = [
//         { numberPlate: "TS09AB1111", ownerId: "A101", model: "Sedan", color: "White" },
//         { numberPlate: "TS09AB2222", ownerId: "A102", model: "Hatch", color: "Black" },
//       ];
//     } else {
//       const res = await fetch(`${API_BASE_URL}/api/vehicles`);
//       if (!res.ok) throw new Error("vehicles fetch failed");
//       parkingVehicles = await res.json();
//     }

//     renderVehicles();
//   } catch (err) {
//     console.error("fetchVehicles:", err);
//     if (!silent) showToast("Failed to load vehicles", "error");
//   }
// }

// ===============================
// CLIENT OCR (TESSERACT)
// NOTE: Ensure Tesseract is loaded in HTML (CDN) for this to work.
// ===============================
async function runClientOCR(file) {
    showToast("Running OCR…", "success");

    try {
        const imageDataURL = await fileToDataURL(file);

        const result = await Tesseract.recognize(
            imageDataURL,
            "eng",
            {
                tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
            }
        );

        const raw = (result.data.text || "").replace(/\n/g, " ").trim();

        const plateRegex = /([A-Z]{2}\s?\d{1,2}\s?[A-Z]{1,2}\s?\d{4})/i;
        const match = raw.match(plateRegex);

        if (match) {
            return {
                numberPlate: match[1].replace(/\s+/g, "").toUpperCase(),
                rawText: raw
            };
        }

        return null;
    } catch (err) {
        console.error("runClientOCR:", err);
        return null;
    }
}


function fileToDataURL(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
    });
}

// ===============================
// OCR HANDLERS
// ===============================
function initOCRHandlers() {
    dom.ocrInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            dom.previewImage.src = ev.target.result;
            dom.previewContainer.classList.remove("hidden");
            dom.extractBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    });

    dom.removeImageBtn.addEventListener("click", resetOCR);

    dom.extractBtn.addEventListener("click", async () => {
        const file = dom.ocrInput.files[0];
        if (!file) return;

        let result = await runClientOCR(file);

        if (!result) {
            showToast("Could not detect — enter manually", "error");
            dom.detectedPlate.textContent = "UNKNOWN";
        } else {
            dom.detectedPlate.textContent = result.numberPlate || "UNKNOWN";
            if (result.lowConfidence) showToast("Low OCR confidence — please verify", "error");
        }

        dom.extractionResult.classList.remove("hidden");
        _lastOCR = result;
    });

    dom.detectedPlate.addEventListener("click", () => {
        const edited = prompt("Correct Plate Number:", dom.detectedPlate.textContent);
        if (edited) dom.detectedPlate.textContent = edited.toUpperCase();
    });

    dom.finalizeBtn.addEventListener("click", () => {
        finalizeParking(dom.targetSlotSelect.value, dom.detectedPlate.textContent);
    });
}

function resetOCR() {
    dom.ocrInput.value = "";
    dom.previewContainer.classList.add("hidden");
    dom.extractBtn.disabled = true;
    dom.extractionResult.classList.add("hidden");
}

// ===============================
// FINALIZE PARKING
// ===============================
async function finalizeParking(slotId, numberPlate) {
    if (!slotId) {
        showToast("Select a slot first", "error");
        return;
    }
    if (!numberPlate || numberPlate === "UNKNOWN") {
        showToast("Provide a plate number", "error");
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/api/slots/finalize?slotId=${encodeURIComponent(slotId)}&numberPlate=${encodeURIComponent(numberPlate)}`, {
            method: "POST",
        });

        const text = await res.text();
        if (!res.ok) {
            showToast(text || "Failed to finalize parking", "error");
        } else {
            showToast(text || "Parking finalized", "success");
            // refresh data
            await fetchSlots();
            await fetchAlerts();
            switchView("slots");
            resetOCR();
        }
    } catch (err) {
        console.error("finalizeParking:", err);
        showToast("Failed to finalize parking", "error");
    }
}

// ===============================
// RENDER FUNCTIONS
// ===============================
function renderSlots() {
    dom.slotsGrid.innerHTML = "";

    (parkingSlots || []).forEach((slot) => {
        const stateClass = (slot.state || "EMPTY").toLowerCase();
        const div = document.createElement("div");
        div.className = `slot-card ${stateClass}`;
        div.innerHTML = `
            <div class="slot-id">${slot.slotId || slot.id}</div>
            <div class="slot-info">Owner: <strong>${slot.ownerId || "N/A"}</strong></div>
            <div class="slot-info">Vehicle: <strong>${slot.currentVehicle || "None"}</strong></div>
        `;
        dom.slotsGrid.appendChild(div);
    });
}

function renderAlerts() {
    const body = dom.tables.alertsBody;
    body.innerHTML = "";


    (parkingAlerts || []).forEach((alert) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${alert.slotId}</td>
            <td>${alert.expectedOwnerId}</td>
            <td>${alert.wrongVehicleNumber}</td>
            <td>${alert.timestamp ? new Date(alert.timestamp).toLocaleString() : "—"}</td>
            <td>
                ${alert.imagePath
                ? `<img src="${API_BASE_URL}/files/${alert.imagePath}" style="width:80px; height:auto; border-radius:6px; cursor:pointer;" onclick="window.open('${API_BASE_URL}/files/${alert.imagePath}', '_blank')">`
                : "No Image"
            }
            </td>
            <td>
    ${alert.status === "PENDING" || !alert.status
                ? `
                <button class="btn success" onclick="acceptAlert('${alert.id || alert.slotId}')">Accept</button>
                <button class="btn danger" onclick="rejectAlert('${alert.id || alert.slotId}')">Reject</button>
              `
                : `<span style="font-weight:600; color:${alert.status === "RESOLVED" ? "green" : "red"}">
                 ${alert.status}
               </span>`
            }
</td>

        `;

        body.appendChild(tr);
    });

    // show empty message if no alerts
    const alertsEmpty = document.getElementById("alerts-empty");
    if (parkingAlerts && parkingAlerts.length > 0) {
        if (alertsEmpty) alertsEmpty.classList.add("hidden");
    } else {
        if (alertsEmpty) alertsEmpty.classList.remove("hidden");
    }
}

/* ---------- Robust Owners / Vehicles fetch + render ---------- */

async function fetchOwners() {
    try {
        console.log('[frontend] fetchOwners -> calling /api/owners');
        const res = await fetch(`${API_BASE_URL}/api/owners`);
        console.log('[frontend] fetchOwners status', res.status);

        // try to parse JSON, fallback to text for debugging
        const data = await res.json().catch(async (err) => {
            const txt = await res.text();
            console.error('[frontend] fetchOwners json parse failed, raw text:', txt);
            throw err;
        });

        // normalize: ensure array
        if (!Array.isArray(data)) {
            console.warn('[frontend] fetchOwners: payload not array - trying to normalize', data);
            // if API returned {owners: [...]}
            if (data && Array.isArray(data.owners)) {
                parkingOwners = data.owners;
            } else {
                // try to make array of single object
                parkingOwners = data ? [data] : [];
            }
        } else {
            parkingOwners = data;
        }

        console.log('[frontend] parkingOwners:', parkingOwners);
        renderOwners();
    } catch (err) {
        console.error('[frontend] fetchOwners error', err);
        showToast('Failed to load owners (see console)', 'error');
    }
}

function renderOwners() {
    const body = dom.tables.ownersBody;
    body.innerHTML = '';

    if (!parkingOwners || parkingOwners.length === 0) {
        body.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted)">No owners found</td></tr>`;
        return;
    }

    parkingOwners.forEach(owner => {
        // tolerant field lookups (different possible field names)
        const name = owner.name || owner.ownerName || owner.fullName || '—';
        const flat = owner.flatNumber || owner.flat || owner.flatNo || owner.flatNoString || '—';
        const phone = owner.phone || owner.mobile || owner.phoneNumber || '—';
        // vehicles could be an array under different names
        const vehicles = owner.vehicleNumbers || owner.vehicles || owner.vehicleList || [];

        const vehicleStr = Array.isArray(vehicles) ? (vehicles.join(', ') || 'None') : (vehicles || 'None');

        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td>${escapeHtml(name)}</td>
      <td>${escapeHtml(flat)}</td>
      <td>${escapeHtml(phone)}</td>
      <td>${escapeHtml(vehicleStr)}</td>
    `;
        body.appendChild(tr);
    });
}

async function fetchVehicles() {
    try {
        console.log('[frontend] fetchVehicles -> calling /api/vehicles');
        const res = await fetch(`${API_BASE_URL}/api/vehicles`);
        console.log('[frontend] fetchVehicles status', res.status);

        const data = await res.json().catch(async (err) => {
            const txt = await res.text();
            console.error('[frontend] fetchVehicles json parse failed, raw text:', txt);
            throw err;
        });

        if (!Array.isArray(data)) {
            console.warn('[frontend] fetchVehicles: payload not array - trying to normalize', data);
            if (data && Array.isArray(data.vehicles)) parkingVehicles = data.vehicles;
            else parkingVehicles = data ? [data] : [];
        } else {
            parkingVehicles = data;
        }

        console.log('[frontend] parkingVehicles:', parkingVehicles);
        renderVehicles();
    } catch (err) {
        console.error('[frontend] fetchVehicles error', err);
        showToast('Failed to load vehicles (see console)', 'error');
    }
}

function renderVehicles() {
    const body = dom.tables.vehiclesBody;
    body.innerHTML = '';

    if (!parkingVehicles || parkingVehicles.length === 0) {
        body.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted)">No vehicles found</td></tr>`;
        return;
    }

    parkingVehicles.forEach(v => {
        // tolerant field lookup
        const number = v.numberPlate || v.number || v.regNo || v.registration || '—';
        const ownerId = v.ownerId || v.flatNumber || v.owner || '—';
        const model = v.model || v.make || '—';
        const color = v.color || '—';

        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td><code>${escapeHtml(number)}</code></td>
      <td>${escapeHtml(ownerId)}</td>
      <td>${escapeHtml(model)}</td>
      <td>${escapeHtml(color)}</td>
    `;
        body.appendChild(tr);
    });
}

/* small helper to avoid injection from DB in table cells */
function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// function renderOwners() {
//   const tbody = dom.tables.ownersBody;
//   tbody.innerHTML = "";

//   (parkingOwners || []).forEach((owner) => {
//     // support different field names gracefully
//     const name = owner.name || owner.ownerName || "";
//     const flat = owner.flatNumber || owner.flat || owner.ownerId || "";
//     const phone = owner.phone || owner.mobile || "";
//     const vehicles = owner.vehicleNumbers || owner.vehicles || owner.vehicleList || [];

//     const tr = document.createElement("tr");
//     tr.innerHTML = `
//             <td>${name}</td>
//             <td>${flat}</td>
//             <td>${phone}</td>
//             <td>${Array.isArray(vehicles) ? vehicles.join(", ") : vehicles || ""}</td>
//         `;
//     tbody.appendChild(tr);
//   });

//   // If none, show empty message row or keep header only
// }

// function renderVehicles() {
//   const tbody = dom.tables.vehiclesBody;
//   tbody.innerHTML = "";

//   (parkingVehicles || []).forEach((v) => {
//     // support different field names
//     const number = v.numberPlate || v.number || v.id || "";
//     const ownerId = v.ownerId || v.owner || v.ownerFlat || "";
//     const model = v.model || v.type || "Car";
//     const color = v.color || "-";

//     const tr = document.createElement("tr");
//     tr.innerHTML = `
//             <td><code>${number}</code></td>
//             <td>${ownerId}</td>
//             <td>${model} (${color})</td>
//         `;
//     tbody.appendChild(tr);
//   });
// }

// ===============================
// DASHBOARD HELPERS
// ===============================
function updateDashboard() {
    dom.stats.total.textContent = parkingSlots.length;
    dom.stats.available.textContent = parkingSlots.filter((s) => s.state === "EMPTY").length;
    dom.stats.alerts.textContent = parkingAlerts.length;
}

function updateStats() {
    updateDashboard();
}

function populateSlotSelect() {
    const select = dom.targetSlotSelect;
    if (!select) return;

    // ensure default placeholderopt
    const placeholderText = "Select a Slot...";
    select.innerHTML = "";
    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.textContent = placeholderText;
    select.appendChild(defaultOpt);

    (parkingSlots || []).forEach((s) => {
        const opt = document.createElement("option");
        opt.value = s.slotId || s.id;
        opt.textContent = `${s.slotId || s.id} (${s.state || "EMPTY"})`;
        select.appendChild(opt);
    });
}

function updateAlertBadge() {
    const count = parkingAlerts.length;
    dom.alertBadge.textContent = count;
    dom.alertBadge.classList.toggle("hidden", count === 0);
}

// ===============================
// TOAST NOTIFICATIONS
// ===============================
function showToast(message, type = "success") {
    const div = document.createElement("div");
    div.className = `toast ${type}`;
    div.innerHTML = `
        <i class="fa-solid ${type === "success" ? "fa-circle-check" : "fa-circle-exclamation"}"></i>
        <span>${message}</span>
    `;
    dom.toastContainer.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

// ===============================
// ALERT ACTIONS
// ===============================
// async function acceptAlert(id) {
//     try {
//         const res = await fetch(`${API_BASE_URL}/api/alerts/accept?id=${encodeURIComponent(id)}`, { method: "POST" });
//         const text = await res.text();
//         if (!res.ok) {
//             showToast(text || "Failed to accept alert", "error");
//             return;
//         }
//         showToast(text || "Alert accepted", "success");

//         // update UI: remove accepted alert locally, refresh slots & alerts
//         await fetchAlerts();
//         await fetchSlots();
//     } catch (err) {
//         console.error("acceptAlert:", err);
//         showToast("Accept failed", "error");
//     }
// }

// async function rejectAlert(id) {
//     try {
//         const res = await fetch(`${API_BASE_URL}/api/alerts/reject?id=${encodeURIComponent(id)}`, { method: "POST" });
//         const text = await res.text();
//         if (!res.ok) {
//             showToast(text || "Failed to reject alert", "error");
//             return;
//         }
//         showToast(text || "Alert rejected — security notified", "error");

//         await fetchAlerts();
//         await fetchSlots();
//     } catch (err) {
//         console.error("rejectAlert:", err);
//         showToast("Reject failed", "error");
//     }
// }
async function acceptAlert(id) {
    try {
        await fetch(`${API_BASE_URL}/api/alerts/accept?id=${id}`, {
            method: "POST"
        });

        showToast("Alert Accepted", "success");

        // refresh UI immediately
        await fetchAlerts();
        await fetchSlots();
        updateDashboard();

    } catch (err) {
        console.error(err);
        showToast("Failed to accept alert", "error");
    }
}

async function rejectAlert(id) {
    try {
        await fetch(`${API_BASE_URL}/api/alerts/reject?id=${id}`, {
            method: "POST"
        });

        showToast("Alert Rejected — Security Notified", "error");

        // refresh UI immediately
        await fetchAlerts();
        await fetchSlots();
        updateDashboard();

    } catch (err) {
        console.error(err);
        showToast("Failed to reject alert", "error");
    }
}

// ===============================
// MOCK HELPERS (dev)
// ===============================
function generateMockSlots(count) {
    const owners = ["A101", "A102", "A103", "A104", "A105"];
    const states = ["EMPTY", "OCCUPIED", "TENTATIVE", "VIOLATION"];
    return Array.from({ length: count }, (_, i) => {
        const id = `SLOT-${101 + i}`;
        const state = states[Math.floor(Math.random() * states.length)];
        return { id: id, slotId: id, ownerId: owners[i % owners.length], state: state, occupied: state === "OCCUPIED", currentVehicle: state === "EMPTY" ? null : `TS09AB${1000 + i}` };
    });
}
