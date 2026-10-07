(function () {

    // ── Dapatkan nilai localStorage yang sah (elak "undefined" / "null" / kosong) ──
    function getValidStorage(key) {
        var value = localStorage.getItem(key);
        if (!value) return null;
        value = value.trim();
        if (value === '' || value === 'undefined' || value === 'null') return null;
        return value;
    }

    // ── Tentukan label & ID mengikut role ──
    function getUserIdInfo() {
        var role = getValidStorage('active_role');
        var piId = getValidStorage('active_piId');
        var tId = getValidStorage('active_tId');

        if (role === 'Penyelaras Intervensi') {
            if (piId) return { label: 'Penyelaras ID', value: piId };
            if (tId) return { label: 'Teacher ID', value: tId };
        } else {
            if (tId) return { label: 'Teacher ID', value: tId };
            if (piId) return { label: 'Penyelaras ID', value: piId };
        }
        return null;
    }

    // ── Suntik style kecil untuk paparan ID (sekali sahaja) ──
    function injectUserIdStyle() {
        if (document.getElementById('user-id-style')) return;

        var style = document.createElement('style');
        style.id = 'user-id-style';
        style.textContent =
            '.user-info-text{display:flex;flex-direction:column;align-items:flex-end;justify-content:center;line-height:1.25;}' +
            '.user-id-display{font-size:11px;font-weight:500;opacity:0.8;margin-top:2px;white-space:nowrap;}';
        document.head.appendChild(style);
    }

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

            // ── TAMBAHAN: paparkan ID user di bawah nama ──
            initUserIdDisplay(userNameEl);
        }
    }

    function initUserIdDisplay(userNameEl) {
        var idInfo = getUserIdInfo();
        if (!idInfo) return;

        injectUserIdStyle();

        // Bungkus nama + ID dalam satu container (sekali sahaja)
        var wrapper = userNameEl.parentElement;
        if (!wrapper.classList.contains('user-info-text')) {
            wrapper = document.createElement('div');
            wrapper.className = 'user-info-text';
            userNameEl.parentNode.insertBefore(wrapper, userNameEl);
            wrapper.appendChild(userNameEl);
        }

        // Cipta atau kemaskini elemen ID
        var idEl = document.getElementById('user-id-display');
        if (!idEl) {
            idEl = document.createElement('span');
            idEl.id = 'user-id-display';
            idEl.className = 'user-id-display';
            wrapper.appendChild(idEl);
        }
        idEl.textContent = idInfo.label + ': ' + idInfo.value;
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