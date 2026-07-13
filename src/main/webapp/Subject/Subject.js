// SUBJECT.JS — Gabungan VSCode + Eclipse
// ============================================================

let subjects = [];      // holds the last-fetched list
let currentUserRole = "";
let activeSubId = null; // subject currently targeted for enroll

document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = "../Create-Account/CreateAccount.html";
        return;
    }

    currentUserRole = localStorage.getItem('active_role') || 'Teacher';
    
    console.log('=== USER INFO ===');
    console.log('Role:', currentUserRole);
    console.log('================');

    // CHANGE PAGE TITLE AND DESCRIPTION BASED ON ROLE
    const pageTitle = document.getElementById('pageTitle');
    const pageDescription = document.getElementById('pageDescription');
    
    if (currentUserRole.trim() === "Penyelaras Intervensi") {
        pageTitle.innerText = "Subject Details";
        pageDescription.innerText = "Create, and manage all subjects. Click 'Create' to add a new subject or 'Edit' to modify existing ones.";
    } else {
        pageTitle.innerText = "Subject Enrollment";
        pageDescription.innerText = "Enroll in the ones you wish to teach. Click 'Enroll' to register for a subject.";
    }
    
    // Adjust UI based on role
    const btnCreate = document.getElementById('btnCreate');
    if (currentUserRole.trim() === "Penyelaras Intervensi") {
        btnCreate.style.display = 'block';
    } else {
        btnCreate.style.display = 'none';
    }

    // Load subjects from database
    loadSubjects();
});

// ============================================================
// MESSAGE MODAL (Error)
// ============================================================
function showError(message) {
    document.getElementById('errorMsg').innerText = message;
    new bootstrap.Modal(document.getElementById('errorModal')).show();
}

// ============================================================
// LOAD SUBJECTS FROM DATABASE
// ============================================================
function loadSubjects() {
    fetch("../SubjectController?action=list")
        .then(response => response.json())
        .then(data => {
            subjects = data;
            renderTable();
        })
        .catch(error => {
            console.error("Error loading subjects:", error);
            document.getElementById('subjectTableBody').innerHTML =
                `<tr><td colspan="4" class="text-center">Failed to load subjects.</td></tr>`;
        });
}

// ============================================================
// RENDER TABLE
// ============================================================
function renderTable() {
    const body = document.getElementById('subjectTableBody');
    body.innerHTML = '';

    const myTId = parseInt(localStorage.getItem('active_tId'));
    const roleToCheck = currentUserRole.trim();

    if (subjects.length === 0) {
        body.innerHTML = `<tr><td colspan="4" class="text-center">No subjects available.</td></tr>`;
        return;
    }

    subjects.forEach((s) => {
        let btns = '';

        if (roleToCheck === "Penyelaras Intervensi") {
            // PENYELARAS: Show Update button only
            btns = `<button class="btn-update" onclick="showForm(${s.subId})">Update</button>`;
        } else if (roleToCheck === "Subject Teacher" || roleToCheck.includes("Teacher")) {
            // TEACHER: Show Enroll/Status buttons
            if (s.tId !== null && s.tId === myTId) {
                btns = `<button class="btn-secondary" disabled><i class="bi bi-check-circle"></i> Enrolled</button>`;
            } else if (s.tId === null) {
                btns = `<button class="btn-save" onclick="openEnroll(${s.subId})">Enroll</button>`;
            } else {
                btns = `<button class="btn-secondary" disabled>Assigned</button>`;
            }
        }

        const lecturer = s.tId === null ? '<span class="text-muted">Unassigned</span>' : s.teacherName;

        body.innerHTML += `<tr>
            <td>${s.subName}</td>
            <td>${s.creditHours}</td>
            <td>${lecturer}</td>
            <td>${btns}</td>
        </tr>`;
    });
}

// ============================================================
// SHOW LIST PAGE
// ============================================================
function showList() {
    document.getElementById('subjectListPage').classList.remove('hidden');
    document.getElementById('formPage').classList.add('hidden');
    loadSubjects();
}

