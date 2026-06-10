const rooms = [
  {
    id: "ac-room",
    name: "AC Room",
    floor: "First Floor",
    acType: "AC",
    rate: 3000,
    capacity: 8,
    availableDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    description: "Air-conditioned room for private bookings on the first floor.",
  },
  {
    id: "non-ac-room",
    name: "Non-AC Room",
    floor: "Ground Floor",
    acType: "Non AC",
    rate: 2500,
    capacity: 8,
    availableDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    description: "Simple ground-floor room for economical day-wise bookings.",
  },
];

const state = {
  selectedRoom: null,
  bookings: loadBookings(),
  scannerStream: null,
  scannerTimer: null,
};

const roomList = document.querySelector("#roomList");
const resultCount = document.querySelector("#resultCount");
const selectedDay = document.querySelector("#selectedDay");
const acFilter = document.querySelector("#acFilter");
const peopleCount = document.querySelector("#peopleCount");
const floorDisplay = document.querySelector("#floorDisplay");
const fromDate = document.querySelector("#fromDate");
const toDate = document.querySelector("#toDate");
const startTime = document.querySelector("#startTime");
const summaryTitle = document.querySelector("#summaryTitle");
const summaryMeta = document.querySelector("#summaryMeta");
const summaryDate = document.querySelector("#summaryDate");
const summaryTime = document.querySelector("#summaryTime");
const summaryCapacity = document.querySelector("#summaryCapacity");
const summaryDays = document.querySelector("#summaryDays");
const rateInput = document.querySelector("#rateInput");
const summaryBill = document.querySelector("#summaryBill");
const idProof = document.querySelector("#idProof");
const idProofNumber = document.querySelector("#idProofNumber");
const idProofImage = document.querySelector("#idProofImage");
const mobileNumber = document.querySelector("#mobileNumber");
const confirmBooking = document.querySelector("#confirmBooking");
const confirmation = document.querySelector("#confirmation");
const bookingList = document.querySelector("#bookingList");
const bookingHistoryTitle = document.querySelector("#bookingHistoryTitle");
const startScanner = document.querySelector("#startScanner");
const stopScanner = document.querySelector("#stopScanner");
const qrVideo = document.querySelector("#qrVideo");
const qrResult = document.querySelector("#qrResult");

function loadBookings() {
  try {
    const savedBookings = JSON.parse(localStorage.getItem("bookMyRoomBookings")) || [];
    return Array.isArray(savedBookings) ? savedBookings : [];
  } catch {
    return [];
  }
}

function saveBookings() {
  try {
    localStorage.setItem("bookMyRoomBookings", JSON.stringify(state.bookings));
  } catch {
    confirmation.textContent = "Booking saved for this session. Browser storage is not available.";
  }
}

function setDefaultDate() {
  const today = new Date();
  const isoDate = today.toISOString().slice(0, 10);
  fromDate.value = isoDate;
  toDate.value = isoDate;
  fromDate.min = isoDate;
  toDate.min = isoDate;
}

function formatDate(dateValue) {
  if (!dateValue) return "--";
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(`${dateValue}T00:00:00`));
}

function getDayName(dateValue) {
  if (!dateValue) return "";
  return new Intl.DateTimeFormat("en", { weekday: "long" }).format(new Date(`${dateValue}T00:00:00`));
}

function formatDateRange() {
  if (!fromDate.value || !toDate.value) return "--";
  return `${formatDate(fromDate.value)} to ${formatDate(toDate.value)}`;
}

function formatTimeRange() {
  const [hours, minutes] = startTime.value.split(":").map(Number);
  const start = new Date();
  start.setHours(hours, minutes, 0, 0);
  const format = new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  });
  return format.format(start);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getRoomByAcType() {
  return rooms.find((room) => room.acType === acFilter.value) || rooms[0];
}

function applyRoomTypeDefaults() {
  const room = getRoomByAcType();
  floorDisplay.value = room.floor;
  rateInput.value = room.rate;
  state.selectedRoom = room;
}

function getTotalBill() {
  const days = getNumberOfDays();
  const rate = Math.max(0, Number(rateInput.value) || 0);
  return days * rate;
}

function getNumberOfDays() {
  if (!fromDate.value || !toDate.value) return 1;
  const start = new Date(`${fromDate.value}T00:00:00`);
  const end = new Date(`${toDate.value}T00:00:00`);
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.max(1, Math.round((end - start) / dayMs) + 1);
}

function getDateValue(dateValue) {
  return new Date(`${dateValue}T00:00:00`).getTime();
}

function dateRangesOverlap(startA, endA, startB, endB) {
  return getDateValue(startA) <= getDateValue(endB) && getDateValue(startB) <= getDateValue(endA);
}

