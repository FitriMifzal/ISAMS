let allStudents = [];
let availableStudents = [];
let enrolledStudents = [];
let savedEnrollments = [];   // rekod enrollment yang sudah tersimpan dalam DB (subject teacher ini sahaja)
let mySubjectIds = [];       // ✅ BARU: subId yang diajar oleh teacher yang logged-in

window.onload = function () {
    loadStudents();
    // ✅ DIUBAH: tunggu subject teacher ini dimuat dulu, baru load summary
    loadSubjects().then(() => loadEnrollmentSummary());
};

// ============================================================
// MESSAGE MODALS (Success / Error)
// ============================================================
function showSuccess(message) {
    document.getElementById('successMsg').innerText = message;
    new bootstrap.Modal(document.getElementById('successModal')).show();
}

function showError(message) {
    document.getElementById('errorMsg').innerText = message;
    new bootstrap.Modal(document.getElementById('errorModal')).show();
}

// ============================================================
// LOAD & FILTER SUBJECTS BASED ON LOGGED-IN TEACHER
// ✅ DIUBAH: tambah `return` + isi mySubjectIds
// ============================================================
function loadSubjects() {
    const myTId = parseInt(localStorage.getItem('active_tId'));

    return fetch("../SubjectController?action=assignments")
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById("subject-select");
            select.innerHTML = `<option value="">-- Select Subject --</option>`;

            // subjek unik yang cikgu ni ajar
            const seen = [];
            data.forEach(a => {
                if (a.tId === myTId && !seen.includes(a.subId)) {
                    seen.push(a.subId);
                    const option = document.createElement("option");
                    option.value = a.subId;
                    option.textContent = a.subName;
                    select.appendChild(option);
                }
            });

            mySubjectIds = seen;   // ✅ BARU
        });
}

function loadStudents() {
    fetch("../StudentController?action=list")
        .then(response => response.json())
        .then(data => {
            allStudents = data;
            loadClassDropdown();
            document.getElementById("student-pool").innerHTML =
                `<p style="color:#777;">Please select subject and class.</p>`;
        });
}

function loadClassDropdown() {
    const classSelect = document.getElementById("class-select");
    classSelect.innerHTML = `<option value="">-- Select Class --</option>`;

    const uniqueClasses = [];

    allStudents.forEach(student => {
        const exists = uniqueClasses.some(c => c.classId === student.classId);

        if (!exists) {
            uniqueClasses.push({
                classId: student.classId,
                className: student.className
            });
        }
    });

    uniqueClasses.forEach(cls => {
        const option = document.createElement("option");
        option.value = cls.classId;
        option.textContent = cls.className;
        classSelect.appendChild(option);
    });
}

// ============================================================
// ✅ DIUBAH: LOAD ENROLLMENT SUMMARY
//  - Hanya subject yang diajar oleh teacher yang logged-in
//  - Dikumpulkan (group) mengikut SUBJECT, bukan table memanjang
//  - Setiap kad boleh diklik untuk lihat student yang telah enroll
// ============================================================
function loadEnrollmentSummary() {
    const summaryGrid = document.getElementById("summary-grid");

    return fetch("../RegisterController?action=list")
        .then(response => response.json())
        .then(data => {
            // ✅ FILTER: buang enrollment subject milik teacher lain
            savedEnrollments = (data || []).filter(e =>
                mySubjectIds.some(id => id == e.subId)
            );

            if (savedEnrollments.length === 0) {
                summaryGrid.innerHTML =
                    `<div style="color:var(--text-secondary);font-size:13px;">No saved data available.</div>`;
                return;
            }

            // ✅ GROUP BY SUBJECT
            const groups = {};
            savedEnrollments.forEach(e => {
                if (!groups[e.subId]) {
                    groups[e.subId] = { subId: e.subId, subName: e.subName, count: 0 };
                }
                groups[e.subId].count++;
            });

            let html = '';

            Object.values(groups).forEach(g => {
                html += `
                    <div class="summary-item" onclick="selectSubjectFromSummary('${g.subId}')">
                        <div class="subject-name">${g.subName}</div>
                        <div class="student-count">${g.count} student(s) enrolled</div>
                    </div>`;
            });

            summaryGrid.innerHTML = html;
        })
        .catch(error => {
            console.error("Error loading summary:", error);
            savedEnrollments = [];
            summaryGrid.innerHTML =
                `<div style="color:red;font-size:13px;">Failed to load summary data.</div>`;
        });
}

// ============================================================
// ✅ BARU: klik kad subject dalam summary
// ============================================================
function selectSubjectFromSummary(subId) {
    const subjectSelect = document.getElementById("subject-select");
    subjectSelect.value = subId;
    onSubjectChange();
}

// ============================================================
// EXISTING FUNCTIONS
// ============================================================
function onSubjectChange() {
    const subjectSelect = document.getElementById("subject-select");
    const label = document.getElementById("enrolled-subject-label");

    enrolledStudents = [];
    displayEnrolledStudents();

    if (subjectSelect.value === "") {
        label.textContent = "—";
    } else {
        label.textContent = subjectSelect.options[subjectSelect.selectedIndex].text;
    }

    onClassChange();
}

