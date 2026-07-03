/* ============================================================
   CREATE-STUDENT-ATTENDANCE.JS — Page-specific logic
   User profile initialization handled by Sidebar.js
   ============================================================ */

// Student Database
const students = [
    { name: "AUMAN BIN ABIDEN", id: "2023122119" },
    { name: "ARISHA REENA BINTI AZMAL RAHIM", id: "2023112805" },
    { name: "ILYA SYAHIRAH BT HAIDI", id: "2023112709" },
    { name: "MUHAMMAD SYAZANI BIN AHMAD", id: "2023126582" },
    { name: "NUR AINA INSYIRAH BT ROSLAN", id: "2023118834" },
    { name: "NUR ALIYAH BINTI RAZALI", id: "2023117621" },
    { name: "NUR FARHANA BINTI ZULKIFLI", id: "2023119045" },
    { name: "NURUL AIN BINTI HAMID", id: "2023115503" },
    { name: "SITI HAJAR BINTI MOHD NOOR", id: "2023120167" },
    { name: "WAN HAZIQ BIN WAN AZMAN", id: "2023123412" }
];

// Past session dates (Monday sessions) – all before today
const pastDates = ["31/03", "07/04", "14/04", "21/04", "28/04", "05/05", "12/05", "26/05", "09/06", "16/06"];

/* ════════════════════════════════════════════════════════
   HELPER FUNCTIONS
════════════════════════════════════════════════════════ */

function fakePast(studentIdx, dateIdx) {
    const absences = [[7, 9], [3], [5], [2, 8], [6], [4, 9], [1], [7], [3, 5], [2, 8]];
    const reasons = [[2], [8], [7], [5], [1], [3], [9], [4], [7], [6]];
    const row = absences[studentIdx % absences.length];
    const rea = reasons[studentIdx % reasons.length];
    if (rea.includes(dateIdx)) return "O";
    if (row.includes(dateIdx)) return "✗";
    return "✓";
}

function getTodayStr() {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}`;
}

/* ════════════════════════════════════════════════════════
   TABLE INITIALIZATION
════════════════════════════════════════════════════════ */

const todayStr = getTodayStr();
const allDates = pastDates.includes(todayStr) ? [...pastDates] : [...pastDates, todayStr];
const todayIdx = allDates.indexOf(todayStr);

function buildTable() {
    const head = document.getElementById('gridHead');
    const body = document.getElementById('gridBody');

    // Header row
    let thHTML = `<tr>
        <th class="sticky-col" style="min-width:260px;">NAMA PELAJAR (STUDENT NAME)</th>
        <th style="min-width:115px;">NO PELAJAR</th>`;
    
    allDates.forEach((d, i) => {
        const isTd = (i === todayIdx);
        thHTML += `<th style="min-width:70px;" ${isTd ? 'class="today-col"' : ''}>${d}${isTd ? '<span class="today-tag">TODAY</span>' : ''}</th>`;
    });
    thHTML += `</tr>`;
    head.innerHTML = thHTML;

    // Body rows
    body.innerHTML = '';
    students.forEach((s, si) => {
        const tr = document.createElement('tr');
        tr.dataset.name = s.name.toLowerCase();
        tr.dataset.id = s.id;

        let tdHTML = `<td class="sticky-col">${s.name}</td><td>${s.id}</td>`;

        allDates.forEach((d, di) => {
            const isToday = (di === todayIdx);
            if (isToday) {
                // Editable dropdown
                tdHTML += `<td class="today-col">
                    <select class="att-select val-present" onchange="styleSelect(this)" data-student="${si}" data-date="${d}">
                        <option value="✓" selected>✓ Hadir</option>
                        <option value="✗">✗ Absent</option>
                        <option value="O">O  Reason</option>
                    </select>
                </td>`;
            } else {
                // Locked past value
                const val = fakePast(si, di);
                const cls = val === "✓" ? "badge-present" : val === "✗" ? "badge-absent" : "badge-reason";
                tdHTML += `<td class="locked-col"><span class="att-badge ${cls}">${val}</span></td>`;
            }
        });

        tr.innerHTML = tdHTML;
        body.appendChild(tr);
    });
}

function styleSelect(sel) {
    sel.className = 'att-select';
    if (sel.value === '✓') sel.classList.add('val-present');
    else if (sel.value === '✗') sel.classList.add('val-absent');
    else sel.classList.add('val-reason');
}

/* ════════════════════════════════════════════════════════
   FILTER FUNCTION
════════════════════════════════════════════════════════ */

function filterGrid() {
    const q = document.getElementById('gridSearch').value.toLowerCase();
    document.querySelectorAll('#gridBody tr').forEach(tr => {
        const match = tr.dataset.name.includes(q) || tr.dataset.id.includes(q);
        tr.style.display = match ? '' : 'none';
    });
}

/* ════════════════════════════════════════════════════════
   SAVE FUNCTION
════════════════════════════════════════════════════════ */

function saveGrid() {
    const data = [];
    document.querySelectorAll('#gridBody tr').forEach(tr => {
        const name = tr.dataset.name;
        const id = tr.dataset.id;
        const sel = tr.querySelector('.att-select');
        if (sel) data.push({ name, id, date: todayStr, status: sel.value });
    });
    
    // Save to localStorage
    localStorage.setItem('attendance_' + todayStr.replace('/', '_'), JSON.stringify(data));
    
    console.log('Saved:', data);
    showToast('✅  Attendance saved for ' + todayStr);
}

/* ════════════════════════════════════════════════════════
   EXPORT CSV FUNCTION
════════════════════════════════════════════════════════ */

function exportGridCSV() {
    const symMap = { '✓': 'Present', '✗': 'Absent', 'O': 'Absent-Reason' };
    let csv = 'Student Name,Student ID,' + allDates.map(d => '"' + d + '"').join(',') + '\n';

    document.querySelectorAll('#gridBody tr').forEach(tr => {
        if (tr.style.display === 'none') return;
        const cells = tr.querySelectorAll('td');
        const name = cells[0].textContent.trim();
        const id = cells[1].textContent.trim();
        const vals = [];

        allDates.forEach((d, di) => {
            const isToday = (di === todayIdx);
            if (isToday) {
                const sel = tr.querySelector('.att-select');
                const raw = sel ? sel.value : '✓';
                vals.push('"' + (symMap[raw] || raw) + '"');
            } else {
                const badge = cells[di + 2] ? cells[di + 2].querySelector('.att-badge') : null;
                const raw = badge ? badge.textContent.trim() : '✓';
                vals.push('"' + (symMap[raw] || raw) + '"');
            }
        });
        csv += '"' + name + '","' + id + '",' + vals.join(',') + '\n';
    });

    const uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    const a = document.createElement('a');
    a.href = uri;
    a.download = 'attendance_' + todayStr.replace('/', '_') + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('📥  CSV exported successfully');
}

/* ════════════════════════════════════════════════════════
   RESET FUNCTION
════════════════════════════════════════════════════════ */

function resetGrid() {
    document.querySelectorAll('.att-select').forEach(sel => {
        sel.value = '✓';
        styleSelect(sel);
    });
    showToast("🔄  Today's attendance reset to Present");
}

/* ════════════════════════════════════════════════════════
   TOAST NOTIFICATION
════════════════════════════════════════════════════════ */

function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2800);
}

/* ════════════════════════════════════════════════════════
   UTILITY FUNCTIONS
════════════════════════════════════════════════════════ */

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

/* ════════════════════════════════════════════════════════
   PAGE INITIALIZATION
════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = "../Create-Account/Create-Account.html";
        return;
    }

    // Build table
    buildTable();
});