function isRoomBooked(room) {
  if (!fromDate.value || !toDate.value) return false;
  return state.bookings.some((booking) => {
    return booking.roomId === room.id && dateRangesOverlap(fromDate.value, toDate.value, booking.fromDate, booking.toDate);
  });
}

function syncDateRange() {
  toDate.min = fromDate.value;
  if (toDate.value < fromDate.value) {
    toDate.value = fromDate.value;
  }
}

function isValidMobileNumber() {
  return /^[6-9]\d{9}$/.test(mobileNumber.value.trim());
}

function getVisibleRooms() {
  const requestedPeople = Number(peopleCount.value) || 1;
  const dayName = getDayName(fromDate.value);
  return rooms.filter((room) => {
    const acMatches = room.acType === acFilter.value;
    const dayMatches = !dayName || room.availableDays.includes(dayName);
    const capacityMatches = room.capacity >= requestedPeople;
    const availableMatches = !isRoomBooked(room);
    return acMatches && dayMatches && capacityMatches && availableMatches;
  });
}

function keepSelectedRoomValid() {
  const visibleRooms = getVisibleRooms();
  if (!visibleRooms.includes(state.selectedRoom)) {
    state.selectedRoom = visibleRooms[0] || null;
  }
  return visibleRooms;
}

function renderRooms() {
  const visibleRooms = keepSelectedRoomValid();
  resultCount.textContent = `${visibleRooms.length} room${visibleRooms.length === 1 ? "" : "s"} found`;
  const dayName = getDayName(fromDate.value);
  selectedDay.textContent = dayName ? `${formatDateRange()} at ${formatTimeRange()}` : "Select dates and time";

  if (visibleRooms.length === 0) {
    roomList.innerHTML = '<div class="empty-state">This room is already booked for the selected dates, or no room matches these details.</div>';
    return;
  }

  roomList.innerHTML = visibleRooms
    .map(
      (room, index) => `
        <article class="room-card">
          <div class="room-visual" aria-hidden="true"><span></span></div>
          <div>
            <h3>${room.name}</h3>
            <p>${room.description}</p>
            <div class="meta-row">
              <span>${room.floor}</span>
              <span>${room.acType}</span>
              <span>${formatCurrency(room.rate)} / day</span>
              <span>${room.capacity} seats</span>
              <span>${room.availableDays.slice(0, 3).join(", ")}</span>
            </div>
          </div>
          <button class="book-button" type="button" data-room-index="${rooms.indexOf(room)}">Book</button>
        </article>
      `
    )
    .join("");

  document.querySelectorAll(".book-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedRoom = rooms[Number(button.dataset.roomIndex)];
      confirmation.textContent = "";
      updateSummary();
    });
  });
}

function updateSummary() {
  keepSelectedRoomValid();
  if (!state.selectedRoom) {
    summaryTitle.textContent = "No room selected";
    summaryMeta.textContent = "Choose a room to see booking details here.";
    summaryDate.textContent = "--";
    summaryTime.textContent = "--";
    summaryCapacity.textContent = "--";
    summaryDays.textContent = "--";
    summaryBill.textContent = formatCurrency(0);
    confirmBooking.disabled = true;
    return;
  }

  summaryTitle.textContent = state.selectedRoom.name;
  summaryMeta.textContent = `${state.selectedRoom.floor}, ${state.selectedRoom.acType}`;
  summaryDate.textContent = formatDateRange();
  summaryTime.textContent = formatTimeRange();
  summaryCapacity.textContent = `${peopleCount.value || 1} people, up to ${state.selectedRoom.capacity} seats`;
  summaryDays.textContent = `${getNumberOfDays()} day${getNumberOfDays() === 1 ? "" : "s"}`;
  summaryBill.textContent = formatCurrency(getTotalBill());
  updateConfirmButton();
}

function hasValidIdProofNumber() {
  return idProofNumber.value.trim().length >= 4;
}

function hasIdProofImage() {
  return idProofImage.files && idProofImage.files.length > 0;
}

function updateConfirmButton() {
  confirmBooking.disabled = !state.selectedRoom || !idProof.value || !hasValidIdProofNumber() || !hasIdProofImage() || !isValidMobileNumber();
}

[acFilter, peopleCount, fromDate, toDate, startTime, rateInput, idProof, idProofImage, mobileNumber].forEach((control) => {
  control.addEventListener("change", () => {
    if (control === acFilter) {
      applyRoomTypeDefaults();
    }
    if (control === fromDate || control === toDate) {
      syncDateRange();
    }
    confirmation.textContent = "";
    updateSummary();
    renderRooms();
  });
});

peopleCount.addEventListener("input", () => {
  const requestedPeople = Math.max(1, Math.min(8, Number(peopleCount.value) || 1));
  peopleCount.value = requestedPeople;
  confirmation.textContent = "";
  updateSummary();
  renderRooms();
});

