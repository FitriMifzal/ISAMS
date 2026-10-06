(function () {
  
    function initUserProfile() {
        var userNameEl = document.getElementById('user-fullname');
        var userInitialEl = document.getElementById('user-initial');

        if (userNameEl && userInitialEl) {
            var storedName = localStorage.getItem('active_name');
            if (storedName) {
                userNameEl.textContent = storedName;
            }

            var userName = userNameEl.textContent.trim();
            var initials = userName
                .split(' ')
                .map(function (word) { 
                    return word.charAt(0).toUpperCase(); 
                })
                .join('')
                .substring(0, 2);

            userInitialEl.textContent = initials || '?';
        }
    }

    
    window.toggleSidebar = function () {
        var sidebar = document.getElementById('sidebar');
        var mainWrapper = document.getElementById('main-wrapper');
        var header = document.getElementById('header');

        if (sidebar) sidebar.classList.toggle('collapsed');
        if (mainWrapper) mainWrapper.classList.toggle('collapsed');
        if (header) header.classList.toggle('collapsed');
    };

    window.toggleProfile = function () {
        var currentPage = window.location.pathname.toLowerCase();
        
        // Tetapkan nama projek Eclipse anda secara tetap untuk mengelakkan ralat path
        var contextPath = '/ISAMS';

        // Semak sama ada pengguna sedang berada di halaman Profile
        var isOnProfilePage = currentPage.includes('/profile/profile.html');

        if (isOnProfilePage) {
            // ── JALAN PULANG ──
            // Menggunakan kunci sessionStorage yang seragam ('profile_return_url')
            var returnUrl = sessionStorage.getItem('profile_return_url');
            
            if (returnUrl) {
                window.location.href = returnUrl; 
            } else {
                window.history.back(); 
            }
        } else {
            // Pengguna di halaman biasa → Simpan URL semasa
            sessionStorage.setItem('profile_return_url', window.location.href);
            
            // Halakan ke halaman Profile dengan laluan yang tepat
            window.location.href = window.location.origin + contextPath + '/Profile/Profile.html';
        }
    };

   
    function init() {
        initUserProfile();
    }

   
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();