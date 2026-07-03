/* ============================================================
   SUBJECT.JS — Page-specific logic
   User profile initialization handled by Sidebar.js
   ============================================================ */

// ══════════════════════════════════════════════════════════════
// DATA & STATE
// ══════════════════════════════════════════════════════════════

let subjects = [
    { id: "SSD3013", name: "System Analysis & Design", credit: 3, teacher: "En. Azman", enrolled: false },
    { id: "SSD3023", name: "Database Management", credit: 3, teacher: "Pn. Maria", enrolled: false },
    { id: "SSD3033", name: "Web Development", credit: 3, teacher: "Cik Sarah", enrolled: false },
    { id: "SSD3042", name: "Computer Networking", credit: 2, teacher: "En. Zaki", enrolled: false },
    { id: "SSD4013", name: "Mobile App Development", credit: 3, teacher: "Pn. Hajar", enrolled: false },
    { id: "SSD4022", name: "Cyber Security Basics", credit: 2, teacher: "En. Firdaus", enrolled: false },
    { id: "SSD4033", name: "Final Year Project I", credit: 3, teacher: "Dr. Khairul", enrolled: false },
    { id: "SSD4042", name: "Entrepreneurship", credit: 2, teacher: "Pn. Aishah", enrolled: false }
];

let currentUserRole = "";
let activeIdx = null;

// ══════════════════════════════════════════════════════════════
// PAGE INITIALIZATION
// ══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = "../Create-Account/Create-Account.html";
        return;
    }

    // Get user role from localStorage
    const savedRole = localStorage.getItem('reg_role') || 'Subject Teacher';
    currentUserRole = savedRole;

    // Adjust UI based on user role
    if (savedRole === "Penyelaras Intervensi") {
        document.getElementById('btnCreate').style.display = 'block';
    } else {
        document.getElementById('btnCreate').style.display = 'none';
    }

    // Render initial table
    renderTable();
});

// ══════════════════════════════════════════════════════════════
// TABLE MANAGEMENT
// ══════════════════════════════════════════════════════════════

/**
 * Render subject table based on user role
 */
function renderTable() {
    const body = document.getElementById('subjectTableBody');
    body.innerHTML = '';

    subjects.forEach((s, i) => {
        let btns = `<button class="btn btn-view btn-sm" onclick="viewSub(${i})">View</button>`;

        if (currentUserRole === "Penyelaras Intervensi") {
            btns += `<button class="btn btn-update btn-sm" onclick="showForm(${i})">Update</button>`;
        } else if (currentUserRole === "Subject Teacher") {
            btns += s.enrolled
                ? `<button class="btn btn-secondary btn-sm disabled"><i class="bi bi-check-circle"></i> Enrolled</button>`
                : `<button class="btn btn-save btn-sm" onclick="openEnroll(${i})">Enroll</button>`;
        }

        body.innerHTML += `<tr>
            <td><strong>${s.id}</strong></td>
            <td>${s.name}</td>
            <td>${s.credit}</td>
            <td>${s.teacher}</td>
            <td><div class="action-gap">${btns}</div></td>
        </tr>`;
    });
}

// ══════════════════════════════════════════════════════════════
// PAGE NAVIGATION
// ══════════════════════════════════════════════════════════════

/**
 * Show subject list page
 */
function showList() {
    document.getElementById('subjectListPage').classList.remove('hidden');
    document.getElementById('formPage').classList.add('hidden');
    document.getElementById('successPage').classList.add('hidden');
    renderTable();
}

/**
 * Show form page for create/update
 */
function showForm(i = null) {
    document.getElementById('subjectForm').reset();
    document.getElementById('globalError').classList.add('hidden');
    document.getElementById('idError').classList.add('hidden');

    if (i !== null) {
        const s = subjects[i];
        document.getElementById('formTitle').innerText = "Update Subject Information";
        document.getElementById('subId').value = s.id;
        document.getElementById('subId').readOnly = true;
        document.getElementById('subName').value = s.name;
        document.getElementById('subCredit').value = s.credit;
        document.getElementById('subTeacher').value = s.teacher;
        document.getElementById('editIdx').value = i;
    } else {
        document.getElementById('formTitle').innerText = "Subject Registration Form";
        document.getElementById('subId').readOnly = false;
        document.getElementById('editIdx').value = "";
    }

    document.getElementById('subjectListPage').classList.add('hidden');
    document.getElementById('formPage').classList.remove('hidden');
}

