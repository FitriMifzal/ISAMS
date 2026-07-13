// DASHBOARD.JS
// Statistics dikira dari controller sedia ada (list) — tiada perubahan pada Java

document.addEventListener('DOMContentLoaded', function () {
    sessionStorage.setItem('profile_return_url', window.location.href);

    // Paparkan peranan sebenar pengguna yang sedang log masuk
    applyActiveRole();

    // Render stats cards ikut role, kemudian load data
    renderStatsCards();
    loadDashboardStatistics();
});

/* ── PAPARKAN PERANAN SEBENAR PADA WELCOME CARD (TIDAK DIUBAH) ── */
function applyActiveRole() {
    var statusText = document.getElementById('status-text');
    if (!statusText) {
        return;
    }

    var activeRole = localStorage.getItem('active_role');

    // Tolak nilai rosak / lapuk seperti "null" atau "undefined" yang tersimpan sebagai string
    if (!activeRole || activeRole === 'null' || activeRole === 'undefined' || !activeRole.trim()) {
        return; // biarkan teks asal, jangan paparkan peranan yang salah
    }

    statusText.textContent = activeRole.trim();
}

/* ────────────────────────────────────────────────────────
   RENDER STATS CARDS — ikut active_role
────────────────────────────────────────────────────────── */
function renderStatsCards() {
    var section = document.getElementById('statsSection');
    if (!section) return;

    var role = (localStorage.getItem('active_role') || 'Teacher').trim();

    var cards;

    if (role === 'Penyelaras Intervensi') {
        cards = [
            { id: 'totalStudents', icon: 'bi-people-fill',           cls: 'icon-student', label: 'Total Students',   desc: 'Students registered in the system' },
            { id: 'totalClasses',  icon: 'bi-door-open-fill',        cls: 'icon-class',   label: 'Total Classes',    desc: 'Classes currently available' },
            { id: 'totalTeachers', icon: 'bi-person-badge-fill',     cls: 'icon-teacher', label: 'Teacher Accounts', desc: 'Teacher accounts with active status' },
            { id: 'totalSubjects', icon: 'bi-journal-bookmark-fill', cls: 'icon-subject', label: 'Total Subjects',   desc: 'Subjects offered in the system' }
        ];
    } else {
        cards = [
            { id: 'totalSubjects', icon: 'bi-journal-bookmark-fill', cls: 'icon-subject', label: 'Subjects Teaching', desc: 'Subjects you are enrolled to teach' },
            { id: 'totalStudents', icon: 'bi-people-fill',           cls: 'icon-student', label: 'Total Students',    desc: 'Students registered in the system' },
            { id: 'totalClasses',  icon: 'bi-door-open-fill',        cls: 'icon-class',   label: 'Total Classes',     desc: 'Classes currently available' }
        ];
    }

    section.innerHTML = cards.map(function (c) {
        return `
            <div class="stats-card">
                <div class="stat-icon ${c.cls}"><i class="bi ${c.icon}"></i></div>
                <div class="stat-info">
                    <div class="stat-value" id="${c.id}">0</div>
                    <div class="stat-label">${c.label}</div>
                    <div class="stat-desc">${c.desc}</div>
                </div>
            </div>
        `;
    }).join('');
}

/* ────────────────────────────────────────────────────────
   LOAD STATISTICS — guna controller 'list' sedia ada
   (DashboardController tidak dipanggil kerana ia teacher-scoped,
    menyebabkan Penyelaras Intervensi sentiasa dapat 0)
────────────────────────────────────────────────────────── */
function loadDashboardStatistics() {
    var role = (localStorage.getItem('active_role') || 'Teacher').trim();
    var myTId = parseInt(localStorage.getItem('active_tId'));

    // ── TOTAL STUDENTS ──
    fetch("../StudentController?action=list")
        .then(r => r.json())
        .then(list => setStat('totalStudents', list.length))
        .catch(e => console.error("Error loading students:", e));

    // ── TOTAL CLASSES ──
    fetch("../ClassroomController?action=list")
        .then(r => r.json())
        .then(list => setStat('totalClasses', list.length))
        .catch(e => console.error("Error loading classes:", e));

    // ── SUBJECTS ──
    fetch("../SubjectController?action=list")
        .then(r => r.json())
        .then(list => {
            if (role === 'Penyelaras Intervensi') {
                setStat('totalSubjects', list.length);
            } else {
                // Teacher: hanya subjek yang dia enrolled
                var mine = list.filter(s => s.tId !== null && s.tId === myTId);
                setStat('totalSubjects', mine.length);
            }
        })
        .catch(e => console.error("Error loading subjects:", e));

    // ── TEACHER ACCOUNTS (Penyelaras Intervensi sahaja) ──
    if (role === 'Penyelaras Intervensi') {
        fetch("../TeacherController?action=list")
            .then(r => r.json())
            .then(list => {
                // STATUS VARCHAR2(10) DEFAULT 'ACTIVE' — kira akaun aktif sahaja
                var active = list.filter(t => (t.status || '').trim().toUpperCase() === 'ACTIVE');
                setStat('totalTeachers', active.length);
            })
            .catch(e => console.error("Error loading teachers:", e));
    }
}

/* ── Helper: set nilai kad kalau element wujud ── */
function setStat(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
}