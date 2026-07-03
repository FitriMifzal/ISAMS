/* ============================================================
   CREATESTUDENTABSENTRECORD.JS — Page-specific logic
   User profile initialization handled by Sidebar.js
   ============================================================ */

let currentStudentIndex = null;
let currentStudent = {};
let currentLetterType = "";
let currentFileUrl = null;
let statusEditingIndex = null;
let editingRecordIndex = null;

/* ── PAGE INITIALIZATION ── */
document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = "../Create-Account/Create-Account.html";
        return;
    }

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('student_id');
    const recordIndex = urlParams.get('record_index');

    // Setup form if student ID provided
    if (studentId !== null) {
        setupForm(parseInt(studentId), recordIndex);
    } else {
        document.getElementById('bktsForm').style.display = 'none';
    }

    // Render table
    const role = localStorage.getItem('reg_role') || "Subject Teacher";
    renderTable(role);
});

/* ────────────────────────────────────────────────────────
   TABLE FUNCTIONS
────────────────────────────────────────────────────────── */

function handleRowClick(row) {
    const allRows = document.querySelectorAll('#studentTableBody tr');
    allRows.forEach(r => {
        if (r !== row) r.classList.remove('selected');
    });
    row.classList.toggle('selected');
    
    const isAnySelected = document.querySelector('tr.selected');
    document.getElementById('action-header').style.display = isAnySelected ? 'table-cell' : 'none';
}

function renderTable(role) {
    const records = JSON.parse(localStorage.getItem("absent_records")) || [];
    const tbody = document.getElementById('studentTableBody');
    tbody.innerHTML = "";

    records.forEach((r, index) => {
        // Determine status class
        let statusClass = "status-active";
        if (r.status === "Warning Sent") statusClass = "status-warning";
        if (r.status === "Intervention Required") statusClass = "status-intervention";
        if (r.status === "Under Monitoring") statusClass = "status-monitoring";

        // Build action buttons based on role
        let actionButtons = `<button class="btn btn-update" onclick="event.stopPropagation(); window.location.href='CreateStudentAbsentRecord.html?student_id=${r.student_index}&record_index=${index}'">Update</button>`;

        if (role === "Subject Teacher") {
            actionButtons += `<button class="btn btn-letter" onclick="event.stopPropagation(); openLetterModal('${r.name}')">Upload Letter</button>`;
        } else {
            actionButtons += `
                <button class="btn btn-bkts" onclick="event.stopPropagation(); downloadBKTS(${index})">BKTS</button>
                <button class="btn btn-warning" onclick="event.stopPropagation(); openFormalLetter('warning', '${r.name}', '${r.id}', '${r.percent}')">Warning</button>
                <button class="btn btn-intervention" onclick="event.stopPropagation(); openFormalLetter('intervention', '${r.name}', '${r.id}', '${r.percent}')">Intervention</button>
                <button class="btn btn-status" onclick="event.stopPropagation(); openStatusModal(${index})">Update Status</button>`;
        }

        // Create table row
        const tr = document.createElement('tr');
        tr.onclick = function () { handleRowClick(this); };
        tr.innerHTML = `
            <td>${r.name}</td>
            <td>${r.id}</td>
            <td style="font-weight: bold; color: var(--kv-primary);">${r.courseCode}</td>
            <td class="student-percent">${r.percent}</td>
            <td><span class="status-badge ${statusClass}">${r.status || 'Normal'}</span></td>
            <td class="action-cell">${actionButtons}</td>
        `;
        tbody.appendChild(tr);
    });
}

function filterTable() {
    const searchInput = document.getElementById("studentSearch").value.toUpperCase();
    const rows = document.getElementById("studentTableBody").getElementsByTagName("tr");
    
    for (let row of rows) {
        row.style.display = row.innerText.toUpperCase().includes(searchInput) ? "" : "none";
    }
}

/* ────────────────────────────────────────────────────────
   FORM FUNCTIONS
────────────────────────────────────────────────────────── */

