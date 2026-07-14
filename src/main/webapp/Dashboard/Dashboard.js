// DASHBOARD.JS
// Statistics dikira dari controller sedia ada (list) — tiada perubahan pada Java

document.addEventListener('DOMContentLoaded', function () {
    sessionStorage.setItem('profile_return_url', window.location.href);

    // Paparkan peranan sebenar pengguna yang sedang log masuk
    applyActiveRole();

    // Render stats cards ikut role, kemudian load data
    renderStatsCards();
    loadDashboardStatistics();
	renderTrendSection();
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
    if (role === 'Penyelaras Intervensi') {
        fetch("../SubjectController?action=list")
            .then(r => r.json())
            .then(list => setStat('totalSubjects', list.length))
            .catch(e => console.error("Error loading subjects:", e));
    } else {
        // Teacher: kira subjek UNIK yang dia ajar (guna assignments, bukan list)
        fetch("../SubjectController?action=assignments")
            .then(r => r.json())
            .then(list => {
                var seen = [];
                list.forEach(function (a) {
                    if (a.tId === myTId && !seen.includes(a.subId)) {
                        seen.push(a.subId);
                    }
                });
                setStat('totalSubjects', seen.length);
            })
            .catch(e => console.error("Error loading subjects:", e));
    }

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

function renderTrendSection() {
    var section = document.getElementById('trendSection');
    if (!section) return;
 
    var role = (localStorage.getItem('active_role') || 'Teacher').trim();
 
    // PI-only feature - regular teachers don't get this card at all
    if (role !== 'Penyelaras Intervensi') {
        section.innerHTML = '';
        return;
    }
 
    section.innerHTML = `
        <div class="content-card">
            <h2 class="card-title">Attendance Percentage Trend</h2>
            <p class="card-sub">Percentage of students present, by date, across all teachers under you.</p>
            <div id="trendChartContainer" class="trend-chart-container">
                <p class="loading-msg">Loading chart...</p>
            </div>
        </div>
    `;
 
    loadAttendanceTrend();
}
 
function loadAttendanceTrend() {
    var container = document.getElementById('trendChartContainer');
    var piId = localStorage.getItem('active_tId');
 
    if (!piId) {
        container.innerHTML = `<p class="loading-msg">Session expired. Please log in again.</p>`;
        return;
    }
 
    fetch("../DashboardTrendController?piId=" + encodeURIComponent(piId))
        .then(response => response.json())
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) {
                container.innerHTML = `<p class="loading-msg">No attendance sessions recorded yet.</p>`;
                return;
            }
            renderAttendanceTrendChart(data);
        })
        .catch(error => {
            console.error("Error loading attendance trend:", error);
            container.innerHTML = `<p class="loading-msg">Failed to load chart.</p>`;
        });
}
 
function renderAttendanceTrendChart(data) {
    const container = document.getElementById("trendChartContainer");
 
	const width = Math.max(700, data.length * 100);
	const height = 380;
    const paddingLeft = 50;
    const paddingBottom = 40;
    const paddingTop = 20;
    const paddingRight = 20;
 
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;
 
    const maxY = 100;
    const stepX = data.length > 1 ? chartWidth / (data.length - 1) : 0;
 
    function xPos(i) {
        return paddingLeft + (stepX * i);
    }
 
    function yPos(percentage) {
        return paddingTop + chartHeight - ((percentage / maxY) * chartHeight);
    }
 
    let gridLines = "";
    let yLabels = "";
    for (let p = 0; p <= 100; p += 20) {
        const y = yPos(p);
        gridLines += `<line class="trend-gridline" x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}"></line>`;
        yLabels += `<text class="trend-axis-label" x="${paddingLeft - 10}" y="${y + 4}" text-anchor="end">${p}%</text>`;
    }
 
    let linePoints = "";
    let pointsAndLabels = "";
 
    data.forEach((d, i) => {
        const x = xPos(i);
        const y = yPos(d.percentage);
 
        linePoints += (i === 0 ? "M" : "L") + x + "," + y + " ";
 
        pointsAndLabels += `
            <circle class="trend-point" cx="${x}" cy="${y}" r="4">
                <title>${d.date}: ${d.percentage}% (${d.presentCount}/${d.totalStudents} present)</title>
            </circle>
            <text class="trend-axis-label" x="${x}" y="${height - paddingBottom + 20}" text-anchor="middle">${d.date}</text>
            <text class="trend-tooltip" x="${x}" y="${y - 10}" text-anchor="middle">${d.percentage}%</text>
        `;
    });
 
    const svg = `
        <svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
            ${gridLines}
            ${yLabels}
            <path class="trend-line" d="${linePoints}"></path>
            ${pointsAndLabels}
        </svg>
    `;
 
    container.innerHTML = svg;
}
