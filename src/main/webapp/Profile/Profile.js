/* ============================================================
   PROFILE.JS — Profile page logic
   Nota: toggleProfile() & logoutUser() adalah GLOBAL dari
   Sidebar.js. JANGAN declare semula di sini.
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
        showError("Teacher ID not found. Please login again.");
        return;
    }

    fetch("../TeacherController?action=get&id=" + encodeURIComponent(tId))
        .then(response => response.json())
        .then(data => {
            if (data.status === "error") {
                showError(data.message);
                return;
            }

            document.getElementById('T_Name').value = data.tName;
            document.getElementById('T_IC').value = data.tIC;
            document.getElementById('T_Email').value = data.tEmail;
            document.getElementById('T_PhoneNum').value = data.tPhoneNum;

            document.getElementById('profileDisplayName').textContent = data.tName;
            
            // ============================================================
            // FIX AREA: KEMASKINI SETIAP PARAMETER ROLE BADGE IKUT LOGIN
            // ============================================================
            const currentRole = localStorage.getItem('active_role') || 'Teacher';
            
            // 1. Selesaikan highlight biru pada kad maklumat utama profile
            const profileDisplayRoleEl = document.getElementById('profileDisplayRole');
            if (profileDisplayRoleEl) {
                profileDisplayRoleEl.textContent = currentRole;
            }
            
            // 2. Kunci kedudukan role badge di sidebar agar sentiasa sync
            const sidebarRoleBadgeEl = document.querySelector('.role-badge');
            if (sidebarRoleBadgeEl) {
                sidebarRoleBadgeEl.textContent = currentRole;
            }
            // ============================================================

            const isActive = data.status === "ACTIVE";
            document.getElementById('statusText').textContent = isActive ? "Active" : "Archived";
            document.getElementById('statusDot').style.backgroundColor = isActive ? "#22c55e" : "#94a3b8";

            const initials = (data.tName || '?')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase())
                .join('')
                .substring(0, 2);
            document.getElementById('profileAvatar').textContent = initials || '?';
        })
        .catch(error => {
            console.error("Error loading profile:", error);
            showError("Failed to load profile data. Please try again.");
        });
}

// enable edit mode
function enableEdit() {
    document.querySelectorAll('.profile-input').forEach(function (input) {
        input.disabled = false;
        input.classList.add('editable');
    });

    document.getElementById('btn-edit-profile').style.display = 'none';
    document.getElementById('btn-save-profile').style.display = 'inline-flex';
    document.getElementById('btn-cancel-profile').style.display = 'inline-flex';
}

// disable edit mode, discard unsaved changes
function disableEdit() {
    document.querySelectorAll('.profile-input').forEach(function (input) {
        input.disabled = true;
        input.classList.remove('editable');
    });

    document.getElementById('btn-edit-profile').style.display = 'inline-flex';
    document.getElementById('btn-save-profile').style.display = 'none';
    document.getElementById('btn-cancel-profile').style.display = 'none';

    loadProfileData();
}

function isValidEmail(email) {
    var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function isValidPhone(phone) {
    var regex = /^(\+?6?01[0-9]{8,9}|0[0-9]{9,10})$/;
    return regex.test(phone.replace(/[\s\-()]/g, ''));
}

// save changes to the real database
function updateProfile() {
    const tId = localStorage.getItem('active_tId');
    const name = document.getElementById('T_Name').value.trim();
    const email = document.getElementById('T_Email').value.trim();
    const phone = document.getElementById('T_PhoneNum').value.trim();

    // Validation menggunakan showError (modal) BUKAN alert
    if (!name || !email || !phone) {
        showError('Please fill all required fields');
        return;
    }
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    if (!isValidPhone(phone)) {
        showError('Please enter a valid phone number');
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

            const userNameEl = document.getElementById('user-fullname');
            if (userNameEl) userNameEl.textContent = name;

            // GUNA MODAL SUCCESS (bukan alert)
            showSuccess('Profile updated successfully!');
            // disableEdit() akan dipanggil dalam closeSuccessModal() 
            // supaya user nampak update sebelum modal tutup
        } else {
            showError("Something went wrong: " + data.message);
        }
    })
    .catch(error => {
        console.error("Error:", error);
        showError("Failed to connect to server. Please try again.");
    });
}

function goBack() {
    var returnUrl = sessionStorage.getItem('profile_return_url');
    if (returnUrl) {
        window.location.href = returnUrl;
    } else {
        window.location.href = '../Dashboard/Dashboard.html';
    }
}

/* ════════════════════════════════════════════════════════════
   MESSAGE MODALS (Success / Error) — SAMA MACAM CREATE ACCOUNT
   ════════════════════════════════════════════════════════════ */
function showSuccess(message) {
    document.getElementById('successMsg').innerText = message;
    new bootstrap.Modal(document.getElementById('successModal')).show();
}

function showError(message) {
    document.getElementById('errorMsg').innerText = message;
    new bootstrap.Modal(document.getElementById('errorModal')).show();
}

function closeSuccessModal() {
    bootstrap.Modal.getInstance(document.getElementById('successModal')).hide();
    // Lepas success, disable edit mode dan refresh data
    disableEdit();
}