function setupForm(index, rIndex) {
    const students = JSON.parse(localStorage.getItem("students")) || [];
    const absentRecords = JSON.parse(localStorage.getItem("absent_records")) || [];

    if (students[index]) {
        currentStudentIndex = index;
        const student = students[index];
        
        document.getElementById('bktsForm').style.display = 'block';
        document.getElementById('target-student-info').innerText = "Student: " + student.name + " (" + (student.ic || student.id) + ")";

        // Load existing record if editing
        if (rIndex !== null && absentRecords[rIndex]) {
            const record = absentRecords[rIndex];
            document.getElementById('course-code').value = record.courseCode;
            document.getElementById('absent-hrs').value = record.absentHrs;
            document.getElementById('total-hrs').value = record.totalHrs;
            document.getElementById('percent-val').innerText = record.percent;
            document.getElementById('bkts-title').innerText = "Update Student Absent Record";
            editingRecordIndex = rIndex;
        }
    }
}

function calculatePercentage() {
    const absentHours = parseFloat(document.getElementById('absent-hrs').value) || 0;
    const totalHours = parseFloat(document.getElementById('total-hrs').value) || 0;
    const percentage = totalHours > 0 ? (absentHours / totalHours) * 100 : 0;
    
    document.getElementById('percent-val').innerText = percentage.toFixed(2) + "%";
}

function saveBKTS() {
    const courseCode = document.getElementById('course-code').value.trim().toUpperCase();
    const absentHours = parseFloat(document.getElementById('absent-hrs').value) || 0;
    const totalHours = parseFloat(document.getElementById('total-hrs').value) || 0;

    // Validation
    if (!courseCode || absentHours <= 0 || totalHours <= 0) {
        document.getElementById('error-msg').innerText = "Please complete all information correctly.";
        document.getElementById('errorModal').classList.add('show');
        return;
    }

    const students = JSON.parse(localStorage.getItem("students")) || [];
    let absentRecords = JSON.parse(localStorage.getItem("absent_records")) || [];

    if (currentStudentIndex !== null && students[currentStudentIndex]) {
        const studentBase = students[currentStudentIndex];
        const studentID = studentBase.ic || studentBase.id;
        const percentValue = (absentHours / totalHours) * 100;
        let finalStatus = percentValue > 10 ? "Under Monitoring" : "Normal";

        const recordData = {
            student_index: currentStudentIndex,
            name: studentBase.name,
            id: studentID,
            courseCode: courseCode,
            absentHrs: absentHours,
            totalHrs: totalHours,
            percent: document.getElementById('percent-val').innerText,
            status: finalStatus
        };

        // Save or update record
        if (editingRecordIndex !== null && editingRecordIndex !== undefined) {
            absentRecords[editingRecordIndex] = recordData;
            editingRecordIndex = null;
        } else {
            absentRecords.push(recordData);
        }

        localStorage.setItem("absent_records", JSON.stringify(absentRecords));
        
        document.getElementById('success-msg').innerText = "Record saved successfully!";
        document.getElementById('successModal').classList.add('show');
        
        setTimeout(() => {
            window.location.href = "../Student-List/StudentList.html";
        }, 1200);
    }
}

/* ────────────────────────────────────────────────────────
   STATUS UPDATE MODAL
────────────────────────────────────────────────────────── */

function openStatusModal(index) {
    const records = JSON.parse(localStorage.getItem("absent_records")) || [];
    const record = records[index];
    
    statusEditingIndex = index;
    document.getElementById('status-student-info').innerText = record.name + " (" + record.id + ")";
    document.getElementById('status-percent-display').innerText = record.percent;
    document.getElementById('new-status-select').value = record.status || "Normal";
    document.getElementById('statusModal').classList.add('show');
}

function saveStatusUpdate() {
    let records = JSON.parse(localStorage.getItem("absent_records")) || [];
    
    if (statusEditingIndex !== null && records[statusEditingIndex]) {
        records[statusEditingIndex].status = document.getElementById('new-status-select').value;
        localStorage.setItem("absent_records", JSON.stringify(records));
        
        closeModal('statusModal');
        document.getElementById('success-msg').innerText = "Status updated successfully!";
        document.getElementById('successModal').classList.add('show');
        
        const role = localStorage.getItem('reg_role') || "Subject Teacher";
        renderTable(role);
    }
}

