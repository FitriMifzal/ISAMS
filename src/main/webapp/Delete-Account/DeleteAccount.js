// DELETEACCOUNT.JS
// User profile init handled by Sidebar.js

let selectedId = null;
const modal = document.getElementById('archiveModal');
const successMsg = document.getElementById('successMsg');

document.addEventListener('DOMContentLoaded', function () {
    // check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = "../Create-Account/CreateAccount.html";
        return;
    }

    loadTeachers();
});

// load teacher accounts from database
function loadTeachers() {
    const list = document.getElementById('accountList');
    list.innerHTML = `<p style="text-align:center; color:#999;">Loading...</p>`;

    fetch("../TeacherController?action=list")
        .then(response => response.json())
        .then(teachers => {
            list.innerHTML = "";

            if (teachers.length === 0) {
                list.innerHTML = `<p style="text-align:center; color:#999;">No accounts found.</p>`;
                return;
            }

            teachers.forEach(t => {
                const initial = t.tName ? t.tName.charAt(0).toUpperCase() : "?";
                const isArchived = t.status === "ARCHIVED";

                const item = document.createElement("div");
                item.className = "account-item" + (isArchived ? " archived" : "");
                item.onclick = () => showArchiveModal(t.tId, t.tName);

                item.innerHTML = `
                    <div class="avatar-initial">${initial}</div>
                    <div class="acc-info">
                        <div class="acc-name">${t.tName} ${isArchived ? '<span class="badge-archived">ARCHIVED</span>' : ''}</div>
                        <div class="acc-id">IC: ${t.tIC} | Subject Teacher</div>
                    </div>
                    <i class="fa-solid ${isArchived ? 'fa-check-double' : 'fa-box-archive'}" ${isArchived ? 'style="color:#9e9e9e;"' : ''}></i>
                `;
                list.appendChild(item);
            });
        })
        .catch(error => {
            console.error("Error loading teachers:", error);
            list.innerHTML = `<p style="text-align:center; color:#c00;">Failed to load accounts. Please try again.</p>`;
        });
}

// show the archive confirmation modal
function showArchiveModal(tId, name) {
    selectedId = tId;
    document.getElementById('targetAccount').innerText = "ID: " + tId + " | Name: " + name;
    modal.classList.add('show');
    successMsg.style.display = 'none';
}

// close the modal
function closeModal() {
    modal.classList.remove('show');
}

// archive the selected teacher account
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

// close modal on outside click
window.onclick = function(event) {
    if (event.target === modal) {
        closeModal();
    }
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