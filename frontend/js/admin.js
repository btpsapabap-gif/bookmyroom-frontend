/* ===========================================================
   BookMyRoom Enterprise
   Admin Dashboard
   Part 1 - Initialization
=========================================================== */

"use strict";

/* ===========================================================
   CURRENT USER
=========================================================== */

const currentUser = getUser();

/* ===========================================================
   AUTHENTICATION
=========================================================== */

if (!currentUser || currentUser.role !== "ADMIN") {

    window.location.href = "index.html";

}

/* ===========================================================
   GLOBAL VARIABLES
=========================================================== */

let dashboard = {};

let bookings = [];

let filteredBookings = [];

let selectedBooking = null;

/* ===========================================================
   ELEMENTS
=========================================================== */

const adminName =
    document.getElementById("adminName");

const profileCircle =
    document.getElementById("profileCircle");

const todayDate =
    document.getElementById("todayDate");

const logoutBtn =
    document.getElementById("logoutBtn");

/* KPI */

const totalRooms =
    document.getElementById("totalRooms");

const availableRooms =
    document.getElementById("availableRooms");

const occupiedRooms =
    document.getElementById("occupiedRooms");

const totalBookings =
    document.getElementById("totalBookings");

const totalGuests =
    document.getElementById("totalGuests");

const totalRevenue =
    document.getElementById("totalRevenue");

const todayCheckIn =
    document.getElementById("todayCheckIn");

const todayCheckOut =
    document.getElementById("todayCheckOut");

/* Occupancy */

const gfPercent =
    document.getElementById("gfPercent");

const ffPercent =
    document.getElementById("ffPercent");

const gfProgress =
    document.getElementById("gfProgress");

const ffProgress =
    document.getElementById("ffProgress");

/* Booking Distribution */

const internalBookings =
    document.getElementById("internalBookings");

const externalBookings =
    document.getElementById("externalBookings");

/* Booking Table */

const bookingTableBody =
    document.getElementById("bookingTableBody");

/* Filters */

const searchGuest =
    document.getElementById("searchGuest");

const roomFilter =
    document.getElementById("roomFilter");

const statusFilter =
    document.getElementById("statusFilter");

const dateFilter =
    document.getElementById("dateFilter");

/* Quick Actions */

const newBookingBtn =
    document.getElementById("newBookingBtn");

const guestListBtn =
    document.getElementById("guestListBtn");

const calendarBtn =
    document.getElementById("calendarBtn");

const roomsBtn =
    document.getElementById("roomsBtn");

const reportsBtn =
    document.getElementById("reportsBtn");

/* Export */

const excelBtn =
    document.getElementById("excelBtn");

const pdfBtn =
    document.getElementById("pdfBtn");

const printBtn =
    document.getElementById("printBtn");

const historyBtn =
    document.getElementById("historyBtn");

const refreshBtn =
    document.getElementById("refreshBtn");

/* ===========================================================
   PAGE HEADER
=========================================================== */

adminName.textContent =
    currentUser.name || "Administrator";

profileCircle.textContent =
    (currentUser.name || "A")
        .charAt(0)
        .toUpperCase();

