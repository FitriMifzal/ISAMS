document.addEventListener('DOMContentLoaded', function () {
    console.log('Login page loaded');

    document.querySelectorAll('input[name="role"]').forEach(radio => {
        radio.addEventListener('change', function () {
            updateFieldsBasedOnRole(this.value);
        });
    });

    const selectedRole = document.querySelector('input[name="role"]:checked').value;
    updateFieldsBasedOnRole(selectedRole);

    document.getElementById('password').addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            handleLogin(event);
        }
    });
});

function updateFieldsBasedOnRole(role) {
    const idGroup = document.getElementById('idGroup');
    const icGroup = document.getElementById('icGroup');
    const idField = document.getElementById('id');
    const icField = document.getElementById('ic');

    if (role === 'Penyelaras Intervensi') {
        idGroup.classList.remove('hidden');
        icGroup.classList.add('hidden');

        idField.required = true;
        icField.required = false;

        idField.value = '';
        icField.value = '';

    } else {
        idGroup.classList.add('hidden');
        icGroup.classList.remove('hidden');

        idField.required = false;
        icField.required = true;

        idField.value = '';
        icField.value = '';
    }
}

function handleLogin(event) {
    event.preventDefault();

    const selectedRole = document.querySelector('input[name="role"]:checked').value;
    const piId = document.getElementById('id').value.trim();
    const tIC = document.getElementById('ic').value.trim();
    const password = document.getElementById('password').value.trim();
    const loginBtn = document.getElementById('loginBtn');

    hideError();

    if (selectedRole === 'Penyelaras Intervensi') {
        if (!piId) {
            showError('Please enter your Penyelaras ID');
            return;
        }

        if (!/^\d+$/.test(piId)) {
            showError('Penyelaras ID must be number only');
            return;
        }
    }

    if (selectedRole === 'Teacher') {
        if (!tIC) {
            showError('Please enter your IC Number');
            return;
        }
    }

    if (!password) {
        showError('Please enter your password');
        return;
    }

    const formData = new URLSearchParams();
    formData.append('role', selectedRole);
    formData.append('tPass', password);

    if (selectedRole === 'Penyelaras Intervensi') {
        formData.append('piId', piId);
    } else {
        formData.append('tIC', tIC);
    }

    loginBtn.disabled = true;
    loginBtn.innerHTML = 'Logging in...';

    fetch('../LoginServlet', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
    })
    .then(response => response.json())
    .then(data => {
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt" style="margin-right: 8px;"></i>Login';

        if (data.status === 'success') {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('active_tId', data.tId);
            localStorage.setItem('active_piId', data.piId);
            localStorage.setItem('active_name', data.tName);
            localStorage.setItem('active_email', data.tEmail || '');
            localStorage.setItem('active_role', data.role);

            window.location.href = '../Dashboard/Dashboard.html';
        } else {
            showError(data.message || 'Invalid login details');
        }
    })
    .catch(error => {
        console.error('Login error:', error);

        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt" style="margin-right: 8px;"></i>Login';

        showError('Failed to connect to server.');
    });
}

function togglePasswordVisibility() {
    const passwordField = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');

    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    } else {
        passwordField.type = 'password';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    }
}

function showError(message) {
    const errorMsg = document.getElementById('errorMsg');
    errorMsg.innerText = message;
    errorMsg.classList.remove('hidden');
}

function hideError() {
    const errorMsg = document.getElementById('errorMsg');
    errorMsg.innerText = '';
    errorMsg.classList.add('hidden');
}