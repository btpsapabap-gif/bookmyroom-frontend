const API_BASE =
  "http://localhost:3000/api";

async function loadPlanner() {

  const response =
    await fetch(
      `${API_BASE}/occupancy`
    );

  const data =
    await response.json();

  const rooms =
    data.rooms;

  const bookings =
    data.bookings;

  const planner =
    document.getElementById(
      "planner"
    );

  planner.innerHTML = "";

  const DAYS = 30;

  let html =
    `<table class="planner-table">`;

  html += "<thead><tr>";

  html +=
    "<th class='room-col'>Room</th>";

  for (
    let d = 1;
    d <= DAYS;
    d++
  ) {
    html += `<th>${d}</th>`;
  }

  html += "</tr></thead>";

  html += "<tbody>";

  rooms.forEach(room => {

    html += "<tr>";

    html += `
      <td class='room-name'>
        ${room.room_no}
      </td>
    `;

    for (
      let d = 1;
      d <= DAYS;
      d++
    ) {

      const currentDate =
        new Date();

      currentDate.setDate(d);

      const dateString =
        currentDate
          .toISOString()
          .split("T")[0];

      let bookingFound =
        bookings.find(
          booking =>
            booking.room_id === room.id &&
            booking.from_date &&
            booking.to_date &&
            dateString >= booking.from_date &&
            dateString <= booking.to_date
        );

      if (bookingFound) {

        html += `
          <td
            class="booked"
            title="
Employee:
${bookingFound.employee_id}

Room:
${bookingFound.room_no}

From:
${bookingFound.from_date}

To:
${bookingFound.to_date}
            "
          >
            ${bookingFound.employee_id}
          </td>
        `;

      } else {

        html += `
          <td class="free"></td>
        `;
      }

    }

    html += "</tr>";

  });

  html += "</tbody></table>";

  planner.innerHTML =
    html;
}

loadPlanner();