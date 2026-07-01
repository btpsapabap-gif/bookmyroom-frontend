/* =====================================================
   BookMyRoom Pro
   API Configuration
===================================================== */

const CONFIG = {

    DEV_API:
        "http://localhost:3001/api",

    PROD_API:
        "https://bookmyroom-pro-backend.onrender.com/api"

};

/* ============================================
   SUPABASE
============================================ */

const SUPABASE_URL =
    "https://cmspxwigighdoatffqqh.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_HGAWXgvf2Z3GGpvHH34fBA_TwYjFJbD";

/* ============================================
   AUTO DETECT ENVIRONMENT
============================================ */

const API_BASE =
    location.hostname === "localhost"
        ? CONFIG.DEV_API
        : CONFIG.PROD_API;

console.log("API :", API_BASE);


/* ============================================
   COMMON HEADERS
============================================ */

const JSON_HEADERS = {

    "Content-Type": "application/json"

};

const ID_PROOF_BUCKET = "idproofs";

/* ============================================
   API REQUEST
============================================ */

async function apiRequest(

    url,

    method = "GET",

    body = null

) {

    const options = {

        method,

        headers: JSON_HEADERS

    };

    if (body) {

        options.body = JSON.stringify(body);

    }

    const response = await fetch(

        API_BASE + url,

        options

    );

    const data = await response.json();

    if (!response.ok) {

        throw new Error(

            data.message ||

            "Something went wrong"

        );

    }

    return data;

}


/* ============================================
   USER SESSION
============================================ */

function saveUser(user) {

    localStorage.setItem(

        "bookmyroom_user",

        JSON.stringify(user)

    );

}

function getUser() {

    return JSON.parse(

        localStorage.getItem(

            "bookmyroom_user"

        )

    );

}

function logout() {

    localStorage.removeItem(

        "bookmyroom_user"

    );

    window.location.href = "index.html";

}