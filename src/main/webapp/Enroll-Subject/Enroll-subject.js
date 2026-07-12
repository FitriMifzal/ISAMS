let allStudents = [];
let availableStudents = [];
let enrolledStudents = [];

window.onload = function () {
    loadSubjects();
    loadStudents();
};

// ============================================================
// LOAD & FILTER SUBJECTS BASED ON LOGGED-IN TEACHER
// ============================================================
function loadSubjects() {
    // Mengambil ID Teacher yang sedang log masuk dari localStorage
    const myTId = parseInt(localStorage.getItem('active_tId'));

    fetch("../SubjectController?action=list")
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById("subject-select");
            select.innerHTML = `<option value="">-- Select Subject --</option>`;

            data.forEach(subject => {
                // KUNCI: Hanya paparkan subjek jika tId subjek sepadan dengan tId teacher yang login
                if (subject.tId !== null && parseInt(subject.tId) === myTId) {
                    const option = document.createElement("option");
                    option.value = subject.subId;
                    option.textContent = subject.subName;
                    select.appendChild(option);
                }
            });
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
        !enrolledStudents.some(e => e.stuId === student.stuId)
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

function displayEnrolledStudents() {
    const list = document.getElementById("enrolled-list");
    list.innerHTML = "";

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

function removeStudent(stuId) {
    enrolledStudents = enrolledStudents.filter(s => s.stuId !== stuId);
    onClassChange();
    displayEnrolledStudents();
}

function saveEnrollment() {
    const subjectId = document.getElementById("subject-select").value;
    const classId = document.getElementById("class-select").value;

    if (subjectId === "" || classId === "") {
        alert("Please select subject and class.");
        return;
    }

    if (enrolledStudents.length === 0) {
        alert("Please enroll at least one student.");
        return;
    }

    let savedCount = 0;

    enrolledStudents.forEach(student => {
        fetch("../RegisterController", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body:
                "subId=" + encodeURIComponent(subjectId) +
                "&stuId=" + encodeURIComponent(student.stuId) +
                "&classId=" + encodeURIComponent(classId)
        })
        .then(response => response.text())
        .then(result => {
            if (result.trim() === "success") {
                savedCount++;
            }

            if (savedCount === enrolledStudents.length) {
                alert("Enrollment saved successfully.");
            }
        })
        .catch(error => {
            console.log(error);
            alert("Failed to save enrollment.");
        });
    });
}