// ============================================================
// SHOW FORM PAGE (Create/Update)
// ============================================================
function showForm(subId) {
    document.getElementById('subjectForm').reset();
    document.getElementById('globalError').classList.add('hidden');

    if (subId !== undefined) {
        // UPDATE MODE
        const s = subjects.find(sub => sub.subId === subId);
        if (s) {
            document.getElementById('formTitle').innerText = "Subject Details";
            document.getElementById('subName').value = s.subName;
            document.getElementById('subCredit').value = s.creditHours;
            document.getElementById('editIdx').value = subId;
            
            document.getElementById('updateButtons').classList.remove('hidden');
            document.getElementById('createButtons').classList.add('hidden');
        }
    } else {
        // CREATE MODE
        document.getElementById('formTitle').innerText = "Subject Details";
        document.getElementById('editIdx').value = "";
        
        document.getElementById('createButtons').classList.remove('hidden');
        document.getElementById('updateButtons').classList.add('hidden');
    }

    document.getElementById('subjectListPage').classList.add('hidden');
    document.getElementById('formPage').classList.remove('hidden');
}

// ============================================================
// SAVE SUBJECT (Create/Update) - Database Integration
// ============================================================
function saveData() {
    const name = document.getElementById('subName').value.trim();
    const credit = document.getElementById('subCredit').value.trim();
    const subId = document.getElementById('editIdx').value;

    if (!name || !credit) {
        showError("Please fill in all fields!");
        return;
    }

    const formData = new URLSearchParams();
    formData.append("subName", name);
    formData.append("creditHours", credit);

    let url, successTitle, successMsg;

    if (subId === "") {
        url = "../SubjectController?action=create";
        successTitle = "Registration Successful!";
        successMsg = "New subject added.";
    } else {
        formData.append("subId", subId);
        url = "../SubjectController?action=update";
        successTitle = "Update Successful!";
        successMsg = "Subject updated.";
    }

    fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            document.getElementById('successMsg').innerText = successMsg;
            document.getElementById('formPage').classList.add('hidden');
            new bootstrap.Modal(document.getElementById('successModal')).show();
        } else {
            showError(data.message || "Operation failed.");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        showError("Failed to connect to server.");
    });
}

// ============================================================
// OPEN ENROLLMENT MODAL
// ============================================================
function openEnroll(subId) {
    activeSubId = subId;
    const s = subjects.find(sub => sub.subId === subId);
    if (s) {
        document.getElementById('targetSub').innerText = s.subName;
        new bootstrap.Modal(document.getElementById('enrollModal')).show();
    }
}

// ============================================================
// EXECUTE ENROLLMENT - Database Integration
// ============================================================
function executeEnroll() {
    const tId = localStorage.getItem('active_tId');

    const formData = new URLSearchParams();
    formData.append("subId", activeSubId);
    formData.append("tId", tId);

    fetch("../SubjectController?action=enroll", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
    })
    .then(response => response.json())
    .then(data => {
        bootstrap.Modal.getInstance(document.getElementById('enrollModal')).hide();

        if (data.status === "success") {
            const s = subjects.find(sub => sub.subId === activeSubId);
            document.getElementById('successMsg').innerText = "You enrolled for " + (s ? s.subName : "the subject");
            new bootstrap.Modal(document.getElementById('successModal')).show();
        } else {
            showError("Something went wrong: " + data.message);
        }
    })
    .catch(error => {
        console.error("Error:", error);
        bootstrap.Modal.getInstance(document.getElementById('enrollModal')).hide();
        showError("Failed to connect to server. Please try again.");
    });
}

// ============================================================
// CLOSE SUCCESS MODAL
// ============================================================
function closeSuccessModal() {
    bootstrap.Modal.getInstance(document.getElementById('successModal')).hide();
    document.getElementById('subjectListPage').classList.remove('hidden');
    document.getElementById('formPage').classList.add('hidden');
    loadSubjects();
}