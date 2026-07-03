/* ============================================================
   ENROLL-SUBJECT.JS — Page-specific logic
   User profile initialization handled by Sidebar.js
   ============================================================ */

// ══════════════════════════════════════════════════════════════
// DATA & STATE
// ══════════════════════════════════════════════════════════════

let allStudents = [
    { id: 's1', name: 'Ali bin Abu', kelas: '4 Amanah' },
    { id: 's2', name: 'Siti Nabilah', kelas: '4 Amanah' },
    { id: 's3', name: 'Johan Hakim', kelas: '4 Bestari' },
    { id: 's4', name: 'Nurul Ain Zulaikha', kelas: '4 Bestari' },
    { id: 's5', name: 'Haziq Faris', kelas: '4 Cemerlang' },
    { id: 's6', name: 'Aina Sofea', kelas: '4 Cemerlang' }
];

let savedEnrollments = {};
let currentSubject = '';
let workingEnrolled = [];

// ══════════════════════════════════════════════════════════════
// PAGE INITIALIZATION
// ══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
		window.location.href = "../Create-Account/Create-Account.html"; 
        return;
    }

    // Initialize page
    renderSummary();
});

// ══════════════════════════════════════════════════════════════
// SUBJECT CHANGE HANDLER
// ══════════════════════════════════════════════════════════════

function onSubjectChange() {
    const sel = document.getElementById('subject-select');
    currentSubject = sel.value;
    workingEnrolled = currentSubject && savedEnrollments[currentSubject]
        ? [...savedEnrollments[currentSubject]]
        : [];
    renderAll();
}

// ══════════════════════════════════════════════════════════════
// RENDER FUNCTIONS
// ══════════════════════════════════════════════════════════════

function renderAll() {
    renderPool();
    renderEnrolled();
    renderSummary();
    updateSaveBtn();
    document.getElementById('enrolled-subject-label').textContent =
        currentSubject ? document.getElementById('subject-select').selectedOptions[0].text : '—';
}

/**
 * Render left panel: Available Students
 */
function renderPool() {
    const pool = document.getElementById('student-pool');
    pool.innerHTML = '';

    if (!currentSubject) {
        pool.innerHTML = '<p style="color:#6b7a99;font-size:13px;text-align:center;padding:24px 0;">Please select a subject first.</p>';
        return;
    }

    allStudents.forEach(s => {
        const alreadyHere = workingEnrolled.includes(s.id);

        const row = document.createElement('div');
        row.className = 'student-row' + (alreadyHere ? ' already-enrolled' : '');
        row.innerHTML = `
            <div class="student-info">
                <div class="student-avatar">${initials(s.name)}</div>
                <div>
                    <div class="student-name">${s.name}</div>
                    <div class="student-class">${s.kelas}</div>
                </div>
            </div>
            ${alreadyHere
                ? '<span class="enrolled-tag">Enrolled</span>'
                : `<button class="btn-enroll" onclick="enrollStudent('${s.id}')">+ Enroll</button>`
            }
        `;
        pool.appendChild(row);
    });
}

/**
 * Render right panel: Enrolled Students
 */
function renderEnrolled() {
    const list = document.getElementById('enrolled-list');
    list.innerHTML = '';

    if (!currentSubject) return;

    workingEnrolled.forEach(sid => {
        const s = allStudents.find(x => x.id === sid);
        if (!s) return;

        const row = document.createElement('div');
        row.className = 'enrolled-row';
        row.innerHTML = `
            <div class="student-info">
                <div class="student-avatar">${initials(s.name)}</div>
                <div>
                    <div class="student-name">${s.name}</div>
                    <div class="student-class">${s.kelas}</div>
                </div>
            </div>
            <button class="btn-undo" onclick="undoEnroll('${s.id}')">↩ Undo</button>
        `;
        list.appendChild(row);
    });
}

/**
 * Render top card: Saved Enrollment Summary
 */
function renderSummary() {
    const grid = document.getElementById('summary-grid');
    const subjects = Object.keys(savedEnrollments);

    if (subjects.length === 0) {
        grid.innerHTML = '<div style="color:#6b7a99;font-size:13px;">No saved data available.</div>';
        return;
    }

    grid.innerHTML = '';
    subjects.forEach(code => {
        const count = savedEnrollments[code].length;
        const label = subjectLabel(code);
        const div = document.createElement('div');
        div.className = 'summary-item';
        div.innerHTML = `
            <div class="subj-name">${label}</div>
            <div class="subj-count">${count} students enrolled</div>
        `;
        grid.appendChild(div);
    });
}

// ══════════════════════════════════════════════════════════════
// ENROLLMENT ACTIONS
// ══════════════════════════════════════════════════════════════

/**
 * Add student to enrollment
 */
function enrollStudent(sid) {
    if (!currentSubject) return;
    if (workingEnrolled.includes(sid)) return;
    workingEnrolled.push(sid);
    renderAll();
}

/**
 * Remove student from enrollment
 */
function undoEnroll(sid) {
    workingEnrolled = workingEnrolled.filter(x => x !== sid);
    renderAll();
}

/**
 * Save enrollment to storage
 */
function saveEnrollment() {
    if (!currentSubject) return;
    savedEnrollments[currentSubject] = [...workingEnrolled];
    renderSummary();
    showToast(`✅ Enrollment for ${subjectLabel(currentSubject)} successfully saved!`);
    updateSaveBtn();
}

/**
 * Update save button state
 */
function updateSaveBtn() {
    const btn = document.getElementById('btn-save');
    btn.disabled = !currentSubject || workingEnrolled.length === 0;
}

// ══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════════

/**
 * Get initials from name
 */
function initials(name) {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

/**
 * Map subject code to label
 */
function subjectLabel(code) {
    const map = {
        BM: 'Malay Language',
        BI: 'English Language',
        MT: 'Mathematics',
        SC: 'Science',
        SEJ: 'History'
    };
    return map[code] || code;
}

/**
 * Show toast notification
 */
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

/**
 * Toggle profile section
 */
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