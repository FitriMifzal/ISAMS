/* ============================================================
   STUDENTLIST.JS — Page-specific logic
   Gabungan VSCode + Eclipse (Dengan Delete - Fixed)
   ============================================================ */

let deleteStudentId = null; // Untuk simpan ID student yang nak dihapuskan

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
                            <button class="btn-table-action btn-delete" onclick="openDeleteModal(${student.stuId}, '${student.stuName}')">
                                Delete
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
   DELETE STUDENT - Open Confirmation Modal
────────────────────────────────────────────────────────── */

function openDeleteModal(studentId, studentName) {
    deleteStudentId = studentId;
    document.getElementById('deleteStudentName').innerText = studentName;
    new bootstrap.Modal(document.getElementById('deleteModal')).show();
}

/* ────────────────────────────────────────────────────────
   DELETE STUDENT - Execute Delete (DIKEMASKINI: POST & PARAMETER ID)
────────────────────────────────────────────────────────── */

function confirmDelete() {
    if (!deleteStudentId) {
        console.error("No student ID to delete");
        return;
    }

    // Hide the modal first
    bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();

    // Membina parameter POST yang dipadankan dengan StudentController.java
    const params = new URLSearchParams();
    params.append('action', 'delete'); // Dihantar ke doPost -> "delete".equals(action)
    params.append('id', deleteStudentId);  // 👈 DITUKAR KE 'id' supaya sepadan dengan request.getParameter("id") di Java

    console.log("Deleting student with ID via POST:", deleteStudentId);

    fetch("../StudentController", {
        method: "POST", // 👈 DITUKAR KE POST supaya diproses oleh doPost servlet
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params
    })
    .then(response => {
        console.log("Response status:", response.status);
        
        if (!response.ok) {
            throw new Error("HTTP Error: " + response.status);
        }
        return response.text();
    })
    .then(text => {
        console.log("Response text:", text);
        
        // Memandangkan backend memulangkan string "success" secara kosong/terus,
        // kita terus semak string output tersebut.
        if (text.trim() === "success" || text.toLowerCase().includes("success")) {
            document.getElementById('successMsg').innerText = "Student deleted successfully!";
            new bootstrap.Modal(document.getElementById('successModal')).show();
        } else {
            alert("Error dari Server: " + text);
        }
    })
    .catch(error => {
        console.error("Error deleting student:", error);
        alert("Failed to delete student: " + error.message);
    });
}

/* ────────────────────────────────────────────────────────
   CLOSE SUCCESS MODAL & RELOAD TABLE
────────────────────────────────────────────────────────── */

function closeSuccessModal() {
    bootstrap.Modal.getInstance(document.getElementById('successModal')).hide();
    deleteStudentId = null;
    loadStudents(); // Reload table
}

/* ────────────────────────────────────────────────────────
   TOGGLE PROFILE
────────────────────────────────────────────────────────── */

function toggleProfile() {
    sessionStorage.setItem('profile_return_url', window.location.href);
    window.location.href = '../Profile-Details/Profile-Details.html';
}