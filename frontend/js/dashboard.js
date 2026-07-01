"use strict";

/* ===========================================================
   BookMyRoom Enterprise
   Guest Dashboard - Rooms, Booking & ID Proof Upload
=========================================================== */

/* ===========================================================
   CURRENT USER / GUARD
=========================================================== */

const currentUser = getUser();

if (!currentUser || currentUser.role !== "GUEST") {

    window.location.href = "index.html";

}

/* ===========================================================
   ELEMENTS
=========================================================== */

const guestNameEl = document.getElementById("guestName");
const guestMobileEl = document.getElementById("guestMobile");
const profileCircleEl = document.getElementById("profileCircle");

const roomContainer = document.getElementById("roomContainer");
const historyTable = document.getElementById("historyTable");
const activeBookingCard = document.getElementById("activeBookingCard");
const activeBooking = document.getElementById("activeBooking");

const bookingModal = document.getElementById("bookingModal");
const closeBooking = document.getElementById("closeBooking");
const cancelBookingBtn = document.getElementById("cancelBooking");
const confirmBookingBtn = document.getElementById("confirmBooking");
const selectedRoomName = document.getElementById("selectedRoomName");
const roomRateEl = document.getElementById("roomRate");
const stayDaysEl = document.getElementById("stayDays");
const totalAmountEl = document.getElementById("totalAmount");
const bookingMessage = document.getElementById("bookingMessage");

const fromDateInput = document.getElementById("fromDate");
const toDateInput = document.getElementById("toDate");
const peopleInput = document.getElementById("people");
const mobileInput = document.getElementById("mobile");
const idProofSelect = document.getElementById("idProof");
const idProofNoInput = document.getElementById("idProofNo");

const uploadBox = document.getElementById("uploadBox");
const idProofImageInput = document.getElementById("idProofImage");
const imagePreview = document.getElementById("imagePreview");

const receiptModal = document.getElementById("receiptModal");
const receiptContent = document.getElementById("receiptContent");
const printReceiptBtn = document.getElementById("printReceiptBtn");
const downloadReceiptBtn = document.getElementById("downloadReceiptBtn");
const cancelReceiptBtn = document.getElementById("cancelReceiptBtn");
const closeReceiptBtn = document.getElementById("closeReceiptBtn");

const historyMenu = document.getElementById("historyMenu");
const profileMenu = document.getElementById("profileMenu");
const logoutBtn = document.getElementById("logoutBtn");

/* ===========================================================
   STATE
=========================================================== */

let rooms = [];
let myBookings = [];
let selectedRoom = null;
let selectedFile = null;
let receiptBooking = null;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/* ===========================================================
   INIT
=========================================================== */

document.addEventListener("DOMContentLoaded", init);

async function init() {

    guestNameEl.textContent = currentUser.guest_name || "Guest";
    guestMobileEl.textContent = currentUser.mobile || "";
    profileCircleEl.textContent =
        (currentUser.guest_name || "G").charAt(0).toUpperCase();

    mobileInput.value = currentUser.mobile || "";

    registerEvents();

    await Promise.all([
        loadRooms(),
        loadHistory()
    ]);

}

function registerEvents() {

    closeBooking.addEventListener("click", closeBookingModal);
    cancelBookingBtn.addEventListener("click", closeBookingModal);
    confirmBookingBtn.addEventListener("click", submitBooking);

    fromDateInput.addEventListener("change", updateSummary);
    toDateInput.addEventListener("change", updateSummary);

    idProofImageInput.addEventListener("change", handleFileSelect);

    uploadBox.addEventListener("click", (e) => {
        if (e.target !== idProofImageInput) {
            idProofImageInput.click();
        }
    });

    printReceiptBtn.addEventListener("click", () => window.print());
    downloadReceiptBtn.addEventListener("click", () => window.print());
    closeReceiptBtn.addEventListener("click", () => {
        receiptModal.classList.add("hidden");
    });
    cancelReceiptBtn.addEventListener("click", cancelReceiptBooking);

    historyMenu.addEventListener("click", () => {
        document.querySelector(".table-card")
            .scrollIntoView({ behavior: "smooth" });
    });

    profileMenu.addEventListener("click", () => {
        alert(
            `Name: ${currentUser.guest_name || "-"}\n` +
            `Mobile: ${currentUser.mobile || "-"}`
        );
    });

    logoutBtn.addEventListener("click", logout);

}

/* ===========================================================
   LOAD ROOMS
=========================================================== */

async function loadRooms() {

    try {

        const result = await apiRequest("/rooms");

        rooms = result.rooms || [];

        renderRooms();

    }

    catch (err) {

        roomContainer.innerHTML =
            `<p>Unable to load rooms right now.</p>`;

        console.error(err);

    }

}

