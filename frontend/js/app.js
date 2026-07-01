/* ===================================================
   BookMyRoom Pro
   app.js (Part 1)
=================================================== */

const API_BASE =
    "https://YOUR-RENDER-URL.onrender.com/api";

let currentUser = null;

/* ===================================================
   ELEMENTS
=================================================== */

const employeeTab =
document.getElementById("employeeTab");

const guestTab =
document.getElementById("guestTab");

const employeePanel =
document.getElementById("employeePanel");

const guestPanel =
document.getElementById("guestPanel");

const guestRegisterTab =
document.getElementById("guestRegisterTab");

const guestLoginTab =
document.getElementById("guestLoginTab");

const guestRegisterPanel =
document.getElementById("guestRegisterPanel");

const guestLoginPanel =
document.getElementById("guestLoginPanel");

const loginMessage =
document.getElementById("loginMessage");

const employeeLoginBtn =
document.getElementById("employeeLoginBtn");

const registerGuestBtn =
document.getElementById("registerGuestBtn");

const guestLoginBtn =
document.getElementById("guestLoginBtn");

/* ===================================================
   STARTUP
=================================================== */

window.addEventListener(
    "load",
    initialiseApp
);

function initialiseApp(){

    restoreSession();

    bindEvents();

}

/* ===================================================
   EVENTS
=================================================== */

function bindEvents(){

    employeeTab.addEventListener(
        "click",
        showEmployee
    );

    guestTab.addEventListener(
        "click",
        showGuest
    );

    guestRegisterTab.addEventListener(
        "click",
        showGuestRegister
    );

    guestLoginTab.addEventListener(
        "click",
        showGuestLogin
    );

    employeeLoginBtn.addEventListener(
        "click",
        employeeLogin
    );

    registerGuestBtn.addEventListener(
        "click",
        registerGuest
    );

    guestLoginBtn.addEventListener(
        "click",
        guestLogin
    );

}

/* ===================================================
   SCREEN SWITCH
=================================================== */

function showEmployee(){

    employeeTab.classList.add("active");
    guestTab.classList.remove("active");

    employeePanel.classList.remove("hidden");
    guestPanel.classList.add("hidden");

    clearMessage();

}

function showGuest(){

    guestTab.classList.add("active");
    employeeTab.classList.remove("active");

    guestPanel.classList.remove("hidden");
    employeePanel.classList.add("hidden");

    showGuestRegister();

}

function showGuestRegister(){

    guestRegisterTab.classList.add("active");
    guestLoginTab.classList.remove("active");

    guestRegisterPanel.classList.remove("hidden");
    guestLoginPanel.classList.add("hidden");

}

function showGuestLogin(){

    guestLoginTab.classList.add("active");
    guestRegisterTab.classList.remove("active");

    guestLoginPanel.classList.remove("hidden");
    guestRegisterPanel.classList.add("hidden");

}

/* ===================================================
   EMPLOYEE LOGIN
=================================================== */

async function employeeLogin(){

    clearMessage();

    const employee_id =
        document.getElementById("employeeId").value.trim();

    const password =
        document.getElementById("employeePassword").value;

    if(
        !employee_id ||
        !password
    ){

        showError(
            "Employee ID and Password are required."
        );

        return;

    }

    try{

        const response =
        await fetch(
            `${API_BASE}/auth/login`,
            {

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({

                    employee_id,
                    password

                })

            }
        );

        const result =
            await response.json();

        if(!response.ok){

            showError(
                result.message
            );

            return;

        }

        currentUser=result.user;

        saveSession();

        redirectToDashboard();

    }

    catch(err){

        showError(
            "Unable to connect to server."
        );

    }

}

/* ===================================================
   REGISTER GUEST
=================================================== */

async function registerGuest(){

    clearMessage();

    const guest_name =
    document.getElementById("guestName").value.trim();

    const mobile =
    document.getElementById("guestMobile").value.trim();

    const email =
    document.getElementById("guestEmail").value.trim();

    const password =
    document.getElementById("guestPassword").value;

    const confirmPassword =
    document.getElementById("guestConfirmPassword").value;

    if(

        !guest_name ||

        !mobile ||

        !password ||

        !confirmPassword

    ){

        showError(
            "Please complete all mandatory fields."
        );

        return;

    }

    if(password!==confirmPassword){

        showError(
            "Passwords do not match."
        );

        return;

    }

    try{

        const response =
        await fetch(

            `${API_BASE}/guests/register`,

            {

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({

                    guest_name,
                    mobile,
                    email,
                    password

                })

            }

        );

        const result =
        await response.json();

        if(!response.ok){

            showError(
                result.message
            );

            return;

        }

        currentUser={

            id:result.guest.id,

            name:result.guest.guest_name,

            mobile:result.guest.mobile,

            role:"GUEST"

        };

        saveSession();

        redirectToDashboard();

    }

    catch(err){

        showError(
            "Registration failed."
        );

    }

}

/* ===================================================
   GUEST LOGIN
=================================================== */

async function guestLogin(){

    clearMessage();

    const mobile =
    document.getElementById(
        "guestLoginMobile"
    ).value.trim();

    const password =
    document.getElementById(
        "guestLoginPassword"
    ).value;

    if(
        !mobile ||
        !password
    ){

        showError(
            "Mobile and Password required."
        );

        return;

    }

    try{

        const response =
        await fetch(

            `${API_BASE}/guests/login`,

            {

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({

                    mobile,
                    password

                })

            }

        );

        const result =
        await response.json();

        if(!response.ok){

            showError(
                result.message
            );

            return;

        }

        currentUser={

            id:result.guest.id,

            name:result.guest.guest_name,

            mobile:result.guest.mobile,

            role:"GUEST"

        };

        saveSession();

        redirectToDashboard();

    }

    catch(err){

        showError(
            "Unable to login."
        );

    }

}

/* ===================================================
   SESSION
=================================================== */

function saveSession(){

    localStorage.setItem(

        "bookmyroom_user",

        JSON.stringify(currentUser)

    );

}

function restoreSession(){

    const savedUser =
    localStorage.getItem(
        "bookmyroom_user"
    );

    if(!savedUser){

        return;

    }

    currentUser=
    JSON.parse(savedUser);

    redirectToDashboard();

}

function logout(){

    localStorage.removeItem(
        "bookmyroom_user"
    );

    currentUser=null;

    location.reload();

}

/* ===================================================
   MESSAGE
=================================================== */

function clearMessage(){

    loginMessage.textContent="";

    loginMessage.className="message";

}

function showError(text){

    loginMessage.textContent=text;

    loginMessage.className="message error";

}

function showSuccess(text){

    loginMessage.textContent=text;

    loginMessage.className="message success";

}

/* ===================================================
   REDIRECT
=================================================== */

function redirectToDashboard(){

    window.location.href="dashboard.html";

}