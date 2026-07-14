// SUBJECT.JS — M:N via CLASS_SESSION (three-way link)
// ============================================================

let subjects = [];
let assignments = [];   // {subId, classId, tId, teacherName, classCode, className}
let classrooms = [];
let currentUserRole = "";
let activeSubId = null;

document.addEventListener('DOMContentLoaded', function () {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = "../Create-Account/CreateAccount.html";
        return;
    }

    currentUserRole = localStorage.getItem('active_role') || 'Teacher';

    const pageTitle = document.getElementById('pageTitle');
    const pageDescription = document.getElementById('pageDescription');

    if (currentUserRole.trim() === "Penyelaras Intervensi") {
        pageTitle.innerText = "Subject Details";
        pageDescription.innerText = "Create, and manage all subjects. Click 'Create' to add a new subject or 'Edit' to modify existing ones.";
    } else {
        pageTitle.innerText = "Subject Enrollment";
        pageDescription.innerText = "Enroll in the ones you wish to teach. Click 'Enroll' to register for a subject.";
    }

    const btnCreate = document.getElementById('btnCreate');
    if (currentUserRole.trim() === "Penyelaras Intervensi") {
        btnCreate.style.display = 'block';
    } else {
        btnCreate.style.display = 'none';
    }

    loadClassrooms();
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
// LOAD CLASSROOMS (untuk dropdown enroll)
// ============================================================
function loadClassrooms() {
    fetch("../ClassroomController?action=list")
        .then(r => r.json())
        .then(data => { classrooms = data; })
        .catch(e => console.error("Error loading classrooms:", e));
}

// ============================================================
// LOAD SUBJECTS + ASSIGNMENTS
// ============================================================
function loadSubjects() {
    Promise.all([
        fetch("../SubjectController?action=list").then(r => r.json()),
        fetch("../SubjectController?action=assignments").then(r => r.json())
    ])
    .then(([subs, assigns]) => {
        subjects = subs;
        assignments = assigns;
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
        // semua assignment untuk subjek ni
        const rows = assignments.filter(a => a.subId === s.subId);

        // lecturer column: "Cikgu A (DVMCS4A)", satu per baris
        let lecturer;
        if (rows.length === 0) {
            lecturer = '<span class="text-muted">Unassigned</span>';
        } else {
            lecturer = rows.map(a => `${a.teacherName} <small>(${a.classCode})</small>`).join('<br>');
        }

        let btns = '';

        if (roleToCheck === "Penyelaras Intervensi") {
            btns = `<button class="btn-update" onclick="showForm(${s.subId})">Update</button>`;
        } else {
            // TEACHER: sentiasa boleh enroll (untuk kelas lain)
            const myClasses = rows.filter(a => a.tId === myTId);
            btns = `<button class="btn-save" onclick="openEnroll(${s.subId})">Enroll</button>`;
            if (myClasses.length > 0) {
                btns += `<div style="margin-top:6px;"><small class="text-muted">You teach: ${myClasses.map(a => a.classCode).join(', ')}</small></div>`;
            }
        }

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

    if (subId !== undefined) {
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
        document.getElementById('formTitle').innerText = "Subject Details";
        document.getElementById('editIdx').value = "";

        document.getElementById('createButtons').classList.remove('hidden');
        document.getElementById('updateButtons').classList.add('hidden');
    }

    document.getElementById('subjectListPage').classList.add('hidden');
    document.getElementById('formPage').classList.remove('hidden');
}

// ============================================================
// CHECK DUPLICATE SUBJECT (BARU TAMBAH)
// ============================================================
function checkDuplicateSubject(subName, excludeSubId = null) {
    return new Promise((resolve, reject) => {
        // Buat URLSearchParams untuk hantar ke backend
        const params = new URLSearchParams();
        params.append("action", "checkDuplicate");
        params.append("subName", subName);
        if (excludeSubId) {
            params.append("excludeSubId", excludeSubId);
        }

        fetch("../SubjectController?" + params.toString())
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    resolve(data.isDuplicate);
                } else {
                    reject(data.message || "Failed to check duplicate");
                }
            })
            .catch(error => {
                reject(error);
            });
    });
}

// ============================================================
// SAVE SUBJECT (Create/Update) - WITH DUPLICATE CHECK
// ============================================================
function saveData() {
    const name = document.getElementById('subName').value.trim();
    const credit = document.getElementById('subCredit').value.trim();
    const subId = document.getElementById('editIdx').value;

    // ============================================================
    // VALIDATION ASAS (SAMA MACAM SEBELUM)
    // ============================================================
    if (!name || !credit) {
        showError("Please fill in all fields!");
        return;
    }

    // ============================================================
    // VALIDATION DUPLICATE SUBJECT (BARU TAMBAH)
    // ============================================================
    // Jika edit (subId ada), exclude subject sendiri dari check duplicate
    const excludeId = subId !== "" ? subId : null;

    checkDuplicateSubject(name, excludeId)
        .then(isDuplicate => {
            if (isDuplicate) {
                // ============================================================
                // PAPAR ERROR MESSAGE GUNA MODAL YANG SEDIA ADA
                // ============================================================
                showError("Subject '" + name + "' already exists in the system! Please use a different subject name.");
                return;
            }

            // ============================================================
            // TIADA DUPLICATE — TERUSKAN SAVE (CREATE / UPDATE)
            // ============================================================
            const formData = new URLSearchParams();
            formData.append("subName", name);
            formData.append("creditHours", credit);

            let url, successMsg;

            if (subId === "") {
                url = "../SubjectController?action=create";
                successMsg = "New subject added.";
            } else {
                formData.append("subId", subId);
                url = "../SubjectController?action=update";
                successMsg = "Subject updated.";
            }

            return fetch(url, {
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
        })
        .catch(error => {
            console.error("Error checking duplicate:", error);
            showError("Failed to check duplicate subject. Please try again.");
        });
}

// ============================================================
// OPEN ENROLLMENT MODAL — pilih kelas
// (kelas yang sudah diambil untuk subjek ini tidak dipaparkan)
// ============================================================
function openEnroll(subId) {
    activeSubId = subId;
    const s = subjects.find(sub => sub.subId === subId);
    if (!s) return;

    document.getElementById('targetSub').innerText = s.subName;

    // kelas yang SUDAH diambil untuk subjek ni (oleh mana-mana cikgu)
    const takenClassIds = assignments
        .filter(a => a.subId === subId)
        .map(a => a.classId);

    const sel = document.getElementById('enrollClassSelect');
    sel.innerHTML = `<option value="">-- Select Class --</option>`;

    const available = classrooms.filter(c => !takenClassIds.includes(c.classId));

    if (available.length === 0) {
        sel.innerHTML = `<option value="">-- All classes already assigned --</option>`;
        new bootstrap.Modal(document.getElementById('enrollModal')).show();
        return;
    }

    available.forEach(c => {
        const o = document.createElement('option');
        o.value = c.classId;
        o.textContent = c.classCode + " - " + c.className;
        sel.appendChild(o);
    });

    new bootstrap.Modal(document.getElementById('enrollModal')).show();
}

// ============================================================
// EXECUTE ENROLLMENT
// ============================================================
function executeEnroll() {
    const tId = localStorage.getItem('active_tId');
    const classId = document.getElementById('enrollClassSelect').value;

    if (!classId) {
        showError("Please select a class!");
        return;
    }

    const formData = new URLSearchParams();
    formData.append("subId", activeSubId);
    formData.append("tId", tId);
    formData.append("classId", classId);

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
            showError(data.message || "Something went wrong.");
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