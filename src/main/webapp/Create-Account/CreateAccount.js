/* ============================================================
   CREATEACCOUNT.JS — Create Teacher Account Logic
   Connects to database via TeacherController Servlet
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
    sessionStorage.setItem('profile_return_url', window.location.href);
});


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


    // ✅ VALIDATION 1: Check each required field
    if (!t_name) {
        alert("Please fill in the Full Name field!");
        return;
    }
    if (!t_ic) {
        alert("Please fill in the IC Number field!");
        return;
    }
    if (!t_email) {
        alert("Please fill in the Email Address field!");
        return;
    }
    if (!t_pass) {
        alert("Please fill in the Password field!");
        return;
    }

    // ✅ VALIDATION 2: IC Number must be numeric only and 10-20 digits
    if (!/^\d+$/.test(t_ic) || t_ic.length < 10 || t_ic.length > 20) {
        alert("Error: IC Number must contain only numbers, between 10-20 digits.");
        return;
    }

    // ✅ VALIDATION 3: Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(t_email)) {
        alert("Error: Please enter a valid email address.");
        return;
    }

    // ✅ VALIDATION 4: Phone number (if provided) must be numeric
    if (t_phonenum && (!/^\d+$/.test(t_phonenum) || t_phonenum.length < 10)) {
        alert("Error: Contact number must contain only numbers, minimum 10 digits.");
        return;
    }

    // ✅ VALIDATION 5: Password minimum 6 characters
    if (t_pass.length < 6) {
        alert("Error: Password must be at least 6 characters long.");
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

    fetch("../TeacherController", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData.toString()
    })
    .then(response => response.json())
    .then(data => {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirm';

        if (data.status === "success") {
            alert("Teacher account created successfully!");
            // ✅ FIXED: Use correct folder name with capital letters
            window.location.href = "../Delete-Account/DeleteAccount.html";
        } else {
            alert("Error: " + (data.message || "Failed to create account"));
        }
    })
    .catch(error => {
        console.error("Error:", error);
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirm';
        alert("Failed to connect to server. Please make sure the server is running.");
    });
}