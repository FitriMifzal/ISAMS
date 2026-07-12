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
        
        // Mengesan root projek secara automatik
        var pathSegments = window.location.pathname.split('/');
        var contextPath = pathSegments[1] ? '/' + pathSegments[1] : '';

        // Check jika user berada di page Profile
        var isOnProfilePage = currentPage.endsWith('/profile/profile.html') || currentPage.endsWith('/profile.html');

        if (isOnProfilePage) {
            // ── JALAN PULANG 100% DINAMIK (TANPA HARDCODE NAMA PAGE) ──
            var returnUrl = sessionStorage.getItem('profile_return_url');
            
            if (returnUrl) {
                window.location.href = returnUrl; 
            } else {
                // Jika memori kosong, sistem automatik undur ke belakang mengikut history pelayar
                window.history.back(); 
            }
        } else {
            // User berada di page biasa → Simpan URL penuh secara automatik
            sessionStorage.setItem('profile_return_url', window.location.href);
            
            // Pergi ke Profile page mengikut root projek
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