/* ────────────────────────────────────────────────────────
   FORMAL LETTER MODAL
────────────────────────────────────────────────────────── */

function openFormalLetter(type, name, id, percent) {
    const numPercent = parseFloat(percent);
    
    if (numPercent <= 10) {
        document.getElementById('error-msg').innerText = "Absence Percentage must exceed 10% for letters.";
        document.getElementById('errorModal').classList.add('show');
        return;
    }

    currentStudent = { name, id, percent };
    currentLetterType = type;

    const today = new Date();
    const dateString = today.getDate() + " " + today.toLocaleString('default', { month: 'long' }).toUpperCase() + " " + today.getFullYear();
    const refNo = "Ruj. Kami : KVDMZ/HEP/700-3/2 JLD 2( )";

    let title = (type === 'warning') ? "AMARAN PERTAMA" : "INTERVENSI KAUNSELING";
    
    let content = `KOLEJ VOKASIONAL DATO SERI MD ZIN\nJALAN GANTUNG, 78000 ALOR GAJAH\nMELAKA\nTEL: 06-5561253  FAX: 06-5561021\n`;
    content += `${"─".repeat(90)}\n`;
    content += `${refNo}\nTarikh : ${dateString}\n\n`;
    content += `Kepada:\nIBU BAPA / PENJAGA\n(Pelajar: ${name})\nID: ${id}\n\nTuan/Puan,\n\n`;
    content += `PEMBERITAHUAN KETIDAKHADIRAN KE KOLEJ : ${title}\n\n`;

    if (type === 'warning') {
        content += `Dimaklumkan bahawa anak/jagaan tuan ${name} dari program yang berkaitan, tidak hadir ke kolej sehingga mencapai peratus ketidakhadiran sebanyak ${percent}.\n\n`;
        content += `2.  Sila bawa surat tunjuk sebab dan datang sendiri ke kolej dalam tempoh 7 hari daripada tarikh surat ini untuk memberi penjelasan mengenai ketidakhadiran anak/jagaan tuan.\n\n`;
    } else {
        content += `Dimaklumkan bahawa rekod kehadiran anak/jagaan tuan ${name} berada pada tahap kritikal iaitu ${percent}. Pihak kolej memohon kerjasama tuan untuk hadir bersama anak jagaan bagi sesi intervensi.\n\n`;
        content += `2.  Sila hubungi Unit Psikologi dan Kerjaya dalam tempoh 3 hari bekerja untuk menetapkan slot pertemuan.\n\n`;
    }

    content += `Sekian, terima kasih.\n\n"BERKHIDMAT UNTUK NEGARA"\n\nSaya yang menurut perintah,\n\n\n..........................................\n(PENGARAH)\nKolej Vokasional Dato Seri Md Zin\n\ns.k.  Fail Ibu bapa\n      Fail Kolej\n      Koordinator Program`;

    document.getElementById('formal-letter-body').innerText = content;
    document.getElementById('letterEditorModal').classList.add('show');
}

function downloadFormalPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const letterContent = document.getElementById('formal-letter-body').innerText;
    
    doc.text(letterContent, 10, 10);
    doc.save(`Letter_${currentStudent.id}.pdf`);
}

/* ────────────────────────────────────────────────────────
   UPLOAD LETTER MODAL
────────────────────────────────────────────────────────── */

function openLetterModal(name) {
    document.getElementById('letter-student-name').innerText = name;
    document.getElementById('letterModal').classList.add('show');
    
    // Reset form
    document.getElementById('absent-date').value = "";
    document.getElementById('absent-file').value = "";
    document.getElementById('view-file-btn').style.display = "none";
}

function handleFilePreview() {
    const fileInput = document.getElementById('absent-file');
    if (fileInput.files[0]) {
        currentFileUrl = URL.createObjectURL(fileInput.files[0]);
        document.getElementById('view-file-btn').style.display = 'block';
    }
}

