/* ============================================================
   VIEWSTUDENT.JS — Page-specific logic
   User profile initialization handled by Sidebar.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = "../Create-Account/Create-Account.html";
        return;
    }

    // Load student data
    loadStudentData();
});

/* ────────────────────────────────────────────────────────
   LOAD STUDENT DATA FROM LOCALSTORAGE
────────────────────────────────────────────────────────── */

function loadStudentData() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    const students = JSON.parse(localStorage.getItem("students")) || [];

    // Validate student exists
    if (id === null || id === undefined || isNaN(id) || id < 0 || id >= students.length) {
        alert("Student record not found!");
        window.location.href = "../Student-List/StudentList.html";
        return;
    }

    const student = students[id];

    if (student) {
        // Populate view fields
        document.getElementById("v_name").innerText = student.name || "N/A";
        document.getElementById("v_ic").innerText = student.ic || "N/A";
        document.getElementById("v_cls").innerText = student.cls || "N/A";
        document.getElementById("v_address").innerText = student.address || "N/A";
        document.getElementById("v_No").innerText = student.No || "N/A";
    } else {
        alert("Student record not found!");
        window.location.href = "../Student-List/StudentList.html";
    }
}

/* ────────────────────────────────────────────────────────
   UTILITY FUNCTIONS
────────────────────────────────────────────────────────── */

function toggleProfile() {
    var profileSection = document.getElementById('profile-section');
    var welcomeCard = document.getElementById('welcome-card');

    if (profileSection) {
        var isHidden = profileSection.style.display === 'none' || profileSection.style.display === '';
        profileSection.style.display = isHidden ? 'block' : 'none';
    }
    if (welcomeCard) {
        var isHidden = welcomeCard.style.display === 'none' || welcomeCard.style.display === '';
        welcomeCard.style.display = isHidden ? 'none' : 'block';
    }
}