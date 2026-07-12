// DASHBOARD.JS
// Add these functions to populate statistics from database

document.addEventListener('DOMContentLoaded', function () {
    sessionStorage.setItem('profile_return_url', window.location.href);

    // Paparkan peranan sebenar pengguna yang sedang log masuk
    applyActiveRole();

    // Load statistics from database
    loadDashboardStatistics();
});

/* ── PAPARKAN PERANAN SEBENAR PADA WELCOME CARD ──
   Dashboard.html menulis <strong id="status-text">Teacher</strong> secara hardcoded,
   jadi ia kekal "Teacher" walaupun yang log masuk ialah Penyelaras Intervensi.
   Fungsi ini menggantikan teks itu dengan nilai 'active_role' yang disimpan
   oleh login.js selepas LoginServlet mengesahkan akaun.                          */
function applyActiveRole() {
    var statusText = document.getElementById('status-text');
    if (!statusText) {
        return;
    }

    var activeRole = localStorage.getItem('active_role');

    // Tolak nilai rosak / lapuk seperti "null" atau "undefined" yang tersimpan sebagai string
    if (!activeRole || activeRole === 'null' || activeRole === 'undefined' || !activeRole.trim()) {
        return; // biarkan teks asal, jangan paparkan peranan yang salah
    }

    statusText.textContent = activeRole.trim();
}

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