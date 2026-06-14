const API_BASE =
  "https://bookmyroom-api-aupi.onrender.com/api";

let currentUser = null;
let rooms = [];
let bookings = [];
let selectedRoom = null;

/* ===========================
   ELEMENTS
=========================== */

const loginSection = document.getElementById("loginSection");
const appContainer = document.getElementById("appContainer");

const employeeIdInput = document.getElementById("employeeId");
const employeeNameInput = document.getElementById("employeeName");
const loginBtn = document.getElementById("loginBtn");
const loginMessage = document.getElementById("loginMessage");

const loggedUser = document.getElementById("loggedUser");
const logoutBtn = document.getElementById("logoutBtn");

const roomTypeSelect = document.getElementById("roomType");
const floorInput = document.getElementById("floor");

const fromDateInput = document.getElementById("fromDate");
const toDateInput = document.getElementById("toDate");
const peopleInput = document.getElementById("people");

const roomsContainer = document.getElementById("roomsContainer");
const roomCount = document.getElementById("roomCount");

const bookingSection = document.getElementById("bookingSection");

const selectedRoomInput =
  document.getElementById("selectedRoom");

const mobileInput =
  document.getElementById("mobile");

const idProofInput =
  document.getElementById("idProof");

const idProofNoInput =
  document.getElementById("idProofNo");

const idProofImage =
  document.getElementById("idProofImage");

const roomRate =
  document.getElementById("roomRate");

const roomCapacity =
  document.getElementById("roomCapacity");

const totalAmount =
  document.getElementById("totalAmount");

const totalDays =
  document.getElementById("totalDays");

const confirmBookingBtn =
  document.getElementById("confirmBookingBtn");

const bookingsContainer =
  document.getElementById("bookingsContainer");

/* ===========================
   STARTUP
=========================== */

window.addEventListener("load", async () => {

  setupDefaultDates();

  roomTypeChanged();

  const savedUser =
    localStorage.getItem("bookmyroom_user");

  if (savedUser) {

    currentUser =
      JSON.parse(savedUser);

    showApp();

    await loadRooms();

    await loadBookings();
  }
});

/* ===========================
   LOGIN
=========================== */

loginBtn.addEventListener(
  "click",
  login
);

async function login() {

  const employee_id =
    employeeIdInput.value.trim();

  const name =
    employeeNameInput.value.trim();

  if (!employee_id || !name) {

    loginMessage.textContent =
      "Employee ID and Name required";

    return;
  }

  try {

    const response =
      await fetch(
        `${API_BASE}/users/login`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({
            employee_id,
            name
          })
        }
      );

    const result =
      await response.json();

    if (!result.success) {

      loginMessage.textContent =
        "Login failed";

      return;
    }

    currentUser =
      result.user;

    localStorage.setItem(
      "bookmyroom_user",
      JSON.stringify(currentUser)
    );

    showApp();

    await loadRooms();

    await loadBookings();

  } catch (err) {

    console.error(err);

    loginMessage.textContent =
      "Server not reachable";
  }
}

function showApp() {

  loginSection.classList.add(
    "hidden"
  );

  appContainer.classList.remove(
    "hidden"
  );

  loggedUser.textContent =
    `${currentUser.employee_id} - ${currentUser.name}`;
}

logoutBtn.addEventListener(
  "click",
  () => {

    localStorage.removeItem(
      "bookmyroom_user"
    );

    location.reload();
  }
);

/* ===========================
   ROOM TYPE
=========================== */

roomTypeSelect.addEventListener(
  "change",
  roomTypeChanged
);

function roomTypeChanged() {

  if (
    roomTypeSelect.value === "AC"
  ) {

    floorInput.value =
      "First Floor";

  } else {

    floorInput.value =
      "Ground Floor";
  }

  renderRooms();
}

/* ===========================
   DATES
=========================== */

function setupDefaultDates() {

  const today =
    new Date();

  const tomorrow =
    new Date();

  tomorrow.setDate(
    tomorrow.getDate() + 1
  );

  fromDateInput.value =
    formatDate(today);

  toDateInput.value =
    formatDate(tomorrow);
}

function formatDate(date) {

  return date
    .toISOString()
    .split("T")[0];
}

/* ===========================
   LOAD ROOMS
=========================== */

async function loadRooms() {

  try {

    const response =
      await fetch(
        `${API_BASE}/rooms`
      );

    rooms =
      await response.json();

    renderRooms();

  } catch (err) {

    console.error(err);

    alert(
      "Unable to load rooms"
    );
  }
}

/* ===========================
   RENDER ROOMS
=========================== */

function renderRooms() {

  if (!roomsContainer) return;

  const type =
    roomTypeSelect.value;

  const filtered =
    rooms.filter(
      r =>
        r.room_type === type
    );

  roomCount.textContent =
    `${filtered.length} Room(s)`;

  roomsContainer.innerHTML = "";

  filtered.forEach(room => {

    const card =
      document.createElement(
        "div"
      );

    card.className =
      "room-card";

    card.innerHTML = `
      <h3>Room ${room.room_no}</h3>

      <div class="room-meta">

        <span>
          ${room.floor}
        </span>

        <span>
          ${room.room_type}
        </span>

        <span>
          ₹${room.rate}
        </span>

        <span>
          Capacity ${room.capacity}
        </span>

      </div>

      <button
        class="book-btn"
        data-room="${room.id}">
        Book Now
      </button>
    `;

    roomsContainer.appendChild(
      card
    );
  });

  document
    .querySelectorAll(".book-btn")
    .forEach(btn => {

      btn.addEventListener(
        "click",
        () => {

          const room =
            rooms.find(
              r =>
                r.id ==
                btn.dataset.room
            );

          selectRoom(room);
        }
      );
    });
}

