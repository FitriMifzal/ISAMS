/* ============================================================
   UPDATESTUDENT.JS — Page-specific logic
   User profile initialization handled by Sidebar.js
   ============================================================ */

let currentStudentType = "";

document.addEventListener('DOMContentLoaded', function () {
    loadClassDropdown();
    loadStudentData();

    // toggle SVM/DVM fields whenever the teacher changes the dropdown
    document.getElementById("student_type").addEventListener("change", function () {
        toggleTypeFields(this.value);
    });
});

function loadClassDropdown() {
    const clsSelect = document.getElementById("cls");

    fetch("../ClassroomController?action=list")
        .then(response => response.json())
        .then(classes => {
            clsSelect.innerHTML = `<option value="">-- Select Class --</option>`;

            classes.forEach(c => {
                const option = document.createElement("option");
                option.value = c.classId;
                option.textContent = c.classCode + " - " + c.className;
                clsSelect.appendChild(option);
            });
        });
}

// show/hide the SVM or DVM specific fields based on the current type
function toggleTypeFields(type) {
    document.getElementById("svmFields").style.display = (type === "SVM") ? "block" : "none";
    document.getElementById("dvmFields").style.display = (type === "DVM") ? "block" : "none";
}

function loadStudentData() {
    const id = new URLSearchParams(window.location.search).get("id");

    fetch("../StudentController?action=get&id=" + id)
        .then(response => response.json())
        .then(student => {
            document.getElementById("stuId").value = student.stuId;
            document.getElementById("name").value = student.stuName || "";
            document.getElementById("ic").value = student.stuIC || "";
            document.getElementById("address").value = student.stuAdd || "";
            document.getElementById("No").value = student.stuPhoneNum || "";
            document.getElementById("student_type").value = student.studentType || "";

            currentStudentType = student.studentType;

            setTimeout(() => {
                document.getElementById("cls").value = student.classId;
            }, 300);

            toggleTypeFields(currentStudentType);

            if (currentStudentType === "SVM") {
                document.getElementById("cgpaA").value =
                    (student.cgpaA !== null && student.cgpaA !== undefined) ? student.cgpaA : "";
                document.getElementById("cgpaV").value =
                    (student.cgpaV !== null && student.cgpaV !== undefined) ? student.cgpaV : "";
            } else if (currentStudentType === "DVM") {
                document.getElementById("repeatPaper").value =
                    (student.repeatPaper !== null && student.repeatPaper !== undefined) ? student.repeatPaper : "";
            }
        });
}

function saveUpdate() {
    const stuId = document.getElementById("stuId").value;
    const name = document.getElementById("name").value.trim();
    const ic = document.getElementById("ic").value.trim();
    const cls = document.getElementById("cls").value;
    const studentType = document.getElementById("student_type").value;
    const address = document.getElementById("address").value.trim();
    const contactNo = document.getElementById("No").value.trim();

    if (!name || !ic || !cls || !studentType || !address || !contactNo) {
        alert("Please fill in all student details.");
        return;
    }

    const formData = new URLSearchParams();
    formData.append("stuId", stuId);
    formData.append("stuName", name);
    formData.append("stuIC", ic);
    formData.append("classId", cls);
    formData.append("studentType", studentType);
    formData.append("stuAdd", address);
    formData.append("stuPhoneNum", contactNo);

    if (studentType === "SVM") {
        const cgpaA = document.getElementById("cgpaA").value.trim();
        const cgpaV = document.getElementById("cgpaV").value.trim();

        if (!cgpaA || !cgpaV) {
            alert("Please fill in both CGPA fields for SVM students.");
            return;
        }

        formData.append("cgpaA", cgpaA);
        formData.append("cgpaV", cgpaV);
    }

    if (studentType === "DVM") {
        const repeatPaper = document.getElementById("repeatPaper").value.trim();

        if (!repeatPaper) {
            alert("Please fill in Repeat Paper for DVM students.");
            return;
        }

        formData.append("repeatPaper", repeatPaper);
    }

    fetch("../StudentController?action=update", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData.toString()
    })
    .then(response => response.text())
    .then(result => {
        if (result.trim() === "success") {
            alert("Student updated successfully.");
            window.location.href = "../Student-List/StudentList.html";
        } else {
            alert("Update failed: " + result);
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Failed to connect to server. Please try again.");
    });
}