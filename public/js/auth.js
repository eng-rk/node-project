document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    const loginView = document.getElementById('login-form-view');
    const registerView = document.getElementById('register-form-view');
    
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');

    if (!loginForm) return; // Not on the auth page

    // Check if already logged in
    const user = checkAuth();
    if (user) {
        redirectBasedOnRole(user.role);
    }

    // Toggle views
    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginView.style.display = 'none';
        registerView.style.display = 'block';
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerView.style.display = 'none';
        loginView.style.display = 'block';
    });

    // Login Handle
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            const data = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            }).then(res => {
                if (!res.ok) throw new Error('Invalid credentials or deactivated account');
                return res.json();
            });

            localStorage.setItem('token', data.token);
            
            // Decode simple payload (naive client-side decode just for role/id)
            const payload = JSON.parse(atob(data.token.split('.')[1]));
            localStorage.setItem('user', JSON.stringify(payload));
            
            showToast('Login successful', 'success');
            setTimeout(() => redirectBasedOnRole(payload.role), 1000);

        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    // Register Handle
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const role = document.getElementById('reg-role').value;
        // Client-side validation
        if (username.trim().split(/\s+/).length < 2) {
            return showToast('Please provide both first and last name', 'error');
        }

        const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,20}$/;
        if (!passwordRegex.test(password)) {
            return showToast('Password must be 8-20 characters long and contain at least one special character', 'error');
        }

        try {
            const data = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, role })
            }).then(async res => {
                const body = await res.json();
                if (!res.ok) throw new Error(body.msg || 'Registration failed');
                return body;
            });

            showToast('Registration successful! Please log in.', 'success');
            
            // Switch to login
            document.getElementById('show-login').click();
            
            // Prefill email
            document.getElementById('login-email').value = email;
            document.getElementById('login-password').value = '';

        } catch (err) {
            showToast(err.message, 'error');
        }
    });
});

function redirectBasedOnRole(role) {
    if (role === 'admin') window.location.href = '/admin.html';
    else if (role === 'manager') window.location.href = '/manager.html';
    else window.location.href = '/employee.html';
}
