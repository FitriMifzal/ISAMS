/* ============================================================
   VIEWACCOUNT.JS — Page-specific logic
   User profile initialization handled by Sidebar.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = "../Create-Account/Create-Account.html";
        return;
    }

    // Load profile data
    loadProfileData();
});

/* ────────────────────────────────────────────────────────
   LOAD PROFILE DATA FROM LOCALSTORAGE
────────────────────────────────────────────────────────── */

function loadProfileData() {
    document.getElementById('profID').value = localStorage.getItem('reg_id') || "N/A";
    document.getElementById('profIC').value = localStorage.getItem('reg_ic') || "N/A";
    document.getElementById('profName').value = localStorage.getItem('reg_name') || "";
    document.getElementById('profEmail').value = localStorage.getItem('reg_email') || "";
    document.getElementById('profPhone').value = localStorage.getItem('reg_phone') || "";
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