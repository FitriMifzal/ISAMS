/* ============================================================
   SIDEBAR.JS — Toggle submenu, sidebar, dan user profile
   Semua pages guna file ni je untuk consistent styling
   Letakkan: <script src="../Sidebar/Sidebar.js"></script>
   di bahagian bawah <body> setiap page.
   ============================================================ */

(function () {

    /* ── INIT SUBMENU ── */
    function initSubmenu() {
        document.querySelectorAll('.nav-item[data-submenu]').forEach(function (btn) {
            var submenu = btn.nextElementSibling;
            if (!submenu || !submenu.classList.contains('submenu')) return;

            /* Auto-buka submenu kalau ada sub-item yang active */
            if (submenu.querySelector('.sub-nav-item.active')) {
                btn.classList.add('open');
            }

            /* Toggle bila button diklik */
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                btn.classList.toggle('open');
            });
        });
    }

    /* ── INIT USER PROFILE (Generate initials dari name) ── */
    function initUserProfile() {
        var userNameEl = document.getElementById('user-fullname');
        var userInitialEl = document.getElementById('user-initial');

        if (userNameEl && userInitialEl) {
            var userName = userNameEl.textContent.trim();

            // Generate initials dari name
            var initials = userName
                .split(' ')
                .map(function(word) { return word.charAt(0).toUpperCase(); })
                .join('')
                .substring(0, 2);

            // Set initial (fallback to ? jika empty)
            userInitialEl.textContent = initials || '?';
        }
    }

    /* ── TOGGLE SIDEBAR (untuk mobile & menu button) ── */
    window.toggleSidebar = function () {
        var sidebar = document.getElementById('sidebar');
        var mainWrapper = document.getElementById('main-wrapper');
        var header = document.getElementById('header');

        if (sidebar) sidebar.classList.toggle('collapsed');
        if (mainWrapper) mainWrapper.classList.toggle('collapsed');
        if (header) header.classList.toggle('collapsed');
    };

    /* ── TOGGLE PROFILE (untuk dashboard profile section) ── */
    window.toggleProfile = function () {
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
    };

    /* ── LOGOUT ── */
    /* Calls LogoutServlet first to invalidate the real server-side session,
       then clears browser storage and redirects. Falls back to clearing
       storage anyway even if the server call fails, so the user is never
       stuck unable to log out. */
    window.logoutUser = function () {
        if (!confirm('Are you sure you want to logout?')) {
            return;
        }

        fetch("../LogoutServlet", { method: "POST" })
            .catch(function (error) {
                console.error("Logout request failed:", error);
            })
            .finally(function () {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = "../Create-Account/CreateAccount.html";
            });
    };

    /* ── JALANKAN SELEPAS DOM SIAP ── */
    function init() {
        initSubmenu();
        initUserProfile();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();