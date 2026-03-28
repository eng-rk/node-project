/**
 * layout.js - Injects common header and footer across all pages
 */

document.addEventListener('DOMContentLoaded', () => {
    injectLayout();
    updateHeaderWithUser();
});

function injectLayout() {
    // 1. Generate Footer
    const footerHTML = `
        <footer class="app-footer">
            &copy; 2026 LeaveTrack System. All rights reserved.
        </footer>
    `;
    
    // Add the footer to the end of the body
    document.body.insertAdjacentHTML('beforeend', footerHTML);

    // 2. Generate Header
    // The index page (login/register) has a simpler header without logout buttons
    const isIndexPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
    
    // Determine the page title/subtitle badge based on the URL
    let badgeHtml = '';
    if (window.location.pathname.includes('admin.html')) {
        badgeHtml = `<span>Admin Access</span>`;
    } else if (window.location.pathname.includes('manager.html')) {
        badgeHtml = `<span>Manager Portal</span>`;
    }

    let headerHTML = '';
    
    if (isIndexPage) {
        // Simple header for the login page
        headerHTML = `
            <header class="app-header">
                <div class="nav-brand">LeaveTrack</div>
            </header>
        `;
    } else {
        // Authenticated header with user info and logout
        headerHTML = `
            <header class="app-header">
                <div class="nav-brand">LeaveTrack ${badgeHtml}</div>
                <div class="nav-links">
                    <span class="user-info" id="user-greeting">Loading...</span>
                    <button class="btn-logout" id="logout-btn">Logout</button>
                </div>
            </header>
        `;
    }

    // Insert the header right after the toast container
    const toastContainer = document.getElementById('toast-container');
    if (toastContainer) {
        toastContainer.insertAdjacentHTML('afterend', headerHTML);
    } else {
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
    }

    // Attach logout event listener if the button exists
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (typeof logout === 'function') {
                logout();
            } else {
                // Fallback logout mechanism
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/index.html';
            }
        });
    }
}

/**
 * Update the header with the logged-in user's name
 */
function updateHeaderWithUser() {
    const isIndexPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
    if (isIndexPage) return; // No user greeting to update

    const greetingEl = document.getElementById('user-greeting');
    if (!greetingEl) return;

    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            greetingEl.textContent = `Hello, ${user.username || 'User'}`;
        } catch (e) {
            greetingEl.textContent = 'Hello, User';
        }
    } else {
        greetingEl.textContent = 'Not Logged In';
    }
}