function onClassChange() {
    const subjectId = document.getElementById("subject-select").value;
    const classId = document.getElementById("class-select").value;

    if (subjectId === "" || classId === "") {
        document.getElementById("student-pool").innerHTML =
            `<p style="color:#777;">Please select subject and class.</p>`;
        return;
    }

    availableStudents = allStudents.filter(student =>
        student.classId == classId &&
        !enrolledStudents.some(e => e.stuId === student.stuId) &&
        !savedEnrollments.some(s => s.stuId == student.stuId && s.subId == subjectId)
    );

    displayAvailableStudents();
}

function displayAvailableStudents() {
    const pool = document.getElementById("student-pool");
    pool.innerHTML = "";

    if (availableStudents.length === 0) {
        pool.innerHTML = `<p style="color:#777;">No students found for this class.</p>`;
        return;
    }

    availableStudents.forEach(student => {
        const div = document.createElement("div");
        div.className = "student-row";

        div.innerHTML = `
            <div>
                <strong>${student.stuName}</strong><br>
                <small>IC: ${student.stuIC}</small><br>
                <small>Class: ${student.className}</small>
            </div>
            <button class="btn-enroll" onclick="enrollStudent(${student.stuId})">+ Enroll</button>
        `;

        pool.appendChild(div);
    });
}

function enrollStudent(stuId) {
    const student = availableStudents.find(s => s.stuId === stuId);
    if (!student) return;

    enrolledStudents.push(student);
    availableStudents = availableStudents.filter(s => s.stuId !== stuId);

    displayAvailableStudents();
    displayEnrolledStudents();
}

// ============================================================
// ✅ DIUBAH: papar student yang SUDAH TERSIMPAN untuk subject
// yang dipilih (read-only) + student baru yang sedang di-staging
// ============================================================
function displayEnrolledStudents() {
    const list = document.getElementById("enrolled-list");
    const subjectId = document.getElementById("subject-select").value;
    list.innerHTML = "";

    if (subjectId === "") {
        list.innerHTML = `<p style="color:#777;">Please select a subject.</p>`;
        return;
    }

    // --- 1) student yang sudah tersimpan dalam DB untuk subject ini ---
    const alreadySaved = savedEnrollments.filter(s => s.subId == subjectId);

    if (alreadySaved.length > 0) {
        const header = document.createElement("div");
        header.style.cssText =
            "font-size:11px;font-weight:700;color:#64748b;letter-spacing:.5px;margin:4px 0 8px;";
        header.textContent = "ALREADY ENROLLED (" + alreadySaved.length + ")";
        list.appendChild(header);

        alreadySaved.forEach(s => {
            const div = document.createElement("div");
            div.className = "enrolled-row";

            div.innerHTML = `
                <div>
                    <strong>${s.stuName}</strong><br>
                    <small>Class: ${s.className}</small>
                </div>
                <span style="font-size:11px;font-weight:600;color:#16a34a;
                             background:#dcfce7;padding:3px 8px;border-radius:10px;">Saved</span>
            `;

            list.appendChild(div);
        });
    }

    // --- 2) student baru yang sedang di-staging (belum save) ---
    if (enrolledStudents.length > 0) {
        const header = document.createElement("div");
        header.style.cssText =
            "font-size:11px;font-weight:700;color:#64748b;letter-spacing:.5px;margin:14px 0 8px;";
        header.textContent = "PENDING (" + enrolledStudents.length + ")";
        list.appendChild(header);

        enrolledStudents.forEach(student => {
            const div = document.createElement("div");
            div.className = "enrolled-row";

            div.innerHTML = `
                <div>
                    <strong>${student.stuName}</strong><br>
                    <small>IC: ${student.stuIC}</small><br>
                    <small>Class: ${student.className}</small>
                </div>
                <button class="btn-undo" onclick="removeStudent(${student.stuId})">Remove</button>
            `;

            list.appendChild(div);
        });
    }

    if (alreadySaved.length === 0 && enrolledStudents.length === 0) {
        list.innerHTML = `<p style="color:#777;">No students enrolled for this subject yet.</p>`;
    }
}

function removeStudent(stuId) {
    enrolledStudents = enrolledStudents.filter(s => s.stuId !== stuId);
    onClassChange();
    displayEnrolledStudents();
}

// ============================================================
// SAVE ENROLLMENT
// ============================================================
function saveEnrollment() {
    const subjectId = document.getElementById("subject-select").value;
    const classId = document.getElementById("class-select").value;

    if (subjectId === "" || classId === "") {
        showError("Please select subject and class.");
        return;
    }

    if (enrolledStudents.length === 0) {
        showError("Please enroll at least one student.");
        return;
    }

    const requests = enrolledStudents.map(student =>
        fetch("../RegisterController", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body:
                "subId=" + encodeURIComponent(subjectId) +
                "&stuId=" + encodeURIComponent(student.stuId) +
                "&classId=" + encodeURIComponent(classId)
        }).then(response => response.text())
    );

    Promise.all(requests)
        .then(results => {
            const allOk = results.every(r => r.trim() === "success");

            if (!allOk) {
                showError("Failed to save enrollment.");
                return;
            }

            showSuccess("Enrollment saved successfully!");

            enrolledStudents = [];

            loadEnrollmentSummary().then(() => {
                displayEnrolledStudents();
                onClassChange();
            });
        })
        .catch(error => {
            console.log(error);
            showError("Failed to save enrollment.");
        });
}