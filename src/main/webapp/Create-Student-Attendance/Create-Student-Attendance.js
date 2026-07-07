let attendanceList = [];

function loadAttendance() {
    const date = document.getElementById("attendanceDate").value;
    const subId = document.getElementById("subjectSelect").value;
    const classId = document.getElementById("classSelect").value;

    if (date === "" || subId === "" || classId === "") {
        showToast("Please select date, subject and class");
        return;
    }

    fetch("../AttendanceController?date=" + encodeURIComponent(date) +
        "&subId=" + encodeURIComponent(subId) +
        "&classId=" + encodeURIComponent(classId))
        .then(response => response.json())
        .then(data => {
            attendanceList = data;
            buildAttendanceTable();
            showToast("Attendance loaded");
        })
        .catch(error => {
            console.error(error);
            showToast("Failed to load attendance");
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
	    showToast("Teacher ID not found. Please login again.");
	    return;
	}
    const classId = document.getElementById("classSelect").value;
	const hours = document.getElementById("hoursInput").value;

	if (hours === "" || Number(hours) <= 0) {
	    showToast("Please enter hours.");
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
            showToast(absent ? "Student marked as absent" : "Student marked as present");
			} else {
			    showToast("Failed: " + result);
			    checkbox.checked = !absent;
			}
    })
    .catch(error => {
        console.error(error);
        showToast("Error updating attendance");
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

    showToast("All students reset to present");
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

function showToast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");

    setTimeout(() => {
        t.classList.remove("show");
    }, 2500);
}

document.addEventListener("DOMContentLoaded", function () {
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("attendanceDate").value = today;

    loadSubjects();
    loadClasses();
});