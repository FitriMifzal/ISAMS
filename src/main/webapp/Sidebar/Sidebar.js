(function () {

    /* ── INIT SUBMENU ── */
    function initSubmenu() {
        document.querySelectorAll('.nav-item[data-submenu]').forEach(function (btn) {
            var submenu = btn.nextElementSibling;
            if (!submenu || !submenu.classList.contains('submenu')) return;

            if (submenu.querySelector('.sub-nav-item.active')) {
                btn.classList.add('open');
            }

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
                item.style.display = 'none';
            } else {
                item.style.display = '';
            }
        });
    }

    /* ── SET ACTIVE NAV ITEM ── */
    function setActiveNav() {
        var currentPage = window.location.pathname.toLowerCase();
        currentPage = decodeURIComponent(currentPage);
        
        document.querySelectorAll('.nav-item').forEach(function (item) {
            item.classList.remove('active');
        });
        
        document.querySelectorAll('.sub-nav-item').forEach(function (item) {
            item.classList.remove('active');
        });

        document.querySelectorAll('.nav-item, .sub-nav-item').forEach(function (item) {
            var href = item.getAttribute('href');
            
            if (href) {
                href = href.toLowerCase();
                var cleanHref = href.replace(/\.\.\//g, '').replace(/^\//, '');
                cleanHref = decodeURIComponent(cleanHref);
                
                if (currentPage.includes(cleanHref)) {
                    item.classList.add('active');
                    
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

    /* ── LOGOUT — CUSTOM MODAL ── */
    window.logoutUser = function () {
        // Check if modal already exists, if not create it
        let modal = document.getElementById('logoutModal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'logoutModal';
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-box">
                    <div class="modal-icon">✕</div>
                    <h2 class="modal-title">Confirm Logout</h2>
                    <p class="modal-message">Are you sure you want to logout from your account?<br>You will need to login again to access the system.</p>
                    <div class="modal-actions">
                        <button class="modal-btn modal-btn-cancel" id="modalCancel">Cancel</button>
                        <button class="modal-btn modal-btn-logout" id="modalConfirm">Yes, Logout</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        // Show modal
        modal.classList.add('active');

        // Handle Cancel button
        const cancelBtn = document.getElementById('modalCancel');
        const confirmBtn = document.getElementById('modalConfirm');

        // Remove old listeners to avoid duplicates
        const newCancelBtn = cancelBtn.cloneNode(true);
        const newConfirmBtn = confirmBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

        // Cancel: close modal
        newCancelBtn.addEventListener('click', function () {
            modal.classList.remove('active');
        });

        // Confirm: logout
        newConfirmBtn.addEventListener('click', function () {
            modal.classList.remove('active');
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '../LandingPage/LandingPage.html';
        });

        // Click outside modal to close
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });

        // ESC key to close
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                modal.classList.remove('active');
                document.removeEventListener('keydown', escHandler);
            }
        });
    };

    /* ── INIT ── */
    function init() {
        initSubmenu();
        initRole();
        setActiveNav();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();