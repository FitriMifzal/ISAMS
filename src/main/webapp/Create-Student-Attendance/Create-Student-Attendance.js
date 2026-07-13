let attendanceList = [];

function loadAttendance() {
    const date = document.getElementById("attendanceDate").value;
    const subId = document.getElementById("subjectSelect").value;
    const classId = document.getElementById("classSelect").value;

    if (date === "" || subId === "" || classId === "") {
        showNotification("Please select date, subject and class", "warning");
        return;
    }

    fetch("../AttendanceController?date=" + encodeURIComponent(date) +
        "&subId=" + encodeURIComponent(subId) +
        "&classId=" + encodeURIComponent(classId))
        .then(response => response.json())
        .then(data => {
            attendanceList = data;
            buildAttendanceTable();
            showNotification("Attendance loaded successfully", "info");
        })
        .catch(error => {
            console.error(error);
            showNotification("Failed to load attendance", "error");
        });
}

function buildAttendanceTable() {
    const head = document.getElementById("gridHead");
    const body = document.getElementById("gridBody");

    head.innerHTML = `
        <tr>
            <th class="sticky-col" style="min-width:260px;">STUDENT NAME</th>
            <th style="min-width:130px;">NO IC / STUDENT ID</th>
            <th style="min-width:120px;">STATUS</th>
        </tr>
    `;

    body.innerHTML = "";

    if (attendanceList.length === 0) {
        body.innerHTML = `
            <tr>
                <td colspan="3" style="text-align:center; padding:20px;">
                    No enrolled students found.
                </td>
            </tr>
        `;
        return;
    }

    attendanceList.forEach(student => {
        const tr = document.createElement("tr");

        tr.dataset.name = student.studName.toLowerCase();
        tr.dataset.id = student.studIC;

        tr.innerHTML = `
            <td class="sticky-col">${student.studName}</td>
            <td>${student.studIC}</td>
            <td>
                <label class="absent-box">
                    <input type="checkbox"
                        ${student.absent ? "checked" : ""}
                        onchange="saveAttendance(this, ${student.classSessId}, ${student.studId})">
                    Absent
                </label>
            </td>
        `;

        body.appendChild(tr);
    });
}

function saveAttendance(checkbox, classSessId, studId) {
    const absent = checkbox.checked;
    const date = document.getElementById("attendanceDate").value;
    const tId = localStorage.getItem("active_tId");

    if (!tId) {
        showNotification("Teacher ID not found. Please login again.", "error");
        return;
    }
    const classId = document.getElementById("classSelect").value;
    const hours = document.getElementById("hoursInput").value;

    if (hours === "" || Number(hours) <= 0) {
        showNotification("Please enter valid hours before marking attendance.", "warning");
        checkbox.checked = !absent;
        return;
    }

    const bodyData =
        "date=" + encodeURIComponent(date) +
        "&tId=" + encodeURIComponent(tId) +
        "&classSessId=" + encodeURIComponent(classSessId) +
        "&classId=" + encodeURIComponent(classId) +
        "&studId=" + encodeURIComponent(studId) +
        "&absent=" + encodeURIComponent(absent) +
        "&hours=" + encodeURIComponent(hours);

    console.log("POST Attendance:", bodyData);

    fetch("../AttendanceController", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: bodyData
    })
    .then(response => {
        console.log("POST status:", response.status);
        return response.text();
    })
    .then(result => {
        console.log("POST result:", result);

        if (result.trim() === "success") {
            // --- Enhanced notification based on action ---
            if (absent) {
                showNotification(
                    "Student marked as ABSENT. Record saved to database for percentage calculation.",
                    "warning"
                );
            } else {
                showNotification(
                    "Student marked as PRESENT. Record saved to database for percentage calculation.",
                    "success"
                );
            }
        } else {
            showNotification("Failed to save: " + result, "error");
            checkbox.checked = !absent;
        }
    })
    .catch(error => {
        console.error(error);
        showNotification("Error updating attendance. Please try again.", "error");
        checkbox.checked = !absent;
    });
}

function resetGrid() {
    document.querySelectorAll("#gridBody input[type='checkbox']").forEach(cb => {
        if (cb.checked) {
            cb.checked = false;
            cb.dispatchEvent(new Event("change"));
        }
    });

    showNotification("All students reset to PRESENT status. Database updated.", "info");
}

function loadSubjects() {
    fetch("../SubjectController?action=list")
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById("subjectSelect");
            select.innerHTML = `<option value="">-- Select Subject --</option>`;

            data.forEach(subject => {
                const option = document.createElement("option");
                option.value = subject.subId;
                option.textContent = subject.subName;
                select.appendChild(option);
            });
        })
        .catch(error => console.error("Error loading subjects:", error));
}

function loadClasses() {
    fetch("../ClassroomController?action=list")
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById("classSelect");
            select.innerHTML = `<option value="">-- Select Class --</option>`;

            data.forEach(classroom => {
                const option = document.createElement("option");
                option.value = classroom.classId;
                option.textContent = classroom.className;
                select.appendChild(option);
            });
        })
        .catch(error => console.error("Error loading classes:", error));
}

/* ── NEW ENHANCED NOTIFICATION FUNCTION ── */
function showNotification(message, type = "info") {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");
    const toastIcon = document.getElementById("toastIcon");

    // Set message
    toastMessage.textContent = message;

    // Clear previous classes
    toast.className = "toast";

    // Add appropriate class based on type
    if (type === "success") {
        toast.classList.add("success");
        toastIcon.textContent = "✓";
    } else if (type === "warning") {
        toast.classList.add("warning");
        toastIcon.textContent = "⚠";
    } else if (type === "error") {
        toast.classList.add("error");
        toastIcon.textContent = "✗";
    } else {
        toast.classList.add("info");
        toastIcon.textContent = "●";
    }

    // Show toast
    toast.classList.add("show");

    // Auto-hide after 4 seconds (longer for clarity)
    setTimeout(() => {
        toast.classList.remove("show");
    }, 4000);
}

document.addEventListener("DOMContentLoaded", function () {
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("attendanceDate").value = today;

    loadSubjects();
    loadClasses();
});