function renderRooms() {

    if (!rooms.length) {

        roomContainer.innerHTML = `<p>No rooms available.</p>`;

        return;

    }

    roomContainer.innerHTML = rooms.map(room => `

        <div class="room-card">

            <div class="room-image">🛏️</div>

            <div class="room-body">

                <div class="room-name">${room.room_name}</div>

                <div class="room-info">
                    <span>${room.room_type || ""}</span>
                    <span>${room.floor || ""}</span>
                    <span>👥 ${room.capacity} Guests</span>
                </div>

                <div class="room-price">
                    ₹${Number(room.price).toLocaleString("en-IN")}
                    <span>/ night</span>
                </div>

                <span class="status">Available</span>

                <button onclick="openBookingModal(${room.id})">
                    Book Now
                </button>

            </div>

        </div>

    `).join("");

}

/* ===========================================================
   BOOKING MODAL
=========================================================== */

function openBookingModal(roomId) {

    selectedRoom = rooms.find(r => Number(r.id) === Number(roomId));

    if (!selectedRoom) {

        alert("Room not found.");

        return;

    }

    selectedRoomName.textContent = selectedRoom.room_name;
    roomRateEl.textContent =
        `₹${Number(selectedRoom.price).toLocaleString("en-IN")}`;

    fromDateInput.value = "";
    toDateInput.value = "";
    fromDateInput.min = new Date().toISOString().split("T")[0];
    toDateInput.min = new Date().toISOString().split("T")[0];

    peopleInput.value = 1;
    mobileInput.value = currentUser.mobile || "";
    idProofSelect.value = "Aadhaar";
    idProofNoInput.value = "";

    selectedFile = null;
    idProofImageInput.value = "";
    imagePreview.classList.add("hidden");
    imagePreview.src = "";

    bookingMessage.classList.add("hidden");
    bookingMessage.textContent = "";

    stayDaysEl.textContent = "0 Days";
    totalAmountEl.textContent = "₹0";

    confirmBookingBtn.disabled = false;
    confirmBookingBtn.textContent = "Confirm Booking";

    bookingModal.classList.remove("hidden");

}

function closeBookingModal() {

    bookingModal.classList.add("hidden");

}

function updateSummary() {

    if (!selectedRoom) return;

    const from = fromDateInput.value;
    const to = toDateInput.value;

    if (!from || !to) {

        stayDaysEl.textContent = "0 Days";
        totalAmountEl.textContent = "₹0";

        return;

    }

    const days = Math.ceil(
        (new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)
    );

    if (days <= 0) {

        stayDaysEl.textContent = "0 Days";
        totalAmountEl.textContent = "₹0";

        return;

    }

    const total = days * Number(selectedRoom.price);

    stayDaysEl.textContent = `${days} Day${days > 1 ? "s" : ""}`;
    totalAmountEl.textContent = `₹${total.toLocaleString("en-IN")}`;

}

/* ===========================================================
   ID PROOF IMAGE - SELECT / PREVIEW
=========================================================== */

function handleFileSelect(e) {

    const file = e.target.files[0];

    if (!file) {

        selectedFile = null;

        imagePreview.classList.add("hidden");

        return;

    }

    if (!ALLOWED_TYPES.includes(file.type)) {

        showBookingMessage(
            "Only JPG, PNG or WEBP images are allowed.",
            true
        );

        idProofImageInput.value = "";
        selectedFile = null;
        imagePreview.classList.add("hidden");

        return;

    }

    if (file.size > MAX_FILE_SIZE) {

        showBookingMessage(
            "Image must be under 5 MB.",
            true
        );

        idProofImageInput.value = "";
        selectedFile = null;
        imagePreview.classList.add("hidden");

        return;

    }

    selectedFile = file;

    const reader = new FileReader();

    reader.onload = (ev) => {

        imagePreview.src = ev.target.result;
        imagePreview.classList.remove("hidden");

    };

    reader.readAsDataURL(file);

    bookingMessage.classList.add("hidden");

}

/* ===========================================================
   SUBMIT BOOKING
=========================================================== */

async function submitBooking() {

    if (!selectedRoom) return;

    const from_date = fromDateInput.value;
    const to_date = toDateInput.value;
    const people = Number(peopleInput.value);
    const mobile = mobileInput.value.trim();
    const id_proof = idProofSelect.value;
    const id_proof_no = idProofNoInput.value.trim();

    if (!from_date || !to_date) {

        showBookingMessage("Please select check-in and check-out dates.", true);

        return;

    }

    if (new Date(to_date) <= new Date(from_date)) {

        showBookingMessage("Check-out must be after check-in.", true);

        return;

    }

    if (!people || people < 1 || people > selectedRoom.capacity) {

        showBookingMessage(
            `Guests must be between 1 and ${selectedRoom.capacity}.`,
            true
        );

        return;

    }

    if (!/^[0-9]{10}$/.test(mobile)) {

        showBookingMessage("Enter a valid 10-digit mobile number.", true);

        return;

    }

    if (!id_proof_no) {

        showBookingMessage("Please enter the ID proof number.", true);

        return;

    }

    if (!selectedFile) {

        showBookingMessage("Please upload an image of your ID proof.", true);

        return;

    }

    confirmBookingBtn.disabled = true;
    confirmBookingBtn.textContent = "Uploading Image...";

    try {

        const id_proof_image = await uploadIDProof(selectedFile, mobile);

        confirmBookingBtn.textContent = "Confirming Booking...";

        const payload = {
            room_id: selectedRoom.id,
            room_name: selectedRoom.room_name,
            guest_name: currentUser.guest_name,
            mobile,
            from_date,
            to_date,
            people,
            id_proof,
            id_proof_no,
            id_proof_image,
            booking_type: "Guest"
        };

        const result = await apiRequest("/bookings", "POST", payload);

        showBookingMessage("Booking confirmed!", false);

        closeBookingModal();

        await Promise.all([loadRooms(), loadHistory()]);

        showReceipt(result.booking);

    }

    catch (err) {

        showBookingMessage(err.message || "Booking failed. Please try again.", true);

        console.error(err);

    }

    finally {

        confirmBookingBtn.disabled = false;
        confirmBookingBtn.textContent = "Confirm Booking";

    }

}