function viewUploadedFile() {
    if (currentFileUrl) {
        window.open(currentFileUrl, '_blank');
    }
}

function checkDateValidity() {
    const dateInput = document.getElementById('absent-date');
    const selectedDate = new Date(dateInput.value);
    const today = new Date();
    const diffDays = Math.floor((today - selectedDate) / (1000 * 60 * 60 * 24));

    if (diffDays > 7 || diffDays < 0) {
        document.getElementById('error-msg').innerText = "Error: Invalid date or exceeds 7 days.";
        document.getElementById('errorModal').classList.add('show');
        dateInput.value = "";
    }
}

function processUpload() {
    const dateInput = document.getElementById('absent-date').value;
    const fileInput = document.getElementById('absent-file').value;

    if (!dateInput || !fileInput) {
        document.getElementById('error-msg').innerText = "Please select both date and file.";
        document.getElementById('errorModal').classList.add('show');
        return;
    }

    closeModal('letterModal');
    document.getElementById('success-msg').innerText = "Letter uploaded successfully!";
    document.getElementById('successModal').classList.add('show');
}

/* ────────────────────────────────────────────────────────
   PDF - BKTS DOWNLOAD
────────────────────────────────────────────────────────── */

function downloadBKTS(index) {
    const records = JSON.parse(localStorage.getItem("absent_records")) || [];
    const record = records[index];
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("BORANG PELAJAR TIDAK HADIR KE KULIAH TANPA SEBAB", 105, 15, { align: "center" });
    doc.text("LAMPIRAN 1", 200, 15, { align: "right" });
    doc.text("BKT-07/01", 200, 20, { align: "right" });

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("NAMA PELAJAR", 20, 35);
    doc.text(`: ${record.name.toUpperCase()}`, 70, 35);
    doc.text("NO. KAD PENGENALAN", 20, 42);
    doc.text(`: ${record.id}`, 70, 42);
    doc.text("PROGRAM", 20, 49);
    doc.text(": DIPLOMA TEKNOLOGI MAKLUMAT", 70, 49);
    doc.text("KOD/KURSUS", 20, 56);
    doc.text(`: ${record.courseCode}`, 70, 56);

    doc.autoTable({
        startY: 65,
        head: [[
            "BIL", "TARIKH", "JUMLAH JAM KULIAH\nTIDAK HADIR",
            "JUMLAH JAM\nPERTEMUAN\n(14 MINGGU)", "PERATUS\nKETIDAK\nHADIRAN", "CATATAN"
        ]],
        body: [
            ["1", "-", record.absentHrs, record.totalHrs, record.percent, "Tanpa Sebab"],
            [
                { content: "JUMLAH", colSpan: 2, styles: { halign: 'center', fontStyle: 'bold' } },
                record.absentHrs, record.totalHrs, record.percent, ""
            ]
        ],
        theme: 'grid',
        headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontSize: 8, halign: 'center' },
        styles: { fontSize: 9, halign: 'center' }
    });

    const finalY = doc.lastAutoTable.finalY + 30;
    doc.text("(                                                  )", 20, finalY);
    doc.text("Disediakan oleh", 20, finalY + 7);
    doc.text("Pensyarah", 20, finalY + 12);
    doc.text("Tarikh:", 20, finalY + 22);
    
    doc.text("(                                                  )", 120, finalY);
    doc.text("Disahkan oleh", 120, finalY + 7);
    doc.text("Ketua Jabatan / Ketua Program / Ketua Unit", 120, finalY + 12, { maxWidth: 70 });
    doc.text("Tarikh:", 120, finalY + 22);

    doc.setFontSize(8);
    doc.text("SK Fail Intervensi", 20, 280);
    doc.text("Unit Psikologi dan Kerjaya", 20, 285);

    doc.save(`BKT_07_01_${record.name}.pdf`);
}

/* ────────────────────────────────────────────────────────
   UTILITY FUNCTIONS
────────────────────────────────────────────────────────── */

function closeModal(id) {
    document.getElementById(id).classList.remove('show');
}

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