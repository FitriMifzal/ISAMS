/* ============================================================
   LOGIN.JS — Complete Login Authentication
   Handles email/password validation and user authentication
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
    console.log('Login page loaded');
    
   document.addEventListener('DOMContentLoaded', function () {
    console.log('Login page loaded');
    
    // Check if already logged in - redirect to dashboard
    // Comment out or remove this auto-redirect to prevent glitch
    // if (localStorage.getItem('isLoggedIn') === 'true') {
    //     console.log('User already logged in - redirecting to Dashboard');
    //     window.location.href = '../Dashboard/Dashboard.html';
    //     return;
    // }

    // Add role change listener to toggle ID/IC fields
    document.querySelectorAll('input[name="role"]').forEach(radio => {
        radio.addEventListener('change', function() {
            updateFieldsBasedOnRole(this.value);
        });
    });

    // Initial field setup
    const selectedRole = document.querySelector('input[name="role"]:checked').value;
    updateFieldsBasedOnRole(selectedRole);

    // Add Enter key support for password field
    document.getElementById('password').addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            handleLogin(event);
        }
    });
});

    // Add role change listener to toggle ID/IC fields
    document.querySelectorAll('input[name="role"]').forEach(radio => {
        radio.addEventListener('change', function() {
            updateFieldsBasedOnRole(this.value);
        });
    });

    // Initial field setup
    const selectedRole = document.querySelector('input[name="role"]:checked').value;
    updateFieldsBasedOnRole(selectedRole);

    // Add Enter key support for password field
    document.getElementById('password').addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            handleLogin(event);
        }
    });
});

/* ════════════════════════════════════════════════════════
   UPDATE FIELDS BASED ON SELECTED ROLE
   ════════════════════════════════════════════════════════ */
function updateFieldsBasedOnRole(role) {
    const idGroup = document.getElementById('idGroup');
    const icGroup = document.getElementById('icGroup');
    const idField = document.getElementById('id');
    const icField = document.getElementById('ic');

    if (role === 'Penyelaras Intervensi') {
        // Show ID field for Penyelaras
        idGroup.classList.remove('hidden');
        icGroup.classList.add('hidden');
        idField.required = true;
        icField.required = false;
        console.log('Role changed to Penyelaras - showing ID field');
    } else if (role === 'Teacher') {
        // Show IC field for Teacher
        idGroup.classList.add('hidden');
        icGroup.classList.remove('hidden');
        idField.required = false;
        icField.required = true;
        console.log('Role changed to Teacher - showing IC field');
    }
}

/* ════════════════════════════════════════════════════════
   TOGGLE PASSWORD VISIBILITY (Eye Icon)
   Eye open = password visible
   Eye closed = password hidden
   ════════════════════════════════════════════════════════ */
function togglePasswordVisibility() {
    const passwordField = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');

    if (passwordField.type === 'password') {
        // Password sedang tersembunyi → Tukar kepada kelihatan
        passwordField.type = 'text';
        // Mata TERBUKA (fa-eye) - password visible
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
        console.log('Password visible (eye open)');
    } else {
        // Password sedang kelihatan → Tukar kepada tersembunyi
        passwordField.type = 'password';
        // Mata TERTUTUP (fa-eye-slash) - password hidden
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
        console.log('Password hidden (eye closed)');
    }
}

/* ════════════════════════════════════════════════════════
   HANDLE LOGIN SUBMISSION
   Validate credentials and authenticate user
   ════════════════════════════════════════════════════════ */
