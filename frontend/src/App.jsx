import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import EmployeeDashboard from './components/EmployeeDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import AdminDashboard from './components/AdminDashboard';
import Toast from './components/Toast';
import './index.css';

function App() {
  const [user, setUser] = useState(() => {
    const userLocal = localStorage.getItem('user');

    if (!userLocal) return null;

    try {
      return JSON.parse(userLocal);
    } catch {
      console.error('Invalid user data in localStorage');
      return null;
    }
  });

  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <div className="app-container">
        {toast.show && <Toast message={toast.message} type={toast.type} />}
        <Routes>
          <Route
            path="/"
            element={
              !user ? (
                <Auth setUser={setUser} showToast={showToast} />
              ) : (
                <Navigate to={`/${user.role}`} />
              )
            }
          />
          <Route
            path="/employee"
            element={
              user && user.role === 'employee' ? (
                <EmployeeDashboard user={user} logout={logout} showToast={showToast} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/manager"
            element={
              user && user.role === 'manager' ? (
                <ManagerDashboard user={user} logout={logout} showToast={showToast} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/admin"
            element={
              user && user.role === 'admin' ? (
                <AdminDashboard user={user} logout={logout} showToast={showToast} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;