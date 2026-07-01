/* =====================================================
   BookMyRoom Pro
   auth.js
   Part 1
===================================================== */

"use strict";

/* =====================================================
   ELEMENTS
===================================================== */

const adminTab = document.getElementById("adminTab");
const guestTab = document.getElementById("guestTab");

const adminLoginSection =
    document.getElementById("adminLogin");

const guestSection =
    document.getElementById("guestLogin");

const showGuestLoginBtn =
    document.getElementById("showGuestLogin");

const showGuestRegisterBtn =
    document.getElementById("showGuestRegister");

const guestLoginForm =
    document.getElementById("guestLoginForm");

const guestRegisterForm =
    document.getElementById("guestRegisterForm");

const adminLoginBtn =
    document.getElementById("adminLoginBtn");

const guestLoginBtn =
    document.getElementById("guestLoginBtn");

const guestRegisterBtn =
    document.getElementById("guestRegisterBtn");

/* =====================================================
   INITIALIZE
===================================================== */

document.addEventListener(

    "DOMContentLoaded",

    initializePage

);

function initializePage() {

    registerEvents();

    autoLogin();

}

/* =====================================================
   EVENTS
===================================================== */

function registerEvents() {

    if (adminTab) {

        adminTab.addEventListener(

            "click",

            showAdmin

        );

    }

    if (guestTab) {

        guestTab.addEventListener(

            "click",

            showGuest

        );

    }

    if (showGuestLoginBtn) {

        showGuestLoginBtn.addEventListener(

            "click",

            openGuestLogin

        );

    }

    if (showGuestRegisterBtn) {

        showGuestRegisterBtn.addEventListener(

            "click",

            openGuestRegister

        );

    }

    if (adminLoginBtn) {

        adminLoginBtn.addEventListener(

            "click",

            adminLogin

        );

    }

    if (guestLoginBtn) {

        guestLoginBtn.addEventListener(

            "click",

            guestLogin

        );

    }

    if (guestRegisterBtn) {

        guestRegisterBtn.addEventListener(

            "click",

            guestRegister

        );

    }

}

/* =====================================================
   TAB SWITCHING
===================================================== */

function showAdmin() {

    adminTab.classList.add("active");
    guestTab.classList.remove("active");

    adminLoginSection.classList.remove("hidden");
    guestSection.classList.add("hidden");

}

function showGuest() {

    guestTab.classList.add("active");
    adminTab.classList.remove("active");

    guestSection.classList.remove("hidden");
    adminLoginSection.classList.add("hidden");

    openGuestLogin();

}

/* =====================================================
   GUEST LOGIN / REGISTER SWITCH
===================================================== */

function openGuestLogin() {

    guestLoginForm.classList.remove("hidden");

    guestRegisterForm.classList.add("hidden");

    showGuestLoginBtn.classList.add("active");

    showGuestRegisterBtn.classList.remove("active");

}

function openGuestRegister() {

    guestRegisterForm.classList.remove("hidden");

    guestLoginForm.classList.add("hidden");

    showGuestRegisterBtn.classList.add("active");

    showGuestLoginBtn.classList.remove("active");

}

/* =====================================================
   ADMIN LOGIN
===================================================== */

async function adminLogin() {

    try {

        const username =
            document
            .getElementById("adminUsername")
            .value
            .trim();

        const password =
            document
            .getElementById("adminPassword")
            .value;

        if (!username || !password) {

            alert(

                "Enter Username and Password"

            );

            return;

        }

        const result = await apiRequest(

            "/auth/login",

            "POST",

            {

                username,

                password

            }

        );

        saveUser({

            ...result.user,

            role: "ADMIN"

        });

        window.location.href =
            "admin.html";

    }

    catch (err) {

        alert(

            err.message

        );

    }

}

/* =====================================================
   GUEST REGISTER
===================================================== */

async function guestRegister() {

    try {

        const guest_name =
            document
            .getElementById("guestName")
            .value
            .trim();

        const mobile =
            document
            .getElementById("guestRegisterMobile")
            .value
            .trim();

        const password =
            document
            .getElementById("guestRegisterPassword")
            .value;

        if (!guest_name) {

            alert("Enter Full Name");

            return;

        }

        if (!mobile) {

            alert("Enter Mobile Number");

            return;

        }

        if (mobile.length !== 10) {

            alert("Mobile Number must be 10 digits");

            return;

        }

        if (!password) {

            alert("Enter Password");

            return;

        }

        const result =
            await apiRequest(

                "/guests/register",

                "POST",

                {

                    guest_name,

                    mobile,

                    password

                }

            );

        saveUser({

            ...result.guest,

            role: "GUEST"

        });

        alert(

            "Registration Successful"

        );

        window.location.href =
            "dashboard.html";

    }

    catch (err) {

        alert(err.message);

    }

}

/* =====================================================
   GUEST LOGIN
===================================================== */

async function guestLogin() {

    try {

        const mobile =
            document
            .getElementById("guestMobile")
            .value
            .trim();

        const password =
            document
            .getElementById("guestPassword")
            .value;

        if (!mobile) {

            alert("Enter Mobile Number");

            return;

        }

        if (!password) {

            alert("Enter Password");

            return;

        }

        const result =
            await apiRequest(

                "/guests/login",

                "POST",

                {

                    mobile,

                    password

                }

            );

        saveUser({

            ...result.guest,

            role: "GUEST"

        });

        window.location.href =
            "dashboard.html";

    }

    catch (err) {

        alert(err.message);

    }

}

/* =====================================================
   AUTO LOGIN
===================================================== */

function autoLogin() {

    const currentUser = getUser();

    if (!currentUser) {

        return;

    }

    if (

        window.location.pathname.endsWith("index.html") ||

        window.location.pathname === "/"

    ) {

        if (currentUser.role === "ADMIN") {

            window.location.href =
                "admin.html";

        }

        else {

            window.location.href =
                "dashboard.html";

        }

    }

}

/* =====================================================
   ENTER KEY SUPPORT
===================================================== */

document.addEventListener(

    "keydown",

    function (e) {

        if (e.key !== "Enter") {

            return;

        }

        if (

            !adminLoginSection.classList.contains("hidden")

        ) {

            adminLogin();

        }

        else if (

            !guestLoginForm.classList.contains("hidden")

        ) {

            guestLogin();

        }

        else {

            guestRegister();

        }

    }

);

console.log("auth.js loaded successfully");