// Shared Utilities for Frontend API calls and features

const API_BASE_URL = '/api';

/**
 * Display a toast notification
 * @param {string} message - The message to display
 * @param {string} type - 'success', 'error', 'info'
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Add icon based on type
    let icon = '';
    if (type === 'success') icon = '✓';
    else if (type === 'error') icon = 'X';
    else icon = 'i';

    toast.innerHTML = `
        <span style="font-weight: bold;">${icon}</span>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Remove after 3.5 seconds
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

/**
 * Make an API request to the backend with automatic JWT handling
 * @param {string} endpoint - API endpoint (e.g., '/auth/login')
 * @param {string} method - HTTP method ('GET', 'POST', 'PATCH', etc.)
 * @param {object} body - Request payload (optional)
 * @returns {Promise<any>} - Response JSON data
 */
async function apiCall(endpoint, method = 'GET', body = null) {
    const headers = {
        'Content-Type': 'application/json'
    };

    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers
    };

    if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.msg || data.message || 'API Error');
        }

        return data;
    } catch (error) {
        // Automatically handle unauthorized errors by logging out
        if (error.message === 'Invalid token' || error.message === 'No token provided') {
            logout();
        }
        throw error; // Rethrow to let caller handle if they want to
    }
}

/**
 * Clear token and redirect to login
 */
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/index.html';
}

/**
 * Check if the user is logged in
 */
function checkAuth() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    // If not logged in and not on index.html
    if ((!token || !userStr) && !window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
        window.location.href = '/index.html';
        return null;
    }
    
    if (token && userStr) {
        try {
            return JSON.parse(userStr);
        } catch(e) {
            return null;
        }
    }
    return null;
}

/**
 * Format a date string into a readable format e.g., "Oct 12, 2023"
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}
