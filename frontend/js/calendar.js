/* ===========================================================
   BookMyRoom Enterprise
   Occupancy Calendar
   Part 1 - Initialization
=========================================================== */

"use strict";

/* ===========================================================
   CURRENT USER
=========================================================== */

const currentUser = getUser();

if (!currentUser || currentUser.role !== "ADMIN") {

    window.location.href = "index.html";

}

/* ===========================================================
   GLOBAL VARIABLES
=========================================================== */

let dashboard = {};

let bookings = [];

let rooms = [];

let currentMonth = new Date().getMonth();

let currentYear = new Date().getFullYear();

/* ===========================================================
   ELEMENTS
=========================================================== */

/* KPI */

const calendarTotalRooms =
    document.getElementById("calendarTotalRooms");

const calendarAvailableRooms =
    document.getElementById("calendarAvailableRooms");

const calendarOccupiedRooms =
    document.getElementById("calendarOccupiedRooms");

const calendarOccupancy =
    document.getElementById("calendarOccupancy");

/* Filters */

const monthFilter =
    document.getElementById("monthFilter");

const floorFilter =
    document.getElementById("floorFilter");

const roomTypeFilter =
    document.getElementById("roomTypeFilter");

const guestSearch =
    document.getElementById("guestSearch");

/* Calendar */

const calendarTitle =
    document.getElementById("calendarTitle");

const calendarGrid =
    document.getElementById("calendarGrid");

const occupancyTableBody =
    document.getElementById("occupancyTableBody");

/* Navigation */

const previousMonth =
    document.getElementById("previousMonth");

const nextMonth =
    document.getElementById("nextMonth");

const refreshCalendarBtn =
    document.getElementById("refreshCalendarBtn");

const backDashboardBtn =
    document.getElementById("backDashboardBtn");

/* ===========================================================
   EVENTS
=========================================================== */

previousMonth.addEventListener(

    "click",

    previousCalendarMonth

);

nextMonth.addEventListener(

    "click",

    nextCalendarMonth

);

refreshCalendarBtn.addEventListener(

    "click",

    initializeCalendar

);

backDashboardBtn.addEventListener(

    "click",

    () => {

        window.location.href = "admin.html";

    }

);

monthFilter.addEventListener(

    "change",

    filterCalendar

);

floorFilter.addEventListener(

    "change",

    filterCalendar

);

roomTypeFilter.addEventListener(

    "change",

    filterCalendar

);

guestSearch.addEventListener(

    "input",

    filterCalendar

);

/* ===========================================================
   INITIALIZE
=========================================================== */

initializeCalendar();

/* ===========================================================
   INITIALIZE CALENDAR
=========================================================== */

async function initializeCalendar() {

    try {

        document.body.style.cursor = "wait";

        await Promise.all([

            loadDashboard(),

            loadBookings(),

            loadRooms()

        ]);

        populateMonthFilter();

        updateKPIs();

        updateCalendarTitle();

        renderCalendar();

        renderOccupancyTable();

    }

    catch (err) {

        console.error(err);

        alert(

            err.message ||

            "Unable to load Occupancy Calendar."

        );

    }

    finally {

        document.body.style.cursor = "default";

    }

}

/* ===========================================================
   LOAD DASHBOARD
=========================================================== */

async function loadDashboard() {

    const result =

        await apiRequest(

            "/admin/dashboard"

        );

    dashboard =

        result.dashboard || {};

}

/* ===========================================================
   LOAD BOOKINGS
=========================================================== */

async function loadBookings() {

    const result =

        await apiRequest(

            "/bookings"

        );

    bookings =

        result.bookings || [];

}

/* ===========================================================
   LOAD ROOMS
=========================================================== */

async function loadRooms() {

    const result =

        await apiRequest(

            "/rooms"

        );

    rooms =

        result.rooms || [];

}

console.log(

    "BookMyRoom Enterprise",

    "Occupancy Calendar Initialized"

);

/* ===========================================================
   CALENDAR ENGINE
=========================================================== */

/* ===========================================================
   MONTH NAMES
=========================================================== */

const MONTHS = [

    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"

];

const WEEKDAYS = [

    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat"

];

/* ===========================================================
   UPDATE TITLE
=========================================================== */

function updateCalendarTitle() {

    calendarTitle.textContent =

        `${MONTHS[currentMonth]} ${currentYear}`;

}

/* ===========================================================
   PREVIOUS MONTH
=========================================================== */

function previousCalendarMonth() {

    currentMonth--;

    if (currentMonth < 0) {

        currentMonth = 11;

        currentYear--;

    }

    updateCalendarTitle();

    renderCalendar();

}

/* ===========================================================
   NEXT MONTH
=========================================================== */

function nextCalendarMonth() {

    currentMonth++;

    if (currentMonth > 11) {

        currentMonth = 0;

        currentYear++;

    }

    updateCalendarTitle();

    renderCalendar();

}

/* ===========================================================
   RENDER CALENDAR
=========================================================== */

