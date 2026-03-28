document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuth();
    if (!user) return; // Utilities checkAuth handles redirect

    if (user.role !== 'employee') {
        showToast('You are not an employee', 'error');
        setTimeout(() => logout(), 1500);
        return;
    }

    document.getElementById('logout-btn').addEventListener('click', logout);

    // Initial load
    fetchMyLeaves();
    updateBalanceDisplay(); // Note: Balance isn't stored in simple token. We could fetch profile.

    // Handle form submit
    const leaveForm = document.getElementById('leave-form');
    leaveForm.addEventListener('submit', submitLeave);
});

async function updateBalanceDisplay() {
    try {
        const user = await apiCall('/users/profile');
        document.getElementById('leave-balance').textContent = user.leaveBalance;
    } catch (err) {
        console.error('Error fetching balance:', err);
    }
}

async function fetchMyLeaves() {
    try {
        const leaves = await apiCall('/leaves/my-leaves');
        
        const tbody = document.getElementById('leave-table-body');
        tbody.innerHTML = '';

        let pendingCount = 0;

        leaves.forEach(leave => {
            if (leave.status === 'Pending') pendingCount++;

            const tr = document.createElement('tr');
            
            let actionBtn = '';
            if (leave.status === 'Pending') {
                actionBtn = `<button class="action-btn btn-reject cancel-btn" data-id="${leave._id}">Cancel</button>`;
            }

            tr.innerHTML = `
                <td>${formatDate(leave.createdAt)}</td>
                <td>${formatDate(leave.startDate)}</td>
                <td>${formatDate(leave.endDate)}</td>
                <td>${leave.totalDays}</td>
                <td><span class="status-badge status-${leave.status.toLowerCase()}">${leave.status}</span></td>
                <td>${leave.reason || '-'}</td>
                <td>${actionBtn}</td>
            `;

            tbody.appendChild(tr);
        });

        document.getElementById('pending-count').textContent = pendingCount;
        
        // Add event listeners to cancel buttons
        document.querySelectorAll('.cancel-btn').forEach(btn => {
            btn.addEventListener('click', (e) => cancelLeave(e.target.dataset.id));
        });

    } catch(err) {
        showToast('Error loading leaves: ' + err.message, 'error');
    }
}

async function submitLeave(e) {
    e.preventDefault();
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const reason = document.getElementById('reason').value;

    try {
        await apiCall('/leaves/submit', 'POST', { startDate, endDate, reason });
        showToast('Leave request submitted', 'success');
        document.getElementById('leave-form').reset();
        fetchMyLeaves();
    } catch(err) {
        showToast(err.message, 'error');
    }
}

async function cancelLeave(id) {
    if (!confirm('Are you sure you want to cancel this request?')) return;
    
    try {
        await apiCall(`/leaves/${id}/cancel`, 'PATCH');
        showToast('Leave request cancelled', 'success');
        fetchMyLeaves();
    } catch(err) {
        showToast(err.message, 'error');
    }
}
