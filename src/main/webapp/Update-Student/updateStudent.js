/* ============================================================
   UPDATESTUDENT.JS — Page-specific logic
   User profile initialization handled by Sidebar.js
   ============================================================ */

// Get student ID from URL parameters
const params = new URLSearchParams(window.location.search);
const studentIndex = params.get("id");

document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = "../Create-Account/Create-Account.html";
        return;
    }

    // Load student data for editing
    loadStudentData();
});

/* ────────────────────────────────────────────────────────
   LOAD STUDENT DATA FROM LOCALSTORAGE
────────────────────────────────────────────────────────── */

function loadStudentData() {
    const students = JSON.parse(localStorage.getItem("students")) || [];
    
    if (!studentIndex || studentIndex < 0 || studentIndex >= students.length) {
        alert("Invalid student ID");
        window.location.href = "../Student-List/StudentList.html";
        return;
    }

    const student = students[studentIndex];

    // Populate form fields
    document.getElementById("name").value = student.name || "";
    document.getElementById("ic").value = student.ic || "";
    document.getElementById("cls").value = student.cls || "";
    document.getElementById("address").value = student.address || "";
    document.getElementById("No").value = student.No || "";
}

/* ────────────────────────────────────────────────────────
   SAVE STUDENT UPDATES
────────────────────────────────────────────────────────── */

function saveUpdate() {
    const name = document.getElementById("name").value.trim();
    const ic = document.getElementById("ic").value.trim();
    const cls = document.getElementById("cls").value.trim();
    const address = document.getElementById("address").value.trim();
    const No = document.getElementById("No").value.trim();

    // Validation - check if all fields filled
    if (!name || !ic || !cls || !address || !No) {
        alert("Error: Please fill in all student details before saving.");
        return;
    }

    // Validation - IC Number must be 12 digits
    if (ic.length !== 12 || isNaN(ic)) {
        alert("Error: IC Number must contain exactly 12 digits.");
        return;
    }

    // Validation - Contact No should be valid
    if (isNaN(No) || No.length < 10) {
        alert("Error: Contact number must contain at least 10 digits.");
        return;
    }

    // Get students array
    let students = JSON.parse(localStorage.getItem("students")) || [];

    // Update student record
    students[studentIndex] = {
        name: name,
        ic: ic,
        cls: cls,
        address: address,
        No: No
    };

    // Save to localStorage
    localStorage.setItem("students", JSON.stringify(students));

    alert("Success! Student profile has been updated.");

    // Redirect to student list
    window.location.href = "../Student-List/StudentList.html";
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