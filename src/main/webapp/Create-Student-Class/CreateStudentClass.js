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
   HANDLE FORM SUBMISSION - Send to Database
────────────────────────────────────────────────────────── */

function handleForm(event) {
    event.preventDefault();

    const classCode = document.getElementById("classCode").value.trim();
    const className = document.getElementById("className").value.trim();

    // ✅ VALIDATION 1: Check if all fields are filled
    if (!classCode || !className) {
        alert("Please fill in all the information!");
        return;
    }

    // ✅ VALIDATION 2: Class Code must be at least 3 characters
    if (classCode.length < 3) {
        alert("Class Code must be at least 3 characters long!");
        return;
    }

    // ✅ VALIDATION 3: Class Code cannot contain special characters
    const classCodeRegex = /^[a-zA-Z0-9\s\-_]+$/;
    if (!classCodeRegex.test(classCode)) {
        alert("Class Code can only contain letters, numbers, spaces, hyphens (-), and underscores (_)!");
        return;
    }

    // ✅ VALIDATION 4: Class Name must be at least 3 characters
    if (className.length < 3) {
        alert("Class Name must be at least 3 characters long!");
        return;
    }

    // ✅ VALIDATION 5: Class Name cannot contain special characters
    const classNameRegex = /^[a-zA-Z0-9\s\-_'.]+$/;
    if (!classNameRegex.test(className)) {
        alert("Class Name can only contain letters, numbers, spaces, hyphens (-), underscores (_), apostrophes ('), and periods (.)!");
        return;
    }

    // ── SEND TO DATABASE VIA CLASSROOMCONTROLLER ──
    const formData = new URLSearchParams();
    formData.append("action", "create");
    formData.append("classCode", classCode);
    formData.append("className", className);

    // Disable submit button
    const submitBtn = document.querySelector('.btn-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    fetch("../ClassroomController", {
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
            alert("Classroom successfully registered!");
            window.location.href = "../Student Class/StudentClass.html";
        } else {
            alert("Something went wrong: " + (data.message || "Unknown error"));
        }
    })
    .catch(error => {
        console.error("Error:", error);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirm';
        alert("Failed to connect to server. Please try again.");
    });
}