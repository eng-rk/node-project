import React, { useState, useEffect } from 'react';
import Header from './Header';
import Modal from './Modal';

const EmployeeDashboard = ({ user: initialUser, logout, showToast }) => {
  const [user, setUser] = useState(initialUser);
  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ type: 'Annual', startDate: '', endDate: '', reason: '' });

  useEffect(() => {
    fetchProfile();
    fetchLeaves();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/leaves/my-leaves', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Failed to fetch leaves');
      
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

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/leaves/submit', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Failed to create request');
      
      showToast('Leave request submitted successfully', 'success');
      setShowModal(false);
      setFormData({ type: 'Annual', startDate: '', endDate: '', reason: '' });
      fetchLeaves();
      fetchProfile(); // Refresh balance
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <>
      <Header user={user} logout={logout} />
      <main className="main-content">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
          <h2>My Leave Requests</h2>
          <button className="btn btn-primary" style={{width: 'auto'}} onClick={() => setShowModal(true)}>
            + New Request
          </button>
        </div>

        <div className="dashboard-stats">
          <div className="glass-container stat-card" style={{borderBottom: '4px solid #6366f1'}}>
            <span className="stat-title">Remaining Balance</span>
            <span className="stat-value" style={{color: '#6366f1'}}>{user?.leaveBalance ?? 0} Days</span>
          </div>
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
                <th>Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Reason</th>
                <th>Requested At</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(l => (
                <tr key={l._id}>
                  <td>{l.type}</td>
                  <td>{new Date(l.startDate).toLocaleDateString()}</td>
                  <td>{new Date(l.endDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge status-${l.status?.toLowerCase()}`}>{l.status || 'Pending'}</span>
                  </td>
                  <td>{l.reason.substring(0, 30)}{l.reason.length > 30 ? '...' : ''}</td>
                  <td>{new Date(l.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No leave requests found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {showModal && (
        <Modal title="New Leave Request" onClose={() => setShowModal(false)} onSubmit={handleCreate}>
          <div className="form-group">
            <label>Leave Type</label>
            <select className="form-control" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required>
              <option value="Annual">Annual Leave</option>
              <option value="Sick">Sick Leave</option>
              <option value="Personal">Personal Leave</option>
              <option value="Unpaid">Unpaid Leave</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group" style={{display: 'flex', gap: '1rem'}}>
            <div style={{flex: 1}}>
              <label>Start Date</label>
              <input type="date" className="form-control" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required />
            </div>
            <div style={{flex: 1}}>
              <label>End Date</label>
              <input type="date" className="form-control" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} required />
            </div>
          </div>
          <div className="form-group">
            <label>Reason {formData.type === 'Other' && <span style={{color: '#ef4444'}}>*</span>}</label>
            <textarea className="form-control" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} rows="3" required={formData.type === 'Other'}></textarea>
          </div>
          <button type="submit" className="btn btn-primary">Submit Request</button>
        </Modal>
      )}
    </>
  );
};

export default EmployeeDashboard;
