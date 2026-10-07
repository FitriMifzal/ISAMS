document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = "../Create-Account/CreateAccount.html";
        return;
    }

    // Load teacher accounts dynamically from database
    loadTeachers();
});

/* ────────────────────────────────────────────────────────
   GO TO CREATE ACCOUNT PAGE (Functional like VS Code Code)
────────────────────────────────────────────────────────── */
function goToCreateAccount() {
    window.location.href = '../Create-Account/CreateAccount.html';
}

/* ────────────────────────────────────────────────────────
   LOAD TEACHER ACCOUNTS FROM DATABASE INTO TABLE STRUCTURE
   Only teachers created by (belonging to) the logged-in PI
────────────────────────────────────────────────────────── */
function loadTeachers() {
    const tableBody = document.getElementById('tableBody');

    tableBody.innerHTML = `<tr><td colspan="3" class="loading-msg" style="text-align:center; padding:40px; color:#64748b;">Loading accounts from database...</td></tr>`;

    const piId = localStorage.getItem('active_tId');

    fetch("../TeacherController?action=list&piId=" + encodeURIComponent(piId))
        .then(response => response.json())
        .then(teachers => {
            tableBody.innerHTML = "";

            if (!Array.isArray(teachers) || teachers.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="3" class="no-results" style="text-align:center; padding:40px; color:#64748b;">No accounts found in the system.</td></tr>`;
                return;
            }

            teachers.forEach((t, index) => {
                const row = document.createElement("tr");

                const teacherId = t.tId || 'N/A';
                const teacherName = t.tName || 'Unknown';

                row.className = "account-row";
                row.id = "row-" + teacherId;

                row.innerHTML = `
                    <td class="text-center" style="text-align: center;">${index + 1}</td>
                    <td>
                        <div class="acc-name">${escapeHtml(teacherName)}</div>
                    </td>
                    <td class="text-center acc-id" style="text-align: center;">${t.tIC}</td>
                `;

                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error("Error loading teachers:", error);
            tableBody.innerHTML = `<tr><td colspan="3" class="no-results" style="text-align:center; padding:40px; color:#c00;">Failed to load accounts. Please try again.</td></tr>`;
        });
}

/* ────────────────────────────────────────────────────────
   ESCAPE HTML UTILITY FOR SECURITY
────────────────────────────────────────────────────────── */
function escapeHtml(text) {
    if (!text) return "";
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

/* ────────────────────────────────────────────────────────
   PENAWAR UTK ISU REDIRECT PADA KLIK KEDUA (HANYA INI SAHAJA DITAMBAH)
────────────────────────────────────────────────────────── */
function toggleProfile(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    var profileSection = document.getElementById('profile-section') || document.querySelector('.profile-dropdown');

    if (profileSection) {
        var isHidden = profileSection.style.display === 'none' || profileSection.style.display === '';
        profileSection.style.display = isHidden ? 'block' : 'none';
    }
}