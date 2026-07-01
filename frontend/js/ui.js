/* ==========================================================
   BookMyRoom Pro
   UI Library
========================================================== */

const UI = (() => {

    let toastContainer = null;
    let loaderElement = null;

    /* ======================================================
       INITIALIZE
    ====================================================== */

    function init() {

        createToastContainer();
        createLoader();

    }

    /* ======================================================
       TOAST
    ====================================================== */

    function createToastContainer() {

        toastContainer =
            document.getElementById("toastContainer");

        if (toastContainer) return;

        toastContainer =
            document.createElement("div");

        toastContainer.id =
            "toastContainer";

        toastContainer.className =
            "toast-container";

        document.body.appendChild(
            toastContainer
        );

    }

    function toast(message, type = "success", duration = 3000) {

        const item =
            document.createElement("div");

        item.className =
            `toast ${type}`;

        item.innerHTML = `
            <span>${message}</span>
        `;

        toastContainer.appendChild(item);

        setTimeout(() => {

            item.classList.add("show");

        }, 50);

        setTimeout(() => {

            item.classList.remove("show");

            setTimeout(() => {

                item.remove();

            }, 300);

        }, duration);

    }

    function success(message) {

        toast(message, "success");

    }

    function error(message) {

        toast(message, "error");

    }

    function warning(message) {

        toast(message, "warning");

    }

    function info(message) {

        toast(message, "info");

    }

    /* ======================================================
       LOADER
    ====================================================== */

    function createLoader() {

        loaderElement =
            document.getElementById("globalLoader");

        if (loaderElement) return;

        loaderElement =
            document.createElement("div");

        loaderElement.id =
            "globalLoader";

        loaderElement.className =
            "loader-overlay hidden";

        loaderElement.innerHTML = `

            <div class="loader-box">

                <div class="spinner"></div>

                <p>

                    Loading...

                </p>

            </div>

        `;

        document.body.appendChild(
            loaderElement
        );

    }

    function showLoader() {

        loaderElement.classList.remove(
            "hidden"
        );

    }

    function hideLoader() {

        loaderElement.classList.add(
            "hidden"
        );

    }

    /* ======================================================
       MODAL
    ====================================================== */

    function openModal(id) {

        const modal =
            document.getElementById(id);

        if (!modal) return;

        modal.classList.remove(
            "hidden"
        );

        document.body.style.overflow =
            "hidden";

    }

    function closeModal(id) {

        const modal =
            document.getElementById(id);

        if (!modal) return;

        modal.classList.add(
            "hidden"
        );

        document.body.style.overflow =
            "";

    }

    /* ======================================================
       PROFILE MENU
    ====================================================== */

    function toggleProfileMenu() {

        const popup =
            document.getElementById(
                "profilePopup"
            );

        if (!popup) return;

        popup.classList.toggle(
            "show"
        );

    }

    function closeProfileMenu() {

        const popup =
            document.getElementById(
                "profilePopup"
            );

        if (!popup) return;

        popup.classList.remove(
            "show"
        );

    }

    /* ======================================================
       CONFIRM DIALOG
    ====================================================== */

    async function confirmBox(message) {

        return window.confirm(message);

    }

    /* ======================================================
       EMPTY STATE
    ====================================================== */

    function showEmpty(containerId, text) {

        const container =
            document.getElementById(containerId);

        if (!container) return;

        container.innerHTML = `

            <div class="empty-state">

                <h3>

                    ${text}

                </h3>

            </div>

        `;

    }

    /* ======================================================
       CLEAR CONTAINER
    ====================================================== */

    function clear(containerId) {

        const container =
            document.getElementById(containerId);

        if (!container) return;

        container.innerHTML = "";

    }

    /* ======================================================
       PROFILE
    ====================================================== */

    function loadProfile(user) {

        if (!user) return;

        const profileCircle =
            document.getElementById(
                "profileCircle"
            );

        const loggedUser =
            document.getElementById(
                "loggedUser"
            );

        const roleDisplay =
            document.getElementById(
                "roleDisplay"
            );

        if (profileCircle) {

            profileCircle.textContent =
                user.name
                    .charAt(0)
                    .toUpperCase();

        }

        if (loggedUser) {

            loggedUser.textContent =
                user.name;

        }

        if (roleDisplay) {

            roleDisplay.textContent =
                user.role;

        }

    }

    /* ======================================================
       EXPORTS
    ====================================================== */

    return {

        init,

        success,

        error,

        warning,

        info,

        showLoader,

        hideLoader,

        openModal,

        closeModal,

        toggleProfileMenu,

        closeProfileMenu,

        confirmBox,

        showEmpty,

        clear,

        loadProfile

    };

})();

/* ==========================================================
   START
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        UI.init();

        document.addEventListener(
            "click",
            (e) => {

                const popup =
                    document.getElementById(
                        "profilePopup"
                    );

                const profile =
                    document.getElementById(
                        "profileCircle"
                    );

                if (
                    popup &&
                    profile &&
                    !popup.contains(e.target) &&
                    !profile.contains(e.target)
                ) {

                    UI.closeProfileMenu();

                }

            }
        );

    }
);