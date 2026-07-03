/* ============================================================
   DASHBOARD.JS — Profile edit functionality
   User profile initialization handled by Sidebar.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') { 
        window.location.href = "../Create-Account/Create-Account.html";
        return; 
    }
    
    // Load profile data dari localStorage
    loadProfileData();
});

/* ── LOAD PROFILE DATA ── */
function loadProfileData() {
    document.getElementById('profID').value = localStorage.getItem('reg_id') || "N/A";
    document.getElementById('profIC').value = localStorage.getItem('reg_ic') || "N/A";
    document.getElementById('profName').value = localStorage.getItem('reg_name') || "";
    document.getElementById('profEmail').value = localStorage.getItem('reg_email') || "";
    document.getElementById('profPhone').value = localStorage.getItem('reg_phone') || "";
}

/* ── ENABLE EDIT MODE ── */
function enableEdit() {
    // Enable editable fields
    var editableInputs = document.querySelectorAll('.profile-input');
    editableInputs.forEach(function(input) {
        input.disabled = false;
        input.classList.add('editable');
    });

    // Toggle button visibility
    var btnEdit = document.getElementById('btn-edit');
    var btnBack = document.getElementById('btn-back');
    var btnSave = document.getElementById('btn-save');
    var btnCancel = document.getElementById('id-cancel');
    
    if (btnEdit) btnEdit.style.display = 'none';
    if (btnBack) btnBack.style.display = 'none';
    if (btnSave) btnSave.style.display = 'inline-block';
    if (btnCancel) btnCancel.style.display = 'inline-block';
}

/* ── DISABLE EDIT MODE ── */
function disableEdit() {
    // Disable editable fields
    var editableInputs = document.querySelectorAll('.profile-input');
    editableInputs.forEach(function(input) {
        input.disabled = true;
        input.classList.remove('editable');
    });

    // Toggle button visibility
    var btnEdit = document.getElementById('btn-edit');
    var btnBack = document.getElementById('btn-back');
    var btnSave = document.getElementById('btn-save');
    var btnCancel = document.getElementById('id-cancel');
    
    if (btnEdit) btnEdit.style.display = 'inline-block';
    if (btnBack) btnBack.style.display = 'inline-block';
    if (btnSave) btnSave.style.display = 'none';
    if (btnCancel) btnCancel.style.display = 'none';
    
    // Reload data (reset changes)
    loadProfileData();
}

/* ── UPDATE PROFILE ── */
function updateProfile() {
    // Get updated values
    var profName = document.getElementById('profName').value.trim();
    var profEmail = document.getElementById('profEmail').value.trim();
    var profPhone = document.getElementById('profPhone').value.trim();
    
    // Validation
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

    // Save to localStorage
    localStorage.setItem('reg_name', profName);
    localStorage.setItem('reg_email', profEmail);
    localStorage.setItem('reg_phone', profPhone);
    localStorage.setItem('active_name', profName);

    // Update header name (akan reload Sidebar.js untuk update initial)
    var userNameEl = document.getElementById('user-fullname');
    if (userNameEl) {
        userNameEl.textContent = profName;
        
        // Regenerate initials
        var initials = profName
            .split(' ')
            .map(function(word) { return word.charAt(0).toUpperCase(); })
            .join('')
            .substring(0, 2);
        
        var userInitialEl = document.getElementById('user-initial');
        if (userInitialEl) {
            userInitialEl.textContent = initials || '?';
        }
    }

    // API call (optional - uncomment jika ada backend)
    // fetch('/api/profile/update', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //         name: profName,
    //         email: profEmail,
    //         phone: profPhone
    //     })
    // }).then(function(res) {
    //     return res.json();
    // }).then(function(data) {
    //     if (data.success) {
    //         alert('Profile updated successfully!');
    //         disableEdit();
    //     } else {
    //         alert('Failed to update profile: ' + (data.message || 'Unknown error'));
    //     }
    // }).catch(function(err) {
    //     console.error('Error:', err);
    //     alert('Error updating profile');
    // });

    alert('Profile updated successfully!');
    disableEdit();
}

/* ── VALIDATION FUNCTIONS ── */
function isValidEmail(email) {
    var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function isValidPhone(phone) {
    // Accept various phone formats: +6012345678, 0129876543, etc
    var regex = /^(\+?6?01[0-9]{8,9}|0[0-9]{9,10})$/;
    return regex.test(phone.replace(/[\s\-()]/g, ''));
}