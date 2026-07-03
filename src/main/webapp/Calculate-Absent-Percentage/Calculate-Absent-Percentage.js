/* ============================================================
   CALCULATE-ABSENT-PERCENTAGE.JS — Page-specific logic
   User profile initialization handled by Sidebar.js
   ============================================================ */

// Student Master Database
const studentDatabase = [
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

let selectedStudent = null;

/* ── PAGE INITIALIZATION ── */
document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = "../Create-Account/Create-Account.html";
        return;
    }

    loadDefaultRows();
});

function loadDefaultRows() {
    const tbody = document.getElementById("calcBody");
    tbody.innerHTML = "";

    // Default sample data
    const initialSampleData = [
        { name: "AUMAN BIN ABIDEN", id: "2023122119", attended: 19, absent: 1, rate: "95.0", isBarred: false, code: "TRC501" },
        { name: "ARISHA REENA BINTI AZMAL RAHIM", id: "2023112805", attended: 20, absent: 0, rate: "100.0", isBarred: false, code: "TRC501" },
        { name: "ILYA SYAHIRAH BT HAIDI", id: "2023112709", attended: 15, absent: 5, rate: "75.0", isBarred: true, code: "TRC501" },
        { name: "MUHAMMAD SYAZANI BIN AHMAD", id: "2023126582", attended: 20, absent: 0, rate: "100.0", isBarred: false, code: "TRC501" }
    ];

    initialSampleData.forEach(item => {
        addRowToTable(item);
    });
}

function addRowToTable(item) {
    const tbody = document.getElementById("calcBody");
    const statusClass = item.isBarred ? "badge-absent" : "badge-present";
    const statusText = item.isBarred ? "BARRED (Attendance Failed)" : "ELIGIBLE (Exam Allowed)";

    let actionHTML = "";
    if (item.isBarred) {
        actionHTML = `
            <div class="letter-actions">
                <button class="btn-letter btn-warning" onclick="generateLetterPDF('warning', '${item.name}', '${item.id}', '${item.code}', ${item.attended}, ${item.absent}, ${item.rate})">⚠️ Warning Letter</button>
                <button class="btn-letter btn-intervention" onclick="generateLetterPDF('intervention', '${item.name}', '${item.id}', '${item.code}', ${item.attended}, ${item.absent}, ${item.rate})">📩 Intervention</button>
            </div>`;
    } else {
        actionHTML = `<span class="txt-disabled">No Action Needed</span>`;
    }

    const tr = document.createElement("tr");
    tr.id = `row-${item.id}`;
    tr.innerHTML = `
        <td style="font-weight: 600;">${item.name}</td>
        <td>${item.id}</td>
        <td>${item.attended} Hours</td>
        <td>${item.absent} Hours</td>
        <td style="font-weight: 700; color: ${item.isBarred ? '#e53e3e' : '#28a745'}">${item.rate}%</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td>${actionHTML}</td>
    `;
    tbody.appendChild(tr);
}

/* ════════════════════════════════════════════════════════
   SEARCH STUDENT
════════════════════════════════════════════════════════ */

function searchStudent() {
    const inputID = document.getElementById("searchStudentID").value.trim();
    const msgElement = document.getElementById("searchMessage");
    const inputSection = document.getElementById("inputSection");

    selectedStudent = studentDatabase.find(s => s.id === inputID);

    if (selectedStudent) {
        msgElement.style.color = "#28a745";
        msgElement.innerHTML = `✅ Student Found: ${selectedStudent.name}`;

        document.getElementById("targetStudentName").textContent = selectedStudent.name;
        inputSection.style.display = "block";

        // Reset form
        document.getElementById("hoursAbsent").value = "";
        document.getElementById("totalContactHours").value = "";
    } else {
        msgElement.style.color = "#e53e3e";
        msgElement.innerHTML = "❌ Error: Student ID does not exist in the system. Please try again.";
        inputSection.style.display = "none";
    }
}

/* ════════════════════════════════════════════════════════
   PROCESS CALCULATION
════════════════════════════════════════════════════════ */

function processSelectedCalculation() {
    if (!selectedStudent) return;

    const courseCode = document.getElementById("courseCode").value.trim() || "TRC501";
    const hoursAbsentInput = document.getElementById("hoursAbsent").value;
    const totalContactInput = document.getElementById("totalContactHours").value;

    const absentHours = parseInt(hoursAbsentInput);
    const totalHours = parseInt(totalContactInput);

    // Validation
    if (isNaN(absentHours) || isNaN(totalHours) || totalHours <= 0 || absentHours < 0) {
        alert("Please ensure 'Hours Absent' and 'Total Contact Hours' are filled with valid values.");
        return;
    }

    if (absentHours > totalHours) {
        alert("Error: Absent hours cannot exceed total contact hours!");
        return;
    }

    // Calculate
    const attendedHours = totalHours - absentHours;
    const attendancePercentage = ((attendedHours / totalHours) * 100).toFixed(1);
    const absentRate = (absentHours / totalHours) * 100;
    const isBarred = absentRate >= 20.0;

    // Update or add row
    const statusClass = isBarred ? "badge-absent" : "badge-present";
    const statusText = isBarred ? "BARRED (Attendance Failed)" : "ELIGIBLE (Exam Allowed)";

    let actionHTML = "";
    if (isBarred) {
        actionHTML = `
            <div class="letter-actions">
                <button class="btn-letter btn-warning" onclick="generateLetterPDF('warning', '${selectedStudent.name}', '${selectedStudent.id}', '${courseCode}', ${attendedHours}, ${absentHours}, ${attendancePercentage})">⚠️ Warning Letter</button>
                <button class="btn-letter btn-intervention" onclick="generateLetterPDF('intervention', '${selectedStudent.name}', '${selectedStudent.id}', '${courseCode}', ${attendedHours}, ${absentHours}, ${attendancePercentage})">📩 Intervention</button>
            </div>`;
    } else {
        actionHTML = `<span class="txt-disabled">No Action Needed</span>`;
    }

    const tbody = document.getElementById("calcBody");
    const existingRow = document.getElementById(`row-${selectedStudent.id}`);

    const rowHTML = `
        <td style="font-weight: 600;">${selectedStudent.name}</td>
        <td>${selectedStudent.id}</td>
        <td>${attendedHours} Hours</td>
        <td>${absentHours} Hours</td>
        <td style="font-weight: 700; color: ${isBarred ? '#e53e3e' : '#28a745'}">${attendancePercentage}%</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td>${actionHTML}</td>
    `;

    if (existingRow) {
        existingRow.innerHTML = rowHTML;
    } else {
        const tr = document.createElement("tr");
        tr.id = `row-${selectedStudent.id}`;
        tr.innerHTML = rowHTML;
        tbody.appendChild(tr);
    }
}

