/* ============================================================
   CREATESTUDENT.JS — Page-specific logic
   User profile initialization handled by Sidebar.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = "../Create-Account/Create-Account.html";
        return;
    }
});

/* ────────────────────────────────────────────────────────
   SAVE STUDENT FUNCTION
────────────────────────────────────────────────────────── */

function saveStudent() {
    const name = document.getElementById("name").value.trim();
    const ic = document.getElementById("ic").value.trim();
    const cls = document.getElementById("cls").value.trim();
    const address = document.getElementById("address").value.trim();
    const contactNo = document.getElementById("No").value.trim();

    // Validation - check if all fields filled
    if (!name || !ic || !cls || !address || !contactNo) {
        alert("Error: Please fill in all student details before saving.");
        return;
    }

    // Validation - IC Number must be 12 digits
    if (ic.length !== 12 || isNaN(ic)) {
        alert("Error: IC Number must contain exactly 12 digits.");
        return;
    }

    // Validation - Contact No should be valid
    if (isNaN(contactNo) || contactNo.length < 10) {
        alert("Error: Contact number must contain at least 10 digits.");
        return;
    }

    // Get existing students array
    let students = JSON.parse(localStorage.getItem("students")) || [];

    // Create new student object
    const newStudent = {
        name: name,
        ic: ic,
        cls: cls,
        address: address,
        No: contactNo
    };

    // Add to array
    students.push(newStudent);

    // Save to localStorage
    localStorage.setItem("students", JSON.stringify(students));

    alert("Student profile created successfully!");
    
    // Redirect to student list
    window.location.href = "../Student-List/StudentList.html";
}

/* ────────────────────────────────────────────────────────
   UTILITY FUNCTIONS
────────────────────────────────────────────────────────── */

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