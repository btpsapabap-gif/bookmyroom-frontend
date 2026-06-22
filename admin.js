const API_BASE =
  "https://bookmyroom-api-aupi.onrender.com/api";

const currentUser =
  JSON.parse(
    localStorage.getItem(
      "bookmyroom_user"
    )
  );

if (
  !currentUser ||
  currentUser.role !== "ADMIN"
) {

  alert(
    "Access Denied"
  );

  location.href =
    "index.html";
}

function openBookingModal(booking) {

  const details =
    document.getElementById(
      "bookingDetails"
    );

  details.innerHTML = `

    <div class="detail-row">
  <span class="detail-label">
    User Type:
  </span>
  ${booking.user_type || "INTERNAL"}
</div>

<div class="detail-row">
  <span class="detail-label">
    User:
  </span>
  ${booking.user_type === "EXTERNAL"
      ? booking.guest_name
      : booking.employee_id
    }
</div>

    <div class="detail-row">
      <span class="detail-label">Room:</span>
      ${booking.room_no || ""}
    </div>

    <div class="detail-row">
      <span class="detail-label">Room Type:</span>
      ${booking.room_type || ""}
    </div>

    <div class="detail-row">
      <span class="detail-label">From:</span>
      ${booking.from_date || ""}
    </div>

    <div class="detail-row">
      <span class="detail-label">To:</span>
      ${booking.to_date || ""}
    </div>

    <div class="detail-row">
      <span class="detail-label">Mobile:</span>
      ${booking.mobile || ""}
    </div>

    <div class="detail-row">
      <span class="detail-label">ID Proof:</span>
      ${booking.id_proof || ""}
    </div>

    <div class="detail-row">
      <span class="detail-label">ID Number:</span>
      ${booking.id_proof_no || ""}
    </div>

    <div class="detail-row">
      <span class="detail-label">Amount:</span>
      ₹${booking.total_amount || 0}
    </div>

    <div class="detail-row">
      <span class="detail-label">Status:</span>
      ${booking.status || ""}
    </div>

    ${booking.id_proof_image
      ? `
        <a
          class="view-doc-btn"
          href="${booking.id_proof_image}"
          target="_blank"
        >
          View Uploaded ID
        </a>
      `
      : ""
    }

  `;

  document.getElementById(
    "bookingModal"
  ).style.display = "block";
}

async function loadDashboard() {

  try {

    const data =
      await response.json();

    document.getElementById(
      "internalBookings"
    ).textContent =
      data.bookings.filter(
        b =>
          b.user_type !==
          "EXTERNAL"
      ).length;

    document.getElementById(
      "externalBookings"
    ).textContent =
      data.bookings.filter(
        b =>
          b.user_type ===
          "EXTERNAL"
      ).length;

    const response =
      await fetch(
        `${API_BASE}/admin/dashboard`
      );

    const data =
      await response.json();

    document.getElementById(
      "totalRooms"
    ).textContent =
      data.totalRooms || 0;

    document.getElementById(
      "availableRooms"
    ).textContent =
      data.availableRooms || 0;

    document.getElementById(
      "bookedRooms"
    ).textContent =
      data.bookedRooms || 0;

    document.getElementById(
      "revenue"
    ).textContent =
      "₹" +
      Number(
        data.revenue || 0
      ).toLocaleString("en-IN");

    const tbody =
      document.querySelector(
        "#bookingsTable tbody"
      );

    tbody.innerHTML = "";

    data.bookings.forEach(
      booking => {

        const row =
          document.createElement(
            "tr"
          );

        row.innerHTML = `
  <td>
    ${booking.user_type || "INTERNAL"}
  </td>

  <td>
    ${booking.user_type === "EXTERNAL"
            ? booking.guest_name
            : booking.employee_id
          }
  </td>

  <td>
    ${booking.guest_mobile ||
          booking.mobile ||
          "-"
          }
  </td>

  <td>
    ${booking.room_no || ""}
  </td>

  <td>
    ${booking.from_date || ""}
  </td>

  <td>
    ${booking.to_date || ""}
  </td>

  <td>
    ₹${Number(
            booking.total_amount || 0
          ).toLocaleString("en-IN")}
  </td>

  <td>
    ${booking.status || ""}
  </td>

  <td>
    <button
      onclick="cancelBooking('${booking.id}')">
      Cancel
    </button>
  </td>
`;

        row.style.cursor =
          "pointer";

        row.addEventListener(
          "click",
          () =>
            openBookingModal(
              booking
            )
        );

        tbody.appendChild(row);

      }
    );

  } catch (err) {

    console.error(err);

    alert(
      "Failed to load dashboard"
    );

  }
}

async function searchBookings() {

  try {

    const q =
      document.getElementById(
        "searchInput"
      ).value;

    const response =
      await fetch(
        `${API_BASE}/admin/search?q=${q}`
      );

    const bookings =
      await response.json();

    const tbody =
      document.querySelector(
        "#bookingsTable tbody"
      );

    tbody.innerHTML = "";

    bookings.forEach(
      booking => {

        const row =
          document.createElement(
            "tr"
          );

        row.innerHTML = `
            <td>${booking.employee_id || ""}</td>
            <td>${booking.room_no || ""}</td>
            <td>
              ${booking.from_date || ""}
              <br>
              ${booking.to_date || ""}
            </td>
            <td>
              ₹${Number(
          booking.total_amount || 0
        ).toLocaleString("en-IN")}
            </td>
            <td>${booking.status || ""}</td>
        `;

        row.style.cursor =
          "pointer";

        row.addEventListener(
          "click",
          () =>
            openBookingModal(
              booking
            )
        );

        tbody.appendChild(row);

      }
    );

  } catch (err) {

    console.error(
      "Search Error",
      err
    );

  }
}

document
  .getElementById(
    "searchBtn"
  )
  .addEventListener(
    "click",
    searchBookings
  );

document
  .getElementById(
    "closeModal"
  )
  .addEventListener(
    "click",
    () => {

      document
        .getElementById(
          "bookingModal"
        )
        .style.display =
        "none";

    }
  );

async function cancelBooking(id) {

  if (
    !confirm(
      "Cancel this booking?"
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

    alert(
      "Booking cancelled"
    );

    loadDashboard();

  } catch (err) {

    console.error(err);

    alert(
      "Unable to cancel booking"
    );

  }

}

function goBack() {
  window.location.href = "index.html";
}

loadDashboard();