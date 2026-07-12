let selectedId = null;
const modal = document.getElementById('archiveModal');
const successMsg = document.getElementById('successMsg');

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
────────────────────────────────────────────────────────── */
function loadTeachers() {
    const tableBody = document.getElementById('tableBody');
    
    // Tunjukkan mesej sedang memuatkan data di dalam badan jadual
    tableBody.innerHTML = `<tr><td colspan="4" class="loading-msg" style="text-align:center; padding:40px; color:#64748b;">Loading accounts from database...</td></tr>`;

    fetch("../TeacherController?action=list")
        .then(response => response.json())
        .then(teachers => {
            tableBody.innerHTML = "";

            if (teachers.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="4" class="no-results" style="text-align:center; padding:40px; color:#64748b;">No accounts found in the system.</td></tr>`;
                return;
            }

            // Bina baris jadual secara dinamik mengekalkan reka bentuk VS Code (Gambar 1)
            teachers.forEach((t, index) => {
                const row = document.createElement("tr");
                
                const teacherId = t.tId || 'N/A';
                const teacherName = t.tName || 'Unknown';
                const isArchived = t.status === "ARCHIVED";

                row.className = "account-row" + (isArchived ? " archived" : "");
                row.id = "row-" + teacherId;

                // Tentukan keadaan butang "Archive" mengikut status database
                let actionButtonHTML = '';
                if (isArchived) {
                    actionButtonHTML = `<button class="btn-table-action btn-archive-row" style="background-color: #cbd5e1; color: #64748b; cursor: not-allowed; pointer-events: none;" disabled>Archived</button>`;
                } else {
                    actionButtonHTML = `<button class="btn-table-action btn-archive-row" onclick="showArchiveModal('${teacherId}', '${escapeHtml(teacherName)}')" title="Archive">Archive</button>`;
                }

                row.innerHTML = `
                    <td class="text-center" style="text-align: center;">${index + 1}</td>
                    <td>
                        <div class="acc-name">${escapeHtml(teacherName)} ${isArchived ? '<span class="badge-archived" style="display:inline-block;">ARCHIVED</span>' : ''}</div>
                    </td>
                    <td class="text-center acc-id" style="text-align: center;">${t.tIC}</td>
                    <td>
                        <div class="action-buttons">
                            ${actionButtonHTML}
                        </div>
                    </td>
                `;
                
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error("Error loading teachers:", error);
            tableBody.innerHTML = `<tr><td colspan="4" class="no-results" style="text-align:center; padding:40px; color:#c00;">Failed to load accounts. Please try again.</td></tr>`;
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
   SHOW ARCHIVE MODAL
────────────────────────────────────────────────────────── */
function showArchiveModal(tId, name) {
    selectedId = tId;
    document.getElementById('targetAccount').innerText = "ID: " + tId + " | Name: " + name;
    modal.classList.add('show');
    successMsg.style.display = 'none';
}

/* ────────────────────────────────────────────────────────
   CLOSE MODAL
────────────────────────────────────────────────────────── */
function closeModal() {
    modal.classList.remove('show');
}

/* ────────────────────────────────────────────────────────
   EXECUTE ARCHIVE (POST TO DATABASE CONTROLLER)
────────────────────────────────────────────────────────── */
function executeArchive() {
    const formData = new URLSearchParams();
    formData.append("tId", selectedId);

    fetch("../TeacherController?action=archive", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData.toString()
    })
    .then(response => response.json())
    .then(data => {
        modal.classList.remove('show');

        if (data.status === "success") {
            successMsg.style.display = 'block';
            
            // Segarkan semula senarai dari database untuk kemas kini reka bentuk terbaharu
            loadTeachers();

            setTimeout(() => {
                successMsg.style.display = 'none';
            }, 3000);
        } else {
            alert("Something went wrong: " + data.message);
        }
    })
    .catch(error => {
        console.error("Error:", error);
        modal.classList.remove('show');
        alert("Failed to connect to server. Please try again.");
    });
}

// Close modal on outside click
window.onclick = function(event) {
    if (event.target === modal) {
        closeModal();
    }
}

// Profile Section utility toggle
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