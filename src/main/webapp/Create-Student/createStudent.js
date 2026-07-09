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
            alert("Failed to load class list. Please refresh the page.");
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

    // ✅ VALIDATION 1: stu_name - NOT NULL
    if (!stu_name) {
        alert('Please enter the student\'s full name!');
        return;
    }

    // ✅ VALIDATION 2: stu_name - VARCHAR2(100) max length
    if (stu_name.length > 100) {
        alert('Student name cannot exceed 100 characters!');
        return;
    }

    // ✅ VALIDATION 3: stu_ic - NOT NULL
    if (!stu_ic) {
        alert('Please enter the student\'s IC Number!');
        return;
    }

    // ✅ VALIDATION 4: stu_ic - must be numeric only
    if (!/^\d+$/.test(stu_ic)) {
        alert('IC Number must contain only numbers!');
        return;
    }

    // ✅ VALIDATION 5: stu_ic - VARCHAR2(20) max length
    if (stu_ic.length > 20) {
        alert('IC Number cannot exceed 20 characters!');
        return;
    }

    // ✅ VALIDATION 6: stu_ic - minimum 10 characters (Malaysian IC standard)
    if (stu_ic.length < 10) {
        alert('IC Number must be at least 10 characters!');
        return;
    }

    // ✅ VALIDATION 7: stu_add - VARCHAR2(255) max length (if provided)
    if (stu_add && stu_add.length > 255) {
        alert('Address cannot exceed 255 characters!');
        return;
    }

    // ✅ VALIDATION 8: stu_phonenum - VARCHAR2(20) max length (if provided)
    if (stu_phonenum && stu_phonenum.length > 20) {
        alert('Phone number cannot exceed 20 characters!');
        return;
    }

    // ✅ VALIDATION 9: stu_phonenum - must be numeric only (if provided)
    if (stu_phonenum && !/^\d+$/.test(stu_phonenum)) {
        alert('Phone number must contain only numbers!');
        return;
    }

    // ✅ VALIDATION 10: class_id - NOT NULL
    if (!class_id) {
        alert('Please select a class!');
        return;
    }

    // ✅ VALIDATION 11: student_type - NOT NULL
    if (!student_type) {
        alert('Please select a student type!');
        return;
    }

    // ✅ VALIDATION 12: student_type - must be 'SVM' or 'DVM'
    if (!['SVM', 'DVM'].includes(student_type)) {
        alert('Student type must be either "SVM" or "DVM"!');
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
            alert("Student profile created successfully!");
            window.location.href = "../Student-List/StudentList.html";
        } else {
            alert("Something went wrong: " + data.message);
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Failed to connect to server. Please try again.");
    });
}

/* ────────────────────────────────────────────────────────
   TOGGLE PROFILE
────────────────────────────────────────────────────────── */
function toggleProfile() {
    sessionStorage.setItem('profile_return_url', window.location.href);
    window.location.href = '../Profile-Details/Profile-Details.html';
}