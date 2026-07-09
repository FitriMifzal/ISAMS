/* ============================================================
   VIEWSTUDENT.JS — Page-specific logic
   User profile initialization handled by Sidebar.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = "../Create-Account/CreateAccount.html";
        return;
    }

    sessionStorage.setItem('profile_return_url', window.location.href);

    // Load student data from database
    loadStudentData();
});

/* ────────────────────────────────────────────────────────
   LOAD STUDENT DATA FROM DATABASE (Eclipse backend)
────────────────────────────────────────────────────────── */

function loadStudentData() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");

    if (!id) {
        alert("Student ID not found!");
        window.location.href = "../Student-List/StudentList.html";
        return;
    }

    fetch("../StudentController?action=get&id=" + id)
        .then(response => response.json())
        .then(student => {
            // Populate view fields
            document.getElementById("v_name").innerText = student.stuName || "N/A";
            document.getElementById("v_ic").innerText = student.stuIC || "N/A";
            document.getElementById("v_cls").innerText = student.classCode || "N/A";
            document.getElementById("v_type").innerText = student.studentType || "N/A";
            document.getElementById("v_address").innerText = student.stuAdd || "N/A";
            document.getElementById("v_No").innerText = student.stuPhoneNum || "N/A";
        })
        .catch(error => {
            console.error("Error loading student data:", error);
            alert("Failed to load student data! Please try again.");
        });
}

/* ────────────────────────────────────────────────────────
   UTILITY FUNCTIONS
────────────────────────────────────────────────────────── */

function toggleProfile() {
    sessionStorage.setItem('profile_return_url', window.location.href);
    window.location.href = '../Profile-Details/Profile-Details.html';
}