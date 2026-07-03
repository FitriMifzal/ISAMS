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
    const id = document.getElementById('regID').value.trim();
    const name = document.getElementById('regName').value.trim();
    const pass = document.getElementById('regPass').value;
    if(!id || !pass || !name) { 
        alert("Please fill in ID, Name and Password!"); 
        return; 
    }
    document.getElementById('confirmModal').style.display = 'block'; 
}

function processConfirm() {
    const id = document.getElementById('regID').value.trim();
    const ic = document.getElementById('regIC').value.trim();
    const name = document.getElementById('regName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pass = document.getElementById('regPass').value;
    
    // Simpan semua data ke localStorage
    localStorage.setItem('reg_id', id);
    localStorage.setItem('reg_ic', ic);
    localStorage.setItem('reg_name', name);
    localStorage.setItem('reg_phone', phone);
    localStorage.setItem('reg_email', email);
    localStorage.setItem('reg_pass', pass);
    
    alert("Account created successfully!");
    document.getElementById('confirmModal').style.display = 'none';
    showLogin();
}

// Menukar label input mengikut pilihan Radio Button
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

// ── LOGIK LOG IN/OUT IKON MATA BERIKUTAN IMEJ SVG YANG DIMINTA ──
function togglePasswordVisibility(inputId, buttonId) {
    const passInput = document.getElementById(inputId);
    const buttonEl = document.getElementById(buttonId);
    
    if (passInput.type === "password") {
        passInput.type = "text";
        // MASUKKAN IKON MATA TERBUKA BERSIH (Bila teks password kelihatan)
        buttonEl.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        `;
    } else {
        passInput.type = "password";
        // MASUKKAN IKON MATA BERGARIS/PANGKAH (Bila teks disembunyikan semula menjadi ****)
        buttonEl.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
        `;
    }
}

function checkLogin() {
    const inputID = document.getElementById('loginID').value.trim();
    const inputPass = document.getElementById('loginPass').value;
    const selectedRole = document.querySelector('input[name="loginRole"]:checked').value;

    if (selectedRole === "Penyelaras Intervensi") {
        if (inputID.toUpperCase() === "ADMIN123" && inputPass === "PASSWORD123") {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('active_role', "Penyelaras Intervensi");
            localStorage.setItem('active_name', "Admin Penyelaras");
            window.location.href = "../Dashboard/Dashboard.html";
        } else { 
            alert("Invalid Admin Credentials!"); 
        }
    } else {
        const storedIC = localStorage.getItem('reg_ic');
        const storedPass = localStorage.getItem('reg_pass');
        const storedName = localStorage.getItem('reg_name');

        if (storedIC && inputID === storedIC && inputPass === storedPass) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('active_role', "Teacher");
            localStorage.setItem('active_name', storedName);
            window.location.href = "Dashboard.html"; 
        } else { 
            alert("Invalid Teacher Credentials!"); 
        }
    }
}

function processCancel() { 
    document.getElementById('confirmModal').style.display = 'none'; 
}