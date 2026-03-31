import React, { useState } from 'react';

const Auth = ({ setUser, showToast }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'employee'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.msg || 'Invalid credentials or deactivated account');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      showToast('Login successful', 'success');
      setTimeout(() => setUser(data.user), 500);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.username.trim().split(/\s+/).length < 2) {
      return showToast('Please provide both first and last name', 'error');
    }

    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,20}$/;
    if (!passwordRegex.test(formData.password)) {
      return showToast('Password must be 8-20 characters long and contain at least one special character', 'error');
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.msg || 'Registration failed');

      showToast('Registration successful! Please log in.', 'success');
      setIsLogin(true);
      setFormData(prev => ({ ...prev, password: '' }));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="glass-container auth-box" id="auth-container">
        {isLogin ? (
          <div id="login-form-view">
            <h2>Welcome Back</h2>
            <p>Sign in to LeaveTrack</p>

            <form id="login-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} placeholder="you@company.com" required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} placeholder="Enter password" required />
              </div>
              <button type="submit" className="btn btn-primary">Sign In</button>
              <div className="auth-switch">
                Don't have an account? <span style={{color: '#6366f1', cursor: 'pointer'}} onClick={() => setIsLogin(false)}>Register here</span>
              </div>
            </form>
          </div>
        ) : (
          <div id="register-form-view">
            <h2>Create Account</h2>
            <p>Join LeaveTrack</p>

            <form id="register-form" onSubmit={handleRegister}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="username" className="form-control" value={formData.username} onChange={handleChange} placeholder="John Doe" required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} placeholder="you@company.com" required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} placeholder="Create a password" required />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select name="role" className="form-control" value={formData.role} onChange={handleChange} required>
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary">Register</button>
              <div className="auth-switch">
                Already have an account? <span style={{color: '#6366f1', cursor: 'pointer'}} onClick={() => setIsLogin(true)}>Sign in</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
