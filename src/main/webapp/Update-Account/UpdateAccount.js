/* ============================================================
   UPDATEACCOUNT.JS — Page-specific logic
   User profile initialization handled by Sidebar.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = "../Create-Account/CreateAccount.html";
        return;
    }

    loadProfileData();
});

// load this teacher's real data from the database
function loadProfileData() {
    const tId = localStorage.getItem('active_tId');

    if (!tId) {
        alert("Teacher ID not found. Please login again.");
        return;
    }

    fetch("../TeacherController?action=get&id=" + encodeURIComponent(tId))
        .then(response => response.json())
        .then(data => {
            if (data.status === "error") {
                alert(data.message);
                return;
            }

            document.getElementById('profID').value = data.tId;
            document.getElementById('profIC').value = data.tIC;
            document.getElementById('profName').value = data.tName;
            document.getElementById('profEmail').value = data.tEmail;
            document.getElementById('profPhone').value = data.tPhoneNum;
        })
        .catch(error => {
            console.error("Error loading profile:", error);
            alert("Failed to load profile data. Please try again.");
        });
}

// save changes to the real database
function updateProfile() {
    const tId = localStorage.getItem('active_tId');
    const name = document.getElementById('profName').value.trim();
    const email = document.getElementById('profEmail').value.trim();
    const phone = document.getElementById('profPhone').value.trim();

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

    const formData = new URLSearchParams();
    formData.append("tId", tId);
    formData.append("tName", name);
    formData.append("tEmail", email);
    formData.append("tPhoneNum", phone);

    fetch("../TeacherController?action=updateProfile", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            localStorage.setItem('active_name', name);
            alert("Profile updated successfully!");
            window.location.href = "../Dashboard/Dashboard.html";
        } else {
            alert("Something went wrong: " + data.message);
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Failed to connect to server. Please try again.");
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