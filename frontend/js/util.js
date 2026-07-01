/* ==========================================================
   BookMyRoom Pro
   Utility Functions
========================================================== */

/* ==========================================================
   LOCAL STORAGE
========================================================== */

const Storage = {

    get(key) {

        try {

            const value = localStorage.getItem(key);

            return value ? JSON.parse(value) : null;

        } catch (err) {

            console.error("Storage Get Error:", err);

            return null;

        }

    },

    set(key, value) {

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

    },

    remove(key) {

        localStorage.removeItem(key);

    },

    clear() {

        localStorage.clear();

    }

};

/* ==========================================================
   DATE
========================================================== */

function formatDate(date) {

    if (!date) return "";

    return new Date(date)
        .toLocaleDateString(
            "en-IN",
            CONFIG.DATE_OPTIONS
        );

}

function getToday() {

    return new Date()
        .toISOString()
        .split("T")[0];

}

function calculateDays(fromDate, toDate) {

    const start = new Date(fromDate);

    const end = new Date(toDate);

    const diff =
        end.getTime() -
        start.getTime();

    return Math.ceil(
        diff /
        (1000 * 60 * 60 * 24)
    );

}

/* ==========================================================
   CURRENCY
========================================================== */

function formatCurrency(amount) {

    return Number(amount)
        .toLocaleString(
            "en-IN",
            {

                style: "currency",

                currency: "INR",

                minimumFractionDigits: 0

            }

        );

}

/* ==========================================================
   VALIDATION
========================================================== */

function isEmpty(value) {

    return (
        value === null ||

        value === undefined ||

        value.toString().trim() === ""
    );

}

function isValidMobile(mobile) {

    return /^[6-9]\d{9}$/
        .test(mobile);

}

function isValidEmail(email) {

    if (!email)
        return true;

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);

}

function isStrongPassword(password) {

    return password.length >= 6;

}

/* ==========================================================
   FILE VALIDATION
========================================================== */

function validateFile(file) {

    if (!file) {

        return {

            success: false,

            message: "Please select a file."

        };

    }

    if (

        !CONFIG.ALLOWED_FILE_TYPES.includes(

            file.type

        )

    ) {

        return {

            success: false,

            message: "Invalid file type."

        };

    }

    if (

        file.size >

        CONFIG.MAX_FILE_SIZE

    ) {

        return {

            success: false,

            message: "Maximum file size is 5 MB."

        };

    }

    return {

        success: true

    };

}

/* ==========================================================
   PROFILE
========================================================== */

function getCurrentUser() {

    return Storage.get(

        CONFIG.STORAGE.USER

    );

}

function saveCurrentUser(user) {

    Storage.set(

        CONFIG.STORAGE.USER,

        user

    );

}

function clearCurrentUser() {

    Storage.remove(

        CONFIG.STORAGE.USER

    );

}

function isLoggedIn() {

    return getCurrentUser() != null;

}

function isAdmin() {

    const user =
        getCurrentUser();

    return (

        user &&

        user.role ===

        CONFIG.ROLES.ADMIN

    );

}

function isGuest() {

    const user =
        getCurrentUser();

    return (

        user &&

        user.role ===

        CONFIG.ROLES.GUEST

    );

}

/* ==========================================================
   API
========================================================== */

async function apiRequest(

    url,

    options = {}

) {

    try {

        const response =

            await fetch(

                url,

                options

            );

        const data =

            await response.json();

        if (!response.ok) {

            throw new Error(

                data.message ||

                "Request Failed"

            );

        }

        return data;

    }

    catch (err) {

        console.error(err);

        throw err;

    }

}

/* ==========================================================
   DEBOUNCE
========================================================== */

function debounce(

    callback,

    delay = 400

) {

    let timer;

    return (...args) => {

        clearTimeout(timer);

        timer =

            setTimeout(

                () =>

                callback(...args),

                delay

            );

    };

}

/* ==========================================================
   LOADER
========================================================== */

function showLoader() {

    document.body.classList.add(

        "loading"

    );

}

function hideLoader() {

    document.body.classList.remove(

        "loading"

    );

}

/* ==========================================================
   RANDOM ID
========================================================== */

function uuid() {

    return crypto.randomUUID();

}

/* ==========================================================
   FLOOR
========================================================== */

function getFloor(roomType) {

    if (

        roomType === "AC"

    ) {

        return "First Floor";

    }

    return "Ground Floor";

}

/* ==========================================================
   BOOKING AMOUNT
========================================================== */

function calculateTotalAmount(

    rate,

    fromDate,

    toDate

) {

    const days = calculateDays(

        fromDate,

        toDate

    );

    return days * Number(rate);

}

/* ==========================================================
   IMAGE PREVIEW
========================================================== */

function previewImage(

    file,

    imageElement

) {

    if (!file)
        return;

    const reader =

        new FileReader();

    reader.onload =

        function (e) {

            imageElement.src =

                e.target.result;

        };

    reader.readAsDataURL(file);

}