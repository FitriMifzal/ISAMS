// UPDATESTUDENTCLASS.JS
// User profile init handled by Sidebar.js

document.addEventListener('DOMContentLoaded', function () {
    // check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = "../Create-Account/Create-Account.html";
        return;
    }

    loadClassData();
});

// load existing class data based on ?id= in URL
function loadClassData() {
    const params = new URLSearchParams(window.location.search);
    const classId = params.get("id");

    if (!classId) {
        alert("No class selected.");
        window.location.href = "../Student Class/StudentClass.html";
        return;
    }

    fetch("../ClassroomController?action=get&id=" + encodeURIComponent(classId))
        .then(response => response.json())
        .then(data => {
            if (data.status === "error") {
                alert(data.message);
                window.location.href = "../Student Class/StudentClass.html";
                return;
            }

            document.getElementById("classId").value = data.classId;
            document.getElementById("classCode").value = data.classCode;
            document.getElementById("className").value = data.className;
        })
        .catch(error => {
            console.error("Error loading class data:", error);
            alert("Failed to load class data. Please try again.");
        });
}

// handle update - called by Confirm button
function updateClass() {
    const classId = document.getElementById("classId").value;
    const classCode = document.getElementById("classCode").value.trim();
    const className = document.getElementById("className").value.trim();

    if (!className) {
        alert("Please fill in all the information!");
        return;
    }

    const formData = new URLSearchParams();
    formData.append("classId", classId);
    formData.append("classCode", classCode);
    formData.append("className", className);

    fetch("../ClassroomController?action=update", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData.toString()
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            alert("Class successfully updated!");
            window.location.href = "../Student Class/StudentClass.html";
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