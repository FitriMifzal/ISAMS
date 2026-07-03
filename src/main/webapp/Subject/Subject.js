// SUBJECT.JS
// User profile init handled by Sidebar.js

let subjects = [];      // holds the last-fetched list, used by view/enroll modals
let currentUserRole = "";
let activeSubId = null; // subject currently targeted for enroll

document.addEventListener('DOMContentLoaded', function () {
    // check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = "../Create-Account/Create-Account.html";
        return;
    }

    currentUserRole = localStorage.getItem('active_role') || 'Subject Teacher';

    // adjust UI based on user role
    const btnCreate = document.getElementById('btnCreate');
    if (currentUserRole === "Penyelaras Intervensi") {
        btnCreate.style.display = 'block';
    } else {
        btnCreate.style.display = 'none';
    }

    loadSubjects();
});

// load subjects from database
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

// render subject table based on user role
function renderTable() {
    const body = document.getElementById('subjectTableBody');
    body.innerHTML = '';

    const myTId = parseInt(localStorage.getItem('active_tId'));

    subjects.forEach((s) => {
        let btns = `<button class="btn btn-view btn-sm" onclick="viewSub(${s.subId})">View</button>`;

        if (currentUserRole === "Penyelaras Intervensi") {
            btns += `<button class="btn btn-update btn-sm" onclick="showForm(${s.subId})">Update</button>`;
        } else if (currentUserRole === "Subject Teacher") {
            if (s.tId !== null && s.tId === myTId) {
                btns += `<button class="btn btn-secondary btn-sm" disabled><i class="bi bi-check-circle"></i> Enrolled</button>`;
            } else if (s.tId === null) {
                btns += `<button class="btn btn-save btn-sm" onclick="openEnroll(${s.subId})">Enroll</button>`;
            } else {
                btns += `<button class="btn btn-secondary btn-sm" disabled>Assigned</button>`;
            }
        }

        const lecturer = s.tId === null ? '<span class="text-muted">Unassigned</span>' : s.teacherName;

        body.innerHTML += `<tr>
            <td>${s.subName}</td>
            <td>${s.creditHours}</td>
            <td>${lecturer}</td>
            <td><div class="action-gap">${btns}</div></td>
        </tr>`;
    });
}

// show subject list page
function showList() {
    document.getElementById('subjectListPage').classList.remove('hidden');
    document.getElementById('formPage').classList.add('hidden');
    document.getElementById('successPage').classList.add('hidden');
    loadSubjects();
}

// show form page for create/update
function showForm(subId) {
    document.getElementById('subjectForm').reset();
    document.getElementById('globalError').classList.add('hidden');

    if (subId !== undefined) {
        const s = subjects.find(sub => sub.subId === subId);
        document.getElementById('formTitle').innerText = "Update Subject Information";
        document.getElementById('subName').value = s.subName;
        document.getElementById('subCredit').value = s.creditHours;
        document.getElementById('editIdx').value = subId;
    } else {
        document.getElementById('formTitle').innerText = "Subject Registration Form";
        document.getElementById('editIdx').value = "";
    }

    document.getElementById('subjectListPage').classList.add('hidden');
    document.getElementById('formPage').classList.remove('hidden');
}

// save subject - create or update
function saveData() {
    const name = document.getElementById('subName').value.trim();
    const credit = document.getElementById('subCredit').value.trim();
    const subId = document.getElementById('editIdx').value;

    document.getElementById('globalError').classList.add('hidden');

    if (!name || !credit) {
        document.getElementById('globalError').classList.remove('hidden');
        document.getElementById('globalError').innerText = "Please fill in all fields!";
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
            document.getElementById('resTitle').innerText = successTitle;
            document.getElementById('resMsg').innerText = successMsg;
            document.getElementById('formPage').classList.add('hidden');
            document.getElementById('successPage').classList.remove('hidden');
        } else {
            document.getElementById('globalError').classList.remove('hidden');
            document.getElementById('globalError').innerText = data.message;
        }
    })
    .catch(error => {
        console.error("Error:", error);
        document.getElementById('globalError').classList.remove('hidden');
        document.getElementById('globalError').innerText = "Failed to connect to server.";
    });
}

// view subject details in modal
function viewSub(subId) {
    const s = subjects.find(sub => sub.subId === subId);
    const lecturer = s.tId === null
        ? '<span class="text-muted">Not Assigned</span>'
        : `<span class="text-success fw-bold">${s.teacherName}</span>`;

    document.getElementById('viewDetailBody').innerHTML = `
        <div class="mb-2"><strong>Subject Name:</strong> ${s.subName}</div>
        <div class="mb-2"><strong>Credit Hours:</strong> ${s.creditHours}</div>
        <div><strong>Lecturer:</strong> ${lecturer}</div>
    `;
    new bootstrap.Modal(document.getElementById('viewModal')).show();
}

// open enrollment confirmation modal
function openEnroll(subId) {
    activeSubId = subId;
    const s = subjects.find(sub => sub.subId === subId);
    document.getElementById('targetSub').innerText = s.subName;
    new bootstrap.Modal(document.getElementById('enrollModal')).show();
}

// execute enrollment - claims the subject for the logged-in teacher
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
            document.getElementById('resTitle').innerText = "Enrollment Successful!";
            document.getElementById('resMsg').innerText = "You registered for " + s.subName;
            document.getElementById('subjectListPage').classList.add('hidden');
            document.getElementById('successPage').classList.remove('hidden');
        } else {
            alert("Something went wrong: " + data.message);
        }
    })
    .catch(error => {
        console.error("Error:", error);
        bootstrap.Modal.getInstance(document.getElementById('enrollModal')).hide();
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