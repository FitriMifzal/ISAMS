function showRegistration() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('registration-section').style.display = 'block';
    document.getElementById('backBtn').style.display = 'block';
}

function showLogin() {
    document.getElementById('registration-section').style.display = 'none';
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('backBtn').style.display = 'none';
}

function askConfirmation() {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pass = document.getElementById('regPass').value;
    if (!name || !email || !pass) {
        alert("Please fill in Name, Email and Password!");
        return;
    }
    document.getElementById('confirmModal').style.display = 'block';
}

function processConfirm() {
    const ic = document.getElementById('regIC').value.trim();
    const name = document.getElementById('regName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pass = document.getElementById('regPass').value;

    const formData = new URLSearchParams();
    formData.append("tName", name);
    formData.append("tIC", ic);
    formData.append("tPhoneNum", phone);
    formData.append("tEmail", email);
    formData.append("tPass", pass);

    fetch("../TeacherController?action=register", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData.toString()
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('confirmModal').style.display = 'none';
        if (data.status === "success") {
            alert("Account created successfully!");
            showLogin();
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(error => {
        console.error("Error:", error);
        document.getElementById('confirmModal').style.display = 'none';
        alert("Failed to connect to server. Please try again.");
    });
}

// switch input label depending on selected login role
function handleRoleChange() {
    const selectedRole = document.querySelector('input[name="loginRole"]:checked').value;
    const loginIDLabel = document.getElementById('loginIDLabel');
    const loginIDInput = document.getElementById('loginID');

    if (selectedRole === "Penyelaras Intervensi") {
        loginIDLabel.textContent = "ID Number";
        loginIDInput.placeholder = "Enter your ID Number";
    } else {
        loginIDLabel.textContent = "IC Number";
        loginIDInput.placeholder = "Enter your IC Number";
    }
}

function togglePasswordVisibility(inputId, buttonId) {
    const passInput = document.getElementById(inputId);
    const buttonEl = document.getElementById(buttonId);

    if (passInput.type === "password") {
        passInput.type = "text";
        buttonEl.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        `;
    } else {
        passInput.type = "password";
        buttonEl.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
        `;
    }
}

// login - Teacher role checks against real database
function checkLogin() {
    const inputID = document.getElementById('loginID').value.trim();
    const inputPass = document.getElementById('loginPass').value;
    const selectedRole = document.querySelector('input[name="loginRole"]:checked').value;

    if (selectedRole === "Penyelaras Intervensi") {
        // PI login kept as a fixed admin check for now
        if (inputID.toUpperCase() === "ADMIN123" && inputPass === "PASSWORD123") {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('active_role', "Penyelaras Intervensi");
            localStorage.setItem('active_name', "Admin Penyelaras");
            window.location.href = "../Dashboard/Dashboard.html";
        } else {
            alert("Invalid Admin Credentials!");
        }
        return;
    }

    // Teacher role - real login against the database
    const formData = new URLSearchParams();
    formData.append("tIC", inputID);
    formData.append("tPass", inputPass);

    fetch("../LoginServlet", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData.toString()
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('active_role', "Subject Teacher");
            localStorage.setItem('active_name', data.tName);
            localStorage.setItem('active_tId', data.tId);
            window.location.href = "../Dashboard/Dashboard.html";
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Failed to connect to server. Please try again.");
    });
}

function processCancel() {
    document.getElementById('confirmModal').style.display = 'none';
}