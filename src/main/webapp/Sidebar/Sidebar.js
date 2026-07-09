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

    /* ── INIT ROLE ── */
    function initRole() {
        var role = localStorage.getItem('active_role') || 'Teacher';

        var roleBadgeEl = document.querySelector('.role-badge');
        if (roleBadgeEl) {
            // FIXED: Show "Teacher" instead of "Subject Teacher"
            roleBadgeEl.textContent = role;
        }

        document.querySelectorAll('.nav-item[data-role]').forEach(function (item) {
            var allowedRole = item.getAttribute('data-role');
            if (allowedRole !== role) {
                item.style.display = 'none';
            } else {
                item.style.display = '';
            }
        });

        document.querySelectorAll('.sub-nav-item[data-role]').forEach(function (item) {
            var allowedRole = item.getAttribute('data-role');
            if (allowedRole !== role) {
                item.style.display = 'none';  // HIDE kalau role tak match
            } else {
                item.style.display = '';
            }
        });
    }

    /* ── SET ACTIVE NAV ITEM (based on current page) ── */
    function setActiveNav() {
        var currentPage = window.location.pathname.toLowerCase();
        currentPage = decodeURIComponent(currentPage);
        
        // Remove all active classes first
        document.querySelectorAll('.nav-item').forEach(function (item) {
            item.classList.remove('active');
        });
        
        document.querySelectorAll('.sub-nav-item').forEach(function (item) {
            item.classList.remove('active');
        });

        // Find and set active class based on current page
        document.querySelectorAll('.nav-item, .sub-nav-item').forEach(function (item) {
            var href = item.getAttribute('href');
            
            if (href) {
                // Normalize paths for comparison
                href = href.toLowerCase();
                
                // Remove "../" to get clean path (e.g., "enroll-subject/enroll-subject.html")
                var cleanHref = href.replace(/\.\.\//g, '').replace(/^\//, '');
                cleanHref = decodeURIComponent(cleanHref);
                
                // Check if current page matches this link
                // This is more specific - won't match partial paths
                if (currentPage.includes(cleanHref)) {
                    item.classList.add('active');
                    
                    // If sub-item is active, open parent submenu
                    if (item.classList.contains('sub-nav-item')) {
                        var submenu = item.closest('.submenu');
                        if (submenu) {
                            var parentBtn = submenu.previousElementSibling;
                            if (parentBtn && parentBtn.classList.contains('nav-item')) {
                                parentBtn.classList.add('open');
                            }
                        }
                    }
                }
            }
        });
    }

    /* ── LOGOUT ── */
    window.logoutUser = function () {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '../LandingPage/LandingPage.html';
        }
        // If user clicks Cancel, do nothing (stay on current page)
    };

    /* ── INIT ── */
    function init() {
        initSubmenu();
        initRole();
        setActiveNav();  // ← SET ACTIVE NAV ITEM
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();