// CREATESTUDENT.JS
// User profile init handled by Sidebar.js

document.addEventListener('DOMContentLoaded', function () {
    // check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = "../Create-Account/CreateAccount.html";
        return;
    }

    loadClassDropdown();
});

/* ────────────────────────────────────────────────────────
   MESSAGE MODALS (Success / Error)
────────────────────────────────────────────────────────── */
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
    window.location.href = "../Student-List/StudentList.html";
}

// load classes into the Class dropdown
function loadClassDropdown() {
    const clsSelect = document.getElementById("class_id");

    fetch("../ClassroomController?action=list")
        .then(response => response.json())
        .then(classes => {
            classes.forEach(c => {
                const option = document.createElement("option");
                option.value = c.classId;
                option.textContent = c.classCode + " - " + c.className;
                clsSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error("Error loading classes:", error);
            showError("Failed to load class list. Please refresh the page.");
        });
}

/* ────────────────────────────────────────────────────────
   HANDLE FORM SUBMISSION
────────────────────────────────────────────────────────── */
function handleForm(event) {
    event.preventDefault();

    const stu_name = document.getElementById('stu_name').value.trim();
    const stu_ic = document.getElementById('stu_ic').value.trim();
    const stu_add = document.getElementById('stu_add').value.trim();
    const stu_phonenum = document.getElementById('stu_phonenum').value.trim();
    const class_id = document.getElementById('class_id').value;
    const student_type = document.getElementById('student_type').value;

    // ✅ VALIDATION: SEMUA FIELD - NOT NULL (standardized dengan Subject page)
    if (!stu_name || !stu_ic || !stu_add || !stu_phonenum || !class_id || !student_type) {
        showError('Please fill in all field!');
        return;
    }

    // ✅ VALIDATION: stu_name - VARCHAR2(100) max length
    if (stu_name.length > 100) {
        showError('Student name cannot exceed 100 characters!');
        return;
    }

    // ✅ VALIDATION: stu_ic - must be numeric only
    if (!/^\d+$/.test(stu_ic)) {
        showError('IC Number must contain only numbers!');
        return;
    }

    // ✅ VALIDATION: stu_ic - VARCHAR2(20) max length
    if (stu_ic.length > 20) {
        showError('IC Number cannot exceed 20 characters!');
        return;
    }

    // ✅ VALIDATION: stu_ic - minimum 10 characters (Malaysian IC standard)
    if (stu_ic.length < 10) {
        showError('IC Number must be at least 10 characters!');
        return;
    }

    // ✅ VALIDATION: stu_add - VARCHAR2(255) max length
    if (stu_add.length > 255) {
        showError('Address cannot exceed 255 characters!');
        return;
    }

    // ✅ VALIDATION: stu_phonenum - VARCHAR2(20) max length
    if (stu_phonenum.length > 20) {
        showError('Phone number cannot exceed 20 characters!');
        return;
    }

    // ✅ VALIDATION: stu_phonenum - must be numeric only
    if (!/^\d+$/.test(stu_phonenum)) {
        showError('Phone number must contain only numbers!');
        return;
    }

    // ✅ VALIDATION: student_type - must be 'SVM' or 'DVM'
    if (!['SVM', 'DVM'].includes(student_type)) {
        showError('Student type must be either "SVM" or "DVM"!');
        return;
    }

    // Build form data untuk hantar ke controller (Eclipse backend)
    const formData = new URLSearchParams();
    formData.append("stuName", stu_name);
    formData.append("stuIC", stu_ic);
    formData.append("classId", class_id);
    formData.append("studentType", student_type);
    formData.append("stuAdd", stu_add || "");
    formData.append("stuPhoneNum", stu_phonenum || "");

    fetch("../StudentController?action=create", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData.toString()
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            showSuccess("Student profile created successfully!");
        } else {
            showError("Something went wrong: " + data.message);
        }
    })
    .catch(error => {
        console.error("Error:", error);
        showError("Failed to connect to server. Please try again.");
    });
}

/* ────────────────────────────────────────────────────────
   TOGGLE PROFILE
────────────────────────────────────────────────────────── */
function toggleProfile() {
    sessionStorage.setItem('profile_return_url', window.location.href);
    window.location.href = '../Profile-Details/Profile-Details.html';
}