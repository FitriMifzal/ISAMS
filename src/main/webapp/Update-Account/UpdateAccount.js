/* ============================================================
   UPDATEACCOUNT.JS — Page-specific logic
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
   UPDATE PROFILE FUNCTION
────────────────────────────────────────────────────────── */

function updateProfile() {
    const name = document.getElementById('profName').value.trim();
    const email = document.getElementById('profEmail').value.trim();
    const phone = document.getElementById('profPhone').value.trim();

    // Validation
    if (!name) {
        alert("Please enter your full name");
        return;
    }

    if (!email) {
        alert("Please enter your email address");
        return;
    }

    if (!phone) {
        alert("Please enter your phone number");
        return;
    }

    // Update localStorage
    localStorage.setItem('active_name', name);
    localStorage.setItem('reg_name', name);
    localStorage.setItem('reg_email', email);
    localStorage.setItem('reg_phone', phone);

    alert("Profile updated successfully!");

    // Redirect to dashboard
    window.location.href = "../Dashboard/Dashboard.html";
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