// ══════════════════════════════════════════════════════════════
// FORM OPERATIONS
// ══════════════════════════════════════════════════════════════

/**
 * Save subject (create or update)
 */
function saveData() {
    const id = document.getElementById('subId').value.trim();
    const name = document.getElementById('subName').value.trim();
    const credit = document.getElementById('subCredit').value.trim();
    const teacher = document.getElementById('subTeacher').value.trim();
    const idx = document.getElementById('editIdx').value;

    document.getElementById('globalError').classList.add('hidden');
    document.getElementById('idError').classList.add('hidden');

    // Validation
    if (!id || !name || !credit || !teacher) {
        document.getElementById('globalError').classList.remove('hidden');
        document.getElementById('globalError').innerText = "Please fill in all text fields!";
        return;
    }

    if (idx === "") {
        // Create new subject
        const isDuplicate = subjects.some(s => s.id.toUpperCase() === id.toUpperCase());
        if (isDuplicate) {
            document.getElementById('globalError').classList.remove('hidden');
            document.getElementById('globalError').innerText = "Error: Subject Code '" + id + "' already exists!";
            return;
        }

        if (!id.toUpperCase().startsWith("SSD")) {
            document.getElementById('idError').classList.remove('hidden');
            return;
        }

        subjects.push({ id, name, credit, teacher, enrolled: false });
        document.getElementById('resTitle').innerText = "Registration Successful!";
        document.getElementById('resMsg').innerText = "New subject added.";
    } else {
        // Update existing subject
        subjects[idx].name = name;
        subjects[idx].credit = credit;
        subjects[idx].teacher = teacher;
        document.getElementById('resTitle').innerText = "Update Successful!";
        document.getElementById('resMsg').innerText = "Subject updated.";
    }

    document.getElementById('formPage').classList.add('hidden');
    document.getElementById('successPage').classList.remove('hidden');
}

// ══════════════════════════════════════════════════════════════
// VIEW & ENROLLMENT
// ══════════════════════════════════════════════════════════════

/**
 * View subject details in modal
 */
function viewSub(i) {
    const s = subjects[i];
    document.getElementById('viewDetailBody').innerHTML = `
        <div class="mb-2"><strong>Subject ID:</strong> ${s.id}</div>
        <div class="mb-2"><strong>Subject Name:</strong> ${s.name}</div>
        <div class="mb-2"><strong>Credit Hours:</strong> ${s.credit}</div>
        <div class="mb-2"><strong>Lecturer:</strong> ${s.teacher}</div>
        <div><strong>Enrollment Status:</strong> ${s.enrolled ? '<span class="text-success fw-bold">Enrolled</span>' : '<span class="text-muted">Not Enrolled</span>'}</div>
    `;
    new bootstrap.Modal(document.getElementById('viewModal')).show();
}

/**
 * Open enrollment confirmation modal
 */
function openEnroll(i) {
    activeIdx = i;
    document.getElementById('targetSub').innerText = subjects[i].name;
    new bootstrap.Modal(document.getElementById('enrollModal')).show();
}

/**
 * Execute enrollment
 */
function executeEnroll() {
    subjects[activeIdx].enrolled = true;
    bootstrap.Modal.getInstance(document.getElementById('enrollModal')).hide();
    document.getElementById('resTitle').innerText = "Enrollment Successful!";
    document.getElementById('resMsg').innerText = "You registered for " + subjects[activeIdx].name;
    document.getElementById('subjectListPage').classList.add('hidden');
    document.getElementById('successPage').classList.remove('hidden');
}

// ══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ══════════════════════════════════════════════════════════════

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