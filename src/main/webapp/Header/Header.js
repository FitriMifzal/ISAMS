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
        
        // Check if already on Profile page
        var isOnProfilePage = currentPage.indexOf('/profile/profile.html') !== -1;

        if (isOnProfilePage) {
            // User is on Profile page → Go back to previous page
            var returnUrl = sessionStorage.getItem('profile_return_url');
            
            if (returnUrl) {
                window.location.href = returnUrl;
            } else {
                // If no previous URL saved, go to Dashboard
                window.location.href = '../Dashboard/Dashboard.html';
            }
        } else {
            // User is NOT on Profile page → Go to Profile page
            // Save current URL first (so user can return later)
            sessionStorage.setItem('profile_return_url', window.location.href);
            
            // Navigate to Profile page
            window.location.href = '../Profile/Profile.html';
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