// CREATESTUDENT.JS
// User profile init handled by Sidebar.js

document.addEventListener('DOMContentLoaded', function () {
    // check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = "../Create-Account/CreateAccount.html";
        return;
    }

    loadClassDropdown();
});

// load classes into the Class dropdown
function loadClassDropdown() {
    const clsSelect = document.getElementById("cls");

    fetch("../ClassroomController?action=list")
        .then(response => response.json())
        .then(classes => {
            classes.forEach(c => {
                const option = document.createElement("option");
                option.value = c.classId;
                option.textContent = c.classCode + " - " + c.className;
                clsSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error("Error loading classes:", error);
            alert("Failed to load class list. Please refresh the page.");
        });
}

// save student - called by Save Profile button
function saveStudent() {
    const name = document.getElementById("name").value.trim();
    const ic = document.getElementById("ic").value.trim();
    const cls = document.getElementById("cls").value;
    const studentType = document.getElementById("studentType").value;
    const address = document.getElementById("address").value.trim();
    const contactNo = document.getElementById("No").value.trim();

    // check if all fields filled
    if (!name || !ic || !cls || !studentType || !address || !contactNo) {
        alert("Error: Please fill in all student details before saving.");
        return;
    }

    // IC Number must be 12 digits
    if (ic.length !== 12 || isNaN(ic)) {
        alert("Error: IC Number must contain exactly 12 digits.");
        return;
    }

    // Contact No should be valid
    if (isNaN(contactNo) || contactNo.length < 10) {
        alert("Error: Contact number must contain at least 10 digits.");
        return;
    }

    // build form data to send to controller
    const formData = new URLSearchParams();
    formData.append("stuName", name);
    formData.append("stuIC", ic);
    formData.append("classId", cls);
    formData.append("studentType", studentType);
    formData.append("stuAdd", address);
    formData.append("stuPhoneNum", contactNo);

    fetch("../StudentController?action=create", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData.toString()
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            alert("Student profile created successfully!");
            window.location.href = "../Student-List/StudentList.html";
        } else {
            alert("Something went wrong: " + data.message);
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Failed to connect to server. Please try again.");
    });
}

// utility functions
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