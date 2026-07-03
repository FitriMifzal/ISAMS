// STUDENTCLASS.JS
// User profile init handled by Sidebar.js

document.addEventListener('DOMContentLoaded', function () {
    // check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = "../Create-Account/Create-Account.html";
        return;
    }

    // load classes into table
    loadClasses();

    // check user role and adjust UI accordingly
    const role = localStorage.getItem('active_role') || 'Subject Teacher';
    if (role === 'Subject Teacher') {
        const createBtn = document.querySelector('.btn-create');
        if (createBtn) {
            createBtn.style.display = 'none';
        }
    }
});

// load classes from database
function loadClasses() {
    const table = document.getElementById("classTable");
    table.innerHTML = `<tr><td colspan="4">Loading...</td></tr>`;

    fetch("../ClassroomController?action=list")
        .then(response => response.json())
        .then(classes => {
            table.innerHTML = "";

            if (classes.length === 0) {
                table.innerHTML = `<tr><td colspan="4">No classes found</td></tr>`;
                return;
            }

            classes.forEach((c, index) => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${c.classCode}</td>
                    <td>${c.className}</td>
                    <td>
                        <button class="btn-update"
                                onclick="window.location.href='../Update-Student-Class/UpdateStudentClass.html?id=${c.classId}'">
                            Update
                        </button>
                    </td>
                `;
                table.appendChild(row);
            });
        })
        .catch(error => {
            console.error("Error loading classes:", error);
            table.innerHTML = `<tr><td colspan="4">Failed to load classes. Please try again.</td></tr>`;
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