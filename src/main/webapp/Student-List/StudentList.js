/* ============================================================
   STUDENTLIST.JS — Page-specific logic
   Gabungan VSCode + Eclipse (Tanpa Delete)
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = "../Create-Account/CreateAccount.html";
        return;
    }

    sessionStorage.setItem('profile_return_url', window.location.href);
    // Load students from database
    loadStudents();
});

/* ────────────────────────────────────────────────────────
   LOAD STUDENTS FROM DATABASE
────────────────────────────────────────────────────────── */

function loadStudents() {
    const tableBody = document.getElementById("studentTableBody");

    if (!tableBody) {
        console.error("studentTableBody not found in HTML");
        return;
    }

    tableBody.innerHTML = `
        <tr>
            <td colspan="5">Loading students...</td>
        </tr>
    `;

    fetch("../StudentController?action=list")
        .then(response => {
            console.log("StudentController response status:", response.status);

            if (!response.ok) {
                throw new Error("HTTP Error: " + response.status);
            }

            return response.json();
        })
        .then(students => {
            console.log("Students from backend:", students);

            tableBody.innerHTML = "";

            if (!students || students.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="no-data">
                            No students found.
                        </td>
                    </tr>
                `;
                return;
            }

            students.forEach((student, index) => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${student.stuName || "N/A"}</td>
                    <td>${student.stuIC || "N/A"}</td>
                    <td>${student.classCode || student.className || "N/A"}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-table-action btn-view" onclick="viewStudent(${student.stuId})">
                                View
                            </button>
                            <button class="btn-table-action btn-update" onclick="updateStudent(${student.stuId})">
                                Update
                            </button>
                        </div>
                    </td>
                `;

                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error("Error loading students:", error);

            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        Failed to load students: ${error.message}
                    </td>
                </tr>
            `;
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
   VIEW STUDENT
────────────────────────────────────────────────────────── */

function viewStudent(studentId) {
    window.location.href = "../View-Student/viewStudent.html?id=" + studentId;
}

/* ────────────────────────────────────────────────────────
   UPDATE STUDENT
────────────────────────────────────────────────────────── */

function updateStudent(studentId) {
    window.location.href = "../Update-Student/updateStudent.html?id=" + studentId;
}

/* ────────────────────────────────────────────────────────
   TOGGLE PROFILE
────────────────────────────────────────────────────────── */

function toggleProfile() {
    sessionStorage.setItem('profile_return_url', window.location.href);
    window.location.href = '../Profile-Details/Profile-Details.html';
}