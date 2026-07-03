/* ============================================================
   STUDENTLIST.JS — Page-specific logic
   User profile initialization handled by Sidebar.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = "../Create-Account/Create-Account.html";
        return;
    }

    // Load students into table
    loadStudents();
});

/* ────────────────────────────────────────────────────────
   LOAD STUDENTS FROM LOCALSTORAGE
────────────────────────────────────────────────────────── */

function loadStudents() {
    const students = JSON.parse(localStorage.getItem("students")) || [];
    const tableBody = document.getElementById("studentTableBody");
    tableBody.innerHTML = "";

    if (students.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="no-data">No students found. <a href="../Create-Student/createStudent.html" style="color: var(--kv-orange); text-decoration: none; font-weight: 600;">Create one</a></td>
            </tr>
        `;
        return;
    }

    students.forEach((student, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${student.name}</td>
            <td>${student.ic}</td>
            <td>${student.cls}</td>
            <td>
                <button class="btn-action btn-view" onclick="viewStudent('${student.ic}')">
                    View
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

/* ────────────────────────────────────────────────────────
   SEARCH FUNCTIONALITY
────────────────────────────────────────────────────────── */

function searchTable() {
    const input = document.getElementById("searchInput");
    const filter = input.value.toUpperCase();
    const table = document.querySelector("table");
    const rows = table.getElementsByTagName("tr");

    // Skip header row (index 0)
    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName("td");
        if (cells.length === 0) continue;

        const name = cells[1] ? cells[1].textContent.toUpperCase() : "";
        const ic = cells[2] ? cells[2].textContent.toUpperCase() : "";
        const kelas = cells[3] ? cells[3].textContent.toUpperCase() : "";

        if (name.includes(filter) || ic.includes(filter) || kelas.includes(filter)) {
            rows[i].style.display = "";
        } else {
            rows[i].style.display = "none";
        }
    }
}

/* ────────────────────────────────────────────────────────
   VIEW STUDENT DETAILS
────────────────────────────────────────────────────────── */

function viewStudent(ic) {
    // Store selected student IC in sessionStorage
    sessionStorage.setItem('selectedStudentIC', ic);
    
    // Redirect to student detail page (if exists)
    // window.location.href = 'studentDetail.html?ic=' + ic;
    
    // For now, show alert
    alert("View details for student IC: " + ic);
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