/* ===========================
   SELECT ROOM
=========================== */

function selectRoom(room) {

  selectedRoom = room;

  bookingSection.classList.remove(
    "hidden"
  );

  selectedRoomInput.value =
    `Room ${room.room_no}`;

  roomRate.textContent =
    room.rate;

  roomCapacity.textContent =
    room.capacity;

  calculateTotal();
}

fromDateInput.addEventListener(
  "change",
  calculateTotal
);

toDateInput.addEventListener(
  "change",
  calculateTotal
);

function calculateTotal() {

  if (!selectedRoom) return;

  const from =
    new Date(fromDateInput.value);

  const to =
    new Date(toDateInput.value);

  let days =
    Math.ceil(
      (to - from) /
      (1000 * 60 * 60 * 24)
    );

  if (days <= 0) {
    days = 1;
  }

  totalDays.textContent =
    days;

  const total =
    days *
    Number(selectedRoom.rate);

  totalAmount.textContent =
    total.toLocaleString("en-IN");

}

/* ===========================
   CREATE BOOKING
=========================== */

confirmBookingBtn.addEventListener(
  "click",
  createBooking
);

async function createBooking() {

  if (!selectedRoom) {

    alert(
      "Select room first"
    );

    return;
  }

  try {

    let imageUrl = "";

    if (
      idProofImage.files.length > 0
    ) {

      const formData =
        new FormData();

      formData.append(
        "file",
        idProofImage.files[0]
      );

      const uploadResponse =
        await fetch(
          `${API_BASE}/upload/id-proof`,
          {
            method: "POST",
            body: formData
          }
        );

      const uploadResult =
        await uploadResponse.json();

      console.log(
        "Upload Response:",
        uploadResult
      );

      if (!uploadResponse.ok) {

        throw new Error(
          uploadResult.message ||
          "Upload failed"
        );
      }

      imageUrl =
        uploadResult.url || "";

    }

    const payload = {

      employee_id:
        currentUser.employee_id,

      room_id:
        selectedRoom.id,

      room_no:
        selectedRoom.room_no,

      room_type:
        selectedRoom.room_type,

      booking_date:
        new Date(),

      from_date:
        fromDateInput.value,

      to_date:
        toDateInput.value,

      total_amount:
        Number(
          totalAmount.textContent
            .replace(/,/g, "")
        ),

      people:
        Number(
          peopleInput.value
        ),

      mobile:
        mobileInput.value,

      id_proof:
        idProofInput.value,

      id_proof_no:
        idProofNoInput.value,

      id_proof_image:
        imageUrl,

      status:
        "CONFIRMED"
    };

    const response =
      await fetch(
        `${API_BASE}/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body:
            JSON.stringify(
              payload
            )
        }
      );

    if (!response.ok) {

      throw new Error(
        "Booking failed"
      );
    }

    alert(
      "Booking Confirmed"
    );

    await loadBookings();

    bookingSection.classList.add(
      "hidden"
    );

  } catch (err) {

    console.error(err);

    alert(
      "Booking failed"
    );
  }
}

/* ===========================
   LOAD BOOKINGS
=========================== */

async function loadBookings() {

  try {

    const response =
      await fetch(
        `${API_BASE}/bookings`
      );

    bookings =
      await response.json();

    renderBookings();

  } catch (err) {

    console.error(err);
  }
}

/* ===========================
   RENDER BOOKINGS
=========================== */

function renderBookings() {

  const mine =
    bookings.filter(
      b =>
        b.employee_id ===
        currentUser.employee_id
    );

  bookingsContainer.innerHTML =
    "";

  if (
    mine.length === 0
  ) {

    bookingsContainer.innerHTML =
      `
      <div class="booking-item">
        No bookings found
      </div>
      `;

    return;
  }

  mine.forEach(booking => {

    const card =
      document.createElement(
        "div"
      );

    card.className =
      "booking-item";

    card.innerHTML = `
      <h4>
        Room ${booking.room_no}
      </h4>

      <p>
        ${booking.room_type}
      </p>

      <p>
         ${booking.from_date || "-"}
      </p>

      <p>
        ${booking.to_date || "-"}
      </p>

      ${booking.id_proof_image
        ? `
  <img
    src="${booking.id_proof_image}"
    style="
      width:100%;
      margin-top:10px;
      border-radius:8px;
    ">
  `
        : ""
      }

      <p>
        ${booking.status}
      </p>

      <button
        class="cancel-btn"
        data-id="${booking.id}">
        Cancel
      </button>
    `;

    bookingsContainer.appendChild(
      card
    );
  });

  document
    .querySelectorAll(
      ".cancel-btn"
    )
    .forEach(btn => {

      btn.addEventListener(
        "click",
        () =>
          cancelBooking(
            btn.dataset.id
          )
      );
    });
}

/* ===========================
   CANCEL BOOKING
=========================== */

async function cancelBooking(id) {

  if (
    !confirm(
      "Cancel booking?"
    )
  ) {
    return;
  }

  try {

    await fetch(
      `${API_BASE}/bookings/${id}`,
      {
        method: "DELETE"
      }
    );

    await loadBookings();

  } catch (err) {

    console.error(err);

    alert(
      "Unable to cancel"
    );
  }
}