/* ============================================================
   STUDENTCLASS.JS — Page-specific logic
   Gabungan VSCode + Eclipse
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in (dari Eclipse)
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = "../Create-Account/CreateAccount.html";
        return;
    }

    sessionStorage.setItem('profile_return_url', window.location.href);

    // Load classes into table (dari Eclipse - database)
    loadClasses();

    // Check user role and adjust UI accordingly (dari VSCode)
    const role = localStorage.getItem('active_role') || 'Teacher';
    if (role === 'Teacher') {
        const createBtn = document.querySelector('.btn-create');
        if (createBtn) {
            createBtn.style.display = 'none';
        }
    }
});

/* ────────────────────────────────────────────────────────
   LOAD CLASSES FROM DATABASE (dari Eclipse)
────────────────────────────────────────────────────────── */

function loadClasses() {
    const table = document.getElementById("classTable");
    table.innerHTML = `<tr><td colspan="4">Loading...</td></tr>`;

    fetch("../ClassroomController?action=list")
        .then(response => response.json())
        .then(classes => {
            table.innerHTML = "";

            if (classes.length === 0) {
                table.innerHTML = `<tr><td colspan="4">No classes found</td></tr>`;
                return;
            }

            classes.forEach((c, index) => {
                const row = document.createElement("tr");

                // Use classCode and className from database (dari Eclipse)
                const displayClassId = c.classCode || 'N/A';
                const displayClassName = c.className || 'N/A';
                const classId = c.classId || index;

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${displayClassId}</td>
                    <td>${displayClassName}</td>
                    <td>
                        <button class="btn-update" 
                                onclick="window.location.href='../Update-Student-Class/UpdateStudentClass.html?id=${classId}'">
                            Update
                        </button>
                    </td>
                `;
                table.appendChild(row);
            });
        })
        .catch(error => {
            console.error("Error loading classes:", error);
            table.innerHTML = `<tr><td colspan="4">Failed to load classes. Please try again.</td></tr>`;
        });
}

/* ────────────────────────────────────────────────────────
   TOGGLE PROFILE (dari VSCode)
────────────────────────────────────────────────────────── */

function toggleProfile() {
    sessionStorage.setItem('profile_return_url', window.location.href);
    window.location.href = '../Profile-Details/Profile-Details.html';
}