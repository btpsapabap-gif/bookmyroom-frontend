const API_BASE =
  "https://bookmyroom-api-aupi.onrender.com/api";

loadCalendar();

async function loadCalendar() {

  const response =
    await fetch(
      `${API_BASE}/bookings`
    );

  const bookings =
    await response.json();

  document.getElementById(
    "calendarContainer"
  ).innerHTML = `
    <table class="planner-table">
      <tr>
        <th>Room</th>
        <th>From</th>
        <th>To</th>
        <th>Status</th>
      </tr>

      ${bookings.map(b => `
        <tr>
          <td>${b.room_no}</td>
          <td>${b.from_date}</td>
          <td>${b.to_date}</td>
          <td>${b.status}</td>
        </tr>
      `).join("")}
    </table>
  `;
}