import React, { useState, useEffect } from 'react';
import Header from './Header';

const ManagerDashboard = ({ user, logout, showToast }) => {
  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/leaves/team', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Failed to fetch team leaves');
      
      setLeaves(data);
      calculateStats(data);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const calculateStats = (data) => {
    const s = { total: data.length, pending: 0, approved: 0, rejected: 0 };
    data.forEach(l => {
      const status = (l.status || 'Pending').toLowerCase();
      if (s[status] !== undefined) s[status]++;
    });
    setStats(s);
  };

  const updateStatus = async (id, status) => {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/leaves/review`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ requestId: id, status })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || 'Failed to update status');

        showToast(`Leave request ${status}`, 'success');
        fetchLeaves();
    } catch (err) {
        showToast(err.message, 'error');
    }
  };

  return (
    <>
      <Header user={user} logout={logout} />
      <main className="main-content">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
          <h2>Team Leave Requests</h2>
        </div>

        <div className="dashboard-stats">
          <div className="glass-container stat-card">
            <span className="stat-title">Total Requests</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="glass-container stat-card">
            <span className="stat-title">Pending</span>
            <span className="stat-value" style={{color: '#f59e0b'}}>{stats.pending}</span>
          </div>
          <div className="glass-container stat-card">
            <span className="stat-title">Approved</span>
            <span className="stat-value" style={{color: '#10b981'}}>{stats.approved}</span>
          </div>
          <div className="glass-container stat-card">
            <span className="stat-title">Rejected</span>
            <span className="stat-value" style={{color: '#ef4444'}}>{stats.rejected}</span>
          </div>
        </div>

        <div className="glass-container table-container">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(l => (
                <tr key={l._id}>
                  <td>{l.employeeId?.username || 'Unknown'}</td>
                  <td>{l.type}</td>
                  <td>{new Date(l.startDate).toLocaleDateString()}</td>
                  <td>{new Date(l.endDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge status-${l.status?.toLowerCase()}`}>{l.status || 'Pending'}</span>
                  </td>
                  <td>{l.reason.substring(0, 30)}{l.reason.length > 30 ? '...' : ''}</td>
                  <td>
                    {l.status === 'Pending' && (
                        <div style={{display: 'flex', gap: '0.5rem'}}>
                            <button className="action-btn btn-approve" onClick={() => updateStatus(l._id, 'Approved')}>
                                ✓ Approve
                            </button>
                            <button className="action-btn btn-reject" onClick={() => updateStatus(l._id, 'Rejected')}>
                                ✕ Reject
                            </button>
                        </div>
                    )}
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr><td colSpan="7" style={{textAlign: 'center', padding: '2rem'}}>No team leave requests found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
};

export default ManagerDashboard;