[rateInput, idProofNumber, mobileNumber].forEach((control) => {
  control.addEventListener("input", () => {
    confirmation.textContent = "";
    updateSummary();
  });
});

function renderBookings() {
  bookingHistoryTitle.textContent = `${state.bookings.length} confirmed booking${state.bookings.length === 1 ? "" : "s"}`;

  if (state.bookings.length === 0) {
    bookingList.innerHTML = '<div class="empty-state">No confirmed bookings yet.</div>';
    return;
  }

  bookingList.innerHTML = state.bookings
    .map(
      (booking) => `
        <article class="booking-item">
          <strong>${booking.roomName}</strong>
          <span>${formatDate(booking.fromDate)} to ${formatDate(booking.toDate)} at ${booking.time}</span>
          <span>${booking.people} people, ${formatCurrency(booking.totalBill)}</span>
          <span>${booking.idProof}: ${booking.idProofNumber}</span>
          <span>ID image: ${booking.idProofImageName}</span>
          <span>Mobile: ${booking.mobileNumber}</span>
        </article>
      `
    )
    .join("");
}

confirmBooking.addEventListener("click", () => {
  if (!state.selectedRoom) return;
  if (isRoomBooked(state.selectedRoom)) {
    confirmation.textContent = "This room is already booked for the selected dates.";
    renderRooms();
    updateSummary();
    return;
  }
  if (!idProof.value) {
    confirmation.textContent = "Please select AADHAR or PAN as ID proof.";
    return;
  }
  if (!hasValidIdProofNumber()) {
    confirmation.textContent = "Please enter the ID proof number.";
    return;
  }
  if (!hasIdProofImage()) {
    confirmation.textContent = "Please upload the ID proof image.";
    return;
  }
  if (!isValidMobileNumber()) {
    confirmation.textContent = "Please enter a valid 10-digit mobile number.";
    return;
  }
  const booking = {
    roomId: state.selectedRoom.id,
    roomName: state.selectedRoom.name,
    fromDate: fromDate.value,
    toDate: toDate.value,
    time: formatTimeRange(),
    people: Number(peopleCount.value) || 1,
    rate: Number(rateInput.value) || 0,
    totalBill: getTotalBill(),
    idProof: idProof.value,
    idProofNumber: idProofNumber.value.trim(),
    idProofImageName: idProofImage.files[0].name,
    mobileNumber: mobileNumber.value.trim(),
  };
  state.bookings.unshift(booking);
  saveBookings();
  confirmation.textContent = `${booking.roomName} booked from ${formatDateRange()} for ${booking.people} people. Total bill ${formatCurrency(booking.totalBill)}. Confirmation sent to ${booking.mobileNumber}.`;
  renderBookings();
  renderRooms();
  updateSummary();
});

document.querySelector("#clearBooking").addEventListener("click", () => {
  acFilter.value = "AC";
  peopleCount.value = "4";
  startTime.value = "09:00";
  idProof.value = "";
  idProofNumber.value = "";
  idProofImage.value = "";
  mobileNumber.value = "";
  setDefaultDate();
  syncDateRange();
  applyRoomTypeDefaults();
  confirmation.textContent = "";
  updateSummary();
  renderRooms();
});

async function startQrScanner() {
  if (!("BarcodeDetector" in window)) {
    qrResult.textContent = "QR scanner is not supported in this browser. Please use the latest Chrome or Edge on mobile.";
    return;
  }

  try {
    const detector = new BarcodeDetector({ formats: ["qr_code"] });
    state.scannerStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });
    qrVideo.srcObject = state.scannerStream;
    await qrVideo.play();
    startScanner.disabled = true;
    stopScanner.disabled = false;
    qrResult.textContent = "Scanner started. Point the camera at a QR code.";

    state.scannerTimer = window.setInterval(async () => {
      if (!qrVideo.srcObject || qrVideo.readyState < 2) return;
      const codes = await detector.detect(qrVideo);
      if (codes.length > 0) {
        qrResult.textContent = codes[0].rawValue;
        stopQrScanner();
      }
    }, 500);
  } catch {
    qrResult.textContent = "Camera access was not available. Please allow camera permission and try again.";
  }
}

function stopQrScanner() {
  if (state.scannerTimer) {
    window.clearInterval(state.scannerTimer);
    state.scannerTimer = null;
  }
  if (state.scannerStream) {
    state.scannerStream.getTracks().forEach((track) => track.stop());
    state.scannerStream = null;
  }
  qrVideo.srcObject = null;
  startScanner.disabled = false;
  stopScanner.disabled = true;
}

startScanner.addEventListener("click", startQrScanner);
stopScanner.addEventListener("click", stopQrScanner);

setDefaultDate();
syncDateRange();
applyRoomTypeDefaults();
updateSummary();
renderRooms();
renderBookings();
