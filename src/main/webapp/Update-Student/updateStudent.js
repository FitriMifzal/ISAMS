/* ============================================================
   UPDATESTUDENT.JS — Page-specific logic
   User profile initialization handled by Sidebar.js
   ============================================================ */

let currentStudentType = "";

document.addEventListener('DOMContentLoaded', function () {
    loadClassDropdown();
    loadStudentData();

    // ✅ FIX: Guna ID yang betul "student_type"
    const studentTypeSelect = document.getElementById("student_type");
    if (studentTypeSelect) {
        studentTypeSelect.addEventListener('change', function() {
            toggleFields(this.value);
        });
    }
});

// ✅ FIX: Function untuk toggle SVM/DVM fields
function toggleFields(type) {
    const svmFields = document.getElementById("svmFields");
    const dvmFields = document.getElementById("dvmFields");

    if (type === "SVM") {
        svmFields.style.display = "block";
        dvmFields.style.display = "none";
    } else if (type === "DVM") {
        svmFields.style.display = "none";
        dvmFields.style.display = "block";
    } else {
        svmFields.style.display = "none";
        dvmFields.style.display = "none";
    }
}

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
            
            // ✅ FIX: Guna ID "student_type" (sama dengan HTML)
            document.getElementById("student_type").value = student.studentType || "";

            currentStudentType = student.studentType;

            setTimeout(() => {
                document.getElementById("cls").value = student.classId;
            }, 300);

            toggleFields(currentStudentType);

            if (currentStudentType === "SVM") {
                document.getElementById("cgpaA").value =
                    student.cgpaA !== null && student.cgpaA !== undefined ? student.cgpaA : "";

                document.getElementById("cgpaV").value =
                    student.cgpaV !== null && student.cgpaV !== undefined ? student.cgpaV : "";
            } else if (currentStudentType === "DVM") {
                document.getElementById("repeatPaper").value =
                    student.repeatPaper !== null && student.repeatPaper !== undefined ? student.repeatPaper : "";
            }
        });
}

function saveUpdate() {
    const stuId = document.getElementById("stuId").value;
    const name = document.getElementById("name").value.trim();
    const ic = document.getElementById("ic").value.trim();
    const cls = document.getElementById("cls").value;
    const address = document.getElementById("address").value.trim();
    const contactNo = document.getElementById("No").value.trim();

    if (!name || !ic || !cls || !address || !contactNo) {
        alert("Please fill in all student details.");
        return;
    }

    const formData = new URLSearchParams();
    formData.append("stuId", stuId);
    formData.append("stuName", name);
    formData.append("stuIC", ic);
    formData.append("classId", cls);
    formData.append("studentType", currentStudentType);
    formData.append("stuAdd", address);
    formData.append("stuPhoneNum", contactNo);

    if (currentStudentType === "SVM") {
        formData.append("cgpaA", document.getElementById("cgpaA").value);
        formData.append("cgpaV", document.getElementById("cgpaV").value);
    }

    if (currentStudentType === "DVM") {
        formData.append("repeatPaper", document.getElementById("repeatPaper").value);
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
    });
}

// ============================================================
// PROFILE TOGGLE — JANGAN UBAH
// ============================================================
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

function logoutUser() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userData');
        window.location.href = "../Login/Login.html";
    }
}