function renderCalendar() {

    calendarGrid.innerHTML = "";

    /* -------------------------
       WEEK HEADER
    -------------------------- */

    WEEKDAYS.forEach(day => {

        const div = document.createElement("div");

        div.className = "calendar-weekday";

        div.textContent = day;

        calendarGrid.appendChild(div);

    });

    /* -------------------------
       MONTH INFO
    -------------------------- */

    const firstDay =

        new Date(

            currentYear,

            currentMonth,

            1

        ).getDay();

    const totalDays =

        new Date(

            currentYear,

            currentMonth + 1,

            0

        ).getDate();

    /* -------------------------
       EMPTY CELLS
    -------------------------- */

    for (

        let i = 0;

        i < firstDay;

        i++

    ) {

        const blank =

            document.createElement("div");

        blank.className =

            "calendar-day empty";

        calendarGrid.appendChild(blank);

    }

    /* -------------------------
       DAYS
    -------------------------- */

    for (

        let day = 1;

        day <= totalDays;

        day++

    ) {

        const cell =

            document.createElement("div");

        cell.className =

            "calendar-day";

        const dateString =

            `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        cell.dataset.date =

            dateString;

        /* -------------------------
                TODAY
        -------------------------- */

        const today = new Date();

        const todayString =

            `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

        if (dateString === todayString) {

            cell.classList.add(

                "today"

            );

        }

        const weekDay =

            new Date(

                currentYear,

                currentMonth,

                day

            ).getDay();

        if (

            weekDay === 0 ||

            weekDay === 6

        ) {

            cell.classList.add(

                "weekend"

            );

        }

        cell.innerHTML =

            `

            <div class="day-number">

                ${day}

            </div>

            <div class="booking-counter">

                 0 Booking

            </div>

            <div class="booking-container">

            </div>

            `;

        cell.addEventListener(

            "click",

            () => {

                showDayOccupancy(

                    dateString

                );

            }

        );

        calendarGrid.appendChild(

            cell

        );

    }

    renderCalendarBookings();

}

/* ===========================================================
   MONTH FILTER
=========================================================== */

function populateMonthFilter() {

    monthFilter.innerHTML = "";

    MONTHS.forEach(

        (month, index) => {

            const option =

                document.createElement("option");

            option.value = index;

            option.textContent = month;

            option.selected =

                index === currentMonth;

            monthFilter.appendChild(option);

        }

    );

}

/* ===========================================================
   FILTER
=========================================================== */

function filterCalendar() {

    currentMonth =

        Number(

            monthFilter.value

        );

    updateCalendarTitle();

    renderCalendar();

}

/* ===========================================================
   DAY CLICK
=========================================================== */

function showDayOccupancy(date) {

    renderOccupancyTable(date);

}

/* ===========================================================
   RENDER BOOKINGS ON CALENDAR
=========================================================== */

function renderCalendarBookings() {

    document

        .querySelectorAll(".booking-container")

        .forEach(container => {

            container.innerHTML = "";

        });

    bookings.forEach(booking => {

        if (!booking.from_date || !booking.to_date) {

            return;

        }

        const checkIn = new Date(booking.from_date);

        const checkOut = new Date(booking.to_date);

        for (

            let day = new Date(checkIn);

            day < checkOut;

            day.setDate(day.getDate() + 1)

        ) {

            if (

                day.getMonth() !== currentMonth ||

                day.getFullYear() !== currentYear

            ) {

                continue;

            }

            const dateString =

                day.toISOString()

                    .split("T")[0];

            const cell =

                document.querySelector(

                    `[data-date="${dateString}"]`

                );

            if (!cell) {

                continue;

            }

            const container =

                cell.querySelector(

                    ".booking-container"

                );

            const tag =

                document.createElement("div");

            tag.className =

                "booking-tag " +

                getBookingClass(

                    booking.status

                );

            tag.textContent =

                booking.room_name ||

                `Room ${booking.room_id}`;

            tag.title =

                `Guest : ${booking.guest_name || "-"}

                Room : ${booking.room_name || "-"}

                Status : ${booking.status}

                Check In : ${formatDate(booking.from_date)}

                Check Out : ${formatDate(booking.to_date)}`;

            tag.addEventListener(

                "click",

                function (event) {

                    event.stopPropagation();

                    viewBooking(

                        booking.id

                    );

                }

            );

            container.appendChild(tag);

            const counter =

                cell.querySelector(

                    ".booking-counter"

                );

            const count =

                container.children.length;

            counter.textContent =

                count +

                (count === 1

                    ? " Booking"

                    : " Bookings");

            if (

                filteredBookings.length === 0

            ) {

                calendarGrid.insertAdjacentHTML(

                    "beforeend",

                    `

                <div class="calendar-empty">

                No bookings found for the selected filters.

                </div>

            `

                );

            }

        }

    });


}

/* ===========================================================
   BOOKING COLOR
=========================================================== */

function getBookingClass(status) {

    switch (

    (status || "")

        .toUpperCase()

    ) {

        case "CONFIRMED":

            return "booking-confirmed";

        case "CHECKEDIN":

            return "booking-checkin";

        case "CHECKEDOUT":

            return "booking-checkout";

        case "CANCELLED":

            return "booking-cancelled";

        default:

            return "booking-confirmed";

    }

}

/* ===========================================================
   DAILY OCCUPANCY
=========================================================== */

function renderOccupancyTable(date = null) {

    occupancyTableBody.innerHTML = "";

    let list = bookings;

    if (date) {

        list = bookings.filter(booking =>

            booking.from_date <= date &&

            booking.to_date > date

        );

    }

    list.forEach(booking => {

        const row =

            document.createElement("tr");

        row.innerHTML = `

            <td>

                ${booking.room_name || "-"}

            </td>

            <td>

                ${booking.floor || "-"}

            </td>

            <td>

                ${booking.guest_name || "-"}

            </td>

            <td>

                ${formatDate(

            booking.from_date

        )}

            </td>

            <td>

                ${formatDate(

            booking.to_date

        )}

            </td>

            <td>

                ${booking.status}

            </td>

            <td>

                <button
                    class="primary-btn"

                    onclick="viewBooking(${booking.id})">

                    View

                </button>

            </td>

        `;

        occupancyTableBody

            .appendChild(row);

    });

}