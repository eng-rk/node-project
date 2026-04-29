import React, { useState, useEffect } from 'react';
import Header from './Header';
import Modal from './Modal';

const AdminDashboard = ({ user, logout, showToast }) => {
  const [leaves, setLeaves] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [selectedUserForManager, setSelectedUserForManager] = useState(null);
  const [managerFormId, setManagerFormId] = useState('');
  const [roleForm, setRoleForm] = useState('employee');

  useEffect(() => {
    fetchLeaves();
    fetchUsers();
  }, []);

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/leaves/team', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Failed to fetch global leaves');
      
      setLeaves(data);
      calculateStats(data);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Failed to fetch users');
      
      setUsers(data);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const deactivateUser = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/${id}/deactivate`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Failed to deactivate user');
      
      showToast('User deactivated successfully', 'success');
      fetchUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const updateManager = async (e) => {
    e.preventDefault();
    if (!selectedUserForManager) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/${selectedUserForManager._id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ managerId: managerFormId, role: roleForm })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Failed to update user');
      
      showToast('User updated successfully', 'success');
      setShowManagerModal(false);
      setSelectedUserForManager(null);
      fetchUsers();
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
          <h2>System-wide Leave Requests</h2>
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
                <th>Role</th>
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
                  <td>{l.employeeId?.role || 'employee'}</td>
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
                <tr><td colSpan="8" style={{textAlign: 'center', padding: '2rem'}}>No system leave requests found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem', marginBottom: '1.5rem'}}>
          <h2>Employees Directory</h2>
        </div>

        <div className="glass-container table-container">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Manager ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className="status-badge" style={{background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8'}}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {u.isActive ? <span style={{color: '#10b981'}}>Active</span> : <span style={{color: '#ef4444'}}>Inactive</span>}
                  </td>
                  <td>
                      {u.managerId ? (users.find(m => m._id === u.managerId)?.username || u.managerId) : 'None'}
                  </td>
                  <td>
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      <button className="action-btn" style={{background: '#4f46e5'}} onClick={() => {
                        setSelectedUserForManager(u);
                        setManagerFormId(u.managerId || '');
                        setRoleForm(u.role || 'employee');
                        setShowManagerModal(true);
                      }}>
                        Edit User
                      </button>
                      {u.isActive && (
                        <button className="action-btn btn-reject" onClick={() => deactivateUser(u._id)}>
                          Deactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {showManagerModal && (
        <Modal 
          title={`Edit User: ${selectedUserForManager?.username}`} 
          onClose={() => setShowManagerModal(false)} 
          onSubmit={updateManager}
        >
          <div className="form-group">
            <label>Role</label>
            <select className="form-control" value={roleForm} onChange={e => setRoleForm(e.target.value)} required>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label>Select Manager</label>
            <select className="form-control" value={managerFormId} onChange={e => setManagerFormId(e.target.value)}>
              <option value="">-- No Manager --</option>
              {users.filter(u => u.role === 'manager' || u.role === 'admin').map(m => (
                <option key={m._id} value={m._id}>{m.username} ({m.email})</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Save Changes</button>
        </Modal>
      )}
    </>
  );
};

export default AdminDashboard;
