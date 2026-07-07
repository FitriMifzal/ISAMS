// STUDENTLIST.JS
// User profile init handled by Sidebar.js

document.addEventListener('DOMContentLoaded', function () {
    // check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = "../Create-Account/CreateAccount.html";
        return;
    }

    loadStudents();
});

// load students from database
function loadStudents() {
    const tableBody = document.getElementById("studentTableBody");
    tableBody.innerHTML = `<tr><td colspan="5">Loading...</td></tr>`;

    fetch("../StudentController?action=list")
        .then(response => response.json())
        .then(students => {
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
                    <td>${student.stuName}</td>
                    <td>${student.stuIC}</td>
                    <td>${student.classCode}</td>
					<td>
					    <button class="btn-action btn-view" onclick="viewStudent(${student.stuId})">
					        View
					    </button>

					    <button class="btn-action btn-update" onclick="updateStudent(${student.stuId})">
					        Update
					    </button>

					    <button class="btn-action btn-delete" onclick="deleteStudent(${student.stuId})">
					        Delete
					    </button>
					</td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error("Error loading students:", error);
            tableBody.innerHTML = `<tr><td colspan="5">Failed to load students. Please try again.</td></tr>`;
        });
}

// filter table rows based on search input
function searchTable() {
    const input = document.getElementById("searchInput");
    const filter = input.value.toUpperCase();
    const table = document.querySelector("table");
    const rows = table.getElementsByTagName("tr");

    // skip header row (index 0)
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

// go to the View Student page for the selected student
function viewStudent(stuId) {
    window.location.href = "../ViewStudentServlet?id=" + stuId;
}
function updateStudent(stuId) {
    window.location.href = "../Update-Student/updateStudent.html?id=" + stuId;
}

function deleteStudent(stuId) {
    if (!confirm("Are you sure you want to delete this student?")) {
        return;
    }

    fetch("../StudentController?action=delete&id=" + stuId, {
        method: "POST"
    })
    .then(response => response.text())
    .then(result => {
        if (result.trim() === "success") {
            alert("Student deleted successfully.");
            loadStudents();
        } else {
            alert("Failed to delete student: " + result);
        }
    })
    .catch(error => {
        console.error(error);
        alert("Error deleting student.");
    });
}

// utility functions
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