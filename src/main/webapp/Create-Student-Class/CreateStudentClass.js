/* ============================================================
   CREATESTUDENTCLASS.JS — Create Classroom Logic
   Connects to database via ClassroomController
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
    sessionStorage.setItem('profile_return_url', window.location.href);
});

/* ────────────────────────────────────────────────────────
   TOGGLE PROFILE
────────────────────────────────────────────────────────── */
function toggleProfile() {
    sessionStorage.setItem('profile_return_url', window.location.href);
    window.location.href = '../Profile-Details/Profile-Details.html';
}

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
    window.location.href = "../Student Class/StudentClass.html";
}

/* ────────────────────────────────────────────────────────
   CHECK DUPLICATE CLASSROOM (BARU TAMBAH)
────────────────────────────────────────────────────────── */
function checkDuplicateClassroom(classCode, className) {
    return new Promise((resolve, reject) => {
        const params = new URLSearchParams();
        params.append("action", "checkDuplicate");
        if (classCode) params.append("classCode", classCode);
        if (className) params.append("className", className);

        fetch("../ClassroomController?" + params.toString())
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    resolve(data.isDuplicate);
                } else {
                    reject(data.message || "Failed to check duplicate");
                }
            })
            .catch(error => {
                reject(error);
            });
    });
}

/* ────────────────────────────────────────────────────────
   HANDLE FORM SUBMISSION - Send to Database
────────────────────────────────────────────────────────── */

function handleForm(event) {
    event.preventDefault();

    const classCode = document.getElementById("classCode").value.trim();
    const className = document.getElementById("className").value.trim();

    // ✅ VALIDATION 1: Check if all fields are filled
    if (!classCode || !className) {
        showError("Please fill in all the information!");
        return;
    }

    // ✅ VALIDATION 2: Class Code must be at least 3 characters
    if (classCode.length < 3) {
        showError("Class Code must be at least 3 characters long!");
        return;
    }

    // ✅ VALIDATION 3: Class Code cannot contain special characters
    const classCodeRegex = /^[a-zA-Z0-9\s\-_]+$/;
    if (!classCodeRegex.test(classCode)) {
        showError("Class Code can only contain letters, numbers, spaces, hyphens (-), and underscores (_)!");
        return;
    }

    // ✅ VALIDATION 4: Class Name must be at least 3 characters
    if (className.length < 3) {
        showError("Class Name must be at least 3 characters long!");
        return;
    }

    // ✅ VALIDATION 5: Class Name cannot contain special characters
    const classNameRegex = /^[a-zA-Z0-9\s\-_'.]+$/;
    if (!classNameRegex.test(className)) {
        showError("Class Name can only contain letters, numbers, spaces, hyphens (-), underscores (_), apostrophes ('), and periods (.)!");
        return;
    }

    // ============================================================
    // VALIDATION DUPLICATE CLASSROOM (BARU TAMBAH)
    // ============================================================
    // Disable submit button to prevent double submission
    const submitBtn = document.querySelector('.btn-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Checking...';

    checkDuplicateClassroom(classCode, className)
        .then(isDuplicate => {
            if (isDuplicate) {
                // ============================================================
                // PAPAR ERROR MESSAGE GUNA MODAL YANG SEDIA ADA
                // ============================================================
                let errorMsg = "";
                if (classCode) {
                    errorMsg += "Class Code '" + classCode + "' ";
                }
                if (className) {
                    if (errorMsg) errorMsg += "or ";
                    errorMsg += "Class Name '" + className + "' ";
                }
                errorMsg += "already exists in the system! Please use a different class code or class name.";
                
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.textContent = 'Confirm';
                
                showError(errorMsg);
                return;
            }

            // ============================================================
            // TIADA DUPLICATE — TERUSKAN SAVE (CREATE)
            // ============================================================
            // Update button text
            submitBtn.textContent = 'Saving...';

            const formData = new URLSearchParams();
            formData.append("action", "create");
            formData.append("classCode", classCode);
            formData.append("className", className);

            return fetch("../ClassroomController", {
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
                    showSuccess("Classroom successfully registered!");
                } else {
                    showError("Something went wrong: " + (data.message || "Unknown error"));
                }
            })
            .catch(error => {
                console.error("Error:", error);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Confirm';
                showError("Failed to connect to server. Please try again.");
            });
        })
        .catch(error => {
            console.error("Error checking duplicate:", error);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Confirm';
            showError("Failed to check duplicate classroom. Please try again.");
        });
}