function handleLogin(event) {
    event.preventDefault();

    // Get form values
    const selectedRole = document.querySelector('input[name="role"]:checked').value;
    const password = document.getElementById('password').value.trim();
    const errorMsg = document.getElementById('errorMsg');

    let identifier = '';
    let identifierType = '';

    if (selectedRole === 'Penyelaras Intervensi') {
        identifier = document.getElementById('id').value.trim();
        identifierType = 'ID';
    } else if (selectedRole === 'Teacher') {
        identifier = document.getElementById('ic').value.trim();
        identifierType = 'IC Number';
    }

    console.log('Login attempt with:', { role: selectedRole, [identifierType]: identifier, password: '***' });

    // Hide any previous error messages
    errorMsg.classList.add('hidden');
    errorMsg.innerText = '';

    // ✅ VALIDATION 1: Check if identifier is empty
    if (!identifier) {
        showError(`Please enter your ${identifierType}`);
        console.log(`Validation failed: ${identifierType} empty`);
        return;
    }

    // ✅ VALIDATION 2: Check if password is empty
    if (!password) {
        showError('Please enter your password');
        console.log('Validation failed: password empty');
        return;
    }

    // ✅ VALIDATION 3: Password minimum length
    if (password.length < 6) {
        showError('Password must be at least 6 characters');
        console.log('Validation failed: password too short');
        return;
    }

    console.log('✅ Validations passed - proceeding with authentication');

    // ════════════════════════════════════════════════════════
    // AUTHENTICATION LOGIC
    // (For testing: use hardcoded credentials)
    // (For production: replace with API call to backend)
    // ════════════════════════════════════════════════════════

    // ✅ HARDCODED TEST ACCOUNTS (for localhost testing)
    const testAccounts = [
        {
            id: 'P001',
            password: 'admin123',
            role: 'Penyelaras Intervensi',
            name: 'Admin Penyelaras',
            email: 'admin@kv.edu',
            tId: 0,
            type: 'id'
        },
        {
            ic: '900101011234',
            password: 'teacher123',
            role: 'Teacher',
            name: 'Ahmad Mohamed',
            email: 'ahmad@kv.edu',
            tId: 1,
            type: 'ic'
        },
        {
            ic: '960711056789',
            password: 'teacher123',
            role: 'Teacher',
            name: 'Amirul Aiman',
            email: 'amirul@kv.edu',
            tId: 2,
            type: 'ic'
        }
    ];

    // Find matching account
    let user = null;
    
    if (selectedRole === 'Penyelaras Intervensi') {
        user = testAccounts.find(account => 
            account.id === identifier && 
            account.password === password &&
            account.role === selectedRole
        );
    } else if (selectedRole === 'Teacher') {
        user = testAccounts.find(account => 
            account.ic === identifier && 
            account.password === password &&
            account.role === selectedRole
        );
    }

    if (user) {
        // ✅ AUTHENTICATION SUCCESSFUL
        console.log('✅ Authentication successful:', user.name);

        // Save user info to localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('active_email', user.email);
        localStorage.setItem('active_name', user.name);
        localStorage.setItem('active_role', user.role);
        localStorage.setItem('active_tId', user.tId);
        
        console.log('✅ User data saved to localStorage');
        console.log('User:', {
            name: user.name,
            email: user.email,
            role: user.role
        });

        // Redirect to Dashboard
        console.log('✅ Redirecting to Dashboard');
        window.location.href = '../Dashboard/Dashboard.html';
    } else {
        // ❌ AUTHENTICATION FAILED
        console.log('❌ Authentication failed: Invalid credentials');
        showError('Invalid credentials. Please try again.');
    }
}

/* ════════════════════════════════════════════════════════
   SHOW ERROR MESSAGE
   Display error message to user
   ════════════════════════════════════════════════════════ */
function showError(message) {
    const errorMsg = document.getElementById('errorMsg');
    errorMsg.innerText = message;
    errorMsg.classList.remove('hidden');
    console.log('Error shown:', message);
}

/* ════════════════════════════════════════════════════════
   TEST ACCOUNTS (for localhost testing)
   ════════════════════════════════════════════════════════ */

console.log('='.repeat(60));
console.log('LOGIN PAGE - TEST CREDENTIALS');
console.log('='.repeat(60));
console.log('');
console.log('PENYELARAS INTERVENSI:');
console.log('  Penyelaras ID: P001');
console.log('  Password: admin123');
console.log('  Role: Select "Penyelaras Intervensi"');
console.log('');
console.log('TEACHER (Account 1):');
console.log('  IC Number: c');
console.log('  Password: teacher123');
console.log('  Role: Select "Teacher"');
console.log('');
console.log('TEACHER (Account 2):');
console.log('  IC Number: 960711056789');
console.log('  Password: teacher123');
console.log('  Role: Select "Teacher"');
console.log('');
console.log('='.repeat(60));

console.log('Login.js loaded - Ready for authentication');