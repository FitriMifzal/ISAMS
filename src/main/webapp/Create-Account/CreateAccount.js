/* ============================================================
   CREATEACCOUNT.JS — Create Teacher Account Logic
   Connects to database via TeacherController Servlet
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
    sessionStorage.setItem('profile_return_url', window.location.href);
});


/* ────────────────────────────────────────────────────────
   MESSAGE MODALS (Success / Error)
────────────────────────────────────────────────────────── */
function showSuccess(message) {
    document.getElementById('successMsg').innerText = message;
    new bootstrap.Modal(document.getElementById('successModal')).show();
}

function showError(message) {
    document.getElementById('errorMsg').innerText = message;
    new bootstrap.Modal(document.getElementById('errorModal')).show();
}

function closeSuccessModal() {
    bootstrap.Modal.getInstance(document.getElementById('successModal')).hide();
    window.location.href = "../Delete-Account/DeleteAccount.html";
}


/* ────────────────────────────────────────────────────────
   HANDLE FORM SUBMISSION - Register Teacher to Database
────────────────────────────────────────────────────────── */

function handleForm(event) {
    event.preventDefault();

    const t_name = document.getElementById("t_name").value.trim();
    const t_ic = document.getElementById("t_ic").value.trim();
    const t_email = document.getElementById("t_email").value.trim();
    const t_phonenum = document.getElementById("t_phonenum").value.trim();
    const t_pass = document.getElementById("t_pass").value.trim();


    // ✅ VALIDATION 1: SEMUA FIELD - NOT NULL (standardized)
    if (!t_name || !t_ic || !t_email || !t_phonenum || !t_pass) {
        showError("Please fill in all fields!");
        return;
    }

    // ✅ VALIDATION 2: IC Number must be numeric only and 10-20 digits
    if (!/^\d+$/.test(t_ic) || t_ic.length < 10 || t_ic.length > 20) {
        showError("Error: IC Number must contain only numbers, between 10-20 digits.");
        return;
    }

    // ✅ VALIDATION 3: Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(t_email)) {
        showError("Error: Please enter a valid email address.");
        return;
    }

    // ✅ VALIDATION 4: Phone number must be numeric
    if (!/^\d+$/.test(t_phonenum) || t_phonenum.length < 10) {
        showError("Error: Contact number must contain only numbers, minimum 10 digits.");
        return;
    }

    // ✅ VALIDATION 5: Password minimum 6 characters
    if (t_pass.length < 6) {
        showError("Error: Password must be at least 6 characters long.");
        return;
    }

    // ── SEND TO DATABASE VIA TEACHERCONTROLLER ──
    const formData = new URLSearchParams();
    formData.append("action", "register");
    formData.append("tName", t_name);
    formData.append("tIC", t_ic);
    formData.append("tPhoneNum", t_phonenum || "");
    formData.append("tEmail", t_email);
    formData.append("tPass", t_pass);
    formData.append("piId", localStorage.getItem('active_tId'));

    // Disable submit button to prevent double submission
    const submitBtn = document.querySelector('.btn-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registering...';

    // ============================================================
    // FIX: TAMBAH LOGGING UNTUK DEBUG
    // ============================================================
    console.log("Sending data to server:", {
        tName: t_name,
        tIC: t_ic,
        tEmail: t_email,
        tPhoneNum: t_phonenum,
        piId: localStorage.getItem('active_tId')
    });

    fetch("../TeacherController", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData.toString()
    })
    .then(response => {
        console.log("Response status:", response.status);
        return response.json();
    })
    .then(data => {
        console.log("Response data:", data);
        
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirm';

        if (data.status === "success") {
            showSuccess("Teacher account created successfully!");
        } else {
            // ============================================================
            // FIX: PAPAR ERROR YANG LEBIH DETAIL
            // ============================================================
            let errorMsg = data.message || "Failed to create account";
            
            // Check if it's a duplicate IC error
            if (errorMsg.includes("IC Number") || errorMsg.includes("already registered")) {
                errorMsg = "This IC Number is already registered in the system!";
            }
            
            showError("Error: " + errorMsg);
        }
    })
    .catch(error => {
        console.error("Fetch Error:", error);
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirm';
        showError("Failed to connect to server. Please make sure the server is running.\n\nError: " + error.message);
    });
}