todayDate.textContent =
    new Date().toLocaleDateString(
        "en-IN",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

/* ===========================================================
   EVENT REGISTRATION
=========================================================== */

logoutBtn.addEventListener(
    "click",
    logout
);

refreshBtn.addEventListener(
    "click",
    initializeDashboard
);

searchGuest.addEventListener(
    "input",
    filterBookings
);

roomFilter.addEventListener(
    "change",
    filterBookings
);

statusFilter.addEventListener(
    "change",
    filterBookings
);

dateFilter.addEventListener(
    "change",
    filterBookings
);

newBookingBtn.addEventListener(
    "click",
    () => {

        sessionStorage.setItem(

            "bookingMode",

            "ADMIN"

        );

        window.location.href =

            "dashboard.html";

    });

guestListBtn.addEventListener(
    "click",
    () => {

        alert(
            "Guest Management - Coming Soon"
        );

    });

calendarBtn.addEventListener(
    "click",
    () => {

        alert(
            "Occupancy Calendar - Coming Soon"
        );

    });

roomsBtn.addEventListener(
    "click",
    () => {

        alert(
            "Room Management - Coming Soon"
        );

    });

reportsBtn.addEventListener(
    "click",
    () => {

        alert(
            "Reports - Coming Soon"
        );

    });

excelBtn.addEventListener(
    "click",
    exportExcel
);

pdfBtn.addEventListener(
    "click",
    exportPDF
);

printBtn.addEventListener(
    "click",
    printBookings
);

historyBtn.addEventListener(
    "click",
    showHistory
);

/* ===========================================================
   APPLICATION START
=========================================================== */

initializeDashboard();

/* ===========================================================
   BookMyRoom Enterprise
   Part 2 - Dashboard Loading
=========================================================== */

/* ===========================================================
   INITIALIZE DASHBOARD
=========================================================== */

async function initializeDashboard() {

    try {

        showLoading(true);

        await Promise.all([

            loadDashboard(),

            loadBookings()

        ]);

        filterBookings();

    }

    catch (err) {

        console.error(err);

        alert(

            err.message ||

            "Unable to load dashboard."

        );

    }

    finally {

        showLoading(false);

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

    renderDashboard();

    refreshDashboardUI();

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

    filteredBookings =

        [...bookings];

}

/* ===========================================================
   RENDER DASHBOARD
=========================================================== */

function renderDashboard() {

    totalRooms.textContent =
        dashboard.totalRooms || 0;

    availableRooms.textContent =
        dashboard.availableRooms || 0;

    occupiedRooms.textContent =
        dashboard.bookedRooms || 0;

    totalBookings.textContent =
        dashboard.totalBookings || 0;

    totalGuests.textContent =
        dashboard.totalGuests || 0;

    totalRevenue.textContent =
        Number(
            dashboard.totalRevenue || 0
        ).toLocaleString("en-IN");

    todayCheckIn.textContent =
        dashboard.todayCheckIns || 0;

    todayCheckOut.textContent =
        dashboard.todayCheckOuts || 0;

    /* Occupancy */

    const gf =
        dashboard.groundFloorOccupancy || 0;

    const ff =
        dashboard.firstFloorOccupancy || 0;

    gfPercent.textContent =
        gf + "%";

    ffPercent.textContent =
        ff + "%";

    gfProgress.style.width =
        gf + "%";

    ffProgress.style.width =
        ff + "%";

    /* Distribution */

    internalBookings.textContent =
        dashboard.internalBookings || 0;

    externalBookings.textContent =
        dashboard.externalBookings || 0;

}

/* ===========================================================
   LOADING
=========================================================== */

function showLoading(show) {

    document.body.style.cursor =

        show

            ? "wait"

            : "default";

}

/* ===========================================================
   BookMyRoom Enterprise
   Part 3 - KPI Cards & Widgets
=========================================================== */

/* ===========================================================
   ANIMATE KPI VALUE
=========================================================== */

function animateValue(element, start, end, duration = 800) {

    if (!element) return;

    let startTime = null;

    function animation(currentTime) {

        if (!startTime) {

            startTime = currentTime;

        }

        const progress = Math.min(

            (currentTime - startTime) / duration,

            1

        );

        const value = Math.floor(

            progress * (end - start) + start

        );

        element.textContent =

            element.id === "totalRevenue"

                ? value.toLocaleString("en-IN")

                : value;

        if (progress < 1) {

            requestAnimationFrame(animation);

        }

    }

    requestAnimationFrame(animation);

}

/* ===========================================================
   UPDATE KPI CARDS
=========================================================== */

function updateKPIs() {

    animateValue(

        totalRooms,

        0,

        dashboard.totalRooms || 0

    );

    animateValue(

        availableRooms,

        0,

        dashboard.availableRooms || 0

    );

    animateValue(

        occupiedRooms,

        0,

        dashboard.bookedRooms || 0

    );

    animateValue(

        totalBookings,

        0,

        dashboard.totalBookings || 0

    );

    animateValue(

        totalGuests,

        0,

        dashboard.totalGuests || 0

    );

    animateValue(

        totalRevenue,

        0,

        dashboard.totalRevenue || 0

    );

    animateValue(

        todayCheckIn,

        0,

        dashboard.todayCheckIns || 0

    );

    animateValue(

        todayCheckOut,

        0,

        dashboard.todayCheckOuts || 0

    );

}

/* ===========================================================
   UPDATE OCCUPANCY
=========================================================== */

function updateOccupancyWidgets() {

    const gf = dashboard.groundFloorOccupancy || 0;

    const ff = dashboard.firstFloorOccupancy || 0;

    gfPercent.textContent = gf + "%";

    ffPercent.textContent = ff + "%";

    gfProgress.style.width = gf + "%";

    ffProgress.style.width = ff + "%";

    setProgressColor(

        gfProgress,

        gf

    );

    setProgressColor(

        ffProgress,

        ff

    );

}

/* ===========================================================
   UPDATE BOOKING DISTRIBUTION
=========================================================== */

function updateDistribution() {

    internalBookings.textContent =

        dashboard.internalBookings || 0;

    externalBookings.textContent =

        dashboard.externalBookings || 0;

}

/* ===========================================================
   PROGRESS COLOR
=========================================================== */

function setProgressColor(

    bar,

    value

) {

    if (!bar) return;

    if (value >= 80) {

        bar.style.background =

            "#16a34a";

    }

    else if (value >= 50) {

        bar.style.background =

            "#f59e0b";

    }

    else {

        bar.style.background =

            "#3b82f6";

    }

}

/* ===========================================================
   REFRESH DASHBOARD
=========================================================== */

function refreshDashboardUI() {

    updateKPIs();

    updateOccupancyWidgets();

    updateDistribution();

}

/* ===========================================================
   BookMyRoom Enterprise
   Part 4 - Recent Bookings Rendering
=========================================================== */

/* ===========================================================
   RENDER BOOKINGS
=========================================================== */

function renderBookings() {

    if (!bookingTableBody) return;

    bookingTableBody.innerHTML = "";

    if (filteredBookings.length === 0) {

        bookingTableBody.innerHTML = `

        <tr>

            <td colspan="10" class="text-center">

                No bookings found.

            </td>

        </tr>

        `;

        return;

    }

    filteredBookings.forEach(booking => {

        const tr = document.createElement("tr");

        tr.innerHTML = `

            <td>

                #${booking.id}

            </td>

            <td>

                ${booking.room_name || "-"}

            </td>

            <td>

                ${booking.guest_name || "-"}

            </td>

            <td>

                ${booking.mobile || "-"}

            </td>

            <td>

                ${formatDate(booking.from_date)}

            </td>

            <td>

                ${formatDate(booking.to_date)}

            </td>

            <td>

                ${booking.booking_type || "-"}

            </td>

            <td>

                ₹${Number(

            booking.total_amount || 0

        ).toLocaleString("en-IN")}

            </td>

            <td>

                ${statusBadge(

            booking.status

        )}

            </td>

            <td>

                <button
                    class="action-btn view-btn"
                    onclick="viewBooking(${booking.id})">

                    View

                </button>

            </td>

        `;

        bookingTableBody.appendChild(tr);

    });

}

/* ===========================================================
   STATUS BADGE
=========================================================== */

function statusBadge(status) {

    switch (

    (status || "").toLowerCase()

    ) {

        case "confirmed":

            return `

            <span class="badge badge-success">

                Confirmed

            </span>

            `;

        case "cancelled":

            return `

            <span class="badge badge-danger">

                Cancelled

            </span>

            `;

        case "checkedin":

            return `

            <span class="badge badge-warning">

                Checked In

            </span>

            `;

        default:

            return `

            <span class="badge">

                ${status || "-"}

            </span>

            `;

    }

}

/* ===========================================================
   DATE FORMAT
=========================================================== */

function formatDate(date) {

    if (!date) return "-";

    return new Date(date)

        .toLocaleDateString(

            "en-IN",

            {

                day: "2-digit",

                month: "short",

                year: "numeric"

            }

        );

}

/* ===========================================================
   VIEW BOOKING
=========================================================== */

function viewBooking(id) {

    selectedBooking = booking;

    const booking = bookings.find(

        b => Number(b.id) === Number(id)

    );

    if (!booking) {

        alert("Booking not found.");

        return;

    }

    const details = `

        <table class="receipt-table">

            <tr>
                <td>Booking ID</td>
                <td>#${booking.id}</td>
            </tr>

            <tr>
                <td>Guest Name</td>
                <td>${booking.guest_name || "-"}</td>
            </tr>

            <tr>
                <td>Mobile</td>
                <td>${booking.mobile || "-"}</td>
            </tr>

            <tr>
                <td>Room</td>
                <td>${booking.room_name || "-"}</td>
            </tr>

            <tr>
                <td>Booking Type</td>
                <td>${booking.booking_type || "-"}</td>
            </tr>

            <tr>
                <td>Check-In</td>
                <td>${formatDate(booking.from_date)}</td>
            </tr>

            <tr>
                <td>Check-Out</td>
                <td>${formatDate(booking.to_date)}</td>
            </tr>

            <tr>
                <td>Guests</td>
                <td>${booking.people || "-"}</td>
            </tr>

            <tr>
                <td>ID Proof</td>
                <td>${booking.id_proof || "-"}</td>
            </tr>

            <tr>
                <td>ID Number</td>
                <td>${booking.id_proof_no || "-"}</td>
            </tr>

            <tr>
                <td>Status</td>
                <td>${booking.status}</td>
            </tr>

        </table>

        <div class="receipt-total">

            Total :
            ${formatCurrency(booking.total_amount)}

        </div>

        ${booking.id_proof_image
            ? `
                <div style="margin-top:25px;text-align:center;">

                    <img
                        src="${booking.id_proof_image}"
                        style="
                            max-width:320px;
                            border-radius:12px;
                            border:1px solid #ddd;
                        ">

                </div>
                `
            : ""
        }

    `;

    const cancelReceiptBtn =
        document.getElementById("cancelReceiptBtn");

    if (typeof receiptContent !== "undefined" &&
        typeof receiptModal !== "undefined") {

        receiptContent.innerHTML = details;

        receiptModal.classList.remove("hidden");

    } else {

        alert("Receipt modal is not available.");

    }

}
/* ===========================================================
   BookMyRoom Enterprise
   Part 5 - Search & Filters
=========================================================== */

/* ===========================================================
   FILTER BOOKINGS
=========================================================== */

function filterBookings() {

    const guestText =
        (searchGuest.value || "")
            .trim()
            .toLowerCase();

    const roomText =
        roomFilter.value;

    const statusText =
        statusFilter.value;

    const dateText =
        dateFilter.value;

    filteredBookings = bookings.filter(booking => {

        /* -----------------------
           Guest Search
        ----------------------- */

        const guestMatch =

            !guestText ||

            (booking.guest_name || "")
                .toLowerCase()
                .includes(guestText) ||

            (booking.mobile || "")
                .includes(guestText);

        /* -----------------------
           Room Filter
        ----------------------- */

        const roomMatch =

            !roomText ||

            (booking.room_name || "")
                .toLowerCase()
                .includes(
                    roomText.toLowerCase()
                );

        /* -----------------------
           Status Filter
        ----------------------- */

        const statusMatch =

            !statusText ||

            (booking.status || "")
                .toLowerCase() ===

            statusText.toLowerCase();

        /* -----------------------
           Date Filter
        ----------------------- */

        const dateMatch =

            !dateText ||

            booking.from_date === dateText;

        return (

            guestMatch &&

            roomMatch &&

            statusMatch &&

            dateMatch

        );

    });

    renderBookings();

    updateResultCount();

}

/* ===========================================================
   RESULT COUNT
=========================================================== */

function updateResultCount() {

    const total =
        filteredBookings.length;

    console.log(

        "Bookings Found :",

        total

    );

}

/* ===========================================================
   CLEAR FILTERS
=========================================================== */

function clearFilters() {

    searchGuest.value = "";

    roomFilter.value = "";

    statusFilter.value = "";

    dateFilter.value = "";

    filteredBookings =

        [...bookings];

    renderBookings();

}

/* ===========================================================
   REFRESH
=========================================================== */

async function refreshBookings() {

    await loadBookings();

    clearFilters();

}

/* ===========================================================
   BookMyRoom Enterprise
   Part 6 - Export & Print
=========================================================== */

/* ===========================================================
   EXPORT CSV (Excel)
=========================================================== */

function exportExcel() {

    if (filteredBookings.length === 0) {

        alert("No bookings available.");

        return;

    }

    const headers = [

        "Booking ID",
        "Room",
        "Guest",
        "Mobile",
        "Check In",
        "Check Out",
        "Booking Type",
        "Amount",
        "Status"

    ];

    const rows = filteredBookings.map(b => [

        b.id,
        b.room_name,
        b.guest_name,
        b.mobile,
        formatDate(b.from_date),
        formatDate(b.to_date),
        b.booking_type,
        b.total_amount,
        b.status

    ]);

    const csv = [

        headers.join(","),

        ...rows.map(r =>

            r.map(value =>

                `"${value ?? ""}"`

            ).join(",")

        )

    ].join("\n");

    const blob = new Blob(

        [csv],

        {

            type:

                "text/csv;charset=utf-8;"

        }

    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download =

        "BookMyRoom_Bookings.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

}

/* ===========================================================
   EXPORT PDF
=========================================================== */

function exportPDF() {

    const html = createPrintableHTML();

    const win = window.open(

        "",

        "_blank"

    );

    win.document.write(html);

    win.document.close();

    win.focus();

    win.print();

}

/* ===========================================================
   PRINT
=========================================================== */

function printBookings() {

    exportPDF();

}

/* ===========================================================
   HISTORY
=========================================================== */

function showHistory() {

    alert(

        "Showing complete booking history.\n\n" +

        "Total Bookings : " +

        filteredBookings.length

    );

}

/* ===========================================================
   PRINT TEMPLATE
=========================================================== */

function createPrintableHTML() {

    let rows = "";

    filteredBookings.forEach(b => {

        rows += `

        <tr>

            <td>${b.id}</td>

            <td>${b.room_name}</td>

            <td>${b.guest_name}</td>

            <td>${b.mobile}</td>

            <td>${formatDate(b.from_date)}</td>

            <td>${formatDate(b.to_date)}</td>

            <td>${b.booking_type}</td>

            <td>₹${b.total_amount}</td>

            <td>${b.status}</td>

        </tr>

        `;

    });

    return `

<!DOCTYPE html>

<html>

<head>

<title>

BookMyRoom Report

</title>

<style>

body{

font-family:Arial;

padding:30px;

}

h1{

text-align:center;

}

table{

width:100%;

border-collapse:collapse;

margin-top:20px;

}

th,td{

border:1px solid #ddd;

padding:10px;

}

th{

background:#0f766e;

color:white;

}

</style>

</head>

<body>

<h1>

BookMyRoom Booking Report

</h1>

<p>

Generated :

${new Date().toLocaleString("en-IN")}

</p>

<table>

<thead>

<tr>

<th>ID</th>

<th>Room</th>

<th>Guest</th>

<th>Mobile</th>

<th>Check In</th>

<th>Check Out</th>

<th>Type</th>

<th>Amount</th>

<th>Status</th>

</tr>

</thead>

<tbody>

${rows}

</tbody>

</table>

</body>

</html>

`;

}

/* ===========================================================
   BookMyRoom Enterprise
   Part 7 - Navigation & Logout
=========================================================== */

/* ===========================================================
   SIDEBAR NAVIGATION
=========================================================== */

registerNavigation();

function registerNavigation() {

    const bookingsMenu =
        document.getElementById("bookingsMenu");

    const guestsMenu =
        document.getElementById("guestsMenu");

    const roomsMenu =
        document.getElementById("roomsMenu");

    const calendarMenu =
        document.getElementById("calendarMenu");

    const reportsMenu =
        document.getElementById("reportsMenu");

    const settingsMenu =
        document.getElementById("settingsMenu");

    if (bookingsMenu) {

        bookingsMenu.addEventListener(

            "click",

            () => {

                document
                    .querySelector(".table-card")
                    ?.scrollIntoView({

                        behavior: "smooth"

                    });

            }

        );

    }

    if (guestsMenu) {

        guestsMenu.addEventListener(

            "click",

            () => {

                alert(

                    "Guest Management\n\nComing Soon"

                );

            }

        );

    }

    if (roomsMenu) {

        roomsMenu.addEventListener(

            "click",

            () => {

                alert(

                    "Room Management\n\nComing Soon"

                );

            }

        );

    }

    if (calendarMenu) {

        calendarMenu.addEventListener(

            "click",

            () => {

                alert(

                    "Occupancy Calendar\n\nComing Soon"

                );

            }

        );

    }

    if (reportsMenu) {

        reportsMenu.addEventListener(

            "click",

            () => {

                exportPDF();

            }

        );

    }

    if (settingsMenu) {

        settingsMenu.addEventListener(

            "click",

            () => {

                alert(

                    "Application Settings\n\nComing Soon"

                );

            }

        );

    }

}

const cancelReceiptBtn =
    document.getElementById("cancelReceiptBtn");

if (cancelReceiptBtn) {

    cancelReceiptBtn.addEventListener(

        "click",

        cancelSelectedBooking

    );

}

/* ===========================================================
   CANCEL BOOKING
=========================================================== */

async function cancelSelectedBooking() {

    if (!selectedBooking) {

        return;

    }

    if (

        !confirm(

            `Cancel Booking #${selectedBooking.id}?`

        )

    ) {

        return;

    }

    try {

        await apiRequest(

            `/bookings/${selectedBooking.id}`,

            "DELETE"

        );

        receiptModal.classList.add(

            "hidden"

        );

        await initializeDashboard();

        alert(

            "Booking cancelled successfully."

        );

    }

    catch (err) {

        handleError(err);

    }

}

/* ===========================================================
   LOGOUT
=========================================================== */

function logout(event) {

    if (event) {

        event.preventDefault();

    }

    if (!confirm("Are you sure you want to logout?")) {

        return;

    }

    localStorage.removeItem("bookmyroom_user");

    sessionStorage.removeItem("bookmyroom_token");

    window.location.href = "index.html";

}

/* ===========================================================
   SESSION CHECK
=========================================================== */

setInterval(

    () => {

        const user = getUser();

        if (!user) {

            alert(

                "Session expired."

            );

            window.location.replace(

                "index.html"

            );

        }

    },

    60000

);

/* ===========================================================
   AUTO REFRESH
=========================================================== */

const AUTO_REFRESH_MINUTES = 5;

setInterval(

    async () => {

        try {

            await initializeDashboard();

            console.log(

                "Dashboard refreshed."

            );

        }

        catch (e) {

            console.error(e);

        }

    },

    AUTO_REFRESH_MINUTES *

    60 *

    1000

);

/* ===========================================================
   WINDOW EVENTS
=========================================================== */

window.addEventListener(

    "focus",

    () => {

        initializeDashboard();

    }

);

window.addEventListener(

    "online",

    () => {

        console.log(

            "Internet Connected"

        );

    }

);

window.addEventListener(

    "offline",

    () => {

        alert(

            "Internet connection lost."

        );

    }

);

/* ===========================================================
   PAGE READY
=========================================================== */

console.log(

    "BookMyRoom Enterprise Admin Loaded"

);

/* ===========================================================
   BookMyRoom Enterprise
   Part 8 - Utilities
=========================================================== */

/* ===========================================================
   SAFE ELEMENT
=========================================================== */

function $(id) {

    return document.getElementById(id);

}

/* ===========================================================
   FORMAT DATE TIME
=========================================================== */

function formatDateTime(date) {

    if (!date) {

        return "-";

    }

    return new Date(date).toLocaleString(

        "en-IN",

        {

            day: "2-digit",

            month: "short",

            year: "numeric",

            hour: "2-digit",

            minute: "2-digit"

        }

    );

}

/* ===========================================================
   FORMAT CURRENCY
=========================================================== */

function formatCurrency(amount) {

    return "₹" +

        Number(amount || 0)

            .toLocaleString("en-IN");

}

/* ===========================================================
   FORMAT MOBILE
=========================================================== */

function formatMobile(mobile) {

    if (!mobile) {

        return "-";

    }

    return mobile.toString();

}

/* ===========================================================
   STATUS BADGE
=========================================================== */

function getStatusBadge(status) {

    switch (

    (status || "").toUpperCase()

    ) {

        case "CONFIRMED":

            return

            '<span class="badge badge-success">Confirmed</span>';

        case "CANCELLED":

            return

            '<span class="badge badge-danger">Cancelled</span>';

        case "CHECKEDIN":

            return

            '<span class="badge badge-warning">Checked In</span>';

        case "CHECKEDOUT":

            return

            '<span class="badge badge-primary">Checked Out</span>';

        default:

            return

            '<span class="badge">' +

                status +

                '</span>';

    }

}

/* ===========================================================
   TOAST
=========================================================== */

function toast(message) {

    console.log(message);

}

/* ===========================================================
   ERROR
=========================================================== */

function handleError(error) {

    console.error(error);

    alert(

        error.message ||

        "Unexpected Error"

    );

}

/* ===========================================================
   CONFIRM
=========================================================== */

function confirmAction(message) {

    return confirm(message);

}

/* ===========================================================
   DOWNLOAD JSON
=========================================================== */

function downloadJSON(filename, data) {

    const blob =

        new Blob(

            [

                JSON.stringify(

                    data,

                    null,

                    2

                )

            ],

            {

                type:

                    "application/json"

            }

        );

    const url =

        URL.createObjectURL(blob);

    const a =

        document.createElement("a");

    a.href = url;

    a.download = filename;

    a.click();

    URL.revokeObjectURL(url);

}

/* ===========================================================
   DOWNLOAD TEXT
=========================================================== */

function downloadText(filename, text) {

    const blob =

        new Blob(

            [text],

            {

                type:

                    "text/plain"

            }

        );

    const url =

        URL.createObjectURL(blob);

    const a =

        document.createElement("a");

    a.href = url;

    a.download = filename;

    a.click();

    URL.revokeObjectURL(url);

}

/* ===========================================================
   COPY TO CLIPBOARD
=========================================================== */

async function copyText(text) {

    try {

        await navigator.clipboard.writeText(text);

        toast(

            "Copied"

        );

    }

    catch (e) {

        console.error(e);

    }

}

/* ===========================================================
   SCROLL TO TOP
=========================================================== */

function scrollTopPage() {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}

/* ===========================================================
   VERSION
=========================================================== */

console.log(

    "%cBookMyRoom Enterprise",

    "color:#0f766e;font-size:18px;font-weight:bold"

);

console.log(

    "Admin Dashboard Loaded"

);

console.log(

    "Version 1.0"

);