/* ════════════════════════════════════════════════════════
   GENERATE PDF LETTER
════════════════════════════════════════════════════════ */

function generateLetterPDF(type, name, id, course, attended, absent, displayPercent) {
    const todayDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    
    let letterTitle = "";
    let letterBody = "";

    if (type === "warning") {
        letterTitle = `WARNING LETTER: COURSE ABSENTEEISM FOR ${course}`;
        letterBody = `
            <p>We are writing to bring to your urgent attention a matter regarding your child's academic attendance.</p>
            <p>2.&nbsp;&nbsp;Please be informed that your child/ward, <strong>${name}</strong> (Student ID: <strong>${id}</strong>), who is currently enrolled in the course <strong>${course}</strong>, has failed to meet the required minimum attendance threshold of 80%.</p>
            <p>3.&nbsp;&nbsp;According to our automated Attendance Management System (SMS) analytics, the current breakdown is as follows:</p>
            <ul>
                <li>Total Course Contact Hours: <strong>${attended + absent} Hours</strong></li>
                <li>Total Hours Attended: <strong>${attended} Hours</strong></li>
                <li>Total Hours Absent: <strong style="color:red;">${absent} Hours</strong></li>
                <li>Current Attendance Rate: <strong>${displayPercent}%</strong></li>
            </ul>
            <p>4.&nbsp;&nbsp;Consequently, the student's status has been updated to <strong>BARRED</strong>. The student will be restricted from sitting for the Final Examination / Evaluation for this semester unless a valid official justification (e.g., medical certificate) is produced immediately.</p>
            <p>Please contact the course lecturer as soon as possible to resolve this issue.</p>
        `;
    } else {
        letterTitle = `INVITATION LETTER: STUDENT ACADEMIC INTERVENTION PROGRAMME`;
        letterBody = `
            <p>Following the critical absenteeism rate recorded for the course <strong>${course}</strong>, your child/ward <strong>${name}</strong> (${id}) is strictly required to undergo the institutional academic intervention process.</p>
            <p>2.&nbsp;&nbsp;You are hereby respectfully requested to attend an urgent meeting with the Academic Counselling Unit and the respective course lecturer to discuss methods to support and rehabilitate the student's attendance track record:</p>
            <table style="width:100%; border:none; margin: 15px 0;">
                <tr><td style="width:150px; border:none; padding:4px 0;"><strong>Session Location</strong></td><td style="border:none; padding:4px 0;">: Academic Intervention & Counselling Room, KVDSMZ</td></tr>
                <tr><td style="border:none; padding:4px 0;"><strong>Required Actions</strong></td><td style="border:none; padding:4px 0;">: Please bring along any official supporting documents (MC / Excuse Letters)</td></tr>
                <tr><td style="border:none; padding:4px 0;"><strong>Date / Time</strong></td><td style="border:none; padding:4px 0;">: Please contact the Head of Programme to schedule an appointment</td></tr>
            </table>
            <p>Your prompt cooperation is highly valued to ensure the student's academic continuity at the Vocational College.</p>
        `;
    }

    const printWindow = window.open('', '_blank', 'width=850,height=1100');
    printWindow.document.write(`
        <html>
        <head>
            <title>Print_Letter_${id}</title>
            <style>
                @page { size: A4; margin: 2.5cm; }
                body { font-family: 'Arial', sans-serif; font-size: 11pt; line-height: 1.6; color: #000; padding: 20px; }
                .letter-head { text-align: center; font-weight: bold; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 25px; }
                .meta-table { width: 100%; margin-bottom: 20px; }
                .meta-table td { vertical-align: top; }
                .title { font-weight: bold; text-transform: uppercase; margin-bottom: 20px; border-bottom: 1px solid #000; padding-bottom: 2px; }
                .footer { margin-top: 50px; }
            </style>
        </head>
        <body>
            <div class="letter-head">
                DATUK SERI MOHD ZIN VOCATIONAL COLLEGE<br>
                <span style="font-size:10pt; font-weight:normal;">JALAN GETAH, 78000 ALOR GAJAH, MELAKA</span>
            </div>
            <table class="meta-table">
                <tr>
                    <td><strong>To:</strong><br>Parent / Guardian of<br>Student: ${name} (${id})</td>
                    <td style="text-align: right;"><strong>Ref:</strong> KVDSMZ/INT/${id}<br><strong>Date:</strong> ${todayDate}</td>
                </tr>
            </table>
            <div class="title">${letterTitle}</div>
            <div>${letterBody}</div>
            <div class="footer">
                <p>Respectfully yours,</p><br><br>
                <strong>.....................................</strong><br>
                f.b. Director of Datuk Seri Mohd Zin Vocational College
            </div>
            <script>
                window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 500); };
            <\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
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