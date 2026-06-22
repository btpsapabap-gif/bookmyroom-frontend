const API_BASE =
  "https://bookmyroom-api-aupi.onrender.com/api";

const employeeIdInput =
  document.getElementById("employeeId");

const employeeNameInput =
  document.getElementById("employeeName");

const roleSelect =
  document.getElementById("role");

const createUserBtn =
  document.getElementById("createUserBtn");

const messageEl =
  document.getElementById("message");

createUserBtn.addEventListener(
  "click",
  createUser
);

async function createUser() {

  const employee_id =
    employeeIdInput.value.trim();

  const name =
    employeeNameInput.value.trim();

  const role =
    roleSelect.value;

  if (!employee_id || !name) {
    messageEl.textContent =
      "Employee ID and Name are required";
    return;
  }

  createUserBtn.disabled = true;
  messageEl.textContent = "Creating user...";

  try {

    const response =
      await fetch(
        `${API_BASE}/users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            employee_id,
            name,
            role
          })
        }
      );

    const result =
      await response.json();

    if (!result.success) {

      messageEl.textContent =
        result.message ||
        "Unable to create user";

      return;
    }

    messageEl.textContent =
      `User ${result.user.name} created successfully`;

    employeeIdInput.value = "";
    employeeNameInput.value = "";
    roleSelect.value = "USER";

  } catch (err) {

    console.error(err);

    messageEl.textContent =
      "Server connection failed";

  } finally {

    createUserBtn.disabled = false;

  }
}