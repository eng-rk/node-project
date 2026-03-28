document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuth();
    if (!user) return; // Utilities checkAuth handles redirect

    if (user.role !== 'manager' && user.role !== 'admin') {
        showToast('Access denied', 'error');
        setTimeout(() => logout(), 1500);
        return;
    }

    document.getElementById('logout-btn').addEventListener('click', logout);

    fetchTeamLeaves();
});

async function fetchTeamLeaves() {
    try {
        const leaves = await apiCall('/leaves/team');
        
        const tbody = document.getElementById('team-leave-body');
        tbody.innerHTML = '';

        let pendingCount = 0;
        let processedCount = 0;

        leaves.forEach(leave => {
            if (leave.status === 'Pending') pendingCount++;
            else if (leave.status === 'Approved' || leave.status === 'Rejected') processedCount++;

            const tr = document.createElement('tr');
            
            let actionHtml = '-';
            if (leave.status === 'Pending') {
                actionHtml = `
                    <button class="action-btn btn-approve approve-btn" data-id="${leave._id}">Approve</button>
                    <button class="action-btn btn-reject reject-btn" data-id="${leave._id}">Reject</button>
                `;
            }

            const empName = leave.employeeId?.username || 'Unknown Employee';

            tr.innerHTML = `
                <td>
                    <div style="font-weight: 500;">${empName}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">${leave.employeeId?.email || ''}</div>
                </td>
                <td>${formatDate(leave.startDate)}</td>
                <td>${formatDate(leave.endDate)}</td>
                <td>${leave.totalDays}</td>
                <td>${leave.reason || '-'}</td>
                <td><span class="status-badge status-${leave.status.toLowerCase()}">${leave.status}</span></td>
                <td><div style="display:flex; gap:0.5rem;">${actionHtml}</div></td>
            `;

            tbody.appendChild(tr);
        });

        document.getElementById('pending-count').textContent = pendingCount;
        document.getElementById('processed-count').textContent = processedCount;
        
        // Add event listeners to review buttons
        document.querySelectorAll('.approve-btn').forEach(btn => {
            btn.addEventListener('click', (e) => reviewLeave(e.target.dataset.id, 'Approved'));
        });
        document.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', (e) => reviewLeave(e.target.dataset.id, 'Rejected'));
        });

    } catch(err) {
        showToast('Error loading team leaves: ' + err.message, 'error');
    }
}

async function reviewLeave(requestId, status) {
    if (!confirm(`Are you sure you want to mark this request as ${status}?`)) return;
    
    try {
        await apiCall(`/leaves/review`, 'POST', { requestId, status });
        showToast(`Request ${status}`, 'success');
        fetchTeamLeaves();
    } catch(err) {
        showToast(err.message, 'error');
    }
}
