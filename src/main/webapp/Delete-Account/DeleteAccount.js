/* ============================================================
   DELETEACCOUNT.JS — Page-specific logic
   User profile initialization handled by Sidebar.js
   ============================================================ */

let selectedId = null;
const modal = document.getElementById('archiveModal');
const successMsg = document.getElementById('successMsg');

document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = "../Create-Account/Create-Account.html";
        return;
    }
});

/* ────────────────────────────────────────────────────────
   SHOW ARCHIVE MODAL
────────────────────────────────────────────────────────── */

function showArchiveModal(id, name) {
    // Check if account already archived
    if (document.querySelector('[onclick*="' + id + '"]')?.classList.contains('archived')) {
        return;
    }

    selectedId = id;
    document.getElementById('targetAccount').innerText = "ID: " + id + " | Name: " + name;
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
   EXECUTE ARCHIVE
────────────────────────────────────────────────────────── */

function executeArchive() {
    modal.classList.remove('show');
    successMsg.style.display = 'block';

    // Find account item and mark as archived
    const allItems = document.querySelectorAll('.account-item');
    allItems.forEach(item => {
        if (item.textContent.includes('ID: ' + selectedId)) {
            item.classList.add('archived');
            
            // Update icon
            const icon = item.querySelector('i');
            if (icon) {
                icon.classList.replace('fa-box-archive', 'fa-check-double');
                icon.style.color = '#9e9e9e';
            }
        }
    });

    // Hide success message after 3 seconds
    setTimeout(() => {
        successMsg.style.display = 'none';
    }, 3000);
}

/* ────────────────────────────────────────────────────────
   CLOSE MODAL ON OUTSIDE CLICK
────────────────────────────────────────────────────────── */

window.onclick = function(event) {
    if (event.target === modal) {
        closeModal();
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