function showBookingMessage(message, isError) {

    bookingMessage.textContent = message;

    bookingMessage.classList.remove("hidden", "booking-success", "booking-error");

    bookingMessage.classList.add(isError ? "booking-error" : "booking-success");

}

/* ===========================================================
   RECEIPT
=========================================================== */

function showReceipt(booking) {

    receiptBooking = booking;

    receiptContent.innerHTML = `

        <table class="receipt-table">

            <tr><td>Booking ID</td><td>#${booking.id}</td></tr>
            <tr><td>Guest Name</td><td>${booking.guest_name || "-"}</td></tr>
            <tr><td>Mobile</td><td>${booking.mobile || "-"}</td></tr>
            <tr><td>Room</td><td>${booking.room_name || "-"}</td></tr>
            <tr><td>Check-In</td><td>${formatDate(booking.from_date)}</td></tr>
            <tr><td>Check-Out</td><td>${formatDate(booking.to_date)}</td></tr>
            <tr><td>Guests</td><td>${booking.people || "-"}</td></tr>
            <tr><td>ID Proof</td><td>${booking.id_proof || "-"}</td></tr>
            <tr><td>ID Number</td><td>${booking.id_proof_no || "-"}</td></tr>
            <tr><td>Status</td><td>${booking.status}</td></tr>

        </table>

        <div class="receipt-total">
            Total : ₹${Number(booking.total_amount).toLocaleString("en-IN")}
        </div>

        ${booking.id_proof_image
            ? `<div style="margin-top:25px;text-align:center;">
                    <img src="${booking.id_proof_image}"
                        style="max-width:320px;border-radius:12px;border:1px solid #ddd;">
                </div>`
            : ""
        }

    `;

    receiptModal.classList.remove("hidden");

}

async function cancelReceiptBooking() {

    if (!receiptBooking) return;

    if (!confirm(`Cancel Booking #${receiptBooking.id}?`)) return;

    try {

        await apiRequest(`/bookings/${receiptBooking.id}`, "DELETE");

        receiptModal.classList.add("hidden");

        await Promise.all([loadRooms(), loadHistory()]);

    }

    catch (err) {

        alert(err.message || "Unable to cancel booking.");

    }

}

/* ===========================================================
   BOOKING HISTORY
=========================================================== */

async function loadHistory() {

    try {

        const result = await apiRequest(`/bookings/my/${currentUser.mobile}`);

        myBookings = result.bookings || [];

        renderHistory();

        renderActiveBooking();

    }

    catch (err) {

        historyTable.innerHTML =
            `<tr><td colspan="6">Unable to load booking history.</td></tr>`;

        console.error(err);

    }

}

function renderHistory() {

    if (!myBookings.length) {

        historyTable.innerHTML =
            `<tr><td colspan="6">No bookings yet.</td></tr>`;

        return;

    }

    historyTable.innerHTML = myBookings.map(b => `

        <tr>
            <td>#${b.id}</td>
            <td>${b.room_name || "-"}</td>
            <td>${formatDate(b.from_date)}</td>
            <td>${formatDate(b.to_date)}</td>
            <td>₹${Number(b.total_amount).toLocaleString("en-IN")}</td>
            <td>${b.status}</td>
        </tr>

    `).join("");

}

function renderActiveBooking() {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const active = myBookings.find(b =>
        b.status === "CONFIRMED" && new Date(b.to_date) >= today
    );

    if (!active) {

        activeBookingCard.classList.add("hidden");

        return;

    }

    activeBooking.innerHTML = `

        <p><strong>Room:</strong> ${active.room_name}</p>
        <p><strong>Check-In:</strong> ${formatDate(active.from_date)}</p>
        <p><strong>Check-Out:</strong> ${formatDate(active.to_date)}</p>
        <p><strong>Total:</strong> ₹${Number(active.total_amount).toLocaleString("en-IN")}</p>

    `;

    activeBookingCard.classList.remove("hidden");

}

/* ===========================================================
   HELPERS
=========================================================== */

function formatDate(date) {

    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

}
