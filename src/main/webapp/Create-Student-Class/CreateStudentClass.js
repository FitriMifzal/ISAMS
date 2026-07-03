// CREATESTUDENTCLASS.JS
// User profile init handled by Sidebar.js

document.addEventListener('DOMContentLoaded', function () {
    // check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = "../Create-Account/Create-Account.html";
        return;
    }
});

// handle form submission
function handleForm(event) {
    event.preventDefault();

    const classCode = document.getElementById("classCode").value.trim();
    const className = document.getElementById("className").value.trim();

    // check if all fields filled
    if (!classCode || !className) {
        alert("Please fill in all the information!");
        return;
    }

    // build form data to send to servlet
    const formData = new URLSearchParams();
    formData.append("classCode", classCode);
    formData.append("className", className);

    // send to controller
    fetch("../ClassroomController?action=create", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData.toString()
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            alert("Class successfully registered!");
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