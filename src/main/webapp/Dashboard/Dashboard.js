// DASHBOARD.JS
// Add these functions to populate statistics from database

document.addEventListener('DOMContentLoaded', function () {
    sessionStorage.setItem('profile_return_url', window.location.href);
    
    // Load statistics from database
    loadDashboardStatistics();
});

/* ── LOAD DASHBOARD STATISTICS FROM DATABASE ── */
function loadDashboardStatistics() {
    var currentTeacherId = localStorage.getItem('active_tId'); // or from session
    
    // Fetch statistics data from backend
    // The servlet/API should query:
    // - Total Students: COUNT(Stu_ID) FROM Student
    // - Total Classes: COUNT(Class_ID) FROM Class
    // - Subjects Teaching: COUNT(Sub_ID) FROM Subject WHERE T_ID = currentTeacherId
    
    fetch("../DashboardController?action=getStatistics&T_ID=" + currentTeacherId)
        .then(response => response.json())
        .then(data => {
            // Populate statistics cards with database values
            document.getElementById('totalStudents').textContent = data.totalStudents || 0;
            document.getElementById('totalClasses').textContent = data.totalClasses || 0;
            document.getElementById('totalSubjects').textContent = data.totalSubjects || 0;
        })
        .catch(error => {
            console.error('Error loading statistics:', error);
            // Show default values if fetch fails
            document.getElementById('totalStudents').textContent = '0';
            document.getElementById('totalClasses').textContent = '0';
            document.getElementById('totalSubjects').textContent = '0';
        });
}