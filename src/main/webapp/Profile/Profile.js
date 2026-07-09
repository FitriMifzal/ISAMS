/* ============================================================
   PROFILE.JS — Profile page logic
   Nota: toggleProfile() & logoutUser() adalah GLOBAL dari
   Sidebar.js. JANGAN declare semula di sini.
   Butang "Back" & icon profile dua-dua kembali ke page asal
   (URL disimpan oleh Sidebar.js dalam sessionStorage).
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in
    loadProfileData();
});

/* ── LOAD PROFILE DATA (dari localStorage) ── */
function loadProfileData() {
    var name = localStorage.getItem('reg_name') || localStorage.getItem('active_name') || '';
    var role = localStorage.getItem('active_role') || 'Teacher';
    var id = localStorage.getItem('reg_id') || 'N/A';

    // Field inputs
    document.getElementById('profID').value = id;
    document.getElementById('profIC').value = localStorage.getItem('reg_ic') || 'N/A';
    document.getElementById('profName').value = name;
    document.getElementById('profEmail').value = localStorage.getItem('reg_email') || '';
    document.getElementById('profPhone').value = localStorage.getItem('reg_phone') || '';
    document.getElementById('profRole').value = (role === 'Teacher') ? 'Subject Teacher' : role;

    // Header display (nama besar, role, ID badge, avatar initials)
    document.getElementById('profileDisplayName').textContent = name || 'User Name';
    document.getElementById('profileDisplayRole').textContent = (role === 'Teacher') ? 'Subject Teacher' : role;
    document.getElementById('profileDisplayID').textContent = id;

    var initials = (name || '?')
        .split(' ')
        .map(function (word) { return word.charAt(0).toUpperCase(); })
        .join('')
        .substring(0, 2);
    document.getElementById('profileAvatar').textContent = initials || '?';
}

/* ── ENABLE EDIT MODE ── */
function enableEdit() {
    document.querySelectorAll('.profile-input').forEach(function (input) {
        input.disabled = false;
        input.classList.add('editable');
    });

    document.getElementById('btn-edit-profile').style.display = 'none';
    document.getElementById('btn-save-profile').style.display = 'inline-flex';
    document.getElementById('btn-cancel-profile').style.display = 'inline-flex';
}

/* ── DISABLE EDIT MODE (Cancel — reset perubahan) ── */
function disableEdit() {
    document.querySelectorAll('.profile-input').forEach(function (input) {
        input.disabled = true;
        input.classList.remove('editable');
    });

    document.getElementById('btn-edit-profile').style.display = 'inline-flex';
    document.getElementById('btn-save-profile').style.display = 'none';
    document.getElementById('btn-cancel-profile').style.display = 'none';

    // Reload data asal (buang perubahan yang belum save)
    loadProfileData();
}

/* ── VALIDATION HELPERS ── */
function isValidEmail(email) {
    var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function isValidPhone(phone) {
    // Terima pelbagai format: +6012345678, 0129876543, dll
    var regex = /^(\+?6?01[0-9]{8,9}|0[0-9]{9,10})$/;
    return regex.test(phone.replace(/[\s\-()]/g, ''));
}

/* ── UPDATE PROFILE (Save) ── */
function updateProfile() {
    var profName = document.getElementById('profName').value.trim();
    var profEmail = document.getElementById('profEmail').value.trim();
    var profPhone = document.getElementById('profPhone').value.trim();

    if (!profName || !profEmail || !profPhone) {
        alert('Please fill all required fields');
        return;
    }
    if (!isValidEmail(profEmail)) {
        alert('Please enter a valid email address');
        return;
    }
    if (!isValidPhone(profPhone)) {
        alert('Please enter a valid phone number');
        return;
    }

    // Simpan ke localStorage
    localStorage.setItem('reg_name', profName);
    localStorage.setItem('reg_email', profEmail);
    localStorage.setItem('reg_phone', profPhone);
    localStorage.setItem('active_name', profName);

    // Update paparan header page & avatar terus
    loadProfileData();

    // Update nama & initial kat header atas (bar orange)
    var userNameEl = document.getElementById('user-fullname');
    if (userNameEl) {
        userNameEl.textContent = profName;

        var initials = profName
            .split(' ')
            .map(function (word) { return word.charAt(0).toUpperCase(); })
            .join('')
            .substring(0, 2);

        var userInitialEl = document.getElementById('user-initial');
        if (userInitialEl) userInitialEl.textContent = initials || '?';
    }

    alert('Profile updated successfully!');
    disableEdit();
}

/* ── GO BACK (kembali ke page sebelum user tekan icon profile) ── */
function goBack() {
    var returnUrl = sessionStorage.getItem('profile_return_url');
    if (returnUrl) {
        window.location.href = returnUrl;
    } else {
        window.location.href = '../Dashboard/Dashboard.html';
    }
}